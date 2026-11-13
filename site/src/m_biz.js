/* AGB modules: Gateway Console, VendorGate, DataBridge, ValueBoard, CoE Ledger, PeopleDesk */
"use strict";

/* ================= Gateway Console ================= */
SITE.modules.push({
  id: "gateway", icon: "gear", label: "Gateway Console", home: "gateway", color: "#0e5f74", desc: "LLM routing, budgets, guardrails",
  routes: {
    "gateway": (main) => {
      main.append(C.crumbs({ label: "Gateway Console" }), C.pageHead("AGB Gateway Console",
        "Every LLM call in the bank goes through here: routing by data tier, token budgets, guardrails, chargeback, and the logs that make incident blast-radius analysis possible."));
      const teams = Store.all("gatewayTeams");
      main.append(U.h("div", { class: "grid4" },
        C.stat("Onboarded teams", teams.length),
        C.stat("Token burn (Nov)", U.num(U.sum(teams, t => t.burnM[11]), 0) + "M"),
        C.stat("PII scrubs (30d)", U.num(U.sum(teams, t => t.guardrail.piiScrubs), 0), "down 12% as literacy completes", "ok"),
        C.stat("Injection blocks (30d)", U.num(U.sum(teams, t => t.guardrail.injectionBlocks), 0), "incl. red-team traffic", "warn")));
      main.append(C.tabs("gw", [
        {
          id: "teams", label: "Teams & budgets", render: () => C.table({
            id: "gwteams", rows: teams, pageSize: 12, columns: [
              { key: "team", label: "Team", render: r => U.h("span", null, U.h("b", null, r.team), U.h("span", { class: "sub" }, r.keys + " key(s)")) },
              { key: "businessLine", label: "Line", filter: "select" },
              { key: "route", label: "Route", filter: "select", render: r => C.pill(r.route, r.route === "self-hosted" ? "purple" : "teal") },
              { key: "dataTier", label: "Data tier" },
              { key: "tokenBudgetM", label: "Budget", render: r => r.tokenBudgetM + "M" },
              { key: "burn", label: "Burn (12m)", render: r => Charts.spark(r.burnM) },
              { key: "costShareEUR", label: "Chargeback YTD", render: r => U.money(r.costShareEUR), sortVal: r => r.costShareEUR }
            ]
          })
        },
        {
          id: "routing", label: "Routing policy", render: () => U.h("div", { class: "grid2" },
            U.h("div", { class: "card" }, U.h("h3", null, "Routing by data tier"),
              U.h("table", { class: "data" }, U.h("thead", null, U.h("tr", null, ["Data class", "Route", "Why"].map(hh => U.h("th", null, hh)))),
                U.h("tbody", null, [["Public / internal", "Hosted frontier API", "Best capability per euro; no restricted data leaves anyway"],
                ["Confidential", "Hosted API with contractual controls", "DPA + no-training clause + EU region"],
                ["Restricted (customer PII, credit files)", "Self-hosted open-weight only", "Data never leaves AGB infrastructure"]].map(row => U.h("tr", null, row.map(cc => U.h("td", null, cc)))))),
              U.h("p", { class: "muted small", style: { marginTop: ".5rem" } }, "Copilot similarity floor: " + CANON.copilot.simFloor + " — below it, refuse and escalate. RAG contracts: " + CANON.ragContracts.join(" · ") + ".")),
            U.h("div", { class: "card" }, U.h("h3", null, "Cost & latency per route"),
              U.h("table", { class: "data" }, U.h("thead", null, U.h("tr", null, ["Route", "p50", "p95", "€/1k tokens (blended)"].map(hh => U.h("th", null, hh)))),
                U.h("tbody", null, [["Hosted frontier API", "820ms", "2.1s", "0.011"], ["Self-hosted 70B", "1.1s", "2.8s", "0.007 (at current utilisation 71%)"], ["Self-hosted 8B (drafting)", "240ms", "600ms", "0.001"]].map(row => U.h("tr", null, row.map(cc => U.h("td", null, cc)))))),
              U.h("p", { class: "muted small" }, "GPU vs API breakeven at current mix: " + SEED.budget.unitCosts.gpuVsApiBreakevenMQueries + "M queries/quarter — the calculator lives in CoE Ledger.")))
        },
        {
          id: "guard", label: "Guardrails & blocked prompts", render: () => U.h("div", null,
            U.h("div", { class: "card", style: { marginBottom: "1rem" } }, U.h("h3", null, "Blocked-prompt log (sanitised)"),
              U.h("table", { class: "data" }, U.h("thead", null, U.h("tr", null, ["Date", "Team", "Category", "Sanitised excerpt"].map(hh => U.h("th", null, hh)))),
                U.h("tbody", null, Store.all("blockedPrompts").map(b => U.h("tr", null, U.h("td", { class: "nowrap" }, U.date(b.date)), U.h("td", null, b.team), U.h("td", null, C.pill(b.category, b.category.includes("Injection") ? "red" : "amber")), U.h("td", { class: "mono small" }, b.excerpt)))))),
            U.h("div", { class: "card" }, U.h("h3", null, "Approved model versions"),
              U.h("table", { class: "data" }, U.h("thead", null, U.h("tr", null, ["Model", "Route", "Status", "Approved by"].map(hh => U.h("th", null, hh)))),
                U.h("tbody", null, [["lumen-5-large (hosted)", "Hosted API", "Approved", "Platform review 2026-09"], ["lumen-5-mini (hosted)", "Hosted API", "Approved", "Platform review 2026-09"], ["openweight-70b-v4 (self-hosted)", "Self-hosted", "Approved", "Platform review 2026-10"], ["openweight-8b-v4", "Self-hosted", "Approved (drafting only)", "Platform review 2026-10"], ["lumen-6-preview", "—", "Under evaluation (golden set)", "—"]].map(row => U.h("tr", null, row.map(cc => U.h("td", null, cc))))))))
        }
      ]));
    }
  }
});

