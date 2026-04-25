-- 1. Atualizar a restrição de cargos na tabela profiles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'coordinator', 'teacher', 'student'));

-- 2. Atualizar Políticas de RLS para abranger Coordenadores e Professores

-- Aulas (Lessons)
DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;
CREATE POLICY "Admins and Coordinators can manage lessons" ON public.lessons 
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coordinator'))
);

-- Recursos de Aula (Lesson Resources)
DROP POLICY IF EXISTS "Admins can manage resources" ON public.lesson_resources;
CREATE POLICY "Admins and Coordinators can manage resources" ON public.lesson_resources 
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coordinator'))
);

-- Avisos (Announcements)
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
CREATE POLICY "Admins and Coordinators can manage announcements" ON public.announcements 
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coordinator'))
);

-- Estágios Pedagógicos (Pedagogical Stages)
DROP POLICY IF EXISTS "Admins can manage stages" ON public.pedagogical_stages;
CREATE POLICY "Admins and Coordinators can manage stages" ON public.pedagogical_stages 
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coordinator'))
);

-- Agenda
DROP POLICY IF EXISTS "Admins can manage agenda" ON public.agenda;
CREATE POLICY "Admins and Coordinators can manage everything in agenda" ON public.agenda 
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coordinator'))
);

-- Professores podem ver e gerenciar SEUS PRÓPRIOS agendamentos
CREATE POLICY "Teachers can manage own agenda" ON public.agenda 
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher' AND teacher_id = auth.uid())
);

-- Perfis (Profiles)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins, Coordinators and Teachers can view all profiles" ON public.profiles 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coordinator', 'teacher'))
);
