import { QuestionnaireResponse, AssessmentSummary, GutHealthScore, GutTypeAnalysis, GutTypeName } from '@/types/assessment';

export function generateAssessment(r: QuestionnaireResponse): AssessmentSummary {
  return {
    digestiveSymptoms: generateDigestive(r),
    eatingBehaviour: generateEating(r),
    lifestyle: generateLifestyle(r),
    dietPattern: generateDiet(r),
    score: calculateScore(r),
    gutType: classifyGutType(r),
  };
}

function classifyGutType(r: QuestionnaireResponse): GutTypeAnalysis {
  // Score each gut type pattern
  const scores: Record<GutTypeName, number> = {
    'Inflammatory Gut': 0,
    'Sluggish Gut': 0,
    'Dysbiosis Gut': 0,
    'Stress Gut': 0,
  };

  // Inflammatory: loose stools, reflux, food triggers, processed food
  if (r.stool_consistency === 'loose') scores['Inflammatory Gut'] += 3;
  if (r.reflux) scores['Inflammatory Gut'] += 2;
  if (r.abdominal_pain === 'moderate' || r.abdominal_pain === 'severe') scores['Inflammatory Gut'] += 3;
  if (r.food_triggers.length >= 2) scores['Inflammatory Gut'] += 2;
  if (r.processed_food === 'often' || r.processed_food === 'daily') scores['Inflammatory Gut'] += 2;

  // Sluggish: hard stool, irregular, low fiber, low exercise, low water
  if (r.stool_consistency === 'hard') scores['Sluggish Gut'] += 3;
  if (r.bowel_regularity === 'irregular' || r.bowel_regularity === 'very_irregular') scores['Sluggish Gut'] += 2;
  if (r.fiber_intake === 'low') scores['Sluggish Gut'] += 2;
  if (r.exercise_frequency === 'none') scores['Sluggish Gut'] += 2;
  if (r.water_intake < 5) scores['Sluggish Gut'] += 2;
  if (r.fruit_veg_servings < 3) scores['Sluggish Gut'] += 1;

  // Dysbiosis: bloating, gas, variable stool, processed food, low fiber
  if (r.bloating === 'often' || r.bloating === 'daily') scores['Dysbiosis Gut'] += 3;
  if (r.excessive_gas) scores['Dysbiosis Gut'] += 2;
  if (r.stool_consistency === 'variable') scores['Dysbiosis Gut'] += 2;
  if (r.processed_food === 'often' || r.processed_food === 'daily') scores['Dysbiosis Gut'] += 2;
  if (r.fiber_intake === 'low') scores['Dysbiosis Gut'] += 1;
  if (r.food_triggers.length >= 3) scores['Dysbiosis Gut'] += 2;

  // Stress Gut: high stress, poor sleep, nausea, variable/irregular, fast eating
  if (r.stress_level === 'high' || r.stress_level === 'very_high') scores['Stress Gut'] += 3;
  if (r.sleep_hours < 6) scores['Stress Gut'] += 2;
  if (r.nausea) scores['Stress Gut'] += 2;
  if (r.eating_speed === 'fast') scores['Stress Gut'] += 1;
  if (r.late_night_eating) scores['Stress Gut'] += 1;
  if (!r.mindful_eating) scores['Stress Gut'] += 1;
  if (r.bowel_regularity === 'irregular' || r.bowel_regularity === 'very_irregular') scores['Stress Gut'] += 1;

  const sorted = (Object.entries(scores) as [GutTypeName, number][]).sort((a, b) => b[1] - a[1]);
  const primary = sorted[0][0];
  const secondary = sorted[1][1] >= 3 && sorted[1][0] !== primary ? sorted[1][0] : null;

  const explanations: Record<GutTypeName, string> = {
    'Inflammatory Gut': `Your symptoms — including ${r.stool_consistency === 'loose' ? 'loose stools, ' : ''}${r.reflux ? 'acid reflux, ' : ''}${r.abdominal_pain !== 'none' ? 'abdominal pain, ' : ''}and sensitivity to certain foods — suggest your gut lining may be irritated. This pattern is often driven by processed foods, food intolerances, and inflammatory triggers that compromise the intestinal barrier.`,
    'Sluggish Gut': `Your digestive system appears to be moving slowly, based on ${r.stool_consistency === 'hard' ? 'hard stools, ' : ''}${r.bowel_regularity.includes('irregular') ? 'irregular bowel movements, ' : ''}and lower fiber and hydration levels. This pattern typically improves with more water, fiber-rich foods, and regular physical activity to stimulate gut motility.`,
    'Dysbiosis Gut': `Frequent bloating${r.excessive_gas ? ', excessive gas' : ''}, and variable digestive patterns suggest an imbalance in your gut bacteria. This can result from a diet high in processed foods and low in fiber-rich, prebiotic foods that feed beneficial microbes.`,
    'Stress Gut': `Your high stress levels${r.sleep_hours < 6 ? ', poor sleep' : ''}${r.nausea ? ', nausea' : ''}, and eating habits indicate that your gut-brain axis is under strain. Chronic stress disrupts gut motility and can alter the microbiome, leading to unpredictable digestive symptoms.`,
  };

  return { primary, secondary, explanation: explanations[primary] };
}