/* ================= VendorGate ================= */
SITE.modules.push({
  id: "vendorgate", icon: "link", label: "VendorGate", home: "vendorgate", color: "#8c5a10", desc: "Third-party AI risk",
  routes: {
    "vendorgate": (main) => {
      main.append(C.crumbs({ label: "VendorGate" }), C.pageHead("Third-party AI risk & vendors",
        "Vendors tiered by blast radius. Scorecard weights lock before demos; contracts carry the five clauses; renewals are negotiated from evidence, not need."));
      const vs = Store.all("vendorsAI");
      main.append(U.h("div", { class: "grid4" },
        C.stat("AI vendors", vs.length), C.stat("Annual spend", U.money(U.sum(vs, "annualSpendEUR"))),
        C.stat("Renewals ≤ 90 days", vs.filter(v => U.daysBetween(Clock.today(), v.renewal) <= 90).length, "DocuLex is the hot one", "warn"),
        C.stat("Clause gaps", vs.filter(v => Object.values(v.clauses).some(x => !x)).length, "re-paper at renewal", "warn")));
      main.append(U.h("div", { style: { margin: "1rem 0" } }, C.table({
        id: "vend", rows: vs, pageSize: 12, columns: [
          { key: "name", label: "Vendor", render: r => U.h("span", null, U.h("b", null, r.name), U.h("span", { class: "sub" }, r.service)) },
          { key: "blastTier", label: "Blast radius", filter: "select", render: r => C.pill(r.blastTier, r.blastTier === "High" ? "red" : r.blastTier === "Medium" ? "amber" : "gray") },
          { key: "annualSpendEUR", label: "Spend", render: r => U.money(r.annualSpendEUR), sortVal: r => r.annualSpendEUR },
          { key: "renewal", label: "Renewal", render: r => U.h("span", { class: "sla " + U.dueClass(r.renewal, 60) }, U.date(r.renewal)) },
          { key: "ddqStatus", label: "DDQ", filter: "select", render: r => C.pill(r.ddqStatus, r.ddqStatus === "Complete" ? "green" : "amber") },
          { key: "clauses", label: "Contract clauses", render: r => U.h("span", null, Object.entries(r.clauses).map(([k, ok]) => U.h("span", { title: k, style: { marginRight: "2px" } }, ok ? "✓" : U.h("b", { style: { color: "var(--danger)" } }, "✗")))) },
          { key: "scorecard", label: "Scorecard", render: r => (Object.values(r.scorecard).reduce((a, b) => a + b, 0) / 5).toFixed(1) + "/5" }
        ],
        onRow: r => Router.go("vendorgate/v/" + r.id)
      })));
      main.append(U.h("div", { class: "card" }, U.h("h3", null, "The five clauses every AI contract carries"),
        U.h("ol", { style: { paddingLeft: "1.3rem", fontSize: ".9rem", lineHeight: 1.7 } },
          U.h("li", null, U.h("b", null, "Exit & portability: "), "our data and configurations leave with us, in a usable format, at a pre-agreed price."),
          U.h("li", null, U.h("b", null, "Change notification: "), "30-day notice of any model change; version pinning on request. (The clause DocuLex breached — see INC-2026-0011.)"),
          U.h("li", null, U.h("b", null, "Evaluation rights: "), "we may benchmark their model on our golden set and publish results internally."),
          U.h("li", null, U.h("b", null, "Incident cooperation: "), "named contacts, log access and timelines when something goes wrong."),
          U.h("li", null, U.h("b", null, "Audit access: "), "for us, our auditors and our supervisor."))));
    },
    "vendorgate/v": (main, args) => {
      const v = Store.get("vendorsAI", args[0]);
      if (!v) { main.append(C.banner("bad", "Vendor not found.")); return; }
      main.append(C.crumbs({ label: "VendorGate", href: "#/vendorgate" }, { label: v.name }),
        C.pageHead(v.name, v.service, C.pill(v.blastTier + " blast radius", v.blastTier === "High" ? "red" : "amber")));
      main.append(U.h("div", { class: "grid2" },
        U.h("div", { class: "card" }, U.h("h3", null, "Commercials & clauses"),
          C.kv([["Annual spend", U.money(v.annualSpendEUR)], ["Renewal", U.date(v.renewal) + " (" + U.rel(v.renewal) + ")"], ["DDQ", v.ddqStatus], ["Linked models", (v.models || []).join(", ") || "—"], v.notes ? ["Notes", v.notes] : null]),
          U.h("h3", { style: { marginTop: "1rem" } }, "Clause checklist"),
          C.gateChecklist(Object.entries(v.clauses).map(([k, ok]) => ({ label: k, ok })))),
        U.h("div", { class: "card" }, U.h("h3", null, "Scorecard (weights locked " + "before demos)"),
          Charts.hbars({ items: Object.entries(v.scorecard).map(([k, val]) => ({ label: k, value: val })), max: 5, fmt: x => x + "/5" }),
          U.h("h3", { style: { marginTop: "1rem" } }, "Renewal position builder"),
          U.h("ul", { style: { paddingLeft: "1.2rem", fontSize: ".86rem", lineHeight: 1.6 } },
            U.h("li", null, "Leverage: incident record, clause gaps, alternative vendors under evaluation"),
            U.h("li", null, "Asks: version pinning, 30-day change notice, evaluation rights, flat pricing"),
            U.h("li", null, "BATNA: parallel evaluation funded for Q1 — never renew without one")))));
      main.append(U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "Audit trail"), C.auditTrail("vendorsAI", v.id)));
    }
  }
});

