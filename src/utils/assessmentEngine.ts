import { QuestionnaireResponse, AssessmentSummary, GutHealthScore, GutTypeAnalysis, GutTypeName, RootCauseAnalysis, ProgramRecommendation, ProgramType, HealingStrategy, HealingPhase, DrinkDay, BreakfastDay, SnackDay, LunchDay, EveningSnackDay } from '@/types/assessment';

export function generateAssessment(r: QuestionnaireResponse): AssessmentSummary {
  const score = calculateScore(r);
  const gutType = classifyGutType(r);
  const programRecommendation = recommendProgram(r, score);
  return {
    digestiveSymptoms: generateDigestive(r),
    eatingBehaviour: generateEating(r),
    lifestyle: generateLifestyle(r),
    dietPattern: generateDiet(r),
    score,
    gutType,
    rootCauses: analyzeRootCauses(r, score, gutType),
    programRecommendation,
    healingStrategy: createHealingStrategy(r, gutType, programRecommendation),
    drinkPlan: generateDrinkPlan(programRecommendation, gutType),
    breakfastPlan: generateBreakfastPlan(r, programRecommendation),
    snackPlan: generateSnackPlan(programRecommendation, gutType),
    lunchPlan: generateLunchPlan(r, programRecommendation, gutType),
    eveningSnackPlan: generateEveningSnackPlan(programRecommendation, gutType),
  };
}

function generateEveningSnackPlan(program: ProgramRecommendation, gutType: GutTypeAnalysis): EveningSnackDay[] {
  const days = program.program === '28 Day Deep Gut Reset' ? 28 : 14;

  const snacks = [
    { snack: 'Roasted chana with cumin & black salt', benefit: 'High fiber curbs cravings; slow-digesting protein prevents dinner overeating' },
    { snack: 'Moong sprouts chaat with lemon & coriander', benefit: 'Prebiotic sprouts feed good bacteria; enzymes aid evening digestion' },
    { snack: 'Warm cumin-coriander herbal tea with roasted makhana', benefit: 'Carminative herbs ease bloating; makhana provides light satiety' },
    { snack: 'Soaked almonds & walnuts with a pinch of turmeric', benefit: 'Healthy fats stabilize blood sugar; turmeric reduces gut inflammation' },
    { snack: 'Clear vegetable soup (lauki, carrot, celery)', benefit: 'Warm broth soothes digestive tract; low calorie yet filling' },
    { snack: 'Roasted chana dal with curry leaves & ginger', benefit: 'Crunchy fiber satisfies hunger; curry leaves support liver detox' },
    { snack: 'Mixed sprouts salad with pomegranate & mint', benefit: 'Diverse fiber feeds microbiome; polyphenols reduce inflammation' },
    { snack: 'Fennel-ajwain herbal drink with roasted peanuts', benefit: 'Fennel relieves gas; ajwain stimulates digestive enzymes' },
    { snack: 'Pumpkin seeds & flax seeds trail mix', benefit: 'Zinc supports gut lining repair; omega-3s calm intestinal inflammation' },
    { snack: 'Warm tomato rasam soup', benefit: 'Tamarind & pepper boost metabolism; warm liquid prepares gut for dinner' },
    { snack: 'Roasted chana with jaggery & coconut flakes', benefit: 'Natural sweetness kills sugar cravings; coconut MCTs support gut barrier' },
    { snack: 'Cucumber & sprouts raita bowl', benefit: 'Probiotic curd + prebiotic sprouts for synbiotic gut support' },
    { snack: 'Ginger-tulsi herbal tea with dry fruit mix', benefit: 'Adaptogenic herbs reduce stress eating; nuts provide slow-release energy' },
    { snack: 'Light moong dal soup with black pepper', benefit: 'Easily digestible protein; piperine enhances nutrient absorption' },
  ];

  const typeBonus: Record<GutTypeName, string> = {
    'Inflammatory Gut': 'Anti-inflammatory ingredients calm evening gut irritation.',
    'Sluggish Gut': 'Fiber-rich snacks promote motility before the overnight rest period.',
    'Dysbiosis Gut': 'Prebiotic compounds support bacterial rebalancing during sleep.',
    'Stress Gut': 'Calming herbs reduce cortisol-driven evening cravings.',
  };

  const plan: EveningSnackDay[] = [];
  for (let d = 1; d <= days; d++) {
    const idx = (d - 1) % snacks.length;
    plan.push({
      day: d,
      snack: snacks[idx].snack,
      digestiveBenefit: `${snacks[idx].benefit}. ${typeBonus[gutType.primary]}`,
    });
  }
  return plan;
}

