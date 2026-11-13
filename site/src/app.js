/* App boot: builds shell, registers shared routes, starts router. Requires SITE, SEED, module files loaded first. */
"use strict";
const App = {
  boot() {
    Store.init();
    document.title = SITE.brand.suite + " · " + SITE.brand.org;
    const app = document.getElementById("app");
    app.append(this.topbar());
    const body = U.h("div", { class: "body" });
    body.append(U.h("nav", { class: "leftnav", id: "leftnav", "aria-label": "Modules" }));
    body.append(U.h("main", { id: "main" }));
    app.append(body);
    app.append(U.h("footer", { class: "simfooter" },
      "Training simulation. All organisations, people and data are fictional. · ",
      U.h("span", null, `Companion to “${SITE.bookName}” by Kumar Abhishek Shahi · The Final Leap, Pune`), " · ",
      U.h("button", { class: "btn ghost sm noprint", onclick: () => Store.exportJSON() }, "Export my work"),
      " ", U.h("label", { class: "btn ghost sm noprint", style: { display: "inline-block" } }, "Import", U.h("input", { type: "file", accept: ".json", style: { display: "none" }, onchange: e => e.target.files[0] && Store.importJSON(e.target.files[0]) })),
      " ", U.h("button", { class: "btn ghost sm noprint", onclick: () => { if (confirm("Reset all your edits, approvals and mission progress back to seed data?")) Store.reset(); } }, "Reset to seed data")));
    document.body.append(U.h("div", { id: "toasts", "aria-live": "polite" }));

    // shared routes
    Router.add("home", m => SharedScreens.launcher(m));
    Router.add("calendar", m => SharedScreens.calendar(m));
    Router.add("org", m => SharedScreens.org(m));
    Router.add("matrix", m => SharedScreens.matrix(m));
    Router.add("search", (m, a) => SharedScreens.search(m, a));
    Router.add(SITE.mailRoute, (m, a) => SharedScreens.inbox(m, a));
    Router.add("missions", m => Missions.catalogue(m));
    Router.add("missions/run", (m, a) => Missions.run(m, a));
    Router.add("missions/progress", m => Missions.progressPage(m));
    Router.add("missions/day", m => Missions.day(m));
    if (typeof Practice !== "undefined") { Router.add("practice", m => Practice.library(m)); Router.add("practice/guide", (m, a) => Practice.fullPage(m, a)); }
    for (const mod of SITE.modules) for (const [path, fn] of Object.entries(mod.routes || {})) Router.add(path, fn);
    Router.init();
    Router.render();
  },

  topbar() {
    const me = () => Personas.current();
    const bar = U.h("div", { class: "topbar" });
    bar.append(U.h("a", { class: "logo", href: "#/home" },
      U.h("span", { class: "mark" }, SITE.brand.mark), U.h("span", null, SITE.brand.org, " ", U.h("span", { style: { opacity: .75, fontWeight: 400 } }, SITE.brand.suite))));
    const gs = U.h("input", {
      class: "gsearch", type: "search", placeholder: "Search records, people, documents…  (press /)",
      onkeydown: e => { if (e.key === "Enter" && e.target.value.trim()) Router.go("search/" + encodeURIComponent(e.target.value.trim())); }
    });
    document.addEventListener("keydown", e => { if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") { e.preventDefault(); gs.focus(); } });
    bar.append(gs, U.h("span", { class: "spacer" }));
    // clock
    bar.append(U.h("span", { class: "clockchip", title: "Simulated clock — advance to trigger scheduled events" },
      U.h("a", { href: "#/calendar", style: { color: "inherit" } }, "🕑 ", U.h("span", { id: "clocklabel" }, Clock.weekday() + " " + U.date(Clock.today()))),
      U.h("button", { title: "Advance one day", onclick: () => Clock.advance(1) }, "+1d"),
      U.h("button", { title: "Advance one week", onclick: () => Clock.advance(7) }, "+1w"),
      U.h("button", { title: "Advance one month", onclick: () => Clock.advance(30) }, "+1m")));
    // bell
    const bell = U.h("button", { class: "tb-btn", id: "bellbtn", "aria-label": "Notifications", onclick: () => this.bellDrawer() }, C.icon("bell"));
    bar.append(bell);
    // mail
    bar.append(U.h("a", { class: "tb-btn", id: "mailbtn", href: "#/" + SITE.mailRoute, "aria-label": SITE.mailName }, C.icon("mail")));
    // persona switcher
    const pwrap = U.h("div", { class: "flex", style: { gap: ".4rem" } });
    const sel = U.h("select", {
      "aria-label": "View as persona",
      style: { border: "none", borderRadius: "6px", padding: ".3rem .4rem", background: "var(--top-search-bg)", color: "var(--top-ink)", maxWidth: "190px" },
      onchange: e => Personas.set(e.target.value)
    }, SITE.personas.map(p => U.h("option", { value: p.id, selected: p.id === Store.state("persona") ? "" : null }, (p.id === SITE.youId ? "You — " : "View as: ") + p.name)));
    pwrap.append(U.h("span", { id: "topavatar" }, C.avatar(me().name)), sel);
    bar.append(pwrap);
    return bar;
  },

  bellDrawer() {
    const items = Notif.items();
    Modal.open("Notifications", () => {
      Notif.markRead();
      return items.length ? U.h("ul", { class: "audit" }, items.map(n => U.h("li", null, U.h("span", { class: "when" }, n.date || ""), U.h("span", null, n.text)))) :
        U.h("p", { class: "muted" }, "No notifications yet. Advance the simulated clock to let scheduled events fire — SLA breaches, drift alerts, renewals, deadlines.");
    });
  },

  renderTopbarBadges() {
    const bell = document.getElementById("bellbtn");
    if (bell) { let b = bell.querySelector(".badge"); const n = Notif.unread(); if (n) { if (!b) { b = U.h("span", { class: "badge" }); bell.append(b); } b.textContent = n; } else if (b) b.remove(); }
    const mail = document.getElementById("mailbtn");
    if (mail) { let b = mail.querySelector(".badge"); const read = new Set(Store.state("readMsgs") || []); const n = Store.all("messages").filter(m => !read.has(m.id)).length; if (n) { if (!b) { b = U.h("span", { class: "badge" }); mail.append(b); } b.textContent = n; } else if (b) b.remove(); }
    const cl = document.getElementById("clocklabel"); if (cl) cl.textContent = Clock.weekday() + " " + U.date(Clock.today());
    const av = document.getElementById("topavatar"); if (av) { av.innerHTML = ""; av.append(C.avatar(Personas.current().name)); }
  },

  renderNav() {
    const nav = document.getElementById("leftnav");
    if (!nav) return;
    nav.innerHTML = "";
    const { path, one } = Router.parse();
    const link = (href, label, icon, count) => U.h("a", { href: "#/" + href, class: (path === href || one === href || path.startsWith(href + "/")) ? "active" : "" }, icon ? C.icon(icon) : null, label, count ? U.h("span", { class: "cnt" }, count) : null);
    nav.append(link("home", "Launcher", "grid"));
    const read = new Set(Store.state("readMsgs") || []);
    nav.append(link(SITE.mailRoute, SITE.mailName, "mail", Store.all("messages").filter(m => !read.has(m.id)).length || null));
    nav.append(link("calendar", "Calendar", "cal"), link("org", "Org chart", "people"), link("matrix", "Stakeholders", "flow"), link("missions", "Missions", "target", null), link("practice", "Practice library", "book", null));
    for (const group of SITE.navGroups) {
      nav.append(U.h("div", { class: "sect" }, group.label));
      for (const item of group.items) {
        const mod = SITE.modules.find(m => m.id === item);
        if (mod) nav.append(link(mod.home, mod.label, mod.icon, mod.navCount ? mod.navCount() : null));
      }
    }
  }
};
window.addEventListener("DOMContentLoaded", () => App.boot());