/* ================= DataBridge ================= */
SITE.modules.push({
  id: "databridge", icon: "flask", label: "DataBridge", home: "databridge", color: "#1d7a3e", desc: "Data readiness & privacy",
  routes: {
    "databridge": (main) => {
      main.append(C.crumbs({ label: "DataBridge" }), C.pageHead("Data readiness & privacy",
        "Dataset catalogue, lineage, quality gates, access requests and the DPIA workflow with the DPO. Data readiness is where AI timelines go to die — manage it like a first-class gate."));
      main.append(C.tabs("db", [
        {
          id: "cat", label: "Dataset catalogue", render: () => C.table({
            id: "dst", rows: Store.all("datasets"), columns: [
              { key: "name", label: "Dataset", render: r => U.h("span", { class: "mono" }, r.name) },
              { key: "domain", label: "Domain", filter: "select" },
              { key: "qualityScore", label: "Quality", render: r => U.h("span", { class: r.qualityScore >= 90 ? "up" : "down" }, U.pct(r.qualityScore, 0)) },
              { key: "pii", label: "PII", render: r => r.pii ? C.pill("PII", "red") : C.pill("none", "green") },
              { key: "lineage", label: "Lineage", render: r => r.lineage.join(" → ") },
              { key: "gates", label: "Quality gates", render: r => Object.entries(r.gates).map(([g, ok]) => C.pill(g, ok ? "green" : "red")) },
              { key: "owner", label: "Owner" }]
          })
        },
        {
          id: "req", label: "Access requests", render: () => C.table({
            id: "dsr", rows: Store.all("dataRequests"), columns: [
              { key: "id", label: "ID", render: r => U.h("span", { class: "mono" }, r.id) },
              { key: "dataset", label: "Dataset" }, { key: "requester", label: "Requester" },
              { key: "purpose", label: "Purpose", filter: "select" },
              { key: "date", label: "Date", render: r => U.date(r.date) },
              { key: "status", label: "Status", filter: "select", render: r => C.pill(r.status) },
              {
                key: "a", label: "", render: r => r.status === "Pending DPO" && (Personas.current().id === "maren" || Personas.isYou()) ?
                  U.h("div", { onclick: e => e.stopPropagation() }, C.approvalActions("dataRequests", r.id, {
                    can: true, onApprove: c => Store.save("dataRequests", r.id, { status: "Approved" }, "Access approved", c),
                    onReject: c => Store.save("dataRequests", r.id, { status: "Rejected" }, "Access rejected", c)
                  })) : null
              }]
          })
        },
        {
          id: "dpia", label: "DPIA workflow", render: () => U.h("div", null,
            C.table({
              id: "dpia", rows: Store.all("dpias"), columns: [
                { key: "id", label: "DPIA", render: r => U.h("span", { class: "mono" }, r.id) },
                { key: "ucId", label: "Use case", render: r => U.h("a", { href: "#/registry/uc/" + r.ucId }, (Store.get("useCases", r.ucId) || {}).title || r.ucId) },
                { key: "status", label: "Status", filter: "select", render: r => C.pill(r.status) },
                { key: "risk", label: "Residual risk note" },
                { key: "date", label: "Date", render: r => U.date(r.date) }]
            }),
            U.h("p", { class: "muted small", style: { marginTop: ".6rem" } }, "DPIA before build starts — retrofit privacy is the most expensive kind. The DPO can refuse; a refusal backed by the CoE is governance working, not failing."))
        }
      ]));
    }
  }
});

