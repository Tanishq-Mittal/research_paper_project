import React from 'react';
import { 
  GitCompare, FileText, Sparkles, Lightbulb, 
  Quote, X, CheckSquare, MessageSquare
} from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';

interface MultiPaperToolbarProps {
  onNavigate: (page: string) => void;
}

export const MultiPaperToolbar: React.FC<MultiPaperToolbarProps> = ({ onNavigate }) => {
  const { selectedPaperIds, clearSelectedPapers } = useWorkspace();

  if (selectedPaperIds.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-auto max-w-4xl px-4 animate-slide-up">
      <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-slate-900/95 border border-brand-500/40 shadow-2xl backdrop-blur-xl text-xs text-slate-200">
        {/* Counter Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600/20 text-brand-300 font-semibold rounded-xl border border-brand-500/30">
          <CheckSquare className="w-4 h-4 text-brand-400" />
          <span>{selectedPaperIds.length} Papers Selected</span>
        </div>

        {/* Action Buttons */}
        <button
          onClick={() => onNavigate('reader')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5 text-brand-400" />
          <span>Ask AI</span>
        </button>

        <button
          onClick={() => onNavigate('compare')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <GitCompare className="w-3.5 h-3.5 text-indigo-400" />
          <span>Compare</span>
        </button>

        <button
          onClick={() => onNavigate('literature-review')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium shadow-md shadow-brand-600/30 transition-all"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Literature Review</span>
        </button>

        <button
          onClick={() => onNavigate('research-gaps')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Find Gaps</span>
        </button>

        <button
          onClick={() => onNavigate('research-ideas')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
          <span>Research Ideas</span>
        </button>

        {/* Clear Selection */}
        <button
          onClick={clearSelectedPapers}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Clear Selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
