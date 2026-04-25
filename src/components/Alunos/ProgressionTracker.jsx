'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, ChevronRight } from 'lucide-react';

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function ProgressionTracker({ currentLevel }) {
  const currentIndex = levels.indexOf(currentLevel || 'A1');

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm overflow-hidden relative">
      {/* Background Decor */}
      <GraduationCap className="absolute -right-6 -bottom-6 text-slate-50 w-32 h-32 rotate-12 pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-1">Status de Proficiência</h4>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            Nível: <span className="text-primary">{currentLevel || 'A1'}</span>
            <span className="text-slate-300 mx-2 text-xl font-light">|</span>
            <span className="text-slate-400 text-lg font-medium">
              {
                currentLevel === 'A1' ? 'Basic' :
                currentLevel === 'A2' ? 'Pre-Intermediate' :
                currentLevel === 'B1' ? 'Intermediate' :
                currentLevel === 'B2' ? 'Upper-Intermediate' :
                currentLevel === 'C1' ? 'Advanced' :
                currentLevel === 'C2' ? 'Proficient' : 'Basic'
              }
            </span>
          </p>
        </div>

        <div className="flex-1 max-w-xl">
          <div className="flex items-center justify-between mb-4">
            {levels.map((level, index) => (
              <div key={level} className="flex flex-col items-center gap-2">
                <div 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-all duration-500 ${
                    index === currentIndex 
                      ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-125' 
                      : index < currentIndex 
                        ? 'bg-emerald-500/10 text-emerald-600' 
                        : 'bg-slate-50 text-slate-300'
                  }`}
                >
                  {level}
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bar Container */}
          <div className="relative h-2 bg-slate-50 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / levels.length) * 100}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-blue-400 rounded-full"
            />
          </div>
          
          <div className="flex justify-between mt-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">A1 • Basic</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">C2 • Proficient</span>
          </div>
        </div>
      </div>
    </div>
  );
}
