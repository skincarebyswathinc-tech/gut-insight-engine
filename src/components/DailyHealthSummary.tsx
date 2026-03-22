import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Droplets, Utensils, Activity, Brain, Heart, TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown, Sparkles, Target } from 'lucide-react';

interface DailyScores {
  total_score: number;
  hydration: number;
  nutrition: number;
  habits: number;
  activity: number;
  stress_balance: number;
}

interface TrackerData {
  water_glasses: number;
  detox_drink_completed: boolean;
  meal_compliance_pct: number;
  mindful_eating: boolean;
  stress_level: string;
  sleep_hours: number;
  step_count: number;
  exercise_minutes: number;
  bloating_level: string;
  energy_level: string;
  bowel_movement: string;
  skin_condition: string;
  fiber_intake: string;
  fermented_food_taken: boolean;
}

interface PreviousScore {
  total_score: number | null;
  hydration_score: number;
  nutrition_score: number;
  habit_compliance_score: number;
  activity_score: number;
  stress_balance_score: number;
  score_date: string;
}

function getScoreColor(score: number, max: number) {
  const pct = (score / max) * 100;
  if (pct >= 75) return 'text-green-600';
  if (pct >= 50) return 'text-yellow-600';
  return 'text-red-500';
}

function getScoreLabel(score: number, max: number) {
  const pct = (score / max) * 100;
  if (pct >= 80) return 'Excellent';
  if (pct >= 60) return 'Good';
  if (pct >= 40) return 'Fair';
  return 'Needs Improvement';
}

