// Constants and cut-offs used by the calculators.
//
// Values come from "Handy Pediatric Notes" (2015 PDF supplied by the doctor).
// `source.page` is the PDF page and `source.text` copies what the page says,
// so the reviewer can compare it with the structured values beside it.
// `flags` lists problems found in the PDF (typos, missing or contradictory
// values) and every value taken from a standard reference instead.
//
// No clinical numbers live in calc.js: it only applies the values below.
// EVERY entry MUST be checked by the doctor. Set `verified: true` only after
// sign-off; unverified tools show a warning banner. review.html renders this
// file for that review.

export const FORMULAS = {
  hollidaySegar: {
    name: 'Maintenance fluids (Holliday–Segar)',
    verified: false,
    formula: 'Daily: 100 mL/kg for the first 10 kg, + 50 mL/kg for 10–20 kg, + 20 mL/kg above 20 kg. Hourly: 4-2-1 rule.',
    source: { page: 95, text: '1–10 kg: 100 ml/kg; 10–20: 1000 + 50 ml/kg for each kg >10; >20: 1500 + 20 ml/kg for each kg >20. Rate: 0–10: 4 ml/kg/hr; 10–20: 40 ml/hr + 2 ml/kg/hr x wt; >20: 60 ml/hr + 1 ml/kg/hr x wt' },
    flags: [
      'The PDF hourly rule says "+ 2 ml/kg/hr x wt"; the standard rule counts only the kg above 10 (and above 20). The app uses the standard rule.',
      'The PDF gives no adult cap. Many references cap maintenance at about 2,400 mL/day (100 mL/h); the app shows this as a note, it does not cap.',
    ],
    daily: [
      { overKg: 0, base: 0, perKg: 100 },
      { overKg: 10, base: 1000, perKg: 50 },
      { overKg: 20, base: 1500, perKg: 20 },
    ],
    hourly: [
      { overKg: 0, base: 0, perKg: 4 },
      { overKg: 10, base: 40, perKg: 2 },
      { overKg: 20, base: 60, perKg: 1 },
    ],
    noteAboveMlDay: 2400,
    fluid: { text: 'Usual fluid D5 0.3 NaCl; D5 LR if more than 40 kg (p. 94).', d5lrAboveKg: 40 },
  },

  dehydrationFluids: {
    name: 'Dehydration replacement (IV)',
    verified: false,
    formula: 'Volume = mL/kg for severity and age × weight, run over 6–8 h.',
    source: { page: 94, text: 'Mild: <2 yo 50cc/kg, >2 yo 30cc/kg; Moderate: 100 / 60cc/kg; Severe: 150 / 90cc/kg. To run for 6 – 8 hrs then refer. Usual fluid is D5 0.3 NaCl; if however more than 40 kg then D5 LR. In fluid resuscitation: use 20cc/kg as bolus. Usually PLR' },
    flags: ['The PDF says "<2 yo" and ">2 yo"; the app treats exactly 2 years as the older group.'],
    ageSplitMonths: 24,
    mlPerKg: {
      mild: { young: 50, old: 30 },
      moderate: { young: 100, old: 60 },
      severe: { young: 150, old: 90 },
    },
    hours: [6, 8],
    bolusMlPerKg: 20,
    d5lrAboveKg: 40,
  },

  ors: {
    name: 'ORS: Plans A, B and C',
    verified: false,
    formula: 'Plan A: ORS per loose stool by age. Plan B: 75 mL/kg. Plan C (IV): 30 mL/kg then 70 mL/kg.',
    source: { page: 94, text: 'PLAN A: AGE / Amount ORS to give per loose stool: 50 – 100 ml; 100 – 200 ml; As much as wanted. PLAN B: Amount of ORS to give in 1st 24 hrs: Weight (kg) x 75ml/kg. PLAN C: 30ml/kg then 70ml/kg; Infants (<1 yo) 1 hr then 5 hrs; Children (>1 yo) 30 mins then 2.5 hrs' },
    flags: [
      'Plan A: the PDF lost its age column. The app uses the WHO bands: under 2 yr, 2–10 yr, over 10 yr.',
      'Plan B: the PDF says "in 1st 24 hrs"; WHO gives 75 mL/kg over the first 4 hours. The app says 4 hours.',
    ],
    planA: [
      { underMonths: 24, text: '50–100 mL after each loose stool' },
      { underMonths: 120, text: '100–200 mL after each loose stool' },
      { underMonths: Infinity, text: 'As much as wanted' },
    ],
    planB: { mlPerKg: 75, hours: 4 },
    planC: {
      first: { mlPerKg: 30 }, second: { mlPerKg: 70 },
      infantUnderMonths: 12,
      infant: { firstHours: 1, secondHours: 5 },
      child: { firstHours: 0.5, secondHours: 2.5 },
    },
  },

  nicuFluids: {
    name: 'NICU total fluid intake (TFI)',
    verified: false,
    formula: 'IV rate (mL/h) = (TFI − feeds ÷ weight) × weight ÷ 24.',
    source: { page: 57, text: 'TFI: Preterm: start at 60 cckd; Term: start at 80 cckd. To check TFI = rate x 24 ÷ wt. Day 2/3: increase TFI by 10-20 (depends on AP). If feeding already: Total volume of milk ÷ wt = cc/kg/day. Subtract this amount to TFI to get value for IV. ex. MF 3cc q3hrs = 24 cc in 24 hrs; 24 ÷ 1.129 = 21.2 cckd from milk; 80 – 21.2 = 58.8cckd; 58.8 x 1.129 ÷ 24 = rate' },
    flags: [
      'The Day 1 example uses 1.219 kg instead of 1.129 kg ("60 x 1.219 ÷ 24 = 3.1"). 60 × 1.129 ÷ 24 = 2.8 mL/h.',
      'The PDF says "if Dr. Reinoso, divide by 2 before subtracting" (a consultant preference). The app leaves it out.',
    ],
    startTfi: { preterm: 60, term: 80 },
    dailyIncrease: [10, 20],
  },

  dextrose: {
    name: 'Dextrose mixing (D50 + D5)',
    verified: false,
    formula: 'D50 volume = total volume × (desired % − 5) ÷ (50 − 5). The rest is the D5 solution.',
    source: { page: 57, text: 'to get factor: Desired – D5 / D50 – D5. D7.5 = 0.055; D10 = 0.11; D12.5 = 0.166; D15 = 0.22; D17.5 = 0.28. Limits of Dextrosity: Peripheral line = D12; Central line = D20' },
    flags: ['The PDF rounds the factors (D10 = 0.11). The app uses the exact factor (D10 = 0.111).'],
    low: 5, high: 50,
    maxPeripheral: 12, maxCentral: 20,
  },

  gir: {
    name: 'Glucose infusion rate (GIR)',
    verified: false,
    formula: 'GIR (mg/kg/min) = dextrose % × rate (mL/h) × 10 ÷ 60 ÷ weight.',
    source: { page: 59, text: 'Glucose Infusion Rate: Dextrosity x IVF rate x 10 ÷ 10 / Wt. Ex. 10 kg; IVF D10 IMB at 40cc/h. GIR = 10 x 10 x 40 ÷ 10 / 60 = 6.6mkmin. NV: Newborn & Infants 6-8 mg/kg/min; Children 4-6 mg/kg/min. If HGT <40 mg/dl, give D10 water slow IV push at 2cc/kg and repeat HGT after 30 mins-1 hr' },
    flags: ['The PDF\'s written formula mixes up the 10s and the 60; its worked example (6.6 mg/kg/min) matches the standard formula the app uses.'],
    normal: [
      { label: 'Newborns and infants', underMonths: 12, range: [6, 8] },
      { label: 'Children', underMonths: Infinity, range: [4, 6] },
    ],
    hypoglycemia: { belowMgDl: 40, d10MlPerKg: 2 },
  },

  bsa: {
    name: 'Body surface area (BSA)',
    verified: false,
    formula: 'From weight bands (PDF), or Mosteller √(height cm × weight kg ÷ 3600) when height is given.',
    source: { page: 96, text: 'BSA, Weight (kg): 0–5: wt x 0.05 + 0.05; 6–10: wt x 0.04 + 0.10; 11–20: wt x 0.03 + 0.20; 20–40: wt x 0.02 + 0.40; >40: wt x 0.01 + 0.80' },
    flags: ['Mosteller is not in the PDF; it is a standard reference formula.'],
    bands: [
      { upToKg: 5, perKg: 0.05, add: 0.05 },
      { upToKg: 10, perKg: 0.04, add: 0.10 },
      { upToKg: 20, perKg: 0.03, add: 0.20 },
      { upToKg: 40, perKg: 0.02, add: 0.40 },
      { upToKg: Infinity, perKg: 0.01, add: 0.80 },
    ],
  },

  schwartz: {
    name: 'GFR (Schwartz)',
    verified: false,
    formula: 'GFR (mL/min/1.73 m²) = k × height (cm) ÷ serum creatinine (mg/dL).',
    source: { page: 96, text: 'GFR = k x L / sCr = ml/min/1.73 m2 SA. L = body length (cm). Scr = mg/dL; divide by 88.4 if units in mmol/L' },
    flags: [
      'The PDF gives no k values. The values below are from standard references.',
      'The PDF says "divide by 88.4 if mmol/L"; the conversion is for µmol/L (1 mg/dL = 88.4 µmol/L).',
      'The normal-values table lists "2 - 19mo"; probably 12–19 mo.',
    ],
    umolPerMgDl: 88.4,
    k: [
      { id: 'bedside', label: 'Bedside Schwartz (enzymatic/IDMS creatinine), 1–17 yr', k: 0.413 },
      { id: 'lbw', label: 'Classic: low birth weight infant', k: 0.33 },
      { id: 'term', label: 'Classic: term infant under 1 yr', k: 0.45 },
      { id: 'child', label: 'Classic: child, adolescent girl', k: 0.55 },
      { id: 'boy', label: 'Classic: adolescent boy', k: 0.7 },
    ],
    normals: [
      { age: 'Preterm 2–8 d', mean: 11, range: '11–15' },
      { age: 'Preterm 4–28 d', mean: 20, range: '15–28' },
      { age: 'Preterm 30–90 d', mean: 50, range: '40–65' },
      { age: 'Term 2–8 d', mean: 39, range: '17–60' },
      { age: 'Term 4–28 d', mean: 47, range: '26–68' },
      { age: 'Term 30–90 d', mean: 58, range: '30–86' },
      { age: '1–6 mo', mean: 77, range: '39–114' },
      { age: '6–12 mo', mean: 103, range: '49–157' },
      { age: '12–19 mo', mean: 127, range: '62–191' },
      { age: '2–12 yr', mean: 127, range: '89–165' },
      { age: 'Adult male', mean: 131, range: '88–174' },
      { age: 'Adult female', mean: 117, range: '87–147' },
    ],
  },

  etTube: {
    name: 'ET tube size and depth',
    verified: false,
    formula: 'Uncuffed size (mm) = age (yr) ÷ 4 + 4. Depth at lip (cm) = age ÷ 2 + 12 (over 2 yr), or size × 3.',
    source: { page: 60, text: 'ET tube size: age in yrs/4 +4. ET level: if >2yo: age(yrs)/2 +12; Or ET size x 3. (p. 128) >10 yo cuffed. Laryngoscope sizes: PT Miller 00 or 0; Term Miller 0; 0-6mos Miller 1; 6-24 mos Miller 2; >24 mos Miller 2 or Mac 2' },
    flags: [
      'The PDF gives no size for infants under 1 year. The newborn weight table is from standard neonatal resuscitation references.',
      'Cuffed size (age ÷ 4 + 3.5) is from PALS, not the PDF.',
    ],
    sizeDiv: 4, sizeAdd: 4, cuffedAdd: 3.5,
    depthDiv: 2, depthAdd: 12, depthFromAgeOverYears: 2,
    depthPerSize: 3,
    formulaFromYears: 1,
    cuffedOverYears: 10,
    newborn: [
      { underKg: 1, size: '2.5' },
      { underKg: 2, size: '3.0' },
      { underKg: 3, size: '3.0–3.5' },
      { underKg: Infinity, size: '3.5' },
    ],
    laryngoscope: [
      { label: 'Preterm', blade: 'Miller 00 or 0' },
      { label: 'Term newborn', blade: 'Miller 0' },
      { label: '0–6 mo', blade: 'Miller 1', underMonths: 6 },
      { label: '6–24 mo', blade: 'Miller 2', underMonths: 24 },
      { label: 'Over 24 mo', blade: 'Miller 2 or Mac 2', underMonths: Infinity },
    ],
  },

  umbilical: {
    name: 'Umbilical catheter depth',
    verified: false,
    formula: 'UAC (high, T6–T9) = 3 × weight + 9 cm. UVC = UAC ÷ 2 + 1 cm.',
    source: { page: 59, text: 'Level of Umbilical Catheterization (cm). If arterial between T6-T9: Wt x 3 x 8. If venous: (wt x 3) + 8 / 2 +1' },
    flags: [
      'The PDF arterial formula "Wt x 3 x 8" cannot be right (1 kg would give 24 cm). The app uses the Shukla formula, 3 × weight + 9.',
      'The PDF venous formula uses + 8; Shukla uses + 9, which gives 0.5 cm more. The app uses + 9. Please confirm which the unit uses.',
    ],
    uacPerKg: 3, uacAdd: 9,
    uvcDiv: 2, uvcAdd: 1,
  },

  bicarb: {
    name: 'Bicarbonate deficit',
    verified: false,
    formula: 'Deficit (mEq) = base excess × weight × 0.3. Half correction = deficit ÷ 2.',
    source: { page: 86, text: 'BE x Wt x 0.3 = 26.8 x 4.9 x 0.3 = 39.39meqs. Half correction: 39.39/2 = 19.69 meqs. To order: Give 20 meqs NaHCO3 + equal amt of sterile water to be given slow IVTT over 30mins. Infuse another 20 meqs NaHCO3 + equal amt sterile water as drip for 1-2 hrs. EMPIRIC: NaHCO3 1-2mkdose even w/o ABG.' },
    flags: ['The PDF\'s "Full correction" line repeats the half-correction formula (÷ 2). The app gives full correction as the whole deficit.'],
    factor: 0.3,
    empiricMEqPerKg: [1, 2],
  },

  anc: {
    name: 'Absolute neutrophil count (ANC)',
    verified: false,
    formula: 'ANC (cells/µL) = WBC (×10³/µL) × (segs + stabs + metas %) × 10. I:T ratio = (stabs + metas) ÷ (segs + stabs + metas).',
    source: { page: 92, text: 'ANC = wbc x (seg + meta + stabs) x 10. Ex 2.1 x 53 (seg) x 10 = 1113. ANC > 1000 Normal; ANC < 2000 Neutropenia; ANC 1000-1500 Low risk of infection; ANC 500-1000 Mod risk; ANC < 500 High risk. IT ratio > 0.25 sepsis; > 0.80 higher risk of death fr sepsis' },
    flags: [
      'The PDF bands contradict each other ("> 1000 normal" and "< 2000 neutropenia"). The app calls 1,500 and above normal, the usual cut-off.',
      'The I:T ratio is mainly used in newborns.',
    ],
    bands: [
      { below: 500, label: 'Severe neutropenia: high risk of infection', level: 'err' },
      { below: 1000, label: 'Moderate neutropenia: moderate risk of infection', level: 'warn' },
      { below: 1500, label: 'Mild neutropenia: low risk of infection', level: 'warn' },
      { below: Infinity, label: 'Normal', level: 'ok' },
    ],
    itRatio: [
      { over: 0.8, label: 'I:T over 0.80: higher risk of death from sepsis', level: 'err' },
      { over: 0.25, label: 'I:T over 0.25: suggests sepsis', level: 'warn' },
    ],
  },
};