function generateLunchPlan(r: QuestionnaireResponse, program: ProgramRecommendation, gutType: GutTypeAnalysis): LunchDay[] {
  const days = program.program === '28 Day Deep Gut Reset' ? 28 : 14;
  const isVegan = r.diet_type === 'vegan';
  const isVegetarian = r.diet_type === 'vegetarian';

  const grains = [
    'Brown rice', 'Jowar roti', 'Bajra roti', 'Quinoa pulao',
    'Whole wheat roti', 'Ragi roti', 'Foxtail millet rice', 'Red rice',
    'Barley khichdi', 'Multi-millet roti', 'Amaranth roti', 'Little millet rice',
    'Kodo millet rice', 'Barnyard millet pulao',
  ];

  const vegDishes = [
    'Palak sabzi (spinach)', 'Lauki sabzi (bottle gourd)', 'Bhindi masala (okra)',
    'Mixed vegetable curry', 'Turai sabzi (ridge gourd)', 'Methi aloo (fenugreek leaves)',
    'Cabbage poriyal', 'Baingan bharta (eggplant)', 'Pumpkin sabzi', 'Beans & carrot stir-fry',
    'Drumstick sambar', 'Tender jackfruit curry', 'Parwal sabzi (pointed gourd)', 'Beetroot poriyal',
  ];

  const veganProteins = [
    'Moong dal tadka', 'Chana masala', 'Rajma curry', 'Masoor dal',
    'Sprouted moong salad', 'Toor dal', 'Black-eyed pea curry', 'Mixed dal',
    'Soya chunks curry', 'Whole green moong dal', 'Urad dal', 'Chana dal',
    'Kulthi dal (horse gram)', 'Moth bean curry',
  ];

  const vegProteins = [
    ...veganProteins.slice(0, 10),
    'Paneer bhurji', 'Curd/raita', 'Paneer tikka masala', 'Kadhi pakora',
  ];

  const nonVegProteins = [
    'Egg curry', 'Boiled egg with dal',
    ...veganProteins.slice(0, 12),
  ];

  const proteins = isVegan ? veganProteins : isVegetarian ? vegProteins : nonVegProteins;

  const salads = [
    'Cucumber, tomato & onion kachumber', 'Carrot & beetroot slaw with lemon',
    'Cabbage & coriander salad', 'Sprouts & pomegranate salad',
    'Radish & green chutney salad', 'Mixed greens with lime dressing',
    'Raw papaya & carrot salad', 'Onion & mint salad',
    'Mooli (radish) & cucumber salad', 'Tomato & raw mango salad',
    'Grated beetroot & coconut salad', 'Cabbage & peanut salad',
    'Sprouts & cucumber raita salad', 'Carrot & coriander slaw',
  ];

  const gutBenefits: Record<GutTypeName, string[]> = {
    'Inflammatory Gut': [
      'Anti-inflammatory spices soothe gut lining', 'Fiber reduces intestinal permeability',
      'Diverse vegetables lower inflammatory markers', 'Whole grains provide gentle, sustained energy',
    ],
    'Sluggish Gut': [
      'High fiber stimulates peristalsis', 'Millet grains promote bowel regularity',
      'Raw salad enzymes aid motility', 'Dal fiber feeds motility-boosting bacteria',
    ],
    'Dysbiosis Gut': [
      'Vegetable diversity feeds varied gut bacteria', 'Prebiotic fiber restores microbiome balance',
      'Lentils provide resistant starch for good bacteria', 'Raw salad enzymes support digestion',
    ],
    'Stress Gut': [
      'Balanced meal stabilizes blood sugar & cortisol', 'Magnesium-rich grains calm nervous system',
      'Fiber-rich dal supports serotonin production', 'Nutrient density supports gut-brain axis',
    ],
  };

  const benefits = gutBenefits[gutType.primary];
  const plan: LunchDay[] = [];

  for (let d = 1; d <= days; d++) {
    const idx = (d - 1) % 14;
    plan.push({
      day: d,
      mainGrain: grains[idx],
      vegetableDish: vegDishes[idx],
      proteinDish: proteins[idx],
      rawSalad: salads[idx],
      gutBenefit: benefits[(d - 1) % benefits.length],
    });
  }

  return plan;
}

