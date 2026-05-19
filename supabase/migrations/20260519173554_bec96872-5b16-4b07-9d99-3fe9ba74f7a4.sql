
-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email));
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Plano de Saúde
CREATE TABLE public.plano_saude (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_plano TEXT NOT NULL,
  operadora TEXT,
  tipo_plano TEXT,
  telefone_contato TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.plano_saude ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plano own" ON public.plano_saude FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Especialidade
CREATE TABLE public.especialidade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_especialidade TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.especialidade ENABLE ROW LEVEL SECURITY;
CREATE POLICY "esp own" ON public.especialidade FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Paciente
CREATE TYPE public.sexo_enum AS ENUM ('M','F');
CREATE TABLE public.paciente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cpf TEXT,
  data_nascimento DATE NOT NULL,
  sexo public.sexo_enum,
  telefone TEXT,
  endereco TEXT,
  id_plano UUID REFERENCES public.plano_saude(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX paciente_user_cpf_uq ON public.paciente(user_id, cpf) WHERE cpf IS NOT NULL;
ALTER TABLE public.paciente ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pac own" ON public.paciente FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Médico
CREATE TABLE public.medico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  crm TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  id_especialidade UUID REFERENCES public.especialidade(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX medico_user_crm_uq ON public.medico(user_id, crm);
ALTER TABLE public.medico ENABLE ROW LEVEL SECURITY;
CREATE POLICY "med own" ON public.medico FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Consulta
CREATE TABLE public.consulta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_consulta DATE NOT NULL,
  hora_consulta TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'Agendada',
  id_paciente UUID NOT NULL REFERENCES public.paciente(id) ON DELETE CASCADE,
  id_medico UUID NOT NULL REFERENCES public.medico(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.consulta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cons own" ON public.consulta FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Medicamento
CREATE TABLE public.medicamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_generico TEXT NOT NULL,
  nome_comercial TEXT,
  fabricante TEXT,
  dosagem_padrao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.medicamento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "med2 own" ON public.medicamento FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Prontuário
CREATE TABLE public.prontuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anamnese TEXT,
  diagnostico TEXT,
  data_registro TIMESTAMPTZ NOT NULL DEFAULT now(),
  id_paciente UUID NOT NULL REFERENCES public.paciente(id) ON DELETE CASCADE,
  id_consulta UUID NOT NULL UNIQUE REFERENCES public.consulta(id) ON DELETE CASCADE
);
ALTER TABLE public.prontuario ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pront own" ON public.prontuario FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Prescrição
CREATE TABLE public.prescricao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  id_prontuario UUID NOT NULL REFERENCES public.prontuario(id) ON DELETE CASCADE,
  id_medicamento UUID NOT NULL REFERENCES public.medicamento(id) ON DELETE CASCADE,
  instrucoes_uso TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.prescricao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "presc own" ON public.prescricao FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
