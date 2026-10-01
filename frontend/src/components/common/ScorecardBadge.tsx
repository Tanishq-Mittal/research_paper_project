import React from 'react';
import { Award, Calendar, Database, CheckCircle, BarChart2, BookOpen } from 'lucide-react';
import { ScorecardMetrics } from '../../types';

interface ScorecardBadgeProps {
  scorecard?: ScorecardMetrics;
  citationCount?: number;
  year?: number;
}

export const ScorecardBadge: React.FC<ScorecardBadgeProps> = ({ scorecard, citationCount, year }) => {
  const citations = scorecard?.citation_count ?? citationCount ?? 0;
  const pubYear = scorecard?.publication_year ?? year ?? 'N/A';
  const hasDataset = scorecard?.dataset_reported ?? true;
  const metricsCount = scorecard?.metrics_reported?.length ?? 2;

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
      {/* Year */}
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
        <Calendar className="w-3 h-3 text-slate-400" />
        {pubYear}
      </span>

      {/* Citations */}
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
        <Award className="w-3 h-3 text-amber-400" />
        {citations.toLocaleString()} citations
      </span>

      {/* Dataset Reported */}
      {hasDataset && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
          <Database className="w-3 h-3 text-emerald-400" />
          Benchmark Dataset
        </span>
      )}

      {/* Metrics */}
      {metricsCount > 0 && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-300 border border-brand-500/20">
          <BarChart2 className="w-3 h-3 text-brand-400" />
          {metricsCount} Metrics Reported
        </span>
      )}

      {/* Open Access */}
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
        <CheckCircle className="w-3 h-3 text-indigo-400" />
        Open Access
      </span>
    </div>
  );
};
