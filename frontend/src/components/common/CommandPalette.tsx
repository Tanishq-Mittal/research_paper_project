import React, { useState, useEffect } from 'react';
import { 
  Search, BookOpen, GitCompare, FileText, Sparkles, Lightbulb, 
  Upload, BarChart3, Settings, Presentation, ArrowRight, X
} from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';

interface CommandPaletteProps {
  onNavigate: (page: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onNavigate }) => {
  const { isCommandPaletteOpen, setCommandPaletteOpen } = useWorkspace();
  const [query, setQuery] = useState('');

  const commands = [
    { id: 'dashboard', label: 'Go to Dashboard', category: 'Navigation', icon: BookOpen },
    { id: 'library', label: 'My Library', category: 'Navigation', icon: BookOpen },
    { id: 'upload', label: 'Upload New Research Paper (PDF)', category: 'Actions', icon: Upload },
    { id: 'discover', label: 'Discover & Search Academic Papers', category: 'Actions', icon: Search },
    { id: 'compare', label: 'Compare Selected Papers Matrix', category: 'Synthesis', icon: GitCompare },
    { id: 'literature-review', label: 'Generate Multi-Paper Literature Review', category: 'Synthesis', icon: FileText },
    { id: 'research-gaps', label: 'Analyze Research Gaps (10 Categories)', category: 'Synthesis', icon: Sparkles },
    { id: 'research-ideas', label: 'Generate Research Hypotheses & Ideas', category: 'Synthesis', icon: Lightbulb },
    { id: 'analytics', label: 'View Research Analytics & Topic Maps', category: 'Analytics', icon: BarChart3 },
    { id: 'presentation', label: 'Open Viva / Project Presentation Mode', category: 'Presentation', icon: Presentation },
    { id: 'settings', label: 'Settings & API Keys Configuration', category: 'System', icon: Settings },
  ];

  const filtered = commands.filter(c => 
    c.label.toLowerCase().includes(query.toLowerCase()) || 
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-brand-400 shrink-0" />
          <input
            type="text"
            placeholder="Type a command, paper title, or action..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-200 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    onNavigate(cmd.id);
                    setCommandPaletteOpen(false);
                    setQuery('');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs font-medium text-slate-300 hover:text-white hover:bg-brand-600/90 group transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-slate-800 text-slate-400 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-slate-200 group-hover:text-white font-medium">{cmd.label}</p>
                      <p className="text-[10px] text-slate-500 group-hover:text-brand-100">{cmd.category}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })
          ) : (
            <div className="text-center py-8 text-xs text-slate-500">
              No matching commands or actions found.
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Navigate with <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">↓</kbd></span>
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">ESC</kbd> to close</span>
        </div>
      </div>
    </div>
  );
};
