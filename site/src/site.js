/* AGB site configuration */
"use strict";
const SITE = {
  ns: "agb.v1",
  brand: { org: "Aurelia Global Bank", suite: "AGB One", mark: "A", tagline: "AI Centre of Excellence workspace — intake to retirement, with every approval in between." },
  bookName: "The Bank AI Playbook",
  respLabel: "of the 32 AI CoE responsibilities and 33 chapters",
  currency: "EUR",
  todaySeed: CANON.todaySeed,
  youId: "you",
  mailName: "AGB Mail", mailRoute: "mail",
  exampleId: "UC-2026-0147",
  announcements: ["Supervisory letter REG-2026-02 received — response due 8 Dec", "AI Council 20 Nov: AIR options paper on the agenda", "DocuLex renewal decision due 15 Dec"],
  chartColors: ["#0e5f74", "#0d2240", "#c07f00", "#5b2f82", "#b02a37", "#1d7a3e", "#4e7ac4"],
  personas: [
    { id: "you", personId: "PPL-0004", name: "Dhruv Mehta", role: "Head of AI CoE", permissions: "*" },
    { id: "ingrid", personId: "PPL-0002", name: "Ingrid Halvorsen", role: "Group CDAIO", permissions: ["exec", "finance-view"] },
    { id: "elena", personId: "PPL-0003", name: "Elena Petrova", role: "CRO", permissions: ["t1approve", "risk-view", "suspend"] },
    { id: "sofia", personId: "PPL-0006", name: "Dr. Sofia Mkhize", role: "Head of Model Risk", permissions: ["validate"] },
    { id: "thierry", personId: "PPL-0007", name: "Thierry Lacombe", role: "Finance BP", permissions: ["finance", "cosign"] },
    { id: "marcus", personId: "PPL-0005", name: "Marcus Webb", role: "Head of Retail Credit", permissions: ["sponsor"] },
    { id: "jonas", personId: "PPL-0009", name: "Jonas Lindqvist", role: "CISO", permissions: ["secexception"] },
    { id: "maren", personId: "PPL-0010", name: "Maren Visser", role: "DPO", permissions: ["dpia"] },
    { id: "samuel", personId: "PPL-0012", name: "Samuel Mensah", role: "Head of Internal Audit", permissions: ["audit-read"] },
    { id: "priya", personId: "PPL-0013", name: "Priya Sharma", role: "Senior DS Lead", permissions: ["build"] },
    { id: "tomas", personId: "PPL-0014", name: "Tomas Novak", role: "Head of Platform Eng", permissions: ["platform"] },
    { id: "henrik", personId: "PPL-0023", name: "Henrik Dahl", role: "Lead Supervisor (fictional)", permissions: ["regulator-view"] }
  ],
  tone(text) {
    const t = String(text).toLowerCase();
    if (/t1|s1|high|breach|rejected|suspended|critical|overdue|urgent/.test(t)) return "red";
    if (/t2|s2|medium|watch|pending|in validation|canary|at risk|partial|open/.test(t)) return "amber";
    if (/t3|s3|low|ok|closed|validated|approved|done|in production|operating|passed/.test(t)) return "green";
    if (/genai|agentic|idea|draft|planned/.test(t)) return "purple";
    return "blue";
  },
  searchables: {
    useCases: { text: r => r.title + " " + r.businessLine, label: r => r.id + " — " + r.title, sub: r => r.stage + " · " + r.tier, link: r => "#/registry/uc/" + r.id },
    people: { text: r => r.name + " " + r.role, label: r => r.name, sub: r => r.role, link: () => "#/org" },
    models: { text: r => r.name, label: r => r.id + " — " + r.name, sub: r => r.validationStatus, link: r => "#/modelvault" },
    incidents: { text: r => r.title, label: r => r.id + " — " + r.title, sub: r => r.sev, link: r => "#/incidents/view/" + r.id },
    vendorsAI: { text: r => r.name + " " + r.service, label: r => r.name, sub: r => r.service, link: r => "#/vendorgate" },
    policies: { text: r => r.name + " " + r.summary, label: r => r.name, sub: r => "Policy " + r.version, link: () => "#/policydesk" },
    messages: { text: r => r.subject + " " + r.body, label: r => r.subject, sub: r => "Message", link: r => "#/mail/" + r.id }
  },
  navGroups: [
    { label: "Run the CoE", items: ["cc", "registry", "approvals"] },
    { label: "Risk & monitoring", items: ["modelvault", "sentinel", "incidents", "redcell"] },
    { label: "Governance", items: ["forums", "policydesk", "regroom", "reports"] },
    { label: "Platform, money & people", items: ["gateway", "vendorgate", "databridge", "valueboard", "ledger", "peopledesk"] }
  ],
  modules: [], // filled by module files
  eventRules: [
    (from, to) => { // regulator deadline
      const out = [];
      if (from < "2026-12-08" && to >= "2026-12-08" && !(Store.state("regDone"))) out.push({ text: "REG-2026-02 response deadline reached. If the binder and inventory return aren't submitted, this is now a supervisory breach.", kind: "bad" });
      if (from < "2026-11-20" && to >= "2026-11-20") out.push({ text: "AI Council convened. Tier distribution and the AIR 0.92 options paper were on the agenda.", kind: "warn" });
      if (from < "2026-12-15" && to >= "2026-12-15") out.push({ text: "DocuLex renewal date passed — check VendorGate for the negotiated outcome.", kind: "warn" });
      if (U.daysBetween(from, to) >= 28) out.push({ text: "Monthly cycle: new actuals in CoE Ledger; PSI and AIR series extended in Sentinel; chargeback statements issued.", kind: "info" });
      const pend = Store.all("approvals").filter(a => a.status === "Pending" && a.due && a.due <= to && a.due > from);
      if (pend.length) out.push({ text: pend.length + " approval(s) passed their due date while you were away — see Approvals Hub.", kind: "warn" });
      const ucs = Store.all("useCases").filter(u => ["Intake submitted", "Triage"].includes(u.stage));
      if (ucs.length && U.daysBetween(from, to) >= 5) out.push({ text: "Intake SLA check: " + ucs.length + " request(s) still untiered after the 5-working-day promise — the SLA dashboard has gone red.", kind: "bad" });
      return out;
    }
  ],
  days: [
    {
      title: "A Tuesday in November (scripted day)", intro: "Run top to bottom. Interruptions are part of the exercise — the skill being practised is triage, protection of the council prep, and knowing what to delegate.",
      slots: [
        { t: "08:30", what: "Command Center sweep: approvals at risk, SLA timers, overnight alerts", link: "#/cc", why: "Leaders open the day with the queue, not the inbox." },
        { t: "09:00", what: "Tier two intakes waiting in Registry (SLA day 4 of 5)", link: "#/registry", why: "The 5-day promise is the CoE's credibility." },
        { t: "10:00", what: "INTERRUPT: Priya's chat — golden-set slice regression, hold or ship?", link: "#/mail", interrupt: true, why: "Release gates don't wait for your calendar." },
        { t: "10:30", what: "Council prep: generate the T1 list and AIR options paper", link: "#/reports", why: "Thursday's council is the week's main event." },
        { t: "12:00", what: "1:1 with Ingrid — escalate the Markets chatbot ask with options", link: "#/mail", why: "Manage up with options, not problems." },
        { t: "14:00", what: "INTERRUPT: S2 page — triage agent step-budget alert misrouted", link: "#/incidents", interrupt: true, why: "Incident command: contain, clock, communicate." },
        { t: "15:30", what: "Vendor call prep: DocuLex renewal position in VendorGate", link: "#/vendorgate", why: "Negotiate from the incident record, not from need." },
        { t: "16:30", what: "Close the loop: delegated approvals, forum actions, inbox zero", link: "#/approvals", why: "Unclosed loops become next week's escalations." }
      ]
    },
    {
      title: "The Letter Week (scripted week)", intro: "The supervisory letter (REG-2026-02) arrived Monday. Response strategy, binder assembly, consistency checks and sign-offs across five days — while the day job continues.",
      slots: [
        { t: "Mon", what: "Log the letter in RegRoom; brief Ingrid and Elena the same day", link: "#/regroom", why: "Regulator letters are never sat on. Same-day escalation is the norm." },
        { t: "Tue", what: "Scope the response: inventory return from Registry; binder plan for 3 models", link: "#/regroom", why: "Scope before effort; the registry generates the inventory." },
        { t: "Wed", what: "Assemble binder for agb-credit-scorecard; gap-check validation evidence", link: "#/regroom/binder/" + "UC-2026-0101", why: "Evidence as a system, not archaeology." },
        { t: "Thu", what: "INTERRUPT: audit surprise sample lands (UC-2026-0147, 5 days)", link: "#/mail", interrupt: true, why: "Two evidence requests at once — same machinery, different clocks." },
        { t: "Fri", what: "Consistency pass: registry vs board pack vs inventory return; draft cover letter", link: "#/reports", why: "The regulator's sharpest test is internal consistency." }
      ]
    }
  ]
};
SITE.hero = {
  who: "Dhruv Mehta — Head of AI Centre of Excellence",
  brief: "Aurelia Global Bank: a tier-1 universal bank (retail, corporate, markets, wealth) across the EU, US and APAC. You report to Ingrid Halvorsen (Group Chief Data & AI Officer) with a dotted line into the AI Council, co-chaired with the CRO, Elena Petrova. ~40 people in the CoE plus champions in every business line. Today is Tuesday 17 November 2026: a supervisory letter is open, the Council meets Thursday, and the credit model's fairness ratio is drifting.",
  start: [["Read the urgent mail (Elena, the regulator, Markets)", "#/mail"], ["Open the Command Center", "#/cc"], ["Walk one use case end to end: the credit scorecard", "#/registry/uc/UC-2026-0101"], ["Try a mission: answer Elena's fairness challenge", "#/missions/run/A-06"], ["See who asks you for what", "#/matrix"]],
  svg: (() => {
    const st = [["Intake", "#0e5f74"], ["Tier", "#0e5f74"], ["Build", "#13304f"], ["Evaluate", "#13304f"], ["Validate", "#5b2f82"], ["Council", "#5b2f82"], ["Production", "#1d7a3e"], ["Monitor", "#c07f00"]];
    let s = '<svg viewBox="0 0 640 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Governed AI lifecycle" style="width:100%;height:auto;font-family:var(--font-ui)">';
    const lanes = [["1st line · CoE & business", 30, "#dbe9f5"], ["2nd line · Model Risk, CRO, DPO, CISO", 110, "#e9e0f2"], ["3rd line · Internal Audit & supervisor", 180, "#f8ecd4"]];
    lanes.forEach(([l, y, c]) => { s += `<rect x="0" y="${y}" width="640" height="${y === 30 ? 72 : 62}" rx="6" fill="${c}"/><text x="8" y="${y + 14}" font-size="9.5" fill="#44566b" font-weight="700">${l}</text>`; });
    st.forEach(([t, c], i) => { const x = 14 + i * 78, y = i === 4 || i === 5 ? 132 : 52; s += `<rect x="${x}" y="${y}" width="66" height="34" rx="6" fill="${c}"/><text x="${x + 33}" y="${y + 21}" font-size="10" fill="#fff" text-anchor="middle" font-weight="700">${t}</text>`; if (i < st.length - 1) { const nx = 14 + (i + 1) * 78, ny = i + 1 === 4 || i + 1 === 5 ? 132 : 52; s += `<path d="M${x + 66} ${y + 17} L${nx} ${ny + 17}" stroke="#5b6b7d" stroke-width="1.5" fill="none" marker-end="url(#a)"/>`; } });
    s += '<defs><marker id="a" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="#5b6b7d"/></marker></defs>';
    s += '<text x="40" y="99" font-size="9" fill="#0e5f74">5-day SLA · T1/T2/T3 = materiality × autonomy</text>';
    s += '<text x="330" y="180" font-size="9" fill="#5b2f82">SR 26-2 validation · GenAI eval gates</text>';
    s += '<path d="M560 69 C 600 120, 600 200, 520 214" stroke="#c07f00" stroke-dasharray="4 3" fill="none"/><text x="350" y="226" font-size="9" fill="#8a5b00">Evidence binder · inventory return · findings (audit samples any stage)</text>';
    s += '<text x="470" y="99" font-size="9" fill="#1d7a3e">PSI · AIR · golden set · incidents</text></svg>';
    return s;
  })()
};
