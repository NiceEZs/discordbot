"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Settings = {
  moderationEnabled: boolean;
  modLogChannelId: string | null;
  moderatorRoleId: string | null;
  muteDefaultMinutes: number;
  locale: string;
};

export function GuildSettingsForm({
  guildId,
  initial,
}: {
  guildId: string;
  initial: Settings;
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");

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
          modLogChannelId: form.modLogChannelId || null,
          moderatorRoleId: form.moderatorRoleId || null,
          muteDefaultMinutes: form.muteDefaultMinutes,
          locale: "pl",
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
    <form className="form-grid" onSubmit={onSubmit}>
      {message ? (
        <p className={status === "err" ? "flash error" : "flash"}>{message}</p>
      ) : null}

      <div className="field checkbox">
        <input
          id="moderationEnabled"
          type="checkbox"
          checked={form.moderationEnabled}
          onChange={(e) =>
            setForm((f) => ({ ...f, moderationEnabled: e.target.checked }))
          }
        />
        <label htmlFor="moderationEnabled">Moderacja włączona</label>
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
            setForm((f) => ({
              ...f,
              muteDefaultMinutes: Number(e.target.value) || 60,
            }))
          }
        />
      </div>

      <div className="field">
        <label htmlFor="modLogChannelId">
          ID kanału logów (placeholder — pełne logi w Phase 2)
        </label>
        <input
          id="modLogChannelId"
          type="text"
          placeholder="np. 123456789012345678"
          value={form.modLogChannelId ?? ""}
          onChange={(e) =>
            setForm((f) => ({ ...f, modLogChannelId: e.target.value }))
          }
        />
      </div>

      <div className="field">
        <label htmlFor="moderatorRoleId">ID roli moderatorskiej (opcjonalnie)</label>
        <input
          id="moderatorRoleId"
          type="text"
          placeholder="np. 123456789012345678"
          value={form.moderatorRoleId ?? ""}
          onChange={(e) =>
            setForm((f) => ({ ...f, moderatorRoleId: e.target.value }))
          }
        />
      </div>

      <button className="btn" type="submit" disabled={status === "saving"}>
        {status === "saving" ? "Zapisywanie…" : "Zapisz ustawienia"}
      </button>
    </form>
  );
}
