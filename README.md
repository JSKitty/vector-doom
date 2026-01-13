# DOOM WebXDC

Classic DOOM (1993) running as a WebXDC mini-app for [Vector](https://vectorapp.io) and other WebXDC-compatible messengers.

## Features

- All 3 original episodes:
  - Knee-Deep in the Dead
  - The Shores of Hell
  - Inferno
- Complete audio: sound effects + music
- Fullscreen responsive canvas
- Touch controls for mobile devices
- Debug console via `?debug` URL parameter

## Controls

**Keyboard:**
- Arrow keys: Move/Turn
- Ctrl: Fire
- Space: Use/Open doors
- Alt + Arrows: Strafe
- Shift: Run
- Enter: Menu select

**Gamepad:**
- Left Stick/D-Pad: Move/Turn
- Right Stick: Strafe
- RT/RB: Fire
- A/X: Use/Open doors
- B/Y: Run
- LB/LT: Previous weapon
- Start: Enter/Menu
- Select: Escape

**Mobile:** On-screen D-pad and action buttons

## Building

```bash
./build.sh
```

Outputs `doom.xdc` (~13MB) ready for deployment.

## Credits & Attribution

This project builds upon the work of many talented developers:

- **[id Software](https://github.com/id-Software/DOOM)** - Original DOOM source code (1993, GPL)
- **[PrBoom](http://prboom.sourceforge.net/)** - Enhanced DOOM source port
- **[joeheyming](https://joeheyming.github.io/doom/)** - PrBoom WebAssembly port with audio support
- **[WofWca](https://github.com/WofWca)** - Inspiration from WebXDC DOOM experiments
- **[diekmann](https://github.com/diekmann/wasm-fizzbuzz)** - Original linuxdoom WASM documentation

## License

DOOM source code is released under the GNU General Public License (GPL).
See the original [DOOM source](https://github.com/id-Software/DOOM) for details.

The game assets (`doom.wad`) remain copyrighted by id Software.
