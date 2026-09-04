import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  FileText,
  Share2,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { Document, SharedDocumentItem } from "../types";
import { formatRelativeTime } from "../utils/dateFormatter";
import { getAvatarColor, getInitials } from "../utils/avatarHelper";

interface DocumentCardProps {
  document: Document | SharedDocumentItem;
  isOwner: boolean;
  onShare?: (docId: number, title: string) => void;
  onDelete?: (docId: number, title: string) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  isOwner,
  onShare,
  onDelete,
}) => {
  const navigate = useNavigate();

  const isSharedItem = "shared_at" in document;
  const permission = isOwner
    ? "owner"
    : (document as SharedDocumentItem).permission || "viewer";

  const handleClick = () => {
    navigate(`/document/${document.id}`);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) onShare(document.id, document.title);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(document.id, document.title);
  };

  return (
    <div
      onClick={handleClick}
      className={`group rounded-3xl p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
        isOwner
          ? 'border border-blue-400/30 hover:border-blue-300 hover:-translate-y-1'
          : 'bg-white border border-slate-200 hover:border-blue-300 text-slate-900 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-100/60'
      }`}
      style={isOwner ? {
        background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 60%, #6366f1 100%)',
        boxShadow: '0 8px 32px rgba(37,99,235,0.30)',
      } : {
        boxShadow: '0 2px 12px rgba(15,23,42,0.06)',
      }}
    >
      {/* Top Bar: Icon + Permission Badge */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOwner ? 'bg-white/10 text-white' : 'bg-blue-50 text-blue-600'}`}>
            <FileText className="w-5 h-5" />
          </div>

          <div className="flex items-center space-x-1.5">
            {isOwner ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/20 text-white border border-white/10">
                Owner
              </span>
            ) : permission === "editor" ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                Can Edit
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                View Only
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className={`font-bold text-base line-clamp-1 mb-1.5 transition-colors ${
          isOwner ? 'text-white' : 'text-slate-900 group-hover:text-blue-600'
        }`}>
          {document.title || "Untitled Document"}
        </h3>

        {/* Owner Info */}
        <div className={`flex items-center space-x-2 text-xs mb-4 ${
          isOwner ? 'text-blue-100' : 'text-slate-500'
        }`}>
          {document.owner ? (
            <div className="flex items-center space-x-1.5">
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-semibold ${getAvatarColor(
                  document.owner.name,
                )}`}
              >
                {getInitials(document.owner.name)}
              </span>
              <span>{isOwner ? "Created by you" : document.owner.name}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <UserIcon className="w-3.5 h-3.5 opacity-70" />
              <span>{isOwner ? "Created by you" : "Shared User"}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Last modified time + Actions */}
      <div className={`pt-3 flex items-center justify-between text-xs ${
        isOwner
          ? 'border-t border-white/15 text-blue-100'
          : 'border-t border-slate-100 text-slate-400'
      }`}>
        <div className="flex items-center space-x-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatRelativeTime(document.updated_at)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100">
          {isOwner && onShare && (
            <button
              onClick={handleShareClick}
              title="Share Document"
              className={`p-1.5 rounded-lg transition-colors ${
                isOwner
                  ? 'text-blue-200 hover:text-white hover:bg-white/15'
                  : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}

          {isOwner && onDelete && (
            <button
              onClick={handleDeleteClick}
              title="Delete Document"
              className={`p-1.5 rounded-lg transition-colors ${
                isOwner
                  ? 'text-blue-200 hover:text-red-300 hover:bg-white/15'
                  : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
