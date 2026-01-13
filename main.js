'use strict';

// Music mapping for DOOM (hash -> file path)
const doomMusic = `b2e05b4e8dff8d76f8f4c3a724e7dbd365390536 = music/d_inter.ogg
0c0acce45130bab935d2f1e85664b29a3c724fcd = music/d_intro.ogg
fca4086939a68ae4ed84c96e6bf0bd5621ddbe3d = music/d_victor.ogg
5971e5e20554f47ca06568832abd37db5e5a94f7 = music/d_intro.ogg
99767e32769229897f7722848fb1ceccc2314d09 = music/d_e1m1.ogg
b5e7dfb4efe9e688bf2ae6163c9d734e89e643b1 = music/d_e1m2.ogg
fda8fa73e4d30a6b961cd46fe6e013395e87a682 = music/d_e1m3.ogg
3805f9bf3f1702f7e7f5483a609d7d3c4daa2323 = music/d_e1m4.ogg
f546ed823b234fe391653029159de7b67a15dbd4 = music/d_e1m5.ogg
4450811b5a6748cfd83e3ea241222f6b88be33f9 = music/d_e1m6.ogg
73edb50d96b0ac03be34a6134b33e4c8f00fc486 = music/d_e1m7.ogg
47d711a6fd32f5047879975027e5b152b52aa1dc = music/d_e1m8.ogg
62c631c2fdaa5ecd9a8d8f369917244f27128810 = music/d_e1m9.ogg
7702a6449585428e718558d8ecc387ef1a21d948 = music/d_e2m1.ogg
1cb1810989cbfae2b29ba8d6d0f8f1175de45f03 = music/d_e2m2.ogg
7d740f3c881a22945e472c68754fd9485cb04750 = music/d_e2m4.ogg
ae9c3dc2f9aeea002327a5204d080ea82505a310 = music/d_e2m6.ogg
b26aad3caa420e9a2c76586cd59433b092fcba1c = music/d_e2m7.ogg
90f06251a2a90bfaefd47a526b28264ea64f4f83 = music/d_e2m8.ogg
b2fb439f23c08c8e2577d262e5ed910a6a62c735 = music/d_e3m1.ogg
b6c07bb249526b864208922d2d9ab655f4aade78 = music/d_e3m2.ogg
ce3587ee503ffe707b2d8b690396114fdae6b411 = music/d_e3m3.ogg
d746ea2aa16b3237422cb18ec66f26e12cb08d40 = music/d_e3m8.ogg`;

// Canvas element
const canvas = document.getElementById('canvas');

// Audio context for SDL2
let audioContext = null;

// Detect touch device and show controls
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
if (isTouchDevice) {
  document.getElementById('controls').classList.add('visible');
}

// This function runs after doom.js loads - called from bottom of this file
async function initDoom() {
  try {
    // Load the WAD file first
    const wadResponse = await fetch('doom.wad');
    const wadData = await wadResponse.arrayBuffer();

    // Initialize audio context
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    window.SDL2 = { audioContext };

    // Initialize Emscripten module with our config
    const doom = await Module({
      canvas: canvas,
      preRun: [function(module) {
        // Write music config
        const enc = new TextEncoder();
        module.FS.writeFile('./doom1-music.cfg', enc.encode(doomMusic));
        // Write WAD file
        module.FS.writeFile('doom.wad', new Uint8Array(wadData));
      }],
      arguments: ['-iwad', 'doom.wad'],
    });

    // Setup touch controls and gamepad after DOOM is loaded
    setupTouchControls();
    setupGamepad();

    // Focus canvas
    canvas.focus();
    canvas.addEventListener('click', () => {
      canvas.focus();
      if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
      }
    });

    // Pause audio when tab hidden
    document.addEventListener('visibilitychange', () => {
      if (audioContext) {
        document.hidden ? audioContext.suspend() : audioContext.resume();
      }
    });

    console.log('DOOM initialized successfully');

  } catch (err) {
    console.error('Failed to load DOOM:', err);
  }
}

// Gamepad support
let gamepadIndex = null;
let gamepadState = {};

function setupGamepad() {
  window.addEventListener('gamepadconnected', (e) => {
    console.log('Gamepad connected:', e.gamepad.id);
    gamepadIndex = e.gamepad.index;
    requestAnimationFrame(pollGamepad);
  });

  window.addEventListener('gamepaddisconnected', (e) => {
    console.log('Gamepad disconnected');
    if (e.gamepad.index === gamepadIndex) {
      gamepadIndex = null;
    }
  });

  // Check if gamepad already connected
  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  for (let i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      gamepadIndex = gamepads[i].index;
      requestAnimationFrame(pollGamepad);
      break;
    }
  }
}

function isButtonPressed(gp, index) {
  return gp.buttons[index] && gp.buttons[index].pressed;
}

