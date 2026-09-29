---
title: "Nothing Rendered, Nothing Logged"
description: A feature flag quietly swapped the macOS text system for a no-op, and the one warning that explained it never reached a terminal. A deep dive into a bug that compiled cleanly and painted nothing.
date: "2026-09-29T00:00:00Z"
draft: false
---

### The Task

I was rebuilding one screen of Zed — the threads sidebar — outside the editor, using Zed's own `ui` crate and its design system. The plan was boring: stand up a window, drop in a sidebar, calibrate spacing against a reference screenshot, move on to the other panes.

The whole point of a sidebar is the text in it. Project names, thread titles, a section header or two.

The window opened. Every word was invisible.

### The Symptom

Here is what that actually looked like:

```
╭─────────────────────────────────────────────────────────╮
│                                                         │
│   ╭──────────────╮  ╭──────────────╮  ╭──────────────╮  │
│   │▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  │              │  │              │  │
│   │▓            ▓│  │              │  │              │  │
│   │▓  ──────    ▓│  │              │  │              │  │
│   │▓            ▓│  │              │  │              │  │
│   │▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  │              │  │              │  │
│   ╰──────────────╯  ╰──────────────╯  ╰──────────────╯  │
│                                                         │
╰─────────────────────────────────────────────────────────╯

▓ = renders correctly: backgrounds, borders, the
    selection highlight, hover states.
─ = row separators: also correct.
    Text and icons: missing. Completely.
```

This is the worst possible failure mode for debugging, because the window *works*. It is not blank, it is not crashed, it is not obviously broken. It is a UI that has been built correctly except for the parts that communicate anything.

### Why It Looked Like a Font Problem

My first instinct was reasonable and wrong. GPUI does not draw everything through one path. Backgrounds and borders are `Quad` primitives. Text glyphs and SVG icons are `MonochromeSprite` primitives, rasterized into a texture atlas and sampled on the GPU.

Two paths, one framebuffer:

```
                    element tree
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
          quads                   monochrome
      (bg, border,                 sprites
       selection)              (glyphs, svg icons)
             │                         │
             ▼                         ▼
       draw_quads()         draw_monochrome_sprites()
             │                         │
             └────────────┬────────────┘
                          ▼
                   Metal framebuffer
                          │
                          ▼
                    your eyeballs
```

Everything I could see came from the left branch. Everything I could not see came from the right branch. So: "the atlas is broken", or "the font never loaded", or "the mask is being sampled wrong". All font-shaped theories.

So I chased fonts.

I loaded the Zed fonts explicitly with `include_bytes!` and `add_fonts`. Nothing. I overrode the root font family to Arial, on the theory that `.ZedSans` was not resolving. Nothing. I logged the resolved theme colours and got valid `Hsla` values with `alpha: 1.0`, which ruled out invisible text. I printed `all_font_names()` and got an empty list, which felt like a smoking gun and was actually a red herring, because that function enumerates system font families through a Core Text call with a known memory-management workaround in it — it can return nothing while the actual glyph rasterizer works fine.

Then I stopped guessing and started bisecting the pipeline.

### Bisecting With a Deliberately Wrong Shader

If you want to know whether a sprite reached the GPU, stop sampling the atlas and return a constant colour. I edited the Metal fragment shader to return solid magenta for every monochrome sprite:

```
float4 color = input.color;
color.a *= sample.a;      // ← replace all of this
return color;
```

```
return float4(1.0, 0.0, 1.0, 1.0);   // magenta, unconditionally
```

The result was the most useful ugly screenshot of the day:

```
╭─────────────────────────────────────────╮
│  █                                      │
│                                         │
│  █                                      │
│     █                                   │
│                                         │
│  █                                      │
│     █                                   │
│  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒          │
│  █                                      │
╰─────────────────────────────────────────╯

█ = magenta square, where an SVG icon should be
▒ = still just the selection highlight, still no text
```

That is a decisive answer, and it is not the one I was expecting:
- Magenta squares appeared exactly where the icons were, at exactly the right size. SVG sprites reach the GPU. Batching, clipping, instance buffers, atlas upload, sampling — all fine.
- Where the text was: nothing. No magenta, no smudge, no shape. Not a faint glyph, not a clipped glyph. Nothing.

Since glyphs and icons go through the *same* primitive type and the *same* shader, the renderer was never the problem. Glyph sprites were never being created in the first place. The bug was upstream of the GPU entirely, which means every font theory I had was aimed at the wrong layer.

I reverted the shader and instrumented the one function where a glyph either becomes a sprite or does not.

### The Instrumentation That Ended It

One `eprintln!` inside GPUI's `paint_glyph`, right after the raster bounds are computed:

```
paint_glyph font_id=FontId(0) glyph=GlyphId(1)
            bounds=Bounds { size: Size { 0px × 0px } }
            subpixel=false scale=1.0 size=12px
```

Six hundred and sixty-two lines of that. Every single one identical. Three things are wrong at once:

- **`font_id=FontId(0)`** — always the same font, and it is the first one registered.
- **`glyph=GlyphId(1)`** — always the same glyph. Glyph 1 is conventionally `.notdef`. Forty different characters, one glyph id.
- **`size: 0px × 0px`** — the glyph rasterizes to nothing.

And here is the gate those zeroes hit:

```
  paint_glyph()
        │
        ▼
  raster_bounds = text_system.raster_bounds(params)
        │
        ▼
  ┌─────────────────────────────────┐
  │  if !raster_bounds.is_zero()    │
  └────────────┬────────────────────┘
               │
      true ────┴──── false
        │              │
        ▼              ▼
  insert sprite    return Ok(())
  into the scene   (no sprite, no error,
                    no log, no panic)
```

