export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      daily_habit_tracker: {
        Row: {
          bloating_level: string | null
          bowel_movement: string | null
          created_at: string
          detox_drink_completed: boolean
          energy_level: string | null
          exercise_minutes: number | null
          fermented_food_taken: boolean
          fiber_intake: string | null
          id: string
          meal_compliance_pct: number
          meal_photo_url: string | null
          mindful_eating: boolean
          notes: string | null
          skin_condition: string | null
          sleep_hours: number | null
          step_count: number | null
          stress_level: string | null
          tracking_date: string
          updated_at: string
          user_id: string
          water_glasses: number
        }
        Insert: {
          bloating_level?: string | null
          bowel_movement?: string | null
          created_at?: string
          detox_drink_completed?: boolean
          energy_level?: string | null
          exercise_minutes?: number | null
          fermented_food_taken?: boolean
          fiber_intake?: string | null
          id?: string
          meal_compliance_pct?: number
          meal_photo_url?: string | null
          mindful_eating?: boolean
          notes?: string | null
          skin_condition?: string | null
          sleep_hours?: number | null
          step_count?: number | null
          stress_level?: string | null
          tracking_date?: string
          updated_at?: string
          user_id: string
          water_glasses?: number
        }
        Update: {
          bloating_level?: string | null
          bowel_movement?: string | null
          created_at?: string
          detox_drink_completed?: boolean
          energy_level?: string | null
          exercise_minutes?: number | null
          fermented_food_taken?: boolean
          fiber_intake?: string | null
          id?: string
          meal_compliance_pct?: number
          meal_photo_url?: string | null
          mindful_eating?: boolean
          notes?: string | null
          skin_condition?: string | null
          sleep_hours?: number | null
          step_count?: number | null
          stress_level?: string | null
          tracking_date?: string
          updated_at?: string
          user_id?: string
          water_glasses?: number
        }
        Relationships: []
      }
      detox_challenge_progress: {
        Row: {
          breakfast_completed: boolean
          created_at: string
          day_number: number
          detox_drink_taken: boolean
          dinner_completed: boolean
          evening_snack_completed: boolean
          functional_drink_taken: boolean
          id: string
          is_completed: boolean
          lunch_completed: boolean
          notes: string | null
          post_dinner_drink_taken: boolean
          program_name: string
          snack_completed: boolean
          user_id: string
        }
        Insert: {
          breakfast_completed?: boolean
          created_at?: string
          day_number: number
          detox_drink_taken?: boolean
          dinner_completed?: boolean
          evening_snack_completed?: boolean
          functional_drink_taken?: boolean
          id?: string
          is_completed?: boolean
          lunch_completed?: boolean
          notes?: string | null
          post_dinner_drink_taken?: boolean
          program_name: string
          snack_completed?: boolean
          user_id: string
        }
        Update: {
          breakfast_completed?: boolean
          created_at?: string
          day_number?: number
          detox_drink_taken?: boolean
          dinner_completed?: boolean
          evening_snack_completed?: boolean
          functional_drink_taken?: boolean
          id?: string
          is_completed?: boolean
          lunch_completed?: boolean
          notes?: string | null
          post_dinner_drink_taken?: boolean
          program_name?: string
          snack_completed?: boolean
          user_id?: string
        }
        Relationships: []
      }
      gut_age_test_results: {
        Row: {
          age_gap: number | null
          biological_age: number
          created_at: string
          gut_age: number
          id: string
          recommendations: string[] | null
          risk_factors: string[] | null
          user_id: string
        }
        Insert: {
          age_gap?: number | null
          biological_age: number
          created_at?: string
          gut_age: number
          id?: string
          recommendations?: string[] | null
          risk_factors?: string[] | null
          user_id: string
        }
        Update: {
          age_gap?: number | null
          biological_age?: number
          created_at?: string
          gut_age?: number
          id?: string
          recommendations?: string[] | null
          risk_factors?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      gut_assessment_results: {
        Row: {
          created_at: string
          diet_quality_score: number
          digestive_health_score: number
          digestive_pattern: string | null
          gut_score: number
          gut_type: string
          gut_type_explanation: string | null
          healing_strategy: Json | null
          hydration_score: number
          id: string
          key_habit_change: string | null
          lifestyle_balance_score: number
          program_recommendation: string | null
          questionnaire_data: Json
          root_causes: Json | null
          secondary_gut_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          diet_quality_score?: number
          digestive_health_score?: number
          digestive_pattern?: string | null
          gut_score: number
          gut_type: string
          gut_type_explanation?: string | null
          healing_strategy?: Json | null
          hydration_score?: number
          id?: string
          key_habit_change?: string | null
          lifestyle_balance_score?: number
          program_recommendation?: string | null
          questionnaire_data?: Json
          root_causes?: Json | null
          secondary_gut_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          diet_quality_score?: number
          digestive_health_score?: number
          digestive_pattern?: string | null
          gut_score?: number
          gut_type?: string
          gut_type_explanation?: string | null
          healing_strategy?: Json | null
          hydration_score?: number
          id?: string
          key_habit_change?: string | null
          lifestyle_balance_score?: number
          program_recommendation?: string | null
          questionnaire_data?: Json
          root_causes?: Json | null
          secondary_gut_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gut_progress_scores: {
        Row: {
          activity_score: number
          created_at: string
          habit_compliance_score: number
          hydration_score: number
          id: string
          nutrition_score: number
          score_date: string
          stress_balance_score: number
          total_score: number | null
          user_id: string
        }
        Insert: {
          activity_score?: number
          created_at?: string
          habit_compliance_score?: number
          hydration_score?: number
          id?: string
          nutrition_score?: number
          score_date?: string
          stress_balance_score?: number
          total_score?: number | null
          user_id: string
        }
        Update: {
          activity_score?: number
          created_at?: string
          habit_compliance_score?: number
          hydration_score?: number
          id?: string
          nutrition_score?: number
          score_date?: string
          stress_balance_score?: number
          total_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      meal_plans: {
        Row: {
          breakfast_complex_carb: string | null
          breakfast_cooked_vegetable: string | null
          breakfast_dish_idea: string | null
          breakfast_protein: string | null
          breakfast_raw_vegetable: string | null
          created_at: string
          day_number: number
          detox_drink: Json
          diet_type: string
          dinner_benefit: string | null
          dinner_meal: string | null
          evening_snack: string | null
          evening_snack_benefit: string | null
          functional_drink: Json
          id: string
          lunch_grain: string | null
          lunch_gut_benefit: string | null
          lunch_protein_dish: string | null
          lunch_raw_salad: string | null
          lunch_vegetable_dish: string | null
          mid_morning_snack: string | null
          mid_morning_snack_benefit: string | null
          post_dinner_benefit: string | null
          post_dinner_drink: string | null
          post_dinner_solid: string | null
          program_name: string
          user_id: string
        }
        Insert: {
          breakfast_complex_carb?: string | null
          breakfast_cooked_vegetable?: string | null
          breakfast_dish_idea?: string | null
          breakfast_protein?: string | null
          breakfast_raw_vegetable?: string | null
          created_at?: string
          day_number: number
          detox_drink?: Json
          diet_type: string
          dinner_benefit?: string | null
          dinner_meal?: string | null
          evening_snack?: string | null
          evening_snack_benefit?: string | null
          functional_drink?: Json
          id?: string
          lunch_grain?: string | null
          lunch_gut_benefit?: string | null
          lunch_protein_dish?: string | null
          lunch_raw_salad?: string | null
          lunch_vegetable_dish?: string | null
          mid_morning_snack?: string | null
          mid_morning_snack_benefit?: string | null
          post_dinner_benefit?: string | null
          post_dinner_drink?: string | null
          post_dinner_solid?: string | null
          program_name: string
          user_id: string
        }
        Update: {
          breakfast_complex_carb?: string | null
          breakfast_cooked_vegetable?: string | null
          breakfast_dish_idea?: string | null
          breakfast_protein?: string | null
          breakfast_raw_vegetable?: string | null
          created_at?: string
          day_number?: number
          detox_drink?: Json
          diet_type?: string
          dinner_benefit?: string | null
          dinner_meal?: string | null
          evening_snack?: string | null
          evening_snack_benefit?: string | null
          functional_drink?: Json
          id?: string
          lunch_grain?: string | null
          lunch_gut_benefit?: string | null
          lunch_protein_dish?: string | null
          lunch_raw_salad?: string | null
          lunch_vegetable_dish?: string | null
          mid_morning_snack?: string | null
          mid_morning_snack_benefit?: string | null
          post_dinner_benefit?: string | null
          post_dinner_drink?: string | null
          post_dinner_solid?: string | null
          program_name?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          payment_method: string | null
          program_name: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          status: string
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          payment_method?: string | null
          program_name: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          payment_method?: string | null
          program_name?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          gut_score: number | null
          id: string
          name: string
          program_purchased: string | null
          program_start_date: string | null
          signup_date: string
          subscription_status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string
          gut_score?: number | null
          id?: string
          name?: string
          program_purchased?: string | null
          program_start_date?: string | null
          signup_date?: string
          subscription_status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          gut_score?: number | null
          id?: string
          name?: string
          program_purchased?: string | null
          program_start_date?: string | null
          signup_date?: string
          subscription_status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          auto_renew: boolean
          created_at: string
          currency: string
          expires_at: string | null
          id: string
          plan_name: string
          plan_price: number
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_renew?: boolean
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          plan_name: string
          plan_price: number
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_renew?: boolean
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          plan_name?: string
          plan_price?: number
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_reports: {
        Row: {
          avg_gut_score: number | null
          avg_hydration: number | null
          avg_sleep: number | null
          avg_stress: string | null
          created_at: string
          exercise_days: number | null
          forecast_message: string | null
          highlights: string[] | null
          id: string
          meal_compliance_avg: number | null
          program_name: string
          recommendations: string[] | null
          symptom_trends: Json | null
          user_id: string
          week_number: number
        }
        Insert: {
          avg_gut_score?: number | null
          avg_hydration?: number | null
          avg_sleep?: number | null
          avg_stress?: string | null
          created_at?: string
          exercise_days?: number | null
          forecast_message?: string | null
          highlights?: string[] | null
          id?: string
          meal_compliance_avg?: number | null
          program_name: string
          recommendations?: string[] | null
          symptom_trends?: Json | null
          user_id: string
          week_number: number
        }
        Update: {
          avg_gut_score?: number | null
          avg_hydration?: number | null
          avg_sleep?: number | null
          avg_stress?: string | null
          created_at?: string
          exercise_days?: number | null
          forecast_message?: string | null
          highlights?: string[] | null
          id?: string
          meal_compliance_avg?: number | null
          program_name?: string
          recommendations?: string[] | null
          symptom_trends?: Json | null
          user_id?: string
          week_number?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_daily_gut_score: {
        Args: { p_date?: string; p_user_id: string }
        Returns: Json
      }
      gut_recovery_forecast: { Args: { p_user_id: string }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
