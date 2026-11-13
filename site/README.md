# AGB One — AI Centre of Excellence Workspace

> **Training simulation. All organisations, people and data are fictional.**
> Hands-on companion to *The Bank AI Playbook* by Kumar Abhishek Shahi (The Final Leap, Pune). Book repo: github.com/KumarAbhishekShahi/bank-ai-playbook

A near-real enterprise workspace for practising the daily work of the role: realistic applications, seeded data, a simulated inbox and clock, persona switching, and graded missions mapped to the book.

## Run it
- **Offline / downloaded:** unzip and double-click `index.html`. No server, no install, no internet needed. Works in any modern browser.
- **Hosted:** push this folder to a GitHub repo and enable **Settings → Pages → Deploy from branch (root)**. Everything is static.

Simulated "today": **Tuesday 17 November 2026**. Use **+1d / +1w / +1m** in the top bar to advance time: scheduled events fire (deadlines, SLA breaches, renewals, drift alerts) and Expert-mode curveballs land.

## How to practise
1. **Launcher → Start here.** The hero panel tells you who you are and the five things to open first.
2. **Inbox** (top-bar envelope): every message links to a task in a module. Write a real reply, then compare it with the model reply and the note on what the sender actually needed.
3. **View as** (top-right): switch persona to see the same system through your boss's, CFO's, CRO's/CISO's or auditor's eyes — their queues, their widgets, their approval rights. Maker-checker is enforced (you can't approve what you raised).
4. **ⓘ Explain this screen** (bottom-left, every page): the real-world system category, who uses it and how often, key fields, decisions it informs, failure modes, interview talking points (mechanism + number + named cost) and the book mapping.
5. **▶ Practice Now** (orange button on every page header): a workbench with seven tabs — (1) step-by-step guide with links into the app, (2) **template & live calculator** pre-filled with this workspace's numbers (download/copy as CSV or Markdown, or a document template), (3) formulas with worked examples and thresholds, (4) how to collect the data (system category, owner, cadence, quality checks), (5) how to produce the report (audience, format, common mistakes), (6) where it's used and the value to the organisation, (7) how to do it in the AI age, what changes as the business evolves, and guardrails. Tick "I've practised this" to log it in your evidence log. **Practice library** (left nav) lists all 34 guides; each opens as a printable full page.
6. **Missions**: scenario → success criteria → hints → your submission → rubric self-score → model answer → interview mode (questions, model answers, what the panel checks, red flags). Expert missions (●●●) inject a curveball when you advance the clock.
7. **Missions → Day-in-the-life**: scripted days with interruptions — practise prioritising, not just completing.
8. **Missions → Progress & evidence log**: badges per cluster and a printable log of what you practised (clearly titled as simulation practice).

## Your data
Edits, approvals, replies and mission progress are saved in your browser (localStorage). Footer buttons: **Export my work** (JSON), **Import**, **Reset to seed data**. Private/incognito windows may not persist.

## Printing
Reports and packs print cleanly: open the report, **Print → Save as PDF** (landscape recommended). Board packs print one slide per page.

