-- Migration: Create Agenda Table
-- Description: Sistema de agendamento global e individual com prevenção de conflitos.

-- 1. Criar Tipos Enum
DO $$ BEGIN
    CREATE TYPE appointment_type AS ENUM ('aula', 'mentoria', 'reposicao', 'outro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('pendente', 'confirmado', 'cancelado', 'concluido', 'falta');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Criar a tabela de agenda
CREATE TABLE IF NOT EXISTS agenda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES professores(id) ON DELETE CASCADE,
    student_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    tipo appointment_type DEFAULT 'aula',
    status appointment_status DEFAULT 'pendente',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Garantir que start_time é antes de end_time
    CONSTRAINT check_times CHECK (start_time < end_time)
);

-- 3. Habilitar RLS
ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de RLS
-- Política 1: Todos os usuários autenticados podem ver os agendamentos (ajustar conforme necessário)
CREATE POLICY "Leitura de agenda para autenticados" 
ON agenda FOR SELECT 
TO authenticated 
USING (true);

-- Política 2: Professores podem gerenciar seus próprios agendamentos
-- Nota: Aqui assumimos que o teacher_id na tabela professores está vinculado ao auth.uid() futuramente
-- Por enquanto, permitimos inserção para autenticados (Admin/Professores)
CREATE POLICY "Gestão de agendamentos para autenticados" 
ON agenda FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- 5. Função para Prevenção de Conflitos (Trigger)
CREATE OR REPLACE FUNCTION check_booking_overlap()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM agenda
        WHERE teacher_id = NEW.teacher_id
        AND id != NEW.id
        AND status != 'cancelado'
        AND (
            (NEW.start_time >= start_time AND NEW.start_time < end_time) OR
            (NEW.end_time > start_time AND NEW.end_time <= end_time) OR
            (NEW.start_time <= start_time AND NEW.end_time >= end_time)
        )
    ) THEN
        RAISE EXCEPTION 'Conflito de horário: O professor já possui um compromisso neste intervalo.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_agenda_overlap
BEFORE INSERT OR UPDATE ON agenda
FOR EACH ROW
EXECUTE PROCEDURE check_booking_overlap();

-- 6. Trigger para updated_at
CREATE TRIGGER update_agenda_updated_at
BEFORE UPDATE ON agenda
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
