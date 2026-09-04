import React, { useEffect, useMemo, useState } from 'react';
import { Check, Loader2, Mail, Search, Share2, UserMinus, X } from 'lucide-react';
import { getAllUsers } from '../api/users';
import { listDocumentShares, revokeDocumentShare, shareDocument } from '../api/documents';
import { ShareResponse, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { getAvatarColor, getInitials } from '../utils/avatarHelper';

interface ShareModalProps {
  isOpen: boolean;
  documentId: number | null;
  documentTitle: string;
  onClose: () => void;
  onShareSuccess?: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  documentId,
  documentTitle,
  onClose,
  onShareSuccess,
}) => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [existingShares, setExistingShares] = useState<ShareResponse[]>([]);
  const [searchEmail, setSearchEmail] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permission, setPermission] = useState<'editor' | 'viewer'>('editor');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [revokingUserId, setRevokingUserId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && documentId) {
      loadData();
    } else {
      resetState();
    }
  }, [isOpen, documentId]);

  const resetState = () => {
    setError(null);
    setSuccessMessage(null);
    setSearchEmail('');
    setSelectedUser(null);
    setIsDropdownOpen(false);
    setRevokingUserId(null);
  };

  const loadData = async () => {
    if (!documentId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [allUsers, shares] = await Promise.all([
        getAllUsers(),
        listDocumentShares(documentId),
      ]);
      // Filter out the current user from selectable list
      const filteredUsers = allUsers.filter((u) => u.id !== currentUser?.id);
      setUsers(filteredUsers);
      setExistingShares(shares);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users based on search input
  const searchResults = useMemo(() => {
    if (!searchEmail.trim()) return users;
    const query = searchEmail.toLowerCase().trim();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(query) ||
        u.name.toLowerCase().includes(query)
    );
  }, [users, searchEmail]);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSearchEmail(user.email);
    setIsDropdownOpen(false);
    setError(null);
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentId) return;

    // Resolve target user
    let target = selectedUser;
    if (!target) {
      const match = users.find(
        (u) => u.email.toLowerCase() === searchEmail.trim().toLowerCase()
      );
      if (match) {
        target = match;
      } else {
        setError('Please select a valid registered user by email.');
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await shareDocument(documentId, {
        target_user_id: target.id,
        permission,
      });

      setSuccessMessage(`Document shared with ${target.name} (${target.email})!`);
      if (onShareSuccess) onShareSuccess();

      // Reset selection and refresh shares list
      setSelectedUser(null);
      setSearchEmail('');
      const updatedShares = await listDocumentShares(documentId);
      setExistingShares(updatedShares);
    } catch (err: any) {
      setError(err.message || 'Failed to share document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (targetUserId: number, targetName?: string) => {
    if (!documentId) return;
    setRevokingUserId(targetUserId);
    setError(null);
    setSuccessMessage(null);

    try {
      await revokeDocumentShare(documentId, targetUserId);
      setSuccessMessage(`Access revoked for ${targetName || 'user'}.`);
      setExistingShares((prev) => prev.filter((s) => s.user_id !== targetUserId));
      if (onShareSuccess) onShareSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to revoke access');
    } finally {
      setRevokingUserId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Share Document</h2>
              <p className="text-xs text-slate-500 line-clamp-1 max-w-xs">{documentTitle}</p>
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
        <div className="p-6">
          {isLoading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 leading-relaxed">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Share Form */}
              <form onSubmit={handleShare} className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Enter Email or Name to Share With
                  </label>

                  {/* Dynamic Email Search Input */}
                  <div className="relative">
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type="text"
                        value={searchEmail}
                        onChange={(e) => {
                          setSearchEmail(e.target.value);
                          setSelectedUser(null);
                          setIsDropdownOpen(true);
                          setError(null);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        placeholder="e.g. rahul@example.com"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
                      />
                      {searchEmail && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchEmail('');
                            setSelectedUser(null);
                          }}
                          className="absolute right-3 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Autocomplete Dropdown List */}
                    {isDropdownOpen && searchResults.length > 0 && !selectedUser && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl max-h-48 overflow-y-auto z-20 divide-y divide-slate-100">
                        {searchResults.map((u) => (
                          <div
                            key={u.id}
                            onClick={() => handleSelectUser(u)}
                            className="p-3 hover:bg-blue-50 cursor-pointer transition-colors flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-2.5">
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${getAvatarColor(
                                  u.name
                                )}`}
                              >
                                {getInitials(u.name)}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-800">{u.name}</p>
                                <p className="text-[11px] text-slate-500">{u.email}</p>
                              </div>
                            </div>
                            <span className="text-[10px] text-blue-600 font-medium">Select</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Select Suggestion Pills */}
                  {users.length > 0 && (
                    <div className="flex items-center flex-wrap gap-1.5 mt-2.5">
                      <span className="text-[11px] text-slate-400">Suggestions:</span>
                      {users.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleSelectUser(u)}
                          className={`text-[11px] px-2.5 py-1 rounded-full border transition-all flex items-center space-x-1 ${
                            selectedUser?.id === u.id
                              ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span>{u.name}</span>
                          <span className="opacity-70">({u.email})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Permission Level Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Permission Level
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPermission('editor')}
                      className={`px-3 py-2.5 rounded-xl text-xs font-medium border flex items-center justify-center space-x-1.5 transition-all ${
                        permission === 'editor'
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold ring-2 ring-blue-500/20'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>Can Edit (Editor)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPermission('viewer')}
                      className={`px-3 py-2.5 rounded-xl text-xs font-medium border flex items-center justify-center space-x-1.5 transition-all ${
                        permission === 'viewer'
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold ring-2 ring-blue-500/20'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>Can View (Viewer)</span>
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !searchEmail.trim()}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center space-x-2 active:scale-98"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sharing...</span>
                    </>
                  ) : (
                    <span>Grant Access</span>
                  )}
                </button>
              </form>

              {/* People with Access List */}
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-semibold text-slate-700 mb-2.5">People with access</h4>
                {existingShares.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Not shared with anyone yet.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {existingShares.map((share) => (
                      <div
                        key={share.id}
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 mr-2">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${getAvatarColor(
                              share.user?.name || 'User'
                            )}`}
                          >
                            {getInitials(share.user?.name || 'User')}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800 truncate">
                              {share.user?.name || `User #${share.user_id}`}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">{share.user?.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              share.permission === 'editor'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : 'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}
                          >
                            {share.permission === 'editor' ? 'Can Edit' : 'View Only'}
                          </span>

                          {/* Revoke Access Button */}
                          <button
                            type="button"
                            onClick={() => handleRevoke(share.user_id, share.user?.name)}
                            disabled={revokingUserId === share.user_id}
                            title="Revoke access"
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-1 text-[11px] font-semibold disabled:opacity-50"
                          >
                            {revokingUserId === share.user_id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                            ) : (
                              <UserMinus className="w-3.5 h-3.5" />
                            )}
                            <span className="hidden sm:inline text-red-600">Revoke</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
