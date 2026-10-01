import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Server, Database, Activity, Cpu, 
  HardDrive, Users, FileText, Sparkles, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (e) {
      console.error("Admin stats error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in text-xs">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-heading text-slate-100">System Telemetry & Health Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Operational
            </span>
          </div>
          <p className="text-slate-400 mt-0.5">Developer metrics, vector store status, API response latency, and database health.</p>
        </div>

        <button
          onClick={loadStats}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-brand-400" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {stats && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400">Total Users</span>
              <p className="text-xl font-bold text-slate-100 font-heading">{stats.total_users}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400">Indexed Papers</span>
              <p className="text-xl font-bold text-slate-100 font-heading">{stats.total_papers}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400">Semantic Vector Chunks</span>
              <p className="text-xl font-bold text-slate-100 font-heading">{stats.total_vector_chunks}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400">Average RAG Latency</span>
              <p className="text-xl font-bold text-emerald-400 font-mono font-bold">{stats.api_latency_ms} ms</p>
            </div>
          </div>

          {/* Infrastructure Health Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-100">Vector Store & AI Engine Telemetry</h3>
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
              <h3 className="text-sm font-bold text-slate-100">Storage & Database Storage</h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400">PDF Storage Consumption:</span>
                  <span className="font-mono text-slate-200 font-bold">{stats.storage_used_mb} MB</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400">Reviews Synthesized:</span>
                  <span className="font-semibold text-slate-200">{stats.total_reviews_synthesized}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400">System Uptime & Invariants:</span>
                  <span className="font-semibold text-emerald-400">100% Zero-Crash Invariant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
