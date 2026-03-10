-- =============================================
-- SWATHINC GUT RESET - COMPLETE DATABASE SCHEMA
-- =============================================

-- 1. GUT AGE TEST RESULTS
CREATE TABLE public.gut_age_test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  biological_age INTEGER NOT NULL,
  gut_age INTEGER NOT NULL,
  age_gap INTEGER GENERATED ALWAYS AS (gut_age - biological_age) STORED,
  risk_factors TEXT[] DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. GUT ASSESSMENT RESULTS
CREATE TABLE public.gut_assessment_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  questionnaire_data JSONB NOT NULL DEFAULT '{}',
  gut_score INTEGER NOT NULL CHECK (gut_score >= 0 AND gut_score <= 100),
  digestive_health_score INTEGER NOT NULL DEFAULT 0,
  diet_quality_score INTEGER NOT NULL DEFAULT 0,
  lifestyle_balance_score INTEGER NOT NULL DEFAULT 0,
  hydration_score INTEGER NOT NULL DEFAULT 0,
  gut_type TEXT NOT NULL,
  secondary_gut_type TEXT,
  gut_type_explanation TEXT,
  root_causes JSONB DEFAULT '[]',
  digestive_pattern TEXT,
  key_habit_change TEXT,
  program_recommendation TEXT,
  healing_strategy JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. SUBSCRIPTIONS
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  plan_price INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. PAYMENTS
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  program_name TEXT NOT NULL,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. DETOX CHALLENGE PROGRESS
CREATE TABLE public.detox_challenge_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_name TEXT NOT NULL,
  day_number INTEGER NOT NULL CHECK (day_number >= 1),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  detox_drink_taken BOOLEAN NOT NULL DEFAULT false,
  functional_drink_taken BOOLEAN NOT NULL DEFAULT false,
  breakfast_completed BOOLEAN NOT NULL DEFAULT false,
  snack_completed BOOLEAN NOT NULL DEFAULT false,
  lunch_completed BOOLEAN NOT NULL DEFAULT false,
  evening_snack_completed BOOLEAN NOT NULL DEFAULT false,
  dinner_completed BOOLEAN NOT NULL DEFAULT false,
  post_dinner_drink_taken BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, program_name, day_number)
);

-- 6. MEAL PLANS (stored generated plans per user)
CREATE TABLE public.meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_name TEXT NOT NULL,
  diet_type TEXT NOT NULL CHECK (diet_type IN ('vegetarian', 'vegan', 'omnivore', 'pescatarian', 'keto', 'other')),
  day_number INTEGER NOT NULL CHECK (day_number >= 1),
  detox_drink JSONB NOT NULL DEFAULT '{}',
  functional_drink JSONB NOT NULL DEFAULT '{}',
  breakfast_complex_carb TEXT,
  breakfast_raw_vegetable TEXT,
  breakfast_cooked_vegetable TEXT,
  breakfast_protein TEXT,
  breakfast_dish_idea TEXT,
  mid_morning_snack TEXT,
  mid_morning_snack_benefit TEXT,
  lunch_grain TEXT,
  lunch_vegetable_dish TEXT,
  lunch_protein_dish TEXT,
  lunch_raw_salad TEXT,
  lunch_gut_benefit TEXT,
  evening_snack TEXT,
  evening_snack_benefit TEXT,
  dinner_meal TEXT,
  dinner_benefit TEXT,
  post_dinner_drink TEXT,
  post_dinner_solid TEXT,
  post_dinner_benefit TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, program_name, day_number)
);

