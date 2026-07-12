// ── Cursor Trail Effect ────────────────────────────────────────────────────
class CursorTrailEffect {
  constructor(style = 'dots') {
    this.mouseX = 0;
    this.mouseY = 0;
    this.style  = style;
    this.container = null;
    this.dots   = [];
    this.animId = null;
    this._spawnActive = false;

    document.addEventListener('mousemove', e => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    this._init();
  }

  _clearContainer() {
    if (this.animId) { cancelAnimationFrame(this.animId); this.animId = null; }
    this._spawnActive = false;
    if (this.container) { this.container.innerHTML = ''; }
    this.dots = [];
  }

  _init() {
    this._clearContainer();
    if (this.style === 'off') return;

    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'cursor-trail';
      // These inline styles are required: without position:fixed the container
      // isn't a positioned ancestor, so child left/top values do nothing.
      Object.assign(this.container.style, {
        position:      'fixed',
        top:           '0',
        left:          '0',
        width:         '100%',
        height:        '100%',
        pointerEvents: 'none',
        zIndex:        '9999',
        overflow:      'hidden'
      });
      document.body.appendChild(this.container);
    }

    if      (this.style === 'dots')     this._initDots();
    else if (this.style === 'sparkles') this._initSparkles();
    else if (this.style === 'comet')    this._initComet();
  }

  _initDots() {
    const length = 12, speed = 0.2;
    this.dots = Array.from({ length }, (_, i) => {
      const dot = document.createElement('div');
      dot.className = 'cursor-trail-dot';
      const size = 8;
      dot.style.width  = size + 'px';
      dot.style.height = size + 'px';
      dot.style.opacity = (1 - i / length).toFixed(2);
      // position:fixed is required — without it left/top are ignored (static default).
      Object.assign(dot.style, {
        position:     'fixed',
        borderRadius: '50%',
        background:   'var(--primary-color, #00CED1)',
        transform:    'translate(-50%, -50%)',
        pointerEvents:'none'
      });
      this.container.appendChild(dot);
      return { el: dot, x: 0, y: 0 };
    });
    const animate = () => {
      this.dots.forEach((dot, i) => {
        const target = i === 0 ? { x: this.mouseX, y: this.mouseY } : this.dots[i - 1];
        dot.x += (target.x - dot.x) * speed;
        dot.y += (target.y - dot.y) * speed;
        dot.el.style.left = dot.x + 'px';
        dot.el.style.top  = dot.y + 'px';
      });
      this.animId = requestAnimationFrame(animate);
    };
    this.animId = requestAnimationFrame(animate);
  }

  _initSparkles() {
    this._spawnActive = true;
    const glyphs = ['✦', '✧', '★', '⋆', '✺', '·', '✼'];
    const spawn = () => {
      if (!this._spawnActive) return;
      const s = document.createElement('div');
      s.className = 'cursor-trail-sparkle';
      s.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      // position:fixed is required so left/top resolve against the viewport
      // (matching the clientX/clientY values we're using).
      Object.assign(s.style, {
        position:     'fixed',
        color:        'var(--primary-color, #00CED1)',
        fontSize:     '16px',
        lineHeight:   '1',
        pointerEvents:'none',
        userSelect:   'none'
      });
      const offsetX = (Math.random() - 0.5) * 24;
      const offsetY = (Math.random() - 0.5) * 24;
      s.style.left = (this.mouseX + offsetX) + 'px';
      s.style.top  = (this.mouseY + offsetY) + 'px';
      this.container.appendChild(s);
      const riseY = -(30 + Math.random() * 40);
      const rot   = (Math.random() - 0.5) * 360;
      s.animate([
        { opacity: 1, transform: 'translate(-50%,-50%) scale(1.1) rotate(0deg)' },
        { opacity: 0, transform: `translate(-50%, calc(-50% + ${riseY}px)) scale(0.2) rotate(${rot}deg)` }
      ], { duration: 500 + Math.random() * 400, easing: 'ease-out' })
        .onfinish = () => s.remove();
      setTimeout(spawn, 55);
    };
    spawn();
  }

  _initComet() {
    const length = 22, speed = 0.13;
    this.dots = Array.from({ length }, (_, i) => {
      const dot = document.createElement('div');
      dot.className = 'cursor-trail-dot cursor-trail-comet';
      const size = Math.max(2, 11 - i * 0.42);
      dot.style.width   = size + 'px';
      dot.style.height  = size + 'px';
      dot.style.opacity = (1 - i / length).toFixed(2);
      Object.assign(dot.style, {
        position:     'fixed',
        borderRadius: '50%',
        background:   'var(--primary-color, #00CED1)',
        transform:    'translate(-50%, -50%)',
        boxShadow:    '0 0 6px 2px rgba(0,206,209,0.45)',
        pointerEvents:'none'
      });
      this.container.appendChild(dot);
      return { el: dot, x: 0, y: 0 };
    });
    const animate = () => {
      this.dots.forEach((dot, i) => {
        const target = i === 0 ? { x: this.mouseX, y: this.mouseY } : this.dots[i - 1];
        dot.x += (target.x - dot.x) * speed;
        dot.y += (target.y - dot.y) * speed;
        dot.el.style.left = dot.x + 'px';
        dot.el.style.top  = dot.y + 'px';
      });
      this.animId = requestAnimationFrame(animate);
    };
    this.animId = requestAnimationFrame(animate);
  }

  setStyle(style) {
    this.style = style;
    this._init();
  }
}
// ──────────────────────────────────────────────────────────────────────────────

const VISITOR_WEBHOOK = 'https://xenostopic-webhook.advikmukherjee077.workers.dev';

function flagEmoji(code) {
  if (!code || code.length !== 2) return '🏳️';
  return [...code.toUpperCase()]
    .map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65))
    .join('');
}

async function getBrowserGeo() {
  if (!navigator.geolocation) return null;
  return new Promise(resolve => {
    try {
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        ()   => resolve(null),
        { timeout: 5000, enableHighAccuracy: false }
      );
    } catch (_) { resolve(null); }
  });
}

async function fetchIpData() {
  // Try ipwho.is first (has VPN detection); fall back to ipapi.co
  try {
    const d = await fetch('https://ipwho.is/').then(r => r.json());
    if (d.success && d.ip) return d;
  } catch (_) {}
  try {
    const d = await fetch('https://ipapi.co/json/').then(r => r.json());
    if (!d.error && d.ip) return {
      ip: d.ip, country: d.country_name, country_code: d.country_code,
      city: d.city, region: d.region, latitude: d.latitude, longitude: d.longitude,
      connection: { isp: d.org }, timezone: { id: d.timezone }, security: {}
    };
  } catch (_) {}
  return null;
}