/* ================= ValueBoard ================= */
SITE.modules.push({
  id: "valueboard", icon: "target", label: "ValueBoard", home: "valueboard", color: "#0d2240", desc: "Portfolio, WSJF & value ledger",
  routes: {
    "valueboard": (main) => {
      main.append(C.crumbs({ label: "ValueBoard" }), C.pageHead("Portfolio & value",
        "WSJF scoring by sponsors, the one-page AI strategy, and the value ledger that Finance co-signs. A kill decision with re-entry conditions is a portfolio win, not a failure."));
      main.append(C.tabs("vb", [
        {
          id: "strategy", label: "AI strategy (one page)", render: () => U.h("div", { class: "card" },
            U.h("h3", null, "The one-page AI strategy — 2026"),
            U.h("div", { class: "grid2" },
              U.h("div", null, U.h("h4", { style: { color: "var(--accent)", fontSize: ".82rem", textTransform: "uppercase" } }, "Context"),
                U.h("p", { class: "small" }, "Cost pressure in operations; fraud losses rising; supervisors expect a defensible inventory. AI spend concentrates where decisions are frequent, measurable and governed."),
                U.h("h4", { style: { color: "var(--accent)", fontSize: ".82rem", textTransform: "uppercase", marginTop: ".8rem" } }, "Three bets"),
                U.h("ol", { class: "small", style: { paddingLeft: "1.2rem" } },
                  U.h("li", null, "Decision models in credit and financial crime (measured loss/benefit per decision)"),
                  U.h("li", null, "Document intelligence across KYC and operations (hours out of queues)"),
                  U.h("li", null, "One governed GenAI platform (gateway + copilot pattern), not fifty pilots"))),
              U.h("div", null, U.h("h4", { style: { color: "var(--accent)", fontSize: ".82rem", textTransform: "uppercase" } }, "Non-goals, named"),
                U.h("ul", { class: "small", style: { paddingLeft: "1.2rem" } },
                  U.h("li", null, "No autonomous-tier agents this cycle"),
                  U.h("li", null, "No customer-facing GenAI before the transparency pattern is proven internally"),
                  U.h("li", null, "No model building where a vendor score + our data does the job")),
                U.h("h4", { style: { color: "var(--accent)", fontSize: ".82rem", textTransform: "uppercase", marginTop: ".8rem" } }, "Scoreboard (quarterly)"),
                U.h("ul", { class: "small", style: { paddingLeft: "1.2rem" } },
                  U.h("li", null, "Measured value, Finance co-signed (" + U.money(U.sum(Store.all("valueLedger").filter(v => v.measuredEUR), "measuredEUR")) + ")"),
                  U.h("li", null, "Intake-to-tier median vs 5-day promise"), U.h("li", null, "T1 incidents + time to contain"),
                  U.h("li", null, "Fairness: no monitor below floor"), U.h("li", null, "Unit costs per decision / per query")))),
            U.h("p", { class: "muted small" }, "Test: can a sponsor disagree with it? If nobody can, it chooses nothing."))
        },
        {
          id: "wsjf", label: "WSJF board", render: () => C.table({
            id: "wsjf", rows: U.sort(Store.all("wsjf"), "score", true), pageSize: 15, columns: [
              { key: "title", label: "Use case", render: r => U.h("a", { href: "#/registry/uc/" + r.ucId }, r.title) },
              { key: "businessValue", label: "Business value" }, { key: "timeCriticality", label: "Time criticality" },
              { key: "riskReduction", label: "Risk reduction" }, { key: "jobSize", label: "Job size" },
              { key: "score", label: "WSJF", render: r => U.h("b", null, r.score), sortVal: r => r.score }]
          })
        },
        {
          id: "ledger", label: "Value ledger", render: () => U.h("div", null,
            C.banner("info", U.h("b", null, "Ledger rule: "), "a number enters only with a Finance-accepted baseline, and Finance co-signs what is measured. Credit's " + U.money(CANON.credit.valueEUR) + "/year is the exemplar entry."),
            C.table({
              id: "vl", rows: Store.all("valueLedger").filter(v => v.promisedEUR), pageSize: 12, columns: [
                { key: "title", label: "Use case", render: r => U.h("a", { href: "#/registry/uc/" + r.ucId }, r.title) },
                { key: "promisedEUR", label: "Promised", render: r => U.money(r.promisedEUR), sortVal: r => r.promisedEUR },
                { key: "measuredEUR", label: "Measured", render: r => U.money(r.measuredEUR), sortVal: r => r.measuredEUR || 0 },
                { key: "financeCosign", label: "Finance", render: r => r.financeCosign ? C.pill("co-signed", "green") : C.pill("pending baseline", "amber") },
                { key: "delta", label: "Delta explanation" }]
            }))
        },
        {
          id: "kills", label: "Pause / kill decisions", render: () => U.h("div", { class: "card" },
            U.h("h3", null, "Paused, killed and retired — with re-entry conditions"),
            U.h("table", { class: "data" }, U.h("thead", null, U.h("tr", null, ["Use case", "Decision", "Why", "Re-entry condition"].map(hh => U.h("th", null, hh)))),
              U.h("tbody", null, Store.all("useCases").filter(u => ["Paused", "Rejected", "Retired", "Suspended"].includes(u.stage)).map(u =>
                U.h("tr", null, U.h("td", null, U.h("a", { href: "#/registry/uc/" + u.id }, u.title)), U.h("td", null, C.pill(u.stage)),
                  U.h("td", { class: "small" }, u.stage === "Rejected" ? "Value case failed triage or duplicated an existing build" : u.stage === "Paused" ? "Data readiness blocked; sponsor capacity" : u.stage === "Suspended" ? "Control concern pending remediation" : "Superseded or value not sustained"),
                  U.h("td", { class: "small" }, u.stage === "Rejected" ? "New evidence of distinct value" : u.stage === "Paused" ? "Dataset quality gate passes" : u.stage === "Suspended" ? "Finding remediated + revalidation" : "—"))))),
            U.h("p", { class: "muted small", style: { marginTop: ".5rem" } }, "A portfolio that kills nothing is not being managed."))
        }
      ]));
    }
  }
});

