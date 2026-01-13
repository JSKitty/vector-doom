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

    // Setup touch controls after DOOM is loaded
    setupTouchControls();

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
