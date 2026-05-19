import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, UserRound, Users, Activity } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [pac, med, cons, upcoming] = await Promise.all([
        supabase.from("paciente").select("id", { count: "exact", head: true }),
        supabase.from("medico").select("id", { count: "exact", head: true }),
        supabase.from("consulta").select("id", { count: "exact", head: true }),
        supabase.from("consulta")
          .select("id, data_consulta, hora_consulta, status, paciente:id_paciente(nome), medico:id_medico(nome)")
          .gte("data_consulta", new Date().toISOString().slice(0, 10))
          .order("data_consulta")
          .order("hora_consulta")
          .limit(5),
      ]);
      return {
        pacientes: pac.count ?? 0,
        medicos: med.count ?? 0,
        consultas: cons.count ?? 0,
        upcoming: upcoming.data ?? [],
      };
    },
  });

  const cards = [
    { label: "Pacientes", value: stats?.pacientes ?? "—", icon: Users, to: "/pacientes" },
    { label: "Médicos", value: stats?.medicos ?? "—", icon: UserRound, to: "/medicos" },
    { label: "Consultas", value: stats?.consultas ?? "—", icon: CalendarDays, to: "/consultas" },
    { label: "Atividade", value: "Hoje", icon: Activity, to: "/consultas" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-4xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral da sua clínica.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="group rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground transition">
                <c.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4 font-display text-4xl">{c.value}</div>
          </Link>
        ))}
      </div>

      <section className="rounded-2xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">Próximas consultas</h2>
          <Link to="/consultas" className="text-sm font-medium text-primary hover:underline">Ver todas</Link>
        </div>
        <div className="mt-4 divide-y divide-border">
          {(stats?.upcoming ?? []).length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma consulta agendada.</p>
          )}
          {stats?.upcoming.map((c: any) => (
            <div key={c.id} className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">{c.paciente?.nome ?? "—"}</div>
                <div className="text-xs text-muted-foreground">Dr(a). {c.medico?.nome ?? "—"}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{new Date(c.data_consulta).toLocaleDateString("pt-BR")}</div>
                <div className="text-xs text-muted-foreground">{c.hora_consulta?.slice(0, 5)} · {c.status}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
