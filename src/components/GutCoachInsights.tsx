import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Target, Heart } from 'lucide-react';

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

function analyzeProgress(scores: ScoreRow[], habits: TrackerRow[]) {
  const positive = getPositiveObservation(scores, habits);
  const recommendation = getHabitRecommendation(scores, habits);
  const motivation = getMotivation(scores);
  return { positive, recommendation, motivation };
}

function getPositiveObservation(scores: ScoreRow[], habits: TrackerRow[]): string {
  if (scores.length < 2) return 'You\'ve started tracking — that\'s the most important first step toward better gut health!';

  const recent = scores.slice(-3);
  const earlier = scores.slice(0, Math.max(1, scores.length - 3));

  const recentAvg = recent.reduce((s, r) => s + (r.total_score ?? 0), 0) / recent.length;
  const earlierAvg = earlier.reduce((s, r) => s + (r.total_score ?? 0), 0) / earlier.length;

  if (recentAvg > earlierAvg + 3) {
    return `Your gut score has been improving — recent average is ${Math.round(recentAvg)}/100, up from ${Math.round(earlierAvg)}. Your consistent effort is making a real difference!`;
  }

  // Check specific category improvements
  const recentHydration = recent.reduce((s, r) => s + r.hydration_score, 0) / recent.length;
  const earlierHydration = earlier.reduce((s, r) => s + r.hydration_score, 0) / earlier.length;
  if (recentHydration > earlierHydration + 1) {
    return `Your hydration has improved noticeably — averaging ${Math.round(recentHydration)}/20 recently. Better hydration directly supports digestive enzyme function.`;
  }

  // Check symptom improvement
  const recentBloating = habits.slice(-3).filter(h => h.bloating_level === 'none' || h.bloating_level === 'mild').length;
  if (recentBloating >= 2) {
    return 'Your bloating symptoms have been minimal recently — your gut lining is responding well to the program.';
  }

  // Check consistency
  const consistentDays = habits.filter(h => h.detox_drink_completed && h.meal_compliance_pct >= 70).length;
  if (consistentDays >= 3) {
    return `You've maintained good meal compliance and detox drink consistency for ${consistentDays} days — this regularity is key for microbiome diversity.`;
  }

  return `You've logged ${scores.length} days of tracking data. Consistency builds momentum — each tracked day brings you closer to understanding your gut patterns.`;
}

function getHabitRecommendation(scores: ScoreRow[], habits: TrackerRow[]): string {
  if (scores.length === 0) return 'Start by tracking your meals and hydration today — awareness is the foundation of gut healing.';

  // Find weakest category across recent days
  const recent = scores.slice(-5);
  const avgByCategory = {
    hydration: recent.reduce((s, r) => s + r.hydration_score, 0) / recent.length,
    nutrition: recent.reduce((s, r) => s + r.nutrition_score, 0) / recent.length,
    habits: recent.reduce((s, r) => s + r.habit_compliance_score, 0) / recent.length,
    activity: recent.reduce((s, r) => s + r.activity_score, 0) / recent.length,
    stress: recent.reduce((s, r) => s + r.stress_balance_score, 0) / recent.length,
  };

  const weakest = Object.entries(avgByCategory).reduce((a, b) => (b[1] < a[1] ? b : a));

  // Check specific habit patterns
  const recentHabits = habits.slice(-5);
  const avgSleep = recentHabits.reduce((s, h) => s + (h.sleep_hours ?? 7), 0) / recentHabits.length;
  const avgSteps = recentHabits.reduce((s, h) => s + (h.step_count ?? 0), 0) / recentHabits.length;
  const fermentedDays = recentHabits.filter(h => h.fermented_food_taken).length;

  switch (weakest[0]) {
    case 'hydration':
      return 'Your hydration scores have room to grow. Try setting hourly water reminders and drink a warm glass of lemon water each morning before breakfast.';
    case 'nutrition':
      if (fermentedDays < 2) {
        return 'Add a daily serving of fermented food — yogurt, buttermilk, or kimchi. These introduce beneficial bacteria that strengthen your gut lining.';
      }
      return 'Focus on increasing your meal compliance above 80%. Stick to the planned meals and practice mindful eating to improve nutrient absorption.';
    case 'habits':
      return 'Build a morning gut-healing ritual: detox drink → 10 min walk → mindful breakfast. Consistent routines train your digestive system to function optimally.';
    case 'activity':
      if (avgSteps < 4000) {
        return `Your average daily steps are around ${Math.round(avgSteps)}. Aim for 5,000+ with a 15-minute post-meal walk — this simple habit can reduce bloating by 30%.`;
      }
      return 'Try adding 10 minutes of gentle yoga or stretching after dinner. Twisting poses massage internal organs and stimulate digestion.';
    case 'stress':
      if (avgSleep < 7) {
        return `Your average sleep is ${avgSleep.toFixed(1)} hours. Aim for 7+ hours — your gut microbiome repairs and rebalances during deep sleep cycles.`;
      }
      return 'Practice 5 minutes of box breathing (4-4-4-4) before meals. This activates your rest-and-digest system, improving nutrient absorption by up to 40%.';
    default:
      return 'Keep following the program consistently. Small daily improvements compound into major gut health transformations.';
  }
}

