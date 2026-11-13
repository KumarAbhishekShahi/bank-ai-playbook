/* Leadership Workspaces — shared framework (vanilla JS, file:// safe).
   Globals: U (utils), Store, Clock, Router, Personas, Toast, Notif, App (in app.js).
   Site config in window.SITE; seed in window.SEED. */
"use strict";

/* ---------------- utils ---------------- */
const U = {
  h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v == null) continue;
      if (k === "class") el.className = v;
      else if (k === "html") el.innerHTML = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (k === "dataset") Object.assign(el.dataset, v);
      else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
      else el.setAttribute(k, v);
    }
    for (const kid of kids.flat(9)) {
      if (kid == null || kid === false) continue;
      el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    }
    return el;
  },
  esc(s) { return String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); },
  money(n, cur) {
    cur = cur || SITE.currency;
    if (n == null || isNaN(n)) return "—";
    const abs = Math.abs(n);
    const sym = { EUR: "€", USD: "$", INR: "₹" }[cur] || cur + " ";
    let s;
    if (abs >= 1e9) s = (n / 1e9).toFixed(2) + "B";
    else if (abs >= 1e6) s = (n / 1e6).toFixed(abs >= 1e7 ? 1 : 2) + "M";
    else if (abs >= 1e4) s = (n / 1e3).toFixed(0) + "k";
    else s = n.toLocaleString("en-GB", { maximumFractionDigits: 2 });
    return sym + s;
  },
  num(n, d) { return n == null ? "—" : Number(n).toLocaleString("en-GB", { maximumFractionDigits: d ?? 1 }); },
  pct(n, d) { return n == null ? "—" : Number(n).toFixed(d ?? 1) + "%"; },
  date(iso) {
    if (!iso) return "—";
    const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  },
  dateShort(iso) { if (!iso) return "—"; const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : "")); return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }); },
  addDays(iso, n) { const d = new Date(iso + "T00:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); },
  daysBetween(a, b) { return Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 864e5); },
  rel(iso) { // relative to simulated today
    if (!iso) return "—";
    const n = U.daysBetween(Clock.today(), iso.slice(0, 10));
    if (n === 0) return "today";
    if (n === 1) return "tomorrow"; if (n === -1) return "yesterday";
    return n > 0 ? `in ${n}d` : `${-n}d ago`;
  },
  dueClass(iso, warnDays) {
    if (!iso) return "";
    const n = U.daysBetween(Clock.today(), iso.slice(0, 10));
    return n < 0 ? "breach" : (n <= (warnDays ?? 3) ? "atrisk" : "ok");
  },
  initials(name) { return String(name || "?").split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase(); },
  hue(s) { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360; return h; },
  csv(rows, cols) {
    const head = cols.map(c => `"${c.label}"`).join(",");
    const body = rows.map(r => cols.map(c => {
      let v = c.csv ? c.csv(r) : (typeof c.key === "function" ? c.key(r) : r[c.key]);
      if (v == null) v = ""; return `"${String(v).replace(/"/g, '""')}"`;
    }).join(",")).join("\n");
    return head + "\n" + body;
  },
  download(name, text, mime) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: mime || "text/plain" }));
    a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 500);
  },
  by(arr, key) { const m = {}; for (const x of arr || []) m[x[key ?? "id"]] = x; return m; },
  group(arr, fn) { const m = {}; for (const x of arr || []) { const k = typeof fn === "function" ? fn(x) : x[fn]; (m[k] = m[k] || []).push(x); } return m; },
  sum(arr, fn) { return (arr || []).reduce((a, x) => a + (fn == null ? (+x || 0) : typeof fn === "function" ? (+fn(x) || 0) : (+x[fn] || 0)), 0); },
  sort(arr, fn, desc) { return [...arr].sort((a, b) => { const x = typeof fn === "function" ? fn(a) : a[fn], y = typeof fn === "function" ? fn(b) : b[fn]; return (x > y ? 1 : x < y ? -1 : 0) * (desc ? -1 : 1); }); },
  uid(prefix) { return (prefix || "ID") + "-" + Math.random().toString(36).slice(2, 8).toUpperCase(); },
  title(s) { return String(s || "").replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase()); },
  clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
};

