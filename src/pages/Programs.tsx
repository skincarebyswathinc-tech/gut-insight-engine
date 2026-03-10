import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Leaf, ArrowLeft, Zap, Crown, Star, CheckCircle2 } from 'lucide-react';

const PROGRAMS = [
  {
    name: '7 Day Detox Challenge',
    price: 199,
    icon: Zap,
    color: 'text-yellow-600',
    features: ['7-day detox drink plan', 'Daily habit tracker', 'Basic gut score'],
  },
  {
    name: '14 Day Gut Reset',
    price: 999,
    icon: Star,
    color: 'text-primary',
    features: ['Full 14-day meal plan', 'Daily tracking & analytics', 'Gut recovery forecast', 'Weekly reports'],
  },
  {
    name: '28 Day Deep Reset',
    price: 1999,
    icon: Crown,
    color: 'text-purple-600',
    features: ['Complete 28-day meal plan', 'Advanced analytics', 'Gut recovery forecast', 'Weekly reports', 'Priority support'],
  },
  {
    name: 'Premium Membership',
    price: 799,
    icon: Crown,
    color: 'text-amber-500',
    monthly: true,
    features: ['All programs included', 'Unlimited assessments', 'Monthly meal plan refresh', 'Priority support', 'Community access'],
  },
];

export default function Programs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loadingProgram, setLoadingProgram] = useState<string | null>(null);

  const handlePurchase = async (program: typeof PROGRAMS[0]) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoadingProgram(program.name);

    try {
      const { data, error } = await supabase.functions.invoke('razorpay', {
        body: {
          action: 'create_order',
          program_name: program.name,
          amount: program.price,
        },
      });

      if (error) throw error;

      // Load Razorpay checkout
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: 'Swathinc Gut Reset',
        description: program.name,
        order_id: data.order_id,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const { error: verifyError } = await supabase.functions.invoke('razorpay', {
            body: {
              action: 'verify_payment',
              ...response,
              amount: program.price,
            },
          });

          if (verifyError) {
            toast({ title: 'Payment verification failed', description: verifyError.message, variant: 'destructive' });
          } else {
            toast({ title: 'Payment successful!', description: `${program.name} activated.` });
            navigate('/dashboard');
          }
        },
        prefill: { email: user.email },
        theme: { color: '#2d8a7e' },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Could not initiate payment', variant: 'destructive' });
    }

    setLoadingProgram(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Leaf className="h-5 w-5 text-primary" />
          <span className="font-serif font-bold text-foreground">Programs & Pricing</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground">Choose Your Gut Healing Program</h1>
          <p className="text-muted-foreground mt-2">Science-backed programs with Indian ingredients</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROGRAMS.map((program) => {
            const Icon = program.icon;
            return (
              <Card key={program.name} className="border-primary/10 shadow-lg hover:shadow-xl transition-shadow flex flex-col">
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-2">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Icon className={`h-6 w-6 ${program.color}`} />
                    </div>
                  </div>
                  <CardTitle className="text-lg font-serif">{program.name}</CardTitle>
                  <CardDescription className="text-2xl font-bold text-foreground">
                    ₹{program.price}
                    {program.monthly && <span className="text-sm text-muted-foreground font-normal">/month</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <ul className="space-y-2 mb-6">
                    {program.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    onClick={() => handlePurchase(program)}
                    disabled={loadingProgram === program.name}
                  >
                    {loadingProgram === program.name ? 'Processing…' : 'Get Started'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
