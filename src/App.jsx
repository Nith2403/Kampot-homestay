import React, { useState, useEffect, useMemo } from 'react';
import { 
  subscribeToLiveVotes, 
  submitLiveVote, 
  getUserVotedStay, 
  setUserVotedStay, 
  getFirebaseDatabaseUrl, 
  setFirebaseDatabaseUrl 
} from './firebaseSync';

// Real Stay Data for Kampot
const INITIAL_STAYS = [
  {
    id: 'mr-pho',
    name: 'Mr Pho Homestay',
    category: 'homestay',
    categoryLabel: 'Creek Homestay',
    tag: 'Near the Creek · Budget Hero',
    tiktok: '@drxbybeautystore',
    location: 'Near the Creek · Kampot Riverside',
    price: 55,
    unitNote: '/ night',
    bbqText: '🔥 BBQ grill + coal: $5',
    totalWithBbq: '$60 total with BBQ',
    hasFreeBbq: false,
    capacity: '6–8 People',
    beds: '3 Beds',
    rooms: 'Modern White Cabins & Villa by Pool',
    description: 'A stylish white retreat near the Kampot creek featuring glass-front chalets, outdoor swimming pool & plunge bath, spacious courtyard, and evening BBQ setups under the open sky.',
    highlights: ['Outdoor Swimming Pool', 'Glass-Front Cabins & Villa', 'Near the Creek', 'Super Budget Friendly ($55)'],
    image: './mr-pho-homestay.png',
    votes: 0,
    shortlisted: true,
  },
  {
    id: 'pteas-phae',
    name: 'Pteas Phae Private',
    category: 'private',
    categoryLabel: 'Private Creek House',
    tag: 'Entire Creek House · Free BBQ',
    tiktok: '@pteasphe',

    location: 'Near the Creek · Kampot',
    price: 85,
    unitNote: '/ night',
    bbqText: '🔥 BBQ grill: FREE',
    totalWithBbq: '$85 (BBQ Included FREE)',
    hasFreeBbq: true,
    capacity: '6–8 People (Flexible)',
    beds: '3 Beds',
    rooms: '2 Private Rooms (Direct Deck Access)',
    description: 'An exclusive private waterside sanctuary nestled right on the creek. Features floor-to-ceiling sliding glass doors opening directly onto a private riverfront deck, 2 complete rooms, 3 beds, and a complimentary barbecue grill ready for cooking.',
    highlights: ['100% Free BBQ Grill', 'Floor-to-Ceiling Creek Deck View', '2 Private Rooms · 3 Beds', 'Complete Group Privacy'],
    image: './pteas-phae.png',
    votes: 0,
    shortlisted: true,
  },
  {
    id: 'nana-sky',
    name: 'Nana Sky Kampot Residence',
    category: 'residence',
    categoryLabel: 'Coastal Sky Residence',
    tag: 'Near the Beach · Panoramic Sky',
    tiktok: '@suytheayahoo.com',
    
    location: 'Near the Beach · Kampot Coastal Area',
    price: 108,
    unitNote: '$54/room × 2 rooms',
    bbqText: '🔥 BBQ grill: FREE',
    totalWithBbq: '$108 for 2 rooms',
    hasFreeBbq: true,
    capacity: 'Up to 6 People',
    beds: '2 Beds (+ Extra Mattress $10/set)',
    rooms: '2 Interconnected Rooms (Warm Timber & Balcony)',
    description: 'A charming 2-story yellow villa residence featuring illuminated evening verandas, polished wood ceilings, warm timber bedrooms, air conditioning, and a free BBQ grill near the beach.',
    highlights: ['Free BBQ Grill', 'Warm Wooden Ceilings & Floors', 'Close to Kampot Beach', 'Extra Mattress Available ($10)'],
    image: './nana-sky.jpg',
    votes: 0,
    shortlisted: true,
  }
];

