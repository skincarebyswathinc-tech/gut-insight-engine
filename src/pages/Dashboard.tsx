import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Leaf, LogOut, Activity, Calendar, Award, User } from 'lucide-react';

interface Profile {
  name: string;
  email: string;
  subscription_status: string;
  program_purchased: string | null;
  gut_score: number | null;
  program_start_date: string | null;
  signup_date: string;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('name, email, subscription_status, program_purchased, gut_score, program_start_date, signup_date')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data as Profile);
      });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleTakeAssessment = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Header */}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <User className="h-4 w-4" /> Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-foreground capitalize">{profile?.subscription_status || 'Free'}</p>
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <Activity className="h-4 w-4" /> Gut Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-primary">{profile?.gut_score ?? '—'}<span className="text-sm text-muted-foreground">/100</span></p>
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <Award className="h-4 w-4" /> Program
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-foreground">{profile?.program_purchased || 'None yet'}</p>
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> Start Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-foreground">
                {profile?.program_start_date ? new Date(profile.program_start_date).toLocaleDateString() : '—'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/20 shadow-lg">
          <CardContent className="p-8 text-center space-y-4">
            <Leaf className="h-12 w-12 text-primary mx-auto" />
            <h2 className="text-xl font-serif font-bold text-foreground">Take Your Gut Health Assessment</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Complete our clinical questionnaire to get your personalized gut health score, gut type classification, and a customized healing plan.
            </p>
            <Button size="lg" onClick={handleTakeAssessment}>Start Assessment</Button>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center">
          Member since {profile?.signup_date ? new Date(profile.signup_date).toLocaleDateString() : '—'}
        </p>
      </main>
    </div>
  );
}
