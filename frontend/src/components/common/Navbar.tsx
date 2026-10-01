import React from 'react';
import { 
  Search, Sun, Moon, Sparkles, BookOpen, Layers, 
  Presentation, User as UserIcon, LogOut, CheckSquare
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const { user, logout, loginDemo } = useAuth();
  const { theme, setTheme, selectedPaperIds, setCommandPaletteOpen, clearSelectedPapers } = useWorkspace();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-lg text-slate-100 tracking-tight">Scholar<span className="text-brand-400">Pulse</span></span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30 px-1.5 py-0.5 rounded">AI RAG</span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Literature & Synthesis Assistant</p>
          </div>
        </button>
      </div>

      {/* Global Command / Search Trigger */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-1.5 text-sm bg-slate-900/90 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors shadow-inner"
        >
          <span className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <span>Search papers, topics, authors, or run AI synthesis...</span>
          </span>
          <kbd className="text-[11px] font-mono font-medium bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Action Controls & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Multi-Paper Selection Counter */}
        {selectedPaperIds.length > 0 && (
          <div className="flex items-center gap-2 bg-brand-950/70 border border-brand-500/40 px-2.5 py-1 rounded-lg text-xs font-medium text-brand-200 animate-pulse">
            <CheckSquare className="w-3.5 h-3.5 text-brand-400" />
            <span>{selectedPaperIds.length} Selected</span>
            <button
              onClick={() => onNavigate('compare')}
              className="ml-1 px-1.5 py-0.5 bg-brand-600 text-white rounded text-[11px] hover:bg-brand-500 transition-colors"
            >
              Analyze
            </button>
          </div>
        )}

        {/* Presentation Mode Button */}
        <button
          onClick={() => onNavigate('presentation')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentPage === 'presentation'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-amber-500/40 hover:text-amber-300'
          }`}
          title="Open Viva / Project Presentation Mode"
        >
          <Presentation className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Viva Mode</span>
        </button>

        {/* Theme Switcher */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* User Profile / Demo Login */}
        {user ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">
                {user.full_name.charAt(0)}
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-medium text-slate-200 leading-tight truncate max-w-[110px]">{user.full_name}</p>
                <p className="text-[10px] text-brand-400 leading-none">{user.role}</p>
              </div>
            </button>
            <button
              onClick={() => {
                logout();
                onNavigate('landing');
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('register')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-500 text-white shadow-sm transition-all"
            >
              Create Account
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
