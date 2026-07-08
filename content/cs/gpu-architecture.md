---
title: GPU Architecture
description: A first pass at the machine model behind shader work.
date: 2026-05-17
status: Draft
---

A GPU is not a faster CPU. It is a different bargain: give up flexible sequential control, gain enormous throughput over similar work.

That bargain shapes everything above it. Shader languages, render pipelines, memory layouts, frame pacing, and even UI animation all inherit the same pressure.

## The Shape of the Machine

The useful mental model is a wide machine that prefers repeated operations over many pieces of data.

```txt
many vertices
many fragments
same program
wide execution
```

## Why It Matters

When software pretends this machine is invisible, performance becomes folklore. When the shape is visible, design decisions become easier to reason about.
