import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLenis } from "lenis/react";
import { Volume2, VolumeX } from "lucide-react";

// ─── Sound Synthesizer (HTML5 Web Audio API) ──────────────────────────────────
class SoundFX {
  static ctx = null;
  static isMuted = false;

  static init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  static playStart() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    const now = this.ctx.currentTime;
    
    // Play a friendly C5 -> G5 double beep
    const notes = [523.25, 783.99];
    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = "sine";
      const noteTime = now + index * 0.08;
      osc.frequency.setValueAtTime(freq, noteTime);
      
      gain.gain.setValueAtTime(0.04, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.12);

      osc.start(noteTime);
      osc.stop(noteTime + 0.12);
    });
  }

  static playEat() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = "square";
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  static playGold() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    const now = this.ctx.currentTime;
    
    // Play a sparkling 4-note rapid arpeggio (C5 -> E5 -> G5 -> C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = "triangle";
      const noteTime = now + index * 0.05;
      osc.frequency.setValueAtTime(freq, noteTime);
      
      gain.gain.setValueAtTime(0.06, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.15);

      osc.start(noteTime);
      osc.stop(noteTime + 0.15);
    });
  }

  static playDie() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = "sawtooth";
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(30, now + 0.4);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.start(now);
    osc.stop(now + 0.4);
  }
}

// ─── Constants ───────────────────────────────────────────────────────────────
const CELL        = 24;
const COLS        = 16;
const ROWS        = 16;
const CANVAS_SIZE = CELL * COLS; // 384px
const RADIUS      = 5;
const BASE_SPEED  = 160;
const MIN_SPEED   = 75;

const DIRS = {
  ArrowUp:    { x: 0, y: -1 },
  ArrowDown:  { x: 0, y:  1 },
  ArrowLeft:  { x: -1, y: 0 },
  ArrowRight: { x:  1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y:  1 },
  a: { x: -1, y: 0 },
  d: { x:  1, y: 0 },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  if (w <= 0 || h <= 0) return;
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y,     x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h,     x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y,         x + r, y);
  ctx.closePath();
}

function spawnParticles(particles, fx, fy) {
  // Spawn satisfying soft digestion/chewing crumbs instead of a violent explosion
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2; // drift upward
    const speed = 0.4 + Math.random() * 0.8;
    particles.push({
      x: fx * CELL + CELL / 2,
      y: fy * CELL + CELL / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0,
      size: 1.6 + Math.random() * 2.0,
      isCrumb: true,
    });
  }
}

function randomFood(s) {
  // Infinite loop safety check (board is full)
  if (s.snake.length >= COLS * ROWS) {
    return { x: -1, y: -1, type: 0 };
  }
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
  } while (s.snake.some((seg) => seg.x === pos.x && seg.y === pos.y));
  
  // Shuffle bag implementation: cycle through all 20 prey without repeats
  if (!s.preyPool || s.preyPool.length === 0) {
    const pool = [];
    // Standard prey (0 to 19)
    for (let i = 0; i <= 19; i++) {
      pool.push(i);
    }
    // New prey (23 to 58)
    for (let i = 23; i <= 58; i++) {
      pool.push(i);
    }
    // Shuffle the pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    s.preyPool = pool;
  }
  
  // Mini-Boss Spawn: Every 10 points (score > 0), spawn Crowned Frog (20) or Golden Beetle (21)
  if (s.score > 0 && s.score % 10 === 0) {
    pos.type = Math.random() < 0.5 ? 20 : 21;
  } else {
    // Standard prey from pool
    pos.type = s.preyPool.pop();
    // Make sure standard prey doesn't clash with mini-boss IDs
    if (pos.type === 20 || pos.type === 21 || pos.type === 22) {
      pos.type = Math.floor(Math.random() * 2); // default to rat/frog
    }
  }
  return pos;
}

