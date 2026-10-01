import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, Plus, Trash2, BookOpen, Layers, 
  Check, ArrowRight, Folder
} from 'lucide-react';
import { api } from '../services/api';
import { Collection, Paper } from '../types';
import { useWorkspace } from '../contexts/WorkspaceContext';

interface CollectionsPageProps {
  onOpenReader: (paper: Paper) => void;
}

export const CollectionsPage: React.FC<CollectionsPageProps> = ({ onOpenReader }) => {
  const { addToast } = useWorkspace();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCol, setSelectedCol] = useState<Collection | null>(null);
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [newColColor, setNewColColor] = useState('#6366f1');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const data = await api.getCollections();
      setCollections(data);
      if (data.length > 0) {
        setSelectedCol(data[0]);
      }
    } catch (e) {
      console.error("Collections load error:", e);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    try {
      const created = await api.createCollection(newColName, newColDesc, newColColor);
      setCollections(prev => [...prev, created]);
      setSelectedCol(created);
      setNewColName('');
      setNewColDesc('');
      setIsCreating(false);
      addToast({ type: 'success', title: `Collection "${created.name}" created` });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Could not create collection', description: err.message });
    }
  };

  const handleDeleteCollection = async (colId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this collection folder?")) return;
    try {
      await api.deleteCollection(colId);
      setCollections(prev => prev.filter(c => c.id !== colId));
      if (selectedCol?.id === colId) {
        setSelectedCol(collections[0] || null);
      }
      addToast({ type: 'info', title: 'Collection deleted' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Delete failed', description: err.message });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-heading text-slate-100">Research Collections</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20">
              {collections.length} Folders
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Categorize literature by topic, course project, or publication venue.</p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Create Modal Form */}
      {isCreating && (
        <form onSubmit={handleCreateCollection} className="p-5 rounded-2xl bg-slate-900 border border-brand-500/40 space-y-3 shadow-xl animate-slide-up">
          <h3 className="text-sm font-bold text-slate-100">Create New Research Collection</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Collection Name</label>
              <input
                type="text"
                required
                placeholder="E.g. Healthcare AI, Final Year Thesis"
                value={newColName}
                onChange={e => setNewColName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Description</label>
              <input
                type="text"
                placeholder="Core papers on clinical NLP and biomedical transformers"
                value={newColDesc}
                onChange={e => setNewColDesc(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Color:</span>
              {['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'].map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setNewColColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${newColColor === c ? 'scale-125 ring-2 ring-white' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-sm hover:bg-brand-500"
              >
                Create Folder
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Two-Column Collections Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Collections List */}
        <div className="lg:col-span-4 space-y-2.5">
          {collections.map(col => {
            const isSelected = selectedCol?.id === col.id;
            return (
              <div
                key={col.id}
                onClick={() => setSelectedCol(col)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-brand-500/60 shadow-lg'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                    style={{ backgroundColor: `${col.color}20`, color: col.color }}
                  >
                    <Folder className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-xs text-slate-100 truncate">{col.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{col.paper_count} Papers</p>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDeleteCollection(col.id, e)}
                  className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* RIGHT: Papers in Selected Collection */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          {selectedCol ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-100">{selectedCol.name}</h3>
                  <p className="text-xs text-slate-400">{selectedCol.description || 'Collection of tagged academic literature.'}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300">
                  {selectedCol.papers?.length || selectedCol.paper_count || 0} Papers
                </span>
              </div>

              {selectedCol.papers && selectedCol.papers.length > 0 ? (
                <div className="space-y-3">
                  {selectedCol.papers.map(p => (
                    <div
                      key={p.id}
                      onClick={() => onOpenReader(p)}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-brand-500/40 transition-all flex items-center justify-between gap-3 text-xs cursor-pointer group"
                    >
                      <div>
                        <h4 className="font-semibold text-slate-200 group-hover:text-brand-300 transition-colors">{p.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {p.authors?.map(a => a.name).join(', ') || 'Lead Author'} &bull; {p.publication_year || 2023}
                        </p>
                      </div>
                      <span className="shrink-0 px-2.5 py-1 bg-slate-900 group-hover:bg-brand-600 group-hover:text-white text-slate-400 rounded-lg text-[11px] transition-colors">
                        Open Reader &rarr;
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 text-xs">
                  This collection is initialized. Move papers from your Library to view them here.
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">Select a collection folder.</div>
          )}
        </div>
      </div>
    </div>
  );
};
