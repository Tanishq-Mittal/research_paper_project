import React, { useState } from 'react';
import { Layers, Sparkles, Filter } from 'lucide-react';
import { Paper } from '../../types';

interface TopicEmbeddingMapProps {
  papers: Paper[];
  onSelectPaper: (paper: Paper) => void;
}

export const TopicEmbeddingMap: React.FC<TopicEmbeddingMapProps> = ({ papers, onSelectPaper }) => {
  const [activeCluster, setActiveCluster] = useState<string>('All');

  const clusters = [
    { name: 'Large Language Models', color: '#6366f1', count: 3, x: 25, y: 35 },
    { name: 'Parameter-Efficient PEFT', color: '#10b981', count: 2, x: 70, y: 30 },
    { name: 'Computer Vision & Residuals', color: '#f59e0b', count: 2, x: 35, y: 75 },
    { name: 'Graph Attention Networks', color: '#ec4899', count: 1, x: 75, y: 70 },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">2D Semantic Embedding Topic Map</h3>
            <p className="text-[11px] text-slate-400">Dimensionality-reduced vector space clusters of research literature topics.</p>
          </div>
        </div>

        {/* Cluster Filter Buttons */}
        <div className="flex flex-wrap gap-1">
          {['All', 'LLMs', 'PEFT', 'Vision'].map(tag => (
            <button
              key={tag}
              onClick={() => setActiveCluster(tag)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                activeCluster === tag ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 2D Space Canvas */}
      <div className="relative w-full h-72 bg-slate-950/70 rounded-xl border border-slate-800/60 p-4 overflow-hidden">
        {/* Subtle coordinate axes */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-full border-t border-dashed border-slate-600"></div>
          <div className="h-full border-l border-dashed border-slate-600 absolute"></div>
        </div>

        {/* Cluster Regions */}
        {clusters.map((c) => (
          <div
            key={c.name}
            className="absolute p-3 rounded-2xl border transition-all duration-300 hover:scale-105 cursor-pointer backdrop-blur-sm"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              transform: 'translate(-50%, -50%)',
              borderColor: `${c.color}55`,
              backgroundColor: `${c.color}15`
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }}></span>
              <span className="text-xs font-semibold text-slate-200">{c.name}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">{c.count} Papers &bull; High Semantic Affinity</p>
          </div>
        ))}

        {/* Individual Paper Markers */}
        {papers.map((p, idx) => {
          const xPositions = [28, 68, 38, 72, 50];
          const yPositions = [38, 32, 72, 68, 50];
          const x = xPositions[idx % xPositions.length];
          const y = yPositions[idx % yPositions.length];

          return (
            <button
              key={p.id}
              onClick={() => onSelectPaper(p)}
              className="absolute group z-10 -translate-x-1/2 -translate-y-1/2 focus:outline-none"
              style={{ left: `${x}%`, top: `${y}%` }}
              title={p.title}
            >
              <div className="w-4 h-4 rounded-full bg-brand-400 border-2 border-slate-950 shadow-md group-hover:scale-150 group-hover:bg-emerald-400 transition-all"></div>
              <div className="hidden group-hover:block absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 bg-slate-900 border border-slate-700 text-white rounded text-[10px] font-medium shadow-xl">
                {p.title}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