// ─── Food Drawing Router ──────────────────────────────────────────────────────
function drawFood(ctx, food, snakeHead, timestamp) {
  const type = food.type ?? 0;
  let cx = food.x * CELL + CELL / 2;
  let cy = food.y * CELL + CELL / 2;

  // Inset edge-spawning prey slightly by 1.8px so they don't press directly against the border walls
  if (food.x === 0) cx += 1.8;
  if (food.x === COLS - 1) cx -= 1.8;
  if (food.y === 0) cy += 1.8;
  if (food.y === ROWS - 1) cy -= 1.8;

  // Vector from food center to snake head
  let ux = 0;
  let uy = 0;
  if (snakeHead) {
    const hx = snakeHead.x * CELL + CELL / 2;
    const hy = snakeHead.y * CELL + CELL / 2;
    const dx = hx - cx;
    const dy = hy - cy;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    ux = dx / len;
    uy = dy / len;
  }

  // Calculate proximity and trembling intensity
  let panicSwayX = 0;
  let panicSwayY = 0;
  let isPanicked = false;
  if (snakeHead) {
    const dist = Math.sqrt((snakeHead.x - food.x) * (snakeHead.x - food.x) + (snakeHead.y - food.y) * (snakeHead.y - food.y));
    if (dist < 4.0) {
      isPanicked = true;
      const severity = Math.max(0, 1 - dist / 4.0); // 0 at dist=4, 1 at dist=0
      // Softer tremble oscillation
      panicSwayX = Math.sin(timestamp * 0.045) * 0.42 * severity;
      panicSwayY = Math.cos(timestamp * 0.045) * 0.42 * severity;
    }
  }

  ctx.save();
  ctx.translate(cx + panicSwayX, cy + panicSwayY);

  // Soft breathing scale animation (pulses at 4.5Hz)
  const breath = Math.sin(timestamp / 220) * 0.035;
  
  // Customize base scale per food type to ensure ALL animals fill the cell box as much as possible
  let baseScale = 1.45; // Default upscale for smaller animals, insects, reptiles, and fish
  if (type === 0 || type === 3 || type === 4 || type === 5 || type === 6 || type === 7 || type === 9) {
    // Large front-facing rodent faces (Rat, Mouse, Hamster, Gerbil, Rabbit, Guinea Pig, Squirrel)
    baseScale = 1.25;
  } else if (type === 2 || type === 22 || type === 41 || type === 58) {
    // Eggs (Pearl Egg, Golden Egg, Turtle Eggs, Reptile Eggs)
    baseScale = 1.18;
  }
  
  const scaleVal = baseScale + breath;
  ctx.scale(scaleVal, scaleVal);

  switch (type) {
    case 0:  drawRatFood(ctx, ux, uy, timestamp); break;
    case 1:  drawFrogFood(ctx, ux, uy, timestamp); break;
    case 2:  drawEggFood(ctx, timestamp); break;
    case 3:  drawMouseFood(ctx, ux, uy, timestamp); break;
    case 4:  drawHamsterFood(ctx, ux, uy, timestamp); break;
    case 5:  drawGerbilFood(ctx, ux, uy, timestamp); break;
    case 6:  drawRabbitFood(ctx, ux, uy, timestamp); break;
    case 7:  drawGuineaPigFood(ctx, ux, uy, timestamp); break;
    case 8:  drawMoleFood(ctx, ux, uy, timestamp); break;
    case 9:  drawSquirrelFood(ctx, ux, uy, timestamp); break;
    case 10: drawChickFood(ctx, ux, uy, timestamp); break;
    case 11: drawDucklingFood(ctx, ux, uy, timestamp); break;
    case 12: drawLizardFood(ctx, ux, uy, timestamp); break;
    case 13: drawToadFood(ctx, ux, uy, timestamp); break;
    case 14: drawSmallSnakeFood(ctx, ux, uy, timestamp); break;
    case 15: drawFishFood(ctx, ux, uy, timestamp); break;
    case 16: drawSlugFood(ctx, ux, uy, timestamp); break;
    case 17: drawSnailFood(ctx, ux, uy, timestamp); break;
    case 18: drawEarthwormFood(ctx, ux, uy, timestamp); break;
    case 19: drawCricketFood(ctx, ux, uy, timestamp); break;
    case 20:
    case 21:
    case 22: drawGoldenEggFood(ctx, timestamp); break;
    case 23: drawVoleFood(ctx, ux, uy, timestamp); break;
    case 24: drawShrewFood(ctx, ux, uy, timestamp); break;
    case 25: drawChipmunkFood(ctx, ux, uy, timestamp); break;
    case 26: drawHareFood(ctx, ux, uy, timestamp); break;
    case 27: drawBatFood(ctx, ux, uy, timestamp); break;
    case 28: drawOpossumFood(ctx, ux, uy, timestamp); break;
    case 29: drawMonkeyFood(ctx, ux, uy, timestamp); break;
    case 30: drawDeerFood(ctx, ux, uy, timestamp); break;
    case 31: drawPigFood(ctx, ux, uy, timestamp); break;
    case 32: drawPigeonFood(ctx, ux, uy, timestamp); break;
    case 33: drawSparrowFood(ctx, ux, uy, timestamp); break;
    case 34: drawQuailFood(ctx, ux, uy, timestamp); break;
    case 35: drawParrotFood(ctx, ux, uy, timestamp); break;
    case 36: drawNestlingFood(ctx, ux, uy, timestamp); break;
    case 37: drawGeckoFood(ctx, ux, uy, timestamp); break;
    case 38: drawSkinkFood(ctx, ux, uy, timestamp); break;
    case 39: drawIguanaFood(ctx, ux, uy, timestamp); break;
    case 40: drawTurtleFood(ctx, ux, uy, timestamp); break;
    case 41: drawTurtleEggsFood(ctx, timestamp); break;
    case 42: drawCrocodileHatchlingFood(ctx, ux, uy, timestamp); break;
    case 43: drawSalamanderFood(ctx, ux, uy, timestamp); break;
    case 44: drawNewtFood(ctx, ux, uy, timestamp); break;
    case 45: drawTadpolesFood(ctx, ux, uy, timestamp); break;
    case 46: drawMinnowsFood(ctx, ux, uy, timestamp); break;
    case 47: drawCatfishFood(ctx, ux, uy, timestamp); break;
    case 48: drawCarpFood(ctx, ux, uy, timestamp); break;
    case 49: drawTroutFood(ctx, ux, uy, timestamp); break;
    case 50: drawEelsFood(ctx, ux, uy, timestamp); break;
    case 51: drawGoldfishFood(ctx, ux, uy, timestamp); break;
    case 52: drawGrasshopperFood(ctx, ux, uy, timestamp); break;
    case 53: drawCockroachFood(ctx, ux, uy, timestamp); break;
    case 54: drawBeetleFood(ctx, ux, uy, timestamp); break;
    case 55: drawCaterpillarFood(ctx, ux, uy, timestamp); break;
    case 56: drawSpiderFood(ctx, ux, uy, timestamp); break;
    case 57: drawScorpionFood(ctx, ux, uy, timestamp); break;
    case 58: drawReptileEggsFood(ctx, timestamp); break;
    default: drawEggFood(ctx, timestamp); break;
  }

  // Draw sweat droplet if the prey is panicked (ignore for normal and golden eggs)
  if (isPanicked && type !== 2 && type !== 20 && type !== 21 && type !== 22 && type !== 41 && type !== 58) {
    ctx.fillStyle = "#38bdf8"; // Light sky blue
    ctx.beginPath();
    const sx = 5.0;
    const sy = -5.0 + Math.sin(timestamp * 0.01) * 1.0;
    ctx.arc(sx, sy, 0.7, 0, Math.PI);
    ctx.lineTo(sx, sy - 1.6);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

// 🐭 1. Front-Facing Rat (grey, matching emoji & snake rounded-rect style)
function drawRatFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(228, 228, 231, 0.35)"; // zinc-200
  ctx.shadowBlur = 5 + Math.sin(timestamp / 220) * 2;

  // Ears
  const earTwitch = Math.sin(timestamp / 160) > 0.85 ? Math.sin(timestamp / 30) * 1.5 : 0;
  
  // Left Ear
  ctx.fillStyle = "#a1a1aa";
  ctx.beginPath();
  ctx.arc(-6.5, -4.5 + earTwitch * 0.6, 4.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fda4af";
  ctx.beginPath();
  ctx.arc(-6.5, -4.5 + earTwitch * 0.6, 2.6, 0, Math.PI * 2);
  ctx.fill();

  // Right Ear
  ctx.fillStyle = "#a1a1aa";
  ctx.beginPath();
  ctx.arc(6.5, -4.5 + earTwitch * 0.6, 4.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fda4af";
  ctx.beginPath();
  ctx.arc(6.5, -4.5 + earTwitch * 0.6, 2.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;

  // Chubby Head Face
  ctx.fillStyle = "#d4d4d8";
  roundRect(ctx, -7.5, -5.5, 15, 13, 3.8);
  ctx.fill();
  
  ctx.strokeStyle = "#a1a1aa";
  ctx.lineWidth = 0.85;
  roundRect(ctx, -7.5, -5.5, 15, 13, 3.8);
  ctx.stroke();

  // Eyes (Shocked/Petrified)
  const isBlinking = (timestamp % 3500) < 180;
  
  // Pupil offset (max offset 0.9px)
  const px = ux * 0.9;
  const py = uy * 0.9;

  // Left Eye
  const lex = -3.2;
  const ley = -1.2;
  if (!isBlinking) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(lex, ley, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#18181b";
    ctx.beginPath();
    ctx.arc(lex + px, ley + py, 0.6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = "#18181b";
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(lex - 1.4, ley); ctx.lineTo(lex + 1.4, ley); ctx.stroke();
  }

  // Right Eye
  const rex = 3.2;
  const rey = -1.2;
  if (!isBlinking) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(rex, rey, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#18181b";
    ctx.beginPath();
    ctx.arc(rex + px, rey + py, 0.6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = "#18181b";
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(rex - 1.4, rey); ctx.lineTo(rex + 1.4, rey); ctx.stroke();
  }

  // Nose (Static)
  ctx.fillStyle = "#fda4af";
  ctx.beginPath();
  ctx.moveTo(0, 2.4);
  ctx.lineTo(1.6, 3.8);
  ctx.lineTo(-1.6, 3.8);
  ctx.closePath();
  ctx.fill();

  // Shocked Tiny Mouth
  ctx.fillStyle = "#18181b";
  ctx.beginPath();
  ctx.arc(0, 4.4, 1.0, 0, Math.PI * 2);
  ctx.fill();

  // Whiskers
  ctx.strokeStyle = "#71717a";
  ctx.lineWidth = 0.65;
  
  // Left whiskers
  ctx.beginPath();
  ctx.moveTo(-2.2, 3.2); ctx.lineTo(-8, 2.5);
  ctx.moveTo(-2.2, 3.6); ctx.lineTo(-8.5, 3.6);
  ctx.moveTo(-2.2, 4.0); ctx.lineTo(-8, 4.7);
  // Right whiskers
  ctx.moveTo(2.2, 3.2);  ctx.lineTo(8, 2.5);
  ctx.moveTo(2.2, 3.6);  ctx.lineTo(8.5, 3.6);
  ctx.moveTo(2.2, 4.0);  ctx.lineTo(8, 4.7);
  ctx.stroke();
}

// 🐸 2. Front-Facing Frog (green, matching emoji & snake rounded-rect style)
function drawFrogFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(74, 222, 128, 0.35)"; // neon green
  ctx.shadowBlur = 5 + Math.sin(timestamp / 220) * 2;

  // Bulging Eyes
  ctx.fillStyle = "#16a34a";
  ctx.beginPath();
  ctx.arc(-5.8, -4.5, 4.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(5.8, -4.5, 4.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;

  // Chubby Head Body
  ctx.fillStyle = "#22c55e";
  roundRect(ctx, -8.0, -5.0, 16, 12, 4.2);
  ctx.fill();
  
  ctx.strokeStyle = "#16a34a";
  ctx.lineWidth = 0.85;
  roundRect(ctx, -8.0, -5.0, 16, 12, 4.2);
  ctx.stroke();

  // Eyes (Petrified)
  const isBlinking = (timestamp % 4200) < 180;
  
  // Pupil offset (max offset 1.5px)
  const px = ux * 1.5;
  const py = uy * 1.5;

  // Left eye details
  if (!isBlinking) {
    ctx.fillStyle = "#eab308";
    ctx.beginPath();
    ctx.arc(-5.8, -4.5, 3.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#18181b";
    ctx.beginPath();
    ctx.arc(-5.8 + px, -4.5 + py, 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-6.2 + px * 0.3, -5.0 + py * 0.3, 0.35, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = "#18181b";
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(-8.0, -4.5); ctx.lineTo(-3.6, -4.5); ctx.stroke();
  }

  // Right eye details
  if (!isBlinking) {
    ctx.fillStyle = "#eab308";
    ctx.beginPath();
    ctx.arc(5.8, -4.5, 3.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#18181b";
    ctx.beginPath();
    ctx.arc(5.8 + px, -4.5 + py, 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(5.4 + px * 0.3, -5.0 + py * 0.3, 0.35, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = "#18181b";
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(3.6, -4.5); ctx.lineTo(8.0, -4.5); ctx.stroke();
  }

  // Throat / Belly patch
  const throatPuff = Math.sin(timestamp / 110) * 0.6;
  ctx.fillStyle = "#bef264";
  ctx.beginPath();
  ctx.ellipse(0, 4.0, 4.5, 2.2 + throatPuff, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shocked Open Mouth
  ctx.fillStyle = "#18181b";
  ctx.beginPath();
  ctx.arc(0, 2.5, 2.0, 0, Math.PI * 2);
  ctx.fill();

  // Tiny Nostrils
  ctx.fillStyle = "#14532d";
  ctx.beginPath();
  ctx.arc(-1.2, -0.6, 0.4, 0, Math.PI * 2);
  ctx.arc(1.2, -0.6, 0.4, 0, Math.PI * 2);
  ctx.fill();
}


// 🥚 3. Luminous 3D Pearl Egg (Food - shifting iridescent pastel pearl)
function drawEggFood(ctx, timestamp) {
  // Soft cyan/pink shadow glow
  ctx.shadowColor = "rgba(165, 243, 252, 0.25)";
  ctx.shadowBlur = 8;

  // Egg Body (mathematically smooth egg curve, scaled up by 1.2x)
  ctx.beginPath();
  ctx.moveTo(0, -8.16);
  ctx.bezierCurveTo(5.28, -8.16, 6.72, 1.44, 6.72, 5.28);
  ctx.bezierCurveTo(6.72, 9.36, 4.08, 10.8, 0, 10.8);
  ctx.bezierCurveTo(-4.08, 10.8, -6.72, 9.36, -6.72, 5.28);
  ctx.bezierCurveTo(-6.72, 1.44, -5.28, -8.16, 0, -8.16);
  ctx.closePath();

  // Shading Gradient (shifting iridescence: pearl-white to soft peach to lavender-blue)
  const grad = ctx.createRadialGradient(-2.2, -2.6, 1.4, 0, 1.8, 10.2);
  grad.addColorStop(0, "#ffffff");      // hot highlight core
  grad.addColorStop(0.3, "#fef3c7");     // soft peach/yellow highlight
  grad.addColorStop(0.65, "#f472b6");    // soft pink midtone
  grad.addColorStop(1.0, "#a78bfa");     // lavender-blue shadow rim
  ctx.fillStyle = grad;
  ctx.fill();

  // Crisp iridescent outline
  ctx.strokeStyle = "rgba(165, 243, 252, 0.55)";
  ctx.lineWidth = 0.75;
  ctx.stroke();

  ctx.shadowBlur = 0;

  // Gloss highlight glint
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.beginPath();
  ctx.arc(-2.4, -3.8, 1.2, 0, Math.PI * 2);
  ctx.fill();
}

// 👑 22. Luminous 3D Golden Egg (Mini-boss, gives +3 points)
function drawGoldenEggFood(ctx, timestamp) {
  // Rich golden shadow glow
  ctx.shadowColor = "rgba(250, 204, 21, 0.45)";
  ctx.shadowBlur = 8;

  // Egg Body (mathematically smooth egg curve, scaled up by 1.2x)
  ctx.beginPath();
  ctx.moveTo(0, -8.16);
  ctx.bezierCurveTo(5.28, -8.16, 6.72, 1.44, 6.72, 5.28);
  ctx.bezierCurveTo(6.72, 9.36, 4.08, 10.8, 0, 10.8);
  ctx.bezierCurveTo(-4.08, 10.8, -6.72, 9.36, -6.72, 5.28);
  ctx.bezierCurveTo(-6.72, 1.44, -5.28, -8.16, 0, -8.16);
  ctx.closePath();

  // 3D Shading Gradient (light from top-left, rich gold metallic shading)
  const grad = ctx.createRadialGradient(-2.2, -2.6, 1.4, 0, 1.8, 10.2);
  grad.addColorStop(0, "#fef08a");      // bright gold highlight
  grad.addColorStop(0.35, "#fbbf24");   // amber-400 core
  grad.addColorStop(1.0, "#92400e");    // amber-800 deep metallic shadow
  ctx.fillStyle = grad;
  ctx.fill();

  // Crisp gold shell outline
  ctx.strokeStyle = "rgba(250, 204, 21, 0.6)";
  ctx.lineWidth = 0.75;
  ctx.stroke();

  ctx.shadowBlur = 0;

  // Gloss highlight glint
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.beginPath();
  ctx.arc(-2.4, -3.8, 1.2, 0, Math.PI * 2);
  ctx.fill();
}

// 🐭 3. Brown Field Mouse (smaller, lighter brown, big round ears)
function drawMouseFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(212, 163, 115, 0.3)";
  ctx.shadowBlur = 5;

  const earTwitch = Math.sin(timestamp / 140) > 0.88 ? Math.sin(timestamp / 25) * 1.3 : 0;

  // Left Ear
  ctx.fillStyle = "#c2a68f";
  ctx.beginPath(); ctx.arc(-6.0, -5.0 + earTwitch, 4.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fda4af";
  ctx.beginPath(); ctx.arc(-6.0, -5.0 + earTwitch, 2.4, 0, Math.PI * 2); ctx.fill();

  // Right Ear
  ctx.fillStyle = "#c2a68f";
  ctx.beginPath(); ctx.arc(6.0, -5.0 + earTwitch, 4.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fda4af";
  ctx.beginPath(); ctx.arc(6.0, -5.0 + earTwitch, 2.4, 0, Math.PI * 2); ctx.fill();

  // Head Body
  ctx.fillStyle = "#d5c3b2";
  roundRect(ctx, -6.5, -5.0, 13, 11, 3.5);
  ctx.fill();

  // Shocked tracking eyes
  const isBlinking = (timestamp % 3800) < 180;
  const px = ux * 0.8;
  const py = uy * 0.8;

  // Left eye
  if (!isBlinking) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(-2.8, -1.2, 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#18181b";
    ctx.beginPath(); ctx.arc(-2.8 + px, -1.2 + py, 0.6, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.strokeStyle = "#18181b"; ctx.lineWidth = 1.0;
    ctx.beginPath(); ctx.moveTo(-4.0, -1.2); ctx.lineTo(-1.6, -1.2); ctx.stroke();
  }

  // Right eye
  if (!isBlinking) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(2.8, -1.2, 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#18181b";
    ctx.beginPath(); ctx.arc(2.8 + px, -1.2 + py, 0.6, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.strokeStyle = "#18181b"; ctx.lineWidth = 1.0;
    ctx.beginPath(); ctx.moveTo(1.6, -1.2); ctx.lineTo(4.0, -1.2); ctx.stroke();
  }

  // Pink nose
  ctx.fillStyle = "#fda4af";
  ctx.beginPath(); ctx.moveTo(0, 1.6); ctx.lineTo(1.2, 2.6); ctx.lineTo(-1.2, 2.6); ctx.closePath(); ctx.fill();

  // Wide mouth (scared)
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(0, 3.8, 1.2, 0, Math.PI * 2); ctx.fill();

  // Whiskers
  ctx.strokeStyle = "#a1a1aa"; ctx.lineWidth = 0.55;
  ctx.beginPath();
  ctx.moveTo(-1.8, 2.4); ctx.lineTo(-6.5, 1.8);
  ctx.moveTo(-1.8, 2.8); ctx.lineTo(-7.0, 2.8);
  ctx.moveTo(1.8, 2.4); ctx.lineTo(6.5, 1.8);
  ctx.moveTo(1.8, 2.8); ctx.lineTo(7.0, 2.8);
  ctx.stroke();
}

// 🐹 4. Chubby Golden Hamster (orange cheeks, white patches, petrified)
function drawHamsterFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(245, 158, 11, 0.25)";
  ctx.shadowBlur = 5;

  // Tiny rounded ears
  ctx.fillStyle = "#b45309";
  ctx.beginPath(); ctx.arc(-5.4, -5.6, 3.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fbcfe8";
  ctx.beginPath(); ctx.arc(-5.4, -5.6, 1.8, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = "#b45309";
  ctx.beginPath(); ctx.arc(5.4, -5.6, 3.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fbcfe8";
  ctx.beginPath(); ctx.arc(5.4, -5.6, 1.8, 0, Math.PI * 2); ctx.fill();

  // Fat Golden Head
  ctx.fillStyle = "#f59e0b";
  roundRect(ctx, -7.5, -5.0, 15, 13, 5.0);
  ctx.fill();

  // White cheek patches
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(-4.0, 3.5, 3.0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(4.0, 3.5, 3.0, 0, Math.PI * 2); ctx.fill();

  // Shocked eyes
  const isBlinking = (timestamp % 4500) < 180;
  const px = ux * 0.9;
  const py = uy * 0.9;

  // Left Eye
  if (!isBlinking) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(-3.0, -1.0, 1.9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#18181b";
    ctx.beginPath(); ctx.arc(-3.0 + px, -1.0 + py, 0.7, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.strokeStyle = "#18181b"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-4.5, -1.0); ctx.lineTo(-1.5, -1.0); ctx.stroke();
  }

  // Right Eye
  if (!isBlinking) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(3.0, -1.0, 1.9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#18181b";
    ctx.beginPath(); ctx.arc(3.0 + px, -1.0 + py, 0.7, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.strokeStyle = "#18181b"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(1.5, -1.0); ctx.lineTo(4.5, -1.0); ctx.stroke();
  }

  // Nose and buck teeth
  ctx.fillStyle = "#fda4af";
  ctx.beginPath(); ctx.arc(0, 1.6, 1.0, 0, Math.PI * 2); ctx.fill();

  // Scared mouth open
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(0, 3.4, 1.4, 0, Math.PI * 2); ctx.fill();

  // Teeth poking out (scared hamster)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(-0.8, 2.5, 0.7, 1.4);
  ctx.fillRect(0.1, 2.5, 0.7, 1.4);
}

// 🐿️ 5. Sandy Gerbil (tan color, slightly pointed muzzle)
function drawGerbilFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(217, 180, 143, 0.25)";
  ctx.shadowBlur = 5;

  // Medium Ears
  ctx.fillStyle = "#b58e65";
  ctx.beginPath(); ctx.arc(-5.5, -5.0, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fbcfe8";
  ctx.beginPath(); ctx.arc(-5.5, -5.0, 2.0, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = "#b58e65";
  ctx.beginPath(); ctx.arc(5.5, -5.0, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fbcfe8";
  ctx.beginPath(); ctx.arc(5.5, -5.0, 2.0, 0, Math.PI * 2); ctx.fill();

  // Head
  ctx.fillStyle = "#d9b48f";
  roundRect(ctx, -7.0, -5.0, 14, 12, 4.0);
  ctx.fill();

  // Eyes tracking
  const isBlinking = (timestamp % 3900) < 180;
  const px = ux * 0.85;
  const py = uy * 0.85;

  // Left Eye
  if (!isBlinking) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(-3.0, -1.0, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#18181b";
    ctx.beginPath(); ctx.arc(-3.0 + px, -1.0 + py, 0.7, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.strokeStyle = "#18181b"; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(-4.3, -1.0); ctx.lineTo(-1.7, -1.0); ctx.stroke();
  }

  // Right Eye
  if (!isBlinking) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(3.0, -1.0, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#18181b";
    ctx.beginPath(); ctx.arc(3.0 + px, -1.0 + py, 0.7, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.strokeStyle = "#18181b"; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(1.7, -1.0); ctx.lineTo(4.3, -1.0); ctx.stroke();
  }

  // Muzzle (pointed)
  ctx.fillStyle = "#e5d5c5";
  ctx.beginPath(); ctx.arc(0, 2.0, 2.2, 0, Math.PI * 2); ctx.fill();

  // Pink nose
  ctx.fillStyle = "#fda4af";
  ctx.beginPath(); ctx.arc(0, 1.0, 0.9, 0, Math.PI * 2); ctx.fill();

  // Shocked mouth
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(0, 3.2, 1.0, 0, Math.PI * 2); ctx.fill();
}

// 🐰 6. Scared White Rabbit (long ears, twitching pink nose, wide eyes)
function drawRabbitFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(255, 255, 255, 0.25)";
  ctx.shadowBlur = 5;

  const earTwitch = Math.sin(timestamp / 100) * 0.8;

  // Left Long Ear
  ctx.fillStyle = "#e2e8f0";
  roundRect(ctx, -6.5, -11.0 + earTwitch * 0.5, 3.2, 8.5, 1.6); ctx.fill();
  ctx.fillStyle = "#fbcfe8";
  roundRect(ctx, -5.5, -10.0 + earTwitch * 0.5, 1.5, 7.0, 1.0); ctx.fill();

  // Right Long Ear
  ctx.fillStyle = "#e2e8f0";
  roundRect(ctx, 3.3, -11.0 - earTwitch * 0.5, 3.2, 8.5, 1.6); ctx.fill();
  ctx.fillStyle = "#fbcfe8";
  roundRect(ctx, 4.3, -10.0 - earTwitch * 0.5, 1.5, 7.0, 1.0); ctx.fill();

  // Round Head
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, -7.5, -4.5, 15, 12, 4.5);
  ctx.fill();
  ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 0.5;
  roundRect(ctx, -7.5, -4.5, 15, 12, 4.5); ctx.stroke();

  // Petrified eyes (larger, pinkish-red iris like an albino bunny)
  const isBlinking = (timestamp % 4800) < 180;
  const px = ux * 1.1;
  const py = uy * 1.1;

  // Left Eye
  if (!isBlinking) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(-3.0, -1.0, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f87171"; // Scared red albino iris
    ctx.beginPath(); ctx.arc(-3.0 + px * 0.4, -1.0 + py * 0.4, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#18181b";
    ctx.beginPath(); ctx.arc(-3.0 + px, -1.0 + py, 0.6, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.strokeStyle = "#18181b"; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(-4.5, -1.0); ctx.lineTo(-1.5, -1.0); ctx.stroke();
  }

  // Right Eye
  if (!isBlinking) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(3.0, -1.0, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f87171";
    ctx.beginPath(); ctx.arc(3.0 + px * 0.4, -1.0 + py * 0.4, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#18181b";
    ctx.beginPath(); ctx.arc(3.0 + px, -1.0 + py, 0.6, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.strokeStyle = "#18181b"; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(1.5, -1.0); ctx.lineTo(4.5, -1.0); ctx.stroke();
  }

  // Twitching nose
  const noseTwitch = Math.sin(timestamp / 60) * 0.3;
  ctx.fillStyle = "#fbcfe8";
  ctx.beginPath();
  ctx.moveTo(0, 1.4 + noseTwitch);
  ctx.lineTo(1.1, 2.2 + noseTwitch);
  ctx.lineTo(-1.1, 2.2 + noseTwitch);
  ctx.closePath();
  ctx.fill();

  // Shocked mouth
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(0, 3.6, 1.2, 0, Math.PI * 2); ctx.fill();
}

// 🐹 7. Calico Guinea Pig (patchwork orange/brown/white, floppy ears)
function drawGuineaPigFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(120, 53, 4, 0.2)";
  ctx.shadowBlur = 5;

  // Floppy side ears
  ctx.fillStyle = "#78350f";
  ctx.beginPath(); ctx.arc(-7.8, -3.0, 2.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(7.8, -3.0, 2.6, 0, Math.PI * 2); ctx.fill();

  // Base Body (White)
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, -8.0, -5.0, 16, 13, 5.0);
  ctx.fill();

  // Orange calico patch on left side
  ctx.fillStyle = "#ea580c";
  ctx.beginPath();
  ctx.moveTo(-8.0, -5.0);
  ctx.lineTo(-2.0, -5.0);
  ctx.quadraticCurveTo(-4.0, 2.0, -8.0, 4.0);
  ctx.closePath();
  ctx.fill();

  // Dark brown patch on right side
  ctx.fillStyle = "#451a03";
  ctx.beginPath();
  ctx.moveTo(8.0, -5.0);
  ctx.lineTo(3.0, -5.0);
  ctx.quadraticCurveTo(5.0, 3.0, 8.0, 5.5);
  ctx.closePath();
  ctx.fill();

  // Stroke outline to clean edges
  ctx.strokeStyle = "rgba(0, 0, 0, 0.08)"; ctx.lineWidth = 0.5;
  roundRect(ctx, -8.0, -5.0, 16, 13, 5.0); ctx.stroke();

  // Petrified eyes
  const isBlinking = (timestamp % 4100) < 180;
  const px = ux * 0.9;
  const py = uy * 0.9;

  // Left Eye
  if (!isBlinking) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(-3.5, -0.8, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#18181b";
    ctx.beginPath(); ctx.arc(-3.5 + px, -0.8 + py, 0.7, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.strokeStyle = "#18181b"; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(-4.8, -0.8); ctx.lineTo(-2.2, -0.8); ctx.stroke();
  }

  // Right Eye
  if (!isBlinking) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(3.5, -0.8, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#18181b";
    ctx.beginPath(); ctx.arc(3.5 + px, -0.8 + py, 0.7, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.strokeStyle = "#18181b"; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(2.2, -0.8); ctx.lineTo(4.8, -0.8); ctx.stroke();
  }

  // Snout and scared mouth
  ctx.fillStyle = "#fbcfe8";
  ctx.beginPath(); ctx.arc(0, 2.0, 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(0, 2.2, 0.9, 0, Math.PI * 2); ctx.fill();
}

// 🦴 8. Velvet Velvet Mole (coal-black head, pink spade paws, shocked)
function drawMoleFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 5;

  // Velvet Head (coal black)
  ctx.fillStyle = "#27272a";
  roundRect(ctx, -7.5, -6.0, 15, 13, 5.0);
  ctx.fill();

  // Pink nose / snout
  ctx.fillStyle = "#fbcfe8";
  roundRect(ctx, -2.5, -0.5, 5, 5, 2.0);
  ctx.fill();
  ctx.fillStyle = "#f472b6";
  ctx.beginPath(); ctx.arc(0, -0.5, 1.1, 0, Math.PI * 2); ctx.fill();

  // Shocked beady eyes (mole eyes are tiny)
  const px = ux * 0.55;
  const py = uy * 0.55;

  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(-3.2, -2.4, 1.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(-3.2 + px, -2.4 + py, 0.6, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(3.2, -2.4, 1.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(3.2 + px, -2.4 + py, 0.6, 0, Math.PI * 2); ctx.fill();

  // Scared mouth
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(0, 3.6, 1.0, 0, Math.PI * 2); ctx.fill();

  // Spade claws holding face in panic
  const panSway = Math.sin(timestamp / 90) * 0.5;
  ctx.fillStyle = "#fbcfe8";
  ctx.strokeStyle = "#f472b6"; ctx.lineWidth = 0.5;
  
  // Left claw
  roundRect(ctx, -8.0 - panSway, 2.0, 3.8, 4.4, 1.0); ctx.fill(); ctx.stroke();
  // Right claw
  roundRect(ctx, 4.2 + panSway, 2.0, 3.8, 4.4, 1.0); ctx.fill(); ctx.stroke();
}

// 🐿️ 9. Copper Squirrel (copper fur, tufted ears, holding acorn in shock)
function drawSquirrelFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(194, 65, 12, 0.25)";
  ctx.shadowBlur = 5;

  // Tufted ears
  ctx.fillStyle = "#ea580c";
  ctx.beginPath();
  ctx.moveTo(-5.5, -5.0); ctx.lineTo(-6.5, -9.5); ctx.lineTo(-3.5, -5.0);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(5.5, -5.0); ctx.lineTo(6.5, -9.5); ctx.lineTo(3.5, -5.0);
  ctx.closePath(); ctx.fill();

  // Head
  ctx.fillStyle = "#c2410c";
  roundRect(ctx, -7.0, -5.0, 14, 12, 4.0);
  ctx.fill();

  // White chest bib
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, -3.5, 3.0, 7, 4.0, 1.5);
  ctx.fill();

  // Scared eyes
  const isBlinking = (timestamp % 4100) < 180;
  const px = ux * 0.9;
  const py = uy * 0.9;

  // Left Eye
  if (!isBlinking) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(-3.2, -1.2, 1.9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#18181b";
    ctx.beginPath(); ctx.arc(-3.2 + px, -1.2 + py, 0.7, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.strokeStyle = "#18181b"; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(-4.5, -1.2); ctx.lineTo(-1.9, -1.2); ctx.stroke();
  }

  // Right Eye
  if (!isBlinking) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(3.2, -1.2, 1.9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#18181b";
    ctx.beginPath(); ctx.arc(3.2 + px, -1.2 + py, 0.7, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.strokeStyle = "#18181b"; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(1.9, -1.2); ctx.lineTo(4.5, -1.2); ctx.stroke();
  }

  // Nose and cheeks
  ctx.fillStyle = "#fbcfe8";
  ctx.beginPath(); ctx.arc(0, 1.4, 0.9, 0, Math.PI * 2); ctx.fill();

  // Shocked mouth
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(0, 3.2, 1.2, 0, Math.PI * 2); ctx.fill();

  // Holding tiny Acorn in shock
  ctx.fillStyle = "#78350f"; // acorn shell
  ctx.beginPath(); ctx.arc(0, 5.0, 1.8, 0, Math.PI); ctx.fill();
  ctx.fillStyle = "#a16207"; // acorn cap
  ctx.fillRect(-2.0, 3.8, 4.0, 1.2);
}

// 🐤 10. Yellow Chick (fluffy puffball, open orange beak, tiny wings)
function drawChickFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(250, 204, 21, 0.35)";
  ctx.shadowBlur = 6;

  // Wings flapping in panic
  const flap = Math.sin(timestamp / 70) * 1.5;
  ctx.fillStyle = "#facc15";
  ctx.beginPath(); ctx.ellipse(-8.0, 1.0, 1.5, 3.0 + flap, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(8.0, 1.0, 1.5, 3.0 + flap, 0, 0, Math.PI * 2); ctx.fill();

  // Round puffball head
  ctx.fillStyle = "#facc15";
  ctx.beginPath(); ctx.arc(0, 0, 7.8, 0, Math.PI * 2); ctx.fill();

  // Shocked wide eyes
  const px = ux * 1.1;
  const py = uy * 1.1;

  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(-2.8, -1.8, 2.0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(-2.8 + px, -1.8 + py, 0.7, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(2.8, -1.8, 2.0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(2.8 + px, -1.8 + py, 0.7, 0, Math.PI * 2); ctx.fill();

  // Open orange beak (screaming)
  ctx.fillStyle = "#ea580c";
  ctx.beginPath();
  ctx.moveTo(-2.0, 1.2);
  ctx.lineTo(0, -0.6);
  ctx.lineTo(2.0, 1.2);
  ctx.lineTo(0, 3.5);
  ctx.closePath();
  ctx.fill();

  // Black center inside open beak
  ctx.fillStyle = "#18181b";
  ctx.beginPath();
  ctx.moveTo(-1.0, 1.2);
  ctx.lineTo(0, 0.4);
  ctx.lineTo(1.0, 1.2);
  ctx.lineTo(0, 2.2);
  ctx.closePath();
  ctx.fill();
}

// 🦆 11. Duckling (marigold head, wide open flat bill, petrified)
function drawDucklingFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(251, 191, 36, 0.35)";
  ctx.shadowBlur = 6;

  // Head
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath(); ctx.arc(0, -0.5, 7.8, 0, Math.PI * 2); ctx.fill();

  // Shocked eyes
  const px = ux * 1.1;
  const py = uy * 1.1;

  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(-2.8, -2.0, 2.0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(-2.8 + px, -2.0 + py, 0.7, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(2.8, -2.0, 2.0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(2.8 + px, -2.0 + py, 0.7, 0, Math.PI * 2); ctx.fill();

  // Flat orange bill open in shock
  ctx.fillStyle = "#f97316";
  roundRect(ctx, -3.5, 0.8, 7.0, 4.4, 1.8);
  ctx.fill();

  // Open mouth cavity
  ctx.fillStyle = "#18181b";
  roundRect(ctx, -2.2, 1.8, 4.4, 2.4, 1.0);
  ctx.fill();
}

// 🦎 12. Scaly Lizard (green head, yellow eyes with vertical slit pupils)
function drawLizardFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(16, 185, 129, 0.3)";
  ctx.shadowBlur = 5;

  // Pointed scaly snout
  ctx.fillStyle = "#047857";
  ctx.beginPath();
  ctx.moveTo(-6.0, 1.0); ctx.lineTo(0, -8.0); ctx.lineTo(6.0, 1.0);
  ctx.closePath(); ctx.fill();

  // Main Head Body
  ctx.fillStyle = "#10b981";
  roundRect(ctx, -7.0, -4.0, 14, 11, 4.0);
  ctx.fill();

  // Scaly highlights (chevrons on cheeks)
  ctx.strokeStyle = "#059669"; ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-5.0, 2.0); ctx.lineTo(-3.5, 3.5);
  ctx.moveTo(5.0, 2.0); ctx.lineTo(3.5, 3.5);
  ctx.stroke();

  // Shocked wide-set yellow reptilian slit eyes
  const px = ux * 0.95;
  const py = uy * 0.95;

  // Left Eye
  ctx.fillStyle = "#facc15"; // yellow iris
  ctx.beginPath(); ctx.arc(-3.5, -1.0, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#064e3b"; ctx.lineWidth = 0.5; ctx.stroke();
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.ellipse(-3.5 + px, -1.0 + py, 0.4, 1.8, 0, 0, Math.PI * 2); ctx.fill(); // vertical slit pupil

  // Right Eye
  ctx.fillStyle = "#facc15";
  ctx.beginPath(); ctx.arc(3.5, -1.0, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#064e3b"; ctx.lineWidth = 0.5; ctx.stroke();
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.ellipse(3.5 + px, -1.0 + py, 0.4, 1.8, 0, 0, Math.PI * 2); ctx.fill();

  // Petrified tiny nostrils
  ctx.fillStyle = "#064e3b";
  ctx.beginPath(); ctx.arc(-1.0, -5.0, 0.4, 0, Math.PI * 2); ctx.beginPath(); ctx.arc(1.0, -5.0, 0.4, 0, Math.PI * 2); ctx.fill();
}

// 🐸 13. Bumpy Brown Toad (brown/olive bumpy skin, horizontal slit pupils)
function drawToadFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(133, 77, 14, 0.25)";
  ctx.shadowBlur = 5;

  // Bulging Toad Eyes
  ctx.fillStyle = "#713f12";
  ctx.beginPath(); ctx.arc(-5.4, -4.5, 4.0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(5.4, -4.5, 4.0, 0, Math.PI * 2); ctx.fill();

  // Bumpy squat body
  ctx.fillStyle = "#854d0e";
  roundRect(ctx, -8.0, -4.5, 16, 11, 4.5);
  ctx.fill();

  // Toad skin bumps (warts)
  ctx.fillStyle = "#a16207";
  ctx.beginPath(); ctx.arc(-4.5, 3.5, 1.0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(4.5, 3.5, 1.0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, 4.5, 0.8, 0, Math.PI * 2); ctx.fill();

  // Horizontal slit pupils (toad style) tracking the snake
  const px = ux * 1.2;
  const py = uy * 1.2;

  // Left Eye
  ctx.fillStyle = "#fbbf24"; // golden-amber iris
  ctx.beginPath(); ctx.arc(-5.4, -4.5, 2.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.ellipse(-5.4 + px, -4.5 + py, 1.8, 0.4, 0, 0, Math.PI * 2); ctx.fill(); // horizontal slit

  // Right Eye
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath(); ctx.arc(5.4, -4.5, 2.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.ellipse(5.4 + px, -4.5 + py, 1.8, 0.4, 0, 0, Math.PI * 2); ctx.fill();

  // Shocked wide mouth
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(0, 1.8, 1.8, 0, Math.PI * 2); ctx.fill();
}

// 🐍 14. Tiny Shocked Snake (coiled warning warning warning, green/red checker)
function drawSmallSnakeFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(220, 38, 38, 0.25)";
  ctx.shadowBlur = 5;

  // Coiled body behind
  ctx.fillStyle = "#1e293b";
  ctx.beginPath(); ctx.arc(0, 3.5, 7.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#b91c1c"; // red warnings stripe
  ctx.beginPath(); ctx.arc(0, 3.5, 5.5, 0, Math.PI * 2); ctx.fill();

  // Shocked triangular head
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.moveTo(-6.0, 1.5); ctx.lineTo(0, -6.5); ctx.lineTo(6.0, 1.5);
  ctx.closePath(); ctx.fill();

  // Petrified slit-eyes
  const px = ux * 0.9;
  const py = uy * 0.9;

  ctx.fillStyle = "#facc15";
  ctx.beginPath(); ctx.arc(-2.6, -1.0, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.ellipse(-2.6 + px, -1.0 + py, 0.3, 1.4, 0, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = "#facc15";
  ctx.beginPath(); ctx.arc(2.6, -1.0, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.ellipse(2.6 + px, -1.0 + py, 0.3, 1.4, 0, 0, Math.PI * 2); ctx.fill();

  // Open mouth showing tiny fangs
  ctx.fillStyle = "#18181b";
  ctx.beginPath();
  ctx.arc(0, 1.2, 1.0, 0, Math.PI);
  ctx.fill();

  // Tiny fangs
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.moveTo(-0.7, 1.2); ctx.lineTo(-0.4, 2.0); ctx.lineTo(-0.1, 1.2); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0.1, 1.2); ctx.lineTo(0.4, 2.0); ctx.lineTo(0.7, 1.2); ctx.closePath(); ctx.fill();
}

// 🐟 15. Small Fish (cyan body, coral fins shaking, circular "O" mouth)
function drawFishFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(6, 182, 212, 0.35)";
  ctx.shadowBlur = 5;

  // Shaking coral orange fins
  const shake = Math.sin(timestamp / 50) * 1.5;
  ctx.fillStyle = "#f97316";
  
  // Left fin
  ctx.beginPath();
  ctx.moveTo(-6.5, 1.0); ctx.lineTo(-10.0, -2.0 + shake); ctx.lineTo(-6.5, -4.0);
  ctx.closePath(); ctx.fill();
  
  // Right fin
  ctx.beginPath();
  ctx.moveTo(6.5, 1.0); ctx.lineTo(10.0, -2.0 - shake); ctx.lineTo(6.5, -4.0);
  ctx.closePath(); ctx.fill();

  // Round cyan fish head
  ctx.fillStyle = "#06b6d4";
  ctx.beginPath(); ctx.arc(0, -0.5, 7.4, 0, Math.PI * 2); ctx.fill();

  // Shocked big eyes
  const px = ux * 1.05;
  const py = uy * 1.05;

  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(-2.6, -1.8, 2.0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(-2.6 + px, -1.8 + py, 0.7, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(2.6, -1.8, 2.0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(2.8 + px, -1.8 + py, 0.7, 0, Math.PI * 2); ctx.fill();

  // Circular mouth ("O" shape)
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(0, 2.4, 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#f97316"; ctx.lineWidth = 0.8; ctx.stroke();
}

// 🐌 16. Translucent Yellow Slug (two eye stalks pointing up, tracking pupils)
function drawSlugFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(217, 249, 157, 0.3)";
  ctx.shadowBlur = 4;

  const stalkSway = Math.sin(timestamp / 100) * 0.4;

  // Eye Stalks (long tentacles pointing up)
  ctx.strokeStyle = "#d9f99d"; ctx.lineWidth = 1.3;
  ctx.lineCap = "round";
  
  // Left eye stalk
  ctx.beginPath(); ctx.moveTo(-3.0, -1.0); ctx.quadraticCurveTo(-3.5, -4.0, -4.5 + stalkSway, -6.5); ctx.stroke();
  // Right eye stalk
  ctx.beginPath(); ctx.moveTo(3.0, -1.0); ctx.quadraticCurveTo(3.5, -4.0, 4.5 - stalkSway, -6.5); ctx.stroke();

  // Soft translucent body
  ctx.fillStyle = "#e2f9b8";
  roundRect(ctx, -4.5, -2.0, 9.0, 11.0, 4.0);
  ctx.fill();

  // Tracking eyes on top of stalks!
  const px = ux * 0.8;
  const py = uy * 0.8;

  // Left stalk eye ball
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(-4.5 + stalkSway, -6.5, 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(-4.5 + stalkSway + px, -6.5 + py, 0.6, 0, Math.PI * 2); ctx.fill();

  // Right stalk eye ball
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(4.5 - stalkSway, -6.5, 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(4.5 - stalkSway + px, -6.5 + py, 0.6, 0, Math.PI * 2); ctx.fill();

  // Shocked mouth
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(0, 2.5, 1.0, 0, Math.PI * 2); ctx.fill();
}

// 🐌 17. Snail (swirly shell behind, eye stalks tracking, petrified)
function drawSnailFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(180, 83, 9, 0.25)";
  ctx.shadowBlur = 5;

  // Spiral shell behind
  ctx.fillStyle = "#d97706";
  ctx.beginPath(); ctx.arc(-2.5, 2.2, 5.8, 0, Math.PI * 2); ctx.fill();
  // Inner spiral line
  ctx.strokeStyle = "#78350f"; ctx.lineWidth = 1.0;
  ctx.beginPath(); ctx.arc(-2.5, 2.2, 3.5, 0, Math.PI * 1.5); ctx.stroke();

  // Eye Stalks (long tentacles pointing up)
  const stalkSway = Math.sin(timestamp / 110) * 0.3;
  ctx.strokeStyle = "#fef08a"; ctx.lineWidth = 1.3;
  ctx.lineCap = "round";
  
  // Left stalk
  ctx.beginPath(); ctx.moveTo(1.5, 0); ctx.quadraticCurveTo(1.0, -3.5, 0.5 + stalkSway, -5.8); ctx.stroke();
  // Right stalk
  ctx.beginPath(); ctx.moveTo(5.5, 0); ctx.quadraticCurveTo(5.8, -3.5, 6.2 - stalkSway, -5.8); ctx.stroke();

  // Snail body/foot
  ctx.fillStyle = "#fef08a";
  roundRect(ctx, -1.0, 0, 7.5, 8.5, 3.0);
  ctx.fill();

  // Tracking eyes on stalks
  const px = ux * 0.75;
  const py = uy * 0.75;

  // Left stalk eye ball
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(0.5 + stalkSway, -5.8, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(0.5 + stalkSway + px, -5.8 + py, 0.6, 0, Math.PI * 2); ctx.fill();

  // Right stalk eye ball
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(6.2 - stalkSway, -5.8, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(6.2 - stalkSway + px, -5.8 + py, 0.6, 0, Math.PI * 2); ctx.fill();

  // Shocked mouth
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(2.8, 3.5, 0.9, 0, Math.PI * 2); ctx.fill();
}

// 🪱 18. Earthworm (pink segmented ringed face, shocked mouth, tracking eyes)
function drawEarthwormFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(244, 114, 182, 0.35)";
  ctx.shadowBlur = 5;

  // Coiled/Segmented body behind
  ctx.strokeStyle = "#ec4899"; ctx.lineWidth = 3.6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(-2.5, 4.0, 4.0, Math.PI, Math.PI * 2.8);
  ctx.stroke();

  // Pink head segment
  ctx.fillStyle = "#f472b6";
  ctx.beginPath(); ctx.arc(2.0, -1.0, 5.0, 0, Math.PI * 2); ctx.fill();

  // Segment lines
  ctx.strokeStyle = "#db2777"; ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.arc(2.0, -1.0, 3.2, 0, Math.PI * 2); ctx.stroke();

  // Scared tracking eyes (placed close together)
  const px = ux * 0.9;
  const py = uy * 0.9;

  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(0.6, -2.5, 1.7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(0.6 + px, -2.5 + py, 0.6, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(3.4, -2.5, 1.7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(3.4 + px, -2.5 + py, 0.6, 0, Math.PI * 2); ctx.fill();

  // Petrified mouth open
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(2.0, 1.0, 1.1, 0, Math.PI * 2); ctx.fill();
}

// 🦗 19. Jade Cricket (insect head, twitching antennae, compound tracking eyes)
function drawCricketFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(4, 120, 87, 0.35)";
  ctx.shadowBlur = 5;

  const antSway = Math.sin(timestamp / 70) * 0.8;

  // Long thread-like antennae twitching
  ctx.strokeStyle = "#047857"; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(-2.5, -4.5); ctx.quadraticCurveTo(-4.5, -7.5, -7.0 + antSway, -11.0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(2.5, -4.5); ctx.quadraticCurveTo(4.5, -7.5, 7.0 - antSway, -11.0); ctx.stroke();

  // Head Body
  ctx.fillStyle = "#059669";
  roundRect(ctx, -6.5, -4.5, 13, 11, 3.8);
  ctx.fill();

  // Mouth mandibles (crying/scared)
  ctx.fillStyle = "#064e3b";
  ctx.beginPath();
  ctx.moveTo(-1.8, 3.5); ctx.lineTo(-2.8, 5.5); ctx.lineTo(-1.2, 5.0);
  ctx.moveTo(1.8, 3.5); ctx.lineTo(2.8, 5.5); ctx.lineTo(1.2, 5.0);
  ctx.closePath(); ctx.fill();

  // Scared wide eyes
  const px = ux * 1.0;
  const py = uy * 1.0;

  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(-2.8, -1.2, 2.0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(-2.8 + px, -1.2 + py, 0.7, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(2.8, -1.2, 2.0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(2.8 + px, -1.2 + py, 0.7, 0, Math.PI * 2); ctx.fill();
}



// 👑 20. Crowned Royal Frog (Golden body, wearing gold crown, mini-boss)
function drawCrownedFrogFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(250, 204, 21, 0.4)";
  ctx.shadowBlur = 6;

  // Bulging eyes
  ctx.fillStyle = "#d97706";
  ctx.beginPath(); ctx.arc(-5.8, -4.5, 4.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(5.8, -4.5, 4.2, 0, Math.PI * 2); ctx.fill();

  ctx.shadowBlur = 0;

  // Royal Golden Head Body
  ctx.fillStyle = "#facc15";
  roundRect(ctx, -8.0, -5.0, 16, 12, 4.2);
  ctx.fill();
  
  ctx.strokeStyle = "#eab308"; ctx.lineWidth = 1.0;
  roundRect(ctx, -8.0, -5.0, 16, 12, 4.2); ctx.stroke();

  // Scared tracking eyes
  const isBlinking = (timestamp % 4000) < 180;
  const px = ux * 1.5;
  const py = uy * 1.5;

  // Left Eye
  if (!isBlinking) {
    ctx.fillStyle = "#eab308";
    ctx.beginPath(); ctx.arc(-5.8, -4.5, 3.0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#18181b";
    ctx.beginPath(); ctx.arc(-5.8 + px, -4.5 + py, 0.8, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.strokeStyle = "#18181b"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(-8.0, -4.5); ctx.lineTo(-3.6, -4.5); ctx.stroke();
  }

  // Right Eye
  if (!isBlinking) {
    ctx.fillStyle = "#eab308";
    ctx.beginPath(); ctx.arc(5.8, -4.5, 3.0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#18181b";
    ctx.beginPath(); ctx.arc(5.8 + px, -4.5 + py, 0.8, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.strokeStyle = "#18181b"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(3.6, -4.5); ctx.lineTo(8.0, -4.5); ctx.stroke();
  }

  // Gold Crown on top of head!
  const crownBob = Math.sin(timestamp / 80) * 0.45;
  ctx.fillStyle = "#fbbf24";
  ctx.strokeStyle = "#d97706"; ctx.lineWidth = 0.75;
  ctx.beginPath();
  ctx.moveTo(-3.5, -5.0 + crownBob);
  ctx.lineTo(-4.5, -9.0 + crownBob);
  ctx.lineTo(-1.8, -6.8 + crownBob);
  ctx.lineTo(0, -10.5 + crownBob); // middle peak
  ctx.lineTo(1.8, -6.8 + crownBob);
  ctx.lineTo(4.5, -9.0 + crownBob);
  ctx.lineTo(3.5, -5.0 + crownBob);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Throat puff
  const throatPuff = Math.sin(timestamp / 100) * 0.75;
  ctx.fillStyle = "#fef08a";
  ctx.beginPath();
  ctx.ellipse(0, 4.0, 4.5, 2.2 + throatPuff, 0, 0, Math.PI * 2);
  ctx.fill();

  // Open mouth
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(0, 2.4, 1.8, 0, Math.PI * 2); ctx.fill();
}

// 🪲 21. Shimmering Golden Beetle (metallic shell, shaking legs, mini-boss)
function drawGoldenBeetleFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(251, 191, 36, 0.4)";
  ctx.shadowBlur = 6;

  // Shaking legs on sides
  const legWiggle = Math.sin(timestamp / 45) * 1.6;
  ctx.strokeStyle = "#18181b"; ctx.lineWidth = 1.0;
  ctx.beginPath();
  // Left legs
  ctx.moveTo(-5.0, -3.0); ctx.lineTo(-8.5, -4.0 + legWiggle);
  ctx.moveTo(-5.0, 0);    ctx.lineTo(-9.0, 0 - legWiggle);
  ctx.moveTo(-5.0, 3.0);  ctx.lineTo(-8.5, 4.0 + legWiggle);
  // Right legs
  ctx.moveTo(5.0, -3.0);  ctx.lineTo(8.5, -4.0 - legWiggle);
  ctx.moveTo(5.0, 0);     ctx.lineTo(9.0, 0 + legWiggle);
  ctx.moveTo(5.0, 3.0);   ctx.lineTo(8.5, 4.0 - legWiggle);
  ctx.stroke();

  // Main Beetle Body Shell (Golden oval)
  ctx.fillStyle = "#f59e0b";
  roundRect(ctx, -5.5, -5.5, 11, 12, 5.0);
  ctx.fill();
  ctx.strokeStyle = "#78350f"; ctx.lineWidth = 0.75;
  roundRect(ctx, -5.5, -5.5, 11, 12, 5.0); ctx.stroke();

  // Head
  ctx.fillStyle = "#78350f";
  roundRect(ctx, -3.2, -8.2, 6.4, 3.6, 1.5);
  ctx.fill();

  // Scared compound eyes tracking
  const px = ux * 0.7;
  const py = uy * 0.7;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(-1.6, -7.5, 1.0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(-1.6 + px, -7.5 + py, 0.5, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(1.6, -7.5, 1.0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(1.6 + px, -7.5 + py, 0.5, 0, Math.PI * 2); ctx.fill();

  // Center shell line (Beetle wings seam)
  ctx.strokeStyle = "#451a03"; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(0, -5.0); ctx.lineTo(0, 6.0); ctx.stroke();
}

// ─── Head Drawing ─────────────────────────────────────────────────────────────
function drawSnakeHead(ctx, head, dir, food, state, timestamp, chompTime) {
  const hx = head.x * CELL;
  const hy = head.y * CELL;
  const cx = hx + CELL / 2;
  const cy = hy + CELL / 2;

  ctx.save();
  ctx.translate(cx, cy);
  
  let angle = Math.atan2(dir.y, dir.x);
  if (state === "DEAD") {
    angle += 0.38;
  }
  ctx.rotate(angle);

  // Chomp Head Bulge/Chew Juice animation (bulges out by 35% on eating food)
  let headScale = 1.0;
  if (chompTime !== null && state !== "DEAD") {
    const elapsed = timestamp - chompTime;
    const chompDuration = 350; // 350ms total chewing pulse duration
    if (elapsed < chompDuration) {
      const t = elapsed / chompDuration;
      headScale = 1.0 + 0.35 * Math.sin(t * Math.PI);
    }
  }
  ctx.scale(headScale, headScale);

  // Soft Rounded Square Head Body
  ctx.shadowColor = state === "DEAD" ? "rgba(220,30,30,0.5)" : "#16a34a";
  ctx.shadowBlur  = 18;
  ctx.fillStyle   = state === "DEAD" ? "#148a3f" : "#16a34a";
  roundRect(ctx, -CELL/2 + 1, -CELL/2 + 1, CELL - 2, CELL - 2, RADIUS);
  ctx.fill();
  ctx.shadowBlur  = 0;

  // Mouth and canine teeth
  let openAmt = 0;
  if (state === "DEAD") {
    openAmt = 0.48;
  } else {
    const fdx      = food.x - head.x;
    const fdy      = food.y - head.y;
    const foodDist = Math.sqrt(fdx * fdx + fdy * fdy);
    openAmt = Math.max(0, 1 - foodDist / 3);

    // Chomp animation
    if (chompTime !== null) {
      const elapsed = timestamp - chompTime;
      const dur     = 520;
      if (elapsed < dur) {
        const t = elapsed / dur;
        if      (t < 0.12) openAmt = 1.0;
        else if (t < 0.28) openAmt = 1.0 - ((t - 0.12) / 0.16) * 1.0;
        else if (t < 0.42) openAmt = ((t - 0.28) / 0.14) * 0.5;
        else if (t < 0.56) openAmt = 0.5 - ((t - 0.42) / 0.14) * 0.5;
        else               openAmt = 0;
      }
    }
  }

  if (openAmt > 0.04) {
    const halfAngle = openAmt * (Math.PI / 3.0);
    ctx.fillStyle   = "#0a0a09";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, CELL / 2 + 1.5, -halfAngle, halfAngle);
    ctx.closePath();
    ctx.fill();

    if (openAmt > 0.12) {
      const toothLen = Math.min(5, 3.5 * openAmt);
      const toothW   = 2.2 * openAmt;
      const jawAngles = [-halfAngle * 0.55, halfAngle * 0.55];

      jawAngles.forEach((jawAngle) => {
        const bx = Math.cos(jawAngle) * (CELL / 2 - 1.5);
        const by = Math.sin(jawAngle) * (CELL / 2 - 1.5);
        const tipX = Math.cos(jawAngle) * (CELL / 2 - 1.5 - toothLen);
        const tipY = Math.sin(jawAngle) * (CELL / 2 - 1.5 - toothLen);

        const perpA = jawAngle + Math.PI / 2;
        const ox = Math.cos(perpA) * toothW;
        const oy = Math.sin(perpA) * toothW;

        ctx.fillStyle = "rgba(245,245,230,0.95)";
        ctx.shadowColor = "rgba(255,255,255,0.4)";
        ctx.shadowBlur = 3;
        ctx.beginPath();
        ctx.moveTo(bx + ox, by + oy);
        ctx.lineTo(bx - ox, by - oy);
        ctx.lineTo(tipX, tipY);
        ctx.closePath();
        ctx.fill();
      });
      ctx.shadowBlur = 0;
    }
  }

  // Nostrils
  ctx.fillStyle = "#080807";
  ctx.beginPath();
  ctx.ellipse(CELL / 2 - 3.2, -1.8, 0.7, 1.2, 0.4, 0, Math.PI * 2);
  ctx.ellipse(CELL / 2 - 3.2, 1.8, 0.7, 1.2, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  const eyeFwd  = CELL * 0.14;
  const eyeSide = CELL * 0.23;
  const eyeR    = 2.8;

  // Calculate eye look pupil vector
  const fx = food.x * CELL + CELL / 2 - cx;
  const fy = food.y * CELL + CELL / 2 - cy;
  const rx = fx * Math.cos(-angle) - fy * Math.sin(-angle);
  const ry = fx * Math.sin(-angle) + fy * Math.cos(-angle);
  const len = Math.sqrt(rx * rx + ry * ry) || 1;
  const pupilOX = (rx / len) * 1.3;
  const pupilOY = (ry / len) * 1.3;

  [-1, 1].forEach((side) => {
    const ex = eyeFwd;
    const ey = eyeSide * side;

    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(ex, ey, eyeR, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#080807";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    if (state === "DEAD") {
      const s = eyeR * 0.75;
      ctx.strokeStyle = "#cc1111";
      ctx.lineWidth   = 1.8;
      ctx.lineCap     = "round";
      ctx.beginPath();
      ctx.moveTo(ex - s, ey - s); ctx.lineTo(ex + s, ey + s);
      ctx.moveTo(ex + s, ey - s); ctx.lineTo(ex - s, ey + s);
      ctx.stroke();
    } else {
      ctx.fillStyle = "#080807";
      ctx.beginPath();
      ctx.ellipse(ex + pupilOX, ey + pupilOY, 0.7, 2.0, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Tongue
  let tongueExt = 0;
  let showTongue = false;

  if (state === "DEAD") {
    showTongue = true;
  } else {
    const cycle = (timestamp % 2500) / 2500;
    if (cycle < 0.12) {
      const t = cycle / 0.12;
      tongueExt = Math.sin(t * Math.PI);
      showTongue = true;
    } else if (cycle >= 0.16 && cycle < 0.28) {
      const t = (cycle - 0.16) / 0.12;
      tongueExt = Math.sin(t * Math.PI);
      showTongue = true;
    }
  }

  if (showTongue) {
    const isDead  = state === "DEAD";
    const baseLen = CELL * 0.45;
    const forkLen = CELL * 0.22;

    ctx.strokeStyle = isDead ? "#991111" : "#cc2222";
    ctx.lineWidth   = 1.8;
    ctx.lineCap     = "round";

    const rootX = CELL / 2 - 1.5;
    const rootY = 0;

    if (isDead) {
      const sway = Math.sin(timestamp / 300) * 1.2;
      const tipX = rootX + baseLen * 0.45 + sway;
      const tipY = rootY + baseLen * 0.95;
      
      ctx.beginPath();
      ctx.moveTo(rootX, rootY);
      ctx.quadraticCurveTo(rootX + baseLen * 0.2 + sway * 0.5, rootY + baseLen * 0.5, tipX, tipY);
      
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX - 1.5, tipY + forkLen * 0.6);
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX + 2.5, tipY + forkLen * 0.5);
      ctx.stroke();
    } else {
      const curLen  = baseLen * tongueExt;
      const curFork = forkLen * tongueExt;
      const tipX    = rootX + curLen;
      const tipY    = 0;

      ctx.beginPath();
      ctx.moveTo(rootX, rootY);
      ctx.lineTo(tipX, tipY);
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX + curFork, -curFork * 0.65);
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX + curFork, curFork * 0.65);
      ctx.stroke();
    }
  }

  ctx.restore();
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function SnakeGame({ isOpen, onClose }) {
  const canvasRef = useRef(null);
  const lenis     = useLenis();

  const g = useRef({
    state:      "IDLE",
    snake:      [{ x: 8, y: 8 }],
    dir:        { x: 1, y: 0 },
    nextDir:    { x: 1, y: 0 },
    food:       { x: 12, y: 8, type: 0 },
    score:      0,
    highScore:  parseInt(localStorage.getItem("snakeHighScore") || "0"),
    lastMove:   0,
    speed:      BASE_SPEED,
    particles:  [],
    rafId:      null,
    // Impact animation
    deathTime:  null,
    impactX:    0,
    impactY:    0,
    // Eat animations
    chompTime:  null,
    eatWave:    null,
    lastPopped: null,
    preyPool:   [],
    // Creative/Premium features
    foodMoveCounter: 0,
  });

  const [score,        setScore]        = useState(0);
  const [highScore,    setHighScore]    = useState(parseInt(localStorage.getItem("snakeHighScore") || "0"));
  const [displayState, setDisplayState] = useState("IDLE");
  const [isMuted,      setIsMuted]      = useState(() => localStorage.getItem("snakeMuted") === "true");

  useEffect(() => {
    SoundFX.isMuted = isMuted;
    localStorage.setItem("snakeMuted", isMuted ? "true" : "false");
  }, [isMuted]);

  const startGame = useCallback(() => {
    const s     = g.current;
    s.snake     = [{ x: 8, y: 8 }];
    s.dir       = { x: 1, y: 0 };
    s.nextDir   = { x: 1, y: 0 };
    s.preyPool  = []; // Reset pool for fresh shuffle
    s.foodMoveCounter = 0;
    s.score     = 0;
    s.food      = randomFood(s);
    s.state     = "PLAYING";
    SoundFX.playStart();
    s.lastMove  = 0;
    s.speed     = BASE_SPEED;
    s.particles = [];
    s.deathTime = null;
    s.chompTime = null;
    s.eatWave   = null;
    s.lastPopped = null;
    setScore(0);
    setDisplayState("PLAYING");
  }, []);

  // ── Draw loop ─────────────────────────────────────────────────────────────
  const draw = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const s   = g.current;

    // Tick: move snake
    if (s.state === "PLAYING" && timestamp - s.lastMove >= s.speed) {
      s.lastMove = timestamp;
      s.dir      = s.nextDir;

      // Escape Pathfinding for Mini-Bosses (type 20/21) every 3 snake movements
      if (s.food && (s.food.type === 20 || s.food.type === 21)) {
        s.foodMoveCounter = (s.foodMoveCounter + 1) % 3;
        if (s.foodMoveCounter === 0) {
          const dirs = [{x:1, y:0}, {x:-1, y:0}, {x:0, y:1}, {x:0, y:-1}];
          let bestDir = null;
          let maxDist = -1;
          const head = s.snake[0];
          
          dirs.forEach((d) => {
            const nx = s.food.x + d.x;
            const ny = s.food.y + d.y;
            // Bounds check
            if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS) {
              // Body segment check
              const hitsBody = s.snake.some((seg) => seg.x === nx && seg.y === ny);
              if (!hitsBody) {
                // Calculate distance to head
                const dist = Math.sqrt((nx - head.x) * (nx - head.x) + (ny - head.y) * (ny - head.y));
                if (dist > maxDist) {
                  maxDist = dist;
                  bestDir = { x: nx, y: ny };
                }
              }
            }
          });
          
          if (bestDir) {
            s.food.x = bestDir.x;
            s.food.y = bestDir.y;
          }
        }
      }

      const head    = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };
      const wallHit = head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS;
      const selfHit = !wallHit && s.snake.some((seg) => seg.x === head.x && seg.y === head.y);

      if (wallHit || selfHit) {
        s.state     = "DEAD";
        s.deathTime = timestamp;
        SoundFX.playDie();
        s.impactX   = Math.min(Math.max(head.x, 0), COLS - 1) * CELL + CELL / 2;
        s.impactY   = Math.min(Math.max(head.y, 0), ROWS - 1) * CELL + CELL / 2;
        if (s.score > s.highScore) {
          s.highScore = s.score;
          localStorage.setItem("snakeHighScore", s.score);
          setHighScore(s.score);
        }
        setDisplayState("DEAD");
      } else {
        s.snake.unshift(head);
        if (head.x === s.food.x && head.y === s.food.y) {
          const isMiniBoss = s.food.type === 20 || s.food.type === 21 || s.food.type === 22;
          
          if (isMiniBoss) {
            SoundFX.playGold();
          } else {
            SoundFX.playEat();
          }
          
          // Special gold crumbs for mini boss
          if (isMiniBoss) {
            for (let k = 0; k < 8; k++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = 0.6 + Math.random() * 1.2;
              s.particles.push({
                x: s.food.x * CELL + CELL / 2,
                y: s.food.y * CELL + CELL / 2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                size: 2.0 + Math.random() * 2.0,
                isGoldCrumb: true,
              });
            }
          } else {
            spawnParticles(s.particles, s.food.x, s.food.y);
          }
          
          s.score += isMiniBoss ? 3 : 1;
          s.lastPopped = null; // No tail popped when growing
          
          // +1 or +3 floating text particle
          s.particles.push({
            x: head.x * CELL + CELL / 2,
            y: head.y * CELL - 6,
            vx: 0,
            vy: -1.3,
            life: 1,
            size: 0,
            isText: true,
            customText: isMiniBoss ? "+3" : "+1",
            customColor: isMiniBoss ? "#fbbf24" : "#4ade80",
          });

          // Comic-Style Sound Effect text bubble (satisfying eating sounds instead of animal noises)
          const sfxMap = {
            2: "CRUNCH!",  // egg
            15: "SLURP!",  // fish
            16: "SLURP!",  // slug
            20: "ROYAL GULP!", // crowned frog
            21: "GOLDEN GULP!" // golden beetle
          };
          let sfxText = sfxMap[s.food.type];
          if (!sfxText) {
            const genericEatSounds = ["GULP!", "CHOMP!", "NOM NOM!", "MUNCH!", "GOBBLE!", "YUM!"];
            sfxText = genericEatSounds[Math.floor(Math.random() * genericEatSounds.length)];
          }
          s.particles.push({
            x: head.x * CELL + CELL / 2 + (Math.random() - 0.5) * 8,
            y: head.y * CELL + 8,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -0.85,
            life: 1.0,
            isSfx: true,
            text: sfxText,
          });

          if (s.snake.length >= COLS * ROWS) {
            s.state = "DEAD";
            s.deathTime = timestamp;
            s.food = { x: -1, y: -1, type: 0 };
            if (s.score > s.highScore) {
              s.highScore = s.score;
              localStorage.setItem("snakeHighScore", s.score);
              setHighScore(s.score);
            }
            setDisplayState("DEAD");
          } else {
            s.food = randomFood(s);
          }
          s.speed     = Math.max(MIN_SPEED, BASE_SPEED - Math.floor(s.score / 5) * 10);
          s.chompTime = timestamp;
          s.eatWave   = { startTime: timestamp, snakeLen: s.snake.length };
          setScore(s.score);
        } else {
          s.lastPopped = s.snake.pop(); // Save popped coordinates for tail interpolation
        }
      }
    }

    // Camera shake on death
    const timeSinceDeath = s.deathTime ? timestamp - s.deathTime : Infinity;
    const shakeDecay     = Math.max(0, 1 - timeSinceDeath / 650);
    const shakeX = shakeDecay > 0 ? Math.sin(timestamp * 0.48) * 9 * shakeDecay + Math.sin(timestamp * 0.31) * 4 * shakeDecay : 0;
    const shakeY = shakeDecay > 0 ? Math.sin(timestamp * 0.53 + 1) * 9 * shakeDecay + Math.sin(timestamp * 0.29 + 2) * 4 * shakeDecay : 0;

    ctx.save();
    ctx.translate(shakeX, shakeY);

    // Background flat color (clean, no vignette)
    ctx.fillStyle = "#0C0C0B";
    ctx.fillRect(-20, -20, CANVAS_SIZE + 40, CANVAS_SIZE + 40);

    // Red death flash
    if (s.state === "DEAD" && s.deathTime) {
      const flashT = Math.max(0, 1 - timeSinceDeath / 450);
      if (flashT > 0) {
        ctx.fillStyle = `rgba(220, 30, 30, ${flashT * 0.40})`;
        ctx.fillRect(-20, -20, CANVAS_SIZE + 40, CANVAS_SIZE + 40);
      }
    }

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth   = 0.5;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, CANVAS_SIZE); ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(CANVAS_SIZE, y * CELL); ctx.stroke();
    }

    // Impact burst lines
    if (s.state === "DEAD" && s.deathTime) {
      const burstT = Math.max(0, 1 - timeSinceDeath / 400);
      if (burstT > 0) {
        const lineCount = 10;
        for (let i = 0; i < lineCount; i++) {
          const angle = (i / lineCount) * Math.PI * 2;
          const inner = 6;
          const outer = inner + (6 + (i % 2) * 8) * burstT;
          const alpha = burstT * (i % 2 === 0 ? 0.9 : 0.6);
          ctx.strokeStyle = i % 2 === 0 ? `rgba(255, 80, 60, ${alpha})` : `rgba(255, 200, 60, ${alpha})`;
          ctx.lineWidth   = i % 2 === 0 ? 2.5 : 1.5;
          ctx.beginPath();
          ctx.moveTo(s.impactX + Math.cos(angle) * inner, s.impactY + Math.sin(angle) * inner);
          ctx.lineTo(s.impactX + Math.cos(angle) * outer, s.impactY + Math.sin(angle) * outer);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(s.impactX, s.impactY, (1 - burstT) * 18 + 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 120, 60, ${burstT * 0.7})`;
        ctx.fill();
      }
    }

    // Smooth slither: how far between the last tick and the next (0→1)
    const progress = s.state === "PLAYING"
      ? Math.min(1, (timestamp - s.lastMove) / s.speed)
      : 1;

    // Body segments (back to front, head drawn last on top)
    let bulgeIdx = -1;
    if (s.eatWave) {
      const waveDur = 600;
      const t       = (timestamp - s.eatWave.startTime) / waveDur;
      if (t >= 1) {
        s.eatWave = null;
      } else {
        bulgeIdx = t * s.eatWave.snakeLen;
      }
    }

    for (let i = s.snake.length - 1; i >= 1; i--) {
      const seg       = s.snake[i];
      const prev      = s.snake[i - 1]; // segment ahead in chain
      const fadeRatio = i / Math.max(s.snake.length, 1);
      const alpha     = Math.max(0.2, 1 - fadeRatio * 0.7);

      let segScale = 1;
      if (s.eatWave && bulgeIdx >= 0) {
        const dist = Math.abs(i - bulgeIdx);
        if (dist < 2) segScale = 1 + Math.max(0, 1 - dist / 2) * 0.38;
      }

      const pad  = Math.max(1, 2 - (segScale - 1) * CELL / 2);
      const segW = CELL - pad * 2;
      const segH = CELL - pad * 2;
      // Interpolate: slide FROM the previous segment position TOWARD current segment position
      let prevSeg;
      if (i + 1 < s.snake.length) {
        prevSeg = s.snake[i + 1];
      } else if (s.lastPopped) {
        prevSeg = s.lastPopped;
      } else {
        prevSeg = seg;
      }

      const interpX = prevSeg.x + (seg.x - prevSeg.x) * progress;
      const interpY = prevSeg.y + (seg.y - prevSeg.y) * progress;
      const segX = interpX * CELL + (CELL - segW) / 2;
      const segY = interpY * CELL + (CELL - segH) / 2;

      // Calculate angle of travel from seg (behind) to prev (ahead)
      const dx = prev.x - seg.x;
      const dy = prev.y - seg.y;
      const angle = Math.atan2(dy, dx);

      ctx.save();
      // Translate to segment center and rotate so local +X faces the head
      ctx.translate(segX + segW / 2, segY + segH / 2);
      ctx.rotate(angle);

      ctx.shadowColor = "#16a34a";
      ctx.shadowBlur  = i < 3 ? 6 : 0;

      const bulgeGlow = s.eatWave && Math.abs(i - bulgeIdx) < 1.5
        ? Math.max(0, 1 - Math.abs(i - bulgeIdx) / 1.5)
        : 0;
      const r  = s.state === "DEAD" ? 22  : 74;
      const g2 = s.state === "DEAD" ? 138 : 163;
      const b  = s.state === "DEAD" ? 74  : 74;
      
      // Base segment
      ctx.fillStyle = `rgba(${r + bulgeGlow * 60}, ${g2 + bulgeGlow * 30}, ${b}, ${alpha})`;
      roundRect(ctx, -segW / 2, -segH / 2, segW, segH, RADIUS - 1);
      ctx.fill();

      // Disable shadow blur for the scale overlays to keep details crisp
      ctx.shadowBlur = 0;

      // Overlapping scales facing backward (toward local -X)
      const scaleColor = s.state === "DEAD" 
        ? `rgba(${r + bulgeGlow * 60 + 32}, ${g2 + bulgeGlow * 30 - 32}, ${b - 20}, ${alpha * 0.9})`
        : `rgba(${r + bulgeGlow * 60 - 20}, ${g2 + bulgeGlow * 30 + 26}, ${b + 18}, ${alpha * 0.95})`;

      const scaleBorderColor = s.state === "DEAD"
        ? `rgba(120, 20, 20, ${alpha * 0.35})`
        : `rgba(12, 85, 35, ${alpha * 0.4})`;

      ctx.fillStyle = scaleColor;
      ctx.strokeStyle = scaleBorderColor;
      ctx.lineWidth = 1;

      const scaleR = segW / 3;
      const drawScale = (x, y, rad) => {
        ctx.beginPath();
        // Pointed scale pointing left (away from head/travel direction)
        ctx.moveTo(x - rad, y);
        ctx.quadraticCurveTo(x, y - rad * 0.85, x + rad, y - rad * 0.85);
        ctx.lineTo(x + rad, y + rad * 0.85);
        ctx.quadraticCurveTo(x, y + rad * 0.85, x - rad, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      };

      // Draw interlocking pattern (back first, then front overlapping layers)
      drawScale(-segW / 5, 0, scaleR);        // Back-center scale
      drawScale(segW / 5, -segH / 3.8, scaleR); // Front-top scale
      drawScale(segW / 5, segH / 3.8, scaleR);  // Front-bottom scale

      ctx.restore();
    }
    ctx.shadowBlur = 0;

    // Head — interpolate from segment[1] toward segment[0]
    if (s.snake.length > 0) {
      const head     = s.snake[0];
      const prevHead = s.snake[1] || { x: head.x - s.dir.x, y: head.y - s.dir.y };
      const hx = prevHead.x + (head.x - prevHead.x) * progress;
      const hy = prevHead.y + (head.y - prevHead.y) * progress;
      drawSnakeHead(ctx, { x: hx, y: hy }, s.dir, s.food, s.state, timestamp, s.chompTime);
    }

    // Food
    if (s.state !== "DEAD") {
      drawFood(ctx, s.food, s.snake[0], timestamp);
    }





    // Particles
    s.particles = s.particles.filter((p) => p.life > 0);
    s.particles.forEach((p) => {
      p.x    += p.vx;
      p.y    += p.vy;
      p.life -= p.isText ? 0.022 : 0.04;
      if (!p.isText) p.vy += 0.05; // gravity for debris only
      
      ctx.globalAlpha = Math.max(0, p.isText ? p.life * 1.4 : p.life);
      
      if (p.isText) {
        const textVal = p.customText || "+1";
        const textCol = p.customColor || "#4ade80";
        ctx.shadowBlur  = 10;
        ctx.shadowColor = textCol;
        ctx.fillStyle   = textCol;
        ctx.font        = `bold ${Math.round(10 + (1 - p.life) * 4)}px 'Outfit', sans-serif`;
        ctx.textAlign   = "center";
        ctx.fillText(textVal, p.x, p.y);
      } else if (p.isCrumb) {
        ctx.fillStyle   = "#86efac";
        ctx.shadowBlur  = 4;
        ctx.shadowColor = "#22c55e";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.isGoldCrumb) {
        // Shimmering gold crumbs for mini-boss
        ctx.fillStyle   = "#fbbf24";
        ctx.shadowBlur  = 6;
        ctx.shadowColor = "#f59e0b";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

      } else if (p.isSfx) {
        // Floating comic visual sound effect
        ctx.shadowBlur  = 5;
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.fillStyle   = `rgba(255, 255, 255, ${p.life * 0.95})`;
        ctx.font        = `black italic ${Math.round(9 + (1 - p.life) * 2)}px 'Outfit', sans-serif`;
        ctx.textAlign   = "center";
        ctx.fillText(p.text, p.x, p.y);
      } else {
        ctx.fillStyle   = "#ffffff";
        ctx.shadowBlur  = 6;
        ctx.shadowColor = "rgba(255,255,255,0.8)";
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur  = 0;

    // IDLE overlay
    if (s.state === "IDLE") {
      ctx.fillStyle = "rgba(12,12,11,0.78)";
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.textAlign   = "center";
      ctx.shadowBlur  = 18;
      ctx.shadowColor = "#16a34a";
      ctx.fillStyle   = "#16a34a";
      ctx.font        = "bold 16px 'Outfit', sans-serif";
      ctx.fillText("PRESS ENTER TO START", CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 6);
      ctx.shadowBlur  = 0;
      ctx.fillStyle   = "rgba(255,255,255,0.3)";
      ctx.font        = "12px 'Outfit', sans-serif";
      ctx.fillText("ARROW KEYS \u00B7 WASD \u00B7 SWIPE", CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 22);
    }

    // DEAD overlay
    if (s.state === "DEAD" && timeSinceDeath > 300) {
      const overlayT  = Math.min(1, (timeSinceDeath - 300) / 300);
      ctx.fillStyle   = `rgba(12,12,11,${0.72 * overlayT})`;
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      if (overlayT > 0.5) {
        ctx.textAlign   = "center";
        ctx.globalAlpha = (overlayT - 0.5) * 2;
        ctx.fillStyle   = "rgba(255,255,255,0.92)";
        ctx.font        = "bold 18px 'Outfit', sans-serif";
        ctx.fillText("GAME OVER", CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 20);
        ctx.shadowBlur  = 14;
        ctx.shadowColor = "#16a34a";
        ctx.fillStyle   = "#16a34a";
        ctx.font        = "14px 'Outfit', sans-serif";
        ctx.fillText(`SCORE: ${s.score}`, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 10);
        ctx.shadowBlur  = 0;
        ctx.fillStyle   = "rgba(255,255,255,0.28)";
        ctx.font        = "12px 'Outfit', sans-serif";
        ctx.fillText("ENTER / TAP TO RETRY", CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 38);
        ctx.globalAlpha = 1;
      }
    }
    // ── Retro CRT scanline and glare overlays (Creative/Premium details) ──
    // Subtle CRT scanlines (Classic green phosphor)
    // Subtle CRT scanlines
    ctx.fillStyle = "rgba(34, 197, 94, 0.014)";
    ctx.shadowBlur = 0;
    for (let y = 0; y < CANVAS_SIZE; y += 4) {
      ctx.fillRect(0, y, CANVAS_SIZE, 1.2);
    }

    ctx.restore();

    s.rafId = requestAnimationFrame(draw);
  }, []);
  // ── Scroll lock ──
  useEffect(() => {
    if (!isOpen) return;
    lenis?.stop();
    document.body.style.overflow = "hidden";

    const preventScroll = (e) => {
      e.preventDefault();
    };

    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      lenis?.start();
      document.body.style.overflow = "";
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
    };
  }, [isOpen, lenis]);

  // ── Open / close loop ──
  useEffect(() => {
    if (!isOpen) {
      if (g.current.rafId) { cancelAnimationFrame(g.current.rafId); g.current.rafId = null; }
      g.current.state     = "IDLE";
      g.current.snake     = [{ x: 8, y: 8 }];
      g.current.dir       = { x: 1, y: 0 };
      g.current.nextDir   = { x: 1, y: 0 };
      g.current.food      = { x: 12, y: 8, type: 0 };
      g.current.score     = 0;
      g.current.particles = [];
      g.current.deathTime  = null;
      g.current.chompTime  = null;
      g.current.eatWave    = null;
      g.current.lastPopped = null;
      g.current.preyPool   = [];
      g.current.foodMoveCounter = 0;
      setScore(0);
      setDisplayState("IDLE");
      return;
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const dpr = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width  = CANVAS_SIZE * dpr;
      canvas.height = CANVAS_SIZE * dpr;
      canvas.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    g.current.rafId = requestAnimationFrame(draw);
    return () => { if (g.current.rafId) cancelAnimationFrame(g.current.rafId); };
  }, [isOpen, draw]);

  // ── Keyboard ──
  useEffect(() => {
    if (!isOpen) return;
    const GAME_KEYS = new Set(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","w","a","s","d","Enter"," ","Escape"]);
    
    const onKeyDown = (e) => {
      const s = g.current;
      if (GAME_KEYS.has(e.key)) e.preventDefault();
      if (e.key === "Escape") { onClose(); return; }
      
      // Start/Retry game
      if ((e.key === "Enter" || e.key === " ") && s.state !== "PLAYING") {
        startGame();
        return;
      }
      
      if (s.state !== "PLAYING") return;
      
      const newDir = DIRS[e.key];
      if (!newDir) return;
      if (newDir.x === -s.dir.x && newDir.y === -s.dir.y) return;
      s.nextDir = newDir;
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose, startGame]);

  // ── Touch / swipe ──
  useEffect(() => {
    if (!isOpen) return;
    let tx = 0, ty = 0;
    const onStart = (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; };
    const onEnd   = (e) => {
      const s  = g.current;
      const dx = e.changedTouches[0].clientX - tx;
      const dy = e.changedTouches[0].clientY - ty;
      
      // If it's a short touch/tap, start or restart game (threshold 10px)
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
        const modal = document.getElementById("snake-modal-panel");
        if (modal && modal.contains(e.target) && s.state !== "PLAYING") {
          startGame();
        }
        return;
      }
      
      if (s.state !== "PLAYING") return;
      
      const newDir = Math.abs(dx) > Math.abs(dy)
        ? (dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 })
        : (dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
        
      if (newDir.x === -s.dir.x && newDir.y === -s.dir.y) return;
      s.nextDir = newDir;
    };
    
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend",   onEnd,   { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend",   onEnd);
    };
  }, [isOpen, startGame]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="snake-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[99998] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            id="snake-modal-panel"
            key="snake-modal"
            initial={{ opacity: 0, y: 48, scale: 0.94 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{ opacity: 0,    y: 48, scale: 0.94 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#0C0C0B] border border-zinc-800 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.65)] w-[calc(100%-16px)] sm:w-full mx-2 sm:mx-4"
            style={{ maxWidth: 520 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-black/40">
              <span
                className="font-['Outfit'] font-bold text-[13px] tracking-[0.2em] text-[#16a34a] flex items-center"
                style={{ textShadow: "0 0 14px rgba(22,163,74,0.8)" }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ filter: "drop-shadow(0 0 8px rgba(22,163,74,0.8))" }}
                  className="mr-2.5"
                >
                  {/* Rounded Snake Head */}
                  <rect x="2" y="2" width="20" height="20" rx="5.5" fill="#16a34a" />
                  {/* Golden Sphere Eyes */}
                  <circle cx="7" cy="9" r="3.2" fill="#fbbf24" stroke="#080807" strokeWidth="0.5" />
                  <circle cx="17" cy="9" r="3.2" fill="#fbbf24" stroke="#080807" strokeWidth="0.5" />
                  {/* Slit Pupils */}
                  <ellipse cx="7" cy="9" rx="0.7" ry="2.0" fill="#080807" />
                  <ellipse cx="17" cy="9" rx="0.7" ry="2.0" fill="#080807" />
                  {/* Nostrils */}
                  <ellipse cx="10.5" cy="11.5" rx="0.6" ry="1.0" transform="rotate(25 10.5 11.5)" fill="#080807" />
                  <ellipse cx="13.5" cy="11.5" rx="0.6" ry="1.0" transform="rotate(-25 13.5 11.5)" fill="#080807" />
                  {/* Mouth Line */}
                  <path d="M 6 15 Q 12 18 18 15" stroke="#080807" strokeWidth="1.2" strokeLinecap="round" />
                  {/* Forked Tongue */}
                  <path d="M 12 16.5 L 12 21.5 M 12 21.5 L 10 23.5 M 12 21.5 L 14 23.5" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Canines / Fangs */}
                  <polygon points="8,15.5 9,18 10,15.5" fill="#f5f5e6" />
                  <polygon points="14,15.5 15,18 16,15.5" fill="#f5f5e6" />
                </svg>
                SNAKE.EXE
              </span>
              <div className="flex items-center gap-6">
                <span className="font-['Outfit'] text-[11px] text-zinc-400 tracking-[0.15em] uppercase font-medium">
                  SCORE{" "}
                  <motion.span
                    key={score}
                    initial={{ scale: 1.5, color: "#4ade80" }}
                    animate={{ scale: 1,   color: "#ffffff" }}
                    transition={{ duration: 0.25 }}
                    className="font-black inline-block ml-1 text-[13px]"
                  >
                    {score}
                  </motion.span>
                </span>
                <span className="font-['Outfit'] text-[11px] text-zinc-400 tracking-[0.15em] uppercase font-medium">
                  BEST <span className="text-[#4ade80] font-black ml-1 text-[13px]">{highScore}</span>
                </span>
                <button
                  onClick={() => setIsMuted(prev => !prev)}
                  className="text-zinc-500 hover:text-white hover:scale-110 transition-all p-1 cursor-pointer flex items-center justify-center mr-1"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" strokeWidth={2} />
                  ) : (
                    <Volume2 className="w-4 h-4" strokeWidth={2} />
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="text-zinc-500 hover:text-white hover:scale-110 transition-all text-[24px] leading-none ml-1 cursor-pointer"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="p-2 sm:p-5 bg-black/20 flex justify-center">
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className="w-full rounded-xl border border-zinc-800/80 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]"
                style={{ aspectRatio: "1 / 1" }}
              />
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-zinc-900 bg-black/35 text-center">
              <p className="font-['Outfit'] text-[10px] text-zinc-500 tracking-[0.18em] uppercase font-semibold">
                {displayState === "IDLE"
                  ? "press enter or tap screen to start"
                  : displayState === "PLAYING"
                  ? "steer with arrows · wasd · swipe"
                  : "press enter to retry  ·  esc to exit"}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


// 🐀 23. Vole (stouter mouse, small ears, warm brown)
function drawVoleFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(120, 53, 4, 0.25)"; ctx.shadowBlur = 5;
  const earTwitch = Math.sin(timestamp / 150) > 0.88 ? Math.sin(timestamp / 25) * 1.2 : 0;
  // Ears
  ctx.fillStyle = "#854d0e";
  ctx.beginPath(); ctx.arc(-5.2, -4.2 + earTwitch, 3.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(5.2, -4.2 + earTwitch, 3.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fda4af";
  ctx.beginPath(); ctx.arc(-5.2, -4.2 + earTwitch, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(5.2, -4.2 + earTwitch, 1.8, 0, Math.PI * 2); ctx.fill();
  // Stout Body
  ctx.fillStyle = "#a16207";
  roundRect(ctx, -7.5, -4.5, 15, 11, 4.2); ctx.fill();
  // Snout
  ctx.fillStyle = "#fda4af";
  ctx.beginPath(); ctx.arc(0, 5.0, 1.5, 0, Math.PI * 2); ctx.fill();
  // Tracking Eyes
  const px = ux * 1.2; const py = uy * 1.2;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(-3.0, -1.0, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(3.0, -1.0, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(-3.0 + px, -1.0 + py, 0.7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(3.0 + px, -1.0 + py, 0.7, 0, Math.PI * 2); ctx.fill();
}

// 🐭 24. Shrew (pointed snout, dark grey)
function drawShrewFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(75, 85, 99, 0.25)"; ctx.shadowBlur = 4;
  // Pointy Body & Snout
  ctx.fillStyle = "#374151";
  roundRect(ctx, -6.5, -4.5, 13, 9, 3.8); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-4.5, 3.5); ctx.lineTo(0, 7.5); ctx.lineTo(4.5, 3.5); ctx.closePath(); ctx.fill();
  // Nose tip
  ctx.fillStyle = "#f43f5e";
  ctx.beginPath(); ctx.arc(0, 7.5, 1.2, 0, Math.PI * 2); ctx.fill();
  // Whiskers
  ctx.strokeStyle = "#9ca3af"; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(-3, 4); ctx.lineTo(-8, 5); ctx.moveTo(3, 4); ctx.lineTo(8, 5); ctx.stroke();
  // Shocked beady eyes (wide white scleras with tiny pupils)
  const px = ux * 0.8; const py = uy * 0.8;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(-2.4, -0.5, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.4, -0.5, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#111827";
  ctx.beginPath(); ctx.arc(-2.4 + px * 0.4, -0.5 + py * 0.4, 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.4 + px * 0.4, -0.5 + py * 0.4, 0.6, 0, Math.PI * 2); ctx.fill();
}

// 🐿️ 25. Chipmunk (striped brown back, white cheeks)
function drawChipmunkFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(180, 83, 9, 0.3)"; ctx.shadowBlur = 5;
  // Ears
  ctx.fillStyle = "#b45309";
  ctx.beginPath(); ctx.arc(-5.0, -4.5, 2.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(5.0, -4.5, 2.8, 0, Math.PI * 2); ctx.fill();
  // Body
  ctx.fillStyle = "#d97706";
  roundRect(ctx, -8.0, -4.5, 16, 11, 4.0); ctx.fill();
  // White/Black Stripes on forehead/sides
  ctx.fillStyle = "#1e293b";
  roundRect(ctx, -5.0, -4.5, 1.8, 7.0, 0.5); ctx.fill();
  roundRect(ctx, 3.2, -4.5, 1.8, 7.0, 0.5); ctx.fill();
  ctx.fillStyle = "#f8fafc";
  roundRect(ctx, -4.2, -3.5, 1.0, 5.0, 0.5); ctx.fill();
  roundRect(ctx, 3.2, -3.5, 1.0, 5.0, 0.5); ctx.fill();
  // Cheeks
  ctx.fillStyle = "#f8fafc";
  ctx.beginPath(); ctx.arc(-5.5, 2.5, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(5.5, 2.5, 2.2, 0, Math.PI * 2); ctx.fill();
  // Eyes
  const px = ux * 1.2; const py = uy * 1.2;
  ctx.fillStyle = "#1e293b";
  ctx.beginPath(); ctx.arc(-3.2, -0.8, 2.0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(3.2, -0.8, 2.0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(-3.2 + px * 0.5, -0.8 + py * 0.5, 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(3.2 + px * 0.5, -0.8 + py * 0.5, 0.5, 0, Math.PI * 2); ctx.fill();
}

// 🐇 26. Hare (longer ears, taller body, wild brown)
function drawHareFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(133, 77, 14, 0.25)"; ctx.shadowBlur = 5;
  const earTwitch = Math.sin(timestamp / 180) * 1.5;
  // Long Ears
  ctx.fillStyle = "#713f12";
  roundRect(ctx, -5.0, -13.0 + earTwitch * 0.4, 2.8, 9.0, 1.2); ctx.fill();
  roundRect(ctx, 2.2, -13.0 + earTwitch * 0.4, 2.8, 9.0, 1.2); ctx.fill();
  ctx.fillStyle = "#fda4af";
  roundRect(ctx, -4.2, -11.0 + earTwitch * 0.4, 1.2, 6.0, 0.6); ctx.fill();
  roundRect(ctx, 3.0, -11.0 + earTwitch * 0.4, 1.2, 6.0, 0.6); ctx.fill();
  // Body
  ctx.fillStyle = "#854d0e";
  roundRect(ctx, -7.5, -4.0, 15, 11, 4.5); ctx.fill();
  // Eyes
  const px = ux * 1.4; const py = uy * 1.4;
  ctx.fillStyle = "#b45309";
  ctx.beginPath(); ctx.arc(-3.2, -1.0, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(3.2, -1.0, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#1e293b";
  ctx.beginPath(); ctx.arc(-3.2 + px, -1.0 + py, 0.9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(3.2 + px, -1.0 + py, 0.9, 0, Math.PI * 2); ctx.fill();
}

// 🦇 27. Bat (dark charcoal, folded side wings)
function drawBatFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(30, 41, 59, 0.35)"; ctx.shadowBlur = 6;
  const wingFlap = Math.sin(timestamp / 90) * 1.2;
  // Folded Wings with scalloped edges
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.moveTo(-4, -1);
  ctx.lineTo(-12 + wingFlap, -4);
  ctx.quadraticCurveTo(-10, 2, -7, 5);
  ctx.quadraticCurveTo(-5, 2, -4, 1);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(4, -1);
  ctx.lineTo(12 - wingFlap, -4);
  ctx.quadraticCurveTo(10, 2, 7, 5);
  ctx.quadraticCurveTo(5, 2, 4, 1);
  ctx.closePath(); ctx.fill();
  // Pointy ears
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.moveTo(-5, -4); ctx.lineTo(-3, -9); ctx.lineTo(-1, -4); ctx.closePath(); ctx.fill();
  ctx.moveTo(1, -4); ctx.lineTo(3, -9); ctx.lineTo(5, -4); ctx.closePath(); ctx.fill();
  // Body
  ctx.fillStyle = "#1e293b";
  roundRect(ctx, -6.0, -4.0, 12, 10, 4.0); ctx.fill();
  // Vampire Fangs
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(-2.0, 2.5); ctx.lineTo(-1.5, 4.2); ctx.lineTo(-1.0, 2.5); ctx.closePath(); ctx.fill();
  ctx.moveTo(1.0, 2.5); ctx.lineTo(1.5, 4.2); ctx.lineTo(2.0, 2.5); ctx.closePath(); ctx.fill();
  // Eyes
  const px = ux * 1.1; const py = uy * 1.1;
  ctx.fillStyle = "#ef4444"; // Red eyes
  ctx.beginPath(); ctx.arc(-2.4, -0.8, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.4, -0.8, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#000000";
  ctx.beginPath(); ctx.arc(-2.4 + px, -0.8 + py, 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.4 + px, -0.8 + py, 0.6, 0, Math.PI * 2); ctx.fill();
}

// 🐨 28. Opossum (white face, pink nose, grey outline)
function drawOpossumFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(107, 114, 128, 0.25)"; ctx.shadowBlur = 5;
  // Grey body outline
  ctx.fillStyle = "#4b5563";
  roundRect(ctx, -7.5, -4.5, 15, 11, 4.0); ctx.fill();
  // White Face
  ctx.fillStyle = "#f8fafc";
  roundRect(ctx, -5.5, -2.5, 11, 8, 3.2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-5.5, 1.0); ctx.lineTo(0, 5.8); ctx.lineTo(5.5, 1.0); ctx.closePath(); ctx.fill();
  // Pink Nose
  ctx.fillStyle = "#fda4af";
  ctx.beginPath(); ctx.arc(0, 5.8, 1.4, 0, Math.PI * 2); ctx.fill();
  // Shocked eyes (wide white scleras, tiny pinpoint pupils)
  const px = ux * 0.9; const py = uy * 0.9;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(-2.6, 0.2, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.6, 0.2, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#09090b";
  ctx.beginPath(); ctx.arc(-2.6 + px * 0.5, 0.2 + py * 0.5, 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.6 + px * 0.5, 0.2 + py * 0.5, 0.6, 0, Math.PI * 2); ctx.fill();
}

// 🐒 29. Monkey (round brown ears, peach skin face)
function drawMonkeyFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(120, 53, 4, 0.3)"; ctx.shadowBlur = 6;
  // Round ears
  ctx.fillStyle = "#78350f";
  ctx.beginPath(); ctx.arc(-7.8, -1.8, 3.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(7.8, -1.8, 3.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fed7aa";
  ctx.beginPath(); ctx.arc(-7.8, -1.8, 2.0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(7.8, -1.8, 2.0, 0, Math.PI * 2); ctx.fill();
  // Head
  ctx.fillStyle = "#78350f";
  roundRect(ctx, -7.0, -4.5, 14, 11, 4.8); ctx.fill();
  // Heart-shaped Face Mask (extremely monkey-like)
  ctx.fillStyle = "#fed7aa";
  ctx.beginPath();
  ctx.arc(-2.2, -1.2, 2.8, 0, Math.PI * 2);
  ctx.arc(2.2, -1.2, 2.8, 0, Math.PI * 2);
  ctx.arc(0, 1.2, 3.2, 0, Math.PI * 2);
  ctx.fill();
  // Eyes
  const px = ux * 1.3; const py = uy * 1.3;
  ctx.fillStyle = "#1e293b";
  ctx.beginPath(); ctx.arc(-2.2, -0.6, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.2, -0.6, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(-2.2 + px * 0.4, -0.6 + py * 0.4, 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.2 + px * 0.4, -0.6 + py * 0.4, 0.6, 0, Math.PI * 2); ctx.fill();
}

// 🦌 30. Deer (light brown, forehead spots)
function drawDeerFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(217, 119, 6, 0.25)"; ctx.shadowBlur = 5;
  // Branching Antlers (highly accurate buck look)
  ctx.strokeStyle = "#78350f"; ctx.lineWidth = 1.0; ctx.lineCap = "round";
  // Left antler
  ctx.beginPath();
  ctx.moveTo(-3, -4.5); ctx.lineTo(-5.5, -9.5);
  ctx.moveTo(-4.2, -7.0); ctx.lineTo(-6.8, -7.0);
  ctx.stroke();
  // Right antler
  ctx.beginPath();
  ctx.moveTo(3, -4.5); ctx.lineTo(5.5, -9.5);
  ctx.moveTo(4.2, -7.0); ctx.lineTo(6.8, -7.0);
  ctx.stroke();
  // Ears
  ctx.fillStyle = "#b45309";
  ctx.beginPath(); ctx.arc(-6.5, -5.0, 3.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(6.5, -5.0, 3.2, 0, Math.PI * 2); ctx.fill();
  // Head
  ctx.fillStyle = "#d97706";
  roundRect(ctx, -7.0, -4.5, 14, 11, 4.0); ctx.fill();
  // White Spots on forehead
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(-2.5, -2.8, 0.6, 0, Math.PI * 2);
  ctx.arc(0, -3.2, 0.6, 0, Math.PI * 2);
  ctx.arc(2.5, -2.8, 0.6, 0, Math.PI * 2);
  ctx.fill();
  // Snout
  ctx.fillStyle = "#f8fafc";
  roundRect(ctx, -2.8, 3.2, 5.6, 3.2, 1.2); ctx.fill();
  ctx.fillStyle = "#1e293b";
  ctx.beginPath(); ctx.arc(0, 5.4, 1.2, 0, Math.PI * 2); ctx.fill();
  // Shocked Deer eyes
  const px = ux * 1.2; const py = uy * 1.2;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(-2.8, 0.2, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.8, 0.2, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(-2.8 + px * 0.5, 0.2 + py * 0.5, 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.8 + px * 0.5, 0.2 + py * 0.5, 0.6, 0, Math.PI * 2); ctx.fill();
}

// 🐷 31. Pig (pink, large snout with nostrils)
function drawPigFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(244, 63, 94, 0.2)"; ctx.shadowBlur = 5;
  // Floppy Ears
  ctx.fillStyle = "#f472b6";
  ctx.beginPath(); ctx.arc(-6.5, -4.8, 3.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(6.5, -4.8, 3.4, 0, Math.PI * 2); ctx.fill();
  // Body
  ctx.fillStyle = "#fbcfe8";
  roundRect(ctx, -8.0, -4.5, 16, 11, 4.5); ctx.fill();
  // Large pink Snout
  ctx.fillStyle = "#f472b6";
  roundRect(ctx, -4.0, 2.2, 8.0, 5.2, 1.8); ctx.fill();
  // Snout Holes
  ctx.fillStyle = "#9d174d";
  ctx.beginPath(); ctx.arc(-1.5, 4.8, 0.7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(1.5, 4.8, 0.7, 0, Math.PI * 2); ctx.fill();
  // Petrified Pig eyes
  const px = ux * 1.1; const py = uy * 1.1;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(-3.2, -0.6, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(3.2, -0.6, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(-3.2 + px * 0.5, -0.6 + py * 0.5, 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(3.2 + px * 0.5, -0.6 + py * 0.5, 0.6, 0, Math.PI * 2); ctx.fill();
}

// 🐦 32. Pigeon (slate blue head, iridescent neck)
function drawPigeonFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(71, 85, 105, 0.3)"; ctx.shadowBlur = 5;
  // Head
  ctx.fillStyle = "#475569";
  roundRect(ctx, -7.0, -4.5, 14, 10, 4.2); ctx.fill();
  // Iridescent collar
  const neckGrad = ctx.createLinearGradient(-5, 3, 5, 3);
  neckGrad.addColorStop(0, "#0d9488"); // teal
  neckGrad.addColorStop(1, "#c026d3"); // magenta
  ctx.fillStyle = neckGrad;
  roundRect(ctx, -5.5, 2.5, 11, 2.8, 0.8); ctx.fill();
  // Beak
  ctx.fillStyle = "#f97316";
  ctx.beginPath();
  ctx.moveTo(-2.0, 4.5); ctx.lineTo(0, 9.0); ctx.lineTo(2.0, 4.5); ctx.closePath(); ctx.fill();
  // Orange-Ringed Eyes
  const px = ux * 1.3; const py = uy * 1.3;
  ctx.fillStyle = "#ea580c";
  ctx.beginPath(); ctx.arc(-3.0, -0.6, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(3.0, -0.6, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#0f172a";
  ctx.beginPath(); ctx.arc(-3.0 + px, -0.6 + py, 1.0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(3.0 + px, -0.6 + py, 1.0, 0, Math.PI * 2); ctx.fill();
}

// 🐦 33. Sparrow (brown head, black bib)
function drawSparrowFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(124, 45, 18, 0.25)"; ctx.shadowBlur = 5;
  // Head
  ctx.fillStyle = "#7c2d12";
  roundRect(ctx, -6.8, -4.5, 13.6, 10, 4.0); ctx.fill();
  // White Cheeks
  ctx.fillStyle = "#f8fafc";
  ctx.beginPath(); ctx.arc(-4.5, 2.5, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(4.5, 2.5, 2.2, 0, Math.PI * 2); ctx.fill();
  // Black Bib
  ctx.fillStyle = "#18181b";
  ctx.beginPath();
  ctx.moveTo(-2.5, 4.5); ctx.lineTo(0, 7.5); ctx.lineTo(2.5, 4.5); ctx.closePath(); ctx.fill();
  // Beak
  ctx.fillStyle = "#eab308";
  ctx.beginPath();
  ctx.moveTo(-1.8, 3.8); ctx.lineTo(0, 7.2); ctx.lineTo(1.8, 3.8); ctx.closePath(); ctx.fill();
  // Petrified wide-eyed sparrow
  const px = ux * 1.2; const py = uy * 1.2;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(-2.8, -0.8, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.8, -0.8, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#111827";
  ctx.beginPath(); ctx.arc(-2.8 + px * 0.5, -0.8 + py * 0.5, 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.8 + px * 0.5, -0.8 + py * 0.5, 0.6, 0, Math.PI * 2); ctx.fill();
}

// 🐦 34. Quail (plump bird, teardrop plume)
function drawQuailFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(120, 53, 4, 0.25)"; ctx.shadowBlur = 5;
  // Plume feather (bobs slightly)
  const plumeBob = Math.sin(timestamp / 75) * 0.6;
  ctx.strokeStyle = "#18181b"; ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(0, -4.5);
  ctx.quadraticCurveTo(-3.0, -8.0 + plumeBob * 0.5, -4.5 + plumeBob, -11.0 + plumeBob * 0.2);
  ctx.stroke();
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(-4.5 + plumeBob, -11.0 + plumeBob * 0.2, 1.8, 0, Math.PI * 2); ctx.fill();
  // Head
  ctx.fillStyle = "#78350f";
  roundRect(ctx, -7.0, -4.5, 14, 10, 4.2); ctx.fill();
  // Speckled Pattern
  ctx.fillStyle = "#d97706";
  ctx.beginPath(); ctx.arc(-2.8, -2.8, 0.5, 0, Math.PI * 2); ctx.arc(2.8, -2.8, 0.5, 0, Math.PI * 2); ctx.fill();
  // Beak
  ctx.fillStyle = "#d97706";
  ctx.beginPath();
  ctx.moveTo(-1.6, 4.0); ctx.lineTo(0, 7.2); ctx.lineTo(1.6, 4.0); ctx.closePath(); ctx.fill();
  // Shocked wide-eyed quail
  const px = ux * 1.2; const py = uy * 1.2;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(-2.8, -0.5, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.8, -0.5, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#18181b";
  ctx.beginPath(); ctx.arc(-2.8 + px * 0.5, -0.5 + py * 0.5, 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.8 + px * 0.5, -0.5 + py * 0.5, 0.6, 0, Math.PI * 2); ctx.fill();
}

// 🦜 35. Parrot (emerald green, yellow face, black curved beak)
function drawParrotFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(16, 185, 129, 0.35)"; ctx.shadowBlur = 6;
  // Head
  ctx.fillStyle = "#10b981";
  roundRect(ctx, -7.2, -4.5, 14.4, 10, 4.5); ctx.fill();
  // Yellow cheeks/face
  ctx.fillStyle = "#facc15";
  ctx.beginPath(); ctx.arc(-4.2, 2.0, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(4.2, 2.0, 2.4, 0, Math.PI * 2); ctx.fill();
  // Red Crest tip
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.moveTo(-2.5, -4.5); ctx.lineTo(0, -8.2); ctx.lineTo(2.5, -4.5); ctx.closePath(); ctx.fill();
  // Curved Beak (hooked parrot beak)
  ctx.fillStyle = "#1f2937";
  ctx.beginPath();
  ctx.moveTo(-2.0, 3.5);
  ctx.quadraticCurveTo(0, 8.5, 0, 9.8);
  ctx.quadraticCurveTo(0, 4.5, 2.0, 3.5);
  ctx.closePath(); ctx.fill();
  // Eyes
  const px = ux * 1.3; const py = uy * 1.3;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(-2.8, -0.8, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.8, -0.8, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#111827";
  ctx.beginPath(); ctx.arc(-2.8 + px, -0.8 + py, 1.0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.8 + px, -0.8 + py, 1.0, 0, Math.PI * 2); ctx.fill();
}

// 🐣 36. Nestling (pink raw body, open yellow beak)
function drawNestlingFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(244, 63, 94, 0.25)"; ctx.shadowBlur = 5;
  // Pink baby body
  ctx.fillStyle = "#fda4af";
  roundRect(ctx, -7.0, -4.5, 14, 10, 4.8); ctx.fill();
  // Tiny yellow feather tufts
  ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-4, -4.5); ctx.lineTo(-5, -6.5);
  ctx.moveTo(4, -4.5); ctx.lineTo(5, -6.5);
  ctx.stroke();
  // Massive open beak (wobbles)
  const openWobble = Math.sin(timestamp * 0.05) * 1.2;
  ctx.fillStyle = "#facc15";
  ctx.strokeStyle = "#eab308"; ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(-4.5, 1.0);
  ctx.lineTo(0, -3.2 + openWobble);
  ctx.lineTo(4.5, 1.0);
  ctx.lineTo(0, 5.2 - openWobble);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // Inside mouth red
  ctx.fillStyle = "#f43f5e";
  ctx.beginPath();
  ctx.moveTo(-3.0, 1.0); ctx.lineTo(0, -1.0 + openWobble * 0.4); ctx.lineTo(3.0, 1.0); ctx.lineTo(0, 3.0 - openWobble * 0.4);
  ctx.closePath(); ctx.fill();
  // Closed bead eyes
  ctx.strokeStyle = "#475569"; ctx.lineWidth = 1.0; ctx.beginPath();
  ctx.arc(-3.5, -1.5, 1.0, 0, Math.PI, true);
  ctx.arc(3.5, -1.5, 1.0, 0, Math.PI, true);
  ctx.stroke();
}

// 🦎 37. Gecko (sinuous neon green crawling body, suction pad toes)
function drawGeckoFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(34, 197, 94, 0.35)"; ctx.shadowBlur = 6;
  const wiggle = Math.sin(timestamp / 70) * 1.6;

  // 4 Legs with circular suction toes
  ctx.strokeStyle = "#16a34a"; ctx.lineWidth = 1.5; ctx.lineCap = "round";
  // Front legs & toes
  ctx.beginPath(); ctx.moveTo(-2.5, -2); ctx.lineTo(-6, -4); ctx.stroke();
  ctx.fillStyle = "#22c55e"; ctx.beginPath(); ctx.arc(-6, -4, 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(2.5, -2); ctx.lineTo(6, -4); ctx.stroke();
  ctx.fillStyle = "#22c55e"; ctx.beginPath(); ctx.arc(6, -4, 1.6, 0, Math.PI * 2); ctx.fill();
  // Back legs & toes
  ctx.beginPath(); ctx.moveTo(-2.5, 3); ctx.lineTo(-6.5, 4.5); ctx.stroke();
  ctx.fillStyle = "#22c55e"; ctx.beginPath(); ctx.arc(-6.5, 4.5, 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(2.5, 3); ctx.lineTo(6.5, 4.5); ctx.stroke();
  ctx.fillStyle = "#22c55e"; ctx.beginPath(); ctx.arc(6.5, 4.5, 1.6, 0, Math.PI * 2); ctx.fill();

  // Long wiggling tail
  ctx.strokeStyle = "#4ade80"; ctx.lineWidth = 2.0; ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 4.5);
  ctx.quadraticCurveTo(wiggle, 8.2, wiggle * 1.4, 11.2);
  ctx.stroke();

  // Sinuous Gecko Body
  ctx.fillStyle = "#4ade80";
  ctx.beginPath();
  ctx.ellipse(0, 0, 3.4, 5.0, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = "#22c55e";
  ctx.beginPath();
  ctx.moveTo(-2.8, -3.5); ctx.lineTo(0, -6.8); ctx.lineTo(2.8, -3.5);
  ctx.closePath(); ctx.fill();

  // Vertical Slit Eyes
  const px = ux * 1.1; const py = uy * 1.1;
  ctx.fillStyle = "#facc15";
  ctx.beginPath(); ctx.arc(-1.8, -2.6, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#1e293b";
  ctx.beginPath(); ctx.ellipse(-1.8 + px * 0.5, -2.6 + py * 0.5, 0.4, 1.2, 0, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = "#facc15";
  ctx.beginPath(); ctx.arc(1.8, -2.6, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#1e293b";
  ctx.beginPath(); ctx.ellipse(1.8 + px * 0.5, -2.6 + py * 0.5, 0.4, 1.2, 0, 0, Math.PI * 2); ctx.fill();
}

// 🦎 38. Skink (crawling metallic grey body, electric blue tail)
function drawSkinkFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(6, 182, 212, 0.3)"; ctx.shadowBlur = 5;
  const tailWiggle = Math.sin(timestamp / 60) * 1.5;

  // 4 Legs
  ctx.strokeStyle = "#1f2937"; ctx.lineWidth = 1.4; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(-2, -1); ctx.lineTo(-6, -3); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(2, -1); ctx.lineTo(6, -3); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-2, 3); ctx.lineTo(-6, 4.2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(2, 3); ctx.lineTo(6, 4.2); ctx.stroke();

  // Electric blue tail (long & wiggling)
  ctx.strokeStyle = "#06b6d4"; ctx.lineWidth = 2.4; ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 4.5);
  ctx.quadraticCurveTo(tailWiggle, 8.0, tailWiggle * 1.4, 11.2);
  ctx.stroke();

  // Slender Sinuous Body
  ctx.fillStyle = "#374151";
  ctx.beginPath();
  ctx.ellipse(0, 0, 3.2, 5.0, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = "#1f2937";
  ctx.beginPath();
  ctx.moveTo(-2.5, -3.2); ctx.lineTo(0, -6.5); ctx.lineTo(2.5, -3.2);
  ctx.closePath(); ctx.fill();

  // Copper stripes down back
  ctx.fillStyle = "#ea580c";
  roundRect(ctx, -1.8, -3.0, 0.6, 6.8, 0.1); ctx.fill();
  roundRect(ctx, 1.2, -3.0, 0.6, 6.8, 0.1); ctx.fill();

  // Eyes
  const px = ux * 1.0; const py = uy * 1.0;
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath(); ctx.arc(-1.6, -2.4, 1.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(1.6, -2.4, 1.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#111827";
  ctx.beginPath(); ctx.arc(-1.6 + px * 0.5, -2.4 + py * 0.5, 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(1.6 + px * 0.5, -2.4 + py * 0.5, 0.6, 0, Math.PI * 2); ctx.fill();
}

// 🦎 39. Iguana (crawling olive green body with spiky spine ridges)
function drawIguanaFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(132, 204, 22, 0.35)"; ctx.shadowBlur = 5;
  const wiggle = Math.sin(timestamp / 70) * 1.4;

  // 4 Legs
  ctx.strokeStyle = "#4d7c0f"; ctx.lineWidth = 1.6; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(-2.5, -1.5); ctx.lineTo(-6.5, -3.5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(2.5, -1.5); ctx.lineTo(6.5, -3.5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-2.5, 3.0); ctx.lineTo(-6.5, 4.5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(2.5, 3.0); ctx.lineTo(6.5, 4.5); ctx.stroke();

  // Tail
  ctx.strokeStyle = "#65a30d"; ctx.lineWidth = 2.2; ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 4.5);
  ctx.quadraticCurveTo(wiggle, 8.2, wiggle * 1.4, 11.2);
  ctx.stroke();

  // Spikes along back (crest)
  ctx.fillStyle = "#84cc16";
  ctx.beginPath();
  ctx.moveTo(-1, -2.5); ctx.lineTo(-2, -5.5); ctx.lineTo(0, -2.5);
  ctx.moveTo(0, 0); ctx.lineTo(-1, -3.0); ctx.lineTo(1, 0);
  ctx.moveTo(1, 2.5); ctx.lineTo(0, -0.5); ctx.lineTo(2, 2.5);
  ctx.fill();

  // Body
  ctx.fillStyle = "#65a30d";
  ctx.beginPath();
  ctx.ellipse(0, 0, 3.6, 5.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = "#4d7c0f";
  ctx.beginPath();
  ctx.moveTo(-2.8, -3.5); ctx.lineTo(0, -6.8); ctx.lineTo(2.8, -3.5);
  ctx.closePath(); ctx.fill();

  // Dewlap throat fold
  ctx.fillStyle = "#84cc16";
  roundRect(ctx, -2.0, 2.2, 4.0, 2.8, 1.0); ctx.fill();

  // Eyes
  const px = ux * 1.2; const py = uy * 1.2;
  ctx.fillStyle = "#facc15";
  ctx.beginPath(); ctx.arc(-1.8, -2.6, 2.0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(1.8, -2.6, 2.0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#1e293b";
  ctx.beginPath(); ctx.arc(-1.8 + px * 0.5, -2.6 + py * 0.5, 0.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(1.8 + px * 0.5, -2.6 + py * 0.5, 0.8, 0, Math.PI * 2); ctx.fill();
}

// 🐢 40. Turtle (green shell segments, head and flippers poking out)
function drawTurtleFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(21, 128, 61, 0.3)"; ctx.shadowBlur = 5;

  // 4 Flippers poking out from the shell (drawn behind)
  ctx.fillStyle = "#4ade80";
  // Front-left flipper
  ctx.beginPath(); ctx.ellipse(-5.5, 3.5, 1.8, 3.5, -0.6, 0, Math.PI * 2); ctx.fill();
  // Front-right flipper
  ctx.beginPath(); ctx.ellipse(5.5, 3.5, 1.8, 3.5, 0.6, 0, Math.PI * 2); ctx.fill();
  // Rear-left flipper
  ctx.beginPath(); ctx.ellipse(-5.0, -4.5, 1.4, 2.8, 0.4, 0, Math.PI * 2); ctx.fill();
  // Rear-right flipper
  ctx.beginPath(); ctx.ellipse(5.0, -4.5, 1.4, 2.8, -0.4, 0, Math.PI * 2); ctx.fill();

  // Head (pokes out slightly based on timestamp)
  const headBob = Math.sin(timestamp / 200) * 0.8;
  ctx.fillStyle = "#4ade80";
  ctx.beginPath(); ctx.arc(0, 5.0 + headBob, 2.8, 0, Math.PI * 2); ctx.fill();
  // Tiny Eyes on head
  ctx.fillStyle = "#111827";
  ctx.beginPath(); ctx.arc(-1.0, 5.5 + headBob, 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(1.0, 5.5 + headBob, 0.5, 0, Math.PI * 2); ctx.fill();
  // Turtle Shell
  ctx.fillStyle = "#15803d";
  ctx.beginPath(); ctx.arc(0, 0, 7.5, 0, Math.PI * 2); ctx.fill();
  // Shell Rim
  ctx.strokeStyle = "#166534"; ctx.lineWidth = 1.0;
  ctx.stroke();
  // Shell Inner Hexagonal Scutes (highly accurate turtle shell)
  ctx.strokeStyle = "rgba(255,255,255,0.22)"; ctx.lineWidth = 0.65;
  ctx.beginPath();
  for (let k = 0; k < 6; k++) {
    const angle = (k * Math.PI) / 3;
    const x = Math.cos(angle) * 3.2;
    const y = Math.sin(angle) * 3.2;
    if (k === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath(); ctx.stroke();
  ctx.beginPath();
  for (let k = 0; k < 6; k++) {
    const angle = (k * Math.PI) / 3;
    ctx.moveTo(Math.cos(angle) * 3.2, Math.sin(angle) * 3.2);
    ctx.lineTo(Math.cos(angle) * 7.5, Math.sin(angle) * 7.5);
  }
  ctx.stroke();
}

// 🥚 41. Turtle Eggs (Clutch of 3 small, round, leathery beige eggs in a nest)
function drawTurtleEggsFood(ctx, timestamp) {
  ctx.shadowColor = "rgba(120, 113, 108, 0.2)"; ctx.shadowBlur = 4;

  // Helper function to draw a single round leathery egg
  const drawSingleRoundEgg = (ox, oy, rad) => {
    ctx.save();
    ctx.translate(ox, oy);
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(-rad * 0.3, -rad * 0.3, rad * 0.15, 0, 0, rad * 1.1);
    grad.addColorStop(0, "#ffffff");     // highlight
    grad.addColorStop(0.35, "#fafaf9");  // beige cream
    grad.addColorStop(1.0, "#d6d3d1");   // warm shadow
    ctx.fillStyle = grad; ctx.fill();
    ctx.strokeStyle = "rgba(120, 113, 108, 0.35)"; ctx.lineWidth = 0.55;
    ctx.stroke();
    // Tiny crease wrinkle
    ctx.strokeStyle = "rgba(0,0,0,0.08)"; ctx.lineWidth = 0.4;
    ctx.beginPath(); ctx.moveTo(-rad*0.5, rad*0.2); ctx.quadraticCurveTo(0, rad*0.4, rad*0.5, rad*0.2); ctx.stroke();
    ctx.restore();
  };

  // Draw 3 overlapping eggs in a nest cluster
  drawSingleRoundEgg(-2.8, 2.2, 4.4); // bottom-left egg
  drawSingleRoundEgg(2.8, 2.2, 4.4);  // bottom-right egg
  drawSingleRoundEgg(0, -2.6, 4.6);   // top centered egg
}

// 🐊 42. Crocodile Hatchling (crawling baby crocodile body)
function drawCrocodileHatchlingFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(22, 101, 52, 0.35)"; ctx.shadowBlur = 5;
  const wiggle = Math.sin(timestamp / 65) * 1.4;

  // 4 Legs
  ctx.strokeStyle = "#166534"; ctx.lineWidth = 1.6; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(-2.5, -1.0); ctx.lineTo(-6.5, -3.0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(2.5, -1.0); ctx.lineTo(6.5, -3.0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-2.5, 3.5); ctx.lineTo(-6.5, 5.0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(2.5, 3.5); ctx.lineTo(6.5, 5.0); ctx.stroke();

  // Scaly Tail (wiggling)
  ctx.strokeStyle = "#15803d"; ctx.lineWidth = 2.2; ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 5.0);
  ctx.quadraticCurveTo(wiggle, 8.8, wiggle * 1.4, 11.8);
  ctx.stroke();

  // Bumpy ridges on back
  ctx.fillStyle = "#166534";
  ctx.beginPath();
  ctx.arc(-1.2, -1.0, 0.7, 0, Math.PI * 2);
  ctx.arc(1.2, -1.0, 0.7, 0, Math.PI * 2);
  ctx.arc(-1.2, 1.5, 0.7, 0, Math.PI * 2);
  ctx.arc(1.2, 1.5, 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Head Base
  ctx.fillStyle = "#15803d";
  ctx.beginPath();
  ctx.ellipse(0, -2.5, 4.2, 3.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Long Snout (croc shape pointing upwards)
  ctx.fillStyle = "#166534";
  roundRect(ctx, -2.2, -8.5, 4.4, 6.0, 1.0); ctx.fill();

  // Nose holes
  ctx.fillStyle = "#111827";
  ctx.beginPath(); ctx.arc(-0.8, -8.0, 0.4, 0, Math.PI * 2); ctx.arc(0.8, -8.0, 0.4, 0, Math.PI * 2); ctx.fill();

  // Scared yellow eyes
  const px = ux * 1.1; const py = uy * 1.1;
  ctx.fillStyle = "#facc15";
  ctx.beginPath(); ctx.arc(-2.0, -2.8, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.0, -2.8, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#111827";
  ctx.beginPath(); ctx.ellipse(-2.0 + px * 0.5, -2.8 + py * 0.5, 0.5, 1.2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(2.0 + px * 0.5, -2.8 + py * 0.5, 0.5, 1.2, 0, 0, Math.PI * 2); ctx.fill();
}

// 🦎 43. Salamander (black body, yellow spots)
function drawSalamanderFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(250, 204, 21, 0.25)"; ctx.shadowBlur = 5;
  // Body
  ctx.fillStyle = "#1f2937";
  roundRect(ctx, -6.5, -4.5, 13, 9, 3.8); ctx.fill();
  // Bright yellow spots
  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.arc(-3.5, -2.5, 1.5, 0, Math.PI * 2);
  ctx.arc(3.5, 2.5, 1.5, 0, Math.PI * 2);
  ctx.arc(0, 0, 1.2, 0, Math.PI * 2);
  ctx.fill();
  // Eyes
  const px = ux * 1.0; const py = uy * 1.0;
  ctx.fillStyle = "#facc15";
  ctx.beginPath(); ctx.arc(-2.6, -1.8, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.6, -1.8, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#111827";
  ctx.beginPath(); ctx.arc(-2.6 + px, -1.8 + py, 0.7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.6 + px, -1.8 + py, 0.7, 0, Math.PI * 2); ctx.fill();
}

// 🦎 44. Newt (olive back, orange belly hint)
function drawNewtFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(234, 88, 12, 0.25)"; ctx.shadowBlur = 5;
  // Orange belly poking out on sides
  ctx.fillStyle = "#ea580c";
  roundRect(ctx, -7.0, -4.5, 14, 9, 4.0); ctx.fill();
  // Olive Back overlay
  ctx.fillStyle = "#3f6212";
  roundRect(ctx, -5.5, -4.5, 11, 9, 3.5); ctx.fill();
  // Eyes
  const px = ux * 1.0; const py = uy * 1.0;
  ctx.fillStyle = "#facc15";
  ctx.beginPath(); ctx.arc(-2.4, -1.2, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.4, -1.2, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#111827";
  ctx.beginPath(); ctx.arc(-2.4 + px, -1.2 + py, 0.7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.4 + px, -1.2 + py, 0.7, 0, Math.PI * 2); ctx.fill();
}

// 🐟 45. Tadpole (bulbous black head, wiggling tail)
function drawTadpolesFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(17, 24, 39, 0.3)"; ctx.shadowBlur = 4;
  // Long wiggling tail (sways at 7Hz)
  const tailSway = Math.sin(timestamp / 50) * 2.0;
  ctx.strokeStyle = "#374151"; ctx.lineWidth = 1.6; ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 3.8);
  ctx.quadraticCurveTo(tailSway, 7.0, tailSway * 1.5, 10.8);
  ctx.stroke();
  // Bulbous Head
  ctx.fillStyle = "#111827";
  ctx.beginPath(); ctx.arc(0, -0.5, 5.2, 0, Math.PI * 2); ctx.fill();
  // Tiny Eyes
  const px = ux * 0.8; const py = uy * 0.8;
  ctx.fillStyle = "#9ca3af";
  ctx.beginPath(); ctx.arc(-2.0, -1.8, 1.0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.0, -1.8, 1.0, 0, Math.PI * 2); ctx.fill();
}

// 🐟 46. Minnow (slender silver-blue fish)
function drawMinnowsFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(148, 163, 184, 0.3)"; ctx.shadowBlur = 4;
  const tailSway = Math.sin(timestamp / 65) * 1.5;
  // Tail fin
  ctx.fillStyle = "#64748b";
  ctx.beginPath();
  ctx.moveTo(0, 4.2);
  ctx.lineTo(-3.5 + tailSway, 7.8);
  ctx.lineTo(3.5 + tailSway, 7.8);
  ctx.closePath(); ctx.fill();
  // Slender Body
  ctx.fillStyle = "#94a3b8";
  ctx.beginPath();
  ctx.ellipse(0, -1.0, 3.8, 6.2, 0, 0, Math.PI * 2);
  ctx.fill();
  // Shiny blue stripe
  ctx.fillStyle = "#38bdf8";
  ctx.beginPath();
  ctx.ellipse(0, -1.0, 1.0, 5.0, 0, 0, Math.PI * 2);
  ctx.fill();
  // Eyes
  const px = ux * 0.8; const py = uy * 0.8;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(-1.8, -3.2, 1.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(1.8, -3.2, 1.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#1e293b";
  ctx.beginPath(); ctx.arc(-1.8 + px, -3.2 + py, 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(1.8 + px, -3.2 + py, 0.6, 0, Math.PI * 2); ctx.fill();
}

// 🐟 47. Catfish (barbels whiskers, flat grey head)
function drawCatfishFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(71, 85, 105, 0.3)"; ctx.shadowBlur = 5;
  // 4 Curved Barbels / Whiskers (highly realistic catfish feel)
  const whiskerBob = Math.sin(timestamp / 100) * 0.8;
  ctx.strokeStyle = "#334155"; ctx.lineWidth = 0.85;
  ctx.beginPath();
  // Upper barbels
  ctx.moveTo(-2.5, 3.0); ctx.bezierCurveTo(-5.5, 3.0, -8.0, 5.0, -9.5, 5.2 + whiskerBob);
  ctx.moveTo(2.5, 3.0); ctx.bezierCurveTo(5.5, 3.0, 8.0, 5.0, 9.5, 5.2 - whiskerBob);
  // Lower barbels
  ctx.moveTo(-1.5, 4.5); ctx.bezierCurveTo(-3.5, 5.0, -5.5, 7.5, -6.8, 7.8 + whiskerBob * 0.5);
  ctx.moveTo(1.5, 4.5); ctx.bezierCurveTo(3.5, 5.0, 5.5, 7.5, 6.8, 7.8 - whiskerBob * 0.5);
  ctx.stroke();
  // Flat head / body
  ctx.fillStyle = "#475569";
  roundRect(ctx, -7.0, -4.5, 14, 9, 3.5); ctx.fill();
  // Tail
  ctx.fillStyle = "#334155";
  ctx.beginPath();
  ctx.moveTo(0, 4.5); ctx.lineTo(-2.8, 8.5); ctx.lineTo(2.8, 8.5);
  ctx.closePath(); ctx.fill();
  // Wide petrified fish eyes
  const px = ux * 0.9; const py = uy * 0.9;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(-2.8, -1.5, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.8, -1.5, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#1e293b";
  ctx.beginPath(); ctx.arc(-2.8 + px * 0.5, -1.5 + py * 0.5, 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.8 + px * 0.5, -1.5 + py * 0.5, 0.6, 0, Math.PI * 2); ctx.fill();
}

// 🐟 48. Carp (golden orange scales, barbels)
function drawCarpFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(245, 158, 11, 0.35)"; ctx.shadowBlur = 5;
  // Tail
  const tailSway = Math.sin(timestamp / 70) * 1.5;
  ctx.fillStyle = "#d97706";
  ctx.beginPath();
  ctx.moveTo(0, 4.5); ctx.lineTo(-3.8 + tailSway, 8.5); ctx.lineTo(3.8 + tailSway, 8.5);
  ctx.closePath(); ctx.fill();
  // Plump body
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath(); ctx.ellipse(0, -0.8, 4.8, 6.2, 0, 0, Math.PI * 2); ctx.fill();
  // Scale lines grid
  ctx.strokeStyle = "rgba(146, 64, 14, 0.2)"; ctx.lineWidth = 0.65;
  ctx.beginPath();
  ctx.moveTo(-4.5, -2); ctx.lineTo(4.5, -2);
  ctx.moveTo(-4.8, 1); ctx.lineTo(4.8, 1);
  ctx.stroke();
  // Tiny chin barbels
  ctx.strokeStyle = "#92400e"; ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-1.2, 4.8); ctx.lineTo(-2.8, 6.5);
  ctx.moveTo(1.2, 4.8); ctx.lineTo(2.8, 6.5);
  ctx.stroke();
  // Eyes
  const px = ux * 1.1; const py = uy * 1.1;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(-2.4, -3.2, 2.0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.4, -3.2, 2.0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#1e293b";
  ctx.beginPath(); ctx.arc(-2.4 + px, -3.2 + py, 0.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.4 + px, -3.2 + py, 0.8, 0, Math.PI * 2); ctx.fill();
}

// 🐟 49. Trout (olive back, pink iridescent side stripe)
function drawTroutFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(236, 72, 153, 0.25)"; ctx.shadowBlur = 5;
  const tailSway = Math.sin(timestamp / 60) * 1.5;
  // Tail fin
  ctx.fillStyle = "#166534";
  ctx.beginPath();
  ctx.moveTo(0, 4.5); ctx.lineTo(-3.8 + tailSway, 8.5); ctx.lineTo(3.8 + tailSway, 8.5);
  ctx.closePath(); ctx.fill();
  // Slender Body (olive back)
  ctx.fillStyle = "#15803d";
  ctx.beginPath(); ctx.ellipse(0, -0.8, 4.0, 6.2, 0, 0, Math.PI * 2); ctx.fill();
  // Pink side stripe
  ctx.fillStyle = "#f472b6";
  ctx.beginPath(); ctx.ellipse(0, -0.8, 1.2, 5.0, 0, 0, Math.PI * 2); ctx.fill();
  // Speckles
  ctx.fillStyle = "#111827";
  ctx.beginPath(); ctx.arc(-1.5, -1.0, 0.4, 0, Math.PI * 2); ctx.arc(1.5, 1.0, 0.4, 0, Math.PI * 2); ctx.fill();
  // Eyes
  const px = ux * 1.0; const py = uy * 1.0;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(-1.8, -3.0, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(1.8, -3.0, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#111827";
  ctx.beginPath(); ctx.arc(-1.8 + px, -3.0 + py, 0.7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(1.8 + px, -3.0 + py, 0.7, 0, Math.PI * 2); ctx.fill();
}

// 🐍 50. Eels (long continuous fin, smooth grey)
function drawEelsFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(51, 65, 85, 0.3)"; ctx.shadowBlur = 5;
  // Long continuous fin wiggling
  const eelSway = Math.sin(timestamp / 50) * 2.2;
  ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 3.6; ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 4.0);
  ctx.quadraticCurveTo(eelSway, 8.0, eelSway * 1.5, 12.0);
  ctx.stroke();
  // Body core
  ctx.strokeStyle = "#475569"; ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, 4.0);
  ctx.quadraticCurveTo(eelSway, 8.0, eelSway * 1.5, 12.0);
  ctx.stroke();
  // Slender Head
  ctx.fillStyle = "#475569";
  ctx.beginPath(); ctx.ellipse(0, 0, 3.2, 5.0, 0, 0, Math.PI * 2); ctx.fill();
  // Tiny Eyes
  const px = ux * 0.7; const py = uy * 0.7;
  ctx.fillStyle = "#facc15";
  ctx.beginPath(); ctx.arc(-1.5, -2.2, 0.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(1.5, -2.2, 0.8, 0, Math.PI * 2); ctx.fill();
}

// 🐠 51. Goldfish (bright orange-red, fan tail)
function drawGoldfishFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(249, 115, 22, 0.35)"; ctx.shadowBlur = 5;
  const tailSway = Math.sin(timestamp / 60) * 1.8;
  // Wide fan tail fin (2 overlapping wings)
  ctx.fillStyle = "#ea580c";
  ctx.beginPath();
  ctx.moveTo(0, 4.5);
  ctx.lineTo(-5.2 + tailSway, 8.5);
  ctx.lineTo(0 + tailSway, 6.2);
  ctx.lineTo(5.2 + tailSway, 8.5);
  ctx.closePath(); ctx.fill();
  // Plump body
  ctx.fillStyle = "#f97316";
  ctx.beginPath(); ctx.ellipse(0, -0.6, 5.0, 6.2, 0, 0, Math.PI * 2); ctx.fill();
  // Eyes
  const px = ux * 1.2; const py = uy * 1.2;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(-2.4, -3.2, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.4, -3.2, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#111827";
  ctx.beginPath(); ctx.arc(-2.4 + px, -3.2 + py, 0.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.4 + px, -3.2 + py, 0.8, 0, Math.PI * 2); ctx.fill();
}

// 🦗 52. Grasshopper (bright green, jumping legs)
function drawGrasshopperFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(101, 163, 13, 0.25)"; ctx.shadowBlur = 5;
  // Hind Legs (angled capsule shapes)
  ctx.fillStyle = "#4d7c0f";
  ctx.save();
  ctx.translate(-5.5, 0); ctx.rotate(-0.4); roundRect(ctx, -1.5, -4, 2.5, 8, 1); ctx.restore();
  ctx.save();
  ctx.translate(5.5, 0); ctx.rotate(0.4); roundRect(ctx, -1.0, -4, 2.5, 8, 1); ctx.restore();
  // Body
  ctx.fillStyle = "#65a30d";
  roundRect(ctx, -5.2, -4.5, 10.4, 9.5, 3.2); ctx.fill();
  // Antennae (sways)
  const antSway = Math.sin(timestamp / 100) * 0.8;
  ctx.strokeStyle = "#4d7c0f"; ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-1.8, -4.5); ctx.quadraticCurveTo(-4, -8.0, -5.5 + antSway, -11.0);
  ctx.moveTo(1.8, -4.5); ctx.quadraticCurveTo(4, -8.0, 5.5 - antSway, -11.0);
  ctx.stroke();
  // Eyes
  const px = ux * 1.0; const py = uy * 1.0;
  ctx.fillStyle = "#facc15";
  ctx.beginPath(); ctx.arc(-2.2, -1.8, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.2, -1.8, 1.8, 0, Math.PI * 2); ctx.fill();
}

// 🪳 53. Cockroach (flat reddish-brown body, long antennae)
function drawCockroachFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(120, 53, 4, 0.3)"; ctx.shadowBlur = 5;
  // Segmented thin legs poking out
  ctx.strokeStyle = "#451a03"; ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-5, -2); ctx.lineTo(-8, -3);
  ctx.moveTo(-5, 1); ctx.lineTo(-9, 1);
  ctx.moveTo(5, -2); ctx.lineTo(8, -3);
  ctx.moveTo(5, 1); ctx.lineTo(9, 1);
  ctx.stroke();
  // Flat body shell
  ctx.fillStyle = "#78350f";
  roundRect(ctx, -5.8, -4.5, 11.6, 9.5, 3.8); ctx.fill();
  // Shiny shell highlights
  ctx.fillStyle = "rgba(251, 191, 36, 0.12)";
  roundRect(ctx, -3.8, -3.5, 7.6, 3.5, 1.0); ctx.fill();
  // Long Antennae
  const antSway = Math.sin(timestamp / 80) * 1.0;
  ctx.strokeStyle = "#451a03"; ctx.lineWidth = 0.65;
  ctx.beginPath();
  ctx.moveTo(-1.5, -4.5); ctx.quadraticCurveTo(-5, -9, -7.5 + antSway, -13.0);
  ctx.moveTo(1.5, -4.5); ctx.quadraticCurveTo(5, -9, 7.5 - antSway, -13.0);
  ctx.stroke();
  // Shocked insect eyes
  const px = ux * 0.8; const py = uy * 0.8;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(-2.0, -2.4, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.0, -2.4, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#09090b";
  ctx.beginPath(); ctx.arc(-2.0 + px * 0.4, -2.4 + py * 0.4, 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.0 + px * 0.4, -2.4 + py * 0.4, 0.5, 0, Math.PI * 2); ctx.fill();
}

// 🐞 54. Beetle (glossy black round shell)
function drawBeetleFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(15, 23, 42, 0.35)"; ctx.shadowBlur = 5;
  // Legs
  ctx.strokeStyle = "#020617"; ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-5, -2); ctx.lineTo(-8, -3);
  ctx.moveTo(-5, 2); ctx.lineTo(-8, 3);
  ctx.moveTo(5, -2); ctx.lineTo(8, -3);
  ctx.moveTo(5, 2); ctx.lineTo(8, 3);
  ctx.stroke();
  // Round Head/Thorax
  ctx.fillStyle = "#0f172a";
  roundRect(ctx, -6.0, -4.5, 12, 10, 4.2); ctx.fill();
  // Shell split line
  ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(0, -4.5); ctx.lineTo(0, 5.5); ctx.stroke();
  // Glossy highlight glint
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath(); ctx.ellipse(-2.5, -2.0, 1.0, 2.0, -0.4, 0, Math.PI * 2); ctx.fill();
  // Panicked yellow compound eyes
  const px = ux * 1.0; const py = uy * 1.0;
  ctx.fillStyle = "#facc15";
  ctx.beginPath(); ctx.arc(-2.4, -2.2, 2.0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.4, -2.2, 2.0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#0f172a";
  ctx.beginPath(); ctx.arc(-2.4 + px * 0.5, -2.2 + py * 0.5, 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2.4 + px * 0.5, -2.2 + py * 0.5, 0.6, 0, Math.PI * 2); ctx.fill();
}

// 🐛 55. Caterpillar (bright green segmented loops)
function drawCaterpillarFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(132, 204, 22, 0.3)"; ctx.shadowBlur = 4;
  const loopBob = Math.sin(timestamp / 100);
  // 4 overlapping circles for body segments
  ctx.fillStyle = "#84cc16";
  ctx.beginPath();
  ctx.arc(-4.5, 1.8 + loopBob * 0.4, 3.2, 0, Math.PI * 2);
  ctx.arc(-1.5, -0.8 - loopBob * 0.4, 3.2, 0, Math.PI * 2);
  ctx.arc(1.5, 1.8 + loopBob * 0.4, 3.2, 0, Math.PI * 2);
  ctx.arc(4.5, -0.8 - loopBob * 0.4, 3.2, 0, Math.PI * 2);
  ctx.fill();
  // Dark spots
  ctx.fillStyle = "#4d7c0f";
  ctx.beginPath();
  ctx.arc(-4.5, 1.8 + loopBob * 0.4, 0.6, 0, Math.PI * 2);
  ctx.arc(1.5, 1.8 + loopBob * 0.4, 0.6, 0, Math.PI * 2);
  ctx.fill();
  // Tiny antennae
  ctx.strokeStyle = "#4d7c0f"; ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(4.5, -3.0 - loopBob * 0.4); ctx.lineTo(6.2, -5.2);
  ctx.stroke();
  // Eyes on front segment
  const px = ux * 0.9; const py = uy * 0.9;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(3.6, -1.8 - loopBob * 0.4, 1.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#111827";
  ctx.beginPath(); ctx.arc(3.6 + px * 0.5, -1.8 - loopBob * 0.4 + py * 0.5, 0.6, 0, Math.PI * 2); ctx.fill();
}

// 🕷️ 56. Spider (black body, 8 thin legs)
function drawSpiderFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(220, 38, 38, 0.15)"; ctx.shadowBlur = 5;
  const legShifty = Math.sin(timestamp / 70) * 0.8;
  // 8 Jointed Legs (highly accurate arachnid layout)
  ctx.strokeStyle = "#09090b"; ctx.lineWidth = 0.85;
  ctx.beginPath();
  // Left 4 legs with bends
  ctx.moveTo(-2, -1); ctx.lineTo(-5, -4 + legShifty * 0.5); ctx.lineTo(-8, -2 + legShifty);
  ctx.moveTo(-2, 0); ctx.lineTo(-6, -1 - legShifty * 0.5); ctx.lineTo(-9, 1 - legShifty);
  ctx.moveTo(-2, 1); ctx.lineTo(-5, 3 + legShifty * 0.5); ctx.lineTo(-8, 5 + legShifty);
  ctx.moveTo(-2, 2); ctx.lineTo(-4, 5 - legShifty * 0.5); ctx.lineTo(-7, 7.5 - legShifty);
  // Right 4 legs with bends
  ctx.moveTo(2, -1); ctx.lineTo(5, -4 - legShifty * 0.5); ctx.lineTo(8, -2 - legShifty);
  ctx.moveTo(2, 0); ctx.lineTo(6, -1 + legShifty * 0.5); ctx.lineTo(9, 1 + legShifty);
  ctx.moveTo(2, 1); ctx.lineTo(5, 3 - legShifty * 0.5); ctx.lineTo(8, 5 - legShifty);
  ctx.moveTo(2, 2); ctx.lineTo(4, 5 + legShifty * 0.5); ctx.lineTo(7, 7.5 + legShifty);
  ctx.stroke();
  // Round Abdomen / Head
  ctx.fillStyle = "#09090b";
  ctx.beginPath(); ctx.arc(0, -1.0, 4.8, 0, Math.PI * 2); ctx.fill();
  // Red hourglass highlight
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.moveTo(-1.2, -2.8); ctx.lineTo(1.2, -2.8); ctx.lineTo(0, -1.2); ctx.closePath();
  ctx.moveTo(-1.2, 0.4); ctx.lineTo(1.2, 0.4); ctx.lineTo(0, -1.2); ctx.closePath();
  ctx.fill();
  // Tiny red eyes (front bead eyes)
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(-1.6, 2.2, 0.6, 0, Math.PI * 2);
  ctx.arc(1.6, 2.2, 0.6, 0, Math.PI * 2);
  ctx.fill();
}

// 🦂 57. Scorpion (claws, sting tail curved up)
function drawScorpionFood(ctx, ux, uy, timestamp) {
  ctx.shadowColor = "rgba(69, 26, 3, 0.3)"; ctx.shadowBlur = 5;
  // Tail curved up (wiggles)
  const tailSway = Math.sin(timestamp / 65) * 1.5;
  ctx.strokeStyle = "#451a03"; ctx.lineWidth = 1.8; ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, -3.2);
  ctx.quadraticCurveTo(-4 + tailSway, -6.5, -2 + tailSway, -11.0);
  ctx.stroke();
  // Poison Stinger bulb
  ctx.fillStyle = "#ea580c";
  ctx.beginPath(); ctx.arc(-2 + tailSway, -11.0, 1.4, 0, Math.PI * 2); ctx.fill();
  // Body segments
  ctx.fillStyle = "#451a03";
  roundRect(ctx, -5.5, -4.5, 11, 9, 3.8); ctx.fill();
  // Claws with pincers (highly accurate claw details)
  ctx.strokeStyle = "#451a03"; ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-3, 2.5); ctx.quadraticCurveTo(-7, 5.0, -6, 7.5);
  ctx.moveTo(3, 2.5); ctx.quadraticCurveTo(7, 5.0, 6, 7.5);
  ctx.stroke();
  ctx.fillStyle = "#451a03";
  ctx.beginPath();
  ctx.arc(-6, 7.5, 1.6, 0, Math.PI * 2);
  ctx.arc(6, 7.5, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ea580c"; ctx.lineWidth = 0.55;
  ctx.beginPath();
  ctx.arc(-6, 7.5, 1.2, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.arc(6, 7.5, 1.2, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.stroke();
  // Shocked scorpion eyes
  const px = ux * 0.7; const py = uy * 0.7;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(-1.6, 1.5, 1.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(1.6, 1.5, 1.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#451a03";
  ctx.beginPath(); ctx.arc(-1.6 + px * 0.4, 1.5 + py * 0.4, 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(1.6 + px * 0.4, 1.5 + py * 0.4, 0.5, 0, Math.PI * 2); ctx.fill();
}

// 🥚 58. Reptile Eggs (Clutch of 2 elongated, matte cream-grey eggs side-by-side)
function drawReptileEggsFood(ctx, timestamp) {
  ctx.shadowColor = "rgba(168, 162, 158, 0.18)"; ctx.shadowBlur = 4;

  // Helper function to draw a single elongated leathery egg
  const drawSingleElongatedEgg = (ox, oy, angle) => {
    ctx.save();
    ctx.translate(ox, oy);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, -7.5);
    ctx.bezierCurveTo(3.8, -7.5, 4.5, 1.8, 4.5, 5.2);
    ctx.bezierCurveTo(4.5, 8.8, 2.2, 9.8, 0, 9.8);
    ctx.bezierCurveTo(-2.2, 9.8, -4.5, 8.8, -4.5, 5.2);
    ctx.bezierCurveTo(-4.5, 1.8, -3.8, -7.5, 0, -7.5);
    ctx.closePath();

    const grad = ctx.createRadialGradient(-1.4, -2.2, 1.2, 0, 1.5, 8.5);
    grad.addColorStop(0, "#ffffff");     // highlight
    grad.addColorStop(0.35, "#fafaf9");  // soft beige cream
    grad.addColorStop(1.0, "#a8a29e");   // warm shadow
    ctx.fillStyle = grad; ctx.fill();
    ctx.strokeStyle = "rgba(120, 113, 108, 0.35)"; ctx.lineWidth = 0.55;
    ctx.stroke();

    // Crease line
    ctx.strokeStyle = "rgba(0,0,0,0.08)"; ctx.lineWidth = 0.45;
    ctx.beginPath(); ctx.moveTo(-2.4, -1.8); ctx.quadraticCurveTo(0, -1.0, 2.4, -1.8); ctx.stroke();
    ctx.restore();
  };

  // Draw 2 elongated eggs side-by-side, slightly splayed outwards
  drawSingleElongatedEgg(-2.8, 0.8, -0.15); // left egg
  drawSingleElongatedEgg(2.8, -0.8, 0.15);  // right egg
}
