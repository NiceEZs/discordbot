"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { DiscordGuild } from "@/lib/discord";
import { GuildSwitcher } from "./GuildSwitcher";
import { IconCases, IconMenu, IconServers, IconSettings } from "./icons";

export type ShellUser = {
  name: string;
  image?: string | null;
};

export function AppShell({
  user,
  guilds,
  children,
}: {
  user: ShellUser;
  guilds: DiscordGuild[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const guildMatch = pathname.match(/^\/dashboard\/([^/]+)/);
  const activeGuildId =
    guildMatch && guildMatch[1] !== undefined ? guildMatch[1] : null;
  const onCases = Boolean(activeGuildId && pathname.endsWith("/cases"));
  const onSettings = Boolean(
    activeGuildId && pathname === `/dashboard/${activeGuildId}`,
  );

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);
  const initial = (user.name || "?").slice(0, 1).toUpperCase();

  return (
    <div className="app-shell">
      <div
        className={`sidebar-backdrop${open ? " visible" : ""}`}
        onClick={close}
        aria-hidden={!open}
      />

      <aside className={`sidebar${open ? " open" : ""}`} aria-label="Nawigacja">
        <Link href="/dashboard" className="sidebar-brand" onClick={close}>
          <div className="brand-mark">NH</div>
          <div className="brand-title">
            Nice HVH
            <span>Panel bota</span>
          </div>
        </Link>

        <nav className="sidebar-nav" aria-label="Główne">
          <div className="nav-label">Nawigacja</div>
          <Link
            href="/dashboard"
            className={`nav-link${!activeGuildId ? " active" : ""}`}
            onClick={close}
          >
            <IconServers />
            Serwery
          </Link>

          {activeGuildId ? (
            <>
              <div className="nav-label" style={{ marginTop: "0.55rem" }}>
                Wybrany serwer
              </div>
              <Link
                href={`/dashboard/${activeGuildId}`}
                className={`nav-link${onSettings ? " active" : ""}`}
                onClick={close}
              >
                <IconSettings />
                Ustawienia
              </Link>
              <Link
                href={`/dashboard/${activeGuildId}/cases`}
                className={`nav-link${onCases ? " active" : ""}`}
                onClick={close}
              >
                <IconCases />
                Sprawy
              </Link>
            </>
          ) : null}
        </nav>

        <GuildSwitcher
          guilds={guilds}
          activeGuildId={activeGuildId}
          onNavigate={close}
        />

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt="" />
              ) : (
                initial
              )}
            </div>
            <div className="user-meta">
              <strong>{user.name}</strong>
              <span>Zalogowano przez Discord</span>
            </div>
          </div>
          <Link href="/api/auth/signout" className="btn btn-ghost btn-block">
            Wyloguj
          </Link>
        </div>
      </aside>

      <div className="shell-main">
        <div className="topbar-mobile">
          <button
            type="button"
            className="icon-btn"
            aria-label="Otwórz menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <IconMenu />
          </button>
          <Link href="/dashboard" className="brand-title" style={{ fontSize: "0.95rem" }}>
            Nice HVH
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
