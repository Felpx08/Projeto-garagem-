/* ============================================================
   GARAGEM 617 — Camada de dados
   Usa Supabase quando configurado; senão, modo demonstração
   (localStorage). A API é idêntica nos dois modos.
   ============================================================ */
   (function () {
    const C = window.G617_CONFIG;
    const LIVE = !!(C.SUPABASE_URL && C.SUPABASE_ANON_KEY && window.supabase);
    const sb = LIVE ? window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY) : null;
  
    /* ---------- Imagens placeholder (SVG embutido) ---------- */
    function placeholder(label, tone) {
      const t = tone || "dark";
      const bg = t === "before" ? ["#2b2b2e", "#4a3f3a"] : t === "after" ? ["#1c1c1f", "#3a3a40"] : ["#18181b", "#2e2e33"];
      const accent = t === "before" ? "#7a5a4a" : "#ffcc00";
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'>
  <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${bg[0]}'/><stop offset='1' stop-color='${bg[1]}'/></linearGradient></defs>
  <rect width='800' height='600' fill='url(#g)'/>
  <g fill='none' stroke='${accent}' stroke-width='6' stroke-linecap='round' stroke-linejoin='round' opacity='.85'>
  <path d='M130 390 L180 300 Q200 270 240 268 L430 262 Q480 262 515 292 L560 335 L650 350 Q675 356 675 380 L675 410 L130 410 Z'/>
  <circle cx='235' cy='415' r='42' fill='#0d0d0f'/><circle cx='560' cy='415' r='42' fill='#0d0d0f'/></g>
  <text x='400' y='520' font-family='Arial,sans-serif' font-size='26' font-weight='700' letter-spacing='4' text-anchor='middle' fill='#bdbdc4'>${label}</text>
  <text x='400' y='555' font-family='Arial,sans-serif' font-size='16' text-anchor='middle' fill='#7d7d86'>SUBSTITUIR PELA FOTO REAL</text></svg>`;
      return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    }
  
    /* ---------- Dados padrão (editáveis no painel) ---------- */
    const DEFAULTS = {
      settings: {
        brand: "GARAGEM 617",
        phone: "(11) 93462-4257",
        whatsapp: "(11) 93462-4257",
        whatsapp_display: "(11) 93462-4257",
        email: "santisfe9@gmail.com",
        address: "Rua anagé 617, Jardim Presidente Dutra, Guarulhos-Sp",
        hours: "Segunda a Sexta: 08:00 às 18:00\nSábado: 08:00 às 12:00\nDomingo: fechado",
        map_query: "",
        instagram: "https://instagram.com/felpzzn",
        facebook: "https://facebook.com/felpzzn",
        tiktok: "https://tiktok.com/@felpqy",
        // 
        // 
        // 
        // 
        // 
        // 
        // 
        // 
        // 
        // 
        // ",
        hero_title: "Seu carro merece voltar a ser como novo.",
        hero_subtitle: "Funilaria, pintura e cuidados automotivos realizados com qualidade, experiência e atenção aos detalhes.",
        hero_image: "assets/img/hero.jpg",
        about_title: "Conheça a Garagem 617",
        about_text: "A Garagem 617 nasceu com o objetivo de oferecer serviços automotivos de qualidade, cuidando de cada veículo como se fosse nosso. Trabalhamos com funilaria, pintura e recuperação automotiva, buscando sempre entregar um excelente acabamento e a satisfação dos nossos clientes.",
        about_images: ["assets/img/about-1.jpg", "assets/img/about-2.jpg", "assets/img/about-3.jpg"],
        stat1_value: "+500", stat1_label: "veículos atendidos ",
        stat2_value: "+10", stat2_label: "anos de experiência ",
        stat3_value: "98%", stat3_label: "clientes satisfeitos ",
        reviews_google_url: ""
      },
      services: [
        { id: "s1", title: "Funilaria Automotiva", description: "Reparação de amassados, batidas e danos na lataria.", icon: "hammer", category: "Funilaria", position: 1 },
        { id: "s2", title: "Pintura Automotiva", description: "Pintura completa ou localizada com acabamento profissional.", icon: "spray", category: "Pintura", position: 2 },
        { id: "s3", title: "Recuperação de Para-choques", description: "Reparo de riscos, trincas e danos em para-choques.", icon: "bumper", category: "Para-choques", position: 3 },
        { id: "s4", title: "Polimento Automotivo", description: "Recuperação do brilho e remoção de pequenas marcas na pintura.", icon: "sparkle", category: "Polimento", position: 4 },
        { id: "s5", title: "Martelinho de Ouro", description: "Correção de pequenos amassados preservando a pintura original quando possível.", icon: "dent", category: "Martelinho de Ouro", position: 5 },
        { id: "s6", title: "Retoques de Pintura", description: "Correção de pequenos riscos e imperfeições.", icon: "brush", category: "Retoque", position: 6 },
        { id: "s7", title: "Restauração Automotiva", description: "Recuperação estética de veículos.", icon: "wrench", category: "Restauração", position: 7 },
        { id: "s8", title: "Orçamento de Reparos", description: "Avaliação do veículo para elaboração de orçamento.", icon: "clipboard", category: "Orçamento", position: 8 }
      ],
      works: [
        { id: "w1", ba: true, title: "Recuperação de lataria", vehicle: "Veículo ", service: "Funilaria", description: "Exemplo de trabalho. Substitua por um serviço real no painel.", photos: ["assets/img/recuperacao.png"], before: "assets/img/recuperacao antes.jpg", after: "assets/img/recuperacao depois.jpg", video_url: "", created_at: "2026-01-01" },
        { id: "w2", title: "Pintura completa ", vehicle: "Veículo ", service: "Pintura", description: "Exemplo de trabalho. Substitua por um serviço real no painel.", photos: ["assets/img/pintura.jpg"], before: "", after: "", video_url: "", created_at: "2026-01-02" },
        { id: "w3", title: "Polimento técnico ", vehicle: "Veículo ", service: "Polimento", description: "Exemplo de trabalho. Substitua por um serviço real no painel.", photos: ["assets/img/polimento tecnico.jpg"], before: "", after: "", video_url: "", created_at: "2026-01-03" },
        { id: "w4", title: "Para-choque restaurado ", vehicle: "Veículo ", service: "Para-choques", description: "Exemplo de trabalho. Substitua por um serviço real no painel.", photos: ["assets/img/para-choques restaurados.jpg"], before: "", after: "", video_url: "", created_at: "2026-01-04" },
        { id: "w5", title: "Restauração estética ", vehicle: "Veículo ", service: "Restauração", description: "Exemplo de trabalho. Substitua por um serviço real no painel.", photos: ["assets/img/restauracao estetica.jpg  "], before: "", after: "", video_url: "", created_at: "2026-01-05" },
        { id: "w6", ba: true, title: "Antes e Depois — lateral ", vehicle: "Veículo ", service: "Funilaria", description: "Exemplo de comparação. Cadastre fotos reais de antes e depois no painel.", photos: ["assets/img/antes e depois.jpg"], before: "assets/img/lateral antes.jpg", after: "assets/img/lateral depois.jpg", video_url: "", created_at: "2026-01-06" }
      ],
      reviews: [
        { id: "r1", name: "Cliente Exemplo 1", stars: 5, comment: "Excelente trabalho! Meu carro ficou novo novamente. Atendimento rápido e serviço muito bem feito. ", avatar: "assets/img/avatar-1.jpg" },
        { id: "r2", name: "Cliente Exemplo 2", stars: 5, comment: "Acabamento impecável e prazo cumprido. Recomendo! ", avatar: "assets/img/avatar-2.jpg" },
        { id: "r3", name: "Cliente Exemplo 3", stars: 5, comment: "Profissionais atenciosos e preço justo. ", avatar: "assets/img/avatar-3.jpg" }
      ],
      appointments: [], quotes: []
    };
  
    /* ---------- Utilidades ---------- */
    const uid = () => "id" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    const clone = (o) => JSON.parse(JSON.stringify(o));
  
    function resizeToDataUrl(file, max) {
      return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onerror = reject;
        fr.onload = () => {
          const img = new Image();
          img.onerror = reject;
          img.onload = () => {
            const s = Math.min(1, max / Math.max(img.width, img.height));
            const c = document.createElement("canvas");
            c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
            c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
            resolve(c.toDataURL("image/jpeg", 0.8));
          };
          img.src = fr.result;
        };
        fr.readAsDataURL(file);
      });
    }
    function dataUrlToBlob(d) {
      const [h, b] = d.split(","); const m = /:(.*?);/.exec(h)[1];
      const bin = atob(b); const u = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      return new Blob([u], { type: m });
    }
    const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
    function checkFile(f) {
      if (!ALLOWED.includes(f.type)) throw new Error("Formato inválido. Envie JPG, PNG ou WEBP.");
      if (f.size > 12 * 1024 * 1024) throw new Error("Imagem muito grande (máx. 12 MB).");
    }
  
    /* ---------- Modo demonstração ---------- */
    const LS = "g617_demo_v2";
    function dbLoad() {
      try { const r = localStorage.getItem(LS); if (r) return JSON.parse(r); } catch (e) {}
      return clone(DEFAULTS);
    }
    function dbSave(d) {
      try { localStorage.setItem(LS, JSON.stringify(d)); } catch (e) { throw new Error("Armazenamento do navegador cheio. Use imagens menores ou configure o Supabase."); }
    }
  
    /* ---------- API pública ---------- */
    const G = {
      LIVE, config: C, placeholder, uid,
  
      async getSettings() {
        if (!LIVE) return Object.assign({}, DEFAULTS.settings, dbLoad().settings);
        const { data } = await sb.from("settings").select("*");
        const out = Object.assign({}, DEFAULTS.settings);
        (data || []).forEach((r) => { out[r.key] = r.value; });
        return out;
      },
      async saveSettings(obj) {
        if (!LIVE) { const d = dbLoad(); d.settings = Object.assign({}, d.settings, obj); dbSave(d); return; }
        const rows = Object.keys(obj).map((k) => ({ key: k, value: obj[k] }));
        const { error } = await sb.from("settings").upsert(rows);
        if (error) throw error;
      },
  
      /* tabelas simples: services, works, reviews */
      async list(table) {
        if (!LIVE) { const d = dbLoad(); const a = d[table] || []; return clone(a); }
        const q = sb.from(table).select("*");
        const { data, error } = await (table === "services" ? q.order("position") : q.order("created_at", { ascending: false }));
        if (error) throw error;
        if (table === "works" && !data.length) return [];
        return data;
      },
      async listPublic() {
        // Primeira visita no modo live sem dados: usa padrões
        const [services, works, reviews] = await Promise.all([this.list("services"), this.list("works"), this.list("reviews")]);
        if (LIVE) return { services: services.length ? services : DEFAULTS.services, works, reviews };
        return { services, works, reviews };
      },
      async upsert(table, row) {
        row = clone(row);
        if (!LIVE) {
          const d = dbLoad(); d[table] = d[table] || [];
          if (!row.id) { row.id = uid(); row.created_at = new Date().toISOString(); }
          const i = d[table].findIndex((x) => x.id === row.id);
          if (i >= 0) d[table][i] = row; else d[table].push(row);
          dbSave(d); return row;
        }
        if (!row.id) delete row.id;
        const { data, error } = await sb.from(table).upsert(row).select().single();
        if (error) throw error; return data;
      },
      async remove(table, id) {
        if (!LIVE) { const d = dbLoad(); d[table] = (d[table] || []).filter((x) => x.id !== id); dbSave(d); return; }
        const { error } = await sb.from(table).delete().eq("id", id);
        if (error) throw error;
      },
      async seedIfEmpty() {
        if (!LIVE) return;
        for (const t of ["services", "reviews", "works"]) {
          const cur = await this.list(t);
          if (!cur.length) for (const r of DEFAULTS[t]) { const x = clone(r); delete x.id; delete x.created_at; await this.upsert(t, x); }
        }
      },
  
      /* ---------- Uploads ---------- */
      // Imagens do site (públicas)
      async uploadPublic(file) {
        checkFile(file);
        if (!LIVE) return resizeToDataUrl(file, 1400);
        const blob = dataUrlToBlob(await resizeToDataUrl(file, 1800));
        const path = "img/" + uid() + ".jpg";
        const { error } = await sb.storage.from("site").upload(path, blob, { contentType: "image/jpeg" });
        if (error) throw error;
        return sb.storage.from("site").getPublicUrl(path).data.publicUrl;
      },
      // Fotos enviadas por clientes (privadas)
      async uploadPrivate(files) {
        const out = [];
        for (const f of Array.from(files).slice(0, 8)) {
          checkFile(f);
          if (!LIVE) { out.push(await resizeToDataUrl(f, 900)); continue; }
          const blob = dataUrlToBlob(await resizeToDataUrl(f, 1600));
          const path = "req/" + new Date().toISOString().slice(0, 10) + "/" + uid() + ".jpg";
          const { error } = await sb.storage.from("requests").upload(path, blob, { contentType: "image/jpeg" });
          if (error) throw error;
          out.push(path);
        }
        return out;
      },
      async resolvePrivate(ref) {
        if (!LIVE || ref.startsWith("data:")) return ref;
        const { data } = await sb.storage.from("requests").createSignedUrl(ref, 3600);
        return data ? data.signedUrl : "";
      },
  
      /* ---------- Agendamento ---------- */
      async bookedSlots(date) {
        if (!LIVE) return dbLoad().appointments.filter((a) => a.date === date && a.status !== "cancelado").map((a) => a.time);
        const { data, error } = await sb.rpc("booked_slots", { p_date: date });
        if (error) throw error;
        return (data || []).map((t) => String(t).slice(0, 5));
      },
      async createBooking(p) {
        if (!LIVE) {
          const d = dbLoad();
          if (d.appointments.some((a) => a.date === p.date && a.time === p.time && a.status !== "cancelado"))
            throw new Error("Este horário acabou de ser reservado. Escolha outro.");
          d.appointments.push({
            id: uid(), status: "pendente", created_at: new Date().toISOString(),
            date: p.date, time: p.time, service: p.service, description: p.description, photos: p.photos,
            clients: { name: p.name, phone: p.phone, whatsapp: p.phone, email: p.email },
            vehicles: { brand: p.brand, model: p.model, year: p.year, plate: p.plate }
          });
          dbSave(d); return;
        }
        const { error } = await sb.rpc("create_booking", {
          p_name: p.name, p_phone: p.phone, p_email: p.email, p_brand: p.brand, p_model: p.model,
          p_year: p.year, p_plate: p.plate || "", p_service: p.service, p_date: p.date, p_time: p.time,
          p_description: p.description || "", p_photos: p.photos
        });
        if (error) throw new Error(/ocupado|duplicate|unique/i.test(error.message) ? "Este horário acabou de ser reservado. Escolha outro." : error.message);
      },
      async createQuote(p) {
        if (!LIVE) {
          const d = dbLoad();
          d.quotes.push({
            id: uid(), status: "pendente", created_at: new Date().toISOString(),
            service: p.service, description: p.description, photos: p.photos,
            clients: { name: p.name, phone: p.phone, whatsapp: p.phone, email: "" },
            vehicles: { brand: p.vehicle, model: "", year: p.year, plate: "" }
          });
          dbSave(d); return;
        }
        const { error } = await sb.rpc("create_quote", {
          p_name: p.name, p_phone: p.phone, p_vehicle: p.vehicle, p_year: p.year,
          p_service: p.service, p_description: p.description || "", p_photos: p.photos
        });
        if (error) throw new Error(error.message);
      },
  
      /* ---------- Admin ---------- */
      async login(email, pass) {
        if (!LIVE) {
          if (email === C.DEMO_ADMIN_EMAIL && pass === C.DEMO_ADMIN_PASSWORD) { sessionStorage.setItem("g617_admin", "1"); return; }
          throw new Error("E-mail ou senha incorretos.");
        }
        const { error } = await sb.auth.signInWithPassword({ email, password: pass });
        if (error) throw new Error("E-mail ou senha incorretos.");
        const { data } = await sb.rpc("is_admin");
        if (!data) { await sb.auth.signOut(); throw new Error("Este usuário não tem permissão de administrador."); }
      },
      async isLogged() {
        if (!LIVE) return sessionStorage.getItem("g617_admin") === "1";
        const { data } = await sb.auth.getSession();
        if (!data.session) return false;
        const r = await sb.rpc("is_admin"); return !!r.data;
      },
      async logout() { if (!LIVE) sessionStorage.removeItem("g617_admin"); else await sb.auth.signOut(); },
  
      async adminList(table) { // appointments | quotes (com cliente e veículo)
        if (!LIVE) return clone(dbLoad()[table]).sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
        const { data, error } = await sb.from(table).select("*, clients(*), vehicles(*)").order("created_at", { ascending: false });
        if (error) throw error; return data;
      },
      async adminUpdate(table, id, patch) {
        if (!LIVE) {
          const d = dbLoad(); const r = d[table].find((x) => x.id === id);
          if (r) Object.assign(r, patch); dbSave(d); return;
        }
        const { error } = await sb.from(table).update(patch).eq("id", id);
        if (error) throw new Error(/unique|duplicate/i.test(error.message) ? "Já existe agendamento ativo neste horário." : error.message);
      },
      async adminDelete(table, id) { return this.remove(table, id); },
      async clientCount() {
        if (!LIVE) { const d = dbLoad(); const s = new Set(); [...d.appointments, ...d.quotes].forEach((x) => s.add((x.clients.phone || "").replace(/\D/g, "") || x.id)); return s.size; }
        const { count } = await sb.from("clients").select("*", { count: "exact", head: true }); return count || 0;
      }
    };
    window.G617 = G;
  })();