/* ---------------- Store: seed + localStorage overlay ---------------- */
const Store = {
  NS: null, _overlay: {}, _state: {},
  init() {
    this.NS = SITE.ns;
    this._overlay = this._read(this.NS + ".overlay") || {};
    this._state = this._read(this.NS + ".state") || {};
    if (!this._state.today) this._state.today = SITE.todaySeed;
    if (!this._state.persona) this._state.persona = SITE.youId;
  },
  _read(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
  _write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { Toast.show("Could not save to browser storage (private mode?) — changes are session-only.", "warn"); } },
  persist() { this._write(this.NS + ".overlay", this._overlay); this._write(this.NS + ".state", this._state); },
  state(k, v) { if (v === undefined) return this._state[k]; this._state[k] = v; this.persist(); },
  all(ent) {
    const seedRows = SEED[ent] || [];
    const ov = this._overlay[ent] || {};
    const seedIds = new Set(seedRows.map(r => r.id));
    const merged = seedRows.map(r => ov[r.id] ? Object.assign({}, r, ov[r.id]) : r);
    for (const [id, row] of Object.entries(ov)) if (!seedIds.has(id) && !row.__deleted) merged.push(row);
    return merged.filter(r => !r.__deleted);
  },
  get(ent, id) { const seedRow = (SEED[ent] || []).find(r => r.id === id); const ov = (this._overlay[ent] || {})[id]; return ov ? Object.assign({}, seedRow || {}, ov) : seedRow; },
  save(ent, id, patch, auditAction, comment) {
    const o = this._overlay[ent] = this._overlay[ent] || {};
    const cur = o[id] || {};
    o[id] = Object.assign({}, cur, patch, { id });
    if (auditAction) this.audit(ent, id, auditAction, comment);
    this.persist();
  },
  audit(ent, id, action, comment) {
    const o = this._overlay[ent] = this._overlay[ent] || {};
    const cur = o[id] = o[id] || { id };
    const seedRow = (SEED[ent] || []).find(r => r.id === id);
    const trail = cur.audit || (seedRow && seedRow.audit ? [...seedRow.audit] : []);
    trail.push({ ts: Clock.today() + " " + new Date().toTimeString().slice(0, 5), actor: Personas.current().name, action, comment: comment || "" });
    cur.audit = trail; this.persist();
  },
  comment(ent, id, text) {
    const o = this._overlay[ent] = this._overlay[ent] || {};
    const cur = o[id] = o[id] || { id };
    const seedRow = (SEED[ent] || []).find(r => r.id === id);
    const cs = cur.comments || (seedRow && seedRow.comments ? [...seedRow.comments] : []);
    cs.push({ who: Personas.current().name, ts: Clock.today(), text });
    cur.comments = cs; this.persist();
  },
  create(ent, row) { const o = this._overlay[ent] = this._overlay[ent] || {}; o[row.id] = row; this.persist(); return row; },
  reset() { localStorage.removeItem(this.NS + ".overlay"); localStorage.removeItem(this.NS + ".state"); location.reload(); },
  exportJSON() { U.download(this.NS + "-my-work.json", JSON.stringify({ ns: this.NS, overlay: this._overlay, state: this._state }, null, 1), "application/json"); },
  importJSON(file) {
    const rd = new FileReader();
    rd.onload = () => { try { const j = JSON.parse(rd.result); if (j.ns !== this.NS) return Toast.show("That export is for a different site.", "bad"); this._overlay = j.overlay || {}; this._state = j.state || this._state; this.persist(); location.reload(); } catch (e) { Toast.show("Import failed: not valid JSON.", "bad"); } };
    rd.readAsText(file);
  }
};

