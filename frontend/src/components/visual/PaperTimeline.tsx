import React from 'react';
import { Calendar, GitBranch, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Paper } from '../../types';

interface PaperTimelineProps {
  papers: Paper[];
  onSelectPaper: (paper: Paper) => void;
}

export const PaperTimeline: React.FC<PaperTimelineProps> = ({ papers, onSelectPaper }) => {
  const milestones = [
    {
      year: 2016,
      title: "Deep Residual Learning (ResNet)",
      author: "He et al.",
      paradigm: "Overcoming vanishing gradient degradation via identity skip connections.",
      tag: "Vision Backbone"
    },
    {
      year: 2017,
      title: "Attention Is All You Need (Transformer)",
      author: "Vaswani et al.",
      paradigm: "Eliminating recurrence with multi-head self-attention mechanisms.",
      tag: "Foundational Architecture"
    },
    {
      year: 2018,
      title: "BERT & Graph Attention Networks",
      author: "Devlin et al. / Veličković et al.",
      paradigm: "Bidirectional self-supervised pre-training & masked attention on graphs.",
      tag: "Pre-training"
    },
    {
      year: 2020,
      title: "Retrieval-Augmented Generation (RAG)",
      author: "Lewis et al.",
      paradigm: "Combining parametric LLM memory with non-parametric dense vector retrieval.",
      tag: "Grounded RAG"
    },
    {
      year: 2021,
      title: "LoRA: Low-Rank Adaptation",
      author: "Hu et al.",
      paradigm: "Parameter-efficient fine-tuning via intrinsic rank matrix decomposition.",
      tag: "PEFT & Efficiency"
    },
    {
      year: 2024,
      title: "Selective State-Space Models & Long-Context RAG",
      author: "Gu, Dao et al.",
      paradigm: "Sub-quadratic linear sequence modeling and multi-million token synthesis.",
      tag: "Sub-Quadratic Frontier"
    },
    {
      year: 2026,
      title: "Verifiable Neural-Symbolic Synthesis & Provenance",
      author: "Modern Frontier",
      paradigm: "Zero-hallucination grounded citation graphs and mechanistic explainability.",
      tag: "Current State"
    }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
          <GitBranch className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Research Literature Timeline & Paradigm Evolution</h3>
          <p className="text-[11px] text-slate-400">Chronological trajectory of core algorithmic breakthroughs and methodology transitions.</p>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 border-l-2 border-brand-500/30 space-y-6 my-2">
        {milestones.map((m, idx) => (
          <div key={m.year} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-950 border-2 border-brand-400 group-hover:scale-125 group-hover:bg-brand-500 transition-all flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-300"></span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 hover:border-brand-500/40 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-brand-400 font-mono">{m.year}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20">
                  {m.tag}
                </span>
              </div>
              <h4 className="text-xs font-semibold text-slate-100 mt-1">{m.title}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{m.author} &bull; {m.paradigm}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
