'use client';

import React from 'react';
import BrandLogo from './BrandLogo';

/**
 * Minimalist Monochrome Glassmorphic Footer
 * Author: Jayaditya
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-14 border-t border-white/[0.06] bg-zinc-950/40 backdrop-blur-xl py-8">
      <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-5 text-xs text-zinc-500">
        <BrandLogo />

        <div className="text-center sm:text-right">
          <p className="text-zinc-400">
            © {currentYear} <strong className="text-white font-medium">ResQRoute™</strong>. Built by{' '}
            <span
              className="text-white font-semibold cursor-pointer underline underline-offset-4 decoration-white/30 hover:decoration-white transition"
              title="Author: Jayaditya"
            >
              Jayaditya
            </span>
          </p>
          <p className="text-[11px] text-zinc-600 mt-1 font-mono">
            Graph Representation • Breadth-First Search (BFS)
          </p>
        </div>
      </div>
    </footer>
  );
}
