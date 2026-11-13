/* AGB modules: Forum Rooms, PolicyDesk, RegRoom, Reports Studio */
"use strict";

/* ================= Forum Rooms ================= */
SITE.modules.push({
  id: "forums", icon: "people", label: "Forum Rooms", home: "forums", color: "#13304f", desc: "Councils, boards & reviews",
  routes: {
    "forums": (main) => {
      main.append(C.crumbs({ label: "Forum Rooms" }), C.pageHead("Governance forums",
        "Five forums run the machine. Each room holds agendas, papers, minutes, decisions and an action tracker — decisions, not documents."));
      main.append(U.h("div", { class: "grid3" }, CANON.forums.map(f => {
        const meetings = Store.all("forumMeetings").filter(m => m.forum === f.id);
        const next = U.sort(meetings.filter(m => m.date >= Clock.today()), "date")[0];
        const acts = Store.all("actions").filter(a => a.forum === f.name && a.status === "Open");
        return U.h("div", { class: "card", style: { cursor: "pointer" }, onclick: () => Router.go("forums/room/" + f.id) },
          U.h("h3", null, f.name), U.h("p", { class: "muted small" }, f.cadence),
          C.kv([["Next session", next ? U.date(next.date) + " (" + U.rel(next.date) + ")" : "—"], ["Open actions", acts.length], ["Meetings on file", meetings.length]]));
      })));
    },
    "forums/room": (main, args) => {
      const f = CANON.forums.find(x => x.id === args[0]);
      if (!f) { main.append(C.banner("bad", "Forum not found.")); return; }
      const meetings = U.sort(Store.all("forumMeetings").filter(m => m.forum === f.id), "date", true);
      const next = meetings.find(m => m.date >= Clock.today());
      const acts = Store.all("actions").filter(a => a.forum === f.name);
      main.append(C.crumbs({ label: "Forum Rooms", href: "#/forums" }, { label: f.name }),
        C.pageHead(f.name, f.cadence));
      main.append(C.tabs("forum" + f.id, [
        {
          id: "next", label: "Next session & agenda", render: () => next ? U.h("div", { class: "grid2" },
            U.h("div", { class: "card" }, U.h("h3", null, "Agenda — " + U.date(next.date)),
              U.h("ol", { style: { paddingLeft: "1.2rem", fontSize: ".9rem" } }, next.agenda.map(a => U.h("li", { style: { margin: ".3rem 0" } }, a))),
              U.h("div", { class: "field", style: { marginTop: ".8rem" } },
                U.h("label", null, "Add agenda item (as " + Personas.current().name + ")"),
                (() => { const inp = U.h("input", { type: "text", placeholder: "Item + paper owner…" }); return U.h("div", { class: "flex" }, inp, U.h("button", { class: "btn sm", onclick: () => { if (!inp.value.trim()) return; Store.save("forumMeetings", next.id, { agenda: [...next.agenda, inp.value.trim()] }, "Agenda item added", inp.value.trim()); Router.refresh(); } }, "Add")); })())),
            U.h("div", { class: "card" }, U.h("h3", null, "Papers & pre-reads"),
              next.papers.length ? next.papers.map(p => U.h("div", { class: "attach" }, "📄 " + p)) : U.h("p", { class: "muted small" }, "No papers submitted yet. Pre-reads close 48h before the session — late papers get deferred, which is how the forum defends its quality."),
              U.h("h3", { style: { marginTop: "1rem" } }, "Standing inputs"),
              U.h("ul", { style: { paddingLeft: "1.1rem", fontSize: ".86rem" } },
                f.id === "council" ? [U.h("li", null, "Tier distribution & new T1s (Registry)"), U.h("li", null, "Open validation findings (ModelVault)"), U.h("li", null, "Incidents & time-to-contain (IncidentDesk)"), U.h("li", null, "Fairness triggers (Sentinel)"), U.h("li", null, "Shadow-AI reconciliation count")] :
                  f.id === "value" ? [U.h("li", null, "Value ledger with Finance co-signatures"), U.h("li", null, "Delta explanations"), U.h("li", null, "Kill / scale candidates")] :
                    f.id === "portfolio" ? [U.h("li", null, "WSJF board re-score"), U.h("li", null, "New intakes & SLA stats"), U.h("li", null, "Capacity & sequencing trades")] :
                      [U.h("li", null, "Gateway capacity & cost per route"), U.h("li", null, "Golden-set infra"), U.h("li", null, "Patterns & demos")]))) :
            U.h("p", { class: "muted" }, "No upcoming session scheduled.")
        },
        {
          id: "minutes", label: "Minutes & decisions", render: () => U.h("div", null, meetings.filter(m => m.date < Clock.today()).slice(0, 8).map(m =>
            U.h("div", { class: "card", style: { marginBottom: ".8rem" } },
              U.h("h3", null, U.date(m.date), " ", C.pill(m.status, "green")),
              m.decisions.length ? U.h("ul", { style: { paddingLeft: "1.1rem", fontSize: ".86rem" } }, m.decisions.map(dd => U.h("li", null, dd))) : U.h("p", { class: "muted small" }, "No decisions recorded."))))
        },
        {
          id: "actions", label: "Action tracker", render: () => C.table({
            id: "acts" + f.id, rows: acts, columns: [
              { key: "id", label: "ID", render: r => U.h("span", { class: "mono" }, r.id) },
              { key: "text", label: "Action" },
              { key: "ownerId", label: "Owner", render: r => C.personName(r.ownerId) },
              { key: "due", label: "Due", render: r => U.h("span", { class: "sla " + U.dueClass(r.due) }, U.date(r.due)) },
              { key: "status", label: "Status", filter: "select", render: r => C.pill(r.status) },
              { key: "a", label: "", render: r => r.status === "Open" ? U.h("button", { class: "btn ghost sm", onclick: () => { Store.save("actions", r.id, { status: "Done" }, "Action closed", ""); Router.refresh(); } }, "Mark done") : null }
            ], empty: "No actions for this forum."
          })
        }
      ]));
    }
  }
});

