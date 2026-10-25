import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Video,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Crown,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Sliders,
  Check,
  X,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  adminGetAllUsers,
  adminUpdateUserRole,
  adminGetAllVideos,
  adminUpdateVideoStatus,
  adminGetAllReports,
  adminUpdateReportStatus,
  deleteFirestoreVideo,
} from '../services/videoFirestore';
import { AppUserProfile, FirestoreVideo, VideoReport, UserRole } from '../types/auth';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export function AdminPanel() {
  const { user, userProfile, isAdmin, isLoading: authLoading, signInWithGoogle } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'videos' | 'reports'>('overview');
  const [users, setUsers] = useState<AppUserProfile[]>([]);
  const [videos, setVideos] = useState<FirestoreVideo[]>([]);
  const [reports, setReports] = useState<VideoReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [videoSearch, setVideoSearch] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const loadAdminData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const [usersData, videosData, reportsData] = await Promise.all([
        adminGetAllUsers().catch(() => []),
        adminGetAllVideos().catch(() => []),
        adminGetAllReports().catch(() => []),
      ]);
      setUsers(usersData);
      setVideos(videosData);
      setReports(reportsData);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const handleRoleChange = async (targetUid: string, targetEmail: string, newRole: UserRole) => {
    try {
      await adminUpdateUserRole(targetUid, newRole, targetEmail);
      setUsers((prev) =>
        prev.map((u) => (u.uid === targetUid ? { ...u, role: newRole } : u))
      );
      setActionSuccess(`ব্যবহারকারীর রোল সফলভাবে ${newRole}-এ পরিবর্তিত হয়েছে`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      alert('রোল পরিবর্তন করা যায়নি');
    }
  };

  const handleVideoStatusChange = async (videoId: string, status: FirestoreVideo['status']) => {
    try {
      await adminUpdateVideoStatus(videoId, status);
      setVideos((prev) =>
        prev.map((v) => (v.id === videoId ? { ...v, status } : v))
      );
      setActionSuccess(`ভিডিও স্ট্যাটাস সফলভাবে ${status}-এ আপডেট হয়েছে`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('এডমিন হিসেবে নিশ্চিত যে এই ভিডিওটি প্ল্যাটফর্ম থেকে মুছে ফেলবেন?')) return;
    try {
      await deleteFirestoreVideo(videoId);
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportAction = async (reportId: string, status: VideoReport['status']) => {
    try {
      await adminUpdateReportStatus(reportId, status);
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status } : r))
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  // Admin access gatekeeper
  if (!user || !isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-red-500 to-purple-600 flex items-center justify-center shadow-lg shadow-red-500/20">
            <Lock className="w-8 h-8 text-white" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">এডমিন প্যানেল সুরক্ষিত</h1>
            <p className="text-sm text-neutral-400">
              শুধুমাত্র প্ল্যাটফর্ম এডমিনিস্ট্রেটরদের (<span className="text-pink-400 font-mono">h4k3rxbd@gmail.com</span>) এই ড্যাশবোর্ড ব্যবহারের অনুমতি আছে।
            </p>
          </div>

          {!user ? (
            <button
              onClick={signInWithGoogle}
              className="w-full py-3.5 rounded-2xl bg-white text-neutral-900 font-bold hover:bg-neutral-100 transition-all shadow-xl cursor-pointer"
            >
              এডমিন অ্যাকাউন্টে লগইন করুন
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-medium">
              আপনার বর্তমান ইমেইল ({user.email}) এডমিন অনুমোদিত নয়।
            </div>
          )}
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.channelHandle?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredVideos = videos.filter((v) =>
    v.title?.toLowerCase().includes(videoSearch.toLowerCase()) ||
    v.channelName?.toLowerCase().includes(videoSearch.toLowerCase()) ||
    v.uploaderEmail?.toLowerCase().includes(videoSearch.toLowerCase())
  );

  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;
  const totalPlatformViews = videos.reduce((acc, v) => acc + (v.views || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Admin Header */}
      <div className="p-6 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-rose-600 flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-purple-500/20 shrink-0">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">NestTube এডমিন কন্ট্রোল সেন্টার</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              লগইন আছেন: <span className="text-purple-300 font-bold">{user.email}</span> • প্ল্যাটফর্ম ওভারভিউ ও ইউজার পারমিশন কন্ট্রোল
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={loadAdminData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 font-bold text-xs text-white transition-all cursor-pointer"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            <span>সিঙ্ক করুন</span>
          </button>
          <Link
            to="/studio"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 font-bold text-xs text-white shadow-lg shadow-pink-500/20"
          >
            <Video className="w-4 h-4" />
            <span>ক্রিয়েটর স্টুডিও</span>
          </Link>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer shrink-0",
            activeTab === 'overview'
              ? "bg-white/10 text-white border border-white/15 shadow-inner"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          )}
        >
          <Sliders className="w-4 h-4 text-purple-400" />
          <span>প্ল্যাটফর্ম ওভারভিউ</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer shrink-0",
            activeTab === 'users'
              ? "bg-white/10 text-white border border-white/15 shadow-inner"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          )}
        >
          <Users className="w-4 h-4 text-pink-400" />
          <span>ইউজার ম্যানেজমেন্ট ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer shrink-0",
            activeTab === 'videos'
              ? "bg-white/10 text-white border border-white/15 shadow-inner"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          )}
        >
          <Video className="w-4 h-4 text-cyan-400" />
          <span>ভিডিও মডারেশন ({videos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer shrink-0 relative",
            activeTab === 'reports'
              ? "bg-white/10 text-white border border-white/15 shadow-inner"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          )}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>রিপোর্ট ও ফ্ল্যাগ</span>
          {pendingReportsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black">
              {pendingReportsCount}
            </span>
          )}
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-xl">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">নিবন্ধিত ইউজার</span>
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-3xl font-black text-white">{users.length}</div>
              <p className="text-[11px] text-neutral-400 mt-2">
                {users.filter((u) => u.role === 'admin').length} এডমিন • {users.filter((u) => u.role === 'creator').length} ক্রিয়েটর
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-xl">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">মোট প্ল্যাটফর্ম ভিডিও</span>
                <Video className="w-5 h-5 text-pink-400" />
              </div>
              <div className="text-3xl font-black text-white">{videos.length}</div>
              <p className="text-[11px] text-emerald-400 mt-2 font-medium">লাইভ ক্লাউড ডাটাবেজ</p>
            </div>

            <div className="p-6 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-xl">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">মোট ভিডিও ভিউ</span>
                <Eye className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-3xl font-black text-white">{totalPlatformViews.toLocaleString()}</div>
              <p className="text-[11px] text-cyan-400 mt-2 font-medium">প্ল্যাটফর্ম সামগ্রিক স্ট্রিমিং</p>
            </div>

            <div className="p-6 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-xl">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">অমীমাংসিত রিপোর্ট</span>
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-white">{pendingReportsCount}</div>
              <p className="text-[11px] text-amber-400 mt-2 font-medium">মডারেশন প্রয়োজন</p>
            </div>
          </div>

          {/* Quick System Info Card */}
          <div className="p-6 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-xl space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <span>প্ল্যাটফর্ম সিকিউরিটি ও কনফিগারেশন</span>
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              প্ল্যাটফর্মের মূল মালিক <span className="text-pink-400 font-mono font-bold">h4k3rxbd@gmail.com</span> স্বয়ংক্রিয়ভাবে সুপার এডমিন হিসেবে কনফিগার করা হয়েছে। ফায়ারস্টোর সিকিউরিটি রুলস (ABAC) এর মাধ্যমে সুরক্ষিত আছে। আপনি যেকোনো ব্যবহারকারীকে ক্রিয়েটর বা এডমিন রোলে রূপান্তর করতে পারেন।
            </p>
          </div>
        </div>
      )}

      {/* USERS MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-between">
            <div className="relative w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="ইউজার বা ইমেইল খুঁজুন..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500"
              />
            </div>
            <span className="text-xs text-neutral-400">মোট {filteredUsers.length} জন ইউজার</span>
          </div>

          <div className="overflow-x-auto rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="p-4">ব্যবহারকারী</th>
                  <th className="p-4">ইমেইল</th>
                  <th className="p-4">বর্তমান রোল</th>
                  <th className="p-4">চ্যানেল হ্যান্ডেল</th>
                  <th className="p-4">যোগদানের তারিখ</th>
                  <th className="p-4 text-right">রোল পরিবর্তন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filteredUsers.map((u) => {
                  const isMasterAdmin = u.email?.toLowerCase() === 'h4k3rxbd@gmail.com';
                  return (
                    <tr key={u.uid} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white uppercase text-xs">
                            {u.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isMasterAdmin && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-black">
                                  OWNER
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-neutral-500 font-mono">{u.uid.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-xs font-mono text-neutral-300">{u.email}</td>

                      <td className="p-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase",
                            u.role === 'admin' && "bg-purple-500/20 text-purple-400 border border-purple-500/40",
                            u.role === 'creator' && "bg-pink-500/20 text-pink-400 border border-pink-500/40",
                            u.role === 'viewer' && "bg-neutral-500/20 text-neutral-300 border border-neutral-500/40"
                          )}
                        >
                          {u.role === 'admin' && <ShieldAlert className="w-3 h-3" />}
                          {u.role === 'creator' && <Video className="w-3 h-3" />}
                          {u.role}
                        </span>
                      </td>

                      <td className="p-4 text-xs font-mono text-neutral-400">{u.channelHandle || '—'}</td>

                      <td className="p-4 text-xs font-mono text-neutral-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('bn-BD') : '—'}
                      </td>

                      <td className="p-4 text-right">
                        {isMasterAdmin ? (
                          <span className="text-xs text-amber-400 font-bold">স্থায়ী সুপার এডমিন</span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleRoleChange(u.uid, u.email, 'admin')}
                              disabled={u.role === 'admin'}
                              className={cn(
                                "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                                u.role === 'admin'
                                  ? "opacity-40 cursor-not-allowed bg-white/5 text-neutral-500"
                                  : "bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30"
                              )}
                            >
                              Make Admin
                            </button>
                            <button
                              onClick={() => handleRoleChange(u.uid, u.email, 'creator')}
                              disabled={u.role === 'creator'}
                              className={cn(
                                "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                                u.role === 'creator'
                                  ? "opacity-40 cursor-not-allowed bg-white/5 text-neutral-500"
                                  : "bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30"
                              )}
                            >
                              Make Creator
                            </button>
                            <button
                              onClick={() => handleRoleChange(u.uid, u.email, 'viewer')}
                              disabled={u.role === 'viewer'}
                              className={cn(
                                "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                                u.role === 'viewer'
                                  ? "opacity-40 cursor-not-allowed bg-white/5 text-neutral-500"
                                  : "bg-neutral-500/20 hover:bg-neutral-500/30 text-neutral-300 border border-neutral-500/30"
                              )}
                            >
                              Make Viewer
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIDEOS MODERATION TAB */}
      {activeTab === 'videos' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-between">
            <div className="relative w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="ভিডিও বা আপলোডারের নাম..."
                value={videoSearch}
                onChange={(e) => setVideoSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500"
              />
            </div>
            <span className="text-xs text-neutral-400">মোট {filteredVideos.length} টি ভিডিও</span>
          </div>

          <div className="overflow-x-auto rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="p-4">ভিডিও</th>
                  <th className="p-4">আপলোডার</th>
                  <th className="p-4">স্ট্যাটাস</th>
                  <th className="p-4">ভিউ</th>
                  <th className="p-4">তারিখ</th>
                  <th className="p-4 text-right">মডারেশন অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filteredVideos.map((v) => (
                  <tr key={v.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={v.thumbnailUrl}
                          alt={v.title}
                          className="w-20 h-12 object-cover rounded-lg border border-white/10 shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <h4 className="font-bold text-white text-xs line-clamp-1">{v.title}</h4>
                          <span className="text-[10px] text-neutral-400">{v.category}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-xs">
                      <div className="text-white font-medium">{v.channelName}</div>
                      <div className="text-[10px] text-neutral-500 font-mono">{v.uploaderEmail}</div>
                    </td>

                    <td className="p-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase",
                          (v.status === 'approved' || !v.status) && "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
                          v.status === 'flagged' && "bg-amber-500/20 text-amber-400 border border-amber-500/30",
                          v.status === 'removed' && "bg-red-500/20 text-red-400 border border-red-500/30"
                        )}
                      >
                        {v.status || 'approved'}
                      </span>
                    </td>

                    <td className="p-4 text-xs font-mono text-neutral-300">{v.views}</td>

                    <td className="p-4 text-xs font-mono text-neutral-400">
                      {new Date(v.createdAt).toLocaleDateString('bn-BD')}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/watch/${v.id}`}
                          className="p-2 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white"
                          title="ভিউ করুন"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleVideoStatusChange(v.id, 'approved')}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 cursor-pointer"
                        >
                          অনুমোদন
                        </button>
                        <button
                          onClick={() => handleVideoStatusChange(v.id, 'flagged')}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 cursor-pointer"
                        >
                          ফ্ল্যাগ
                        </button>
                        <button
                          onClick={() => handleDeleteVideo(v.id)}
                          className="p-1.5 hover:bg-red-500/20 rounded-lg text-neutral-400 hover:text-red-400 cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="p-12 rounded-3xl bg-black/40 border border-white/10 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400" />
              <h3 className="text-base font-bold text-white">কোনো অভিযোগ বা ফ্ল্যাগ রিপোর্ট নেই</h3>
              <p className="text-xs text-neutral-400">প্ল্যাটফর্মের সকল কনটেন্ট স্বচ্ছ ও নিরাপদ।</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    <th className="p-4">ভিডিও</th>
                    <th className="p-4">অভিযোগের কারণ</th>
                    <th className="p-4">রিপোর্টার</th>
                    <th className="p-4">স্ট্যাটাস</th>
                    <th className="p-4">তারিখ</th>
                    <th className="p-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {reports.map((r) => (
                    <tr key={r.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold text-white text-xs">
                        <Link to={`/watch/${r.videoId}`} className="hover:underline flex items-center gap-1.5">
                          <span>{r.videoTitle}</span>
                          <ExternalLink className="w-3 h-3 text-neutral-400" />
                        </Link>
                      </td>

                      <td className="p-4 text-xs text-neutral-300 font-medium">{r.reason}</td>

                      <td className="p-4 text-xs font-mono text-neutral-400">{r.reportedByEmail}</td>

                      <td className="p-4">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[11px] font-bold uppercase",
                            r.status === 'pending' && "bg-amber-500/20 text-amber-400 border border-amber-500/30",
                            r.status === 'resolved' && "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
                            r.status === 'dismissed' && "bg-neutral-500/20 text-neutral-400 border border-neutral-500/30"
                          )}
                        >
                          {r.status}
                        </span>
                      </td>

                      <td className="p-4 text-xs font-mono text-neutral-400">
                        {new Date(r.createdAt).toLocaleDateString('bn-BD')}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleReportAction(r.id, 'resolved')}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 cursor-pointer"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => handleReportAction(r.id, 'dismissed')}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-neutral-500/20 hover:bg-neutral-500/30 text-neutral-300 border border-neutral-500/30 cursor-pointer"
                          >
                            Dismiss
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
