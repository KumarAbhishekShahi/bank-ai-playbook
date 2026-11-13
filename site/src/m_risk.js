/* AGB modules: ModelVault, Approvals Hub, Sentinel, IncidentDesk, RedCell */
"use strict";

/* ================= ModelVault ================= */
SITE.modules.push({
  id: "modelvault", icon: "bank", label: "ModelVault", home: "modelvault", color: "#5b2f82", desc: "Model inventory & model risk",
  routes: {
    "modelvault": (main) => {
      const isVal = Personas.current().id === "sofia";
      main.append(C.crumbs({ label: "ModelVault" }), C.pageHead("ModelVault — model inventory & risk",
        isVal ? "Validator view: your queue, findings and conditions. First line submits; you decide." :
          "Second-line view of every model: owner, tier, version, validation status, next review, SR 26-2 scope."));
      const models = Store.all("models");
      const vals = Store.all("validations");
      main.append(U.h("div", { class: "grid4" },
        C.stat("Models registered", models.length),
        C.stat("SR 26-2 in scope", models.filter(m => m.srScope).length, "GenAI/agentic governed separately"),
        C.stat("In validation now", vals.filter(v => v.status === "In validation").length),
        C.stat("Reviews due ≤ 90 days", models.filter(m => U.daysBetween(Clock.today(), m.nextReview) <= 90).length, null, "warn")));
      main.append(U.h("div", { class: "card", style: { margin: "1rem 0" } }, U.h("h3", null, "Validation queue"),
        C.table({
          id: "valq", rows: vals, pageSize: 10, columns: [
            { key: "id", label: "Validation", render: r => U.h("span", { class: "mono" }, r.id) },
            { key: "modelId", label: "Model", render: r => (Store.get("models", r.modelId) || {}).name || r.modelId },
            { key: "status", label: "Status", filter: "select", render: r => C.pill(r.status) },
            { key: "submitted", label: "Submitted", render: r => U.date(r.submitted) },
            { key: "findings", label: "Findings", render: r => r.findings.length ? r.findings.map(f => C.pill(f.sev, f.sev === "High" ? "red" : f.sev === "Medium" ? "amber" : "gray")) : "—" },
            {
              key: "act", label: "", render: r => r.status === "In validation" && (isVal || Personas.isYou()) ? U.h("button", {
                class: "btn sm", onclick: (e) => {
                  e.stopPropagation();
                  Modal.open("Validation outcome — " + r.id, () => {
                    const sel = U.h("select", null, ["Validated", "Validated with conditions", "Rejected — resubmit"].map(o => U.h("option", null, o)));
                    const ta = U.h("textarea", { style: { width: "100%", minHeight: "80px", marginTop: ".5rem" }, placeholder: "Findings and conditions (mandatory)…" });
                    return [U.h("div", { class: "field" }, sel), ta, U.h("div", { style: { marginTop: ".8rem", textAlign: "right" } },
                      U.h("button", {
                        class: "btn", onclick: () => {
                          if (ta.value.trim().length < 10) return Toast.show("Findings text is mandatory.", "warn");
                          Store.save("validations", r.id, { status: sel.value, decided: Clock.today(), findings: [...r.findings, { sev: "Medium", text: ta.value.trim(), condition: "Logged " + Clock.today() }] }, "Validation decided: " + sel.value, ta.value.trim());
                          Store.save("models", r.modelId, { validationStatus: sel.value }, "Validation status updated", "");
                          Modal.close(); Router.refresh();
                        }
                      }, "Record decision"))];
                  });
                }
              }, "Decide") : null
            }
          ]
        })));
      main.append(U.h("div", { class: "card" }, U.h("h3", null, "Model register"),
        C.table({
          id: "models", rows: models, pageSize: 15, columns: [
            { key: "id", label: "ID", render: r => U.h("span", { class: "mono" }, r.id) },
            { key: "name", label: "Model", render: r => U.h("span", null, U.h("b", null, r.name), U.h("span", { class: "sub" }, "v" + r.version.replace("v", "") + " · " + (Store.get("useCases", r.useCaseId) || {}).title)) },
            { key: "tier", label: "Tier", filter: "select", render: r => C.pill(r.tier) },
            { key: "srScope", label: "SR 26-2", filter: "select", filterVal: r => r.srScope ? "In scope" : "Out", render: r => r.srScope ? C.pill("in scope", "blue") : C.pill("GenAI/agentic", "purple") },
            { key: "validationStatus", label: "Validation", filter: "select", render: r => C.pill(r.validationStatus) },
            { key: "nextReview", label: "Next review", render: r => U.h("span", { class: "sla " + U.dueClass(r.nextReview, 30) }, U.date(r.nextReview)) },
            { key: "champChallenger", label: "Champ/chall", render: r => r.champChallenger ? "✓" : "—" }
          ],
          onRow: r => Router.go("registry/uc/" + r.useCaseId)
        })));
      main.append(U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "Model card — agb-credit-scorecard (exemplar)"),
        U.h("div", { class: "grid2" },
          C.kv([["Purpose", "Rank-order retail credit applicants by probability of default; decisions remain with credit officers (assist)"],
          ["Performance", `AUC ${CANON.credit.auc} · KS ${CANON.credit.ks} · Gini ${CANON.credit.gini}`],
          ["Challenger", `Gradient boosting AUC ${CANON.credit.gbmAuc} — complexity did not buy lift; logistic champion retained`],
          ["Fairness", `Adverse impact ratio ${CANON.credit.air} (${CANON.credit.approvalRef}% vs ${CANON.credit.approvalProt}%); proxy watch on ${CANON.credit.proxy}`]]),
          C.kv([["Training data", "retail_credit_applications (36 months, reject-inference documented)"],
          ["Limits", "Not valid for SME or secured lending; thin-file segment uses policy rules"],
          ["Monitoring", `PSI bands OK<${CANON.psi.ok} WATCH ${CANON.psi.ok}–${CANON.psi.act} ACT>${CANON.psi.act}; AIR monthly with 0.95 trigger`],
          ["Adverse action", "Reason codes mapped to ECOA/Reg B letters; quarterly wording review with Legal"]]))));
    }
  }
});