function pollGamepad() {
  if (gamepadIndex === null) return;

  const gamepads = navigator.getGamepads();
  const gp = gamepads[gamepadIndex];
  if (!gp) {
    requestAnimationFrame(pollGamepad);
    return;
  }

  // Standard gamepad mapping:
  // Axes: 0=LStickX, 1=LStickY, 2=RStickX, 3=RStickY
  // Buttons: 0=A, 1=B, 2=X, 3=Y, 4=LB, 5=RB, 6=LT, 7=RT
  //          8=Select, 9=Start, 10=LStick, 11=RStick
  //          12=DPadUp, 13=DPadDown, 14=DPadLeft, 15=DPadRight

  const deadzone = 0.3;
  const axes = gp.axes;

  // Debug: log axes values periodically (every 60 frames)
  if (!window.gpDebugFrame) window.gpDebugFrame = 0;
  window.gpDebugFrame++;
  if (window.gpDebugFrame % 60 === 0) {
    console.log('Gamepad axes:', axes[0]?.toFixed(2), axes[1]?.toFixed(2), axes[2]?.toFixed(2), axes[3]?.toFixed(2));
  }

  const mapping = [
    // D-pad and left stick for movement (WASD)
    { input: () => isButtonPressed(gp, 12) || axes[1] < -deadzone, key: 'w', keyCode: 87 },  // Forward
    { input: () => isButtonPressed(gp, 13) || axes[1] > deadzone, key: 's', keyCode: 83 },   // Back
    { input: () => isButtonPressed(gp, 14) || axes[0] < -deadzone, key: 'a', keyCode: 65 },  // Strafe left
    { input: () => isButtonPressed(gp, 15) || axes[0] > deadzone, key: 'd', keyCode: 68 },   // Strafe right
    // D-pad also sends arrow keys for menu navigation
    { input: () => isButtonPressed(gp, 12) || axes[3] < -deadzone, key: 'ArrowUp', keyCode: 38 },    // Menu up
    { input: () => isButtonPressed(gp, 13) || axes[3] > deadzone, key: 'ArrowDown', keyCode: 40 },   // Menu down
    // Right stick for turning (arrow keys)
    { input: () => axes[2] < -deadzone, key: 'ArrowLeft', keyCode: 37 },   // Turn left
    { input: () => axes[2] > deadzone, key: 'ArrowRight', keyCode: 39 },   // Turn right
    // Triggers and bumpers for fire (Q)
    { input: () => isButtonPressed(gp, 7) || isButtonPressed(gp, 5), key: 'q', keyCode: 81 },
    // A/X for use (E) + Enter for menus
    { input: () => isButtonPressed(gp, 0) || isButtonPressed(gp, 2), key: 'e', keyCode: 69 },
    { input: () => isButtonPressed(gp, 0) || isButtonPressed(gp, 2), key: 'Enter', keyCode: 13 },
    // B/Y for run (Shift)
    { input: () => isButtonPressed(gp, 1) || isButtonPressed(gp, 3), key: 'Shift', keyCode: 16 },
    // Start (menu button) for Escape
    { input: () => isButtonPressed(gp, 9), key: 'Escape', keyCode: 27 },
    // Select (share button) for Tab (map)
    { input: () => isButtonPressed(gp, 8), key: 'Tab', keyCode: 9 },
    // LB/LT for weapon prev
    { input: () => isButtonPressed(gp, 4) || isButtonPressed(gp, 6), key: '[', keyCode: 219 },
  ];

  mapping.forEach((m, i) => {
    const pressed = m.input();
    const wasPressed = gamepadState[i];

    if (pressed && !wasPressed) {
      console.log('Gamepad keydown:', m.key, m.keyCode);
      window.dispatchEvent(new KeyboardEvent('keydown', {
        key: m.key,
        keyCode: m.keyCode,
        code: m.key,
        which: m.keyCode,
        bubbles: true,
        cancelable: true,
        view: window
      }));
      // Resume audio on first input
      if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
      }
    } else if (!pressed && wasPressed) {
      console.log('Gamepad keyup:', m.key, m.keyCode);
      window.dispatchEvent(new KeyboardEvent('keyup', {
        key: m.key,
        keyCode: m.keyCode,
        code: m.key,
        which: m.keyCode,
        bubbles: true,
        cancelable: true,
        view: window
      }));
    }

    gamepadState[i] = pressed;
  });

  requestAnimationFrame(pollGamepad);
}

// Touch control setup
function setupTouchControls() {
  const touchButtons = [
    ['btnUp', 'ArrowUp', 38],
    ['btnDown', 'ArrowDown', 40],
    ['btnLeft', 'ArrowLeft', 37],
    ['btnRight', 'ArrowRight', 39],
    ['btnFire', 'Control', 17],
    ['btnUse', ' ', 32],
    ['btnStrafe', 'Alt', 18],
    ['btnEnter', 'Enter', 13],
  ];

  touchButtons.forEach(([id, key, keyCode]) => {
    const btn = document.getElementById(id);
    if (!btn) return;

    const sendKey = (type) => {
      canvas.dispatchEvent(new KeyboardEvent(type, {
        key,
        keyCode,
        code: key,
        which: keyCode,
        bubbles: true,
        cancelable: true
      }));
    };

    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      sendKey('keydown');
      if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
      }
    }, { passive: false });

    btn.addEventListener('touchend', (e) => {
      e.preventDefault();
      sendKey('keyup');
    }, { passive: false });

    btn.addEventListener('touchcancel', () => sendKey('keyup'));
  });
}

// Wait for doom.js to load, then initialize
// doom.js sets window.Module as a factory function
window.addEventListener('load', initDoom);