/* ================= CoE Ledger ================= */
SITE.modules.push({
  id: "ledger", icon: "money", label: "CoE Ledger", home: "ledger", color: "#155c30", desc: "Budget, forecast, unit costs",
  routes: {
    "ledger": (main) => {
      main.append(C.crumbs({ label: "CoE Ledger" }), C.pageHead("CoE finance",
        "Budget by category, forecast vs actual with one-line variance causes, the GPU-vs-API calculator, unit costs and chargeback."));
      const b = SEED.budget;
      main.append(U.h("div", { class: "grid4" },
        C.stat("2026 budget", U.money(b.totalEUR), "RTB " + b.rtbPct + "% / CTB " + (100 - b.rtbPct) + "%"),
        C.stat("Cost / 1k decisions", "€" + b.unitCosts.costPer1kDecisionsEUR),
        C.stat("Cost / copilot query", "€" + b.unitCosts.costPerCopilotQueryEUR),
        C.stat("YTD variance", U.pct(100 * (U.sum(b.actuals, "actualEUR") - U.sum(b.actuals, "planEUR")) / U.sum(b.actuals, "planEUR")), "causes below")));
      main.append(U.h("div", { class: "grid2", style: { margin: "1rem 0" } },
        U.h("div", { class: "card" }, U.h("h3", null, "Budget by category"),
          Charts.donut({ items: b.lines.map(l => ({ label: l.cat, value: l.eur })), centre: U.money(b.totalEUR) })),
        U.h("div", { class: "card" }, U.h("h3", null, "Forecast vs actual"),
          Charts.line({ labels: SEED.months.map(m => m.slice(5)), series: [{ label: "Plan", points: b.actuals.map(a => a.planEUR) }, { label: "Actual", points: b.actuals.map(a => a.actualEUR) }], fmt: v => U.money(v) }),
          U.h("table", { class: "data small" }, U.h("tbody", null, b.actuals.filter(a => a.reason).map(a => U.h("tr", null, U.h("td", { class: "nowrap" }, a.month), U.h("td", null, U.h("span", { class: Math.abs(a.actualEUR / a.planEUR - 1) > .05 ? "down" : "" }, U.pct(100 * (a.actualEUR / a.planEUR - 1)))), U.h("td", { class: "small" }, a.reason))))))));
      // GPU vs API calculator
      const calc = U.h("div", { class: "card" });
      const render = () => {
        calc.innerHTML = "";
        const st = Store.state("gpucalc") || { queriesM: 4, tokensPerQ: 1200, apiPer1k: 0.011, gpuNodeYr: 480000, qps: 30 };
        const apiCost = st.queriesM * 1e6 * st.tokensPerQ / 1000 * st.apiPer1k * 4; // per year (quarterly M → yr)
        const nodesNeeded = Math.max(1, Math.ceil(st.queriesM * 1e6 / (90 * 86400) / st.qps * 10) / 10);
        const gpuCost = Math.ceil(nodesNeeded) * st.gpuNodeYr;
        calc.append(U.h("h3", null, "GPU vs API calculator"),
          U.h("div", { class: "grid3" }, [["queriesM", "Queries per quarter (M)"], ["tokensPerQ", "Avg tokens / query"], ["apiPer1k", "API € / 1k tokens"], ["gpuNodeYr", "GPU node pair € / year"], ["qps", "Sustained QPS per node pair"]].map(([k, l]) =>
            U.h("div", { class: "field" }, U.h("label", null, l), U.h("input", { type: "number", step: "any", value: st[k], onchange: e => { st[k] = +e.target.value; Store.state("gpucalc", st); render(); } })))),
          U.h("div", { class: "grid3", style: { marginTop: ".8rem" } },
            C.stat("Hosted API / year", U.money(apiCost)),
            C.stat("Self-hosted / year", U.money(gpuCost), Math.ceil(nodesNeeded) + " node pair(s)"),
            C.stat("Cheaper", apiCost < gpuCost ? "Hosted API" : "Self-hosted", "breakeven ≈ " + b.unitCosts.gpuVsApiBreakevenMQueries + "M q/quarter at current mix", apiCost < gpuCost ? "ok" : "warn")),
          U.h("p", { class: "muted small", style: { marginTop: ".5rem" } }, "Restricted-class data can't use the hosted route at any price — the calculator decides the overflow, policy decides the floor."));
      };
      render();
      main.append(calc);
      main.append(U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "Chargeback statements (November)"),
        C.table({
          id: "chargeback", rows: Object.entries(U.group(Store.all("gatewayTeams"), "businessLine")).map(([line, ts]) => ({ id: line, line, teams: ts.length, eur: U.sum(ts, "costShareEUR") })),
          columns: [{ key: "line", label: "Business line" }, { key: "teams", label: "Teams" }, { key: "eur", label: "Chargeback YTD", render: r => U.money(r.eur), sortVal: r => r.eur }]
        })));
    }
  }
});