/* ================= Approvals Hub ================= */
SITE.modules.push({
  id: "approvals", icon: "check", label: "Approvals Hub", home: "approvals", color: "#1d7a3e", desc: "Everything waiting on a decision",
  navCount: () => Store.all("approvals").filter(a => a.status === "Pending").length || null,
  routes: {
    "approvals": (main) => {
      main.append(C.crumbs({ label: "Approvals Hub" }), C.pageHead("Approvals Hub",
        "All pending approvals across modules. Every decision requires a written rationale; delegation is logged; maker-checker is enforced."));
      const rows = Store.all("approvals");
      main.append(U.h("div", { class: "grid4" },
        C.stat("Pending", rows.filter(a => a.status === "Pending").length),
        C.stat("Past due", rows.filter(a => a.status === "Pending" && U.dueClass(a.due) === "breach").length, null, "bad"),
        C.stat("Decided (you, this session)", rows.filter(a => a.status !== "Pending").length),
        C.stat("Median age", "3 days")));
      main.append(U.h("div", { style: { margin: "1rem 0" } }, C.table({
        id: "apr", rows, pageSize: 15, defaultSort: "due",
        views: [{ label: "Pending", filter: r => r.status === "Pending" }, { label: "All" }, { label: "Past due", filter: r => r.status === "Pending" && U.dueClass(r.due) === "breach" }],
        columns: [
          { key: "id", label: "ID", render: r => U.h("span", { class: "mono" }, r.id) },
          { key: "type", label: "Approval type", filter: "select" },
          { key: "subject", label: "Subject", render: r => U.h("a", { href: r.link }, r.subject) },
          { key: "approverRole", label: "Approver (RACI: A)", filter: "select" },
          { key: "due", label: "Due", render: r => U.h("span", { class: "sla " + U.dueClass(r.due) }, U.date(r.due) + " (" + U.rel(r.due) + ")") },
          { key: "status", label: "Status", render: r => C.pill(r.status) },
          {
            key: "act", label: "", render: r => r.status === "Pending" ? U.h("div", { onclick: e => e.stopPropagation() }, C.approvalActions("approvals", r.id, {
              requester: r.requesterId === (Personas.current().personId || ""), can: true,
              onApprove: c => { Store.save("approvals", r.id, { status: "Approved" }, "Approved", c); Toast.show("Approved.", "ok"); },
              onReject: c => { Store.save("approvals", r.id, { status: "Rejected" }, "Rejected", c); Toast.show("Rejected with rationale.", "warn"); }
            })) : U.h("span", { class: "muted small" }, "decided")
          }
        ]
      })));
      main.append(U.h("div", { class: "card" }, U.h("h3", null, "RACI by approval type"),
        U.h("div", { class: "tscroll" }, U.h("table", { class: "data matrix" },
          U.h("thead", null, U.h("tr", null, ["Approval", "Responsible", "Accountable", "Consulted", "Informed", "Escalation"].map(hh => U.h("th", null, hh)))),
          U.h("tbody", null, [
            ["Tier decision", "Governance lead", "Head of AI CoE", "Sponsor, Model Risk", "AI Council", "CDAIO"],
            ["T1 production approval", "Head of AI CoE", "AI Council (CRO chair)", "Model Risk, CISO, DPO", "ExCo", "Board Risk Cttee"],
            ["Independent validation", "Model owner", "Head of Model Risk", "CoE", "CRO", "CRO"],
            ["GenAI evaluation gate", "Eval engineer", "Head of AI CoE + Red-Team lead", "Platform", "Council", "CDAIO"],
            ["DPIA sign-off", "Use-case owner", "DPO", "Legal, CISO", "Council", "General Counsel"],
            ["Security exception", "Requester", "CISO", "CoE", "Risk", "CRO"],
            ["Vendor onboarding", "Vendor manager", "Procurement + CoE", "Legal, CISO", "Finance", "CFO"],
            ["Budget virement", "CoE finance analyst", "Finance BP", "CDAIO", "—", "CFO"]
          ].map(row => U.h("tr", null, row.map(cell => U.h("td", null, cell)))))))));
    }
  }
});

