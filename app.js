/**
 * Kampot Road Trip Stays & Villas Selection Planner
 * Customized for: Mr Pho Homestay, Pteas Phae Private, Nana Sky Kampot Residence
 */

const CURRENT_DATA_VERSION = 'kampot_trip_v2';

// 3 Real Accommodations from User
const INITIAL_STAYS = [
  {
    id: 'stay-mr-pho',
    name: 'Mr Pho Homestay',
    category: 'homestay',
    categoryLabel: 'Homestay',
    tag: '🌿 Near the Creek · Budget Hero',
    tiktok: '@mrphohomestay',
    tiktokUrl: 'https://www.tiktok.com/search?q=Mr+Pho+Homestay+Kampot',
    rating: 4.88,
    reviewCount: 42,
    location: 'Near the Creek · Kampot Riverside',
    basePrice: 55,
    pricePerNight: 55,
    bbqCost: 5,
    bbqText: '🔥 BBQ grill + coal: $5',
    totalWithBbq: 60,
    hasFreeBbq: false,
    guests: '6–8',
    guestsMax: 8,
    bedrooms: 2,
    beds: 3,
    baths: 2,
    description: 'Charming, authentic riverside homestay right beside the creek. Relax on breezy wooden decks, listen to the flowing water, and enjoy an evening barbecue with the crew under starry skies.',
    amenities: ['creek', 'bbq', 'wifi', 'kitchen'],
    amenityLabels: ['🌊 Right by the Creek', '🔥 BBQ Grill & Coal ($5)', '🛏️ 3 Cozy Beds', '⚡ Wi-Fi', '🍳 Shared Kitchenette'],
    image: './mr-pho-homestay.png',
    votes: 0,
    shortlisted: true,
    hostNote: 'Total with BBQ grill & coal is just $60! Perfect for groups of 6–8 looking for a peaceful riverside chillout.',
    extraInfo: 'Total with BBQ: $60'
  },
  {
    id: 'stay-pteas-phae',
    name: 'Pteas Phae Private',
    category: 'private',
    categoryLabel: 'Private Retreat',
    tag: '🛶 Creekfront · Free BBQ',
    tiktok: '@pteasphaeprivate',
    tiktokUrl: 'https://www.tiktok.com/search?q=Pteas+Phae+Kampot',
    rating: 4.95,
    reviewCount: 36,
    location: 'Near the Creek · Kampot',
    basePrice: 85,
    pricePerNight: 85,
    unitPriceNote: '/ night',
    bbqCost: 0,
    bbqText: '🔥 BBQ grill: FREE',
    totalWithBbq: 85,
    hasFreeBbq: true,
    guests: '6–8',
    guestsMax: 8,
    bedrooms: 2,
    beds: 3,
    baths: 2,
    description: 'Exclusive private sanctuary nestled on the creek with 2 full rooms and 3 beds. Features a private waterside patio, free barbecue grill ready for cooking, and complete privacy for your road trip team.',
    amenities: ['creek', 'bbq', 'wifi', 'kitchen'],
    amenityLabels: ['🛶 Creekfront Private Deck', '🔥 FREE BBQ Grill', '🏠 2 Private Rooms', '🛏️ 3 Beds', '🍃 Lush Garden'],
    image: './pteas-phae.png',
    votes: 0,
    shortlisted: true,
    hostNote: 'BBQ grill is 100% FREE! 2 private rooms with 3 beds make this an incredible value for groups.',
    extraInfo: '2 Rooms · BBQ: FREE'
  },
  {
    id: 'stay-nana-sky',
    name: 'Nana Sky Kampot Residence',
    category: 'residence',
    categoryLabel: 'Residence',
    tag: '🏖️ Near the Beach · Panoramic Sky',
    tiktok: '@nanaskykampot',
    tiktokUrl: 'https://www.tiktok.com/search?q=Nana+Sky+Kampot+Residence',
    rating: 4.92,
    reviewCount: 51,
    location: 'Near the Beach · Kampot Coastal Area',
    basePrice: 108,
    pricePerNight: 108,
    unitPriceNote: '$54/room × 2 rooms',
    bbqCost: 0,
    bbqText: '🔥 BBQ grill: FREE',
    totalWithBbq: 108,
    hasFreeBbq: true,
    guests: 'Up to 6',
    guestsMax: 6,
    bedrooms: 2,
    beds: 2,
    baths: 2,
    description: 'Modern, breezy coastal residence near the beach offering 2 interconnected scenic rooms ($54/room = $108 total). Enjoy cool ocean breezes, complimentary BBQ grill facilities, and flexible bedding.',
    amenities: ['beach', 'bbq', 'wifi', 'kitchen'],
    amenityLabels: ['🏖️ Near the Beach', '🔥 FREE BBQ Grill', '🏠 2 Rooms ($54/rm)', '🛏️ Extra Mattress ($10/set)', '🌅 Sunset Rooftop'],
    image: './nana-sky.jpg',
    votes: 0,
    shortlisted: true,
    hostNote: 'Includes 2 full rooms for $108 ($54/room). Free BBQ grill provided. Extra mattress sets available for only $10/set.',
    extraInfo: '2 Rooms = $108 · Extra mattress: $10/set'
  }
];