function generateSnackPlan(program: ProgramRecommendation, gutType: GutTypeAnalysis): SnackDay[] {
  const days = program.program === '28 Day Deep Gut Reset' ? 28 : 14;

  // Gut-supportive Indian snacks
  const snacks = [
    { snack: 'Ripe papaya cubes with flax seeds', benefit: 'Papain enzyme aids protein digestion; flax provides prebiotic fiber' },
    { snack: 'Soaked almonds with fresh guava', benefit: 'Gut-friendly fats with vitamin C boost for collagen & skin health' },
    { snack: 'Coconut chunks with pumpkin seeds', benefit: 'MCTs support gut lining; zinc from seeds aids tissue repair' },
    { snack: 'Pomegranate arils with soaked almonds', benefit: 'Polyphenols feed beneficial bacteria; supports microbiome diversity' },
    { snack: 'Fresh papaya with coconut flakes', benefit: 'Digestive enzymes + lauric acid for antimicrobial gut support' },
    { snack: 'Guava slices with pumpkin seeds', benefit: 'High fiber for bowel regularity; seeds provide omega-3s for skin' },
    { snack: 'Mixed seeds bowl (flax, pumpkin, sunflower)', benefit: 'Omega fatty acids reduce inflammation; fiber feeds gut bacteria' },
    { snack: 'Soaked almonds with fresh coconut water', benefit: 'Hydrating electrolytes; almonds provide prebiotic fiber' },
    { snack: 'Papaya & pomegranate fruit bowl', benefit: 'Enzyme-rich papaya + antioxidant pomegranate for gut-skin axis' },
    { snack: 'Coconut yogurt with flax & pumpkin seeds', benefit: 'Probiotics + prebiotic fiber for complete microbiome support' },
    { snack: 'Fresh guava with soaked walnuts', benefit: 'Fiber-rich guava + omega-3 walnuts for brain-gut connection' },
    { snack: 'Papaya smoothie bowl with seeds', benefit: 'Blended enzymes for easy digestion; seeds add crunch & fiber' },
    { snack: 'Pomegranate raita with roasted flax', benefit: 'Probiotic curd + polyphenols + fiber for triple gut support' },
    { snack: 'Coconut & almond energy bites', benefit: 'Sustained energy release; healthy fats support hormone balance' },
  ];

  // Gut type specific benefits to append
  const typeBonus: Record<GutTypeName, string> = {
    'Inflammatory Gut': 'Cooling & anti-inflammatory properties soothe irritated gut.',
    'Sluggish Gut': 'Fiber content stimulates peristalsis and promotes regularity.',
    'Dysbiosis Gut': 'Prebiotic compounds help restore healthy bacterial balance.',
    'Stress Gut': 'Magnesium-rich seeds calm nervous system and gut-brain axis.',
  };

  const plan: SnackDay[] = [];

  for (let d = 1; d <= days; d++) {
    const idx = (d - 1) % snacks.length;
    const baseSnack = snacks[idx];
    plan.push({
      day: d,
      snack: baseSnack.snack,
      keyBenefit: `${baseSnack.benefit}. ${typeBonus[gutType.primary]}`,
    });
  }

  return plan;
}

