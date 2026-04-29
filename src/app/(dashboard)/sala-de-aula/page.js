'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Plus, 
  Trash2, 
  X, 
  Video,
  ListTodo,
  FileText,
  GripVertical,
  CheckCircle2,
  Play
} from 'lucide-react';
import { 
  getModules, 
  saveModule, 
  deleteModule, 
  saveLesson, 
  deleteLesson,
  completeLesson,
  getCompletionStatus
} from './actions';
import { getTeachers } from '../professores/actions';
import { createClient } from '@/lib/supabase/client';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

// Offsets for the snake pattern path
const curveOffsets = [
  'translate-x-0', 'translate-x-16', 'translate-x-24', 'translate-x-16', 
  'translate-x-0', '-translate-x-16', '-translate-x-24', '-translate-x-16'
];

export default function SalaDeAulaPage() {
  const [modules, setModules] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [userRole, setUserRole] = useState('student');
  const [completions, setCompletions] = useState({}); // { lessonId: boolean }

  // Modal & Drawer State
  const [activeLessonEditor, setActiveLessonEditor] = useState(null); // Which lesson is in the Drawer
  const [activePlayerLesson, setActivePlayerLesson] = useState(null); // Which lesson is being watched

  const mapContainerRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Redraw SVG paths when modules/lessons change, or window resizes
    const timer = setTimeout(() => {
      drawSVGPaths();
    }, 100);
    
    window.addEventListener('resize', drawSVGPaths);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', drawSVGPaths);
    };
  }, [modules, isAdminMode]);

  const loadData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      let uid = null;
      if (user) {
        uid = user.id;
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile) setUserRole(profile.role);
      }

      const [modulesData, teachersResult] = await Promise.all([
        getModules(),
        getTeachers()
      ]);
      
      setModules(modulesData);
      if (teachersResult.success) {
        setTeachers(teachersResult.data);
      }

      // Check completions for the current user
      if (uid) {
        const { data: completionData } = await supabase
          .from('lesson_completions')
          .select('lesson_id')
          .eq('student_id', uid);
        
        const comps = {};
        completionData?.forEach(c => { comps[c.lesson_id] = true; });
        setCompletions(comps);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const drawSVGPaths = () => {
    if (!mapContainerRef.current || !svgRef.current) return;
    
    const container = mapContainerRef.current;
    const svg = svgRef.current;
    const nodes = Array.from(container.querySelectorAll('.lesson-node-target'));
    
    // Resize SVG to match container
    svg.setAttribute('height', container.scrollHeight);
    svg.setAttribute('width', container.clientWidth);
    
    let pathHtml = '';

    for (let i = 0; i < nodes.length - 1; i++) {
      const current = nodes[i];
      const next = nodes[i + 1];
      
      const rect1 = current.getBoundingClientRect();
      const rect2 = next.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      const x1 = (rect1.left - containerRect.left) + (rect1.width / 2);
      const y1 = (rect1.top - containerRect.top) + container.scrollTop + (rect1.height / 2);
      
      const x2 = (rect2.left - containerRect.left) + (rect2.width / 2);
      const y2 = (rect2.top - containerRect.top) + container.scrollTop + (rect2.height / 2);
      
      const cp1x = x1;
      const cp1y = y1 + (y2 - y1) / 2;
      const cp2x = x2;
      const cp2y = y1 + (y2 - y1) / 2;
      
      const isAddLine = current.classList.contains('is-add-btn') || next.classList.contains('is-add-btn');
      const strokeColor = isAddLine ? '#cbd5e1' : '#14b8a6'; // tailwind teal-500
      const strokeWidth = isAddLine ? '3' : '6';
      const strokeDash = isAddLine ? '8, 8' : 'none';
      
      pathHtml += `
        <path 
          d="M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}" 
          stroke="${strokeColor}" 
          fill="none" 
          stroke-width="${strokeWidth}" 
          stroke-linecap="round"
          stroke-dasharray="${strokeDash}"
          class="transition-all duration-300"
        />
      `;
    }
    svg.innerHTML = pathHtml;
  };

  // --- Actions ---

  const handleAddModule = async () => {
    try {
      const newModule = await saveModule({
        title: 'NOVA UNIDADE',
        description: 'Descrição da unidade',
        order_index: modules.length
      });
      setModules([...modules, { ...newModule, lessons: [] }]);
    } catch (err) {
      alert('Erro ao criar unidade');
    }
  };

  const handleUpdateModule = async (modId, field, value) => {
    const mod = modules.find(m => m.id === modId);
    if (!mod) return;
    const updatedMod = { ...mod, [field]: value };
    setModules(modules.map(m => m.id === modId ? updatedMod : m));
    
    // Save to DB (debounced/on blur ideally, but directly for now)
    await saveModule(updatedMod);
  };

  const handleDeleteModule = async (modId) => {
    if (!confirm('Deseja excluir esta unidade e todas as suas lições?')) return;
    try {
      await deleteModule(modId);
      setModules(modules.filter(m => m.id !== modId));
    } catch (err) {
      alert('Erro ao excluir unidade');
    }
  };

  const handleAddLesson = async (modId) => {
    const mod = modules.find(m => m.id === modId);
    if (!mod) return;
    try {
      const newLesson = await saveLesson({
        module_id: modId,
        title: 'Nova Lição',
        icon: '📝',
        content_blocks: [],
        order_index: mod.lessons.length
      });
      const newMod = { ...mod, lessons: [...mod.lessons, newLesson] };
      setModules(modules.map(m => m.id === modId ? newMod : m));
      setActiveLessonEditor(newLesson);
    } catch (err) {
      alert('Erro ao criar lição');
    }
  };

  const handleSaveDrawerLesson = async () => {
    if (!activeLessonEditor) return;
    try {
      const saved = await saveLesson(activeLessonEditor);
      // Update local state
      setModules(modules.map(m => {
        if (m.id === saved.module_id) {
          return {
            ...m,
            lessons: m.lessons.map(l => l.id === saved.id ? saved : l)
          };
        }
        return m;
      }));
      setActiveLessonEditor(null);
    } catch (err) {
      alert('Erro ao salvar lição');
    }
  };

  const handleDrawerDeleteLesson = async () => {
    if (!confirm('Deseja excluir esta lição?')) return;
    try {
      await deleteLesson(activeLessonEditor.id);
      setModules(modules.map(m => ({
        ...m,
        lessons: m.lessons.filter(l => l.id !== activeLessonEditor.id)
      })));
      setActiveLessonEditor(null);
    } catch (err) {
      alert('Erro ao excluir lição');
    }
  };

  const handleCompleteLesson = async (lessonId) => {
    try {
      const result = await completeLesson(lessonId);
      if (result.success) {
        setCompletions({ ...completions, [lessonId]: true });
        setActivePlayerLesson(null); // Close player
      }
    } catch (err) {
      alert('Erro ao concluir lição');
    }
  };

  // --- Content Blocks Logic (Moodle Style) ---
  const addBlock = (type) => {
    const newBlock = {
      id: Date.now().toString(),
      type,
      title: type === 'video' ? 'Vídeo Aula' : type === 'quiz' ? 'Quiz' : 'Texto',
      url: '',
      content: ''
    };
    setActiveLessonEditor({
      ...activeLessonEditor,
      content_blocks: [...activeLessonEditor.content_blocks, newBlock]
    });
  };

  const updateBlock = (blockId, field, value) => {
    const newBlocks = activeLessonEditor.content_blocks.map(b => 
      b.id === blockId ? { ...b, [field]: value } : b
    );
    setActiveLessonEditor({ ...activeLessonEditor, content_blocks: newBlocks });
  };

  const removeBlock = (blockId) => {
    const newBlocks = activeLessonEditor.content_blocks.filter(b => b.id !== blockId);
    setActiveLessonEditor({ ...activeLessonEditor, content_blocks: newBlocks });
  };

  if (loading) return null;

  let globalNodeIndex = 0;

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden font-sans">
      
      {/* Header */}
      <header className="bg-slate-900 text-white z-40 px-6 py-4 shadow-md flex justify-between items-center relative flex-shrink-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-teal-500"></div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Trilha de Aprendizagem</h1>
          <p className="text-xs text-slate-400">
            {isAdminMode ? 'Toque nos nós para editar o currículo.' : 'Avance na sua jornada de conhecimento.'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {(userRole === 'admin' || userRole === 'coordinator') && (
            <button 
              onClick={() => setIsAdminMode(!isAdminMode)} 
              className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${isAdminMode ? 'bg-teal-500 text-white' : 'bg-white/10 hover:bg-white/20 text-slate-300'}`}
            >
              {isAdminMode ? 'SAIR DA EDIÇÃO' : 'MODO EDIÇÃO'}
            </button>
          )}
        </div>
      </header>

      {/* Main Map Container */}
      <main 
        ref={mapContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth bg-slate-50"
      >
        <svg ref={svgRef} className="absolute top-0 left-0 w-full pointer-events-none z-0" style={{ minHeight: '100%' }}></svg>
        
        <div className="relative z-10 max-w-2xl mx-auto pb-32 pt-10 px-4">
          
          {modules.map((mod, modIndex) => (
            <div key={mod.id} className="mb-20">
              {/* Module Header */}
              <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col relative group mx-auto mb-12 max-w-lg z-20">
                <div className="absolute -top-3 left-6 bg-teal-500 text-white px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-full shadow-md">
                  Unidade {modIndex + 1}
                </div>
                
                {isAdminMode ? (
                  <>
                    <input 
                      value={mod.title} 
                      onChange={(e) => handleUpdateModule(mod.id, 'title', e.target.value)}
                      className="font-black text-2xl text-slate-800 bg-transparent outline-none border-b border-transparent focus:border-teal-200 w-full mb-1 transition-colors"
                    />
                    <input 
                      value={mod.description} 
                      onChange={(e) => handleUpdateModule(mod.id, 'description', e.target.value)}
                      className="text-xs font-bold text-teal-600 tracking-widest uppercase bg-transparent outline-none w-full"
                    />
                    <button 
                      onClick={() => handleDeleteModule(mod.id)}
                      className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 bg-slate-50 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <h2 className="font-black text-2xl text-slate-800 mb-1">{mod.title}</h2>
                    <p className="text-xs font-bold text-teal-600 tracking-widest uppercase">{mod.description}</p>
                  </>
                )}
              </div>

              {/* Lesson Nodes */}
              <div className="flex flex-col items-center gap-10">
                {mod.lessons.map((lesson) => {
                  const offsetClass = curveOffsets[globalNodeIndex % curveOffsets.length];
                  globalNodeIndex++;
                  const isDone = completions[lesson.id];
                  
                  return (
                    <div key={lesson.id} className={`relative flex justify-center w-full z-20 lesson-node-target ${offsetClass} transition-transform duration-500`}>
                      <div className="relative group">
                        <button 
                          onClick={() => isAdminMode ? setActiveLessonEditor(lesson) : setActivePlayerLesson(lesson)}
                          className={`
                            w-20 h-20 rounded-full flex items-center justify-center relative 
                            border-[4px] shadow-[0_8px_0_0_rgba(0,0,0,0.1)] active:translate-y-2 active:shadow-none transition-all
                            ${isDone && !isAdminMode ? 'bg-teal-500 border-teal-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}
                            ${isAdminMode ? 'border-teal-400 hover:border-teal-500' : ''}
                          `}
                        >
                          <span className="text-3xl">{lesson.icon}</span>
                          
                          {/* Checked badge for students */}
                          {isDone && !isAdminMode && (
                            <div className="absolute -top-2 -right-2 bg-white text-teal-500 rounded-full p-0.5 border-2 border-teal-500">
                              <CheckCircle2 size={16} fill="currentColor" className="text-white" />
                            </div>
                          )}

                          {/* Hover Overlay for Admins */}
                          {isAdminMode && (
                            <div className="absolute inset-0 bg-teal-500/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Settings size={28} className="text-white" />
                            </div>
                          )}
                        </button>
                        
                        {/* Title Tooltip below node */}
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 font-bold text-slate-600 text-sm w-48 text-center whitespace-nowrap bg-white/90 px-3 py-1 rounded-xl shadow-sm backdrop-blur-sm pointer-events-none">
                          {lesson.title}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add Lesson Button (Admin Only) */}
                {isAdminMode && (
                  <div className={`relative flex justify-center w-full z-20 lesson-node-target is-add-btn ${curveOffsets[globalNodeIndex % curveOffsets.length]}`}>
                    <button 
                      onClick={() => handleAddLesson(mod.id)}
                      className="w-16 h-16 rounded-full flex items-center justify-center relative bg-slate-50 border-2 border-dashed border-slate-300 text-slate-400 hover:text-teal-500 hover:border-teal-500 hover:bg-teal-50 transition-all shadow-sm"
                    >
                      <Plus size={24} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add Module Button (Admin Only) */}
          {isAdminMode && (
            <div className="flex justify-center mt-10">
              <button 
                onClick={handleAddModule}
                className="bg-white border-2 border-dashed border-slate-300 text-slate-500 font-bold py-4 px-8 rounded-2xl flex items-center justify-center space-x-3 hover:border-teal-500 hover:text-teal-500 transition-all group shadow-sm"
              >
                <div className="bg-slate-100 p-2 rounded-full group-hover:bg-teal-100 transition-colors">
                  <Plus size={20} />
                </div>
                <span>Nova Unidade Curricular</span>
              </button>
            </div>
          )}

        </div>
      </main>

      {/* ADMIN DRAWER (Lesson Editor) */}
      <AnimatePresence>
        {activeLessonEditor && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setActiveLessonEditor(null)}
            />
            
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10"
            >
              {/* Drawer Header */}
              <div className="bg-white px-6 py-5 border-b border-slate-100 flex justify-between items-center z-20 shadow-sm">
                <div>
                  <span className="text-[10px] font-black text-teal-500 tracking-widest uppercase block mb-1">Construtor de Lição</span>
                  <h2 className="font-black text-xl text-slate-800 truncate max-w-[250px]">{activeLessonEditor.title}</h2>
                </div>
                <button onClick={() => setActiveLessonEditor(null)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50 custom-scrollbar">
                
                {/* Basic Config */}
                <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome da Lição</label>
                  <input 
                    value={activeLessonEditor.title}
                    onChange={(e) => setActiveLessonEditor({...activeLessonEditor, title: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  />
                  
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 mt-6">Ícone Representativo</label>
                  <div className="grid grid-cols-5 gap-2 text-2xl">
                    {['📝', '🎧', '🧩', '📖', '⭐️', '🎯', '💡', '🚀', '🔥', '🏆'].map(icon => (
                      <button 
                        key={icon}
                        onClick={() => setActiveLessonEditor({...activeLessonEditor, icon})}
                        className={`aspect-square rounded-xl flex items-center justify-center transition-all ${activeLessonEditor.icon === icon ? 'border-2 border-teal-500 bg-teal-50 shadow-sm scale-110' : 'border border-slate-200 bg-slate-50 grayscale hover:grayscale-0'}`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>

                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 mt-6">Link do Vídeo Antigo (Retrocompatibilidade)</label>
                  <input 
                    value={activeLessonEditor.video_url || ''}
                    onChange={(e) => setActiveLessonEditor({...activeLessonEditor, video_url: e.target.value})}
                    placeholder="URL do YouTube ou Vimeo"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-600 font-medium outline-none transition-all text-sm"
                  />
                </div>

                {/* Content Builder */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-slate-800">Conteúdo da Lição</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {activeLessonEditor.content_blocks?.length === 0 ? (
                      <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm font-medium">
                        Adicione blocos de conteúdo para construir a experiência.
                      </div>
                    ) : (
                      activeLessonEditor.content_blocks?.map((block) => (
                        <div key={block.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm group relative">
                          <div className="flex items-start gap-3">
                            <div className="pt-1 cursor-move text-slate-300 hover:text-teal-500">
                              <GripVertical size={16} />
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-2">
                                {block.type === 'video' && <Video size={16} className="text-rose-500" />}
                                {block.type === 'quiz' && <ListTodo size={16} className="text-indigo-500" />}
                                {block.type === 'text' && <FileText size={16} className="text-blue-500" />}
                                <span className="font-bold text-slate-700 text-sm uppercase tracking-wide">{block.title}</span>
                              </div>
                              
                              {/* Block Specific Editors */}
                              {block.type === 'video' && (
                                <input 
                                  value={block.url || ''} 
                                  onChange={(e) => updateBlock(block.id, 'url', e.target.value)}
                                  placeholder="URL do Vídeo" 
                                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs outline-none focus:border-teal-500" 
                                />
                              )}
                              {block.type === 'text' && (
                                <textarea 
                                  value={block.content || ''} 
                                  onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
                                  placeholder="Digite o conteúdo rico..." 
                                  rows={3}
                                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs outline-none focus:border-teal-500 resize-none" 
                                />
                              )}
                              {/* Quiz simplified for MVP */}
                              {block.type === 'quiz' && (
                                <div className="text-xs text-indigo-400 bg-indigo-50 p-2 rounded-lg font-medium">
                                  Construtor de Quiz em breve...
                                </div>
                              )}
                            </div>
                            <button onClick={() => removeBlock(block.id)} className="text-slate-300 hover:text-red-500 p-1 rounded transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Block Buttons */}
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <button onClick={() => addBlock('video')} className="bg-white border border-slate-200 hover:border-rose-400 text-slate-600 hover:text-rose-500 py-3 rounded-xl shadow-sm transition-all flex flex-col items-center gap-1">
                      <Video size={18} />
                      <span className="text-[10px] font-bold uppercase tracking-wide">Vídeo</span>
                    </button>
                    <button onClick={() => addBlock('quiz')} className="bg-white border border-slate-200 hover:border-indigo-400 text-slate-600 hover:text-indigo-500 py-3 rounded-xl shadow-sm transition-all flex flex-col items-center gap-1">
                      <ListTodo size={18} />
                      <span className="text-[10px] font-bold uppercase tracking-wide">Quiz</span>
                    </button>
                    <button onClick={() => addBlock('text')} className="bg-white border border-slate-200 hover:border-blue-400 text-slate-600 hover:text-blue-500 py-3 rounded-xl shadow-sm transition-all flex flex-col items-center gap-1">
                      <FileText size={18} />
                      <span className="text-[10px] font-bold uppercase tracking-wide">Texto</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Drawer Footer Actions */}
              <div className="bg-white border-t border-slate-100 p-4 flex gap-3 z-20">
                <button onClick={handleDrawerDeleteLesson} className="p-4 bg-slate-100 text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Excluir Lição">
                  <Trash2 size={20} />
                </button>
                <button onClick={handleSaveDrawerLesson} className="flex-1 bg-teal-500 text-white font-black py-4 rounded-xl shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-colors flex items-center justify-center gap-2">
                  <CheckCircle2 size={20} />
                  SALVAR LIÇÃO
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STUDENT PLAYER MODAL */}
      <AnimatePresence>
        {activePlayerLesson && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="relative w-full max-w-5xl bg-slate-900 rounded-[2rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden max-h-screen"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-white/5 bg-slate-900 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center text-2xl border border-teal-500/30">
                    {activePlayerLesson.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{activePlayerLesson.title}</h2>
                    <p className="text-teal-500 text-xs font-bold uppercase tracking-widest">{activePlayerLesson.description || 'Lição Interativa'}</p>
                  </div>
                </div>
                <button onClick={() => setActivePlayerLesson(null)} className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>

              {/* Content Body */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                
                {/* Fallback for old video urls if no blocks exist */}
                {activePlayerLesson.content_blocks?.length === 0 && activePlayerLesson.video_url && (
                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl mb-8 relative">
                    <ReactPlayer url={activePlayerLesson.video_url} width="100%" height="100%" controls className="absolute top-0 left-0" />
                  </div>
                )}

                {/* Render Rich Blocks */}
                <div className="space-y-8 max-w-3xl mx-auto">
                  {activePlayerLesson.content_blocks?.map(block => (
                    <div key={block.id} className="bg-slate-800/50 rounded-2xl p-6 border border-white/5">
                      <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                        {block.type === 'video' && <Video size={20} className="text-rose-400" />}
                        {block.type === 'text' && <FileText size={20} className="text-blue-400" />}
                        {block.title}
                      </h4>
                      
                      {block.type === 'video' && block.url && (
                        <div className="aspect-video w-full rounded-xl overflow-hidden bg-black relative">
                          <ReactPlayer url={block.url} width="100%" height="100%" controls className="absolute top-0 left-0" />
                        </div>
                      )}
                      
                      {block.type === 'text' && (
                        <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {block.content}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              </div>

              {/* Footer */}
              <div className="p-6 bg-slate-950 border-t border-white/5 flex justify-end">
                <button 
                  onClick={() => handleCompleteLesson(activePlayerLesson.id)}
                  disabled={completions[activePlayerLesson.id]}
                  className={`
                    px-8 py-4 rounded-xl font-black text-sm flex items-center gap-3 transition-all
                    ${completions[activePlayerLesson.id] 
                      ? 'bg-slate-800 text-teal-500 cursor-default border border-teal-500/30' 
                      : 'bg-teal-500 text-white hover:bg-teal-600 hover:scale-105 active:scale-95 shadow-xl shadow-teal-500/20'}
                  `}
                >
                  <CheckCircle2 size={20} />
                  {completions[activePlayerLesson.id] ? 'CONCLUÍDO' : 'CONCLUIR LIÇÃO (+50 XP)'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
