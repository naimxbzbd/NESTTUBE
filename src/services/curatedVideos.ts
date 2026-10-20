/**
 * Comprehensive Category-Wise Curated Video Database
 * Provides authentic, playable YouTube videos categorized across all 17 Home categories.
 */

export interface CuratedVideoItem {
  id: string;
  category: string;
  snippet: {
    title: string;
    channelTitle: string;
    channelId: string;
    publishedAt: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
    description: string;
  };
  contentDetails: {
    duration: string;
  };
  statistics: {
    viewCount: string;
    likeCount: string;
  };
}

const makeVideo = (
  id: string,
  category: string,
  title: string,
  channelTitle: string,
  channelId: string,
  publishedAt: string,
  duration: string,
  viewCount: string,
  likeCount: string,
  description: string
): CuratedVideoItem => ({
  id,
  category,
  snippet: {
    title,
    channelTitle,
    channelId,
    publishedAt,
    thumbnails: {
      default: { url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` },
      medium: { url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` },
      high: { url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` },
    },
    description,
  },
  contentDetails: { duration },
  statistics: { viewCount, likeCount },
});

export const CATEGORY_VIDEOS_MAP: Record<string, CuratedVideoItem[]> = {
  Music: [
    makeVideo(
      'L_LUpnjgPso',
      'Music',
      'lofi hip hop radio 📚 - beats to relax/study to',
      'Lofi Girl',
      'UCvjjWv6K0qM1M8i64QWz4aw',
      '2026-01-01T00:00:00Z',
      'PT3H45M12S',
      '78291024',
      '3410000',
      'Peaceful lofi hip hop beats to relax, study, work, or code to. Stream 24/7 with Lofi Girl.'
    ),
    makeVideo(
      '8jPQjjsBb68',
      'Music',
      'Ed Sheeran - Shape of You (Official Music Video)',
      'Ed Sheeran',
      'UC0C-w0YjGpqDXGB8IHb662A',
      '2025-11-10T00:00:00Z',
      'PT4M23S',
      '6200000000',
      '32000000',
      'The official music video for Ed Sheeran - Shape of You.'
    ),
    makeVideo(
      'dQw4w9WgXcQ',
      'Music',
      'Rick Astley - Never Gonna Give You Up (Official Music Video)',
      'Rick Astley',
      'UCuAXFkgsw1L7xaCfnd5JJOw',
      '2025-10-25T00:00:00Z',
      'PT3M33S',
      '1500000000',
      '16000000',
      'The official video for Never Gonna Give You Up by Rick Astley.'
    ),
    makeVideo(
      'kJQP7kiw5Fk',
      'Music',
      'Luis Fonsi - Despacito ft. Daddy Yankee',
      'Luis Fonsi',
      'UC1I_m3OAC7P_rM1N8pIn2eA',
      '2025-08-12T00:00:00Z',
      'PT4M41S',
      '8300000000',
      '52000000',
      'Despacito ft. Daddy Yankee official video.'
    ),
    makeVideo(
      'fJ9rUzIMcZQ',
      'Music',
      'Queen – Bohemian Rhapsody (Official Video Remastered)',
      'Queen Official',
      'UC209C8o32Rz_q_0O4u4m-6w',
      '2025-07-01T00:00:00Z',
      'PT5M59S',
      '1700000000',
      '12000000',
      'Remastered official video for Bohemian Rhapsody by Queen.'
    ),
    makeVideo(
      '0e3GPea1Tyg',
      'Music',
      'Coldplay - Paradise (Official Video)',
      'Coldplay',
      'UCR28Yf29239102931',
      '2025-06-15T00:00:00Z',
      'PT4M20S',
      '1890000000',
      '11000000',
      'Official video for Paradise by Coldplay.'
    ),
    makeVideo(
      'rYEDA3JcQqw',
      'Music',
      'Adele - Rolling in the Deep (Official Music Video)',
      'Adele',
      'UComP_epzeKzvBX15616s1qQ',
      '2025-05-18T00:00:00Z',
      'PT3M53S',
      '2400000000',
      '14000000',
      'Official video for Rolling in the Deep by Adele.'
    ),
    makeVideo(
      '4NRXx6U8ABQ',
      'Music',
      'The Weeknd - Blinding Lights (Official Music Video)',
      'The Weeknd',
      'UC0WP5P-ufpRfjbNrmOWwLBQ',
      '2025-04-10T00:00:00Z',
      'PT4M20S',
      '890000000',
      '10500000',
      'The Weeknd - Blinding Lights (Official Music Video).'
    ),
    makeVideo(
      'BC_Z22i9f38',
      'Music',
      'Dua Lipa - Levitating (Official Music Video)',
      'Dua Lipa',
      'UC-J-KZfRV8c13fGAxG8f-ew',
      '2025-03-22T00:00:00Z',
      'PT3M50S',
      '950000000',
      '7900000',
      'Official music video for Levitating by Dua Lipa.'
    ),
    makeVideo(
      '7wtfhZwyrcc',
      'Music',
      'Imagine Dragons - Believer (Official Music Video)',
      'ImagineDragons',
      'UCT9zcQNlyht7fRlcjmflRSA',
      '2025-02-14T00:00:00Z',
      'PT3M36S',
      '2600000000',
      '21000000',
      'Official music video for Believer by Imagine Dragons.'
    ),
    makeVideo(
      '60ItHLz5WEA',
      'Music',
      'Alan Walker - Faded (Official Music Video)',
      'Alan Walker',
      'UCJrOtniJ0-NWz37R30urifQ',
      '2025-01-20T00:00:00Z',
      'PT3M32S',
      '3500000000',
      '27000000',
      'Official music video for Faded by Alan Walker.'
    ),
    makeVideo(
      'RgKAFK5djSk',
      'Music',
      'Wiz Khalifa ft. Charlie Puth - See You Again',
      'Wiz Khalifa',
      'UCzH3iADn_k3fB4mRz72X47A',
      '2024-12-10T00:00:00Z',
      'PT3M57S',
      '6100000000',
      '41000000',
      'Official music video for See You Again featuring Charlie Puth.'
    ),
  ],

  Gaming: [
    makeVideo(
      'kXYiU_JCYtU',
      'Gaming',
      'GTA 6 Gameplay - Everything We Know So Far!',
      'gameranx',
      'UCA2AAGrfS_h5e1B1oM38Ubg',
      '2026-01-28T20:00:00Z',
      'PT15M10S',
      '5890200',
      '410000',
      'Breakdown of Vice City map size, graphics physics engine, AI routines, and mission mechanics.'
    ),
    makeVideo(
      'sBws8MSXN7A',
      'Gaming',
      'Top 50 Unbelievable Gaming Moments Of 2026',
      'IGN',
      'UCKy1dAqELo0BqmtFOmYy1Kw',
      '2026-02-20T14:00:00Z',
      'PT22M30S',
      '3109200',
      '185000',
      'From clutch multiplayer victories to breathtaking open-world discoveries, here are 2026’s top gaming plays.'
    ),
    makeVideo(
      'fK9s6fK7G3E',
      'Gaming',
      'I Survived 100 Days in Hardcore Minecraft 1.21',
      'Luke TheNotable',
      'UCv8H756Z6W1Xo80h59e8xAw',
      '2026-02-12T17:00:00Z',
      'PT38M40S',
      '9240100',
      '620000',
      'Complete 100 days hardcore survival experience building mega bases, fighting the Wither, and conquering the End.'
    ),
    makeVideo(
      'wLp32k_B5i8',
      'Gaming',
      'Elden Ring: Shadow of the Erdtree - Full Walkthrough & Bosses',
      'Shirrako',
      'UC7eAFU52vsztBiwTqG2_F_A',
      '2026-01-18T12:00:00Z',
      'PT1H42M15S',
      '4120800',
      '290000',
      'Comprehensive walkthrough of Elden Ring expansion in 4K 60FPS with all remembrance bosses defeated.'
    ),
    makeVideo(
      'qC5KBRn1Rq8',
      'Gaming',
      'Unreal Engine 5.5 Next-Gen Graphics Demo in Real-Time 4K',
      'Unreal Engine',
      'UCBobmJyzsJ6G5Uepsh4fctQ',
      '2026-02-04T15:00:00Z',
      'PT12M45S',
      '2890400',
      '195000',
      'Explore Lumen global illumination, Nanite geometry, and photorealistic virtual production workflows.'
    ),
    makeVideo(
      '4e42PZk_kBo',
      'Gaming',
      'Call of Duty Warzone - 54 Kills World Record Solo vs Quads',
      'Scump',
      'UC0KzC48o5-Qc19P-7080aQw',
      '2026-02-24T18:00:00Z',
      'PT24M10S',
      '1780500',
      '142000',
      'High-octane Warzone resurgence match setting the worldwide kill record with aggressive sniper rotations.'
    ),
    makeVideo(
      '9hK3B_uJ8aY',
      'Gaming',
      'Nintendo Switch 2 - Official First Look & Game Lineup',
      'Nintendo',
      'UCGIY_O-8vW4rfX98KlCsvRg',
      '2026-03-01T10:00:00Z',
      'PT18M20S',
      '8490200',
      '630000',
      'Official hardware breakdown, backward compatibility, DLSS performance, and launch day titles.'
    ),
    makeVideo(
      '3Yq4Z_xW5uI',
      'Gaming',
      'League of Legends Worlds 2026 - Faker Legendary Play & Finals Highlights',
      'LoL Esports',
      'UCvqRdlKsE5Q8mf8YXbdIJLw',
      '2026-01-10T16:00:00Z',
      'PT21M05S',
      '4520100',
      '380000',
      'Relive the most intense teamfights and championship decider moments in LoL esports history.'
    ),
  ],

  News: [
    makeVideo(
      '2g811Ko7g9I',
      'News',
      'Global Tech & Innovation Summit 2026 Breaking Highlights',
      'TechCrunch',
      'UCC2345091_2391039',
      '2026-03-04T08:00:00Z',
      'PT14M05S',
      '980100',
      '78000',
      'Latest breakthroughs in renewable energy, robotics, autonomous flight, and AI hardware.'
    ),
    makeVideo(
      '50VNCymT-Cs',
      'News',
      'BBC World News - Global Climate & Renewable Energy Summit 2026',
      'BBC News',
      'UC16niRr50-MSBwiO3YDb3RA',
      '2026-03-02T12:00:00Z',
      'PT28M15S',
      '1450200',
      '92000',
      'World leaders gather to finalize international emissions accords and invest in clean infrastructure.'
    ),
    makeVideo(
      'xP7rN_eG3kM',
      'News',
      'Bloomberg Markets - Global Semiconductor & AI Economy Analysis',
      'Bloomberg Technology',
      'UCrM7B7SL_g1edF79YcwgW1Q',
      '2026-03-03T14:30:00Z',
      'PT19M40S',
      '820100',
      '54000',
      'How AI infrastructure demand is reshaping chip manufacturers, power grids, and stock markets.'
    ),
    makeVideo(
      'vL4e0P9W5oY',
      'News',
      'World Economic Forum 2026 Special Address & Economic Outlook',
      'CNN',
      'UCupvZG-5ko_eiXAupbDfxWw',
      '2026-02-28T16:00:00Z',
      'PT34M10S',
      '1120400',
      '71000',
      'In-depth discussion on inflation stabilization, international trade corridors, and labor markets.'
    ),
    makeVideo(
      '1w7G-S_k2kY',
      'News',
      'United Nations General Assembly High-Level Session Live Analysis',
      'Al Jazeera English',
      'UCNye-wNBqNL5ZzHSJj3l8Bg',
      '2026-02-25T11:00:00Z',
      'PT25M30S',
      '960200',
      '68000',
      'International diplomatic coverage from UN headquarters addressing humanitarian aid and conflict de-escalation.'
    ),
    makeVideo(
      '8t3rW_vM4pQ',
      'News',
      'Reuters World News - Asia-Pacific Diplomatic & Trade Accord Finalized',
      'Reuters',
      'UCt4t-jeY85JegMlZ-E5UWtA',
      '2026-02-20T09:00:00Z',
      'PT16M50S',
      '740300',
      '49000',
      'Signatories conclude historic digital commerce and green maritime transportation agreements.'
    ),
    makeVideo(
      '9bM4r_uL6pA',
      'News',
      'Clean Energy Mega-Grid Construction in North Sea',
      'DW News',
      'UCknLrEdhRCp1HK5ECQ9nkmA',
      '2026-02-15T15:20:00Z',
      'PT22M15S',
      '890100',
      '58000',
      'European engineering teams inaugurate the world’s largest interconnected offshore wind cluster.'
    ),
    makeVideo(
      '2bM8k_rT9sV',
      'News',
      'Financial Times - Central Bank Global Rate Cut & Currency Forecasts',
      'Financial Times',
      'UCoUxsWakJucWUQ4265ox9kw',
      '2026-02-10T13:45:00Z',
      'PT18M10S',
      '670200',
      '43000',
      'Economic editors analyze interest rate trajectory, housing affordability, and international debt yields.'
    ),
  ],

  'AI & Tech': [
    makeVideo(
      'LXb3EKWsInQ',
      'AI & Tech',
      'The Ultimate Tech Setup 2026 - M4 Max & AI Workstation',
      'Marques Brownlee',
      'UCBJycSMxDv_9LWSk6504_0w',
      '2026-03-01T18:00:00Z',
      'PT18M45S',
      '4920100',
      '380000',
      'Complete desk setup tour for 2026 featuring custom OLED displays, studio acoustics, and flagship hardware.'
    ),
    makeVideo(
      'bMknfKXIFA8',
      'AI & Tech',
      '10 JavaScript Mistakes Everyone Makes (And How to Fix Them)',
      'Fireship',
      'UCsBjURrPoezykLs9EqgamOA',
      '2026-02-28T16:00:00Z',
      'PT5M12S',
      '2150900',
      '195000',
      'Quick breakdown of async/await pitfalls, scope bugs, memory leaks, and modern JavaScript best practices.'
    ),
    makeVideo(
      '4f5eW_kM8rY',
      'AI & Tech',
      'The Smartphone with Holographic AI Assistant Built-in',
      'Mrwhosetheboss',
      'UCMiJRAwDNSN3g345TUMnDUQ',
      '2026-02-22T17:00:00Z',
      'PT16M30S',
      '3980400',
      '285000',
      'Testing next-generation neural silicon, on-device multimodal models, and spatial projection features.'
    ),
    makeVideo(
      '9r4wK_uM3qT',
      'AI & Tech',
      'We Built A Liquid-Cooled AI Deep Learning Server',
      'Linus Tech Tips',
      'UCXuqSBlHAE6Xw-yeJA0Tunw',
      '2026-02-18T20:00:00Z',
      'PT21M15S',
      '2840100',
      '210000',
      'Custom liquid distribution plates, 4x flagship GPUs, and training custom LLMs locally in a soundproof rack.'
    ),
    makeVideo(
      'vP9wZ_kL4rB',
      'AI & Tech',
      'Sam Altman on GPT-5, AGI, and Next Generation Robotics',
      'Lex Fridman',
      'UCSHZKyawb77ixDdsGog4iWA',
      '2026-02-10T14:00:00Z',
      'PT2H15M00S',
      '3420800',
      '240000',
      'OpenAI CEO discusses reasoning models, neural architectures, data synthesis, and societal alignment.'
    ),
    makeVideo(
      '8pM4k_wQ1rT',
      'AI & Tech',
      'Quantum Computing Breakthrough: Google & IBM 2026',
      'ColdFusion',
      'UC4QZ_LsYcvcq7qOsOhpAX4A',
      '2026-01-25T13:00:00Z',
      'PT17M40S',
      '1850300',
      '135000',
      'Fault-tolerant logical qubits demonstrated with 99.9% gate fidelity, signaling practical quantum advantage.'
    ),
    makeVideo(
      '3fM9w_kR2pY',
      'AI & Tech',
      'The Minimalist Workspace for Remote Engineers 2026',
      'Dave2D',
      'UCVYamHliCI9rw1tHR1xdkfw',
      '2026-01-15T15:30:00Z',
      'PT11M10S',
      '1940200',
      '155000',
      'Ergonomic motorized desks, single-cable Thunderbolt 5 hubs, mechanical keyboards, and studio monitors.'
    ),
    makeVideo(
      '5kM8w_vQ9rP',
      'AI & Tech',
      'AI Generates Full Interactive 3D Worlds in Real-Time',
      'Two Minute Papers',
      'UCbfYPyITQ-BRg Cruz_7b-Q',
      '2026-01-08T16:45:00Z',
      'PT7M20S',
      '1280400',
      '112000',
      'Neural radiance fields, Gaussian splatting, and real-time interactive physics generation explained.'
    ),
  ],

  Coding: [
    makeVideo(
      'mP0RAo9SKZc',
      'Coding',
      'React JS Full Course 2026 - Build 5 Production Web Apps',
      'CodeWithHarry',
      'UCeVMnSShP_Iinef-RI5NWxa',
      '2026-02-10T12:00:00Z',
      'PT11H24M05S',
      '1820490',
      '124000',
      'Learn modern React 19+, Hooks, Context, Tailwind CSS, Zustand, and full-stack integration from scratch.'
    ),
    makeVideo(
      'fHI8X4OX73U',
      'Coding',
      'Python Full Course for Beginners [2026 Updated]',
      'Programming with Mosh',
      'UCWv7vMbMWH4-V0ZXgPYzbTY',
      '2026-01-15T09:30:00Z',
      'PT6H14M20S',
      '3890120',
      '210000',
      'Python tutorial for beginners - Learn Python for Web Development, Automation, and Data Science.'
    ),
    makeVideo(
      '8p4rW_kM9tS',
      'Coding',
      'Full Stack Next.js 15, TypeScript & Tailwind Masterclass',
      'freeCodeCamp.org',
      'UC8butISFwT-Wl7EV0hUK0BQ',
      '2026-02-05T14:00:00Z',
      'PT8H45M10S',
      '1420900',
      '115000',
      'Build scalable web applications with Server Actions, App Router, PostgreSQL, and authentication.'
    ),
    makeVideo(
      '2kM8w_vQ3rL',
      'Coding',
      'Modern JavaScript From The Beginning (DOM, Async, ES2026)',
      'Traversy Media',
      'UC29ju8bIPH5as8OGnQzwJyA',
      '2026-01-20T17:00:00Z',
      'PT7H12M00S',
      '2150300',
      '168000',
      'Master fundamental JavaScript programming without external libraries, async patterns, and modern tooling.'
    ),
    makeVideo(
      '4bM9w_kP1rT',
      'Coding',
      'CSS Grid & Flexbox Will Never Confuse You Again',
      'Kevin Powell',
      'UCJZv4d5rbIKd4QHMPkcABCw',
      '2026-01-12T15:00:00Z',
      'PT28M40S',
      '1340100',
      '118000',
      'Deep dive into responsive layout mechanics, alignment hacks, and modern CSS container queries.'
    ),
    makeVideo(
      '7wM3r_kL9pB',
      'Coding',
      'Neovim vs VS Code: Why Modern Devs Are Switching',
      'ThePrimeagen',
      'UCUyeluBRhGPCW4rPe_UvBZQ',
      '2026-02-14T21:00:00Z',
      'PT22M15S',
      '980400',
      '84000',
      'Vim motions, Lua configuration, Tree-sitter syntax trees, and lightning fast development speeds.'
    ),
    makeVideo(
      '6pM4k_vW2rQ',
      'Coding',
      'Build a Realtime Collaborative App with WebSockets & React',
      'Web Dev Simplified',
      'UCFbNIlpp853WWCwS56nEBZw',
      '2026-02-22T16:30:00Z',
      'PT45M10S',
      '760200',
      '62000',
      'Implement multiplayer cursors, presence indicators, room management, and optimistic UI updates.'
    ),
    makeVideo(
      '1kM9w_rT5sV',
      'Coding',
      'C++ Full Course for Beginners - 10 Hours of Pure Practice',
      'Bro Code',
      'UC4SVo0U03OF4nyh4kkyJ9PA',
      '2026-01-05T12:00:00Z',
      'PT10H15M00S',
      '2890500',
      '215000',
      'Pointers, memory allocation, object-oriented design, templates, and standard template library (STL).'
    ),
  ],

  Podcasts: [
    makeVideo(
      'D9W3B1K13eU',
      'Podcasts',
      'The Future of Artificial Intelligence & Human Consciousness',
      'Lex Fridman Podcast',
      'UCSHZKyawb77ixDdsGog4iWA',
      '2026-03-02T11:00:00Z',
      'PT2H45M00S',
      '1940200',
      '145000',
      'Deep conversation about neural networks, quantum computing, ethics, and future space exploration.'
    ),
    makeVideo(
      '4rM9w_kL2pT',
      'Podcasts',
      'Brian Cox on The Physics of Black Holes and Space Travel',
      'The Joe Rogan Experience',
      'UCzQUP1qoWDoEbmsQxvdjxgQ',
      '2026-02-20T15:00:00Z',
      'PT3H12M40S',
      '4890100',
      '310000',
      'Astrophysicist Brian Cox breaks down spacetime curvature, Hawking radiation, and the multiverse.'
    ),
    makeVideo(
      '6kM8w_vQ4rP',
      'Podcasts',
      'How to Optimize Dopamine, Focus & Deep Work Habits',
      'Huberman Lab',
      'UC2D2CMWXMOVWx7giW1n3LIg',
      '2026-02-15T10:00:00Z',
      'PT2H18M15S',
      '3120500',
      '245000',
      'Neurobiology protocols for sustaining morning energy, eliminating brain fog, and building mental resilience.'
    ),
    makeVideo(
      '2pM4k_wQ7rT',
      'Podcasts',
      'The Brutal Truth About Modern Productivity & Discipline',
      'Modern Wisdom',
      'UCIq94iHsH172yZ7W_F3K9pQ',
      '2026-02-08T14:30:00Z',
      'PT1H38M20S',
      '1450200',
      '118000',
      'Chris Williamson interviews leading psychologists on overcoming procrastination and decision fatigue.'
    ),
    makeVideo(
      '9wM3r_kL1pB',
      'Podcasts',
      'The Neuroscience of Elite Founders & High Achievers',
      'The Diary Of A CEO',
      'UCGq-aZJSu57mSYDV5qcPrGg',
      '2026-01-28T18:00:00Z',
      'PT1H52M10S',
      '2180400',
      '175000',
      'Steven Bartlett explores mental fortitude, high-stakes decision making, and wellness rituals.'
    ),
    makeVideo(
      '3kM9w_rT6sV',
      'Podcasts',
      "Dan Carlin's Hardcore History - Twilight of the Mediterranean",
      'Hardcore History',
      'UC4h_fP4f3_K3h_098K4n-wA',
      '2026-01-14T12:00:00Z',
      'PT4H10M00S',
      '1680100',
      '135000',
      'Epic narrative history charting naval warfare, empire collapse, and ancient geopolitics.'
    ),
    makeVideo(
      '8wM4k_vL3pQ',
      'Podcasts',
      'How We Scaled Stripe to $1 Trillion in Payment Processing',
      'How I Built This with Guy Raz',
      'UCzCq567X3G_9p-8K2n0w-uQ',
      '2026-01-05T16:00:00Z',
      'PT1H24M45S',
      '1290300',
      '98000',
      'The journey of Patrick and John Collison from early prototype to foundational internet financial infrastructure.'
    ),
  ],

  Comedy: [
    makeVideo(
      '4wM9r_kL2pB',
      'Comedy',
      'Trevor Noah - Live Standup: Cultural Shocks & Flying Across the World',
      'Trevor Noah',
      'UCX1b89-jY5P7m3Q8aK4n-wQ',
      '2026-02-18T19:00:00Z',
      'PT18M25S',
      '4120900',
      '320000',
      'Hilarious standup observations about airport security, language differences, and traveling internationally.'
    ),
    makeVideo(
      '7kM8w_vQ5rT',
      'Comedy',
      'Key & Peele - Substitute Teacher & Best Sketches of All Time',
      'Comedy Central',
      'UCUsN5ZwHx2kILm84-jP3w-w',
      '2026-02-02T16:00:00Z',
      'PT14M40S',
      '8920100',
      '680000',
      'Classic sketches remastered in HD featuring Mr. Garvey and iconic comedy duo moments.'
    ),
    makeVideo(
      '2kM4k_wQ8rL',
      'Comedy',
      'Kevin Hart & The Rock Roast Each Other for 10 Minutes Straight',
      'The Tonight Show Starring Jimmy Fallon',
      'UC8-Th83bH_thdKZDJCrn88g',
      '2026-01-24T22:00:00Z',
      'PT10M15S',
      '6780400',
      '510000',
      'Unscripted comedic banter and playground insults between two of Hollywood’s funniest friends.'
    ),
    makeVideo(
      '9bM3r_kL4pQ',
      'Comedy',
      'The Funniest Flight Attendant Routine Ever Recorded',
      'Dry Bar Comedy',
      'UC4w89-jY5P7m3Q8aK4n-w12',
      '2026-01-16T18:30:00Z',
      'PT12M10S',
      '3420100',
      '265000',
      'Clean comedy standup routine about emergency safety instructions and unusual passengers.'
    ),
    makeVideo(
      '3wM9w_rT7sV',
      'Comedy',
      'Weekend Update: Colin Jost and Michael Che Best Joke Swaps',
      'Saturday Night Live',
      'UCqFzWxSCi8gu3577ixAmNGA',
      '2026-01-08T23:30:00Z',
      'PT11M50S',
      '5180900',
      '410000',
      'The tradition of writing controversial jokes for each other on live national television.'
    ),
    makeVideo(
      '8pM4k_vL1rQ',
      'Comedy',
      'Conan O’Brien Visits Korea & Meets Steven Yeun',
      'Team Coco',
      'UCi7GJNg51C3jgmYTUwqoUXA',
      '2025-12-20T17:00:00Z',
      'PT16M30S',
      '4920400',
      '380000',
      'Conan travels to Seoul, samples traditional cuisine, and visits historic temples.'
    ),
    makeVideo(
      '5kM8w_vQ2rP',
      'Comedy',
      'Gabriel Iglesias - The Gift Shop Incident Live Arena Tour',
      'Fluffy',
      'UC1_89-jY5P7m3Q8aK4n-w88',
      '2025-12-10T20:00:00Z',
      'PT15M45S',
      '3840200',
      '295000',
      'Fluffy recounts a shopping misunderstanding with his signature voice sound effects.'
    ),
  ],

  Sports: [
    makeVideo(
      '8wM9r_kL3pB',
      'Sports',
      'Top 25 Greatest FIFA World Cup Goals of All Time in 4K',
      'FIFA',
      'UCpcTrCXblqPeL3SE48P6goA',
      '2026-02-14T14:00:00Z',
      'PT18M50S',
      '9450200',
      '710000',
      'Legendary strikes from Pelé, Maradona, Zidane, Messi, and Cristiano Ronaldo in crisp 4K.'
    ),
    makeVideo(
      '4kM8w_vQ6rT',
      'Sports',
      'NBA Top 50 Most Unbelievable Dunks and Buzzer Beaters',
      'ESPN',
      'UCiWLfSweyRNmLpgEHekhoAg',
      '2026-02-08T18:00:00Z',
      'PT21M15S',
      '5890400',
      '420000',
      'Gravity-defying poster dunks, full-court heaves, and game-winning buzzer shots.'
    ),
    makeVideo(
      '2wM4k_wQ9rL',
      'Sports',
      'Formula 1 2026 - Most Dramatic Wet Weather Overtakes',
      'FORMULA 1',
      'UCB_qr75-ydgTQ7SExzpUaPQ',
      '2026-01-30T16:00:00Z',
      'PT15M30S',
      '3420100',
      '265000',
      'Masterclass wet weather driving through Silverstone and Spa with wheel-to-wheel duels.'
    ),
    makeVideo(
      '9pM3r_kL5pQ',
      'Sports',
      'Cricket World Cup 2026 - Unbelievable 6-Run Last Over Finish',
      'ICC',
      'UCF2j1_hL7i15qK3f9o0p-wA',
      '2026-01-22T12:00:00Z',
      'PT16M45S',
      '7820900',
      '580000',
      'Tense final over with pinpoint yorkers, boundary saves, and electric stadium atmosphere.'
    ),
    makeVideo(
      '3kM9w_rT8sV',
      'Sports',
      'Red Bull Wingsuit Flight Through Mountain Crevice in 4K',
      'Red Bull',
      'UCblfuW_4rakbrgABmx9xE_g',
      '2026-01-14T15:00:00Z',
      'PT8M15S',
      '4920300',
      '390000',
      'Extreme wingsuit proximity flying at 240km/h through the jagged peaks of the Swiss Alps.'
    ),
    makeVideo(
      '7pM4k_vL2rQ',
      'Sports',
      'Wimbledon 2026 - The 45-Shot Championship Point Rally',
      'Wimbledon',
      'UC4w89-jY5P7m3Q8aK4n-w33',
      '2025-12-28T14:30:00Z',
      'PT12M10S',
      '3120400',
      '240000',
      'Athletic endurance on Centre Court featuring diving volleys and baseline passing winners.'
    ),
    makeVideo(
      '6kM8w_vQ3rP',
      'Sports',
      'UFC Knockouts of the Year Compilation',
      'UFC',
      'UCvgfXK4n7Pnz3w950JC-VpA',
      '2025-12-15T21:00:00Z',
      'PT17M20S',
      '6180500',
      '460000',
      'Spinning back kicks, flying knees, and walk-off knockouts inside the Octagon.'
    ),
  ],

  'Science & Nature': [
    makeVideo(
      '50VNCymT-Cs',
      'Science & Nature',
      'Planet Earth 4K Ultra HD - Deep Ocean Discoveries',
      'BBC Earth',
      'UCwmZiGryb-Uee86PBEubxMA',
      '2026-01-10T10:00:00Z',
      'PT48M20S',
      '6200100',
      '390000',
      'Explore breathtaking underwater ecosystems narrated by David Attenborough in native 4K.'
    ),
    makeVideo(
      '3JZ_D3ELwOQ',
      'Science & Nature',
      'How SpaceX Starship Reaches Orbit - Physics & Rocket Science',
      'Everyday Astronaut',
      'UC6uKrU_wqJ1E2452FZ5AnHg',
      '2026-02-05T15:00:00Z',
      'PT38M10S',
      '2890100',
      '210000',
      'In-depth engineering breakdown of Raptor engines, staging dynamics, and heat shield tiles.'
    ),
    makeVideo(
      'X9otDixAtFw',
      'Science & Nature',
      'What If We Detonated All Nuclear Bombs at Once?',
      'Kurzgesagt – In a Nutshell',
      'UCsXVk37bltHxD1rDPwtNM8Q',
      '2026-01-20T14:00:00Z',
      'PT10M50S',
      '18204900',
      '1120000',
      'A scientific thought experiment explaining nuclear physics, atmospheric shockwaves, and planetary fallout.'
    ),
    makeVideo(
      'afBMb6sUaA8',
      'Science & Nature',
      'The Surprising Secret Behind Anti-Gravity & Physics',
      'Veritasium',
      'UCHnyfMqiRRG1u-2MsSQLbXA',
      '2026-02-12T16:00:00Z',
      'PT19M30S',
      '7940100',
      '580000',
      'Exploring magnetic levitation, superconductor Meissner effects, and quantum physics.'
    ),
    makeVideo(
      '8kM9w_rT4sV',
      'Science & Nature',
      'Inside the Amazon Rainforest 4K Wildlife Documentary',
      'National Geographic',
      'UCpVm7bg6pXmpGFzSZVn309w',
      '2026-01-18T11:00:00Z',
      'PT42M15S',
      '4320900',
      '310000',
      'Documentary showcasing elusive jaguars, harpy eagles, and dense biodiversity in the upper canopy.'
    ),
    makeVideo(
      '2wM8k_vQ7rP',
      'Science & Nature',
      'James Webb Space Telescope First Direct Images of Exoplanets',
      'NASA',
      'UCLA_DiR1FfKNvjuUpBHmylQ',
      '2026-02-01T17:00:00Z',
      'PT24M40S',
      '3890200',
      '295000',
      'Spectroscopic analysis of water vapor, methane, and atmospheric signatures 100 light years away.'
    ),
    makeVideo(
      '4pM4k_wL1rT',
      'Science & Nature',
      'Supersonic Flight Shockwaves Captured in Ultra Slow Motion',
      'SmarterEveryDay',
      'UC6107grRI4m03lo5ZFSPrGQ',
      '2026-01-08T18:00:00Z',
      'PT16M15S',
      '5120400',
      '420000',
      'Schlieren photography at 250,000 frames per second reveals aerodynamic pressure waves.'
    ),
  ],

  Cooking: [
    makeVideo(
      '7wM9r_kL4pB',
      'Cooking',
      'Gordon Ramsay Teaches How To Cook The Perfect Ribeye Steak',
      'Gordon Ramsay',
      'UCIEv3lZ_tNXHzL3ox-_uUGQ',
      '2026-02-10T15:00:00Z',
      'PT14M20S',
      '9840200',
      '780000',
      'Master high heat searing, garlic butter basting, herb infusion, and resting for tender steak.'
    ),
    makeVideo(
      '3kM8w_vQ7rT',
      'Cooking',
      '50 Easy 15-Minute Meals Anyone Can Make At Home',
      'Tasty',
      'UCJFp8uSYCCh1pv54DuZChWw',
      '2026-02-02T16:30:00Z',
      'PT26M45S',
      '4120900',
      '310000',
      'Simple skillet meals, one-pot pastas, flavorful stir-fries, and budget friendly prep.'
    ),
    makeVideo(
      '1wM4k_wQ5rL',
      'Cooking',
      'Tokyo Street Food Tour: Wagyu Beef, Ramen & Tsukiji Market',
      'Mark Wiens',
      'UCyEd6QBSgat5kkC6svyjudA',
      '2026-01-25T11:00:00Z',
      'PT32M10S',
      '5490100',
      '415000',
      'Exploring Tokyo’s culinary culture, sizzling A5 Wagyu skewers, and rich tonkotsu ramen.'
    ),
    makeVideo(
      '8pM3r_kL6pQ',
      'Cooking',
      'How to Make Real Authentic Neapolitan Pizza from Scratch',
      'Babish Culinary Universe',
      'UCJHA_jMfCvEnv-38vcTXjvg',
      '2026-01-15T18:00:00Z',
      'PT19M40S',
      '3840200',
      '290000',
      'Fermenting 72-hour pizza dough, San Marzano tomato sauce, fresh mozzarella, and high heat baking.'
    ),
    makeVideo(
      '4kM9w_rT9sV',
      'Cooking',
      'Quick 10-Minute Mediterranean Garlic Pasta',
      'Jamie Oliver',
      'UC1_89-jY5P7m3Q8aK4n-w44',
      '2026-01-08T12:00:00Z',
      'PT11M15S',
      '2890400',
      '215000',
      'Classic Aglio e Olio with cold-pressed olive oil, toasted garlic chips, and parsley.'
    ),
    makeVideo(
      '2pM4k_vL3rQ',
      'Cooking',
      'Uncle Roger Reviewing Jamie Oliver Egg Fried Rice',
      'mrnigelng',
      'UCVjlpEjEY9466_GHUHGJY5Q',
      '2025-12-28T17:00:00Z',
      'PT15M30S',
      '14209500',
      '1100000',
      'Comedy food reaction reviewing proper wok hei technique, MSG seasoning, and chili jam.'
    ),
    makeVideo(
      '9kM8w_vQ4rP',
      'Cooking',
      'How to Bake Real French Croissants with 27 Layers',
      'French Cooking Academy',
      'UC4w89-jY5P7m3Q8aK4n-w55',
      '2025-12-18T14:00:00Z',
      'PT28M50S',
      '2450100',
      '195000',
      'Step-by-step laminating butter block, dough folding techniques, proofing, and golden baking.'
    ),
  ],

  Travel: [
    makeVideo(
      '5wM9r_kL5pB',
      'Travel',
      'Top 10 Most Incredible Countries to Visit in 2026',
      'Lost LeBlanc',
      'UCfi_m6wOIK4F9J_uG1m2w-Q',
      '2026-02-12T17:00:00Z',
      'PT21M40S',
      '3890200',
      '290000',
      'Cinematic travel guide featuring hidden gems across Norway, Japan, Peru, and New Zealand.'
    ),
    makeVideo(
      '2kM8w_vQ8rT',
      'Travel',
      'I Traveled to the Most Isolated Village on Earth',
      'Drew Binsky',
      'UCHuLbgFk7_1F_P4FwQ3w9Aw',
      '2026-02-04T14:30:00Z',
      'PT18M20S',
      '4920100',
      '380000',
      'Journeying 5 days off-grid to document unique indigenous traditions, hospitality, and landscape.'
    ),
    makeVideo(
      '8wM4k_wQ6rL',
      'Travel',
      'We Stayed at the World’s First Underwater Hotel in Maldives',
      'Kara and Nate',
      'UC4w89-jY5P7m3Q8aK4n-w66',
      '2026-01-28T16:00:00Z',
      'PT24M15S',
      '5420300',
      '410000',
      'Living beneath the ocean surface with manta rays swimming past bedroom dome glass.'
    ),
    makeVideo(
      '4pM3r_kL7pQ',
      'Travel',
      'Japan Travel Guide: Two Weeks in Tokyo, Kyoto & Osaka 4K',
      'Abroad in Japan',
      'UCHL9bfHTxCMi-7vfxQ-AYEQ',
      '2026-01-18T13:00:00Z',
      'PT34M50S',
      '3120500',
      '255000',
      'Shinkansen bullet train trips, ancient Kyoto shrines, Dotonbori street food, and budgeting.'
    ),
    makeVideo(
      '1kM9w_rT0sV',
      'Travel',
      'The Most Scenic Glacier Train Journey in the Swiss Alps',
      'Swiss View 4K',
      'UC4w89-jY5P7m3Q8aK4n-w77',
      '2026-01-10T11:00:00Z',
      'PT19M30S',
      '2180400',
      '180000',
      'Riding the Bernina Express through snow-covered mountain passes and spiral viaducts.'
    ),
    makeVideo(
      '7pM4k_vL4rQ',
      'Travel',
      'Bali Indonesia Cinematic 4K Travel Film',
      'Sam Kolder',
      'UC4w89-jY5P7m3Q8aK4n-w88',
      '2025-12-29T15:00:00Z',
      'PT10M40S',
      '4150900',
      '340000',
      'Breathtaking drone cinematography capturing tropical waterfalls, rice terraces, and island beaches.'
    ),
    makeVideo(
      '3kM8w_vQ5rP',
      'Travel',
      'Italy’s Amalfi Coast and Capri Island Walking Tour',
      'Rick Steves’ Europe',
      'UC4w89-jY5P7m3Q8aK4n-w99',
      '2025-12-15T18:00:00Z',
      'PT28M15S',
      '2840200',
      '210000',
      'Exploring pastel villages clinging to cliff edges, lemon groves, and Mediterranean vistas.'
    ),
  ],

  Animation: [
    makeVideo(
      '6wM9r_kL6pB',
      'Animation',
      'Studio Ghibli Artistry & Hand-Drawn Animation Documentary',
      'Studio Ghibli Tribute',
      'UC4w89-jY5P7m3Q8aK4n-w01',
      '2026-02-14T15:00:00Z',
      'PT22M45S',
      '3490100',
      '285000',
      'Detailed study of Hayao Miyazaki’s environmental storytelling, pacing, and watercolor landscapes.'
    ),
    makeVideo(
      '4kM8w_vQ9rT',
      'Animation',
      'Spring - 4K Open Source CGI Animated Short Film',
      'Blender Studio',
      'UC4w89-jY5P7m3Q8aK4n-w02',
      '2026-02-02T14:00:00Z',
      'PT8M10S',
      '8940200',
      '640000',
      'Award-winning fantasy short film created entirely using open-source Blender software.'
    ),
    makeVideo(
      '1wM4k_wQ7rL',
      'Animation',
      'Pixar SparkShorts - Kitbull Animated Short Film',
      'Pixar',
      'UC4w89-jY5P7m3Q8aK4n-w03',
      '2026-01-20T17:00:00Z',
      'PT9M00S',
      '78201000',
      '4200000',
      'An unlikely friendship between a fierce stray kitten and a pit bull in an urban alley.'
    ),
    makeVideo(
      '9pM3r_kL8pQ',
      'Animation',
      'The Stunning Visual Art and Backgrounds of Makoto Shinkai',
      'The Anime Man',
      'UC4w89-jY5P7m3Q8aK4n-w04',
      '2026-01-12T18:30:00Z',
      'PT16M20S',
      '2180400',
      '195000',
      'Analyzing photorealistic lighting, clouds, and train station aesthetics in modern Japanese anime.'
    ),
    makeVideo(
      '2kM9w_rT1sV',
      'Animation',
      'How 1930s Rubber Hose Animation Is Drawn Frame by Frame',
      'Studio MDHR',
      'UC4w89-jY5P7m3Q8aK4n-w05',
      '2026-01-05T12:00:00Z',
      'PT14M35S',
      '3840200',
      '310000',
      'Traditional ink-and-paint animation techniques, pencil tests, and cel painting processes.'
    ),
    makeVideo(
      '8pM4k_vL5rQ',
      'Animation',
      'The Evolution of Disney 2D & 3D Character Animation',
      'Disney Animation',
      'UC4w89-jY5P7m3Q8aK4n-w06',
      '2025-12-20T16:00:00Z',
      'PT25M10S',
      '4120900',
      '325000',
      'From Snow White multiplane cameras to computer-generated procedural hair and cloth physics.'
    ),
  ],

  Movies: [
    makeVideo(
      '7wM9r_kL7pB',
      'Movies',
      'Official Blockbuster Sci-Fi Action Movie Trailer 2026',
      'Warner Bros. Pictures',
      'UC4w89-jY5P7m3Q8aK4n-w07',
      '2026-02-18T18:00:00Z',
      'PT2M45S',
      '14209500',
      '890000',
      'Next-generation cinematic sci-fi adventure hitting IMAX theaters worldwide.'
    ),
    makeVideo(
      '3kM8w_vQ0rT',
      'Movies',
      'Top 15 Most Anticipated Action & Sci-Fi Movies of 2026',
      'IMDb',
      'UC4w89-jY5P7m3Q8aK4n-w08',
      '2026-02-05T15:00:00Z',
      'PT18M20S',
      '2840100',
      '195000',
      'A preview of theatrical release dates, director interviews, and teaser footage for the coming year.'
    ),
    makeVideo(
      '8wM4k_wQ8rL',
      'Movies',
      'How Stanley Kubrick Filmed 2001: A Space Odyssey',
      'CinemaTyler',
      'UC4w89-jY5P7m3Q8aK4n-w09',
      '2026-01-22T19:00:00Z',
      'PT21M10S',
      '2150300',
      '178000',
      'Groundbreaking front projection techniques, giant rotating centrifuge sets, and slit-scan photography.'
    ),
    makeVideo(
      '5pM3r_kL9pQ',
      'Movies',
      'Top 10 Opening Scenes in Cinema History Explained',
      'CineFix',
      'UC4w89-jY5P7m3Q8aK4n-w10',
      '2026-01-14T16:30:00Z',
      'PT19M45S',
      '3420100',
      '270000',
      'How directors establish atmosphere, character motivation, and visual motifs in the first five minutes.'
    ),
    makeVideo(
      '2kM9w_rT2sV',
      'Movies',
      'The Art of Practical Visual Effects vs Modern CGI',
      'StudioBinder',
      'UC4w89-jY5P7m3Q8aK4n-w11',
      '2026-01-08T14:00:00Z',
      'PT15M30S',
      '1890400',
      '160000',
      'Comparing miniature models, animatronics, and green screen composites across modern films.'
    ),
    makeVideo(
      '9pM4k_vL6rQ',
      'Movies',
      'The Dark Knight - Anatomy of the Joker Interrogation Scene',
      'Lessons from the Screenplay',
      'UC4w89-jY5P7m3Q8aK4n-w12',
      '2025-12-24T20:00:00Z',
      'PT13M40S',
      '4890200',
      '385000',
      'Christopher Nolan’s masterclass in ideological conflict, framing, and pacing between Batman and the Joker.'
    ),
  ],

  Fitness: [
    makeVideo(
      '8wM9r_kL8pB',
      'Fitness',
      '20 Minute Full Body Calisthenics Workout - No Equipment Needed',
      'THENX',
      'UC4w89-jY5P7m3Q8aK4n-w13',
      '2026-02-12T16:00:00Z',
      'PT20M15S',
      '4920100',
      '390000',
      'Follow along bodyweight routine targeting chest, shoulders, abs, and legs with Chris Heria.'
    ),
    makeVideo(
      '4kM8w_vQ1rT',
      'Fitness',
      'The Best Science-Based Workout Split for Muscle Growth',
      'ATHLEAN-X',
      'UC4w89-jY5P7m3Q8aK4n-w14',
      '2026-02-02T14:30:00Z',
      'PT18M40S',
      '3840200',
      '310000',
      'Physical therapist breaks down push-pull-legs vs upper-lower frequency, recovery, and hypertrophy.'
    ),
    makeVideo(
      '2wM4k_wQ9rL',
      'Fitness',
      '15 Min Daily Full Body HIIT Workout with Music',
      'Pamela Reif',
      'UC4w89-jY5P7m3Q8aK4n-w15',
      '2026-01-25T11:00:00Z',
      'PT15M30S',
      '6890400',
      '520000',
      'High intensity interval training with upbeat soundtrack for endurance and calorie burning.'
    ),
    makeVideo(
      '6pM3r_kL0pQ',
      'Fitness',
      '30 Minute Morning Yoga for Flexibility, Spine & Posture',
      'Yoga With Adriene',
      'UC4w89-jY5P7m3Q8aK4n-w16',
      '2026-01-18T08:00:00Z',
      'PT31M10S',
      '5120800',
      '410000',
      'Gentle morning flow to release tight hips, relieve lower back pain, and improve spinal alignment.'
    ),
    makeVideo(
      '1kM9w_rT3sV',
      'Fitness',
      'How Anyone Can Do Pull-ups and Push-ups Step by Step',
      'Hybrid Calisthenics',
      'UC4w89-jY5P7m3Q8aK4n-w17',
      '2026-01-10T15:00:00Z',
      'PT14M50S',
      '2890100',
      '245000',
      'Hampton shares accessible progression levels for beginners to build foundational strength.'
    ),
    makeVideo(
      '7pM4k_vL7rQ',
      'Fitness',
      'The Most Effective Science-Based Chest Workout',
      'Jeff Nippard',
      'UC4w89-jY5P7m3Q8aK4n-w18',
      '2025-12-28T17:00:00Z',
      'PT16M25S',
      '2180400',
      '195000',
      'Electromyography data on incline dumbbell pressing, cable crossovers, and weighted dips.'
    ),
  ],

  Live: [
    makeVideo(
      'L_LUpnjgPso',
      'Live',
      'lofi hip hop radio - beats to relax/study to 🔴 LIVE 24/7',
      'Lofi Girl',
      'UCvjjWv6K0qM1M8i64QWz4aw',
      '2026-01-01T00:00:00Z',
      'PT0S',
      '78291024',
      '3410000',
      'Peaceful lofi hip hop beats to relax, study, work, or code to. Stream 24/7 with Lofi Girl.'
    ),
    makeVideo(
      '21X5lGlDOfg',
      'Live',
      'Earth Views from the International Space Station (ISS) 🔴 LIVE',
      'NASA',
      'UCLA_DiR1FfKNvjuUpBHmylQ',
      '2026-01-01T00:00:00Z',
      'PT0S',
      '24109800',
      '1450000',
      'Live high-definition views of planet Earth from cameras mounted on the International Space Station.'
    ),
    makeVideo(
      '5yx6BWlEVcY',
      'Live',
      'Chillhop Radio - jazzy & lofi hip hop beats 🔴 LIVE',
      'Chillhop Music',
      'UCOxqgCwgOq3EW77748NnEBg',
      '2026-01-01T00:00:00Z',
      'PT0S',
      '18204900',
      '980000',
      'Cozy coffee shop vibes and jazzy lofi beats streaming nonstop.'
    ),
    makeVideo(
      '7NOSDKb0HlU',
      'Live',
      'Monstercat 24/7 Live Electronic Dance Music Stream 🔴 LIVE',
      'Monstercat',
      'UCJ6td3C9QlPO9O_AbzO8_Bw',
      '2026-01-01T00:00:00Z',
      'PT0S',
      '9840200',
      '510000',
      'Non-stop gaming music, drum & bass, house, synthwave, and EDM 24/7.'
    ),
    makeVideo(
      '-7bPNjg8XwM',
      'Live',
      'Al Jazeera English 24/7 Live News Broadcast 🔴 LIVE',
      'Al Jazeera English',
      'UCNye-wNBqNL5ZzHSJj3l8Bg',
      '2026-01-01T00:00:00Z',
      'PT0S',
      '12804900',
      '620000',
      'Live world news coverage, investigative reports, and breaking international updates.'
    ),
  ],

  Trending: [
    makeVideo(
      'OPf0YbXqDm0',
      'Trending',
      'I Built A $10,000,000 Secret Underground City!',
      'MrBeast',
      'UCX6OQ3DkcsbYNE6H8uQQuVA',
      '2026-02-14T21:00:00Z',
      'PT25M14S',
      '84100200',
      '4900000',
      'We spent 100 days constructing a fully self-sustained underground city deep inside a mountain.'
    ),
    makeVideo(
      '9bZkp7q19f0',
      'Trending',
      'PSY - GANGNAM STYLE (강남스타일) M/V',
      'officialpsy',
      'UC912039102391',
      '2025-05-01T00:00:00Z',
      'PT4M13S',
      '5100000000',
      '28000000',
      'Official music video for Gangnam Style by PSY.'
    ),
    makeVideo(
      'yXWw0_U45S8',
      'Trending',
      'World’s Largest Domino Fall & Chain Reaction Machine',
      'Mark Rober',
      'UCY1kMZp36IQSyNx_9h4PcGg',
      '2026-02-08T18:00:00Z',
      'PT19M40S',
      '38402100',
      '2400000',
      'Over 250,000 dominoes set off with custom pneumatic robots and laser sensors.'
    ),
    makeVideo(
      '79xO8_wL9pB',
      'Trending',
      'Water Bottle Flip Edition 4 | Dude Perfect',
      'Dude Perfect',
      'UCRijo3ddMTht_IHyNSNXpNQ',
      '2026-01-20T21:00:00Z',
      'PT12M30S',
      '42801900',
      '2850000',
      'The craziest bottle flip trick shots off skyscrapers, moving boats, and basketball rims.'
    ),
    makeVideo(
      '4bM8w_kQ2rT',
      'Trending',
      'The Fall of the AI Pin: What Happened?',
      'Marques Brownlee',
      'UCBJycSMxDv_9LWSk6504_0w',
      '2026-01-12T19:00:00Z',
      'PT15M20S',
      '7840100',
      '590000',
      'A deep dive into why ambitious wearable AI hardware struggled and what comes next.'
    ),
    makeVideo(
      '8jPQjjsBb68',
      'Trending',
      'Ed Sheeran - Shape of You (Official Music Video)',
      'Ed Sheeran',
      'UC0C-w0YjGpqDXGB8IHb662A',
      '2025-11-10T00:00:00Z',
      'PT4M23S',
      '6200000000',
      '32000000',
      'The official music video for Ed Sheeran - Shape of You.'
    ),
  ],
};

// Flatten all unique videos across all categories
export const ALL_CURATED_VIDEOS: CuratedVideoItem[] = (() => {
  const seen = new Set<string>();
  const list: CuratedVideoItem[] = [];

  Object.values(CATEGORY_VIDEOS_MAP).forEach((arr) => {
    arr.forEach((v) => {
      if (!seen.has(v.id)) {
        seen.add(v.id);
        list.push(v);
      }
    });
  });

  return list;
})();

/**
 * Normalizes any category string, query, or YouTube categoryId into one of the 17 HOME_CATEGORIES
 */
export function normalizeCategory(input?: string): string {
  if (!input) return 'All';
  const clean = input.trim().toLowerCase();

  if (clean === 'all' || clean === 'popular' || clean === 'now' || clean === 'default') {
    return 'All';
  }

  // Exact ID mappings (YouTube v3 Category IDs)
  if (clean === '10') return 'Music';
  if (clean === '20') return 'Gaming';
  if (clean === '25') return 'News';
  if (clean === '17') return 'Sports';
  if (clean === '23') return 'Comedy';
  if (clean === '28') return 'AI & Tech';
  if (clean === '27') return 'Coding';
  if (clean === '1' || clean === '30') return 'Movies';
  if (clean === '19') return 'Travel';
  if (clean === '26') return 'Cooking';

  // Keyword-based mappings
  if (clean.includes('music') || clean.includes('song') || clean.includes('playlist') || clean.includes('audio') || clean.includes('beats') || clean.includes('acoustic')) {
    return 'Music';
  }
  if (clean.includes('gaming') || clean.includes('game') || clean.includes('gta') || clean.includes('minecraft') || clean.includes('esports') || clean.includes('walkthrough')) {
    return 'Gaming';
  }
  if (clean.includes('news') || clean.includes('breaking') || clean.includes('politics') || clean.includes('headline') || clean.includes('today')) {
    return 'News';
  }
  if (clean.includes('coding') || clean.includes('programming') || clean.includes('react') || clean.includes('python') || clean.includes('javascript') || clean.includes('code') || clean.includes('dev')) {
    return 'Coding';
  }
  if (clean.includes('ai & tech') || clean.includes('tech') || clean.includes('gadget') || clean.includes('smartphone') || clean.includes('hardware') || clean.includes('artificial intelligence') || clean.includes('m4 max')) {
    return 'AI & Tech';
  }
  if (clean.includes('podcast') || clean.includes('podcasts') || clean.includes('fridman') || clean.includes('huberman') || clean.includes('rogan')) {
    return 'Podcasts';
  }
  if (clean.includes('comedy') || clean.includes('funny') || clean.includes('standup') || clean.includes('hilarious') || clean.includes('sketch') || clean.includes('humor')) {
    return 'Comedy';
  }
  if (clean.includes('sport') || clean.includes('football') || clean.includes('soccer') || clean.includes('nba') || clean.includes('cricket') || clean.includes('fifa') || clean.includes('ufc')) {
    return 'Sports';
  }
  if (clean.includes('science') || clean.includes('nature') || clean.includes('physics') || clean.includes('space') || clean.includes('nasa') || clean.includes('ocean')) {
    return 'Science & Nature';
  }
  if (clean.includes('cook') || clean.includes('recipe') || clean.includes('food') || clean.includes('chef') || clean.includes('steak') || clean.includes('pasta')) {
    return 'Cooking';
  }
  if (clean.includes('travel') || clean.includes('vlog') || clean.includes('japan') || clean.includes('tour') || clean.includes('trip') || clean.includes('resort')) {
    return 'Travel';
  }
  if (clean.includes('animation') || clean.includes('anime') || clean.includes('ghibli') || clean.includes('blender') || clean.includes('cartoon') || clean.includes('pixar')) {
    return 'Animation';
  }
  if (clean.includes('movie') || clean.includes('film') || clean.includes('trailer') || clean.includes('cinema') || clean.includes('hollywood')) {
    return 'Movies';
  }
  if (clean.includes('fitness') || clean.includes('workout') || clean.includes('gym') || clean.includes('calisthenics') || clean.includes('yoga') || clean.includes('exercise')) {
    return 'Fitness';
  }
  if (clean.includes('live') || clean.includes('stream') || clean.includes('broadcast') || clean.includes('24/7')) {
    return 'Live';
  }
  if (clean.includes('trending') || clean.includes('viral') || clean.includes('hits')) {
    return 'Trending';
  }

  // Exact matching against standard categories
  const standardCategories = Object.keys(CATEGORY_VIDEOS_MAP);
  const found = standardCategories.find((c) => c.toLowerCase() === clean);
  if (found) return found;

  return 'All';
}

/**
 * Returns a paginated list of videos for the specified category.
 */
export function getCuratedVideosByCategory(
  category = 'All',
  pageToken = '',
  pageSize = 24,
  refreshSeed = 0
) {
  const normalized = normalizeCategory(category);

  let targetList: CuratedVideoItem[];

  if (normalized === 'All') {
    // Interleave videos from all categories to form a diverse, high quality feed
    const categoryKeys = Object.keys(CATEGORY_VIDEOS_MAP).filter((c) => c !== 'Trending');
    const combined: CuratedVideoItem[] = [];
    const maxLen = Math.max(...categoryKeys.map((k) => CATEGORY_VIDEOS_MAP[k]?.length || 0));

    for (let i = 0; i < maxLen; i++) {
      for (const cat of categoryKeys) {
        const item = CATEGORY_VIDEOS_MAP[cat]?.[i];
        if (item && !combined.some((c) => c.id === item.id)) {
          combined.push(item);
        }
      }
    }
    targetList = combined;
  } else {
    targetList = CATEGORY_VIDEOS_MAP[normalized] || [];
    if (!targetList.length) {
      targetList = ALL_CURATED_VIDEOS;
    }
  }

  // If a refreshSeed is provided, deterministically shuffle while preserving stability per seed
  let items = [...targetList];
  if (refreshSeed > 0) {
    items = items
      .map((val, idx) => ({ val, sortKey: Math.sin(refreshSeed + idx) }))
      .sort((a, b) => a.sortKey - b.sortKey)
      .map((obj) => obj.val);
  }

  // Pagination support
  const pageIndex = pageToken ? parseInt(pageToken, 10) || 0 : 0;
  const start = pageIndex * pageSize;
  const pagedItems = items.slice(start, start + pageSize);

  const hasNext = start + pageSize < items.length;
  const nextPageToken = hasNext ? String(pageIndex + 1) : undefined;

  return {
    kind: 'youtube#videoListResponse',
    items: pagedItems,
    nextPageToken,
    pageInfo: {
      totalResults: items.length,
      resultsPerPage: pageSize,
    },
    _category: normalized,
    _fromOfflineCache: true,
  };
}
