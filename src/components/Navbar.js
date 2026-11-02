'use client';

import React, { useState, useEffect } from 'react';
import BrandLogo from './BrandLogo';
import { RotateCcw } from 'lucide-react';

/**
 * Floating Monochrome Glassmorphic Navbar
 * Author: Jayaditya
 */
export default function Navbar({ onReset }) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 60) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <header
      className={`fixed top-4 inset-x-0 z-50 max-w-5xl mx-auto px-4 transition-all duration-300 ease-out transform ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0 pointer-events-none'
      }`}
    >
      <nav
        className="flex items-center justify-between px-5 py-3 rounded-2xl bg-zinc-950/60 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]"
        aria-label="Main Navigation"
      >
        <a href="#" className="cursor-pointer" title="ResQRoute - Home">
          <BrandLogo />
        </a>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition cursor-pointer"
            title="Reset active route and clear all fires"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <span>Reset</span>
          </button>

          <span
            className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/10 text-zinc-400 hidden sm:inline"
            title="Author: Jayaditya"
          >
            Jayaditya
          </span>
        </div>
      </nav>
    </header>
  );
}