function generateBreakfastPlan(r: QuestionnaireResponse, program: ProgramRecommendation): BreakfastDay[] {
  const days = program.program === '28 Day Deep Gut Reset' ? 28 : 14;
  const isVegan = r.diet_type === 'vegan';
  const isVegetarian = r.diet_type === 'vegetarian';
  const allowsEgg = !isVegan && !isVegetarian;

  // Complex carbs (25%)
  const carbs = [
    'Poha (flattened rice)',
    'Upma (semolina)',
    'Ragi dosa',
    'Brown rice idli',
    'Oats porridge',
    'Jowar roti',
    'Bajra khichdi',
    'Quinoa pulao',
    'Sweet potato',
    'Whole wheat paratha',
  ];

  // Raw vegetables/salads (25%)
  const rawVegs = [
    'Cucumber & tomato salad',
    'Carrot & beetroot slaw',
    'Cabbage & onion salad',
    'Radish & coriander salad',
    'Sprouts salad',
    'Mixed greens with lemon',
    'Raw papaya salad',
    'Cucumber raita base',
    'Tomato & onion kachumber',
    'Grated carrot with lime',
  ];

  // Cooked vegetables (25%)
  const cookedVegs = [
    'Sautéed spinach (palak)',
    'Lauki (bottle gourd) sabzi',
    'Steamed broccoli',
    'Stir-fried beans',
    'Turai (ridge gourd) sabzi',
    'Methi leaves stir-fry',
    'Bhindi (okra) dry',
    'Pumpkin sabzi',
    'Cabbage poriyal',
    'Mixed vegetable curry',
  ];

  // Proteins based on diet (25%)
  const veganProteins = [
    'Moong dal chilla',
    'Chickpea salad',
    'Sprouted moong',
    'Tofu scramble',
    'Chana masala',
    'Rajma (kidney beans)',
    'Black-eyed peas',
    'Masoor dal',
    'Soya chunks',
    'Mixed dal',
  ];

  const vegProteins = [
    ...veganProteins.slice(0, 7),
    'Paneer bhurji',
    'Cottage cheese cubes',
    'Curd/yogurt bowl',
  ];

  const nonVegProteins = [
    'Boiled egg',
    'Egg bhurji',
    'Omelette with veggies',
    ...veganProteins.slice(0, 7),
  ];

  const proteins = isVegan ? veganProteins : isVegetarian ? vegProteins : nonVegProteins;

  // Dish ideas combining all elements
  const veganDishes = [
    'Moong dal chilla with sautéed greens & salad',
    'Oats upma with tofu & raw veggies',
    'Ragi dosa with sambar & cucumber salad',
    'Quinoa bowl with chickpeas & steamed veggies',
    'Poha with sprouted moong & carrot slaw',
    'Jowar roti with dal & palak sabzi',
    'Sweet potato chaat with chana & raw salad',
    'Bajra khichdi with mixed dal & lauki',
    'Idli with sambar, coconut chutney & salad',
    'Upma with soya chunks & stir-fried beans',
  ];

  const vegDishes = [
    'Paneer bhurji paratha with salad & sabzi',
    'Poha with curd & cucumber salad',
    'Ragi dosa with paneer & palak',
    'Oats with yogurt, nuts & raw veggies',
    'Idli with sambar & carrot slaw',
    'Upma with cottage cheese & steamed broccoli',
    'Chilla with curd & mixed salad',
    'Quinoa pulao with paneer & beans sabzi',
    'Sweet potato with yogurt & sprouts',
    'Paratha with dal & bhindi dry',
  ];

  const nonVegDishes = [
    'Egg bhurji with paratha & salad',
    'Boiled eggs with poha & veggies',
    'Omelette with roti & palak sabzi',
    'Idli with egg curry & cucumber salad',
    'Upma with boiled egg & raw salad',
    'Quinoa with egg & steamed veggies',
    'Sweet potato with egg & sprouts salad',
    'Oats with egg whites & carrot slaw',
    'Dosa with egg roast & cabbage salad',
    'Bajra roti with egg bhurji & sabzi',
  ];

  const dishes = isVegan ? veganDishes : isVegetarian ? vegDishes : nonVegDishes;

  const plan: BreakfastDay[] = [];

  for (let d = 1; d <= days; d++) {
    const idx = (d - 1) % 10;
    plan.push({
      day: d,
      complexCarb: carbs[idx],
      rawVegetable: rawVegs[idx],
      cookedVegetable: cookedVegs[idx],
      protein: proteins[idx],
      dishIdea: dishes[idx],
    });
  }

  return plan;
}

