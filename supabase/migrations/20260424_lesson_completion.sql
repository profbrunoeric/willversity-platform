-- Migration: Create Lesson Completions and XP Integration
-- Description: Rastreia aulas concluídas e integra com o sistema de gamificação.

-- 1. Tabela de aulas concluídas
CREATE TABLE IF NOT EXISTS public.lesson_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, lesson_id) -- Impede duplicidade de XP pela mesma aula
);

-- 2. Habilitar RLS
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;

-- 3. Políticas
CREATE POLICY "Students can view own completions" ON public.lesson_completions
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can mark lessons as complete" ON public.lesson_completions
FOR INSERT WITH CHECK (auth.uid() = student_id);

-- 4. Adicionar categoria de XP para Conclusão de Aula
INSERT INTO public.xp_categories (id, label, icon_name, color, default_xp)
VALUES ('lesson_completion', 'Aula Concluída', 'BookOpen', '#10b981', 50)
ON CONFLICT (id) DO NOTHING;

-- 5. Função para premiar XP automaticamente ao concluir aula
CREATE OR REPLACE FUNCTION public.handle_lesson_completion_xp()
RETURNS TRIGGER AS $$
BEGIN
    -- Insere uma transação de XP para o aluno
    INSERT INTO public.xp_transactions (student_id, amount, category, reason, created_by)
    VALUES (
        NEW.student_id,
        50, -- XP fixo por aula concluída
        'lesson_completion',
        'Concluiu a aula: ' || (SELECT title FROM public.lessons WHERE id = NEW.lesson_id),
        NEW.student_id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger
DROP TRIGGER IF EXISTS on_lesson_completed ON public.lesson_completions;
CREATE TRIGGER on_lesson_completed
    AFTER INSERT ON public.lesson_completions
    FOR EACH ROW EXECUTE PROCEDURE public.handle_lesson_completion_xp();