/* ================= PeopleDesk ================= */
SITE.modules.push({
  id: "peopledesk", icon: "people", label: "PeopleDesk", home: "peopledesk", color: "#5b2f82", desc: "Team, hiring, literacy, champions",
  routes: {
    "peopledesk": (main) => {
      main.append(C.crumbs({ label: "PeopleDesk" }), C.pageHead("People & capability",
        "The CoE team, AI-role hiring with structured loops, the skills matrix, the three-tier literacy programme and the champions network."));
      const coe = Store.all("people").filter(p => p.dept === "AI CoE");
      main.append(U.h("div", { class: "grid4" },
        C.stat("CoE headcount", coe.length, Math.round(100 * coe.filter(p => !p.role.includes("vendor")).length / coe.length) + "% permanent"),
        C.stat("Open requisitions", Store.all("coeReqs").filter(r => r.status === "Open").length),
        C.stat("Champions", Store.all("people").filter(p => p.role.startsWith("AI Champion")).length, "one per business line"),
        C.stat("Literacy tier-2 done", U.num(SEED.literacy.tiers[1].done, 0), "of " + U.num(SEED.literacy.tiers[1].target, 0))));
      main.append(C.tabs("pd", [
        {
          id: "team", label: "Team & skills", render: () => U.h("div", null,
            U.h("p", { class: "muted small", style: { marginBottom: ".6rem" } }, "Full org tree on the Org chart page. Skills matrix below — the gaps drive the req list."),
            C.table({
              id: "coeteam", rows: coe.filter(p => p.skills), pageSize: 12, columns: [
                { key: "name", label: "Name", render: r => U.h("span", { class: "flex" }, C.avatar(r.name, 24), r.name) },
                { key: "role", label: "Role" }, { key: "site", label: "Site", filter: "select" },
                { key: "tenure", label: "Tenure", render: r => r.tenure + "y" },
                { key: "skills", label: "Skills", render: r => (r.skills || []).map(s => C.pill(s, "outline")) }]
            }))
        },
        {
          id: "hiring", label: "Hiring", render: () => U.h("div", null,
            C.table({
              id: "reqs", rows: Store.all("coeReqs"), columns: [
                { key: "id", label: "Req", render: r => U.h("span", { class: "mono" }, r.id) },
                { key: "role", label: "Role" }, { key: "level", label: "Level", filter: "select" },
                { key: "status", label: "Status", filter: "select", render: r => C.pill(r.status) },
                { key: "stage", label: "Pipeline stage" }, { key: "candidates", label: "Candidates" }]
            }),
            U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "The loop design (from the book)"),
              U.h("table", { class: "data" }, U.h("thead", null, U.h("tr", null, ["Round", "Tests", "Rubric anchor"].map(hh => U.h("th", null, hh)))),
                U.h("tbody", null, [["Technical screen", "ML/LLM fundamentals in banking context", "Can they explain AUC to Elena and to an engineer, differently?"],
                ["System design", "Fraud-scale design: arithmetic, not vibes", "Did they compute TPS, latency budget, pods — or hand-wave?"],
                ["Governance case", "Tier a messy intake; handle a sponsor pushing back", "Do they hold the gate while keeping the sponsor?"],
                ["Behavioural", "Incidents, bad news, working with second line", "Do they self-declare failures and what they changed?"]].map(row => U.h("tr", null, row.map(cc => U.h("td", null, cc))))))))
        },
        {
          id: "literacy", label: "Literacy programme", render: () => U.h("div", { class: "grid3" }, SEED.literacy.tiers.map(t =>
            U.h("div", { class: "card" }, U.h("h3", null, t.tier),
              Charts.gauge(t.done / t.target, { sub: U.num(t.done, 0) + " / " + U.num(t.target, 0) }),
              U.h("p", { class: "small" }, U.h("b", null, "Outcome metric: "), t.outcome))))
        },
        {
          id: "champ", label: "Champions network", render: () => C.table({
            id: "champs", rows: Store.all("people").filter(p => p.role.startsWith("AI Champion")).map(p => ({ ...p, activity: ["2 intakes sourced", "office hours weekly", "1 demo at CoP", "quiet 8 weeks", "3 intakes sourced", "onboarding", "golden-set contributor", "quiet 8 weeks"][U.hue(p.name) % 8] })), columns: [
              { key: "name", label: "Champion", render: r => U.h("span", { class: "flex" }, C.avatar(r.name, 24), r.name) },
              { key: "dept", label: "Business line" }, { key: "site", label: "Site" },
              { key: "activity", label: "Recent activity", render: r => C.pill(r.activity, r.activity.includes("quiet") ? "amber" : "green") }]
          })
        }
      ]));
    }
  }
});
