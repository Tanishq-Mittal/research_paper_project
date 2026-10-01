import React, { useState } from 'react';
import { Network, ZoomIn, ZoomOut, RotateCcw, Info, ExternalLink } from 'lucide-react';
import { Paper } from '../../types';

interface CitationGraphProps {
  papers: Paper[];
  onSelectPaper: (paper: Paper) => void;
}

export const CitationGraph: React.FC<CitationGraphProps> = ({ papers, onSelectPaper }) => {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [zoom, setZoom] = useState<number>(1);

  // Nodes for papers
  const nodes = papers.map((p, idx) => {
    const angle = (idx / Math.max(1, papers.length)) * 2 * Math.PI;
    const radius = 140;
    const x = 280 + radius * Math.cos(angle);
    const y = 200 + radius * Math.sin(angle);
    return {
      id: p.id,
      title: p.title,
      year: p.publication_year || 2023,
      citations: p.citation_count || 0,
      x,
      y,
      paper: p
    };
  });

  // Central hub node
  const hubNode = {
    id: 'hub-core',
    title: 'Research Workspace Graph',
    year: 2026,
    citations: papers.reduce((acc, cur) => acc + (cur.citation_count || 0), 0),
    x: 280,
    y: 200,
    isHub: true
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl overflow-hidden relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Interactive Citation & Semantic Relationship Graph</h3>
            <p className="text-[11px] text-slate-400">Visual topology of citation linkages, foundational hubs, and influence clusters.</p>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-xs">
          <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="p-1 hover:text-brand-400">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setZoom(1)} className="p-1 hover:text-brand-400">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setZoom(z => Math.max(0.7, z - 0.1))} className="p-1 hover:text-brand-400">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Interactive Canvas */}
      <div className="relative w-full h-80 bg-slate-950/60 rounded-xl border border-slate-800/60 overflow-hidden flex items-center justify-center">
        <svg 
          viewBox="0 0 560 400" 
          className="w-full h-full cursor-grab active:cursor-grabbing transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Background Grid Pattern */}
          <defs>
            <pattern id="graph-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#334155" opacity="0.3" />
            </pattern>
            <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#graph-grid)" />

          {/* Connection Lines from Hub to Paper Nodes */}
          {nodes.map(n => (
            <line
              key={`edge-${n.id}`}
              x1={hubNode.x}
              y1={hubNode.y}
              x2={n.x}
              y2={n.y}
              stroke="url(#edgeGrad)"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
          ))}

          {/* Inter-Paper Cross Citation Links */}
          {nodes.length > 1 && (
            <path
              d={`M ${nodes[0].x} ${nodes[0].y} Q 280 120 ${nodes[1].x} ${nodes[1].y}`}
              fill="none"
              stroke="#10b981"
              strokeWidth="1.5"
              strokeOpacity="0.5"
            />
          )}
          {nodes.length > 2 && (
            <path
              d={`M ${nodes[1].x} ${nodes[1].y} Q 360 280 ${nodes[2].x} ${nodes[2].y}`}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeOpacity="0.5"
            />
          )}

          {/* Center Hub Node */}
          <g transform={`translate(${hubNode.x}, ${hubNode.y})`}>
            <circle r="26" fill="#4338ca" fillOpacity="0.3" className="animate-ping" />
            <circle r="22" fill="#4f46e5" stroke="#818cf8" strokeWidth="2" />
            <text textAnchor="middle" dy="4" fill="#ffffff" fontSize="10" fontWeight="bold">HUB</text>
          </g>

          {/* Paper Nodes */}
          {nodes.map(n => {
            const isSelected = selectedNode?.id === n.id;
            return (
              <g 
                key={n.id} 
                transform={`translate(${n.x}, ${n.y})`}
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => {
                  setSelectedNode(n);
                  if (n.paper) onSelectPaper(n.paper);
                }}
              >
                <circle 
                  r={isSelected ? 18 : 14} 
                  fill={isSelected ? '#10b981' : '#1e293b'} 
                  stroke={isSelected ? '#34d399' : '#6366f1'} 
                  strokeWidth={isSelected ? 3 : 2}
                  className="shadow-lg"
                />
                <text 
                  textAnchor="middle" 
                  dy="3.5" 
                  fill="#f8fafc" 
                  fontSize="9" 
                  fontWeight="bold"
                >
                  {n.year.toString().slice(-2)}
                </text>
                <text 
                  textAnchor="middle" 
                  dy="26" 
                  fill="#94a3b8" 
                  fontSize="8.5" 
                  fontWeight="500"
                  className="pointer-events-none select-none max-w-[100px]"
                >
                  {n.title.length > 18 ? n.title.slice(0, 18) + '...' : n.title}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Paper Details Overlay */}
        {selectedNode && (
          <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-900/95 border border-brand-500/40 rounded-xl backdrop-blur-md flex items-center justify-between text-xs animate-slide-up shadow-xl">
            <div>
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">Selected Paper Node</span>
              <p className="font-semibold text-slate-100">{selectedNode.title}</p>
              <p className="text-[11px] text-slate-400">Published: {selectedNode.year} &bull; Citations: {selectedNode.citations.toLocaleString()}</p>
            </div>
            <button
              onClick={() => {
                if (selectedNode.paper) onSelectPaper(selectedNode.paper);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-medium"
            >
              <span>Open Reader</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