function generateDrinkPlan(program: ProgramRecommendation, gutType: GutTypeAnalysis): DrinkDay[] {
  const days = program.program === '28 Day Deep Gut Reset' ? 28 : 14;

  // Morning detox drinks rotation
  const morningDrinks = [
    { name: 'CCF Detox Water', ingredients: 'Cumin, coriander, fennel seeds steeped in warm water', benefit: 'digestive fire' },
    { name: 'Ginger Lemon Elixir', ingredients: 'Fresh ginger, lemon juice, warm water, pinch of turmeric', benefit: 'metabolism boost' },
    { name: 'Mint Coriander Cleanser', ingredients: 'Fresh mint, coriander leaves, cumin, warm water', benefit: 'toxin elimination' },
    { name: 'Turmeric Ginger Shot', ingredients: 'Fresh turmeric, ginger, black pepper, lemon, warm water', benefit: 'anti-inflammatory' },
    { name: 'Fennel Fenugreek Tonic', ingredients: 'Fennel seeds, fenugreek seeds soaked overnight, strained water', benefit: 'blood sugar balance' },
    { name: 'Curry Leaf Detox', ingredients: 'Fresh curry leaves, cumin, ginger, warm water', benefit: 'liver detox' },
    { name: 'Ash Gourd Cleanse', ingredients: 'Fresh ash gourd juice, mint, cumin powder', benefit: 'cooling detox' },
  ];

  // Functional drinks rotation
  const functionalDrinks = [
    { name: 'Gut Soothing Lassi', ingredients: 'Fresh yogurt, roasted cumin, mint, rock salt', benefit: 'probiotic support' },
    { name: 'Digestive Buttermilk', ingredients: 'Buttermilk, curry leaves, ginger, asafoetida', benefit: 'digestive enzyme' },
    { name: 'Golden Turmeric Milk', ingredients: 'Warm milk/plant milk, turmeric, black pepper, ginger', benefit: 'gut lining repair' },
    { name: 'Fennel Coriander Cooler', ingredients: 'Fennel water, coriander, mint, jaggery', benefit: 'bloating relief' },
    { name: 'Fenugreek Digestive Aid', ingredients: 'Fenugreek water, ginger, lemon, honey', benefit: 'metabolic health' },
    { name: 'Mint Ginger Refresher', ingredients: 'Fresh mint, ginger, lemon, cumin, cold water', benefit: 'gut motility' },
    { name: 'Curry Leaf Buttermilk', ingredients: 'Buttermilk, curry leaves, green chili, coriander', benefit: 'microbiome balance' },
  ];

  // Benefits based on gut type
  const typebenefits: Record<GutTypeName, string[]> = {
    'Inflammatory Gut': ['Soothes inflamed gut lining', 'Reduces intestinal irritation', 'Cools digestive fire', 'Supports barrier repair'],
    'Sluggish Gut': ['Stimulates digestive fire', 'Promotes bowel movement', 'Enhances gut motility', 'Improves nutrient absorption'],
    'Dysbiosis Gut': ['Feeds beneficial bacteria', 'Reduces harmful bacterial overgrowth', 'Restores microbiome balance', 'Supports probiotic colonization'],
    'Stress Gut': ['Calms nervous system', 'Supports gut-brain axis', 'Reduces stress-related inflammation', 'Promotes parasympathetic activation'],
  };

  const benefits = typebenefits[gutType.primary];
  const plan: DrinkDay[] = [];

  for (let d = 1; d <= days; d++) {
    const morningIdx = (d - 1) % morningDrinks.length;
    const funcIdx = (d - 1) % functionalDrinks.length;
    const benefitIdx = (d - 1) % benefits.length;

    const morning = morningDrinks[morningIdx];
    const functional = functionalDrinks[funcIdx];

    plan.push({
      day: d,
      morningDetox: { name: morning.name, ingredients: morning.ingredients },
      functionalDrink: { name: functional.name, ingredients: functional.ingredients },
      benefits: `${morning.benefit.charAt(0).toUpperCase() + morning.benefit.slice(1)}, ${functional.benefit}, ${benefits[benefitIdx].toLowerCase()}`,
    });
  }

  return plan;
}

