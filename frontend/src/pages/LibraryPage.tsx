import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Search, Filter, Star, CheckSquare, 
  Trash2, Upload, ExternalLink, Sparkles, GitCompare, 
  FileText, Quote, MoreHorizontal, CheckCircle2
} from 'lucide-react';
import { Paper } from '../types';
import { api } from '../services/api';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { ScorecardBadge } from '../components/common/ScorecardBadge';

interface LibraryPageProps {
  onNavigate: (page: string) => void;
  onOpenReader: (paper: Paper) => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({ onNavigate, onOpenReader }) => {
  const { 
    selectedPaperIds, toggleSelectPaper, selectAllPapers, 
    clearSelectedPapers, isPaperSelected, addToast 
  } = useWorkspace();

  const [papers, setPapers] = useState<Paper[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [favoriteOnly, setFavoriteOnly] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadPapers();
  }, [statusFilter, favoriteOnly]);

  const loadPapers = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'All') params.reading_status = statusFilter;
      if (favoriteOnly) params.is_favorite = true;
      const list = await api.getPapers(params);
      setPapers(list);
    } catch (e) {
      console.error("Library load error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (paper: Paper, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await api.updatePaper(paper.id, { is_favorite: !paper.is_favorite });
      setPapers(prev => prev.map(p => p.id === paper.id ? updated : p));
      addToast({ type: 'success', title: updated.is_favorite ? 'Added to favorites' : 'Removed from favorites' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error updating favorite', description: err.message });
    }
  };

  const handleUpdateStatus = async (paperId: string, newStatus: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const progressMap: Record<string, number> = {
      'Not Started': 0,
      'Started': 25,
      'Reading': 50,
      'Reviewing': 75,
      'Completed': 100
    };
    try {
      const updated = await api.updatePaper(paperId, {
        reading_status: newStatus as any,
        reading_progress: progressMap[newStatus] || 0
      });
      setPapers(prev => prev.map(p => p.id === paperId ? updated : p));
      addToast({ type: 'success', title: `Reading status updated to ${newStatus}` });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Could not update status', description: err.message });
    }
  };

  const handleDeletePaper = async (paperId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to remove this paper from your workspace?")) return;
    try {
      await api.deletePaper(paperId);
      setPapers(prev => prev.filter(p => p.id !== paperId));
      addToast({ type: 'info', title: 'Paper removed from library' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Delete failed', description: err.message });
    }
  };

  const filteredPapers = papers.filter(p => {
    const q = searchQuery.toLowerCase();
    const authors = p.authors?.map(a => a.name).join(' ').toLowerCase() || '';
    return p.title.toLowerCase().includes(q) || (p.abstract?.toLowerCase().includes(q)) || authors.includes(q);
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-heading text-slate-100">Personal Research Library</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20">
              {papers.length} Papers
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Organize manuscripts, track reading progress, and initiate multi-paper synthesis.</p>
        </div>

        <button
          onClick={() => onNavigate('upload')}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-500/20 transition-all"
        >
          <Upload className="w-4 h-4" />
          <span>Upload PDF Paper</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search papers by title, author, keyword, or abstract..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['All', 'Started', 'Reading', 'Reviewing', 'Completed'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                statusFilter === st
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}

          {/* Favorite filter */}
          <button
            onClick={() => setFavoriteOnly(!favoriteOnly)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border transition-all ${
              favoriteOnly
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${favoriteOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>Favorites</span>
          </button>
        </div>

        {/* Batch Select Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (selectedPaperIds.length === filteredPapers.length) clearSelectedPapers();
              else selectAllPapers(filteredPapers.map(p => p.id));
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs transition-colors"
          >
            {selectedPaperIds.length === filteredPapers.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>

      {/* Papers Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 text-xs">Loading library manuscripts...</div>
      ) : filteredPapers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPapers.map(paper => {
            const isSelected = isPaperSelected(paper.id);
            return (
              <div
                key={paper.id}
                className={`p-5 rounded-2xl border transition-all duration-200 space-y-3.5 cursor-pointer relative ${
                  isSelected
                    ? 'bg-brand-950/40 border-brand-500/60 shadow-xl'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md'
                }`}
                onClick={() => onOpenReader(paper)}
              >
                {/* Header: Checkbox + Title + Favorite */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelectPaper(paper.id);
                      }}
                      className="mt-1 rounded border-slate-700 text-brand-600 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 hover:text-brand-300 transition-colors leading-snug">
                        {paper.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {paper.authors?.map(a => a.name).join(', ') || 'Lead Author'} &bull; {paper.journal_venue || 'arXiv'} ({paper.publication_year || 2023})
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => toggleFavorite(paper, e)}
                    className="p-1 text-slate-500 hover:text-amber-400 transition-colors shrink-0"
                  >
                    <Star className={`w-4 h-4 ${paper.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                </div>

                {/* Abstract snippet */}
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {paper.abstract || "Detailed structured analysis available."}
                </p>

                {/* Factual Scorecard Metrics */}
                <ScorecardBadge scorecard={paper.scorecard} citationCount={paper.citation_count} year={paper.publication_year} />

                {/* Footer Controls: Reading Status dropdown & Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  {/* Status Dropdown */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500">Status:</span>
                    <select
                      value={paper.reading_status || 'Not Started'}
                      onChange={(e) => handleUpdateStatus(paper.id, e.target.value, e)}
                      onClick={(e) => e.stopPropagation()}
                      className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-[11px] font-medium focus:outline-none"
                    >
                      <option value="Not Started">Not Started (0%)</option>
                      <option value="Started">Started (25%)</option>
                      <option value="Reading">Reading (50%)</option>
                      <option value="Reviewing">Reviewing (75%)</option>
                      <option value="Completed">Completed (100%)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenReader(paper);
                      }}
                      className="px-3 py-1 bg-brand-600/90 hover:bg-brand-500 text-white rounded-lg text-[11px] font-medium transition-colors"
                    >
                      Open Reader
                    </button>
                    <button
                      onClick={(e) => handleDeletePaper(paper.id, e)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      title="Remove paper"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-200">No papers match your search or filter</h3>
            <p className="text-xs text-slate-400">Upload a PDF or adjust your filter criteria.</p>
          </div>
          <button
            onClick={() => onNavigate('upload')}
            className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
          >
            Upload Research Paper
          </button>
        </div>
      )}
    </div>
  );
};
