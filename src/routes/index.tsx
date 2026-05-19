import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, CalendarCheck, ShieldCheck, Stethoscope } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Stethoscope className="h-5 w-5" />
            </div>
            <span className="font-display text-2xl">MedClinic</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-md px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">Entrar</Link>
            <Link to="/login" search={{ mode: "signup" }} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Criar conta</Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-40" style={{ background: "var(--gradient-hero)" }} />
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Activity className="h-3.5 w-3.5 text-primary" /> Gestão clínica moderna
          </span>
          <h1 className="mt-6 font-display text-5xl md:text-7xl text-foreground">
            A sua clínica, <em className="text-primary">organizada</em> de ponta a ponta.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Pacientes, médicos, agenda e prontuários em um só lugar. Simples, seguro e rápido.
          </p>
          <div className="mt-10 flex justify-center gap-3">
            <Link to="/login" search={{ mode: "signup" }} className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:opacity-90">
              Começar agora
            </Link>
            <Link to="/login" className="rounded-md border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted">
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Stethoscope, title: "Pacientes & Médicos", desc: "Cadastros completos com plano de saúde, especialidade e contato." },
            { icon: CalendarCheck, title: "Agenda inteligente", desc: "Marque, reagende e acompanhe o status de cada consulta." },
            { icon: ShieldCheck, title: "Dados protegidos", desc: "Cada conta acessa somente seus próprios registros, com criptografia." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-xl">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
