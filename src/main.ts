import './style.css';
import { World } from './scene/World';
import { Story } from './animation/storyTimeline';
import { animateAmbient } from './animation/ambient';
import { createUI, refreshIcons, updateTime, timecode } from './ui/Controls';
import { VideoRecorder, supportedRecordingType } from './utils/recording';
import { CONFIG } from './config';

const ui = createUI();
let world: World;
try { world = new World(ui.canvas); } catch (error) {
  document.querySelector('#loading')!.textContent = 'This little world needs WebGL. Enable hardware acceleration in your browser, then refresh.';
  document.querySelectorAll<HTMLButtonElement>('button').forEach(b => b.disabled = true); throw error;
}
const story = new Story(world), recorder = new VideoRecorder();
let playing = false, ambientEnabled = true, ambientTime = 0, speed = CONFIG.speed, previous = performance.now(), animationFrame = 0;
let recordStart = 0, recordTimer: ReturnType<typeof setTimeout> | undefined, rendering = true;
let lastTime = -1, lastPlaying = false, lastRecording = false;
function setPlaying(next: boolean) {
  playing = next; ui.play.innerHTML = `<i data-lucide="${next ? 'pause' : 'play'}"></i><span>${next ? 'Pause the story' : story.clock.time >= CONFIG.duration ? 'Play again' : 'Play the story'}</span>`;
  ui.play.setAttribute('aria-label', next ? 'Pause story' : 'Play story'); refreshIcons();
}
function playPause() { if (recorder.active) return; if (story.clock.time >= CONFIG.duration) story.seek(0); setPlaying(!playing); }
function seek(t: number) { if (recorder.active) return; story.seek(t); }
function setSafe(value: boolean) { document.body.classList.toggle('safe-view', value); ui.safe.checked = value; document.querySelector<HTMLButtonElement>('#exit-safe')!.hidden = !value; }
function lockRecording(locked: boolean) {
  document.querySelectorAll<HTMLButtonElement | HTMLInputElement | HTMLSelectElement>('.transport button, .chapter, .speed-options button, #scrubber, #ambient, #fps').forEach(e => e.disabled = locked);
  ui.export.innerHTML = `<i data-lucide="${locked ? 'x' : 'download'}"></i><span>${locked ? 'Cancel recording' : 'Export the film'}</span>`; refreshIcons();
}
function endRecording() {
  if (recordTimer) clearTimeout(recordTimer); recordTimer = undefined;
  story.seek(CONFIG.duration); animateAmbient(world, ambientEnabled ? CONFIG.duration : ambientTime, CONFIG.duration); world.render();
  recorder.finish(); setPlaying(false); lockRecording(false);
}
function cancelRecording(message = 'Recording canceled. You can start again whenever you’re ready.') {
  if (recordTimer) clearTimeout(recordTimer); recordTimer = undefined; recorder.cancel(); setPlaying(false); lockRecording(false); ui.exportStatus.textContent = message;
}
function record() {
  if (recorder.active) { cancelRecording(); return; }
  try {
    setPlaying(false); story.seek(0); ambientTime = 0; animateAmbient(world, 0, 0); world.render(); ui.download.hidden = true;
    recorder.start(ui.canvas, Number(ui.fps.value), url => { ui.download.href = url; ui.download.hidden = false; ui.exportStatus.textContent = 'Your little memory is ready. Save the film below.'; }, message => { cancelRecording(message); });
    recordStart = performance.now(); lockRecording(true); recordTimer = setTimeout(endRecording, CONFIG.duration * 1000);
    ui.exportStatus.textContent = `Recording 00:00 / ${timecode(CONFIG.duration)} · Please keep this tab visible.`;
  } catch (error) { ui.exportStatus.textContent = error instanceof Error ? error.message : 'Recording could not start. Try another browser.'; lockRecording(false); }
}
ui.play.addEventListener('click', playPause);
ui.restart.addEventListener('click', () => { seek(0); setPlaying(false); });
ui.scrubber.addEventListener('input', () => seek(Number(ui.scrubber.value)));
ui.ambient.addEventListener('change', () => { ambientEnabled = ui.ambient.checked; });
ui.safe.addEventListener('change', () => setSafe(ui.safe.checked));
document.querySelector('#exit-safe')!.addEventListener('click', () => setSafe(false));
async function fullscreen() { try { if (document.fullscreenElement) await document.exitFullscreen(); else await ui.frame.requestFullscreen(); } catch { ui.exportStatus.textContent = 'Fullscreen is unavailable in this preview. Open the local URL in a desktop browser.'; } }
ui.fullscreen.addEventListener('click', fullscreen); ui.export.addEventListener('click', record);
document.querySelectorAll<HTMLButtonElement>('[data-speed]').forEach(b => b.addEventListener('click', () => { speed = Number(b.dataset.speed); document.querySelectorAll<HTMLButtonElement>('[data-speed]').forEach(other => { other.classList.toggle('selected', other === b); other.setAttribute('aria-pressed', String(other === b)); }); }));
document.querySelectorAll<HTMLButtonElement>('[data-time]').forEach(b => b.addEventListener('click', () => seek(Number(b.dataset.time))));
document.addEventListener('keydown', e => {
  if (e.code === 'Escape') { setSafe(false); return; }
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLButtonElement || e.target instanceof HTMLAnchorElement) return;
  if (e.code === 'Space') { e.preventDefault(); playPause(); }
  if (e.code === 'KeyR' && !recorder.active) { seek(0); setPlaying(false); }
  if (e.code === 'KeyF') void fullscreen();
  if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') { e.preventDefault(); seek(story.clock.time + (e.code === 'ArrowRight' ? 1 : -1)); }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && recorder.active) cancelRecording('Recording stopped because this tab was hidden. Keep it visible and try again so no frames are missed.');
  if (!document.hidden) previous = performance.now();
});
if (!supportedRecordingType()) { ui.export.disabled = true; ui.exportStatus.textContent = 'WebM recording is unavailable here. Open this project in a current desktop Chrome, Edge, or Firefox browser.'; }
function frame(now: number) {
  if (!rendering) return;
  const delta = Math.min((now - previous) / 1000, .1); previous = now;
  if (recorder.active) {
    const time = Math.min((now - recordStart) / 1000, CONFIG.duration); story.seek(time); if (ambientEnabled) ambientTime = time;
    if (time >= CONFIG.duration) endRecording();
  } else {
    if (playing && !document.hidden) { story.advance(delta * speed); if (!CONFIG.loop && story.clock.time >= CONFIG.duration) setPlaying(false); }
    if (ambientEnabled) ambientTime += delta;
  }
  animateAmbient(world, ambientTime, story.clock.time); world.render();
  if (Math.abs(story.clock.time - lastTime) > .08 || playing !== lastPlaying || recorder.active !== lastRecording || (story.clock.time === CONFIG.duration && lastTime !== CONFIG.duration)) {
    const t = story.clock.time; ui.scrubber.value = String(t); ui.scrubber.style.setProperty('--progress', `${t / CONFIG.duration * 100}%`); ui.scrubber.setAttribute('aria-valuetext', `${t.toFixed(1)} seconds of ${CONFIG.duration}`); updateTime(t, playing, recorder.active);
    if (recorder.active) ui.exportStatus.textContent = `Recording ${timecode(t)} / ${timecode(CONFIG.duration)} · Keep this tab visible.`;
    lastTime = t; lastPlaying = playing; lastRecording = recorder.active;
  }
  animationFrame = requestAnimationFrame(frame);
}
animateAmbient(world, 0, 0); world.render(); document.querySelector('#loading')!.remove(); animationFrame = requestAnimationFrame(frame);
window.addEventListener('pagehide', () => { rendering = false; cancelAnimationFrame(animationFrame); if (recordTimer) clearTimeout(recordTimer); recorder.dispose(); story.dispose(); world.dispose(); });
Object.defineProperty(window, '__ATHARVA__', { value: { get time() { return story.clock.time; }, get duration() { return story.timeline.duration(); }, get playing() { return playing; }, get recording() { return recorder.active; }, get balloons() { return world.balloons.balloons.map(b => ({ visible: b.group.visible, position: b.group.position.toArray() })); }, get parcel() { return world.gift.group.position.toArray(); }, get drawCalls() { return world.renderer.info.render.calls; } } });
