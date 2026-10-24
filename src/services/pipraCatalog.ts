export interface PipraVideoItem {
  id: string;
  title: string;
  banglaTitle?: string;
  category: 'natok' | 'movie' | 'comedy' | 'music' | 'drama' | 'action' | 'romance';
  thumbnail: string;
  channelTitle: string;
  channelId?: string;
  views: string;
  publishedAt: string;
  duration: string;
  featured?: boolean;
  bannerImage?: string;
  synopsis?: string;
}

export const PIPRA_CATEGORIES = [
  { id: 'all', label: 'সব (All)' },
  { id: 'live-tv', label: '🔴 লাইভ টিভি (Live TV)' },
  { id: 'natok', label: '🎭 নাটক (Natok)' },
  { id: 'movie', label: '🎬 সিনেমা (Movies)' },
  { id: 'comedy', label: '😂 কমেডি (Comedy)' },
  { id: 'music', label: '🎵 গান (Music)' },
  { id: 'action', label: '🔥 অ্যাকশন (Action)' },
  { id: 'romance', label: '❤️ রোমান্টিক (Romance)' },
] as const;

export const FEATURED_HERO_VIDEOS: PipraVideoItem[] = [
  {
    id: 'k1ZzY_z9f8E',
    title: 'বুকের মধ্যে আগুন | Buker Moddhe Agun | New Eid Blockbuster Natok',
    banglaTitle: 'বুকের মধ্যে আগুন',
    category: 'natok',
    thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1280&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&auto=format&fit=crop&q=80',
    channelTitle: 'PipraTube Originals',
    views: '3.8M',
    publishedAt: '২ দিন আগে',
    duration: '48:15',
    featured: true,
    synopsis: 'ভালোবাসা, আত্মত্যাগ আর পরিবারের হৃদয়স্পর্শী গল্প নিয়ে এই সময়ের সবচেয়ে আলোচিত নাটক। অভিনয় করেছেন শীর্ষ তারকারা।'
  },
  {
    id: 'yq3W9h8771A',
    title: 'প্রিয়তমা | Priyotoma | Superhit Bangla Cinema | Full Movie',
    banglaTitle: 'প্রিয়তমা - ফুল সিনেমা',
    category: 'movie',
    thumbnail: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1600&auto=format&fit=crop&q=80',
    channelTitle: 'Cinema Bangla',
    views: '12.4M',
    publishedAt: '১ সপ্তাহ আগে',
    duration: '2:15:30',
    featured: true,
    synopsis: 'ভালোবাসার চিরন্তন রোমাঞ্চকর উপাখ্যান ও ধুন্দুমার অ্যাকশনে ভরপুর রেকর্ড ব্রেকিং মেগা ব্লকবাস্টার বাংলা চলচ্চিত্র।'
  },
  {
    id: '3JZ_D3ELwOQ',
    title: 'হাবলুর বিয়ে | Hablur Biye | Comedy Special Natok | Niloy & Heme',
    banglaTitle: 'হাবলুর বিয়ে - কমেডি নাটক',
    category: 'comedy',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1280&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&auto=format&fit=crop&q=80',
    channelTitle: 'Golpo Entertainment',
    views: '4.6M',
    publishedAt: '৩ দিন আগে',
    duration: '38:40',
    featured: true,
    synopsis: 'হাসির দমক আর হাস্যকর ঘটনার সমাহার নিয়ে নিলয় আলমগীর ও জিয়াউল ফারুক অপূর্বর জমজমাট স্পেশাল নাটক।'
  }
];

export const CURATED_PIPRA_VIDEOS: PipraVideoItem[] = [
  // Natok
  {
    id: 'M7lc1UVf-VE',
    title: 'পাগল মন | Pagol Mon | New Bangla Natok 2026 | Apurbo, Mehazabien',
    banglaTitle: 'পাগল মন - মেগা নাটক',
    category: 'natok',
    thumbnail: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=640&auto=format&fit=crop&q=80',
    channelTitle: 'NTV Drama',
    views: '2.5M',
    publishedAt: '১ দিন আগে',
    duration: '42:10',
    synopsis: 'দুটি হৃদয়ের অব্যক্ত অনুভূতির গল্প।'
  },
  {
    id: 'wFk37hGZ054',
    title: 'মি অ্যান্ড মিসেস চাপাবাজ | Me and Mrs Chapabaj | Niloy Alamgir, Heme',
    banglaTitle: 'মি অ্যান্ড মিসেস চাপাবাজ',
    category: 'comedy',
    thumbnail: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=640&auto=format&fit=crop&q=80',
    channelTitle: 'Rangon Entertainment',
    views: '3.1M',
    publishedAt: '৩ দিন আগে',
    duration: '39:50'
  },
  {
    id: 'UdV1Q67u438',
    title: 'তুফান | Toofan | Mega Action Movie Teaser & Behind the Scenes',
    banglaTitle: 'তুফান - অ্যাকশন মুভি',
    category: 'action',
    thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=640&auto=format&fit=crop&q=80',
    channelTitle: 'Chorki & Alpha-i',
    views: '8.9M',
    publishedAt: '৫ দিন আগে',
    duration: '1:45:20'
  },
  {
    id: 'tO1t9K8Wb4I',
    title: 'চিঠি দিও | Chithi Dio | Romantic Bangla Song & Musical Film',
    banglaTitle: 'চিঠি দিও - রোমান্টিক গান',
    category: 'music',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=640&auto=format&fit=crop&q=80',
    channelTitle: 'Dhruba Music Station',
    views: '1.8M',
    publishedAt: '১ সপ্তাহ আগে',
    duration: '5:22'
  },
  {
    id: 'a3ICNMQW7Ok',
    title: 'হাওয়া | Hawa | Full Movie Soundtrack & Special Scene Compilation',
    banglaTitle: 'হাওয়া - রহস্য ও রোমাঞ্চ',
    category: 'movie',
    thumbnail: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=640&auto=format&fit=crop&q=80',
    channelTitle: 'Facecard Productions',
    views: '9.2M',
    publishedAt: '২ সপ্তাহ আগে',
    duration: '2:11:00'
  },
  {
    id: 'kJQP7kiw5Fk',
    title: 'ফ্যামিলি ক্রাইসিস | Family Crisis | Most Emotional Bengali Drama Episode',
    banglaTitle: 'ফ্যামিলি ক্রাইসিস',
    category: 'drama',
    thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=640&auto=format&fit=crop&q=80',
    channelTitle: 'Cinema Bangla',
    views: '4.7M',
    publishedAt: '৪ দিন আগে',
    duration: '35:10'
  },
  {
    id: 'L_LUpnjgPso',
    title: 'রংবাজ | Rongbaz | Full Bangla Action Movie | Shakib Khan & Bubly',
    banglaTitle: 'রংবাজ ফুল মুভি',
    category: 'action',
    thumbnail: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=640&auto=format&fit=crop&q=80',
    channelTitle: 'Shapla Media',
    views: '15.6M',
    publishedAt: '৩ সপ্তাহ আগে',
    duration: '2:24:15'
  },
  {
    id: '9bZkp7q19f0',
    title: 'জামাই শ্বশুর | Jamai Shashur | Funny Natok | Mosharraf Karim',
    banglaTitle: 'জামাই শ্বশুর - মোশাররফ করিম',
    category: 'comedy',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=640&auto=format&fit=crop&q=80',
    channelTitle: 'G-Series Bangla Natok',
    views: '6.4M',
    publishedAt: '৬ দিন আগে',
    duration: '44:00'
  }
];