## Missions index
| ID | Mission | Cluster | Level | Asked by | Module | Book |
|---|---|---|---|---|---|---|
| A-01 | Walk the bank: map where AI lives | A · Strategy & value | ● | Ingrid Halvorsen | Org chart | Ch 1-2, Resp A1 |
| A-02 | Draft the 90-day plan and charter red-lines | A · Strategy & value | ●● | Ingrid Halvorsen | ValueBoard | Ch 3, Resp A1-A2 |
| A-03 | Tier three intakes within the 5-day SLA | D · Governance | ● | Intake queue | Registry | Ch 8, 25, Resp D1-D2 |
| A-04 | Reject a duplicate without losing the sponsor | G · Adoption | ●● | Marcus Webb | Registry | Ch 8, Resp G3, D1 |
| A-05 | Defend AUC 0.732 over the 0.725 challenger | C · Engineering | ●● | Dr. Sofia Mkhize | ModelVault | Ch 9, Resp C1, D3 |
| A-06 | Answer Elena's fairness challenge | D · Governance | ●●● | Elena Petrova | Sentinel | Ch 10, Resp D4 |
| A-07 | Sign the fraud threshold memo | B · Delivery | ●● | Hana Sato | Sentinel | Ch 11, Resp B1, C1 |
| A-08 | The AML precision-recall story for the regulator | F · Ecosystem | ●● | Hana Sato | Registry | Ch 12, Resp D3, F4 |
| A-09 | KYC vendor model silently updated | F · Ecosystem | ●●● | Pieter van Dijk | IncidentDesk | Ch 13, Resp F2, D5 |
| A-10 | Set the KYC human-in-the-loop QA plan | B · Delivery | ● | Pieter van Dijk | Registry | Ch 14, Resp B1, D4 |
| A-11 | Turn complaint themes into a conduct report | G · Adoption | ●● | Leila Haddad | Reports Studio | Ch 15, Resp B1, G2 |
| A-12 | Block the citation-free GenAI use case | C · Engineering | ● | Sponsor | Registry | Ch 16-17, Resp C2, D1 |
| A-13 | Set the similarity floor and refusal rules | C · Engineering | ●● | Priya Sharma | Gateway Console | Ch 17, Resp C2 |
| A-14 | Golden-set gate: ship or hold at 80%? | B · Delivery | ●● | Priya Sharma | Sentinel | Ch 18, Resp B3, C3 |
| A-15 | Gate the complaint-triage agent in the graph | C · Engineering | ●●● | Tomas Novak | Registry | Ch 19, Resp C2, D2 |
| A-16 | Review the fraud system design: 5,000 TPS | C · Engineering | ●● | Tomas Novak | Registry | Ch 20, Resp C1 |
| A-17 | Decide the routing policy: hosted vs self-hosted | F · Ecosystem | ●● | Tomas Novak | Gateway Console | Ch 21, Resp C2, F1 |
| A-18 | Productionise the scorecard: shadow → canary | B · Delivery | ● | Priya Sharma | Registry | Ch 22, Resp C3, B3 |
| A-19 | Triage RedCell findings; promote two | C · Engineering | ●● | Jonas Lindqvist | RedCell | Ch 23, Resp C4 |
| A-20 | Classify the portfolio under the 2026 rulebook | D · Governance | ●● | Compliance | Registry | Ch 24, Resp D3, F4 |
| A-21 | Build the Council agenda and chair it | A · Strategy & value | ●● | Elena Petrova | Forum Rooms | Ch 25, Resp D1, A4 |
| A-22 | Assemble the binder in one sitting | F · Ecosystem | ●● | Samuel Mensah | RegRoom | Ch 26, Resp F4, D4 |
| A-23 | Run the Chapter 27 incident end-to-end | D · Governance | ●●● | On-call | IncidentDesk | Ch 27, Resp D5 |
| A-24 | Shadow-AI amnesty: convert the FX desk | G · Adoption | ●● | Gateway logs | Registry | Ch 25, 31, Resp D1, G1 |
| A-25 | Write the one-page AI strategy | A · Strategy & value | ●● | Ingrid Halvorsen | ValueBoard | Ch 28, Resp A1 |
| A-26 | WSJF the portfolio; kill one with re-entry | G · Adoption | ●● | Portfolio Board | ValueBoard | Ch 28, Resp A2, G4 |
| A-27 | Close the quarter with Finance co-signature | A · Strategy & value | ●● | Thierry Lacombe | ValueBoard | Ch 28, Resp A3 |
| A-28 | Build the 2027 CoE budget; defend the GPU line | F · Ecosystem | ●● | Thierry Lacombe | CoE Ledger | Ch 29, Resp F3 |
| A-29 | Score two LLM vendors with locked weights | F · Ecosystem | ●● | Nils Strand | VendorGate | Ch 29, Resp F1-F2 |
| A-30 | Design the AI hiring loop; debrief a split panel | E · People | ●● | June Kovacs | PeopleDesk | Ch 30, Resp E1 |
| A-31 | Launch literacy tier 2; report outcomes not completions | E · People | ●● | Ingrid Halvorsen | PeopleDesk | Ch 30, Resp E2-E3 |
| A-32 | The business head going around governance | G · Adoption | ●●● | Mei Chen | AGB Mail | Ch 31, Resp G1, G3 |
| A-33 | Stand up the federated champions model | G · Adoption | ●● | Ingrid Halvorsen | PeopleDesk | Ch 31, Resp G4, E3 |
| A-34 | Technical rounds: defend five design choices | C · Engineering | ●●● | Interview panel | Interview mode | Ch 32, Resp C1-C4 |
| A-35 | The leadership round: answer the regulator letter | F · Ecosystem | ●●● | Henrik Dahl | RegRoom | Ch 33, 24, Resp F4, A4 |
| A-36 | Capstone: the eight-slide board review | A · Strategy & value | ●●● | Board Risk Committee | Reports Studio | Capstone, All clusters |
| A-37 | Stand up the CoE lab and the platform tooling standard | B · Delivery | ● | Tomas Novak | Gateway Console | Ch 4, 21, Resp B4, B2 |
| A-38 | Teach the Council the statistics | C · Engineering | ● | Elena Petrova | ModelVault | Ch 5, 6, Resp C1, A4 |
| A-39 | Run the data-readiness gate before build | B · Delivery | ●● | Priya Sharma | DataBridge | Ch 7, Resp B2, D1 |

## Repository layout
```
index.html            entry point
assets/               base.css (shared chassis) + brand.css (site brand)
src/canon.js          every canonical number from the book — single source of truth
src/site.js           site config: personas, navigation, event rules, day scripts, hero
src/m_*.js            application modules
src/explain.js        "Explain this screen" content
src/missions_data.js  missions, rubrics, model answers, interview questions
src/practice.js       Practice Now engine (workbench, live calculators, library)
src/practice_data_*.js  practice guides keyed by page route
src/framework.js, components.js, charts.js, missions.js, app.js   shared framework (vanilla JS)
data/seed.js          generated seed data (do not hand-edit)
data/DICTIONARY.md    data dictionary
tools/generate_seed.py  deterministic seed generator — run `python3 tools/generate_seed.py`
docs/                 build bible and Phase 1 design pack
```

## Licences
All code, data, icons (inline SVG paths) and charts (in-repo SVG chart library) are original to this project — **no third-party libraries, CDNs, trackers, analytics or web fonts**. Fonts are the reader's system fonts. © 2026 Kumar Abhishek Shahi. Fictional product names (e.g. internal app names) are invented for the fictional organisation and do not refer to real products.

## Integrity
Every page carries the footer: *Training simulation. All organisations, people and data are fictional.* Nothing here represents a real employer, bank, regulator or product. Present it as what it is: practice you built and can defend.
