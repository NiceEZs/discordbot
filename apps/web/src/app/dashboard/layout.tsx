import { AppShell } from "@/components/AppShell";
import { loadPanelGuilds } from "@/lib/panel-guilds";
import { requireSession } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const { manageable } = await loadPanelGuilds(session.user.id);

  return (
    <AppShell
      user={{
        name: session.user.username || session.user.name || "Użytkownik",
        image: session.user.image,
      }}
      guilds={manageable}
    >
      {children}
    </AppShell>
  );
}
