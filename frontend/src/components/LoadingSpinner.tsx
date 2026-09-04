import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center">
      {/* Ring spinner */}
      <div className="relative w-12 h-12 mb-4">
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            border: '3px solid transparent',
            borderTopColor: '#2563eb',
            borderRightColor: '#6366f1',
          }}
        />
        <div
          className="absolute inset-1 rounded-full"
          style={{ background: 'linear-gradient(135deg, #eff6ff, #eef2ff)' }}
        />
      </div>
      {message && (
        <p className="text-sm font-semibold text-slate-500 tracking-wide">{message}</p>
      )}
    </div>
  );
};
