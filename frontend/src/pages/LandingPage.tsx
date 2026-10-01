import React from 'react';
import { 
  BookOpen, Sparkles, GitCompare, FileText, Lightbulb, 
  Search, CheckCircle2, ArrowRight, ShieldCheck, Database, 
  Cpu, Layers, Award, Terminal, PlayCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PipelineExplainer } from '../components/presentation/PipelineExplainer';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const features = [
    {
      icon: BookOpen,
      title: "AI Paper Reader & Structured Digest",
      desc: "Instant extraction of Executive Summary, Problem, Motivation, Methodology, Dataset, and Limitations.",
      tag: "PyMuPDF + RAG"
    },
    {
      icon: GitCompare,
      title: "Multi-Paper Comparative Matrix",
      desc: "Side-by-side comparative matrices analyzing methodologies, datasets, algorithms, and metric gains.",
      tag: "Cross-Synthesis"
    },
    {
      icon: FileText,
      title: "10-Section Literature Review Generator",
      desc: "Synthesize full literature reviews with verifiable citations, thematic trends, and contradictions.",
      tag: "Full Review"
    },
    {
      icon: Sparkles,
      title: "10-Category Research Gap Finder",
      desc: "Discovers dataset, methodology, scalability, generalization, and evaluation gaps backed by evidence.",
      tag: "Gap Detection"
    },
    {
      icon: Lightbulb,
      title: "Hypothesis & Research Ideation",
      desc: "Brainstorm novel research questions, experimental variables, and ablation frameworks.",
      tag: "Ideation"
    },
    {
      icon: Search,
      title: "Semantic Discovery & Citation Graphs",
      desc: "Search millions of papers via Semantic Scholar Graph API and explore interactive citation graphs.",
      tag: "Topology Graph"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Header */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-heading font-bold text-lg text-slate-100">Scholar<span className="text-brand-400">Pulse</span></span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('presentation')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all hidden sm:block"
          >
            Viva / Presentation Deck
          </button>
          <button
            onClick={() => onNavigate('login')}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigate('register')}
            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-500/20 transition-all"
          >
            Create Account
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-20">
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Academic Intelligence & Literature Workspace</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-100 font-heading tracking-tight leading-[1.15]">
            Understand Research. Discover Connections. <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-300">Build Better Ideas.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            An AI-powered workspace for reading, analyzing, comparing and organizing research literature with zero hallucinations and verified citation grounding.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('register')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-xl shadow-brand-600/30 transition-all hover:scale-105"
            >
              <span>Start Researching</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
            >
              <PlayCircle className="w-4 h-4 text-emerald-400" />
              <span>Sign In to Workspace</span>
            </button>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold font-heading text-slate-100">Engineered for Rigorous Academic Workflows</h2>
            <p className="text-xs text-slate-400">Everything needed to move from reading a paper to synthesizing literature reviews and discovering novel thesis ideas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/40 transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {feat.tag}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-100">{feat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Architecture Flow Section */}
        <section>
          <PipelineExplainer />
        </section>

        {/* Target Users Breakdown */}
        <section className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold font-heading text-slate-100">Designed for Every Tier of Academic Research</h2>
            <p className="text-xs text-slate-400">Tailored modes for students, college faculty, and PhD research scholars.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-brand-400 text-sm">Student Researcher</span>
              <p className="text-slate-400 leading-relaxed">
                Transform dense mathematical formulas with "Explain Simply", generate structured digest notes, and format assignments into APA/IEEE citations.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-emerald-400 text-sm">College Faculty</span>
              <p className="text-slate-400 leading-relaxed">
                Evaluate student methodologies, generate multi-paper comparison matrices, and review curriculum citations in seconds.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-amber-400 text-sm">Research Scholar</span>
              <p className="text-slate-400 leading-relaxed">
                Perform cross-document RAG question answering, extract 10-category research gaps, and produce literature reviews for journal submission.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 px-6 text-center text-xs text-slate-500">
        <p>ScholarPulse &copy; 2026. Production-Style Research Paper Digest & Literature Assistant.</p>
        <p className="text-[11px] text-slate-600 mt-1">Built with FastAPI, PyMuPDF, Sentence Transformers, React & TypeScript.</p>
      </footer>
    </div>
  );
};
