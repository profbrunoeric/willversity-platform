-- 1. Tabela de Perfis (Profiles)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student', 'teacher')),
  is_active BOOLEAN DEFAULT FALSE, -- Novo campo para controle de ativação via código
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Códigos de Registro (Registration Codes)
CREATE TABLE public.registration_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  used_by UUID REFERENCES public.profiles(id),
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- 3. Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_codes ENABLE ROW LEVEL SECURITY;

-- 4. Políticas para Perfis
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. Políticas para Códigos de Registro
-- Apenas Admins podem criar e ver todos os códigos
CREATE POLICY "Admins can manage codes" ON public.registration_codes 
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Alunos podem verificar se um código existe (SELECT limitado)
CREATE POLICY "Anyone can check a code" ON public.registration_codes 
FOR SELECT USING (is_active = TRUE AND used_at IS NULL);

-- 6. Gatilho para Criar Perfil Automático
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role, is_active)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url', 
    'student',
    FALSE -- Começa inativo até validar o código
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. Tabela de Aulas (Lessons)
CREATE TABLE public.lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Habilitar RLS para Aulas
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- 9. Políticas para Aulas
-- Alunos e Admins podem ver aulas publicadas
CREATE POLICY "Anyone can view published lessons" ON public.lessons 
FOR SELECT USING (is_published = TRUE);

-- Apenas Admins podem gerenciar aulas
CREATE POLICY "Admins can manage lessons" ON public.lessons 
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 11. Tabela de Configurações Globais (Command Center)
CREATE TABLE public.settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  platform_name TEXT DEFAULT 'Willversity',
  platform_description TEXT DEFAULT 'The University of English',
  primary_color TEXT DEFAULT '#294a70',
  logo_url TEXT,
  announcement_text TEXT,
  is_maintenance_mode BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT one_row CHECK (id = 1) -- Garante que só exista 1 linha de configuração
);

-- 12. Habilitar RLS para Configurações
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 13. Políticas para Configurações
-- Qualquer um pode ver as configurações básicas da plataforma
CREATE POLICY "Anyone can view settings" ON public.settings FOR SELECT USING (true);

-- Apenas Admins podem editar as configurações
CREATE POLICY "Admins can manage settings" ON public.settings 
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 14. Inserir configuração inicial
-- 15. Tabela de Estágios Pedagógicos (Metodologia CMS)
CREATE TABLE public.pedagogical_stages (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.pedagogical_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view stages" ON public.pedagogical_stages FOR SELECT USING (true);
CREATE POLICY "Admins can manage stages" ON public.pedagogical_stages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Inserir os 5 estágios iniciais
INSERT INTO public.pedagogical_stages (id, name, description) VALUES 
(1, 'Stage 1', 'Introdução e Fundamentos'),
(2, 'Stage 2', 'Comunicação Básica'),
(3, 'Stage 3', 'Intermediário Consolidado'),
(4, 'Stage 4', 'Avançado e Fluência'),
-- 16. Tabela de Recursos da Aula (Materiais de Apoio CMS)
CREATE TABLE public.lesson_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT DEFAULT 'pdf', -- pdf, link, audio, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.lesson_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view resources" ON public.lesson_resources FOR SELECT USING (true);
-- 17. Tabela de Avisos (Notification Center CMS)
CREATE TABLE public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- info, warning, success
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active announcements" ON public.announcements FOR SELECT USING (true);
-- 18. Sistema de Gamificação (XP & Ranks)
CREATE TABLE public.xp_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  category TEXT DEFAULT 'geral', -- speaking, participation, homework, synchronous
  reason TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para XP
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own XP" ON public.xp_transactions FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Admins can manage all XP" ON public.xp_transactions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Função para calcular XP total do aluno
CREATE OR REPLACE FUNCTION public.get_student_total_xp(target_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COALESCE(SUM(amount), 0) FROM public.xp_transactions WHERE student_id = target_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 19. Tabela de Categorias de XP (Gamificação CMS)
CREATE TABLE public.xp_categories (
  id TEXT PRIMARY KEY, -- ex: 'speaking', 'homework'
  label TEXT NOT NULL,
  icon_name TEXT DEFAULT 'Sparkles',
  color TEXT DEFAULT '#294a70',
  default_xp INTEGER DEFAULT 10,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para Categorias
ALTER TABLE public.xp_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories" ON public.xp_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.xp_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Inserir Categorias Padrão
INSERT INTO public.xp_categories (id, label, icon_name, color, default_xp) VALUES 
('synchronous', 'Aula Síncrona', 'Monitor', '#3b82f6', 50),
('participation', 'Participação', 'MessageSquare', '#10b981', 25),
('speaking', 'Speaking', 'Target', '#f59e0b', 30),
('homework', 'Lição de Casa', 'BookOpen', '#6366f1', 20),
('geral', 'Geral', 'Sparkles', '#64748b', 10)
ON CONFLICT (id) DO NOTHING;
