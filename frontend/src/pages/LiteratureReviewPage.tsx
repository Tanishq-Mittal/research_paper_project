import React, { useState, useEffect } from 'react';
import { 
  FileText, Sparkles, Download, Copy, Check, 
  BookOpen, CheckSquare, Layers, ArrowRight, Quote
} from 'lucide-react';
import { api } from '../services/api';
import { Paper, LiteratureReviewResponse } from '../types';
import { useWorkspace } from '../contexts/WorkspaceContext';

export const LiteratureReviewPage: React.FC = () => {
  const { selectedPaperIds, toggleSelectPaper, addToast } = useWorkspace();

  const [availablePapers, setAvailablePapers] = useState<Paper[]>([]);
  const [topic, setTopic] = useState('Deep Learning Architectures and Parameter-Efficient Adaptation');
  const [customInstructions, setCustomInstructions] = useState('');
  const [review, setReview] = useState<LiteratureReviewResponse | null>(null);
  const [pastReviews, setPastReviews] = useState<LiteratureReviewResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [papersList, reviewsList] = await Promise.all([
          api.getPapers(),
          api.getLiteratureReviews()
        ]);
        setAvailablePapers(papersList);
        setPastReviews(reviewsList);
        if (reviewsList.length > 0) {
          setReview(reviewsList[0]);
        }
      } catch (e) {
        console.error("Literature review load error:", e);
      }
    }
    load();
  }, []);

  const handleGenerate = async () => {
    const targetIds = selectedPaperIds.length > 0 ? selectedPaperIds : availablePapers.map(p => p.id).slice(0, 3);
    if (targetIds.length === 0) {
      addToast({ type: 'warning', title: 'Please select at least 1 paper in your library.' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.generateLiteratureReview(targetIds, topic, customInstructions || undefined);
      setReview(res);
      setPastReviews(prev => [res, ...prev]);
      addToast({ type: 'success', title: 'Literature Review generated successfully!' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Synthesis Failed', description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = (fmt: 'pdf' | 'docx' | 'md' | 'txt') => {
    if (!review) return;
    api.exportDocument(review.title, review.content_markdown, fmt, { "Topic": review.topic });
    addToast({ type: 'success', title: `Exporting Literature Review as ${fmt.toUpperCase()}` });
  };

  const handleCopyReferences = () => {
    if (!review?.formatted_references) return;
    navigator.clipboard.writeText(review.formatted_references.join('\n\n'));
    setCopiedRef(true);
    addToast({ type: 'success', title: 'References copied to clipboard' });
    setTimeout(() => setCopiedRef(false), 2500);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-heading text-slate-100">Literature Review Assistant</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20">
              Formal Academic Synthesis
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Synthesize peer-reviewed publications into a comprehensive 10-section literature review with grounded citations.
          </p>
        </div>

        {review && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-brand-400" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={() => handleExport('docx')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export DOCX</span>
            </button>
          </div>
        )}
      </div>

      {/* Synthesis Configuration Builder */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-200">Literature Review Topic / Thesis Question</label>
          <input
            type="text"
            placeholder="E.g. Comparative Analysis of Multi-Head Self-Attention and Parameter-Efficient Low-Rank Adapters"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Paper Selector Checklist */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300">
            Selected Papers to Synthesize ({selectedPaperIds.length > 0 ? selectedPaperIds.length : 'All 3 default'}):
          </label>
          <div className="flex flex-wrap gap-2">
            {availablePapers.map(p => {
              const isSel = selectedPaperIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggleSelectPaper(p.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    isSel
                      ? 'bg-brand-600 text-white border-brand-500 shadow-sm'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <CheckSquare className={`w-3.5 h-3.5 ${isSel ? 'text-white' : 'text-slate-500'}`} />
                  <span className="truncate max-w-[220px]">{p.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
        >
          {isLoading ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Synthesizing 10-Section Literature Review...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate 10-Section Literature Review</span>
            </>
          )}
        </button>
      </div>

      {/* Structured Review Display */}
      {review ? (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
            <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">Synthesized Document</span>
                <h2 className="text-xl font-bold font-heading text-slate-100">{review.title}</h2>
                <p className="text-xs text-slate-400">Topic: {review.topic} &bull; {review.paper_ids.length} Papers Surveyed</p>
              </div>
            </div>

            {/* Markdown Body with Academic Prose */}
            <div className="academic-prose text-xs text-slate-200 leading-relaxed space-y-4">
              {review.structured_sections && Object.keys(review.structured_sections).length > 0 ? (
                Object.entries(review.structured_sections).map(([secTitle, secContent]: [string, any]) => {
                  if (secTitle === 'References') return null;
                  return (
                    <div key={secTitle} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                      <h3 className="font-bold text-sm text-brand-300">{secTitle}</h3>
                      <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{secContent}</p>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 whitespace-pre-wrap">
                  {review.content_markdown}
                </div>
              )}
            </div>

            {/* References Section */}
            {review.formatted_references && review.formatted_references.length > 0 && (
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Quote className="w-4 h-4 text-brand-400" />
                    <h3 className="text-sm font-bold text-slate-100">Grounded Bibliographic References</h3>
                  </div>
                  <button
                    onClick={handleCopyReferences}
                    className="flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs"
                  >
                    {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedRef ? 'Copied' : 'Copy All'}</span>
                  </button>
                </div>

                <div className="space-y-2 pt-1">
                  {review.formatted_references.map((ref, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-900 text-[11px] text-slate-300 font-mono border border-slate-800/60">
                      {ref}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
