export interface GutAgeInput {
  actualAge: number;
  bloating: 'never' | 'rarely' | 'sometimes' | 'often' | 'daily';
  bowelRegularity: 'regular' | 'mostly_regular' | 'irregular' | 'very_irregular';
  stoolConsistency: 'hard' | 'normal' | 'loose' | 'variable';
  reflux: boolean;
  excessiveGas: boolean;
  fiberIntake: 'low' | 'moderate' | 'high';
  fruitVegServings: number;
  waterGlasses: number;
  stressLevel: 'low' | 'moderate' | 'high' | 'very_high';
  sleepHours: number;
  exerciseFrequency: 'none' | '1-2_weekly' | '3-4_weekly' | '5+_weekly';
  processedFood: 'rarely' | 'sometimes' | 'often' | 'daily';
  fermentedFoods: boolean;
}

export interface GutAgeResult {
  actualAge: number;
  gutAge: number;
  ageGap: number;
  reasons: string[];
  keyHabit: string;
  riskFactors: string[];
  recommendations: string[];
}

export function calculateGutAge(input: GutAgeInput): GutAgeResult {
  let modifier = 0; // positive = older gut, negative = younger gut
  const reasons: string[] = [];
  const riskFactors: string[] = [];
  const recommendations: string[] = [];

  // Digestive symptoms (+0 to +10)
  const bloatingMap = { never: 0, rarely: 1, sometimes: 2, often: 4, daily: 6 };
  modifier += bloatingMap[input.bloating];
  if (input.bloating === 'often' || input.bloating === 'daily') {
    reasons.push('Frequent bloating signals gut inflammation or imbalanced bacteria.');
    riskFactors.push('Chronic bloating');
  }

  const bowelMap = { regular: -2, mostly_regular: 0, irregular: 3, very_irregular: 5 };
  modifier += bowelMap[input.bowelRegularity];
  if (input.bowelRegularity === 'irregular' || input.bowelRegularity === 'very_irregular') {
    reasons.push('Irregular bowel movements suggest slow motility or dysbiosis.');
    riskFactors.push('Irregular bowel movements');
  }

  const stoolMap = { normal: -1, hard: 3, loose: 2, variable: 3 };
  modifier += stoolMap[input.stoolConsistency];
  if (input.stoolConsistency !== 'normal') {
    riskFactors.push('Abnormal stool consistency');
  }

  if (input.reflux) { modifier += 3; riskFactors.push('Acid reflux'); }
  if (input.excessiveGas) { modifier += 2; riskFactors.push('Excessive gas'); }

  // Fiber intake (-3 to +4)
  if (input.fiberIntake === 'high') { modifier -= 3; reasons.push('High fiber intake supports a diverse microbiome, keeping your gut younger.'); }
  else if (input.fiberIntake === 'low') { modifier += 4; reasons.push('Low fiber starves beneficial gut bacteria, accelerating gut aging.'); recommendations.push('Gradually increase fiber with oats, lentils, and vegetables'); }

  // Vegetable diversity (-3 to +3)
  if (input.fruitVegServings >= 5) { modifier -= 3; reasons.push('Excellent vegetable diversity nourishes a wide range of gut microbes.'); }
  else if (input.fruitVegServings >= 3) { modifier -= 1; }
  else { modifier += 3; reasons.push('Low vegetable intake limits microbiome diversity.'); recommendations.push('Aim for 5+ servings of varied fruits and vegetables daily'); }

  // Hydration (-2 to +4)
  if (input.waterGlasses >= 8) { modifier -= 2; }
  else if (input.waterGlasses >= 6) { modifier -= 1; }
  else if (input.waterGlasses <= 3) { modifier += 4; reasons.push('Dehydration slows digestion and impairs nutrient absorption.'); riskFactors.push('Low hydration'); recommendations.push('Drink at least 8 glasses of water daily'); }
  else { modifier += 2; }

  // Stress (-2 to +5)
  const stressMap = { low: -2, moderate: 1, high: 3, very_high: 5 };
  modifier += stressMap[input.stressLevel];
  if (input.stressLevel === 'high' || input.stressLevel === 'very_high') {
    reasons.push('High stress disrupts the gut-brain axis, weakening digestion and immunity.');
    riskFactors.push('High stress levels');
    recommendations.push('Practice daily stress-relief: deep breathing, walking, or meditation');
  }

  // Sleep (-2 to +4)
  if (input.sleepHours >= 7) { modifier -= 2; }
  else if (input.sleepHours >= 6) { modifier += 1; }
  else { modifier += 4; reasons.push('Poor sleep disrupts gut microbiome repair cycles.'); riskFactors.push('Insufficient sleep'); recommendations.push('Aim for 7-8 hours of quality sleep each night'); }

  // Exercise (-3 to +3)
  const exerciseMap = { '5+_weekly': -3, '3-4_weekly': -1, '1-2_weekly': 1, none: 3 };
  modifier += exerciseMap[input.exerciseFrequency];
  if (input.exerciseFrequency === 'none') {
    reasons.push('Sedentary lifestyle reduces gut motility and microbial diversity.');
    riskFactors.push('No regular exercise');
    recommendations.push('Start with 20-minute daily walks to stimulate digestion');
  }

  // Processed food (-2 to +4)
  const processedMap = { rarely: -2, sometimes: 0, often: 3, daily: 4 };
  modifier += processedMap[input.processedFood];
  if (input.processedFood === 'often' || input.processedFood === 'daily') {
    reasons.push('Processed foods contain additives that damage the gut lining.');
    riskFactors.push('High processed food intake');
  }

  // Fermented foods
  if (input.fermentedFoods) { modifier -= 2; reasons.push('Fermented foods actively replenish beneficial gut bacteria.'); }
  else { modifier += 1; recommendations.push('Add a daily serving of fermented food (yogurt, kimchi, or kefir)'); }

  const gutAge = Math.max(input.actualAge - 10, Math.min(input.actualAge + 20, input.actualAge + modifier));
  const ageGap = gutAge - input.actualAge;

  if (reasons.length === 0) {
    reasons.push('Your habits are well-balanced, keeping your gut close to your biological age.');
  }

  // Determine key habit
  let keyHabit = 'Add a daily serving of probiotic-rich fermented food like yogurt or kimchi.';
  if (input.waterGlasses <= 4) keyHabit = 'Start your day with a glass of warm lemon water and drink 8+ glasses daily.';
  else if (input.fiberIntake === 'low') keyHabit = 'Add 2 tablespoons of ground flaxseed or chia seeds to your morning meal.';
  else if (input.stressLevel === 'very_high') keyHabit = 'Practice 5 minutes of box breathing before each meal to activate rest-and-digest mode.';
  else if (input.exerciseFrequency === 'none') keyHabit = 'Take a 20-minute walk after dinner to stimulate digestion and gut motility.';
  else if (input.sleepHours < 6) keyHabit = 'Set a consistent bedtime and avoid screens 1 hour before sleep.';

  return {
    actualAge: input.actualAge,
    gutAge,
    ageGap,
    reasons,
    keyHabit,
    riskFactors,
    recommendations,
  };
}
