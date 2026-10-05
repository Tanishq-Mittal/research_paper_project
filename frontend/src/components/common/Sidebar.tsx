import React from 'react';
import {
  LayoutDashboard, BookOpen, Compass, Upload, GitCompare,
  FileText, Sparkles, Lightbulb, FolderKanban, StickyNote,
  BarChart3, Settings, ShieldCheck, HelpCircle, ArrowRight
} from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
  highlight?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { selectedPaperIds } = useWorkspace();
  const { user } = useAuth();

  const isAdmin = user?.email?.toLowerCase().includes('tanishq') || 
                  user?.email?.toLowerCase().includes('admin') || 
                  user?.role?.toLowerCase().includes('admin');

  const navGroups: NavGroup[] = [
    {
      title: "Workspace",
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'library', label: 'My Library', icon: BookOpen },
        { id: 'upload', label: 'Upload Paper', icon: Upload },
        { id: 'discover', label: 'Discover Papers', icon: Compass },
      ]
    },
    {
      title: "AI Synthesis & RAG",
      items: [
        { id: 'reader', label: 'Paper Reader & AI', icon: BookOpen },
        { id: 'compare', label: 'Compare Papers', icon: GitCompare, badge: selectedPaperIds.length > 1 ? `${selectedPaperIds.length}` : undefined },
        { id: 'literature-review', label: 'Literature Review', icon: FileText },
        { id: 'research-gaps', label: 'Research Gaps', icon: Sparkles },
        { id: 'research-ideas', label: 'Research Ideas', icon: Lightbulb },
      ]
    },
    {
      title: "Knowledge & Notes",
      items: [
        { id: 'collections', label: 'Collections', icon: FolderKanban },
        { id: 'notes', label: 'Notes & Highlights', icon: StickyNote },
        { id: 'analytics', label: 'Analytics & Maps', icon: BarChart3 },
      ]
    },
    {
      title: "Settings & System",
      items: [
        { id: 'presentation', label: 'Viva Presentation', icon: HelpCircle, highlight: true },
        ...(isAdmin ? [{ id: 'admin', label: 'Admin Telemetry', icon: ShieldCheck }] : []),
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/60 backdrop-blur-sm hidden lg:flex flex-col justify-between p-3.5 select-none h-[calc(100vh-4rem)] sticky top-16">
      <div className="space-y-6 overflow-y-auto pr-1">
        {navGroups.map((grp) => (
          <div key={grp.title} className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{grp.title}</p>
            {grp.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20 font-semibold'
                      : item.highlight
                      ? 'text-amber-300 hover:bg-amber-500/10 hover:text-amber-200'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 bg-brand-500 text-white text-[10px] font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Grounding & Ethics Footer Note */}
      <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 px-2 space-y-1">
        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Zero-Hallucination RAG</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">Answers grounded strictly in extracted research paper evidence.</p>
      </div>
    </aside>
  );
};
