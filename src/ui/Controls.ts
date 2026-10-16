import { createIcons, Play, Pause, RotateCcw, Maximize, Download, Flower2, ArrowUpRight, Check, X, Film, Leaf, Sparkles } from 'lucide';
export const chapters = [
  { time: 0, title: 'A world waiting', end: 7 }, { time: 7, title: 'The little journey', end: 18 },
  { time: 18, title: 'A special delivery', end: 28 }, { time: 28, title: 'A touch of magic', end: 37 },
  { time: 37, title: 'A name to remember', end: 45 }, { time: 45, title: 'Welcome, little one', end: 60 },
];
export function createUI() {
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <header class="site-header"><a class="wordmark" href="./" aria-label="Little Worlds home"><span class="brand-symbol"><i data-lucide="flower-2"></i></span>little worlds<span class="wordmark-dot">.</span></a><span class="header-note">Small beginnings. Endless possibilities.</span><span class="edition">A film for Atharva <i data-lucide="sparkles"></i></span></header>
    <main>
      <div class="page-heading"><div><h1>A very special delivery.</h1><p>A little adventure to welcome a whole new world of love.</p></div><div class="film-spec"><i data-lucide="film"></i><span>THE NAME REVEAL FILM<br><b>60 seconds of something wonderful</b></span></div></div>
      <div class="studio">
        <section class="preview-area" aria-label="Animation preview">
          <div id="video-frame" class="video-frame"><canvas id="scene" width="1920" height="1080" aria-label="A miniature floating island, a courier, and a magical name reveal for Atharva"></canvas><div id="loading" class="loading"><span class="loading-flower"><i data-lucide="flower-2"></i></span><span>Making a little magic…</span></div></div>
          <div class="frame-caption"><span class="live-dot"></span><span id="frame-state">Ready when you are</span><span class="frame-format">1920 × 1080 <span> / </span> 16:9 LANDSCAPE</span></div>
          <div class="timeline-panel"><div class="timeline-meta"><span id="chapter-label">A world waiting</span><span class="timecode"><b id="current-time">00:00</b><span> / 01:00</span></span></div><label class="sr-only" for="scrubber">Story timeline in seconds</label><input id="scrubber" class="scrubber" type="range" min="0" max="60" value="0" step="0.01" aria-valuetext="0 seconds of 60"/><div class="ruler"><span>00:00</span><span>00:15</span><span>00:30</span><span>00:45</span><span>01:00</span></div></div>
          <div class="chapter-list" aria-label="Story chapters">${chapters.map((c, i) => `<button class="chapter ${i === 0 ? 'active' : ''}" data-time="${c.time}" aria-label="Seek to ${c.title}, ${c.time} seconds"><span class="chapter-number">0${i + 1}</span><span>${c.title}</span><span class="chapter-line"></span></button>`).join('')}</div>
        </section>
        <aside class="controls" aria-label="Playback and export controls"><div class="control-heading"><h2>Your little cinema</h2><span>Made to be watched together.</span></div>
          <div class="transport"><button id="play" class="primary"><i data-lucide="play"></i><span>Play the story</span></button><button id="restart" class="icon-button" aria-label="Restart story" title="Restart (R)"><i data-lucide="rotate-ccw"></i></button></div>
          <div class="speed-row"><span>Playback speed</span><div class="speed-options" role="group" aria-label="Playback speed"><button data-speed="0.5">0.5×</button><button class="selected" data-speed="1" aria-pressed="true">1×</button><button data-speed="1.5">1.5×</button></div></div>
          <div class="divider"></div>
          <label class="setting"><span><i data-lucide="leaf"></i><span>Ambient motion<small>Let the world breathe</small></span></span><input id="ambient" type="checkbox" checked/><span class="switch" aria-hidden="true"></span></label>
          <label class="setting"><span><i data-lucide="film"></i><span>Recording-safe view<small>Just the film, beautifully framed</small></span></span><input id="safe" type="checkbox"/><span class="switch" aria-hidden="true"></span></label>
          <button id="fullscreen" class="text-button"><i data-lucide="maximize"></i>Watch in fullscreen<i data-lucide="arrow-up-right"></i></button>
          <div class="divider"></div>
          <div class="export-heading"><h3>Keep this little memory</h3><p>A clean, full-HD film to share with the people you love.</p></div>
          <div class="export-format"><span>WebM · 1080p</span><label for="fps" class="sr-only">Recording frame rate</label><select id="fps"><option value="60">60 FPS</option><option value="30">30 FPS</option></select></div>
          <button id="export" class="export-button"><i data-lucide="download"></i><span>Export the film</span></button><a id="download" class="download-link" hidden download="Welcome-Atharva-1080p.webm"><i data-lucide="check"></i>Download your film<i data-lucide="arrow-up-right"></i></a>
          <p id="export-status" class="export-note" role="status">Records the full 60-second story.<br>Keep this tab visible while it records.</p>
          <div class="keyboard-note"><kbd>space</kbd> play / pause <span>·</span> <kbd>←</kbd><kbd>→</kbd> seek</div>
        </aside>
      </div>
      <footer><span><i data-lucide="flower-2"></i>A little delivery. A whole world of love.</span><span>For the beginning of your greatest adventure.</span></footer>
    </main><button id="exit-safe" class="exit-safe" hidden><i data-lucide="x"></i>Back to the studio <kbd>esc</kbd></button>`;
  refreshIcons();
  return {
    canvas: document.querySelector<HTMLCanvasElement>('#scene')!, frame: document.querySelector<HTMLDivElement>('#video-frame')!,
    play: document.querySelector<HTMLButtonElement>('#play')!, restart: document.querySelector<HTMLButtonElement>('#restart')!,
    scrubber: document.querySelector<HTMLInputElement>('#scrubber')!, ambient: document.querySelector<HTMLInputElement>('#ambient')!,
    safe: document.querySelector<HTMLInputElement>('#safe')!, fullscreen: document.querySelector<HTMLButtonElement>('#fullscreen')!,
    export: document.querySelector<HTMLButtonElement>('#export')!, fps: document.querySelector<HTMLSelectElement>('#fps')!,
    download: document.querySelector<HTMLAnchorElement>('#download')!, exportStatus: document.querySelector<HTMLParagraphElement>('#export-status')!,
  };
}
export function refreshIcons() { createIcons({ icons: { Play, Pause, RotateCcw, Maximize, Download, Flower2, ArrowUpRight, Check, X, Film, Leaf, Sparkles }, attrs: { 'stroke-width': 1.6 } }); }
export const timecode = (t: number) => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
export function updateTime(t: number, playing: boolean, recording: boolean) {
  document.querySelector('#current-time')!.textContent = timecode(t);
  const index = chapters.findIndex(c => t < c.end); const chapter = index < 0 ? 5 : index;
  document.querySelector('#chapter-label')!.textContent = chapters[chapter].title;
  document.querySelectorAll('.chapter').forEach((e, i) => { e.classList.toggle('active', i === chapter); e.classList.toggle('complete', t >= chapters[i].end); if (i === chapter) e.setAttribute('aria-current', 'step'); else e.removeAttribute('aria-current'); });
  document.querySelector('#frame-state')!.textContent = recording ? 'Recording your little memory…' : t >= 60 ? 'Welcome to the world, Atharva' : playing ? 'A little magic in motion' : t > 0 ? 'A moment to take it all in' : 'Ready when you are';
}
