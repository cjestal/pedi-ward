// Tool registry: what each tool asks for and how its results are shown.
// The math is in calc.js; the clinical numbers are in formulas.js / scores.js.
//
// Calculator tools: inputs are extra fields beyond the shared weight and age.
// run(values, patient) returns { need?, cards, alerts, table } where
//   need     a message when a required value is missing (nothing else shown)
//   cards    [{ label, value, unit, detail }]
//   alerts   [{ text, level: 'ok' | 'warn' | 'err' | 'info' }]
//   table    { caption, head: [], rows: [[]], highlight: rowIndex }

import * as C from './calc.js';

const F = C.FORMULAS;
export const fmt = (n, dp = 1) => (Number.isFinite(n) ? Number(n.toFixed(dp)).toLocaleString('en-US', { maximumFractionDigits: dp }) : '–');
const needKg = (p) => (p.kg > 0 ? null : 'Enter the weight above.');
const needAge = (p) => (p.months != null ? null : 'Enter the age above.');

export const GROUPS = ['Fluids', 'Newborn', 'Kidney', 'Emergency', 'Lab', 'Scores'];

export const TOOLS = [
  {
    id: 'maintenance', data: F.hollidaySegar, group: 'Fluids', uses: ['kg'],
    keywords: 'holliday segar maintenance ivf fluids 4-2-1 rate',
    inputs: [],
    run(v, p) {
      const need = needKg(p); if (need) return { need };
      const f = F.hollidaySegar, r = C.maintenance(f, p.kg);
      const alerts = [{ text: p.kg > f.fluid.d5lrAboveKg ? 'Over 40 kg: the notes use D5 LR.' : 'Usual fluid: D5 0.3 NaCl.', level: 'info' }];
      if (r.mlDay > f.noteAboveMlDay) alerts.push({ text: `Above ${fmt(f.noteAboveMlDay, 0)} mL/day. Many references cap maintenance at adult volumes.`, level: 'warn' });
      return {
        cards: [
          { label: 'Per day', value: fmt(r.mlDay, 0), unit: 'mL/day', detail: `${fmt(r.mlDay / 24)} mL/h if spread evenly` },
          { label: 'Hourly (4-2-1)', value: fmt(r.mlHour), unit: 'mL/h', detail: `${fmt(r.mlHour * 24, 0)} mL over 24 h` },
        ],
        alerts,
      };
    },
  },
  {
    id: 'dehydration-fluids', data: F.dehydrationFluids, group: 'Fluids', uses: ['kg', 'age'],
    keywords: 'dehydration replacement deficit age gastroenteritis ivf bolus resuscitation plr',
    inputs: [{ id: 'severity', label: 'Severity', type: 'chips', options: [['mild', 'Mild'], ['moderate', 'Moderate'], ['severe', 'Severe']], default: 'moderate' }],
    run(v, p) {
      const need = needKg(p) || needAge(p); if (need) return { need };
      const f = F.dehydrationFluids, r = C.dehydrationFluids(f, p.kg, p.months, v.severity);
      return {
        cards: [
          { label: 'Total over 6–8 h', value: fmt(r.totalMl, 0), unit: 'mL', detail: `${r.perKg} mL/kg (${r.group === 'young' ? 'under 2 yr' : '2 yr and over'})` },
          { label: 'Rate', value: `${fmt(r.rates[1].mlHour, 0)}–${fmt(r.rates[0].mlHour, 0)}`, unit: 'mL/h', detail: `over ${r.rates[1].hours} h to ${r.rates[0].hours} h` },
        ],
        alerts: [
          { text: `Usual fluid: ${p.kg > f.d5lrAboveKg ? 'D5 LR (over 40 kg)' : 'D5 0.3 NaCl'}. Run over 6–8 h, then reassess.`, level: 'info' },
          { text: `Resuscitation bolus: ${fmt(r.bolusMl, 0)} mL (20 mL/kg), usually PLR.`, level: 'info' },
        ],
      };
    },
  },
  {
    id: 'ors', data: F.ors, group: 'Fluids', uses: ['kg', 'age'],
    keywords: 'ors oral rehydration plan a b c diarrhea age',
    inputs: [],
    run(v, p) {
      const need = needKg(p); if (need) return { need };
      const r = C.ors(F.ors, p.kg, p.months);
      const cards = [{ label: 'Plan B: some dehydration', value: fmt(r.planB.ml, 0), unit: 'mL ORS', detail: `75 mL/kg over ${r.planB.hours} h (about ${fmt(r.planB.ml / r.planB.hours, 0)} mL/h)` }];
      if (r.planC) cards.push({ label: 'Plan C: severe (IV)', value: `${fmt(r.planC.first.ml, 0)} + ${fmt(r.planC.second.ml, 0)}`, unit: 'mL', detail: `30 mL/kg over ${r.planC.first.hours * 60 < 60 ? `${r.planC.first.hours * 60} min` : `${r.planC.first.hours} h`} (${fmt(r.planC.first.mlHour, 0)} mL/h), then 70 mL/kg over ${r.planC.second.hours} h (${fmt(r.planC.second.mlHour, 0)} mL/h)` });
      const alerts = r.planA ? [{ text: `Plan A (no dehydration): ${r.planA}.`, level: 'info' }] : [{ text: 'Enter the age for Plan A and the Plan C timing.', level: 'warn' }];
      return { cards, alerts };
    },
  },
  {
    id: 'nicu-fluids', data: F.nicuFluids, group: 'Newborn', uses: ['kg'],
    keywords: 'tfi total fluid intake nicu neonate preterm term feeds milk rate',
    inputs: [
      { id: 'tfi', label: 'TFI', unit: 'mL/kg/day', type: 'number', default: 80, step: 10, hint: 'Start: preterm 60, term 80. Raise 10–20 a day.' },
      { id: 'feeds', label: 'Feeds per day', unit: 'mL/day', type: 'number', default: 0, step: 1, hint: 'e.g. 3 mL every 3 h = 24 mL/day' },
    ],
    run(v, p) {
      const need = needKg(p); if (need) return { need };
      if (!(v.tfi > 0)) return { need: 'Enter the TFI.' };
      const r = C.nicuFluids(p.kg, v.tfi, v.feeds || 0);
      const cards = [{ label: 'IV rate', value: fmt(r.mlHour), unit: 'mL/h', detail: `${fmt(r.ivMlDay)} mL over 24 h` }];
      if (v.feeds > 0) cards.push({ label: 'IV fluid', value: fmt(r.ivPerKg), unit: 'mL/kg/day', detail: `TFI ${fmt(v.tfi)} − ${fmt(r.feedsPerKg)} mL/kg/day from feeds` });
      const alerts = r.ivPerKg <= 0 ? [{ text: 'Feeds cover the whole TFI: no IV fluid needed at this TFI.', level: 'warn' }] : [];
      return { cards, alerts };
    },
  },
  {
    id: 'dextrose', data: F.dextrose, group: 'Newborn', uses: [],
    keywords: 'dextrose dextrosity d50 d10 d12.5 mixing factor concentration',
    inputs: [
      { id: 'pct', label: 'Desired dextrose', unit: '%', type: 'number', default: 10, step: 2.5 },
      { id: 'vol', label: 'Total volume', unit: 'mL', type: 'number', default: 100, step: 10 },
    ],
    run(v) {
      const f = F.dextrose;
      if (!(v.pct > f.low && v.pct < f.high)) return { need: `Desired dextrose must be between ${f.low}% and ${f.high}%.` };
      if (!(v.vol > 0)) return { need: 'Enter the total volume.' };
      const r = C.dextroseMix(f, v.pct, v.vol);
      const alerts = [];
      if (v.pct > f.maxCentral) alerts.push({ text: `Over D${f.maxCentral}: above the notes' limit even for a central line.`, level: 'err' });
      else if (v.pct > f.maxPeripheral) alerts.push({ text: `Over D${f.maxPeripheral}: central line only (peripheral limit D${f.maxPeripheral}).`, level: 'warn' });
      return {
        cards: [
          { label: 'D50 water', value: fmt(r.d50Ml), unit: 'mL', detail: `factor ${fmt(r.factor, 3)}` },
          { label: 'D5 solution', value: fmt(r.baseMl), unit: 'mL', detail: 'e.g. D5 water or D5 IMB' },
        ],
        alerts,
      };
    },
  },
  {
    id: 'gir', data: F.gir, group: 'Newborn', uses: ['kg', 'age'],
    keywords: 'gir glucose infusion rate dextrose hypoglycemia hgt',
    inputs: [
      { id: 'pct', label: 'Dextrose', unit: '%', type: 'number', default: 10, step: 2.5 },
      { id: 'rate', label: 'IV rate', unit: 'mL/h', type: 'number', default: null, step: 0.1 },
    ],
    run(v, p) {
      const need = needKg(p); if (need) return { need };
      if (!(v.pct > 0 && v.rate > 0)) return { need: 'Enter the dextrose % and IV rate.' };
      const f = F.gir, g = C.gir(v.pct, v.rate, p.kg);
      const norm = p.months == null ? null : f.normal.find((n) => p.months < n.underMonths);
      const alerts = [];
      if (norm) {
        const where = C.inRange(g, norm.range);
        alerts.push({ text: `${norm.label}: usual ${norm.range[0]}–${norm.range[1]} mg/kg/min${where === 'normal' ? '' : ` (this is ${where === 'low' ? 'below' : 'above'})`}.`, level: where === 'normal' ? 'ok' : 'warn' });
      } else alerts.push({ text: 'Usual: newborns and infants 6–8, children 4–6 mg/kg/min.', level: 'info' });
      alerts.push({ text: `If HGT under ${f.hypoglycemia.belowMgDl} mg/dL: D10 water ${fmt(f.hypoglycemia.d10MlPerKg * p.kg)} mL (2 mL/kg) slow IV push, recheck in 30–60 min.`, level: 'info' });
      return { cards: [{ label: 'GIR', value: fmt(g), unit: 'mg/kg/min', detail: `D${fmt(v.pct)} at ${fmt(v.rate)} mL/h, ${fmt(p.kg, 2)} kg` }], alerts };
    },
  },
  {
    id: 'umbilical', data: F.umbilical, group: 'Newborn', uses: ['kg'],
    keywords: 'umbilical catheter uac uvc depth line insertion shukla',
    inputs: [],
    run(v, p) {
      const need = needKg(p); if (need) return { need };
      const r = C.umbilical(F.umbilical, p.kg);
      return {
        cards: [
          { label: 'UAC (high, T6–T9)', value: fmt(r.uac), unit: 'cm', detail: '3 × weight + 9' },
          { label: 'UVC', value: fmt(r.uvc), unit: 'cm', detail: 'UAC ÷ 2 + 1' },
        ],
        alerts: [{ text: 'The PDF formula differs from this one; see Source and notes. Confirm position on X-ray.', level: 'warn' }],
      };
    },
  },
  {
    id: 'bsa', data: F.bsa, group: 'Kidney', uses: ['kg'],
    keywords: 'bsa body surface area mosteller m2',
    inputs: [{ id: 'cm', label: 'Height (optional)', unit: 'cm', type: 'number', default: null, step: 1, hint: 'Adds the Mosteller BSA' }],
    run(v, p) {
      const need = needKg(p); if (need) return { need };
      const cards = [{ label: 'BSA (weight bands)', value: fmt(C.bsaBands(F.bsa, p.kg), 2), unit: 'm²', detail: 'From the notes, weight only' }];
      if (v.cm > 0) cards.push({ label: 'BSA (Mosteller)', value: fmt(C.bsaMosteller(p.kg, v.cm), 2), unit: 'm²', detail: `${fmt(v.cm, 0)} cm, ${fmt(p.kg)} kg` });
      return { cards, alerts: [] };
    },
  },
  {
    id: 'schwartz', data: F.schwartz, group: 'Kidney', uses: [],
    keywords: 'gfr schwartz creatinine kidney renal egfr clearance',
    inputs: [
      { id: 'cm', label: 'Height', unit: 'cm', type: 'number', default: null, step: 1 },
      { id: 'cr', label: 'Serum creatinine', type: 'number', default: null, step: 0.01 },
      { id: 'unit', label: 'Creatinine unit', type: 'chips', options: [['mgdl', 'mg/dL'], ['umol', 'µmol/L']], default: 'mgdl' },
      { id: 'k', label: 'k constant', type: 'select', options: F.schwartz.k.map((x) => [x.id, `${x.k}: ${x.label}`]), default: 'bedside' },
    ],
    run(v) {
      if (!(v.cm > 0 && v.cr > 0)) return { need: 'Enter the height and creatinine.' };
      const f = F.schwartz, k = f.k.find((x) => x.id === v.k);
      const r = C.schwartz(f, k.k, v.cm, v.cr, v.unit);
      return {
        cards: [{ label: 'GFR', value: fmt(r.gfr, 0), unit: 'mL/min/1.73 m²', detail: `k ${k.k} × ${fmt(v.cm, 0)} cm ÷ ${fmt(r.mgDl, 2)} mg/dL` }],
        alerts: [],
        table: { caption: 'Normal GFR by age (mL/min/1.73 m²)', head: ['Age', 'Mean', 'Range'], rows: f.normals.map((n) => [n.age, n.mean, n.range]) },
      };
    },
  },
  {
    id: 'et-tube', data: F.etTube, group: 'Emergency', uses: ['age', 'kg'],
    keywords: 'et tube endotracheal intubation size depth laryngoscope blade miller mac airway',
    inputs: [],
    run(v, p) {
      const need = needAge(p); if (need) return { need };
      const f = F.etTube, r = C.etTube(f, p.months, p.kg > 0 ? p.kg : null);
      const cards = [], alerts = [];
      if (r.uncuffed != null) {
        cards.push({ label: r.preferCuffed ? 'Cuffed (over 10 yr)' : 'Uncuffed', value: fmt(r.preferCuffed ? r.cuffed : r.uncuffed, 1), unit: 'mm ID', detail: r.preferCuffed ? `Uncuffed equivalent ${fmt(r.uncuffed)} mm` : `Cuffed: ${fmt(r.cuffed)} mm` });
        cards.push({ label: 'Depth at lip', value: fmt(r.depthFromAge ?? r.depthFromSize), unit: 'cm', detail: r.depthFromAge != null ? `age ÷ 2 + 12; size × 3 gives ${fmt(r.depthFromSize)} cm` : 'size × 3' });
        alerts.push({ text: 'Have one size smaller and one larger ready.', level: 'info' });
      } else if (r.newbornSize) {
        cards.push({ label: 'ET tube (by weight)', value: r.newbornSize, unit: 'mm ID', detail: 'Newborn table (not in the notes)' });
      } else alerts.push({ text: 'Under 1 year: enter the weight for the newborn size table.', level: 'warn' });
      const row = p.months < 1 ? -1 : f.laryngoscope.findIndex((l) => l.underMonths != null && p.months < l.underMonths);
      return {
        cards, alerts,
        table: { caption: 'Laryngoscope blade', head: ['Age', 'Blade'], rows: f.laryngoscope.map((l) => [l.label, l.blade]), highlight: row },
      };
    },
  },
  {
    id: 'bicarb', data: F.bicarb, group: 'Emergency', uses: ['kg'],
    keywords: 'bicarbonate bicarb nahco3 base excess deficit acidosis abg correction',
    inputs: [{ id: 'be', label: 'Base excess', unit: 'mEq/L', type: 'number', default: null, step: 0.1, hint: 'e.g. −26.8' }],
    run(v, p) {
      const need = needKg(p); if (need) return { need };
      if (!v.be) return { need: 'Enter the base excess from the ABG.' };
      const r = C.bicarb(F.bicarb, v.be, p.kg);
      return {
        cards: [
          { label: 'Half correction', value: fmt(r.half), unit: 'mEq', detail: 'Half slow IV push over 30 min, half as a drip over 1–2 h; each with an equal volume of sterile water' },
          { label: 'Full deficit', value: fmt(r.deficit), unit: 'mEq', detail: `|BE| ${fmt(Math.abs(v.be))} × ${fmt(p.kg, 2)} kg × 0.3` },
        ],
        alerts: [
          ...(v.be > 0 ? [{ text: 'Base excess is positive (alkalosis). Check the sign.', level: 'err' }] : []),
          { text: `Empiric without ABG: ${fmt(r.empiric[0])}–${fmt(r.empiric[1])} mEq (1–2 mEq/kg/dose).`, level: 'info' },
        ],
      };
    },
  },
  {
    id: 'anc', data: F.anc, group: 'Lab', uses: [],
    keywords: 'anc absolute neutrophil count neutropenia cbc it ratio sepsis stabs bands',
    inputs: [
      { id: 'wbc', label: 'WBC', unit: '×10³/µL', type: 'number', default: null, step: 0.1, hint: 'Same as ×10⁹/L' },
      { id: 'segs', label: 'Segmenters', unit: '%', type: 'number', default: null, step: 1 },
      { id: 'stabs', label: 'Stabs (bands)', unit: '%', type: 'number', default: null, step: 1 },
      { id: 'metas', label: 'Metamyelocytes', unit: '%', type: 'number', default: null, step: 1 },
    ],
    run(v) {
      if (!(v.wbc > 0 && v.segs >= 0 && v.segs != null)) return { need: 'Enter the WBC and segmenters.' };
      const r = C.anc(F.anc, v.wbc, v.segs, v.stabs || 0, v.metas || 0);
      const cards = [{ label: 'ANC', value: fmt(r.value, 0), unit: 'cells/µL', detail: r.band.label }];
      const alerts = [{ text: r.band.label, level: r.band.level }];
      if (r.it != null) {
        cards.push({ label: 'I:T ratio', value: fmt(r.it, 2), unit: '', detail: '(stabs + metas) ÷ all neutrophils' });
        if (r.itBand) alerts.push({ text: r.itBand.label, level: r.itBand.level });
      }
      return { cards, alerts };
    },
  },
  // Scores: rendered from scores.js by the page.
  { id: 'apgar', score: 'apgar', group: 'Scores', keywords: 'apgar newborn birth resuscitation' },
  { id: 'gcs-child', score: 'gcsChild', group: 'Scores', keywords: 'gcs glasgow coma scale consciousness head injury' },
  { id: 'gcs-infant', score: 'gcsInfant', group: 'Scores', keywords: 'gcs glasgow coma scale infant baby consciousness' },
  { id: 'dehydration', score: 'dehydration', group: 'Scores', keywords: 'dehydration assessment who plan diarrhea age signs' },
  { id: 'kramer', score: 'kramer', group: 'Scores', keywords: 'kramer jaundice bilirubin hyperbilirubinemia zone newborn' },
];

for (const t of TOOLS) {
  if (t.score) t.data = C.SCORES[t.score];
  t.name = t.data.name;
}
