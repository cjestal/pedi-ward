// Calculator math. Every clinical number comes from formulas.js or scores.js,
// passed in as `f` (the formula entry) or `s` (the score entry).
// Functions return plain numbers/objects; formatting lives in tools.js.

export { FORMULAS } from './formulas.js';
export { SCORES } from './scores.js';

// Piecewise "base + perKg × kg above overKg" (Holliday–Segar style).
function stepwise(bands, kg) {
  let band = bands[0];
  for (const b of bands) if (kg > b.overKg) band = b;
  return band.base + band.perKg * (kg - band.overKg);
}

export function maintenance(f, kg) {
  return { mlDay: stepwise(f.daily, kg), mlHour: stepwise(f.hourly, kg) };
}

export function dehydrationFluids(f, kg, months, severity) {
  const group = months < f.ageSplitMonths ? 'young' : 'old';
  const perKg = f.mlPerKg[severity][group];
  const total = perKg * kg;
  return { perKg, group, totalMl: total, rates: f.hours.map((h) => ({ hours: h, mlHour: total / h })), bolusMl: f.bolusMlPerKg * kg };
}

export function ors(f, kg, months) {
  const planA = months == null ? null : f.planA.find((b) => months < b.underMonths).text;
  const c = f.planC, t = months != null && months < c.infantUnderMonths ? c.infant : c.child;
  const firstMl = c.first.mlPerKg * kg, secondMl = c.second.mlPerKg * kg;
  return {
    planA,
    planB: { ml: f.planB.mlPerKg * kg, hours: f.planB.hours },
    planC: months == null ? null : {
      infant: t === c.infant,
      first: { ml: firstMl, hours: t.firstHours, mlHour: firstMl / t.firstHours },
      second: { ml: secondMl, hours: t.secondHours, mlHour: secondMl / t.secondHours },
    },
  };
}

// TFI in mL/kg/day; feeds in mL/day.
export function nicuFluids(kg, tfi, feedsMlDay = 0) {
  const feedsPerKg = feedsMlDay / kg;
  const ivPerKg = tfi - feedsPerKg;
  return { feedsPerKg, ivPerKg, ivMlDay: ivPerKg * kg, mlHour: (ivPerKg * kg) / 24 };
}

export function dextroseMix(f, desiredPct, totalMl) {
  const factor = (desiredPct - f.low) / (f.high - f.low);
  const d50Ml = totalMl * factor;
  return { factor, d50Ml, baseMl: totalMl - d50Ml };
}

export function gir(pct, mlHour, kg) {
  return (pct * mlHour * 10) / 60 / kg;
}

export function bsaBands(f, kg) {
  const b = f.bands.find((x) => kg <= x.upToKg);
  return kg * b.perKg + b.add;
}

export function bsaMosteller(kg, cm) {
  return Math.sqrt((kg * cm) / 3600);
}

export function schwartz(f, k, cm, creat, unit) {
  const mgDl = unit === 'umol' ? creat / f.umolPerMgDl : creat;
  return { gfr: (k * cm) / mgDl, mgDl };
}

export function etTube(f, months, kg) {
  const years = months / 12;
  const out = {};
  if (years >= f.formulaFromYears) {
    out.uncuffed = years / f.sizeDiv + f.sizeAdd;
    out.cuffed = years / f.sizeDiv + f.cuffedAdd;
    out.preferCuffed = years > f.cuffedOverYears;
    out.depthFromSize = out.uncuffed * f.depthPerSize;
    if (years > f.depthFromAgeOverYears) out.depthFromAge = years / f.depthDiv + f.depthAdd;
  } else if (kg != null) {
    out.newbornSize = f.newborn.find((r) => kg < r.underKg).size;
  }
  return out;
}

export function umbilical(f, kg) {
  const uac = f.uacPerKg * kg + f.uacAdd;
  return { uac, uvc: uac / f.uvcDiv + f.uvcAdd };
}

export function bicarb(f, baseExcess, kg) {
  const deficit = Math.abs(baseExcess) * kg * f.factor;
  return { deficit, half: deficit / 2, empiric: f.empiricMEqPerKg.map((d) => d * kg) };
}

// wbc in ×10³/µL; percentages as whole numbers.
export function anc(f, wbc, segs, stabs = 0, metas = 0) {
  const value = wbc * (segs + stabs + metas) * 10;
  const band = f.bands.find((b) => value < b.below);
  const total = segs + stabs + metas;
  const it = total > 0 && stabs + metas > 0 ? (stabs + metas) / total : null;
  const itBand = it == null ? null : f.itRatio.find((b) => it > b.over) ?? null;
  return { value, band, it, itBand };
}

// --- scores ---

// choices: { itemId: optionIndex }. Returns null until every item is chosen.
export function scoreSum(s, choices) {
  let total = 0;
  for (const item of s.items) {
    const i = choices[item.id];
    if (i == null) return null;
    total += item.options[i].points;
  }
  return { total, max: s.items.reduce((m, it) => m + Math.max(...it.options.map((o) => o.points)), 0), band: s.bands.find((b) => total >= b.min) };
}

// choices: { itemId: columnIndex }. Signs are counted from the worst column
// down, so "two or more signs in some OR severe" counts toward some.
export function scoreColumns(s, choices) {
  const answered = s.items.filter((it) => choices[it.id] != null);
  if (answered.length < s.items.length) return null;
  const counts = s.columns.map((_, ci) => answered.filter((it) => choices[it.id] === ci).length);
  for (const r of s.rule) {
    const ci = s.columns.findIndex((c) => c.id === r.column);
    const atLeast = counts.slice(ci).reduce((a, b) => a + b, 0);
    if (atLeast >= r.minSigns) return { column: s.columns[ci], counts };
  }
  return null;
}

export function inRange(value, [lo, hi]) {
  return value < lo ? 'low' : value > hi ? 'high' : 'normal';
}
