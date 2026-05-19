import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Plus, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/medicos")({
  component: MedicosPage,
});

function MedicosPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [newEsp, setNewEsp] = useState("");

  const { data: medicos = [] } = useQuery({
    queryKey: ["medicos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("medico").select("*, especialidade:id_especialidade(nome_especialidade)").order("nome");
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: especialidades = [] } = useQuery({
    queryKey: ["especialidades"],
    queryFn: async () => {
      const { data, error } = await supabase.from("especialidade").select("id, nome_especialidade").order("nome_especialidade");
      if (error) throw error;
      return data as { id: string; nome_especialidade: string }[];
    },
  });

  const createMedico = useMutation({
    mutationFn: async (m: any) => {
      const { error } = await supabase.from("medico").insert({ ...m, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Médico cadastrado"); qc.invalidateQueries({ queryKey: ["medicos"] }); setOpen(false); },
    onError: (e: any) => toast.error(e.message),
  });

  const createEsp = useMutation({
    mutationFn: async (nome: string) => {
      const { error } = await supabase.from("especialidade").insert({ nome_especialidade: nome, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Especialidade adicionada"); setNewEsp(""); qc.invalidateQueries({ queryKey: ["especialidades"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("medico").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Removido"); qc.invalidateQueries({ queryKey: ["medicos"] }); },
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-4xl">Médicos</h1>
          <p className="text-sm text-muted-foreground">{medicos.length} cadastrados</p>
        </div>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          <Plus className="h-4 w-4" /> Novo médico
        </button>
      </header>

      <div className="rounded-2xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
        <h3 className="text-sm font-semibold">Especialidades</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {especialidades.map((e) => <span key={e.id} className="rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground">{e.nome_especialidade}</span>)}
          {especialidades.length === 0 && <span className="text-xs text-muted-foreground">Nenhuma cadastrada.</span>}
        </div>
        <div className="mt-3 flex gap-2">
          <input value={newEsp} onChange={(e) => setNewEsp(e.target.value)} placeholder="Nova especialidade" className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <button onClick={() => newEsp && createEsp.mutate(newEsp)} className="rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground">Adicionar</button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr><th className="px-4 py-3">Nome</th><th className="px-4 py-3">CRM</th><th className="px-4 py-3">Especialidade</th><th className="px-4 py-3">Email</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {medicos.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Nenhum médico.</td></tr>}
            {medicos.map((m) => (
              <tr key={m.id} className="hover:bg-muted/50">
                <td className="px-4 py-3 font-medium">{m.nome}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.crm}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.especialidade?.nome_especialidade ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.email ?? "—"}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => confirm("Remover?") && remove.mutate(m.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && <MedicoModal especialidades={especialidades} onClose={() => setOpen(false)} onSubmit={(d) => createMedico.mutate(d)} busy={createMedico.isPending} />}
    </div>
  );
}

const inputCls = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

function MedicoModal({ especialidades, onClose, onSubmit, busy }: any) {
  const [f, setF] = useState({ nome: "", crm: "", telefone: "", email: "", id_especialidade: "" });
  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-foreground/40 p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSubmit({ ...f, id_especialidade: f.id_especialidade || null, telefone: f.telefone || null, email: f.email || null }); }} className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between"><h2 className="text-2xl">Novo médico</h2><button type="button" onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2"><span className="text-xs font-medium text-muted-foreground">Nome</span><input required value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} className={`mt-1 ${inputCls}`} /></label>
          <label><span className="text-xs font-medium text-muted-foreground">CRM</span><input required value={f.crm} onChange={(e) => setF({ ...f, crm: e.target.value })} className={`mt-1 ${inputCls}`} /></label>
          <label><span className="text-xs font-medium text-muted-foreground">Telefone</span><input value={f.telefone} onChange={(e) => setF({ ...f, telefone: e.target.value })} className={`mt-1 ${inputCls}`} /></label>
          <label className="sm:col-span-2"><span className="text-xs font-medium text-muted-foreground">Email</span><input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={`mt-1 ${inputCls}`} /></label>
          <label className="sm:col-span-2"><span className="text-xs font-medium text-muted-foreground">Especialidade</span>
            <select value={f.id_especialidade} onChange={(e) => setF({ ...f, id_especialidade: e.target.value })} className={`mt-1 ${inputCls}`}>
              <option value="">—</option>
              {especialidades.map((e: any) => <option key={e.id} value={e.id}>{e.nome_especialidade}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm">Cancelar</button>
          <button disabled={busy} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">{busy ? "Salvando..." : "Salvar"}</button>
        </div>
      </form>
    </div>
  );
}
