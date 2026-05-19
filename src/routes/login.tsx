import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Stethoscope } from "lucide-react";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({ mode: (s.mode as string) === "signup" ? "signup" : "login" }),
  component: LoginPage,
});

function LoginPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isSignup, setIsSignup] = useState(mode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { setIsSignup(mode === "signup"); }, [mode]);
  useEffect(() => { if (!loading && user) navigate({ to: "/dashboard" }); }, [user, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { nome } },
        });
        if (error) throw error;
        toast.success("Conta criada! Entrando...");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo!");
      }
      navigate({ to: "/dashboard" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between p-12 text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/15 backdrop-blur"><Stethoscope className="h-5 w-5" /></div>
          <span className="font-display text-2xl">MedClinic</span>
        </Link>
        <div>
          <h2 className="font-display text-5xl leading-tight">Cuidado com seus pacientes começa com <em>organização</em>.</h2>
          <p className="mt-4 max-w-md text-white/80">Sistema clínico moderno para profissionais que valorizam tempo e precisão.</p>
        </div>
        <p className="text-sm text-white/60">© MedClinic</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="md:hidden mb-8 flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground"><Stethoscope className="h-5 w-5" /></div>
            <span className="font-display text-2xl">MedClinic</span>
          </div>
          <h1 className="font-display text-4xl">{isSignup ? "Criar conta" : "Entrar"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{isSignup ? "Comece a gerenciar sua clínica em segundos." : "Acesse seu painel clínico."}</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {isSignup && (
              <div>
                <label className="text-sm font-medium">Nome</label>
                <input value={nome} onChange={(e) => setNome(e.target.value)} required className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium">Senha</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <button disabled={busy} className="w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
              {busy ? "Aguarde..." : isSignup ? "Criar conta" : "Entrar"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignup ? "Já tem conta? " : "Não tem conta? "}
            <button onClick={() => setIsSignup(!isSignup)} className="font-medium text-primary hover:underline">
              {isSignup ? "Entrar" : "Criar conta"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
