'use client';

import { useState, useEffect } from 'react';
import { WiDaySunny, WiNightClear } from 'react-icons/wi';

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check if theme is stored in localStorage
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out z-50"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-6 h-6">
        <WiDaySunny
          className={`absolute w-6 h-6 text-yellow-500 transition-all duration-300 ${
            theme === 'light' ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
          }`}
        />
        <WiNightClear
          className={`absolute w-6 h-6 text-blue-400 transition-all duration-300 ${
            theme === 'dark' ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'
          }`}
        />
      </div>
    </button>
  );
}; 