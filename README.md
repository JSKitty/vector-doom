# DOOM WebXDC

Classic DOOM (1993) running as a WebXDC mini-app for [Vector](https://vectorapp.io) and other WebXDC-compatible messengers.

## Features

- Full Episode 1 (Knee-Deep in the Dead)
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
- Enter: Menu select

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

The shareware WAD (`doom.wad`) is freely distributable but remains copyrighted by id Software.