Zero-sized bounds are a perfectly valid answer. Nothing panics. Nothing logs. The glyph simply evaporates, six hundred and sixty-two times, in total silence.

### The Clue I Walked Straight Past

Before I got to `paint_glyph`, I had already added an `eprintln!` to the macOS text system itself — inside `add_fonts` and inside `load_family`, the function that resolves a font family into loaded font faces.

I rebuilt. Nothing printed.

My conclusion: stale build. So I ran `touch` on the files and rebuilt. Nothing printed. I was now confused about two things.

The answer was one file away, in `crates/gpui_macos/src/gpui_macos.rs`:

```
#[cfg(feature = "font-kit")]
mod text_system;
```

My debug lines were inside a module that was **not compiled**. The crate built, because a crate with a missing module builds fine. There was no error, no warning, no stale build — just a file that the compiler never read.

I had spent a round trip explaining away an absent log line as a tooling problem, when the absent log line was the answer. If your print statement does not print, the first hypothesis is not "my build is stale". The first hypothesis is "this code is not running".

### The Root Cause

Here is `MacPlatform::new()`:

```
#[cfg(feature = "font-kit")]
let text_system = Arc::new(crate::MacTextSystem::new());

#[cfg(not(feature = "font-kit"))]
let text_system = {
    if !headless {
        log::warn!(
            "gpui_macos was compiled without the `font-kit` feature, \
             so no text will be rendered."
        );
    }
    Arc::new(gpui::NoopTextSystem::new())
};
```

The platform picks its text system at compile time. Enable the feature and you get a real Core Text rasterizer. Do not enable it and you get `NoopTextSystem`, which is exactly what it sounds like: a text system whose entire job is to return zero-sized, meaningless answers without ever failing.

And the whole rendering stack dutifully does the only thing it can with a no-op text system. It lays out the text, asks for the glyph, receives `0×0`, and skips it. The layout is correct. The colours are correct. The font sizes, the truncation, the indentation — all correct. Nothing is drawn, and nothing complains.

But why was the feature off? Because it is off by default, and feature flags are per-build, not per-workspace:

```
              ╭──────────────────────────────╮
              │  my example's Cargo.toml     │
              │  gpui_platform = { ... }     │
              │  features: []  ← defaults    │
              ╰───────────────┬──────────────╯
                              │
                              ▼
              ╭──────────────────────────────╮
              │  gpui_platform               │
              │  font-kit = [gpui_macos/…]   │
              │  (not in `default`)          │
              ╰───────────────┬──────────────╯
                              │
                              ▼
              ╭──────────────────────────────╮
              │  gpui_macos                  │
              ╰───────────────┬──────────────╯
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
      font-kit ON                     font-kit OFF
      ╭────────────────────╮          ╭────────────────────╮
      │ MacTextSystem      │          │ NoopTextSystem     │
      │ real glyph mask →  │          │ zero-sized →       │
      │ real sprites       │          │ glyphs vanish      │
      ╰────────────────────╯          ╰─────────▲──────────╯
                                                │
                                     ╭──────────┴──────────╮
                                     │ the Zed app enables │
                                     │ font-kit, so this   │
                                     │ branch never fires  │
                                     │ inside the editor   │
                                     ╰─────────────────────╯
```

The real Zed application enables it explicitly:

```
gpui_platform = { workspace = true, features = [
    "screen-capture",
    "font-kit",
    "wayland",
    "x11",
] }
```

So the workspace compiles. The editor runs. Text renders in the editor. Every existing truly-works-for-me signal is intact. Only *my* binary was built without a text rasterizer, and the difference is a feature list in a Cargo.toml three directories away from the code that depends on it.

### The Fix

One line, in the example crate's manifest:

```
[dev-dependencies]
gpui_platform = { workspace = true, features = ["font-kit", "wayland", "x11"] }
```

Text appeared immediately. After that, calibrating against the reference was the easy part: 304px sidebar, 28px rows, text indents at 31px and 51px, muted labels for untitled threads, a neutral fill plus a two-pixel accent bar on the selected thread. Measure, adjust, re-screenshot, done.

There was also an unrelated but earlier wall: the build itself failed first, because the Xcode **Metal Toolchain** is not installed by default on this machine and GPUI compiles Metal shaders at build time.

```
xcodebuild -downloadComponent MetalToolchain
```

That one at least failed loudly. It is the bug I would have preferred to have.

### What I Took From It

**A no-op behind a feature flag is a silent failure machine.** The design intent is defensible — a headless build should not need a font stack. But the failure mode it produces is the worst kind: correct layout, correct colours, correct everything, zero pixels. If a subsystem can be swapped for a no-op, the symptoms of that no-op should be loud. A `debug_assert!`, a panic on first glyph request, a visible fallback: anything but returning `0×0` forever.

**`log::warn!` without an initialized logger is a comment.** The single sentence that solved this bug was written by whoever added the no-op branch, printed once at startup, and thrown away because my example never called a logger init. If you write a warning that explains a catastrophic misconfiguration, you had better make sure the binary that can hit it actually has somewhere to print.

**An absent log line is evidence, not noise.** I burned time treating "my `eprintln!` didn't output" as a build hygiene problem instead of the structural clue it was. `#[cfg]`-gated modules mean code you are looking at can be code the compiler never sees. When instrumentation vanishes, stop rebuilding and go read the `cfg`.

**Bisect by pipeline stage, and use a deliberately wrong output.** The magenta shader was ten seconds of work and it split the system in half: sprite creation versus sprite drawing. Every font theory I had was dead the moment those squares appeared. Guessing at a symptom I could not see was strictly worse than vandalising a shader to make it visible.

The final irony is that the reference screenshot I was calibrating against contained the answer the whole time, in plain sight. It had text in it.