// Initial Trip Config for Kampot
const INITIAL_TRIP_CONFIG = {
  title: 'Kampot Road Trip Agenda',
  subtitle: 'Adventure Starts With Planning: Choose Our Stay',
  badge: '@kampottrip2026',
  host: 'Road Trip Crew & Friends',
  destination: 'Kampot, Cambodia (Creek & Beach)',
  dates: 'Upcoming Weekend Trip (2 Nights)',
  nights: 2,
  guests: 6
};

// Application Class
class TripPlannerApp {
  constructor() {
    this.checkVersion();
    this.stays = this.loadStays();
    this.tripConfig = this.loadConfig();
    this.currentCategory = 'all';
    this.activeAmenities = new Set();
    this.currentSort = 'recommended';
    
    this.initElements();
    this.bindEvents();
    this.render();
  }

  checkVersion() {
    const version = localStorage.getItem('trip_data_version');
    if (version !== CURRENT_DATA_VERSION) {
      localStorage.setItem('trip_data_version', CURRENT_DATA_VERSION);
      localStorage.setItem('trip_stays_data', JSON.stringify(INITIAL_STAYS));
      localStorage.setItem('trip_config_data', JSON.stringify(INITIAL_TRIP_CONFIG));
    }
  }

  loadStays() {
    const saved = localStorage.getItem('trip_stays_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved stays:', e);
      }
    }
    return INITIAL_STAYS;
  }

  saveStays() {
    localStorage.setItem('trip_stays_data', JSON.stringify(this.stays));
  }

  loadConfig() {
    const saved = localStorage.getItem('trip_config_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved config:', e);
      }
    }
    return INITIAL_TRIP_CONFIG;
  }

  saveConfig() {
    localStorage.setItem('trip_config_data', JSON.stringify(this.tripConfig));
  }

  initElements() {
    // Header
    this.tripBadgeText = document.getElementById('tripBadgeText');
    this.tripMainTitle = document.getElementById('tripMainTitle');
    this.tripSubtitleText = document.getElementById('tripSubtitleText');
    this.tripHostName = document.getElementById('tripHostName');
    this.metaDestination = document.getElementById('metaDestination');
    this.metaDates = document.getElementById('metaDates');
    this.metaGuests = document.getElementById('metaGuests');
    this.compareCount = document.getElementById('compareCount');
    
    // Category Counts
    this.countAll = document.getElementById('countAll');
    this.countVilla = document.getElementById('countVilla');
    this.countRoom = document.getElementById('countRoom');
    this.countResidence = document.getElementById('countResidence');

    // Controls
    this.tabButtons = document.querySelectorAll('.tab-btn');
    this.amenityChips = document.querySelectorAll('.chip');
    this.sortSelect = document.getElementById('sortSelect');
    this.staysGrid = document.getElementById('staysGrid');
    this.emptyState = document.getElementById('emptyState');
    this.resetFiltersBtn = document.getElementById('resetFiltersBtn');
    this.leaderboardContainer = document.getElementById('leaderboardContainer');

    // Modals
    this.detailModal = document.getElementById('detailModal');
    this.detailModalContent = document.getElementById('detailModalContent');
    this.closeDetailModalBtn = document.getElementById('closeDetailModalBtn');

    this.comparisonModal = document.getElementById('comparisonModal');
    this.comparisonTableWrapper = document.getElementById('comparisonTableWrapper');
    this.openComparisonBtn = document.getElementById('openComparisonBtn');
    this.closeComparisonModalBtn = document.getElementById('closeComparisonModalBtn');

    this.editTripModal = document.getElementById('editTripModal');
    this.editTripBtn = document.getElementById('editTripBtn');
    this.closeEditModalBtn = document.getElementById('closeEditModalBtn');
    this.cancelEditTripBtn = document.getElementById('cancelEditTripBtn');
    this.tripConfigForm = document.getElementById('tripConfigForm');

    this.addStayModal = document.getElementById('addStayModal');
    this.addNewStayBtn = document.getElementById('addNewStayBtn');
    this.closeAddStayModalBtn = document.getElementById('closeAddStayModalBtn');
    this.cancelAddStayBtn = document.getElementById('cancelAddStayBtn');
    this.addStayForm = document.getElementById('addStayForm');

    // Footer actions
    this.exportPlanBtn = document.getElementById('exportPlanBtn');
    this.sharePlanBtn = document.getElementById('sharePlanBtn');
    this.toast = document.getElementById('toast');
  }

  bindEvents() {
    // Category Tabs
    this.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.category;
        this.tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategory = cat;
        this.renderStays();
      });
    });

    // Amenity Chips
    this.amenityChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const amenity = chip.dataset.amenity;
        if (this.activeAmenities.has(amenity)) {
          this.activeAmenities.delete(amenity);
          chip.classList.remove('active');
        } else {
          this.activeAmenities.add(amenity);
          chip.classList.add('active');
        }
        this.renderStays();
      });
    });

    // Sort Dropdown
    this.sortSelect.addEventListener('change', (e) => {
      this.currentSort = e.target.value;
      this.renderStays();
    });

    // Reset Filters
    this.resetFiltersBtn.addEventListener('click', () => {
      this.currentCategory = 'all';
      this.activeAmenities.clear();
      this.tabButtons.forEach(b => b.classList.toggle('active', b.dataset.category === 'all'));
      this.amenityChips.forEach(c => c.classList.remove('active'));
      this.renderStays();
    });

    // Modals Close handlers
    this.closeDetailModalBtn.addEventListener('click', () => this.closeModal(this.detailModal));
    this.closeComparisonModalBtn.addEventListener('click', () => this.closeModal(this.comparisonModal));
    this.closeEditModalBtn.addEventListener('click', () => this.closeModal(this.editTripModal));
    this.cancelEditTripBtn.addEventListener('click', () => this.closeModal(this.editTripModal));
    this.closeAddStayModalBtn.addEventListener('click', () => this.closeModal(this.addStayModal));
    this.cancelAddStayBtn.addEventListener('click', () => this.closeModal(this.addStayModal));

    [this.detailModal, this.comparisonModal, this.editTripModal, this.addStayModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal(modal);
      });
    });

    // Open Edit Trip Modal
    this.editTripBtn.addEventListener('click', () => {
      document.getElementById('inputTripTitle').value = this.tripConfig.title;
      document.getElementById('inputSubtitle').value = this.tripConfig.subtitle;
      document.getElementById('inputDestination').value = this.tripConfig.destination;
      document.getElementById('inputDates').value = this.tripConfig.dates;
      document.getElementById('inputHost').value = this.tripConfig.host;
      document.getElementById('inputGuests').value = this.tripConfig.guests;
      this.openModal(this.editTripModal);
    });

    // Save Edit Trip Form
    this.tripConfigForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.tripConfig.title = document.getElementById('inputTripTitle').value.trim() || 'Kampot Road Trip';
      this.tripConfig.subtitle = document.getElementById('inputSubtitle').value.trim() || 'Adventure Starts With Planning';
      this.tripConfig.destination = document.getElementById('inputDestination').value.trim() || 'Kampot, Cambodia';
      this.tripConfig.dates = document.getElementById('inputDates').value.trim() || 'Weekend Trip';
      this.tripConfig.host = document.getElementById('inputHost').value.trim() || 'Trip Crew';
      this.tripConfig.guests = parseInt(document.getElementById('inputGuests').value, 10) || 6;
      
      this.saveConfig();
      this.renderHeader();
      this.renderStays();
      this.closeModal(this.editTripModal);
      this.showToast('✨ Trip details updated!');
    });

    // Add Stay Form
    this.addNewStayBtn.addEventListener('click', () => {
      this.openModal(this.addStayModal);
    });

    this.addStayForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const amenities = Array.from(document.querySelectorAll('#addStayForm input[name="amenity"]:checked')).map(cb => cb.value);
      const cat = document.getElementById('newStayCategory').value;
      const catLabels = { homestay: 'Homestay', private: 'Private Retreat', residence: 'Residence' };

      const stayName = document.getElementById('newStayName').value.trim();
      const tiktokUser = '@' + stayName.toLowerCase().replace(/[^a-z0-9]/g, '');

      const newStay = {
        id: 'stay-' + Date.now(),
        name: stayName,
        category: cat,
        categoryLabel: catLabels[cat] || 'Stay',
        tag: '⭐ New Option',
        tiktok: tiktokUser,
        tiktokUrl: `https://www.tiktok.com/search?q=${encodeURIComponent(stayName + ' Kampot')}`,
        rating: 5.0,
        reviewCount: 1,
        location: document.getElementById('newStayLocation').value.trim() || 'Kampot Area',
        pricePerNight: parseInt(document.getElementById('newStayPrice').value, 10) || 60,
        basePrice: parseInt(document.getElementById('newStayPrice').value, 10) || 60,
        bbqCost: 0,
        bbqText: '🔥 BBQ Available',
        hasFreeBbq: true,
        guests: `${document.getElementById('newStayGuests').value} People`,
        guestsMax: parseInt(document.getElementById('newStayGuests').value, 10) || 6,
        bedrooms: parseInt(document.getElementById('newStayBeds').value, 10) || 2,
        beds: parseInt(document.getElementById('newStayBeds').value, 10) || 3,
        baths: 2,
        description: document.getElementById('newStayDescription').value.trim() || 'A relaxing place to stay during our Kampot adventure.',
        amenities: amenities,
        amenityLabels: amenities.map(a => {
          if (a === 'creek') return '🌊 Near Creek';
          if (a === 'beach') return '🏖️ Near Beach';
          if (a === 'bbq') return '🔥 BBQ Grill';
          if (a === 'wifi') return '⚡ Fast Wi-Fi';
          if (a === 'kitchen') return '🍳 Kitchen';
          return a;
        }),
        image: document.getElementById('newStayImage').value.trim() || 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=900&q=80',
        votes: 1,
        shortlisted: true,
        hostNote: 'Added by crew member!'
      };

      this.stays.push(newStay);
      this.saveStays();
      this.updateCounts();
      this.renderStays();
      this.renderLeaderboard();
      this.closeModal(this.addStayModal);
      this.addStayForm.reset();
      this.showToast('🏡 New stay added to options!');
    });

    // Comparison Modal
    this.openComparisonBtn.addEventListener('click', () => {
      this.renderComparisonTable();
      this.openModal(this.comparisonModal);
    });

    // Share & Export
    this.sharePlanBtn.addEventListener('click', () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        this.showToast('📋 Trip link copied to clipboard!');
      } else {
        this.showToast('🔗 Link: ' + window.location.href);
      }
    });

    this.exportPlanBtn.addEventListener('click', () => {
      this.exportSelectionSummary();
    });
  }

  openModal(modal) {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  closeModal(modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  showToast(message) {
    this.toast.textContent = message;
    this.toast.classList.add('visible');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toast.classList.remove('visible');
    }, 3200);
  }

  render() {
    this.renderHeader();
    this.updateCounts();
    this.renderStays();
    this.renderLeaderboard();
  }

  renderHeader() {
    this.tripBadgeText.textContent = this.tripConfig.badge;
    this.tripMainTitle.textContent = this.tripConfig.title;
    this.tripSubtitleText.textContent = this.tripConfig.subtitle;
    this.tripHostName.textContent = this.tripConfig.host;
    this.metaDestination.textContent = this.tripConfig.destination;
    this.metaDates.textContent = this.tripConfig.dates;
    this.metaGuests.textContent = `${this.tripConfig.guests} Adventurers`;
    
    const shortlistedCount = this.stays.filter(s => s.shortlisted).length;
    this.compareCount.textContent = shortlistedCount;
  }

  updateCounts() {
    if (this.countAll) this.countAll.textContent = this.stays.length;
    if (this.countVilla) this.countVilla.textContent = this.stays.filter(s => s.category === 'private').length;
    if (this.countRoom) this.countRoom.textContent = this.stays.filter(s => s.category === 'homestay').length;
    if (this.countResidence) this.countResidence.textContent = this.stays.filter(s => s.category === 'residence').length;
  }

  getFilteredStays() {
    let list = this.stays.slice();

    if (this.currentCategory !== 'all') {
      list = list.filter(s => s.category === this.currentCategory);
    }

    if (this.activeAmenities.size > 0) {
      list = list.filter(s => {
        for (const am of this.activeAmenities) {
          if (!s.amenities.includes(am)) return false;
        }
        return true;
      });
    }

    if (this.currentSort === 'votes') {
      list.sort((a, b) => b.votes - a.votes);
    } else if (this.currentSort === 'price-asc') {
      list.sort((a, b) => a.pricePerNight - b.pricePerNight);
    } else if (this.currentSort === 'price-desc') {
      list.sort((a, b) => b.pricePerNight - a.pricePerNight);
    } else if (this.currentSort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else {
      list.sort((a, b) => (b.votes * 1.5 + b.rating) - (a.votes * 1.5 + a.rating));
    }

    return list;
  }

  renderStays() {
    const list = this.getFilteredStays();
    this.staysGrid.innerHTML = '';

    if (list.length === 0) {
      this.staysGrid.style.display = 'none';
      this.emptyState.style.display = 'block';
      return;
    }

    this.staysGrid.style.display = 'grid';
    this.emptyState.style.display = 'none';

    const maxVotes = Math.max(...this.stays.map(s => s.votes));

    list.forEach(stay => {
      const card = document.createElement('article');
      card.className = `stay-card ${stay.votes === maxVotes && stay.votes > 1 ? 'is-top-voted' : ''}`;

      const totalTripPrice = stay.pricePerNight * this.tripConfig.nights;
      const pricePerGuest = Math.round(totalTripPrice / this.tripConfig.guests);

      const categoryIcons = {
        homestay: '🏡',
        private: '🛶',
        residence: '🏰'
      };

      card.innerHTML = `
        <div class="card-media">
          <img src="${stay.image}" alt="${stay.name}" class="card-image" loading="lazy">
          <div class="type-sticker">${categoryIcons[stay.category] || '📍'} ${stay.categoryLabel}</div>
          <button class="card-fav-btn ${stay.shortlisted ? 'active' : ''}" data-id="${stay.id}" title="${stay.shortlisted ? 'Remove from shortlist' : 'Add to shortlist'}">
            ${stay.shortlisted ? '❤️' : '🤍'}
          </button>
          
          <!-- TikTok Handle Pill Over Image -->
          <a href="${stay.tiktokUrl}" target="_blank" rel="noopener noreferrer" class="tiktok-pill-badge" title="Watch reviews on TikTok">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.35 0 .68.07.99.19V8.98a6.34 6.34 0 0 0-.99-.08 6.34 6.34 0 1 0 6.33 6.34V8.58c1.3.93 2.88 1.48 4.6 1.54V6.75a4.87 4.87 0 0 1-.83-.06z"/></svg>
            <span>${stay.tiktok}</span>
            <span class="tiktok-arrow">↗</span>
          </a>
        </div>

        <div class="card-body">
          <div class="card-title-row">
            <h3 class="card-title">${stay.name}</h3>
            <div class="card-rating">★ ${stay.rating.toFixed(2)}</div>
          </div>

          <div class="card-location">📍 ${stay.location}</div>

          <!-- Highlight BBQ Feature Box -->
          <div class="bbq-highlight-bar ${stay.hasFreeBbq ? 'bbq-free' : 'bbq-paid'}">
            <span>${stay.bbqText}</span>
            ${stay.extraInfo ? `<span class="bbq-subtext">(${stay.extraInfo})</span>` : ''}
          </div>

          <div class="card-specs">
            <span class="spec-badge">👥 ${stay.guests} Guests</span>
            <span class="spec-badge">🛏️ ${stay.beds} Beds</span>
            ${stay.bedrooms ? `<span class="spec-badge">🏠 ${stay.bedrooms} Rooms</span>` : ''}
          </div>

          <p class="card-description">${stay.description}</p>

          <div class="card-amenities">
            ${stay.amenityLabels.slice(0, 3).map(label => `<span class="amenity-tag">${label}</span>`).join('')}
            ${stay.amenityLabels.length > 3 ? `<span class="amenity-tag">+${stay.amenityLabels.length - 3} more</span>` : ''}
          </div>

          <div class="card-pricing-row">
            <div class="price-box">
              <div>
                <span class="price-main">$${stay.pricePerNight}</span>
                <span class="price-period">${stay.unitPriceNote ? `(${stay.unitPriceNote})` : '/ night'}</span>
              </div>
              <span class="price-estimate">$${totalTripPrice.toLocaleString()} for ${this.tripConfig.nights} nights (~$${pricePerGuest}/person)</span>
            </div>
          </div>

          <div class="card-actions">
            <button class="btn-card-vote ${stay.votedByUser ? 'voted' : ''}" data-id="${stay.id}">
              <span>🗳️</span> <span>Vote (${stay.votes})</span>
            </button>
            <button class="btn-card-details" data-id="${stay.id}">
              <span>🔍 Details</span>
            </button>
          </div>
        </div>
      `;

      card.querySelector('.card-fav-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleShortlist(stay.id);
      });

      card.querySelector('.btn-card-vote').addEventListener('click', (e) => {
        e.stopPropagation();
        this.castVote(stay.id);
      });

      card.querySelector('.btn-card-details').addEventListener('click', (e) => {
        e.stopPropagation();
        this.openDetailModal(stay);
      });

      this.staysGrid.appendChild(card);
    });
  }

  castVote(stayId) {
    const stay = this.stays.find(s => s.id === stayId);
    if (!stay) return;

    if (stay.votedByUser) {
      stay.votes = Math.max(0, stay.votes - 1);
      stay.votedByUser = false;
      this.showToast(`Vote removed from ${stay.name}`);
    } else {
      stay.votes += 1;
      stay.votedByUser = true;
      stay.shortlisted = true;
      this.showToast(`🎉 You voted for ${stay.name}!`);
    }

    this.saveStays();
    this.renderHeader();
    this.renderStays();
    this.renderLeaderboard();
  }

  toggleShortlist(stayId) {
    const stay = this.stays.find(s => s.id === stayId);
    if (!stay) return;

    stay.shortlisted = !stay.shortlisted;
    this.saveStays();
    this.renderHeader();
    this.renderStays();
    this.showToast(stay.shortlisted ? `Added ${stay.name} to comparison!` : `Removed from comparison.`);
  }

  renderLeaderboard() {
    const sorted = this.stays.slice().sort((a, b) => b.votes - a.votes);
    const totalVotes = this.stays.reduce((acc, s) => acc + s.votes, 0) || 1;

    this.leaderboardContainer.innerHTML = '';

    sorted.slice(0, 4).forEach((stay, index) => {
      const percentage = Math.round((stay.votes / totalVotes) * 100);
      const row = document.createElement('div');
      row.className = 'leaderboard-row';

      const rankEmojis = ['🥇', '🥈', '🥉', '4️⃣'];

      row.innerHTML = `
        <div class="rank-pill rank-${index + 1}">${rankEmojis[index] || (index + 1)}</div>
        <div class="row-info">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="row-stay-title">${stay.name}</span>
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--ink-muted);">${stay.tiktok}</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width: ${percentage}%;"></div>
          </div>
        </div>
        <div class="row-votes-badge">${stay.votes} ${stay.votes === 1 ? 'vote' : 'votes'} (${percentage}%)</div>
        <button class="row-vote-action-btn" data-id="${stay.id}">
          ${stay.votedByUser ? '✓ Voted' : '+ Vote'}
        </button>
      `;

      row.querySelector('.row-vote-action-btn').addEventListener('click', () => {
        this.castVote(stay.id);
      });

      this.leaderboardContainer.appendChild(row);
    });
  }

  openDetailModal(stay) {
    const totalTripPrice = stay.pricePerNight * this.tripConfig.nights;
    const pricePerGuest = Math.round(totalTripPrice / this.tripConfig.guests);

    this.detailModalContent.innerHTML = `
      <div class="detail-media-hero">
        <img src="${stay.image}" alt="${stay.name}">
      </div>
      <div class="detail-title-section">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap;">
          <div class="modal-mini-badge">${stay.tag}</div>
          <a href="${stay.tiktokUrl}" target="_blank" rel="noopener noreferrer" class="tiktok-pill-badge" style="position: static; font-size: 0.85rem;">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.35 0 .68.07.99.19V8.98a6.34 6.34 0 0 0-.99-.08 6.34 6.34 0 1 0 6.33 6.34V8.58c1.3.93 2.88 1.48 4.6 1.54V6.75a4.87 4.87 0 0 1-.83-.06z"/></svg>
            <span>Watch ${stay.tiktok} on TikTok</span>
            <span>↗</span>
          </a>
        </div>
        <h2>${stay.name}</h2>
        <div class="card-location">📍 ${stay.location} · ★ ${stay.rating.toFixed(2)} (${stay.reviewCount} reviews)</div>
        
        <div class="bbq-highlight-bar ${stay.hasFreeBbq ? 'bbq-free' : 'bbq-paid'}" style="margin: 12px 0;">
          <span style="font-weight: 800;">${stay.bbqText}</span>
          ${stay.extraInfo ? `<span class="bbq-subtext">— ${stay.extraInfo}</span>` : ''}
        </div>

        <div class="detail-specs-bar">
          <span class="spec-badge">👥 ${stay.guests} People</span>
          <span class="spec-badge">🛏️ ${stay.beds} Beds</span>
          ${stay.bedrooms ? `<span class="spec-badge">🏠 ${stay.bedrooms} Rooms</span>` : ''}
          <span class="spec-badge">🏷️ ${stay.categoryLabel}</span>
        </div>
      </div>

      <p class="detail-desc">${stay.description}</p>

      <div class="detail-amenities-card">
        <h4>✨ Highlights & Trip Inclusions</h4>
        <div class="amenities-grid-modal">
          ${stay.amenityLabels.map(label => `<div class="amenity-modal-pill">${label}</div>`).join('')}
        </div>
      </div>

      <div class="detail-amenities-card" style="background: var(--pastel-yellow); border-color: var(--ink-primary);">
        <h4>💡 Host Note & Pricing Breakdown</h4>
        <p style="font-size: 0.92rem; color: var(--ink-primary); line-height: 1.5;">${stay.hostNote || 'No special notes.'}</p>
      </div>

      <div class="detail-footer-bar">
        <div>
          <span class="price-main">$${stay.pricePerNight}</span>
          <span class="price-period">${stay.unitPriceNote ? `(${stay.unitPriceNote})` : '/ night'}</span>
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--pastel-purple);">
            $${totalTripPrice.toLocaleString()} total for ${this.tripConfig.nights} nights (~$${pricePerGuest}/person)
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <a href="${stay.tiktokUrl}" target="_blank" rel="noopener noreferrer" class="action-btn-custom" style="text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
            <span>🎵 TikTok Videos</span>
          </a>
          <button class="btn-card-vote ${stay.votedByUser ? 'voted' : ''}" id="modalVoteBtn" style="padding: 10px 20px;">
            <span>🗳️</span> <span>${stay.votedByUser ? 'Voted' : 'Cast Vote'} (${stay.votes})</span>
          </button>
        </div>
      </div>
    `;

    document.getElementById('modalVoteBtn').addEventListener('click', () => {
      this.castVote(stay.id);
      this.openDetailModal(stay);
    });

    this.openModal(this.detailModal);
  }

  renderComparisonTable() {
    const shortlisted = this.stays.filter(s => s.shortlisted);

    if (shortlisted.length === 0) {
      this.comparisonTableWrapper.innerHTML = `
        <div style="text-align: center; padding: 40px 10px;">
          <div style="font-size: 2.5rem; margin-bottom: 12px;">🤍</div>
          <h3 style="font-family: var(--font-display); font-size: 1.3rem;">No stays shortlisted</h3>
          <p style="color: var(--ink-muted); margin-top: 6px;">Click the heart icon on any stay to compare.</p>
        </div>
      `;
      return;
    }

    let html = `
      <table class="comparison-table">
        <thead>
          <tr>
            <th style="min-width: 140px;">Feature / Stay</th>
            ${shortlisted.map(s => `
              <th style="min-width: 180px;">
                <div style="font-weight: 800; font-size: 0.95rem;">${s.name}</div>
                <div style="font-size: 0.8rem; color: var(--pastel-purple); font-weight: 700;">${s.tiktok}</div>
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="feature-label">Photo Preview</td>
            ${shortlisted.map(s => `
              <td>
                <img src="${s.image}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 8px; border: 1.5px solid var(--ink-primary);">
              </td>
            `).join('')}
          </tr>
          <tr>
            <td class="feature-label">Price per Night</td>
            ${shortlisted.map(s => `<td><strong style="font-size: 1.15rem; color: var(--ink-primary);">$${s.pricePerNight}</strong> ${s.unitPriceNote ? `<br><small style="color:var(--ink-muted); font-weight:700;">${s.unitPriceNote}</small>` : ''}</td>`).join('')}
          </tr>
          <tr>
            <td class="feature-label">🔥 BBQ Grill Deal</td>
            ${shortlisted.map(s => `
              <td>
                <span class="bbq-highlight-bar ${s.hasFreeBbq ? 'bbq-free' : 'bbq-paid'}" style="display:inline-block; font-size:0.8rem; padding:4px 8px;">
                  ${s.bbqText}
                </span>
              </td>
            `).join('')}
          </tr>
          <tr>
            <td class="feature-label">Total for Trip (${this.tripConfig.nights} nights)</td>
            ${shortlisted.map(s => `<td><strong>$${(s.pricePerNight * this.tripConfig.nights).toLocaleString()}</strong></td>`).join('')}
          </tr>
          <tr>
            <td class="feature-label">Cost per Person (~${this.tripConfig.guests} people)</td>
            ${shortlisted.map(s => `<td><span class="spec-badge" style="background: var(--pastel-yellow);">$${Math.round((s.pricePerNight * this.tripConfig.nights) / this.tripConfig.guests)} / person</span></td>`).join('')}
          </tr>
          <tr>
            <td class="feature-label">Capacity & Beds</td>
            ${shortlisted.map(s => `<td>👥 ${s.guests}<br>🛏️ ${s.beds} Beds ${s.bedrooms ? `(${s.bedrooms} Rooms)` : ''}</td>`).join('')}
          </tr>
          <tr>
            <td class="feature-label">Location</td>
            ${shortlisted.map(s => `<td>📍 ${s.location}</td>`).join('')}
          </tr>
          <tr>
            <td class="feature-label">TikTok Review Link</td>
            ${shortlisted.map(s => `
              <td>
                <a href="${s.tiktokUrl}" target="_blank" rel="noopener noreferrer" class="tiktok-pill-badge" style="position:static; display:inline-flex;">
                  <span>${s.tiktok}</span> ↗
                </a>
              </td>
            `).join('')}
          </tr>
          <tr>
            <td class="feature-label">Crew Votes</td>
            ${shortlisted.map(s => `<td><span class="row-votes-badge">${s.votes} votes</span></td>`).join('')}
          </tr>
          <tr>
            <td class="feature-label">Action</td>
            ${shortlisted.map(s => `
              <td>
                <button class="btn-card-vote ${s.votedByUser ? 'voted' : ''}" data-compare-vote="${s.id}" style="width: 100%; padding: 8px;">
                  🗳️ Vote (${s.votes})
                </button>
              </td>
            `).join('')}
          </tr>
        </tbody>
      </table>
    `;

    this.comparisonTableWrapper.innerHTML = html;

    this.comparisonTableWrapper.querySelectorAll('[data-compare-vote]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.compareVote;
        this.castVote(id);
        this.renderComparisonTable();
      });
    });
  }

  exportSelectionSummary() {
    const topStay = this.stays.slice().sort((a, b) => b.votes - a.votes)[0];
    const shortlisted = this.stays.filter(s => s.shortlisted);

    let summaryText = `========================================\n`;
    summaryText += `🌴 ${this.tripConfig.title.toUpperCase()} 🌴\n`;
    summaryText += `Destination: ${this.tripConfig.destination}\n`;
    summaryText += `Dates: ${this.tripConfig.dates} (${this.tripConfig.nights} nights)\n`;
    summaryText += `Travelers: ${this.tripConfig.guests} people\n`;
    summaryText += `========================================\n\n`;

    summaryText += `👑 LEADING CHOICE BY VOTES:\n`;
    if (topStay) {
      summaryText += `• ${topStay.name} (${topStay.categoryLabel})\n`;
      summaryText += `  Price: $${topStay.pricePerNight}/night (${topStay.bbqText})\n`;
      summaryText += `  TikTok: ${topStay.tiktok} (${topStay.tiktokUrl})\n`;
      summaryText += `  Beds: ${topStay.beds} beds · Capacity: ${topStay.guests}\n`;
      summaryText += `  Location: ${topStay.location}\n`;
      summaryText += `  Total Votes: ${topStay.votes}\n\n`;
    }

    summaryText += `📋 ALL COMPARED OPTIONS:\n`;
    shortlisted.forEach((s, idx) => {
      summaryText += `${idx + 1}. ${s.name} (${s.tiktok})\n`;
      summaryText += `   Rate: $${s.pricePerNight}/night | BBQ: ${s.bbqText}\n`;
      summaryText += `   Specs: ${s.beds} beds, ${s.guests} guests, ${s.location}\n`;
      summaryText += `   TikTok Search: ${s.tiktokUrl}\n\n`;
    });

    summaryText += `Generated with Kampot Road Trip Agenda Planner.\n`;

    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kampot-stay-selection-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    this.showToast('📥 Kampot selection summary downloaded!');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new TripPlannerApp();
});