/* ================= PolicyDesk ================= */
SITE.modules.push({
  id: "policydesk", icon: "scale", label: "PolicyDesk", home: "policydesk", color: "#5b6b7d", desc: "Policy & controls library",
  routes: {
    "policydesk": (main) => {
      main.append(C.crumbs({ label: "PolicyDesk" }), C.pageHead("Policy & controls library",
        "The written rules of the machine: AI policy, acceptable use, the approved-tool register, controls mapped to frameworks, and the EU AI Act tracker."));
      main.append(C.tabs("policy", [
        {
          id: "pol", label: "Policies", render: () => U.h("div", { class: "grid2" }, Store.all("policies").map(p =>
            U.h("div", { class: "card" }, U.h("h3", null, p.name, " ", C.pill("v" + p.version, "gray")),
              U.h("p", { class: "small" }, p.summary), U.h("p", { class: "muted small" }, "Owner: " + p.owner))))
        },
        {
          id: "tools", label: "Approved-tool register", render: () => U.h("div", { class: "card" },
            U.h("h3", null, "Tool × permitted data class × approver"),
            U.h("table", { class: "data" }, U.h("thead", null, U.h("tr", null, ["Tool", "Permitted data classes", "Approver"].map(hh => U.h("th", null, hh)))),
              U.h("tbody", null, SEED.toolRegister.map(t => U.h("tr", null, U.h("td", null, U.h("b", null, t.tool)), U.h("td", null, t.classes), U.h("td", null, t.approver))))),
            U.h("p", { class: "muted small", style: { marginTop: ".5rem" } }, "Reviewed monthly. Anything not on this register is not approved — that sentence does more work than the rest of the policy combined."))
        },
        {
          id: "controls", label: "Controls", render: () => U.h("div", null,
            C.banner("info", "FS AI RMF-style controls below are illustrative — labelled, not official IDs. " + CANON.regs.fsairmf),
            C.table({
              id: "controls", rows: Store.all("controls"), pageSize: 15, columns: [
                { key: "id", label: "Control", render: r => U.h("span", { class: "mono" }, r.id) },
                { key: "framework", label: "Framework", filter: "select" },
                { key: "function", label: "Function / category", filter: "select" },
                { key: "text", label: "Objective" },
                { key: "status", label: "Status", filter: "select", render: r => C.pill(r.status) },
                { key: "evidence", label: "Evidence" }]
            }))
        },
        {
          id: "euact", label: "EU AI Act tracker", render: () => U.h("div", { class: "card" },
            U.h("h3", null, "Obligations timeline (post-Digital-Omnibus)"),
            U.h("table", { class: "data" }, U.h("thead", null, U.h("tr", null, ["Obligation", "Date", "Where we stand"].map(hh => U.h("th", null, hh)))),
              U.h("tbody", null, CANON.regs.euDates.map(([ob, dt], i) => U.h("tr", null, U.h("td", null, ob), U.h("td", { class: "nowrap" }, U.date(dt), " ", U.h("span", { class: "muted small" }, "(" + U.rel(dt) + ")")),
                U.h("td", null, [C.pill("in force — complied", "green"), C.pill("in force — complied", "green"), C.pill("gap analysis done; remediation plan live", "amber"), C.pill("scoping", "gray")][i]))))),
            U.h("p", { class: "muted small", style: { marginTop: ".6rem" } }, "Classification view lives in the Registry (saved view: EU AI Act high-risk). Other anchors: " + CANON.regs.others + ". " + CANON.regs.nist))
        }
      ]));
    }
  }
});

