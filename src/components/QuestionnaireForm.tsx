import { useState } from 'react';
import { QuestionnaireResponse } from '@/types/assessment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface Props {
  onSubmit: (data: QuestionnaireResponse) => void;
}

const STEPS = ['Digestive Symptoms', 'Eating Behaviour', 'Lifestyle Factors', 'Diet Pattern'];

const FOOD_TRIGGER_OPTIONS = ['Dairy', 'Gluten', 'FODMAPs', 'Caffeine', 'Alcohol', 'Spicy food', 'Legumes', 'Cruciferous vegetables'];

export default function QuestionnaireForm({ onSubmit }: Props) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<QuestionnaireResponse>>({
    bloating: 'never',
    bowel_regularity: 'regular',
    stool_consistency: 'normal',
    abdominal_pain: 'none',
    reflux: false,
    excessive_gas: false,
    nausea: false,
    meals_per_day: 3,
    eating_speed: 'moderate',
    eating_environment: 'table',
    mindful_eating: true,
    late_night_eating: false,
    stress_level: 'moderate',
    sleep_hours: 7,
    exercise_frequency: '1-2_weekly',
    water_intake: 6,
    diet_type: 'omnivore',
    fruit_veg_servings: 3,
    processed_food: 'sometimes',
    food_triggers: [],
    fiber_intake: 'moderate',
  });

  const update = (key: keyof QuestionnaireResponse, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const toggleTrigger = (trigger: string) => {
    const current = data.food_triggers || [];
    update('food_triggers', current.includes(trigger)
      ? current.filter(t => t !== trigger)
      : [...current, trigger]
    );
  };

  const next = () => step < 3 ? setStep(step + 1) : onSubmit(data as QuestionnaireResponse);
  const prev = () => step > 0 && setStep(step - 1);

  const RadioOption = ({ field, value, label }: { field: keyof QuestionnaireResponse; value: string; label: string }) => (
    <div className="flex items-center space-x-2">
      <RadioGroupItem value={value} id={`${field}-${value}`} />
      <Label htmlFor={`${field}-${value}`} className="cursor-pointer text-foreground/80">{label}</Label>
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-1 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1 flex flex-col items-center gap-2">
            <div className={cn(
              "h-1.5 w-full rounded-full transition-colors",
              i <= step ? "bg-primary" : "bg-muted"
            )} />
            <span className={cn(
              "text-xs font-medium transition-colors hidden sm:block",
              i <= step ? "text-primary" : "text-muted-foreground"
            )}>{s}</span>
          </div>
        ))}
      </div>

      <Card className="border-primary/10 shadow-lg">
        <CardHeader className="border-b border-border/50 bg-muted/30">
          <CardTitle className="text-xl font-serif text-primary">{STEPS[step]}</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {step === 0 && (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Bloating Frequency</Label>
                <RadioGroup value={data.bloating} onValueChange={v => update('bloating', v)} className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['never', 'rarely', 'sometimes', 'often', 'daily'].map(v => (
                    <RadioOption key={v} field="bloating" value={v} label={v.charAt(0).toUpperCase() + v.slice(1)} />
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Bowel Regularity</Label>
                <RadioGroup value={data.bowel_regularity} onValueChange={v => update('bowel_regularity', v)} className="grid grid-cols-2 gap-2">
                  <RadioOption field="bowel_regularity" value="regular" label="Regular" />
                  <RadioOption field="bowel_regularity" value="mostly_regular" label="Mostly Regular" />
                  <RadioOption field="bowel_regularity" value="irregular" label="Irregular" />
                  <RadioOption field="bowel_regularity" value="very_irregular" label="Very Irregular" />
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Stool Consistency</Label>
                <RadioGroup value={data.stool_consistency} onValueChange={v => update('stool_consistency', v)} className="grid grid-cols-2 gap-2">
                  <RadioOption field="stool_consistency" value="hard" label="Hard" />
                  <RadioOption field="stool_consistency" value="normal" label="Normal" />
                  <RadioOption field="stool_consistency" value="loose" label="Loose" />
                  <RadioOption field="stool_consistency" value="variable" label="Variable" />
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Abdominal Pain</Label>
                <RadioGroup value={data.abdominal_pain} onValueChange={v => update('abdominal_pain', v)} className="grid grid-cols-2 gap-2">
                  <RadioOption field="abdominal_pain" value="none" label="None" />
                  <RadioOption field="abdominal_pain" value="mild" label="Mild" />
                  <RadioOption field="abdominal_pain" value="moderate" label="Moderate" />
                  <RadioOption field="abdominal_pain" value="severe" label="Severe" />
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Additional Symptoms</Label>
                <div className="flex flex-wrap gap-4">
                  {[
                    { key: 'reflux' as const, label: 'Acid Reflux' },
                    { key: 'excessive_gas' as const, label: 'Excessive Gas' },
                    { key: 'nausea' as const, label: 'Nausea' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox id={key} checked={!!data[key]} onCheckedChange={v => update(key, v)} />
                      <Label htmlFor={key} className="cursor-pointer text-foreground/80">{label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Meals Per Day: {data.meals_per_day}</Label>
                <Slider
                  value={[data.meals_per_day || 3]}
                  onValueChange={([v]) => update('meals_per_day', v)}
                  min={1} max={6} step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Eating Speed</Label>
                <RadioGroup value={data.eating_speed} onValueChange={v => update('eating_speed', v)} className="flex gap-4">
                  <RadioOption field="eating_speed" value="slow" label="Slow" />
                  <RadioOption field="eating_speed" value="moderate" label="Moderate" />
                  <RadioOption field="eating_speed" value="fast" label="Fast" />
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Primary Eating Environment</Label>
                <RadioGroup value={data.eating_environment} onValueChange={v => update('eating_environment', v)} className="grid grid-cols-2 gap-2">
                  <RadioOption field="eating_environment" value="table" label="Table" />
                  <RadioOption field="eating_environment" value="desk" label="Desk" />
                  <RadioOption field="eating_environment" value="couch" label="Couch" />
                  <RadioOption field="eating_environment" value="on_the_go" label="On the Go" />
                </RadioGroup>
              </div>

              <div className="flex flex-wrap gap-4">
                {[
                  { key: 'mindful_eating' as const, label: 'Practice Mindful Eating' },
                  { key: 'late_night_eating' as const, label: 'Late Night Eating' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox id={key} checked={!!data[key]} onCheckedChange={v => update(key, v)} />
                    <Label htmlFor={key} className="cursor-pointer text-foreground/80">{label}</Label>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Stress Level</Label>
                <RadioGroup value={data.stress_level} onValueChange={v => update('stress_level', v)} className="grid grid-cols-2 gap-2">
                  <RadioOption field="stress_level" value="low" label="Low" />
                  <RadioOption field="stress_level" value="moderate" label="Moderate" />
                  <RadioOption field="stress_level" value="high" label="High" />
                  <RadioOption field="stress_level" value="very_high" label="Very High" />
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Sleep (hours/night): {data.sleep_hours}</Label>
                <Slider
                  value={[data.sleep_hours || 7]}
                  onValueChange={([v]) => update('sleep_hours', v)}
                  min={3} max={12} step={0.5}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Exercise Frequency</Label>
                <RadioGroup value={data.exercise_frequency} onValueChange={v => update('exercise_frequency', v)} className="grid grid-cols-2 gap-2">
                  <RadioOption field="exercise_frequency" value="none" label="None" />
                  <RadioOption field="exercise_frequency" value="1-2_weekly" label="1-2x / week" />
                  <RadioOption field="exercise_frequency" value="3-4_weekly" label="3-4x / week" />
                  <RadioOption field="exercise_frequency" value="5+_weekly" label="5+ / week" />
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Water Intake (glasses/day): {data.water_intake}</Label>
                <Slider
                  value={[data.water_intake || 6]}
                  onValueChange={([v]) => update('water_intake', v)}
                  min={1} max={15} step={1}
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Diet Type</Label>
                <RadioGroup value={data.diet_type} onValueChange={v => update('diet_type', v)} className="grid grid-cols-2 gap-2">
                  {['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'keto', 'other'].map(v => (
                    <RadioOption key={v} field="diet_type" value={v} label={v.charAt(0).toUpperCase() + v.slice(1)} />
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Fruit & Vegetable Servings/Day: {data.fruit_veg_servings}</Label>
                <Slider
                  value={[data.fruit_veg_servings || 3]}
                  onValueChange={([v]) => update('fruit_veg_servings', v)}
                  min={0} max={10} step={1}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Processed Food Consumption</Label>
                <RadioGroup value={data.processed_food} onValueChange={v => update('processed_food', v)} className="grid grid-cols-2 gap-2">
                  <RadioOption field="processed_food" value="rarely" label="Rarely" />
                  <RadioOption field="processed_food" value="sometimes" label="Sometimes" />
                  <RadioOption field="processed_food" value="often" label="Often" />
                  <RadioOption field="processed_food" value="daily" label="Daily" />
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Fiber Intake</Label>
                <RadioGroup value={data.fiber_intake} onValueChange={v => update('fiber_intake', v)} className="flex gap-4">
                  <RadioOption field="fiber_intake" value="low" label="Low" />
                  <RadioOption field="fiber_intake" value="moderate" label="Moderate" />
                  <RadioOption field="fiber_intake" value="high" label="High" />
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Food Triggers (select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {FOOD_TRIGGER_OPTIONS.map(t => (
                    <div key={t} className="flex items-center space-x-2">
                      <Checkbox
                        id={`trigger-${t}`}
                        checked={data.food_triggers?.includes(t)}
                        onCheckedChange={() => toggleTrigger(t)}
                      />
                      <Label htmlFor={`trigger-${t}`} className="cursor-pointer text-foreground/80">{t}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={prev} disabled={step === 0}>Previous</Button>
        <Button onClick={next}>{step === 3 ? 'Generate Assessment' : 'Next'}</Button>
      </div>
    </div>
  );
}
