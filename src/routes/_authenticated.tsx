import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { CalendarDays, LayoutDashboard, LogOut, Stethoscope, UserRound, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/pacientes", label: "Pacientes", icon: Users },
  { to: "/medicos", label: "Médicos", icon: UserRound },
  { to: "/consultas", label: "Consultas", icon: CalendarDays },
] as const;

function AuthLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground">
        <div className="flex items-center gap-2 px-6 py-6">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground"><Stethoscope className="h-5 w-5" /></div>
          <span className="font-display text-2xl">MedClinic</span>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map((n) => {
            const active = pathname.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${active ? "bg-sidebar-accent text-white" : "text-white/70 hover:bg-sidebar-accent/60 hover:text-white"}`}>
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <div className="mb-3 truncate text-xs text-white/60">{user.email}</div>
          <button onClick={() => signOut().then(() => navigate({ to: "/login" }))} className="flex w-full items-center gap-2 rounded-md bg-sidebar-accent/40 px-3 py-2 text-sm hover:bg-sidebar-accent">
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed inset-x-0 top-0 z-20 flex items-center justify-between bg-sidebar text-sidebar-foreground px-4 py-3">
        <Link to="/dashboard" className="flex items-center gap-2"><Stethoscope className="h-5 w-5" /><span className="font-display text-xl">MedClinic</span></Link>
        <button onClick={() => signOut().then(() => navigate({ to: "/login" }))}><LogOut className="h-5 w-5" /></button>
      </div>

      <main className="flex-1 md:ml-0 mt-14 md:mt-0 overflow-x-hidden">
        <div className="mx-auto max-w-6xl p-6 md:p-10">
          <Outlet />
        </div>
        {/* mobile bottom nav */}
        <div className="md:hidden fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-border bg-card">
          {nav.map((n) => {
            const active = pathname.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} className={`flex flex-col items-center gap-1 py-2 text-xs ${active ? "text-primary" : "text-muted-foreground"}`}>
                <n.icon className="h-5 w-5" />
                {n.label}
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
