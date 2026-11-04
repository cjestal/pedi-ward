// Scoring tables. Same rules as formulas.js: `source` quotes the PDF,
// `flags` lists problems and anything taken from other references, and
// `verified` stays false until the doctor signs off.
//
// Kinds:
//   sum      add the points of the chosen option in every item; `bands` read the total
//   column   each item's options are columns (no / some / severe signs);
//            `rule` decides the category from how many signs fall in each column
//   pick     choose one option; its `result` is the answer (e.g. Kramer zone)

export const SCORES = {
  apgar: {
    name: 'APGAR score',
    kind: 'sum',
    verified: false,
    source: { page: 56, text: 'Taken 1 and 5 minutes after birth. Color: Blue, pale / Body pink, extremities blue / All pink. HR: 0 / <100 / >100. Reflex irritability: No response / Grimace / Cough. Activity: Limp / Some flexion / Active. Respiration: Absent / Slow, irregular / Good. 8–10 Good cardiopulmonary adaptation; 4–7 Need for resuscitation, esp ventilatory support; 0–3 Need for immediate resuscitation' },
    flags: [],
    note: 'Score at 1 and 5 minutes after birth.',
    items: [
      { id: 'color', label: 'Color', options: [{ label: 'Blue, pale', points: 0 }, { label: 'Body pink, extremities blue', points: 1 }, { label: 'All pink', points: 2 }] },
      { id: 'hr', label: 'Heart rate', options: [{ label: 'Absent', points: 0 }, { label: 'Under 100', points: 1 }, { label: '100 or more', points: 2 }] },
      { id: 'reflex', label: 'Reflex irritability', options: [{ label: 'No response', points: 0 }, { label: 'Grimace', points: 1 }, { label: 'Cough', points: 2 }] },
      { id: 'activity', label: 'Activity (tone)', options: [{ label: 'Limp', points: 0 }, { label: 'Some flexion', points: 1 }, { label: 'Active', points: 2 }] },
      { id: 'resp', label: 'Respiration', options: [{ label: 'Absent', points: 0 }, { label: 'Slow, irregular', points: 1 }, { label: 'Good', points: 2 }] },
    ],
    bands: [
      { min: 8, label: 'Good cardiopulmonary adaptation', level: 'ok' },
      { min: 4, label: 'Needs resuscitation, especially ventilatory support', level: 'warn' },
      { min: 0, label: 'Needs immediate resuscitation', level: 'err' },
    ],
  },

  gcsChild: {
    name: 'Glasgow Coma Scale (child)',
    kind: 'sum',
    verified: false,
    source: { page: 67, text: 'Eye opening: Spontaneous 4, To speech 3, To pain 2, None 1. Verbal: Oriented 5, Confused 4, Inappropriate words 3, Inappropriate sounds 2, None 1. Motor: Follows command 6, Localizes pain 5, Withdraws to pain 4, Abnormal flexion 3, Abnormal extension 2, None 1' },
    flags: ['The PDF gives no interpretation. The mild / moderate / severe bands are the standard ones (severe: 8 or less).'],
    items: [
      { id: 'eye', label: 'Eye opening', options: [{ label: 'Spontaneous', points: 4 }, { label: 'To speech', points: 3 }, { label: 'To pain', points: 2 }, { label: 'None', points: 1 }] },
      { id: 'verbal', label: 'Verbal', options: [{ label: 'Oriented', points: 5 }, { label: 'Confused', points: 4 }, { label: 'Inappropriate words', points: 3 }, { label: 'Inappropriate sounds', points: 2 }, { label: 'None', points: 1 }] },
      { id: 'motor', label: 'Motor', options: [{ label: 'Follows commands', points: 6 }, { label: 'Localizes pain', points: 5 }, { label: 'Withdraws to pain', points: 4 }, { label: 'Abnormal flexion', points: 3 }, { label: 'Abnormal extension', points: 2 }, { label: 'None', points: 1 }] },
    ],
    bands: [
      { min: 13, label: 'Mild', level: 'ok' },
      { min: 9, label: 'Moderate', level: 'warn' },
      { min: 3, label: 'Severe: consider airway protection', level: 'err' },
    ],
  },

  gcsInfant: {
    name: 'Glasgow Coma Scale (infant)',
    kind: 'sum',
    verified: false,
    source: { page: 67, text: 'Infants. Eye opening: Spontaneous 4, To speech 3, To pain 2, None 1. Verbal: Coos, babbles 5, Irritable 4, Cries to pain 3, Moans to pain 2, None 1. Motor: Normal spontaneous movement 6, Withdraws to touch 5, Withdraws to pain 4, Abnormal flexion 3, Abnormal extension 2, None 1' },
    flags: ['The PDF gives no interpretation. The mild / moderate / severe bands are the standard ones (severe: 8 or less).'],
    items: [
      { id: 'eye', label: 'Eye opening', options: [{ label: 'Spontaneous', points: 4 }, { label: 'To speech', points: 3 }, { label: 'To pain', points: 2 }, { label: 'None', points: 1 }] },
      { id: 'verbal', label: 'Verbal', options: [{ label: 'Coos, babbles', points: 5 }, { label: 'Irritable', points: 4 }, { label: 'Cries to pain', points: 3 }, { label: 'Moans to pain', points: 2 }, { label: 'None', points: 1 }] },
      { id: 'motor', label: 'Motor', options: [{ label: 'Normal spontaneous movement', points: 6 }, { label: 'Withdraws to touch', points: 5 }, { label: 'Withdraws to pain', points: 4 }, { label: 'Abnormal flexion', points: 3 }, { label: 'Abnormal extension', points: 2 }, { label: 'None', points: 1 }] },
    ],
    bands: [
      { min: 13, label: 'Mild', level: 'ok' },
      { min: 9, label: 'Moderate', level: 'warn' },
      { min: 3, label: 'Severe: consider airway protection', level: 'err' },
    ],
  },

  dehydration: {
    name: 'Dehydration assessment',
    kind: 'column',
    verified: false,
    source: { page: 93, text: 'ASSESSMENT OF DEHYDRATION [CDD]. Condition: Well, alert / Restless, irritable / Lethargic, unconscious, floppy. Eyes: Normal / Sunken / Very sunken, dry. Tears: Present / Absent / Absent. Mouth/Tongue: Moist / Dry / Very dry. Thirst: Drinks normally, not thirsty / Thirsty, drinks eagerly / Drinks poorly, not able to drink. Skin pinch: Goes back quickly / Goes back slowly / Goes back very slowly' },
    flags: ['The PDF does not say how to combine the signs. The app uses the WHO rule: two or more signs in a column, starting from severe.'],
    columns: [
      { id: 'none', label: 'No dehydration', advice: 'Plan A: ORS after each loose stool, continue feeding, zinc.', level: 'ok' },
      { id: 'some', label: 'Some dehydration', advice: 'Plan B: ORS 75 mL/kg over 4 hours.', level: 'warn' },
      { id: 'severe', label: 'Severe dehydration', advice: 'Plan C: IV fluids 30 mL/kg then 70 mL/kg.', level: 'err' },
    ],
    // Worst column first: the first column with at least `minSigns` signs in it
    // or a worse column wins. Otherwise the last entry applies.
    rule: [
      { column: 'severe', minSigns: 2 },
      { column: 'some', minSigns: 2 },
      { column: 'none', minSigns: 0 },
    ],
    items: [
      { id: 'condition', label: 'Condition', options: ['Well, alert', 'Restless, irritable', 'Lethargic, unconscious, floppy'] },
      { id: 'eyes', label: 'Eyes', options: ['Normal', 'Sunken', 'Very sunken and dry'] },
      { id: 'tears', label: 'Tears', options: ['Present', 'Absent', 'Absent'] },
      { id: 'mouth', label: 'Mouth and tongue', options: ['Moist', 'Dry', 'Very dry'] },
      { id: 'thirst', label: 'Thirst', options: ['Drinks normally, not thirsty', 'Thirsty, drinks eagerly', 'Drinks poorly or not able to drink'] },
      { id: 'skin', label: 'Skin pinch', options: ['Goes back quickly', 'Goes back slowly', 'Goes back very slowly'] },
    ],
  },

  kramer: {
    name: 'Kramer jaundice zones',
    kind: 'pick',
    verified: false,
    source: { page: 62, text: 'KRAMER CLASSIFICATION. Zone I Head/neck 6–8 mg/dl; II Upper trunk 9–12; III Lower trunk, thigh 12–16; IV Arms, leg, below knee 15–18; V Hands/feet >15' },
    flags: ['Ranges differ between references (Kramer\'s original zone I is about 4–8 mg/dL). Visual estimates are rough: confirm with serum or transcutaneous bilirubin.'],
    prompt: 'Furthest zone the jaundice reaches',
    options: [
      { label: 'Zone I: head and neck', result: '6–8 mg/dL', level: 'ok' },
      { label: 'Zone II: upper trunk', result: '9–12 mg/dL', level: 'warn' },
      { label: 'Zone III: lower trunk, thighs', result: '12–16 mg/dL', level: 'warn' },
      { label: 'Zone IV: arms, legs below the knee', result: '15–18 mg/dL', level: 'err' },
      { label: 'Zone V: hands and feet', result: 'Over 15 mg/dL', level: 'err' },
    ],
  },
};
