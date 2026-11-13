/* AGB canon — every number from "The Bank AI Playbook" lives here, once. QA greps screens against this file. */
"use strict";
const CANON = {
  todaySeed: "2026-11-17",
  // Use case 1 — credit risk scoring
  credit: { auc: 0.732, ks: 0.353, gini: 0.464, gbmAuc: 0.725, air: 0.92, approvalRef: 82.1, approvalProt: 75.2, valueEUR: 4.3e6, proxy: "income and utilisation" },
  // Use case 2 — fraud & AML
  fraud: {
    auc: 0.948,
    budgets: [{ alerts: 50, precision: 80.0, recall: 9.4 }, { alerts: 100, precision: 80.0, recall: 18.8 }, { alerts: 200, precision: 53.3, recall: 25.0 }, { alerts: 400, precision: 41.7, recall: 39.1 }],
    design: { tps: 5000, p99ms: 50, featureMs: 18, modelMs: 9, networkMs: 12, podsPerRegion: 24 }
  },
  aml: { alerts: 404, precision: 33.2, recall: 96.4, sars: 80 },
  // Use case 5 — copilot & agents
  copilot: { simFloor: 0.26, hitAt3Fail: 80, hitAt3Gate: 85, incident: { amountEUR: 300, sev: "S2", similarQueries: 11, windowDays: 60, cause: "chunking defect" } },
  // Governance
  slaIntakeDays: 5,
  psi: { ok: 0.10, act: 0.25 },
  reporting24h: 24,
  binderTabs: ["1 · Governance & approvals", "2 · Intake & tiering", "3 · Data & privacy (DPIA)", "4 · Model development & cards", "5 · Evaluation & fairness", "6 · Deployment & change", "7 · Monitoring & incidents", "8 · Value & review decisions"],
  regs: {
    sr262: "SR 26-2 (April 2026) replaced SR 11-7 for traditional and ML models; generative and agentic AI are explicitly out of its scope.",
    nist: "NIST AI RMF 1.0 (Govern, Map, Measure, Manage) + NIST AI 600-1 Generative AI Profile.",
    fsairmf: "US Treasury FS AI RMF (February 2026): 230 control objectives. Control IDs shown here are illustrative, not official.",
    euDates: [["GPAI rules in force", "2025-08-01"], ["Transparency obligations", "2026-08-01"], ["Annex III high-risk obligations", "2027-12-02"], ["Annex I obligations", "2028-08-02"]],
    others: "GDPR · DORA · BCBS 239 · ECOA/Reg B adverse action · OWASP LLM & Agentic Top 10"
  },
  forums: [
    { id: "portfolio", name: "Portfolio Board", cadence: "Monthly" },
    { id: "council", name: "AI Council", cadence: "Monthly, co-chaired with the CRO (second line attends)" },
    { id: "platform", name: "Platform Review", cadence: "Fortnightly" },
    { id: "cop", name: "Community of Practice", cadence: "Fortnightly" },
    { id: "value", name: "Value Review", cadence: "Quarterly, with Finance" }
  ],
  ragContracts: ["No citation, no answer", "Below the similarity floor, refuse and escalate", "Log everything"],
  stages: ["Idea", "Intake submitted", "Triage", "Risk tiering", "Approved to build", "Data readiness", "In development", "Pre-production evaluation", "Independent validation", "GenAI evaluation gate", "Approval forum", "Deployment (shadow)", "Deployment (canary)", "In production", "Periodic review", "Suspended", "Retired"],
  rejectedStage: "Rejected", pausedStage: "Paused"
};