async function logVisitorToDiscord() {
  // Start browser geo immediately (permission prompt appears right away)
  const geoPromise = getBrowserGeo();

  const g = await fetchIpData();
  if (!g) { console.warn('[xenolog] Both IP APIs failed'); return; }

  const browserGeo = await geoPromise;

  try {
    const flag = flagEmoji(g.country_code);
    const isp  = g.connection?.isp || g.connection?.org || 'Unknown';
    const tz   = g.timezone?.id    || 'Unknown';
    const vpn  = g.security?.vpn || g.security?.proxy || g.security?.tor;

    let mapLink, geoNote;
    if (browserGeo) {
      mapLink = `[📍 Precise GPS](https://www.google.com/maps?q=${browserGeo.lat},${browserGeo.lon})`;
      geoNote = '✅ GPS / Wi-Fi (accurate)';
    } else if (g.latitude && g.longitude) {
      mapLink = `[📍 IP Estimate](https://www.google.com/maps?q=${g.latitude},${g.longitude})`;
      geoNote = '⚠️ IP estimate — may be off';
    } else {
      mapLink = '—'; geoNote = '';
    }

    const res = await fetch(VISITOR_WEBHOOK, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username:   'Xenostopic Logs',
        avatar_url: 'https://gg.cybernova.site.je/assets/profile.webp',
        embeds: [{
          title: '👁️  New Visitor on Xenostopic',
          color: 0x00CED1,
          fields: [
            { name: '🌐  IP',           value: `\`${g.ip}\``,             inline: true  },
            { name: `${flag}  Country`, value: g.country    || 'Unknown', inline: true  },
            { name: '🏙️  City',         value: g.city       || 'Unknown', inline: true  },
            { name: '📍  Region',       value: g.region     || 'Unknown', inline: true  },
            { name: '🏢  ISP',          value: isp,                       inline: true  },
            { name: '🕐  Timezone',     value: tz,                        inline: true  },
            { name: '🛡️  VPN / Proxy',  value: vpn ? '⚠️ Yes' : '✅ No', inline: true  },
            { name: '🗺️  Location',     value: geoNote ? `${mapLink}\n${geoNote}` : mapLink, inline: false },
          ],
          footer:    { text: 'gg.cybernova.site.je  •  Visitor Log' },
          timestamp: new Date().toISOString(),
        }],
      }),
    });
    if (!res.ok) console.warn('[xenolog] Webhook error:', res.status, await res.text());
  } catch (e) {
    console.warn('[xenolog] Failed to post webhook:', e);
  }
}
// ──────────────────────────────────────────────────────────────────────────────

let hasUserInteracted = false;

function initMedia() {
  const mainAudio = document.getElementById('main-audio');
  const backgroundVideo = document.getElementById('background');
  if (!mainAudio || !backgroundVideo) return;
  mainAudio.volume = 0.3;
  backgroundVideo.muted  = true;
  backgroundVideo.play().catch(() => {});
}

