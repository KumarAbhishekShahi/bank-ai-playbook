/* Practice layer: mission catalogue, player, progress tracker, evidence log, day-in-the-life. */
"use strict";
const Missions = {
  all() { return window.MISSIONS || []; },
  progress() { return Store.state("missions") || {}; },
  setProgress(id, patch) { const p = this.progress(); p[id] = Object.assign({}, p[id], patch); Store.state("missions", p); },

  catalogue(main) {
    main.append(C.crumbs({ label: "Missions" }), C.pageHead("Mission catalogue",
      `Guided practice mapped to ${SITE.bookName}. Difficulty: ● Novice · ●● Practitioner · ●●● Expert (time-boxed, curveballs). Every ${SITE.respLabel} has at least one mission.`,
      U.h("a", { class: "btn sec", href: "#/missions/progress" }, "Progress & evidence log"),
      U.h("a", { class: "btn sec", href: "#/missions/day" }, "Day-in-the-life")));
    const prog = this.progress();
    const done = Object.values(prog).filter(p => p.status === "done").length;
    main.append(U.h("div", { class: "card", style: { marginBottom: "1rem" } },
      U.h("div", { class: "flex" }, U.h("b", null, `${done} / ${this.all().length} missions complete`), U.h("span", { class: "spacer" }),
        U.h("span", { class: "muted small" }, "Scores are self-assessed against the rubric, then compared with the model answer.")),
      U.h("div", { class: "progressbar", style: { marginTop: ".5rem" } }, U.h("i", { style: { width: (100 * done / Math.max(1, this.all().length)) + "%" } }))));
    const groups = U.group(this.all(), m => m.cluster || "Missions");
    for (const [cl, ms] of Object.entries(groups)) {
      main.append(U.h("h2", { style: { fontSize: "1.02rem", margin: "1.2rem 0 .6rem", color: "var(--head-ink)" } }, cl));
      const grid = U.h("div", { class: "grid3" });
      for (const m of ms) {
        const st = prog[m.id] || {};
        grid.append(U.h("div", { class: "card missioncard", style: { cursor: "pointer" }, onclick: () => Router.go("missions/run/" + m.id) },
          U.h("div", { class: "flex" }, U.h("span", { class: "mono muted small" }, m.id), U.h("span", { class: "spacer" }),
            U.h("span", { class: "diffdots" }, "●".repeat(m.level || 1)),
            st.status === "done" ? C.pill("done · " + (st.score ?? "—") + "/5", "green") : st.status === "started" ? C.pill("in progress", "amber") : null),
          U.h("div", { style: { fontWeight: 600, margin: ".3rem 0", color: "var(--head-ink)" } }, m.title),
          U.h("div", { class: "muted small" }, "Asked by " + m.asker + " · " + m.moduleLabel),
          U.h("div", { class: "flex-wrap", style: { marginTop: ".45rem" } }, (m.book || []).map(b => C.pill(b, "outline")))));
      }
      main.append(grid);
    }
  },

  run(main, args) {
    const m = this.all().find(x => x.id === args[0]);
    if (!m) { main.append(C.banner("bad", "Mission not found.")); return; }
    const st = this.progress()[m.id] || {};
    if (!st.status) this.setProgress(m.id, { status: "started", startedAt: Clock.today() });
    main.append(C.crumbs({ label: "Missions", href: "#/missions" }, { label: m.id }),
      C.pageHead(m.title, `${m.id} · ${"●".repeat(m.level || 1)} ${["", "Novice", "Practitioner", "Expert"][m.level || 1]} · asked by ${m.asker}`,
        U.h("a", { class: "btn sec", href: "#/" + m.moduleHome }, "Open " + m.moduleLabel)));
    main.append(U.h("div", { class: "card", style: { marginBottom: "1rem" } }, U.h("h3", null, "Scenario"),
      U.h("div", { style: { whiteSpace: "pre-wrap", fontSize: ".9rem", lineHeight: 1.55 } }, m.scenario),
      st.curveFired ? C.banner("bad", U.h("b", null, "Curveball (landed " + U.date(st.curveFired) + "): "), m.curveball) :
      m.level === 3 && m.curveball ? C.banner("warn", U.h("b", null, "Expert mode: "), "a curveball will land mid-mission. Advance the simulated clock by one day after you start to receive it.") : null));
    main.append(U.h("div", { class: "card", style: { marginBottom: "1rem" } }, U.h("h3", null, "Success criteria"),
      U.h("ul", { style: { paddingLeft: "1.2rem", fontSize: ".88rem" } }, m.criteria.map(c => U.h("li", { style: { margin: ".25rem 0" } }, c)))));
    // hints
    const hintsShown = st.hints || 0;
    const hintCard = U.h("div", { class: "card", style: { marginBottom: "1rem" } }, U.h("h3", null, "Hints"));
    for (let i = 0; i < hintsShown && i < (m.hints || []).length; i++) hintCard.append(U.h("div", { class: "hintbox" }, U.h("b", null, `Hint ${i + 1}: `), m.hints[i]));
    if (hintsShown < (m.hints || []).length) hintCard.append(U.h("button", { class: "btn ghost sm", onclick: () => { this.setProgress(m.id, { hints: hintsShown + 1 }); Router.refresh(); } }, `Reveal hint ${hintsShown + 1} of ${m.hints.length}`));
    else if ((m.hints || []).length) hintCard.append(U.h("p", { class: "muted small" }, "All hints revealed."));
    main.append(hintCard);
    // submission
    const ta = U.h("textarea", { style: { width: "100%", minHeight: "150px", border: "1px solid var(--line)", borderRadius: "8px", padding: ".6rem" }, placeholder: "Do the work in the module, then paste or summarise your output here. Submitting unlocks the rubric and model answer." }, st.submission || "");
    main.append(U.h("div", { class: "card", style: { marginBottom: "1rem" } }, U.h("h3", null, "Your submission"), ta,
      U.h("div", { style: { marginTop: ".5rem" } }, U.h("button", {
        class: "btn", onclick: () => {
          if (ta.value.trim().length < 40) return Toast.show("Submit real work — a few sentences minimum. The rubric is only honest if you are.", "warn");
          this.setProgress(m.id, { submission: ta.value.trim(), submittedAt: Clock.today(), status: st.score != null ? "done" : "submitted" }); Router.refresh();
        }
      }, st.submission ? "Update submission" : "Submit for self-review"))));
    if (st.submission) {
      // rubric
      const scores = st.rubricScores || {};
      main.append(U.h("div", { class: "card", style: { marginBottom: "1rem" } }, U.h("h3", null, "Score yourself against the rubric"),
        U.h("table", { class: "rubric" }, U.h("thead", null, U.h("tr", null, U.h("th", null, "Dimension"), U.h("th", null, "1 — weak"), U.h("th", null, "5 — great"), U.h("th", null, "Your score"))),
          U.h("tbody", null, m.rubric.map((r, i) => U.h("tr", null, U.h("td", null, U.h("b", null, r.dim)), U.h("td", null, r.low), U.h("td", null, r.high),
            U.h("td", null, U.h("div", { class: "scorebtns" }, [1, 2, 3, 4, 5].map(n => U.h("button", { class: scores[i] === n ? "sel" : "", onclick: () => { scores[i] = n; this.setProgress(m.id, { rubricScores: scores }); Router.refresh(); } }, n)))))))),
        Object.keys(scores).length === m.rubric.length ? U.h("div", { style: { marginTop: ".7rem" }, class: "flex" },
          U.h("b", null, "Overall: " + (U.sum(Object.values(scores)) / m.rubric.length).toFixed(1) + " / 5"),
          U.h("button", { class: "btn sm", style: { marginLeft: "1rem" }, onclick: () => { this.setProgress(m.id, { score: +(U.sum(Object.values(scores)) / m.rubric.length).toFixed(1), status: "done", doneAt: Clock.today() }); Router.refresh(); } }, "Lock score & finish mission")) : U.h("p", { class: "muted small", style: { marginTop: ".5rem" } }, "Score every dimension to finish.")));
      // model answer
      main.append(U.h("div", { class: "card", style: { marginBottom: "1rem", borderLeft: "4px solid var(--ok)" } }, U.h("h3", null, "Model answer — what “great” looks like"),
        U.h("div", { style: { whiteSpace: "pre-wrap", fontSize: ".88rem", lineHeight: 1.55 } }, m.modelAnswer)));
      // interview mode
      main.append(U.h("div", { class: "card" }, U.h("h3", null, "Interview mode — this mission just prepared you for:"),
        m.interview.map((iq, i) => U.h("div", { style: { marginBottom: ".9rem", paddingBottom: ".7rem", borderBottom: "1px dashed var(--line-soft)" } },
          U.h("div", { style: { fontWeight: 600 } }, `Q${i + 1}. ${iq.q}`),
          U.h("details", { style: { marginTop: ".3rem", fontSize: ".86rem" } }, U.h("summary", { style: { cursor: "pointer", color: "var(--accent)" } }, "Model answer, what the panel checks, red flags"),
            U.h("p", { style: { margin: ".4rem 0" } }, U.h("b", null, "Model answer: "), iq.a),
            U.h("p", { style: { margin: ".4rem 0" } }, U.h("b", null, "Panel is checking: "), iq.checks),
            U.h("p", { style: { margin: ".4rem 0" } }, U.h("b", null, "Red flags: "), iq.flags))))));
    }
  },

  progressPage(main) {
    main.append(C.crumbs({ label: "Missions", href: "#/missions" }, { label: "Progress" }),
      C.pageHead("Progress & evidence log", "A printable record of what you practised and produced — clearly titled as simulation practice.",
        U.h("button", { class: "btn sec", onclick: () => window.print() }, "⎙ Print evidence log")));
    const prog = this.progress();
    const rows = this.all().map(m => ({ m, st: prog[m.id] || {} }));
    const done = rows.filter(r => r.st.status === "done");
    const byCluster = U.group(this.all(), m => m.cluster || "Missions");
    main.append(U.h("div", { class: "grid4", style: { marginBottom: "1rem", gridTemplateColumns: "repeat(5,1fr)" } },
      C.stat("Missions complete", done.length + " / " + rows.length),
      C.stat("Average self-score", done.length ? (U.sum(done, r => r.st.score || 0) / done.length).toFixed(1) + " / 5" : "—"),
      C.stat("Hints used", U.sum(rows, r => r.st.hints || 0)),
      C.stat("Practice guides done", Object.keys(Store.state("practiceDone") || {}).length + " / " + Object.keys(window.PRACTICE || {}).length),
      C.stat("Clusters with a badge", Object.entries(byCluster).filter(([c, ms]) => ms.every(m => (prog[m.id] || {}).status === "done")).length + " / " + Object.keys(byCluster).length)));
    main.append(U.h("div", { class: "grid4", style: { marginBottom: "1rem" } },
      Object.entries(byCluster).map(([cl, ms]) => {
        const d = ms.filter(m => (prog[m.id] || {}).status === "done").length;
        return U.h("div", { class: "card center" }, U.h("div", { style: { fontSize: "1.6rem" } }, d === ms.length ? "🏅" : "·"),
          U.h("div", { class: "small", style: { fontWeight: 600 } }, cl), U.h("div", { class: "muted small" }, `${d}/${ms.length}`));
      })));
    main.append(U.h("div", { class: "report-title printonly" }, SITE.brand.org + " — simulation practice evidence log"),
      U.h("div", { class: "report-meta printonly" }, "Generated " + U.date(Clock.today()) + " · Training simulation; all organisations, people and data are fictional."));
    main.append(U.h("div", { class: "tablewrap" }, U.h("div", { class: "tscroll" }, U.h("table", { class: "data" },
      U.h("thead", null, U.h("tr", null, ["Mission", "Practises", "Status", "Score", "Completed", "What I produced"].map(hd => U.h("th", null, hd)))),
      U.h("tbody", null, rows.map(({ m, st }) => U.h("tr", null,
        U.h("td", null, U.h("a", { href: "#/missions/run/" + m.id }, m.id), U.h("span", { class: "sub" }, m.title)),
        U.h("td", null, (m.book || []).join(", ")),
        U.h("td", null, C.pill(st.status || "not started", st.status === "done" ? "green" : st.status ? "amber" : "gray")),
        U.h("td", null, st.score != null ? st.score + "/5" : "—"),
        U.h("td", null, st.doneAt ? U.date(st.doneAt) : "—"),
        U.h("td", { class: "small" }, st.submission ? st.submission.slice(0, 140) + (st.submission.length > 140 ? "…" : "") : "—"))))))));
    const pd = Store.state("practiceDone") || {};
    if (Object.keys(pd).length && window.PRACTICE) main.append(U.h("div", { class: "card", style: { marginTop: "1rem" } }, U.h("h3", null, "Practice guides completed"),
      U.h("table", { class: "data" }, U.h("tbody", null, Object.entries(pd).map(([k, d]) => U.h("tr", null, U.h("td", null, (PRACTICE[k] || {}).t || k), U.h("td", { class: "nowrap" }, U.date(d))))))));
  },

  day(main) {
    main.append(C.crumbs({ label: "Missions", href: "#/missions" }, { label: "Day-in-the-life" }),
      C.pageHead("Day-in-the-life mode", "A scripted day with interleaved interruptions. Work top to bottom; the point is prioritising, not completing. Advance the clock to let scripted events land."));
    for (const d of (SITE.days || [])) {
      main.append(U.h("div", { class: "card", style: { marginBottom: "1rem" } }, U.h("h3", null, d.title),
        U.h("p", { class: "muted small", style: { marginBottom: ".6rem" } }, d.intro),
        U.h("table", { class: "data" }, U.h("tbody", null, d.slots.map(s => U.h("tr", null,
          U.h("td", { class: "nowrap mono", style: { width: "70px" } }, s.t),
          U.h("td", null, s.link ? U.h("a", { href: s.link }, s.what) : s.what, s.interrupt ? C.pill("interruption", "red") : null),
          U.h("td", { class: "small muted" }, s.why)))))));
    }
  }
};
