# Verification

## Automated checks

`npm test` passes. It exercises real Three.js model transforms with a stub for canvas text rasterization, without needing a GPU:

- GSAP duration is exactly 60 seconds.
- Sixteen story poses match exactly when visited in reverse order.
- The carried parcel follows the courier's hand anchor.
- The ringing hand contacts the actual cottage doorbell in world coordinates.
- The delivered parcel stays at the doorstep.
- All seven balloons and both final text lines remain visible and settled at 45, 50, 55, and 60 seconds.
- Ambient motion continues with the story paused and does not accumulate rotation when frozen.
- Restart hides the character/balloons and closes the gift lid.

`npm run build` passes TypeScript checking and produces the Vite production bundle. Vite reports a non-fatal bundle-size advisory for the combined Three.js application.

## Browser checks

Inspected the actual running application in the Codex in-app desktop browser and at a 390×844 mobile viewport. Confirmed a 1920×1080 backing canvas, responsive landscape preview without horizontal overflow, legible final reveal, corrected doorbell staging, start paused, play/pause, chapter seeking, reverse seeking, restart, ambient toggle, fullscreen, and recording-safe mode. The clean-view exit control is outside the film bounds.

A complete 60-second MediaRecorder capture completed and produced the WebM download link with no console warnings/errors. Also checked 30 FPS recording startup and cancellation, and that recording locks incompatible playback controls.

The in-app browser canceled the file download, so the saved WebM container duration, frame cadence, and television playback were not independently inspected. MediaRecorder timing is browser-dependent. README documents FFmpeg conversion with padding and an exact 60-second trim for the television master. Actual 60 FPS depends on the machine; 30 FPS is available as fallback.

An independent visual/code review identified contrast, typography scaling, and doorbell contact issues. These were fixed; the reviewer marked all three resolved with a **ship** verdict. This verdict covers those findings, not unperformed video-file verification.

The separate design-documentation handoff confirmed implemented tokens, eight canonical design sections, valid schema-v2 sidecar JSON, and six focusable component previews. It changed documentation only.

## Evidence

Browser captures are in `.impeccable/review/`: `desktop.jpg`, `mobile.jpg`, `doorbell.jpg`, and `final-film.jpg`. This output folder is ignored by Git. No audio was added; the complete film is intentionally silent.
