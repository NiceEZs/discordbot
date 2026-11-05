# Deploy (systemd) — skrót

Jednostki systemd i skrypty produkcyjne. Pełna instrukcja po polsku (wklej i uruchom) jest w głównym [README.md](../README.md) → sekcja **Deploy na Ubuntu (produkcja 24/7)**.

| Plik | Rola |
| --- | --- |
| `systemd/discordbot-bot.service` | proces bota |
| `systemd/discordbot-web.service` | panel na porcie **3001** |
| `../scripts/prod-build.sh` | `npm ci` + build |
| `../scripts/prod-db.sh` | `migrate deploy` (albo `--push`) |
| `../scripts/prod-start-bot.sh` | start bota |
| `../scripts/prod-start-web.sh` | start panelu |

**Sekrety** trzymaj tylko w `/home/nice/discordbot/.env` (gitignore). Nie commituj `.env`.
