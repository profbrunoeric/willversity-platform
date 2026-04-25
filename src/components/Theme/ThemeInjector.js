'use client';

import { useEffect, useState } from 'react';
import { getSettings } from '@/app/(dashboard)/configuracoes/actions';

export default function ThemeInjector() {
  const [primaryColor, setPrimaryColor] = useState('#294a70');

  useEffect(() => {
    async function applyTheme() {
      const settings = await getSettings();
      if (settings?.primary_color) {
        setPrimaryColor(settings.primary_color);
        document.documentElement.style.setProperty('--primary-color', settings.primary_color);
        
        // Gera uma versão mais escura para hover (simples)
        const darker = adjustColor(settings.primary_color, -20);
        document.documentElement.style.setProperty('--primary-color-hover', darker);
      }
    }
    applyTheme();
    
    // Opcional: Intervalo curto para checar mudanças sem refresh (Polling leve)
    const interval = setInterval(applyTheme, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <style jsx global>{`
      :root {
        --primary-color: ${primaryColor};
      }
    `}</style>
  );
}

function adjustColor(hex, amt) {
  let usePound = false;
  if (hex[0] === "#") {
    hex = hex.slice(1);
    usePound = true;
  }
  let num = parseInt(hex, 16);
  let r = (num >> 16) + amt;
  if (r > 255) r = 255; else if (r < 0) r = 0;
  let b = ((num >> 8) & 0x00FF) + amt;
  if (b > 255) b = 255; else if (b < 0) b = 0;
  let g = (num & 0x0000FF) + amt;
  if (g > 255) g = 255; else if (g < 0) g = 0;
  return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}