function getMotivation(scores: ScoreRow[]): string {
  if (scores.length === 0) return 'Every gut reset journey begins with a single day of tracking. You\'ve got this! 🌿';
  if (scores.length < 3) return `You're ${scores.length} days into your journey. It takes 3-5 days for your gut bacteria to start shifting — keep going, the transformation is beginning! 🌱`;

  const latest = scores[scores.length - 1]?.total_score ?? 0;
  const first = scores[0]?.total_score ?? 0;
  const improvement = latest - first;

  if (improvement > 10) {
    return `You've improved ${improvement} points since day one! Your gut microbiome is actively rebalancing. Research shows it takes 14-21 days for lasting change — you're well on your way! 💪`;
  }
  if (improvement > 0) {
    return `Your score has improved by ${improvement} points. Progress isn't always linear, but your body is adapting. Trust the process — your future self will thank you! ✨`;
  }
  if (scores.length >= 7) {
    return 'A full week of tracking shows incredible commitment. Even if scores fluctuate, your awareness and consistency are building the foundation for lasting gut health. Keep pushing! 🔥';
  }
  return `${scores.length} days of dedication! Remember: healing isn't always visible immediately, but every healthy choice is rewriting your gut story. Stay the course! 🌿`;
}

export default function GutCoachInsights({ userId }: { userId: string }) {
  const [insights, setInsights] = useState<{ positive: string; recommendation: string; motivation: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [scoresRes, habitsRes] = await Promise.all([
        supabase.from('gut_progress_scores')
          .select('*')
          .eq('user_id', userId)
          .order('score_date', { ascending: true })
          .limit(14),
        supabase.from('daily_habit_tracker')
          .select('*')
          .eq('user_id', userId)
          .order('tracking_date', { ascending: true })
          .limit(14),
      ]);

      const scores = (scoresRes.data ?? []) as unknown as ScoreRow[];
      const habits = (habitsRes.data ?? []) as unknown as TrackerRow[];
      setInsights(analyzeProgress(scores, habits));
      setLoading(false);
    }
    load();
  }, [userId]);

  if (loading || !insights) return null;

  const cards = [
    { icon: Sparkles, title: 'Progress Observation', text: insights.positive, borderClass: 'border-green-200', bgClass: 'bg-green-50/50', iconBg: 'bg-green-100', iconColor: 'text-green-700', titleColor: 'text-green-800', textColor: 'text-green-900/80' },
    { icon: Target, title: 'Habit Recommendation', text: insights.recommendation, borderClass: 'border-amber-200', bgClass: 'bg-amber-50/50', iconBg: 'bg-amber-100', iconColor: 'text-amber-700', titleColor: 'text-amber-800', textColor: 'text-amber-900/80' },
    { icon: Heart, title: 'Your Gut Coach Says', text: insights.motivation, borderClass: 'border-blue-200', bgClass: 'bg-blue-50/50', iconBg: 'bg-blue-100', iconColor: 'text-blue-700', titleColor: 'text-blue-800', textColor: 'text-blue-900/80' },
  ];

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 font-serif">
          <Sparkles className="h-5 w-5 text-primary" /> AI Gut Coach Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cards.map(({ icon: Icon, title, text, borderClass, bgClass, iconBg, iconColor, titleColor, textColor }) => (
          <div key={title} className={`rounded-lg border p-4 ${borderClass} ${bgClass}`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${iconBg} shrink-0`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </div>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${titleColor}`}>{title}</p>
                <p className={`text-sm leading-relaxed ${textColor}`}>{text}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
