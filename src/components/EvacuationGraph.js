'use client';

import React from 'react';
import { NODE_TYPES, HAZARD_TYPES } from '@/lib/algorithms/graphLogic';

/**
 * Monochrome Glassmorphic Evacuation Graph Canvas
 * Author: Jayaditya
 */
export default function EvacuationGraph({
  graph,
  startNodeId,
  onSelectStart,
  onToggleHazard,
  activePath = [],
}) {
  const nodes = Object.values(graph.nodes);
  const pathSet = new Set(activePath);

  // Filter edges without duplicates
  const renderedEdges = [];
  const processedEdges = new Set();

  for (const [sourceId, edges] of Object.entries(graph.adjacencyList)) {
    for (const edge of edges) {
      const pairKey = [sourceId, edge.target].sort().join('--');
      if (!processedEdges.has(pairKey)) {
        processedEdges.add(pairKey);
        renderedEdges.push({
          sourceId,
          targetId: edge.target,
          distance: edge.distance,
          isBlocked: edge.isBlocked,
        });
      }
    }
  }

  // Check if edge is on active BFS path
  const isEdgeInPath = (u, v) => {
    for (let i = 0; i < activePath.length - 1; i++) {
      if (
        (activePath[i] === u && activePath[i + 1] === v) ||
        (activePath[i] === v && activePath[i + 1] === u)
      ) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="relative w-full rounded-3xl bg-zinc-950/70 backdrop-blur-2xl border border-white/10 p-3 sm:p-5 select-none shadow-[0_16px_48px_0_rgba(0,0,0,0.7)]">
      {/* Top Glass Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/[0.06] mb-3 text-xs">
        <span className="text-zinc-400">
          Click any zone to set <strong className="text-white font-medium">Origin</strong> • Click indicator to toggle <strong className="text-white font-medium">Fire Barrier</strong>
        </span>

        <div className="flex items-center gap-4 text-[11px] font-mono">
          <div className="flex items-center gap-1.5" title="Occupant Origin Zone">
            <span className="w-2.5 h-2.5 rounded-full bg-white ring-2 ring-white/30" />
            <span className="text-zinc-300">Origin</span>
          </div>
          <div className="flex items-center gap-1.5" title="Safe Exterior Exit">
            <span className="w-2.5 h-2.5 rounded-md border border-white bg-white/20" />
            <span className="text-zinc-300">Exit</span>
          </div>
          <div className="flex items-center gap-1.5" title="Active Evacuation Path">
            <span className="w-4 h-0.5 bg-white shadow-[0_0_6px_#fff]" />
            <span className="text-zinc-300">BFS Path</span>
          </div>
          <div className="flex items-center gap-1.5" title="Impassable Fire Barrier">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 border border-zinc-500 text-[8px] flex items-center justify-center text-white" />
            <span className="text-zinc-400">Fire</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full aspect-[860/460]">
        <svg
          viewBox="0 0 860 460"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Ambient White Glow Filter for BFS Active Path */}
            <filter id="whiteGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. EDGES */}
          <g>
            {renderedEdges.map((edge, idx) => {
              const u = graph.nodes[edge.sourceId];
              const v = graph.nodes[edge.targetId];
              if (!u || !v) return null;

              const inPath = isEdgeInPath(edge.sourceId, edge.targetId);
              const isBlocked =
                edge.isBlocked ||
                u.hazard === HAZARD_TYPES.FIRE ||
                v.hazard === HAZARD_TYPES.FIRE;

              const midX = (u.x + v.x) / 2;
              const midY = (u.y + v.y) / 2;

              return (
                <g key={`edge-${idx}`}>
                  {/* Ambient path aura */}
                  {inPath && (
                    <line
                      x1={u.x}
                      y1={u.y}
                      x2={v.x}
                      y2={v.y}
                      stroke="#ffffff"
                      strokeWidth="6"
                      strokeOpacity="0.25"
                      strokeLinecap="round"
                    />
                  )}

                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke={inPath ? '#ffffff' : isBlocked ? '#3f3f46' : '#27272a'}
                    strokeWidth={inPath ? 3 : 1.5}
                    strokeDasharray={inPath ? '6,6' : isBlocked ? '4,4' : undefined}
                    className={inPath ? 'animate-route-pulse' : undefined}
                    strokeLinecap="round"
                    filter={inPath ? 'url(#whiteGlow)' : undefined}
                  />

                  {/* Distance badge */}
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-12"
                      y="-7"
                      width="24"
                      height="14"
                      rx="4"
                      fill="#09090b"
                      stroke={inPath ? '#ffffff' : isBlocked ? '#3f3f46' : '#27272a'}
                      strokeWidth="1"
                    />
                    <text
                      y="3.5"
                      textAnchor="middle"
                      className="text-[8px] font-mono fill-zinc-400 select-none"
                    >
                      {edge.distance}m
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* 2. NODES (Glassmorphic Cards) */}
          <g>
            {nodes.map((node) => {
              const isStart = node.id === startNodeId;
              const isExit = node.type === NODE_TYPES.EXIT;
              const inPath = pathSet.has(node.id);
              const isFire = node.hazard === HAZARD_TYPES.FIRE;

              const width = isExit ? 116 : node.type === NODE_TYPES.ROOM ? 106 : 88;
              const height = 44;

              let stroke = 'rgba(255, 255, 255, 0.12)';
              let bg = '#09090b';

              if (isStart) {
                stroke = '#ffffff';
                bg = '#18181b';
              } else if (isExit) {
                stroke = 'rgba(255, 255, 255, 0.8)';
                bg = '#121214';
              } else if (isFire) {
                stroke = '#3f3f46';
                bg = '#18181b';
              } else if (inPath) {
                stroke = '#ffffff';
                bg = '#18181b';
              }

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer group"
                  onClick={() => onSelectStart(node.id)}
                  title={`Zone: ${node.name} (${node.id})\nClick to set as Start Origin`}
                >
                  {/* Subtle ring animation for Start Origin and Exit */}
                  {(isStart || isExit) && (
                    <circle
                      r="30"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="1"
                      strokeOpacity="0.15"
                      className="animate-ping"
                    />
                  )}

                  {/* Card Rectangle */}
                  <rect
                    x={-width / 2}
                    y={-height / 2}
                    width={width}
                    height={height}
                    rx="10"
                    fill={bg}
                    stroke={stroke}
                    strokeWidth={isStart || inPath ? 2 : 1}
                    className="transition-colors duration-200 group-hover:stroke-white/50"
                  />

                  {/* Zone Name */}
                  <text
                    y="-4"
                    textAnchor="middle"
                    className="text-[11px] font-medium fill-zinc-100 select-none group-hover:fill-white"
                  >
                    {node.name.length > 14 ? node.name.slice(0, 13) + '…' : node.name}
                  </text>

                  {/* Sub-label */}
                  <text
                    y="11"
                    textAnchor="middle"
                    className="text-[9px] font-mono fill-zinc-400 select-none"
                  >
                    {isStart ? '📍 ORIGIN' : isExit ? '🚪 EXIT' : isFire ? '✕ FIRE' : `${node.id}`}
                  </text>

                  {/* Fire Toggle Badge */}
                  <g
                    transform={`translate(${width / 2 - 10}, ${-height / 2 + 8})`}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleHazard(node.id);
                    }}
                    title={isFire ? 'Fire active. Click to extinguish' : 'Clear. Click to set Fire'}
                  >
                    <circle
                      r="8"
                      fill={isFire ? '#ffffff' : '#18181b'}
                      stroke="rgba(255, 255, 255, 0.2)"
                      strokeWidth="1"
                    />
                    <text
                      y="3"
                      textAnchor="middle"
                      className={`text-[8px] font-bold select-none ${isFire ? 'fill-black' : 'fill-zinc-400'}`}
                    >
                      {isFire ? '🔥' : '•'}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
