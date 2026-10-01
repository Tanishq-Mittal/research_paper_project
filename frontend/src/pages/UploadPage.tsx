import React, { useState, useRef } from 'react';
import { 
  Upload, FileText, CheckCircle2, Sparkles, AlertCircle, 
  ArrowRight, Link, RefreshCw, Layers, ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { Paper } from '../types';
import { useWorkspace } from '../contexts/WorkspaceContext';

interface UploadPageProps {
  onNavigate: (page: string) => void;
  onOpenReader: (paper: Paper) => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({ onNavigate, onOpenReader }) => {
  const { addToast } = useWorkspace();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);
  const [uploadedPaper, setUploadedPaper] = useState<Paper | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith('.pdf') || file.name.toLowerCase().endsWith('.txt') || file.name.toLowerCase().endsWith('.md')) {
        setSelectedFile(file);
      } else {
        addToast({ type: 'error', title: 'Invalid format', description: 'Please drop a valid PDF, TXT, or Markdown file.' });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const startUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMessage(null);
    setUploadProgress(15);
    setProcessingSteps([
      "● Uploading file buffer to secure storage...",
    ]);

    const progressTimer = setInterval(() => {
      setUploadProgress(p => (p < 85 ? p + 15 : p));
    }, 400);

    try {
      const resp = await api.uploadPaper(selectedFile, customTitle || undefined);
      clearInterval(progressTimer);
      setUploadProgress(100);
      setProcessingSteps(resp.processing_steps || [
        "✓ File received and saved",
        "✓ Text extracted via PyMuPDF",
        "✓ Sections detected",
        "✓ Embeddings indexed into vector database",
        "✓ Structured digest generated"
      ]);
      setUploadedPaper(resp.paper);
      addToast({ type: 'success', title: 'Paper processed and indexed successfully!' });
    } catch (err: any) {
      clearInterval(progressTimer);
      setErrorMessage(err.message || "Couldn't extract text from this PDF. It may be scanned. Try an OCR-enabled PDF.");
      addToast({ type: 'error', title: 'Processing Failed', description: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-heading text-slate-100">Upload Research Paper</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Ingest research PDFs, extract structured academic sections, generate semantic embeddings, and create structured digests.
        </p>
      </div>

      {!uploadedPaper ? (
        <div className="space-y-6">
          {/* Drag & Drop Container */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`p-10 rounded-3xl border-2 border-dashed transition-all text-center cursor-pointer relative overflow-hidden ${
              dragActive
                ? 'border-brand-400 bg-brand-950/40 shadow-glow'
                : selectedFile
                ? 'border-emerald-500/60 bg-emerald-950/10'
                : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-brand-600/10 border border-brand-500/20 text-brand-400 mx-auto flex items-center justify-center">
                <Upload className="w-7 h-7" />
              </div>

              {selectedFile ? (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-emerald-400">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Ready to process</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-200">Drag & drop your research paper PDF here</p>
                  <p className="text-xs text-slate-500">Supports PDF, Markdown, and TXT up to 25MB with OCR text extraction</p>
                </div>
              )}
            </div>
          </div>

          {/* Optional Title Input */}
          {selectedFile && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Paper Title (Optional override)</label>
                <input
                  type="text"
                  placeholder={selectedFile.name.replace(/\.[^/.]+$/, "")}
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <button
                onClick={startUpload}
                disabled={isUploading}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing & Indexing Vector Chunks...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Process Paper & Generate AI Digest</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Stepped Progress Indicator */}
          {isUploading && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-brand-500/30 space-y-4 animate-fade-in shadow-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">Processing Pipeline Progress</span>
                <span className="font-mono text-brand-400 font-bold">{uploadProgress}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-indigo-400 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>

              {/* Processing Steps Stream */}
              <div className="space-y-1.5 pt-2">
                {processingSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="font-mono text-[11px] text-brand-400">&bull;</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error display */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-xs text-red-300">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-400">Extraction Error</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Upload Completion View */
        <div className="p-8 rounded-3xl bg-slate-900 border border-emerald-500/40 space-y-6 animate-scale-up shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Analysis Complete</span>
              <h3 className="text-lg font-bold text-slate-100">{uploadedPaper.title}</h3>
              <p className="text-xs text-slate-400">
                {uploadedPaper.page_count} Pages &bull; Semantic Chunks Indexed into Vector Store &bull; Ready for Synthesis
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onOpenReader(uploadedPaper)}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-500/20 transition-all"
            >
              <span>Open in Split-View Reader</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setUploadedPaper(null);
                setSelectedFile(null);
                setCustomTitle('');
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Upload Another Paper
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