-- 7. DAILY HABIT TRACKER
CREATE TABLE public.daily_habit_tracker (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tracking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  -- Hydration
  water_glasses INTEGER NOT NULL DEFAULT 0 CHECK (water_glasses >= 0),
  detox_drink_completed BOOLEAN NOT NULL DEFAULT false,
  -- Meals
  meal_compliance_pct INTEGER NOT NULL DEFAULT 0 CHECK (meal_compliance_pct >= 0 AND meal_compliance_pct <= 100),
  meal_photo_url TEXT,
  mindful_eating BOOLEAN NOT NULL DEFAULT false,
  -- Nutrition
  fiber_intake TEXT CHECK (fiber_intake IN ('low', 'moderate', 'high')),
  fermented_food_taken BOOLEAN NOT NULL DEFAULT false,
  -- Lifestyle
  stress_level TEXT CHECK (stress_level IN ('low', 'moderate', 'high', 'very_high')),
  sleep_hours NUMERIC(3,1) CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  step_count INTEGER DEFAULT 0 CHECK (step_count >= 0),
  exercise_minutes INTEGER DEFAULT 0 CHECK (exercise_minutes >= 0),
  -- Symptoms
  bloating_level TEXT CHECK (bloating_level IN ('none', 'mild', 'moderate', 'severe')),
  energy_level TEXT CHECK (energy_level IN ('low', 'moderate', 'high', 'very_high')),
  bowel_movement TEXT CHECK (bowel_movement IN ('none', 'irregular', 'normal', 'excellent')),
  skin_condition TEXT CHECK (skin_condition IN ('poor', 'fair', 'good', 'excellent')),
  -- Notes
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, tracking_date)
);

-- 8. GUT PROGRESS SCORES (daily computed scores)
CREATE TABLE public.gut_progress_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score_date DATE NOT NULL DEFAULT CURRENT_DATE,
  -- Sub-scores (each out of 20, total 100)
  hydration_score INTEGER NOT NULL DEFAULT 0 CHECK (hydration_score >= 0 AND hydration_score <= 20),
  nutrition_score INTEGER NOT NULL DEFAULT 0 CHECK (nutrition_score >= 0 AND nutrition_score <= 20),
  habit_compliance_score INTEGER NOT NULL DEFAULT 0 CHECK (habit_compliance_score >= 0 AND habit_compliance_score <= 20),
  activity_score INTEGER NOT NULL DEFAULT 0 CHECK (activity_score >= 0 AND activity_score <= 20),
  stress_balance_score INTEGER NOT NULL DEFAULT 0 CHECK (stress_balance_score >= 0 AND stress_balance_score <= 20),
  total_score INTEGER GENERATED ALWAYS AS (hydration_score + nutrition_score + habit_compliance_score + activity_score + stress_balance_score) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, score_date)
);

-- 9. WEEKLY REPORTS
CREATE TABLE public.weekly_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL CHECK (week_number >= 1),
  program_name TEXT NOT NULL,
  avg_gut_score NUMERIC(5,2),
  avg_hydration NUMERIC(5,2),
  avg_sleep NUMERIC(3,1),
  avg_stress TEXT,
  meal_compliance_avg NUMERIC(5,2),
  exercise_days INTEGER DEFAULT 0,
  symptom_trends JSONB DEFAULT '{}',
  highlights TEXT[] DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}',
  forecast_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, program_name, week_number)
);

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================
ALTER TABLE public.gut_age_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gut_assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detox_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_habit_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gut_progress_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES (users can only access their own data)
-- =============================================

-- Gut Age Test Results
CREATE POLICY "Users can view own gut age tests" ON public.gut_age_test_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own gut age tests" ON public.gut_age_test_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Gut Assessment Results
CREATE POLICY "Users can view own assessments" ON public.gut_assessment_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assessments" ON public.gut_assessment_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Payments
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Detox Challenge Progress
CREATE POLICY "Users can view own detox progress" ON public.detox_challenge_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own detox progress" ON public.detox_challenge_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own detox progress" ON public.detox_challenge_progress FOR UPDATE USING (auth.uid() = user_id);

-- Meal Plans
CREATE POLICY "Users can view own meal plans" ON public.meal_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meal plans" ON public.meal_plans FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily Habit Tracker
CREATE POLICY "Users can view own habits" ON public.daily_habit_tracker FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habits" ON public.daily_habit_tracker FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habits" ON public.daily_habit_tracker FOR UPDATE USING (auth.uid() = user_id);

