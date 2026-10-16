---
name: Little Worlds · Atharva
description: A warm miniature film inside a quiet recording studio.
colors:
  studio: "#f7f6f0"
  ink: "#35544a"
  primary: "#365e4b"
  secondary-text: "#64745e"
  sky: "#dcece9"
  mint: "#acd5bf"
  peach: "#e9a48f"
  cream: "#fff1d6"
  primary-hover: "#284e3b"
  primary-text: "#fff9ea"
  export-text: "#5e7657"
typography:
  display:
    fontFamily: "Libre Caslon Display, Georgia, serif"
    fontWeight: 400
    fontSize: "49px"
    lineHeight: 1.1
    letterSpacing: "-1.5px"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontWeight: 400
    fontSize: "14px"
rounded:
  control: "5px"
  preview: "6px"
spacing:
  page: "58px"
  studio-gap: "36px"
  mobile-page: "20px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-text}"
    rounded: "{rounded.control}"
    height: "45px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-export:
    backgroundColor: "transparent"
    textColor: "{colors.export-text}"
    rounded: "{rounded.control}"
    height: "41px"
    width: "100%"
---

## Overview

Experience mode: the miniature film leads. The studio is warm cream, quiet, typographic, and plainly operable. The user-specified storybook toy world governs the scene; unrelated stylistic directions are excluded.

**Creative North Star: "A warm miniature film inside a quiet recording studio."**

## Colors

Evergreen foreground and buttons on warm paper. Secondary text uses the secondary-text token for readable contrast. The scene uses grassy green alongside mint, cream cottage walls, peach roof tiles, pale sky, butter yellow, lavender, and natural wooden accents. The scene palette is authored in `src/config.ts`; studio ink and film lettering ink have separate values.

## Typography

Libre Caslon Display gives studio headings an intimate editorial voice. DM Sans carries controls. Video lettering is canvas-rendered Georgia and remains inside WebGL capture. Match texture proportions to physical planes so lettering is never stretched. Seven white balloon letters are individually rasterized in square textures.

## Layout

Desktop: large 16:9 preview with timeline and six story chapters below, plus a 256px control column. At 760px and below, stack controls under the preview. Never crop the film to fill a phone. Fullscreen letterboxes the fixed 1920×1080 canvas. Keep important scene elements inside television-safe margins.

The page caps at 1600px. At 1100px and below, the control column narrows to 230px and page gutters to 30px; from 1600px, the control column is 270px and studio gap 46px. Mobile gutters are 20px; the preview radius becomes 4px and the display heading 39px. Recording-safe view reserves 24px above and 64px below the film for the exit control.

## Elevation & Depth

The scene uses lit rounded geometry, warm directional sunlight, hemisphere fill, soft shadow mapping, and subtle distance fog. The floating island has layered soil and visible thickness. Preview has a restrained downward shadow; controls use flat tonal surfaces.

## Shapes

Procedural rounded boxes and low-segment spheres produce the handmade toy quality. Roof panels, flower petals, picket rails, mailbox, and cart details reward close viewing without requiring external assets.

## Components

Primary play action is evergreen. Secondary export is outlined. Ambient and clean-view switches have independent state. Scrubber exposes seconds and a formatted time label. Chapters are navigation, with an explicit current step. A single GSAP clock owns story poses; ambient motion is a separate time source. Recording locks story mutations and captures only WebGL.

Buttons transition background, color, and opacity over 0.2 seconds; focus uses a warm brown 2px outline with a 4px offset (5px on inputs). Disabled buttons reduce opacity to 0.45. Reduced-motion preferences remove control and switch transitions. The primary action is 47px high on mobile; export is 43px. Keep the focus and disabled treatments when extending controls.

## Do's and Don'ts

- **Do** keep the camera stationary and every final letter readable.
- **Do** preserve the peaceful 15-second hold.
- **Do** keep all controls outside the film.
- **Don't** add ornamental website cards or replace the courier with a flat icon.
- **Do** author geometry and lettering in code; no stock art is needed.
