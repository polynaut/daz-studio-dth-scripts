# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a DAZ Studio scripting suite for automating DazToHue (DTH) animation workflows. Scripts are written in DAZ Script (a JavaScript dialect with `.dsa` extension) and run directly in DAZ Studio's Script IDE.

**Target Characters:** Genesis 8.1, Genesis 9

## Development Environment

- **Editor Setup:** Add file association for `*.dsa` files with `javascript` language mode for syntax highlighting
- **Running Scripts:** Open in DAZ Studio's Script IDE (Windows -> Panes -> Script IDE), then click Execute
- **Installation:** Clone repo into `{My DAZ 3D Library}/Scripts/` folder

No build system, package manager, or test framework - scripts run directly in DAZ Studio.

## Architecture

### Entry Point
`scripts/dthWorkflow.dsa` - Main orchestrator that chains all DTH operations. Configure the `options` object at the top for your setup.

### Module System
Scripts use `include(dir_self.filePath("relative/path.dsa"))` for modular loading. Dependencies are declared at the top of each file.

### Core Utilities (`scripts/utils/`)

| File | Purpose |
|------|---------|
| `dthUtils.dsa` | Timeline management, preset loading, property/morph manipulation, fence poses |
| `morphAnimationFrames.dsa` | Morph animation engine - config parsing, control finding, keyframe creation |
| `modifyJcmRom.dsa` | Angle-based morph application tied to bone rotations |
| `rom/getRomPaths.dsa` | Version-aware ROM file path resolution |
| `rom/apply*.dsa` | ROM preset application (JCM, FAC, Dicktator, Golden Palace) |

### Configuration Files (`scripts/morphAnimationConfigs/`)
Character-specific morph configurations. Each file exports getter functions:
- `getEXPControlConfig()` - Facial expressions
- `getGENControlConfig()` - Genital morphs
- `getFBMControlConfig()` - Full body morphs
- `getMISControlConfig()` - Miscellaneous morphs

### Control Configuration Format
```javascript
// Single control
{ type: "morph"|"modifier"|"pose", name: "MorphName", value: 1.0, reset: 0 }

// Linked controls (applied same frame)
[{ type: "morph", name: "Left", value: 1 }, { type: "morph", name: "Right", value: 1 }]

// Fence frame (reset marker)
{ type: "fence" }
```

### Analysis Tools (`scripts/analyze/`)
- `analyzeKeyframesOfNode.dsa` - Inspect bone keyframes/angles (useful for modifyJcmRom setup)
- `products/createListing.dsa` - Asset-to-product matching

## Key Patterns

**Property Lookup:** Scripts try multiple methods - `findProperty()`, `findPropertyByLabel()`, `getMorphPropFromNode()`, `findModifier()` - use what works for your control type.

**Fence Poses:** Special marker frames that reset character to neutral between animation sections. Implemented via memorize/restore pattern in `setFencePoses()`.

**Timeline Management:** Always use `Scene.getTimeStep()` for time calculations. Frame-to-time: `frame * timeStep`.

## Debugging

Enable verbose logging: Set `DTH_VERBOSE = true` in `dthUtils.dsa`
