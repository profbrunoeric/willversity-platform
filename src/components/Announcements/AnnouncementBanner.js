'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Megaphone, X, Info, AlertTriangle, PartyPopper } from 'lucide-react';
import { getAnnouncements } from '@/app/(dashboard)/configuracoes/announcements-actions';

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    async function loadAnnouncements() {
      const data = await getAnnouncements();
      setAnnouncements(data.filter(a => a.is_active));
    }
    loadAnnouncements();
  }, []);

  if (!isVisible || announcements.length === 0) return null;

  const current = announcements[currentIndex];

  const getStyles = (type) => {
    switch (type) {
      case 'warning': return 'bg-rose-500 text-white shadow-rose-500/20';
      case 'success': return 'bg-emerald-500 text-white shadow-emerald-500/20';
      default: return 'bg-primary text-white shadow-primary/20';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle size={20} />;
      case 'success': return <PartyPopper size={20} />;
      default: return <Megaphone size={20} />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`relative w-full p-4 rounded-[2rem] shadow-2xl flex items-center justify-between gap-4 overflow-hidden mb-8 ${getStyles(current.type)}`}
      >
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
            {getIcon(current.type)}
          </div>
          <div>
            <h4 className="font-black text-sm tracking-tight">{current.title}</h4>
            <p className="text-xs font-medium opacity-90">{current.content}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          {announcements.length > 1 && (
            <div className="flex gap-1 mr-2">
              {announcements.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-4' : 'bg-white/40'}`} 
                />
              ))}
            </div>
          )}
          <button 
            onClick={() => setIsVisible(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition-all"
          >
            <X size={18} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
