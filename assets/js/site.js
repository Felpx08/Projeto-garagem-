/* ============ GARAGEM 617 — site público ============ */
(function () {
  const G = window.G617;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (u) => (/^https?:\/\//i.test(u || "") ? u : "#");
  const ph = G.placeholder;
  const img = (src, label, tone) => (src && src !== "ph" ? src : ph(label || "GARAGEM 617", tone));
  const PAGE_LOAD = Date.now();
  let S = {}; // settings
  let DATA = { services: [], works: [], reviews: [] };

  /* ---------- Ícones ---------- */
  const A = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  const ICONS = {
    hammer: `<svg viewBox="0 0 24 24" ${A}><path d="M14 4l6 6-3 3-6-6z"/><path d="M11 7L4 14l3 3 7-7"/><path d="M5 20l4-4"/></svg>`,
    spray: `<svg viewBox="0 0 24 24" ${A}><rect x="7" y="9" width="8" height="12" rx="1.5"/><path d="M9 9V6h4v3"/><path d="M18 6h.01M20 9h.01M18 12h.01M20 4h.01"/></svg>`,
    bumper: `<svg viewBox="0 0 24 24" ${A}><path d="M2 14c0-2 1-3 3-3h14c2 0 3 1 3 3v2H2z"/><path d="M5 11l2-4h10l2 4"/><circle cx="7" cy="18" r="1.5"/><circle cx="17" cy="18" r="1.5"/></svg>`,
    sparkle: `<svg viewBox="0 0 24 24" ${A}><path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/><path d="M19 3v3M17.5 4.5h3"/></svg>`,
    dent: `<svg viewBox="0 0 24 24" ${A}><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2"/></svg>`,
    brush: `<svg viewBox="0 0 24 24" ${A}><path d="M18 3l3 3-9 9-3-3z"/><path d="M9 12c-3 0-4 2-4 4 0 2-1 3-2 4 3 1 7 0 8-3 .5-1.500 0-3-2-5"/></svg>`,
    wrench: `<svg viewBox="0 0 24 24" ${A}><path d="M14.700 6.300a4 4 0 0 0-5 5L3 18l3 3 6.700-6.700a4 4 0 0 0 5-5l-2.500 2.500-2.500-.5-.5-2.500z"/></svg>`,
    clipboard: `<svg viewBox="0 0 24 24" ${A}><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9z"/><path d="M8.500 12h7M8.500 16h5"/></svg>`
  };
  const SOC = {
    instagram: `<svg viewBox="0 0 24 24" ${A}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.500 6.500h.01"/></svg>`,
    facebook: `<svg viewBox="0 0 24 24" ${A}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,
    tiktok: `<svg viewBox="0 0 24 24" ${A}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
    whatsapp: `<svg viewBox="0 0 24 24" ${A}><path d="M22 16.920v3a2 2 0 0 1-2.180 2 19.790 19.790 0 0 1-8.630-3.070 19.500 19.500 0 0 1-6-6A19.790 19.790 0 0 1 2.120 4.180 2 2 0 0 1 4.110 2h3a2 2 0 0 1 2 1.720c.130.960.360 1.900.700 2.810a2 2 0 0 1-.450 2.110L8.090 9.910a16 16 0 0 0 6 6l1.270-1.270a2 2 0 0 1 2.110-.450c.910.340 1.850.570 2.810.700A2 2 0 0 1 22 16.920z"/></svg>`
  };

  /* ---------- Utilidades ---------- */
  function waLink(msg) {
    const num = String(S.whatsapp || "").replace(/\D/g, "");
    return "https://wa.me/" + num + "?text=" + encodeURIComponent(msg);
  }
  const WA_DEFAULT = "Olá, vim pelo site da Garagem 617 e gostaria de solicitar um orçamento.";
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), 3500);
  }
  const fmtDate = (iso) => { const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}`; };
  const todayISO = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };

  /* ---------- Configurações no HTML ---------- */
  function applySettings() {
    $$("[data-s]").forEach((el) => { el.textContent = S[el.dataset.s] || ""; });
    $$("[data-wa]").forEach((a) => (a.href = waLink(WA_DEFAULT)));
    $("#heroTitle").textContent = S.hero_title;
    $("#heroSub").textContent = S.hero_subtitle;
    if (S.hero_image) { const b = $("#heroBg"); b.style.backgroundImage = `url("${S.hero_image.replace(/"/g, "%22")}")`; b.classList.add("has-img"); }
    $("#aboutTitle").textContent = S.about_title;
    $("#aboutText").textContent = S.about_text;

    // estatísticas
    $("#stats").innerHTML = [1, 2, 3].map((i) => `<div class="stat"><b data-count="${esc(S["stat" + i + "_value"])}">${esc(S["stat" + i + "_value"])}</b><span>${esc(S["stat" + i + "_label"])}</span></div>`).join("");

    // imagens do sobre
    const labels = ["OFICINA", "NOSSA EQUIPE", "CARRO EM REPARO"];
    const ai = S.about_images || [];
    $("#aboutImgs").innerHTML = labels.map((l, i) => `<div><img loading="lazy" src="${esc(img(ai[i], l))}" alt="${esc(l.toLowerCase())} da Garagem 617"></div>`).join("");

    // redes
    const links = [["instagram", "Instagram", S.instagram], ["facebook", "Facebook", S.facebook], ["tiktok", "TikTok", S.tiktok], ["whatsapp", "WhatsApp", waLink(WA_DEFAULT)]];
    $("#socialsRow").innerHTML = links.map(([k, n, u]) => `<a class="soc" href="${esc(safeUrl(u))}" target="_blank" rel="noopener">${SOC[k]}${n}</a>`).join("");
    $("#footSocials").innerHTML = links.map(([k, n, u]) => `<li><a href="${esc(safeUrl(u))}" target="_blank" rel="noopener">${n}</a></li>`).join("");
    const posts = S.instagram_posts || [];
    $("#instaGrid").innerHTML = Array.from({ length: 6 }, (_, i) => `<a href="${esc(safeUrl(S.instagram))}" target="_blank" rel="noopener" aria-label="Ver publicação no Instagram"><img loading="lazy" src="${esc(img(posts[i], "INSTAGRAM"))}" alt="Publicação do Instagram da Garagem 617"></a>`).join("");

    // mapa
    const addr = S.map_query || S.address || "";
    const isPh = !addr || /SUBSTITUIR/i.test(addr);
    $("#mapBox").innerHTML = isPh
      ? `<div class="map-ph"><p>O mapa aparece aqui quando o endereço real da Garagem 617 for cadastrado no painel administrativo.</p></div>`
      : `<iframe title="Mapa da Garagem 617" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${encodeURIComponent(addr)}&output=embed"></iframe>`;
    $("#routeBtn").href = isPh ? "https://www.google.com/maps" : "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(addr);
    if (S.reviews_google_url) { $("#googleReviews").hidden = false; $("#googleReviewsLink").href = safeUrl(S.reviews_google_url); }
  }

  /* ---------- Serviços ---------- */
  function renderServices() {
    const list = DATA.services.slice().sort((a, b) => (a.position || 99) - (b.position || 99));
    $("#servicesGrid").innerHTML = list.map((s, i) => {
      const cat = (s.category || s.title).toLowerCase();
      const msg = s.category === "Orçamento" ? WA_DEFAULT : `Olá, vim pelo site da Garagem 617 e gostaria de solicitar um orçamento para ${cat}.`;
      return `<article class="scard reveal" style="--d:${(i % 4) * 0.08}s">
        <div class="scard__ic">${ICONS[s.icon] || ICONS.wrench}</div>
        <h3>${esc(s.title)}</h3><p>${esc(s.description)}</p>
        <div class="scard__links">
          <a class="btn btn--sm" href="${esc(waLink(msg))}" target="_blank" rel="noopener">SOLICITAR ORÇAMENTO</a>
          <a class="scard__alt" href="#orcamento" data-pick="${esc(s.title)}">ou preencha o formulário</a>
        </div></article>`;
    }).join("");
    const sel = $("#quoteService");
    sel.innerHTML = `<option value="">Selecione…</option>` + list.map((s) => `<option>${esc(s.title)}</option>`).join("") + `<option>Outro</option>`;
    $$("[data-pick]").forEach((a) => a.addEventListener("click", () => { sel.value = a.dataset.pick; }));
  }

  /* ---------- Comparador antes/depois ---------- */
  function buildBA(box, before, after) {
    box.innerHTML = `<img src="${esc(before)}" alt="Antes do serviço" draggable="false"><img class="ba__after" src="${esc(after)}" alt="Depois do serviço" draggable="false">
      <span class="ba__tag ba__tag--l">ANTES</span><span class="ba__tag ba__tag--r">DEPOIS</span>
      <div class="ba__line"></div><div class="ba__knob" aria-hidden="true">‹›</div>
      <input type="range" min="0" max="100" value="50" aria-label="Arraste para comparar antes e depois">`;
    const r = $("input", box);
    const set = (v) => box.style.setProperty("--pos", v + "%");
    r.addEventListener("input", () => set(r.value));
    set(50);
  }
  const isBA = (w) => !!(w.ba || (w.before && w.after && w.before !== "" && w.after !== ""));
  function renderBA() {
    const list = DATA.works.filter(isBA);
    const sec = $("#transformacao");
    if (!list.length) { sec.hidden = true; return; }
    sec.hidden = false;
    const thumbs = $("#baThumbs");
    thumbs.innerHTML = list.map((w, i) => `<button type="button" data-i="${i}" aria-label="${esc(w.title)}"><img loading="lazy" src="${esc(img(w.after, "DEPOIS", "after"))}" alt=""></button>`).join("");
    const show = (i) => {
      const w = list[i];
      buildBA($("#baMain"), img(w.before, "ANTES", "before"), img(w.after, "DEPOIS", "after"));
      $("#baTitle").textContent = w.title; $("#baMeta").textContent = [w.vehicle, w.service].filter(Boolean).join(" · "); $("#baDesc").textContent = w.description || "";
      $$("button", thumbs).forEach((b, k) => b.classList.toggle("on", k === i));
    };
    thumbs.onclick = (e) => { const b = e.target.closest("button"); if (b) show(+b.dataset.i); };
    show(0);
  }

  /* ---------- Galeria + Lightbox ---------- */
  const FILTERS = ["Todos", "Funilaria", "Pintura", "Polimento", "Para-choques", "Restauração", "Antes e Depois"];
  let curFilter = "Todos", shown = [];
  const thumbOf = (w) => (w.photos && w.photos[0]) || (w.after && w.after !== "ph" ? w.after : "") || ph((w.service || "TRABALHO").toUpperCase());
  function renderGallery() {
    $("#filters").innerHTML = FILTERS.map((f) => `<button type="button" class="${f === curFilter ? "on" : ""}" data-f="${esc(f)}">${esc(f)}</button>`).join("");
    shown = DATA.works.filter((w) => curFilter === "Todos" ? true : curFilter === "Antes e Depois" ? isBA(w) : w.service === curFilter);
    $("#gallery").innerHTML = shown.map((w, i) => `<button type="button" class="gitem" data-i="${i}" style="animation-delay:${Math.min(i, 8) * 0.05}s" aria-label="Abrir ${esc(w.title)}">
      <img loading="lazy" src="${esc(thumbOf(w))}" alt="${esc(w.title)}">
      ${isBA(w) ? '<span class="gitem__tag">Antes e Depois</span>' : ""}${w.video_url ? '<span class="gitem__vid">▶ vídeo</span>' : ""}
      <span class="gitem__ov"><b>${esc(w.title)}</b><span>${esc([w.vehicle, w.service].filter(Boolean).join(" · "))}</span></span></button>`).join("");
    $("#galleryEmpty").hidden = shown.length > 0;
  }
  $("#filters").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; curFilter = b.dataset.f; renderGallery(); });
  $("#gallery").addEventListener("click", (e) => { const b = e.target.closest(".gitem"); if (b) openLB(shown[+b.dataset.i]); });

  let slides = [], sIdx = 0, curWork = null;
  function videoNode(url) {
    const yt = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/.exec(url);
    const vm = /vimeo\.com\/(\d+)/.exec(url);
    if (yt || vm) { const f = document.createElement("iframe"); f.src = yt ? "https://www.youtube-nocookie.com/embed/" + yt[1] : "https://player.vimeo.com/video/" + vm[1]; f.allowFullscreen = true; f.title = "Vídeo do trabalho"; f.loading = "lazy"; return f; }
    const v = document.createElement("video"); v.src = safeUrl(url); v.controls = true; v.playsInline = true; return v;
  }
  function openLB(w) {
    curWork = w; slides = [];
    (w.photos || []).forEach((p) => slides.push({ t: "img", src: p }));
    if (isBA(w)) slides.push({ t: "ba" });
    if (w.video_url) slides.push({ t: "video", src: w.video_url });
    if (!slides.length) slides.push({ t: "img", src: thumbOf(w) });
    sIdx = 0; $("#lb").hidden = false; document.body.style.overflow = "hidden";
    $("#lbTitle").textContent = w.title; $("#lbMeta").textContent = [w.vehicle, w.service].filter(Boolean).join(" · "); $("#lbDesc").textContent = w.description || "";
    drawSlide(); $("#lbClose").focus();
  }
  function drawSlide() {
    const m = $("#lbMedia"); m.innerHTML = ""; const s = slides[sIdx];
    if (s.t === "img") { const i = document.createElement("img"); i.src = s.src; i.alt = curWork.title; m.appendChild(i); }
    else if (s.t === "ba") { const d = document.createElement("div"); d.className = "ba"; m.appendChild(d); buildBA(d, img(curWork.before, "ANTES", "before"), img(curWork.after, "DEPOIS", "after")); }
    else m.appendChild(videoNode(s.src));
    const multi = slides.length > 1; $("#lbPrev").hidden = $("#lbNext").hidden = !multi;
  }
  const closeLB = () => { $("#lb").hidden = true; $("#lbMedia").innerHTML = ""; document.body.style.overflow = ""; };
  const stepLB = (d) => { sIdx = (sIdx + d + slides.length) % slides.length; drawSlide(); };
  $("#lbClose").onclick = closeLB; $("#lbPrev").onclick = () => stepLB(-1); $("#lbNext").onclick = () => stepLB(1);
  $("#lb").addEventListener("click", (e) => { if (e.target.id === "lb") closeLB(); });
  document.addEventListener("keydown", (e) => { if ($("#lb").hidden) return; if (e.key === "Escape") closeLB(); if (e.key === "ArrowLeft") stepLB(-1); if (e.key === "ArrowRight") stepLB(1); });

  /* ---------- Avaliações ---------- */
  function renderReviews() {
    $("#reviewsGrid").innerHTML = DATA.reviews.map((r, i) => {
      const n = Math.max(1, Math.min(5, +r.stars || 5));
      return `<article class="rcard reveal" style="--d:${(i % 3) * 0.1}s"><div class="stars" aria-label="${n} de 5 estrelas">${"★".repeat(n)}${"☆".repeat(5 - n)}</div>
      <p>“${esc(r.comment)}”</p><div class="rcard__who"><div class="avatar">${r.avatar ? `<img loading="lazy" src="${esc(r.avatar)}" alt="">` : esc((r.name || "?").trim().charAt(0).toUpperCase())}</div><b>${esc(r.name)}</b></div></article>`;
    }).join("");
  }

  /* ---------- Animações ---------- */
  function observe() {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    $$(".reveal:not(.in)").forEach((el) => io.observe(el));
    const co = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return; co.unobserve(e.target);
      const m = /^(\D*)(\d+)(\D*)$/.exec(e.target.dataset.count || ""); if (!m) return;
      const end = +m[2], t0 = performance.now(), dur = 1600;
      const tick = (t) => { const p = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - p, 3))); e.target.textContent = m[1] + v + m[3]; if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }), { threshold: 0.5 });
    $$("[data-count]").forEach((el) => co.observe(el));
  }

  /* ---------- Menu ---------- */
  function initNav() {
    const h = $("#header"), nav = $("#nav"), b = $("#burger");
    const onScroll = () => h.classList.toggle("solid", window.scrollY > 40);
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    const close = () => { nav.classList.remove("open"); b.setAttribute("aria-expanded", "false"); document.body.style.overflow = ""; };
    b.onclick = () => { const o = nav.classList.toggle("open"); b.setAttribute("aria-expanded", o); document.body.style.overflow = o ? "hidden" : ""; };
    $$("a", nav).forEach((a) => a.addEventListener("click", close));
    const links = $$('.nav a[href^="#"]:not(.btn)');
    const so = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) links.forEach((l) => l.classList.toggle("on", l.getAttribute("href") === "#" + e.target.id)); }), { rootMargin: "-45% 0px -50% 0px" });
    links.forEach((l) => { const t = $(l.getAttribute("href")); if (t) so.observe(t); });
  }

  /* ---------- Upload de fotos (UI) ---------- */
  function filePicker(dropSel, inputSel, thumbsSel) {
    const files = [], drop = $(dropSel), input = $(inputSel), th = $(thumbsSel);
    const draw = () => {
      th.innerHTML = "";
      files.forEach((f, i) => {
        const d = document.createElement("div"), im = document.createElement("img"), b = document.createElement("button");
        im.src = URL.createObjectURL(f); im.alt = f.name; b.type = "button"; b.textContent = "×"; b.setAttribute("aria-label", "Remover foto");
        b.onclick = () => { files.splice(i, 1); draw(); }; d.append(im, b); th.appendChild(d);
      });
    };
    const add = (list) => {
      for (const f of Array.from(list)) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) { toast("Formato não aceito: " + f.name); continue; }
        if (f.size > 12 * 1024 * 1024) { toast("Imagem muito grande: " + f.name); continue; }
        if (files.length >= 8) { toast("Máximo de 8 fotos."); break; }
        files.push(f);
      }
      draw();
    };
    input.addEventListener("change", () => { add(input.files); input.value = ""; });
    ["dragenter", "dragover"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("over"); }));
    ["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("over"); }));
    drop.addEventListener("drop", (e) => add(e.dataTransfer.files));
    return { files, clear() { files.length = 0; draw(); } };
  }

  /* ---------- Validação ---------- */
  const digits = (v) => String(v || "").replace(/\D/g, "");
  function validate(form, req) {
    let first = null, msg = "";
    req.forEach((n) => {
      const el = form.elements[n]; const v = (el.value || "").trim(); let bad = !v;
      if (!bad && n === "phone" && digits(v).length < 10) { bad = true; msg = "Informe um telefone/WhatsApp válido com DDD."; }
      if (!bad && n === "year" && !(/^\d{4}$/.test(v) && +v >= 1950 && +v <= new Date().getFullYear() + 1)) { bad = true; msg = "Informe um ano válido (ex.: 2018)."; }
      if (!bad && n === "name" && v.length < 3) { bad = true; msg = "Informe o nome completo."; }
      el.classList.toggle("bad", bad); if (bad && !first) { first = el; if (!msg) msg = "Preencha os campos obrigatórios."; }
    });
    const em = form.elements.email;
    if (!first && em && em.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em.value)) { em.classList.add("bad"); first = em; msg = "E-mail inválido."; }
    if (first) first.focus();
    return first ? msg : "";
  }
  const showErr = (id, m) => { const e = $(id); e.textContent = m; e.hidden = !m; };
  function antiSpam(form) {
    if (form.elements.website.value) return "silent";
    if (Date.now() - PAGE_LOAD < 4000) return "Aguarde alguns segundos e tente novamente.";
    const last = +localStorage.getItem("g617_last") || 0;
    if (Date.now() - last < 30000) return "Você acabou de enviar uma solicitação. Aguarde alguns instantes.";
    return "";
  }

  /* ---------- Agendamento ---------- */
  function initBooking() {
    const form = $("#bookForm"), dateEl = $("#bookDate"), slotsEl = $("#slots"), picker = filePicker("#bookDrop", "#bookFiles", "#bookThumbs");
    let slot = "";
    const t = todayISO(); dateEl.min = t; const mx = new Date(); mx.setDate(mx.getDate() + 90); dateEl.max = mx.toISOString().slice(0, 10);

    dateEl.addEventListener("change", async () => {
      slot = ""; const v = dateEl.value;
      if (!v) { slotsEl.innerHTML = '<p class="muted small">Escolha uma data para ver os horários.</p>'; return; }
      const [y, m, d] = v.split("-").map(Number);
      if (v < t) { slotsEl.innerHTML = '<p class="muted small">Escolha uma data a partir de hoje.</p>'; return; }
      if (G.config.CLOSED_WEEKDAYS.includes(new Date(y, m - 1, d).getDay())) { slotsEl.innerHTML = '<p class="muted small">Não atendemos neste dia. Escolha outra data.</p>'; return; }
      slotsEl.innerHTML = '<p class="muted small">Carregando horários…</p>';
      try {
        const booked = await G.bookedSlots(v); const now = new Date();
        const free = G.config.SLOTS.filter((s) => !booked.includes(s) && !(v === t && +s.slice(0, 2) * 60 + +s.slice(3) <= now.getHours() * 60 + now.getMinutes() + 30));
        slotsEl.innerHTML = free.length ? free.map((s) => `<button type="button" class="slot" role="radio" aria-checked="false" data-s="${s}">${s}</button>`).join("") : '<p class="muted small">Sem horários livres nesta data. Tente outro dia ou chame no WhatsApp.</p>';
      } catch (e) { slotsEl.innerHTML = '<p class="muted small">Não foi possível carregar os horários. Tente novamente.</p>'; }
    });
    slotsEl.addEventListener("click", (e) => {
      const b = e.target.closest(".slot"); if (!b) return; slot = b.dataset.s;
      $$(".slot", slotsEl).forEach((x) => x.setAttribute("aria-checked", x === b));
    });

    const val = () => Object.fromEntries(new FormData(form).entries());
    $("#bookReview").onclick = () => {
      let m = validate(form, ["name", "phone", "brand", "model", "year", "service", "date"]);
      if (!m && !slot) m = "Escolha um horário disponível.";
      showErr("#bookErr", m); if (m) return;
      const v = val();
      $("#bookSummary").innerHTML = [["Cliente", v.name], ["Veículo", `${v.brand} ${v.model} (${v.year})${v.plate ? " — " + v.plate.toUpperCase() : ""}`], ["Serviço", v.service], ["Data", fmtDate(v.date)], ["Horário", slot], ["Telefone", v.phone]]
        .map(([k, x]) => `<dt>${k}</dt><dd>${esc(x)}</dd>`).join("");
      $("#bookStep1").hidden = true; $("#bookStep2").hidden = false; $("#bookSummary").scrollIntoView({ behavior: "smooth", block: "center" });
    };
    $("#bookBack").onclick = () => { $("#bookStep2").hidden = true; $("#bookStep1").hidden = false; };
    form.addEventListener("submit", async (e) => {
      e.preventDefault(); showErr("#bookErr2", "");
      const sp = antiSpam(form); if (sp === "silent") return finish(); if (sp) return showErr("#bookErr2", sp);
      const v = val(), btn = $("#bookConfirm"); btn.disabled = true; btn.textContent = "ENVIANDO…";
      try {
        const photos = await G.uploadPrivate(picker.files);
        await G.createBooking({ name: v.name.trim(), phone: v.phone.trim(), email: (v.email || "").trim(), brand: v.brand.trim(), model: v.model.trim(), year: v.year, plate: (v.plate || "").toUpperCase().trim(), service: v.service, date: v.date, time: slot, description: (v.description || "").trim(), photos });
        localStorage.setItem("g617_last", Date.now()); finish(v);
      } catch (err) {
        showErr("#bookErr2", err.message || "Erro ao enviar. Tente novamente.");
        if (/horário/i.test(err.message)) { $("#bookStep2").hidden = true; $("#bookStep1").hidden = false; dateEl.dispatchEvent(new Event("change")); }
      } finally { btn.disabled = false; btn.textContent = "CONFIRMAR AGENDAMENTO"; }
    });
    function finish(v) {
      v = v || val(); $("#bookStep2").hidden = true; $("#bookDone").hidden = false;
      $("#bookWa").href = waLink(`Olá, vim pelo site da Garagem 617 e acabei de agendar: ${v.service}, dia ${fmtDate(v.date)} às ${slot}. Veículo: ${v.brand} ${v.model} ${v.year}. Nome: ${v.name}.`);
      $("#bookDone").scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  /* ---------- Orçamento ---------- */
  function initQuote() {
    const form = $("#quoteForm"), picker = filePicker("#quoteDrop", "#quoteFiles", "#quoteThumbs");
    form.addEventListener("submit", async (e) => {
      e.preventDefault(); const m = validate(form, ["name", "phone", "vehicle", "year", "service"]); showErr("#quoteErr", m); if (m) return;
      const sp = antiSpam(form); if (sp === "silent") return done(); if (sp) return showErr("#quoteErr", sp);
      const v = Object.fromEntries(new FormData(form).entries()), btn = $("#quoteBtn"); btn.disabled = true; btn.textContent = "ENVIANDO…";
      try {
        const photos = await G.uploadPrivate(picker.files);
        await G.createQuote({ name: v.name.trim(), phone: v.phone.trim(), vehicle: v.vehicle.trim(), year: v.year, service: v.service, description: (v.description || "").trim(), photos });
        localStorage.setItem("g617_last", Date.now()); done(v);
      } catch (err) { showErr("#quoteErr", err.message || "Erro ao enviar. Tente novamente."); }
      finally { btn.disabled = false; btn.textContent = "SOLICITAR ORÇAMENTO"; }
    });
    function done(v) {
      v = v || {}; $("#quoteFields").hidden = true; $("#quoteDone").hidden = false;
      $("#quoteWa").href = waLink(`Olá, vim pelo site da Garagem 617 e acabei de enviar um pedido de orçamento${v.service ? " para " + v.service.toLowerCase() : ""}${v.vehicle ? " (" + v.vehicle + ")" : ""}.`);
      $("#quoteDone").scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  /* ---------- Início ---------- */
  async function init() {
    initNav();
    try { [S, DATA] = await Promise.all([G.getSettings(), G.listPublic()]); }
    catch (e) { console.error(e); S = await G.getSettings().catch(() => ({})); toast("Alguns dados não puderam ser carregados."); }
    applySettings(); renderServices(); renderBA(); renderGallery(); renderReviews();
    initBooking(); initQuote(); observe();
    if (!G.LIVE) console.info("GARAGEM 617: modo demonstração (Supabase não configurado).");
  }
  init();
})();
