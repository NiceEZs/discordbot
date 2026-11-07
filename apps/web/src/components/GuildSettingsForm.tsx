"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type GuildSettingsFormData = {
  moderationEnabled: boolean;
  moderatorRoleId: string | null;
  muteDefaultMinutes: number;
  locale: string;
  loggingEnabled: boolean;
  modLogChannelId: string | null;
  logModActions: boolean;
  logMemberJoin: boolean;
  logMemberLeave: boolean;
  logBans: boolean;
  logChannels: boolean;
  logRoles: boolean;
  welcomeEnabled: boolean;
  welcomeChannelId: string | null;
  welcomeMessage: string | null;
  goodbyeEnabled: boolean;
  goodbyeChannelId: string | null;
  goodbyeMessage: string | null;
};

const DEFAULT_WELCOME =
  "Witaj {user.mention} na **{server}**! Jesteś członkiem nr **{memberCount}**.";
const DEFAULT_GOODBYE = "**{user.tag}** opuścił serwer **{server}**.";

export function GuildSettingsForm({
  guildId,
  initial,
}: {
  guildId: string;
  initial: GuildSettingsFormData;
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");

  function patch<K extends keyof GuildSettingsFormData>(
    key: K,
    value: GuildSettingsFormData[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setMessage("");
    try {
      const res = await fetch(`/api/guilds/${guildId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moderationEnabled: form.moderationEnabled,
          moderatorRoleId: form.moderatorRoleId || null,
          muteDefaultMinutes: form.muteDefaultMinutes,
          locale: "pl",
          loggingEnabled: form.loggingEnabled,
          modLogChannelId: form.modLogChannelId || null,
          logModActions: form.logModActions,
          logMemberJoin: form.logMemberJoin,
          logMemberLeave: form.logMemberLeave,
          logBans: form.logBans,
          logChannels: form.logChannels,
          logRoles: form.logRoles,
          welcomeEnabled: form.welcomeEnabled,
          welcomeChannelId: form.welcomeChannelId || null,
          welcomeMessage: form.welcomeMessage || null,
          goodbyeEnabled: form.goodbyeEnabled,
          goodbyeChannelId: form.goodbyeChannelId || null,
          goodbyeMessage: form.goodbyeMessage || null,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setStatus("ok");
      setMessage("Zapisano ustawienia.");
      router.refresh();
    } catch (err) {
      setStatus("err");
      setMessage(err instanceof Error ? err.message : "Błąd zapisu");
    }
  }

  return (
    <form className="settings-form" onSubmit={onSubmit}>
      {message ? (
        <p className={status === "err" ? "flash error" : "flash"}>{message}</p>
      ) : null}

      <section className="settings-block">
        <header className="settings-block-head">
          <h3>Moderacja</h3>
          <p>Slash commands warn / mute / kick / ban oraz domyślne wartości.</p>
        </header>

        <div className="toggle-row">
          <div>
            <label htmlFor="moderationEnabled">Moderacja włączona</label>
            <p className="field-hint">Wyłącza komendy moderacyjne na tym serwerze.</p>
          </div>
          <input
            id="moderationEnabled"
            type="checkbox"
            className="toggle"
            checked={form.moderationEnabled}
            onChange={(e) => patch("moderationEnabled", e.target.checked)}
          />
        </div>

        <div className="field">
          <label htmlFor="muteDefaultMinutes">Domyślny mute (minuty)</label>
          <input
            id="muteDefaultMinutes"
            type="number"
            min={1}
            max={40320}
            value={form.muteDefaultMinutes}
            onChange={(e) =>
              patch("muteDefaultMinutes", Number(e.target.value) || 60)
            }
          />
        </div>

        <div className="field">
          <label htmlFor="moderatorRoleId">ID roli moderatorskiej</label>
          <p className="field-hint">Opcjonalnie — poza natywnymi uprawnieniami Discord.</p>
          <input
            id="moderatorRoleId"
            type="text"
            inputMode="numeric"
            placeholder="np. 123456789012345678"
            value={form.moderatorRoleId ?? ""}
            onChange={(e) => patch("moderatorRoleId", e.target.value || null)}
          />
        </div>
      </section>

      <section className="settings-block">
        <header className="settings-block-head">
          <h3>Logowanie</h3>
          <p>
            Kanał na logi akcji moderacji i kluczowych zdarzeń Discord.
          </p>
        </header>

        <div className="toggle-row">
          <div>
            <label htmlFor="loggingEnabled">Logowanie włączone</label>
            <p className="field-hint">Wymaga kanału poniżej oraz uprawnień bota do pisania.</p>
          </div>
          <input
            id="loggingEnabled"
            type="checkbox"
            className="toggle"
            checked={form.loggingEnabled}
            onChange={(e) => patch("loggingEnabled", e.target.checked)}
          />
        </div>

        <div className="field">
          <label htmlFor="modLogChannelId">ID kanału logów</label>
          <input
            id="modLogChannelId"
            type="text"
            inputMode="numeric"
            placeholder="np. 123456789012345678"
            value={form.modLogChannelId ?? ""}
            onChange={(e) => patch("modLogChannelId", e.target.value || null)}
            disabled={!form.loggingEnabled}
          />
        </div>

        <div className="checkbox-grid" data-disabled={!form.loggingEnabled}>
          {(
            [
              ["logModActions", "Akcje moderacji (warn / mute / kick / ban)"],
              ["logMemberJoin", "Dołączenia członków"],
              ["logMemberLeave", "Opuszczenia członków"],
              ["logBans", "Ban / unban (event Discord)"],
              ["logChannels", "Tworzenie / usuwanie kanałów"],
              ["logRoles", "Tworzenie / usuwanie ról"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="check-chip">
              <input
                type="checkbox"
                checked={form[key]}
                disabled={!form.loggingEnabled}
                onChange={(e) => patch(key, e.target.checked)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="settings-block">
        <header className="settings-block-head">
          <h3>Welcome</h3>
          <p>
            Wiadomość po dołączeniu. Placeholders:{" "}
            <code>{"{user}"}</code> <code>{"{user.tag}"}</code>{" "}
            <code>{"{user.mention}"}</code> <code>{"{server}"}</code>{" "}
            <code>{"{memberCount}"}</code>
          </p>
        </header>

        <div className="toggle-row">
          <div>
            <label htmlFor="welcomeEnabled">Welcome włączony</label>
          </div>
          <input
            id="welcomeEnabled"
            type="checkbox"
            className="toggle"
            checked={form.welcomeEnabled}
            onChange={(e) => patch("welcomeEnabled", e.target.checked)}
          />
        </div>

        <div className="field">
          <label htmlFor="welcomeChannelId">ID kanału welcome</label>
          <input
            id="welcomeChannelId"
            type="text"
            inputMode="numeric"
            placeholder="np. 123456789012345678"
            value={form.welcomeChannelId ?? ""}
            onChange={(e) => patch("welcomeChannelId", e.target.value || null)}
            disabled={!form.welcomeEnabled}
          />
        </div>

        <div className="field">
          <label htmlFor="welcomeMessage">Szablon wiadomości</label>
          <textarea
            id="welcomeMessage"
            rows={3}
            placeholder={DEFAULT_WELCOME}
            value={form.welcomeMessage ?? ""}
            onChange={(e) => patch("welcomeMessage", e.target.value || null)}
            disabled={!form.welcomeEnabled}
          />
        </div>
      </section>

      <section className="settings-block">
        <header className="settings-block-head">
          <h3>Goodbye</h3>
          <p>Wiadomość po opuszczeniu serwera — te same placeholders co welcome.</p>
        </header>

        <div className="toggle-row">
          <div>
            <label htmlFor="goodbyeEnabled">Goodbye włączony</label>
          </div>
          <input
            id="goodbyeEnabled"
            type="checkbox"
            className="toggle"
            checked={form.goodbyeEnabled}
            onChange={(e) => patch("goodbyeEnabled", e.target.checked)}
          />
        </div>

        <div className="field">
          <label htmlFor="goodbyeChannelId">ID kanału goodbye</label>
          <input
            id="goodbyeChannelId"
            type="text"
            inputMode="numeric"
            placeholder="np. 123456789012345678"
            value={form.goodbyeChannelId ?? ""}
            onChange={(e) => patch("goodbyeChannelId", e.target.value || null)}
            disabled={!form.goodbyeEnabled}
          />
        </div>

        <div className="field">
          <label htmlFor="goodbyeMessage">Szablon wiadomości</label>
          <textarea
            id="goodbyeMessage"
            rows={3}
            placeholder={DEFAULT_GOODBYE}
            value={form.goodbyeMessage ?? ""}
            onChange={(e) => patch("goodbyeMessage", e.target.value || null)}
            disabled={!form.goodbyeEnabled}
          />
        </div>
      </section>

      <div className="form-actions">
        <button className="btn" type="submit" disabled={status === "saving"}>
          {status === "saving" ? "Zapisywanie…" : "Zapisz ustawienia"}
        </button>
      </div>
    </form>
  );
}