/* ================= Sentinel ================= */
SITE.modules.push({
  id: "sentinel", icon: "chart", label: "Sentinel", home: "sentinel", color: "#c07f00", desc: "Evaluation & monitoring console",
  routes: {
    "sentinel": (main) => {
      main.append(C.crumbs({ label: "Sentinel" }), C.pageHead("Sentinel — evaluation & monitoring",
        "Golden-set gates per release, fairness monitors with trigger lines, PSI drift bands, and alerts that open incidents."));
      main.append(C.tabs("sentinel", [
        {
          id: "golden", label: "Golden-set gates", render: () => U.h("div", null,
            U.h("div", { class: "grid4", style: { marginBottom: "1rem" } },
              C.stat("Latest hit@3", U.pct(SEED.golden[SEED.golden.length - 1].hitAt3, 0), "gate: " + CANON.copilot.hitAt3Gate + "%", "ok"),
              C.stat("Gate failures (12 mo)", SEED.golden.filter(g => !g.passed).length, "incl. the famous " + CANON.copilot.hitAt3Fail + "% synonym miss"),
              C.stat("Similarity floor", CANON.copilot.simFloor, "below floor → refuse and escalate"),
              C.stat("RAG contracts", "3", CANON.ragContracts.join(" · "))),
            U.h("div", { class: "card" }, U.h("h3", null, "hit@3 by release, against the gate"),
              Charts.line({ labels: SEED.golden.map(g => g.release.replace("copilot ", "")), series: [{ label: "hit@3 %", points: SEED.golden.map(g => g.hitAt3) }], goal: CANON.copilot.hitAt3Gate, min: 60, max: 100, fmt: v => v + "%" }),
              U.h("p", { class: "muted small" }, "v1.4 failed at " + CANON.copilot.hitAt3Fail + "% — retrieval synonyms missing; passed after the synonym fix. The gate did its job: the bad release never shipped.")),
            U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "Run log"),
              C.table({
                id: "golden", rows: SEED.golden, columns: [
                  { key: "release", label: "Release" }, { key: "date", label: "Date", render: r => U.date(r.date) },
                  { key: "hitAt3", label: "hit@3", render: r => U.pct(r.hitAt3, 0) }, { key: "grounded", label: "Grounded-answer", render: r => U.pct(r.grounded) },
                  { key: "refusalOK", label: "Refusal correctness", render: r => U.pct(r.refusalOK) },
                  { key: "passed", label: "Gate", render: r => r.passed ? C.pill("passed", "green") : C.pill("failed — held", "red") },
                  { key: "note", label: "Note", render: r => r.note || "—" }]
              })))
        },
        {
          id: "fair", label: "Fairness", render: () => U.h("div", { class: "grid2" },
            U.h("div", { class: "card" }, U.h("h3", null, "Adverse impact ratio — credit scorecard"),
              Charts.line({ labels: SEED.months.map(m => m.slice(5)), series: [{ label: "AIR", points: SEED.air, color: "#b02a37" }], min: 0.85, max: 1.0, goal: 0.95, fmt: v => v.toFixed(2) }),
              U.h("p", { class: "small" }, `Current: ${SEED.air[11]} — approval ${CANON.credit.approvalRef}% (reference) vs ${CANON.credit.approvalProt}% (protected). Internal trigger 0.95 (dashed); policy floor 0.90. Proxy-bias analysis points to ${CANON.credit.proxy}. Options paper is on the Council agenda.`)),
            U.h("div", { class: "card" }, U.h("h3", null, "Fairness monitor coverage"),
              U.h("table", { class: "data" }, U.h("thead", null, U.h("tr", null, ["Use case", "Metric", "Cadence", "Status"].map(hh => U.h("th", null, hh)))),
                U.h("tbody", null, [["Credit scorecard", "AIR + approval-rate gap", "Monthly", "WATCH (0.92)"], ["Collections prioritisation", "Equal opportunity diff", "Monthly", "OK"], ["HR CV screening", "Full protected set (pre-prod)", "Per release", "DPIA pending"], ["Credit limit increases", "AIR", "Monthly", "OK"]].map(row =>
                  U.h("tr", null, U.h("td", null, row[0]), U.h("td", null, row[1]), U.h("td", null, row[2]), U.h("td", null, C.pill(row[3], row[3].startsWith("WATCH") ? "amber" : row[3] === "OK" ? "green" : "gray"))))))))
        },
        {
          id: "fraud", label: "Fraud thresholds", render: () => U.h("div", null,
            U.h("div", { class: "grid2" },
              U.h("div", { class: "card" }, U.h("h3", null, "Alert budget vs precision & recall (fraud model, AUC " + CANON.fraud.auc + ")"),
                Charts.bars({ labels: CANON.fraud.budgets.map(b => b.alerts + "/day"), series: [{ label: "Precision %", points: CANON.fraud.budgets.map(b => b.precision) }, { label: "Recall %", points: CANON.fraud.budgets.map(b => b.recall) }], fmt: v => v + "%" }),
                U.h("p", { class: "muted small" }, "The precision cliff between 100 and 200 alerts/day is the decision. Analyst capacity defines the budget; the curve prices it.")),
              U.h("div", { class: "card" }, U.h("h3", null, "Threshold memo (signed, re-signed quarterly)"),
                U.h("table", { class: "data" }, U.h("thead", null, U.h("tr", null, ["Alerts/day", "Precision", "Recall", ""].map(h => U.h("th", null, h)))),
                  U.h("tbody", null, CANON.fraud.budgets.map(b => U.h("tr", { style: b.alerts === 100 ? { background: "var(--pill-green-bg)" } : null }, U.h("td", null, b.alerts), U.h("td", null, U.pct(b.precision)), U.h("td", null, U.pct(b.recall)), U.h("td", null, b.alerts === 100 ? C.pill("selected", "green") : ""))))),
                U.h("p", { class: "small", style: { marginTop: ".5rem" } }, "Selected: 100/day — 4 of 5 reviews are real fraud, protecting analyst trust. Review triggers: staffing change, fraud-loss drift > 20%, model refresh."))),
            U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "AML queue (recall-first by design)"),
              U.h("div", { class: "grid4" }, C.stat("Alerts in queue", CANON.aml.alerts), C.stat("Precision", CANON.aml.precision + "%", "4× the rules-only 8%"), C.stat("Recall", CANON.aml.recall + "%", "the regulatory objective", "ok"), C.stat("SARs filed", CANON.aml.sars + " SARs"))))
        },
        {
          id: "drift", label: "Drift (PSI)", render: () => U.h("div", null,
            U.h("div", { class: "card" }, U.h("h3", null, "PSI by feature — credit scorecard"),
              Charts.line({
                labels: SEED.months.map(m => m.slice(5)), min: 0, max: 0.3, fmt: v => v.toFixed(2),
                bands: [{ from: 0, to: CANON.psi.ok, color: "#1d7a3e", label: "OK" }, { from: CANON.psi.ok, to: CANON.psi.act, color: "#c07f00", label: "WATCH" }, { from: CANON.psi.act, to: 0.3, color: "#b02a37", label: "ACT" }],
                series: Object.entries(SEED.psi).map(([f, pts]) => ({ label: f, points: pts }))
              }),
              U.h("p", { class: "muted small" }, `Bands: OK < ${CANON.psi.ok} · WATCH ${CANON.psi.ok}–${CANON.psi.act} · ACT > ${CANON.psi.act}. utilisation crossed into WATCH and is climbing — if it crosses ${CANON.psi.act}, the runbook mandates investigation and a retrain decision.`)),
            U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "Delayed ground truth"),
              U.h("p", { class: "small" }, "Credit outcomes mature over months: current-vintage performance is estimated via roll-rates until actual defaults land. The monitoring report shows both the early-estimate curve and matured actuals — never just one.")))
        },
        {
          id: "alerts", label: "Alerts", render: () => U.h("div", { class: "card" }, U.h("h3", null, "Monitor alerts (open incidents from here)"),
            C.table({
              id: "alerts", rows: Store.all("monitorAlerts"), columns: [
                { key: "date", label: "Date", render: r => U.date(r.date) }, { key: "source", label: "Source", filter: "select" },
                { key: "text", label: "Alert" }, { key: "sev", label: "Level", render: r => C.pill(r.sev === "warn" ? "watch" : "info", r.sev === "warn" ? "amber" : "green") },
                {
                  key: "act", label: "", render: r => U.h("button", {
                    class: "btn ghost sm", onclick: () => {
                      const iid = "INC-2026-" + (9000 + Math.floor(Math.random() * 999));
                      Store.create("incidents", { id: iid, sev: "S3", title: "From alert: " + r.text, ucId: r.ucId, date: Clock.today(), status: "Open", cause: "Under investigation", blastRadius: "TBD", reportedInH: 1, timeline: [[Clock.today() + " 09:00", "Opened from Sentinel alert"]], containment: [], audit: [] });
                      Toast.show("Incident " + iid + " opened and clock started.", "warn"); Router.go("incidents/view/" + iid);
                    }
                  }, "Open incident")
                }]
            }))
        }
      ]));
    }
  }
});

