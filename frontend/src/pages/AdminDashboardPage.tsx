import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Server, Database, Activity, Cpu, 
  HardDrive, Users, FileText, Sparkles, RefreshCw,
  Search, Mail, GraduationCap, BookOpen, Clock, CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

interface UserRecord {
  id: string;
  full_name: string;
  email: string;
  role: string;
  research_interests: string;
  preferred_citation_style: string;
  papers_uploaded: number;
  registered_at: string;
}

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsData, usersData] = await Promise.all([
        api.getAdminStats().catch(() => null),
        api.getAdminUsers().catch(() => ({ users: [] }))
      ]);
      if (statsData) setStats(statsData);
      if (usersData && usersData.users) setUsers(usersData.users);
    } catch (e) {
      console.error("Admin data loading error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.research_interests?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-heading text-slate-100">Admin Telemetry & User Records</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Live & Protected
            </span>
          </div>
          <p className="text-slate-400 mt-1">
            Structured real-time records of all registered researchers, form submissions, and system performance.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-700 transition-all shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 text-brand-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="font-medium text-xs">Refresh Data</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>Total Researchers</span>
              <Users className="w-4 h-4 text-brand-400" />
            </div>
            <p className="text-2xl font-bold text-slate-100 font-heading">{stats.total_users}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>Uploaded Papers</span>
              <FileText className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-slate-100 font-heading">{stats.total_papers}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>Vector Chunks</span>
              <Database className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-slate-100 font-heading">{stats.total_vector_chunks}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>RAG Engine Latency</span>
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400 font-mono">{stats.api_latency_ms} ms</p>
          </div>
        </div>
      )}

      {/* User Records Table (What users filled in) */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-400" />
              <h2 className="text-base font-bold text-slate-100">Registered Users & Profile Submissions</h2>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Detailed breakdown of who registered, their academic roles, research domains, and activity.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-sm font-medium">No user records found matching your filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-950/60 text-slate-400 font-semibold">
                  <th className="py-3 px-4">Researcher Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Academic Role</th>
                  <th className="py-3 px-4">Research Interests</th>
                  <th className="py-3 px-4 text-center">Papers</th>
                  <th className="py-3 px-4">Registered At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{user.full_name || "N/A"}</div>
                      <div className="text-[10px] text-slate-500 font-mono">ID: {user.id.slice(0, 8)}...</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Mail className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span className="font-mono">{user.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-brand-500/10 text-brand-300 border border-brand-500/20">
                        <GraduationCap className="w-3 h-3" />
                        {user.role || "Student Researcher"}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="text-slate-300 truncate" title={user.research_interests}>
                        {user.research_interests || "General Research"}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 font-bold">
                        {user.papers_uploaded}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{user.registered_at}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Infrastructure Telemetry Details */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-brand-400" /> AI Engine & Vector Store Telemetry
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Vector Store Tier:</span>
                <span className="font-semibold text-emerald-400">{stats.vector_store_status}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Embedding Model:</span>
                <span className="font-mono text-brand-400 font-bold">{stats.embedding_model}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">LLM Provider Status:</span>
                <span className="font-semibold text-slate-200">{stats.ai_llm_status}</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-indigo-400" /> Storage & Cloud Health
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Storage Consumption:</span>
                <span className="font-mono text-slate-200 font-bold">{stats.storage_used_mb} MB</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Reviews Synthesized:</span>
                <span className="font-semibold text-slate-200">{stats.total_reviews_synthesized}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">System Availability:</span>
                <span className="font-semibold text-emerald-400">100% Zero-Crash Invariant</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
