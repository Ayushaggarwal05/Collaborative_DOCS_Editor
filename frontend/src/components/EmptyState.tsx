import React from 'react';
import { FileText, Plus } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div
      className="rounded-3xl p-12 text-center flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(145deg, #f8faff, #f0f6ff)',
        border: '1.5px dashed #bfdbfe',
      }}
    >
      {/* Icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{
          background: 'linear-gradient(135deg, #dbeafe, #e0e7ff)',
          boxShadow: '0 4px 20px rgba(59,130,246,0.15)',
        }}
      >
        <span className="text-blue-600">
          {icon || <FileText className="w-8 h-8" />}
        </span>
      </div>

      <h3 className="text-base font-bold text-slate-800 mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed max-w-xs">{description}</p>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
            boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
          }}
        >
          <Plus className="w-4 h-4" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