/* ---------------- Clock ---------------- */
const Clock = {
  today() { return Store.state("today") || SITE.todaySeed; },
  advance(days) {
    const from = this.today();
    const to = U.addDays(from, days);
    Store.state("today", to);
    const fired = [];
    for (const rule of (SITE.eventRules || [])) {
      try { const res = rule(from, to); if (res) fired.push(...[].concat(res)); } catch (e) { console.error("eventRule", e); }
    }
    for (const ev of (SEED.calendar || [])) {
      if (ev.date > from && ev.date <= to && ev.toast) fired.push({ text: ev.toast || ev.title, kind: ev.kind || "info" });
    }
    // Expert-mode curveballs: any started expert mission with a curveball fires it when time moves
    try {
      const prog = Store.state("missions") || {};
      for (const m of (window.MISSIONS || [])) {
        const st = prog[m.id];
        if (m.level === 3 && typeof m.curveball === "string" && st && ["started", "submitted"].includes(st.status) && !st.curveFired) {
          prog[m.id] = Object.assign({}, st, { curveFired: Clock.today() });
          fired.push({ text: "Curveball on " + m.id + ": " + m.curveball, kind: "bad" });
        }
      }
      Store.state("missions", prog);
    } catch (e) { console.error("curveball", e); }
    for (const f of fired.slice(0, 6)) Toast.show(f.text, f.kind === "bad" ? "bad" : f.kind === "warn" ? "warn" : "");
    if (fired.length) Notif.push(...fired.map(f => ({ text: f.text, kind: f.kind, date: to })));
    Router.refresh();
    Toast.show(`Simulated clock advanced to ${U.date(to)}.`, "ok");
  },
  weekday(iso) { return new Date((iso || this.today()) + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short" }); }
};

/* ---------------- Personas ---------------- */
const Personas = {
  list() { return SITE.personas; },
  current() { return SITE.personas.find(p => p.id === Store.state("persona")) || SITE.personas[0]; },
  isYou() { return this.current().id === SITE.youId; },
  set(id) { Store.state("persona", id); Router.refresh(); Toast.show(`Viewing as ${this.current().name} (${this.current().role})`, "ok"); },
  can(action) { const p = this.current(); return p.permissions === "*" || (p.permissions || []).includes(action); }
};

/* ---------------- Toasts & notifications ---------------- */
const Toast = {
  show(text, kind) {
    const host = document.getElementById("toasts");
    const t = U.h("div", { class: "toast " + (kind || "") }, text);
    host.append(t); setTimeout(() => t.remove(), 5200);
  }
};
const Notif = {
  items() { return Store.state("notifs") || []; },
  push(...xs) { const cur = this.items(); Store.state("notifs", [...xs.map(x => ({ ...x, unread: true })), ...cur].slice(0, 60)); App.renderTopbarBadges(); },
  markRead() { Store.state("notifs", this.items().map(n => ({ ...n, unread: false }))); App.renderTopbarBadges(); },
  unread() { return this.items().filter(n => n.unread).length; }
};

/* ---------------- Router ---------------- */
const Router = {
  routes: {}, // "module/screen" -> fn(args)
  add(path, fn) { this.routes[path] = fn; },
  parse() {
    const hash = location.hash.replace(/^#\/?/, "") || "home";
    const parts = hash.split("/").map(decodeURIComponent);
    return { parts, path: parts.slice(0, 2).join("/"), one: parts[0], args: parts.slice(2) };
  },
  go(path) { location.hash = "#/" + path; },
  refresh() { this.render(); },
  render() {
    const { parts, path, one, args } = this.parse();
    const main = document.getElementById("main");
    main.innerHTML = "";
    window.scrollTo(0, 0);
    const fn = this.routes[path] || this.routes[one] || this.routes["home"];
    try { fn(main, args.length ? args : parts.slice(1)); }
    catch (e) { console.error(e); main.append(U.h("div", { class: "banner bad" }, "This screen hit an error: " + e.message)); }
    App.renderNav(); App.renderTopbarBadges(); Explain.refreshFab();
    if (typeof Practice !== "undefined") { try { Practice.decorate(); } catch (e) { console.error("practice", e); } }
  },
  init() { window.addEventListener("hashchange", () => this.render()); }
};

/* ---------------- Search ---------------- */
const Search = {
  run(q) {
    q = q.toLowerCase().trim(); if (!q) return [];
    const out = [];
    for (const [ent, cfg] of Object.entries(SITE.searchables || {})) {
      for (const r of Store.all(ent)) {
        const txt = cfg.text(r).toLowerCase();
        if (txt.includes(q) || r.id.toLowerCase().includes(q)) out.push({ ent, r, label: cfg.label(r), sub: cfg.sub ? cfg.sub(r) : ent, link: cfg.link(r) });
        if (out.length > 60) return out;
      }
    }
    return out;
  }
};

/* ---------------- Explain panel ---------------- */
const Explain = {
  open: false,
  key() { if (typeof EXPLAIN === "undefined") return null; const { path, one } = Router.parse(); return EXPLAIN[path] ? path : (EXPLAIN[one] ? one : null); },
  refreshFab() {
    let fab = document.getElementById("explainfab");
    if (!fab) { fab = U.h("button", { id: "explainfab", class: "explainfab", onclick: () => this.toggle() }, "ⓘ Explain this screen"); document.body.append(fab); }
    fab.style.display = this.key() ? "" : "none";
    if (this.open) this.renderDrawer();
  },
  toggle() { this.open = !this.open; const d = document.getElementById("explaindrawer"); if (!this.open && d) d.remove(); else this.renderDrawer(); },
  renderDrawer() {
    let d = document.getElementById("explaindrawer"); if (d) d.remove();
    const k = this.key(); if (!k) return;
    const e = EXPLAIN[k];
    d = U.h("aside", { id: "explaindrawer", class: "drawer", role: "complementary" },
      U.h("header", null, U.h("h2", null, "Explain this screen"), U.h("span", { class: "spacer" }),
        U.h("button", { class: "btn ghost sm", onclick: () => this.toggle() }, "Close")),
      U.h("div", { class: "dbody explain" },
        U.h("h4", null, "Real-world equivalent"), U.h("p", null, e.real),
        U.h("h4", null, "Who uses it, and how often"), U.h("p", null, e.users),
        U.h("h4", null, "Key fields and why they exist"), U.h("ul", null, e.fields.map(f => U.h("li", null, f))),
        U.h("h4", null, "Decisions it informs"), U.h("ul", null, e.decisions.map(f => U.h("li", null, f))),
        U.h("h4", null, "Common failure modes"), U.h("ul", null, e.failures.map(f => U.h("li", null, f))),
        U.h("h4", null, "How to talk about it in an interview"), U.h("ul", null, e.talk.map(f => U.h("li", null, f))),
        U.h("h4", null, "Practises"), U.h("p", null, e.book)));
    document.body.append(d);
  }
};
