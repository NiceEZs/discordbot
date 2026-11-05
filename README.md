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
3. Włącz **Server Members Intent** (Bot → Privileged Gateway Intents), jeśli chcesz pełniejszą moderację członków.
4. Zakładka **OAuth2** → **Client ID** i **Client Secret** → `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET`.
5. OAuth2 → Redirects → dodaj:
   - lokalnie: `http://localhost:3000/api/auth/callback/discord`
   - produkcja: `https://TWOJA-DOMENA/api/auth/callback/discord`
6. **Invite URL** (OAuth2 → URL Generator):
   - Scopes: `bot`, `applications.commands`
   - Permissions: `Kick Members`, `Ban Members`, `Moderate Members`, `Manage Messages`, `Send Messages`, `Embed Links`, `View Channels`
7. Otwórz wygenerowany link i zaproś bota na serwer testowy.

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
npm run db:generate
npm run db:push

# Zarejestruj slash commands (wymaga DISCORD_TOKEN + DISCORD_CLIENT_ID)
npm run register-commands -w @nice-hvh/bot

# Terminal A — bot
npm run dev:bot

# Terminal B — panel (http://localhost:3000)
npm run dev:web
```

### Przydatne komendy

| Komenda | Opis |
| --- | --- |
| `npm run typecheck` | TypeScript we wszystkich pakietach |
| `npm run build` | Build db + bot + web |
| `npm run db:studio` | Prisma Studio |
| `npm run db:migrate` | Migracje Prisma (`migrate dev`) |

### Komendy bota (slash)

- `/warn` — ostrzeżenie + zapis case
- `/mute` — timeout Discord + case
- `/kick` / `/ban` — kick/ban + case
- `/cases` — ostatnie sprawy

Panel: zaloguj się Discordem → lista serwerów (Manage Guild) → ustawienia + lista spraw.

---

## 3. Deploy na Ubuntu (zarys — później)

Self-host na domowym serwerze Ubuntu (decyzja zablokowana):

1. Zainstaluj Node 20+, Docker (Postgres) lub systemowy PostgreSQL.
2. Sklonuj repo, ustaw `.env` produkcyjny (`NEXTAUTH_URL` = publiczny URL panelu).
3. `npm ci && npm run build && npm run db:push` (lub migracje).
4. Procesy: `pm2` / systemd — osobno `apps/bot` (`node dist/index.js`) i `apps/web` (`next start`).
5. Reverse proxy (Caddy/Nginx) z HTTPS na panel; bot nie musi być publicznie wystawiony.
6. Zaktualizuj Redirect URL OAuth w Developer Portal.

Szczegółowy playbook deployu — w osobnym dokumencie / kolejnym etapie.

---

## Licencja / właściciel

Projekt prywatny — Nice HVH.
