import React, { useState, useEffect } from 'react';
import { 
  Sparkles, AlertCircle, CheckCircle2, ArrowRight, 
  Layers, CheckSquare, ShieldCheck, Download
} from 'lucide-react';
import { api } from '../services/api';
import { Paper, ResearchGapResponse } from '../types';
import { useWorkspace } from '../contexts/WorkspaceContext';

export const ResearchGapsPage: React.FC = () => {
  const { selectedPaperIds, toggleSelectPaper, addToast } = useWorkspace();

  const [availablePapers, setAvailablePapers] = useState<Paper[]>([]);
  const [analysis, setAnalysis] = useState<ResearchGapResponse | null>(null);
  const [focusTopic, setFocusTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [pList, gList] = await Promise.all([
          api.getPapers(),
          api.getResearchGaps()
        ]);
        setAvailablePapers(pList);
        if (gList.length > 0) {
          setAnalysis(gList[0]);
        } else if (pList.length > 0) {
          runGapAnalysis(pList.slice(0, 3).map(p => p.id));
        }
      } catch (e) {
        console.error("Gap analysis load error:", e);
      }
    }
    load();
  }, []);

  const runGapAnalysis = async (paperIds: string[]) => {
    if (paperIds.length === 0) {
      addToast({ type: 'warning', title: 'Please select at least 1 paper.' });
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.analyzeResearchGaps(paperIds, focusTopic || undefined);
      setAnalysis(res);
      addToast({ type: 'success', title: 'Research Gaps analyzed across 10 categories' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Analysis Failed', description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-heading text-slate-100">Research Gap Finder</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
              10 Academic Gap Dimensions
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Evidence-backed gap discovery separating ground-truth paper excerpts from suggested future thesis directions.
          </p>
        </div>
      </div>

      {/* Configuration Bar */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-200">Focus Research Domain (Optional)</label>
          <input
            type="text"
            placeholder="E.g., Scalability in multi-head attention, zero-shot domain adaptation..."
            value={focusTopic}
            onChange={e => setFocusTopic(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Paper Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300">Selected Papers to Analyze:</label>
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
          onClick={() => runGapAnalysis(selectedPaperIds.length > 0 ? selectedPaperIds : availablePapers.map(p => p.id).slice(0, 3))}
          disabled={isLoading}
          className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
        >
          {isLoading ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Analyzing Literature for Methodological Gaps...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Detect Evidence-Backed Research Gaps</span>
            </>
          )}
        </button>
      </div>

      {/* Analysis Output */}
      {analysis && (
        <div className="space-y-6">
          {/* Synthesis Markdown */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap space-y-2">
            <h3 className="font-bold text-sm text-brand-300">Gap Synthesis Overview</h3>
            <p className="text-slate-300">{analysis.synthesis_markdown}</p>
          </div>

          {/* Individual Gap Cards */}
          <div className="space-y-4">
            <h3 className="font-bold text-base text-slate-100">Discovered Gap Categories & Future Directions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.gaps.map((gap, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-md flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-300 border border-rose-500/20">
                        {gap.category}
                      </span>
                      <span className="text-[10px] font-bold text-amber-400 uppercase">
                        Impact: {gap.impact_level}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-100 leading-snug">{gap.gap_title}</h4>

                    {/* Grounded Evidence Excerpt */}
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
                        Evidence from Literature:
                      </span>
                      {gap.evidence_from_papers.map((ev, i) => (
                        <div key={i} className="text-[11px] text-slate-300">
                          <span className="font-semibold text-slate-200">{ev.paper_title} (Page {ev.page}): </span>
                          <span className="italic text-slate-400">"{ev.excerpt}"</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Proposed Direction */}
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1 mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Potential Research Direction:
                    </span>
                    <p className="text-slate-200 leading-relaxed text-[11px]">{gap.potential_research_direction}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
