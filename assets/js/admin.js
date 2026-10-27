/* ============ GARAGEM 617 — painel administrativo ============ */
(function () {
  const G = window.G617;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (u) => (/^https?:\/\//i.test(u || "") || /^data:image\//.test(u || "") ? u : "#");
  const ST = { pendente: "Pendente", confirmado: "Confirmado", em_atendimento: "Em atendimento", finalizado: "Finalizado", cancelado: "Cancelado" };
  const SERVICE_OPTS = ["Funilaria", "Pintura", "Polimento", "Martelinho de Ouro", "Para-choques", "Retoque", "Restauração", "Orçamento", "Outro"];
  const ICON_OPTS = { hammer: "Martelo", spray: "Spray", bumper: "Carro/para-choque", sparkle: "Brilho", dent: "Alvo", brush: "Pincel", wrench: "Chave", clipboard: "Prancheta" };
  const TITLES = { dashboard: "Dashboard", appointments: "Agendamentos", quotes: "Orçamentos", services: "Serviços", works: "Trabalhos", reviews: "Avaliações", site: "Site e contato" };
  const fmtDate = (iso) => { if (!iso) return ""; const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}`; };
  const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const todayISO = () => iso(new Date());
  const hhmm = (t) => String(t || "").slice(0, 5);
  const digits = (v) => String(v || "").replace(/\D/g, "");

  let tab = "dashboard", appts = [], quotes = [], S = {}, calMonth = new Date(), calSel = todayISO(), apptFilter = "todos";

  function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), 3200); }
  const fail = (e) => { console.error(e); toast("Erro: " + (e.message || e)); };

  /* ---------- Modal ---------- */
  function openModal(html) { $("#modalBody").innerHTML = html; $("#modal").hidden = false; document.body.style.overflow = "hidden"; }
  function closeModal() { $("#modal").hidden = true; $("#modalBody").innerHTML = ""; document.body.style.overflow = ""; }
  $("#modalX").onclick = closeModal;
  $("#modal").addEventListener("mousedown", (e) => { if (e.target.id === "modal") closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#modal").hidden) closeModal(); });

  /* ---------- Login ---------- */
  async function boot() {
    if (!G.LIVE) { $("#demoBanner").hidden = false; const h = $("#demoHint"); h.hidden = false; h.innerHTML = `Modo demonstração.<br>E-mail: <b>${esc(G.config.DEMO_ADMIN_EMAIL)}</b><br>Senha: <b>${esc(G.config.DEMO_ADMIN_PASSWORD)}</b>`; }
    if (await G.isLogged()) enter();
  }
  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault(); const f = e.target, err = $("#loginErr"), b = f.querySelector("button"); err.hidden = true; b.disabled = true;
    try { await G.login(f.elements.email.value.trim(), f.elements.password.value); f.elements.password.value = ""; enter(); }
    catch (x) { err.textContent = x.message; err.hidden = false; } finally { b.disabled = false; }
  });
  $("#logoutBtn").onclick = async () => { await G.logout(); location.reload(); };
  async function enter() {
    $("#login").hidden = true; $("#app").hidden = false;
    try {
      S = await G.getSettings();
      if (G.LIVE && !S.seeded) { await G.seedIfEmpty(); await G.saveSettings({ seeded: true }); S.seeded = true; }
    } catch (e) { fail(e); }
    go("dashboard");
  }

  /* ---------- Navegação ---------- */
  $("#sideNav").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { go(b.dataset.tab); closeSide(); } });
  const closeSide = () => { $("#side").classList.remove("open"); $("#admBurger").setAttribute("aria-expanded", "false"); };
  $("#admBurger").onclick = () => { const o = $("#side").classList.toggle("open"); $("#admBurger").setAttribute("aria-expanded", o); };
  async function go(t) {
    tab = t; $("#tabTitle").textContent = TITLES[t];
    $$("#sideNav button").forEach((b) => b.classList.toggle("on", b.dataset.tab === t));
    $("#view").innerHTML = '<p class="empty">Carregando…</p>';
    try { await VIEWS[t](); await badges(); } catch (e) { fail(e); $("#view").innerHTML = '<p class="empty">Não foi possível carregar. ' + esc(e.message || "") + "</p>"; }
  }
  async function badges() {
    const [a, q] = await Promise.all([G.adminList("appointments"), G.adminList("quotes")]);
    appts = a; quotes = q;
    const pa = a.filter((x) => x.status === "pendente").length, pq = q.filter((x) => x.status === "pendente").length;
    $$("#sideNav .badge").forEach((n) => n.remove());
    const add = (t, n) => { if (n) $(`#sideNav [data-tab=${t}]`).insertAdjacentHTML("beforeend", `<span class="badge">${n}</span>`); };
    add("appointments", pa); add("quotes", pq);
  }

  /* ---------- Helpers de UI ---------- */
  const stBadge = (s) => `<span class="st st--${esc(s)}">${esc(ST[s] || (s === "respondido" ? "Respondido" : s))}</span>`;
  const waTo = (phone, msg) => "https://wa.me/" + (digits(phone).length <= 11 ? "55" : "") + digits(phone) + "?text=" + encodeURIComponent(msg || "");

  // seletor de imagens (envia ao armazenamento ao escolher)
  function imgInput(host, opts) {
    let vals = (opts.values || []).filter(Boolean);
    const wrap = document.createElement("div"); wrap.className = "up";
    const th = document.createElement("div"); th.className = "thumbs";
    const lab = document.createElement("label"); lab.className = "mini"; lab.style.cssText = "display:inline-flex;align-items:center;cursor:pointer";
    lab.textContent = opts.multiple ? "+ Adicionar fotos" : vals.length ? "Trocar foto" : "+ Escolher foto";
    const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/jpeg,image/png,image/webp"; inp.hidden = true; inp.multiple = !!opts.multiple; lab.appendChild(inp);
    const draw = () => {
      th.innerHTML = "";
      vals.forEach((v, i) => {
        const d = document.createElement("div"), im = document.createElement("img"), b = document.createElement("button");
        im.src = v === "ph" ? G.placeholder("EXEMPLO") : (/^assets\//.test(v) ? "../" + v : v); im.alt = ""; b.type = "button"; b.textContent = "×"; b.title = "Remover";
        b.onclick = () => { vals.splice(i, 1); draw(); }; d.append(im, b); th.appendChild(d);
      });
      lab.firstChild.textContent = opts.multiple ? "+ Adicionar fotos" : vals.length ? "Trocar foto" : "+ Escolher foto";
    };
    inp.onchange = async () => {
      const list = Array.from(inp.files); inp.value = ""; if (!list.length) return;
      toast("Enviando imagem…");
      try { for (const f of list) { const u = await G.uploadPublic(f); if (opts.multiple) { if (vals.length < (opts.max || 12)) vals.push(u); } else vals = [u]; } draw(); toast("Imagem pronta. Lembre de salvar."); }
      catch (e) { fail(e); }
    };
    wrap.append(lab, th); host.appendChild(wrap); draw();
    return { get: () => (opts.multiple ? vals.slice() : vals[0] || "") };
  }
  const field = (label, html, cls) => `<label class="f ${cls || ""}">${label}${html}</label>`;
  const sel = (name, list, cur) => `<select name="${name}">${list.map((o) => `<option ${o === cur ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>`;

  /* ============================ VIEWS ============================ */
  const VIEWS = {
    /* ---------- DASHBOARD ---------- */
    async dashboard() {
      await badges();
      const t = todayISO(), act = appts.filter((a) => a.status !== "cancelado");
      const clients = await G.clientCount();
      const k = [
        ["Agendamentos Hoje", act.filter((a) => a.date === t).length, "o"],
        ["Agendamentos Pendentes", appts.filter((a) => a.status === "pendente").length, "y"],
        ["Agendamentos Confirmados", appts.filter((a) => a.status === "confirmado").length, "g"],
        ["Orçamentos Pendentes", quotes.filter((q) => q.status === "pendente").length, "b"],
        ["Total de Clientes", clients, "w"]
      ];
      $("#view").innerHTML = `<div class="kpis">${k.map(([l, n, c]) => `<div class="kpi kpi--${c}"><b>${n}</b><span>${l}</span></div>`).join("")}</div>
        <div class="panel"><div class="panel__head"><h2>Calendário</h2>
          <div class="cal__nav"><button class="mini" id="calPrev" aria-label="Mês anterior">‹</button><h3 id="calTitle"></h3><button class="mini" id="calNext" aria-label="Próximo mês">›</button><button class="mini" id="calToday">Hoje</button></div></div>
          <div class="cal" id="cal"></div>
          <div class="legend"><span>🟡 Pendente</span><span>🟢 Confirmado</span><span>🔵 Em atendimento</span><span>⚫ Finalizado</span><span>🔴 Cancelado</span></div></div>
        <div class="panel"><h2 id="dayTitle"></h2><ul class="dayl" id="dayList"></ul></div>`;
      $("#calPrev").onclick = () => { calMonth.setMonth(calMonth.getMonth() - 1); drawCal(); };
      $("#calNext").onclick = () => { calMonth.setMonth(calMonth.getMonth() + 1); drawCal(); };
      $("#calToday").onclick = () => { calMonth = new Date(); calSel = todayISO(); drawCal(); };
      drawCal();
    },

    /* ---------- AGENDAMENTOS ---------- */
    async appointments() {
      appts = await G.adminList("appointments");
      const list = appts.filter((a) => apptFilter === "todos" || a.status === apptFilter).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
      $("#view").innerHTML = `<div class="panel"><div class="panel__head"><h2>Agendamentos</h2><div class="tools"><select id="apFilter"><option value="todos">Todos os status</option>${Object.keys(ST).map((s) => `<option value="${s}" ${apptFilter === s ? "selected" : ""}>${ST[s]}</option>`).join("")}</select></div></div>
        ${list.length ? `<table class="tbl"><thead><tr><th>Data / hora</th><th>Cliente</th><th>Veículo</th><th>Serviço</th><th>Status</th><th></th></tr></thead><tbody>${list.map((a) => `<tr>
          <td><b>${fmtDate(a.date)}</b><br><small>${hhmm(a.time)}</small></td>
          <td>${esc(a.clients?.name)}<br><small>${esc(a.clients?.phone)}</small></td>
          <td>${esc([a.vehicles?.brand, a.vehicles?.model].filter(Boolean).join(" "))}<br><small>${esc(a.vehicles?.year)}</small></td>
          <td>${esc(a.service)}</td><td>${stBadge(a.status)}</td>
          <td><div class="act">
            <button class="mini" data-ap="view" data-id="${a.id}">Detalhes</button>
            ${a.status === "pendente" ? `<button class="mini mini--ok" data-ap="confirm" data-id="${a.id}">Confirmar</button>` : ""}
            ${a.status !== "cancelado" && a.status !== "finalizado" ? `<button class="mini mini--bad" data-ap="cancel" data-id="${a.id}">Cancelar</button>` : ""}
          </div></td></tr>`).join("")}</tbody></table>` : '<p class="empty">Nenhum agendamento encontrado.</p>'}</div>`;
      $("#apFilter").onchange = (e) => { apptFilter = e.target.value; VIEWS.appointments(); };
    },

    /* ---------- ORÇAMENTOS ---------- */
    async quotes() {
      quotes = await G.adminList("quotes");
      $("#view").innerHTML = `<div class="panel"><h2>Pedidos de orçamento</h2>${quotes.length ? `<table class="tbl"><thead><tr><th>Recebido</th><th>Cliente</th><th>Veículo</th><th>Serviço</th><th>Status</th><th></th></tr></thead><tbody>${quotes.map((q) => `<tr>
        <td>${fmtDate((q.created_at || "").slice(0, 10))}</td>
        <td>${esc(q.clients?.name)}<br><small>${esc(q.clients?.phone)}</small></td>
        <td>${esc([q.vehicles?.brand, q.vehicles?.model].filter(Boolean).join(" "))}<br><small>${esc(q.vehicles?.year)}</small></td>
        <td>${esc(q.service)}</td><td>${stBadge(q.status)}</td>
        <td><div class="act"><button class="mini" data-q="view" data-id="${q.id}">Detalhes</button>
        ${q.status === "pendente" ? `<button class="mini mini--ok" data-q="done" data-id="${q.id}">Marcar respondido</button>` : `<button class="mini" data-q="undo" data-id="${q.id}">Reabrir</button>`}</div></td></tr>`).join("")}</tbody></table>` : '<p class="empty">Nenhum pedido de orçamento ainda.</p>'}</div>`;
    },

    /* ---------- SERVIÇOS ---------- */
    async services() {
      let list = await G.list("services"); list.sort((a, b) => (a.position || 99) - (b.position || 99));
      $("#view").innerHTML = `<div class="panel"><div class="panel__head"><h2>Serviços do site</h2><button class="btn btn--sm" data-sv="new">+ NOVO SERVIÇO</button></div>
        ${list.length ? `<table class="tbl"><thead><tr><th>#</th><th>Serviço</th><th>Descrição</th><th></th></tr></thead><tbody>${list.map((s) => `<tr><td>${s.position || ""}</td><td><b>${esc(s.title)}</b><br><small>${esc(s.category)}</small></td><td>${esc(s.description)}</td>
        <td><div class="act"><button class="mini" data-sv="edit" data-id="${s.id}">Editar</button><button class="mini mini--bad" data-sv="del" data-id="${s.id}">Excluir</button></div></td></tr>`).join("")}</tbody></table>` : '<p class="empty">Nenhum serviço cadastrado.</p>'}</div>`;
      VIEWS._services = list;
    },

    /* ---------- TRABALHOS ---------- */
    async works() {
      const list = await G.list("works"); VIEWS._works = list;
      $("#view").innerHTML = `<div class="panel"><div class="panel__head"><h2>Trabalhos e Antes/Depois</h2><button class="btn btn--sm" data-wk="new">+ NOVO TRABALHO</button></div>
        ${list.length ? `<table class="tbl"><thead><tr><th></th><th>Título</th><th>Serviço</th><th>Tipo</th><th></th></tr></thead><tbody>${list.map((w) => `<tr>
        <td><img class="thumb-s" src="${esc((((w.photos && w.photos[0]) || (w.after && w.after !== "ph" ? w.after : "") || G.placeholder("EXEMPLO"))).replace(/^assets\//, "../assets/"))}" alt=""></td>
        <td><b>${esc(w.title)}</b><br><small>${esc(w.vehicle)}</small></td><td>${esc(w.service)}</td>
        <td>${w.ba || (w.before && w.after) ? "Antes e Depois" : "Foto"}${w.video_url ? " + vídeo" : ""}</td>
        <td><div class="act"><button class="mini" data-wk="edit" data-id="${w.id}">Editar</button><button class="mini mini--bad" data-wk="del" data-id="${w.id}">Excluir</button></div></td></tr>`).join("")}</tbody></table>` : '<p class="empty">Nenhum trabalho cadastrado.</p>'}</div>`;
    },

    /* ---------- AVALIAÇÕES ---------- */
    async reviews() {
      const list = await G.list("reviews"); VIEWS._reviews = list;
      $("#view").innerHTML = `<div class="panel"><div class="panel__head"><h2>Avaliações de clientes</h2><button class="btn btn--sm" data-rv="new">+ NOVA AVALIAÇÃO</button></div>
        ${list.length ? `<table class="tbl"><thead><tr><th>Cliente</th><th>Estrelas</th><th>Comentário</th><th></th></tr></thead><tbody>${list.map((r) => `<tr><td><b>${esc(r.name)}</b></td><td style="color:#ffb020">${"★".repeat(r.stars || 5)}</td><td>${esc(r.comment)}</td>
        <td><div class="act"><button class="mini" data-rv="edit" data-id="${r.id}">Editar</button><button class="mini mini--bad" data-rv="del" data-id="${r.id}">Remover</button></div></td></tr>`).join("")}</tbody></table>` : '<p class="empty">Nenhuma avaliação cadastrada.</p>'}</div>
        <p class="hint">Para exibir um botão “Ver avaliações no Google”, informe o link na aba <b>Site e contato</b>.</p>`;
    },

    /* ---------- SITE ---------- */
    async site() {
      S = await G.getSettings();
      const T = (n, l, rows) => field(l, rows ? `<textarea name="${n}" rows="${rows}">${esc(S[n])}</textarea>` : `<input name="${n}" value="${esc(S[n])}">`, rows ? "f--full" : "");
      $("#view").innerHTML = `<form id="siteForm" class="panel">
        <h2 class="sub" style="margin-top:0">Contato</h2>
        <div class="fgrid3">${T("phone", "Telefone (como será exibido)")}${T("whatsapp", "WhatsApp — só números com DDI+DDD (ex.: 5511999999999)")}${T("whatsapp_display", "WhatsApp (como será exibido)")}${T("email", "E-mail")}</div>
        <div class="fgrid3">${T("address", "Endereço completo", 2)}${T("map_query", "Endereço para o mapa (opcional; se vazio usa o endereço acima)", 2)}${T("hours", "Horário de funcionamento (uma linha por período)", 4)}</div>
        <h2 class="sub">Redes sociais</h2>
        <div class="fgrid3">${T("instagram", "Link do Instagram (https://…)")}${T("facebook", "Link do Facebook (https://…)")}${T("tiktok", "Link do TikTok (https://…)")}${T("reviews_google_url", "Link das avaliações no Google (https://…)")}</div>
        <div class="f f--full"><span class="lbl">Publicações do Instagram (até 6 imagens)</span><div id="igHost"></div></div>
        <h2 class="sub">Textos da página inicial</h2>
        <div class="fgrid3">${T("hero_title", "Título principal", 2)}${T("hero_subtitle", "Subtítulo", 3)}</div>
        <div class="f f--full"><span class="lbl">Imagem de fundo do topo (carro na oficina)</span><div id="heroHost"></div><span class="hint">Use uma foto horizontal, de pelo menos 1600 px de largura.</span></div>
        <h2 class="sub">Sobre a Garagem 617</h2>
        <div class="fgrid3">${T("about_title", "Título")}${T("about_text", "Texto", 5)}</div>
        <div class="f f--full"><span class="lbl">Imagens (oficina, equipe, carro em reparo — nessa ordem, 3 fotos)</span><div id="aboutHost"></div></div>
        <h2 class="sub">Indicadores (números animados)</h2>
        <p class="hint" style="margin-bottom:10px">Escreva o número com o símbolo que quiser, ex.: <b>+500</b>, <b>+10</b>, <b>98%</b>.</p>
        <div class="fgrid3">${[1, 2, 3].map((i) => T("stat" + i + "_value", "Número " + i) + T("stat" + i + "_label", "Legenda " + i)).join("")}</div>
        <p class="err" id="siteErr" hidden></p>
        <button class="btn" type="submit">SALVAR ALTERAÇÕES</button></form>`;
      const ig = imgInput($("#igHost"), { multiple: true, max: 6, values: S.instagram_posts || [] });
      const hero = imgInput($("#heroHost"), { values: S.hero_image ? [S.hero_image] : [] });
      const about = imgInput($("#aboutHost"), { multiple: true, max: 3, values: S.about_images || [] });
      $("#siteForm").onsubmit = async (e) => {
        e.preventDefault(); const f = e.target, o = {};
        $$("input[name],textarea[name]", f).forEach((el) => { o[el.name] = el.value.trim(); });
        o.whatsapp = digits(o.whatsapp);
        for (const k of ["instagram", "facebook", "tiktok", "reviews_google_url"]) if (o[k] && !/^https?:\/\//i.test(o[k])) { const m = $("#siteErr"); m.textContent = "O link de " + k + " deve começar com https://"; m.hidden = false; return; }
        $("#siteErr").hidden = true;
        o.instagram_posts = ig.get(); o.hero_image = hero.get(); o.about_images = about.get();
        try { await G.saveSettings(o); toast("Alterações salvas!"); } catch (x) { fail(x); }
      };
    }
  };

  /* ---------- Calendário ---------- */
  function drawCal() {
    const y = calMonth.getFullYear(), m = calMonth.getMonth(), first = new Date(y, m, 1), start = new Date(y, m, 1 - first.getDay());
    $("#calTitle").textContent = first.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    const by = {}; appts.forEach((a) => (by[a.date] = (by[a.date] || []).concat(a)));
    let h = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => `<div class="cal__dow">${d}</div>`).join("");
    for (let i = 0; i < 42; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i); const k = iso(d), arr = by[k] || [];
      h += `<button type="button" class="cal__d ${d.getMonth() !== m ? "out" : ""} ${k === todayISO() ? "today" : ""} ${k === calSel ? "sel" : ""}" data-day="${k}"><b>${d.getDate()}</b><span class="dots">${arr.slice(0, 8).map((a) => `<i class="dot dot--${a.status}"></i>`).join("")}</span></button>`;
    }
    $("#cal").innerHTML = h; drawDay();
  }
  function drawDay() {
    const arr = appts.filter((a) => a.date === calSel).sort((a, b) => a.time.localeCompare(b.time));
    $("#dayTitle").textContent = "Agenda de " + fmtDate(calSel);
    $("#dayList").innerHTML = arr.length ? arr.map((a) => `<li><b>${hhmm(a.time)}</b>${stBadge(a.status)}<span>${esc(a.clients?.name)} — ${esc([a.vehicles?.brand, a.vehicles?.model].filter(Boolean).join(" "))} · ${esc(a.service)}</span><button class="mini" data-ap="view" data-id="${a.id}" style="margin-left:auto">Detalhes</button></li>`).join("") : '<li class="muted">Nenhum agendamento neste dia.</li>';
  }

  /* ---------- Detalhes de agendamento / orçamento ---------- */
  async function photosHtml(refs) {
    if (!refs || !refs.length) return '<p class="hint" style="margin-bottom:16px">Nenhuma foto enviada.</p>';
    const urls = await Promise.all(refs.map((r) => G.resolvePrivate(r)));
    return `<div class="photos">${urls.map((u) => `<a href="${esc(safeUrl(u))}" target="_blank" rel="noopener"><img loading="lazy" src="${esc(safeUrl(u))}" alt="Foto enviada pelo cliente"></a>`).join("")}</div>`;
  }
  async function showAppt(id) {
    const a = appts.find((x) => x.id === id); if (!a) return;
    const c = a.clients || {}, v = a.vehicles || {};
    openModal(`<h2>Agendamento</h2>${stBadge(a.status)}
      <dl class="kv" style="margin-top:14px"><dt>Cliente</dt><dd>${esc(c.name)}</dd><dt>Telefone</dt><dd>${esc(c.phone)}</dd><dt>E-mail</dt><dd>${esc(c.email || "—")}</dd>
      <dt>Veículo</dt><dd>${esc([v.brand, v.model, v.year].filter(Boolean).join(" "))}</dd><dt>Placa</dt><dd>${esc(v.plate || "—")}</dd>
      <dt>Serviço</dt><dd>${esc(a.service)}</dd><dt>Data</dt><dd>${fmtDate(a.date)}</dd><dt>Horário</dt><dd>${hhmm(a.time)}</dd>
      <dt>Descrição</dt><dd>${esc(a.description || "—")}</dd></dl>
      <div id="mPhotos"><p class="hint">Carregando fotos…</p></div>
      <h3 class="sub" style="margin-top:6px">Alterar horário</h3>
      <div class="fgrid3"><label class="f">Nova data<input type="date" id="rsDate" value="${a.date}" min="${todayISO()}"></label><div class="f"><span class="lbl">Novo horário</span><select id="rsTime"></select></div></div>
      <div class="mact"><button class="btn btn--sm" id="rsSave">SALVAR NOVO HORÁRIO</button></div>
      <h3 class="sub">Status</h3>
      <div class="mact">
        <button class="btn btn--sm" data-set="confirmado">CONFIRMAR</button>
        <button class="btn btn--sm" style="--c:#3b9cff" data-set="em_atendimento">EM ATENDIMENTO</button>
        <button class="btn btn--sm" style="--c:#555" data-set="finalizado">FINALIZAR</button>
        <button class="btn btn--sm btn--ghost" data-set="cancelado">CANCELAR</button>
        <a class="btn btn--sm btn--wa" target="_blank" rel="noopener" href="${esc(waTo(c.phone, `Olá ${c.name}, aqui é da Garagem 617 sobre o seu agendamento de ${a.service} em ${fmtDate(a.date)} às ${hhmm(a.time)}.`))}">WHATSAPP</a>
      </div>`);
    photosHtml(a.photos).then((h) => { const m = $("#mPhotos"); if (m) m.innerHTML = h; });
    const fillTimes = async () => {
      const d = $("#rsDate").value, s = $("#rsTime"); s.innerHTML = "";
      const booked = d ? (await G.bookedSlots(d)).filter((t) => !(d === a.date && t === hhmm(a.time))) : [];
      G.config.SLOTS.filter((t) => !booked.includes(t)).forEach((t) => s.insertAdjacentHTML("beforeend", `<option ${d === a.date && t === hhmm(a.time) ? "selected" : ""}>${t}</option>`));
    };
    fillTimes(); $("#rsDate").onchange = fillTimes;
    $("#rsSave").onclick = async () => { try { await G.adminUpdate("appointments", a.id, { date: $("#rsDate").value, time: $("#rsTime").value }); toast("Horário alterado."); closeModal(); go(tab); } catch (e) { fail(e); } };
    $$("[data-set]", $("#modalBody")).forEach((b) => (b.onclick = async () => { try { await G.adminUpdate("appointments", a.id, { status: b.dataset.set }); toast("Status atualizado."); closeModal(); go(tab); } catch (e) { fail(e); } }));
  }
  async function showQuote(id) {
    const q = quotes.find((x) => x.id === id); if (!q) return; const c = q.clients || {}, v = q.vehicles || {};
    openModal(`<h2>Pedido de orçamento</h2>${stBadge(q.status)}
      <dl class="kv" style="margin-top:14px"><dt>Cliente</dt><dd>${esc(c.name)}</dd><dt>WhatsApp</dt><dd>${esc(c.whatsapp || c.phone)}</dd><dt>Veículo</dt><dd>${esc([v.brand, v.model].filter(Boolean).join(" "))}</dd><dt>Ano</dt><dd>${esc(v.year)}</dd>
      <dt>Serviço</dt><dd>${esc(q.service)}</dd><dt>Recebido em</dt><dd>${fmtDate((q.created_at || "").slice(0, 10))}</dd><dt>Descrição</dt><dd>${esc(q.description || "—")}</dd></dl>
      <div id="mPhotos"><p class="hint">Carregando fotos…</p></div>
      <div class="mact"><a class="btn btn--sm btn--wa" target="_blank" rel="noopener" href="${esc(waTo(c.whatsapp || c.phone, `Olá ${c.name}, aqui é da Garagem 617. Recebemos seu pedido de orçamento.`))}">RESPONDER NO WHATSAPP</a>
      <button class="btn btn--sm" id="qToggle">${q.status === "pendente" ? "MARCAR COMO RESPONDIDO" : "REABRIR"}</button></div>`);
    photosHtml(q.photos).then((h) => { const m = $("#mPhotos"); if (m) m.innerHTML = h; });
    $("#qToggle").onclick = async () => { try { await G.adminUpdate("quotes", q.id, { status: q.status === "pendente" ? "respondido" : "pendente" }); closeModal(); go(tab); } catch (e) { fail(e); } };
  }

  /* ---------- Formulários de cadastro ---------- */
  function serviceForm(s) {
    s = s || { title: "", description: "", icon: "wrench", category: "Funilaria", position: 99 };
    openModal(`<h2>${s.id ? "Editar" : "Novo"} serviço</h2><form id="mForm"><div class="fgrid3">
      ${field("Nome do serviço *", `<input name="title" required maxlength="80" value="${esc(s.title)}">`)}
      ${field("Categoria (usada na mensagem do WhatsApp)", sel("category", SERVICE_OPTS, s.category))}
      ${field("Ícone", `<select name="icon">${Object.entries(ICON_OPTS).map(([k, n]) => `<option value="${k}" ${k === s.icon ? "selected" : ""}>${n}</option>`).join("")}</select>`)}
      ${field("Ordem de exibição", `<input name="position" type="number" min="1" value="${esc(s.position || 99)}">`)}
      ${field("Descrição *", `<textarea name="description" required rows="3" maxlength="300">${esc(s.description)}</textarea>`, "f--full")}</div>
      <button class="btn" type="submit">SALVAR</button></form>`);
    $("#mForm").onsubmit = async (e) => { e.preventDefault(); const f = e.target; try { await G.upsert("services", Object.assign({}, s, { title: f.elements.title.value.trim(), category: f.elements.category.value, icon: f.elements.icon.value, position: +f.elements.position.value || 99, description: f.elements.description.value.trim() })); toast("Serviço salvo."); closeModal(); go("services"); } catch (x) { fail(x); } };
  }
  function workForm(w) {
    w = w || { title: "", vehicle: "", service: "Funilaria", description: "", photos: [], before: "", after: "", video_url: "", ba: false };
    openModal(`<h2>${w.id ? "Editar" : "Novo"} trabalho</h2><form id="mForm"><div class="fgrid3">
      ${field("Título *", `<input name="title" required maxlength="100" value="${esc(w.title)}">`)}
      ${field("Modelo do veículo", `<input name="vehicle" maxlength="100" value="${esc(w.vehicle)}">`)}
      ${field("Serviço realizado", sel("service", SERVICE_OPTS.filter((x) => x !== "Orçamento"), w.service))}
      ${field("Link de vídeo (YouTube, Vimeo ou .mp4) — opcional", `<input name="video_url" type="url" placeholder="https://…" value="${esc(w.video_url || "")}">`)}
      ${field("Descrição", `<textarea name="description" rows="3" maxlength="500">${esc(w.description)}</textarea>`, "f--full")}</div>
      <div class="f f--full" style="margin-bottom:16px"><span class="lbl">Fotos do trabalho</span><div id="wPhotos"></div></div>
      <h3 class="sub">Antes e Depois (opcional)</h3>
      <div class="fgrid3"><div class="f"><span class="lbl">Foto ANTES</span><div id="wBefore"></div></div><div class="f"><span class="lbl">Foto DEPOIS</span><div id="wAfter"></div></div></div>
      <label class="chk"><input type="checkbox" name="ba" ${w.ba || (w.before && w.after) ? "checked" : ""}> Exibir na seção “Veja a transformação”</label>
      <p class="err" id="wErr" hidden></p><button class="btn" type="submit" style="margin-top:14px">SALVAR</button></form>`);
    const ph = imgInput($("#wPhotos"), { multiple: true, values: w.photos || [] });
    const bf = imgInput($("#wBefore"), { values: w.before ? [w.before] : [] }), af = imgInput($("#wAfter"), { values: w.after ? [w.after] : [] });
    $("#mForm").onsubmit = async (e) => {
      e.preventDefault(); const f = e.target;
      if (f.elements.video_url.value && !/^https?:\/\//i.test(f.elements.video_url.value)) { $("#wErr").textContent = "O link do vídeo deve começar com https://"; $("#wErr").hidden = false; return; }
      const row = Object.assign({}, w, { title: f.elements.title.value.trim(), vehicle: f.elements.vehicle.value.trim(), service: f.elements.service.value, description: f.elements.description.value.trim(), video_url: f.elements.video_url.value.trim(), photos: ph.get(), before: bf.get(), after: af.get(), ba: f.elements.ba.checked });
      try { await G.upsert("works", row); toast("Trabalho salvo."); closeModal(); go("works"); } catch (x) { fail(x); }
    };
  }
  function reviewForm(r) {
    r = r || { name: "", stars: 5, comment: "", avatar: "" };
    openModal(`<h2>${r.id ? "Editar" : "Nova"} avaliação</h2><form id="mForm"><div class="fgrid3">
      ${field("Nome do cliente *", `<input name="name" required maxlength="80" value="${esc(r.name)}">`)}
      ${field("Estrelas", `<select name="stars">${[5, 4, 3, 2, 1].map((n) => `<option value="${n}" ${n === r.stars ? "selected" : ""}>${"★".repeat(n)} (${n})</option>`).join("")}</select>`)}
      ${field("Comentário *", `<textarea name="comment" required rows="4" maxlength="500">${esc(r.comment)}</textarea>`, "f--full")}</div>
      <div class="f f--full" style="margin-bottom:16px"><span class="lbl">Foto/avatar (opcional)</span><div id="rvAv"></div></div>
      <button class="btn" type="submit">SALVAR</button></form>`);
    const av = imgInput($("#rvAv"), { values: r.avatar ? [r.avatar] : [] });
    $("#mForm").onsubmit = async (e) => { e.preventDefault(); const f = e.target; try { await G.upsert("reviews", Object.assign({}, r, { name: f.elements.name.value.trim(), stars: +f.elements.stars.value, comment: f.elements.comment.value.trim(), avatar: av.get() })); toast("Avaliação salva."); closeModal(); go("reviews"); } catch (x) { fail(x); } };
  }

  /* ---------- Cliques (delegação) ---------- */
  document.addEventListener("click", async (e) => {
    const day = e.target.closest("[data-day]"); if (day) { calSel = day.dataset.day; drawCal(); return; }
    const t = e.target.closest("[data-ap],[data-q],[data-sv],[data-wk],[data-rv]"); if (!t) return;
    const id = t.dataset.id;
    try {
      if (t.dataset.ap) {
        if (t.dataset.ap === "view") return showAppt(id);
        const st = t.dataset.ap === "confirm" ? "confirmado" : "cancelado";
        if (st === "cancelado" && !confirm("Cancelar este agendamento? O horário voltará a ficar livre.")) return;
        await G.adminUpdate("appointments", id, { status: st }); toast("Agendamento " + ST[st].toLowerCase() + "."); return go(tab);
      }
      if (t.dataset.q) {
        if (t.dataset.q === "view") return showQuote(id);
        await G.adminUpdate("quotes", id, { status: t.dataset.q === "done" ? "respondido" : "pendente" }); return go("quotes");
      }
      if (t.dataset.sv) {
        if (t.dataset.sv === "new") return serviceForm();
        if (t.dataset.sv === "edit") return serviceForm(VIEWS._services.find((x) => x.id === id));
        if (confirm("Excluir este serviço do site?")) { await G.remove("services", id); toast("Serviço excluído."); go("services"); }
      }
      if (t.dataset.wk) {
        if (t.dataset.wk === "new") return workForm();
        if (t.dataset.wk === "edit") return workForm(VIEWS._works.find((x) => x.id === id));
        if (confirm("Excluir este trabalho?")) { await G.remove("works", id); toast("Trabalho excluído."); go("works"); }
      }
      if (t.dataset.rv) {
        if (t.dataset.rv === "new") return reviewForm();
        if (t.dataset.rv === "edit") return reviewForm(VIEWS._reviews.find((x) => x.id === id));
        if (confirm("Remover esta avaliação?")) { await G.remove("reviews", id); toast("Avaliação removida."); go("reviews"); }
      }
    } catch (x) { fail(x); }
  });

  boot();
})();