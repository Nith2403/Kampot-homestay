/**
 * Firebase Realtime Database Live Sync
 * =====================================
 * Enables real-time synchronization across all devices (phones, laptops, tablets)
 * without needing heavy external dependencies.
 * 
 * Uses standard Firebase Realtime Database REST + SSE (Server-Sent Events) streaming.
 */

// 1. Storage key for user's Firebase Database URL
const DB_URL_STORAGE_KEY = 'kampot_trip_firebase_url';
const USER_VOTED_KEY = 'kampot_trip_voted_stay_id';

// Default config: Paste your Firebase Realtime Database URL here, OR enter it in the UI!
// Example: "https://your-trip-poll-default-rtdb.asia-southeast1.firebasedatabase.app"
export const CONFIG = {
  databaseURL: localStorage.getItem(DB_URL_STORAGE_KEY) || ""
};

export function setFirebaseDatabaseUrl(url) {
  const cleanUrl = url ? url.trim().replace(/\/+$/, '') : '';
  CONFIG.databaseURL = cleanUrl;
  if (cleanUrl) {
    localStorage.setItem(DB_URL_STORAGE_KEY, cleanUrl);
  } else {
    localStorage.removeItem(DB_URL_STORAGE_KEY);
  }
}

export function getFirebaseDatabaseUrl() {
  return CONFIG.databaseURL || localStorage.getItem(DB_URL_STORAGE_KEY) || '';
}

// Device-level tracking so each friend can only vote for 1 stay at a time (and can change their vote)
export function getUserVotedStay() {
  return localStorage.getItem(USER_VOTED_KEY) || null;
}

export function setUserVotedStay(stayId) {
  if (stayId) {
    localStorage.setItem(USER_VOTED_KEY, stayId);
  } else {
    localStorage.removeItem(USER_VOTED_KEY);
  }
}

// Multi-tab sync channel on same machine
const broadcastChannel = typeof BroadcastChannel !== 'undefined' 
  ? new BroadcastChannel('kampot_live_votes_channel') 
  : null;

/**
 * Subscribes to live votes.
 * @param {Function} onVotesUpdated - Callback received whenever votes change in cloud or other tabs.
 * @returns {Function} cleanup - Function to stop listening.
 */
export function subscribeToLiveVotes(onVotesUpdated) {
  let eventSource = null;
  let isSubscribed = true;

  // 1. Listen across local browser tabs
  if (broadcastChannel) {
    broadcastChannel.onmessage = (e) => {
      if (e.data && e.data.type === 'VOTES_UPDATED') {
        onVotesUpdated(e.data.votes);
      }
    };
  }

  const dbUrl = getFirebaseDatabaseUrl();

  // 2. If Firebase URL is configured, connect to Firebase Realtime Database SSE stream
  if (dbUrl) {
    try {
      const streamUrl = `${dbUrl}/votes.json`;
      eventSource = new EventSource(streamUrl);

      eventSource.addEventListener('put', (event) => {
        if (!isSubscribed) return;
        try {
          const payload = JSON.parse(event.data);
          if (payload && payload.path === '/') {
            // Full object update
            if (payload.data && typeof payload.data === 'object') {
              onVotesUpdated(payload.data);
            }
          } else if (payload && payload.path) {
            // Single stay update, e.g. path "/mr-pho"
            const stayKey = payload.path.replace(/^\//, '');
            const newCount = payload.data;
            if (stayKey) {
              onVotesUpdated({ [stayKey]: newCount });
            }
          }
        } catch (err) {
          console.warn('[Firebase Sync] SSE parse error:', err);
        }
      });

      eventSource.onerror = (err) => {
        console.warn('[Firebase Sync] Stream connection error (will retry automatically):', err);
      };

      // Also do an initial fetch
      fetch(`${dbUrl}/votes.json`)
        .then(res => res.json())
        .then(data => {
          if (data && typeof data === 'object' && isSubscribed) {
            onVotesUpdated(data);
          }
        })
        .catch(() => {});
    } catch (err) {
      console.warn('[Firebase Sync] Failed to initialize EventSource:', err);
    }
  }

  // Cleanup
  return () => {
    isSubscribed = false;
    if (eventSource) {
      eventSource.close();
    }
  };
}

/**
 * Cast or toggle a vote live.
 * @param {string} stayId - ID of stay voted for
 * @param {boolean} isAdding - true to increment, false to remove
 * @param {Object} currentVotes - current vote totals snapshot
 * @returns {Promise<Object>} updated votes
 */
export async function submitLiveVote(stayId, isAdding, currentVotes) {
  const currentCount = currentVotes[stayId] || 0;
  const newCount = isAdding ? currentCount + 1 : Math.max(0, currentCount - 1);
  const updatedVotes = {
    ...currentVotes,
    [stayId]: newCount
  };

  // Broadcast to other tabs immediately
  if (broadcastChannel) {
    broadcastChannel.postMessage({
      type: 'VOTES_UPDATED',
      votes: updatedVotes
    });
  }

  // If Firebase Realtime Database is configured, push to cloud
  const dbUrl = getFirebaseDatabaseUrl();
  if (dbUrl) {
    try {
      // First fetch latest from cloud to avoid race conditions
      const res = await fetch(`${dbUrl}/votes/${stayId}.json`);
      const serverCount = await res.json();
      const base = typeof serverCount === 'number' ? serverCount : currentCount;
      const finalCount = isAdding ? base + 1 : Math.max(0, base - 1);

      await fetch(`${dbUrl}/votes/${stayId}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalCount)
      });

      updatedVotes[stayId] = finalCount;
    } catch (err) {
      console.error('[Firebase Sync] Error updating cloud vote:', err);
    }
  }

  return updatedVotes;
}

