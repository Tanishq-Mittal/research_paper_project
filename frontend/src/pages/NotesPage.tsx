import React, { useState, useEffect } from 'react';
import { 
  StickyNote, Tag, Trash2, BookOpen, Plus, 
  Sparkles, Search, Check, ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { Note } from '../types';
import { useWorkspace } from '../contexts/WorkspaceContext';

export const NotesPage: React.FC = () => {
  const { addToast } = useWorkspace();

  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTag, setNewTag] = useState('Important Method');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [selectedTag]);

  const loadNotes = async () => {
    try {
      const data = await api.getNotes(undefined, selectedTag !== 'All' ? selectedTag : undefined);
      setNotes(data);
    } catch (e) {
      console.error("Notes load error:", e);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    try {
      const created = await api.createNote({
        title: newTitle,
        content: newContent,
        tag: newTag
      });
      setNotes(prev => [created, ...prev]);
      setNewTitle('');
      setNewContent('');
      setIsCreating(false);
      addToast({ type: 'success', title: 'Note created' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Could not create note', description: err.message });
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!window.confirm("Delete this research note?")) return;
    try {
      await api.deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      addToast({ type: 'info', title: 'Note deleted' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Delete failed', description: err.message });
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-heading text-slate-100">Research Notes & Insights Notebook</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              {notes.length} Notes
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Annotate methodology breakthroughs, save paper excerpts, and organize project ideas.</p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search notes, formulas, findings..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {['All', 'Important Method', 'Research Gap', 'Use in Project', 'Key Finding'].map(t => (
            <button
              key={t}
              onClick={() => setSelectedTag(t)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                selectedTag === t
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* New Note Form */}
      {isCreating && (
        <form onSubmit={handleCreateNote} className="p-5 rounded-2xl bg-slate-900 border border-brand-500/40 space-y-3 shadow-xl animate-slide-up text-xs">
          <h3 className="text-sm font-bold text-slate-100">Write New Research Note</h3>
          <input
            type="text"
            required
            placeholder="Note Title (e.g. Scaled Dot-Product Attention Softmax Normalization)"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-brand-500"
          />
          <textarea
            required
            rows={4}
            placeholder="Write your detailed formula analysis, empirical critique, or project application..."
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-brand-500"
          />
          <div className="flex items-center justify-between">
            <select
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300"
            >
              <option value="Important Method">Important Method</option>
              <option value="Research Gap">Research Gap</option>
              <option value="Use in Project">Use in Project</option>
              <option value="Key Finding">Key Finding</option>
            </select>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl font-medium hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-500"
              >
                Save Note
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map(n => (
          <div
            key={n.id}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-md flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-300 border border-brand-500/20">
                  {n.tag}
                </span>
                <button
                  onClick={() => handleDeleteNote(n.id)}
                  className="text-slate-500 hover:text-red-400 p-0.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h4 className="font-bold text-sm text-slate-100 leading-snug">{n.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{n.content}</p>

              {n.selected_text && (
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 italic">
                  "{n.selected_text}"
                </div>
              )}
            </div>

            {n.paper_title && (
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span className="truncate max-w-[180px]">{n.paper_title}</span>
                {n.page_number && <span className="font-mono text-slate-500">Page {n.page_number}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
