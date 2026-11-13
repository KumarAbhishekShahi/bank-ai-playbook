# Phase 1 · Sitemap and Screen Inventory

Both sites share a chassis (built twice, skinned distinctly): app launcher, left nav, top bar (global search, notification bell, simulated clock with "Advance day/week/month", persona switcher, avatar menu), breadcrumbs, "Explain this screen" toggle panel, disclaimer footer on every page: *"Training simulation. All organisations, people and data are fictional."*

Legend: each module lists its screens. Every record-detail screen has tabs incl. **Audit trail** and **Comments**; every table has filters, saved views, column picker, CSV export; every approval requires a comment (maker-checker, delegation with logged reason).

---

## SITE 1 — Aurelia Global Bank · "AGB One" (agb-ai-coe-workspace)

You are Dhruv, Head of AI CoE. EUR. Simulated today: **Mon 17 Nov 2026**.

### Shell pages
- **Launcher** (app grid, pinned favourites, announcements)
- **AGB Mail** (comms hub): unified inbox (email/chat/meeting invites/forum paper requests/tickets), thread view with attachments, reply composer → model-reply reveal, task-link chips into modules. 60+ seeded messages.
- **Calendar**: forums, SLA deadlines, renewals, audits, regulator deadline; advancing time fires events (SLA breaches, drift alerts, validation due, council papers due).
- **Org Chart** (navigable; Section 5.1 structure incl. ExCo, 3 lines of defence, business sponsors, CoE team ~40, vendors, regulator)
- **Stakeholder Matrix** (interactive page; drives inbox generation — see doc 03)
- **Missions** (catalogue, mission player, progress tracker, evidence log — doc 04)
- **Global Search** results page (records, people, documents)

