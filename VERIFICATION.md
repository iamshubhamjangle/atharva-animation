# Verification

## Automated checks

`npm test` passes. It exercises real Three.js model transforms with a stub for canvas text rasterization, without needing a GPU:

- Each GSAP story cycle is exactly 72 seconds; preview playback loops and export stops after one cycle.
- Twenty-three story poses, including entrance opacity, burst, departure, and reset, match exactly when visited in reverse order.
- The carried parcel follows the courier's hand anchor.
- The ringing hand contacts the actual cottage doorbell in world coordinates.
- The opening hand contacts the real parcel lid before releasing it.
- A dedicated golden burst appears before any balloon becomes visible.
- The delivered parcel stays at the doorstep.
- All seven balloons and both final text lines remain visible and settled at 45, 50, 55, and 60 seconds.
- Ambient motion continues with the story paused and does not accumulate rotation when frozen.
- Restart hides the character/balloons and closes the gift lid.
- Bicycle wheels and crank rotate with distance travelled; actor opacity fades independently of environmental materials.
- End-of-cycle actor poses match the initial poses exactly, and the bicycle resets outside the viewport.
- Cloud positions wrap beyond the visible screen edges; ambient cloud travel never resets with the story.
- One wind controller affects grass, canopies, and flower motion. Butterfly wings use the requested purple-to-magenta shader.
- Static geometry batching preserves world-space bounds and excludes animated parts.

`npm run build` passes TypeScript checking and produces the Vite production bundle. Vite reports a non-fatal bundle-size advisory for the combined Three.js application.

## Browser checks

Inspected the updated running application in desktop Chrome and at a 390×844 mobile viewport. Confirmed responsive landscape framing, the bicycle riding pose, mixed flower colors, visible gray/ivory birds, purple butterflies, the golden opening burst, stronger title contrast, and the staggered balloon arc. Started playback at 71.5 seconds and confirmed it continued into the following cycle with the Pause control still active. The previous build also verified fullscreen, ambient toggle, and recording-safe controls.

Two complete 72-second MediaRecorder captures completed and downloaded, with no console warnings/errors. Recording locked incompatible playback controls. FFprobe confirmed both saved files are VP9, 1920×1080, with video presentation timestamps from 0.000 to 71.983 seconds.

The first capture contained 1,717 video packets, approximately 23.8 captured frames/second. After static geometry batching and reducing the directional shadow map to 1024px, the second contained 2,454 packets, approximately 34.1 captured frames/second. These are observed capture averages on this machine with 60 FPS requested, not a universal FPS guarantee. The files are approximately 39.7 MB and 42.8 MB respectively. A 30 FPS capture option remains available. The final cloud depth adjustment only changes occlusion, not story timing or recording logic.

MediaRecorder WebM does not populate a reliable duration header in this browser; packet timestamps were inspected directly. README documents padding and exact 72-second H.264 conversion, plus the option to trim at 60 seconds for a television version ending on the full name. Physical television playback has not been tested.

The earlier baseline had an independent review covering control contrast, typography scaling, and doorbell contact; those fixes remain in place. The current update was checked through model tests, desktop/mobile screenshots, browser playback, and saved-video metadata.

README, PRODUCT.md, DESIGN.md, and the design sidecar now describe the bicycle, wind/sky enhancements, staggered reveal, and 72-second loop/reset behavior.

## Evidence

Updated browser captures are in `.impeccable/review/`: `bicycle.jpg`, `burst.jpg`, `loop-desktop.jpg`, and `loop-mobile.jpg`. This output folder is ignored by Git. The two test WebMs were saved through Chrome to the user's Downloads folder as `Welcome-Atharva-1080p.webm` and `Welcome-Atharva-1080p (1).webm`. No audio was added; the complete film is intentionally silent.
