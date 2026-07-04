import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLenis } from "lenis/react";

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
    for (let i = 0; i < 20; i++) {
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
    if (pos.type === 20 || pos.type === 21) {
      pos.type = Math.floor(Math.random() * 2); // default to rat/frog
    }
  }
  return pos;
}

// ─── Food Drawing Router ──────────────────────────────────────────────────────
function drawFood(ctx, food, snakeHead, timestamp) {
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
  ctx.scale(1.15 + breath, 1.15 + breath);

  const type = food.type ?? 0;
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
    default: drawEggFood(ctx, timestamp); break;
  }

  // Draw sweat droplet if the prey is panicked (ignore for the egg)
  if (isPanicked && type !== 2) {
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


// 🥚 3. Luminous 3D Pearl Egg (Food)
function drawEggFood(ctx, timestamp) {
  // Soft neutral white shadow glow
  ctx.shadowColor = "rgba(255, 255, 255, 0.15)";
  ctx.shadowBlur = 6;

  // Egg Body (mathematically smooth egg curve, scaled up by 1.2x)
  ctx.beginPath();
  ctx.moveTo(0, -8.16);
  ctx.bezierCurveTo(5.28, -8.16, 6.72, 1.44, 6.72, 5.28);
  ctx.bezierCurveTo(6.72, 9.36, 4.08, 10.8, 0, 10.8);
  ctx.bezierCurveTo(-4.08, 10.8, -6.72, 9.36, -6.72, 5.28);
  ctx.bezierCurveTo(-6.72, 1.44, -5.28, -8.16, 0, -8.16);
  ctx.closePath();

  // 3D Shading Gradient (light from top-left, pearl/slate-silver shading)
  const grad = ctx.createRadialGradient(-2.2, -2.6, 1.4, 0, 1.8, 10.2);
  grad.addColorStop(0, "#ffffff");      // hot highlight core
  grad.addColorStop(0.35, "#f1f5f9");   // slate-100 neutral light
  grad.addColorStop(1.0, "#64748b");    // slate-500 3D shadow rim
  ctx.fillStyle = grad;
  ctx.fill();

  // Crisp silver shell outline
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 0.65;
  ctx.stroke();

  ctx.shadowBlur = 0;

  // Gloss highlight glint
  ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
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

  const startGame = useCallback(() => {
    const s     = g.current;
    s.snake     = [{ x: 8, y: 8 }];
    s.dir       = { x: 1, y: 0 };
    s.nextDir   = { x: 1, y: 0 };
    s.preyPool  = []; // Reset pool for fresh shuffle
    s.foodMoveCounter = 0;
    s.food      = randomFood(s);
    s.score     = 0;
    s.state     = "PLAYING";
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
          const isMiniBoss = s.food.type === 20 || s.food.type === 21;
          
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

          s.food      = randomFood(s);
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
                className="font-['Outfit'] font-bold text-[13px] tracking-[0.2em] text-[#16a34a]"
                style={{ textShadow: "0 0 14px rgba(22,163,74,0.8)" }}
              >
                ▋ SNAKE.EXE
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
