import React from 'react';
import { Presentation, ArrowLeft } from 'lucide-react';
import { VivaDeck } from '../components/presentation/VivaDeck';

interface VivaPresentationPageProps {
  onBack: () => void;
}

export const VivaPresentationPage: React.FC<VivaPresentationPageProps> = ({ onBack }) => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Presentation Mode</span>
        </button>

        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20">
          College Viva Defense & Project Walkthrough Deck
        </span>
      </div>

      <VivaDeck />
    </div>
  );
};