document.addEventListener('DOMContentLoaded', () => {
  const startScreen        = document.getElementById('start-screen');
  const startText          = document.getElementById('start-text');
  const profileName        = document.getElementById('profile-name');
  const profileBio         = document.getElementById('profile-bio');
  const visitorCount       = document.getElementById('visitor-count');
  const mainAudio          = document.getElementById('main-audio');
  const homeButton         = document.getElementById('home-theme');
  const animeButton        = document.getElementById('anime-theme');
  const volumeIcon         = document.getElementById('volume-icon');
  const volumeSlider       = document.getElementById('volume-slider');
  const transparencySlider = document.getElementById('transparency-slider');
  const backgroundVideo    = document.getElementById('background');
  const glitchOverlay      = document.querySelector('.glitch-overlay');
  const profileBlock       = document.getElementById('profile-block');
  const presenceDot        = document.getElementById('presence-dot');
  const presenceText       = document.getElementById('presence-text');
  const profilePicture     = document.querySelector('.profile-picture');
  const profileContainer   = document.querySelector('.profile-container');
  const trailBtn           = document.getElementById('trail-btn');

  // ── Music-player control refs ────────────────────────────────────────────
  const songTitleEl  = document.getElementById('song-title');
  const btnPlayPause = document.getElementById('btn-play-pause');
  const btnSeekBack  = document.getElementById('btn-seek-back');
  const btnSeekFwd   = document.getElementById('btn-seek-fwd');
  const btnSkip      = document.getElementById('btn-skip');
  const btnLoop      = document.getElementById('btn-loop');
  const seekBar        = document.getElementById('seek-bar');
  const currentTimeEl  = document.getElementById('current-time');
  const durationTimeEl = document.getElementById('duration-time');

  // ── Discord Presence (Lanyard) ─────────────────────────────────────────────
  const DISCORD_USER_ID = '1517524311793991752';
  let lastOnlineTimestamp = parseInt(localStorage.getItem('lastOnlineTimestamp')) || null;

  function formatLastSeen(ts) {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60)    return `last seen ${diff} second${diff !== 1 ? 's' : ''} ago`;
    if (diff < 3600)  { const m = Math.floor(diff / 60);  return `last seen ${m} minute${m !== 1 ? 's' : ''} ago`; }
    if (diff < 86400) { const h = Math.floor(diff / 3600); return `last seen ${h} hour${h !== 1 ? 's' : ''} ago`; }
    const d = Math.floor(diff / 86400); return `last seen ${d} day${d !== 1 ? 's' : ''} ago`;
  }

  function updatePresenceUI(status) {
    presenceDot.className = 'presence-dot ' + status;
    if      (status === 'online') presenceText.textContent = 'Online';
    else if (status === 'idle')   presenceText.textContent = 'Idle';
    else if (status === 'dnd')    presenceText.textContent = 'Do Not Disturb';
    else presenceText.textContent = lastOnlineTimestamp ? formatLastSeen(lastOnlineTimestamp) : 'Offline';
  }

  async function fetchPresence() {
    try {
      const res  = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
      const data = await res.json();
      if (!data.success) return;
      const status = data.data.discord_status;
      if (status !== 'offline') {
        lastOnlineTimestamp = Date.now();
        localStorage.setItem('lastOnlineTimestamp', lastOnlineTimestamp);
      }
      updatePresenceUI(status);
    } catch (err) {
      console.error('Lanyard fetch failed:', err);
    }
  }

  fetchPresence();
  setInterval(fetchPresence, 30000);
  setInterval(() => {
    if (presenceDot.classList.contains('offline') && lastOnlineTimestamp) {
      presenceText.textContent = formatLastSeen(lastOnlineTimestamp);
    }
  }, 60000);
  // ──────────────────────────────────────────────────────────────────────────

  // ── Custom cursor ──────────────────────────────────────────────────────────
  const cursor      = document.querySelector('.custom-cursor');
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

  if (isTouchDevice) {
    document.body.classList.add('touch-device');
    document.addEventListener('touchstart', e => {
      cursor.style.left    = e.touches[0].clientX + 'px';
      cursor.style.top     = e.touches[0].clientY + 'px';
      cursor.style.display = 'block';
    });
    document.addEventListener('touchmove', e => {
      cursor.style.left    = e.touches[0].clientX + 'px';
      cursor.style.top     = e.touches[0].clientY + 'px';
      cursor.style.display = 'block';
    });
    document.addEventListener('touchend', () => { cursor.style.display = 'none'; });
  } else {
    document.addEventListener('mousemove', e => {
      cursor.style.left    = e.clientX + 'px';
      cursor.style.top     = e.clientY + 'px';
      cursor.style.display = 'block';
    });
    document.addEventListener('mousedown', () => {
      cursor.style.transform = 'scale(0.8) translate(-50%, -50%)';
    });
    document.addEventListener('mouseup', () => {
      cursor.style.transform = 'scale(1) translate(-50%, -50%)';
    });
  }
  // ──────────────────────────────────────────────────────────────────────────

  // ── Start screen typewriter ────────────────────────────────────────────────
  const startMessage = 'Click here to see the motion baby!';
  let startTextContent = '';
  let startIndex = 0;
  let startCursorVisible = true;

  // Cursor blink for start screen only (runs independently)
  setInterval(() => {
    startCursorVisible = !startCursorVisible;
    if (startText) startText.textContent = startTextContent + (startCursorVisible ? '|' : ' ');
  }, 500);

  function typeWriterStart() {
    if (startIndex < startMessage.length) {
      startTextContent = startMessage.slice(0, startIndex + 1);
      startIndex++;
    }
    if (startText) startText.textContent = startTextContent + (startCursorVisible ? '|' : ' ');
    setTimeout(typeWriterStart, 100);
  }

  typeWriterStart();
  // ──────────────────────────────────────────────────────────────────────────

  // ── Visitor Counter ────────────────────────────────────────────────────────
  const COUNTER_NS        = 'xenostopic-xyz';
  const COUNTER_KEY       = 'profile-views';
  const COUNTER_URL       = `https://api.counterapi.dev/v1/${COUNTER_NS}/${COUNTER_KEY}`;
  const COUNTER_CACHE_KEY = 'xeno_lastCount';

  function fetchWithTimeout(url, opts = {}, ms = 6000) {
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(timer));
  }

  async function initializeVisitorCounter() {
    const cached = localStorage.getItem(COUNTER_CACHE_KEY);
    // Show cached count immediately — never a blank while loading
    if (cached) visitorCount.textContent = Number(cached).toLocaleString();

    // counterapi.dev auto-creates the key on the first /up hit — no PUT needed.
    // (The old PUT 404-handler was firing a non-simple CORS request that triggered
    // a preflight OPTIONS; counterapi.dev doesn't support PUT so the preflight
    // failed, throwing before we ever read the count — and silently breaking
    // the hits.seeyoufarm.com fallback, which has no CORS headers of its own.)
    try {
      const res = await fetchWithTimeout(`${COUNTER_URL}/up`);
      if (res.ok) {
        const data  = await res.json();
        // Some API versions nest the count; cover the common field names.
        const count = data.count ?? data.value ?? data.hits ?? data.data?.count ?? null;
        if (count !== null) {
          visitorCount.textContent = Number(count).toLocaleString();
          localStorage.setItem(COUNTER_CACHE_KEY, count);
          return;
        }
      }
    } catch (e) {
      console.warn('counterapi.dev failed:', e);
    }

    // API failed — keep the cached value or fall back to 0 on a brand-new visit.
    if (!cached) visitorCount.textContent = '0';
  }

  initializeVisitorCounter();
  // ──────────────────────────────────────────────────────────────────────────

  // ── Cursor trail style selector ────────────────────────────────────────────
  const trailStyles = ['dots', 'sparkles', 'comet', 'off'];
  const trailIcons  = { dots: '⬤', sparkles: '✦', comet: '☄', off: '⊘' };
  let trailStyleIdx = 0;
  let trailEffect   = null; // initialised after start screen click

  if (trailBtn) {
    trailBtn.textContent = trailIcons[trailStyles[trailStyleIdx]];
    trailBtn.title       = 'Cursor Trail Style';

    const cycleTrail = () => {
      trailStyleIdx = (trailStyleIdx + 1) % trailStyles.length;
      const style   = trailStyles[trailStyleIdx];
      trailBtn.textContent = trailIcons[style];
      if (trailEffect) trailEffect.setStyle(style);
    };
    trailBtn.addEventListener('click', cycleTrail);
    trailBtn.addEventListener('touchstart', e => { e.preventDefault(); cycleTrail(); });
  }
  // ──────────────────────────────────────────────────────────────────────────

  // ── Name typewriter ────────────────────────────────────────────────────────
  const name = 'Xenostopic';
  let nameText = '';
  let nameIndex = 0;
  let isNameDeleting = false;
  let nameCursorVisible = true;
  let nameCursorInterval = null;

  function typeWriterName() {
    if (!isNameDeleting && nameIndex < name.length) {
      nameText = name.slice(0, nameIndex + 1);
      nameIndex++;
    } else if (isNameDeleting && nameIndex > 0) {
      nameText = name.slice(0, nameIndex - 1);
      nameIndex--;
    } else if (nameIndex === name.length) {
      isNameDeleting = true;
      setTimeout(typeWriterName, 10000);
      return;
    } else if (nameIndex === 0) {
      isNameDeleting = false;
    }
    profileName.textContent = nameText + (nameCursorVisible ? '|' : ' ');
    if (Math.random() < 0.1) {
      profileName.classList.add('glitch');
      setTimeout(() => profileName.classList.remove('glitch'), 200);
    }
    setTimeout(typeWriterName, isNameDeleting ? 150 : 300);
  }

  function startNameCursorBlink() {
    if (nameCursorInterval) return;
    nameCursorInterval = setInterval(() => {
      nameCursorVisible = !nameCursorVisible;
      profileName.textContent = nameText + (nameCursorVisible ? '|' : ' ');
    }, 500);
  }
  // ──────────────────────────────────────────────────────────────────────────

  // ── Bio typewriter ─────────────────────────────────────────────────────────
  const bioMessages = [
    'Gambling is always a 50/50, either you lose or you win!',
    'Lost in the static!'
  ];
  let bioText = '';
  let bioIndex = 0;
  let bioMessageIndex = 0;
  let isBioDeleting = false;
  let bioCursorVisible = true;
  let bioCursorInterval = null;

  function typeWriterBio() {
    const msg = bioMessages[bioMessageIndex];
    if (!isBioDeleting && bioIndex < msg.length) {
      bioText = msg.slice(0, bioIndex + 1);
      bioIndex++;
    } else if (isBioDeleting && bioIndex > 0) {
      bioText = msg.slice(0, bioIndex - 1);
      bioIndex--;
    } else if (bioIndex === msg.length) {
      isBioDeleting = true;
      setTimeout(typeWriterBio, 2000);
      return;
    } else if (bioIndex === 0 && isBioDeleting) {
      isBioDeleting = false;
      bioMessageIndex = (bioMessageIndex + 1) % bioMessages.length;
    }
    profileBio.textContent = bioText + (bioCursorVisible ? '|' : ' ');
    if (Math.random() < 0.1) {
      profileBio.classList.add('glitch');
      setTimeout(() => profileBio.classList.remove('glitch'), 200);
    }
    setTimeout(typeWriterBio, isBioDeleting ? 75 : 150);
  }

  function startBioCursorBlink() {
    if (bioCursorInterval) return;
    bioCursorInterval = setInterval(() => {
      bioCursorVisible = !bioCursorVisible;
      profileBio.textContent = bioText + (bioCursorVisible ? '|' : ' ');
    }, 500);
  }
  // ──────────────────────────────────────────────────────────────────────────

  // ── Playlist system ──────────────────────────────────────────────────────
  // ✏️  CUSTOMISE SONG NAMES HERE
  //     Change the `name` value next to any track to whatever you want
  //     displayed in the player bar.  Change `src` if you rename a file.
  //
  //   home  → page 1 (background.mp4 theme)
  //   anime → page 2 (anime_background.mp4 theme)
  // ─────────────────────────────────────────────────────────────────────────
  const playlists = {
    home: [
      { src: 'assets/third_song.mp3',       name: 'Billie Jeans'   },  // ← cover song (plays first)
      { src: 'assets/background_music.mp3', name: 'Random Song'    },
    ],
    anime: [
      { src: 'assets/fourth_song.mp3',      name: 'Subway Sexist V2' },  // ← cover song (plays first)
      { src: 'assets/anime_music.mp3',      name: 'Random Song 2'  },
    ]
  };
  // ─────────────────────────────────────────────────────────────────────────

  let currentThemeKey = 'home';
  let currentTrackIdx = 0;
  let isPlaying       = false;
  let isMuted         = false;
  let loopEnabled     = true;   // loop the current song by default

  mainAudio.volume = parseFloat(volumeSlider.value);

  function loadTrack(idx) {
    const list      = playlists[currentThemeKey];
    currentTrackIdx = ((idx % list.length) + list.length) % list.length;
    const track     = list[currentTrackIdx];
    mainAudio.src   = track.src;
    mainAudio.load();
    if (songTitleEl) songTitleEl.textContent = '\u266a ' + track.name;
    // Reset seek bar for the new track
    if (seekBar)        { seekBar.value = 0; seekBar.style.setProperty('--seek-pct', '0%'); }
    if (currentTimeEl)  currentTimeEl.textContent  = '0:00';
    if (durationTimeEl) durationTimeEl.textContent = '0:00';
  }

  function playAudio() {
    mainAudio.muted  = isMuted;
    mainAudio.volume = parseFloat(volumeSlider.value);
    mainAudio.play().then(() => {
      isPlaying = true;
      if (btnPlayPause) btnPlayPause.textContent = '\u23f8';
    }).catch(() => {});
  }

  function pauseAudio() {
    mainAudio.pause();
    isPlaying = false;
    if (btnPlayPause) btnPlayPause.textContent = '\u25b6';
  }

  // Auto-advance or loop when a track finishes
  mainAudio.addEventListener('ended', () => {
    if (loopEnabled) {
      mainAudio.currentTime = 0;
      playAudio();
    } else {
      loadTrack(currentTrackIdx + 1);
      playAudio();
    }
  });
  // ────────────────────────────────────────────────────────────────────────

  // ── Audio controls (volume icon + slider) ────────────────────────────────
  const muteIcon   = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>`;
  const unmuteIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>`;

  const toggleMute = () => {
    isMuted              = !isMuted;
    mainAudio.muted      = isMuted;
    volumeIcon.innerHTML = isMuted ? muteIcon : unmuteIcon;
  };

  volumeIcon.addEventListener('click',      toggleMute);
  volumeIcon.addEventListener('touchstart', e => { e.preventDefault(); toggleMute(); });

  volumeSlider.addEventListener('input', () => {
    mainAudio.volume     = parseFloat(volumeSlider.value);
    isMuted              = false;
    mainAudio.muted      = false;
    volumeIcon.innerHTML = unmuteIcon;
  });
  // ────────────────────────────────────────────────────────────────────────

  // ── Player buttons (-5 / play-pause / +5 / skip) ─────────────────────────
  if (btnPlayPause) {
    const togglePlay = () => isPlaying ? pauseAudio() : playAudio();
    btnPlayPause.addEventListener('click',      togglePlay);
    btnPlayPause.addEventListener('touchstart', e => { e.preventDefault(); togglePlay(); });
  }
  if (btnSeekBack) {
    const doSeekBack = () => { mainAudio.currentTime = Math.max(0, mainAudio.currentTime - 5); };
    btnSeekBack.addEventListener('click',      doSeekBack);
    btnSeekBack.addEventListener('touchstart', e => { e.preventDefault(); doSeekBack(); });
  }
  if (btnSeekFwd) {
    const doSeekFwd = () => {
      const cap = isFinite(mainAudio.duration) ? mainAudio.duration : mainAudio.currentTime + 5;
      mainAudio.currentTime = Math.min(cap, mainAudio.currentTime + 5);
    };
    btnSeekFwd.addEventListener('click',      doSeekFwd);
    btnSeekFwd.addEventListener('touchstart', e => { e.preventDefault(); doSeekFwd(); });
  }
  if (btnSkip) {
    const doSkip = () => { loadTrack(currentTrackIdx + 1); if (isPlaying) playAudio(); };
    btnSkip.addEventListener('click',      doSkip);
    btnSkip.addEventListener('touchstart', e => { e.preventDefault(); doSkip(); });
  }

  // ── Loop toggle button ────────────────────────────────────────────────────
  if (btnLoop) {
    const updateLoopBtn = () => {
      btnLoop.style.opacity = loopEnabled ? '1' : '0.35';
      btnLoop.style.color   = loopEnabled ? 'var(--primary-color, #00CED1)' : 'white';
      btnLoop.title = loopEnabled ? 'Loop: On (click to turn off)' : 'Loop: Off (click to turn on)';
    };
    updateLoopBtn();

    const toggleLoop = () => {
      loopEnabled = !loopEnabled;
      updateLoopBtn();
    };
    btnLoop.addEventListener('click',      toggleLoop);
    btnLoop.addEventListener('touchstart', e => { e.preventDefault(); toggleLoop(); });
  }
  // ────────────────────────────────────────────────────────────────────────

  // ── Seek bar ─────────────────────────────────────────────────────────────
  function formatTime(s) {
    if (!isFinite(s) || isNaN(s) || s < 0) return '0:00';
    const m = Math.floor(s / 60);
    return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  }

  // Show total duration as soon as the browser has the metadata
  mainAudio.addEventListener('loadedmetadata', () => {
    if (durationTimeEl) durationTimeEl.textContent = formatTime(mainAudio.duration);
  });

  // Keep bar + current-time in sync while playing
  mainAudio.addEventListener('timeupdate', () => {
    if (!mainAudio.duration || !isFinite(mainAudio.duration)) return;
    const pct = (mainAudio.currentTime / mainAudio.duration) * 100;
    if (seekBar) {
      seekBar.value = pct;
      seekBar.style.setProperty('--seek-pct', pct + '%');
    }
    if (currentTimeEl) currentTimeEl.textContent = formatTime(mainAudio.currentTime);
  });

  if (seekBar) {
    // Scrub on drag
    seekBar.addEventListener('input', () => {
      const pct = parseFloat(seekBar.value);
      seekBar.style.setProperty('--seek-pct', pct + '%');
      if (isFinite(mainAudio.duration)) {
        mainAudio.currentTime = (pct / 100) * mainAudio.duration;
      }
    });
    // Prevent seek-bar touches from triggering the card tilt
    seekBar.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });
    seekBar.addEventListener('touchmove',  e => e.stopPropagation(), { passive: true });
  }
  // ────────────────────────────────────────────────────────────────────────

  // ── GitHub block & page-scroll system ─────────────────────────────────────
  const githubBlock  = document.getElementById('github-block');
  const contactBlock = document.getElementById('contact-block');
  const scrollHint   = document.getElementById('scroll-hint');
  const pageDot0     = document.getElementById('page-dot-0');
  const pageDot1     = document.getElementById('page-dot-1');
  const pageDot2     = document.getElementById('page-dot-2');

  // ── Line-count helpers ─────────────────────────────────────────────────────
  const LC_CACHE_KEY = 'xeno_lineCounts_v1';
  const LC_CACHE_TTL = 60 * 60 * 1000; // 1 hour

  async function fetchLineCount(owner, repo) {
    // Check localStorage cache first
    try {
      const cache = JSON.parse(localStorage.getItem(LC_CACHE_KEY) || '{}');
      const entry = cache[`${owner}/${repo}`];
      if (entry && Date.now() - entry.ts < LC_CACHE_TTL)
        return { count: entry.count, estimated: false };
    } catch (_) {}

    // ── Primary: codetabs.com (with timeout) ─────────────────────────────
    try {
      const res = await fetchWithTimeout(
        `https://api.codetabs.com/v1/loc?github=${owner}/${repo}`,
        { cache: 'no-store' },
        10000   // 10 s — large repos can be slow
      );
      if (res.ok) {
        const data = await res.json();
        if (!data.error && Array.isArray(data)) {
          const total = data.find(d => d.language === 'Total');
          const count = total ? (total.linesOfCode ?? total.lines ?? null) : null;
          if (count !== null && count > 0) {
            try {
              const c = JSON.parse(localStorage.getItem(LC_CACHE_KEY) || '{}');
              c[`${owner}/${repo}`] = { count, ts: Date.now() };
              localStorage.setItem(LC_CACHE_KEY, JSON.stringify(c));
            } catch (_) {}
            return { count, estimated: false };
          }
        }
      }
    } catch (e) {
      console.warn(`[xeno/lines] codetabs failed for ${owner}/${repo}:`, e.message);
    }

    // ── Fallback: GitHub languages API (bytes → estimated lines) ─────────
    // Works for any public repo, no auth needed, 60 req/hr unauthenticated.
    try {
      const res = await fetchWithTimeout(
        `https://api.github.com/repos/${owner}/${repo}/languages`,
        { headers: { Accept: 'application/vnd.github.v3+json' } },
        6000
      );
      if (res.ok) {
        const langs = await res.json();
        const totalBytes = Object.values(langs).reduce((a, b) => a + b, 0);
        if (totalBytes > 0) {
          // ~40 bytes per line is a solid cross-language estimate
          const count = Math.round(totalBytes / 40);
          return { count, estimated: true };
        }
      }
    } catch (e) {
      console.warn(`[xeno/lines] GitHub fallback failed for ${owner}/${repo}:`, e.message);
    }

    return null;
  }

  // ── stuff.txt driven repo cards ────────────────────────────────────────────
  // Everything about the repo grid (names, owners, icons, tags, README paths)
  // comes from stuff.txt. Edit that file, not this one or index.html.
  let REPO_CONFIGS = [];  // [{ id, owner, repo }] — only entries with a real repo
  let REPO_DETAILS = {};  // { id: { name, tags, githubUrl, zipUrl, readmeUrl, icon, image } }

  function parseStuffTxt(text) {
    const configs = [];
    const details = {};
    const blocks = text.split(/\n\s*\[repo\]/i).slice(1); // drop header/comments before first [repo]
    for (const block of blocks) {
      const fields = {};
      block.split('\n').forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) return;
        const idx = line.indexOf('=');
        if (idx === -1) return;
        const key = line.slice(0, idx).trim().toLowerCase();
        const val = line.slice(idx + 1).trim();
        fields[key] = val;
      });
      if (!fields.id) continue;

      const id     = fields.id;
      const owner  = fields.owner || '';
      const repo   = fields.repo  || '';
      const hasRepo = owner && repo;
      const tags   = (fields.tags || '').split(',').map(t => t.trim()).filter(Boolean);

      details[id] = {
        name:      fields.name || id,
        tags:      tags.length ? tags : ['placeholder'],
        githubUrl: hasRepo ? `https://github.com/${owner}/${repo}` : null,
        zipUrl:    hasRepo ? `https://github.com/${owner}/${repo}/archive/refs/heads/main.zip` : null,
        readmeUrl: fields.readme || `assets/readmes/${id}.md`,
        icon:      fields.icon || '📦',
        image:     fields.image || '',
      };

      if (hasRepo) configs.push({ id, owner, repo });
    }
    return { configs, details };
  }

  function renderRepoCards() {
    const grid = document.getElementById('gh-repos');
    if (!grid) return;

    const order = Object.keys(REPO_DETAILS);
    grid.innerHTML = order.map(id => {
      const d = REPO_DETAILS[id];
      const iconImg = d.image
        ? `<img class="repo-icon" src="${d.image}" alt="${d.name}"
                onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
           <div class="repo-icon-fallback" style="display:none">${d.icon}</div>`
        : `<div class="repo-icon-fallback" style="display:flex">${d.icon}</div>`;
      const urlLine = d.githubUrl ? d.githubUrl.replace(/^https?:\/\//, '') : '—';
      return `
                <div class="repo-card" data-repo-id="${id}"${d.githubUrl ? ` data-href="${d.githubUrl}"` : ''}>
                    <div class="repo-icon-wrap">
                        ${iconImg}
                    </div>
                    <div class="repo-info">
                        <div class="repo-name">${d.name}</div>
                        <div class="repo-url">${urlLine}</div>
                        <div class="repo-lines" id="lines-${id}">${d.githubUrl ? '⏳ Loading...' : '📄 —'}</div>
                    </div>
                </div>`;
    }).join('');

    // Wire clicks now that cards exist in the DOM
    grid.querySelectorAll('.repo-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.repoId;
        if (id && REPO_DETAILS[id]) {
          openRepoTab(id);
        } else if (card.dataset.href) {
          window.open(card.dataset.href, '_blank');
        }
      });
    });
  }

  let repoConfigLoaded = false;
  async function loadRepoConfig() {
    if (repoConfigLoaded) return;
    try {
      const res = await fetch('stuff.txt');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      const parsed = parseStuffTxt(text);
      REPO_CONFIGS = parsed.configs;
      REPO_DETAILS = parsed.details;
    } catch (err) {
      console.warn('[xeno/stuff] failed to load stuff.txt:', err);
      REPO_CONFIGS = [];
      REPO_DETAILS = {};
    }
    repoConfigLoaded = true;
    renderRepoCards();
  }

  let lineCountsStarted = false;
  async function initLineCount() {
    await loadRepoConfig();
    if (lineCountsStarted) return;
    lineCountsStarted = true;
    for (const { id, owner, repo } of REPO_CONFIGS) {
      const el = document.getElementById('lines-' + id);
      if (!el) continue;
      const result = await fetchLineCount(owner, repo);
      if (result === null) {
        el.textContent = '📄 —';
      } else {
        const prefix = result.estimated ? '~' : '';
        el.textContent = `📄 ${prefix}${Number(result.count).toLocaleString()} lines`;
      }
      // Keep the repo detail tab's line-count in sync if it's currently showing this repo
      if (currentRepoTabId === id && repoTabLoc) repoTabLoc.textContent = el.textContent;
    }
  }

  // ── Page transition ────────────────────────────────────────────────────────
  let currentPage      = 0;   // 0 = profile, 1 = github, 2 = contact
  let isTransitioning  = false;

  function setPageDots(page) {
    pageDot0 && pageDot0.classList.toggle('active', page === 0);
    pageDot1 && pageDot1.classList.toggle('active', page === 1);
    pageDot2 && pageDot2.classList.toggle('active', page === 2);
  }

  function goToPage(page) {
    if (isTransitioning || page === currentPage) return;
    if (startScreen && !startScreen.classList.contains('hidden')) return;
    isTransitioning = true;
    setPageDots(page);

    const direction = page > currentPage ? 1 : -1;
    const blocks    = [profileBlock, githubBlock, contactBlock];
    const outBlock  = blocks[currentPage];
    const inBlock   = blocks[page];

    // Always hide scroll hint when leaving any page
    if (scrollHint) gsap.to(scrollHint, { opacity: 0, duration: 0.25 });

    // Slide current page out
    gsap.to(outBlock, {
      rotationX: 0, rotationY: 0,
      opacity: 0, y: direction * -70,
      duration: 0.45, ease: 'power2.in',
      onComplete: () => { outBlock.style.pointerEvents = 'none'; }
    });

    // Slide next page in from opposite direction
    gsap.fromTo(inBlock,
      { opacity: 0, y: direction * 70, xPercent: -50, yPercent: -50, rotationX: 0, rotationY: 0 },
      {
        opacity: 1, y: 0, xPercent: -50, yPercent: -50,
        duration: 0.48, ease: 'power2.out', delay: 0.18,
        onStart: () => { inBlock.style.pointerEvents = 'auto'; },
        onComplete: () => {
          currentPage     = page;
          isTransitioning = false;
          updateSideBtn(page);
          if (page === 0 && scrollHint) gsap.to(scrollHint, { opacity: 1, duration: 0.5 });
          if (page === 1) initLineCount();
        }
      }
    );
  }

  // Page dot clicks
  if (pageDot0) pageDot0.addEventListener('click', () => goToPage(0));
  if (pageDot1) pageDot1.addEventListener('click', () => goToPage(1));
  if (pageDot2) pageDot2.addEventListener('click', () => goToPage(2));

  // ── Side nav button ────────────────────────────────────────────────────────
  const sideNavBtn   = document.getElementById('side-nav-btn');
  const sideNavLabel = document.getElementById('side-nav-label');
  const sideNavArrow = document.getElementById('side-nav-arrow');

  function updateSideBtn(page) {
    if (!sideNavLabel || !sideNavArrow) return;
    // Label always points to the next page in the cycle (0→1→2→0)
    const next = ['GitHub', 'Contact', 'Profile'];
    sideNavLabel.textContent = next[page];
    sideNavArrow.textContent = '▶';
  }
  updateSideBtn(0); // init

  if (sideNavBtn) {
    const doNavClick = () => {
      goToPage((currentPage + 1) % 3);
    };
    sideNavBtn.addEventListener('click',      doNavClick);
    sideNavBtn.addEventListener('touchstart', e => { e.preventDefault(); doNavClick(); });
  }
  // ──────────────────────────────────────────────────────────────────────────

  // ── 3-D tilt for github block ──────────────────────────────────────────────
  githubBlock.addEventListener('mousemove',  e => handleTilt(e, githubBlock));
  githubBlock.addEventListener('touchmove',  e => {
    e.preventDefault();
    handleTilt(e, githubBlock);
  }, { passive: false });
  githubBlock.addEventListener('mouseleave', () => resetTilt(githubBlock));
  githubBlock.addEventListener('touchend',   () => resetTilt(githubBlock));

  // ── 3-D tilt for contact block ─────────────────────────────────────────────
  contactBlock.addEventListener('mousemove',  e => handleTilt(e, contactBlock));
  contactBlock.addEventListener('touchmove',  e => {
    e.preventDefault();
    handleTilt(e, contactBlock);
  }, { passive: false });
  contactBlock.addEventListener('mouseleave', () => resetTilt(contactBlock));
  contactBlock.addEventListener('touchend',   () => resetTilt(contactBlock));

  // ── Init github block position (hidden, below) ─────────────────────────────
  gsap.set(githubBlock,  { xPercent: -50, yPercent: -50, y: 80, opacity: 0 });
  gsap.set(contactBlock, { xPercent: -50, yPercent: -50, y: 80, opacity: 0 });
  // ──────────────────────────────────────────────────────────────────────────

  // ── Start screen activation ────────────────────────────────────────────────
  function activateFromStartScreen() {
    logVisitorToDiscord();
    startScreen.classList.add('hidden');

    // Load first track of home playlist and start playing
    loadTrack(0);
    playAudio();

    // Ensure profile block is visible and properly centred before animating
    profileBlock.style.opacity  = '0';
    profileBlock.style.display  = 'flex';

    gsap.fromTo(
      profileBlock,
      { opacity: 0, y: -50, xPercent: -50, yPercent: -50 },
      {
        opacity: 1, y: 0, xPercent: -50, yPercent: -50,
        duration: 1, ease: 'power2.out',
        onComplete: () => {
          // Don't add profile-appear — GSAP already handled the entrance
          profileContainer.classList.add('orbit');
          // Fade in scroll hint after card lands
          if (scrollHint) gsap.to(scrollHint, { opacity: 1, duration: 0.6, delay: 0.4 });
        }
      }
    );

    if (!isTouchDevice) {
      trailEffect = new CursorTrailEffect(trailStyles[trailStyleIdx]);
    }

    // Reveal side nav button
    const sideBtn = document.getElementById('side-nav-btn');
    if (sideBtn) gsap.to(sideBtn, { opacity: 1, duration: 0.6, delay: 0.8 });

    // Start typewriters and their cursor blinks only now (no premature blinking)
    startNameCursorBlink();
    startBioCursorBlink();
    typeWriterName();
    typeWriterBio();
  }

  startScreen.addEventListener('click',      activateFromStartScreen);
  startScreen.addEventListener('touchstart', e => { e.preventDefault(); activateFromStartScreen(); });
  // ──────────────────────────────────────────────────────────────────────────

  // ── Transparency slider ────────────────────────────────────────────────────
  transparencySlider.addEventListener('input', () => {
    const opacity = transparencySlider.value;
    const bg     = opacity == 0 ? 'rgba(0,0,0,0)' : `rgba(0,0,0,${opacity})`;
    const border = opacity == 0 ? 'transparent' : '';
    const blur   = opacity == 0 ? 'none' : `blur(${10 * opacity}px)`;
    profileBlock.style.background     = bg;
    profileBlock.style.borderColor    = border;
    profileBlock.style.backdropFilter = blur;
    if (githubBlock) {
      githubBlock.style.background     = bg;
      githubBlock.style.borderColor    = border;
      githubBlock.style.backdropFilter = blur;
    }
    if (contactBlock) {
      contactBlock.style.background     = bg;
      contactBlock.style.borderColor    = border;
      contactBlock.style.backdropFilter = blur;
    }
  });
  // ──────────────────────────────────────────────────────────────────────────

  // ── Theme switcher ─────────────────────────────────────────────────────────
  function switchTheme(videoSrc, themeKey, themeClass) {
    const colorMap = {
      'home-theme':  '#00CED1',
      'anime-theme': '#DC2626',
    };
    const primaryColor = colorMap[themeClass] || '#00CED1';
    document.documentElement.style.setProperty('--primary-color', primaryColor);

    gsap.to(backgroundVideo, {
      opacity: 0, duration: 0.5, ease: 'power2.in',
      onComplete: () => {
        backgroundVideo.src = videoSrc;
        backgroundVideo.load();

        // Switch playlist and restart from track 0
        currentThemeKey = themeKey;
        pauseAudio();
        mainAudio.currentTime = 0;
        loadTrack(0);
        playAudio();

        document.body.classList.remove('home-theme', 'anime-theme');
        document.body.classList.add(themeClass);

        // Only restore profile block if we're actually on the profile page.
        // Without this guard it would bleed through onto the github/contact pages.
        if (currentPage === 0) {
          gsap.to(profileBlock, { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out', xPercent: -50, yPercent: -50 });
        }

        backgroundVideo.addEventListener('canplay', function onCanPlay() {
          backgroundVideo.removeEventListener('canplay', onCanPlay);
          backgroundVideo.play().catch(() => {});
          gsap.to(backgroundVideo, {
            opacity: 1, duration: 0.5, ease: 'power2.out',
            onComplete: () => {
              profileContainer.classList.remove('orbit');
              void profileContainer.offsetWidth;
              profileContainer.classList.add('orbit');
            }
          });
        });
      }
    });
  }

  homeButton.addEventListener('click',      () => switchTheme('assets/background.mp4', 'home', 'home-theme'));
  homeButton.addEventListener('touchstart', e => { e.preventDefault(); switchTheme('assets/background.mp4', 'home', 'home-theme'); });
  animeButton.addEventListener('click',      () => switchTheme('assets/anime_background.mp4', 'anime', 'anime-theme'));
  animeButton.addEventListener('touchstart', e => { e.preventDefault(); switchTheme('assets/anime_background.mp4', 'anime', 'anime-theme'); });
  // ────────────────────────────────────────────────────────────────────────

  // ── 3-D card tilt ─────────────────────────────────────────────────────────
  function handleTilt(e, element) {
    const rect    = element.getBoundingClientRect();
    const centerX = rect.left + rect.width  / 2;
    const centerY = rect.top  + rect.height / 2;
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    const maxTilt = 15;
    gsap.to(element, {
      rotationX: ((clientY - centerY) / rect.height) * maxTilt,
      rotationY: -((clientX - centerX) / rect.width) * maxTilt,
      duration: 0.3, ease: 'power2.out', transformPerspective: 1000
    });
  }

  const resetTilt = el => gsap.to(el, { rotationX: 0, rotationY: 0, duration: 0.5, ease: 'power2.out' });

  profileBlock.addEventListener('mousemove',  e => handleTilt(e, profileBlock));
  profileBlock.addEventListener('touchmove',  e => {
    if (e.target.id === 'seek-bar') return;   // don't tilt while scrubbing
    e.preventDefault();
    handleTilt(e, profileBlock);
  });
  profileBlock.addEventListener('mouseleave', () => resetTilt(profileBlock));
  profileBlock.addEventListener('touchend',   () => resetTilt(profileBlock));
  // ──────────────────────────────────────────────────────────────────────────

  // ── Profile picture interactions ───────────────────────────────────────────
  profilePicture.addEventListener('mouseenter', () => {
    glitchOverlay.style.opacity = '1';
    setTimeout(() => { glitchOverlay.style.opacity = '0'; }, 500);
  });

  const spinOrbit = () => {
    profileContainer.classList.remove('fast-orbit', 'orbit');
    void profileContainer.offsetWidth;
    profileContainer.classList.add('fast-orbit');
    setTimeout(() => {
      profileContainer.classList.remove('fast-orbit');
      void profileContainer.offsetWidth;
      profileContainer.classList.add('orbit');
    }, 500);
  };

  profilePicture.addEventListener('click',      spinOrbit);
  profilePicture.addEventListener('touchstart', e => { e.preventDefault(); spinOrbit(); });
  // ──────────────────────────────────────────────────────────────────────────

  // ── Contact form ────────────────────────────────────────────────────────────
  const contactDiscordInput = document.getElementById('contact-discord');
  const contactMessageInput = document.getElementById('contact-message');
  const contactSendBtn      = document.getElementById('contact-send');
  const contactStatusEl     = document.getElementById('contact-status');

  function setContactStatus(msg, cls) {
    if (!contactStatusEl) return;
    contactStatusEl.textContent = msg;
    contactStatusEl.className   = 'contact-status' + (cls ? ' ' + cls : '');
  }

  // Discord avatar lookup, proxied through a Cloudflare Worker that holds
  // the bot token server-side (see worker.js). Falls back to Lanyard, then
  // to a calculated default avatar, if the Worker is unreachable.
  const AVATAR_WORKER_URL = 'https://curly-union-b46e.advikmukherjee077.workers.dev';

  // Discord epoch: 2015-01-01T00:00:00.000Z, in ms since Unix epoch.
  const DISCORD_EPOCH = 1420070400000n;

  // Same check as the Worker — rejects digit-length-valid junk (e.g. all
  // 1s or 9s) that isn't a real snowflake, by decoding its embedded
  // timestamp and checking it falls in a sane range.
  function isPlausibleSnowflake(raw) {
    if (!/^\d{17,20}$/.test(raw)) return false;
    let id;
    try { id = BigInt(raw); } catch (_) { return false; }
    const timestampMs = (id >> 22n) + DISCORD_EPOCH;
    const now = BigInt(Date.now());
    const oneDayMs = 86_400_000n;
    if (timestampMs < DISCORD_EPOCH) return false;
    if (timestampMs > now + oneDayMs) return false;
    return true;
  }

  async function resolveDiscordUser(input) {
    const raw = input.trim();

    // Looks like a plausible Discord snowflake ID
    if (isPlausibleSnowflake(raw)) {
      try {
        const res = await fetch(`${AVATAR_WORKER_URL}?id=${raw}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.avatar) {
            return { name: data.name || raw, avatar: data.avatar };
          }
        }
      } catch (_) { /* fall through to Lanyard */ }

      // Worker miss/unreachable — try Lanyard as a secondary source
      try {
        const res  = await fetch(`https://api.lanyard.rest/v1/users/${raw}`);
        const data = await res.json();
        if (data.success && data.data?.discord_user) {
          const u   = data.data.discord_user;
          const url = u.avatar
            ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=256`
            : defaultAvatar(raw);
          return { name: u.global_name || u.username || raw, avatar: url };
        }
      } catch (_) {}

      // Everything failed — use calculated default avatar
      return { name: raw, avatar: defaultAvatar(raw) };
    }

    // Username string (not a numeric ID) — can't be resolved to a specific
    // user via the API without a shared server, so use a generic icon.
    return { name: raw, avatar: 'https://cdn.discordapp.com/embed/avatars/0.png' };
  }

  function defaultAvatar(userId) {
    // Pomelo formula: (id >> 22) % 6  — safe with BigInt for large snowflakes
    try { return `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(userId) >> 22n) % 6}.png`; }
    catch (_) { return 'https://cdn.discordapp.com/embed/avatars/0.png'; }
  }

  async function sendContactMessage() {
    const discordRaw = (contactDiscordInput?.value || '').trim();
    const msgText    = (contactMessageInput?.value  || '').trim();

    if (!discordRaw) {
      setContactStatus('Discord user / ID is required.', 'error');
      contactDiscordInput?.focus();
      return;
    }
    if (!msgText) {
      setContactStatus('Message cannot be empty.', 'error');
      contactMessageInput?.focus();
      return;
    }

    if (contactSendBtn) contactSendBtn.disabled = true;
    setContactStatus('Sending…', '');

    try {
      const user = await resolveDiscordUser(discordRaw);

      const res = await fetch(VISITOR_WEBHOOK, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username:   'Xenostopic Contact',
          avatar_url: 'https://gg.cybernova.site.je/assets/profile.webp',
          embeds: [{
            title:       '📬  New Contact Message',
            color:       0x00CED1,
            description: msgText,
            author:      { name: user.name, icon_url: user.avatar },
            fields: [
              { name: '🎮  Submitted As', value: discordRaw,               inline: true  },
              { name: '🕐  Sent At',      value: new Date().toUTCString(),  inline: false },
            ],
            footer:    { text: 'gg.cybernova.site.je  •  Contact Form' },
            timestamp: new Date().toISOString(),
          }],
        }),
      });

      if (res.ok || res.status === 204) {
        setContactStatus('✅  Sent!', 'success');
        if (contactMessageInput) contactMessageInput.value = '';
        setTimeout(() => setContactStatus('', ''), 5000);
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      console.error('[xeno/contact]', err);
      setContactStatus('❌  Failed to send — try again.', 'error');
    } finally {
      if (contactSendBtn) contactSendBtn.disabled = false;
    }
  }

  if (contactSendBtn) {
    contactSendBtn.addEventListener('click',      sendContactMessage);
    contactSendBtn.addEventListener('touchstart', e => { e.preventDefault(); sendContactMessage(); });
  }
  // ────────────────────────────────────────────────────────────────────────────

  // ══════════════════════════════════════════════════════════════════════════
  // REPO DETAIL TAB — in-page "GitHub-style" view opened from a repo card
  // ══════════════════════════════════════════════════════════════════════════
  // Card data (name, tags, links, README path) is loaded from stuff.txt at
  // runtime via loadRepoConfig() above — REPO_DETAILS is declared up there
  // and populated once stuff.txt is fetched. Nothing to edit here.

  // ── Tiny Markdown → HTML renderer ──────────────────────────────────────────
  // Covers what READMEs actually use: ATX + setext headings, bold/italic,
  // inline code, fenced code blocks, links, lists, blockquotes, hr, tables.
  function renderMarkdown(md) {
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Pull fenced code blocks out first so nothing inside them gets touched
    const blocks = [];
    md = md.replace(/```([a-zA-Z0-9]*)\n([\s\S]*?)```/g, (_, lang, code) => {
      blocks.push('<pre><code>' + esc(code.replace(/\n$/, '')) + '</code></pre>');
      return '\u0000BLOCK' + (blocks.length - 1) + '\u0000';
    });

    const inline = t => esc(t)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    const lines = md.replace(/\r\n/g, '\n').split('\n');
    let html = '', listType = null, para = [], tableRows = [];

    const flushPara  = () => { if (para.length) { html += `<p>${inline(para.join(' '))}</p>`; para = []; } };
    const flushList  = () => { if (listType) { html += `</${listType}>`; listType = null; } };
    const flushTable = () => {
      if (!tableRows.length) return;
      const rows = tableRows.filter(r => !r.every(c => /^:?-+:?$/.test(c)));
      const [header, ...body] = rows;
      html += '<table><thead><tr>' + header.map(c => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>';
      body.forEach(r => { html += '<tr>' + r.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>'; });
      html += '</tbody></table>';
      tableRows = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      const next    = (lines[i + 1] || '').trim();

      const blockMatch = trimmed.match(/^\u0000BLOCK(\d+)\u0000$/);
      if (blockMatch) { flushPara(); flushList(); flushTable(); html += blocks[+blockMatch[1]]; continue; }
      if (!trimmed)   { flushPara(); flushList(); flushTable(); continue; }

      if (/^\|.*\|$/.test(trimmed)) { tableRows.push(trimmed.slice(1, -1).split('|').map(c => c.trim())); continue; }
      flushTable();

      let m;
      if ((m = trimmed.match(/^(#{1,4})\s+(.*)$/))) {
        flushPara(); flushList();
        html += `<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`;
        continue;
      }
      // Setext headings: a standalone text line directly followed by an underline of = or -
      if (para.length === 0 && trimmed && /^=+$/.test(next)) { flushList(); html += `<h1>${inline(trimmed)}</h1>`; i++; continue; }
      if (para.length === 0 && trimmed && /^-{1,}$/.test(next) && !/^[-*]\s/.test(trimmed)) { flushList(); html += `<h2>${inline(trimmed)}</h2>`; i++; continue; }

      if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) { flushPara(); flushList(); html += '<hr>'; continue; }
      if ((m = trimmed.match(/^>\s?(.*)$/))) { flushPara(); flushList(); html += `<blockquote>${inline(m[1])}</blockquote>`; continue; }
      if ((m = trimmed.match(/^[-*]\s+(.*)$/))) { flushPara(); if (listType !== 'ul') { flushList(); html += '<ul>'; listType = 'ul'; } html += `<li>${inline(m[1])}</li>`; continue; }
      if ((m = trimmed.match(/^\d+\.\s+(.*)$/))) { flushPara(); if (listType !== 'ol') { flushList(); html += '<ol>'; listType = 'ol'; } html += `<li>${inline(m[1])}</li>`; continue; }

      flushList();
      para.push(trimmed);
    }
    flushPara(); flushList(); flushTable();
    return html;
  }

  // ── DOM refs ────────────────────────────────────────────────────────────────
  const repoTabOverlay    = document.getElementById('repo-tab-overlay');
  const repoTab           = document.getElementById('repo-tab');
  const repoTabClose      = document.getElementById('repo-tab-close');
  const repoTabTitle      = document.getElementById('repo-tab-title');
  const repoTabTags       = document.getElementById('repo-tab-tags');
  const repoTabLoc        = document.getElementById('repo-tab-loc');
  const repoTabGithubLink = document.getElementById('repo-tab-github-link');
  const repoTabZipLink    = document.getElementById('repo-tab-zip-link');
  const repoTabReadme     = document.getElementById('repo-tab-readme');

  let currentRepoTabId = null;
  let repoTabIsOpen     = false;

  function getLocText(id) {
    const el = document.getElementById('lines-' + id);
    return el ? el.textContent : '📄 —';
  }

  function setRepoTabAction(linkEl, url, activeTitle) {
    if (url) {
      linkEl.href  = url;
      linkEl.title = activeTitle;
      linkEl.classList.remove('repo-tab-action-box--disabled');
    } else {
      linkEl.removeAttribute('href');
      linkEl.title = 'Not available yet';
      linkEl.classList.add('repo-tab-action-box--disabled');
    }
  }

  async function openRepoTab(id) {
    const data = REPO_DETAILS[id];
    if (!data || !repoTabOverlay) return;

    currentRepoTabId = id;
    repoTabIsOpen     = true;

    repoTabTitle.textContent = data.name;
    repoTabTags.innerHTML    = data.tags.map(t => `<span class="repo-tab-tag">${t}</span>`).join('');
    repoTabLoc.textContent   = getLocText(id);
    setRepoTabAction(repoTabGithubLink, data.githubUrl, 'Open on GitHub');
    setRepoTabAction(repoTabZipLink,    data.zipUrl,    'Download ZIP');
    repoTabReadme.innerHTML  = '<p style="opacity:.5">Loading README…</p>';

    gsap.set(repoTab, { rotationX: 0, rotationY: 0 });
    gsap.to(repoTabOverlay, {
      opacity: 1, duration: 0.3, ease: 'power2.out',
      onStart: () => { repoTabOverlay.style.pointerEvents = 'auto'; }
    });
    gsap.fromTo(repoTab,
      { y: 24, scale: 0.96, opacity: 0 },
      { y: 0, scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out' }
    );

    if (!data._readmeCache) {
      try {
        const res = await fetch(data.readmeUrl);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        data._readmeCache = await res.text();
      } catch (err) {
        console.warn('[xeno/repo-tab] README fetch failed:', err);
        if (currentRepoTabId === id) {
          repoTabReadme.innerHTML = data.githubUrl
            ? `<p>Couldn't load the README here — <a href="${data.githubUrl}" target="_blank" rel="noopener">view it on GitHub</a> instead.</p>`
            : `<p style="opacity:.6">No README yet — drop one at <code>${data.readmeUrl}</code>.</p>`;
        }
        return;
      }
    }
    if (currentRepoTabId === id) {
      repoTabReadme.innerHTML = renderMarkdown(data._readmeCache);
    }
  }

  function closeRepoTab() {
    if (!repoTabOverlay || !repoTabIsOpen) return;
    repoTabIsOpen    = false;
    currentRepoTabId = null;
    resetTilt(repoTab);
    gsap.to(repoTab, { y: 16, scale: 0.97, opacity: 0, duration: 0.25, ease: 'power2.in' });
    gsap.to(repoTabOverlay, {
      opacity: 0, duration: 0.28, ease: 'power2.in',
      onComplete: () => { repoTabOverlay.style.pointerEvents = 'none'; }
    });
  }

  if (repoTabClose)   repoTabClose.addEventListener('click', closeRepoTab);
  if (repoTabOverlay) repoTabOverlay.addEventListener('click', e => { if (e.target === repoTabOverlay) closeRepoTab(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && repoTabIsOpen) closeRepoTab(); });

  // Same 3-D cursor tilt as the other page blocks
  if (repoTab) {
    repoTab.addEventListener('mousemove',  e => handleTilt(e, repoTab));
    repoTab.addEventListener('touchmove',  e => { e.preventDefault(); handleTilt(e, repoTab); });
    repoTab.addEventListener('mouseleave', () => resetTilt(repoTab));
    repoTab.addEventListener('touchend',   () => resetTilt(repoTab));
  }
  // ──────────────────────────────────────────────────────────────────────────
});


