import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* ── "My Newest Project" → the homepage ──────────────────────────────────────
   The card is this site, so opening it runs the site. Three beats:

   1. THE CARD BECOMES THE SCREEN. The thumbnail well grows to fill the
      viewport — a clip-path, so nothing inside is scaled or re-laid-out while
      it moves — and the card's >_ glyph travels with it to become the prompt.
   2. IT BOOTS. EXECUTING PORTFOLIO.EXE types out beside the prompt, and a short
      log streams beneath it. Every line in it is true of the site: the archive
      and file counts are counted from the sections, not written down, and the
      fonts and route are the ones actually in use. A boot log of "DECRYPTING
      DATA..." would be decoration; this one is a readout.
   3. CRT OFF, STRAIGHT INTO WELCOME. The screen collapses to a line and goes
      dark on the exact ground the site's loader starts on, and the loader is
      replayed in place — no page load. The old version hard-reloaded, which put
      a blank frame and a second, unrelated visual language between the two.

   No flashing. The previous overlay pulsed its opacity roughly five times a
   second on a loop, over the three-per-second limit in WCAG 2.3.1. The only
   brightness change here is the single power-off, and the caret blinks at
   about once a second.

   Reduced motion gets the same content, already in place, and a plain fade. */

const EASE = [0.16, 1, 0.3, 1];
const HEADING = "EXECUTING PORTFOLIO.EXE";
const CARD_GLYPH = 48; // the card's glyph size, px — w-12

// ms from the click
const T = {
  expand: 650,     // card → full screen, glyph arrives
  typeFrom: 650,
  typeStep: 22,    // per character of the heading
  logFrom: 1000,
  logStep: 160,
  barFrom: 950,
  barFor: 950,
  off: 2050,       // CRT power-off begins
  offFor: 480,
};
T.done = T.off + T.offFor;

/* Lucide's Terminal geometry, drawn here so the underscore can be animated on
   its own. The card and this screen share it, so the glyph that travels is the
   glyph that was clicked. */
export function TerminalGlyph({ caretClassName = "", className = "", style }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" x2="20" y1="19" y2="19" className={caretClassName} />
    </svg>
  );
}

const CARET_BLINK = "animate-[caret-blink_1.06s_steps(1,end)_infinite] motion-reduce:animate-none";

function logLines({ archives, files }) {
  const row = (verb, what) => `${verb.padEnd(8)} ${what} `.padEnd(38, ".") + " ok";
  return [
    "$ ./portfolio.exe",
    row("index", `${archives} archives · ${files} files`),
    row("load", "monument · outfit"),
    row("route", "/work-sample → /"),
    row("mount", "home"),
  ];
}

