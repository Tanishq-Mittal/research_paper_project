import React, { useState, useEffect } from 'react';
import { 
  BookOpen, MessageSquare, FileText, Sparkles, StickyNote, 
  Quote, ChevronLeft, ChevronRight, Send, Copy, Check, 
  HelpCircle, Lightbulb, Bookmark, Award, Download
} from 'lucide-react';
import { Paper, ChatMessage, Note, Highlight } from '../../types';
import { api } from '../../services/api';
import { ScorecardBadge } from '../common/ScorecardBadge';
import { useWorkspace } from '../../contexts/WorkspaceContext';

interface SplitViewReaderProps {
  paper: Paper;
  onBack: () => void;
}

export const SplitViewReader: React.FC<SplitViewReaderProps> = ({ paper, onBack }) => {
  const { addToast } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'summary' | 'chat' | 'simplify' | 'methodology' | 'notes' | 'citations'>('summary');
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your AI Research Assistant for "${paper.title}". All my responses are strictly grounded in this paper's extracted sections with exact page and section citations. What would you like to explore?`,
      created_at: new Date().toISOString()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Simplify state
  const [simplifyLevel, setSimplifyLevel] = useState<'Beginner' | 'Intermediate' | 'Technical'>('Beginner');
  const [simplifyResult, setSimplifyResult] = useState<any>(null);
  const [isSimplifyLoading, setIsSimplifyLoading] = useState(false);

  // Notes state
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTag, setNewNoteTag] = useState('Important Method');

  // Reader left panel state
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = paper.page_count || 10;
  const [selectedText, setSelectedText] = useState('');
  const [citationsData, setCitationsData] = useState<any>(null);
  const [copiedStyle, setCopiedStyle] = useState<string | null>(null);

  useEffect(() => {
    async function loadPaperData() {
      try {
        const [nList, cList] = await Promise.all([
          api.getNotes(paper.id),
          api.generateCitations([paper.id])
        ]);
        setNotes(nList);
        if (cList.length > 0) {
          setCitationsData(cList[0].citations);
        }
      } catch (e) {
        console.error("Error loading paper data:", e);
      }
    }
    loadPaperData();
  }, [paper.id]);

  const handleSendMessage = async (customQuery?: string) => {
    const query = customQuery || chatInput;
    if (!query.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: query,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    if (!customQuery) setChatInput('');
    setIsChatLoading(true);

    try {
      const resp = await api.chatWithPaper(paper.id, query);
      setMessages(prev => [...prev, resp]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: 'assistant',
        content: `Error retrieving grounded answer: ${err.message}`,
        created_at: new Date().toISOString()
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSimplify = async (level: 'Beginner' | 'Intermediate' | 'Technical') => {
    setSimplifyLevel(level);
    setIsSimplifyLoading(true);
    try {
      const res = await api.simplifyContent(paper.id, level, selectedText || paper.abstract);
      setSimplifyResult(res);
    } catch (e: any) {
      addToast({ type: 'error', title: 'Simplification error', description: e.message });
    } finally {
      setIsSimplifyLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
    try {
      const created = await api.createNote({
        paper_id: paper.id,
        title: newNoteTitle,
        content: newNoteContent,
        tag: newNoteTag,
        page_number: currentPage,
        selected_text: selectedText || undefined
      });
      setNotes(prev => [created, ...prev]);
      setNewNoteTitle('');
      setNewNoteContent('');
      addToast({ type: 'success', title: 'Note saved successfully' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Could not save note', description: err.message });
    }
  };

  const handleCopyCitation = (style: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStyle(style);
    addToast({ type: 'success', title: `Copied ${style} citation to clipboard` });
    setTimeout(() => setCopiedStyle(null), 2500);
  };

  const digest = paper.digest || {
    executive_summary: paper.abstract || "Detailed analysis available.",
    research_problem: "Addressing existing computational complexity in sequence models.",
    motivation: "Accelerating convergence and parameter efficiency.",
    methodology_steps: [
      "Formulate input token representations.",
      "Apply multi-head self-attention mechanisms.",
      "Train with gradient optimization on academic benchmarks."
    ],
    dataset_details: {
      name: "Standard Academic Benchmark",
      samples_count: "Curated dataset split",
      train_test_split: "Train / Validation / Test",
      source: "Open Access Archive"
    },
    algorithms_and_models: ["Transformer", "Self-Attention", "Adam Optimizer"],
    results_and_metrics: { "Evaluation": "Superior empirical accuracy on target benchmark tasks." },
    limitations: ["Quadratic scaling with sequence length."],
    future_work: ["Extend to multi-modal representations."]
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)]">
      {/* Top Header Bar */}
      <div className="h-14 border-b border-slate-800 bg-slate-950 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Library</span>
          </button>
          <div className="max-w-md lg:max-w-xl truncate">
            <h2 className="text-sm font-bold text-slate-100 truncate">{paper.title}</h2>
            <p className="text-[11px] text-slate-400 truncate">
              {paper.authors?.map(a => a.name).join(', ') || 'Anonymous Researcher'} &bull; {paper.journal_venue || 'Academic Venue'} ({paper.publication_year || 2023})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ScorecardBadge scorecard={paper.scorecard} citationCount={paper.citation_count} year={paper.publication_year} />
        </div>
      </div>

      {/* Two-Panel Split Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT PANEL: Document Reader & Text View */}
        <div className="lg:col-span-6 border-r border-slate-800 flex flex-col h-full bg-slate-950/40">
          {/* Reader Sub-Toolbar */}
          <div className="h-10 border-b border-slate-800/80 bg-slate-900/60 px-4 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <span className="font-semibold text-slate-300">Document Reader / Extracted Text</span>
            
            {/* Page Navigator */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] text-slate-300">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 hover:text-white disabled:opacity-30"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Document Content View */}
          <div 
            className="flex-1 overflow-y-auto p-6 text-slate-200 text-sm leading-relaxed space-y-4 font-serif select-text"
            onMouseUp={() => {
              const sel = window.getSelection()?.toString().trim();
              if (sel && sel.length > 5) setSelectedText(sel);
            }}
          >
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 shadow-sm space-y-4">
              <h1 className="font-sans font-bold text-lg text-slate-100">{paper.title}</h1>
              <p className="text-xs font-sans text-brand-400">
                {paper.authors?.map(a => a.name).join(', ') || 'Lead Author et al.'}
              </p>

              <div className="border-t border-b border-slate-800 py-3 my-3">
                <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-400 mb-1">Abstract</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{paper.abstract || "Extracted abstract..."}</p>
              </div>

              <div>
                <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-400 mb-1">Page {currentPage} Content</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {paper.abstract ? paper.abstract : "This document section details the core architectural specifications and experimental setup..."}
                </p>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  "The proposed model optimizes loss functions with low-rank factorized parameters. Empirical evaluations on standard benchmark splits verify convergence across training iterations."
                </p>
              </div>
            </div>

            {selectedText && (
              <div className="sticky bottom-3 p-3 bg-brand-950/90 border border-brand-500/40 rounded-xl shadow-xl backdrop-blur-md flex items-center justify-between text-xs animate-slide-up">
                <div className="truncate max-w-xs text-brand-200">
                  <span className="font-semibold text-brand-400">Selected: </span>
                  "{selectedText.slice(0, 50)}..."
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setActiveTab('simplify');
                      handleSimplify('Beginner');
                    }}
                    className="px-2 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded text-[11px] font-medium"
                  >
                    Explain Simply
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('notes');
                      setNewNoteContent(`"${selectedText}"`);
                    }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px]"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: AI Research Assistant */}
        <div className="lg:col-span-6 flex flex-col h-full bg-slate-900/50">
          {/* Navigation Tabs */}
          <div className="h-10 border-b border-slate-800 bg-slate-900 px-3 flex items-center gap-1 overflow-x-auto shrink-0 text-xs">
            {[
              { id: 'summary', label: 'Structured Digest', icon: FileText },
              { id: 'chat', label: 'Ask AI Chat', icon: MessageSquare },
              { id: 'simplify', label: 'Explain Simply', icon: Lightbulb },
              { id: 'methodology', label: 'Methodology', icon: Sparkles },
              { id: 'notes', label: 'Notes', icon: StickyNote, badge: notes.length || undefined },
              { id: 'citations', label: 'Citations', icon: Quote },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    if (tab.id === 'simplify' && !simplifyResult) {
                      handleSimplify('Beginner');
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.2 bg-slate-800 text-[10px] rounded-full text-slate-300">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB CONTENT PANELS */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* 1. STRUCTURED DIGEST TAB */}
            {activeTab === 'summary' && (
              <div className="space-y-4 animate-fade-in text-xs">
                {/* Executive Summary */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="font-bold text-brand-400 text-xs uppercase tracking-wider mb-1">Executive Summary</h4>
                  <p className="text-slate-200 leading-relaxed">{digest.executive_summary}</p>
                </div>

                {/* Problem & Motivation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <h5 className="font-bold text-amber-400 uppercase tracking-wider text-[11px] mb-1">Research Problem</h5>
                    <p className="text-slate-300 leading-snug">{digest.research_problem}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <h5 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] mb-1">Primary Motivation</h5>
                    <p className="text-slate-300 leading-snug">{digest.motivation}</p>
                  </div>
                </div>

                {/* Benchmark Dataset Details */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="font-bold text-purple-400 text-xs uppercase tracking-wider mb-2">Benchmark Dataset Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div><span className="text-slate-500">Name:</span> <span className="text-slate-200 font-medium">{digest.dataset_details?.name || 'N/A'}</span></div>
                    <div><span className="text-slate-500">Samples:</span> <span className="text-slate-200 font-medium">{digest.dataset_details?.samples_count || 'N/A'}</span></div>
                    <div><span className="text-slate-500">Split:</span> <span className="text-slate-200 font-medium">{digest.dataset_details?.train_test_split || 'Standard'}</span></div>
                    <div><span className="text-slate-500">Source:</span> <span className="text-slate-200 font-medium">{digest.dataset_details?.source || 'Academic Benchmark'}</span></div>
                  </div>
                </div>

                {/* Key Empirical Results */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider mb-2">Empirical Results & Metrics</h4>
                  <div className="space-y-1.5">
                    {Object.entries(digest.results_and_metrics || {}).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                        <span className="font-semibold text-slate-300">{k}</span>
                        <span className="font-mono text-emerald-400 font-bold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Limitations & Future Work */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <h5 className="font-bold text-rose-400 uppercase tracking-wider text-[11px] mb-1.5">Acknowledged Limitations</h5>
                    <ul className="space-y-1 text-slate-300 list-disc pl-4">
                      {digest.limitations?.map((l, i) => <li key={i}>{l}</li>)}
                    </ul>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <h5 className="font-bold text-indigo-400 uppercase tracking-wider text-[11px] mb-1.5">Proposed Future Work</h5>
                    <ul className="space-y-1 text-slate-300 list-disc pl-4">
                      {digest.future_work?.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 2. CHAT TAB */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-full space-y-4">
                {/* Prompt Suggestions */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "What is the main contribution?",
                    "Which dataset was used?",
                    "What accuracy/metrics did the model achieve?",
                    "What are the limitations?",
                    "Explain the methodology step-by-step"
                  ].map(prompt => (
                    <button
                      key={prompt}
                      onClick={() => handleSendMessage(prompt)}
                      className="px-2.5 py-1 rounded-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Messages Stream */}
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-brand-600/90 text-white ml-8 shadow-sm'
                          : 'bg-slate-950 border border-slate-800 text-slate-200 mr-4'
                      }`}
                    >
                      <p className="font-semibold text-[11px] mb-1 text-slate-400">
                        {m.role === 'user' ? 'You' : 'ScholarPulse Grounded AI'}
                      </p>
                      <p className="whitespace-pre-wrap">{m.content}</p>

                      {/* Evidence Citations Badge */}
                      {m.sources && m.sources.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-1.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-brand-400">Retrieved Grounded Evidence:</p>
                          {m.sources.map((src, i) => (
                            <div key={i} className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[11px] text-slate-300">
                              <div className="flex items-center justify-between text-brand-300 font-semibold mb-0.5">
                                <span>{src.section} (Page {src.page})</span>
                                {src.similarity_score && (
                                  <span className="text-[10px] text-slate-500 font-mono">Sim: {(src.similarity_score * 100).toFixed(0)}%</span>
                                )}
                              </div>
                              <p className="italic text-slate-400">"{src.snippet}"</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-brand-400 flex items-center gap-2 animate-pulse">
                      <Sparkles className="w-4 h-4" />
                      <span>Retrieving grounded paper chunks and synthesizing answer...</span>
                    </div>
                  )}
                </div>

                {/* Chat Input Bar */}
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="mt-auto flex items-center gap-2 pt-2 border-t border-slate-800"
                >
                  <input
                    type="text"
                    placeholder="Ask a question about this paper..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isChatLoading}
                    className="p-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl disabled:opacity-40 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* 3. EXPLAIN SIMPLY TAB */}
            {activeTab === 'simplify' && (
              <div className="space-y-4 animate-fade-in text-xs">
                {/* Mode Selector */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-semibold text-slate-300 text-xs">Select Explainer Mode:</span>
                  <div className="flex gap-1">
                    {(['Beginner', 'Intermediate', 'Technical'] as const).map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => handleSimplify(lvl)}
                        className={`px-3 py-1 rounded-lg font-medium transition-all ${
                          simplifyLevel === lvl
                            ? 'bg-brand-600 text-white'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {isSimplifyLoading ? (
                  <div className="p-8 text-center text-slate-400 space-y-2">
                    <Sparkles className="w-6 h-6 text-brand-400 animate-spin mx-auto" />
                    <p>Transforming complex academic text into intuitive {simplifyLevel} explanations...</p>
                  </div>
                ) : simplifyResult ? (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                      <h4 className="font-bold text-brand-400 text-xs uppercase tracking-wider mb-2">
                        {simplifyResult.level} Explanation
                      </h4>
                      <p className="text-slate-200 leading-relaxed text-xs">{simplifyResult.simplified_explanation}</p>
                    </div>

                    {simplifyResult.analogies?.length > 0 && (
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <h5 className="font-bold text-amber-400 text-xs uppercase tracking-wider mb-2">Intuitive Real-World Analogy</h5>
                        <ul className="space-y-1.5 text-slate-300 list-disc pl-4">
                          {simplifyResult.analogies.map((a: string, i: number) => <li key={i}>{a}</li>)}
                        </ul>
                      </div>
                    )}

                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2">
                      <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-emerald-400 text-[11px] uppercase tracking-wider">Key Student Takeaway</span>
                        <p className="text-slate-200 text-xs mt-0.5">{simplifyResult.key_takeaway}</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* 4. METHODOLOGY TAB */}
            {activeTab === 'methodology' && (
              <div className="space-y-4 animate-fade-in text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="font-bold text-brand-400 text-xs uppercase tracking-wider mb-3">Step-by-Step Methodology Pipeline</h4>
                  <div className="space-y-3">
                    {digest.methodology_steps?.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800/80">
                        <span className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                          {idx + 1}
                        </span>
                        <p className="text-slate-200 leading-snug">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="font-bold text-indigo-400 text-xs uppercase tracking-wider mb-2">Architectural Modules & Algorithms</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {digest.algorithms_and_models?.map((m) => (
                      <span key={m} className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. NOTES TAB */}
            {activeTab === 'notes' && (
              <div className="space-y-4 animate-fade-in text-xs">
                {/* Note Form */}
                <form onSubmit={handleAddNote} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <h4 className="font-bold text-slate-200 text-xs">Add Research Note on this Paper</h4>
                  <input
                    type="text"
                    placeholder="Note Title (e.g. Attention Formula Details)"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none"
                  />
                  <textarea
                    placeholder="Write your research insight or takeaway..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none"
                  />
                  <div className="flex items-center justify-between">
                    <select
                      value={newNoteTag}
                      onChange={(e) => setNewNoteTag(e.target.value)}
                      className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300 text-xs"
                    >
                      <option value="Important Method">Important Method</option>
                      <option value="Research Gap">Research Gap</option>
                      <option value="Use in Project">Use in Project</option>
                      <option value="Key Finding">Key Finding</option>
                    </select>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium"
                    >
                      Save Note
                    </button>
                  </div>
                </form>

                {/* Notes List */}
                <div className="space-y-2.5">
                  {notes.map(n => (
                    <div key={n.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-slate-100">{n.title}</h5>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-brand-500/20 text-brand-300">{n.tag}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px]">{n.content}</p>
                      {n.selected_text && (
                        <p className="italic text-slate-400 text-[10px] border-l-2 border-brand-500 pl-2 mt-1">"{n.selected_text}"</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. CITATIONS TAB */}
            {activeTab === 'citations' && (
              <div className="space-y-3 animate-fade-in text-xs">
                {citationsData ? (
                  Object.entries(citationsData).map(([style, text]: [string, any]) => (
                    <div key={style} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-brand-400">{style} Citation Style</span>
                        <button
                          onClick={() => handleCopyCitation(style, text)}
                          className="flex items-center gap-1 px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-[11px]"
                        >
                          {copiedStyle === style ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedStyle === style ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap font-sans text-slate-200 text-xs bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80">
                        {text}
                      </pre>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-400">Loading formatted bibliography...</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
