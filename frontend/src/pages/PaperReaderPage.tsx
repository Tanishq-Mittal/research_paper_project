import React, { useState, useEffect } from 'react';
import { Paper } from '../types';
import { api } from '../services/api';
import { SplitViewReader } from '../components/reader/SplitViewReader';
import { useWorkspace } from '../contexts/WorkspaceContext';

interface PaperReaderPageProps {
  onBack: () => void;
}

export const PaperReaderPage: React.FC<PaperReaderPageProps> = ({ onBack }) => {
  const { activePaper, setActivePaper } = useWorkspace();
  const [paper, setPaper] = useState<Paper | null>(activePaper);
  const [isLoading, setIsLoading] = useState<boolean>(!activePaper);

  useEffect(() => {
    async function loadActive() {
      if (!paper) {
        try {
          const list = await api.getPapers();
          if (list.length > 0) {
            setPaper(list[0]);
            setActivePaper(list[0]);
          }
        } catch (e) {
          console.error("Reader load error:", e);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }
    loadActive();
  }, [paper]);

  if (isLoading) {
    return (
      <div className="p-16 text-center text-xs text-slate-500">
        Loading paper reader and RAG index...
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="p-16 text-center text-xs text-slate-500">
        No paper selected. Please select a paper from your Library.
      </div>
    );
  }

  return <SplitViewReader paper={paper} onBack={onBack} />;
};
