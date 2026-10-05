import React from 'react';
import { 
  FileText, Scissors, Binary, Database, Search, 
  Cpu, CheckCircle2, ShieldAlert, ArrowRight, Layers 
} from 'lucide-react';

export const PipelineExplainer: React.FC = () => {
  const steps = [
    {
      icon: FileText,
      name: "PDF & OCR Ingestion",
      desc: "PyMuPDF parses raw binary buffers, cleans hyphenations, and extracts layout and metadata.",
      color: "text-blue-400 border-blue-500/30 bg-blue-500/10"
    },
    {
      icon: Scissors,
      name: "Section Detection",
      desc: "Academic regex heuristic engine classifies Abstract, Intro, Methods, Results, Limitations & References.",
      color: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10"
    },
    {
      icon: Binary,
      name: "Sliding Window Chunking",
      desc: "Segments text into token-bounded chunks (500 tokens with 80-token overlap) tagged with exact page numbers.",
      color: "text-purple-400 border-purple-500/30 bg-purple-500/10"
    },
    {
      icon: Database,
      name: "Vector Embeddings",
      desc: "SentenceTransformers (all-MiniLM-L6-v2) generates 384-dimensional unit-normalized embeddings.",
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
    },
    {
      icon: Search,
      name: "Semantic Vector Search",
      desc: "Cosine similarity dot products retrieve the top-K grounded evidence passages with relevance ranking.",
      color: "text-amber-400 border-amber-500/30 bg-amber-500/10"
    },
    {
      icon: Cpu,
      name: "Grounded LLM Synthesis",
      desc: "Synthesizes final answer with strict zero-hallucination constraints and verifiable section-page citations.",
      color: "text-rose-400 border-rose-500/30 bg-rose-500/10"
    }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30">
              System Architecture
            </span>
            <h3 className="text-base font-bold text-slate-100">AI / RAG Pipeline Architecture ("How this works")</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">End-to-end provenance workflow from unformatted PDF upload to verified grounded research intelligence.</p>
        </div>
      </div>

      {/* Visual Pipeline Horizontal Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 relative my-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div 
              key={step.name} 
              className={`p-3.5 rounded-xl border flex flex-col justify-between ${step.color} transition-all hover:scale-[1.02] shadow-sm`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold opacity-75">STEP 0{idx + 1}</span>
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-100">{step.name}</h4>
                <p className="text-[11px] text-slate-300/90 mt-1 leading-snug">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grounding Invariant Alert */}
      <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-semibold text-slate-200">Strict Academic Integrity & Zero-Hallucination Invariant</p>
          <p className="text-slate-400 mt-0.5 text-[11px] leading-relaxed">
            Unlike generic LLM chat wrappers, questions answered by LitNexa cite exact <b>Page Numbers</b> and <b>Section Titles</b>. If evidence is absent in the uploaded PDF, the system explicitly reports insufficient evidence rather than fabricating facts.

          </p>
        </div>
      </div>
    </div>
  );
};
