# Build Bible — Leadership Workspaces

Companion simulations to *The Bank AI Playbook* (Aurelia Global Bank) and *The Engineering Head's Handbook* (Everline Group) by Kumar Abhishek Shahi, The Final Leap, Pune.

**Status:** v1.1 — Practice Now added to every page. Last updated: 2026-11-14.

## What exists
| Site | Modules | Routes QA'd | Missions | Seed |
|---|---|---|---|---|
| AGB One (AI CoE) | 17 apps + inbox, calendar, org, stakeholder map, missions | 50, 0 errors | 39 (all 33 chapters + capstone, all 28 Appendix-A codes) | 65 use cases, 44 models, 40 gateway teams, 12 vendors, 25 incidents, 62 messages, 12 months of monitoring/spend |
| Everline Hub (Eng Head) | 16 apps + same shell | 53, 0 errors | 57 (R1–R56 + Operating Review capstone) | 300 engineers (210 perm / 90 vendor), 120 apps, 40 reqs, 250 candidates, 14 vendors, 9 programs, 60 incidents, 30 ADRs, 60 messages, 12 months actuals, 4 quarters DORA × 6 squads |

## Decisions log
| # | Decision | Rationale |
|---|---|---|
| D1 | Downloadable static sites that open from `file://` (double-click), also GitHub Pages-ready | User asked for "downloadable html site" |
| D2 | Seed data ships as JS (`window.SEED = …`), not fetched JSON | `fetch()` fails on `file://` |
| D3 | AGB built first, then Everline | User choice |
| D4 | Strongly distinct brands — AGB: navy/teal, square, serif headings; Everline: plum/orange gradient, rounded, airy | User choice |
| D5 | Every module built to full depth | User choice |
| D6 | Two self-contained site folders; each can become its own repo (`agb-ai-coe-workspace`, `everline-eng-head-workspace`) | Clean repos, independent Pages URLs |
| D7 | No build step: plain readable HTML/CSS/JS; a shared vanilla-JS framework copied into each site | file:// + offline + any future session can edit directly |
| D8 | In-repo SVG chart library (line, bars, stacked, hbars, donut, gauge, heat, flow, sparkline) | Zero dependencies and licence risk |
| D9 | Icons are inline SVG paths written for this project | No icon-font licence questions |
| D10 | Simulated today — AGB: **Tue 17 Nov 2026**; Everline: **Mon 2 Nov 2026** (Black Friday is **27 Nov 2026**) | Corrected from Phase 1 draft (17 Nov is a Tuesday; BF 2026 is the 27th) |
| D11 | localStorage overlay (`agb.v1.*`, `evl.v1.*`), try/catch wrapped; export = overlay only; reset clears namespace | Brief §4.1 |
| D12 | EUR at AGB, USD at Everline; INR noted for Pune bands | Brief §4.2 |
| D13 | Fictional internal product names, collision-checked | Brief §4.2 |
| D14 | FS AI RMF-style controls labelled "illustrative — not official IDs" everywhere they appear | Integrity rule |
| D15 | `canon.js` per site holds every book number; a QA script renders every route and asserts each canonical string appears on-screen | Books and sites must never contradict |
| D16 | Consequence logic tied to the clock: skipping the shard split fails the load test and Black Friday; pricing the Kestrel exit settles the renewal at 8%; missing Dana's deadline imposes a pro-rata cut; regulator/council/renewal dates fire events | Practice must have consequences |
| D17 | Expert-mode curveballs fire from the clock engine for any started ●●● mission | One mechanism powers missions and day-in-the-life |
| D18 | Added beyond brief: launcher hero (role brief + lifecycle/operating-rhythm diagram), auto-generated hub-and-spoke reporting-lines map, GPU-vs-API calculator, exit-pricing calculator, capacity calculator reproducing the book's arithmetic, flagship-facts panels, fraud-threshold & AML views, a "Teach the Council the statistics" mission, a lab/platform-tooling mission and a data-readiness mission | "Don't limit to what I asked" |
| D20 | v1.1: **Practice Now** button injected into every page header by the router; opens a 7-tab workbench (steps, live template/calculator, formulas, data collection, producing the report, value, AI age + guardrails). Content in `src/practice_data_*.js` keyed by route; sub-pages fall back to their module's guide. AGB 34 guides, Everline 44. Calculators are pre-filled from live seed data and recompute as you type; templates download/copy as CSV or Markdown. Practice library page + printable full-page guides + completion logged in the evidence log | User request 2026-11-14 |
| D21 | Practice button colour is a dedicated brand token (`--practice`), chosen to pass WCAG AA with white text (AGB #9a5f06 5.2:1; Everline #b35407 5.0:1) | Accessibility |
| D19 | Invented characters: Ingrid Halvorsen (Group CDAIO, Dhruv's boss), Dr. Sofia Mkhize (Head of Model Risk), Thierry Lacombe (Finance BP), Henrik Dahl (lead supervisor, fictional "Nordhaven Prudential Authority"); Everline directors Maya Lindgren, Carlos Ortiz, Rhea Desai, Daan Visser, Keisha Brooks alongside Rohit; vendors Kestrel (WMS), Brightpath, Coralline, Oakridge; acquisition target Parcelwise | Brief asked for these to be created |

## Book inconsistencies found during the build (fix in the next book edition)
1. **The Bank AI Playbook — "32 responsibilities".** Chapter 3, Figure 3.2 and Appendix A all *list* 28 (A1–A4, B1–B4, C1–C4, D1–D5, E1–E3, F1–F4, G1–G4) while the text says 32. The site maps missions to the 28 listed codes exactly as Appendix A numbers them. Either add four responsibilities or change "32" to "28" throughout.
2. **The Engineering Head's Handbook — budget.** Lab VII.1's table and Figure VII.1 sum to **$38.45M** (RTB $26.38M, 69%), while the text and the 15% cut ($4.26M) assume **$28.4M**. The site uses $28.4M with RTB 69% via a rescaled bottom-up build (perm $14.0M, vendor $5.3M, cloud $3.3M, licences $1.5M, programmes $1.6M, modernisation $1.4M, security $0.9M, training $0.4M). Rescale the lab table.
3. **Brief §8 vs book — headcount.** The brief says "~390 people (300 engineers + 90 vendor)"; the book and brief §6.1 say 300 engineers *including* 90 vendor. The site follows the book: exactly 300 engineers (210 permanent + 90 vendor) plus ~16 stakeholders.

## Canon placement (where each book number lives on screen)
**AGB:** credit AUC/KS/Gini/GBM/AIR/approval rates/€4.3M → Registry UC-2026-0101 flagship facts, ModelVault model card, Sentinel fairness, Reports; fraud AUC + alert budgets + precision/recall → Sentinel "Fraud thresholds" + UC-2026-0102; 5,000 TPS / 18+9+12 ms / 24 pods → UC-2026-0102; AML 404 / 33.2% / 96.4% / 80 SARs → Sentinel + UC-2026-0103; similarity floor 0.26 → Gateway + Sentinel + UC-2026-0106; hit@3 80% fail → Sentinel golden set; Ch-27 incident → IncidentDesk INC-2026-0007; PSI bands → Sentinel; 5-day SLA → Registry SLA dashboard; 8-tab binder → RegRoom; EU AI Act dates → PolicyDesk; value ledger €10.2M co-signed / €12.4M promised → ValueBoard + Command Center.
**Everline:** $28.4M / RTB 69% / A-B-C / $4.26M → FinancePortal; capacity numbers → ArchHub calculator (computed, not hard-coded); 41-min incident → OnCallOps INC-0001; attrition + exit themes → PeopleHub; DevEx + DORA → PulseMetrics; 43-min budget → SLOBoard; 11 findings / 3 critical / DR 4h12m → 38 min → TrustDesk; Kestrel +40% / $3.1M / 14 months / 8% → VendorDesk.

## QA performed
- v1.1: every route on both sites shows ▶ Practice Now (38 AGB / 48 Everline routes checked); all 78 guides have every section; every calculator output evaluates to a finite value from live data; full regression, interaction and canon audits re-run clean.
- Headless Chrome crawl of every route on both sites: 103 routes, zero console errors.
- End-to-end interaction tests: intake validation & submission, maker-checker with mandatory comment, mission submit → rubric → locked score, curveball firing, persona switching, Explain drawer, cut submission, capacity sign-off gating, exit pricing → renewal outcome, clock-driven events, export.
- Canon audit: 42 AGB + 47 Everline canonical strings found on rendered screens; mission coverage verified by script.
- Print: both eight-slide board packs print as exactly 8 landscape pages with app chrome removed.
- Accessibility basics: keyboard-focusable cards/rows/modals (Enter/Space/Escape), visible focus rings, colour never the only signal (pills carry text), reduced-motion respected.

## Open items / next iterations
- OI-1: Push to GitHub and enable Pages (needs repo access; both folders are ready as-is).
- OI-2: Deepen data where useful: more historic forum minutes; per-candidate CV text; more vendor QBR history.
- OI-3: Coaching mode: run any mission live with Claude role-playing the asker.
