import { AssessmentSummary } from '@/types/assessment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Activity, Utensils, Moon, Apple, Droplets, Heart } from 'lucide-react';

interface Props {
  summary: AssessmentSummary;
  onReset: () => void;
}

const SECTIONS = [
  { key: 'digestiveSymptoms' as const, title: 'Digestive Symptoms Summary', icon: Activity, color: 'text-destructive' },
  { key: 'eatingBehaviour' as const, title: 'Eating Behaviour Summary', icon: Utensils, color: 'text-primary' },
  { key: 'lifestyle' as const, title: 'Lifestyle Summary', icon: Moon, color: 'text-primary' },
  { key: 'dietPattern' as const, title: 'Diet Pattern Summary', icon: Apple, color: 'text-primary' },
];

const SCORE_CATEGORIES = [
  { key: 'digestiveHealth' as const, label: 'Digestive Health', max: 30, icon: Activity },
  { key: 'dietQuality' as const, label: 'Diet Quality', max: 25, icon: Apple },
  { key: 'lifestyleBalance' as const, label: 'Lifestyle Balance', max: 25, icon: Moon },
  { key: 'hydration' as const, label: 'Hydration', max: 20, icon: Droplets },
];

function getScoreColor(total: number) {
  if (total >= 80) return 'text-primary';
  if (total >= 60) return 'text-primary';
  if (total >= 40) return 'text-yellow-600';
  return 'text-destructive';
}

function getScoreLabel(total: number) {
  if (total >= 80) return 'Excellent';
  if (total >= 60) return 'Good';
  if (total >= 40) return 'Fair';
  return 'Needs Attention';
}

export default function AssessmentResults({ summary, onReset }: Props) {
  const { score } = summary;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif font-bold text-primary">Clinical Assessment Report</h2>
        <p className="text-muted-foreground text-sm mt-1">Gut Health Screening Summary</p>
      </div>

      {/* Gut Health Score Card */}
      <Card className="border-primary/20 shadow-lg overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-border/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-serif">
            <Heart className="h-5 w-5 text-primary" />
            Gut Health Score
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="relative flex items-center justify-center w-32 h-32 rounded-full border-4 border-primary/20">
              <div className="text-center">
                <span className={`text-4xl font-bold ${getScoreColor(score.total)}`}>{score.total}</span>
                <span className="text-muted-foreground text-sm block">/100</span>
              </div>
            </div>
            <div className="flex-1">
              <span className={`text-lg font-semibold ${getScoreColor(score.total)}`}>
                {getScoreLabel(score.total)}
              </span>
              <p className="text-sm text-foreground/70 mt-2 leading-relaxed">{score.explanation}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Score Breakdown</h4>
            {SCORE_CATEGORIES.map(({ key, label, max, icon: Icon }) => {
              const value = score[key];
              const pct = Math.round((value / max) * 100);
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-foreground/80">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      {label}
                    </span>
                    <span className="font-medium text-foreground">{value}/{max}</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {SECTIONS.map(({ key, title, icon: Icon, color }) => (
        <Card key={key} className="border-primary/10 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-serif">
              <Icon className={`h-5 w-5 ${color}`} />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80 leading-relaxed">{summary[key]}</p>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-center pt-4">
        <Button variant="outline" onClick={onReset}>Take Assessment Again</Button>
      </div>
    </div>
  );
}
