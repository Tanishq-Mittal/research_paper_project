import React, { useState } from 'react';
import { User as UserIcon, Mail, BookOpen, Award, Save, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useWorkspace();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [role, setRole] = useState(user?.role || 'Student Researcher');
  const [interests, setInterests] = useState(user?.research_interests || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        full_name: fullName,
        role,
        research_interests: interests
      });
      addToast({ type: 'success', title: 'Profile details saved' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Update failed', description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in text-xs">
      <div>
        <h1 className="text-2xl font-bold font-heading text-slate-100">Researcher Profile</h1>
        <p className="text-slate-400 mt-0.5">Manage your scholar profile, academic affiliations, and research interest tags.</p>
      </div>

      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-brand-500/20">
            {user?.full_name.charAt(0) || 'R'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">{user?.full_name}</h2>
            <p className="text-brand-400 text-xs font-semibold">{user?.role}</p>
            <p className="text-slate-500 text-[11px]">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Academic Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="Student Researcher">Student Researcher</option>
              <option value="College Faculty">College Faculty</option>
              <option value="Research Scholar">Research Scholar / PhD</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Primary Research Interests</label>
            <textarea
              rows={3}
              value={interests}
              onChange={e => setInterests(e.target.value)}
              placeholder="E.g. Large Language Models, Low-Rank Adaptation, State Space Models, Graph Attention"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Updating...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
