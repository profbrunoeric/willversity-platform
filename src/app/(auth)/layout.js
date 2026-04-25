import React from 'react';
import { GraduationCap } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
          <GraduationCap className="text-white w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 leading-tight">Willversity</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">The University of English</p>
        </div>
      </div>
      
      <div className="w-full max-w-md">
        {children}
      </div>

      <p className="mt-8 text-center text-slate-400 text-xs font-medium uppercase tracking-widest">
        &copy; 2024 Willversity Platform. All rights reserved.
      </p>
    </div>
  );
}
