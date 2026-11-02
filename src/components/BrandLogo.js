'use client';

import React from 'react';

/**
 * BrandLogo Component - Monochrome Glassmorphism
 * Author: Jayaditya
 */
export default function BrandLogo({ size = 'default' }) {
  const isLarge = size === 'large';

  return (
    <div
      className="flex items-center gap-3 select-none group cursor-pointer"
      title="ResQRoute™ - Emergency Evacuation Analysis | Author: Jayaditya"
    >
      {/* Frosted Glass Emblem */}
      <div className={`relative ${isLarge ? 'w-11 h-11' : 'w-9 h-9'} rounded-xl bg-white/[0.04] backdrop-blur-xl border border-white/15 flex items-center justify-center shadow-lg group-hover:border-white/30 transition duration-300`}>
        <svg
          className={`${isLarge ? 'w-6 h-6' : 'w-4 h-4'} text-white group-hover:scale-105 transition-transform duration-200`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Minimalist Shield Outline */}
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="white" fillOpacity="0.08" />
          {/* Egress Vector Arrow */}
          <path d="M13 8l4 4-4 4" strokeWidth="2.5" />
          <path d="M7 12h10" strokeWidth="2.5" />
          <circle cx="7" cy="12" r="1.5" fill="white" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`${isLarge ? 'text-xl' : 'text-base'} font-black tracking-tight text-white`}>
            ResQ<span className="text-zinc-400 font-light">Route</span>
          </span>
          <span className="text-[9px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-zinc-300">
            BFS
          </span>
        </div>
        <span className="text-[10px] tracking-wide text-zinc-400 font-normal mt-0.5">
          Emergency Evacuation Engine
        </span>
      </div>
    </div>
  );
}
