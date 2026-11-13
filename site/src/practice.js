/* Practice Now — per-page workbench: step-by-step guide, live template with formulas, data collection,
   producing the report, value to the organisation, and the AI-age playbook.
   Content lives in src/practice_data*.js as PRACTICE[routeKey] = {...}. */
"use strict";
window.PRACTICE = window.PRACTICE || {};
/* Authoring helper used by the data files. */
function PG(key, g) { window.PRACTICE[key] = g; }

const Practice = {
  key() {
    const { path, one } = Router.parse();
    if (PRACTICE[path]) return path;
    if (PRACTICE[one]) return one;
    return null;
  },
  done() { return Store.state("practiceDone") || {}; },
  fmt(v, f) {
    if (v == null || (typeof v === "number" && !isFinite(v))) return "—";
    switch (f) {
      case "pct": return (+v).toFixed(1) + "%";
      case "money": return U.money(v);
      case "eur": return U.money(v, "EUR");
      case "usd": return U.money(v, "USD");
      case "days": return (+v).toFixed(1) + " days";
      case "h": return (+v).toFixed(1) + " h";
      case "x": return (+v).toFixed(2) + "×";
      case "int": return Math.round(v).toLocaleString("en-GB");
      case "dec3": return (+v).toFixed(3);
      case "dec2": return (+v).toFixed(2);
      case "text": return String(v);
      default: return typeof v === "number" ? U.num(v, 2) : String(v);
    }
  },
  /* Inject the button into the page head (every page uses C.pageHead). */
  decorate() {
    const k = this.key();
    const head = document.querySelector("#main .pagehead");
    let fab = document.getElementById("practicefab");
    if (!k) { if (fab) fab.style.display = "none"; return; }
    const btn = () => U.h("button", { class: "btn practice-btn", onclick: () => this.open(k), title: "Templates, formulas, data sources and a step-by-step guide for this page" }, "▶ Practice Now");
    if (head) { head.append(btn()); if (fab) fab.style.display = "none"; }
    else {
      if (!fab) { fab = U.h("button", { id: "practicefab", class: "practicefab", onclick: () => this.open(this.key()) }, "▶ Practice Now"); document.body.append(fab); }
      fab.style.display = "";
    }
  },
  open(k) {
    const g = PRACTICE[k];
    if (!g) return;
    this.close();
    const back = U.h("div", { class: "modalback", id: "practiceback", onclick: e => { if (e.target.id === "practiceback") this.close(); } });
    const box = U.h("div", { class: "modal practice-modal", role: "dialog", "aria-label": "Practice: " + g.t });
    const done = !!this.done()[k];
    box.append(U.h("header", null,
      U.h("div", null, U.h("div", { class: "muted small", style: { textTransform: "uppercase", letterSpacing: ".08em" } }, "Practice Now"), U.h("h2", null, g.t)),
      U.h("span", { class: "spacer" }),
      U.h("label", { class: "flex small", style: { gap: ".3rem", marginRight: ".6rem" } }, U.h("input", { type: "checkbox", checked: done ? "" : null, onchange: e => { const d = this.done(); if (e.target.checked) d[k] = Clock.today(); else delete d[k]; Store.state("practiceDone", d); Toast.show(e.target.checked ? "Marked as practised — logged in your evidence log." : "Unmarked.", "ok"); } }), "I've practised this"),
      U.h("a", { class: "btn ghost sm", href: "#/practice/guide/" + encodeURIComponent(k), onclick: () => this.close(), title: "Open as a full page you can print" }, "⤢ Full page"),
      U.h("button", { class: "btn ghost sm", onclick: () => this.close(), style: { marginLeft: ".4rem" } }, "✕")));
    const body = U.h("div", { class: "mbody" });
    body.append(this.render(k, g));
    box.append(body); back.append(box); document.body.append(back);
    this._esc = e => { if (e.key === "Escape") this.close(); };
    document.addEventListener("keydown", this._esc);
  },
  close() { const b = document.getElementById("practiceback"); if (b) b.remove(); if (this._esc) document.removeEventListener("keydown", this._esc); },

  render(k, g) {
    const wrap = U.h("div");
    wrap.append(U.h("div", { class: "practice-intro" }, U.h("p", null, g.why),
      g.out ? U.h("p", { class: "small" }, U.h("b", null, "What you'll produce: "), g.out) : null));
    wrap.append(C.tabs("practice." + k, [
      { id: "steps", label: "1 · Step-by-step", render: () => this.steps(g) },
      { id: "tpl", label: "2 · Template & calculator", render: () => this.template(k, g) },
      { id: "f", label: "3 · Formulas", render: () => this.formulas(g) },
      { id: "data", label: "4 · Collecting the data", render: () => this.data(g) },
      { id: "produce", label: "5 · Producing the report", render: () => this.produce(g) },
      { id: "value", label: "6 · Value to the organisation", render: () => this.value(g) },
      { id: "ai", label: "7 · In the AI age", render: () => this.ai(g) }
    ]));
    return wrap;
  },
  steps(g) {
    return U.h("ol", { class: "practice-steps" }, (g.steps || []).map(([t, d, link]) =>
      U.h("li", null, U.h("div", { class: "pst-t" }, t), U.h("div", { class: "pst-d" }, d),
        link ? U.h("a", { class: "small", href: link, onclick: () => this.close() }, "Do it in the app →") : null)));
  },
  template(k, g) {
    const tpl = g.tpl || {};
    const box = U.h("div");
    const stKey = "ptpl." + k;
    const vals = Object.assign({}, Object.fromEntries((tpl.in || []).map(([key, , def]) => [key, typeof def === "function" ? def() : def])), Store.state(stKey) || {});
    if (tpl.note) box.append(C.banner("info", tpl.note));
    if ((tpl.in || []).length) {
      const outs = U.h("div", { class: "grid3", style: { marginTop: ".8rem" } });
      const renderOuts = () => {
        outs.innerHTML = "";
        for (const [label, fn, fmt, hint] of (tpl.out || [])) {
          let v; try { v = fn(vals); } catch (e) { v = null; }
          outs.append(U.h("div", { class: "statcard" }, U.h("div", { class: "v" }, this.fmt(v, fmt)), U.h("div", { class: "l" }, label), hint ? U.h("div", { class: "d muted" }, hint) : null));
        }
      };
      box.append(U.h("h3", { class: "practice-h" }, "Calculator — edit the inputs (pre-filled with this workspace's numbers)"));
      box.append(U.h("div", { class: "grid3" }, tpl.in.map(([key, label, , unit]) => U.h("div", { class: "field" },
        U.h("label", null, label, unit ? U.h("span", { class: "muted" }, " (" + unit + ")") : null),
        U.h("input", {
          type: typeof vals[key] === "string" ? "text" : "number", step: "any", value: vals[key],
          oninput: e => { vals[key] = e.target.type === "number" ? +e.target.value : e.target.value; const s = Store.state(stKey) || {}; s[key] = vals[key]; Store.state(stKey, s); renderOuts(); }
        })))));
      box.append(outs); renderOuts();
      box.append(U.h("div", { class: "flex", style: { marginTop: ".5rem" } }, U.h("button", { class: "btn ghost sm", onclick: () => { Store.state(stKey, null); Router.refresh(); this.open(k); } }, "Reset to workspace numbers")));
    }
    if (tpl.table) {
      const t = tpl.table;
      box.append(U.h("h3", { class: "practice-h" }, "Template — " + t.file));
      if (t.how) box.append(U.h("p", { class: "small muted" }, t.how));
      box.append(U.h("div", { class: "tablewrap" }, U.h("div", { class: "tscroll" }, U.h("table", { class: "data" },
        U.h("thead", null, U.h("tr", null, t.cols.map(c => U.h("th", null, c)))),
        U.h("tbody", null, (t.rows || []).map(r => U.h("tr", null, r.map(c => U.h("td", null, String(c))))))))));
      const csv = [t.cols, ...(t.rows || [])].map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(",")).join("\n");
      const md = "| " + t.cols.join(" | ") + " |\n|" + t.cols.map(() => "---").join("|") + "|\n" + (t.rows || []).map(r => "| " + r.join(" | ") + " |").join("\n");
      const copy = (txt, what) => { try { navigator.clipboard.writeText(txt).then(() => Toast.show(what + " copied — paste into a spreadsheet or doc.", "ok"), () => Toast.show("Clipboard blocked here — use Download instead.", "warn")); } catch (e) { Toast.show("Clipboard unavailable — use Download.", "warn"); } };
      box.append(U.h("div", { class: "flex-wrap", style: { marginTop: ".6rem" } },
        U.h("button", { class: "btn sm", onclick: () => U.download(t.file, csv, "text/csv") }, "⇩ Download CSV"),
        U.h("button", { class: "btn sec sm", onclick: () => copy(csv, "CSV") }, "Copy as CSV"),
        U.h("button", { class: "btn sec sm", onclick: () => copy(md, "Markdown table") }, "Copy as Markdown")));
    }
    if (tpl.doc) {
      box.append(U.h("h3", { class: "practice-h" }, "Document template"));
      box.append(U.h("pre", { class: "practice-doc" }, tpl.doc));
      box.append(U.h("div", { class: "flex-wrap", style: { marginTop: ".4rem" } },
        U.h("button", { class: "btn sm", onclick: () => U.download((g.t || "template").replace(/[^a-z0-9]+/gi, "-").toLowerCase() + ".md", tpl.doc, "text/markdown") }, "⇩ Download .md"),
        U.h("button", { class: "btn sec sm", onclick: () => { try { navigator.clipboard.writeText(tpl.doc).then(() => Toast.show("Template copied.", "ok")); } catch (e) { } } }, "Copy")));
    }
    return box;
  },
  formulas(g) {
    return U.h("div", { class: "tablewrap" }, U.h("div", { class: "tscroll" }, U.h("table", { class: "data" },
      U.h("thead", null, U.h("tr", null, ["Metric", "Formula", "Worked example (this workspace)", "Good looks like"].map(h => U.h("th", null, h)))),
      U.h("tbody", null, (g.f || []).map(r => U.h("tr", null, U.h("td", null, U.h("b", null, r[0])), U.h("td", { class: "mono small" }, r[1]), U.h("td", { class: "small" }, r[2] || ""), U.h("td", { class: "small" }, r[3] || "")))))));
  },
  data(g) {
    return U.h("div", null,
      U.h("div", { class: "tablewrap" }, U.h("div", { class: "tscroll" }, U.h("table", { class: "data" },
        U.h("thead", null, U.h("tr", null, ["Data item", "Where it comes from (system category)", "Owner", "Cadence", "Quality check before you use it"].map(h => U.h("th", null, h)))),
        U.h("tbody", null, (g.data || []).map(r => U.h("tr", null, r.map((c, i) => U.h("td", { class: i ? "small" : "" }, i ? c : U.h("b", null, c))))))))),
      U.h("p", { class: "muted small", style: { marginTop: ".6rem" } }, "Rule of thumb: pull from the system of record, never a forwarded spreadsheet; record the extract date on every number; and if two sources disagree, say so in the report rather than picking the convenient one."));
  },
  produce(g) {
    return U.h("div", null,
      U.h("ol", { class: "practice-steps" }, (g.produce || []).map(p => U.h("li", null, U.h("div", { class: "pst-d" }, p)))),
      g.audience ? U.h("div", { class: "card", style: { marginTop: ".8rem" } }, U.h("h3", null, "Audience & format"), U.h("p", { class: "small" }, g.audience)) : null,
      (g.pit || []).length ? U.h("div", { class: "card", style: { marginTop: ".8rem", borderLeft: "4px solid var(--danger)" } }, U.h("h3", null, "Common mistakes"), U.h("ul", { class: "small", style: { paddingLeft: "1.1rem" } }, g.pit.map(p => U.h("li", null, p)))) : null);
  },
  value(g) {
    return U.h("div", { class: "grid2" },
      U.h("div", { class: "card" }, U.h("h3", null, "Where it is used"), U.h("ul", { class: "small", style: { paddingLeft: "1.1rem", lineHeight: 1.6 } }, (g.where || []).map(x => U.h("li", null, x)))),
      U.h("div", { class: "card" }, U.h("h3", null, "How it helps the organisation"), U.h("ul", { class: "small", style: { paddingLeft: "1.1rem", lineHeight: 1.6 } }, (g.helps || []).map(x => U.h("li", null, x)))),
      g.value ? U.h("div", { class: "card", style: { gridColumn: "1 / -1", borderLeft: "4px solid var(--ok)" } }, U.h("h3", null, "The value, in one paragraph"), U.h("p", { class: "small" }, g.value)) : null);
  },
  ai(g) {
    return U.h("div", null,
      U.h("div", { class: "grid2" },
        U.h("div", { class: "card" }, U.h("h3", null, "How to do this with AI today"), U.h("ul", { class: "small", style: { paddingLeft: "1.1rem", lineHeight: 1.6 } }, (g.ai || []).map(x => U.h("li", null, x)))),
        U.h("div", { class: "card" }, U.h("h3", null, "What changes as the business evolves with AI"), U.h("ul", { class: "small", style: { paddingLeft: "1.1rem", lineHeight: 1.6 } }, (g.shift || []).map(x => U.h("li", null, x))))),
      U.h("div", { class: "card", style: { marginTop: "1rem", borderLeft: "4px solid var(--warn)" } }, U.h("h3", null, "Guardrails (non-negotiable)"),
        U.h("ul", { class: "small", style: { paddingLeft: "1.1rem", lineHeight: 1.6 } }, (g.guard || ["A human owns every number that leaves your hands — AI drafts, you sign.", "No confidential or personal data into tools outside the approved register and its data boundaries.", "Keep the source extract and the prompt with the output, so the number can be re-derived and audited."]).map(x => U.h("li", null, x)))));
  },

  /* ---------- Library + full-page view ---------- */
  library(main) {
    const keys = Object.keys(PRACTICE).filter(k => !k.startsWith("_"));
    const done = this.done();
    main.append(C.crumbs({ label: "Practice library" }), C.pageHead("Practice library",
      `Every page's practice guide in one place — templates, formulas, data sources, how to produce the report, its value, and how to do it in the AI age. ${Object.keys(done).length} of ${keys.length} practised.`,
      U.h("button", { class: "btn sec noprint", onclick: () => window.print() }, "⎙ Print library index")));
    main.append(U.h("div", { class: "progressbar", style: { marginBottom: "1rem" } }, U.h("i", { style: { width: (100 * Object.keys(done).filter(k => keys.includes(k)).length / Math.max(1, keys.length)) + "%" } })));
    const groups = U.group(keys.map(k => ({ k, g: PRACTICE[k] })), x => x.g.grp || "Workspace");
    for (const [grp, items] of Object.entries(groups)) {
      main.append(U.h("h2", { style: { fontSize: "1rem", margin: "1.1rem 0 .6rem", color: "var(--head-ink)" } }, grp));
      main.append(U.h("div", { class: "grid3" }, items.map(({ k, g }) => U.h("div", { class: "card", style: { cursor: "pointer", borderTop: done[k] ? "4px solid var(--ok)" : undefined }, onclick: () => this.open(k) },
        U.h("div", { class: "flex" }, U.h("b", { style: { color: "var(--head-ink)" } }, g.t), U.h("span", { class: "spacer" }), done[k] ? C.pill("practised", "green") : null),
        U.h("p", { class: "small muted", style: { marginTop: ".3rem" } }, (g.why || "").slice(0, 150) + ((g.why || "").length > 150 ? "…" : "")),
        U.h("div", { class: "flex-wrap", style: { marginTop: ".4rem" } }, C.pill((g.f || []).length + ((g.f || []).length === 1 ? " formula" : " formulas"), "outline"), g.tpl && (g.tpl.table || g.tpl.doc) ? C.pill("template", "outline") : null, g.tpl && g.tpl.in ? C.pill("calculator", "outline") : null),
        U.h("a", { class: "small", href: "#/practice/guide/" + encodeURIComponent(k), onclick: e => e.stopPropagation() }, "Open full page →")))));
    }
  },
  fullPage(main, args) {
    const k = decodeURIComponent(args.join("/"));
    const g = PRACTICE[k];
    if (!g) { main.append(C.banner("bad", "Guide not found.")); return; }
    main.append(C.crumbs({ label: "Practice library", href: "#/practice" }, { label: g.t }),
      C.pageHead(g.t, "Practice guide — print it, or work through the tabs.", U.h("button", { class: "btn sec noprint", onclick: () => window.print() }, "⎙ Print")));
    // full page prints all sections expanded
    main.append(U.h("div", { class: "practice-intro card" }, U.h("p", null, g.why), g.out ? U.h("p", { class: "small" }, U.h("b", null, "What you'll produce: "), g.out) : null));
    const sec = (t, el) => U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, t), el);
    main.append(sec("1 · Step-by-step", this.steps(g)), sec("2 · Template & calculator", this.template(k, g)), sec("3 · Formulas", this.formulas(g)),
      sec("4 · Collecting the data", this.data(g)), sec("5 · Producing the report", this.produce(g)), sec("6 · Value to the organisation", this.value(g)), sec("7 · In the AI age", this.ai(g)));
  }
};
