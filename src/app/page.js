'use client';

import React, { useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EvacuationGraph from '@/components/EvacuationGraph';
import {
  BLUEPRINT_SCENARIOS,
  HAZARD_TYPES,
  NODE_TYPES,
  breadthFirstSearch,
  computeRouteSafetyMetrics,
} from '@/lib/algorithms/graphLogic';
import { formatEvacuationTime } from '@/lib/utils';
import {
  Compass,
  Play,
  RotateCcw,
  Flame,
  CheckCircle2,
  AlertOctagon,
  Footprints,
  Navigation,
  Clock,
  GitGraph,
} from 'lucide-react';

export default function HomePage() {
  const scenario = BLUEPRINT_SCENARIOS.HIGH_RISE_OFFICE;

  // State
  const [graph, setGraph] = useState(() => JSON.parse(JSON.stringify(scenario.graph)));
  const [startNodeId, setStartNodeId] = useState(scenario.defaultStart);
  const [activePath, setActivePath] = useState([]);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Toggle fire hazard on a node
  const handleToggleHazard = (nodeId) => {
    setGraph((prev) => {
      const nextGraph = JSON.parse(JSON.stringify(prev));
      const current = nextGraph.nodes[nodeId]?.hazard;
      nextGraph.nodes[nodeId].hazard =
        current === HAZARD_TYPES.FIRE ? HAZARD_TYPES.NONE : HAZARD_TYPES.FIRE;
      return nextGraph;
    });
    setActivePath([]);
    setHasCalculated(false);
  };

  // Run BFS algorithm
  const handleRunBfs = useCallback(() => {
    const result = breadthFirstSearch(graph, startNodeId, scenario.defaultExits);
    setActivePath(result.path);
    setHasCalculated(true);
  }, [graph, startNodeId, scenario.defaultExits]);

  // Reset graph
  const handleReset = () => {
    const cleanGraph = JSON.parse(JSON.stringify(scenario.graph));
    setGraph(cleanGraph);
    setStartNodeId(scenario.defaultStart);
    setActivePath([]);
    setHasCalculated(false);
  };

  // Toggle random fire
  const handleRandomFire = () => {
    const validNodes = Object.values(graph.nodes).filter(
      (n) => n.id !== startNodeId && n.type !== NODE_TYPES.EXIT
    );
    if (validNodes.length > 0) {
      const target = validNodes[Math.floor(Math.random() * validNodes.length)];
      handleToggleHazard(target.id);
    }
  };

  // Metrics
  const metrics = computeRouteSafetyMetrics(graph, activePath);
  const routeSuccess = activePath.length > 0;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#050505] text-zinc-100 selection:bg-white selection:text-black">
      {/* 1. Floating Monochrome Glass Navbar */}
      <Navbar onReset={handleReset} />

      {/* 2. Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-24 pb-12">
        {/* Minimal Hero */}
        <div className="text-center py-6 sm:py-8 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] backdrop-blur-md border border-white/10 text-zinc-300 text-xs font-mono mb-3">
            <Compass className="w-3.5 h-3.5 text-white" />
            <span>Graph Representation • Breadth-First Search</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Emergency Evacuation{' '}
            <span className="text-zinc-400 font-light">
              Route Analyzer
            </span>
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Click any zone to set origin, toggle fire barriers, and compute the guaranteed minimum-door escape path using Breadth-First Search (BFS).
          </p>
        </div>

        {/* Action Controls Bar (Glassmorphic) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-950/60 backdrop-blur-2xl border border-white/10 shadow-lg mb-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-mono text-[11px]">ORIGIN:</span>
            <span className="font-medium text-white bg-white/[0.05] px-2.5 py-1 rounded-lg border border-white/10">
              📍 {graph.nodes[startNodeId]?.name || startNodeId}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRunBfs}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-black bg-white hover:bg-zinc-200 transition shadow-md shadow-white/5 cursor-pointer"
              title="Compute shortest door-hop evacuation route using Breadth-First Search"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Find Safe Exit (BFS)</span>
            </button>

            <button
              type="button"
              onClick={handleRandomFire}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium text-zinc-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition cursor-pointer"
              title="Add a fire barrier to test dynamic rerouting"
            >
              <Flame className="w-3.5 h-3.5 text-zinc-400" />
              <span>Toggle Fire</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-xl text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition cursor-pointer"
              title="Reset graph"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3. Evacuation Blueprint Canvas (Monochrome Glass) */}
        <div className="mb-4">
          <EvacuationGraph
            graph={graph}
            startNodeId={startNodeId}
            onSelectStart={(id) => {
              setStartNodeId(id);
              setActivePath([]);
              setHasCalculated(false);
            }}
            onToggleHazard={handleToggleHazard}
            activePath={activePath}
          />
        </div>

        {/* 4. Results Card (Glassmorphic) */}
        {hasCalculated && (
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/60 backdrop-blur-2xl border border-white/10 shadow-xl mb-8 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                {routeSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span className="font-bold text-sm text-white">
                      Evacuation Route Verified (Wave Level {metrics.doorHops})
                    </span>
                  </>
                ) : (
                  <>
                    <AlertOctagon className="w-4 h-4 text-zinc-400" />
                    <span className="font-bold text-sm text-zinc-300">
                      All Exit Routes Impassable due to Fire
                    </span>
                  </>
                )}
              </div>

              {routeSuccess && (
                <div className="flex items-center gap-4 text-xs font-mono text-zinc-300">
                  <span className="flex items-center gap-1 text-white font-semibold">
                    <Footprints className="w-3.5 h-3.5 text-zinc-400" />
                    {metrics.doorHops} Door Hops
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-zinc-400" />
                    {metrics.totalDistanceMeters}m
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    {formatEvacuationTime(metrics.estimatedTimeSeconds)}
                  </span>
                </div>
              )}
            </div>

            {/* Path Steps */}
            {routeSuccess && (
              <div className="mt-3">
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block mb-2">
                  Egress Waypoint Sequence:
                </span>
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {activePath.map((nodeId, i) => {
                    const node = graph.nodes[nodeId];
                    const isStart = i === 0;
                    const isExit = i === activePath.length - 1;

                    return (
                      <React.Fragment key={nodeId}>
                        <span
                          className={`px-2.5 py-1 rounded-lg font-medium border transition ${
                            isStart
                              ? 'bg-white/10 border-white/30 text-white'
                              : isExit
                              ? 'bg-white text-black font-bold border-white'
                              : 'bg-white/[0.03] border-white/10 text-zinc-300'
                          }`}
                          title={`Zone: ${node?.name || nodeId}`}
                        >
                          {node?.name || nodeId}
                        </span>
                        {!isExit && (
                          <span className="text-zinc-600 font-mono text-xs select-none">
                            ➔
                          </span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. Minimalist 2-Card Theory Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-zinc-950/40 backdrop-blur-xl border border-white/[0.08]">
            <h2 className="font-bold text-white flex items-center gap-1.5 mb-1.5 text-sm">
              <GitGraph className="w-4 h-4 text-zinc-300" />
              1. Graph Representation: G = (V, E)
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              Floorplans are modeled as an <strong>Adjacency List</strong>. Vertices (V) represent rooms, corridors, and exterior fire exits; Edges (E) represent doors and walkways. Active fire dynamically marks edges as impassable.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950/40 backdrop-blur-xl border border-white/[0.08]">
            <h2 className="font-bold text-white flex items-center gap-1.5 mb-1.5 text-sm">
              <Compass className="w-4 h-4 text-zinc-300" />
              2. Breadth-First Search (BFS)
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              Using a <strong>First-In-First-Out (FIFO) Queue</strong>, BFS searches outward level-by-level in O(V + E) time. In unweighted graphs, this guarantees the path with the fewest door crossings to minimize crush risks.
            </p>
          </div>
        </section>
      </main>

      {/* 6. Monochrome Glass Footer */}
      <Footer />
    </div>
  );
}
