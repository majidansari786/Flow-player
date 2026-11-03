/*! FlowPlayer v1.1.1 | MIT | Streaming video player: HLS, MP4, WebM */
(function (g, f) { typeof module === 'object' && module.exports ? module.exports = f() : g.FlowPlayer = f(); })(typeof self !== 'undefined' ? self : this, function () {
'use strict';

const P = {
  play: 'M8 5v14l11-7z', pause: 'M6 5h4v14H6zm8 0h4v14h-4z',
  vol: 'M3 9v6h4l5 5V4L7 9zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4z',
  mute: 'M16.5 12A4.5 4.5 0 0 0 14 8v2.2l2.5 2.5zM19 12c0 .9-.2 1.8-.5 2.5l1.5 1.5A9 9 0 0 0 21 12a9 9 0 0 0-7-8.8v2.1c2.9.9 5 3.5 5 6.7zM4.3 3 3 4.3 7.7 9H3v6h4l5 5v-6.7l4.3 4.3c-.7.5-1.4.9-2.3 1.1v2.1a9 9 0 0 0 3.6-1.8l2.1 2.1 1.3-1.3L4.3 3zM12 4 9.9 6.1 12 8.2z',
  cog: 'M19.4 13a7.5 7.5 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.4 7.4 0 0 0-1.7-1L15 3h-4l-.4 2.9a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.5 7.5 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1c.5.4 1.1.7 1.7 1L11 21h4l.4-2.9c.6-.3 1.2-.6 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z',
  pip: 'M19 7h-8v6h8zm4-4H1v18h22zm-2 16H3V5h18z',
  fs: 'M7 14H5v5h5v-2H7zm-2-4h2V7h3V5H5zm12 7h-3v2h5v-5h-2zM14 5v2h3v3h2V5z',
  fsx: 'M5 16h3v3h2v-5H5zm3-8H5v2h5V5H8zm6 11h2v-3h3v-2h-5zm2-11V5h-2v5h5V8z',
  back: 'M12 5V1L7 6l5 5V7c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8z',
  fwd: 'M12 5V1l5 5-5 5V7c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6h2c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8z'
};
const ico = n => `<svg viewBox="0 0 24 24"><path d="${P[n]}"/></svg>`;
const skipIco = n => `<svg viewBox="0 0 24 24"><path d="${P[n]}"/><text class="f-n" x="12" y="16.2" text-anchor="middle" font-size="7" font-weight="700" font-family="system-ui,sans-serif">10</text></svg>`;
const fmt = s => { if (!isFinite(s)) return '0:00'; s = Math.floor(s); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), c = String(s % 60).padStart(2, '0'); return h ? `${h}:${String(m).padStart(2, '0')}:${c}` : `${m}:${c}`; };
const DEF = { fit: 'contain', skip: 10, brightness: 1, contrast: 1, saturate: 1, loop: false, remember: true, autohide: true, mirror: false };
const ALL = new Set();

const CSS = `
.flp{--a:var(--fp-accent,#dc2626);--b:var(--fp-accent2,#ff5a4d);position:relative;width:100%;background:#000;border-radius:var(--fp-radius,16px);overflow:hidden;aspect-ratio:16/9;color:#fff;font:13px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;user-select:none;-webkit-user-select:none;outline:none;box-shadow:0 24px 60px -24px rgba(239,68,68,.55)}
.flp *{box-sizing:border-box}
.flp:fullscreen{border-radius:0;aspect-ratio:auto}
.flp video{width:100%;height:100%;display:block;background:#000}
.flp.idle{cursor:none}
.flp .f-shade{position:absolute;inset:auto 0 0 0;height:45%;background:linear-gradient(transparent,rgba(0,0,0,.75));opacity:0;transition:opacity .3s;pointer-events:none}
.flp .f-bar{position:absolute;left:12px;right:12px;bottom:12px;padding:4px 14px 6px;border-radius:16px;background:rgba(20,8,10,.55);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.08);opacity:0;transform:translateY(8px);transition:opacity .3s,transform .3s}
.flp:not(.idle):hover .f-shade,.flp:not(.idle):hover .f-bar,.flp.paused .f-shade,.flp.paused .f-bar,.flp.menu .f-bar,.flp.menu .f-shade{opacity:1;transform:none}
.flp.idle .f-shade,.flp.idle .f-bar{opacity:0}
.flp.f-nc .f-bar,.flp.f-nc .f-shade,.flp.f-nc .f-menu{display:none}
.flp .f-prog{position:relative;height:18px;display:flex;align-items:center;cursor:pointer;touch-action:none}
.flp .f-track{position:relative;width:100%;height:4px;border-radius:4px;background:rgba(255,255,255,.25);transition:height .15s}
.flp .f-prog:hover .f-track,.flp .f-prog.drag .f-track{height:7px}
.flp .f-buf,.flp .f-played{position:absolute;left:0;top:0;bottom:0;border-radius:4px}
.flp .f-buf{background:rgba(255,255,255,.35)}
.flp .f-played{background:linear-gradient(90deg,var(--a),var(--b))}
.flp .f-thumb{position:absolute;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:#fff;transform:scale(0);transition:transform .15s;box-shadow:0 2px 6px rgba(0,0,0,.4)}
.flp .f-prog:hover .f-thumb,.flp .f-prog.drag .f-thumb{transform:scale(1)}
.flp .f-tip{position:absolute;bottom:24px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:4px;background:rgba(20,10,12,.92);padding:3px 8px;border-radius:8px;font-size:12px;opacity:0;pointer-events:none;transition:opacity .15s;border:1px solid rgba(255,255,255,.1)}
.flp .f-tip.has{padding:4px 4px 3px}
.flp .f-pc{display:none;width:160px;border-radius:6px;background:#000}
.flp .f-tip.has .f-pc{display:block}
.flp .f-prog:hover .f-tip,.flp .f-prog.drag .f-tip{opacity:1}
.flp .f-row{display:flex;align-items:center;gap:4px}
.flp .f-sp{flex:1}
.flp .f-ib{background:none;border:0;color:#fff;width:38px;height:38px;border-radius:10px;display:grid;place-items:center;cursor:pointer;padding:0;transition:background .2s,transform .15s}
.flp .f-ib:hover{background:rgba(255,255,255,.16)}.flp .f-ib:active{transform:scale(.9)}
.flp .f-ib svg{width:22px;height:22px;fill:currentColor}
.flp .f-play{background:linear-gradient(135deg,var(--a),var(--b));margin-right:4px}
.flp .f-play:hover{filter:brightness(1.15);background:linear-gradient(135deg,var(--a),var(--b))}
.flp .f-vol{display:flex;align-items:center}
.flp .f-vol input{width:0;opacity:0;transition:width .25s,opacity .25s,margin .25s;accent-color:var(--b);height:4px;cursor:pointer;margin:0}
.flp .f-vol:hover input,.flp .f-vol input:focus{width:80px;opacity:1;margin:0 8px 0 2px}
.flp .f-time{font-variant-numeric:tabular-nums;margin-left:6px;opacity:.9;white-space:nowrap}
.flp .f-menu{position:absolute;right:12px;bottom:92px;width:290px;max-width:calc(100% - 24px);max-height:calc(100% - 150px);overflow:auto;background:rgba(26,12,14,.94);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:10px;opacity:0;transform:translateY(10px) scale(.97);transform-origin:bottom right;pointer-events:none;transition:opacity .2s,transform .2s}
.flp.menu .f-menu{opacity:1;transform:none;pointer-events:auto}
.flp .f-menu h4{margin:6px 6px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;opacity:.6}
.flp .f-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px}
.flp .f-chip{border:1px solid rgba(255,255,255,.15);background:transparent;color:#fff;padding:4px 10px;border-radius:999px;cursor:pointer;font:inherit;font-size:12px;transition:background .2s}
.flp .f-chip:hover{background:rgba(255,255,255,.12)}
.flp .f-chip.on{background:linear-gradient(135deg,var(--a),var(--b));border-color:transparent}
.flp .f-sw,.flp .f-rg{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:5px 6px;font-size:12.5px;cursor:pointer}
.flp .f-sw input{appearance:none;-webkit-appearance:none;width:34px;height:20px;border-radius:20px;background:rgba(255,255,255,.2);position:relative;transition:background .25s;cursor:pointer;flex:none;margin:0}
.flp .f-sw input::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .25s}
.flp .f-sw input:checked{background:linear-gradient(90deg,var(--a),var(--b))}
.flp .f-sw input:checked::after{transform:translateX(14px)}
.flp .f-rg input{width:130px;accent-color:var(--b)}
.flp .f-rst{width:100%;margin-top:8px;padding:8px;border-radius:10px;border:1px solid rgba(255,255,255,.15);background:transparent;color:#fff;cursor:pointer;font:inherit;font-size:12.5px;transition:background .2s}
.flp .f-rst:hover{background:rgba(239,68,68,.3)}
.flp .f-flash{position:absolute;top:50%;left:50%;width:76px;height:76px;margin:-38px;border-radius:50%;background:rgba(0,0,0,.55);display:grid;place-items:center;opacity:0;pointer-events:none}
.flp .f-flash svg{width:36px;height:36px;fill:#fff}
.flp .f-flash.go{animation:f-pop .55s ease-out}
@keyframes f-pop{0%{opacity:.95;transform:scale(.7)}100%{opacity:0;transform:scale(1.35)}}
.flp .f-fx{position:absolute;top:0;bottom:0;width:30%;display:grid;place-items:center;font-weight:600;background:rgba(255,255,255,.12);opacity:0;pointer-events:none}
.flp .f-l{left:0;border-radius:0 100% 100% 0/0 50% 50% 0}.flp .f-r{right:0;border-radius:100% 0 0 100%/50% 0 0 50%}
.flp .f-fx.go{animation:f-fade .6s ease-out}
@keyframes f-fade{0%{opacity:1}100%{opacity:0}}
.flp .f-spin{position:absolute;top:50%;left:50%;width:46px;height:46px;margin:-23px;border:3px solid rgba(255,255,255,.25);border-top-color:var(--b);border-radius:50%;animation:f-rot .8s linear infinite;opacity:0;transition:opacity .2s;pointer-events:none}
.flp.wait .f-spin{opacity:1}
@keyframes f-rot{to{transform:rotate(360deg)}}
.flp .f-toast{position:absolute;top:14px;left:50%;transform:translate(-50%,-10px);background:rgba(20,10,12,.85);padding:6px 14px;border-radius:999px;opacity:0;transition:.25s;pointer-events:none;white-space:nowrap}
.flp .f-toast.on{opacity:1;transform:translate(-50%,0)}`;

const chips = (attr, items) => items.map(([v, t, on]) => `<button class="f-chip${on ? ' on' : ''}" ${attr}="${v}">${t}</button>`).join('');
const range = (k, mn, mx, t) => `<label class="f-rg"><span>${t}</span><input type="range" data-f="${k}" min="${mn}" max="${mx}" step=".05"></label>`;
const sw = (k, t) => `<label class="f-sw"><span>${t}</span><input type="checkbox" data-t="${k}"></label>`;

const TPL = o => `<video playsinline preload="metadata"${o.poster ? ` poster="${o.poster}"` : ''}></video>
<div class="f-fx f-l"></div><div class="f-fx f-r"></div><div class="f-flash"></div><div class="f-spin"></div><div class="f-toast"></div><div class="f-shade"></div>
<div class="f-menu"><h4>Speed</h4><div class="f-chips">${chips('data-s', o.speeds.map(s => [s, s + '×', s === 1]))}</div>
<h4>Quality</h4><div class="f-chips" data-q><button class="f-chip on" data-l="-1">Auto</button></div>
<h4>Picture</h4><div class="f-chips">${chips('data-fit', [['contain', 'Fit'], ['cover', 'Fill'], ['fill', 'Stretch']])}</div>
${range('brightness', .5, 1.5, 'Brightness')}${range('contrast', .5, 1.5, 'Contrast')}${range('saturate', 0, 2, 'Saturation')}
<h4>Skip step</h4><div class="f-chips">${chips('data-skip', [5, 10, 15, 30].map(n => [n, n + 's']))}</div>
<h4>Playback</h4>${sw('loop', 'Loop video')}${sw('remember', 'Remember position')}${sw('autohide', 'Auto-hide controls')}${sw('mirror', 'Mirror video')}
<button class="f-rst">Reset all settings</button></div>
<div class="f-bar"><div class="f-prog"><div class="f-track"><div class="f-buf"></div><div class="f-played"></div><div class="f-thumb"></div></div><div class="f-tip"><canvas class="f-pc" width="160" height="90"></canvas><span>0:00</span></div></div>
<div class="f-row"><button class="f-ib f-play" data-a="play" title="Play (k)"></button>
<div class="f-vol"><button class="f-ib" data-a="mute" title="Mute (m)"></button><input type="range" min="0" max="1" step="0.02" value="1" aria-label="Volume"></div>
<span class="f-time">0:00 / 0:00</span><span class="f-sp"></span>
<button class="f-ib" data-a="back" title="Rewind (j)">${skipIco('back')}</button><button class="f-ib" data-a="fwd" title="Forward (l)">${skipIco('fwd')}</button>
<button class="f-ib" data-a="menu" title="Settings"></button><button class="f-ib" data-a="pip" title="Picture in picture (i)"></button><button class="f-ib" data-a="fs" title="Fullscreen (f)"></button></div></div>`;

class FlowPlayer {
  constructor(target, opts = {}) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) throw new Error('FlowPlayer: target not found');
    if (el._flp) return el._flp;
    const d = el.dataset, dd = {};
    [['src', 'flowSrc'], ['poster', 'flowPoster'], ['accent', 'flowAccent'], ['accent2', 'flowAccent2']].forEach(([k, n]) => { if (d[n]) dd[k] = d[n]; });
    ['autoplay', 'muted', 'loop'].forEach(k => { if ('flow' + k[0].toUpperCase() + k.slice(1) in d) dd[k] = true; });
    this.o = Object.assign({}, FlowPlayer.defaults, dd, opts);
    if (!document.getElementById('flp-css')) { const s = document.createElement('style'); s.id = 'flp-css'; s.textContent = CSS; document.head.appendChild(s); }
    this.r = el; el._flp = this; this.h = {}; this.hls = null; this.blob = null; this.src = ''; this._sv = 0;
    el.classList.add('flp', 'paused'); if (!this.o.controls) el.classList.add('f-nc');
    if (this.o.accent) el.style.setProperty('--fp-accent', this.o.accent);
    if (this.o.accent2) el.style.setProperty('--fp-accent2', this.o.accent2);
    el.tabIndex = 0; el.innerHTML = TPL(this.o);
    this.q = s => el.querySelector(s); this.v = this.q('video');
    this.v.muted = !!this.o.muted;
    this.initSettings(); this.bind(); this.sync(); ALL.add(this);
    if (this.o.src) this.load(this.o.src);
  }
  /* ---------- public API ---------- */
  async load(url, { key, hls, autoplay } = {}) {
    this.unload(); this.src = key || url; this.url = url; const v = this.v; this.r.classList.add('wait');
    const isHls = hls || /\.m3u8(\?|$)/i.test(url);
    if (isHls && !v.canPlayType('application/vnd.apple.mpegurl')) {
      try { await FlowPlayer.loadHls(this.o.hlsSrc); } catch (e) { return this.fail(e); }
      if (!window.Hls || !Hls.isSupported()) return this.fail(new Error('HLS is not supported in this browser'));
      this.hls = new Hls({ capLevelToPlayerSize: true });
      this.hls.loadSource(url); this.hls.attachMedia(v);
      this.hls.on(Hls.Events.MANIFEST_PARSED, (e, m) => this.levels(m.levels));
      this.hls.on(Hls.Events.ERROR, (e, x) => { if (x.fatal) this.fail(new Error('Stream error: ' + x.type)); });
    } else v.src = url;
    v.addEventListener('loadedmetadata', () => this.resume(), { once: true });
    if (autoplay === undefined ? this.o.autoplay : autoplay) this.play();
    return this;
  }
  loadFile(file, o = {}) { const u = URL.createObjectURL(file); this.load(u, Object.assign({ key: 'file:' + file.name + file.size }, o)); this.blob = u; this.toast(file.name); return this; }
  play() { return this.v.play().catch(() => {}); }
  pause() { this.v.pause(); return this; }
  toggle() { if (!this.v.currentSrc && !this.hls) return this; this.v.paused ? this.play() : this.pause(); return this; }
  seek(t) { this.v.currentTime = Math.max(0, Math.min(this.v.duration || 0, t)); return this; }
  skip(d) { return this.seek(this.v.currentTime + d); }
  volume(x) { if (x === undefined) return this.v.volume; this.v.volume = Math.max(0, Math.min(1, x)); this.v.muted = this.v.volume === 0; return this; }
  mute(b) { this.v.muted = b === undefined ? !this.v.muted : !!b; return this; }
  speed(x) { this.v.playbackRate = x; return this; }
  quality(i) { if (this.hls) { this.hls.currentLevel = i; this.mark('data-l', i); this.emit('qualitychange', i); } return this; }
  fullscreen() { const d = document; d.fullscreenElement === this.r ? d.exitFullscreen() : (this.r.requestFullscreen || this.r.webkitRequestFullscreen).call(this.r); return this; }
  async pip() { try { document.pictureInPictureElement ? await document.exitPictureInPicture() : await this.v.requestPictureInPicture(); } catch (e) { this.toast('PiP not available'); } return this; }
  get currentTime() { return this.v.currentTime; }
  get duration() { return this.v.duration || 0; }
  get paused() { return this.v.paused; }
  on(e, f) { (this.h[e] = this.h[e] || []).push(f); return this; }
  off(e, f) { this.h[e] = (this.h[e] || []).filter(x => x !== f); return this; }
  emit(e, data) { (this.h[e] || []).forEach(f => f(data)); this.r.dispatchEvent(new CustomEvent('flowplayer:' + e, { detail: data })); }
  destroy() {
    this.save(); this.unload(); document.removeEventListener('fullscreenchange', this._fsc); window.removeEventListener('beforeunload', this._bu);
    clearTimeout(this.idleT); ALL.delete(this); this.r.innerHTML = ''; this.r.classList.remove('flp', 'paused', 'idle', 'menu', 'wait', 'f-nc'); delete this.r._flp;
  }
  static loadHls(url) {
    if (window.Hls) return Promise.resolve();
    return FlowPlayer._hp || (FlowPlayer._hp = new Promise((res, rej) => { const s = document.createElement('script'); s.src = url; s.onload = res; s.onerror = () => { FlowPlayer._hp = null; rej(new Error('hls.js failed to load')); }; document.head.appendChild(s); }));
  }
  static init(sel = '[data-flow-src]') { return [...document.querySelectorAll(sel)].map(e => new FlowPlayer(e)); }

  /* ---------- internals ---------- */
  killPreview() {
    if (this.pvh) { this.pvh.destroy(); this.pvh = null; }
    if (this.pv) { this.pv.removeAttribute('src'); this.pv.load(); this.pv = null; }
    this.pvReady = false; this.pvInit = false; this.sprite = null; this._ps = -1; clearTimeout(this._pt);
    const tp = this.q && this.q('.f-tip'); if (tp) tp.classList.remove('has');
  }
  setupPreview() {
    if (this.pvInit || this.o.preview === false || !this.url) return; this.pvInit = true;
    const th = this.o.thumbs;
    if (th && th.url) { const im = new Image(); im.onload = () => { this.sprite = im; }; im.src = th.url; return; }
    const pv = this.pv = document.createElement('video'); pv.muted = true; pv.preload = 'metadata'; pv.playsInline = true;
    pv.addEventListener('loadedmetadata', () => { const c = this.q('.f-pc'); if (!c) return; c.height = Math.round(160 * (pv.videoHeight || 90) / (pv.videoWidth || 160)); this.pvReady = true; this.q('.f-tip').classList.add('has'); });
    pv.addEventListener('seeked', () => this.drawPv());
    if (this.hls && window.Hls) {
      const h = this.pvh = new Hls({ startLevel: 0, maxBufferLength: 3, capLevelToPlayerSize: false });
      h.loadSource(this.url); h.attachMedia(pv);
      h.on(Hls.Events.MANIFEST_PARSED, () => { h.currentLevel = 0; });
      h.on(Hls.Events.ERROR, (e, x) => { if (x.fatal) this.killPreview(); });
    } else pv.src = this.url;
  }
  drawPv() { const c = this.q('.f-pc'); if (!c || !this.pvReady) return; try { c.getContext('2d').drawImage(this.pv, 0, 0, c.width, c.height); } catch (e) {} }
  showPreview(t) {
    const th = this.o.thumbs, c = this.q('.f-pc');
    if (this.sprite && th) {
      const w = th.width, h = th.height, i = Math.floor(t / (th.interval || 5)), cols = th.cols || 10;
      c.height = Math.round(160 * h / w); c.getContext('2d').drawImage(this.sprite, (i % cols) * w, Math.floor(i / cols) * h, w, h, 0, 0, c.width, c.height);
      this.q('.f-tip').classList.add('has'); return;
    }
    if (this.pv && this.pvReady) {
      const st = this.o.previewStep || 10, s = Math.max(0, Math.min(Math.floor(t / st) * st, (this.v.duration || 0) - 1));
      if (s === this._ps) return; this._ps = s;
      clearTimeout(this._pt); this._pt = setTimeout(() => { if (this.pv) this.pv.currentTime = s; }, 120);
    }
  }
  toast(t) { const e = this.q('.f-toast'); e.textContent = t; e.classList.add('on'); clearTimeout(this._t); this._t = setTimeout(() => e.classList.remove('on'), 1200); }
  fail(e) { this.r.classList.remove('wait'); this.toast(e.message || 'Could not load this video'); this.emit('error', e); return this; }
  flash(n) { const e = this.q('.f-flash'); e.innerHTML = ico(n); e.classList.remove('go'); void e.offsetWidth; e.classList.add('go'); }
  fx(side) { const e = this.q('.f-' + side); e.classList.remove('go'); void e.offsetWidth; e.classList.add('go'); }
  mark(attr, val) { this.r.querySelectorAll('[' + attr + ']').forEach(c => c.classList.toggle('on', c.getAttribute(attr) == val)); }
  levels(ls) { this.q('[data-q]').innerHTML = '<button class="f-chip on" data-l="-1">Auto</button>' + ls.map((l, i) => `<button class="f-chip" data-l="${i}">${l.height ? l.height + 'p' : Math.round(l.bitrate / 1000) + 'k'}</button>`).join(''); this.emit('levels', ls); }
  unload() { this.killPreview(); if (this.hls) { this.hls.destroy(); this.hls = null; } if (this.blob) { URL.revokeObjectURL(this.blob); this.blob = null; } this.v.removeAttribute('src'); this.v.load(); }
  resume() { try { if (!this.st.remember) return; const t = parseFloat(localStorage.getItem('flp:pos:' + this.src)); if (t > 5 && t < this.v.duration - 10) { this.v.currentTime = t; this.toast('Resumed at ' + fmt(t)); } } catch (e) {} }
  save() { try { if (this.st.remember && this.src && this.v.currentTime > 0) localStorage.setItem('flp:pos:' + this.src, this.v.currentTime); } catch (e) {} }
  initSettings() {
    const s = Object.assign({}, DEF); try { Object.assign(s, JSON.parse(localStorage.getItem('flp:settings') || '{}')); } catch (e) {}
    if (this.o.loop) s.loop = true; this.st = s;
    const m = this.q('.f-menu');
    m.addEventListener('click', e => {
      if (e.target.closest('.f-rst')) { Object.assign(s, DEF); this.apply(); this.toast('Settings reset'); return; }
      const c = e.target.closest('.f-chip'); if (!c) return; const d = c.dataset;
      if (d.s) this.speed(+d.s); else if (d.l !== undefined) this.quality(+d.l);
      else if (d.fit) { s.fit = d.fit; this.apply(); } else if (d.skip) { s.skip = +d.skip; this.apply(); }
    });
    m.addEventListener('input', e => { const t = e.target; if (t.dataset.f) { s[t.dataset.f] = +t.value; this.apply(); } if (t.dataset.t) { s[t.dataset.t] = t.checked; this.apply(); } });
    this.apply();
  }
  apply() {
    const s = this.st, v = this.v, r = this.r;
    v.style.objectFit = s.fit; v.style.filter = `brightness(${s.brightness}) contrast(${s.contrast}) saturate(${s.saturate})`;
    v.style.transform = s.mirror ? 'scaleX(-1)' : ''; v.loop = s.loop;
    this.q('.f-l').textContent = '\u2212' + s.skip + 's'; this.q('.f-r').textContent = '+' + s.skip + 's';
    r.querySelectorAll('.f-n').forEach(t => t.textContent = s.skip);
    this.mark('data-fit', s.fit); this.mark('data-skip', s.skip);
    r.querySelectorAll('[data-t]').forEach(c => c.checked = !!s[c.dataset.t]);
    r.querySelectorAll('[data-f]').forEach(c => c.value = s[c.dataset.f]);
    try { localStorage.setItem('flp:settings', JSON.stringify(s)); } catch (e) {}
  }
  sync() {
    const v = this.v, q = a => this.q(`[data-a=${a}]`);
    q('play').innerHTML = ico(v.paused ? 'play' : 'pause'); q('mute').innerHTML = ico(v.muted || !v.volume ? 'mute' : 'vol');
    q('menu').innerHTML = ico('cog'); q('pip').innerHTML = ico('pip'); q('fs').innerHTML = ico(document.fullscreenElement === this.r ? 'fsx' : 'fs');
    this.r.classList.toggle('paused', v.paused);
  }
  tick() {
    const v = this.v, d = v.duration || 0, p = d ? v.currentTime / d * 100 : 0;
    this.q('.f-played').style.width = p + '%'; this.q('.f-thumb').style.left = p + '%';
    if (v.buffered.length && d) this.q('.f-buf').style.width = v.buffered.end(v.buffered.length - 1) / d * 100 + '%';
    this.q('.f-time').textContent = fmt(v.currentTime) + ' / ' + fmt(d);
  }
  wake() { const r = this.r; r.classList.remove('idle'); clearTimeout(this.idleT); this.idleT = setTimeout(() => { if (this.st.autohide && !this.v.paused && !r.classList.contains('menu')) r.classList.add('idle'); }, 2500); }
  bind() {
    const v = this.v, r = this.r, vol = this.q('.f-vol input'), prog = this.q('.f-prog'), tip = this.q('.f-tip');
    v.addEventListener('play', () => { if (this.o.exclusive) ALL.forEach(p => p !== this && p.pause()); this.sync(); this.emit('play'); });
    v.addEventListener('pause', () => { this.sync(); this.emit('pause'); });
    v.addEventListener('ended', () => this.emit('ended'));
    v.addEventListener('volumechange', () => { this.sync(); vol.value = v.muted ? 0 : v.volume; this.emit('volumechange', { volume: v.volume, muted: v.muted }); });
    v.addEventListener('ratechange', () => { this.mark('data-s', v.playbackRate); this.emit('ratechange', v.playbackRate); });
    v.addEventListener('timeupdate', () => { this.tick(); if (Date.now() - this._sv > 3000) { this._sv = Date.now(); this.save(); } this.emit('timeupdate', { currentTime: v.currentTime, duration: v.duration }); });
    v.addEventListener('progress', () => this.tick()); v.addEventListener('durationchange', () => this.tick());
    v.addEventListener('loadedmetadata', () => this.emit('ready', { duration: v.duration }));
    v.addEventListener('waiting', () => r.classList.add('wait'));
    ['playing', 'canplay', 'loadeddata'].forEach(e => v.addEventListener(e, () => r.classList.remove('wait')));
    v.addEventListener('error', () => { if (v.getAttribute('src')) this.fail(new Error('Could not load this video')); });
    this._fsc = () => this.sync(); this._bu = () => this.save();
    document.addEventListener('fullscreenchange', this._fsc); window.addEventListener('beforeunload', this._bu);
    ['mousemove', 'touchstart', 'keydown'].forEach(e => r.addEventListener(e, () => this.wake()));
    let last = 0, timer = null;
    v.addEventListener('click', e => {
      const now = Date.now(), b = v.getBoundingClientRect(), x = (e.clientX - b.left) / b.width;
      if (now - last < 300) { clearTimeout(timer); last = 0; if (x < .33) { this.skip(-this.st.skip); this.fx('l'); } else if (x > .66) { this.skip(this.st.skip); this.fx('r'); } else this.fullscreen(); }
      else { last = now; timer = setTimeout(() => { if (r.classList.contains('menu')) r.classList.remove('menu'); else { this.toggle(); this.flash(v.paused ? 'pause' : 'play'); } }, 300); }
    });
    r.querySelectorAll('[data-a]').forEach(b => b.addEventListener('click', () => {
      const a = b.dataset.a;
      if (a === 'play') this.toggle(); else if (a === 'back') { this.skip(-this.st.skip); this.fx('l'); } else if (a === 'fwd') { this.skip(this.st.skip); this.fx('r'); }
      else if (a === 'mute') this.mute(); else if (a === 'menu') r.classList.toggle('menu'); else if (a === 'pip') this.pip(); else if (a === 'fs') this.fullscreen();
    }));
    vol.addEventListener('input', () => this.volume(+vol.value));
    const at = e => { const b = prog.getBoundingClientRect(); return Math.max(0, Math.min(1, (e.clientX - b.left) / b.width)); };
    let drag = false;
    prog.addEventListener('pointerdown', e => { drag = true; prog.classList.add('drag'); prog.setPointerCapture(e.pointerId); if (v.duration) v.currentTime = at(e) * v.duration; });
    prog.addEventListener('pointerenter', () => this.setupPreview());
    prog.addEventListener('pointermove', e => { const p = at(e), t = p * (v.duration || 0), w = prog.clientWidth, half = tip.offsetWidth / 2; tip.style.left = Math.max(half, Math.min(w - half, p * w)) + 'px'; tip.querySelector('span').textContent = fmt(t); this.setupPreview(); this.showPreview(t); if (drag && v.duration) v.currentTime = t; });
    const up = () => { drag = false; prog.classList.remove('drag'); };
    prog.addEventListener('pointerup', up); prog.addEventListener('pointercancel', up);
    r.addEventListener('keydown', e => {
      if (e.target.matches('input[type=range]') && e.key.startsWith('Arrow')) return;
      const k = e.key; let h = true;
      if (k === ' ' || k === 'k') this.toggle(); else if (k === 'ArrowRight') { this.skip(5); this.toast('+5s'); } else if (k === 'ArrowLeft') { this.skip(-5); this.toast('\u22125s'); }
      else if (k === 'l') { this.skip(this.st.skip); this.fx('r'); } else if (k === 'j') { this.skip(-this.st.skip); this.fx('l'); }
      else if (k === 'ArrowUp') { this.volume(v.volume + .05); this.toast('Volume ' + Math.round(v.volume * 100) + '%'); } else if (k === 'ArrowDown') { this.volume(v.volume - .05); this.toast('Volume ' + Math.round(v.volume * 100) + '%'); }
      else if (k === 'm') this.mute(); else if (k === 'f') this.fullscreen(); else if (k === 'i') this.pip();
      else if (k === '>' || k === '<') { const sp = this.o.speeds, i = sp.indexOf(v.playbackRate), n = sp[Math.max(0, Math.min(sp.length - 1, (i < 0 ? sp.indexOf(1) : i) + (k === '>' ? 1 : -1)))]; this.speed(n); this.toast(n + '\u00d7'); }
      else if (/^[0-9]$/.test(k) && v.duration) v.currentTime = v.duration * k / 10; else h = false;
      if (h) e.preventDefault();
    });
  }
}
FlowPlayer.version = '1.1.1';
FlowPlayer.defaults = { src: '', poster: '', autoplay: false, muted: false, loop: false, controls: true, preview: true, previewStep: 10, thumbs: null, exclusive: true, accent: '', accent2: '', speeds: [0.5, 0.75, 1, 1.25, 1.5, 2], hlsSrc: 'https://cdn.jsdelivr.net/npm/hls.js@1.5.13/dist/hls.min.js' };

if (typeof document !== 'undefined' && !window.FLOWPLAYER_NO_AUTO) {
  const go = () => FlowPlayer.init();
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', go) : go();
}
return FlowPlayer;
});