function createHealingStrategy(r: QuestionnaireResponse, gutType: GutTypeAnalysis, program: ProgramRecommendation): HealingStrategy {
  const is28Day = program.program === '28 Day Deep Gut Reset';
  const dietLabel = r.diet_type.charAt(0).toUpperCase() + r.diet_type.slice(1);

  // Phase durations based on program length
  const durations = is28Day
    ? ['Days 1-7', 'Days 8-18', 'Days 19-28']
    : ['Days 1-4', 'Days 5-10', 'Days 11-14'];

  // Tailor focus areas based on gut type
  const typeSpecific: Record<GutTypeName, { calmFocus: string; repairFocus: string; restoreFocus: string }> = {
    'Inflammatory Gut': {
      calmFocus: 'removing inflammatory triggers and soothing the gut lining with anti-inflammatory foods',
      repairFocus: 'rebuilding intestinal barrier integrity with targeted nutrients like L-glutamine and zinc',
      restoreFocus: 'introducing diverse anti-inflammatory bacteria strains to establish immune balance',
    },
    'Sluggish Gut': {
      calmFocus: 'hydrating the digestive tract and establishing regular bowel patterns',
      repairFocus: 'stimulating motility through fiber progression and digestive enzyme support',
      restoreFocus: 'populating with motility-enhancing bacteria and establishing long-term regularity',
    },
    'Dysbiosis Gut': {
      calmFocus: 'reducing bacterial overgrowth by limiting fermentable substrates temporarily',
      repairFocus: 'selectively feeding beneficial bacteria while starving harmful species',
      restoreFocus: 'diversifying the microbiome with targeted prebiotics and probiotics',
    },
    'Stress Gut': {
      calmFocus: 'activating the parasympathetic nervous system through mindful eating and stress reduction',
      repairFocus: 'restoring gut-brain axis communication with nervine herbs and targeted nutrients',
      restoreFocus: 'building resilience with psychobiotic strains that modulate stress response',
    },
  };

  const specific = typeSpecific[gutType.primary];

  const overview = `This ${is28Day ? '28-day' : '14-day'} ${dietLabel}-friendly protocol is designed for your ${gutType.primary.toLowerCase()} pattern. Each phase builds systematically on the last, moving from calming acute symptoms to deep cellular repair to lasting microbiome restoration.`;

  const phases: [HealingPhase, HealingPhase, HealingPhase] = [
    {
      name: 'Phase 1: Gut Calm',
      duration: durations[0],
      focus: `Primary focus: ${specific.calmFocus}. This foundational phase removes irritants and creates the conditions for healing.`,
      digestion: 'Acute symptoms like bloating, gas, and discomfort begin to subside as inflammatory triggers are removed and the digestive system gets a chance to rest.',
      skin: 'Early improvements in skin clarity as the gut-skin axis begins to calm; reduced redness and breakouts often appear within the first week.',
      metabolism: 'Blood sugar stabilization begins as processed foods are eliminated; initial energy improvements as digestive burden decreases.',
      inflammation: 'Systemic inflammation markers start declining as dietary triggers are removed and the gut lining is no longer constantly irritated.',
    },
    {
      name: 'Phase 2: Gut Repair',
      duration: durations[1],
      focus: `Primary focus: ${specific.repairFocus}. This phase provides the building blocks your gut needs to rebuild its protective barrier.`,
      digestion: 'Bowel regularity improves significantly; nutrient absorption increases as the intestinal lining heals and tight junctions are restored.',
      skin: 'Deeper skin healing as improved nutrient absorption delivers more vitamins and minerals to skin cells; collagen synthesis support.',
      metabolism: 'Metabolic efficiency improves as the gut begins properly signaling hunger and satiety hormones; weight regulation normalizes.',
      inflammation: 'Gut permeability decreases, reducing the leakage of inflammatory compounds into the bloodstream; joint and muscle comfort often improves.',
    },
    {
      name: 'Phase 3: Microbiome Restore',
      duration: durations[2],
      focus: `Primary focus: ${specific.restoreFocus}. This phase establishes a diverse, resilient microbiome for long-term health.`,
      digestion: 'Digestive confidence returns; ability to tolerate a wider variety of foods as the microbiome becomes more robust and adaptable.',
      skin: 'Lasting skin improvements as a healthy microbiome produces beneficial postbiotics that support skin barrier function and reduce sensitivity.',
      metabolism: 'Optimized metabolic flexibility as diverse gut bacteria improve insulin sensitivity and fat metabolism; sustained energy throughout the day.',
      inflammation: 'Long-term immune modulation as beneficial bacteria train the immune system to respond appropriately; reduced reactivity to environmental triggers.',
    },
  ];

  return { overview, phases };
}

