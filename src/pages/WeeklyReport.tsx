import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { Leaf, ArrowLeft, Droplets, Utensils, Activity, Brain, Heart, TrendingUp, TrendingDown, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';

interface ScoreRow {
  score_date: string;
  total_score: number | null;
  hydration_score: number;
  nutrition_score: number;
  habit_compliance_score: number;
  activity_score: number;
  stress_balance_score: number;
}

interface TrackerRow {
  tracking_date: string;
  water_glasses: number;
  detox_drink_completed: boolean;
  meal_compliance_pct: number;
  mindful_eating: boolean;
  stress_level: string | null;
  sleep_hours: number | null;
  step_count: number | null;
  exercise_minutes: number | null;
  bloating_level: string | null;
  energy_level: string | null;
  bowel_movement: string | null;
  fermented_food_taken: boolean;
  fiber_intake: string | null;
}

interface WeeklyAnalysis {
  recoveryPct: number;
  daysTracked: number;
  avgScore: number;
  categories: { label: string; avg: number; max: number; trend: 'up' | 'down' | 'flat'; icon: typeof Droplets }[];
  improvements: string[];
  attentionAreas: string[];
  summary: string;
  symptomSummary: string;
}

function analyze(scores: ScoreRow[], habits: TrackerRow[]): WeeklyAnalysis {
  const n = scores.length;
  const avgScore = n > 0 ? Math.round(scores.reduce((s, r) => s + (r.total_score ?? 0), 0) / n) : 0;
  const recoveryPct = Math.min(100, Math.round(avgScore * 1.1));

  const half = Math.ceil(n / 2);
  const first = scores.slice(0, half);
  const second = scores.slice(half);
  const avg = (arr: ScoreRow[], key: keyof ScoreRow) => arr.length ? arr.reduce((s, r) => s + (Number(r[key]) || 0), 0) / arr.length : 0;
  const trend = (key: keyof ScoreRow): 'up' | 'down' | 'flat' => {
    if (first.length === 0 || second.length === 0) return 'flat';
    const d = avg(second, key) - avg(first, key);
    return d > 1 ? 'up' : d < -1 ? 'down' : 'flat';
  };

  const categories = [
    { label: 'Hydration', avg: Math.round(avg(scores, 'hydration_score')), max: 20, trend: trend('hydration_score'), icon: Droplets },
    { label: 'Nutrition', avg: Math.round(avg(scores, 'nutrition_score')), max: 20, trend: trend('nutrition_score'), icon: Utensils },
    { label: 'Habit Compliance', avg: Math.round(avg(scores, 'habit_compliance_score')), max: 20, trend: trend('habit_compliance_score'), icon: Heart },
    { label: 'Activity', avg: Math.round(avg(scores, 'activity_score')), max: 20, trend: trend('activity_score'), icon: Activity },
    { label: 'Stress Balance', avg: Math.round(avg(scores, 'stress_balance_score')), max: 20, trend: trend('stress_balance_score'), icon: Brain },
  ];

  // Improvements
  const improvements: string[] = [];
  const attentionAreas: string[] = [];

  categories.forEach(c => {
    const pct = (c.avg / c.max) * 100;
    if (c.trend === 'up') improvements.push(`${c.label} is trending upward (avg ${c.avg}/${c.max})`);
    if (pct < 50) attentionAreas.push(`${c.label} needs focus (avg ${c.avg}/${c.max})`);
  });

  // Habit-specific checks
  if (habits.length > 0) {
    const detoxDays = habits.filter(h => h.detox_drink_completed).length;
    const detoxPct = Math.round((detoxDays / habits.length) * 100);
    if (detoxPct >= 70) improvements.push(`Detox drink completed ${detoxPct}% of tracked days`);
    else attentionAreas.push(`Detox drink only completed ${detoxPct}% of days — aim for daily`);

    const avgCompliance = Math.round(habits.reduce((s, h) => s + h.meal_compliance_pct, 0) / habits.length);
    if (avgCompliance >= 75) improvements.push(`Meal plan adherence averaging ${avgCompliance}%`);
    else attentionAreas.push(`Meal plan adherence at ${avgCompliance}% — target 80%+`);

    const avgSleep = habits.reduce((s, h) => s + (h.sleep_hours ?? 7), 0) / habits.length;
    if (avgSleep < 6.5) attentionAreas.push(`Average sleep is ${avgSleep.toFixed(1)} hours — aim for 7+`);
    else if (avgSleep >= 7.5) improvements.push(`Solid sleep averaging ${avgSleep.toFixed(1)} hours`);

    const fermentedDays = habits.filter(h => h.fermented_food_taken).length;
    if (fermentedDays >= Math.ceil(habits.length * 0.6)) improvements.push('Consistent fermented food intake supporting microbiome diversity');

    const highStress = habits.filter(h => h.stress_level === 'high' || h.stress_level === 'very_high').length;
    if (highStress >= Math.ceil(habits.length * 0.5)) attentionAreas.push(`High stress reported on ${highStress} of ${habits.length} days`);
  }

  if (improvements.length === 0) improvements.push('You\'ve started tracking — consistency is the first step toward recovery');
  if (attentionAreas.length === 0) attentionAreas.push('All areas looking good — maintain current habits!');

  // Symptom summary
  let symptomSummary = '';
  if (habits.length > 0) {
    const noBloat = habits.filter(h => h.bloating_level === 'none' || h.bloating_level === 'mild').length;
    const goodBowel = habits.filter(h => h.bowel_movement === 'normal' || h.bowel_movement === 'excellent').length;
    symptomSummary = `Bloating was minimal on ${noBloat}/${habits.length} days. Bowel movements were healthy on ${goodBowel}/${habits.length} days.`;
  } else {
    symptomSummary = 'No symptom data available yet. Start tracking to monitor digestive patterns.';
  }

  // Summary
  let summary = '';
  if (recoveryPct >= 75) {
    summary = `Excellent week! Your gut recovery is at ${recoveryPct}%. Your digestive system is clearly responding to the program. The consistency in your habits is building a healthier microbiome day by day. Keep this momentum — you're in the healing zone!`;
  } else if (recoveryPct >= 50) {
    summary = `Good progress this week with ${recoveryPct}% recovery. Your body is adapting to the gut reset protocol. Focus on the areas flagged above — small improvements in your weakest category can boost your overall score significantly. You're on the right track!`;
  } else if (n >= 3) {
    summary = `Your recovery is at ${recoveryPct}% — there's significant room for growth, but don't be discouraged. Gut healing takes time. Focus on one area at a time: start with hydration and meal compliance. Every healthy choice compounds over time. Keep showing up!`;
  } else {
    summary = `You've tracked ${n} day${n !== 1 ? 's' : ''} this week. The more consistently you log, the better your insights become. Aim to track daily — it takes just 2 minutes and gives you powerful visibility into your gut health journey.`;
  }

  return { recoveryPct, daysTracked: n, avgScore, categories, improvements, attentionAreas, summary, symptomSummary };
}

export default function WeeklyReport() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState<WeeklyAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const since = sevenDaysAgo.toISOString().split('T')[0];

    Promise.all([
      supabase.from('gut_progress_scores').select('*').eq('user_id', user.id).gte('score_date', since).order('score_date'),
      supabase.from('daily_habit_tracker').select('*').eq('user_id', user.id).gte('tracking_date', since).order('tracking_date'),
    ]).then(([scoresRes, habitsRes]) => {
      const scores = (scoresRes.data ?? []) as unknown as ScoreRow[];
      const habits = (habitsRes.data ?? []) as unknown as TrackerRow[];
      setReport(analyze(scores, habits));
      setLoading(false);
    });
  }, [user]);

  const TrendIcon = ({ t }: { t: 'up' | 'down' | 'flat' }) =>
    t === 'up' ? <TrendingUp className="h-4 w-4 text-green-600" /> :
    t === 'down' ? <TrendingDown className="h-4 w-4 text-red-500" /> :
    <span className="text-xs text-muted-foreground">—</span>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Leaf className="h-5 w-5 text-primary" />
          <span className="font-serif font-bold text-foreground">Weekly Gut Report</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <p className="text-center text-muted-foreground py-12">Analyzing your week…</p>
        ) : report ? (
          <>
            {/* Recovery Percentage */}
            <Card className="border-primary/20 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> Overall Gut Recovery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center my-4">
                  <div className="w-32 h-32 rounded-full border-4 border-primary/30 bg-primary/5 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-primary">{report.recoveryPct}%</span>
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Based on {report.daysTracked} tracked day{report.daysTracked !== 1 ? 's' : ''} · Avg score: {report.avgScore}/100
                </p>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card className="border-primary/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Weekly Category Averages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.categories.map(({ label, avg, max, trend, icon: Icon }) => (
                  <div key={label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Icon className="h-4 w-4" /> {label}
                      </span>
                      <div className="flex items-center gap-2">
                        <TrendIcon t={trend} />
                        <span className="font-semibold">{avg}/{max}</span>
                      </div>
                    </div>
                    <Progress value={(avg / max) * 100} className="h-2.5" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Symptom Trends */}
            <Card className="border-primary/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" /> Digestive Symptom Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/80 leading-relaxed">{report.symptomSummary}</p>
              </CardContent>
            </Card>

            {/* Top Improvements */}
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-4 w-4" /> Top Improvements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.improvements.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-green-900/80">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Areas Needing Attention */}
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="h-4 w-4" /> Areas Needing Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.attentionAreas.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-amber-900/80">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Doctor's Summary */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Dr. Swathinc's Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/80 leading-relaxed">{report.summary}</p>
              </CardContent>
            </Card>

            <Button className="w-full" variant="outline" size="lg" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </>
        ) : null}
      </main>
    </div>
  );
}