-- Gut Progress Scores
CREATE POLICY "Users can view own progress scores" ON public.gut_progress_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress scores" ON public.gut_progress_scores FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Weekly Reports
CREATE POLICY "Users can view own weekly reports" ON public.weekly_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weekly reports" ON public.weekly_reports FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- TIMESTAMP TRIGGERS
-- =============================================
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_daily_habit_tracker_updated_at BEFORE UPDATE ON public.daily_habit_tracker FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_gut_age_test_user ON public.gut_age_test_results(user_id);
CREATE INDEX idx_gut_assessment_user ON public.gut_assessment_results(user_id);
CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_payments_user ON public.payments(user_id);
CREATE INDEX idx_detox_progress_user ON public.detox_challenge_progress(user_id);
CREATE INDEX idx_meal_plans_user ON public.meal_plans(user_id, program_name);
CREATE INDEX idx_daily_habit_user_date ON public.daily_habit_tracker(user_id, tracking_date);
CREATE INDEX idx_gut_progress_user_date ON public.gut_progress_scores(user_id, score_date);
CREATE INDEX idx_weekly_reports_user ON public.weekly_reports(user_id);
CREATE INDEX idx_payments_razorpay ON public.payments(razorpay_order_id);

-- =============================================
-- ANALYTICS FUNCTIONS
-- =============================================

-- Calculate daily gut reset score from habit tracker data
CREATE OR REPLACE FUNCTION public.calculate_daily_gut_score(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tracker daily_habit_tracker%ROWTYPE;
  v_hydration INTEGER := 0;
  v_nutrition INTEGER := 0;
  v_habits INTEGER := 0;
  v_activity INTEGER := 0;
  v_stress INTEGER := 0;
  v_total INTEGER := 0;
BEGIN
  SELECT * INTO v_tracker FROM daily_habit_tracker WHERE user_id = p_user_id AND tracking_date = p_date;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'No tracking data for this date');
  END IF;

  -- Hydration score (0-20)
  v_hydration := LEAST(20, (v_tracker.water_glasses * 2.5)::INTEGER);
  IF v_tracker.detox_drink_completed THEN v_hydration := LEAST(20, v_hydration + 5); END IF;

  -- Nutrition score (0-20)
  v_nutrition := (v_tracker.meal_compliance_pct * 0.12)::INTEGER;
  IF v_tracker.fiber_intake = 'high' THEN v_nutrition := v_nutrition + 4;
  ELSIF v_tracker.fiber_intake = 'moderate' THEN v_nutrition := v_nutrition + 2; END IF;
  IF v_tracker.fermented_food_taken THEN v_nutrition := v_nutrition + 2; END IF;
  IF v_tracker.mindful_eating THEN v_nutrition := v_nutrition + 2; END IF;
  v_nutrition := LEAST(20, v_nutrition);

  -- Habit compliance (0-20)
  v_habits := 0;
  IF v_tracker.detox_drink_completed THEN v_habits := v_habits + 5; END IF;
  IF v_tracker.meal_compliance_pct >= 80 THEN v_habits := v_habits + 5;
  ELSIF v_tracker.meal_compliance_pct >= 50 THEN v_habits := v_habits + 3; END IF;
  IF v_tracker.mindful_eating THEN v_habits := v_habits + 3; END IF;
  IF v_tracker.fermented_food_taken THEN v_habits := v_habits + 3; END IF;
  IF v_tracker.bowel_movement IN ('normal', 'excellent') THEN v_habits := v_habits + 4; END IF;
  v_habits := LEAST(20, v_habits);

  -- Activity score (0-20)
  v_activity := LEAST(10, (v_tracker.step_count / 1000)::INTEGER);
  v_activity := v_activity + LEAST(10, (v_tracker.exercise_minutes / 3)::INTEGER);
  v_activity := LEAST(20, v_activity);

  -- Stress balance (0-20)
  IF v_tracker.sleep_hours >= 7 THEN v_stress := 8;
  ELSIF v_tracker.sleep_hours >= 6 THEN v_stress := 5;
  ELSE v_stress := 2; END IF;
  
  IF v_tracker.stress_level = 'low' THEN v_stress := v_stress + 6;
  ELSIF v_tracker.stress_level = 'moderate' THEN v_stress := v_stress + 4;
  ELSIF v_tracker.stress_level = 'high' THEN v_stress := v_stress + 2; END IF;
  
  IF v_tracker.energy_level = 'very_high' THEN v_stress := v_stress + 6;
  ELSIF v_tracker.energy_level = 'high' THEN v_stress := v_stress + 4;
  ELSIF v_tracker.energy_level = 'moderate' THEN v_stress := v_stress + 2; END IF;
  v_stress := LEAST(20, v_stress);

  v_total := v_hydration + v_nutrition + v_habits + v_activity + v_stress;

  -- Upsert into gut_progress_scores
  INSERT INTO gut_progress_scores (user_id, score_date, hydration_score, nutrition_score, habit_compliance_score, activity_score, stress_balance_score)
  VALUES (p_user_id, p_date, v_hydration, v_nutrition, v_habits, v_activity, v_stress)
  ON CONFLICT (user_id, score_date) DO UPDATE SET
    hydration_score = EXCLUDED.hydration_score,
    nutrition_score = EXCLUDED.nutrition_score,
    habit_compliance_score = EXCLUDED.habit_compliance_score,
    activity_score = EXCLUDED.activity_score,
    stress_balance_score = EXCLUDED.stress_balance_score;

  RETURN jsonb_build_object(
    'total_score', v_total,
    'hydration', v_hydration,
    'nutrition', v_nutrition,
    'habits', v_habits,
    'activity', v_activity,
    'stress_balance', v_stress
  );
