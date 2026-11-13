/* AGB modules: Command Center + Registry */
"use strict";

/* ================= Command Center ================= */
SITE.modules.push({
  id: "cc", icon: "home", label: "Command Center", home: "cc", color: "#0d2240", desc: "Your day at a glance",
  routes: {
    "cc": (main) => {
      const me = Personas.current();
      main.append(C.crumbs({ label: "Command Center" }), C.pageHead("Command Center",
        me.id === "you" ? "Good morning, Dhruv. Here is what needs you." : `Viewing as ${me.name} (${me.role}) — their widgets, their queues.`));
      const ucs = Store.all("useCases");
      const prod = ucs.filter(u => u.stage === "In production").length;
      const t1 = ucs.filter(u => u.tier === "T1").length;
      const pend = Store.all("approvals").filter(a => a.status === "Pending");
      const vl = Store.all("valueLedger");
      const measured = U.sum(vl.filter(v => v.measuredEUR), "measuredEUR");
      const opensInc = Store.all("incidents").filter(i => i.status !== "Closed" && !i.status.startsWith("Closed"));
      if (me.id === "elena") {
        main.append(U.h("div", { class: "grid4" },
          C.stat("T1 use cases", t1), C.stat("Open validation findings", Store.all("validations").flatMap(v => v.findings).filter(f => f.sev !== "Low").length),
          C.stat("Open incidents", opensInc.length, null, opensInc.length ? "warn" : "ok"),
          C.stat("Fairness AIR (credit)", SEED.air[11].toFixed(2), "trigger line 0.95 · floor 0.90", "warn")));
        main.append(U.h("div", { class: "grid2", style: { marginTop: "1rem" } },
          U.h("div", { class: "card" }, U.h("h3", null, "Tier distribution"), Charts.donut({ items: [{ label: "T1", value: t1, color: "#b02a37" }, { label: "T2", value: ucs.filter(u => u.tier === "T2").length, color: "#c07f00" }, { label: "T3", value: ucs.filter(u => u.tier === "T3").length, color: "#1d7a3e" }], centre: String(ucs.length), centreSub: "use cases" })),
          U.h("div", { class: "card" }, U.h("h3", null, "What Elena asks Dhruv for"), U.h("ul", { style: { paddingLeft: "1.1rem", fontSize: ".88rem" } },
            U.h("li", null, "Monthly: tier distribution, open findings, incidents + time-to-contain, fairness triggers"),
            U.h("li", null, "Ad hoc: any S1/S2 within the 24-hour internal clock"),
            U.h("li", null, "Decides: risk appetite, T1 approvals, escalations, suspensions")))));
        return;
      }
      if (me.id === "thierry") {
        main.append(U.h("div", { class: "grid4" },
          C.stat("Value measured (co-signable)", U.money(measured)), C.stat("Budget plan 2026", U.money(SEED.budget.totalEUR)),
          C.stat("Cost / 1k decisions", "€" + SEED.budget.unitCosts.costPer1kDecisionsEUR), C.stat("Cost / copilot query", "€" + SEED.budget.unitCosts.costPerCopilotQueryEUR)));
        main.append(U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "Value ledger (Finance view)"),
          C.table({ id: "ccvl", rows: Store.all("valueLedger").filter(v => v.promisedEUR), pageSize: 8, columns: [
            { key: "title", label: "Use case" }, { key: "promisedEUR", label: "Promised", render: r => U.money(r.promisedEUR) },
            { key: "measuredEUR", label: "Measured", render: r => U.money(r.measuredEUR) },
            { key: "financeCosign", label: "Co-signed", render: r => r.financeCosign ? C.pill("co-signed", "green") : C.pill("not yet", "amber") },
            { key: "delta", label: "Delta note" }] })));
        return;
      }
      // default / Dhruv view
      const slaBad = ucs.filter(u => ["Intake submitted", "Triage"].includes(u.stage));
      main.append(U.h("div", { class: "grid4" },
        C.stat("Approvals waiting on you", pend.length, pend.filter(p => U.dueClass(p.due) === "breach").length + " past due", pend.length > 10 ? "warn" : ""),
        C.stat("Use cases in production", prod, t1 + " are Tier 1"),
        C.stat("Value measured YTD", U.money(measured), "vs " + U.money(U.sum(vl, "promisedEUR")) + " promised"),
        C.stat("Open incidents", opensInc.length, "S2: " + opensInc.filter(i => i.sev === "S2").length, opensInc.length ? "warn" : "ok")));
      const today = Clock.today();
      const todays = (SEED.calendar || []).filter(e => e.date >= today).slice(0, 5);
      main.append(U.h("div", { class: "grid2", style: { marginTop: "1rem" } },
        U.h("div", { class: "card" }, U.h("h3", null, "SLA timers at risk ", U.h("span", { class: "spacer" }), U.h("a", { class: "small", href: "#/registry/sla" }, "SLA dashboard ›")),
          slaBad.length ? U.h("table", { class: "data" }, U.h("tbody", null, slaBad.slice(0, 6).map(u => {
            const days = U.daysBetween(u.createdAt, today);
            return U.h("tr", null, U.h("td", null, U.h("a", { href: "#/registry/uc/" + u.id }, u.id), U.h("span", { class: "sub" }, u.title)),
              U.h("td", { class: "right" }, U.h("span", { class: "sla " + (days > 5 ? "breach" : days >= 4 ? "atrisk" : "ok") }, `day ${days} of ${CANON.slaIntakeDays}`)));
          }))) : U.h("p", { class: "muted small" }, "No intakes waiting on a tier decision. The 5-day promise holds."),
          U.h("h3", { style: { marginTop: "1rem" } }, "Today & next"),
          U.h("ul", { style: { listStyle: "none", fontSize: ".86rem" } }, todays.map(e => U.h("li", { style: { padding: ".25rem 0" } },
            U.h("span", { class: "sla " + U.dueClass(e.date, 2) }, U.rel(e.date)), " — ", e.link ? U.h("a", { href: e.link }, e.title) : e.title)))),
        U.h("div", { class: "card" }, U.h("h3", null, "Alerts ", U.h("span", { class: "spacer" }), U.h("a", { class: "small", href: "#/sentinel" }, "Sentinel ›")),
          U.h("ul", { style: { listStyle: "none", fontSize: ".86rem" } }, SEED.monitorAlerts.map(a => U.h("li", { style: { padding: ".3rem 0", borderBottom: "1px dashed var(--line-soft)" } },
            C.pill(a.sev === "warn" ? "watch" : "ok", a.sev === "warn" ? "amber" : "green"), " ", a.text))),
          U.h("h3", { style: { marginTop: "1rem" } }, "Messages that need you ", U.h("span", { class: "spacer" }), U.h("a", { class: "small", href: "#/mail" }, "AGB Mail ›")),
          U.h("ul", { style: { listStyle: "none", fontSize: ".86rem" } },
            Store.all("messages").filter(m => m.urgency === "high").slice(0, 4).map(ms => U.h("li", { style: { padding: ".25rem 0" } },
              C.pill("urgent", "red"), " ", U.h("a", { href: "#/mail/" + ms.id }, ms.subject)))))));
      main.append(U.h("div", { class: "grid2", style: { marginTop: "1rem" } },
        U.h("div", { class: "card" }, U.h("h3", null, "Portfolio by stage"),
          Charts.hbars({ items: Object.entries(U.group(ucs, "stage")).map(([s, xs]) => ({ label: s, value: xs.length, color: s === "In production" ? "#1d7a3e" : s === "Rejected" ? "#b02a37" : "#0e5f74" })).sort((a, b) => b.value - a.value).slice(0, 10), padL: 190 })),
        U.h("div", { class: "card" }, U.h("h3", null, "Value to date (EUR, cumulative measured)"),
          Charts.line({ labels: SEED.months.map(m => m.slice(5)), series: [{ label: "Measured", points: SEED.months.map((_, i) => Math.round(measured * (i + 1) / 12)) }, { label: "Promised run-rate", points: SEED.months.map((_, i) => Math.round(U.sum(vl, "promisedEUR") * (i + 1) / 12)) }], fmt: v => U.money(v) }))));
    }
  }
});

