import React, { useRef, useState } from 'react';
import { FileCode, FileText, Loader2, Upload, X } from 'lucide-react';
import { importDocument } from '../api/documents';
import { Document } from '../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedDoc: Document) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (ext !== '.txt' && ext !== '.md') {
      setError(`Unsupported file type (${ext}). Only .txt and .md files are supported.`);
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const doc = await importDocument(selectedFile);
      onImportSuccess(doc);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to import file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Import Document</h2>
              <p className="text-xs text-slate-500">Supports .txt and .md files</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
              {error}
            </div>
          )}

          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/20 transition-all flex flex-col items-center justify-center space-y-3"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-emerald-600">
              <FileCode className="w-6 h-6" />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-700">
                {selectedFile ? selectedFile.name : 'Click to browse or drag & drop'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {selectedFile
                  ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                  : 'Plain Text (.txt) or Markdown (.md)'}
              </p>
            </div>
          </div>

          {/* Supported Types Info */}
          <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-around text-xs text-slate-600 border border-slate-100">
            <div className="flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-blue-500" />
              <span>.txt (Plain Text)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <FileCode className="w-4 h-4 text-purple-500" />
              <span>.md (Markdown)</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleImport}
            disabled={!selectedFile || isUploading}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center space-x-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Importing Document...</span>
              </>
            ) : (
              <span>Import & Open Document</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
