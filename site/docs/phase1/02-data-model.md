# Phase 1 · Data Model & Dictionary (summary)

Full field-level dictionary is generated with the seed generator in each repo (`data/DICTIONARY.md`). This document fixes the entity catalogue, ID schemes, volumes and canonical-number placement.

## Principles
- One deterministic generator per site (`tools/generate_seed.py`, fixed seed) emits `data/seed.js` (`window.AGB_SEED` / `window.EVL_SEED`) + `DICTIONARY.md`.
- `src/canon.js` holds every Section-2 book number as named constants; the generator imports placement rules from it; QA greps the built site against it.
- All dates are absolute in the fictional year; the UI computes relative labels ("3 days overdue") from the simulated clock (`state.today`).
- User edits overlay seed via localStorage namespace `agb.v1.*` / `evl.v1.*` (try/catch wrapped); export/import = overlay JSON only.
- Every entity has: `id`, `createdAt`, `audit[]` ({ts, actorId, action, comment}), optional `comments[]`.

## ID schemes
AGB: UC-2026-0147 (use case), MDL-0042 (model), VAL-2026-011 (validation), INC-2026-0007, RTF-023 (red-team finding), VEN-AI-08, REQ-COE-0012 (hiring req), FOR-AIC-2026-11 (forum meeting), ACT-0231 (action), POL-07, CTL-NIST-GV-1.1 / CTL-ILL-042 (illustrative), DSR-0019 (data request), DPIA-0008, REG-2026-02 (regulator request), AUD-F-014, BGT-2026, MSG-0001..0060+, PPL-#### (person).
Everline: REQ-ENG-0312 (req), CAND-0251, EMP-0390, VEN-014, SOW-033, INV-2026-118, PRG-09, OKR-Q4-...., ADR-0030, CHG-1182, INC-0061, SLO-08, EXC-0017 (exception), FND-011 (audit finding), DD-ITEM-040, CRS-001, MSG-0001..0060+.

## Site 1 entities (volumes)
| Entity | Vol | Key fields (beyond id/audit) |
|---|---|---|
| useCase | ~65 | title, businessLine, sponsorId, problem, decisionChanged, valueUnit, valueSizeEUR, dataClasses[], residency, lawfulBasis, peopleAffected, autonomy(assist/gated-act/autonomous), tier(T1/T2/T3), materiality, stage(17-state enum), stageHistory[], srScope(SR26-2/GenAI/agentic), euAiActClass, gateArtifacts{required,attached}, approvers[], vendorIds[], modelIds[], valuePromised/Measured, slaIntakeDays |
| model | ~25 prod (+ versions) | name, useCaseId, type(ML/NLP/GenAI/agent), version[], owner, validationStatus, nextReview, cardDoc, champChallenger, overrideRate[] |
| validation | ~30 | modelId, status, findings[{severity, condition}], validator, dates |
| evalRun | 12 mo | golden-set runs: hitAt3, groundedRate, refusalCorrectness, gate pass/fail; canon: 80% hit@3 fail → pass after synonym fix |
| monitorSeries | 12 mo × features | psi[], airSeries (0.92 credit), perfDelayed[], alerts[] |
| incident | ~25 | sev(S1/S2/S3), clockStart, reported24h, timeline[], containment[], blastRadius, postmortem, canon Ch-27 record |
| redFinding | ~20 | plan, exploitability, impact, trace, control, regressionTestId |
| gatewayTeam | ~40 | keys, route(hosted/self-hosted), tokenBudget, burn[], guardrailHits, chargebackLine |
| vendorAI | ~12 | tier(blastRadius), ddq, clauses{...}, scorecard, renewalDate, modelEntries |
| dataset / dataRequest / dpia | ~30/~20/~10 | catalogue entry, lineage edges, qualityGates, approvals |
| forumMeeting / action | 5 forums × 12 | agenda[], papers[], minutes, decisions[], actions[] |
| policy / control | ~10 / ~80 | mapped NIST RMF fn, AI-600-1 cat, illustrative-FS flag, euAiActObligation+date |
| approval | ~40 open | type, raci, delegatedFrom, rationale, decidedAt |
| budgetLine / actuals | 12 mo | rtbCtb, category(people/cloudGPU/licences/vendors), variance, reason |
| coePerson / req / literacy | ~40 / ~6 / 3 tiers | role, perm/vendor, skills[], loopStages, completions |
| regRequest / auditFinding | seeded letter / ~10 | asks[], deadline, binderTabs[8], remediation |
| wsjfItem / valueLedger | ~20 / ~15 | scores, finance co-sign, deltas; canon EUR 4.3M credit |
| message | 60+ | from(stakeholderId), channel, urgency, due, attachments[], linkedTask{module,recordId}, modelReply, toneNotes |
| person (stakeholders) | ~30 | role, line(1st/2nd/3rd/exec/external), personaPermissions |