/* ================= RegRoom ================= */
SITE.modules.push({
  id: "regroom", icon: "doc", label: "RegRoom", home: "regroom", color: "#44566b", desc: "Regulator & audit interface",
  routes: {
    "regroom": (main) => {
      main.append(C.crumbs({ label: "RegRoom" }), C.pageHead("Regulatory & audit interface",
        "Supervisory requests, audit findings, and the evidence-binder builder. The test an auditor really runs: is evidence a system or a scramble?"));
      main.append(C.tabs("regroom", [
        {
          id: "reg", label: "Regulator requests", render: () => U.h("div", null, Store.all("regRequests").map(r =>
            U.h("div", { class: "card", style: { marginBottom: "1rem", borderLeft: r.status.includes("drafting") ? "4px solid var(--danger)" : undefined } },
              U.h("h3", null, r.id + " — " + r.subject, " ", C.pill(r.status, r.status.includes("Closed") ? "green" : "red")),
              C.kv([["From", r.from], ["Received", U.date(r.received)], ["Due", U.h("span", { class: "sla " + U.dueClass(r.due, 7) }, U.date(r.due) + " (" + U.rel(r.due) + ")")], ["Owner", C.personName(r.ownerId)]]),
              U.h("h3", { style: { marginTop: ".8rem" } }, "What they asked for"),
              U.h("ol", { style: { paddingLeft: "1.2rem", fontSize: ".88rem" } }, r.asks.map(a => U.h("li", { style: { margin: ".25rem 0" } }, a))),
              r.status.includes("drafting") ? U.h("div", { style: { marginTop: ".8rem" }, class: "flex-wrap" },
                U.h("a", { class: "btn sec", href: "#/reports/view/inventory" }, "Generate inventory return"),
                U.h("a", { class: "btn sec", href: "#/regroom/binder/UC-2026-0101" }, "Binder: credit scorecard"),
                U.h("a", { class: "btn sec", href: "#/regroom/binder/UC-2026-0102" }, "Binder: fraud"),
                U.h("a", { class: "btn sec", href: "#/regroom/binder/" + (Store.all("useCases")[5] || {}).id }, "Binder: copilot"),
                U.h("button", { class: "btn ok", onclick: () => { Store.state("regDone", true); Store.save("regRequests", r.id, { status: "Response submitted " + Clock.today() }, "Response submitted to supervisor", "Inventory + 3 binders + incident evidence"); Toast.show("Response submitted. Expect follow-up questions — they always come.", "ok"); Router.refresh(); } }, "Mark response submitted")) : null)))
        },
        {
          id: "aud", label: "Audit findings", render: () => C.table({
            id: "audf", rows: Store.all("auditFindings"), columns: [
              { key: "id", label: "ID", render: r => U.h("span", { class: "mono" }, r.id) },
              { key: "source", label: "Source", filter: "select" },
              { key: "sev", label: "Severity", filter: "select", render: r => C.pill(r.sev === "—" ? "sample" : r.sev, r.sev === "High" ? "red" : r.sev === "Medium" ? "amber" : "gray") },
              { key: "text", label: "Finding" },
              { key: "rootCause", label: "Root cause" },
              { key: "due", label: "Due", render: r => U.h("span", { class: "sla " + U.dueClass(r.due, 14) }, U.date(r.due)) },
              { key: "status", label: "Status", filter: "select", render: r => C.pill(r.status) }]
          })
        },
        {
          id: "binder", label: "Evidence binder builder", render: () => U.h("div", { class: "card" },
            U.h("h3", null, "Build the 8-tab binder for a use case"),
            U.h("p", { class: "small" }, "The binder assembles itself from the live registry record — governance decisions, tier rationale, DPIA, model cards, evaluations, deployment approvals, monitoring extracts and value entries. That is the whole point of running everything through one system."),
            (() => {
              const sel = U.h("select", null, Store.all("useCases").filter(u => ["In production", "Periodic review", "Deployment (canary)", "In development"].includes(u.stage)).map(u => U.h("option", { value: u.id }, u.id + " — " + u.title)));
              return U.h("div", { class: "flex" }, sel, U.h("button", { class: "btn", onclick: () => Router.go("regroom/binder/" + sel.value) }, "Assemble binder"));
            })())
        }
      ]));
    },
    "regroom/binder": (main, args) => {
      const uc = Store.get("useCases", args[0]);
      if (!uc) { main.append(C.banner("bad", "Use case not found.")); return; }
      const model = Store.all("models").find(m => m.useCaseId === uc.id);
      const val = Store.all("validations").find(v => v.useCaseId === uc.id);
      const dpia = Store.all("dpias").find(dd => dd.ucId === uc.id);
      const incs = Store.all("incidents").filter(i => i.ucId === uc.id);
      const vle = Store.all("valueLedger").find(v => v.ucId === uc.id);
      main.append(C.crumbs({ label: "RegRoom", href: "#/regroom" }, { label: "Binder " + uc.id }),
        C.pageHead("Evidence binder — " + uc.title, uc.id + " · assembled from live records on " + U.date(Clock.today()),
          U.h("button", { class: "btn sec noprint", onclick: () => window.print() }, "⎙ Print binder")));
      const tabContent = [
        ["Approvals on record: " + ((uc.audit || []).filter(a => a.action.toLowerCase().includes("approv") || a.action.includes("Tier")).length) + " decisions with rationale. Forum: " + (uc.tier === "T1" ? "AI Council (CRO chair)" : "Portfolio board") + ".", "Decision log extracted from audit trail; delegation entries show logged reasons."],
        ["Tier " + uc.tier + " — " + (uc.tierRationale || "rationale on file") + " Intake-to-tier: " + (uc.intakeDays ?? "—") + " working days (SLA " + CANON.slaIntakeDays + ").", "Intake form snapshot + tier decision record."],
        [(dpia ? dpia.id + " — " + dpia.status + " (" + dpia.risk + ")" : "No DPIA required (no personal data in scope).") + " Data classes: " + (uc.dataClasses || []).join(", ") + "; residency " + uc.residency + "; lawful basis " + uc.lawfulBasis + ".", "DPIA record + dataset catalogue entries + lineage extract."],
        [model ? "Model " + model.id + " (" + model.name + " " + model.version + "), owner " + C.personName(model.ownerId) + ". Metrics: " + Object.entries(model.metrics || {}).map(([k, v]) => k + " " + v).join(" · ") + "." : "No model yet — pre-development.", "Model card (full), training-data lineage, change log."],
        [uc.id === "UC-2026-0101" ? `Evaluation: AUC ${CANON.credit.auc}, KS ${CANON.credit.ks}, Gini ${CANON.credit.gini}; challenger GBM ${CANON.credit.gbmAuc} not adopted. Fairness: AIR ${CANON.credit.air} (${CANON.credit.approvalRef}% vs ${CANON.credit.approvalProt}%), proxy watch on ${CANON.credit.proxy}.` : (uc.type === "GenAI" || uc.type === "Agentic" ? "Golden-set gate history incl. the " + CANON.copilot.hitAt3Fail + "% failure and synonym fix; RAG contracts attested; similarity floor " + CANON.copilot.simFloor + "." : "Evaluation report on file with threshold memo."), "Eval reports + fairness report + threshold memo."],
        [(val ? "Validation " + val.id + ": " + val.status + ". Findings: " + (val.findings.map(f => f.sev + " — " + f.text).join(" | ") || "none") : "Validation not yet performed.") + " Deployment path: shadow → canary → production with rollback criteria.", "Validation pack + deployment approvals + release records."],
        [incs.length ? incs.map(i => i.id + " (" + i.sev + ", " + i.status + ")").join("; ") + ". All reported inside the 24h internal standard." : "No incidents recorded. Monitoring: PSI bands and fairness triggers active in Sentinel.", "Monitoring extracts (12 months) + incident files + postmortems."],
        [vle ? "Promised " + U.money(vle.promisedEUR) + "; measured " + U.money(vle.measuredEUR) + (vle.financeCosign ? " (Finance co-signed)" : " (measurement pending)") + ". " + vle.delta : "No value-ledger entry yet.", "Value ledger extract + review decisions (continue/scale/kill)."]
      ];
      CANON.binderTabs.forEach((tab, i) => {
        main.append(U.h("div", { class: "card report-page", style: { marginBottom: "1rem" } },
          U.h("h3", null, "Tab " + tab),
          U.h("p", { style: { fontSize: ".9rem" } }, tabContent[i][0]),
          U.h("p", { class: "muted small" }, "Contents: " + tabContent[i][1])));
      });
      main.append(C.banner("info", "Consistency check: the numbers in this binder are generated from the same records the board pack and the inventory return use. One source, three audiences — that is what survives a supervisor's cross-examination."));
    }
  }
});

