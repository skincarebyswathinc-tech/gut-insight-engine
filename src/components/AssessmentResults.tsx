import { AssessmentSummary } from '@/types/assessment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Utensils, Moon, Apple } from 'lucide-react';

interface Props {
  summary: AssessmentSummary;
  onReset: () => void;
}

const SECTIONS = [
  { key: 'digestiveSymptoms' as const, title: 'Digestive Symptoms Summary', icon: Activity, color: 'text-red-500' },
  { key: 'eatingBehaviour' as const, title: 'Eating Behaviour Summary', icon: Utensils, color: 'text-amber-500' },
  { key: 'lifestyle' as const, title: 'Lifestyle Summary', icon: Moon, color: 'text-blue-500' },
  { key: 'dietPattern' as const, title: 'Diet Pattern Summary', icon: Apple, color: 'text-green-500' },
];

export default function AssessmentResults({ summary, onReset }: Props) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif font-bold text-primary">Clinical Assessment Report</h2>
        <p className="text-muted-foreground text-sm mt-1">Gut Health Screening Summary</p>
      </div>

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