Canon placement (Site 1): credit AUC 0.732/KS 0.353/Gini 0.464 + GBM 0.725 → model card + ModelVault; AIR 0.92 (82.1% vs 75.2%) → Sentinel fairness; fraud AUC 0.948 + alert budgets 50/100/200/400 → prec 80/80/53.3/41.7, rec 9.4/18.8/25/39.1 → Sentinel + threshold memo doc; AML 404 alerts/33.2% prec/96.4% rec/80 SARs → use case UC detail; similarity floor 0.26 → Gateway config; 5,000 TPS p99<50ms (18+9+12), 24 pods/region → fraud UC design doc; 5-day intake SLA → Registry SLA dash; PSI bands → Sentinel; Ch-27 numbers → IncidentDesk.

## Site 2 entities (volumes)
| Entity | Vol | Key fields |
|---|---|---|
| employee | ~390 (300 eng: 210 perm + 90 vendor) | site(Pune/Rotterdam/Austin), squad, level, manager, tenure, skills, comp{band, compaRatio}, nineBox, flightRisk |
| requisition / candidate | ~40 / ~250 | level, band, costCentre, justification, stage, cv, scorecards[], offer{band check} |
| perfCase | 3 canon + cycle data | type(quiet-decline/brilliant-jerk/PIP), timeline, notes |
| vendor / sow / invoice / timesheet | ~14 / ~30 / 12 mo | tier, spend, seats, rateCard, renewal (WMS +40% canon), qbr[], rfp{weights, scores} |
| budget / actuals / cutOption | $28.4M, 12 mo | rtb 69%, options A $2.4M / B $1.4M / C $0.9M, unitCost 0.142→0.118 |
| program / okr / commitment | 9 / org+6 squads / ~15 | rag, topRisk, burn, p85Date, tradeLog, Fulfilment-2.0 reset, Atlas tracker |
| doraSeries / devex / flow | 6 squads × 4 q | 4 keys, flaky 3.9/5, firstCommit 3.5d, PR p50 7h p90 29h |
| adr / archReview / radarItem / service / debtItem | ~30 / queue / ~40 / 120 / ~25 | Loyalty-v2 seeded review; service tier+slo; debt interest-priced |
| change / release | ~80 | class, freeze calendar, exposure stages, rollback criteria |
| incident / postmortem / rotation | ~60 | canon 41-min BF-eve S2 18k checkouts pool-config; Identity overload; action completion |
| slo | ~10 journeys | target 99.9% = 43 min, burn, 3-state policy |
| control / vuln / finding / exception / recert / drDrill | matrix / backlog / 11 (3 crit) / ~15 / 2 campaigns / 4h12m→38min | evidence links, expiry |
| aiTool / adoptionSeries | ~8 | tier, dataBoundary, provenance metrics |
| boardPack / opsReview / qbrDoc | monthly/quarterly | 8-slide builder data |
| ddItem / crisisItem | ~40 / scenario | data-room docs, holding statements |
| message / stakeholder | 60+ / ~25 | same shape as Site 1 |

Canon placement (Site 2): attrition 19%/12%/27%→14% + exit themes order → PeopleHub; capacity numbers → ArchHub calculator; incident numbers → OnCallOps; budget + cuts + unit cost → FinancePortal; DORA/DevEx numbers → PulseMetrics; 43-min budget → SLOBoard; 11 findings/3 critical + DR 4h12m→38min → TrustDesk.

## Shared practice-layer entities (both sites)
mission {id, title, module, scenario, askerId, difficulty(novice/practitioner/expert), curveballs[], successCriteria[], rubric[{dimension, anchors 1–5}], modelAnswer, interviewQs[{q, modelAnswer, panelChecks, redFlags}], bookMap{chapters[], responsibilities[]}}, progress {missionId, status, score, artifacts[]}, explainPanel {screenId, realWorldCategory, users, cadence, keyFields[], decisions[], failureModes[], talkingPoints[3], bookMap}.