export default function App() {
  const [stays, setStays] = useState(() => {
    const saved = localStorage.getItem('kampot_modern_stays_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return INITIAL_STAYS.map(stay => {
          const matched = parsed.find(p => p.id === stay.id);
          return matched ? { ...stay, votes: matched.votes, votedByUser: matched.votedByUser } : stay;
        });
      } catch (e) {}
    }
    return INITIAL_STAYS;
  });

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [toast, setToast] = useState('');
  const [firebaseUrl, setFirebaseUrl] = useState(() => getFirebaseDatabaseUrl());
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [modalInputUrl, setModalInputUrl] = useState('');

  // 1. Subscribe to Live Realtime Votes (Firebase + Multi-tab BroadcastChannel)
  useEffect(() => {
    // Restore this device's vote status
    const votedStayId = getUserVotedStay();
    if (votedStayId) {
      setStays(prev => prev.map(s => ({
        ...s,
        votedByUser: s.id === votedStayId
      })));
    }

    // Subscribe to live updates
    const unsubscribe = subscribeToLiveVotes((incomingVotes) => {
      if (!incomingVotes || typeof incomingVotes !== 'object') return;
      setStays(prev => prev.map(s => {
        if (typeof incomingVotes[s.id] === 'number') {
          return { ...s, votes: incomingVotes[s.id] };
        }
        return s;
      }));
    });

    return () => unsubscribe();
  }, [firebaseUrl]);

  useEffect(() => {
    localStorage.setItem('kampot_modern_stays_v2', JSON.stringify(stays));
  }, [stays]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  };

  const handleVote = async (id) => {
    const targetStay = stays.find(s => s.id === id);
    if (!targetStay) return;

    const isCurrentlyVoted = !!targetStay.votedByUser;
    const isAdding = !isCurrentlyVoted;
    const previousVotedId = getUserVotedStay();

    // Take snapshot of current votes
    let currentMap = stays.reduce((acc, s) => {
      acc[s.id] = s.votes;
      return acc;
    }, {});

    // If friend already had a vote on another stay, remove it first
    if (isAdding && previousVotedId && previousVotedId !== id) {
      currentMap = await submitLiveVote(previousVotedId, false, currentMap);
    }

    // Submit live vote to cloud and tabs
    const updatedMap = await submitLiveVote(id, isAdding, currentMap);
    setUserVotedStay(isAdding ? id : null);

    setStays(prev => prev.map(s => ({
      ...s,
      votes: typeof updatedMap[s.id] === 'number' ? updatedMap[s.id] : s.votes,
      votedByUser: isAdding ? s.id === id : false
    })));

    showToast(isAdding ? `🎉 Live vote cast for ${targetStay.name}!` : `Vote removed from ${targetStay.name}`);
  };

  const handleSaveFirebaseUrl = (urlToSave) => {
    setFirebaseDatabaseUrl(urlToSave);
    setFirebaseUrl(urlToSave);
    setIsCloudModalOpen(false);
    showToast(urlToSave ? '✅ Firebase Realtime DB connected live!' : 'Disconnected cloud sync (offline mode)');
  };

  const filteredStays = useMemo(() => {
    if (selectedFilter === 'all') return stays;
    return stays.filter(s => s.category === selectedFilter);
  }, [stays, selectedFilter]);

  const totalVotes = useMemo(() => stays.reduce((sum, s) => sum + s.votes, 0) || 1, [stays]);
  const sortedStays = useMemo(() => [...stays].sort((a, b) => b.votes - a.votes), [stays]);

  const handleExport = () => {
    let text = `========================================\n`;
    text += `🌴 KAMPOT ROAD TRIP STAY SELECTION 🌴\n`;
    text += `Destination: Kampot, Cambodia (Creek & Beach)\n`;
    text += `Travelers: 6–8 Adventurers\n`;
    text += `========================================\n\n`;
    stays.forEach((s, idx) => {
      text += `${idx + 1}. ${s.name} (${s.categoryLabel})\n`;
      text += `   Price: $${s.price} ${s.unitNote} · BBQ: ${s.bbqText}\n`;
      text += `   Location: ${s.location}\n`;
      text += `   Capacity: ${s.capacity} · Beds: ${s.beds}\n`;
      text += `   TikTok: ${s.tiktokUrl}\n`;
      text += `   Crew Votes: ${s.votes}\n\n`;
    });
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kampot-stay-agenda.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📥 Summary downloaded!');
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('📋 Trip link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#191C21] font-sans relative overflow-x-hidden selection:bg-matcha selection:text-[#191C21]">
      
      {/* =========================================================================
          BACKGROUND ORGANIC CURVED SHAPES (Inspired by the user's reference)
          ========================================================================= */}
      
      {/* Top Left / Center Matcha Green Wave */}
      <div className="absolute top-0 left-0 w-full pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <svg viewBox="0 0 1440 680" fill="none" className="w-full h-auto min-h-[380px] max-h-[580px] object-cover">
          <path 
            d="M0 0 H1440 V240 C1280 340, 1140 220, 940 280 C740 340, 680 520, 420 540 C200 560, 80 440, 0 490 Z" 
            fill="#BEE38B" 
            opacity="0.85"
          />
        </svg>
      </div>

      {/* Mid-Right Matcha Accent Wave */}
      <div className="absolute top-[1350px] right-0 w-[420px] h-[580px] pointer-events-none z-0 overflow-hidden hidden lg:block" aria-hidden="true">
        <svg viewBox="0 0 420 580" fill="none" className="w-full h-full">
          <path 
            d="M420 0 C240 80, 120 220, 180 380 C240 540, 360 520, 420 580 Z" 
            fill="#BEE38B" 
            opacity="0.75"
          />
        </svg>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 w-full pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <svg viewBox="0 0 1440 420" fill="none" className="w-full h-auto object-cover">
          <path 
            d="M0 240 C320 180, 580 380, 920 280 C1160 210, 1340 320, 1440 260 V420 H0 Z" 
            fill="#BEE38B" 
            opacity="0.7"
          />
        </svg>
      </div>

      {/* =========================================================================
          NAVIGATION BAR
          ========================================================================= */}
      <header className="relative z-20 max-w-7xl mx-auto px-6 sm:px-10 py-6 flex items-center justify-between">
        {/* Monogram Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#191C21] text-white flex items-center justify-center font-serif font-bold text-lg shadow-sm">
            KT
          </div>
          <div className="hidden sm:block">
            <span className="font-serif font-bold text-lg tracking-tight block leading-tight">Kampot Trip</span>
            <span className="text-[11px] font-semibold text-dark-muted tracking-wider uppercase">Creek & Beach 2026</span>
          </div>
        </div>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#191C21]/90">
          <a href="#overview" className="hover:text-terracotta transition-colors">Overview</a>
          <a href="#stays" className="hover:text-terracotta transition-colors">Accommodations</a>
          <a href="#comparison" className="hover:text-terracotta transition-colors">Comparison</a>
          <a href="#leaderboard" className="hover:text-terracotta transition-colors">Crew Poll</a>
        </nav>

        {/* CTA Button */}
        <div className="flex items-center gap-3">
          <a 
            href="#stays" 
            className="bg-white/90 hover:bg-white text-[#191C21] border border-[#191C21]/20 font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-sm hover:shadow transition-all"
          >
            Review Stays ({stays.length})
          </a>
          <a 
            href="#leaderboard" 
            className="bg-terracotta hover:bg-terracotta-hover text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-sm hover:shadow transition-all"
          >
            Vote Now 🗳️
          </a>
        </div>
      </header>

      {/* =========================================================================
          HERO SECTION (Matching reference composition)
          ========================================================================= */}
      <section id="overview" className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pt-10 pb-20 sm:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Block */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/80 border border-[#191C21]/15 px-4 py-1 rounded-full text-xs font-semibold text-[#191C21] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse"></span>
              <span>Weekend Road Trip Planning</span>
            </div>

            <h1 className="font-serif font-bold text-5xl sm:text-6xl md:text-7xl text-[#191C21] tracking-tight leading-[1.08]">
              Rest &<br />
              Recharge<br />
              <span className="italic font-normal">in Kampot</span>
            </h1>

            <p className="text-[#191C21]/80 text-base sm:text-lg leading-relaxed max-w-md font-normal">
              Compare handpicked riverside homestays, private creek houses, and coastal residences. Relax by the flowing water, light the evening BBQ, and vote together with the travel crew.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a 
                href="#stays" 
                className="bg-terracotta hover:bg-terracotta-hover text-white font-semibold text-sm px-8 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all"
              >
                Explore Stays ↓
              </a>
              <a 
                href="#comparison" 
                className="bg-white/90 hover:bg-white text-[#191C21] border border-[#191C21]/20 font-semibold text-sm px-7 py-3.5 rounded-full shadow-sm hover:shadow transition-all"
              >
                Compare Side-by-Side
              </a>
            </div>

            {/* Quick Trip Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#191C21]/10 text-xs sm:text-sm">
              <div>
                <span className="block font-bold text-xl sm:text-2xl text-[#191C21] font-serif">3</span>
                <span className="text-dark-muted font-medium">Curated Stays</span>
              </div>
              <div>
                <span className="block font-bold text-xl sm:text-2xl text-[#191C21] font-serif">6–8</span>
                <span className="text-dark-muted font-medium">Adventurers</span>
              </div>
              <div>
                <span className="block font-bold text-xl sm:text-2xl text-[#191C21] font-serif">FREE</span>
                <span className="text-dark-muted font-medium">BBQ Options</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual (Line Art House & Natural Greenery inspired by the reference) */}
          <div className="lg:col-span-7 relative flex justify-center">
            
            {/* Architectural House Line-Art SVG Illustration with plants & porch */}
            <div className="relative w-full max-w-lg lg:max-w-xl">
              <svg viewBox="0 0 600 500" fill="none" className="w-full h-auto drop-shadow-sm">
                
                {/* House Base Platform / Porch */}
                <polygon points="120,380 320,440 540,350 340,300" fill="#FFFFFF" stroke="#191C21" strokeWidth="3" strokeLinejoin="round"/>
                
                {/* Steps leading up */}
                <polygon points="110,400 160,415 160,425 110,410" fill="#FDFBF7" stroke="#191C21" strokeWidth="2.5" strokeLinejoin="round"/>
                <polygon points="125,418 175,433 175,443 125,428" fill="#FDFBF7" stroke="#191C21" strokeWidth="2.5" strokeLinejoin="round"/>
                
                {/* Main House Cube */}
                <polygon points="200,160 380,110 520,170 340,230" fill="#FFFFFF" stroke="#191C21" strokeWidth="3" strokeLinejoin="round"/>
                <polygon points="200,160 340,230 340,370 200,290" fill="#FFFFFF" stroke="#191C21" strokeWidth="3" strokeLinejoin="round"/>
                <polygon points="340,230 520,170 520,300 340,370" fill="#FBF7EE" stroke="#191C21" strokeWidth="3" strokeLinejoin="round"/>

                {/* Overhang Roof */}
                <polygon points="170,150 380,90 550,160 340,230" fill="#FFFFFF" stroke="#191C21" strokeWidth="3.5" strokeLinejoin="round"/>

                {/* Big Glass Door & Interior */}
                <polygon points="230,210 320,250 320,350 230,300" fill="#F6EFE3" stroke="#191C21" strokeWidth="2.5" strokeLinejoin="round"/>
                <polygon points="275,230 320,250 320,350 275,325" fill="#E8DCC8" stroke="#191C21" strokeWidth="2"/>
                
                {/* Interior Furniture Silhouette */}
                <rect x="245" y="270" width="20" height="24" rx="3" fill="#FA6D53" stroke="#191C21" strokeWidth="1.5"/>
                <circle cx="280" cy="275" r="8" fill="#BEE38B" stroke="#191C21" strokeWidth="1.5"/>

                {/* Large Window on the Side */}
                <polygon points="370,230 430,205 430,260 370,285" fill="#FFFFFF" stroke="#191C21" strokeWidth="2.5" strokeLinejoin="round"/>
                <polygon points="450,195 500,175 500,230 450,250" fill="#FFFFFF" stroke="#191C21" strokeWidth="2.5" strokeLinejoin="round"/>

                {/* Terrace Lounger / Traveler Silhouette */}
                <ellipse cx="250" cy="360" rx="30" ry="16" fill="#FDFBF7" stroke="#191C21" strokeWidth="2.5"/>
                <circle cx="245" cy="335" r="9" fill="#FA6D53" stroke="#191C21" strokeWidth="2"/>
                <path d="M245 344 C245 355, 255 365, 265 365" stroke="#191C21" strokeWidth="3" strokeLinecap="round"/>

                {/* Coffee Mug on Little Table */}
                <rect x="210" y="340" width="16" height="12" rx="2" fill="#FFFFFF" stroke="#191C21" strokeWidth="2"/>
                <path d="M218 335 Q220 330 218 325" stroke="#191C21" strokeWidth="1.5" strokeLinecap="round"/>

                {/* Lush Tropical Foliage & Plants around the House */}
                {/* Tall Palm / Strelitzia Leaves (Left) */}
                <path d="M140 280 Q170 230 200 240 Q180 270 140 280 Z" fill="#4E8C5A" stroke="#191C21" strokeWidth="2.5"/>
                <path d="M150 290 Q120 220 150 200 Q170 250 150 290 Z" fill="#65A66E" stroke="#191C21" strokeWidth="2.5"/>
                <path d="M160 310 Q190 270 210 290 Q180 320 160 310 Z" fill="#88C488" stroke="#191C21" strokeWidth="2.5"/>

                {/* Plant Pot on Terrace (Right) */}
                <polygon points="460,370 480,370 475,410 465,410" fill="#FA6D53" stroke="#191C21" strokeWidth="2.5"/>
                {/* Big Broad Leaves */}
                <path d="M470 370 Q430 330 450 290 Q490 320 470 370 Z" fill="#4E8C5A" stroke="#191C21" strokeWidth="2.5"/>
                <path d="M470 370 Q510 320 520 280 Q480 310 470 370 Z" fill="#65A66E" stroke="#191C21" strokeWidth="2.5"/>
                <path d="M470 370 Q470 300 480 260 Q500 310 470 370 Z" fill="#88C488" stroke="#191C21" strokeWidth="2.5"/>
                <circle cx="455" cy="300" r="5" fill="#FA6D53"/>
                <circle cx="490" cy="270" r="4" fill="#FFE57F"/>

                {/* Little organic tuft */}
                <path d="M300 460 Q305 450 310 460 Q315 450 320 460" stroke="#191C21" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>

          </div>
        </div>
      </section>



      {/* =========================================================================
          SECTION: CONTINUOUS SCROLLING STAYS SHOWCASE (The Core Content)
          ========================================================================= */}
      <section id="stays" className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-16">
        <div className="mb-12">
          <div className="inline-block text-xs font-bold uppercase tracking-widest text-dark-muted mb-2">
            Detailed Accommodation Guide
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-5xl text-[#191C21]">
            Our 3 Choices for Kampot
          </h2>
          <p className="text-dark-muted text-sm sm:text-base max-w-2xl mt-2">
            Scroll down to review each location, pricing breakdown, BBQ perks, bed counts, and watch video tours on TikTok before voting.
          </p>
        </div>

        {/* Generous Full-Width Scrolling Rows */}
        <div className="space-y-16 sm:space-y-24">
          {filteredStays.map((stay, index) => (
            <article 
              key={stay.id} 
              id={stay.id}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-white p-6 sm:p-10 rounded-3xl border border-[#191C21]/15 shadow-sm hover:shadow-card transition-all"
            >
              
              {/* Photo Showcase (Alternates left/right on desktop) */}
              <div className={`lg:col-span-6 relative ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="relative h-[320px] sm:h-[400px] rounded-2xl overflow-hidden shadow-sm group">
                  <img 
                    src={stay.image} 
                    alt={stay.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  {/* Category Pill Over Image */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm border border-[#191C21]/15 px-4 py-1.5 rounded-full text-xs font-bold text-[#191C21] shadow-sm">
                    {stay.categoryLabel}
                  </div>

                  {/* Rating Tag */}
                  <div className="absolute top-4 right-4 bg-[#FAF5ED] border border-[#191C21]/15 px-3 py-1 rounded-full text-xs font-extrabold text-[#191C21] shadow-sm">
                    ★ {stay.rating} ({stay.reviews})
                  </div>

                  {/* TikTok Review Button */}
                  <a 
                    href={stay.tiktokUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="absolute bottom-4 left-4 bg-[#191C21]/90 hover:bg-[#191C21] text-white backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-2 shadow-md hover:scale-105 transition-all"
                  >
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.35 0 .68.07.99.19V8.98a6.34 6.34 0 0 0-.99-.08 6.34 6.34 0 1 0 6.33 6.34V8.58c1.3.93 2.88 1.48 4.6 1.54V6.75a4.87 4.87 0 0 1-.83-.06z"/>
                    </svg>
                    <span>Watch {stay.tiktok} on TikTok ↗</span>
                  </a>
                </div>
              </div>

              {/* Text Information Column */}
              <div className={`lg:col-span-6 space-y-5 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                
                {/* Tag & Location */}
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-terracotta">
                    {stay.tag}
                  </div>
                  <h3 className="font-serif font-bold text-3xl sm:text-4xl text-[#191C21]">
                    {stay.name}
                  </h3>
                  <div className="text-xs sm:text-sm text-dark-muted font-medium flex items-center gap-1.5 pt-1">
                    <span>📍</span> {stay.location}
                  </div>
                </div>

                {/* BBQ Highlight Deal Callout */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  stay.hasFreeBbq 
                    ? 'bg-[#BEE38B]/25 border-[#9AC662] text-[#191C21]' 
                    : 'bg-terracotta-soft border-terracotta/30 text-[#191C21]'
                }`}>
                  <div>
                    <span className="font-bold text-sm block">{stay.bbqText}</span>
                    <span className="text-xs opacity-80">{stay.totalWithBbq}</span>
                  </div>
                  <span className="text-xl">{stay.hasFreeBbq ? '🎁' : '🥩'}</span>
                </div>

                {/* Specs Badge Pills */}
                <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#191C21]">
                  <span className="bg-[#FAF5ED] border border-[#191C21]/15 px-3 py-1 rounded-full">
                    👥 {stay.capacity}
                  </span>
                  <span className="bg-[#FAF5ED] border border-[#191C21]/15 px-3 py-1 rounded-full">
                    🛏️ {stay.beds}
                  </span>
                  <span className="bg-[#FAF5ED] border border-[#191C21]/15 px-3 py-1 rounded-full">
                    🏠 {stay.rooms}
                  </span>
                </div>

                {/* Description */}
                <p className="text-[#191C21]/80 text-sm leading-relaxed">
                  {stay.description}
                </p>

                {/* Key Inclusions Checklist */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {stay.highlights.map((h, i) => (
                    <div key={i} className="text-xs font-medium text-[#191C21]/90 flex items-center gap-1.5">
                      <span className="text-matcha-dark font-bold">✓</span> {h}
                    </div>
                  ))}
                </div>

                {/* Pricing & Vote Button Bar */}
                <div className="pt-5 border-t border-[#191C21]/10 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-serif font-bold text-3xl text-[#191C21]">${stay.price}</span>
                      <span className="text-xs text-dark-muted font-medium">{stay.unitNote}</span>
                    </div>
                    <div className="text-[11px] text-dark-muted">
                      Estimated ~${Math.round((stay.price * 2) / 6)}/person for 2 nights (6 guests)
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleVote(stay.id)}
                      className={`px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2 ${
                        stay.votedByUser
                          ? 'bg-terracotta text-white shadow-md'
                          : 'bg-[#191C21] hover:bg-terracotta text-white'
                      }`}
                    >
                      <span>🗳️</span>
                      <span>{stay.votedByUser ? 'You Voted!' : 'Vote for this'} ({stay.votes})</span>
                    </button>
                  </div>
                </div>

              </div>

            </article>
          ))}
        </div>
      </section>



      {/* =========================================================================
          SECTION: HEAD-TO-HEAD COMPARISON TABLE
          ========================================================================= */}
      <section id="comparison" className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#191C21] mb-2">
            Side-by-Side Comparison
          </h2>
          <p className="text-dark-muted text-sm">
            Everything at a glance to make picking our spot seamless.
          </p>
        </div>

        <div className="overflow-x-auto bg-white rounded-3xl border border-[#191C21]/15 shadow-sm p-6">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-[#191C21]/15">
                <th className="py-4 px-4 font-serif font-bold text-base text-[#191C21]">Criteria</th>
                {stays.map(s => (
                  <th key={s.id} className="py-4 px-4 font-serif font-bold text-base text-[#191C21] min-w-[200px]">
                    {s.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#191C21]/10">
              <tr>
                <td className="py-3 px-4 font-semibold text-dark-muted">Nightly Rate</td>
                {stays.map(s => (
                  <td key={s.id} className="py-3 px-4 font-serif font-bold text-lg text-[#191C21]">
                    ${s.price} <span className="text-xs font-normal text-dark-muted">{s.unitNote}</span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-dark-muted">🔥 BBQ Deal</td>
                {stays.map(s => (
                  <td key={s.id} className="py-3 px-4 font-bold text-xs">
                    <span className={`px-2.5 py-1 rounded-full ${s.hasFreeBbq ? 'bg-matcha-light text-[#191C21]' : 'bg-terracotta-soft text-terracotta'}`}>
                      {s.bbqText}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-dark-muted">Capacity & Beds</td>
                {stays.map(s => (
                  <td key={s.id} className="py-3 px-4">
                    👥 {s.capacity}<br />🛏️ {s.beds}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-dark-muted">Location</td>
                {stays.map(s => (
                  <td key={s.id} className="py-3 px-4">📍 {s.location}</td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-dark-muted">TikTok Video Review</td>
                {stays.map(s => (
                  <td key={s.id} className="py-3 px-4">
                    <a href={s.tiktokUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-xs bg-[#191C21] text-white px-3 py-1 rounded-full">
                      <span>🎵 {s.tiktok} ↗</span>
                    </a>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-dark-muted">Crew Votes</td>
                {stays.map(s => (
                  <td key={s.id} className="py-3 px-4">
                    <button
                      onClick={() => handleVote(s.id)}
                      className={`px-4 py-1.5 rounded-full font-bold text-xs transition-all ${
                        s.votedByUser ? 'bg-terracotta text-white' : 'bg-[#FAF5ED] hover:bg-terracotta hover:text-white border border-[#191C21]/15'
                      }`}
                    >
                      🗳️ Vote ({s.votes})
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================================================================
          SECTION: CREW POLL LEADERBOARD
          ========================================================================= */}
      <section id="leaderboard" className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-16">
        <div className="bg-[#FAF5ED] rounded-3xl p-8 sm:p-12 border border-[#191C21]/15 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="max-w-2xl">
              <div className="inline-block bg-white border border-[#191C21]/15 px-3.5 py-1 rounded-full text-xs font-bold text-[#191C21] mb-2">
                🗳️ Travel Crew Decision Poll
              </div>
              <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#191C21]">
                Live Voting Leaderboard
              </h2>
              <p className="text-dark-muted text-sm mt-1">
                Every member of our trip gets to vote for their favorite place. The top choice wins!
              </p>
            </div>

            {/* Cloud Sync Status Pill */}
            <div className="shrink-0">
              {firebaseUrl ? (
                <button 
                  onClick={() => { setModalInputUrl(firebaseUrl); setIsCloudModalOpen(true); }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold shadow-sm transition-all"
                  title="Click to manage Firebase Realtime DB"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>🟢 Cloud Live Sync: Active</span>
                  <span className="text-[11px] opacity-70">⚙️</span>
                </button>
              ) : (
                <button 
                  onClick={() => { setModalInputUrl(''); setIsCloudModalOpen(true); }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold shadow-sm transition-all"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>☁️ Connect Firebase DB</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {sortedStays.map((stay, idx) => {
              const pct = Math.round((stay.votes / totalVotes) * 100);
              const medals = ['🥇', '🥈', '🥉'];

              return (
                <div 
                  key={stay.id} 
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-[#191C21]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow transition-all"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-9 h-9 rounded-full bg-[#FAF5ED] border border-[#191C21]/15 flex items-center justify-center text-base shrink-0">
                      {medals[idx]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-serif font-bold text-lg text-[#191C21]">{stay.name}</span>
                        <span className="text-xs font-bold text-terracotta">{stay.votes} votes ({pct}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#FAF5ED] rounded-full overflow-hidden border border-[#191C21]/10">
                        <div 
                          className="h-full bg-matcha rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleVote(stay.id)}
                    className={`px-5 py-2 rounded-full font-bold text-xs transition-all shrink-0 ${
                      stay.votedByUser
                        ? 'bg-terracotta text-white'
                        : 'bg-[#191C21] text-white hover:bg-terracotta'
                    }`}
                  >
                    {stay.votedByUser ? '✓ Voted' : '+ Cast Vote'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOOTER (Matching reference bottom with organic matcha green wave)
          ========================================================================= */}
      <footer className="relative z-10 pt-16 pb-12 text-center text-xs sm:text-sm text-[#191C21]">
        <div className="max-w-xl mx-auto px-6 space-y-4">
          <div className="w-10 h-10 rounded-full bg-[#191C21] text-white flex items-center justify-center font-serif font-bold text-lg mx-auto shadow-sm">
            KT
          </div>
          <h3 className="font-serif font-bold text-2xl text-[#191C21]">
            Ready to book our Kampot retreat?
          </h3>
          <p className="text-dark-muted text-xs leading-relaxed">
            Download our complete stay summary or copy the link to share with everyone in the road trip group.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2 font-semibold">
            <button 
              onClick={handleExport}
              className="bg-terracotta hover:bg-terracotta-hover text-white px-6 py-2.5 rounded-full shadow-sm hover:shadow transition-all text-xs"
            >
              📥 Download Summary (.txt)
            </button>
            <button 
              onClick={handleCopyLink}
              className="bg-white hover:bg-[#FAF5ED] text-[#191C21] border border-[#191C21]/20 px-6 py-2.5 rounded-full shadow-sm hover:shadow transition-all text-xs"
            >
              🔗 Copy Share Link
            </button>
          </div>
          <div className="text-[11px] text-dark-muted/80 pt-6">
            Kampot Road Trip 2026 · Handcrafted for smooth scrolling & memorable rest stops
          </div>
        </div>
      </footer>

      {/* Firebase Cloud Sync Modal */}
      {isCloudModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#191C21]/15 shadow-2xl relative">
            <button 
              onClick={() => setIsCloudModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FAF5ED] text-[#191C21] font-bold flex items-center justify-center hover:bg-terracotta hover:text-white transition-colors text-sm"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-matcha-light flex items-center justify-center text-xl">
                ☁️
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-[#191C21]">Firebase Realtime Sync</h3>
                <p className="text-xs text-dark-muted">Live synchronization across all phones & devices</p>
              </div>
            </div>

            <p className="text-xs text-dark-muted leading-relaxed mb-4">
              When connected, anyone who opens your website link on their phone will see votes update live across all screens instantly.
            </p>

            <div className="bg-[#FAF5ED] rounded-2xl p-4 border border-[#191C21]/10 text-xs text-[#191C21] space-y-2 mb-4">
              <p className="font-bold text-[#191C21]">📋 How to get your free database in 1 minute:</p>
              <ol className="list-decimal list-inside space-y-1 text-dark-muted">
                <li>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-terracotta underline font-semibold">console.firebase.google.com</a> &amp; click <strong>Add Project</strong>.</li>
                <li>In the left menu, click <strong>Build &gt; Realtime Database</strong>.</li>
                <li>Click <strong>Create Database</strong>, select <strong>Start in Test Mode</strong>, and copy your Database URL.</li>
              </ol>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#191C21]">
                Firebase Database URL:
              </label>
              <input 
                type="url"
                value={modalInputUrl}
                onChange={(e) => setModalInputUrl(e.target.value)}
                placeholder="https://your-project-default-rtdb.firebaseio.com"
                className="w-full text-xs px-4 py-3 rounded-xl border border-[#191C21]/20 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta bg-[#FDFBF7]"
              />

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleSaveFirebaseUrl(modalInputUrl)}
                  className="flex-1 bg-terracotta hover:bg-terracotta-hover text-white font-bold py-2.5 rounded-full text-xs shadow-sm transition-all"
                >
                  Save &amp; Connect Live
                </button>
                {firebaseUrl && (
                  <button
                    onClick={() => handleSaveFirebaseUrl('')}
                    className="px-4 py-2.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-all"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#191C21] text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-xl transition-all duration-300 pointer-events-none z-50 ${
        toast ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
      }`}>
        {toast}
      </div>

    </div>
  );
}
