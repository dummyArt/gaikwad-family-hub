import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserCheck,
  UserX,
  Link as LinkIcon,
  Copy,
  Check,
  HardDrive,
  Users,
  Clock,
  Sparkles,
  Flame,
  FileCode,
  AlertCircle,
  Trash2,
  Key,
  Calendar,
  Lock
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { User, InviteLink, ActivityLog, StorageMetrics } from '../types';

export const AdminDashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const { currentUser, isSuperAdmin, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'approvals' | 'invites' | 'users' | 'storage' | 'firebase' | 'logs'>('approvals');

  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [invites, setInvites] = useState<InviteLink[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [metrics, setMetrics] = useState<StorageMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // New Invite Form State
  const [inviteDays, setInviteDays] = useState(14);
  const [inviteMaxUses, setInviteMaxUses] = useState(25);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Firebase Rules State
  const [firebaseData, setFirebaseData] = useState<{ firestoreRules?: string; storageRules?: string; instructions?: string } | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('gaikwad_auth_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [pendingRes, usersRes, invitesRes, metricsRes, logsRes, firebaseRes] = await Promise.all([
        fetch('/api/admin/pending-users', { headers }),
        fetch('/api/members', { headers }),
        fetch('/api/admin/invites', { headers }),
        fetch('/api/admin/metrics', { headers }),
        fetch('/api/admin/logs', { headers }),
        fetch('/api/firebase/rules')
      ]);

      const pendingData = await pendingRes.json();
      const usersData = await usersRes.json();
      const invitesData = await invitesRes.json();
      const metricsData = await metricsRes.json();
      const logsData = await logsRes.json();
      const fbData = await firebaseRes.json();

      setPendingUsers(pendingData.pending || []);
      setAllUsers(usersData.members || []);
      setInvites(invitesData.invites || []);
      setMetrics(metricsData.metrics || null);
      setLogs(logsData.logs || []);
      setFirebaseData(fbData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      const token = localStorage.getItem('gaikwad_auth_token');
      const res = await fetch(`/api/admin/approve-user/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      const token = localStorage.getItem('gaikwad_auth_token');
      const res = await fetch(`/api/admin/reject-user/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('gaikwad_auth_token');
      const res = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ daysValid: inviteDays, maxUses: inviteMaxUses })
      });
      const data = await res.json();
      if (res.ok) {
        setInvites(prev => [data.invite, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      const token = localStorage.getItem('gaikwad_auth_token');
      const res = await fetch(`/api/admin/invites/${inviteId}/revoke`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setInvites(prev =>
          prev.map(i => (i.id === inviteId ? { ...i, isRevoked: true } : i))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem('gaikwad_auth_token');
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setAllUsers(prev =>
          prev.map(u => (u.id === userId ? { ...u, role: newRole as any } : u))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (tokenStr: string) => {
    const fullLink = `${window.location.origin}?invite=${tokenStr}`;
    navigator.clipboard.writeText(fullLink);
    setCopiedToken(tokenStr);
    setTimeout(() => setCopiedToken(null), 3000);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb < 1000) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-red-800 via-amber-900 to-red-950 text-white shadow-xl border border-amber-500/40">
        <div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-amber-400" />
            <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-wide">
              {t.adminDashboard}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-amber-200/90 mt-1">
            {language === 'hi'
              ? 'गायकवाड़ परिवार पोर्टल व्यवस्थापक नियंत्रण कक्ष — कुणाल सक्सेना (Super Admin)'
              : 'Gaikwad Family Portal Administration & Security Center — Super Admin Kunal Saxena'}
          </p>
        </div>

        {/* Creator / Super Admin Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 backdrop-blur-xs text-xs font-bold text-amber-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{currentUser?.name} ({currentUser?.role})</span>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-stone-200 dark:border-stone-800">
        {[
          { id: 'approvals', label: `${t.pendingApprovals} (${pendingUsers.length})`, count: pendingUsers.length },
          { id: 'invites', label: language === 'hi' ? 'गुप्त निमंत्रण लिंक' : 'Private Invites' },
          { id: 'users', label: t.userAccounts },
          { id: 'storage', label: t.storageUsage },
          { id: 'firebase', label: 'Firebase Cloud Rules' },
          { id: 'logs', label: t.activityLogs }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Member Approvals */}
      {activeTab === 'approvals' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-amber-200 dark:border-stone-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-white">
              {t.pendingApprovals}
            </h3>
            <span className="text-xs text-stone-500">
              {pendingUsers.length} waiting for approval
            </span>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              <Check className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <p>{language === 'hi' ? 'सभी सदस्य स्वीकृत हैं! कोई भी अनुरोध लंबित नहीं है।' : 'All registrations reviewed! Zero pending requests.'}</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {pendingUsers.map(user => (
                <div key={user.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-stone-900 dark:text-white">{user.name}</h4>
                    <p className="text-xs text-stone-500">{user.email} • {user.phone || 'No phone'}</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold mt-0.5">
                      Relationship: {user.relationship || 'Family Member'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(user.id)}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{t.approve}</span>
                    </button>
                    <button
                      onClick={() => handleReject(user.id)}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold transition-colors"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>{t.reject}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Private Invite Links */}
      {activeTab === 'invites' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-amber-200 dark:border-stone-800 shadow-xs">
            <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-white mb-4">
              {t.inviteMember}
            </h3>

            <form onSubmit={handleCreateInvite} className="flex flex-wrap items-end gap-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Validity Duration (Days)
                </label>
                <select
                  value={inviteDays}
                  onChange={(e) => setInviteDays(parseInt(e.target.value, 10))}
                  className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-medium"
                >
                  <option value={7}>7 Days</option>
                  <option value={14}>14 Days</option>
                  <option value={30}>30 Days</option>
                  <option value={90}>90 Days</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Max Registrations
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={inviteMaxUses}
                  onChange={(e) => setInviteMaxUses(parseInt(e.target.value, 10))}
                  className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-medium w-28"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-xs"
              >
                + Generate Secure Link
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-amber-200 dark:border-stone-800 shadow-xs">
            <h4 className="font-bold text-sm text-stone-900 dark:text-white mb-4">
              Active & Past Private Invitation Links
            </h4>

            <div className="space-y-3">
              {invites.map(inv => {
                const isExpired = new Date(inv.expiresAt).getTime() < Date.now();
                return (
                  <div
                    key={inv.id}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                      inv.isRevoked || isExpired
                        ? 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 opacity-60'
                        : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-stone-900 dark:text-white">
                          {inv.token}
                        </span>
                        {inv.isRevoked ? (
                          <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px]">
                            Revoked
                          </span>
                        ) : isExpired ? (
                          <span className="px-2 py-0.5 rounded bg-stone-200 text-stone-700 font-bold text-[10px]">
                            Expired
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-stone-500 text-[11px] mt-1">
                        Created by {inv.createdByName} • Expires: {new Date(inv.expiresAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {!inv.isRevoked && !isExpired && (
                        <>
                          <button
                            onClick={() => copyToClipboard(inv.token)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
                          >
                            {copiedToken === inv.token ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedToken === inv.token ? t.linkCopied : t.copyLink}</span>
                          </button>

                          <button
                            onClick={() => handleRevokeInvite(inv.id)}
                            className="px-3 py-1.5 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 font-bold"
                          >
                            {t.revokeLink}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Member Accounts & Role Permissions */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-amber-200 dark:border-stone-800 shadow-xs">
          <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-white mb-4">
            {t.userAccounts} ({allUsers.length})
          </h3>

          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {allUsers.map(user => (
              <div key={user.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-200 ring-2 ring-amber-400 shrink-0">
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 dark:text-white">{user.name}</h4>
                    <p className="text-stone-500">{user.email} • {user.relationship}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    user.role === 'super_admin'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : user.role === 'admin'
                      ? 'bg-purple-100 text-purple-900'
                      : 'bg-stone-100 text-stone-700'
                  }`}>
                    {user.role}
                  </span>

                  {isSuperAdmin && user.id !== 'u-kunal' && (
                    <select
                      value={user.role}
                      onChange={(e) => handleChangeRole(user.id, e.target.value)}
                      className="p-1 rounded-lg bg-stone-100 dark:bg-stone-800 border text-[11px]"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Cloud Storage Usage */}
      {activeTab === 'storage' && metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-amber-50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700">
              <HardDrive className="w-6 h-6 text-amber-700 dark:text-amber-400 mb-2" />
              <p className="text-xs font-bold text-stone-500">Total Cloud Storage</p>
              <h4 className="text-2xl font-black text-stone-900 dark:text-white mt-1">
                {formatBytes(metrics.totalBytes)}
              </h4>
              <p className="text-[11px] text-amber-700 mt-1">Original Quality Preserved</p>
            </div>

            <div className="p-5 rounded-3xl bg-red-50 dark:bg-stone-800 border border-red-200 dark:border-stone-700">
              <p className="text-xs font-bold text-stone-500">Photos Vault</p>
              <h4 className="text-2xl font-black text-stone-900 dark:text-white mt-1">
                {metrics.photoCount} photos
              </h4>
              <p className="text-[11px] text-stone-500 mt-1">{formatBytes(metrics.photoBytes)}</p>
            </div>

            <div className="p-5 rounded-3xl bg-purple-50 dark:bg-stone-800 border border-purple-200 dark:border-stone-700">
              <p className="text-xs font-bold text-stone-500">Video Library</p>
              <h4 className="text-2xl font-black text-stone-900 dark:text-white mt-1">
                {metrics.videoCount} videos
              </h4>
              <p className="text-[11px] text-stone-500 mt-1">{formatBytes(metrics.videoBytes)}</p>
            </div>

            <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-stone-800 border border-emerald-200 dark:border-stone-700">
              <p className="text-xs font-bold text-stone-500">Audio & Music</p>
              <h4 className="text-2xl font-black text-stone-900 dark:text-white mt-1">
                {metrics.audioCount} audio files
              </h4>
              <p className="text-[11px] text-stone-500 mt-1">{formatBytes(metrics.audioBytes)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Firebase Cloud Rules and Deployment Guide */}
      {activeTab === 'firebase' && firebaseData && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-amber-600" />
              <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-white">
                Firebase Firestore Security Rules (firestore.rules)
              </h3>
            </div>
            <pre className="p-4 rounded-2xl bg-stone-950 text-amber-300 font-mono text-xs overflow-x-auto">
              {firebaseData.firestoreRules}
            </pre>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-red-600" />
              <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-white">
                Firebase Storage Rules (storage.rules)
              </h3>
            </div>
            <pre className="p-4 rounded-2xl bg-stone-950 text-red-300 font-mono text-xs overflow-x-auto">
              {firebaseData.storageRules}
            </pre>
            <p className="text-xs text-stone-500">
              💡 {firebaseData.instructions}
            </p>
          </div>
        </div>
      )}

      {/* Tab 6: Activity Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-amber-200 dark:border-stone-800 shadow-xs space-y-3">
          <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-white mb-2">
            {t.activityLogs}
          </h3>

          <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
            {logs.map(log => (
              <div key={log.id} className="py-2.5 flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-stone-900 dark:text-white">{log.userName}</span>
                  <span className="text-stone-500 ml-2">{log.details}</span>
                </div>
                <span className="text-[10px] text-stone-400 shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