/* ================= IncidentDesk ================= */
SITE.modules.push({
  id: "incidents", icon: "alert", label: "IncidentDesk", home: "incidents", color: "#b02a37", desc: "S1/S2/S3 ladder, 24h clock",
  navCount: () => Store.all("incidents").filter(i => !String(i.status).startsWith("Closed")).length || null,
  routes: {
    "incidents": (main) => {
      main.append(C.crumbs({ label: "IncidentDesk" }), C.pageHead("AI incident management",
        `S1/S2/S3 ladder with a ${CANON.reporting24h}-hour internal reporting clock. Blameless postmortems with owned actions — the ladder is a learning machine, not a blame machine.`));
      const rows = Store.all("incidents");
      main.append(U.h("div", { class: "grid4" },
        C.stat("Open / tracking", rows.filter(i => !String(i.status).startsWith("Closed")).length, null, "warn"),
        C.stat("S2 this year", rows.filter(i => i.sev === "S2").length),
        C.stat("Reported within 24h", U.pct(100 * rows.filter(i => i.reportedInH <= 24).length / rows.length, 0), "internal standard", "ok"),
        C.stat("Mean time to contain", "9.6h", "S2 median")));
      main.append(U.h("div", { class: "card", style: { margin: "1rem 0" } }, U.h("h3", null, "Severity ladder"),
        U.h("table", { class: "data" }, U.h("thead", null, U.h("tr", null, ["Level", "Definition", "Clock", "Who is told"].map(hh => U.h("th", null, hh)))),
          U.h("tbody", null, [
            ["S1", "Customer harm at scale, regulatory exposure, or an autonomous action gone wrong", "Immediate exec page + 24h internal report", "CRO, CDAIO, CISO, DPO as relevant; regulator assessment same day"],
            ["S2", "Wrong outputs acted on; contained harm; material control failure", "24h internal report", "CRO + Council at next session; sponsor same day"],
            ["S3", "Near-miss, degraded quality, guardrail catch", "Logged; weekly review", "CoE leads; themes to Council monthly"]
          ].map(row => U.h("tr", null, U.h("td", null, C.pill(row[0])), U.h("td", null, row[1]), U.h("td", null, row[2]), U.h("td", null, row[3])))))));
      main.append(C.table({
        id: "inc", rows, pageSize: 12, defaultSort: "date",
        views: [{ label: "All" }, { label: "Open", filter: r => !String(r.status).startsWith("Closed") }, { label: "S2+", filter: r => r.sev !== "S3" }],
        columns: [
          { key: "id", label: "ID", render: r => U.h("span", { class: "mono" }, r.id) },
          { key: "sev", label: "Sev", filter: "select", render: r => C.pill(r.sev) },
          { key: "title", label: "Incident", render: r => U.h("span", null, U.h("b", null, r.title.slice(0, 80)), r.canon ? C.pill("book: ch. 27", "purple") : null) },
          { key: "date", label: "Date", render: r => U.date(r.date) },
          { key: "reportedInH", label: "Reported in", render: r => U.h("span", { class: "sla " + (r.reportedInH <= 24 ? "ok" : "breach") }, r.reportedInH + "h") },
          { key: "status", label: "Status", filter: "select", render: r => C.pill(r.status) }
        ],
        onRow: r => Router.go("incidents/view/" + r.id)
      }));
    },
    "incidents/view": (main, args) => {
      const i = Store.get("incidents", args[0]);
      if (!i) { main.append(C.banner("bad", "Incident not found.")); return; }
      main.append(C.crumbs({ label: "IncidentDesk", href: "#/incidents" }, { label: i.id }),
        C.pageHead(i.title, i.id + " · " + U.date(i.date), C.pill(i.sev), C.pill(i.status)));
      if (i.canon) main.append(C.banner("info", U.h("b", null, "The Chapter 27 incident. "), `The copilot told an employee a EUR ${CANON.copilot.incident.amountEUR} client dinner was within policy. ${CANON.copilot.incident.sev}; cause: ${CANON.copilot.incident.cause}; audit-log replay found ${CANON.copilot.incident.similarQueries} similar queries in ${CANON.copilot.incident.windowDays} days.`));
      main.append(U.h("div", { class: "grid2" },
        U.h("div", { class: "card" }, U.h("h3", null, "Timeline"),
          U.h("ul", { class: "audit" }, (i.timeline || []).map(t => U.h("li", null, U.h("span", { class: "when" }, t[0]), U.h("span", null, t[1])))),
          U.h("h3", { style: { marginTop: "1rem" } }, "Containment & actions"),
          U.h("ul", { style: { paddingLeft: "1.1rem", fontSize: ".88rem" } }, (i.containment || []).map(a => U.h("li", null, a)))),
        U.h("div", { class: "card" }, U.h("h3", null, "Analysis"),
          C.kv([["Root cause", i.cause], ["Blast radius", i.blastRadius], ["Internal report", i.reportedInH + "h after detection (standard: " + CANON.reporting24h + "h)"], ["Linked use case", i.ucId ? U.h("a", { href: "#/registry/uc/" + i.ucId }, i.ucId) : "—"]]),
          U.h("h3", { style: { marginTop: "1rem" } }, "Communication drafts"),
          U.h("p", { class: "small muted" }, "To affected users · to the sponsor · Council note · (S1 only) regulator brief. Drafted from the timeline, reviewed by Comms and Legal."),
          !String(i.status).startsWith("Closed") ? U.h("button", {
            class: "btn", style: { marginTop: ".6rem" }, onclick: () => {
              Store.save("incidents", i.id, { status: "Closed — postmortem complete" }, "Closed with blameless postmortem", "Actions owned and tracked");
              Toast.show("Closed. Postmortem actions are now tracked to completion.", "ok"); Router.refresh();
            }
          }, "Close with postmortem") : null)));
      main.append(U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "Audit trail"), C.auditTrail("incidents", i.id)));
    }
  }
});

