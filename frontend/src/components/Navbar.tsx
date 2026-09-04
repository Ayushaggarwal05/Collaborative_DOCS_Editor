import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAvatarColor, getInitials } from '../utils/avatarHelper';

export const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();

  return (
    <header
      className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl"
      style={{
        borderBottom: '1.5px solid rgba(147,197,253,0.7)',
        boxShadow: '0 4px 32px rgba(59,130,246,0.1), 0 1px 0 rgba(147,197,253,0.4)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
            style={{
              background: 'linear-gradient(135deg, #2563eb, #6366f1)',
              boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
            }}
          >
            <FileText style={{ width: 17, height: 17 }} />
          </div>
          <div className="flex items-center gap-2.5">
            <span
              className="font-black text-[17px] text-slate-900"
              style={{ letterSpacing: '-0.03em' }}
            >
              Ajaia<span className="text-blue-600">Docs</span>
            </span>
            <span
              className="hidden sm:inline-flex text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #eff6ff, #eef2ff)',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
              }}
            >
              BETA
            </span>
          </div>
        </Link>

        {/* Right Side */}
        {currentUser && (
          <div className="flex items-center gap-2">
            {/* User Pill */}
            <div
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #eff6ff, #eef2ff)',
                border: '1.5px solid #bfdbfe',
                boxShadow: '0 1px 8px rgba(59,130,246,0.1)',
              }}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black ring-2 ring-white shadow-sm ${getAvatarColor(currentUser.name)}`}
              >
                {getInitials(currentUser.name)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-none">
                  {currentUser.name}
                </p>
                <p className="text-[10px] font-medium text-blue-500 leading-none mt-0.5">
                  {currentUser.email}
                </p>
              </div>
              <ChevronDown className="w-3 h-3 text-blue-400 hidden sm:block" />
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              title="Logout"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 border border-slate-200 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all duration-150"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