function calculateScore(r: QuestionnaireResponse): GutHealthScore {
  // Digestive Health: 0-30
  const bloatingScore: Record<string, number> = { never: 10, rarely: 8, sometimes: 5, often: 2, daily: 0 };
  const regularityScore: Record<string, number> = { regular: 8, mostly_regular: 6, irregular: 3, very_irregular: 0 };
  const consistencyScore: Record<string, number> = { normal: 6, hard: 3, loose: 2, variable: 1 };
  const painScore: Record<string, number> = { none: 6, mild: 4, moderate: 2, severe: 0 };

  const digestiveHealth = bloatingScore[r.bloating] + regularityScore[r.bowel_regularity]
    + consistencyScore[r.stool_consistency] + painScore[r.abdominal_pain]
    - (r.reflux ? 2 : 0) - (r.excessive_gas ? 2 : 0) - (r.nausea ? 2 : 0);

  // Diet Quality: 0-25
  const fiberScore: Record<string, number> = { high: 8, moderate: 5, low: 1 };
  const processedScore: Record<string, number> = { rarely: 7, sometimes: 5, often: 2, daily: 0 };
  const fvScore = Math.min(10, r.fruit_veg_servings * 2);

  const dietQuality = fiberScore[r.fiber_intake] + processedScore[r.processed_food] + fvScore;

  // Lifestyle Balance: 0-25
  const stressScore: Record<string, number> = { low: 8, moderate: 6, high: 3, very_high: 0 };
  const exerciseScore: Record<string, number> = { none: 0, '1-2_weekly': 4, '3-4_weekly': 7, '5+_weekly': 9 };
  const sleepScore = r.sleep_hours >= 7 ? 8 : r.sleep_hours >= 6 ? 5 : 2;

  const lifestyleBalance = stressScore[r.stress_level] + exerciseScore[r.exercise_frequency] + sleepScore;

  // Hydration: 0-20
  const hydration = Math.min(20, Math.round(r.water_intake * 2.5));

  const total = Math.max(0, Math.min(100, digestiveHealth + dietQuality + lifestyleBalance + hydration));

  let explanation: string;
  if (total >= 80) {
    explanation = `Your gut health score of ${total}/100 indicates excellent digestive wellness. Continue maintaining your current habits for optimal microbiome support.`;
  } else if (total >= 60) {
    explanation = `Your gut health score of ${total}/100 suggests a generally healthy digestive system with room for improvement. Focus on the lowest-scoring category to make the most impactful changes.`;
  } else if (total >= 40) {
    explanation = `Your gut health score of ${total}/100 indicates moderate digestive concerns that warrant attention. Consider dietary and lifestyle modifications targeting your weakest areas.`;
  } else {
    explanation = `Your gut health score of ${total}/100 suggests significant digestive health challenges. A comprehensive approach addressing diet, stress, and hydration is strongly recommended.`;
  }

  return {
    total,
    digestiveHealth: Math.max(0, digestiveHealth),
    dietQuality: Math.min(25, dietQuality),
    lifestyleBalance: Math.min(25, lifestyleBalance),
    hydration: Math.min(20, hydration),
    explanation,
  };
}

function generateDigestive(r: QuestionnaireResponse): string {
  const parts: string[] = [];

  const bloatingMap: Record<string, string> = {
    never: 'No bloating reported.',
    rarely: 'Occasional bloating with minimal impact.',
    sometimes: 'Intermittent bloating present — may indicate food sensitivities or dysbiosis.',
    often: 'Frequent bloating — suggestive of fermentation issues or SIBO risk.',
    daily: 'Daily bloating — warrants further investigation (SIBO, food intolerance panel).',
  };
  parts.push(bloatingMap[r.bloating]);

  const regularityMap: Record<string, string> = {
    regular: 'Bowel movements are regular and well-formed.',
    mostly_regular: 'Bowel movements mostly regular with occasional variation.',
    irregular: 'Irregular bowel habits — consider motility assessment.',
    very_irregular: 'Significant irregularity — evaluate for IBS or motility disorders.',
  };
  parts.push(regularityMap[r.bowel_regularity]);

  const consistencyMap: Record<string, string> = {
    hard: 'Stool consistency is hard — indicates possible dehydration or low fiber.',
    normal: 'Stool consistency within normal range (Bristol type 3-4).',
    loose: 'Loose stools reported — assess for malabsorption or inflammatory triggers.',
    variable: 'Variable stool consistency — suggestive of IBS-mixed type.',
  };
  parts.push(consistencyMap[r.stool_consistency]);

  if (r.abdominal_pain !== 'none') {
    parts.push(`Abdominal pain: ${r.abdominal_pain} severity.`);
  }

  const extras: string[] = [];
  if (r.reflux) extras.push('acid reflux/GERD symptoms');
  if (r.excessive_gas) extras.push('excessive flatulence');
  if (r.nausea) extras.push('nausea');
  if (extras.length) parts.push(`Additional symptoms: ${extras.join(', ')}.`);

  return parts.join(' ');
}

