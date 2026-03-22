import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { GutAgeInput, GutAgeResult, calculateGutAge } from '@/utils/gutAgeEngine';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, AlertTriangle, Lightbulb, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { toast } from 'sonner';

const STEPS = ['Basic Info', 'Digestion', 'Diet & Hydration', 'Lifestyle'];

export default function GutAgeTest() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<GutAgeResult | null>(null);
  const [saving, setSaving] = useState(false);

  const [input, setInput] = useState<GutAgeInput>({
    actualAge: 30,
    bloating: 'sometimes',
    bowelRegularity: 'mostly_regular',
    stoolConsistency: 'normal',
    reflux: false,
    excessiveGas: false,
    fiberIntake: 'moderate',
    fruitVegServings: 3,
    waterGlasses: 6,
    stressLevel: 'moderate',
    sleepHours: 7,
    exerciseFrequency: '1-2_weekly',
    processedFood: 'sometimes',
    fermentedFoods: false,
  });

  const update = <K extends keyof GutAgeInput>(key: K, value: GutAgeInput[K]) => {
    setInput(prev => ({ ...prev, [key]: value }));
  };

  const RadioOption = ({ value, label }: { value: string; label: string }) => (
    <div className="flex items-center space-x-2">
      <RadioGroupItem value={value} id={`radio-${value}`} />
      <Label htmlFor={`radio-${value}`} className="cursor-pointer text-foreground/80">{label}</Label>
    </div>
  );

  const handleSubmit = async () => {
    const res = calculateGutAge(input);
    setResult(res);

    if (user) {
      setSaving(true);
      const { error } = await supabase.from('gut_age_test_results').insert({
        user_id: user.id,
        biological_age: res.actualAge,
        gut_age: res.gutAge,
        age_gap: res.ageGap,
        risk_factors: res.riskFactors,
        recommendations: res.recommendations,
      });
      setSaving(false);
      if (error) toast.error('Could not save results');
      else toast.success('Results saved!');
    }
  };

  const next = () => (step < 3 ? setStep(step + 1) : handleSubmit());
  const prev = () => step > 0 && setStep(step - 1);

  if (result) {
    const isYounger = result.ageGap < 0;
    const isOlder = result.ageGap > 0;
    const gutHealthPct = Math.max(0, Math.min(100, 100 - result.ageGap * 5));

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 py-12 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
          </Button>

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-serif font-bold text-foreground">Your Gut Age Results</h1>
            <p className="text-muted-foreground">Based on your digestion, diet, and lifestyle responses</p>
          </div>

          {/* Age Comparison Card */}
          <Card className="border-primary/20 shadow-xl overflow-hidden">
            <div className="bg-primary/10 p-8 text-center space-y-4">
              <div className="flex items-center justify-center gap-8">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Actual Age</p>
                  <p className="text-5xl font-bold text-foreground">{result.actualAge}</p>
                </div>
                <div className="text-3xl text-muted-foreground">→</div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Gut Age</p>
                  <p className={cn(
                    "text-5xl font-bold",
                    isYounger ? "text-primary" : isOlder ? "text-destructive" : "text-foreground"
                  )}>
                    {result.gutAge}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2">
                {isYounger ? <TrendingDown className="h-5 w-5 text-primary" /> :
                 isOlder ? <TrendingUp className="h-5 w-5 text-destructive" /> :
                 <Minus className="h-5 w-5 text-muted-foreground" />}
                <span className={cn(
                  "text-lg font-semibold",
                  isYounger ? "text-primary" : isOlder ? "text-destructive" : "text-foreground"
                )}>
                  {isYounger ? `${Math.abs(result.ageGap)} years younger` :
                   isOlder ? `${result.ageGap} years older` : 'Same as actual age'}
                </span>
              </div>
              <Progress value={gutHealthPct} className="h-3 max-w-xs mx-auto" />
              <p className="text-xs text-muted-foreground">Gut Health Score: {gutHealthPct}%</p>
            </div>
          </Card>

          {/* Why Your Gut Age */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" /> Why Your Gut Age is {isYounger ? 'Lower' : isOlder ? 'Higher' : 'On Par'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {result.reasons.map((r, i) => (
                <p key={i} className="text-sm text-foreground/80 leading-relaxed">• {r}</p>
              ))}
            </CardContent>
          </Card>

          {/* Risk Factors */}
          {result.riskFactors.length > 0 && (
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" /> Risk Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.riskFactors.map((f, i) => (
                    <span key={i} className="px-3 py-1 bg-destructive/10 text-destructive text-xs rounded-full font-medium">{f}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Habit */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" /> One Habit to Start Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground font-medium leading-relaxed">{result.keyHabit}</p>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="text-base">Additional Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.recommendations.map((r, i) => (
                  <p key={i} className="text-sm text-foreground/80">✓ {r}</p>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { setResult(null); setStep(0); }}>Retake Test</Button>
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-primary">Gut Age Test</h1>
          <p className="text-muted-foreground mt-2">Discover how old your gut really is</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 flex flex-col items-center gap-2">
              <div className={cn("h-1.5 w-full rounded-full transition-colors", i <= step ? "bg-primary" : "bg-muted")} />
              <span className={cn("text-xs font-medium hidden sm:block", i <= step ? "text-primary" : "text-muted-foreground")}>{s}</span>
            </div>
          ))}
        </div>

        <Card className="border-primary/10 shadow-lg">
          <CardHeader className="border-b border-border/50 bg-muted/30">
            <CardTitle className="text-xl font-serif text-primary">{STEPS[step]}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {step === 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Your Age: {input.actualAge}</Label>
                <Slider value={[input.actualAge]} onValueChange={([v]) => update('actualAge', v)} min={16} max={80} step={1} />
              </div>
            )}

            {step === 1 && (
              <>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground">Bloating Frequency</Label>
                  <RadioGroup value={input.bloating} onValueChange={v => update('bloating', v as any)} className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {['never', 'rarely', 'sometimes', 'often', 'daily'].map(v => <RadioOption key={v} value={v} label={v.charAt(0).toUpperCase() + v.slice(1)} />)}
                  </RadioGroup>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground">Bowel Regularity</Label>
                  <RadioGroup value={input.bowelRegularity} onValueChange={v => update('bowelRegularity', v as any)} className="grid grid-cols-2 gap-2">
                    <RadioOption value="regular" label="Regular" />
                    <RadioOption value="mostly_regular" label="Mostly Regular" />
                    <RadioOption value="irregular" label="Irregular" />
                    <RadioOption value="very_irregular" label="Very Irregular" />
                  </RadioGroup>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground">Stool Consistency</Label>
                  <RadioGroup value={input.stoolConsistency} onValueChange={v => update('stoolConsistency', v as any)} className="grid grid-cols-2 gap-2">
                    <RadioOption value="normal" label="Normal" />
                    <RadioOption value="hard" label="Hard" />
                    <RadioOption value="loose" label="Loose" />
                    <RadioOption value="variable" label="Variable" />
                  </RadioGroup>
                </div>
                <div className="flex flex-wrap gap-4">
                  {[{ key: 'reflux' as const, label: 'Acid Reflux' }, { key: 'excessiveGas' as const, label: 'Excessive Gas' }].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox id={key} checked={input[key]} onCheckedChange={v => update(key, !!v)} />
                      <Label htmlFor={key} className="cursor-pointer text-foreground/80">{label}</Label>
                    </div>
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground">Fiber Intake</Label>
                  <RadioGroup value={input.fiberIntake} onValueChange={v => update('fiberIntake', v as any)} className="flex gap-4">
                    <RadioOption value="low" label="Low" />
                    <RadioOption value="moderate" label="Moderate" />
                    <RadioOption value="high" label="High" />
                  </RadioGroup>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground">Fruit & Vegetable Servings/Day: {input.fruitVegServings}</Label>
                  <Slider value={[input.fruitVegServings]} onValueChange={([v]) => update('fruitVegServings', v)} min={0} max={10} step={1} />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground">Water Intake (glasses/day): {input.waterGlasses}</Label>
                  <Slider value={[input.waterGlasses]} onValueChange={([v]) => update('waterGlasses', v)} min={1} max={15} step={1} />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground">Processed Food Consumption</Label>
                  <RadioGroup value={input.processedFood} onValueChange={v => update('processedFood', v as any)} className="grid grid-cols-2 gap-2">
                    <RadioOption value="rarely" label="Rarely" />
                    <RadioOption value="sometimes" label="Sometimes" />
                    <RadioOption value="often" label="Often" />
                    <RadioOption value="daily" label="Daily" />
                  </RadioGroup>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="fermented" checked={input.fermentedFoods} onCheckedChange={v => update('fermentedFoods', !!v)} />
                  <Label htmlFor="fermented" className="cursor-pointer text-foreground/80">I regularly eat fermented foods (yogurt, kimchi, kefir…)</Label>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground">Stress Level</Label>
                  <RadioGroup value={input.stressLevel} onValueChange={v => update('stressLevel', v as any)} className="grid grid-cols-2 gap-2">
                    <RadioOption value="low" label="Low" />
                    <RadioOption value="moderate" label="Moderate" />
                    <RadioOption value="high" label="High" />
                    <RadioOption value="very_high" label="Very High" />
                  </RadioGroup>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground">Sleep (hours/night): {input.sleepHours}</Label>
                  <Slider value={[input.sleepHours]} onValueChange={([v]) => update('sleepHours', v)} min={3} max={12} step={0.5} />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground">Exercise Frequency</Label>
                  <RadioGroup value={input.exerciseFrequency} onValueChange={v => update('exerciseFrequency', v as any)} className="grid grid-cols-2 gap-2">
                    <RadioOption value="none" label="None" />
                    <RadioOption value="1-2_weekly" label="1-2x / week" />
                    <RadioOption value="3-4_weekly" label="3-4x / week" />
                    <RadioOption value="5+_weekly" label="5+ / week" />
                  </RadioGroup>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={prev} disabled={step === 0}>Previous</Button>
          <Button onClick={next} disabled={saving}>{step === 3 ? 'Calculate Gut Age' : 'Next'}</Button>
        </div>
      </div>
    </div>
  );
}
