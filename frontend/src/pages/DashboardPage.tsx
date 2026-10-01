import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Sparkles, Upload, GitCompare, FileText, 
  Flame, CheckCircle2, ArrowRight, Compass, FolderKanban, 
  StickyNote, AlertCircle, BarChart2, Star
} from 'lucide-react';
import { Paper, AnalyticsData } from '../types';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { ScorecardBadge } from '../components/common/ScorecardBadge';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
  onOpenReader: (paper: Paper) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onOpenReader }) => {
  const { user } = useAuth();
  const { toggleSelectPaper, isPaperSelected } = useWorkspace();

  const [papers, setPapers] = useState<Paper[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [pList, aData] = await Promise.all([
          api.getPapers(),
          api.getAnalytics()
        ]);
        setPapers(pList);
        setAnalytics(aData);
      } catch (e) {
        console.error("Dashboard data load error:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const continuePaper = papers.find(p => p.reading_status === 'Reading' || p.reading_progress > 0) || papers[0];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-brand-950 via-slate-900 to-slate-900 border border-brand-500/30 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Personal Research Hub
            </span>
            <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{analytics?.reading_streak_days || 5} Day Reading Streak</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-100">
            Welcome back, {user?.full_name || 'Researcher'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            What research questions or literature synthesis will we tackle today?
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('upload')}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-500/20 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Paper</span>
          </button>
          <button
            onClick={() => onNavigate('compare')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
          >
            <GitCompare className="w-4 h-4 text-indigo-400" />
            <span>Compare Papers</span>
          </button>
          <button
            onClick={() => onNavigate('literature-review')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
          >
            <FileText className="w-4 h-4 text-brand-400" />
            <span>Literature Review</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {[
          { label: "Papers in Library", val: analytics?.total_papers ?? papers.length, icon: BookOpen, color: "text-brand-400" },
          { label: "Research Notes", val: analytics?.total_notes ?? 12, icon: StickyNote, color: "text-emerald-400" },
          { label: "Active Collections", val: analytics?.total_collections ?? 3, icon: FolderKanban, color: "text-amber-400" },
          { label: "Synthesized Reviews", val: analytics?.total_reviews ?? 2, icon: FileText, color: "text-purple-400" },
        ].map(m => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-400">{m.label}</p>
                <p className="text-xl font-bold font-heading text-slate-100 mt-0.5">{m.val}</p>
              </div>
              <div className={`p-2.5 rounded-xl bg-slate-950 border border-slate-800 ${m.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Dashboard Grid: Continue Reading + Smart Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Continue Reading & Recent Papers */}
        <div className="lg:col-span-8 space-y-6">
          {/* Continue Reading Card */}
          {continuePaper && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">Continue Reading</span>
                <span className="text-xs font-semibold text-emerald-400">{continuePaper.reading_progress}% Completed</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(10, continuePaper.reading_progress)}%` }}
                />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-100">{continuePaper.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{continuePaper.abstract}</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <ScorecardBadge scorecard={continuePaper.scorecard} citationCount={continuePaper.citation_count} year={continuePaper.publication_year} />
                <button
                  onClick={() => onOpenReader(continuePaper)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-medium transition-all"
                >
                  <span>Open Split Reader</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Recent Papers In Library */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-bold text-slate-100">Recent Papers in Workspace</h3>
              </div>
              <button
                onClick={() => onNavigate('library')}
                className="text-xs font-semibold text-brand-400 hover:text-brand-300"
              >
                View Library ({papers.length}) &rarr;
              </button>
            </div>

            <div className="space-y-2.5">
              {papers.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-brand-500/40 transition-all flex items-center justify-between gap-3 text-xs group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={isPaperSelected(p.id)}
                      onChange={() => toggleSelectPaper(p.id)}
                      className="rounded border-slate-700 text-brand-600 focus:ring-0 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-100 truncate group-hover:text-brand-300 transition-colors">
                        {p.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {p.authors?.map(a => a.name).join(', ') || 'Lead Author'} &bull; {p.publication_year || 2023}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenReader(p)}
                    className="shrink-0 px-3 py-1.5 bg-slate-900 hover:bg-brand-600 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    Read & Ask AI
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Smart Insights & Research Gap Alerts */}
        <div className="lg:col-span-4 space-y-6">
          {/* Smart Research Insights */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-100">Smart Research Insights</h3>
            </div>
            <p className="text-[11px] text-slate-400">Dynamic cross-literature findings generated from your workspace.</p>

            <div className="space-y-2">
              {(analytics?.ai_insights || [
                "Your library contains papers published between 2016 and 2024.",
                "Multiple papers in your library benchmark on standard GLUE and WMT datasets.",
                "Transformer self-attention is the most recurrent foundational architecture."
              ]).map((ins, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                  <p className="leading-snug">{ins}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Research Gap Alerts */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-slate-100">Research Gap Alerts</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                High Impact
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
              <p className="font-semibold text-rose-300">Scalability Gap in Attention Memory</p>
              <p className="text-[11px] text-slate-400 leading-snug">
                Quadratic complexity remains a major constraint in standard attention baselines during long-context deployment.
              </p>
              <button
                onClick={() => onNavigate('research-gaps')}
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-brand-300 font-semibold rounded-lg text-xs transition-colors"
              >
                Explore 10 Research Gap Categories &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
