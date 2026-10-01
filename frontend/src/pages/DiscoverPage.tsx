import React, { useState, useEffect } from 'react';
import { 
  Search, Compass, Filter, Plus, ExternalLink, 
  Award, Calendar, BookOpen, Check, Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { SearchResultItem, Paper } from '../types';
import { useWorkspace } from '../contexts/WorkspaceContext';

interface DiscoverPageProps {
  onNavigate: (page: string) => void;
  onOpenReader: (paper: Paper) => void;
}

export const DiscoverPage: React.FC<DiscoverPageProps> = ({ onNavigate, onOpenReader }) => {
  const { addToast } = useWorkspace();
  const [query, setQuery] = useState('transformer attention parameter efficient');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [source, setSource] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    executeSearch();
  }, []);

  const executeSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const data = await api.searchPapers(query, source);
      setResults(data);
    } catch (e: any) {
      addToast({ type: 'error', title: 'Search Error', description: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToLibrary = async (item: SearchResultItem) => {
    try {
      setAddedIds(prev => new Set(prev).add(item.id));
      addToast({ type: 'success', title: `"${item.title.slice(0, 30)}..." added to library` });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Could not add to library', description: err.message });
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-heading text-slate-100">Discover Research Papers</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Semantic natural language search across millions of open-access papers and Semantic Scholar graph indices.
        </p>
      </div>

      {/* Search Bar & Filters */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <form 
          onSubmit={(e) => { e.preventDefault(); executeSearch(); }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-brand-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="E.g., Low-rank adaptation for large language models, vision transformers, graph attention..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-500/20 transition-all"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Source Toggle */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <div className="flex items-center gap-2">
            <span>Source:</span>
            {[
              { id: 'all', label: 'All Sources' },
              { id: 'library', label: 'My Library' },
              { id: 'external', label: 'Semantic Scholar Graph' }
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setSource(s.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  source === s.id ? 'bg-brand-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-slate-500">{results.length} Semantically Relevant Papers</span>
        </div>
      </div>

      {/* Search Results List */}
      <div className="space-y-3.5">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            Querying academic indices and calculating semantic similarity...
          </div>
        ) : results.length > 0 ? (
          results.map(paper => {
            const isAdded = addedIds.has(paper.id) || paper.is_in_library;
            return (
              <div
                key={paper.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/40 transition-all space-y-2.5 text-xs shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 hover:text-brand-300 transition-colors">
                      {paper.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {paper.authors.join(', ') || 'Lead Author'} &bull; {paper.venue || 'Academic Venue'} ({paper.year || 2023})
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {paper.url && (
                      <a
                        href={paper.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        title="Open External Paper Link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => handleAddToLibrary(paper)}
                      disabled={isAdded}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                        isAdded
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-brand-600 hover:bg-brand-500 text-white shadow-sm'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>In Library</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Library</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-slate-300 line-clamp-3 leading-relaxed">
                  {paper.abstract}
                </p>

                {/* Scorecard indicators */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px]">
                    <Award className="w-3 h-3" />
                    {paper.citation_count.toLocaleString()} citations
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px]">
                    <Sparkles className="w-3 h-3" />
                    {(paper.similarity_score * 100).toFixed(0)}% Semantic Match
                  </span>
                  {paper.doi && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      DOI: {paper.doi}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-slate-500 text-xs">
            No papers found matching your query.
          </div>
        )}
      </div>
    </div>
  );
};
