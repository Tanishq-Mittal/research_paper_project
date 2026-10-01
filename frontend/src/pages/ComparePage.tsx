import React, { useState, useEffect } from 'react';
import { 
  GitCompare, Sparkles, Download, CheckCircle2, 
  Layers, ArrowRight, Table, FileText, CheckSquare
} from 'lucide-react';
import { api } from '../services/api';
import { Paper, PaperComparison } from '../types';
import { useWorkspace } from '../contexts/WorkspaceContext';

export const ComparePage: React.FC = () => {
  const { selectedPaperIds, toggleSelectPaper, addToast } = useWorkspace();

  const [availablePapers, setAvailablePapers] = useState<Paper[]>([]);
  const [comparison, setComparison] = useState<PaperComparison | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const list = await api.getPapers();
        setAvailablePapers(list);
        if (selectedPaperIds.length >= 2) {
          runComparison(selectedPaperIds);
        } else if (list.length >= 2 && selectedPaperIds.length === 0) {
          // Default compare first 2 papers
          const defaultIds = [list[0].id, list[1].id];
          runComparison(defaultIds);
        }
      } catch (e) {
        console.error("Comparison load error:", e);
      }
    }
    load();
  }, []);

  const runComparison = async (paperIds: string[]) => {
    if (paperIds.length < 2) {
      addToast({ type: 'warning', title: 'Select at least 2 papers to compare.' });
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.comparePapers(paperIds);
      setComparison(res);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Comparison Failed', description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = (fmt: 'pdf' | 'docx' | 'md' | 'txt') => {
    if (!comparison) return;
    api.exportDocument(
      comparison.title,
      comparison.narrative_markdown,
      fmt,
      { "Papers": comparison.paper_ids.join(', ') }
    );
    addToast({ type: 'success', title: `Exporting comparison as ${fmt.toUpperCase()}` });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-heading text-slate-100">Multi-Paper Comparative Workspace</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Cross-Synthesis Matrix
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Side-by-side comparative analysis of research problems, algorithmic architectures, datasets, and empirical findings.
          </p>
        </div>

        {/* Export Buttons */}
        {comparison && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-brand-400" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={() => handleExport('md')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Markdown</span>
            </button>
          </div>
        )}
      </div>

      {/* Paper Selection Selector Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200">Select Papers to Compare ({selectedPaperIds.length} chosen):</span>
          <button
            onClick={() => runComparison(selectedPaperIds)}
            disabled={selectedPaperIds.length < 2 || isLoading}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold disabled:opacity-40 transition-all shadow-md shadow-brand-600/20"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>{isLoading ? 'Synthesizing...' : 'Generate Matrix'}</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {availablePapers.map(p => {
            const isSel = selectedPaperIds.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => {
                  toggleSelectPaper(p.id);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  isSel
                    ? 'bg-brand-600 text-white border-brand-500 shadow-sm'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <CheckSquare className={`w-3.5 h-3.5 ${isSel ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate max-w-[200px]">{p.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison View */}
      {comparison ? (
        <div className="space-y-6">
          {/* 1. Comparison Matrix Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-100">Comparative Feature Matrix</h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4 w-48 shrink-0">Evaluation Dimension</th>
                    {comparison.matrix[0]?.cells.map(cell => (
                      <th key={cell.paper_id} className="p-4 font-semibold text-slate-200">
                        {cell.paper_title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {comparison.matrix.map((row, idx) => (
                    <tr key={row.category} className={idx % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-950/20'}>
                      <td className="p-4 font-bold text-brand-300 align-top bg-slate-950/50">
                        {row.category}
                      </td>
                      {row.cells.map(cell => (
                        <td key={cell.paper_id} className="p-4 align-top leading-relaxed text-slate-200">
                          {cell.value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Key Differentiators & Narrative */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-bold text-slate-100">Natural Language Synthesis</h3>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-200 leading-relaxed space-y-3 whitespace-pre-wrap">
                {comparison.narrative_markdown}
              </div>
            </div>

            <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-100">Key Differentiators</h3>
              <div className="space-y-2">
                {comparison.key_differentiators.map((diff, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="leading-snug">{diff}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-16 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-2">
          <GitCompare className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-slate-300">Select 2 or more papers to generate a comparative analysis.</p>
        </div>
      )}
    </div>
  );
};
