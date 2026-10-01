import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, ShieldCheck, Key, Palette, 
  Cpu, BookOpen, Check, AlertCircle, Save
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { theme, setTheme, addToast } = useWorkspace();

  const [aiModel, setAiModel] = useState(user?.ai_model_pref || 'Gemini 1.5 Pro / GPT-4o');
  const [citationStyle, setCitationStyle] = useState(user?.preferred_citation_style || 'APA');
  const [defaultLanguage, setDefaultLanguage] = useState(user?.default_language || 'English');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        ai_model_pref: aiModel,
        preferred_citation_style: citationStyle,
        default_language: defaultLanguage,
        theme: theme
      });
      addToast({ type: 'success', title: 'Workspace preferences updated' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Save Failed', description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in text-xs">
      <div>
        <h1 className="text-2xl font-bold font-heading text-slate-100">Settings & AI Configuration</h1>
        <p className="text-slate-400 mt-0.5">Manage AI model routing, bibliography standards, and interface theme.</p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* AI Model Preferences */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-bold text-slate-100">AI Model Provider & Grounding Engine</h3>
          </div>

          <div className="space-y-2">
            <label className="text-slate-300 font-semibold block">Primary LLM Provider</label>
            <select
              value={aiModel}
              onChange={e => setAiModel(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-brand-500"
            >
              <option value="Gemini 1.5 Pro / GPT-4o">Google Gemini 1.5 Pro & OpenAI GPT-4o (Hybrid Auto-Route)</option>
              <option value="Gemini 1.5 Flash">Google Gemini 1.5 Flash (Ultra-Low Latency)</option>
              <option value="OpenAI GPT-4o-mini">OpenAI GPT-4o-mini</option>
              <option value="Grounded Local Deterministic">Local Grounded NLP Engine (Zero External API Key Required)</option>
            </select>
            <p className="text-[11px] text-slate-500">
              When external API keys are not supplied in <code className="text-brand-400 font-mono">.env</code>, ScholarPulse automatically utilizes its deterministic academic extraction engine with zero broken functionality.
            </p>
          </div>
        </div>

        {/* Citation Standard */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-100">Bibliography & Citation Preferences</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Default Citation Format</label>
              <select
                value={citationStyle}
                onChange={e => setCitationStyle(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-brand-500"
              >
                <option value="APA">APA (7th Edition)</option>
                <option value="IEEE">IEEE</option>
                <option value="MLA">MLA (9th Edition)</option>
                <option value="Chicago">Chicago (17th Edition)</option>
                <option value="BibTeX">BibTeX</option>
                <option value="RIS">RIS Format</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Synthesis Output Language</label>
              <select
                value={defaultLanguage}
                onChange={e => setDefaultLanguage(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-brand-500"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="German">German</option>
                <option value="French">French</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appearance & Theme */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">Interface Theme</h3>
          </div>

          <div className="flex items-center gap-2">
            {(['dark', 'light', 'system'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={`px-4 py-2 rounded-xl font-semibold capitalize transition-all ${
                  theme === t
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {t} Mode
              </button>
            ))}
          </div>
        </div>

        {/* Responsible Research / Ethics Box */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-slate-400">
            <p className="font-bold text-slate-200">Responsible AI Research Guidelines</p>
            <p className="text-[11px] leading-relaxed">
              AI-generated literature summaries, comparisons, and gap predictions are intended for research acceleration. Always verify empirical metrics and citations against primary published peer-reviewed PDFs before thesis submission.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
        </button>
      </form>
    </div>
  );
};
