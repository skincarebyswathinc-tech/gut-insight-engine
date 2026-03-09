export interface QuestionnaireResponse {
  // Digestive Symptoms
  bloating: 'never' | 'rarely' | 'sometimes' | 'often' | 'daily';
  bowel_regularity: 'regular' | 'mostly_regular' | 'irregular' | 'very_irregular';
  stool_consistency: 'hard' | 'normal' | 'loose' | 'variable';
  abdominal_pain: 'none' | 'mild' | 'moderate' | 'severe';
  reflux: boolean;
  excessive_gas: boolean;
  nausea: boolean;

  // Eating Behaviour
  meals_per_day: number;
  eating_speed: 'slow' | 'moderate' | 'fast';
  eating_environment: 'table' | 'desk' | 'couch' | 'on_the_go';
  mindful_eating: boolean;
  late_night_eating: boolean;

  // Lifestyle Factors
  stress_level: 'low' | 'moderate' | 'high' | 'very_high';
  sleep_hours: number;
  exercise_frequency: 'none' | '1-2_weekly' | '3-4_weekly' | '5+_weekly';
  water_intake: number; // glasses per day

  // Diet Pattern
  diet_type: 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'other';
  fruit_veg_servings: number;
  processed_food: 'rarely' | 'sometimes' | 'often' | 'daily';
  food_triggers: string[];
  fiber_intake: 'low' | 'moderate' | 'high';
}

export interface AssessmentSummary {
  digestiveSymptoms: string;
  eatingBehaviour: string;
  lifestyle: string;
  dietPattern: string;
  score: GutHealthScore;
  gutType: GutTypeAnalysis;
}

export type GutTypeName = 'Inflammatory Gut' | 'Sluggish Gut' | 'Dysbiosis Gut' | 'Stress Gut';

export interface GutTypeAnalysis {
  primary: GutTypeName;
  secondary: GutTypeName | null;
  explanation: string;
}

export interface GutHealthScore {
  total: number;
  digestiveHealth: number;
  dietQuality: number;
  lifestyleBalance: number;
  hydration: number;
  explanation: string;
}
