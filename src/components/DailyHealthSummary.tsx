import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Droplets, Utensils, Activity, Brain, Heart, TrendingUp } from 'lucide-react';

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

function generateNarrative(scores: DailyScores, data: TrackerData): string {
  const parts: string[] = [];

  // Hydration
  if (scores.hydration >= 16) {
    parts.push('Great hydration today — this keeps your digestive enzymes active and supports nutrient absorption.');
  } else if (scores.hydration >= 10) {
    parts.push('Hydration was moderate. Aim for 8+ glasses and your detox drink to improve mucosal lining health.');
  } else {
    parts.push('Low hydration detected. Dehydration slows digestion and can worsen bloating — prioritize water intake tomorrow.');
  }

  // Nutrition
  if (scores.nutrition >= 16) {
    parts.push('Excellent diet compliance — your fiber and fermented food intake supports a diverse microbiome.');
  } else if (scores.nutrition >= 10) {
    parts.push('Nutrition was decent but could improve. Try adding more fermented foods and mindful eating to boost gut flora.');
  } else {
    parts.push('Diet compliance was low today. Poor meal adherence disrupts your gut reset progress and feeding schedule.');
  }

  // Activity
  if (scores.activity >= 14) {
    parts.push('Strong physical activity! Movement stimulates peristalsis and helps prevent constipation.');
  } else if (scores.activity >= 8) {
    parts.push('Moderate activity level. Even a 20-minute walk after meals can significantly improve digestion.');
  } else {
    parts.push('Low activity today. Sedentary behavior slows gut motility — try gentle yoga or walking tomorrow.');
  }

  // Stress
  if (scores.stress_balance >= 14) {
    parts.push('Good stress balance and sleep — your gut-brain axis is functioning well, supporting healthy digestion.');
  } else if (scores.stress_balance >= 8) {
    parts.push('Moderate stress levels. Consider deep breathing exercises before meals to activate your parasympathetic nervous system.');
  } else {
    parts.push('High stress and/or poor sleep detected. Chronic stress increases gut permeability and inflammation — prioritize rest.');
  }

  // Symptoms
  if (data.bloating_level === 'none' && data.bowel_movement === 'excellent') {
    parts.push('No digestive symptoms reported — your gut is responding well to the program!');
  } else if (data.bloating_level === 'severe' || data.bowel_movement === 'none') {
    parts.push('Significant digestive symptoms noted. Review yesterday\'s food choices and ensure adequate fiber and water.');
  } else {
    parts.push(`Symptoms are manageable (bloating: ${data.bloating_level}, bowel: ${data.bowel_movement}). Consistency will improve these over time.`);
  }

  return parts.join(' ');
}

const categories = [
  { key: 'hydration' as const, label: 'Hydration Score', max: 20, icon: Droplets },
  { key: 'nutrition' as const, label: 'Diet Compliance', max: 20, icon: Utensils },
  { key: 'habits' as const, label: 'Habit Compliance', max: 20, icon: Heart },
  { key: 'activity' as const, label: 'Activity Score', max: 20, icon: Activity },
  { key: 'stress_balance' as const, label: 'Stress Balance', max: 20, icon: Brain },
];

export default function DailyHealthSummary({ scores, trackerData }: { scores: DailyScores; trackerData: TrackerData }) {
  const narrative = generateNarrative(scores, trackerData);

  return (
    <div className="space-y-6">
      {/* Total Score */}
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 font-serif">
            <TrendingUp className="h-5 w-5 text-primary" /> Daily Health Summary
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
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.map(({ key, label, max, icon: Icon }) => (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="h-4 w-4" /> {label}
                </span>
                <span className={`font-semibold ${getScoreColor(scores[key], max)}`}>
                  {scores[key]}/{max} — {getScoreLabel(scores[key], max)}
                </span>
              </div>
              <Progress value={(scores[key] / max) * 100} className="h-2.5" />
            </div>
          ))}
        </CardContent>
      </Card>

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
