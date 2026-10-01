import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, HelpCircle, Sparkles, CheckCircle2, 
  ArrowRight, Layers, CheckSquare, ShieldCheck, Database
} from 'lucide-react';
import { api } from '../services/api';
import { Paper, IdeaResponse, QuestionsResponse } from '../types';
import { useWorkspace } from '../contexts/WorkspaceContext';

export const ResearchIdeasPage: React.FC = () => {
  const { selectedPaperIds, toggleSelectPaper, addToast } = useWorkspace();

  const [availablePapers, setAvailablePapers] = useState<Paper[]>([]);
  const [interestArea, setInterestArea] = useState('');
  const [ideasData, setIdeasData] = useState<IdeaResponse | null>(null);
  const [questionsData, setQuestionsData] = useState<QuestionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const pList = await api.getPapers();
        setAvailablePapers(pList);
        if (pList.length > 0) {
          generateAll(pList.slice(0, 3).map(p => p.id));
        }
      } catch (e) {
        console.error("Ideas load error:", e);
      }
    }
    load();
  }, []);

  const generateAll = async (paperIds: string[]) => {
    if (paperIds.length === 0) return;
    setIsLoading(true);
    try {
      const [iRes, qRes] = await Promise.all([
        api.generateResearchIdeas(paperIds, interestArea || undefined),
        api.generateQuestions(paperIds)
      ]);
      setIdeasData(iRes);
      setQuestionsData(qRes);
      addToast({ type: 'success', title: 'Novel research ideas & hypotheses generated' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Generation Failed', description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold font-heading text-slate-100">Research Idea & Hypothesis Generator</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            Brainstorming Engine
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Synthesizes gaps and methodologies into structured research project proposals, hypotheses, and variables.
        </p>
      </div>

      {/* Control Box */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-200">Specific Interest Area / Target Sub-Domain</label>
          <input
            type="text"
            placeholder="E.g. Memory-efficient sequence modeling on consumer hardware..."
            value={interestArea}
            onChange={e => setInterestArea(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <button
          onClick={() => generateAll(selectedPaperIds.length > 0 ? selectedPaperIds : availablePapers.map(p => p.id).slice(0, 3))}
          disabled={isLoading}
          className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
        >
          {isLoading ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Synthesizing Hypotheses and Formulating Ideas...</span>
            </>
          ) : (
            <>
              <Lightbulb className="w-4 h-4" />
              <span>Brainstorm Project Proposals & Hypotheses</span>
            </>
          )}
        </button>
      </div>

      {/* Section 1: Research Ideas Cards */}
      {ideasData && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-100">Proposed Research Project Concepts</h3>
          <div className="space-y-4">
            {ideasData.ideas.map((idea, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Concept #{idx + 1}</span>
                    <h4 className="text-sm font-bold text-slate-100">{idea.title}</h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-amber-400 text-[11px] uppercase tracking-wider">Problem & Motivation:</span>
                    <p className="text-slate-300 leading-snug">{idea.problem_statement}</p>
                    <p className="text-slate-400 text-[11px] mt-1">{idea.motivation}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-emerald-400 text-[11px] uppercase tracking-wider">Proposed Approach & Method:</span>
                    <p className="text-slate-300 leading-snug">{idea.proposed_approach}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 font-bold block mb-1">Suggested Dataset:</span>
                    <span className="text-slate-200 font-medium">{idea.suggested_dataset}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 font-bold block mb-1">Expected Contribution:</span>
                    <span className="text-slate-200 font-medium">{idea.expected_contribution}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 font-bold block mb-1">Related Literature:</span>
                    <span className="text-slate-200 font-medium truncate block">{idea.related_paper_titles.join(', ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Research Questions & Hypotheses */}
      {questionsData && (
        <div className="space-y-4 pt-4">
          <h3 className="text-base font-bold text-slate-100">Formal Research Questions & Variables</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questionsData.questions.map((q, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Research Question #{idx + 1}</span>
                  <p className="font-bold text-xs text-slate-100">{q.research_question}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <span className="font-bold text-brand-400 text-[11px] uppercase tracking-wider">Formal Hypothesis:</span>
                  <p className="text-slate-300 text-[11px] leading-snug">{q.hypothesis}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 font-bold block mb-1">Independent Variables:</span>
                    <span className="text-slate-300">{q.independent_variables.join(', ')}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 font-bold block mb-1">Dependent Variables:</span>
                    <span className="text-slate-300">{q.dependent_variables.join(', ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
