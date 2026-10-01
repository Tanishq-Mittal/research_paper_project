import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Network, Layers, GitBranch, Sparkles, 
  BookOpen, Flame, Award, Calendar, Database
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { api } from '../services/api';
import { Paper, AnalyticsData } from '../types';
import { CitationGraph } from '../components/visual/CitationGraph';
import { TopicEmbeddingMap } from '../components/visual/TopicEmbeddingMap';
import { PaperTimeline } from '../components/visual/PaperTimeline';

interface AnalyticsPageProps {
  onOpenReader: (paper: Paper) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ onOpenReader }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'graph' | 'map' | 'timeline'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [aData, pList] = await Promise.all([
          api.getAnalytics(),
          api.getPapers()
        ]);
        setAnalytics(aData);
        setPapers(pList);
      } catch (e) {
        console.error("Analytics load error:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

  const statusPieData = analytics?.reading_status_breakdown
    ? Object.entries(analytics.reading_status_breakdown).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-heading text-slate-100">Research Analytics & Visualizations</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20">
              Interactive Topology
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Bibliometric trend charts, interactive citation force graphs, 2D vector topic maps, and historical development timelines.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          {[
            { id: 'overview', label: 'Bibliometric Charts', icon: BarChart3 },
            { id: 'graph', label: 'Citation Graph', icon: Network },
            { id: 'map', label: '2D Topic Map', icon: Layers },
            { id: 'timeline', label: 'Timeline Evolution', icon: GitBranch },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW: 1. OVERVIEW & CHARTS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Publication Year Trajectory */}
            <div className="lg:col-span-8 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-100">Publication Year Trajectory (Literature Chronology)</h3>
              <p className="text-xs text-slate-400">Distribution of indexed manuscripts across academic publication years.</p>

              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.year_trends || []}>
                    <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Reading Status Breakdown Pie */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Reading Progress Distribution</h3>
                <p className="text-xs text-slate-400">Workflow distribution of manuscripts in library.</p>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={65}
                      innerRadius={38}
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-2 border-t border-slate-800">
                {statusPieData.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    <span className="truncate">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Venues and Algorithms Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-100">Top Publication Venues</h3>
              <div className="space-y-2">
                {analytics?.top_venues.map(v => (
                  <div key={v.venue} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                    <span className="font-semibold text-slate-200">{v.venue}</span>
                    <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-bold">{v.count} Papers</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-100">Frequent Algorithmic Modules</h3>
              <div className="space-y-2">
                {analytics?.frequent_algorithms.map(a => (
                  <div key={a.algorithm} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                    <span className="font-semibold text-slate-200">{a.algorithm}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">{a.count} Citations</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: 2. CITATION GRAPH */}
      {activeTab === 'graph' && (
        <CitationGraph papers={papers} onSelectPaper={onOpenReader} />
      )}

      {/* VIEW: 3. TOPIC EMBEDDING MAP */}
      {activeTab === 'map' && (
        <TopicEmbeddingMap papers={papers} onSelectPaper={onOpenReader} />
      )}

      {/* VIEW: 4. PAPER TIMELINE */}
      {activeTab === 'timeline' && (
        <PaperTimeline papers={papers} onSelectPaper={onOpenReader} />
      )}
    </div>
  );
};