function generateEating(r: QuestionnaireResponse): string {
  const parts: string[] = [];

  parts.push(`Patient reports ${r.meals_per_day} meal(s) per day.`);

  const speedMap: Record<string, string> = {
    slow: 'Eating pace is slow — supports adequate chewing and digestion.',
    moderate: 'Eating pace is moderate.',
    fast: 'Fast eating pace — may impair mechanical digestion and satiety signaling.',
  };
  parts.push(speedMap[r.eating_speed]);

  const envMap: Record<string, string> = {
    table: 'Meals consumed at a table — conducive to mindful eating.',
    desk: 'Meals often consumed at desk — associated with distracted eating.',
    couch: 'Meals consumed on couch — moderate distraction risk.',
    on_the_go: 'Meals consumed on the go — high risk for poor digestion and overeating.',
  };
  parts.push(envMap[r.eating_environment]);

  if (!r.mindful_eating) parts.push('Low mindful eating awareness reported.');
  if (r.late_night_eating) parts.push('Late-night eating present — may exacerbate reflux and disrupt circadian rhythm.');

  return parts.join(' ');
}

function generateLifestyle(r: QuestionnaireResponse): string {
  const parts: string[] = [];

  const stressMap: Record<string, string> = {
    low: 'Stress levels are low — favorable for gut-brain axis function.',
    moderate: 'Moderate stress — monitor for stress-related GI symptoms.',
    high: 'High stress reported — significant impact on gut motility and permeability likely.',
    very_high: 'Very high stress — strong correlation with gut dysfunction; stress management intervention recommended.',
  };
  parts.push(stressMap[r.stress_level]);

  if (r.sleep_hours < 6) {
    parts.push(`Sleep duration is inadequate (${r.sleep_hours}h) — disrupts microbiome diversity.`);
  } else if (r.sleep_hours < 7) {
    parts.push(`Sleep duration is suboptimal (${r.sleep_hours}h).`);
  } else {
    parts.push(`Sleep duration is adequate (${r.sleep_hours}h).`);
  }

  const exerciseMap: Record<string, string> = {
    none: 'No regular physical activity — associated with slower GI transit.',
    '1-2_weekly': 'Light exercise (1-2x/week) — moderate benefit to gut motility.',
    '3-4_weekly': 'Regular exercise (3-4x/week) — supports healthy microbiome.',
    '5+_weekly': 'Active lifestyle (5+x/week) — excellent for gut health.',
  };
  parts.push(exerciseMap[r.exercise_frequency]);

  if (r.water_intake < 6) {
    parts.push(`Hydration is low (${r.water_intake} glasses/day) — may contribute to constipation.`);
  } else if (r.water_intake < 8) {
    parts.push(`Hydration is moderate (${r.water_intake} glasses/day).`);
  } else {
    parts.push(`Hydration is adequate (${r.water_intake} glasses/day).`);
  }

  return parts.join(' ');
}

function generateDiet(r: QuestionnaireResponse): string {
  const parts: string[] = [];

  parts.push(`Dietary pattern: ${r.diet_type}.`);

  if (r.fruit_veg_servings < 3) {
    parts.push(`Fruit/vegetable intake is low (${r.fruit_veg_servings} servings/day) — insufficient phytonutrient and prebiotic fiber diversity.`);
  } else if (r.fruit_veg_servings < 5) {
    parts.push(`Fruit/vegetable intake is moderate (${r.fruit_veg_servings} servings/day).`);
  } else {
    parts.push(`Fruit/vegetable intake is good (${r.fruit_veg_servings} servings/day) — supports microbiome diversity.`);
  }

  const processedMap: Record<string, string> = {
    rarely: 'Processed food consumption is minimal.',
    sometimes: 'Some processed food consumption — monitor for additives affecting gut lining.',
    often: 'Frequent processed food intake — may impair gut barrier integrity.',
    daily: 'Daily processed food consumption — high risk for dysbiosis and inflammation.',
  };
  parts.push(processedMap[r.processed_food]);

  const fiberMap: Record<string, string> = {
    low: 'Fiber intake is low — inadequate substrate for beneficial bacteria.',
    moderate: 'Fiber intake is moderate.',
    high: 'Fiber intake is high — supports SCFA production and colonic health.',
  };
  parts.push(fiberMap[r.fiber_intake]);

  if (r.food_triggers.length > 0) {
    parts.push(`Reported food triggers: ${r.food_triggers.join(', ')}.`);
  }

  return parts.join(' ');
}
