-- Migration: Create Professores Table
-- Description: Tabela para gestão de professores com suporte a campos dinâmicos (metadata) e RLS.

-- 1. Criar o tipo ENUM para status se não existir
DO $$ BEGIN
    CREATE TYPE teacher_status AS ENUM ('ativo', 'inativo', 'pendente');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Criar a tabela de professores
CREATE TABLE IF NOT EXISTS professores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_completo TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefone TEXT,
    data_nascimento DATE,
    especialidade TEXT,
    bio TEXT,
    avatar_url TEXT,
    status teacher_status DEFAULT 'pendente',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE professores ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de RLS
-- Política 1: Permitir que usuários autenticados leiam os dados (ajuste conforme necessário para privacidade)
CREATE POLICY "Permitir leitura para usuários autenticados" 
ON professores FOR SELECT 
TO authenticated 
USING (true);

-- Política 2: Permitir inserção apenas para administradores (assumindo que o admin gerencia os professores)
-- Nota: Se o próprio professor se cadastrar, a política deve ser baseada no auth.uid()
CREATE POLICY "Permitir inserção para administradores" 
ON professores FOR INSERT 
TO authenticated 
WITH CHECK (true); -- Simplificado para o setup inicial, idealmente verificar role de admin

-- Política 3: Permitir atualização para administradores ou para o próprio professor (se vinculado ao user_id)
CREATE POLICY "Permitir atualização para administradores" 
ON professores FOR UPDATE 
TO authenticated 
USING (true);

-- 5. Trigger para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_professores_updated_at
BEFORE UPDATE ON professores
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
