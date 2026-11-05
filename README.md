# Nice HVH — Discord bot + panel WWW

Monorepo MVP: bot Discord (moderacja) + panel administracyjny w języku polskim.

**Stack:** Node.js · TypeScript · discord.js · Next.js (App Router) · PostgreSQL · Prisma · NextAuth (Discord OAuth)

> Poza MVP (na później): leveling, tickets, reaction roles, automod, pełne logi, **music (Phase 3)**.

---

## Struktura

```
apps/bot      — proces bota (slash: warn/mute/kick/ban/cases)
apps/web      — panel Next.js (PL) + API
packages/db   — Prisma schema + client
```

---

## Wymagania

- Node.js **20+**
- npm 10+
- Docker (opcjonalnie, do lokalnego Postgres)
- Aplikacja w [Discord Developer Portal](https://discord.com/developers/applications)

---

## 1. Co utworzyć w Discord Developer Portal

1. **New Application** → nadaj nazwę bota.
2. Zakładka **Bot** → Add Bot → skopiuj **Bot Token** → wklej do `.env` jako `DISCORD_TOKEN`.
3. **Privileged Gateway Intents (MVP):** zostaw **wyłączone**
   (**Server Members Intent**, **Message Content Intent**, **Presence Intent**).
   Bot MVP używa tylko intentu `Guilds` + slash commands; fetch członka po ID
   działa bez Server Members Intent. Włączenie intentu w kodzie bez przełącznika
   w Portalu kończy się crashem `Used disallowed intents`.
4. Zakładka **OAuth2** → **Client ID** i **Client Secret** → `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET`.
5. OAuth2 → Redirects → dodaj **dokładnie** ten sam URL co zbuduje NextAuth
   (`{NEXTAUTH_URL}/api/auth/callback/discord`), np.:
   - lokalnie (port 3001): `http://localhost:3001/api/auth/callback/discord`
   - LAN (Ubuntu): `http://192.168.55.48:3001/api/auth/callback/discord`
   - produkcja HTTPS: `https://TWOJA-DOMENA/api/auth/callback/discord`
   
   `NEXTAUTH_URL` w `.env` musi być tym samym originem (host + port), pod którym
   otwierasz panel. To jest NextAuth **v4** → zmienne `NEXTAUTH_*` / `DISCORD_CLIENT_*`
   (nie `AUTH_URL` / `AUTH_SECRET` / `AUTH_TRUST_HOST` z Auth.js v5).
6. **Invite URL** (OAuth2 → URL Generator):
   - Scopes: `bot`, `applications.commands`
   - Permissions: `Kick Members`, `Ban Members`, `Moderate Members`, `Manage Messages`, `Send Messages`, `Embed Links`, `View Channels`
7. Otwórz wygenerowany link i zaproś bota na serwer testowy.

**Później (Phase 2+):** jeśli dodasz eventy `guildMemberAdd` / pełną listę członków
albo czytanie treści wiadomości (automod), wtedy w Portalu włącz
**Bot → Privileged Gateway Intents → Server Members Intent** i/lub
**Message Content Intent**, a dopiero potem dodaj odpowiadające `GatewayIntentBits`
w `apps/bot/src/index.ts`.

**Nie wklejaj tokenów do czatu, PR ani publicznego repo.** Tylko lokalny `.env` / sekrety na serwerze.

---

## 2. Uruchomienie lokalne

```bash
# Sklonuj i wejdź do repo
git clone https://github.com/NiceEZs/discordbot.git
cd discordbot

# Zależności
npm install

# Skopiuj env i uzupełnij wartości z Developer Portal
cp .env.example .env

# Postgres (Docker)
docker compose up -d

# Wygeneruj klienta Prisma + wypchnij schemat do DB
# (skrypty ładują root `.env` przez dotenv-cli — wymagany `DATABASE_URL`)
npm run db:generate
npm run db:push

# Zarejestruj slash commands (najpierw buduje @nice-hvh/db → dist/)
# Wymaga DISCORD_TOKEN + DISCORD_CLIENT_ID w `.env`
npm run register-commands

# Terminal A — bot (też buduje @nice-hvh/db przed startem)
npm run dev:bot

# Terminal B — panel (http://localhost:3001)
npm run dev:web
```

Panel nasłuchuje na porcie **3001** (3000 zostawione na inne projekty, np. Cloudflare).

```bash
# LAN — bind na wszystkie interfejsy (telefon / inna maszyna w sieci)
npm run dev -w @nice-hvh/web -- --hostname 0.0.0.0

# Produkcja (po build)
npm run start -w @nice-hvh/web
# LAN produkcja:
npm run start:lan -w @nice-hvh/web
```

W `.env` ustaw `NEXTAUTH_URL` na ten sam origin co w przeglądarce
(np. `http://192.168.55.48:3001`) i dodaj Redirect URL w Discord Developer Portal:
`http://192.168.55.48:3001/api/auth/callback/discord`.

### Przydatne komendy

| Komenda | Opis |
| --- | --- |
| `npm run typecheck` | TypeScript we wszystkich pakietach |
| `npm run build` | Build db + bot + web |
| `npm run db:studio` | Prisma Studio |
| `npm run db:migrate` | Migracje Prisma (`migrate dev`) |
| `npm run register-commands` | Build `@nice-hvh/db` + rejestracja slash commands |

### Komendy bota (slash)

- `/warn` — ostrzeżenie + zapis case
- `/mute` — timeout Discord + case
- `/kick` / `/ban` — kick/ban + case
- `/cases` — ostatnie sprawy

Panel: zaloguj się Discordem → lista serwerów (Manage Guild) → ustawienia + lista spraw.

---

## 3. Deploy na Ubuntu (produkcja 24/7)

Self-host u Nice: SSH `ssh -p 717 nice@192.168.55.48`, katalog `~/discordbot`, panel na **:3001** (3000 = Cloudflare). Postgres już przez `docker compose`. Sekrety tylko w lokalnym `.env` — **nigdy** w git / PR / czacie.

Jednostki systemd: [`deploy/systemd/`](deploy/systemd/). Skrypty: [`scripts/prod-*.sh`](scripts/).

### 3.1 Zatrzymaj stary `npm run dev` (jeśli jeszcze działa)

Na serwerze (jako `nice`) wklej **cały** blok:

```bash
# Zabij procesy deweloperskie bota/panelu (tsx / next dev) — bezpieczne dla systemd
pkill -f 'tsx watch src/index.ts' 2>/dev/null || true
pkill -f 'next dev' 2>/dev/null || true
pkill -f 'npm run dev' 2>/dev/null || true
echo "Dev zatrzymany (lub nic nie działało). Sprawdź: ss -tlnp | grep -E '3000|3001' || true"
```

### 3.2 Pierwszy start produkcji (wklej i odpal)

Załóż: masz już `~/discordbot` z `.env` i Postgres (`docker compose up -d`). Jeśli repo jest w innym miejscu — dostosuj ścieżki.

```bash
cd ~/discordbot

# Kod z main (po merge PR z deployem)
git fetch origin
git checkout main
git pull origin main

# Uprawnienia skryptów + Postgres
chmod +x scripts/*.sh scripts/lib.sh
docker compose up -d

# Build + bezpieczna migracja (migrate deploy; NIE resetuje bazy)
bash scripts/prod-build.sh
bash scripts/prod-db.sh

# (opcjonalnie, raz po zmianie komend) rejestracja slash
npm run register-commands

# Zainstaluj jednostki systemd (wymaga sudo — hasło Nice)
sudo cp deploy/systemd/discordbot-bot.service /etc/systemd/system/
sudo cp deploy/systemd/discordbot-web.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now discordbot-bot.service discordbot-web.service

# Status
systemctl --no-pager --full status discordbot-bot.service discordbot-web.service
echo "Panel: http://192.168.55.48:3001"
```

Jeśli baza była wcześniej tylko przez `db push` i `migrate deploy` się wywali — **raz**, świadomie:

```bash
cd ~/discordbot && bash scripts/prod-db.sh --push
```

### 3.3 Przydatne komendy na co dzień

```bash
# Restart po update kodu
cd ~/discordbot && git pull origin main && bash scripts/prod-build.sh && bash scripts/prod-db.sh
sudo systemctl restart discordbot-bot discordbot-web

# Logi na żywo
journalctl -u discordbot-bot -u discordbot-web -f

# Stop / start
sudo systemctl stop discordbot-bot discordbot-web
sudo systemctl start discordbot-bot discordbot-web
```

### 3.4 Po merge PR — jaki commit jest na serwerze?

Na Ubuntu:

```bash
cd ~/discordbot && git fetch origin && git checkout main && git pull origin main && git rev-parse HEAD
```

Porównaj SHA z GitHub → `main`. To jest „merge SHA” wdrożenia.

### 3.5 Uwagi

- `EnvironmentFile=/home/nice/discordbot/.env` w unitach (systemd **nie** rozwija `~`).
- Panel: `HOSTNAME=0.0.0.0` + `PORT=3001`.
- `NEXTAUTH_URL` w `.env` musi być `http://192.168.55.48:3001` (albo Twoja domena HTTPS) + ten sam Redirect w Discord Developer Portal.
- Alternatywa pm2 (jeśli wolisz zamiast systemd): po `prod-build.sh` / `prod-db.sh` → `pm2 start scripts/prod-start-bot.sh --name discordbot-bot` oraz `pm2 start scripts/prod-start-web.sh --name discordbot-web` + `pm2 save`.

---

## Licencja / właściciel

Projekt prywatny — Nice HVH.
