import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { Leaf, LogOut, Activity, Calendar, Award, User, TrendingUp, ClipboardList, CreditCard, BarChart3, FileText, Clock } from 'lucide-react';
import GutCoachInsights from '@/components/GutCoachInsights';

interface Profile {
  name: string;
  email: string;
  subscription_status: string;
  program_purchased: string | null;
  gut_score: number | null;
  program_start_date: string | null;
  signup_date: string;
}

interface DailyScore {
  total_score: number;
  hydration: number;
  nutrition: number;
  habits: number;
  activity: number;
  stress_balance: number;
}

interface Forecast {
  current_score: number;
  avg_7day: number;
  daily_trend: number;
  forecast: string;
  data_points: number;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [todayScore, setTodayScore] = useState<DailyScore | null>(null);
  const [forecast, setForecast] = useState<Forecast | null>(null);

  useEffect(() => {
    if (!user) return;

    // Load profile
    supabase.from('profiles')
      .select('name, email, subscription_status, program_purchased, gut_score, program_start_date, signup_date')
      .eq('user_id', user.id).single()
      .then(({ data }) => { if (data) setProfile(data as Profile); });

    // Load today's score
    supabase.from('gut_progress_scores')
      .select('*')
      .eq('user_id', user.id)
      .eq('score_date', new Date().toISOString().split('T')[0])
      .single()
      .then(({ data }) => {
        if (data) {
          setTodayScore({
            total_score: (data as any).total_score,
            hydration: (data as any).hydration_score,
            nutrition: (data as any).nutrition_score,
            habits: (data as any).habit_compliance_score,
            activity: (data as any).activity_score,
            stress_balance: (data as any).stress_balance_score,
          });
        }
      });

    // Load forecast
    supabase.rpc('gut_recovery_forecast', { p_user_id: user.id })
      .then(({ data }) => { if (data) setForecast(data as unknown as Forecast); });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="font-serif font-bold text-lg text-foreground">Swathinc Gut Reset</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-1" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Welcome{profile?.name ? `, ${profile.name}` : ''}!
          </h1>
          <p className="text-muted-foreground mt-1">Your Gut Reset Dashboard</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-foreground capitalize">{profile?.subscription_status || 'Free'}</p>
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5" /> Gut Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-primary">{profile?.gut_score ?? todayScore?.total_score ?? '—'}<span className="text-xs text-muted-foreground">/100</span></p>
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5" /> Program
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-bold text-foreground">{profile?.program_purchased || 'None'}</p>
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Start Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-bold text-foreground">
                {profile?.program_start_date ? new Date(profile.program_start_date).toLocaleDateString() : '—'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Score Breakdown */}
        {todayScore && (
          <Card className="border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" /> Today's Gut Reset Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-center mb-4">
                <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary">{todayScore.total_score}</span>
                </div>
              </div>
              {[
                { label: 'Hydration', value: todayScore.hydration, max: 20 },
                { label: 'Nutrition', value: todayScore.nutrition, max: 20 },
                { label: 'Habits', value: todayScore.habits, max: 20 },
                { label: 'Activity', value: todayScore.activity, max: 20 },
                { label: 'Stress Balance', value: todayScore.stress_balance, max: 20 },
              ].map(({ label, value, max }) => (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}/{max}</span>
                  </div>
                  <Progress value={(value / max) * 100} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Gut Recovery Forecast */}
        {forecast && (
          <Card className="border-primary/20 shadow-lg bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Gut Recovery Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/80 leading-relaxed">{forecast.forecast}</p>
              {forecast.avg_7day && (
                <p className="text-xs text-muted-foreground mt-2">
                  7-day average: {forecast.avg_7day}/100 • Trend: {forecast.daily_trend > 0 ? '+' : ''}{forecast.daily_trend}/day
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* AI Gut Coach Insights */}
        {user && <GutCoachInsights userId={user.id} />}

        {/* Action Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border-primary/10 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/daily-tracker')}>
            <CardContent className="p-5 text-center">
              <ClipboardList className="h-7 w-7 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-foreground text-sm">Daily Tracker</h3>
              <p className="text-xs text-muted-foreground mt-1">Log today's habits</p>
            </CardContent>
          </Card>

          <Card className="border-primary/10 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/weekly-report')}>
            <CardContent className="p-5 text-center">
              <FileText className="h-7 w-7 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-foreground text-sm">Weekly Report</h3>
              <p className="text-xs text-muted-foreground mt-1">View progress</p>
            </CardContent>
          </Card>

          <Card className="border-primary/10 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/')}>
            <CardContent className="p-5 text-center">
              <Activity className="h-7 w-7 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-foreground text-sm">Gut Assessment</h3>
              <p className="text-xs text-muted-foreground mt-1">Take the quiz</p>
            </CardContent>
          </Card>

          <Card className="border-primary/10 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/programs')}>
            <CardContent className="p-5 text-center">
              <CreditCard className="h-7 w-7 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-foreground text-sm">Programs</h3>
              <p className="text-xs text-muted-foreground mt-1">Plans & pricing</p>
            </CardContent>
          </Card>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Member since {profile?.signup_date ? new Date(profile.signup_date).toLocaleDateString() : '—'}
        </p>
      </main>
    </div>
  );
}