/* ================= Registry ================= */
const FLAGSHIP = {
  "UC-2026-0101": () => [["AUC", CANON.credit.auc], ["KS", CANON.credit.ks], ["Gini", CANON.credit.gini], ["GBM challenger AUC", CANON.credit.gbmAuc], ["Adverse impact ratio", CANON.credit.air], ["Value / year", U.money(CANON.credit.valueEUR)]],
  "UC-2026-0102": () => [["AUC", CANON.fraud.auc], ["Throughput", "5,000 TPS"], ["p99 latency budget", "< 50 ms"], ["Budget split", "18 ms features + 9 ms model + 12 ms network"], ["Pods", CANON.fraud.design.podsPerRegion + " pods per region"], ["Alert budget", "100/day @ 80% precision"]],
  "UC-2026-0103": () => [["Alerts in queue", CANON.aml.alerts], ["Precision", CANON.aml.precision + "%"], ["Recall", CANON.aml.recall + "%"], ["SARs filed", CANON.aml.sars + " SARs"]],
  "UC-2026-0104": () => [["Straight-through", "70%"], ["QA sampling", "2% / 10% by confidence band"], ["Aug vendor change", "caught in 4 days (INC-2026-0011)"]],
  "UC-2026-0105": () => [["Macro-F1", "0.84"], ["Volume", "~30k complaints/month"], ["Use", "Conduct report, human-reviewed flags"]],
  "UC-2026-0106": () => [["Similarity floor", CANON.copilot.simFloor], ["Gate", "hit@3 ≥ " + CANON.copilot.hitAt3Gate + "%"], ["v1.4", CANON.copilot.hitAt3Fail + "% — held, synonym fix"], ["Ch-27 incident", "EUR " + CANON.copilot.incident.amountEUR + " dinner · " + CANON.copilot.incident.sev]],
  "UC-2026-0107": () => [["Autonomy", "gated-act"], ["Auto-resolution", "34% at 0.4% overturn"], ["Step budget", "12 steps, hard halt"], ["Expansion rule", "4 weeks < 0.5% overturn"]]
};
const REG = {
  stageColor(s) {
    if (s === "In production") return "#1d7a3e"; if (["Rejected", "Suspended"].includes(s)) return "#b02a37";
    if (["Paused", "Retired"].includes(s)) return "#7a8699"; if (s.startsWith("Deployment")) return "#c07f00";
    return "#0e5f74";
  },
  gateFor(uc, targetStage) {
    // artifacts required to ENTER targetStage
    const req = (uc.gateArtifacts || []).filter(g => g.stage === targetStage);
    return req.map(g => ({ label: g.name, ok: g.attached }));
  },
  stageIndex(s) { const i = CANON.stages.indexOf(s); return i < 0 ? 99 : i; }
};
SITE.modules.push({
  id: "registry", icon: "flow", label: "Registry", home: "registry", color: "#0e5f74",
  desc: "AI use-case inventory & lifecycle",
  navCount: () => Store.all("useCases").filter(u => ["Intake submitted", "Triage", "Risk tiering"].includes(u.stage)).length || null,
  routes: {
    "registry": (main) => {
      main.append(C.crumbs({ label: "Registry" }), C.pageHead("AGB Registry — AI use-case inventory",
        "Every use case from idea to retirement. Advancement is gated: required artifacts and approvers per stage.",
        U.h("a", { class: "btn", href: "#/registry/intake" }, "+ New intake"),
        U.h("a", { class: "btn sec", href: "#/registry/board" }, "Lifecycle board"),
        U.h("a", { class: "btn sec", href: "#/registry/sla" }, "SLA dashboard"),
        U.h("a", { class: "btn sec", href: "#/registry/shadow" }, "Shadow-AI reconciliation")));
      const ucs = Store.all("useCases");
      main.append(U.h("div", { style: { marginBottom: "1rem" } }, Charts.flow(
        ["Intake submitted", "Risk tiering", "Approved to build", "In development", "Pre-production evaluation", "Approval forum", "In production"].map(s => ({ label: s.replace("Pre-production", "Pre-prod"), count: ucs.filter(u => u.stage === s).length, color: REG.stageColor(s) })), { stageW: 118 })));
      main.append(C.table({
        id: "reg", rows: ucs, pageSize: 18, defaultSort: "id",
        views: [
          { label: "All use cases" },
          { label: "By tier: T1 only", filter: r => r.tier === "T1" },
          { label: "SR 26-2 in scope", filter: r => r.srScope === "SR 26-2" },
          { label: "GenAI & agentic (out of SR 26-2)", filter: r => r.srScope !== "SR 26-2" },
          { label: "EU AI Act: high-risk (Annex III)", filter: r => (r.euAiActClass || "").includes("high-risk") },
          { label: "In production", filter: r => r.stage === "In production" },
          { label: "Stalled / paused / rejected", filter: r => ["Paused", "Rejected", "Suspended", "Retired"].includes(r.stage) },
          { label: "Aging: >60 days pre-production", filter: r => !["In production", "Retired", "Rejected", "Periodic review"].includes(r.stage) && U.daysBetween(r.createdAt, Clock.today()) > 60 }
        ],
        columns: [
          { key: "id", label: "ID", render: r => U.h("span", { class: "mono" }, r.id), width: "120px" },
          { key: "title", label: "Use case", render: r => U.h("span", null, U.h("b", null, r.title), U.h("span", { class: "sub" }, r.problem.slice(0, 70) + "…")) },
          { key: "businessLine", label: "Business line", filter: "select" },
          { key: "type", label: "Type", filter: "select", render: r => C.pill(r.type, r.type === "Agentic" ? "purple" : r.type === "GenAI" ? "teal" : "blue") },
          { key: "tier", label: "Tier", filter: "select", render: r => C.pill(r.tier) },
          { key: "euAiActClass", label: "EU AI Act", filter: "select", render: r => C.pill(r.euAiActClass, (r.euAiActClass || "").includes("high") ? "red" : "gray") },
          { key: "stage", label: "Stage", filter: "select", render: r => C.pill(r.stage) },
          { key: "sponsorId", label: "Sponsor", render: r => C.personName(r.sponsorId), filterVal: r => C.personName(r.sponsorId), filter: "select" },
          { key: "valuePromisedEUR", label: "Value (promised)", render: r => U.money(r.valuePromisedEUR), sortVal: r => r.valuePromisedEUR || 0 }
        ],
        onRow: r => Router.go("registry/uc/" + r.id)
      }));
    },

    "registry/board": (main) => {
      main.append(C.crumbs({ label: "Registry", href: "#/registry" }, { label: "Lifecycle board" }),
        C.pageHead("Lifecycle board", "Drag a card to advance a stage. The gate dialog blocks moves when required artifacts or approvers are missing — exactly like the real forum would."));
      const cols = ["Intake submitted", "Triage", "Risk tiering", "Approved to build", "Data readiness", "In development", "Pre-production evaluation", "Independent validation", "GenAI evaluation gate", "Approval forum", "Deployment (shadow)", "Deployment (canary)", "In production"];
      main.append(C.kanban({
        columns: cols.map(s => ({ id: s, label: s, color: REG.stageColor(s) })),
        cards: Store.all("useCases").filter(u => cols.includes(u.stage)),
        colOf: u => u.stage,
        renderCard: u => U.h("div", { class: "kcard", onclick: () => Router.go("registry/uc/" + u.id) },
          U.h("div", { class: "id mono" }, u.id), U.h("div", { class: "t" }, u.title),
          U.h("div", { class: "meta" }, C.pill(u.tier), C.pill(u.type, u.type === "Agentic" ? "purple" : "teal"), U.h("span", { class: "muted small" }, u.businessLine))),
        onMove: (u, to) => {
          const fromIdx = REG.stageIndex(u.stage), toIdx = REG.stageIndex(to);
          if (toIdx !== fromIdx + 1) return "Stages advance one gate at a time (or use the detail page for exceptional moves with a logged rationale).";
          const gates = REG.gateFor(u, to);
          const missing = gates.filter(g => !g.ok);
          if (missing.length) {
            Modal.open("Gate blocked — " + to, () => [
              U.h("p", { class: "small" }, `${u.id} cannot enter “${to}” until every required artifact is attached:`),
              C.gateChecklist(gates),
              U.h("p", { class: "muted small", style: { marginTop: ".6rem" } }, "Attach artifacts from the use-case detail page (Documents tab). Required approvers for this gate: " + ((Object.entries({ "Risk tiering": "Head of AI CoE", "Independent validation": "Head of Model Risk", "GenAI evaluation gate": "CoE + Red-Team", "Approval forum": "AI Council (CRO for T1)" })).find(([k]) => k === to)?.[1] || "per RACI in Approvals Hub") + ".")
            ]);
            return "Move blocked by gate — see the checklist.";
          }
          Store.save("useCases", u.id, { stage: to }, `Stage advanced to ${to}`, "Gate checklist satisfied");
          Toast.show(`${u.id} advanced to ${to}.`, "ok");
          return true;
        }
      }));
    },

    "registry/sla": (main) => {
      main.append(C.crumbs({ label: "Registry", href: "#/registry" }, { label: "SLA dashboard" }),
        C.pageHead("Intake SLA dashboard", `The CoE promise: a tier decision within ${CANON.slaIntakeDays} working days of intake. This dashboard is reviewed at every AI Council.`));
      const ucs = Store.all("useCases");
      const decided = ucs.filter(u => u.intakeDays != null && !["Idea", "Intake submitted", "Triage"].includes(u.stage));
      const waiting = ucs.filter(u => ["Intake submitted", "Triage", "Risk tiering"].includes(u.stage));
      const med = (() => { const a = decided.map(u => u.intakeDays).sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : 0; })();
      const breaches = decided.filter(u => u.intakeDays > CANON.slaIntakeDays);
      main.append(U.h("div", { class: "grid4" },
        C.stat("Median intake → tier", med + " days", "promise: " + CANON.slaIntakeDays + " working days", med <= CANON.slaIntakeDays ? "ok" : "bad"),
        C.stat("Decisions within SLA", U.pct(100 * (decided.length - breaches.length) / Math.max(1, decided.length), 0)),
        C.stat("Breaches (12 mo)", breaches.length, "each with a cause in the council pack", breaches.length ? "warn" : "ok"),
        C.stat("Waiting now", waiting.length, waiting.filter(u => U.daysBetween(u.createdAt, Clock.today()) > CANON.slaIntakeDays).length + " past promise", "warn")));
      main.append(U.h("div", { class: "grid2", style: { marginTop: "1rem" } },
        U.h("div", { class: "card" }, U.h("h3", null, "Distribution of intake-to-tier days"),
          Charts.bars({ labels: ["1", "2", "3", "4", "5", "6", "7", "8+"], series: [{ label: "Intakes", points: [1, 2, 3, 4, 5, 6, 7, 8].map(dd => decided.filter(u => dd === 8 ? u.intakeDays >= 8 : u.intakeDays === dd).length) }], fmt: v => U.num(v, 0) }),
          U.h("p", { class: "muted small" }, "Everything right of the red line is a broken promise. Causes cluster on sponsor clarification loops — fix the intake form, then capacity.")),
        U.h("div", { class: "card" }, U.h("h3", null, "Waiting on a tier decision now"),
          U.h("table", { class: "data" }, U.h("tbody", null, waiting.map(u => {
            const dd = U.daysBetween(u.createdAt, Clock.today());
            return U.h("tr", null, U.h("td", null, U.h("a", { href: "#/registry/uc/" + u.id }, u.id), U.h("span", { class: "sub" }, u.title)),
              U.h("td", null, C.pill(u.stage)), U.h("td", { class: "right" }, U.h("span", { class: "sla " + (dd > 5 ? "breach" : dd >= 4 ? "atrisk" : "ok") }, "day " + dd)));
          }))))));
    },

    "registry/shadow": (main) => {
      main.append(C.crumbs({ label: "Registry", href: "#/registry" }, { label: "Shadow-AI reconciliation" }),
        C.pageHead("Shadow-AI reconciliation", "Registry vs AGB Gateway caller logs. Unregistered usage gets an amnesty path, not an autopsy: convert it to an intake, keep the user."));
      const sh = Store.all("shadow");
      main.append(C.banner("info", U.h("b", null, "Amnesty beats autopsy. "), "The goal of reconciliation is a complete inventory, not punishment. Every converted caller is one less thing the supervisory letter can surprise you with."));
      main.append(C.table({
        id: "shadow", rows: sh, columns: [
          { key: "caller", label: "Gateway caller (unregistered)", render: r => U.h("span", { class: "mono" }, r.caller) },
          { key: "volume30d", label: "Calls / 30 days", render: r => U.num(r.volume30d, 0), sortVal: r => r.volume30d },
          { key: "note", label: "What it looks like" },
          { key: "registered", label: "Status", render: r => r.registered ? C.pill("converted to intake", "green") : C.pill("unregistered", "red") },
          {
            key: "act", label: "", render: r => r.registered ? "—" : U.h("button", {
              class: "btn sm", onclick: (e) => {
                e.stopPropagation();
                Store.save("shadow", r.id, { registered: true }, "Converted to intake under amnesty", "No-blame conversion; owner briefed on tiering path");
                const nid = "UC-2026-0" + (900 + Math.floor(Math.random() * 90));
                Store.create("useCases", { id: nid, title: "Converted: " + r.caller, businessLine: "Group Operations", type: "GenAI", autonomy: "assist", tier: "T3", euAiActClass: "limited", srScope: "GenAI", stage: "Intake submitted", sponsorId: "PPL-0002", ownerId: "PPL-0013", problem: r.note, decisionChanged: "To be captured at intake", valueUnit: "hours saved/month", dataClasses: ["internal docs"], residency: "EU", lawfulBasis: "legitimate interest", peopleAffected: "employees", whyNow: "Shadow-AI amnesty conversion", vendorIds: [], modelIds: [], createdAt: Clock.today(), intakeDays: null, stageHistory: [], gateArtifacts: [], tierRationale: "", audit: [{ ts: Clock.today() + " 10:00", actor: Personas.current().name, action: "Created via shadow-AI amnesty", comment: r.caller }], comments: [] });
                Toast.show("Converted " + r.caller + " to " + nid + " (Intake submitted). SLA clock started.", "ok");
                Router.refresh();
              }
            }, "Convert to intake")
          }
        ]
      }));
      main.append(U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "Reconciliation method"),
        U.h("ol", { style: { paddingLeft: "1.2rem", fontSize: ".88rem" } },
          U.h("li", null, "Pull distinct gateway caller IDs with >100 calls / 30 days."),
          U.h("li", null, "Join against the registry's gateway-team links; the residue is shadow usage."),
          U.h("li", null, "Triage: convert (most), block (policy violations with restricted data), or ignore (test traffic)."),
          U.h("li", null, "Report the count monthly at AI Council — the trend matters more than the level."))));
    },

    "registry/intake": (main) => {
      main.append(C.crumbs({ label: "Registry", href: "#/registry" }, { label: "New intake" }),
        C.pageHead("New use-case intake", "The two-page discipline: if the sponsor can't say what decision changes and what a unit of value is, the idea isn't ready for engineering."));
      main.append(C.form({
        draftKey: "intake",
        submitLabel: "Submit intake (starts the 5-day SLA clock)",
        pages: [
          {
            title: "The problem and the value", fields: [
              { key: "title", label: "Use-case title", required: true, help: "Name the capability, not the technology. “Collections prioritisation”, not “XGBoost project”." },
              { key: "businessLine", label: "Business line", type: "select", required: true, options: ["Retail Credit", "Financial Crime", "KYC & Onboarding", "Customer Care", "Corporate Banking", "Markets", "Wealth", "HR Shared Services", "Group Operations", "Treasury"] },
              { key: "problem", label: "Business problem", type: "textarea", required: true, validate: v => v && v.length < 40 ? "Describe the problem properly — a line this short will bounce at triage." : "" },
              { key: "decision", label: "The decision this changes", type: "textarea", required: true, help: "The single most important field on the form. If no decision changes, it's a dashboard, not an AI use case." },
              { key: "valueUnit", label: "Value unit", type: "select", required: true, options: ["EUR/year net benefit", "Hours saved/month", "Loss avoided EUR/year", "Conversion uplift %", "Risk reduction (qualitative)"] },
              { key: "valueSize", label: "Value size estimate", type: "text", required: true, help: "An honest range beats a precise fiction. Finance will baseline this before it enters the value ledger." },
              { key: "whyNow", label: "Why now?", type: "textarea", required: true }
            ]
          },
          {
            title: "Data, people and risk", fields: [
              { key: "dataClasses", label: "Data classes involved", type: "checkboxes", required: true, options: ["Customer PII", "Transactions", "Documents", "Free-text complaints", "Employee data", "Market data", "Policy corpus"], help: "Drives the DPIA requirement and the gateway routing tier." },
              { key: "residency", label: "Data residency", type: "select", required: true, options: ["EU", "EU+UK", "Global (needs review)"] },
              { key: "lawfulBasis", label: "Lawful basis (GDPR)", type: "select", required: true, options: ["Legitimate interest", "Contract performance", "Legal obligation", "Consent"] },
              { key: "peopleAffected", label: "People affected", type: "select", required: true, options: ["Retail customers", "Corporate clients", "Employees", "Investigators / internal users", "Advisers"] },
              { key: "autonomy", label: "Autonomy level", type: "select", required: true, options: [{ v: "assist", l: "Assist — human decides" }, { v: "gated-act", l: "Gated act — system acts inside guardrails, human handles exceptions" }, { v: "autonomous", l: "Autonomous — system acts (expect T1 and a hard conversation)" }], help: "Tier = materiality × autonomy. Autonomy is the half sponsors underestimate." },
              { key: "sponsor", label: "Accountable business sponsor", type: "select", required: true, options: ["Marcus Webb (Retail Credit)", "Hana Sato (Financial Crime)", "Pieter van Dijk (KYC Ops)", "Leila Haddad (Customer Care)", "Stefan Bauer (Corporate)", "Mei Chen (Markets)", "Rosa Moreno (HR)"], help: "A use case without a named sponsor is a hobby." },
              { key: "builder", label: "Builder team", type: "select", required: true, options: ["AI CoE", "Business-line squad with CoE support", "Vendor-led with CoE oversight"] },
              { key: "vendor", label: "Vendor involvement", type: "select", required: true, options: ["None", "Hosted LLM API", "Specialist model vendor", "Consulting build partner"] },
              { key: "attachments", label: "Attachments (business case, mockups…)", type: "file" }
            ]
          }
        ],
        onSubmit: (v) => {
          const nid = "UC-2026-0" + (800 + Math.floor(Math.random() * 99));
          Store.create("useCases", {
            id: nid, title: v.title, businessLine: v.businessLine, type: "ML", autonomy: v.autonomy, tier: "—",
            euAiActClass: "to classify", srScope: "to assess", stage: "Intake submitted",
            sponsorId: "PPL-0005", ownerId: "PPL-0013", problem: v.problem, decisionChanged: v.decision,
            valueUnit: v.valueUnit, valuePromisedEUR: null, valueMeasuredEUR: null, dataClasses: v.dataClasses, residency: v.residency,
            lawfulBasis: v.lawfulBasis, peopleAffected: v.peopleAffected, whyNow: v.whyNow, vendorIds: [], modelIds: [],
            createdAt: Clock.today(), intakeDays: null, stageHistory: [{ stage: "Intake submitted", date: Clock.today(), by: Personas.current().name }],
            gateArtifacts: [], tierRationale: "", audit: [{ ts: Clock.today() + " 09:00", actor: Personas.current().name, action: "Intake submitted — 5-day SLA clock started", comment: "" }], comments: []
          });
          Toast.show("Intake " + nid + " submitted. The 5-working-day tier-decision clock is running.", "ok");
          Router.go("registry/uc/" + nid);
        }
      }));
    },

    "registry/uc": (main, args) => {
      const uc = Store.get("useCases", args[0]);
      if (!uc) { main.append(C.banner("bad", "Use case not found.")); return; }
      main.append(C.crumbs({ label: "Registry", href: "#/registry" }, { label: uc.id }),
        C.pageHead(uc.title, uc.id + " · " + uc.businessLine + " · sponsored by " + C.personName(uc.sponsorId),
          C.pill(uc.tier), C.pill(uc.stage), C.pill(uc.type, uc.type === "Agentic" ? "purple" : "teal")));
      const flag = uc.id === "UC-2026-0101";
      const models = Store.all("models").filter(m => m.useCaseId === uc.id);
      const incs = Store.all("incidents").filter(i => i.ucId === uc.id);
      const nextStage = CANON.stages[REG.stageIndex(uc.stage) + 1];
      main.append(C.tabs("uc" + uc.id, [
        {
          id: "sum", label: "Summary", render: () => U.h("div", { style: { display: "grid", gap: "1rem" } },
            U.h("div", { class: "card" }, U.h("h3", null, "The case"), C.kv([
              ["Business problem", uc.problem], ["Decision it changes", uc.decisionChanged],
              ["Value", (uc.valuePromisedEUR ? U.money(uc.valuePromisedEUR) + " promised" : "not yet sized") + (uc.valueMeasuredEUR ? " · " + U.money(uc.valueMeasuredEUR) + " measured (Finance co-signed)" : "")],
              ["Why now", uc.whyNow], ["People affected", uc.peopleAffected], ["Owner", C.personName(uc.ownerId)],
              ["Builder vendors", (uc.vendorIds || []).length ? uc.vendorIds.join(", ") : "none"]])),
            FLAGSHIP[uc.id] ? U.h("div", { class: "card", style: { borderLeft: "4px solid var(--accent)" } }, U.h("h3", null, "Flagship facts (from the book)"), U.h("div", { class: "flex-wrap" }, FLAGSHIP[uc.id]().map(([l, v]) => C.stat(l, v)))) : null,
            U.h("div", { class: "card" }, U.h("h3", null, "Lifecycle position"),
              Charts.flow(CANON.stages.slice(1, 14).map(s => ({ label: s.length > 14 ? s.slice(0, 13) + "…" : s, color: REG.stageColor(s), active: REG.stageIndex(s) <= REG.stageIndex(uc.stage) })), { stageW: 96 }),
              nextStage && !["Retired", "Rejected"].includes(uc.stage) ? U.h("div", { style: { marginTop: ".8rem" } },
                U.h("h3", null, "Gate to “" + nextStage + "”"),
                C.gateChecklist(REG.gateFor(uc, nextStage).length ? REG.gateFor(uc, nextStage) : [{ label: "No artifact gate — approver sign-off only", ok: true }]),
                U.h("p", { class: "muted small" }, "Approvers: " + ({ "Risk tiering": "Head of AI CoE + Governance Lead", "Approved to build": "Sponsor + Head of AI CoE", "Independent validation": "Head of Model Risk", "GenAI evaluation gate": "Head of AI CoE + Red-Team Lead", "Approval forum": "AI Council (CRO approves T1)", "In production": "Platform Lead + Sponsor" }[nextStage] || "per RACI"))) : null))
        },
        {
          id: "risk", label: "Risk & tier", render: () => U.h("div", { class: "grid2" },
            U.h("div", { class: "card" }, U.h("h3", null, "Tier rationale (materiality × autonomy)"), U.h("p", { style: { fontSize: ".88rem" } }, uc.tierRationale || "Pending tiering."),
              Charts.heat({
                rows: ["High materiality", "Medium", "Low"], cols: ["Assist", "Gated act", "Autonomous"],
                value: (r, c) => { const t = [["T2", "T1", "T1"], ["T3", "T2", "T1"], ["T3", "T3", "T2"]][r][c]; const mine = uc.tierRationale && ((r === 0 && uc.tier === "T1") || (uc.autonomy === ["assist", "gated-act", "autonomous"][c] && uc.tier === t)); return { txt: t + (mine ? " ◄" : ""), color: t === "T1" ? "#b02a37" : t === "T2" ? "#c07f00" : "#1d7a3e", title: "Materiality row × autonomy column" }; }
              })),
            U.h("div", { class: "card" }, U.h("h3", null, "Regulatory classification"), C.kv([
              ["SR 26-2 scope", uc.srScope === "SR 26-2" ? "In scope (traditional/ML model)" : "Out of scope — governed by GenAI/agentic gates instead"],
              ["EU AI Act", uc.euAiActClass], ["Autonomy", uc.autonomy], ["Data classes", (uc.dataClasses || []).join(", ")],
              ["Residency", uc.residency], ["Lawful basis", uc.lawfulBasis]]),
              U.h("p", { class: "muted small", style: { marginTop: ".6rem" } }, CANON.regs.sr262)))
        },
        {
          id: "data", label: "Data", render: () => U.h("div", { class: "card" }, U.h("h3", null, "Datasets & readiness"),
            U.h("table", { class: "data" }, U.h("thead", null, U.h("tr", null, ["Dataset", "Domain", "Quality", "PII", "Gates"].map(hh => U.h("th", null, hh)))),
              U.h("tbody", null, Store.all("datasets").filter(dd => dd.domain === uc.businessLine || uc.id === "UC-2026-0101" && dd.name.includes("credit")).map(dd =>
                U.h("tr", null, U.h("td", { class: "mono" }, dd.name), U.h("td", null, dd.domain), U.h("td", null, U.pct(dd.qualityScore, 0)),
                  U.h("td", null, dd.pii ? C.pill("PII", "red") : C.pill("no PII", "green")),
                  U.h("td", null, Object.entries(dd.gates).map(([g, ok]) => C.pill(g, ok ? "green" : "red"))))))),
            U.h("p", { class: "muted small", style: { marginTop: ".5rem" } }, "DPIA: " + (Store.all("dpias").find(dp => dp.ucId === uc.id)?.status || "not required / not started") + " · lineage and access requests live in DataBridge."))
        },
        {
          id: "models", label: "Models", render: () => models.length ? U.h("div", null, models.map(m => U.h("div", { class: "card", style: { marginBottom: "1rem" } },
            U.h("h3", null, m.name + " ", C.pill(m.version, "gray"), " ", C.pill(m.validationStatus)),
            C.kv([["Model ID", m.id], ["Type", m.type], ["Owner", C.personName(m.ownerId)], ["SR 26-2", m.srScope ? "In scope" : "Out of scope"], ["Next review", U.date(m.nextReview)], ["Champion/challenger", m.champChallenger ? "Yes" : "No"]]),
            U.h("h3", { style: { marginTop: ".8rem" } }, "Headline metrics"),
            U.h("div", { class: "flex-wrap" }, Object.entries(m.metrics || {}).map(([k, v]) => C.stat(k, String(v)))),
            flag && m.id === "MDL-0001" ? C.banner("info", U.h("b", null, "The complexity-must-buy-lift lesson: "), `the gradient-boosting challenger reached AUC ${CANON.credit.gbmAuc} vs the scorecard's ${CANON.credit.auc} — not enough lift to justify the explainability cost, so the logistic scorecard stays champion. KS ${CANON.credit.ks}, Gini ${CANON.credit.gini}.`) : null))) :
            U.h("p", { class: "muted" }, "No models registered yet — they appear once development starts.")
        },
        {
          id: "evals", label: "Evaluations", render: () => U.h("div", { class: "card" },
            uc.type === "GenAI" || uc.type === "Agentic" ?
              U.h("div", null, U.h("h3", null, "Golden-set release gates"),
                U.h("table", { class: "data" }, U.h("thead", null, U.h("tr", null, ["Release", "Date", "hit@3", "Grounded", "Refusal OK", "Gate"].map(hh => U.h("th", null, hh)))),
                  U.h("tbody", null, SEED.golden.map(g => U.h("tr", null, U.h("td", null, g.release), U.h("td", null, U.date(g.date)), U.h("td", null, U.pct(g.hitAt3, 0) + (g.note ? " ⚠" : "")), U.h("td", null, U.pct(g.grounded)), U.h("td", null, U.pct(g.refusalOK)), U.h("td", null, g.passed ? C.pill("passed", "green") : C.pill("failed", "red")))))),
                U.h("p", { class: "muted small", style: { marginTop: ".5rem" } }, "v1.4 failed the 85% gate at " + CANON.copilot.hitAt3Fail + "% hit@3 — root cause was retrieval synonyms; it passed after the synonym fix. The RAG contracts apply: " + CANON.ragContracts.join(" · ") + ". Similarity floor: " + CANON.copilot.simFloor + ".")) :
              U.h("div", null, U.h("h3", null, "Pre-production evaluation"),
                flag ? U.h("div", null, U.h("p", { class: "small" }, `Scorecard: AUC ${CANON.credit.auc} · KS ${CANON.credit.ks} · Gini ${CANON.credit.gini}. Fairness: adverse impact ratio ${CANON.credit.air} (approval ${CANON.credit.approvalRef}% reference group vs ${CANON.credit.approvalProt}% protected group); proxy risk via ${CANON.credit.proxy}.`),
                  Charts.line({ labels: SEED.months.map(m => m.slice(5)), series: [{ label: "Adverse impact ratio", points: SEED.air }], min: 0.8, max: 1.0, goal: 0.95, fmt: v => v.toFixed(2) }),
                  U.h("p", { class: "muted small" }, "Dashed line: internal trigger (0.95). Hard floor 0.90 per policy.")) :
                  U.h("p", { class: "muted" }, "Evaluation reports attach at the pre-production gate.")))
        },
        {
          id: "appr", label: "Approvals", render: () => {
            const relevant = Store.all("approvals").filter(a => a.subject === uc.title);
            return U.h("div", { class: "card" }, U.h("h3", null, "Approvals on this use case"),
              relevant.length ? relevant.map(a => U.h("div", { style: { padding: ".5rem 0", borderBottom: "1px dashed var(--line-soft)" } },
                U.h("div", { class: "flex" }, U.h("b", null, a.type), C.pill(a.status), U.h("span", { class: "spacer" }), U.h("span", { class: "muted small" }, "approver: " + a.approverRole + " · due " + U.date(a.due))),
                a.status === "Pending" ? C.approvalActions("approvals", a.id, {
                  requester: null, can: Personas.can("*") || Personas.can("t1approve") || Personas.isYou(),
                  onApprove: c => { Store.save("approvals", a.id, { status: "Approved" }, "Approved", c); Toast.show("Approved with rationale on the record.", "ok"); },
                  onReject: c => { Store.save("approvals", a.id, { status: "Rejected" }, "Rejected", c); }
                }) : null)) : U.h("p", { class: "muted" }, "No open approvals. Historic decisions are in the audit trail."));
          }
        },
        {
          id: "controls", label: "Controls", render: () => U.h("div", { class: "card" }, U.h("h3", null, "Controls mapping"),
            C.banner("info", "FS AI RMF-style control IDs below are illustrative — not official identifiers."),
            U.h("table", { class: "data" }, U.h("thead", null, U.h("tr", null, ["Control", "Framework", "Function", "Status"].map(hh => U.h("th", null, hh)))),
              U.h("tbody", null, Store.all("controls").filter((c, i) => i % 3 === 0).slice(0, 10).map(c => U.h("tr", null, U.h("td", { class: "mono" }, c.id), U.h("td", null, c.framework), U.h("td", null, c.function), U.h("td", null, C.pill(c.status)))))))
        },
        {
          id: "mon", label: "Monitoring", render: () => flag ?
            U.h("div", { class: "grid2" },
              U.h("div", { class: "card" }, U.h("h3", null, "PSI drift by feature (12 months)"),
                Charts.line({
                  labels: SEED.months.map(m => m.slice(5)), fmt: v => v.toFixed(2), min: 0, max: 0.3,
                  bands: [{ from: 0, to: CANON.psi.ok, color: "#1d7a3e", label: "OK < " + CANON.psi.ok }, { from: CANON.psi.ok, to: CANON.psi.act, color: "#c07f00", label: "WATCH" }, { from: CANON.psi.act, to: 0.3, color: "#b02a37", label: "ACT > " + CANON.psi.act }],
                  series: Object.entries(SEED.psi).slice(0, 4).map(([f, pts]) => ({ label: f, points: pts }))
                }),
                U.h("p", { class: "muted small" }, "utilisation entered WATCH in October and is rising — the AIR story and this chart are the same story.")),
              U.h("div", { class: "card" }, U.h("h3", null, "Override rate (human overrides of model decisions)"),
                Charts.line({ labels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"], series: [{ label: "% overridden", points: (models[0] || {}).overrideRate || [4, 5, 5, 6, 6, 7] }], fmt: v => v + "%" }),
                U.h("p", { class: "muted small" }, "Rising overrides are the users voting on model quality before the metrics do."))) :
            U.h("div", { class: "card" }, U.h("p", { class: "muted" }, "Monitoring series attach in production. See Sentinel for portfolio-level monitors."))
        },
        {
          id: "inc", label: "Incidents", render: () => U.h("div", { class: "card" }, U.h("h3", null, "Incidents involving this use case"),
            incs.length ? U.h("table", { class: "data" }, U.h("tbody", null, incs.map(i => U.h("tr", { class: "click", onclick: () => Router.go("incidents/view/" + i.id) },
              U.h("td", null, C.pill(i.sev)), U.h("td", null, U.h("a", { href: "#/incidents/view/" + i.id }, i.title)), U.h("td", { class: "nowrap" }, U.date(i.date)), U.h("td", null, C.pill(i.status)))))) :
              U.h("p", { class: "muted" }, "None recorded."))
        },
        {
          id: "value", label: "Value", render: () => U.h("div", { class: "card" }, U.h("h3", null, "Value ledger entry"),
            uc.valuePromisedEUR ? C.kv([["Promised", U.money(uc.valuePromisedEUR) + " / year (" + uc.valueUnit + ")"],
            ["Measured", uc.valueMeasuredEUR ? U.money(uc.valueMeasuredEUR) + " — co-signed by Finance" : "measurement pending (needs a baseline Finance accepts)"],
            ["Delta explanation", (Store.all("valueLedger").find(v => v.ucId === uc.id) || {}).delta || "—"]]) :
              U.h("p", { class: "muted" }, "Not yet sized. Value enters the ledger only with a Finance-accepted baseline."))
        },
        {
          id: "docs", label: "Documents", render: () => U.h("div", { class: "card" }, U.h("h3", null, "Required artifacts by gate"),
            U.h("table", { class: "data" }, U.h("thead", null, U.h("tr", null, ["Gate", "Artifact", "Status", ""].map(hh => U.h("th", null, hh)))),
              U.h("tbody", null, (uc.gateArtifacts || []).map((g, gi) => U.h("tr", null, U.h("td", null, g.stage), U.h("td", null, g.name),
                U.h("td", null, g.attached ? C.pill("attached", "green") : C.pill("missing", "red")),
                U.h("td", null, g.attached ? "" : U.h("button", {
                  class: "btn ghost sm", onclick: () => {
                    const ga = [...uc.gateArtifacts]; ga[gi] = { ...ga[gi], attached: true };
                    Store.save("useCases", uc.id, { gateArtifacts: ga }, "Artifact attached: " + g.name, "Simulated upload");
                    Router.refresh();
                  }
                }, "Attach (simulated)")))))))
        },
        { id: "audit", label: "Audit trail", render: () => C.auditTrail("useCases", uc.id) },
        { id: "com", label: "Comments", render: () => C.comments("useCases", uc.id) }
      ]));
    }
  }
});
