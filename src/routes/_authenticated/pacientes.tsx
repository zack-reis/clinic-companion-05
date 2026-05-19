import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Plus, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/pacientes")({
  component: PacientesPage,
});

interface Paciente {
  id: string;
  nome: string;
  cpf: string | null;
  data_nascimento: string;
  sexo: "M" | "F" | null;
  telefone: string | null;
  endereco: string | null;
  id_plano: string | null;
}

function PacientesPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: pacientes = [], isLoading } = useQuery({
    queryKey: ["pacientes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("paciente").select("*").order("nome");
      if (error) throw error;
      return data as Paciente[];
    },
  });

  const { data: planos = [] } = useQuery({
    queryKey: ["planos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("plano_saude").select("id, nome_plano").order("nome_plano");
      if (error) throw error;
      return data as { id: string; nome_plano: string }[];
    },
  });

  const create = useMutation({
    mutationFn: async (p: Omit<Paciente, "id">) => {
      const { error } = await supabase.from("paciente").insert({ ...p, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Paciente cadastrado"); qc.invalidateQueries({ queryKey: ["pacientes"] }); setOpen(false); },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("paciente").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Paciente removido"); qc.invalidateQueries({ queryKey: ["pacientes"] }); },
  });

  const filtered = pacientes.filter((p) => p.nome.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-4xl">Pacientes</h1>
          <p className="text-sm text-muted-foreground">{pacientes.length} cadastrados</p>
        </div>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          <Plus className="h-4 w-4" /> Novo paciente
        </button>
      </header>

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome..."
        className="w-full md:w-80 rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />

      <div className="rounded-2xl border border-border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr><th className="px-4 py-3">Nome</th><th className="px-4 py-3">CPF</th><th className="px-4 py-3">Nascimento</th><th className="px-4 py-3">Telefone</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Carregando...</td></tr>}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Nenhum paciente.</td></tr>}
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-muted/50">
                <td className="px-4 py-3 font-medium">{p.nome}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.cpf ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(p.data_nascimento).toLocaleDateString("pt-BR")}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.telefone ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { if (confirm("Remover paciente?")) remove.mutate(p.id); }} className="text-destructive hover:opacity-70"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && <PacienteModal planos={planos} onClose={() => setOpen(false)} onSubmit={(d) => create.mutate(d)} busy={create.isPending} />}
    </div>
  );
}

function PacienteModal({ planos, onClose, onSubmit, busy }: {
  planos: { id: string; nome_plano: string }[];
  onClose: () => void;
  onSubmit: (d: any) => void;
  busy: boolean;
}) {
  const [form, setForm] = useState({ nome: "", cpf: "", data_nascimento: "", sexo: "", telefone: "", endereco: "", id_plano: "" });
  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      nome: form.nome,
      cpf: form.cpf || null,
      data_nascimento: form.data_nascimento,
      sexo: form.sexo || null,
      telefone: form.telefone || null,
      endereco: form.endereco || null,
      id_plano: form.id_plano || null,
    });
  };
  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-foreground/40 p-4" onClick={onClose}>
      <form onSubmit={handle} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between"><h2 className="text-2xl">Novo paciente</h2><button type="button" onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Nome" className="sm:col-span-2"><input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className={inputCls} /></Field>
          <Field label="CPF"><input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} className={inputCls} /></Field>
          <Field label="Nascimento"><input type="date" required value={form.data_nascimento} onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })} className={inputCls} /></Field>
          <Field label="Sexo"><select value={form.sexo} onChange={(e) => setForm({ ...form, sexo: e.target.value })} className={inputCls}><option value="">—</option><option value="M">M</option><option value="F">F</option></select></Field>
          <Field label="Telefone"><input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} className={inputCls} /></Field>
          <Field label="Endereço" className="sm:col-span-2"><input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} className={inputCls} /></Field>
          <Field label="Plano de saúde" className="sm:col-span-2">
            <select value={form.id_plano} onChange={(e) => setForm({ ...form, id_plano: e.target.value })} className={inputCls}>
              <option value="">Nenhum</option>
              {planos.map((p) => <option key={p.id} value={p.id}>{p.nome_plano}</option>)}
            </select>
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm">Cancelar</button>
          <button disabled={busy} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">{busy ? "Salvando..." : "Salvar"}</button>
        </div>
      </form>
    </div>
  );
}

const inputCls = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`block ${className}`}><span className="text-xs font-medium text-muted-foreground">{label}</span><div className="mt-1">{children}</div></label>;
}