/* ================= RedCell ================= */
SITE.modules.push({
  id: "redcell", icon: "shield", label: "RedCell", home: "redcell", color: "#8f1d28", desc: "Red-team & AI security",
  routes: {
    "redcell": (main) => {
      main.append(C.crumbs({ label: "RedCell" }), C.pageHead("RedCell — red-team & AI security tracker",
        "Findings ranked by exploitability × impact, each with a trace, a control and an owner. The best findings get promoted into the golden set as regression tests."));
      const rows = Store.all("redFindings");
      main.append(U.h("div", { class: "grid4" },
        C.stat("Findings (12 mo)", rows.length),
        C.stat("Open / mitigating", rows.filter(r => r.status !== "Closed").length, null, "warn"),
        C.stat("Promoted to regression", rows.filter(r => r.promoted).length, "now gate every release"),
        C.stat("OWASP coverage", "LLM + Agentic Top 10", "test plans mapped")));
      main.append(U.h("div", { class: "card", style: { margin: "1rem 0" } }, U.h("h3", null, "Exploitability × impact"),
        Charts.heat({
          rows: ["High impact", "Medium", "Low"], cols: ["Low expl.", "Medium", "High"],
          value: (r, c) => {
            const imp = ["High", "Medium", "Low"][r], ex = ["Low", "Medium", "High"][c];
            const n = rows.filter(f => f.impact === imp && f.exploitability === ex).length;
            const hot = (r === 0 && c === 2) || (r === 0 && c === 1) || (r === 1 && c === 2);
            return { txt: String(n), color: n === 0 ? "#e6eaef" : hot ? "#b02a37" : "#c07f00", ink: n === 0 ? "#44566b" : "#fff", title: imp + " impact / " + ex + " exploitability" };
          }
        })));
      main.append(C.table({
        id: "rtf", rows, pageSize: 12, columns: [
          { key: "id", label: "ID", render: r => U.h("span", { class: "mono" }, r.id) },
          { key: "title", label: "Finding" },
          { key: "owasp", label: "OWASP", filter: "select", render: r => C.pill(r.owasp, "purple") },
          { key: "exploitability", label: "Exploitability", filter: "select", render: r => C.pill(r.exploitability) },
          { key: "impact", label: "Impact", filter: "select", render: r => C.pill(r.impact) },
          { key: "status", label: "Status", filter: "select", render: r => C.pill(r.status) },
          { key: "control", label: "Control" },
          {
            key: "promoted", label: "Regression", render: r => r.promoted ? C.pill("in golden set", "green") : U.h("button", {
              class: "btn ghost sm", onclick: () => { Store.save("redFindings", r.id, { promoted: true }, "Promoted to regression test", "Added to golden set"); Toast.show("Promoted — this attack now gates every release.", "ok"); Router.refresh(); }
            }, "Promote")
          }
        ]
      }));
      main.append(U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "Standing test plans"),
        U.h("ul", { style: { paddingLeft: "1.2rem", fontSize: ".88rem" } },
          U.h("li", null, U.h("b", null, "Quarterly copilot sweep: "), "direct + indirect injection, data exfiltration, refusal bypass, citation forgery."),
          U.h("li", null, U.h("b", null, "Agent graph audit: "), "tool allow-list bypass attempts, step-budget abuse, goal hijack via poisoned context. Safety is enforced in the graph, not the prompt."),
          U.h("li", null, U.h("b", null, "Classic-ML adversarial: "), "feature manipulation on fraud, membership inference on credit."),
          U.h("li", null, U.h("b", null, "Supply chain: "), "vector-store poisoning, dependency scanning, model-file integrity."))));
    }
  }
});