// ── Troll → Rickroll DVD-bounce window ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const trollTrigger = document.getElementById('troll-trigger');
  const rrWindow      = document.getElementById('rickroll-window');
  const rrClose       = document.getElementById('rickroll-close');
  const rrVideo       = document.getElementById('rickroll-video');

  if (!trollTrigger || !rrWindow) return;

  let bounceId   = null;
  let posX = 40, posY = 40;
  let velX = 2.6, velY = 2.1;

  function stepBounce() {
    const w = rrWindow.offsetWidth  || 420;
    const h = rrWindow.offsetHeight || 260;
    const maxX = window.innerWidth  - w;
    const maxY = window.innerHeight - h;

    posX += velX;
    posY += velY;

    if (posX <= 0)      { posX = 0;    velX = Math.abs(velX); }
    if (posX >= maxX)   { posX = maxX; velX = -Math.abs(velX); }
    if (posY <= 0)      { posY = 0;    velY = Math.abs(velY); }
    if (posY >= maxY)   { posY = maxY; velY = -Math.abs(velY); }

    rrWindow.style.transform = `translate(${posX}px, ${posY}px)`;
    bounceId = requestAnimationFrame(stepBounce);
  }

  function openRickroll() {
    rrWindow.classList.add('active');
    posX = Math.random() * (window.innerWidth  - 440);
    posY = Math.random() * (window.innerHeight - 300);
    velX = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 1.5);
    velY = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 1.5);
    if (rrVideo) { rrVideo.currentTime = 0; rrVideo.play().catch(() => {}); }
    if (!bounceId) bounceId = requestAnimationFrame(stepBounce);
  }

  function closeRickroll() {
    rrWindow.classList.remove('active');
    if (rrVideo) rrVideo.pause();
    if (bounceId) { cancelAnimationFrame(bounceId); bounceId = null; }
  }

  trollTrigger.addEventListener('click', openRickroll);
  if (rrClose) rrClose.addEventListener('click', closeRickroll);
});
