# Atharva's Little Delivery Adventure

A complete, silent, 60-second newborn name reveal. Everything in the film is procedural Three.js geometry or canvas-rendered lettering. No asset preparation, API keys, accounts, or backend are needed.

## Run locally

Install Node.js 22.12+ (or 24 LTS), then run in this folder:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173). The first frame is paused while the miniature world continues breathing.

```sh
npm run build
npm run preview
npm test
```

The production build is in `dist/`. Serve it with an HTTP server; opening `index.html` directly with `file://` does not support its ES modules. The studio UI optionally loads Google Fonts; it has local serif/sans fallbacks. The film itself uses local Georgia lettering and works without remote assets.

## Watch and control

- Play / Pause, Restart, and the time scrubber control the whole story without refreshing.
- Six chapter buttons jump directly to a story phase.
- Speed choices are 0.5×, 1×, and 1.5×. Export always runs at normal speed.
- Ambient motion has its own independent switch and continues when the story is paused.
- Fullscreen displays only the clean 16:9 film, letterboxed when needed. Press Escape to leave.
- Recording-safe view hides the studio around the film. Use the exit button or Escape to return. For an entirely clean screen recording, use fullscreen; browser export never includes the exit button.
- Keyboard shortcuts when focus is outside a control: Space plays/pauses, R restarts, left/right seek one second, F toggles fullscreen.

## The 60-second film

- **0–7:** peaceful miniature island and introductory message.
- **7–18:** courier pushes a three-wheel parcel cart along the stone path.
- **18–28:** steps away, picks up the gift, carries it to the cottage, reaches for the doorbell, sets it down, and steps back.
- **28–37:** a tentative wiggle, a stronger wobble, loosening ribbon, golden light, gathering sparkles, and a springing lid.
- **37–45:** seven 3D pastel balloons rise sequentially and spell **ATHARVA**.
- **45–60:** all seven balloons and “Welcome to the world / ATHARVA” stay readable; the courier waves and the world gently moves. The final frame holds indefinitely.

The camera never moves. All story poses derive from a single GSAP timeline clock, including the parcel's hand attachment and the balloons. Backward seeking restores every pose without reparenting callbacks or leftover tweens. Ambient time is independent.

## Export a full-HD video

1. Open the project in a current desktop Chrome, Edge, or Firefox with hardware acceleration enabled.
2. Choose **60 FPS**, or **30 FPS** for a slower computer.
3. Select **Export the film**. It resets the story and records from 0 through 60 seconds at 1×, regardless of preview speed.
4. Keep this tab visible for the full minute. Playback/seek controls lock during export. Hiding the tab cancels recording to avoid a damaged video; Cancel recording is always available in the studio.
5. When ready, select **Download your film**. The WebM contains only the **1920 × 1080** WebGL canvas, including all final lettering, with no studio UI. It is silent.

Export uses `canvas.captureStream` and `MediaRecorder`, preferring VP9 and falling back to VP8/WebM. Unsupported browsers show an explanatory message. Actual delivered FPS depends on GPU and browser performance; 60 FPS is requested, not guaranteed. The story clock is exactly 60 seconds; MediaRecorder packet boundaries can vary the container duration slightly. Use the conversion below for a frame-exact television master.

## Convert to H.264 MP4 for television

Install FFmpeg separately if you need MP4. From the downloaded film's folder:

```sh
ffmpeg -i Welcome-Atharva-1080p.webm -vf "fps=60,scale=1920:1080:flags=lanczos,tpad=stop_mode=clone:stop_duration=1" -t 60 -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -profile:v high -level 4.2 -movflags +faststart -an Welcome-Atharva-TV.mp4
```

This produces exactly 60 seconds, pads any encoder rounding with the last frame, and uses widely supported H.264/yuv420p. For a 30 FPS television version, use `fps=30` and `-level 4.1`. Check your television's USB playback specifications. No FFmpeg installation is needed to run the app or create WebM.

## Customize

`src/config.ts` exposes the name, messages, colors, phase boundaries, resolution, camera position, and default speed. The scene layout is authored for the seven-letter name ATHARVA. Changing to a different name length also requires adjusting balloon spacing and palette in `Balloons.ts`.

Source modules:

- `src/scene/`: world, island, cottage, environment, courier, vehicle, gift, balloons, particles.
- `src/animation/storyTimeline.ts`: deterministic 60-second GSAP clock and story poses.
- `src/animation/ambient.ts`: independent environmental motion.
- `src/ui/Controls.ts`: studio interface, chapter labels, and Lucide icons.
- `src/utils/recording.ts`: recording capability detection, capture, cancellation, and URL cleanup.
- `src/utils/geometry.ts`: reusable rounded geometry, materials, seeded random values, and text textures.
- `tests/story.test.ts`: real Three.js model transform tests without requiring a GPU. Browser visual and export QA is separate.

Shared materials/geometries, seeded decoration, and explicit GPU/media cleanup keep the scene reproducible. The 1080p backing canvas remains fixed as the CSS preview resizes, preserving the composition and export resolution.
