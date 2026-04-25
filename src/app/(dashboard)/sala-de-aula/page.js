'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  CheckCircle2, 
  MessageSquare, 
  Monitor, 
  Settings, 
  Plus, 
  Save, 
  Trash2, 
  X, 
  Link as LinkIcon,
  FileText,
  Download,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { 
  getLessons, 
  saveLesson, 
  deleteLesson, 
  getLessonResources, 
  addResource, 
  deleteResource,
  completeLesson,
  getCompletionStatus
} from './actions';
import { getTeachers } from '../professores/actions';
import { createClient } from '@/lib/supabase/client';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

export default function SalaDeAulaPage() {
  // --- Estados de Dados ---
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [resources, setResources] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Estados de UI / Modais ---
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // --- Estados de Conclusão e Gamificação ---
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [userRole, setUserRole] = useState('student');

  // --- Auxiliares de Formulário ---
  const [editingLesson, setEditingLesson] = useState({ title: '', video_url: '', description: '', teacher_id: '' });
  const [newResource, setNewResource] = useState({ title: '', url: '', type: 'pdf' });

  // Carregamento inicial: Busca lições e professores disponíveis
  useEffect(() => {
    setIsMounted(true);
    const supabase = createClient();

    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          if (profile) setUserRole(profile.role);
        }

        const [lessonsData, teachersResult] = await Promise.all([
          getLessons(),
          getTeachers()
        ]);
        
        setLessons(lessonsData);
        if (teachersResult.success) {
          setTeachers(teachersResult.data);
        }

        // Define a primeira aula como ativa por padrão se houver dados
        if (lessonsData.length > 0) {
          setActiveLesson(lessonsData[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Monitora a aula ativa para carregar seus recursos e status de conclusão
  useEffect(() => {
    if (activeLesson) {
      async function checkStatus() {
        const status = await getCompletionStatus(activeLesson.id);
        setIsCompleted(status);
        setJustCompleted(false);
      }
      checkStatus();
      getLessonResources(activeLesson.id).then(setResources);
    }
  }, [activeLesson]);

  const handleSelectLesson = (lesson) => {
    setActiveLesson(lesson);
  };

  /**
   * Registra a conclusão da aula no banco de dados.
   * Este processo dispara um trigger no Supabase que premia o aluno com +50 XP.
   */
  const handleComplete = async () => {
    if (!activeLesson || isCompleted || justCompleted) return;
    
    setIsCompleting(true);
    try {
      const result = await completeLesson(activeLesson.id);
      if (result.success) {
        // Feedback visual imediato e desabilita o botão
        setJustCompleted(true);
        setIsCompleted(true);
      } else {
        alert(result.error || 'Erro ao concluir aula.');
      }
    } catch (err) {
      alert('Erro na comunicação com o servidor.');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSaveLesson = async () => {
    try {
      const saved = await saveLesson(editingLesson);
      // Recarregar lições para garantir que o join com professores venha atualizado
      const updatedLessons = await getLessons();
      setLessons(updatedLessons);
      
      const updatedActive = updatedLessons.find(l => l.id === saved.id);
      setActiveLesson(updatedActive || saved);
      
      setShowAdminModal(false);
      setEditingLesson({ title: '', video_url: '', description: '', teacher_id: '' });
    } catch (err) {
      alert('Erro ao salvar aula.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Excluir aula?')) return;
    try {
      await deleteLesson(id);
      setLessons(lessons.filter(l => l.id !== id));
      if (activeLesson?.id === id) setActiveLesson(lessons[0] || null);
    } catch (err) {
      alert('Erro ao excluir.');
    }
  };

  const handleAddResource = async () => {
    if (!activeLesson) return;
    try {
      const resource = await addResource({ ...newResource, lesson_id: activeLesson.id });
      setResources([...resources, resource]);
      setShowResourceModal(false);
      setNewResource({ title: '', url: '', type: 'pdf' });
    } catch (err) {
      alert('Erro ao adicionar material.');
    }
  };

  const handleDeleteResource = async (id) => {
    try {
      await deleteResource(id);
      setResources(resources.filter(r => r.id !== id));
    } catch (err) {
      alert('Erro ao excluir material.');
    }
  };

  const renderVideo = () => {
    const url = activeLesson?.video_url || '';
    const youtubeIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/i);
    
    if (youtubeIdMatch && youtubeIdMatch[1]) {
      return (
        <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${youtubeIdMatch[1]}?autoplay=0&rel=0&modestbranding=1`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="absolute top-0 left-0" />
      );
    }

    if (url) {
      return <ReactPlayer url={url} width="100%" height="100%" controls className="absolute top-0 left-0" />;
    }

    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-600 italic">
        <Play size={48} className="opacity-20" />
        <p>Nenhum vídeo configurado.</p>
      </div>
    );
  };

  if (loading || !isMounted) return null;

  return (
    <div className="fixed inset-0 z-0 bg-[#020617] overflow-y-auto custom-scrollbar">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-10 py-10 min-h-screen flex flex-col lg:flex-row gap-8">
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {(userRole === 'admin' || userRole === 'coordinator') && (
                <button onClick={() => setIsAdminMode(!isAdminMode)} className={`p-2 rounded-xl transition-all ${isAdminMode ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}>
                  <Settings size={24} />
                </button>
              )}
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">{activeLesson?.title || 'Selecione uma aula'}</h1>
                <p className="text-xs text-primary-400 font-bold uppercase tracking-widest">{isAdminMode ? 'MODO EDITOR' : 'Módulo Acadêmico'}</p>
              </div>
            </div>
            {isAdminMode && (
              <button onClick={() => { setEditingLesson({ title: '', video_url: '', description: '', teacher_id: '' }); setShowAdminModal(true); }} className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                <Plus size={18} /> NOVA AULA
              </button>
            )}
          </div>

          <div className="relative aspect-video rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl border border-white/5">
            {renderVideo()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Info & Tools */}
            <div className="md:col-span-2 space-y-6">
              <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Descrição da Aula</span>
                  
                  {activeLesson?.professores && (
                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-black text-[10px] overflow-hidden">
                        {activeLesson.professores.avatar_url ? (
                          <img src={activeLesson.professores.avatar_url} alt={activeLesson.professores.nome_completo} className="w-full h-full object-cover" />
                        ) : (
                          activeLesson.professores.nome_completo.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-white leading-tight">{activeLesson.professores.nome_completo}</p>
                        <p className="text-[8px] font-medium text-slate-500 uppercase tracking-tighter">Professor Responsável</p>
                      </div>
                    </div>
                  )}

                  {isAdminMode && activeLesson && (
                    <button onClick={() => { setEditingLesson(activeLesson); setShowAdminModal(true); }} className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-all">
                      <Settings size={18} />
                    </button>
                  )}
                </div>
                <p className="text-slate-400 leading-relaxed font-medium">
                  {activeLesson?.description || 'Nenhuma descrição disponível para esta aula.'}
                </p>
              </div>

              {/* Materiais de Apoio */}
              <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <FileText size={20} className="text-primary" />
                    Materiais de Apoio
                  </h3>
                  {isAdminMode && activeLesson && (
                    <button onClick={() => setShowResourceModal(true)} className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all">
                      <Plus size={20} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {resources.length === 0 ? (
                    <div className="col-span-full py-6 text-center text-slate-600 italic text-sm border-2 border-dashed border-white/5 rounded-2xl">
                      Nenhum material disponível para esta aula.
                    </div>
                  ) : (
                    resources.map(res => (
                      <div key={res.id} className="group relative flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-all">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-200 truncate max-w-[150px]">{res.title}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase">{res.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a href={res.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 text-slate-400 hover:text-white rounded-lg transition-all">
                            <Download size={16} />
                          </a>
                          {isAdminMode && (
                            <button onClick={() => handleDeleteResource(res.id)} className="p-2 text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Tools */}
            <div className="space-y-6">
              <button 
                onClick={handleComplete}
                disabled={isCompleted || isCompleting}
                className={`w-full px-10 py-6 text-white rounded-[2rem] font-black text-sm transition-all shadow-xl flex items-center justify-center gap-3
                  ${isCompleted 
                    ? 'bg-slate-700 cursor-default shadow-none opacity-50' 
                    : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 active:scale-95'
                  }
                `}
              >
                {isCompleting ? (
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 size={24} /> 
                    {isCompleted ? 'AULA CONCLUÍDA' : 'CONCLUIR AULA'}
                  </>
                )}
              </button>

              <div className="bg-primary/10 border border-primary/20 rounded-[2.5rem] p-8">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Monitor size={18} className="text-primary" /> Trilha de Aulas
                </h3>
                <div className="space-y-3 overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
                  {lessons.map((lesson) => (
                    <button 
                      key={lesson.id}
                      onClick={() => handleSelectLesson(lesson)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border text-left
                        ${activeLesson?.id === lesson.id ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10'}
                      `}
                    >
                      <Play size={14} className={activeLesson?.id === lesson.id ? 'text-white' : 'text-primary'} />
                      <span className="font-bold text-xs truncate">{lesson.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Modals */}
      <AnimatePresence>
        {showAdminModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdminModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-xl bg-white rounded-[3rem] p-10 shadow-2xl">
              <h3 className="text-2xl font-black text-slate-900 mb-8">{editingLesson.id ? 'Editar Aula' : 'Nova Aula'}</h3>
              <div className="space-y-6">
                <input value={editingLesson.title} onChange={(e) => setEditingLesson({...editingLesson, title: e.target.value})} placeholder="Título" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" />
                <input value={editingLesson.video_url} onChange={(e) => setEditingLesson({...editingLesson, video_url: e.target.value})} placeholder="URL Vídeo" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-primary" />
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Professor Responsável</label>
                  <select 
                    value={editingLesson.teacher_id || ''} 
                    onChange={(e) => setEditingLesson({...editingLesson, teacher_id: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none appearance-none"
                  >
                    <option value="">Selecione um professor</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.nome_completo}</option>
                    ))}
                  </select>
                </div>

                <textarea value={editingLesson.description} onChange={(e) => setEditingLesson({...editingLesson, description: e.target.value})} placeholder="Descrição" rows={3} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl" />
              </div>
              <div className="mt-10 flex gap-4">
                <button onClick={() => setShowAdminModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black">CANCELAR</button>
                <button onClick={handleSaveLesson} className="flex-1 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20">SALVAR</button>
              </div>
            </motion.div>
          </div>
        )}

        {showResourceModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowResourceModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg bg-white rounded-[3rem] p-10 shadow-2xl">
              <h3 className="text-2xl font-black text-slate-900 mb-8">Anexar Material</h3>
              <div className="space-y-6">
                <input value={newResource.title} onChange={(e) => setNewResource({...newResource, title: e.target.value})} placeholder="Título do arquivo (ex: Apostila Aula 01)" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" />
                <input value={newResource.url} onChange={(e) => setNewResource({...newResource, url: e.target.value})} placeholder="Link do arquivo (Google Drive, Dropbox, etc)" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-primary" />
                <select value={newResource.type} onChange={(e) => setNewResource({...newResource, type: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none">
                  <option value="pdf">PDF / Documento</option>
                  <option value="link">Link Externo</option>
                  <option value="audio">Áudio / MP3</option>
                  <option value="video">Vídeo Extra</option>
                </select>
              </div>
              <div className="mt-10 flex gap-4">
                <button onClick={() => setShowResourceModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black">CANCELAR</button>
                <button onClick={handleAddResource} className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20">ADICIONAR</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