/* ================= Reports Studio ================= */
const REPORTS = {
  defs: [
    { id: "council", name: "Monthly AI Council pack", audience: "AI Council (CRO co-chair)", desc: "Tier distribution, SLA stats, validation findings, incidents, fairness triggers, shadow-AI count." },
    { id: "board", name: "Quarterly Board Risk Committee AI report", audience: "Board Risk Committee", desc: "Portfolio shape, value, top risks, appetite and the decisions needed." },
    { id: "cro", name: "CRO risk dashboard", audience: "Elena Petrova", desc: "The four numbers Elena opens first, with trends." },
    { id: "cfo", name: "CFO value report", audience: "Finance", desc: "Value ledger with co-signatures, spend vs budget, unit costs." },
    { id: "inventory", name: "Regulator inventory return", audience: "Nordhaven Prudential Authority (fictional)", desc: "Full registry extract in supervisory format." },
    { id: "bl", name: "Business-line one-pagers", audience: "Sponsors", desc: "Status, ETA, value and blockers per business line." },
    { id: "capstone", name: "The eight-slide board review (capstone)", audience: "Board", desc: "The book's capstone: the whole year in eight slides." }
  ]
};
SITE.modules.push({
  id: "reports", icon: "doc", label: "Reports Studio", home: "reports", color: "#0d2240", desc: "Packs, dashboards & returns",
  routes: {
    "reports": (main) => {
      main.append(C.crumbs({ label: "Reports Studio" }), C.pageHead("Reports Studio",
        "Every report generates from live data and prints cleanly (Print → Save as PDF). If a report disagrees with a screen, the report is wrong — fix the data, not the deck."));
      main.append(U.h("div", { class: "grid3" }, REPORTS.defs.map(r => U.h("div", { class: "card", style: { cursor: "pointer" }, onclick: () => Router.go("reports/view/" + r.id) },
        U.h("h3", null, r.name), U.h("p", { class: "small muted" }, r.desc), C.pill(r.audience, "blue")))));
    },
    "reports/view": (main, args) => {
      const def = REPORTS.defs.find(r => r.id === args[0]);
      if (!def) { main.append(C.banner("bad", "Report not found.")); return; }
      const ucs = Store.all("useCases"); const vl = Store.all("valueLedger");
      const measured = U.sum(vl.filter(v => v.measuredEUR), "measuredEUR");
      main.append(C.crumbs({ label: "Reports Studio", href: "#/reports" }, { label: def.name }),
        C.pageHead(def.name, "Generated " + U.date(Clock.today()) + " for " + def.audience, U.h("button", { class: "btn sec noprint", onclick: () => window.print() }, "⎙ Print / PDF")));
      const S = (title, ...kids) => U.h("div", { class: "slide" }, U.h("h2", null, title), kids, U.h("div", { class: "foot" }, "Aurelia Global Bank · AI CoE · " + U.date(Clock.today()) + " · Training simulation — all data fictional", U.h("span", { class: "spacer" })));
      if (def.id === "capstone" || def.id === "board") {
        const t1 = ucs.filter(u => u.tier === "T1").length;
        main.append(
          S("1 · The bad news first", U.h("ul", { style: { fontSize: "1rem", paddingLeft: "1.2rem", lineHeight: 1.8 } },
            U.h("li", null, "Credit fairness: adverse impact ratio at " + SEED.air[11] + " and trending down — options paper decided at November Council; retrain lands February."),
            U.h("li", null, "One S2 in the quarter: the policy copilot answered an expense question wrongly (chunking defect). Contained in hours, 11 similar queries found, controls extended."),
            U.h("li", null, "Vendor concentration: KYC extraction single-sourced; renewal in December is being negotiated from the incident record."))),
          S("2 · Portfolio shape", U.h("div", { class: "grid2" },
            Charts.donut({ items: [{ label: "T1", value: t1, color: "#b02a37" }, { label: "T2", value: ucs.filter(u => u.tier === "T2").length, color: "#c07f00" }, { label: "T3", value: ucs.filter(u => u.tier === "T3").length, color: "#1d7a3e" }], centre: String(ucs.length), centreSub: "use cases" }),
            U.h("div", null, C.kv([["In production", ucs.filter(u => u.stage === "In production").length], ["In build / evaluation", ucs.filter(u => ["In development", "Pre-production evaluation", "Independent validation", "GenAI evaluation gate"].includes(u.stage)).length], ["Killed or paused this year", ucs.filter(u => ["Rejected", "Paused", "Retired", "Suspended"].includes(u.stage)).length + " — killing things is the portfolio working"], ["Intake SLA median", "4 days vs 5-day promise"]])))),
          S("3 · Value, co-signed", U.h("p", { style: { fontSize: "1.05rem" } }, "Measured and Finance co-signed: " + U.money(measured) + " against " + U.money(U.sum(vl, "promisedEUR")) + " promised. Credit contributes ~" + U.money(CANON.credit.valueEUR) + "/year. Entries without a Finance-accepted baseline stay off this slide — the ledger's credibility is its value."),
            Charts.hbars({ items: vl.filter(v => v.measuredEUR).slice(0, 6).map(v => ({ label: v.title.slice(0, 26), value: v.measuredEUR })), fmt: v => U.money(v) })),
          S("4 · The governance machine", U.h("ul", { style: { paddingLeft: "1.2rem", lineHeight: 1.8 } },
            U.h("li", null, "Five forums; intake-to-tier in a 5-working-day SLA; tiering = materiality × autonomy."),
            U.h("li", null, "SR 26-2 models under independent validation; GenAI/agentic under golden-set gates and graph-enforced agent safety."),
            U.h("li", null, "Shadow-AI reconciliation monthly: registry vs gateway logs; amnesty conversion path."),
            U.h("li", null, "EU AI Act: transparency obligations complied; Annex III programme on track for Dec 2027."))),
          S("5 · Incidents & resilience", U.h("p", null, "All incidents reported inside the 24-hour internal standard. The September S2 postmortem drove: table-aware chunking, slice-level release gates, and full prompt-log retention. Mean time to contain (S2): 9.6 hours."),
            Charts.bars({ labels: ["S1", "S2", "S3"], series: [{ label: "Count", points: [0, Store.all("incidents").filter(i => i.sev === "S2").length, Store.all("incidents").filter(i => i.sev === "S3").length] }], fmt: v => U.num(v, 0) })),
          S("6 · Platform & unit economics", C.kv([["Gateway teams onboarded", Store.all("gatewayTeams").length], ["Cost per 1,000 decisions", "€" + SEED.budget.unitCosts.costPer1kDecisionsEUR], ["Cost per copilot query", "€" + SEED.budget.unitCosts.costPerCopilotQueryEUR], ["Routing", "Restricted data → self-hosted open-weight only; hosted API for internal tiers"], ["GPU vs API breakeven", SEED.budget.unitCosts.gpuVsApiBreakevenMQueries + "M queries/quarter"]])),
          S("7 · People & adoption", C.kv([["CoE", "~40 FTE (perm + vendor) + champions in 8 business lines"], ["Literacy", SEED.literacy.tiers.map(t => t.tier.split("—")[0] + ": " + U.num(t.done, 0) + "/" + U.num(t.target, 0)).join(" · ")], ["Signal", "PII scrubs at the gateway fell 12% as tier-1 literacy completed — behaviour, not just certificates"]])),
          S("8 · Decisions needed today", U.h("ol", { style: { fontSize: "1.05rem", paddingLeft: "1.4rem", lineHeight: 2 } },
            U.h("li", null, U.h("b", null, "Appetite: "), "approve the agentic appetite statement (gated-act only; autonomous excluded until graph-level controls pass red-team)."),
            U.h("li", null, U.h("b", null, "Funding: "), "choose the 2027 envelope — hold at €14.2M or the €17.8M growth case (unit economics in appendix)."),
            U.h("li", null, U.h("b", null, "Fairness: "), "endorse the Council's reweighting decision (AIR to ≥0.95, approval-rate cost −0.4pp)."))));
        return;
      }
      if (def.id === "council") {
        main.append(
          S("Tier distribution & movements", Charts.donut({ items: [{ label: "T1", value: ucs.filter(u => u.tier === "T1").length, color: "#b02a37" }, { label: "T2", value: ucs.filter(u => u.tier === "T2").length, color: "#c07f00" }, { label: "T3", value: ucs.filter(u => u.tier === "T3").length, color: "#1d7a3e" }], centre: String(ucs.length) }),
            U.h("p", { class: "small" }, "New this month: " + ucs.filter(u => U.daysBetween(u.createdAt, Clock.today()) < 31).length + " intakes. SLA median 4 days; breaches with causes listed in appendix.")),
          S("Validation findings open", U.h("ul", { style: { paddingLeft: "1.2rem" } }, Store.all("validations").flatMap(v => v.findings.filter(f => f.sev !== "Low").map(f => U.h("li", null, U.h("b", null, f.sev + ": "), f.text, " ", U.h("i", { class: "muted" }, "(" + (f.condition || "") + ")")))))),
          S("Incidents & containment", U.h("p", null, "Open: " + Store.all("incidents").filter(i => !String(i.status).startsWith("Closed")).length + ". All reported within 24h. S2 mean time to contain 9.6h."),
            U.h("ul", { style: { paddingLeft: "1.2rem" } }, Store.all("incidents").filter(i => !String(i.status).startsWith("Closed")).slice(0, 5).map(i => U.h("li", null, i.id + " — " + i.title)))),
          S("Fairness & drift triggers", U.h("p", null, "AIR " + SEED.air[11] + " (trigger 0.95, floor 0.90) — decision item. PSI: utilisation in WATCH at 0.19, ACT at " + CANON.psi.act + "."),
            Charts.line({ labels: SEED.months.map(m => m.slice(5)), series: [{ label: "AIR", points: SEED.air, color: "#b02a37" }], min: .85, max: 1, goal: .95, fmt: v => v.toFixed(2) })),
          S("Shadow-AI reconciliation", U.h("p", null, Store.all("shadow").filter(s => !s.registered).length + " unregistered gateway callers outstanding; " + Store.all("shadow").filter(s => s.registered).length + " converted under amnesty this quarter. Trend is the KPI, not the level.")));
        return;
      }
      if (def.id === "cro") {
        main.append(S("The CRO's four numbers",
          U.h("div", { class: "grid4" },
            C.stat("T1 in production", ucs.filter(u => u.tier === "T1" && u.stage === "In production").length),
            C.stat("Open findings (M+)", Store.all("validations").flatMap(v => v.findings).filter(f => f.sev !== "Low").length),
            C.stat("Open incidents", Store.all("incidents").filter(i => !String(i.status).startsWith("Closed")).length, "MTTC 9.6h (S2)"),
            C.stat("Fairness AIR", SEED.air[11].toFixed(2), "trigger 0.95 · floor 0.90", "warn")),
          Charts.line({ labels: SEED.months.map(m => m.slice(5)), series: [{ label: "AIR", points: SEED.air, color: "#b02a37" }], min: .85, max: 1, goal: .95, fmt: v => v.toFixed(2) })));
        return;
      }
      if (def.id === "cfo") {
        main.append(
          S("Value ledger (co-signed only)", Charts.hbars({ items: vl.filter(v => v.measuredEUR).slice(0, 8).map(v => ({ label: v.title.slice(0, 26), value: v.measuredEUR })), fmt: v => U.money(v) }),
            U.h("p", { class: "small" }, "Total measured " + U.money(measured) + ". Entries failing Finance's baseline test are shown as 'measurement pending' — not counted.")),
          S("Spend vs budget", Charts.line({ labels: SEED.months.map(m => m.slice(5)), series: [{ label: "Plan", points: SEED.budget.actuals.map(a => a.planEUR) }, { label: "Actual", points: SEED.budget.actuals.map(a => a.actualEUR) }], fmt: v => U.money(v) }),
            U.h("p", { class: "small" }, "Variances >5% carry a one-line cause (see CoE Ledger). Unit costs: €" + SEED.budget.unitCosts.costPer1kDecisionsEUR + " per 1k decisions · €" + SEED.budget.unitCosts.costPerCopilotQueryEUR + " per copilot query.")));
        return;
      }
      if (def.id === "inventory") {
        main.append(S("AI inventory return — " + U.date(Clock.today()),
          U.h("p", { class: "small muted" }, "Format: one row per use case; supervisors cross-check this against board packs and gateway logs. Generated from the live registry."),
          U.h("div", { class: "tscroll" }, U.h("table", { class: "data" },
            U.h("thead", null, U.h("tr", null, ["ID", "Title", "Line", "Tier", "Stage", "SR 26-2", "EU AI Act"].map(hh => U.h("th", null, hh)))),
            U.h("tbody", null, ucs.map(u => U.h("tr", null, U.h("td", { class: "mono" }, u.id), U.h("td", null, u.title), U.h("td", null, u.businessLine), U.h("td", null, u.tier), U.h("td", null, u.stage), U.h("td", null, u.srScope), U.h("td", null, u.euAiActClass))))))));
        return;
      }
      // business line one-pagers
      for (const [line, xs] of Object.entries(U.group(ucs, "businessLine"))) {
        main.append(S(line + " — AI status one-pager",
          U.h("table", { class: "data" }, U.h("thead", null, U.h("tr", null, ["Use case", "Stage", "Value", "Blocker / next"].map(hh => U.h("th", null, hh)))),
            U.h("tbody", null, xs.map(u => U.h("tr", null, U.h("td", null, u.title), U.h("td", null, C.pill(u.stage)), U.h("td", null, U.money(u.valuePromisedEUR)), U.h("td", { class: "small" }, ["In production", "Retired"].includes(u.stage) ? "BAU monitoring" : "Next gate: " + (CANON.stages[CANON.stages.indexOf(u.stage) + 1] || "—"))))))));
      }
    }
  }
});
