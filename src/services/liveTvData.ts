export interface LiveTvChannel {
  id: string;
  name: string;
  banglaName: string;
  category: 'news' | 'entertainment' | 'sports' | 'islamic' | 'music';
  categoryBangla: string;
  logo: string;
  liveVideoId: string; // YouTube Live stream ID or embeddable video ID
  currentShow: string;
  viewers: string;
  description: string;
}

export const LIVE_CATEGORIES = [
  { id: 'all', label: 'সব চ্যানেল', enLabel: 'All Channels' },
  { id: 'news', label: 'সংবাদ', enLabel: 'News' },
  { id: 'entertainment', label: 'বিনোদন ও নাটক', enLabel: 'Entertainment' },
  { id: 'sports', label: 'খেলাধুলা', enLabel: 'Sports' },
  { id: 'islamic', label: 'ইসলামিক', enLabel: 'Islamic' },
  { id: 'music', label: 'গান ও মিউজিক', enLabel: 'Music' },
] as const;

export const BANGLA_LIVE_CHANNELS: LiveTvChannel[] = [
  {
    id: 'somoy-tv',
    name: 'Somoy TV',
    banglaName: 'সময় টিভি',
    category: 'news',
    categoryBangla: 'সংবাদ',
    logo: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=120&auto=format&fit=crop&q=80',
    liveVideoId: 'UdV1Q67u438', // Somoy TV Live 24/7 stream ID
    currentShow: 'সময় সংবাদ ও বুলেটিন (সরাসরি)',
    viewers: '48.5K',
    description: 'বাংলাদেশের শীর্ষ সংবাদভিত্তিক স্যাটেলাইট টেলিভিশন চ্যানেল। ২৪ ঘণ্টা তাজা খবর।'
  },
  {
    id: 'jamuna-tv',
    name: 'Jamuna TV',
    banglaName: 'যমুনা টিভি',
    category: 'news',
    categoryBangla: 'সংবাদ',
    logo: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=120&auto=format&fit=crop&q=80',
    liveVideoId: 'wFk37hGZ054', // Jamuna TV Live
    currentShow: 'যমুনা ২৪/৭ স্পেশাল বুলেটিন',
    viewers: '36.2K',
    description: 'সর্বশেষ জাতীয় ও আন্তর্জাতিক সংবাদ সরাসরি যমুনা টেলিভিশনে।'
  },
  {
    id: 'channel-i',
    name: 'Channel i',
    banglaName: 'চ্যানেল আই',
    category: 'entertainment',
    categoryBangla: 'বিনোদন',
    logo: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=120&auto=format&fit=crop&q=80',
    liveVideoId: 'k1ZzY_z9f8E', // Channel i Live
    currentShow: 'হৃদয়ে মাটি ও মানুষ এবং বিশেষ নাটক',
    viewers: '24.1K',
    description: 'হৃদয়ে বাংলাদেশ — চ্যানেল আই এর নাটক, টেলিফিল্ম ও বিনোদনমূলক অনুষ্ঠান।'
  },
  {
    id: 'ntv-bangla',
    name: 'NTV',
    banglaName: 'এনটিভি',
    category: 'entertainment',
    categoryBangla: 'বিনোদন',
    logo: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=120&auto=format&fit=crop&q=80',
    liveVideoId: 'yq3W9h8771A', // NTV Live
    currentShow: 'জনপ্রিয় ধারাবাহিক নাটক ও টকশো',
    viewers: '19.8K',
    description: 'সময়ের সাথে আগামীর পথে — এনটিভি বাংলাদেশ।'
  },
  {
    id: 'ekattor-tv',
    name: 'Ekattor TV',
    banglaName: 'একাত্তর টিভি',
    category: 'news',
    categoryBangla: 'সংবাদ',
    logo: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=120&auto=format&fit=crop&q=80',
    liveVideoId: 'UdV1Q67u438',
    currentShow: 'একাত্তর জার্নাল ও সরাসরি খবর',
    viewers: '22.4K',
    description: 'সংবাদই শক্তি — একাত্তর টেলিভিশনের দিনভর লাইভ সম্প্রচার।'
  },
  {
    id: 'rtv-live',
    name: 'RTV',
    banglaName: 'আরটিভি',
    category: 'entertainment',
    categoryBangla: 'বিনোদন',
    logo: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=120&auto=format&fit=crop&q=80',
    liveVideoId: '3JZ_D3ELwOQ',
    currentShow: 'আরটিভি নাটক ও মিউজিক ফেস্ট',
    viewers: '17.6K',
    description: 'আজ এবং আগামী — আরটিভির বিশেষ নাটক ও বিনোদন।'
  },
  {
    id: 'deepto-tv',
    name: 'Deepto TV',
    banglaName: 'দীপ্ত টিভি',
    category: 'entertainment',
    categoryBangla: 'বিনোদন',
    logo: 'https://images.unsplash.com/photo-1578022761797-b8636ac1773c?w=120&auto=format&fit=crop&q=80',
    liveVideoId: 'tO1t9K8Wb4I',
    currentShow: 'সুলতান সুলেমান ও মেগা ধারাবাহিক নাটক',
    viewers: '29.3K',
    description: 'দীপ্ত টিভি — জনপ্রিয় মেগা সিরিয়াল ও বাংলা নাটক।'
  },
  {
    id: 'dbc-news',
    name: 'DBC News',
    banglaName: 'ডিবিসি নিউজ',
    category: 'news',
    categoryBangla: 'সংবাদ',
    logo: 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=120&auto=format&fit=crop&q=80',
    liveVideoId: 'a3ICNMQW7Ok',
    currentShow: 'ডিবিসি নিউজ আওয়ার',
    viewers: '14.2K',
    description: '২৪ ঘণ্টার সার্বক্ষণিক তাজা খবর ও বিশ্লেষণ।'
  },
  {
    id: 't-sports',
    name: 'T Sports',
    banglaName: 'টি স্পোর্টস',
    category: 'sports',
    categoryBangla: 'খেলাধুলা',
    logo: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=120&auto=format&fit=crop&q=80',
    liveVideoId: 'wFk37hGZ054',
    currentShow: 'লাইভ ক্রিকেট ও ফুটবল ম্যাচ হাইলাইটস',
    viewers: '55.1K',
    description: 'বাংলাদেশের একমাত্র পূর্ণাঙ্গ স্পোর্টস চ্যানেল।'
  },
  {
    id: 'peace-tv-bangla',
    name: 'Peace TV Bangla',
    banglaName: 'পিস টিভি বাংলা',
    category: 'islamic',
    categoryBangla: 'ইসলামিক',
    logo: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=120&auto=format&fit=crop&q=80',
    liveVideoId: 'k1ZzY_z9f8E',
    currentShow: 'কুরআন ও হাদিসের আলোকে জীবন',
    viewers: '28.9K',
    description: 'মানবতার সমাধান — পিস টিভি বাংলা ইসলামিক প্রোগ্রাম।'
  },
  {
    id: 'gaan-bangla',
    name: 'Gaan Bangla',
    banglaName: 'গান বাংলা',
    category: 'music',
    categoryBangla: 'গান',
    logo: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&auto=format&fit=crop&q=80',
    liveVideoId: 'UdV1Q67u438',
    currentShow: 'উইন্ড অফ চেঞ্জ (Wind of Change) মিউজিক',
    viewers: '21.5K',
    description: 'মিউজিক ফর পিস — ২৪ ঘণ্টা ননস্টপ বাংলা গান।'
  },
  {
    id: 'gtv-live',
    name: 'GTV',
    banglaName: 'জিটিভি',
    category: 'sports',
    categoryBangla: 'খেলাধুলা',
    logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=120&auto=format&fit=crop&q=80',
    liveVideoId: 'yq3W9h8771A',
    currentShow: 'স্পেশাল স্পোর্টস ও ক্রিকেট লাইভ',
    viewers: '31.4K',
    description: 'গাজী টেলিভিশন — লাইভ ক্রিকেট ও বিনোদন।'
  }
];
