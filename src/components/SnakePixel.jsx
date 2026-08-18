import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

/* Traced 1:1 from the reference clip: frames were extracted with ffmpeg, the
   sprite's bounding box and 24x16 cell grid detected, then each cell centre
   sampled and matched to the source palette.
   K outline/eyes · G body · L belly · D shade · R tongue */
const SPRITE = [
  "..KKKKKKKK..............",
  ".KGGGGGGGGK.............",
  "KGGGGGGGGGGK............",
  "KGGKGGGKGGGK............",
  "KGGKGGGKGGGK............",
  "KGGGGGGGGGGK............",
  ".KGGGGGGGKGK.......KKK..",
  "..KKKKKKKDGK......KGGGK.",
  "R..R..KLDGGK.....KGGGGDK",
  ".RR...KLLGK.....KGGGGDDK",
  ".....KLLLGGK....KGGGDKDK",
  ".....KLLLLGGKKKKGGGDKKDK",
  ".....KGLGLLGGGGGGGGDK.K.",
  "......KLLLLGLLLLLDDGK...",
  ".......KLLLLLLLLGLLK....",
  "........KKKKKKKKKKK.....",
];

/* Shape is the traced sprite, but recoloured into the site's snake greens:
   body = the in-game snake (#16a34a), belly = the "You found it" label (#4ade80). */
const LIT = {
  K: "#0d3b1e", // dark green outline + eyes
  G: "#16a34a", // in-game snake body
  L: "#4ade80", // belly — matches the label text
  D: "#107a37", // shade
  R: "#dc2626", // tongue (the game's red)
};

const DIM_OUTLINE = "#4a4f4a"; // resting state: hollow grey outline

const COLS = SPRITE[0].length;
const ROWS = SPRITE.length;
const CELL = 2.1; // px per sprite pixel

// Life floods out from the head, so the reveal is a circle growing from here
const HEAD = { x: 5, y: 3 };
const MAX_R = 27; // clears the far corner of the sprite

const CELLS = [];
for (let y = 0; y < ROWS; y++) {
  for (let x = 0; x < COLS; x++) {
    const ch = SPRITE[y][x];
    if (ch !== ".") CELLS.push({ x, y, ch });
  }
}

export function SnakePixel() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [revealed, setRevealed] = useState(false); // touch: found by the first tap

  useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    setIsTouch(mq.matches);
    const onChange = (e) => setIsTouch(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const play = () => window.dispatchEvent(new CustomEvent("open-snake-game"));

  // Touch has no hover, so discovery is a two-step: the first tap wakes the
  // snake and shows the prompt, the second tap starts the game.
  const activate = () => {
    if (isTouch && !revealed) {
      setRevealed(true);
      return;
    }
    play();
  };

  const lit = hovered || (isTouch && revealed);
  const labelOpacity = lit ? 1 : 0;

  const sweep = reduced
    ? { duration: 0 }
    : { duration: lit ? 0.75 : 0.35, ease: lit ? [0.22, 1, 0.36, 1] : "easeIn" };

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={activate}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={isTouch && !revealed ? "Reveal hidden snake" : "Play Snake"}
      // extra bottom room on mobile so the label clears the floating nav pill
      className="mt-5 mb-8 md:mb-0 flex flex-col items-center gap-2 cursor-pointer select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: inView ? 1 : 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      whileHover={reduced ? {} : { scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.svg
        width={COLS * CELL}
        height={ROWS * CELL}
        viewBox={`0 0 ${COLS} ${ROWS}`}
        shapeRendering="crispEdges"
        xmlns="http://www.w3.org/2000/svg"
        // clipped to the sprite box so nothing can spill onto the footer text
        style={{ maxWidth: "none", display: "block", overflow: "hidden" }}
        // glow arrives once the colour has finished travelling the body
        animate={{
          filter: lit
            ? "drop-shadow(0 0 4px rgba(74,222,128,0.6)) drop-shadow(0 0 10px rgba(22,163,74,0.28))"
            : "drop-shadow(0 0 0px rgba(22,163,74,0))",
        }}
        transition={{ duration: 0.5, delay: reduced ? 0 : lit ? 0.45 : 0, ease: "easeOut" }}
      >
        <defs>
          {/* the colour layer is revealed by a circle growing out of the head —
              against crisp-edged pixel art the wavefront reveals cell by cell */}
          <mask id="snakeWake" maskUnits="userSpaceOnUse">
            <rect x="0" y="0" width={COLS} height={ROWS} fill="#000" />
            <motion.circle
              cx={HEAD.x + 0.5}
              cy={HEAD.y + 0.5}
              fill="#fff"
              initial={false}
              animate={{ r: lit ? MAX_R : 0 }}
              transition={sweep}
            />
          </mask>
        </defs>

        {/* resting layer: hollow grey outline */}
        {CELLS.filter((c) => c.ch === "K").map(({ x, y }) => (
          <rect key={`o-${x}-${y}`} x={x} y={y} width="1" height="1" fill={DIM_OUTLINE} />
        ))}

        {/* full-colour sprite, unmasked as the wave passes over it */}
        <g mask="url(#snakeWake)">
          {CELLS.map(({ x, y, ch }) => (
            <rect key={`c-${x}-${y}`} x={x} y={y} width="1" height="1" fill={LIT[ch]} />
          ))}
        </g>

      </motion.svg>

      <motion.span
        animate={{ opacity: labelOpacity }}
        transition={{ duration: 0.3 }}
        className="font-['Outfit'] text-[8.5px] font-bold tracking-[0.22em] uppercase text-[#4ade80] whitespace-nowrap"
      >
        You found it! — {isTouch ? "tap to play" : "play"}
      </motion.span>
    </motion.button>
  );
}
