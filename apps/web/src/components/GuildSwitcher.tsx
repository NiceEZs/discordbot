"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { guildIconUrl, type DiscordGuild } from "@/lib/discord";

export function GuildSwitcher({
  guilds,
  activeGuildId,
  onNavigate,
}: {
  guilds: DiscordGuild[];
  activeGuildId?: string | null;
  onNavigate?: () => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return guilds;
    return guilds.filter(
      (g) => g.name.toLowerCase().includes(q) || g.id.includes(q),
    );
  }, [guilds, query]);

  return (
    <div className="sidebar-guilds">
      <div className="nav-label">Przełącz serwer</div>
      <input
        className="guild-search"
        type="search"
        placeholder="Szukaj serwera…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Szukaj serwera"
      />
      <div className="guild-switcher-list">
        {filtered.length === 0 ? (
          <p className="muted" style={{ padding: "0.4rem 0.55rem", fontSize: "0.85rem" }}>
            {guilds.length === 0
              ? "Brak serwerów z botem."
              : "Brak wyników."}
          </p>
        ) : (
          filtered.map((g) => {
            const icon = guildIconUrl(g);
            const active = g.id === activeGuildId;
            return (
              <Link
                key={g.id}
                href={`/dashboard/${g.id}`}
                className={`guild-switch-item${active ? " active" : ""}`}
                onClick={onNavigate}
              >
                {icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="guild-icon" src={icon} alt="" />
                ) : (
                  <div className="guild-icon">{g.name.slice(0, 1)}</div>
                )}
                <span className="name">{g.name}</span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
