import React, { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";

/* Ghost ticker for the archive header.
   The hero and contact tickers drift at a fixed rate. This one is a tape the
   page pulls through: it creeps on its own, speeds up with the scroll, and
   runs backwards when you scroll back up, so the index reacts to how fast you
   are moving through the archive. */

/* Middot (U+00B7), the lightest separator Monument actually carries: the names
   do the reading and it only paces them. The slash is left to the section
   labels (PORTFOLIO / ARCHIVE) so the two don't echo each other. Padded with
   non-breaking spaces, since white-space:nowrap collapses ordinary space runs. */
const SEPARATOR = "  ·  ";

// Letters dissolve into the background at both ends instead of being sliced,
// which is what made the band read as running off the edge of the page.
const EDGE_FADE =
  "linear-gradient(to right, transparent 0%, #000 10%, #000 90%, transparent 100%)";

// -50% is exactly one copy of the strip, so wrapping there keeps the loop seamless
const wrap = (min, max, v) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

export function ArchiveTicker({ items, baseVelocity = -1.4 }) {
  const reduced = useReducedMotion();
  const baseX = useMotionValue(0);

  // The archive is a long scroll; no point repainting the tape once it's gone.
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "100px" });

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  // clamp:false so a hard flick can overtake the idle drift instead of capping out
  const velocityFactor = useTransform(smoothVelocity, [0, 1200], [0, 4], { clamp: false });

  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduced || !inView) return;

    const factor = velocityFactor.get();
    // Scrolling up runs the tape backwards. The threshold keeps it from being
    // flipped by settling noise, so at rest it always returns to drifting left.
    const direction = factor < -0.05 ? -1 : 1;

    // How hard you scroll sets the speed, capped so a flick can't blur it out.
    const boost = Math.min(1 + Math.abs(factor), 6);

    baseX.set(baseX.get() + direction * baseVelocity * (delta / 1000) * boost);
  });

  const strip = items.join(SEPARATOR) + SEPARATOR;

  return (
    // Sits inside the page margins, and both ends dissolve rather than being cut,
    // so the band reads as a contained object instead of type running off-page.
    <div
      ref={ref}
      aria-hidden="true"
      className="mt-10 md:mt-14 overflow-hidden pointer-events-none select-none py-[0.12em]"
      style={{ maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE }}
    >
      <motion.div
        className="font-monument whitespace-nowrap leading-none w-max text-[11vw] md:text-[48px] xl:text-[64px]"
        style={{ x, WebkitTextStroke: "1px rgba(244,244,244,0.10)", color: "transparent" }}
      >
        <span>{strip}</span>
        <span>{strip}</span>
      </motion.div>
    </div>
  );
}
