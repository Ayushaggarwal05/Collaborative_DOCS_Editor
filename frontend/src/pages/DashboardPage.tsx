import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  FilePlus,
  FileText,
  FolderOpen,
  Plus,
  RefreshCw,
  Search,
  Share2,
  Upload,
  Users,
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { DocumentCard } from "../components/DocumentCard";
import { EmptyState } from "../components/EmptyState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ShareModal } from "../components/ShareModal";
import { ImportModal } from "../components/ImportModal";
import { DeleteModal } from "../components/DeleteModal";
import { createDocument, deleteDocument, getDocuments } from "../api/documents";
import { Document, SharedDocumentItem } from "../types";
import { useAuth } from "../context/AuthContext";

export const DashboardPage: React.FC = () => {
  const { currentUser, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [myDocuments, setMyDocuments] = useState<Document[]>([]);
  const [sharedWithMe, setSharedWithMe] = useState<SharedDocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"all" | "mine" | "shared">("all");

  // Modals state
  const [shareModalState, setShareModalState] = useState<{
    isOpen: boolean;
    docId: number | null;
    docTitle: string;
  }>({
    isOpen: false,
    docId: null,
    docTitle: "",
  });

  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    docId: number | null;
    docTitle: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    docId: null,
    docTitle: "",
    isDeleting: false,
  });

  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDocuments();
    }
  }, [isAuthenticated]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getDocuments();
      setMyDocuments(response.my_documents || []);
      setSharedWithMe(response.shared_with_me || []);
    } catch (err: any) {
      setError(
        err.message ||
          "Failed to fetch documents. Please verify backend connection.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    setIsCreating(true);
    setError(null);
    try {
      const newDoc = await createDocument({ title: "Untitled Document" });
      navigate(`/document/${newDoc.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create new document");
      setIsCreating(false);
    }
  };

  const openDeleteModal = (docId: number, title: string) => {
    setDeleteModalState({
      isOpen: true,
      docId,
      docTitle: title || "Untitled Document",
      isDeleting: false,
    });
  };

  const confirmDeleteDocument = async () => {
    if (!deleteModalState.docId) return;

    setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));
    try {
      await deleteDocument(deleteModalState.docId);
      setMyDocuments((prev) =>
        prev.filter((d) => d.id !== deleteModalState.docId),
      );
      setDeleteModalState({
        isOpen: false,
        docId: null,
        docTitle: "",
        isDeleting: false,
      });
    } catch (err: any) {
      alert(`Failed to delete document: ${err.message}`);
      setDeleteModalState((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const openShareModal = (docId: number, title: string) => {
    setShareModalState({
      isOpen: true,
      docId,
      docTitle: title || "Untitled Document",
    });
  };

  const handleImportSuccess = (importedDoc: Document) => {
    navigate(`/document/${importedDoc.id}`);
  };

  // Filtered lists
  const filteredMyDocs = useMemo(() => {
    if (!searchQuery.trim()) return myDocuments;
    const q = searchQuery.toLowerCase();
    return myDocuments.filter((d) => d.title.toLowerCase().includes(q));
  }, [myDocuments, searchQuery]);

  const filteredSharedDocs = useMemo(() => {
    if (!searchQuery.trim()) return sharedWithMe;
    const q = searchQuery.toLowerCase();
    return sharedWithMe.filter((d) => d.title.toLowerCase().includes(q));
  }, [sharedWithMe, searchQuery]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <LoadingSpinner message="Checking authentication..." />
      </div>
    );
  }

  const tabs: {
    key: "all" | "mine" | "shared";
    label: string;
    count: number;
  }[] = [
    {
      key: "all",
      label: "All",
      count: myDocuments.length + sharedWithMe.length,
    },
    { key: "mine", label: "My Docs", count: myDocuments.length },
    { key: "shared", label: "Shared", count: sharedWithMe.length },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(145deg, #eff6ff 0%, #f8faff 55%, #eef2ff 100%)",
      }}
    >
      <Navbar />

      {/* Blue Gradient Hero Banner */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            {/* Greeting */}
            <div>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-[0.2em] mb-3">
                Your Workspace
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Welcome back,
                <br />
                <span className="text-blue-200">
                  {currentUser?.name?.split(" ")[0] || "Writer"}
                </span>{" "}
                👋
              </h1>
              <p className="text-blue-100/80 text-base sm:text-lg mt-4 max-w-md leading-relaxed">
                Create, edit, and collaborate on your documents — all in one
                place.
              </p>

              {/* Stat Chips */}
              <div className="flex flex-wrap items-center gap-3 mt-6">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-semibold text-white">
                  <FileText className="w-4 h-4 text-blue-200" />
                  <span>{myDocuments.length} My Documents</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-semibold text-white">
                  <Share2 className="w-4 h-4 text-indigo-200" />
                  <span>{sharedWithMe.length} Shared With Me</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-semibold text-white">
                  <FolderOpen className="w-4 h-4 text-blue-200" />
                  <span>{myDocuments.length + sharedWithMe.length} Total</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-stretch space-y-3 sm:space-y-0 sm:space-x-3 md:space-x-0 md:space-y-3 w-full md:w-auto">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 text-white text-sm font-semibold backdrop-blur-sm transition-all active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>Import File</span>
              </button>

              <button
                onClick={handleCreateDocument}
                disabled={isCreating}
                className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-blue-50 disabled:opacity-50 text-blue-700 text-sm font-bold shadow-xl shadow-blue-900/25 transition-all hover:scale-[1.03] active:scale-[0.97]"
              >
                <Plus className="w-5 h-5" />
                <span>{isCreating ? "Creating..." : "+ New Document"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Search & Tabs Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Segmented Tabs */}
          <div className="flex items-center bg-white border border-blue-100 shadow-sm rounded-2xl p-1 w-full sm:w-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                    : "text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72 group">
            <Search className="w-4 h-4 text-blue-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-blue-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-blue-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all shadow-md shadow-blue-100/60 font-medium"
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between text-xs text-red-700">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchDocuments}
              className="inline-flex items-center space-x-1 font-semibold underline hover:text-red-900"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="py-20">
            <LoadingSpinner message="Loading your documents..." />
          </div>
        ) : (
          <div className="space-y-10">
            {/* My Documents Section */}
            {(activeTab === "all" || activeTab === "mine") && (
              <section>
                <div className="flex items-center space-x-3 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/30">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800 tracking-tight leading-none">
                      My Documents
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Documents you own and created
                    </p>
                  </div>
                  <span className="ml-auto text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                    {filteredMyDocs.length}
                  </span>
                </div>

                {filteredMyDocs.length === 0 ? (
                  searchQuery ? (
                    <p className="text-xs text-slate-400 italic py-4">
                      No matching personal documents found for "{searchQuery}".
                    </p>
                  ) : (
                    <EmptyState
                      title="No personal documents yet"
                      description="You haven't created any documents yet. Create one or import a text file."
                      actionText="Create Document"
                      onAction={handleCreateDocument}
                      icon={<FilePlus className="w-7 h-7 text-blue-600" />}
                    />
                  )
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMyDocs.map((doc) => (
                      <DocumentCard
                        key={doc.id}
                        document={doc}
                        isOwner={true}
                        onShare={openShareModal}
                        onDelete={openDeleteModal}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Shared With Me Section */}
            {(activeTab === "all" || activeTab === "shared") && (
              <section>
                <div className="flex items-center space-x-3 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/30">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800 tracking-tight leading-none">
                      Shared With Me
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Documents others have shared with you
                    </p>
                  </div>
                  <span className="ml-auto text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
                    {filteredSharedDocs.length}
                  </span>
                </div>

                {filteredSharedDocs.length === 0 ? (
                  searchQuery ? (
                    <p className="text-xs text-slate-400 italic py-4">
                      No matching shared documents found for "{searchQuery}".
                    </p>
                  ) : (
                    <div className="bg-white rounded-2xl border border-dashed border-blue-200 p-10 text-center">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-1">
                        No shared documents
                      </h4>
                      <p className="text-xs text-slate-400">
                        When another user shares a document with you, it will
                        appear here.
                      </p>
                    </div>
                  )
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSharedDocs.map((item) => (
                      <DocumentCard
                        key={item.id}
                        document={item}
                        isOwner={false}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </main>

      <ShareModal
        isOpen={shareModalState.isOpen}
        documentId={shareModalState.docId}
        documentTitle={shareModalState.docTitle}
        onClose={() =>
          setShareModalState({ isOpen: false, docId: null, docTitle: "" })
        }
      />
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
      <DeleteModal
        isOpen={deleteModalState.isOpen}
        documentTitle={deleteModalState.docTitle}
        isDeleting={deleteModalState.isDeleting}
        onClose={() =>
          setDeleteModalState({
            isOpen: false,
            docId: null,
            docTitle: "",
            isDeleting: false,
          })
        }
        onConfirm={confirmDeleteDocument}
      />
    </div>
  );
};
