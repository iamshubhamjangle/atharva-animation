export function supportedRecordingType() {
  if (typeof MediaRecorder === 'undefined' || !HTMLCanvasElement.prototype.captureStream) return null;
  return ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(type => MediaRecorder.isTypeSupported(type)) ?? null;
}
export class VideoRecorder {
  private recorder?: MediaRecorder;
  private stream?: MediaStream;
  private chunks: Blob[] = [];
  private canceled = false;
  private url?: string;
  active = false;
  start(canvas: HTMLCanvasElement, fps: number, onReady: (url: string) => void, onError: (message: string) => void) {
    const mimeType = supportedRecordingType(); if (!mimeType) throw new Error('This browser cannot export WebM. Use a current Chrome, Edge, or Firefox desktop browser.');
    this.revoke(); this.canceled = false; this.chunks = [];
    try {
      this.stream = canvas.captureStream(fps);
      this.recorder = new MediaRecorder(this.stream, { mimeType, videoBitsPerSecond: 14_000_000 });
      this.recorder.ondataavailable = e => { if (e.data.size > 0) this.chunks.push(e.data); };
      this.recorder.onerror = () => { this.cancel(); onError('The browser could not finish recording. Try 30 FPS or another desktop browser.'); };
      this.recorder.onstop = () => {
        this.stream?.getTracks().forEach(track => track.stop()); this.active = false;
        if (!this.canceled && this.chunks.length) { this.url = URL.createObjectURL(new Blob(this.chunks, { type: mimeType })); onReady(this.url); }
        this.chunks = [];
      };
      this.recorder.start(1000); this.active = true;
    } catch (error) { this.stream?.getTracks().forEach(track => track.stop()); throw error; }
  }
  finish() { if (this.recorder?.state === 'recording') this.recorder.stop(); this.active = false; }
  cancel() { this.canceled = true; this.finish(); this.active = false; }
  revoke() { if (this.url) { URL.revokeObjectURL(this.url); this.url = undefined; } }
  dispose() { this.cancel(); this.revoke(); }
}
