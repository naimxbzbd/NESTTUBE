import React, { useState, useEffect } from 'react';
import {
  Upload,
  Video,
  BarChart2,
  Settings,
  Plus,
  Play,
  Eye,
  ThumbsUp,
  Clock,
  Trash2,
  Edit,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Search,
  Filter,
  Layers,
  Globe,
  Lock,
  EyeOff,
  RefreshCw,
  Sliders,
  Tv,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getCreatorVideos,
  createFirestoreVideo,
  updateFirestoreVideo,
  deleteFirestoreVideo,
} from '../services/videoFirestore';
import { FirestoreVideo } from '../types/auth';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export function Studio() {
  const { user, userProfile, isCreator, isAdmin, becomeCreator, updateProfileData, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'content' | 'upload' | 'analytics' | 'customization'>('content');
  const [videos, setVideos] = useState<FirestoreVideo[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'public' | 'unlisted' | 'private'>('all');

  // Video Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadThumbnail, setUploadThumbnail] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Entertainment');
  const [uploadVisibility, setUploadVisibility] = useState<'public' | 'unlisted' | 'private'>('public');
  const [uploadTags, setUploadTags] = useState('bangla, entertainment, hd');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');

  // Edit Video Modal State
  const [editingVideo, setEditingVideo] = useState<FirestoreVideo | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editVisibility, setEditVisibility] = useState<'public' | 'unlisted' | 'private'>('public');
  const [editCategory, setEditCategory] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Channel Customization State
  const [channelName, setChannelName] = useState('');
  const [channelHandle, setChannelHandle] = useState('');
  const [bio, setBio] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [customSuccess, setCustomSuccess] = useState('');

  // Become Creator State
  const [creatorNameInput, setCreatorNameInput] = useState('');
  const [creatorHandleInput, setCreatorHandleInput] = useState('');
  const [creatorBioInput, setCreatorBioInput] = useState('');

  // Sample quick templates for demo videos
  const sampleVideos = [
    {
      title: 'নতুন বাংলা নাটক ২০২৬ | রোমান্টিক কমেডি পর্ব',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80',
      category: 'Natok',
    },
    {
      title: 'কক্সবাজার সমুদ্র সৈকতের রূপ | 4K আল্ট্রা এইচডি ড্রোন ভ্লগ',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      category: 'Vlog',
    },
    {
      title: 'বাংলা মেলোডি মিউজিক ভিডিও | অফিশিয়াল রিলিজ',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      category: 'Music',
    },
  ];

  const fetchVideos = async () => {
    if (!user) return;
    setIsLoadingVideos(true);
    try {
      const data = await getCreatorVideos(user.uid);
      setVideos(data);
    } catch (err) {
      console.error('Error fetching creator videos:', err);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchVideos();
    }
  }, [user]);

  useEffect(() => {
    if (userProfile) {
      setChannelName(userProfile.channelName || userProfile.name);
      setChannelHandle(userProfile.channelHandle || `@${userProfile.name.toLowerCase().replace(/\s+/g, '')}`);
      setBio(userProfile.bio || '');
      setBannerUrl(userProfile.bannerUrl || '');
    }
  }, [userProfile]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const tagsArray = uploadTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const created = await createFirestoreVideo({
        title: uploadTitle,
        description: uploadDescription,
        videoUrl: uploadUrl,
        thumbnailUrl:
          uploadThumbnail ||
          `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80`,
        uploaderUid: user.uid,
        uploaderEmail: user.email || '',
        channelName: userProfile?.channelName || userProfile?.name || 'Creator',
        channelId: user.uid,
        category: uploadCategory,
        visibility: uploadVisibility,
        duration: '12:45',
        status: 'approved',
        tags: tagsArray,
      });

      setUploadSuccess('ভিডিও সফলভাবে আপলোড এবং পাবলিশ হয়েছে!');
      setUploadTitle('');
      setUploadDescription('');
      setUploadUrl('');
      setUploadThumbnail('');
      fetchVideos();
      setTimeout(() => {
        setActiveTab('content');
        setUploadSuccess('');
      }, 1500);
    } catch (err: any) {
      setUploadError(err.message || 'আপলোডে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই ভিডিওটি মুছে ফেলতে চান?')) return;
    try {
      await deleteFirestoreVideo(videoId);
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
    } catch (err) {
      console.error('Delete error:', err);
      alert('ভিডিও মোছা যায়নি।');
    }
  };

  const handleStartEdit = (video: FirestoreVideo) => {
    setEditingVideo(video);
    setEditTitle(video.title);
    setEditDesc(video.description);
    setEditVisibility(video.visibility);
    setEditCategory(video.category);
  };

  const handleSaveEdit = async () => {
    if (!editingVideo) return;
    setIsSavingEdit(true);
    try {
      await updateFirestoreVideo(editingVideo.id, {
        title: editTitle,
        description: editDesc,
        visibility: editVisibility,
        category: editCategory,
      });
      setVideos((prev) =>
        prev.map((v) =>
          v.id === editingVideo.id
            ? { ...v, title: editTitle, description: editDesc, visibility: editVisibility, category: editCategory }
            : v
        )
      );
      setEditingVideo(null);
    } catch (err) {
      console.error('Save edit error:', err);
      alert('পরিবর্তন সংরক্ষণ করা যায়নি।');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleSaveCustomization = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileData({
        channelName,
        channelHandle,
        bio,
        bannerUrl,
      });
      setCustomSuccess('চ্যানেলের তথ্য সফলভাবে হালনাগাদ করা হয়েছে!');
      setTimeout(() => setCustomSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBecomeCreatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorNameInput) return;
    try {
      await becomeCreator(creatorNameInput, creatorHandleInput, creatorBioInput);
    } catch (err) {
      console.error(err);
    }
  };

  // If not signed in
  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <Video className="w-8 h-8 text-white" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">NestTube Studio</h1>
            <p className="text-sm text-neutral-400">
              ক্রিয়েটর স্টুডিও অ্যাক্সেস করতে এবং ভিডিও আপলোড ও চ্যানেল পরিচালনা করতে লগইন করুন।
            </p>
          </div>

          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-white text-neutral-900 font-bold hover:bg-neutral-100 active:scale-98 transition-all shadow-xl cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google দিয়ে প্রবেশ করুন</span>
          </button>
        </div>
      </div>
    );
  }

  // If user is logged in as viewer, prompt to unlock Creator role
  if (!isCreator && !isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="p-8 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-pink-500/20">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">আপনার NestTube ক্রিয়েটর চ্যানেল খুলুন</h1>
              <p className="text-sm text-neutral-400">আপনার ভিডিও আপলোড করুন, অডিয়েন্স তৈরি করুন এবং সাবস্ক্রাইবার বাড়ান।</p>
            </div>
          </div>

          <form onSubmit={handleBecomeCreatorSubmit} className="space-y-4 pt-4 border-t border-white/10">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                চ্যানেলের নাম (Channel Name)
              </label>
              <input
                type="text"
                required
                value={creatorNameInput}
                onChange={(e) => setCreatorNameInput(e.target.value)}
                placeholder="যেমন: বাংলা ড্রামা হাব, Tech Bangla"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                চ্যানেল হ্যান্ডেল (Channel Handle)
              </label>
              <input
                type="text"
                required
                value={creatorHandleInput}
                onChange={(e) => setCreatorHandleInput(e.target.value)}
                placeholder="@bangladrama"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                চ্যানেল সম্পর্কে (About / Bio)
              </label>
              <textarea
                rows={3}
                value={creatorBioInput}
                onChange={(e) => setCreatorBioInput(e.target.value)}
                placeholder="আপনার চ্যানেলে কী ধরণের ভিডিও থাকবে..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:opacity-95 shadow-lg shadow-pink-500/25 active:scale-98 transition-all cursor-pointer"
            >
              ক্রিয়েটর স্টুডিও শুরু করুন
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filtered creator videos
  const filteredVideos = videos.filter((v) => {
    const matchesSearch = v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.visibility === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate quick metrics
  const totalViews = videos.reduce((acc, v) => acc + (v.views || 0), 0);
  const totalLikes = videos.reduce((acc, v) => acc + (v.likes || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Studio Header Card */}
      <div className="p-6 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-pink-500/10 via-purple-500/5 to-transparent pointer-events-none" />

        <div className="flex items-center gap-4 z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-pink-500/20 shrink-0">
            {userProfile?.channelName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{userProfile?.channelName || userProfile?.name}</h1>
              <span className="px-2 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-400 text-xs font-bold uppercase tracking-wider">
                {isAdmin ? 'Admin & Creator' : 'Creator Studio'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              {userProfile?.channelHandle || `@${user.email?.split('@')[0]}`} • {videos.length} টি ভিডিও • {userProfile?.subscribersCount || 0} সাবস্ক্রাইবার
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3 z-10">
          <button
            onClick={() => setActiveTab('upload')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 font-bold text-sm text-white shadow-lg shadow-pink-500/25 hover:opacity-95 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন ভিডিও আপলোড</span>
          </button>
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 font-bold text-sm text-white transition-all"
            >
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>এডমিন প্যানেল</span>
            </Link>
          )}
        </div>
      </div>

      {/* Studio Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('content')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer shrink-0",
            activeTab === 'content'
              ? "bg-white/10 text-white border border-white/15 shadow-inner"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          )}
        >
          <Video className="w-4 h-4 text-pink-400" />
          <span>ভিডিও ম্যানেজার ({videos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer shrink-0",
            activeTab === 'upload'
              ? "bg-white/10 text-white border border-white/15 shadow-inner"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          )}
        >
          <Upload className="w-4 h-4 text-purple-400" />
          <span>ভিডিও আপলোডার</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer shrink-0",
            activeTab === 'analytics'
              ? "bg-white/10 text-white border border-white/15 shadow-inner"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          )}
        >
          <BarChart2 className="w-4 h-4 text-cyan-400" />
          <span>চ্যানেল অ্যানালিটিক্স</span>
        </button>

        <button
          onClick={() => setActiveTab('customization')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer shrink-0",
            activeTab === 'customization'
              ? "bg-white/10 text-white border border-white/15 shadow-inner"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          )}
        >
          <Settings className="w-4 h-4 text-emerald-400" />
          <span>চ্যানেল কাস্টমাইজেশন</span>
        </button>
      </div>

      {/* TAB 1: CONTENT MANAGER */}
      {activeTab === 'content' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="ভিডিও খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-neutral-400" />
              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs font-bold text-white focus:outline-none"
              >
                <option value="all">সব ভিজিবিলিটি</option>
                <option value="public">পাবলিক (Public)</option>
                <option value="unlisted">আনলিস্টেড (Unlisted)</option>
                <option value="private">প্রাইভেট (Private)</option>
              </select>

              <button
                onClick={fetchVideos}
                className="p-2 hover:bg-white/10 rounded-xl text-neutral-400 hover:text-white transition-colors"
                title="রিফ্রেশ করুন"
              >
                <RefreshCw className={cn("w-4 h-4", isLoadingVideos && "animate-spin")} />
              </button>
            </div>
          </div>

          {/* Videos Table */}
          {isLoadingVideos ? (
            <div className="p-12 text-center text-neutral-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-pink-500" />
              <p className="text-sm">ভিডিও লোড হচ্ছে...</p>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="p-12 rounded-3xl bg-black/40 border border-white/10 text-center space-y-4">
              <Video className="w-12 h-12 mx-auto text-neutral-600" />
              <div>
                <h3 className="text-base font-bold text-white">এখনও কোনো ভিডিও নেই</h3>
                <p className="text-xs text-neutral-400 mt-1">আপনার চ্যানেলে প্রথম ভিডিও আপলোড করে কনটেন্ট প্রকাশ করুন।</p>
              </div>
              <button
                onClick={() => setActiveTab('upload')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 font-bold text-xs text-white shadow-lg shadow-pink-500/20 cursor-pointer"
              >
                ভিডিও আপলোড করুন
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    <th className="p-4">ভিডিও</th>
                    <th className="p-4">ভিজিবিলিটি</th>
                    <th className="p-4">ক্যাটাগরি</th>
                    <th className="p-4">ভিউ</th>
                    <th className="p-4">লাইক</th>
                    <th className="p-4">তারিখ</th>
                    <th className="p-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredVideos.map((video) => (
                    <tr key={video.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-24 h-14 rounded-lg overflow-hidden bg-neutral-900 shrink-0 border border-white/10">
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[10px] font-mono text-white">
                              {video.duration || '10:00'}
                            </span>
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <h4 className="font-bold text-white text-xs line-clamp-1 group-hover:text-pink-400 transition-colors">
                              {video.title}
                            </h4>
                            <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                              {video.description || 'কোনো বিবরণ নেই'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold capitalize",
                            video.visibility === 'public' && "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
                            video.visibility === 'unlisted' && "bg-amber-500/15 text-amber-400 border border-amber-500/30",
                            video.visibility === 'private' && "bg-red-500/15 text-red-400 border border-red-500/30"
                          )}
                        >
                          {video.visibility === 'public' && <Globe className="w-3 h-3" />}
                          {video.visibility === 'unlisted' && <EyeOff className="w-3 h-3" />}
                          {video.visibility === 'private' && <Lock className="w-3 h-3" />}
                          {video.visibility}
                        </span>
                      </td>

                      <td className="p-4 text-xs text-neutral-300 font-medium">{video.category || 'General'}</td>

                      <td className="p-4 text-xs font-mono text-neutral-300">{video.views.toLocaleString()}</td>

                      <td className="p-4 text-xs font-mono text-neutral-300">{video.likes.toLocaleString()}</td>

                      <td className="p-4 text-xs text-neutral-400 font-mono">
                        {new Date(video.createdAt).toLocaleDateString('bn-BD')}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/watch/${video.id}`}
                            className="p-2 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition-colors"
                            title="প্লে করুন"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleStartEdit(video)}
                            className="p-2 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-cyan-400 transition-colors cursor-pointer"
                            title="সম্পাদনা করুন"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(video.id)}
                            className="p-2 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
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
          )}
        </div>
      )}

      {/* TAB 2: VIDEO UPLOADER */}
      {activeTab === 'upload' && (
        <div className="max-w-3xl mx-auto p-6 md:p-8 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="text-xl font-black text-white">নতুন ভিডিও আপলোড করুন</h2>
              <p className="text-xs text-neutral-400 mt-0.5">NestTube প্ল্যাটফর্মে ভিডিও পাবলিশ করুন এবং বিশ্বজুড়ে দর্শকের সাথে শেয়ার করুন।</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Upload className="w-5 h-5" />
            </div>
          </div>

          {/* Quick presets for testing */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">দ্রুত ডেমো ভিডিও প্রিসেট:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {sampleVideos.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setUploadTitle(sample.title);
                    setUploadUrl(sample.url);
                    setUploadThumbnail(sample.thumbnail);
                    setUploadCategory(sample.category);
                  }}
                  className="p-2 rounded-xl bg-black/40 hover:bg-white/10 border border-white/5 text-left text-xs text-neutral-300 font-medium transition-colors cursor-pointer truncate"
                >
                  ⚡ {sample.category}: {sample.title}
                </button>
              ))}
            </div>
          </div>

          {uploadSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          {uploadError && (
            <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                ভিডিওর শিরোনাম (Title) *
              </label>
              <input
                type="text"
                required
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="যেমন: সেরা বাংলা নাটক ২০২৬ - অফিশিয়াল ড্রামা"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                ভিডিওর উৎস URL (MP4, HLS m3u8, অথবা স্ট্রিমিং লিঙ্ক) *
              </label>
              <input
                type="url"
                required
                value={uploadUrl}
                onChange={(e) => setUploadUrl(e.target.value)}
                placeholder="https://.../video.mp4"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                থাম্বনেইল ইমেজ URL (Thumbnail Image)
              </label>
              <input
                type="url"
                value={uploadThumbnail}
                onChange={(e) => setUploadThumbnail(e.target.value)}
                placeholder="https://.../thumbnail.jpg"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  ক্যাটাগরি (Category)
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none text-sm"
                >
                  <option value="Entertainment">Entertainment (বিনোদন)</option>
                  <option value="Natok">Natok (বাংলা নাটক)</option>
                  <option value="Cinema">Cinema & Movies (চলচ্চিত্র)</option>
                  <option value="Music">Music (গান ও মিউজিক)</option>
                  <option value="Shorts">Shorts (শর্টস)</option>
                  <option value="Tech">Technology & Code</option>
                  <option value="Vlog">Vlog & Travel</option>
                  <option value="News">News & Live</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  ভিজিবিলিটি (Visibility)
                </label>
                <select
                  value={uploadVisibility}
                  onChange={(e: any) => setUploadVisibility(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none text-sm"
                >
                  <option value="public">🌐 পাবলিক (Public - সবাই দেখতে পারবে)</option>
                  <option value="unlisted">🔗 আনলিস্টেড (Unlisted - লিঙ্কের মাধ্যমে)</option>
                  <option value="private">🔒 প্রাইভেট (Private - শুধুমাত্র আপনি)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                ট্যাগ (Tags - কমা দিয়ে আলাদা করুন)
              </label>
              <input
                type="text"
                value={uploadTags}
                onChange={(e) => setUploadTags(e.target.value)}
                placeholder="bangla, drama, new episode"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                ভিডিওর বিবরণ (Description)
              </label>
              <textarea
                rows={4}
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="ভিডিও সম্পর্কে বিস্তারিত লিখুন..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500 text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:opacity-95 shadow-xl shadow-pink-500/25 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>পাবলিশ করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>ভিডিও পাবলিশ করুন</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: CHANNEL ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">মোট ভিউ</span>
                <Eye className="w-5 h-5 text-pink-400" />
              </div>
              <div className="text-3xl font-black text-white">{totalViews.toLocaleString()}</div>
              <p className="text-[11px] text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                <span>↑ 18.4%</span>
                <span className="text-neutral-500">গত ২৮ দিনে</span>
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">মোট লাইক</span>
                <ThumbsUp className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-3xl font-black text-white">{totalLikes.toLocaleString()}</div>
              <p className="text-[11px] text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                <span>↑ 12.1%</span>
                <span className="text-neutral-500">এনগেজমেন্ট রেট</span>
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">সাবস্ক্রাইবার</span>
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-3xl font-black text-white">{(userProfile?.subscribersCount || 0).toLocaleString()}</div>
              <p className="text-[11px] text-cyan-400 font-semibold mt-2 flex items-center gap-1">
                <span>+45</span>
                <span className="text-neutral-500">নতুন সাবস্ক্রাইবার</span>
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">প্রকাশিত ভিডিও</span>
                <Video className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white">{videos.length}</div>
              <p className="text-[11px] text-neutral-400 mt-2">অ্যাক্টিভ লাইব্রেরি</p>
            </div>
          </div>

          {/* Top Performing Videos */}
          <div className="p-6 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">শীর্ষ পারফর্মিং ভিডিও</h3>
            {videos.length === 0 ? (
              <p className="text-xs text-neutral-400">এখনও কোনো ডেটা পাওয়া যায়নি।</p>
            ) : (
              <div className="space-y-3">
                {[...videos]
                  .sort((a, b) => (b.views || 0) - (a.views || 0))
                  .slice(0, 5)
                  .map((v, i) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-neutral-500 w-4">{i + 1}</span>
                        <img
                          src={v.thumbnailUrl}
                          alt={v.title}
                          className="w-16 h-10 object-cover rounded-lg border border-white/10"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate max-w-sm">{v.title}</h4>
                          <span className="text-[10px] text-neutral-400">{v.category}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-pink-400">{v.views.toLocaleString()} ভিউ</div>
                        <div className="text-[10px] text-neutral-500">{v.likes} লাইক</div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CHANNEL CUSTOMIZATION */}
      {activeTab === 'customization' && (
        <div className="max-w-2xl mx-auto p-6 md:p-8 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-6">
          <div>
            <h2 className="text-xl font-black text-white">চ্যানেল কাস্টমাইজেশন</h2>
            <p className="text-xs text-neutral-400 mt-0.5">আপনার চ্যানেলের ব্র্যান্ডিং ও বিবরণ সাজান।</p>
          </div>

          {customSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{customSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSaveCustomization} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                চ্যানেল নাম (Channel Name)
              </label>
              <input
                type="text"
                required
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                চ্যানেল হ্যান্ডেল (Handle)
              </label>
              <input
                type="text"
                required
                value={channelHandle}
                onChange={(e) => setChannelHandle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                ব্যানার ইমেজ URL
              </label>
              <input
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://.../banner.jpg"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                চ্যানেল বিবরণ (Bio / Description)
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="চ্যানেলের বিবরণ লিখুন..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500 text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 shadow-lg shadow-pink-500/25 active:scale-98 transition-all cursor-pointer"
            >
              ব্র্যান্ডিং সংরক্ষণ করুন
            </button>
          </form>
        </div>
      )}

      {/* Quick Edit Video Modal */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-neutral-900 border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">ভিডিও সম্পাদনা করুন</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1">শিরোনাম</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1">বিবরণ</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 mb-1">ভিজিবিলিটি</label>
                  <select
                    value={editVisibility}
                    onChange={(e: any) => setEditVisibility(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white text-xs"
                  >
                    <option value="public">পাবলিক (Public)</option>
                    <option value="unlisted">আনলিস্টেড (Unlisted)</option>
                    <option value="private">প্রাইভেট (Private)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 mb-1">ক্যাটাগরি</label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setEditingVideo(null)}
                className="px-4 py-2 rounded-xl hover:bg-white/10 text-neutral-400 text-xs font-bold"
              >
                বাতিল
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs shadow-lg shadow-pink-500/20 active:scale-95 transition-all"
              >
                {isSavingEdit ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
