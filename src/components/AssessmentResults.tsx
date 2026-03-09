import { AssessmentSummary, GutTypeName } from '@/types/assessment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Activity, Utensils, Moon, Apple, Droplets, Heart, Flame, Snail, Bug, Brain, AlertTriangle, Zap, Search, Calendar, CheckCircle2, Sparkles, ShieldCheck, Leaf, GlassWater, Egg } from 'lucide-react';

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

const GUT_TYPE_META: Record<GutTypeName, { icon: typeof Flame; color: string; bg: string }> = {
  'Inflammatory Gut': { icon: Flame, color: 'text-destructive', bg: 'bg-destructive/10' },
  'Sluggish Gut': { icon: Snail, color: 'text-muted-foreground', bg: 'bg-muted' },
  'Dysbiosis Gut': { icon: Bug, color: 'text-primary', bg: 'bg-primary/10' },
  'Stress Gut': { icon: Brain, color: 'text-yellow-600', bg: 'bg-yellow-50' },
};

export default function AssessmentResults({ summary, onReset }: Props) {
  const { score, gutType, rootCauses, programRecommendation, healingStrategy, drinkPlan, breakfastPlan } = summary;
  const primaryMeta = GUT_TYPE_META[gutType.primary];

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

      {/* Gut Type Classification */}
      <Card className="border-primary/20 shadow-lg overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-border/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-serif">
            <primaryMeta.icon className={`h-5 w-5 ${primaryMeta.color}`} />
            Gut Microbiome Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${primaryMeta.bg}`}>
              <primaryMeta.icon className={`h-6 w-6 ${primaryMeta.color}`} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Primary Gut Type</p>
              <p className={`text-xl font-serif font-bold ${primaryMeta.color}`}>{gutType.primary}</p>
            </div>
          </div>
          {gutType.secondary && (
            <div className="flex items-center gap-3 pl-1">
              <div className={`p-2 rounded-full ${GUT_TYPE_META[gutType.secondary].bg}`}>
                {(() => { const Icon = GUT_TYPE_META[gutType.secondary!].icon; return <Icon className={`h-4 w-4 ${GUT_TYPE_META[gutType.secondary!].color}`} />; })()}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Secondary Pattern</p>
                <p className="text-sm font-semibold text-foreground">{gutType.secondary}</p>
              </div>
            </div>
          )}
          <p className="text-sm text-foreground/80 leading-relaxed border-t border-border/50 pt-4">{gutType.explanation}</p>
        </CardContent>
      </Card>

      {/* Root Cause Analysis */}
      <Card className="border-primary/20 shadow-lg overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-border/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-serif">
            <Search className="h-5 w-5 text-primary" />
            Root Cause Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Top 3 Root Causes
            </h4>
            <div className="space-y-3">
              {rootCauses.topCauses.map((c, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{c.cause}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{c.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border/50 pt-4">
            <h4 className="text-sm font-semibold text-foreground mb-2">Digestive Pattern</h4>
            <p className="text-sm text-foreground/80 leading-relaxed">{rootCauses.digestivePatternExplanation}</p>
          </div>

          <div className="border-t border-border/50 pt-4 bg-primary/5 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
            <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-primary" />
              Key Habit to Change Now
            </h4>
            <p className="text-sm text-foreground/80 leading-relaxed">{rootCauses.keyHabitChange}</p>
          </div>
        </CardContent>
      </Card>

      {/* Healing Strategy */}
      <Card className="border-primary/20 shadow-lg overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-border/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-serif">
            <Sparkles className="h-5 w-5 text-primary" />
            Your Personalized Gut Reset Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <p className="text-sm text-foreground/80 leading-relaxed">{healingStrategy.overview}</p>

          {healingStrategy.phases.map((phase, idx) => {
            const phaseIcons = [ShieldCheck, Zap, Leaf];
            const PhaseIcon = phaseIcons[idx];
            const phaseColors = ['text-primary', 'text-yellow-600', 'text-green-600'];
            return (
              <div key={idx} className="border border-border/50 rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PhaseIcon className={`h-4 w-4 ${phaseColors[idx]}`} />
                    <span className="font-semibold text-foreground">{phase.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{phase.duration}</span>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-sm text-foreground/80 leading-relaxed">{phase.focus}</p>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <Activity className="h-3 w-3 text-muted-foreground" /> Digestion
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{phase.digestion}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-muted-foreground" /> Skin
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{phase.skin}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <Zap className="h-3 w-3 text-muted-foreground" /> Metabolism
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{phase.metabolism}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <Flame className="h-3 w-3 text-muted-foreground" /> Inflammation
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{phase.inflammation}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Detox Drink Plan */}
      <Card className="border-primary/20 shadow-lg overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-border/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-serif">
            <GlassWater className="h-5 w-5 text-primary" />
            Daily Detox & Functional Drinks
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Day</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Morning Detox Drink</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Functional Drink</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Benefits</th>
                </tr>
              </thead>
              <tbody>
                {drinkPlan.map((day, idx) => (
                  <tr key={day.day} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                    <td className="px-4 py-3 font-medium text-primary">{day.day}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{day.morningDetox.name}</p>
                      <p className="text-xs text-muted-foreground">{day.morningDetox.ingredients}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{day.functionalDrink.name}</p>
                      <p className="text-xs text-muted-foreground">{day.functionalDrink.ingredients}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{day.benefits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      {/* Program Recommendation */}
      <Card className="border-primary shadow-xl overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-serif">
            <Calendar className="h-5 w-5" />
            Recommended Program
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="text-center pb-4 border-b border-border/50">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Your personalized path</p>
            <h3 className="text-2xl font-serif font-bold text-primary">{programRecommendation.program}</h3>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Why This Duration?</h4>
            <p className="text-sm text-foreground/80 leading-relaxed">{programRecommendation.durationReason}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Expected Improvements</h4>
            <div className="space-y-2">
              {programRecommendation.expectedImprovements.map((improvement, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground/80">{improvement}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button className="w-full" size="lg">Start {programRecommendation.program}</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center pt-4">
        <Button variant="outline" onClick={onReset}>Take Assessment Again</Button>
      </div>
    </div>
  );
}
