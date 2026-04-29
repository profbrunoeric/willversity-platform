-- Migration: Gamified Trail Builder (Modules & Lesson Updates)
-- Description: Creates the modules structure and updates lessons to support rich Moodle-style content.

-- 1. Create `modules` table
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for modules
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- Policies for modules
CREATE POLICY "Anyone can view modules" ON public.modules
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert modules" ON public.modules
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'coordinator')
        )
    );

CREATE POLICY "Admins can update modules" ON public.modules
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'coordinator')
        )
    );

CREATE POLICY "Admins can delete modules" ON public.modules
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'coordinator')
        )
    );

-- 2. Add columns to `lessons`
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '📝',
ADD COLUMN IF NOT EXISTS content_blocks JSONB DEFAULT '[]'::jsonb;

-- 3. Safety fallback: Create a default module if there are existing lessons without one
DO $$
DECLARE
    default_module_id UUID;
BEGIN
    -- Check if there are lessons without a module
    IF EXISTS (SELECT 1 FROM public.lessons WHERE module_id IS NULL) THEN
        -- Insert a default module and get its ID
        INSERT INTO public.modules (title, description, order_index)
        VALUES ('Módulo Padrão', 'Módulo gerado automaticamente para aulas antigas', 0)
        RETURNING id INTO default_module_id;

        -- Update all orphaned lessons to this new module
        UPDATE public.lessons
        SET module_id = default_module_id,
            icon = '▶️', -- Seeding an icon for videos since older ones were videos
            content_blocks = jsonb_build_array(
                jsonb_build_object(
                    'type', 'video',
                    'title', title,
                    'url', video_url
                )
            )
        WHERE module_id IS NULL;
    END IF;
END $$;