export function ExecuteTransition({ origin, counts, onDone }) {
  const reduce = useReducedMotion();
  const slotRef = useRef(null);
  const [slot, setSlot] = useState(null);
  const [arrived, setArrived] = useState(!!reduce);
  const [typed, setTyped] = useState(reduce ? HEADING.length : 0);
  const [shown, setShown] = useState(reduce ? Infinity : 0);
  const [off, setOff] = useState(false);
  const lines = logLines(counts);

  // Where the prompt ends up. The content is laid out at full size from the
  // first frame — the clip only hides it — so this rect is already final.
  useLayoutEffect(() => {
    if (slotRef.current) setSlot(slotRef.current.getBoundingClientRect());
  }, []);

  useEffect(() => {
    const timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));

    if (reduce) {
      at(900, onDone);
    } else {
      at(T.expand, () => setArrived(true));
      for (let i = 1; i <= HEADING.length; i += 1) at(T.typeFrom + i * T.typeStep, () => setTyped(i));
      lines.forEach((_, i) => at(T.logFrom + i * T.logStep, () => setShown(i + 1)));
      at(T.off, () => setOff(true));
      at(T.done, onDone);
    }
    return () => timers.forEach(clearTimeout);
    // runs once per transition; onDone and the lines are fixed for its lifetime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // The thumbnail well: rounded top corners, square bottom, like the card.
  const from = `inset(${origin.top}px ${vw - origin.right}px ${vh - origin.bottom}px ${origin.left}px round 12px 12px 0px 0px)`;
  const to = "inset(0px 0px 0px 0px round 0px 0px 0px 0px)";

  const glyphFrom = {
    x: origin.left + origin.width / 2 - CARD_GLYPH / 2,
    y: origin.top + origin.height / 2 - CARD_GLYPH / 2,
    scale: 1,
  };
  const glyphTo = slot && {
    x: slot.left + slot.width / 2 - CARD_GLYPH / 2,
    y: slot.top + slot.height / 2 - CARD_GLYPH / 2,
    scale: slot.width / CARD_GLYPH,
  };

  return (
    <div
      className="fixed inset-0 z-[999999]"
      role="status"
      aria-label="Loading the homepage"
      onContextMenu={(e) => e.preventDefault()}
      onWheel={(e) => e.stopPropagation()}
      data-lenis-prevent="true"
    >
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={reduce ? { opacity: 0, backgroundColor: "#0C0C0B" } : { clipPath: from, backgroundColor: "#1a1a1a" }}
        animate={reduce ? { opacity: 1 } : { clipPath: to, backgroundColor: "#0C0C0B" }}
        transition={{ duration: reduce ? 0.25 : T.expand / 1000, ease: EASE }}
      >
        {/* Static scanlines. A texture, not an animation — nothing here flickers. */}
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px]" />

        {/* Everything that powers off. */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center px-6"
          animate={off ? { scaleY: [1, 0.004, 0.004], scaleX: [1, 1, 0], opacity: [1, 1, 0], filter: ["brightness(1)", "brightness(2.2)", "brightness(2.2)"] } : {}}
          transition={{ duration: T.offFor / 1000, times: [0, 0.55, 1], ease: "easeIn" }}
        >
          <div className="w-full max-w-[640px]">
            <div className="flex items-center gap-3 md:gap-4">
              <span
                ref={slotRef}
                className="shrink-0 w-7 h-7 md:w-9 md:h-9 text-green-500"
                style={{ visibility: arrived ? "visible" : "hidden" }}
              >
                <TerminalGlyph className="w-full h-full" caretClassName={CARET_BLINK} />
              </span>
              <p className="font-['Outfit'] font-bold text-[14px] sm:text-[20px] md:text-[26px] text-green-500 tracking-[0.2em] uppercase whitespace-nowrap">
                {HEADING.slice(0, typed)}
                {/* Holds the line's full width while it types, so nothing shifts. */}
                <span className="invisible">{HEADING.slice(typed)}</span>
              </p>
            </div>

            <div className="mt-4 md:mt-5 h-[2px] w-full bg-green-500/15 overflow-hidden rounded-full">
              <motion.div
                className="h-full bg-green-500 origin-left"
                initial={{ scaleX: reduce ? 1 : 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: T.barFrom / 1000, duration: T.barFor / 1000, ease: "easeInOut" }}
              />
            </div>

            <pre className="mt-4 md:mt-5 font-mono text-[11px] md:text-[12px] leading-[1.75] text-green-500/70 overflow-hidden">
              {lines.map((line, i) => (
                <motion.div
                  key={line}
                  initial={false}
                  animate={i < shown ? { opacity: 1, x: 0 } : { opacity: 0, x: -4 }}
                  transition={{ duration: 0.18 }}
                  className={i === 0 ? "text-green-400" : undefined}
                >
                  {line}
                </motion.div>
              ))}
            </pre>
          </div>
        </motion.div>

        {/* The line a CRT leaves as it switches off. */}
        {off && (
          <motion.div
            className="absolute left-0 right-0 top-1/2 h-[2px] -mt-px bg-green-300"
            initial={{ opacity: 0, scaleX: 1 }}
            animate={{ opacity: [0, 0.9, 0.9, 0], scaleX: [1, 1, 0.02, 0] }}
            transition={{ duration: T.offFor / 1000, times: [0, 0.5, 0.85, 1], ease: "easeIn" }}
          />
        )}
      </motion.div>

      {/* The clicked glyph, flying from the card to the prompt. It sits outside
          the clip so it is never cut off on the way, and hands over to the real
          prompt the moment it lands. */}
      {!reduce && glyphTo && !arrived && (
        <motion.div
          className="absolute top-0 left-0 text-green-500 pointer-events-none"
          style={{ width: CARD_GLYPH, height: CARD_GLYPH, transformOrigin: "center" }}
          initial={glyphFrom}
          animate={glyphTo}
          transition={{ duration: T.expand / 1000, ease: EASE }}
        >
          <TerminalGlyph className="w-full h-full" />
        </motion.div>
      )}
    </div>
  );
}
