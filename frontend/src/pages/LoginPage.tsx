import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  FileCode,
  FileText,
  Lock,
  Mail,
  Share2,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { getDemoUsers, loginUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import { getAvatarColor, getInitials } from '../utils/avatarHelper';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [emailInput, setEmailInput] = useState<string>('ayush@example.com');
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setError(null);
    try {
      const users = await getDemoUsers();
      setDemoUsers(users);
      if (users.length > 0 && !emailInput) {
        setEmailInput(users[0].email);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load demo accounts. Please verify FastAPI backend is running on port 8000.');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setError('Please enter an email address.');
      return;
    }

    setIsLoggingIn(true);
    setError(null);
    try {
      const response = await loginUser({ email: emailInput.trim() });
      login(response.user);
      navigate('/');
    } catch (err: any) {
      setError(
        err.message ||
          'Login failed. Please enter a valid registered user (e.g., ayush@example.com or rahul@example.com).'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleQuickLogin = async (user: User) => {
    setEmailInput(user.email);
    setIsLoggingIn(true);
    setError(null);
    try {
      const response = await loginUser({ user_id: user.id });
      login(response.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Quick login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Ambient Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none" />

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Col: Brand & Feature Highlights */}
        <div className="lg:col-span-6 space-y-6 text-left hidden lg:block">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Native Full-Stack Assignment</span>
          </div>

          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <FileText className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">Ajaia Docs</h1>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              A lightweight, high-performance collaborative document editor with granular permissions, Markdown import, and Tiptap rich-text formatting.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-3 text-xs text-slate-300">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <span>FastAPI + SQLite backend with 29 automated tests</span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-300">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Share2 className="w-4 h-4" />
              </div>
              <span>Owner, Editor, and Viewer access control & sharing</span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-300">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0">
                <FileCode className="w-4 h-4" />
              </div>
              <span>Tiptap ProseMirror engine with .txt/.md file import</span>
            </div>
          </div>
        </div>

        {/* Right Col: Interactive Login Card */}
        <div className="lg:col-span-6 w-full">
          <div className="bg-white text-slate-900 rounded-3xl p-7 sm:p-9 shadow-2xl border border-slate-100/90 relative">
            {/* Header (Mobile & Desktop) */}
            <div className="mb-6 text-center lg:text-left">
              <div className="inline-flex lg:hidden items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to your account</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your registered email or use a 1-click demo account.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-600 leading-relaxed flex items-start space-x-2">
                <span className="font-semibold flex-shrink-0">Error:</span>
                <span>{error}</span>
              </div>
            )}

            {/* Email Login Form */}
            <form onSubmit={handleFormLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      setError(null);
                    }}
                    placeholder="e.g. ayush@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn || !emailInput.trim()}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 active:scale-98"
              >
                {isLoggingIn ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Continue to Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative inline-block bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Or 1-Click Demo Accounts
              </div>
            </div>

            {/* Quick Demo Account Cards */}
            <div className="space-y-2">
              {demoUsers.map((user) => {
                const isSelected = emailInput.toLowerCase() === user.email.toLowerCase();
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleQuickLogin(user)}
                    disabled={isLoggingIn}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left group ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarColor(
                          user.name
                        )}`}
                      >
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-slate-400">{user.email}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                      Sign in as {user.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Footer security note */}
            <div className="mt-6 flex items-center justify-center space-x-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Session stored securely in local workspace</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
