import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, CheckCircle2, Award, 
  Layers, Cpu, Database, Sparkles, BookOpen, ShieldCheck, Download
} from 'lucide-react';
import { PipelineExplainer } from './PipelineExplainer';

export const VivaDeck: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "1. Problem Statement & Motivation",
      subtitle: "Why Academic Literature Review is Broken Today",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-slate-300">
              <h4 className="font-bold text-red-400 text-sm mb-1.5">Traditional Literature Review Bottlenecks</h4>
              <ul className="space-y-1.5 list-disc pl-4 text-slate-300">
                <li>Thousands of papers published weekly; impossible for humans to parse manually.</li>
                <li>Generic LLM chat wrappers hallucinate fake citations, metrics, and authors.</li>
                <li>Cross-paper synthesis and matrix comparison requires hours of manual spreadsheet work.</li>
                <li>Difficult mathematical formulations deter undergraduate and early-career researchers.</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-300">
              <h4 className="font-bold text-emerald-400 text-sm mb-1.5">Our Proposed Solution: ScholarPulse</h4>
              <ul className="space-y-1.5 list-disc pl-4 text-slate-300">
                <li>End-to-end RAG system with verifiable page/section citation grounding.</li>
                <li>Automated 10-category research gap finder and multi-paper comparative matrix.</li>
                <li>"Explain Like I'm a Student" mode (Beginner, Intermediate, Technical).</li>
                <li>Exportable formatted literature reviews (APA, IEEE, MLA, Chicago, BibTeX).</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "2. Full-Stack System Architecture",
      subtitle: "Modern Modular Separation of Concerns",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <h4 className="font-bold text-brand-400 text-sm mb-2">Frontend Tier</h4>
              <p className="text-slate-400 leading-relaxed">React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons, Recharts, SVG Force Graphs.</p>
              <div className="mt-3 text-[11px] text-slate-400 bg-slate-900 p-2 rounded">
                Dark/Light Theme &bull; Ctrl+K Command Palette &bull; Responsive Split-View
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <h4 className="font-bold text-emerald-400 text-sm mb-2">Backend & Database</h4>
              <p className="text-slate-400 leading-relaxed">FastAPI async REST endpoints, SQLAlchemy 2.0 ORM, SQLite / PostgreSQL, JWT Auth.</p>
              <div className="mt-3 text-[11px] text-slate-400 bg-slate-900 p-2 rounded">
                15+ Relational Tables &bull; PyMuPDF Layout Extractor &bull; Export Engine
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <h4 className="font-bold text-purple-400 text-sm mb-2">AI & RAG Layer</h4>
              <p className="text-slate-400 leading-relaxed">SentenceTransformers & TF-IDF Vector Index, Cosine Similarity, Gemini / OpenAI Router.</p>
              <div className="mt-3 text-[11px] text-slate-400 bg-slate-900 p-2 rounded">
                Zero-Hallucination Invariant &bull; Multi-Paper Retrieval &bull; Gap Detector
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "3. End-to-End RAG Pipeline",
      subtitle: "Deterministic Evidence Extraction & Grounded Generation",
      content: <PipelineExplainer />
    },
    {
      title: "4. Live Demo Workflow & Key Features",
      subtitle: "Step-by-Step Viva Demonstration Checklist",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {[
            { step: "1. Authentication", detail: "Register or 1-Click Demo Login as Student Researcher." },
            { step: "2. PDF Upload & Ingestion", detail: "Extracts sections, page count, and indexes vectors in real-time." },
            { step: "3. Structured Paper Digest", detail: "Extracts Problem, Motivation, Methods, Dataset, Results, Limitations." },
            { step: "4. Grounded Paper Q&A", detail: "Answers questions with exact Page & Section citation badges." },
            { step: "5. 'Explain Simply' Mode", detail: "Converts dense math into Beginner, Intermediate, or Technical analogies." },
            { step: "6. Multi-Paper Comparison", detail: "Side-by-side matrix across 8 core academic dimensions." },
            { step: "7. Research Gap Analysis", detail: "Analyzes literature across 10 distinct research gap categories." },
            { step: "8. Literature Review Synthesis", detail: "Generates 10-section formal review with formatted citations." },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-200">{item.step}</p>
                <p className="text-slate-400 text-[11px] mt-0.5">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "5. Viva Q&A & Examiner Defense",
      subtitle: "Anticipated Technical Questions & Formal Answers",
      content: (
        <div className="space-y-3 text-xs max-h-96 overflow-y-auto pr-1">
          {[
            {
              q: "Q: How do you prevent LLM hallucinations on research claims?",
              a: "We enforce strict Retrieval-Augmented Generation (RAG). Before prompting the model, candidate chunks are retrieved via vector cosine similarity. The system prompt constrains the model to answer exclusively from the retrieved context. If insufficient evidence exists, it triggers a deterministic fallback stating evidence is absent."
            },
            {
              q: "Q: Why use Sentence Transformers instead of traditional keyword search?",
              a: "Keyword search fails when papers use synonyms (e.g. 'parameter-efficient' vs 'low-rank adaptation' or 'transformer' vs 'multi-head attention'). Sentence Transformers map sentences into dense semantic vector spaces where conceptual proximity is preserved."
            },
            {
              q: "Q: How does the system handle scanned or image-based PDFs?",
              a: "PyMuPDF extracts text streams and layout bounding boxes. If zero text streams are found, the system gracefully informs the user that OCR-enabled documents are required rather than crashing."
            }
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <p className="font-bold text-brand-400">{item.q}</p>
              <p className="text-slate-300 text-[11px] leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-w-5xl mx-auto">
      {/* Slide Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <span className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-wider">
            SLIDE {currentSlide + 1} OF {slides.length}
          </span>
          <h2 className="text-xl font-bold text-slate-100 mt-0.5">{slides[currentSlide].title}</h2>
          <p className="text-xs text-slate-400">{slides[currentSlide].subtitle}</p>
        </div>

        {/* Slide Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentSlide(s => Math.max(0, s - 1))}
            disabled={currentSlide === 0}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentSlide(s => Math.min(slides.length - 1, s + 1))}
            disabled={currentSlide === slides.length - 1}
            className="p-2 rounded-lg bg-brand-600 text-white hover:bg-brand-500 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slide Body */}
      <div className="min-h-[300px] mb-6">
        {slides[currentSlide].content}
      </div>

      {/* Slide Progress Dots */}
      <div className="flex items-center justify-center gap-2 pt-4 border-t border-slate-800">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-2 rounded-full transition-all ${
              currentSlide === i ? 'w-8 bg-brand-500' : 'w-2 bg-slate-700 hover:bg-slate-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