function recommendProgram(r: QuestionnaireResponse, score: GutHealthScore): ProgramRecommendation {
  // Symptom severity indicators
  const severeSymptoms =
    r.bloating === 'daily' ||
    r.abdominal_pain === 'severe' ||
    r.bowel_regularity === 'very_irregular' ||
    r.food_triggers.length >= 4;

  const moderateSymptoms =
    r.bloating === 'often' ||
    r.abdominal_pain === 'moderate' ||
    r.stool_consistency === 'variable' ||
    r.food_triggers.length >= 2;

  // Lifestyle factors that slow healing
  const challengingLifestyle =
    r.stress_level === 'very_high' ||
    r.sleep_hours < 5 ||
    (r.processed_food === 'daily' && r.fiber_intake === 'low');

  // Decision logic
  const needs28Day = score.total < 50 || severeSymptoms || (moderateSymptoms && challengingLifestyle);

  const program: ProgramType = needs28Day ? '28 Day Deep Gut Reset' : '14 Day Gut Reset';

  let durationReason: string;
  let expectedImprovements: string[];

  if (needs28Day) {
    durationReason = score.total < 50
      ? `With a gut health score of ${score.total}/100, your digestive system needs extended support for meaningful repair. The 28-day program allows time for your gut lining to heal, beneficial bacteria to repopulate, and new habits to become automatic.`
      : `Your symptom pattern shows deeper imbalances that require a longer reset window. The 28-day duration ensures we address root causes rather than just suppressing symptoms, giving your microbiome the full cycle it needs to rebalance.`;

    expectedImprovements = [
      'Week 1: Reduced bloating and initial digestive comfort as inflammatory foods are removed',
      'Week 2: More regular bowel movements and improved energy levels',
      'Week 3: Noticeable reduction in food sensitivities and clearer thinking',
      'Week 4: Stabilized digestion, better sleep quality, and sustainable eating patterns established',
    ];
  } else {
    durationReason = `Your gut health score of ${score.total}/100 indicates a solid foundation with targeted areas for improvement. The 14-day program is ideal for a focused reset that addresses your specific imbalances without requiring an extended commitment.`;

    expectedImprovements = [
      'Days 1-5: Digestive system begins to calm, early reduction in bloating and discomfort',
      'Days 6-10: Energy levels improve, bowel regularity increases, initial microbiome shifts occur',
      'Days 11-14: Solidified habits, clearer understanding of your trigger foods, and noticeable overall improvement in gut function',
    ];
  }

  return { program, durationReason, expectedImprovements };
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