### M1 · Command Center (home)
Screens: Dashboard (approvals queue, SLA-at-risk timers, today's forums, drift/incident alerts, portfolio KPIs, value-to-date EUR, messages needing me); personalisable widget layout.

### M2 · Registry (AI Use-Case Registry — the core)
1. **Intake form** — 2-page wizard: business problem, decision changed, value unit+size, data classes & residency, lawful basis, people affected, autonomy level, why now, sponsor, builder team, vendor involvement, attachments; draft save; validation errors.
2. **Pipeline board** — kanban by lifecycle stage (17 states: Idea → … → Retired per brief 5.2); drag blocked unless gate artifacts + approvers satisfied (gate dialog shows missing items).
3. **Register table** — saved views: by business line, by tier, by regulation (SR 26-2 scope / GenAI-agentic; EU AI Act: prohibited / high-risk Annex III / limited / minimal), aging, stalled.
4. **SLA dashboard** — intake-to-tier days vs 5-working-day promise, median + distribution, breach list.
5. **Use-case detail** — tabs: Summary, Risk & tier rationale (materiality × autonomy matrix widget), Data, Models & versions, Evaluations, Approvals, Controls mapping, Monitoring, Incidents, Value, Documents, Audit trail, Comments.
6. **Shadow-AI reconciliation** — registry vs Gateway caller logs diff; unregistered-usage list; "convert to intake" amnesty workflow.
Seed: 5 flagships with full histories + ~60 Appendix-B use cases across all stages/tiers/lines incl. stalled, rejected, paused, retired.

### M3 · ModelVault (model inventory & model risk, second-line view)
Model register (owner, tier, version, validation status, next review); validation queue; findings (severity, conditions); model cards (full card per flagship); champion/challenger pairs; override-rate monitor; SR 26-2 scope flags. Persona: Head of Model Risk sees the queue as worklist.

### M4 · Approvals Hub
All pending approvals cross-module; RACI per approval type; delegation ("approve on behalf of", logged reason); escalation rules; decision records with mandatory rationale; my-decisions history.

### M5 · Forum Rooms (governance forums)
One room each: AI Council (monthly, co-chaired with CRO), Portfolio Board (monthly), Platform Review (fortnightly), Value Review (quarterly, Finance), Community of Practice (fortnightly). Per room: agenda builder, paper submission + pre-reads, minutes editor, decisions log, action tracker (owner, due date, overdue flags).

### M6 · PolicyDesk (policy & controls library)
AI policy, acceptable-use standard, approved-AI-tool register (tool × permitted data class × approver), incident standard; controls mapped to NIST AI RMF functions + NIST AI 600-1 categories + illustrative FS-AI-RMF-style set (banner: "illustrative"); EU AI Act obligations tracker with real dates (GPAI Aug 2025, transparency Aug 2026, Annex III 2 Dec 2027, Annex I 2 Aug 2028).

### M7 · Sentinel (evaluation & monitoring console)
Golden-set runs per release with gates (hit@k incl. the 80% hit@3 fail→pass-after-synonym-fix story, grounded-answer rate, refusal correctness); fairness monitors (adverse impact ratio over time, 0.92 credit AIR with trigger lines); PSI drift per feature with OK <0.10 / WATCH 0.10–0.25 / ACT >0.25 bands; delayed-ground-truth performance; alert → open incident workflow. 12 months of seeded history.

### M8 · Gateway Console (LLM gateway)
Onboarded teams & keys (~40 teams); routing policy by data tier (hosted API vs self-hosted open-weight); token budgets & burn; chargeback by business line; guardrail hits (PII scrubs, injection blocks); sanitised blocked-prompt log; latency & cost per route; model registry & approved versions; copilot similarity floor 0.26 surfaced in config.

### M9 · IncidentDesk
S1/S2/S3 ladder; 24-hour internal reporting clock (live countdown); timeline builder; containment actions; blast-radius analysis from audit logs; comms drafts; blameless postmortem with owned actions. Seed: Ch-27 copilot incident (EUR 300 dinner, chunking defect, S2, 11 similar queries/60 days) + bias drift on credit + vendor KYC model silently updated + data pasted into unapproved tool + agent exceeding step budget + ~20 more mixed.

### M10 · RedCell (red-team & AI security)
Test plans; findings ranked exploitability × impact; proof traces; controls; owners; "promote to regression test" → links into Sentinel golden set; OWASP LLM & Agentic Top 10 tags.

### M11 · VendorGate (third-party AI risk)
Vendor register tiered by blast radius (~12 vendors: LLM API, open-weight support, KYC doc-AI, fraud scoring, vector DB, consulting + more); due-diligence questionnaires; contract clause checklist (exit/portability, change notification, evaluation rights, incident cooperation, audit access); scorecards with weights locked before demos; renewal calendar; vendor-model entries cross-linked to Registry.

### M12 · DataBridge (data readiness & privacy)
Dataset catalogue; lineage views (SVG graphs); quality gate results; data-access requests & approvals; DPIA workflow with DPO sign-off.

### M13 · ValueBoard (portfolio & value)
WSJF board scored by sponsors; business cases; one-page AI strategy (bets, non-goals, scoreboard); value ledger (promised vs measured, Finance co-signature, delta explanations; credit ≈ EUR 4.3M/yr); pause/kill decisions with re-entry conditions.

### M14 · CoE Ledger (finance)
Budget RTB/CTB (people, cloud/GPU, licences, vendors); forecast vs actual with variance reasons; GPU-vs-API cost calculator; unit costs (per 1,000 decisions, per copilot query); chargeback statements. 12 months of actuals.

### M15 · PeopleDesk
CoE org chart (~40, perm+vendor); AI-role requisitions & pipeline (book's loop design + rubrics); skills matrix; 1:1 notes; three-tier literacy programme (completions, outcomes); champions network roster & activity.

### M16 · RegRoom (regulatory & audit)
Regulator request tracker (seed: supervisory letter — AI inventory + governance framework + 3 model files in 4 weeks, deadline on the calendar); audit findings tracker (accept, root cause, remediation, closure evidence); **Evidence Binder builder** — assembles the 8-tab binder for a chosen use case from live system data, print view.

### M17 · Reports Studio
Generate + print: monthly AI Council pack; quarterly Board Risk Committee AI report; CRO risk dashboard; CFO value report; regulator inventory return; business-line one-pagers; the 8-slide capstone board review. Each pulls live data; print-to-PDF stylesheets.

---

## SITE 2 — Everline Group · "Everline Hub" (everline-eng-head-workspace)

You are Asha, Head of Engineering, Platforms & Commerce. USD (INR dual for Pune). Simulated today: **Mon 3 Nov 2026**; Black Friday **Fri 28 Nov**.

### Shell pages
Same chassis: Launcher, **EverMail** (60+ messages), Calendar (freeze windows, QBRs, board dates, renewal dates, Black Friday countdown), Org Chart (Section 6.1; ~300 engineers over Pune/Rotterdam/Austin), Stakeholder Matrix, Missions, Search.

### E1 · Command Center
Approvals, today's meetings, OKR health, DORA trend sparkline, SLO burn, open Sev incidents, budget variance, hiring funnel, attrition alerts, messages needing me.

### E2 · TalentHub (ATS)
Headcount plan vs approved reqs; req create+approve (justification, level, band, cost centre, location); pipeline kanban (~40 reqs, ~250 candidates); candidate profiles with fictional CVs; loop builder (org-design case, system design, written exercise, behavioural); scheduling grid; structured scorecards with rubric anchors; debrief page; offer builder with band checks + approval chain; agency management; diversity-of-slate & time-to-fill reports.

### E3 · PeopleHub (HRIS)
Org chart (perm+vendor); profiles (tenure, level, manager, skills); performance cycle (goals, reviews, calibration room with distribution curve); the three book performance cases (quiet decline / brilliant jerk / PIP) as records with notes+timelines; PIP tracker; promotion packets vs public ladder; comp review (bands, compa-ratios, outlier flags, exception budget); 9-box + succession lines per director & critical platform; engagement/DevEx survey results; attrition dashboard (19% vs market 12%, senior 27%→14%, coded exit themes); skip-level & 1:1 tracker.

### E4 · VendorDesk
Vendor register (~14: tier, spend, seats, SOWs, rate cards, contract dates); timesheets & invoice approval; seat ramp plans; QBR builder (SLA performance, promises kept, incidents, vendor-side attrition, scorecard, actions); RFP module (weights locked before demos, independent scoring, pilot results); renewal calendar; exit pricing calculator (WMS vendor +40% renewal scenario); risk tiering & clause checks.

### E5 · FinancePortal
Bottom-up budget builder (people role×loaded cost, cloud, licences, programmes; RTB/CTB; $28.4M, RTB 69%); monthly forecast vs actual, one-line cause per >5% variance; purchase reqs & approval limits; capex/opex tagging; **15% cut scenario planner** (A pause programmes $2.4M / B vendor ramp-down $1.4M / C cloud+licences $0.9M); cloud FinOps (unit cost per order $0.142→$0.118, untagged-spend shame line, rightsizing, scheduling, commitments); showback by business line. 12 months actuals.

### E6 · DeliveryBoard (portfolio & delivery)
OKRs (org+squad); quarterly plan at ~70% capacity with cut-line + "not now" list; program register (9 funded; owner-confidence RAG, top risk, burn vs plan); RAID logs; dependency map (SVG); red program **Fulfilment 2.0** with five-move reset; P85 commitments with visible-trades change log; **Atlas strangler tracker** (domains peeled, cutovers, reversibility, retirement).

### E7 · PulseMetrics (engineering metrics)
DORA four keys by squad×quarter (4 quarters, 6 squads, book year-one trend); flow metrics (WIP, blocked age); escape rate; DevEx survey with funded actions (flaky tests 3.9/5 top friction, 3.5 days to first commit); PR wait p50 7h / p90 29h; build times; AI-assisted engineering metrics by provenance tier.

### E8 · ArchHub
ADR registry (~30); Architecture Review Forum queue (submission, checklist, findings memo: risk/consequence/severity/recommendation, decision) seeded with flawed **Loyalty v2** doc; tech radar (adopt/trial/assess/hold); service catalogue (120 apps: owners, tiers, SLOs); tech-debt register priced by interest; NFR/performance budgets; **capacity calculator** (26M orders/day, ×8 peak = 2,407 TPS, ~7,222 DB writes/s, 4 shards, 27 pods).

### E9 · ReleaseGate (change & release)
Change requests (standard vs risky); pipeline-approved changes; change calendar with freeze/"slush" windows (Black Friday freeze seeded); exposure stages 1%→10%→100% with rollback criteria.

### E10 · OnCallOps (incident & on-call)
Incident records (severity, IC, comms cadence, decision log) — seed Black-Friday-eve 41-min S2, ~18k failed checkouts, connection-pool config cause, + ~60 more; on-call rotations with depth & pages/week (Identity squad overload seeded); postmortems with action completion rates; problem records; repeat-incident rate.

### E11 · SLOBoard (reliability)
Journey SLOs; burn charts; 99.9% = 43-min monthly budget; three-state budget policy; sign-offs.

### E12 · TrustDesk (GRC & security)
Control matrix with evidence links; vuln backlog by SLA; audit findings tracker (11 inherited, 3 critical); exceptions register (compensating control, acceptor, expiry — "exceptions expire"); access recert campaigns with diffs; leaver-removal p95; DR drill calendar+results (4h12m → 38 min); third-party risk register.

### E13 · CopilotDesk (AI adoption)
Approved-tool register; adoption by tier; data-boundary rules; provenance-tagged quality metrics.

### E14 · BoardRoom (exec & board reporting)
Monthly ops review pack; QBRs with business partners; 8-slide board pack builder (bad news slide 1, decisions slide 8); ExCo one-pagers; "where are we on AI" brief. Print styles.

### E15 · DealRoom (M&A diligence)
Simulated data room for acquisition target (architecture docs, org chart, incident history, cloud bills, licences); 10-day DD checklist; interview notes; priced verdict template.

### E16 · CrisisDesk
Holding statements; disclosure decision tree; contact lattice; cadence tracker; supplier-breach scenario seeded (with journalist query in EverMail).

---

## Cross-cutting counts
- Site 1: 17 modules + 7 shell pages ≈ **95–105 distinct screens**.
- Site 2: 16 modules + 7 shell pages ≈ **100–110 distinct screens**.
- Both: persona switcher changes queues/permissions/widgets per stakeholder (view-level simulation); "Explain this screen" content authored per screen (category-equivalent system, users & cadence, key fields, decisions informed, failure modes, interview talking points in mechanism+number+named-cost form, book mapping).
