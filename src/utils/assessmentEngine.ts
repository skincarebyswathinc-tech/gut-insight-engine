import { QuestionnaireResponse, AssessmentSummary, GutHealthScore, GutTypeAnalysis, GutTypeName, RootCauseAnalysis } from '@/types/assessment';

export function generateAssessment(r: QuestionnaireResponse): AssessmentSummary {
  const score = calculateScore(r);
  const gutType = classifyGutType(r);
  return {
    digestiveSymptoms: generateDigestive(r),
    eatingBehaviour: generateEating(r),
    lifestyle: generateLifestyle(r),
    dietPattern: generateDiet(r),
    score,
    gutType,
    rootCauses: analyzeRootCauses(r, score, gutType),
  };
}

function analyzeRootCauses(r: QuestionnaireResponse, score: GutHealthScore, gutType: GutTypeAnalysis): RootCauseAnalysis {
  // Score potential root causes
  const causes: { cause: string; detail: string; weight: number }[] = [];

  // Dietary causes
  if (r.processed_food === 'often' || r.processed_food === 'daily') {
    causes.push({ cause: 'High Processed Food Intake', detail: 'Processed foods contain emulsifiers, preservatives, and artificial additives that damage the gut lining and reduce beneficial bacteria diversity.', weight: 9 });
  }
  if (r.fiber_intake === 'low') {
    causes.push({ cause: 'Low Fiber Intake', detail: 'Your gut bacteria rely on fiber as fuel. Without enough, beneficial microbes starve and harmful ones can take over, leading to imbalance.', weight: 8 });
  }
  if (r.fruit_veg_servings < 3) {
    causes.push({ cause: 'Low Plant Diversity', detail: `At ${r.fruit_veg_servings} servings/day, your gut isn't getting enough prebiotic compounds and polyphenols needed to nourish a diverse microbiome.`, weight: 7 });
  }

  // Lifestyle causes
  if (r.stress_level === 'high' || r.stress_level === 'very_high') {
    causes.push({ cause: 'Chronic Stress', detail: 'Ongoing stress activates your fight-or-flight response, which slows digestion, increases gut permeability, and shifts your microbiome toward inflammatory species.', weight: 9 });
  }
  if (r.sleep_hours < 6) {
    causes.push({ cause: 'Sleep Deprivation', detail: `Getting only ${r.sleep_hours} hours disrupts your circadian rhythm, which directly controls gut motility and microbiome composition.`, weight: 8 });
  }
  if (r.water_intake < 5) {
    causes.push({ cause: 'Inadequate Hydration', detail: `At ${r.water_intake} glasses/day, your digestive system lacks the fluid needed for proper mucosal lining and stool formation.`, weight: 7 });
  }
  if (r.exercise_frequency === 'none') {
    causes.push({ cause: 'Sedentary Lifestyle', detail: 'Physical inactivity slows gut transit time, allowing harmful bacteria to linger longer and produce more toxins in the colon.', weight: 6 });
  }

  // Behavioural causes
  if (r.eating_speed === 'fast') {
    causes.push({ cause: 'Fast Eating Habits', detail: 'Eating too quickly bypasses proper chewing and enzyme release, sending larger food particles to the gut where they ferment and cause bloating.', weight: 5 });
  }
  if (r.late_night_eating) {
    causes.push({ cause: 'Late-Night Eating', detail: 'Eating close to bedtime forces your digestive system to work when it should be resting, disrupting your migrating motor complex and gut repair cycle.', weight: 5 });
  }
  if (!r.mindful_eating) {
    causes.push({ cause: 'Distracted Eating Patterns', detail: 'Eating without awareness reduces digestive enzyme production and can lead to overeating, putting extra strain on your gut.', weight: 4 });
  }

  // Symptom-based causes
  if (r.food_triggers.length >= 3) {
    causes.push({ cause: 'Multiple Food Sensitivities', detail: `Reacting to ${r.food_triggers.length} food groups suggests increased intestinal permeability, where partially digested proteins enter the bloodstream and trigger immune responses.`, weight: 8 });
  }

  // Sort and take top 3
  causes.sort((a, b) => b.weight - a.weight);
  const topCauses = causes.slice(0, 3).map(({ cause, detail }) => ({ cause, detail }));

  // If fewer than 3, pad with a generic one
  while (topCauses.length < 3) {
    topCauses.push({ cause: 'General Dietary Imbalance', detail: 'Small cumulative gaps in nutrition and habits can add up to affect your gut over time.' });
  }

  // Digestive pattern explanation
  const patternParts: string[] = [];
  patternParts.push(`Your digestive system is showing a ${gutType.primary.toLowerCase()} pattern.`);
  if (score.total < 50) {
    patternParts.push('Multiple areas of your health are contributing to digestive strain, creating a cycle where symptoms reinforce each other.');
  } else if (score.total < 70) {
    patternParts.push('While your foundation is decent, specific weak spots are creating a bottleneck in your digestive efficiency.');
  } else {
    patternParts.push('Your overall health supports good digestion, with just a few targeted areas that could unlock even better gut function.');
  }
  const digestivePatternExplanation = patternParts.join(' ');

  // Key habit change — pick the highest-weight actionable cause
  const habitMap: Record<string, string> = {
    'High Processed Food Intake': 'Start by replacing one processed meal per day with a whole-food alternative — this single swap can begin restoring your gut lining within weeks.',
    'Low Fiber Intake': 'Add one serving of beans, lentils, or whole grains to your daily meals — your beneficial bacteria will start responding within days.',
    'Chronic Stress': 'Introduce 5 minutes of deep breathing before meals — this activates your rest-and-digest mode and can immediately improve nutrient absorption.',
    'Sleep Deprivation': 'Prioritize getting to bed 30 minutes earlier tonight — even small sleep gains have a measurable impact on gut bacteria diversity.',
    'Inadequate Hydration': 'Start your morning with a large glass of water before anything else — hydrating first thing kick-starts your digestive system for the day.',
    'Low Plant Diversity': 'Add one new vegetable or fruit to your meals this week — gut diversity improves most when you eat a wider variety of plants.',
    'Sedentary Lifestyle': 'Take a 15-minute walk after your largest meal — this simple habit significantly improves gut transit and reduces bloating.',
    'Fast Eating Habits': 'Put your fork down between bites at your next meal — slowing down gives your stomach time to signal fullness and improves digestion.',
    'Late-Night Eating': 'Stop eating 3 hours before bedtime starting tonight — this gives your gut the overnight rest it needs for repair and cleanup.',
    'Multiple Food Sensitivities': 'Keep a simple food-symptom diary for one week — identifying your top trigger food is the fastest path to relief.',
  };

  const keyHabitChange = habitMap[topCauses[0].cause] || 'Focus on the most impactful change: improve one meal at a time with more whole foods and mindful eating.';

  return { topCauses, digestivePatternExplanation, keyHabitChange };
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
