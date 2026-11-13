/* Shared UI components + shared screens (launcher, inbox, calendar, org, matrix, missions, search). */
"use strict";

const C = {
  icon(name) {
    const paths = {
      home: "M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
      grid: "M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z",
      mail: "M3 5h18v14H3zM3 5l9 7 9-7",
      cal: "M4 5h16v16H4zM4 9h16M8 3v4M16 3v4",
      people: "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20a6 6 0 0 1 12 0M16 11a3 3 0 1 0 0-6M15 14a6 6 0 0 1 7 6",
      doc: "M6 2h9l4 4v16H6zM14 2v5h5",
      chart: "M4 20V8M10 20V4M16 20v-8M4 20h17",
      shield: "M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z",
      alert: "M12 3 2 21h20zM12 10v5M12 18v.5",
      check: "M4 12l5 5L20 6",
      gear: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1",
      flask: "M9 2h6M10 2v6L4 20a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2L14 8V2",
      bank: "M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18",
      money: "M3 6h18v12H3zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
      search: "M10 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM15 15l6 6",
      bell: "M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7M10 20a2 2 0 0 0 4 0",
      target: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 11.5a.5.5 0 1 0 0 1",
      rocket: "M5 15c-1 3-1 5-1 5s2 0 5-1M14 4c3-2 7-1 7-1s1 4-1 7c-2 3-6 7-9 8l-4-4c1-3 5-8 7-10zM14.5 8a1.5 1.5 0 1 0 .1 0",
      flow: "M4 4h6v5H4zM14 15h6v5h-6zM7 9v4h10v2",
      book: "M4 3h13a3 3 0 0 1 3 3v15H7a3 3 0 0 1-3-3zM4 18a3 3 0 0 1 3-3h13",
      link: "M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1.5 1.5M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6L12.5 18",
      truck: "M2 6h12v10H2zM14 10h5l3 3v3h-8zM6 19a2 2 0 1 0 0-.1M18 19a2 2 0 1 0 0-.1",
      fire: "M12 2s5 5 5 10a5 5 0 0 1-10 0c0-2 1-4 2-5 0 2 1 3 2 3 0-3 1-6 1-8z",
      scale: "M12 3v18M8 21h8M12 6 5 8l3 6a3.5 3.5 0 0 1-6 0zM12 6l7 2-3 6a3.5 3.5 0 0 0 6 0"
    };
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("width", "17"); s.setAttribute("height", "17");
    s.setAttribute("fill", "none"); s.setAttribute("stroke", "currentColor"); s.setAttribute("stroke-width", "1.7");
    s.setAttribute("stroke-linecap", "round"); s.setAttribute("stroke-linejoin", "round"); s.setAttribute("aria-hidden", "true");
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", paths[name] || paths.doc); s.append(p); return s;
  },
  avatar(name, size) {
    return U.h("span", { class: "avatar", title: name, style: { background: `hsl(${U.hue(name)},45%,42%)`, width: (size || 30) + "px", height: (size || 30) + "px" } }, U.initials(name));
  },
  pill(text, tone) { return U.h("span", { class: "pill " + (tone || SITE.tone?.(text) || "gray") }, text); },
  person(id) { const p = Store.get("people", id); return p ? U.h("span", { class: "flex", style: { gap: ".35rem", display: "inline-flex" } }, C.avatar(p.name, 20), p.name) : (id || "—"); },
  personName(id) { const p = Store.get("people", id); return p ? p.name : (id || "—"); },

  pageHead(title, sub, ...actions) {
    return U.h("div", { class: "pagehead" },
      U.h("div", null, U.h("h1", null, title), sub ? U.h("div", { class: "sub" }, sub) : null),
      U.h("span", { class: "spacer" }), actions);
  },
  crumbs(...parts) {
    const bits = [U.h("a", { href: "#/home" }, SITE.brand.suite)];
    parts.forEach((p, i) => { bits.push(" › "); bits.push(p.href ? U.h("a", { href: p.href }, p.label) : p.label || p); });
    return U.h("div", { class: "crumbs" }, bits);
  },
  stat(label, value, delta, tone) {
    return U.h("div", { class: "statcard " + (tone || "") }, U.h("div", { class: "v" }, value), U.h("div", { class: "l" }, label), delta ? U.h("div", { class: "d" }, delta) : null);
  },
  banner(kind, ...kids) { return U.h("div", { class: "banner " + kind }, kids); },

  /* ---------- DataTable ---------- */
  table(cfg) {
    // cfg: {id, rows, columns:[{key,label,render,filter:'select'|'text',width,sortVal,csv}], onRow, empty, pageSize, views:[{label,filter}], defaultSort}
    const stateKey = "tbl." + cfg.id;
    const st = Store.state(stateKey) || { filters: {}, q: "", sort: cfg.defaultSort || null, desc: true, view: 0, cols: null, page: 0 };
    const save = () => Store.state(stateKey, st);
    const wrap = U.h("div", { class: "tablewrap" });
    const visCols = () => cfg.columns.filter(c => !st.cols || st.cols.includes(c.key + ""));
    const applyFilters = () => {
      let rows = cfg.rows;
      if (cfg.views && cfg.views[st.view] && cfg.views[st.view].filter) rows = rows.filter(cfg.views[st.view].filter);
      for (const [k, v] of Object.entries(st.filters)) if (v) rows = rows.filter(r => { const col = cfg.columns.find(c => c.key === k); const raw = col && col.filterVal ? col.filterVal(r) : r[k]; return String(raw) === v; });
      if (st.q) { const q = st.q.toLowerCase(); rows = rows.filter(r => JSON.stringify(r).toLowerCase().includes(q)); }
      if (st.sort) { const col = cfg.columns.find(c => c.key === st.sort); rows = U.sort(rows, r => (col && col.sortVal ? col.sortVal(r) : r[st.sort]) ?? "", st.desc); }
      return rows;
    };
    const render = () => {
      wrap.innerHTML = "";
      const rows = applyFilters();
      const tools = U.h("div", { class: "tabletools" });
      if (cfg.views) tools.append(U.h("select", {
        "aria-label": "Saved view",
        onchange: e => { st.view = +e.target.value; st.page = 0; save(); render(); }
      }, cfg.views.map((v, i) => U.h("option", { value: i, selected: i === st.view ? "" : null }, "View: " + v.label))));
      tools.append(U.h("input", { type: "text", placeholder: "Filter rows…", value: st.q, oninput: e => { st.q = e.target.value; st.page = 0; save(); renderBody(); } }));
      for (const col of cfg.columns.filter(c => c.filter === "select")) {
        const vals = [...new Set(cfg.rows.map(r => col.filterVal ? col.filterVal(r) : r[col.key]).filter(v => v != null))].sort();
        tools.append(U.h("select", { "aria-label": col.label, onchange: e => { st.filters[col.key] = e.target.value; st.page = 0; save(); renderBody(); } },
          U.h("option", { value: "" }, col.label + ": all"),
          vals.map(v => U.h("option", { value: v, selected: st.filters[col.key] === String(v) ? "" : null }, String(v)))));
      }
      tools.append(U.h("span", { class: "spacer" }));
      tools.append(U.h("button", {
        class: "btn ghost sm", onclick: () => {
          Modal.open("Columns", m => cfg.columns.map(c => U.h("label", { class: "flex", style: { padding: ".2rem 0" } },
            U.h("input", { type: "checkbox", checked: (!st.cols || st.cols.includes(c.key + "")) ? "" : null, onchange: e => { let cur = st.cols || cfg.columns.map(x => x.key + ""); cur = e.target.checked ? [...cur, c.key + ""] : cur.filter(k => k !== c.key + ""); st.cols = cur; save(); render(); } }), c.label)));
        }
      }, "Columns"));
      tools.append(U.h("button", { class: "btn ghost sm", onclick: () => U.download(cfg.id + ".csv", U.csv(applyFilters(), cfg.columns), "text/csv") }, "⇩ CSV"));
      if (cfg.actions) tools.append(cfg.actions);
      wrap.append(tools);
      const scroll = U.h("div", { class: "tscroll" }); wrap.append(scroll);
      const foot = U.h("div", { class: "tfoot" }); wrap.append(foot);
      const renderBody = () => {
        const rows2 = applyFilters();
        const ps = cfg.pageSize || 25;
        const pages = Math.max(1, Math.ceil(rows2.length / ps));
        st.page = U.clamp(st.page, 0, pages - 1);
        const slice = rows2.slice(st.page * ps, st.page * ps + ps);
        scroll.innerHTML = "";
        const thead = U.h("tr", null, visCols().map(c => U.h("th", {
          style: c.width ? { width: c.width } : null,
          onclick: () => { if (st.sort === c.key) st.desc = !st.desc; else { st.sort = c.key; st.desc = true; } save(); renderBody(); }
        }, c.label, st.sort === c.key ? (st.desc ? " ▾" : " ▴") : "")));
        const tbody = U.h("tbody", null, slice.length ? slice.map(r => U.h("tr", {
          class: cfg.onRow ? "click" : "", onclick: cfg.onRow ? () => cfg.onRow(r) : null,
          tabindex: cfg.onRow ? "0" : null,
          onkeydown: cfg.onRow ? (e => { if (e.key === "Enter" && e.target.tagName === "TR") cfg.onRow(r); }) : null
        }, visCols().map(c => U.h("td", null, c.render ? c.render(r) : (r[c.key] ?? "—"))))) :
          U.h("tr", null, U.h("td", { colspan: visCols().length, class: "center muted", style: { padding: "2rem" } }, cfg.empty || "Nothing matches the current filters.")));
        scroll.append(U.h("table", { class: "data" }, U.h("thead", null, thead), tbody));
        foot.innerHTML = "";
        foot.append(`${rows2.length} record${rows2.length === 1 ? "" : "s"}`);
        if (pages > 1) {
          foot.append(U.h("span", { class: "spacer" }),
            U.h("button", { class: "btn ghost sm", disabled: st.page === 0 ? "" : null, onclick: () => { st.page--; save(); renderBody(); } }, "‹ Prev"),
            ` ${st.page + 1} / ${pages} `,
            U.h("button", { class: "btn ghost sm", disabled: st.page >= pages - 1 ? "" : null, onclick: () => { st.page++; save(); renderBody(); } }, "Next ›"));
        }
      };
      renderBody();
    };
    render();
    return wrap;
  },

  /* ---------- Kanban ---------- */
  kanban(cfg) { // {columns:[{id,label,color}], cards, colOf(card), renderCard, onMove(card,toCol)->true|string}
    const board = U.h("div", { class: "kanban" });
    for (const col of cfg.columns) {
      const cards = cfg.cards.filter(c => cfg.colOf(c) === col.id);
      const colEl = U.h("div", { class: "kcol", ondragover: e => e.preventDefault(), ondrop: e => { e.preventDefault(); const id = e.dataTransfer.getData("text"); const card = cfg.cards.find(x => x.id === id); if (!card || !cfg.onMove) return; const res = cfg.onMove(card, col.id); if (res !== true && typeof res === "string") Toast.show(res, "warn"); Router.refresh(); } },
        U.h("h4", null, col.color ? U.h("i", { style: { width: "9px", height: "9px", borderRadius: "2px", background: col.color, display: "inline-block" } }) : null, col.label, U.h("span", { class: "spacer" }), U.h("span", { class: "pill gray" }, cards.length)));
      for (const card of cards) {
        const el = cfg.renderCard(card);
        el.setAttribute("draggable", "true");
        el.setAttribute("tabindex", "0"); el.setAttribute("role", "button");
        el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.click(); } });
        el.addEventListener("dragstart", e => e.dataTransfer.setData("text", card.id));
        colEl.append(el);
      }
      board.append(colEl);
    }
    return board;
  },

  /* ---------- Tabs ---------- */
  tabs(id, tabs) {
    const key = "tab." + id;
    let cur = Store.state(key) || tabs[0].id;
    if (!tabs.find(t => t.id === cur)) cur = tabs[0].id;
    const body = U.h("div");
    const bar = U.h("div", { class: "tabs", role: "tablist" });
    const render = () => {
      bar.innerHTML = ""; body.innerHTML = "";
      for (const t of tabs) bar.append(U.h("button", { class: cur === t.id ? "active" : "", role: "tab", onclick: () => { cur = t.id; Store.state(key, cur); render(); } }, t.label));
      const tab = tabs.find(t => t.id === cur);
      try { body.append(tab.render()); } catch (e) { console.error(e); body.append(C.banner("bad", "Tab error: " + e.message)); }
    };
    render();
    return U.h("div", null, bar, body);
  },

  kv(pairs) { return U.h("dl", { class: "kv" }, pairs.filter(p => p).map(([k, v]) => [U.h("dt", null, k), U.h("dd", null, v ?? "—")])); },

  auditTrail(ent, id) {
    const r = Store.get(ent, id) || {};
    const list = U.h("ul", { class: "audit" }, (r.audit || []).slice().reverse().map(a =>
      U.h("li", null, U.h("span", { class: "when" }, a.ts), U.h("span", null, U.h("b", null, a.actor), " — ", a.action, a.comment ? U.h("span", { class: "muted" }, ` · “${a.comment}”`) : null))));
    return (r.audit || []).length ? list : U.h("p", { class: "muted" }, "No audit entries yet.");
  },
  comments(ent, id) {
    const wrap = U.h("div");
    const render = () => {
      wrap.innerHTML = "";
      const r = Store.get(ent, id) || {};
      wrap.append(...(r.comments || []).map(c => U.h("div", { class: "comment" }, C.avatar(c.who, 26),
        U.h("div", { class: "b" }, U.h("div", null, U.h("span", { class: "who" }, c.who), " ", U.h("span", { class: "when" }, U.date(c.ts))), U.h("div", null, c.text)))));
      const ta = U.h("textarea", { placeholder: "Add a comment as " + Personas.current().name + "…", style: { width: "100%", minHeight: "60px", marginTop: ".6rem", border: "1px solid var(--line)", borderRadius: "6px", padding: ".5rem" } });
      wrap.append(ta, U.h("div", { style: { marginTop: ".4rem" } }, U.h("button", { class: "btn sm", onclick: () => { if (!ta.value.trim()) return; Store.comment(ent, id, ta.value.trim()); render(); } }, "Comment")));
    };
    render(); return wrap;
  },

  /* ---------- Approvals ---------- */
  approvalActions(ent, id, cfg) {
    // cfg {label, onApprove(comment), onReject(comment), can:boolean, requester}
    const me = Personas.current();
    const box = U.h("div", { class: "flex-wrap" });
    const decide = (verb, cb) => {
      Modal.open(`${verb} — comment required`, m => {
        const ta = U.h("textarea", { style: { width: "100%", minHeight: "80px" }, placeholder: "Rationale (mandatory, goes on the record)…" });
        const asSel = U.h("select", null, U.h("option", { value: "" }, `Decide as ${me.name}`),
          SITE.personas.filter(p => p.id !== me.id).map(p => U.h("option", { value: p.id }, `On behalf of ${p.name} (delegated)`)));
        return [U.h("div", { class: "field" }, ta), U.h("div", { class: "field", style: { marginTop: ".5rem" } }, asSel),
        U.h("div", { style: { marginTop: ".8rem", display: "flex", gap: ".5rem", justifyContent: "flex-end" } },
          U.h("button", { class: "btn ghost", onclick: () => Modal.close() }, "Cancel"),
          U.h("button", {
            class: "btn " + (verb === "Reject" ? "danger" : "ok"), onclick: () => {
              if (ta.value.trim().length < 8) { Toast.show("A substantive comment is mandatory for every decision.", "warn"); return; }
              let note = ta.value.trim();
              if (asSel.value) note += ` [delegated: decided on behalf of ${C.personaName(asSel.value)}; reason logged]`;
              Modal.close(); cb(note); Router.refresh();
            }
          }, verb))];
      });
    };
    if (cfg.requester && cfg.requester === me.id) {
      box.append(C.banner("warn", "Maker-checker: you raised this item, so you cannot approve it yourself. Switch persona to an authorised approver to see their decision view."));
    } else if (cfg.can === false) {
      box.append(U.h("span", { class: "muted small" }, `The ${me.role} persona does not hold this approval right. Switch “View as” to see who does.`));
    } else {
      box.append(
        U.h("button", { class: "btn ok", onclick: () => decide("Approve", cfg.onApprove) }, cfg.label ? "Approve " + cfg.label : "Approve"),
        U.h("button", { class: "btn danger", onclick: () => decide("Reject", cfg.onReject) }, "Reject"));
    }
    return box;
  },
  personaName(id) { const p = SITE.personas.find(x => x.id === id); return p ? p.name : id; },

  /* ---------- Form wizard ---------- */
  form(cfg) {
    // {pages:[{title, fields:[{key,label,type(text|textarea|select|number|date|checkboxes|file),options,required,help,validate}]}], draftKey, onSubmit(values), submitLabel}
    const draft = Store.state("draft." + cfg.draftKey) || {};
    let page = 0;
    const wrap = U.h("div");
    const values = draft;
    const render = () => {
      wrap.innerHTML = "";
      const pg = cfg.pages[page];
      if (cfg.pages.length > 1) wrap.append(U.h("div", { class: "steps" }, cfg.pages.map((p, i) => U.h("span", { class: "st " + (i === page ? "cur" : i < page ? "done" : "") }, `${i + 1}. ${p.title}`))));
      const form = U.h("div", { class: "form" });
      for (const f of pg.fields) {
        const field = U.h("div", { class: "field", id: "f_" + f.key });
        field.append(U.h("label", null, f.label, f.required ? U.h("span", { class: "req" }, " *") : null));
        let input;
        const common = { onchange: e => { values[f.key] = f.type === "checkboxes" ? values[f.key] : e.target.value; Store.state("draft." + cfg.draftKey, values); } };
        if (f.type === "textarea") input = U.h("textarea", { ...common, placeholder: f.placeholder || "" }, values[f.key] || "");
        else if (f.type === "select") input = U.h("select", common, U.h("option", { value: "" }, "— select —"), f.options.map(o => U.h("option", { value: o.v ?? o, selected: values[f.key] === (o.v ?? o) ? "" : null }, o.l ?? o)));
        else if (f.type === "checkboxes") {
          input = U.h("div", { class: "flex-wrap" }, f.options.map(o => {
            const v = o.v ?? o, cur = values[f.key] || [];
            return U.h("label", { class: "flex", style: { gap: ".3rem", fontWeight: 400, fontSize: ".84rem" } },
              U.h("input", { type: "checkbox", checked: cur.includes(v) ? "" : null, onchange: e => { let c = values[f.key] || []; c = e.target.checked ? [...c, v] : c.filter(x => x !== v); values[f.key] = c; Store.state("draft." + cfg.draftKey, values); } }), o.l ?? o);
          }));
        }
        else if (f.type === "file") input = U.h("div", null, U.h("button", { class: "btn ghost sm", onclick: () => { values[f.key] = (values[f.key] || 0) + 1; Store.state("draft." + cfg.draftKey, values); render(); } }, "⎙ Attach file (simulated)"), values[f.key] ? U.h("span", { class: "attach" }, `📎 ${values[f.key]} attachment${values[f.key] > 1 ? "s" : ""} (placeholder)`) : null);
        else input = U.h("input", { type: f.type || "text", value: values[f.key] || "", ...common });
        field.append(input);
        if (f.help) field.append(U.h("div", { class: "help" }, f.help));
        field.append(U.h("div", { class: "err", id: "err_" + f.key }));
        form.append(field);
      }
      wrap.append(form);
      const validate = () => {
        let ok = true;
        for (const f of pg.fields) {
          const fe = wrap.querySelector("#f_" + f.key), ee = wrap.querySelector("#err_" + f.key);
          fe.classList.remove("invalid"); ee.textContent = "";
          const v = values[f.key];
          if (f.required && (v == null || v === "" || (Array.isArray(v) && !v.length))) { ok = false; fe.classList.add("invalid"); ee.textContent = "This field is required — approvers reject incomplete submissions."; }
          else if (f.validate) { const msg = f.validate(v, values); if (msg) { ok = false; fe.classList.add("invalid"); ee.textContent = msg; } }
        }
        return ok;
      };
      wrap.append(U.h("div", { class: "formnav" },
        page > 0 ? U.h("button", { class: "btn ghost", onclick: () => { page--; render(); } }, "‹ Back") : null,
        U.h("span", { class: "spacer" }),
        U.h("span", { class: "muted small" }, "Draft auto-saved"),
        page < cfg.pages.length - 1 ?
          U.h("button", { class: "btn", onclick: () => { if (validate()) { page++; render(); window.scrollTo(0, 0); } } }, "Continue ›") :
          U.h("button", { class: "btn", onclick: () => { if (validate()) { Store.state("draft." + cfg.draftKey, null); cfg.onSubmit(values); } } }, cfg.submitLabel || "Submit")));
    };
    render(); return wrap;
  },

  gateChecklist(items) { // [{label, ok}]
    return U.h("ul", { class: "gatelist", style: { listStyle: "none" } }, items.map(i =>
      U.h("li", null, U.h("span", { class: i.ok ? "gate-ok" : "gate-missing" }, i.ok ? "✓ " : "✗ "), i.label, i.ok ? null : U.h("span", { class: "muted small" }, " — required before this gate"))));
  }
};