function getTrendIcon(diff: number) {
  if (diff > 0) return <ArrowUp className="h-3.5 w-3.5 text-green-600" />;
  if (diff < 0) return <ArrowDown className="h-3.5 w-3.5 text-red-500" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

function getTrendText(diff: number) {
  if (diff > 0) return `+${diff} from yesterday`;
  if (diff < 0) return `${diff} from yesterday`;
  return 'Same as yesterday';
}

function getKeyImprovement(scores: DailyScores, prev: PreviousScore | null): string {
  if (!prev || prev.total_score === null) return 'This is your first tracked day — great start on your gut reset journey!';

  const diffs = [
    { label: 'Hydration', diff: scores.hydration - prev.hydration_score },
    { label: 'Nutrition', diff: scores.nutrition - prev.nutrition_score },
    { label: 'Habit compliance', diff: scores.habits - prev.habit_compliance_score },
    { label: 'Physical activity', diff: scores.activity - prev.activity_score },
    { label: 'Stress balance', diff: scores.stress_balance - prev.stress_balance_score },
  ];

  const best = diffs.reduce((a, b) => (b.diff > a.diff ? b : a));

  if (best.diff <= 0) {
    // Find highest absolute score instead
    const highest = [
      { label: 'Hydration', score: scores.hydration },
      { label: 'Nutrition', score: scores.nutrition },
      { label: 'Habit compliance', score: scores.habits },
      { label: 'Activity', score: scores.activity },
      { label: 'Stress balance', score: scores.stress_balance },
    ].reduce((a, b) => (b.score > a.score ? b : a));
    return `${highest.label} was your strongest area today at ${highest.score}/20. Keep it up!`;
  }

  return `${best.label} improved by +${best.diff} points compared to yesterday. Your consistency is paying off!`;
}

function getHabitToImprove(scores: DailyScores, data: TrackerData): string {
  const weakest = [
    { key: 'hydration', score: scores.hydration, tip: `Drink at least ${Math.max(8, data.water_glasses + 2)} glasses of water and complete your detox drink.` },
    { key: 'nutrition', score: scores.nutrition, tip: data.fermented_food_taken ? 'Focus on increasing fiber intake and meal compliance above 80%.' : 'Add a serving of fermented food (yogurt, kimchi, or sauerkraut) to your meals.' },
    { key: 'habits', score: scores.habits, tip: 'Practice mindful eating at every meal — chew slowly and avoid screens while eating.' },
    { key: 'activity', score: scores.activity, tip: data.step_count < 5000 ? 'Aim for at least 5,000 steps and a 15-minute post-meal walk.' : 'Add 10 more minutes of exercise or try gentle yoga for digestion.' },
    { key: 'stress_balance', score: scores.stress_balance, tip: data.sleep_hours < 7 ? 'Prioritize 7+ hours of sleep — your gut repairs itself during deep sleep.' : 'Try 5 minutes of deep breathing before meals to reduce stress and improve digestion.' },
  ].reduce((a, b) => (b.score < a.score ? b : a));

  return weakest.tip;
}

function generateNarrative(scores: DailyScores, data: TrackerData): string {
  const parts: string[] = [];

  if (scores.hydration >= 16) {
    parts.push('Great hydration today — this keeps your digestive enzymes active and supports nutrient absorption.');
  } else if (scores.hydration >= 10) {
    parts.push('Hydration was moderate. Aim for 8+ glasses and your detox drink to improve mucosal lining health.');
  } else {
    parts.push('Low hydration detected. Dehydration slows digestion and can worsen bloating — prioritize water intake tomorrow.');
  }

  if (scores.nutrition >= 16) {
    parts.push('Excellent diet compliance — your fiber and fermented food intake supports a diverse microbiome.');
  } else if (scores.nutrition >= 10) {
    parts.push('Nutrition was decent but could improve. Try adding more fermented foods and mindful eating to boost gut flora.');
  } else {
    parts.push('Diet compliance was low today. Poor meal adherence disrupts your gut reset progress.');
  }

  if (scores.activity >= 14) {
    parts.push('Strong physical activity! Movement stimulates peristalsis and helps prevent constipation.');
  } else if (scores.activity >= 8) {
    parts.push('Moderate activity level. Even a 20-minute walk after meals can significantly improve digestion.');
  } else {
    parts.push('Low activity today. Sedentary behavior slows gut motility — try gentle yoga or walking tomorrow.');
  }

  if (scores.stress_balance >= 14) {
    parts.push('Good stress balance and sleep — your gut-brain axis is functioning well.');
  } else if (scores.stress_balance >= 8) {
    parts.push('Moderate stress levels. Consider deep breathing exercises before meals to activate your parasympathetic nervous system.');
  } else {
    parts.push('High stress and/or poor sleep detected. Chronic stress increases gut permeability — prioritize rest.');
  }

  if (data.bloating_level === 'none' && data.bowel_movement === 'excellent') {
    parts.push('No digestive symptoms — your gut is responding well to the program!');
  } else if (data.bloating_level === 'severe' || data.bowel_movement === 'none') {
    parts.push('Significant digestive symptoms noted. Review yesterday\'s food choices and ensure adequate fiber and water.');
  }

  return parts.join(' ');
}

const categories = [
  { key: 'hydration' as const, prevKey: 'hydration_score' as const, label: 'Hydration Score', max: 20, icon: Droplets },
  { key: 'nutrition' as const, prevKey: 'nutrition_score' as const, label: 'Diet Compliance', max: 20, icon: Utensils },
  { key: 'habits' as const, prevKey: 'habit_compliance_score' as const, label: 'Habit Compliance', max: 20, icon: Heart },
  { key: 'activity' as const, prevKey: 'activity_score' as const, label: 'Activity Score', max: 20, icon: Activity },
  { key: 'stress_balance' as const, prevKey: 'stress_balance_score' as const, label: 'Stress Balance', max: 20, icon: Brain },
];

interface Props {
  scores: DailyScores;
  trackerData: TrackerData;
  previousScores?: PreviousScore | null;
}

export default function DailyHealthSummary({ scores, trackerData, previousScores }: Props) {
  const narrative = generateNarrative(scores, trackerData);
  const totalDiff = previousScores?.total_score != null ? scores.total_score - previousScores.total_score : null;
  const keyImprovement = getKeyImprovement(scores, previousScores ?? null);
  const habitToImprove = getHabitToImprove(scores, trackerData);

  return (
    <div className="space-y-6">
      {/* Total Score with Trend */}
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 font-serif">
            <TrendingUp className="h-5 w-5 text-primary" /> Daily Gut Progress Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center my-4">
            <div className="w-28 h-28 rounded-full border-4 border-primary/30 bg-primary/5 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-primary">{scores.total_score}</span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
          </div>
          <p className="text-center text-sm font-medium text-muted-foreground">
            {getScoreLabel(scores.total_score, 100)}
          </p>
          {totalDiff !== null && (
            <div className="flex items-center justify-center gap-1.5 mt-2">
              {getTrendIcon(totalDiff)}
              <span className={`text-xs font-medium ${totalDiff > 0 ? 'text-green-600' : totalDiff < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                {getTrendText(totalDiff)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown with Trends */}
      <Card className="border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.map(({ key, prevKey, label, max, icon: Icon }) => {
            const diff = previousScores ? scores[key] - previousScores[prevKey] : null;
            return (
              <div key={key} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Icon className="h-4 w-4" /> {label}
                  </span>
                  <div className="flex items-center gap-2">
                    {diff !== null && (
                      <span className="flex items-center gap-0.5">
                        {getTrendIcon(diff)}
                      </span>
                    )}
                    <span className={`font-semibold ${getScoreColor(scores[key], max)}`}>
                      {scores[key]}/{max}
                    </span>
                  </div>
                </div>
                <Progress value={(scores[key] / max) * 100} className="h-2.5" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Key Improvement & Habit to Improve */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <Sparkles className="h-4 w-4 text-green-700" />
              </div>
              <div>
                <p className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-1">Key Improvement</p>
                <p className="text-sm text-green-900/80 leading-relaxed">{keyImprovement}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-amber-100">
                <Target className="h-4 w-4 text-amber-700" />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1">Focus Tomorrow</p>
                <p className="text-sm text-amber-900/80 leading-relaxed">{habitToImprove}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Symptom Snapshot */}
      <Card className="border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" /> Digestive Symptoms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Bloating', value: trackerData.bloating_level },
              { label: 'Bowel Movement', value: trackerData.bowel_movement },
              { label: 'Energy', value: trackerData.energy_level },
              { label: 'Skin', value: trackerData.skin_condition },
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted/50 rounded-lg p-3">
                <p className="text-muted-foreground text-xs">{label}</p>
                <p className="font-medium capitalize">{value.replace('_', ' ')}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Narrative Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">How Today's Habits Affect Your Gut</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground/80 leading-relaxed">{narrative}</p>
        </CardContent>
      </Card>
    </div>
  );
}
