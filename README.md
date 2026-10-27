# GARAGEM 617 — Site completo

Site em HTML/CSS/JS puro (sem build), pronto para arrastar no Netlify. Banco de dados, login do painel e upload de fotos usam o **Supabase** (grátis).

## 1) Testar agora (modo demonstração)
Abra `index.html` no navegador ou publique no Netlify. Sem configurar nada, tudo funciona, mas os dados ficam **só no navegador** de quem acessa.
Painel: `/admin` — e-mail `admin@garagem617.demo`, senha `admin617` (só funciona no modo demonstração).

## 2) Publicar no Netlify
1. Entre em https://app.netlify.com/drop
2. Arraste a **pasta `garagem617` inteira** (descompactada).
3. Em *Site configuration → Change site name* escolha o endereço.
4. Depois troque `https://SEU-SITE.netlify.app` pelo endereço real em: `index.html`, `sitemap.xml` e `robots.txt`.

## 3) Ligar o banco de dados real (Supabase) — necessário para uso de verdade
1. Crie um projeto em https://supabase.com
2. **SQL Editor** → cole o conteúdo de `supabase/schema.sql` → **Run**.
3. **Authentication → Users → Add user**: crie seu e-mail e senha de administrador (marque *Auto Confirm*).
4. No SQL Editor rode (trocando o e-mail):
   ```sql
   insert into admin_users (id, name, email)
   select id, 'Administrador', email from auth.users where email = 'SEU-EMAIL@exemplo.com';
   ```
5. **Project Settings → API**: copie *Project URL* e a chave *anon public* para `assets/js/config.js`.
6. Publique de novo no Netlify. Entre em `/admin` com o usuário do passo 3.

A chave `anon` pode ficar no site: o acesso é protegido por regras (RLS) no banco. O público só consegue ler conteúdo do site, ver horários ocupados e **enviar** agendamentos/orçamentos; ler dados de clientes e fotos enviadas exige login de administrador.

## 4) Trocar os placeholders
Tudo isto é editável em **/admin → Site e contato** (sem mexer em código): telefone, WhatsApp (somente números com 55+DDD), e-mail, endereço, horário, redes sociais, textos, números do “Sobre”, foto do topo e imagens da oficina.
Itens marcados `[SUBSTITUIR]` / `[EXEMPLO]` são provisórios: telefone, WhatsApp, e-mail, endereço, links de Instagram/Facebook/TikTok, os 6 trabalhos de exemplo e as 3 avaliações de exemplo.

## 5) Fotos
O projeto **não inclui fotos de carros**: onde não há foto real aparece uma imagem provisória com o aviso “substituir pela foto real”. Suba as fotos pelo painel (Trabalhos, Site e contato). Não use fotos de terceiros sem licença.

## Horários e dias de atendimento
Em `assets/js/config.js`: `SLOTS` (horários oferecidos) e `CLOSED_WEEKDAYS` (0 = domingo). Se mudar os horários, ajuste também a lista na função `create_booking` do `schema.sql`.

## Estrutura
```
index.html            site público
admin/index.html      painel (/admin)
assets/css            style.css, admin.css
assets/js             config.js, data.js (banco), site.js, admin.js
supabase/schema.sql   tabelas, segurança e armazenamento
netlify.toml · robots.txt · sitemap.xml
```
