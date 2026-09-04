import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Eye,
  FileText,
  Loader2,
  Lock,
  Pencil,
  Save,
  Share2,
  ShieldAlert,
  Upload,
} from 'lucide-react';
import { TiptapEditor } from '../components/TiptapEditor';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ShareModal } from '../components/ShareModal';
import { ImportModal } from '../components/ImportModal';
import { getDocument, updateDocument } from '../api/documents';
import { Document } from '../types';
import { useAuth } from '../context/AuthContext';
import { getAvatarColor, getInitials } from '../utils/avatarHelper';

type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

export const EditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const documentId = Number(id);
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [document, setDocument] = useState<Document | null>(null);
  const [title, setTitle] = useState<string>('Untitled Document');
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // Auto-save debounce timer ref
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef<boolean>(true);

  const isOwner = document?.user_permission === 'owner';
  const isReadOnly = document?.user_permission === 'viewer';
  const canEdit = !isReadOnly;

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  useEffect(() => {
    if (documentId) {
      fetchDocument();
    }
  }, [documentId]);

  const fetchDocument = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setErrorCode(null);
    try {
      const doc = await getDocument(documentId);
      setDocument(doc);
      setTitle(doc.title || 'Untitled Document');
      setContent(doc.content);
      setSaveStatus('saved');
      isInitialLoadRef.current = true;
    } catch (err: any) {
      setErrorCode(err.status || 500);
      setErrorMessage(err.message || 'Failed to load document');
    } finally {
      setIsLoading(false);
    }
  };

  // Perform document save
  const handleSave = useCallback(
    async (newTitle?: string, newContent?: any) => {
      if (!canEdit || !document) return;

      const titleToSave = (newTitle !== undefined ? newTitle : title).trim() || 'Untitled Document';
      const contentToSave = newContent !== undefined ? newContent : content;

      setSaveStatus('saving');
      try {
        const updated = await updateDocument(document.id, {
          title: titleToSave,
          content: contentToSave,
        });
        setDocument(updated);
        setSaveStatus('saved');
      } catch (err: any) {
        console.error('Save failed:', err);
        setSaveStatus('error');
      }
    },
    [canEdit, document, title, content]
  );

  // Keyboard shortcut for Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (canEdit) {
          handleSave();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canEdit, handleSave]);

  // Content change handler with debounced auto-save
  const handleContentChange = (newContent: any) => {
    setContent(newContent);
    if (!canEdit) return;

    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    setSaveStatus('unsaved');

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Auto-save after 1200ms of inactivity
    autoSaveTimerRef.current = setTimeout(() => {
      handleSave(title, newContent);
    }, 1200);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!canEdit) return;

    setSaveStatus('unsaved');
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      handleSave(newTitle, content);
    }, 1200);
  };

  const handleTitleBlur = () => {
    if (canEdit && saveStatus === 'unsaved') {
      handleSave(title, content);
    }
  };

  if (isLoading || isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <LoadingSpinner message="Opening document..." />
      </div>
    );
  }

  // Error States (403 Forbidden, 404 Not Found, etc.)
  if (errorMessage || !document) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'linear-gradient(145deg, #eff6ff 0%, #f8faff 55%, #eef2ff 100%)' }}>
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-lg border border-blue-100 text-center space-y-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${
              errorCode === 403
                ? 'bg-amber-50 text-amber-600 border border-amber-100'
                : 'bg-red-50 text-red-600 border border-red-100'
            }`}
          >
            {errorCode === 403 ? <Lock className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {errorCode === 403 ? '403 Forbidden' : errorCode === 404 ? '404 Not Found' : 'Error'}
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              {errorCode === 403
                ? 'Access Restricted'
                : errorCode === 404
                ? 'Document Not Found'
                : 'Unable to Load Document'}
            </h2>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            {errorMessage || 'You do not have permission to view or edit this document.'}
          </p>

          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(145deg, #eff6ff 0%, #f8faff 55%, #eef2ff 100%)' }}>
      {/* Editor Header Navigation */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-30 shadow-sm h-16 flex items-center justify-between px-4 sm:px-6">
        {/* Left: Back Link & Document Title */}
        <div className="flex items-center space-x-3 flex-1 min-w-0 mr-4">
          <Link
            to="/"
            title="Back to Dashboard"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5 group">
              <input
                type="text"
                value={title}
                disabled={!canEdit}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                placeholder="Untitled Document"
                className={`text-sm sm:text-base font-bold text-slate-900 bg-transparent rounded-lg px-2 py-0.5 -ml-2 transition-all border border-transparent truncate ${
                  canEdit
                    ? 'hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20'
                    : 'cursor-default'
                }`}
              />
              {canEdit && (
                <Pencil className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              )}
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-slate-400 pl-0.5">
              <span>{isOwner ? 'Your Document' : `Shared by ${document.owner?.name || 'Owner'}`}</span>
              <span>•</span>

              {/* Save Status Badge */}
              {saveStatus === 'saving' && (
                <span className="flex items-center space-x-1 text-blue-600 font-medium">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Saving...</span>
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="flex items-center space-x-1 text-emerald-600 font-medium">
                  <Check className="w-3 h-3" />
                  <span>Saved to cloud</span>
                </span>
              )}
              {saveStatus === 'unsaved' && (
                <span className="flex items-center space-x-1 text-amber-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>Unsaved changes</span>
                </span>
              )}
              {saveStatus === 'error' && (
                <button
                  onClick={() => handleSave()}
                  className="text-red-600 font-semibold underline hover:text-red-700"
                >
                  Save failed — click to retry
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2 sm:space-x-2.5 flex-shrink-0">
          {/* Permission indicator chip */}
          {isOwner ? (
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
              Owner
            </span>
          ) : isReadOnly ? (
            <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
              <Eye className="w-3.5 h-3.5" />
              <span>Viewer</span>
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              Editor
            </span>
          )}

          {/* Import Button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            title="Import .txt / .md File"
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* Share Button (Owner Only) */}
          {isOwner && (
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          )}

          {/* Save Button */}
          {canEdit && (
            <button
              onClick={() => handleSave()}
              disabled={saveStatus === 'saving'}
              title="Save changes (Ctrl+S)"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-all active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>{saveStatus === 'saving' ? 'Saving...' : 'Save'}</span>
            </button>
          )}

          {/* Current User Avatar */}
          {currentUser && (
            <div
              title={`Logged in as ${currentUser.name}`}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarColor(
                currentUser.name
              )}`}
            >
              {getInitials(currentUser.name)}
            </div>
          )}
        </div>
      </header>

      {/* Tiptap Rich-Text Editor Canvas */}
      <TiptapEditor
        initialContent={content}
        onChange={handleContentChange}
        isReadOnly={isReadOnly}
      />

      {/* Share Modal */}
      {isOwner && (
        <ShareModal
          isOpen={isShareModalOpen}
          documentId={document.id}
          documentTitle={document.title}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={(newDoc) => navigate(`/document/${newDoc.id}`)}
      />
    </div>
  );
};