/* ---------- Modal ---------- */
const Modal = {
  open(title, renderFn) {
    this.close();
    const back = U.h("div", { class: "modalback", id: "modalback", onclick: e => { if (e.target.id === "modalback") this.close(); } });
    const m = U.h("div", { class: "modal", role: "dialog", "aria-label": title },
      U.h("header", null, U.h("h2", null, title), U.h("span", { class: "spacer" }), U.h("button", { class: "btn ghost sm", onclick: () => this.close() }, "✕")),
      U.h("div", { class: "mbody" }, renderFn(this)));
    back.append(m); document.body.append(back);
    const esc = e => { if (e.key === "Escape") { this.close(); document.removeEventListener("keydown", esc); } };
    document.addEventListener("keydown", esc);
    setTimeout(() => { const f = m.querySelector("textarea, input, select, button"); if (f) f.focus(); }, 30);
  },
  close() { const b = document.getElementById("modalback"); if (b) b.remove(); }
};

/* =================== Shared screens =================== */
const SharedScreens = {
  launcher(main) {
    main.append(C.crumbs(), C.pageHead(SITE.brand.suite, SITE.brand.tagline));
    const ann = SITE.announcements || [];
    if (ann.length) main.append(C.banner("info", U.h("b", null, "Announcements: "), ann.join(" · ")));
    if (SITE.hero) main.append(U.h("div", { class: "card", style: { marginBottom: "1rem", padding: "1.1rem 1.2rem", background: "var(--card)" } },
      U.h("div", { class: "flex-wrap", style: { alignItems: "flex-start", gap: "1.2rem" } },
        U.h("div", { style: { flex: "1 1 300px", minWidth: "260px" } },
          U.h("div", { class: "muted small", style: { textTransform: "uppercase", letterSpacing: ".08em" } }, "You are"),
          U.h("h2", { style: { fontFamily: "var(--font-head)", color: "var(--head-ink)", fontSize: "1.3rem", margin: ".1rem 0 .4rem" } }, SITE.hero.who),
          U.h("p", { class: "small", style: { lineHeight: 1.6 } }, SITE.hero.brief),
          U.h("div", { style: { marginTop: ".7rem" } }, U.h("b", { class: "small" }, "Start here"),
            U.h("ol", { class: "small", style: { paddingLeft: "1.2rem", lineHeight: 1.8 } }, SITE.hero.start.map(([t, h]) => U.h("li", null, U.h("a", { href: h }, t)))))),
        U.h("div", { style: { flex: "2 1 520px", minWidth: "300px" }, html: SITE.hero.svg }))));
    main.append(U.h("h2", { style: { fontSize: "1rem", margin: ".4rem 0 .7rem", color: "var(--head-ink)" } }, "Applications"));
    main.append(U.h("div", { class: "launcher" }, SITE.modules.filter(m => m.app !== false).map(m =>
      U.h("a", { class: "lapp", href: "#/" + m.home },
        U.h("div", { class: "ic", style: { background: m.color || "var(--accent)" } }, C.icon(m.icon)),
        U.h("div", { class: "nm" }, m.label), U.h("div", { class: "ds" }, m.desc || "")))));
  },

  search(main, args) {
    const q = decodeURIComponent(args[0] || "");
    main.append(C.crumbs({ label: "Search" }), C.pageHead("Search", `Results for “${q}” across records, people and documents`));
    const res = Search.run(q);
    if (!res.length) { main.append(U.h("p", { class: "muted" }, "No results. Try an ID (e.g. " + (SITE.exampleId || "UC-2026-0147") + "), a person, or a keyword.")); return; }
    const byEnt = U.group(res, "ent");
    for (const [ent, items] of Object.entries(byEnt)) {
      main.append(U.h("div", { class: "card", style: { marginBottom: "1rem" } }, U.h("h3", null, U.title(ent) + ` (${items.length})`),
        items.slice(0, 15).map(it => U.h("div", { style: { padding: ".3rem 0", borderBottom: "1px dashed var(--line-soft)" } },
          U.h("a", { href: it.link }, it.label), " ", U.h("span", { class: "muted small" }, it.sub)))));
    }
  },

  calendar(main) {
    main.append(C.crumbs({ label: "Calendar" }), C.pageHead("Calendar & simulated clock",
      `Fictional “today” is ${Clock.weekday()} ${U.date(Clock.today())}. Advance time from the top bar to trigger scheduled events: SLA breaches, drift alerts, renewals, deadlines.`));
    const today = Clock.today();
    const first = today.slice(0, 8) + "01";
    const startDow = (new Date(first + "T00:00:00").getDay() + 6) % 7;
    const dim = U.daysBetween(first, U.addDays(first.slice(0, 8) + "28", 7).slice(0, 8) + "01") || 30;
    const daysInMonth = new Date(+first.slice(0, 4), +first.slice(5, 7), 0).getDate();
    const events = U.group((SEED.calendar || []), e => e.date);
    const grid = U.h("div", { class: "calgrid" });
    for (const d of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]) grid.append(U.h("div", { class: "calcell dim center", style: { minHeight: "auto" } }, U.h("b", null, d)));
    for (let i = 0; i < startDow; i++) grid.append(U.h("div", { class: "calcell dim" }));
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = first.slice(0, 8) + String(d).padStart(2, "0");
      const cell = U.h("div", { class: "calcell" + (iso === today ? " today" : "") }, U.h("div", { class: "d" }, d));
      for (const e of (events[iso] || [])) cell.append(U.h("a", { class: "calev " + (e.kind || ""), href: e.link || "#/calendar", title: e.title }, e.title));
      grid.append(cell);
    }
    main.append(grid);
    const upcoming = U.sort((SEED.calendar || []).filter(e => e.date >= today), "date").slice(0, 14);
    main.append(U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "Next up"),
      U.h("table", { class: "data" }, U.h("tbody", null, upcoming.map(e => U.h("tr", null,
        U.h("td", { class: "nowrap" }, U.date(e.date), " ", U.h("span", { class: "muted small" }, "(" + U.rel(e.date) + ")")),
        U.h("td", null, e.link ? U.h("a", { href: e.link }, e.title) : e.title),
        U.h("td", null, C.pill(e.cat || "event", e.kind === "bad" ? "red" : e.kind === "warn" ? "amber" : "blue"))))))));
  },

  inbox(main, args) {
    const selId = args[0];
    main.append(C.crumbs({ label: SITE.mailName }), C.pageHead(SITE.mailName, "Email, chat, meeting invites, forum papers and tickets — each message creates real work in a module. Reply to reveal the model answer."));
    const msgs = U.sort(Store.all("messages"), m => (m.urgency === "high" ? "0" : m.urgency === "medium" ? "1" : "2") + (m.due || "9999"), false);
    const readSet = new Set(Store.state("readMsgs") || []);
    const wrap = U.h("div", { class: "inboxwrap" });
    const list = U.h("div", { class: "msglist" });
    for (const m of msgs) {
      list.append(U.h("div", {
        class: "msgrow" + (readSet.has(m.id) ? "" : " unread") + (m.id === selId ? " sel" : ""),
        onclick: () => Router.go(SITE.mailRoute + "/" + m.id)
      },
        C.avatar(C.personName2(m.from), 30),
        U.h("div", { style: { minWidth: 0, flex: 1 } },
          U.h("div", { class: "flex" }, U.h("span", { class: "t" }, C.personName2(m.from)), U.h("span", { class: "spacer" }), U.h("span", { class: "chanchip" }, m.channel)),
          U.h("div", { class: "t", style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, m.subject),
          U.h("div", { class: "muted small flex" }, m.urgency === "high" ? C.pill("urgent", "red") : null, m.due ? U.h("span", { class: "sla " + U.dueClass(m.due) }, "due " + U.rel(m.due)) : null))));
    }
    wrap.append(list);
    const view = U.h("div", { class: "msgview" });
    const m = msgs.find(x => x.id === selId);
    if (!m) view.append(U.h("p", { class: "muted center", style: { paddingTop: "4rem" } }, "Select a message. Unread items are bold; urgent ones are pinned near the top."));
    else {
      if (!readSet.has(m.id)) { readSet.add(m.id); Store.state("readMsgs", [...readSet]); }
      const replied = (Store.state("replies") || {})[m.id];
      view.append(
        U.h("div", { class: "flex" }, C.avatar(C.personName2(m.from), 38),
          U.h("div", null, U.h("b", null, C.personName2(m.from)), U.h("div", { class: "muted small" }, C.personRole(m.from) + " · " + m.channel + (m.due ? " · response due " + U.date(m.due) : ""))),
          U.h("span", { class: "spacer" }), m.urgency === "high" ? C.pill("urgent", "red") : C.pill(m.urgency || "normal", "gray")),
        U.h("h2", { style: { margin: ".8rem 0 .5rem", fontSize: "1.1rem", color: "var(--head-ink)" } }, m.subject),
        U.h("div", { style: { whiteSpace: "pre-wrap", fontSize: ".9rem", lineHeight: 1.55 } }, m.body),
        m.attachments && m.attachments.length ? U.h("div", { style: { marginTop: ".7rem" } }, m.attachments.map(a => U.h("span", { class: "attach" }, "📎 " + a))) : null,
        m.task ? U.h("div", { style: { marginTop: ".9rem" } }, C.banner("info", U.h("b", null, "Creates task: "), U.h("a", { href: m.task.link }, m.task.label))) : null);
      const ta = U.h("textarea", { style: { width: "100%", minHeight: "110px", marginTop: "1rem", border: "1px solid var(--line)", borderRadius: "8px", padding: ".6rem" }, placeholder: "Draft your reply in the sender's channel and register. Submitting reveals the model reply and what the sender actually needed." }, replied ? replied.text : "");
      view.append(ta);
      view.append(U.h("div", { style: { marginTop: ".5rem" }, class: "flex" },
        U.h("button", {
          class: "btn", onclick: () => {
            if (ta.value.trim().length < 20) return Toast.show("Write a real reply first (a couple of sentences at least).", "warn");
            const rs = Store.state("replies") || {}; rs[m.id] = { text: ta.value.trim(), ts: Clock.today() }; Store.state("replies", rs); Router.refresh();
          }
        }, replied ? "Update reply" : "Send reply"),
        replied ? U.h("span", { class: "muted small" }, "Replied " + U.date(replied.ts)) : null));
      if (replied) view.append(U.h("div", { class: "modelreply" },
        U.h("b", null, "Model reply"), U.h("div", { style: { whiteSpace: "pre-wrap", marginTop: ".4rem" } }, m.modelReply || "—"),
        m.toneNotes ? U.h("div", { style: { marginTop: ".6rem" } }, U.h("b", null, "What the sender actually needed: "), m.toneNotes) : null));
    }
    wrap.append(view);
    main.append(wrap);
  },

  personDirectoryHelpers() { },

  org(main) {
    main.append(C.crumbs({ label: "Org chart" }), C.pageHead("Organisation & reporting lines",
      "Click any person to view their profile; use “View as” in the top bar to see the system through their eyes."));
    const people = Store.all("people");
    const byId = U.by(people);
    const roots = people.filter(p => !p.managerId || !byId[p.managerId]);
    const kids = U.group(people.filter(p => p.managerId && byId[p.managerId]), "managerId");
    const node = (p, depth) => {
      const box = U.h("div", { style: { marginLeft: depth ? "1.6rem" : 0, borderLeft: depth ? "2px solid var(--line)" : "none", paddingLeft: depth ? ".9rem" : 0, marginTop: ".45rem" } });
      box.append(U.h("div", { class: "flex card", style: { padding: ".45rem .7rem", gap: ".6rem", cursor: "pointer" }, onclick: () => SharedScreens.personModal(p) },
        C.avatar(p.name, 30),
        U.h("div", null, U.h("b", { style: { fontSize: ".86rem", color: p.id === SITE.youId ? "var(--accent)" : "var(--head-ink)" } }, p.name, p.id === SITE.youId ? "  (You)" : ""),
          U.h("div", { class: "muted small" }, p.role + (p.site ? " · " + p.site : ""))),
        U.h("span", { class: "spacer" }),
        p.line ? C.pill(p.line, p.line.includes("2nd") ? "amber" : p.line.includes("3rd") ? "purple" : p.line.includes("ext") ? "gray" : "blue") : null,
        p.dotted ? C.pill("dotted: " + p.dotted, "outline") : null,
        (kids[p.id] || []).length ? U.h("span", { class: "pill gray" }, (kids[p.id] || []).length + " reports") : null));
      for (const c of U.sort(kids[p.id] || [], "name")) box.append(node(c, depth + 1));
      return box;
    };
    const wrap = U.h("div", { class: "orgwrap" });
    for (const r of roots) wrap.append(node(r, 0));
    main.append(wrap);
  },
  personModal(p) {
    Modal.open(p.name, () => [
      U.h("div", { class: "flex", style: { marginBottom: ".8rem" } }, C.avatar(p.name, 46), U.h("div", null, U.h("b", null, p.role), U.h("div", { class: "muted small" }, (p.dept || "") + (p.site ? " · " + p.site : "")))),
      C.kv([["ID", p.id], ["Reports to", p.managerId ? C.personName(p.managerId) : "—"], ["Line", p.line || "—"], p.email && ["Email", p.email], p.tenure && ["Tenure", p.tenure + " yrs"], p.skills && ["Skills", (p.skills || []).join(", ")], p.notes && ["Notes", p.notes]]),
      SITE.personas.find(x => x.personId === p.id) ? U.h("div", { style: { marginTop: ".8rem" } }, U.h("button", { class: "btn sm", onclick: () => { Modal.close(); Personas.set(SITE.personas.find(x => x.personId === p.id).id); } }, "View the workspace as " + p.name)) : null
    ]);
  },
  personName2: null, // set in app.js
  radial(rows) {
    const W = 980, H = 560, cx = W / 2, cy = H / 2 + 6, rx = 390, ry = 220;
    const cols = SITE.chartColors;
    const esc = U.esc;
    let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Stakeholder map" style="width:100%;height:auto;font-family:var(--font-ui)">`;
    const n = rows.length;
    const pts = rows.map((r, i) => { const a = -Math.PI / 2 + 2 * Math.PI * i / n; return { r, x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a), i }; });
    for (const p of pts) {
      const boss = /boss|CIO \(|Chief Data & AI Officer|^Directors|Your team|Principal engineer/.test(p.r.role);
      const col = cols[p.i % cols.length];
      svg += `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="${col}" stroke-width="${boss ? 3 : 1.6}" ${boss ? "" : 'stroke-dasharray="5 4"'} opacity=".75"/>`;
      const mx = (cx + p.x) / 2, my = (cy + p.y) / 2;
      svg += `<text x="${mx}" y="${my - 3}" font-size="9" fill="var(--muted)" text-anchor="middle">${esc((p.r.channel || "").split(/[+;]/)[0].trim().slice(0, 26))}</text>`;
      svg += `<text x="${mx}" y="${my + 8}" font-size="8.5" fill="var(--muted)" text-anchor="middle" font-style="italic">${esc((p.r.cadence || "").split(/[;+]/)[0].trim().slice(0, 24))}</text>`;
    }
    for (const p of pts) {
      const col = cols[p.i % cols.length];
      const w = 168, h = 44;
      svg += `<g><title>${esc(p.r.who)} — decides: ${esc(p.r.decides)}</title><rect x="${p.x - w / 2}" y="${p.y - h / 2}" width="${w}" height="${h}" rx="10" fill="var(--card)" stroke="${col}" stroke-width="2"/>`;
      svg += `<rect x="${p.x - w / 2}" y="${p.y - h / 2}" width="6" height="${h}" rx="3" fill="${col}"/>`;
      svg += `<text x="${p.x - w / 2 + 14}" y="${p.y - 3}" font-size="11" font-weight="700" fill="var(--head-ink)">${esc(p.r.who.length > 24 ? p.r.who.slice(0, 23) + "…" : p.r.who)}</text>`;
      svg += `<text x="${p.x - w / 2 + 14}" y="${p.y + 12}" font-size="9" fill="var(--muted)">${esc(p.r.role.length > 30 ? p.r.role.slice(0, 29) + "…" : p.r.role)}</text></g>`;
    }
    const me = Store.get("people", SITE.personas[0].personId) || { name: SITE.personas[0].name, role: SITE.personas[0].role };
    svg += `<circle cx="${cx}" cy="${cy}" r="62" fill="var(--accent)"/><circle cx="${cx}" cy="${cy}" r="68" fill="none" stroke="var(--accent)" stroke-opacity=".3" stroke-width="5"/>`;
    svg += `<text x="${cx}" y="${cy - 4}" font-size="15" font-weight="800" fill="#fff" text-anchor="middle">${esc(me.name)}</text><text x="${cx}" y="${cy + 12}" font-size="8.5" fill="#fff" text-anchor="middle" opacity=".9">${esc(SITE.personas[0].role)}</text><text x="${cx}" y="${cy + 25}" font-size="8.5" fill="#fff" text-anchor="middle" opacity=".9">(You)</text></svg>`;
    return svg;
  },

  matrix(main) {
    main.append(C.crumbs({ label: "Stakeholder matrix" }), C.pageHead("Stakeholder interaction matrix",
      "Who asks you for what, through which channel, how often, what they decide with it — and what great vs poor looks like. Every row seeds messages in " + SITE.mailName + "."));
    const rows = SEED.stakeholderMatrix || [];
    main.append(U.h("div", { class: "card", style: { marginBottom: "1rem" } }, U.h("h3", null, "Reporting lines & communication map"),
      U.h("p", { class: "muted small" }, "Solid line = reporting line · dashed = dotted line / peer · label = channel and cadence. Hover a node for what they decide."),
      U.h("div", { html: SharedScreens.radial(rows) })));
    main.append(U.h("div", { class: "tablewrap" }, U.h("div", { class: "tscroll" }, U.h("table", { class: "data matrix" },
      U.h("thead", null, U.h("tr", null, ["Stakeholder", "Asks me for", "Channel", "Cadence", "System / report they use", "Decisions they make", "Great vs poor response"].map(hd => U.h("th", null, hd)))),
      U.h("tbody", null, rows.map(r => U.h("tr", null,
        U.h("td", { class: "nowrap" }, U.h("b", null, r.who), U.h("span", { class: "sub" }, r.role)),
        U.h("td", null, r.asks), U.h("td", null, r.channel), U.h("td", null, r.cadence),
        U.h("td", null, r.view), U.h("td", null, r.decides),
        U.h("td", null, U.h("div", null, U.h("b", { class: "up" }, "Great: "), r.great), U.h("div", null, U.h("b", { class: "down" }, "Poor: "), r.poor)))))))));
  }
};
C.personName2 = id => { const p = Store.get("people", id); return p ? p.name : id; };
C.personRole = id => { const p = Store.get("people", id); return p ? p.role : ""; };
