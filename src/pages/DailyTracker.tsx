import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Leaf, Droplets, Utensils, Brain, Activity, Moon, Heart, ArrowLeft, Save } from 'lucide-react';
import DailyHealthSummary from '@/components/DailyHealthSummary';

export default function DailyTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [dailyScores, setDailyScores] = useState<{ total_score: number; hydration: number; nutrition: number; habits: number; activity: number; stress_balance: number } | null>(null);
  const [previousScores, setPreviousScores] = useState<any>(null);

  const [form, setForm] = useState({
    water_glasses: 0,
    detox_drink_completed: false,
    meal_compliance_pct: 80,
    mindful_eating: false,
    fiber_intake: 'moderate' as string,
    fermented_food_taken: false,
    stress_level: 'moderate' as string,
    sleep_hours: 7,
    step_count: 0,
    exercise_minutes: 0,
    bloating_level: 'none' as string,
    energy_level: 'moderate' as string,
    bowel_movement: 'normal' as string,
    skin_condition: 'good' as string,
    notes: '',
  });

  const update = (key: string, value: unknown) => setForm(f => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase.from('daily_habit_tracker').upsert({
      user_id: user.id,
      tracking_date: new Date().toISOString().split('T')[0],
      ...form,
    }, { onConflict: 'user_id,tracking_date' });

    if (error) {
      toast({ title: 'Error saving', description: error.message, variant: 'destructive' });
    } else {
      // Calculate daily score
      const { data: scoreData } = await supabase.rpc('calculate_daily_gut_score', {
        p_user_id: user.id,
        p_date: new Date().toISOString().split('T')[0],
      });
      if (scoreData && typeof scoreData === 'object') {
        setDailyScores(scoreData as any);
      }
      toast({ title: 'Saved!', description: 'Your daily habits have been tracked.' });
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Leaf className="h-5 w-5 text-primary" />
          <span className="font-serif font-bold text-foreground">Daily Habit Tracker</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Hydration */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Droplets className="h-4 w-4 text-primary" /> Hydration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Water glasses: {form.water_glasses}</Label>
              <Slider value={[form.water_glasses]} onValueChange={([v]) => update('water_glasses', v)} max={15} step={1} className="mt-2" />
            </div>
            <div className="flex items-center justify-between">
              <Label>Detox drink completed</Label>
              <Switch checked={form.detox_drink_completed} onCheckedChange={v => update('detox_drink_completed', v)} />
            </div>
          </CardContent>
        </Card>

        {/* Nutrition */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Utensils className="h-4 w-4 text-primary" /> Nutrition
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Meal compliance: {form.meal_compliance_pct}%</Label>
              <Slider value={[form.meal_compliance_pct]} onValueChange={([v]) => update('meal_compliance_pct', v)} max={100} step={5} className="mt-2" />
            </div>
            <div className="flex items-center justify-between">
              <Label>Mindful eating</Label>
              <Switch checked={form.mindful_eating} onCheckedChange={v => update('mindful_eating', v)} />
            </div>
            <div>
              <Label>Fiber intake</Label>
              <Select value={form.fiber_intake} onValueChange={v => update('fiber_intake', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Fermented food taken</Label>
              <Switch checked={form.fermented_food_taken} onCheckedChange={v => update('fermented_food_taken', v)} />
            </div>
          </CardContent>
        </Card>

        {/* Lifestyle */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Moon className="h-4 w-4 text-primary" /> Lifestyle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Stress level</Label>
              <Select value={form.stress_level} onValueChange={v => update('stress_level', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="very_high">Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sleep hours: {form.sleep_hours}</Label>
              <Slider value={[form.sleep_hours]} onValueChange={([v]) => update('sleep_hours', v)} max={12} step={0.5} className="mt-2" />
            </div>
            <div>
              <Label>Step count</Label>
              <Input type="number" value={form.step_count} onChange={e => update('step_count', parseInt(e.target.value) || 0)} className="mt-1" />
            </div>
            <div>
              <Label>Exercise minutes</Label>
              <Input type="number" value={form.exercise_minutes} onChange={e => update('exercise_minutes', parseInt(e.target.value) || 0)} className="mt-1" />
            </div>
          </CardContent>
        </Card>

        {/* Symptoms */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" /> Symptoms & Wellness
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'bloating_level', label: 'Bloating', options: ['none', 'mild', 'moderate', 'severe'] },
              { key: 'energy_level', label: 'Energy', options: ['low', 'moderate', 'high', 'very_high'] },
              { key: 'bowel_movement', label: 'Bowel movement', options: ['none', 'irregular', 'normal', 'excellent'] },
              { key: 'skin_condition', label: 'Skin condition', options: ['poor', 'fair', 'good', 'excellent'] },
            ].map(({ key, label, options }) => (
              <div key={key}>
                <Label>{label}</Label>
                <Select value={form[key as keyof typeof form] as string} onValueChange={v => update(key, v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {options.map(o => <SelectItem key={o} value={o}>{o.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </CardContent>
        </Card>

        {dailyScores ? (
          <>
            <DailyHealthSummary scores={dailyScores} trackerData={form} />
            <Button className="w-full" size="lg" variant="outline" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </>
        ) : (
          <Button className="w-full" size="lg" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving…' : 'Save Daily Log'}
          </Button>
        )}
      </main>
    </div>
  );
}