END;
$$;

-- Gut Recovery Forecast (analyzes past 7 days, predicts improvement)
CREATE OR REPLACE FUNCTION public.gut_recovery_forecast(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_avg_score NUMERIC;
  v_trend NUMERIC;
  v_current_score INTEGER;
  v_predicted_score INTEGER;
  v_days_to_target INTEGER;
  v_forecast_message TEXT;
  v_scores INTEGER[];
  v_count INTEGER;
BEGIN
  -- Get last 7 days of scores
  SELECT array_agg(total_score ORDER BY score_date), count(*), avg(total_score)
  INTO v_scores, v_count, v_avg_score
  FROM gut_progress_scores
  WHERE user_id = p_user_id AND score_date >= CURRENT_DATE - INTERVAL '7 days';

  IF v_count < 3 THEN
    RETURN jsonb_build_object(
      'forecast', 'Not enough data yet. Track at least 3 days for a forecast.',
      'data_points', v_count
    );
  END IF;

  v_current_score := v_scores[array_length(v_scores, 1)];
  
  -- Calculate daily trend (simple linear regression approximation)
  v_trend := (v_scores[array_length(v_scores, 1)] - v_scores[1])::NUMERIC / (v_count - 1);

  IF v_trend > 0 THEN
    -- Positive trend: estimate days to reach 85
    IF v_current_score >= 85 THEN
      v_forecast_message := 'Excellent! Your gut reset score is already at ' || v_current_score || '/100. Keep maintaining these habits!';
    ELSE
      v_days_to_target := CEIL((85 - v_current_score) / v_trend)::INTEGER;
      v_predicted_score := LEAST(100, (v_current_score + v_trend * 10)::INTEGER);
      v_forecast_message := 'If current habits continue, gut reset score may reach ' || v_predicted_score || ' within 10 days. Target of 85 estimated in ~' || v_days_to_target || ' days.';
    END IF;
  ELSIF v_trend = 0 THEN
    v_forecast_message := 'Your score has been steady at ' || v_current_score || '/100. Consider adding more variety to your diet and increasing activity for improvement.';
  ELSE
    v_forecast_message := 'Your score has been declining (currently ' || v_current_score || '/100). Focus on hydration, meal compliance, and stress management to reverse this trend.';
  END IF;

  RETURN jsonb_build_object(
    'current_score', v_current_score,
    'avg_7day', ROUND(v_avg_score, 1),
    'daily_trend', ROUND(v_trend, 2),
    'forecast', v_forecast_message,
    'data_points', v_count
  );
END;
$$;