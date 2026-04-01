'use client';

import { useEffect } from 'react';

export function ThemeScript() {
  useEffect(() => {
    try {
      const theme = localStorage.getItem('theme');
      const isDark = theme === 'dark'
        || (theme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', isDark);
    }
    catch (e) {
      console.error('Failed to set theme:', e);
    }
  }, []);

  return null;
}
