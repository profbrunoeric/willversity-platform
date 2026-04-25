'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Settings, 
  Palette, 
  Ticket, 
  Plus, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  Save, 
  Layout, 
  Sparkles,
  BookOpen,
  Megaphone,
  Eye,
  EyeOff,
  Trophy,
  Zap
} from 'lucide-react';
import { getSettings, updateSettings } from './actions';
import { getRegistrationCodes, generateCode, deleteCode } from './keys-actions';
import { getPedagogicalStages, updateStage } from './stages-actions';
import { getAnnouncements, createAnnouncement, toggleAnnouncement, deleteAnnouncement } from './announcements-actions';
import { getXPCategories, saveXPCategory, deleteXPCategory } from './xp-categories-actions';

import { Suspense } from 'react';

function ConfiguracoesContent() {
  const searchParams = useSearchParams();
  const [userRole, setUserRole] = useState('student');
  
  // Tab control: Defaults to 'branding' unless a 'tab' param is present in the URL
  const initialTab = searchParams.get('tab') || 'branding';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Main state for platform settings (Branding)
  const [config, setConfig] = useState({ platform_name: 'Willversity', platform_description: 'The University of English', primary_color: '#294a70' });
  
  // Lists for various CMS sections
  const [codes, setCodes] = useState([]);
  const [stages, setStages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [xpCategories, setXpCategories] = useState([]);
  
  // Auxiliary states for new item creation
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', type: 'info' });
  const [newCategory, setNewCategory] = useState({ label: '', default_xp: 10, color: '#294a70' });
  const [customKey, setCustomKey] = useState('');
  const [targetRole, setTargetRole] = useState('student');
  const [loading, setLoading] = useState(true);

  // Initial data fetch from all CMS modules
  useEffect(() => {
    async function loadData() {
      const supabase = createClient(); // Precisa importar o client
      const { data: { user } } = await supabase.auth.getUser();
      
      let role = 'student';
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile) {
          role = profile.role;
          setUserRole(role);
        }
      }

      // Se for aluno ou professor, redirecionar para dashboard (segurança básica no cliente)
      if (role === 'student' || role === 'teacher') {
        window.location.href = '/';
        return;
      }

      const [settings, cds, stgs, anns, xpCats] = await Promise.all([
        getSettings(), 
        getRegistrationCodes(), 
        getPedagogicalStages(), 
        getAnnouncements(), 
        getXPCategories()
      ]);
      if (settings) setConfig(settings);
      setCodes(cds);
      setStages(stgs);
      setAnnouncements(anns);
      setXpCategories(xpCats);
      setLoading(false);
    }
    loadData();
  }, []);

  const allTabs = [
    { id: 'branding', icon: Palette, label: 'Identidade', roles: ['admin'] },
    { id: 'keys', icon: Ticket, label: 'Matrículas', roles: ['admin'] },
    { id: 'pedagogy', icon: BookOpen, label: 'Metodologia', roles: ['admin', 'coordinator'] },
    { id: 'announcements', icon: Megaphone, label: 'Avisos', roles: ['admin', 'coordinator'] },
    { id: 'gamification', icon: Trophy, label: 'Gamificação', roles: ['admin'] }
  ];

  const filteredTabs = allTabs.filter(tab => tab.roles.includes(userRole));

  /**
   * Section: Branding
   * Updates platform name, slogan, and primary color
   */
  const handleSaveSettings = async () => {
    try {
      await updateSettings(config);
      alert('Configurações salvas com sucesso!');
    } catch (err) { alert('Erro ao salvar configurações.'); }
  };

  /**
   * Section: Registration Keys
   * Generates a unique access code for new students or teachers
   */
  const handleGenerateKey = async () => {
    try {
      const result = await generateCode(customKey || null, targetRole);
      setCodes([result, ...codes]);
      setCustomKey('');
      alert(`Chave de ${targetRole === 'teacher' ? 'PROFESSOR' : 'ALUNO'} gerada com sucesso!`);
    } catch (err) { 
      console.error(err);
      alert('Erro ao gerar código. Verifique se o banco de dados foi atualizado.'); 
    }
  };

  const handleDeleteKey = async (id) => {
    if (!confirm('Excluir este código?')) return;
    try {
      await deleteCode(id);
      setCodes(codes.filter(c => c.id !== id));
    } catch (err) { alert('Erro ao excluir.'); }
  };

  /**
   * Section: Global Announcements
   * Creates notifications visible to all active users
   */
  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) return;
    try {
      const result = await createAnnouncement(newAnnouncement);
      setAnnouncements([result, ...announcements]);
      setNewAnnouncement({ title: '', content: '', type: 'info' });
      alert('Aviso publicado!');
    } catch (err) { alert('Erro ao publicar aviso.'); }
  };

  const handleToggleAnnouncement = async (id, currentStatus) => {
    try {
      await toggleAnnouncement(id, !currentStatus);
      setAnnouncements(announcements.map(a => a.id === id ? { ...a, is_active: !currentStatus } : a));
    } catch (err) { alert('Erro ao alterar status.'); }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!confirm('Excluir aviso?')) return;
    try {
      await deleteAnnouncement(id);
      setAnnouncements(announcements.filter(a => a.id !== id));
    } catch (err) { alert('Erro ao excluir.'); }
  };

  /**
   * Section: Pedagogical Stages (Methodology)
   * Updates descriptions of the 5 learning stages
   */
  const handleUpdateStage = async (id, name, description) => {
    try {
      await updateStage(id, name, description);
      setStages(stages.map(s => s.id === id ? { ...s, name, description } : s));
      alert('Estágio atualizado!');
    } catch (err) { alert('Erro ao atualizar estágio.'); }
  };

  /**
   * Section: Gamification
   * Manages XP reward categories
   */
  const handleSaveXPCategory = async () => {
    try {
      const saved = await saveXPCategory(newCategory);
      setXpCategories([...xpCategories.filter(c => c.id !== saved.id), saved]);
      setNewCategory({ label: '', default_xp: 10, color: '#294a70' });
      alert('Categoria salva!');
    } catch (err) { alert('Erro ao salvar categoria.'); }
  };

  const handleDeleteXPCategory = async (id) => {
    if (!confirm('Excluir esta categoria? Isso pode afetar lançamentos futuros.')) return;
    try {
      await deleteXPCategory(id);
      setXpCategories(xpCategories.filter(c => c.id !== id));
    } catch (err) { alert('Erro ao excluir.'); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/30"><Settings size={28} /></div>
          Command Center
        </h2>
      </div>

      <div className="flex gap-2 p-1.5 bg-slate-100 w-fit rounded-[1.5rem] overflow-x-auto shadow-inner">
        {filteredTabs.map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)} 
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'branding' && (
          <motion.div key="branding" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="glass-card p-10 space-y-8">
              {/* Logo Preview */}
              <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                <img src="/logo.png" alt="Logo Atual" className="h-32 w-auto object-contain drop-shadow-xl" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Logo Oficial da Plataforma</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Plataforma</label>
                  <input value={config.platform_name} onChange={(e) => setConfig({...config, platform_name: e.target.value})} placeholder="Ex: Willversity" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:border-primary transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cor Primária</label>
                  <div className="flex items-center gap-4">
                    <input type="color" value={config.primary_color} onChange={(e) => setConfig({...config, primary_color: e.target.value})} className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-white shadow-lg" />
                    <code className="bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold text-slate-500 uppercase">{config.primary_color}</code>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Slogan ou Descrição</label>
                <input value={config.platform_description} onChange={(e) => setConfig({...config, platform_description: e.target.value})} placeholder="Ex: The University of English" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-600 outline-none focus:bg-white focus:border-primary transition-all" />
              </div>
              <button onClick={handleSaveSettings} className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                SALVAR ALTERAÇÕES
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'keys' && (
          <motion.div key="keys" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            <section className="glass-card p-10">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Gerar Nova Chave</h3>
              
              <div className="flex flex-col gap-6">
                {/* Role Selector */}
                <div className="flex gap-4 p-1.5 bg-slate-100 w-fit rounded-2xl">
                  <button 
                    onClick={() => setTargetRole('student')}
                    className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${targetRole === 'student' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
                  >
                    CHAVE DE ALUNO
                  </button>
                  <button 
                    onClick={() => setTargetRole('teacher')}
                    className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${targetRole === 'teacher' ? 'bg-primary text-white shadow-md' : 'text-slate-500'}`}
                  >
                    CHAVE DE PROFESSOR
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <input 
                    value={customKey} 
                    onChange={(e) => setCustomKey(e.target.value.toUpperCase())}
                    placeholder="CÓDIGO CUSTOMIZADO (OPCIONAL)" 
                    className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-700 outline-none focus:bg-white transition-all" 
                  />
                  <button onClick={handleGenerateKey} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all">GERAR CHAVE</button>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {codes
                .filter(code => {
                  // Se o código não tiver target_role, assumimos que é 'student' (legado)
                  const role = code.target_role || 'student';
                  return role === targetRole;
                })
                .map(code => (
                <div key={code.id} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm relative group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col gap-2">
                      <span className={`w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${code.used_at ? 'bg-slate-100 text-slate-400' : 'bg-emerald-100 text-emerald-600'}`}>
                        {code.used_at ? 'Utilizado' : 'Disponível'}
                      </span>
                      <span className={`w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${code.target_role === 'teacher' ? 'bg-primary/10 text-primary' : 'bg-blue-100 text-blue-600'}`}>
                        {code.target_role === 'teacher' ? 'Professor' : 'Aluno'}
                      </span>
                    </div>
                    <button onClick={() => handleDeleteKey(code.id)} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 font-mono tracking-widest mb-4">{code.code}</h4>
                  {code.used_at ? (
                    <p className="text-xs text-slate-400 font-medium">Usado por: <span className="text-slate-700 font-bold">{code.used_by_profile?.full_name}</span></p>
                  ) : (
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(code.code);
                        alert('Copiado!');
                      }}
                      className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest hover:underline"
                    >
                      <Copy size={14} /> Copiar Código
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'announcements' && (
          <motion.div key="announcements" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            <section className="glass-card p-10 space-y-6">
              <h3 className="text-xl font-bold text-slate-900">Novo Comunicado Global</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <input value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})} placeholder="Título do Aviso" className="md:col-span-2 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" />
                <select value={newAnnouncement.type} onChange={(e) => setNewAnnouncement({...newAnnouncement, type: e.target.value})} className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none">
                  <option value="info">Informativo (Azul)</option>
                  <option value="success">Novidade (Verde)</option>
                  <option value="warning">Urgente (Vermelho)</option>
                </select>
              </div>
              <textarea value={newAnnouncement.content} onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})} placeholder="Conteúdo da mensagem..." rows={3} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" />
              <button onClick={handleCreateAnnouncement} className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20">PUBLICAR AVISO</button>
            </section>

            <div className="space-y-4">
              {announcements.map(ann => (
                <div key={ann.id} className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-3xl hover:shadow-md transition-all group">
                  <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-2xl ${ann.type === 'warning' ? 'bg-rose-500' : ann.type === 'success' ? 'bg-emerald-500' : 'bg-primary'} text-white`}>
                      <Megaphone size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{ann.title}</h4>
                      <p className="text-sm text-slate-500">{ann.content}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleToggleAnnouncement(ann.id, ann.is_active)} className={`p-3 rounded-xl transition-all ${ann.is_active ? 'text-primary bg-primary/5' : 'text-slate-300 hover:text-slate-600'}`}>
                      {ann.is_active ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                    <button onClick={() => handleDeleteAnnouncement(ann.id)} className="p-3 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'pedagogy' && (
          <motion.div key="pedagogy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stages.map(stage => (
                <div key={stage.id} className="glass-card p-10 space-y-6 group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-lg">0{stage.id}</div>
                    <h4 className="text-xl font-bold text-slate-900">Estágio {stage.id}</h4>
                  </div>
                  <div className="space-y-4">
                    <input 
                      value={stage.name} 
                      onChange={(e) => {
                        const newName = e.target.value;
                        setStages(stages.map(s => s.id === stage.id ? { ...s, name: newName } : s));
                      }}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" 
                    />
                    <textarea 
                      value={stage.description} 
                      onChange={(e) => {
                        const newDesc = e.target.value;
                        setStages(stages.map(s => s.id === stage.id ? { ...s, description: newDesc } : s));
                      }}
                      rows={3} 
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none" 
                    />
                    <button onClick={() => handleUpdateStage(stage.id, stage.name, stage.description)} className="flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-xl font-bold text-xs hover:bg-primary hover:text-white transition-all w-fit">
                      <Save size={16} /> ATUALIZAR ESTÁGIO
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'gamification' && (
          <motion.div key="gamification" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            <section className="glass-card p-10 space-y-6">
              <h3 className="text-xl font-bold text-slate-900">Nova Categoria de XP</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <input value={newCategory.label} onChange={(e) => setNewCategory({...newCategory, label: e.target.value})} placeholder="Nome (Ex: Atividade Extra)" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" />
                <input type="number" value={newCategory.default_xp} onChange={(e) => setNewCategory({...newCategory, default_xp: parseInt(e.target.value) || 10})} placeholder="XP Padrão" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" />
                <div className="flex items-center gap-4">
                  <input type="color" value={newCategory.color} onChange={(e) => setNewCategory({...newCategory, color: e.target.value})} className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-white shadow-lg" />
                  <button onClick={handleSaveXPCategory} className="flex-1 py-5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20">CRIAR CATEGORIA</button>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {xpCategories.map(cat => (
                <div key={cat.id} className="p-8 bg-white border border-slate-100 rounded-[3rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group">
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: cat.color }}>
                      <Zap size={28} />
                    </div>
                    <button onClick={() => handleDeleteXPCategory(cat.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <h4 className="font-black text-slate-900 text-xl tracking-tight">{cat.label}</h4>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-[0.15em]">Valor Base:</span>
                    <span className="text-sm font-black text-primary bg-primary/5 px-3 py-1 rounded-lg">{cat.default_xp} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ConfiguracoesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <ConfiguracoesContent />
    </Suspense>
  );
}
