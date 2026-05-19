import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Plus, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/consultas")({
  component: ConsultasPage,
});

const STATUS = ["Agendada", "Confirmada", "Realizada", "Cancelada"] as const;

function ConsultasPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const { data: consultas = [] } = useQuery({
    queryKey: ["consultas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("consulta")
        .select("*, paciente:id_paciente(nome), medico:id_medico(nome)")
        .order("data_consulta", { ascending: false })
        .order("hora_consulta", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: pacientes = [] } = useQuery({
    queryKey: ["pacientes-min"],
    queryFn: async () => {
      const { data, error } = await supabase.from("paciente").select("id, nome").order("nome");
      if (error) throw error;
      return data as { id: string; nome: string }[];
    },
  });

  const { data: medicos = [] } = useQuery({
    queryKey: ["medicos-min"],
    queryFn: async () => {
      const { data, error } = await supabase.from("medico").select("id, nome").order("nome");
      if (error) throw error;
      return data as { id: string; nome: string }[];
    },
  });

  const create = useMutation({
    mutationFn: async (c: any) => {
      const { error } = await supabase.from("consulta").insert({ ...c, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Consulta agendada"); qc.invalidateQueries({ queryKey: ["consultas"] }); qc.invalidateQueries({ queryKey: ["dashboard-stats"] }); setOpen(false); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("consulta").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["consultas"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("consulta").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Removida"); qc.invalidateQueries({ queryKey: ["consultas"] }); },
  });

  const statusColor = (s: string) =>
    s === "Realizada" ? "bg-success text-success-foreground"
    : s === "Cancelada" ? "bg-destructive text-destructive-foreground"
    : s === "Confirmada" ? "bg-primary text-primary-foreground"
    : "bg-warning text-warning-foreground";

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-4xl">Consultas</h1>
          <p className="text-sm text-muted-foreground">{consultas.length} agendadas</p>
        </div>
        <button onClick={() => setOpen(true)} disabled={!pacientes.length || !medicos.length} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          <Plus className="h-4 w-4" /> Nova consulta
        </button>
      </header>
      {(!pacientes.length || !medicos.length) && (
        <p className="rounded-md bg-warning/20 px-3 py-2 text-xs text-warning-foreground">Cadastre ao menos um paciente e um médico para agendar.</p>
      )}

      <div className="rounded-2xl border border-border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr><th className="px-4 py-3">Data</th><th className="px-4 py-3">Hora</th><th className="px-4 py-3">Paciente</th><th className="px-4 py-3">Médico</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {consultas.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Nenhuma consulta.</td></tr>}
            {consultas.map((c) => (
              <tr key={c.id} className="hover:bg-muted/50">
                <td className="px-4 py-3">{new Date(c.data_consulta).toLocaleDateString("pt-BR")}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.hora_consulta?.slice(0, 5)}</td>
                <td className="px-4 py-3 font-medium">{c.paciente?.nome}</td>
                <td className="px-4 py-3 text-muted-foreground">Dr(a). {c.medico?.nome}</td>
                <td className="px-4 py-3">
                  <select value={c.status} onChange={(e) => updateStatus.mutate({ id: c.id, status: e.target.value })}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor(c.status)}`}>
                    {STATUS.map((s) => <option key={s} value={s} className="bg-card text-foreground">{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-right"><button onClick={() => confirm("Remover?") && remove.mutate(c.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && <ConsultaModal pacientes={pacientes} medicos={medicos} onClose={() => setOpen(false)} onSubmit={(d: any) => create.mutate(d)} busy={create.isPending} />}
    </div>
  );
}

const inputCls = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

function ConsultaModal({ pacientes, medicos, onClose, onSubmit, busy }: any) {
  const [f, setF] = useState({ data_consulta: "", hora_consulta: "", id_paciente: "", id_medico: "", status: "Agendada" });
  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-foreground/40 p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSubmit(f); }} className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between"><h2 className="text-2xl">Nova consulta</h2><button type="button" onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label><span className="text-xs font-medium text-muted-foreground">Data</span><input required type="date" value={f.data_consulta} onChange={(e) => setF({ ...f, data_consulta: e.target.value })} className={`mt-1 ${inputCls}`} /></label>
          <label><span className="text-xs font-medium text-muted-foreground">Hora</span><input required type="time" value={f.hora_consulta} onChange={(e) => setF({ ...f, hora_consulta: e.target.value })} className={`mt-1 ${inputCls}`} /></label>
          <label className="sm:col-span-2"><span className="text-xs font-medium text-muted-foreground">Paciente</span>
            <select required value={f.id_paciente} onChange={(e) => setF({ ...f, id_paciente: e.target.value })} className={`mt-1 ${inputCls}`}>
              <option value="">Selecione</option>
              {pacientes.map((p: any) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </label>
          <label className="sm:col-span-2"><span className="text-xs font-medium text-muted-foreground">Médico</span>
            <select required value={f.id_medico} onChange={(e) => setF({ ...f, id_medico: e.target.value })} className={`mt-1 ${inputCls}`}>
              <option value="">Selecione</option>
              {medicos.map((m: any) => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </label>
          <label className="sm:col-span-2"><span className="text-xs font-medium text-muted-foreground">Status</span>
            <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} className={`mt-1 ${inputCls}`}>
              {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm">Cancelar</button>
          <button disabled={busy} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">{busy ? "Salvando..." : "Agendar"}</button>
        </div>
      </form>
    </div>
  );
}
