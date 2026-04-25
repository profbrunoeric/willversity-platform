-- Migration: Link Lessons to Teachers
-- Description: Adiciona a coluna teacher_id na tabela lessons para vincular cada aula a um professor.

-- 1. Adicionar a coluna teacher_id
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES professores(id) ON DELETE SET NULL;

-- 2. Atualizar RLS (se necessário)
-- Por enquanto, mantemos a leitura pública/autenticada, mas garantimos que o join funcione.
