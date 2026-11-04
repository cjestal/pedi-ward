# Pediatric Ward Tools: Project Decisions

What the project is, how it is built, and why. Update it when a decision changes.

> **Status (2026-11-03):** v1 has 12 calculators and 5 scores. Everything is
> **unverified** and shows a red "Draft" banner until the doctor signs it off
> in `review.html`.

## Purpose

- A bedside quick-reference for a **pediatrician in the Philippines**, the same
  doctor who uses the dose calculator (dose.clintjames.us). They asked for a
  second app for quick references.
- Source: **"Handy Pediatric Notes"**, a 2015, 133-page pocket handbook the
  doctor supplied (author listed as "Patrick").
- Planned subdomain: **ward.clintjames.us**. It is a separate app from the dose
  calculator because the jobs differ ("calculate a dose" vs "look something up").
  The app does not link to the dose site (user's choice, 2026-11-03).
- v1 scope (chosen by the user): **calculators and scores**. Later: admitting
  order templates, then reference tables and drug cards.

## Architecture

Same stack as pedi-dose: static HTML + vanilla ES modules, no build, no
backend, nothing stored. Tests run in the browser.

| File | Holds |
|---|---|
| `formulas.js` | Data only: constants, cut-offs and bands for each calculator |
| `scores.js` | Data only: score items, options, points, interpretation |
| `calc.js` | Math only. No clinical numbers are written into the code |
| `tools.js` | Each tool's extra inputs and how its results are worded |
| `index.html` | UI: shared weight/age, search, tool list, tool view (`#tool-id`) |
| `review.html` | Renders every value from the data files for sign-off |
| `test.html` | Tests; open it in a browser, should print **ALL PASSED** |
| `source/` | Extracted PDF text. **Git-ignored** until the author agrees to publication |

Every data entry has:

- `source: { page, text }`: the PDF page, and its wording copied exactly, so the reviewer can compare.
- `flags`: typos, contradictions and gaps in the PDF, and every value taken from another reference.
- `verified`: false until sign-off.

## Where the app departs from the PDF

The PDF has errors, so these are deliberate. Each one is also listed in that tool's `flags`.

- **Umbilical catheter:** the PDF's arterial formula "Wt x 3 x 8" can't be right, so the app uses Shukla's (3 × wt + 9). For venous the PDF uses + 8 where Shukla uses + 9.
- **ANC:** the PDF's bands contradict each other. The app uses the usual cut-off: 1,500 or more is normal.
- **Bicarbonate:** the PDF's "full correction" line repeats the half formula.
- **ORS:** Plan A's age column is missing from the PDF, so the app uses WHO bands. For Plan B the PDF says "24 hrs"; WHO says 4 h.
- **Not in the PDF at all (standard references):** Schwartz k values, newborn ET tube sizes by weight, cuffed ET size, Mosteller BSA, the GCS interpretation bands, and the WHO rule for combining dehydration signs.
- **Removed:** a consultant-specific note ("if Dr. Reinoso, divide by 2").

## Open questions for the doctor

1. Do they agree with each departure listed above?
2. The umbilical venous line: is it + 8 or + 9?
3. May the handbook's author be credited, and may the site be public? If not, keep it unlisted and with `noindex`, which is already set.

## Running locally

    python3 -m http.server 8000   # then open http://localhost:8000
