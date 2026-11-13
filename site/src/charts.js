/* Tiny SVG chart library — original, no dependencies. Palette from CSS vars via SITE.chartColors. */
"use strict";
const Charts = {
  colors() { return SITE.chartColors || ["#1E4EC4", "#ED9010", "#0B8F7A", "#8C3FA8", "#C43E4E", "#4E7AC4", "#7A8699"]; },
  _svg(w, h) { const s = document.createElementNS("http://www.w3.org/2000/svg", "svg"); s.setAttribute("viewBox", `0 0 ${w} ${h}`); s.setAttribute("role", "img"); return s; },
  _el(n, a) { const e = document.createElementNS("http://www.w3.org/2000/svg", n); for (const [k, v] of Object.entries(a || {})) e.setAttribute(k, v); return e; },
  _txt(x, y, t, a) { const e = this._el("text", Object.assign({ x, y, "font-size": 10, fill: "var(--muted)" }, a)); e.textContent = t; return e; },
  wrap(svg, legendItems) {
    const d = U.h("div", { class: "chart" }); d.append(svg);
    if (legendItems) d.append(U.h("div", { class: "legend" }, legendItems.map((l, i) =>
      U.h("span", null, U.h("i", { style: { background: l.color || this.colors()[i % this.colors().length] } }), l.label))));
    return d;
  },
  /* line({series:[{label,points:[y..],color}], labels:[x..], h, fmt, bands:[{from,to,color,label}] , goal}) */
  line(cfg) {
    const w = 560, h = cfg.h || 180, padL = 42, padB = 22, padT = 10, padR = 8;
    const svg = this._svg(w, h);
    const all = cfg.series.flatMap(s => s.points).filter(v => v != null);
    let min = cfg.min ?? Math.min(...all), max = cfg.max ?? Math.max(...all);
    if (cfg.bands) { min = Math.min(min, ...cfg.bands.map(b => b.from)); max = Math.max(max, ...cfg.bands.map(b => b.to === Infinity ? max : b.to)); }
    if (min === max) { min -= 1; max += 1; }
    const span = max - min, X = i => padL + i * (w - padL - padR) / Math.max(1, (cfg.labels.length - 1)), Y = v => padT + (h - padT - padB) * (1 - (v - min) / span);
    for (const b of cfg.bands || []) {
      const to = b.to === Infinity ? max : b.to;
      svg.append(this._el("rect", { x: padL, y: Y(to), width: w - padL - padR, height: Math.max(0, Y(b.from) - Y(to)), fill: b.color, opacity: .16 }));
      if (b.label) svg.append(this._txt(w - padR - 2, Y(to) + 10, b.label, { "text-anchor": "end", "font-size": 8.5 }));
    }
    for (let g = 0; g <= 4; g++) { const v = min + span * g / 4; svg.append(this._el("line", { x1: padL, x2: w - padR, y1: Y(v), y2: Y(v), stroke: "var(--line-soft,#ddd)", "stroke-width": .6 })); svg.append(this._txt(padL - 4, Y(v) + 3, (cfg.fmt || (x => U.num(x)))(v), { "text-anchor": "end" })); }
    if (cfg.goal != null) { svg.append(this._el("line", { x1: padL, x2: w - padR, y1: Y(cfg.goal), y2: Y(cfg.goal), stroke: "var(--danger,#c00)", "stroke-dasharray": "4 3", "stroke-width": 1.2 })); }
    cfg.labels.forEach((l, i) => { if (cfg.labels.length <= 14 || i % Math.ceil(cfg.labels.length / 12) === 0) svg.append(this._txt(X(i), h - 6, l, { "text-anchor": "middle" })); });
    cfg.series.forEach((s, si) => {
      const col = s.color || this.colors()[si % this.colors().length];
      const pts = s.points.map((v, i) => v == null ? null : `${X(i)},${Y(v)}`).filter(Boolean).join(" ");
      svg.append(this._el("polyline", { points: pts, fill: "none", stroke: col, "stroke-width": 2 }));
      s.points.forEach((v, i) => { if (v != null) { const c = this._el("circle", { cx: X(i), cy: Y(v), r: 2.6, fill: col }); c.append(this._el("title")); c.lastChild.textContent = `${s.label || ""} ${cfg.labels[i]}: ${(cfg.fmt || (x => U.num(x)))(v)}`; svg.append(c); } });
    });
    return this.wrap(svg, cfg.series.length > 1 ? cfg.series.map((s, i) => ({ label: s.label, color: s.color || this.colors()[i % this.colors().length] })) : null);
  },
  /* bars({labels, series:[{label,points}], h, fmt, stacked}) */
  bars(cfg) {
    const w = 560, h = cfg.h || 180, padL = 42, padB = 24, padT = 8, padR = 6;
    const svg = this._svg(w, h);
    const n = cfg.labels.length, ns = cfg.series.length;
    const totals = cfg.labels.map((_, i) => cfg.stacked ? U.sum(cfg.series, s => s.points[i] || 0) : Math.max(...cfg.series.map(s => s.points[i] || 0)));
    const max = cfg.max ?? Math.max(...totals, 1);
    const Y = v => padT + (h - padT - padB) * (1 - v / max);
    for (let g = 0; g <= 4; g++) { const v = max * g / 4; svg.append(this._el("line", { x1: padL, x2: w - padR, y1: Y(v), y2: Y(v), stroke: "var(--line-soft,#ddd)", "stroke-width": .6 })); svg.append(this._txt(padL - 4, Y(v) + 3, (cfg.fmt || (x => U.num(x)))(v), { "text-anchor": "end" })); }
    const slot = (w - padL - padR) / n, bw = cfg.stacked ? slot * .62 : slot * .72 / ns;
    cfg.labels.forEach((l, i) => {
      let acc = 0;
      cfg.series.forEach((s, si) => {
        const v = s.points[i] || 0, col = s.color || this.colors()[si % this.colors().length];
        const x = cfg.stacked ? padL + i * slot + slot * .19 : padL + i * slot + slot * .14 + si * bw;
        const y0 = cfg.stacked ? Y(acc + v) : Y(v), hh = cfg.stacked ? Y(acc) - Y(acc + v) : (h - padB) - Y(v);
        const r = this._el("rect", { x, y: y0, width: bw, height: Math.max(0, hh), fill: col, rx: 1.5 });
        r.append(this._el("title")); r.lastChild.textContent = `${s.label || ""} ${l}: ${(cfg.fmt || (x2 => U.num(x2)))(v)}`;
        svg.append(r); acc += v;
      });
      if (n <= 16 || i % Math.ceil(n / 12) === 0) svg.append(this._txt(padL + i * slot + slot / 2, h - 7, l, { "text-anchor": "middle" }));
    });
    return this.wrap(svg, cfg.series.length > 1 ? cfg.series.map((s, i) => ({ label: s.label, color: s.color || this.colors()[i % this.colors().length] })) : null);
  },
  /* hbars({items:[{label,value,color,sub}], fmt, max}) */
  hbars(cfg) {
    const w = 560, rh = 26, padL = cfg.padL || 150, padR = 60;
    const h = cfg.items.length * rh + 8;
    const svg = this._svg(w, h);
    const max = cfg.max ?? Math.max(...cfg.items.map(i => i.value), 1);
    cfg.items.forEach((it, i) => {
      const y = 4 + i * rh, bw = (w - padL - padR) * (it.value / max);
      svg.append(this._txt(padL - 6, y + 14, it.label.length > 24 ? it.label.slice(0, 23) + "…" : it.label, { "text-anchor": "end", "font-size": 10.5, fill: "var(--ink)" }));
      svg.append(this._el("rect", { x: padL, y: y + 3, width: Math.max(1.5, bw), height: rh - 10, fill: it.color || this.colors()[0], rx: 2 }));
      svg.append(this._txt(padL + bw + 5, y + 14, (cfg.fmt || (x => U.num(x)))(it.value), { "font-size": 10, fill: "var(--ink)" }));
    });
    return this.wrap(svg);
  },
  donut(cfg) { // {items:[{label,value,color}], centre}
    const w = 300, h = 170, cx = 85, cy = 85, R = 66, r = 42;
    const svg = this._svg(w, h);
    const tot = U.sum(cfg.items, "value") || 1; let a0 = -Math.PI / 2;
    cfg.items.forEach((it, i) => {
      const a1 = a0 + 2 * Math.PI * (it.value / tot);
      const large = (a1 - a0) > Math.PI ? 1 : 0;
      const p = `M ${cx + R * Math.cos(a0)} ${cy + R * Math.sin(a0)} A ${R} ${R} 0 ${large} 1 ${cx + R * Math.cos(a1)} ${cy + R * Math.sin(a1)} L ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} A ${r} ${r} 0 ${large} 0 ${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} Z`;
      const path = this._el("path", { d: p, fill: it.color || this.colors()[i % this.colors().length] });
      path.append(this._el("title")); path.lastChild.textContent = `${it.label}: ${U.num(it.value)} (${(100 * it.value / tot).toFixed(0)}%)`;
      svg.append(path); a0 = a1;
    });
    if (cfg.centre) { svg.append(this._txt(cx, cy + 1, cfg.centre, { "text-anchor": "middle", "font-size": 15, "font-weight": 700, fill: "var(--head-ink)" })); if (cfg.centreSub) svg.append(this._txt(cx, cy + 15, cfg.centreSub, { "text-anchor": "middle", "font-size": 8.5 })); }
    cfg.items.forEach((it, i) => {
      svg.append(this._el("rect", { x: 178, y: 26 + i * 18, width: 9, height: 9, rx: 2, fill: it.color || this.colors()[i % this.colors().length] }));
      svg.append(this._txt(192, 34 + i * 18, `${it.label} · ${U.num(it.value)}`, { "font-size": 9.5, fill: "var(--ink)" }));
    });
    return this.wrap(svg);
  },
  spark(points, opts) {
    opts = opts || {}; const w = opts.w || 110, h = opts.h || 30, pad = 3;
    const svg = this._svg(w, h); svg.setAttribute("width", w); svg.setAttribute("height", h);
    const min = Math.min(...points), max = Math.max(...points), span = (max - min) || 1;
    const pts = points.map((v, i) => `${pad + i * (w - 2 * pad) / (points.length - 1)},${pad + (h - 2 * pad) * (1 - (v - min) / span)}`).join(" ");
    svg.append(this._el("polyline", { points: pts, fill: "none", stroke: opts.color || this.colors()[0], "stroke-width": 1.6 }));
    const last = points[points.length - 1];
    svg.append(this._el("circle", { cx: pad + (w - 2 * pad), cy: pad + (h - 2 * pad) * (1 - (last - min) / span), r: 2.4, fill: opts.color || this.colors()[0] }));
    const d = U.h("span", { class: "chart", style: { display: "inline-block", verticalAlign: "middle" } }); d.append(svg); return d;
  },
  gauge(v, cfg) { // 0..1
    cfg = cfg || {}; const w = 180, h = 104, cx = 90, cy = 92, R = 70;
    const svg = this._svg(w, h);
    const arc = (from, to, col, sw) => { const a = f => Math.PI * (1 + f); const p = `M ${cx + R * Math.cos(a(from))} ${cy + R * Math.sin(a(from))} A ${R} ${R} 0 ${to - from > .5 ? 1 : 0} 1 ${cx + R * Math.cos(a(to))} ${cy + R * Math.sin(a(to))}`; svg.append(this._el("path", { d: p, fill: "none", stroke: col, "stroke-width": sw || 13, "stroke-linecap": "round" })); };
    arc(0, 1, "var(--pill-gray-bg,#e8e8e8)"); arc(0, U.clamp(v, 0, 1), cfg.color || (v > (cfg.bad ?? 1.01) ? "var(--danger)" : v > (cfg.warn ?? 1.01) ? "var(--warn)" : this.colors()[0]));
    svg.append(this._txt(cx, cy - 12, cfg.label ?? (100 * v).toFixed(0) + "%", { "text-anchor": "middle", "font-size": 17, "font-weight": 700, fill: "var(--head-ink)" }));
    if (cfg.sub) svg.append(this._txt(cx, cy + 3, cfg.sub, { "text-anchor": "middle", "font-size": 8.5 }));
    const g = this.wrap(svg); g.style.maxWidth = (cfg.maxW || 240) + "px"; g.style.margin = "0 auto"; return g;
  },
  heat(cfg) { // {rows:[label], cols:[label], value(r,c)->{v,txt,color}}
    const grid = U.h("div", { style: { display: "grid", gridTemplateColumns: `minmax(90px,150px) repeat(${cfg.cols.length},1fr)`, gap: "3px", fontSize: ".72rem" } });
    grid.append(U.h("div"));
    for (const c of cfg.cols) grid.append(U.h("div", { class: "center muted small" }, c));
    cfg.rows.forEach((r, ri) => {
      grid.append(U.h("div", { class: "muted", style: { alignSelf: "center" } }, r));
      cfg.cols.forEach((c, ci) => { const cell = cfg.value(ri, ci); grid.append(U.h("div", { class: "heatcell", style: { background: cell.color, color: cell.ink || "#fff" }, title: cell.title || "" }, cell.txt)); });
    });
    return grid;
  },
  flow(stages, opts) { // horizontal stage flow diagram [{label,count,color,active}]
    opts = opts || {}; const sw = opts.stageW || 108, h = 64, w = stages.length * (sw + 26);
    const svg = this._svg(w, h);
    stages.forEach((s, i) => {
      const x = i * (sw + 26);
      svg.append(this._el("rect", { x, y: 10, width: sw, height: 40, rx: 7, fill: s.color || this.colors()[0], opacity: s.active === false ? .35 : 1 }));
      const t1 = this._txt(x + sw / 2, s.count != null ? 26 : 33, s.label, { "text-anchor": "middle", fill: "#fff", "font-size": 9.5, "font-weight": 700 }); svg.append(t1);
      if (s.count != null) svg.append(this._txt(x + sw / 2, 42, String(s.count), { "text-anchor": "middle", fill: "#fff", "font-size": 12, "font-weight": 700 }));
      if (i < stages.length - 1) { svg.append(this._el("path", { d: `M ${x + sw + 4} 30 L ${x + sw + 20} 30`, stroke: "var(--muted)", "stroke-width": 1.6, "marker-end": "none" })); svg.append(this._el("path", { d: `M ${x + sw + 15} 25 L ${x + sw + 22} 30 L ${x + sw + 15} 35`, fill: "none", stroke: "var(--muted)", "stroke-width": 1.6 })); }
    });
    const d = U.h("div", { class: "chart", style: { overflowX: "auto" } }); d.append(svg); svg.style.minWidth = w * 0.9 + "px"; return d;
  }
};
