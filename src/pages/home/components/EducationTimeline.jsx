import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ScrambleLabel } from "../../../components/ScrambleLabel";

const educationData = [
  {
    id: 0,
    institution: "STONEHILL INTERNATIONAL SCHOOL",
    program: "International Baccalaureate Diploma",
    year: "2018–2020",
    logoImage: "/stonehill-logo-transparent.png",
    logoScale: "w-[92%] h-[92%]",
    logoFilter: "grayscale brightness-0 invert",
    logoText: "SH",
    brandColor: "#9C1824",
  },
  {
    id: 1,
    institution: "YALE-NUS SUMMER DISCOVERY",
    program: "Global Leadership & Entrepreneurship",
    year: "2019",
    logoImage: "/ync-logo-transparent.png",
    logoScale: "w-[46%] h-[46%]",
    logoFilter: "grayscale brightness-0 invert",
    logoText: "YNC",
    brandColor: "#FC9C24",
  },
  {
    id: 2,
    institution: "PURDUE UNIVERSITY & SIMPLILEARN",
    program: "Professional Certificate in Digital Marketing",
    year: "2023–2024",
    // Outline-only copy of the Motion P. The original is a gold-filled P with a
    // black outline, and `grayscale invert` turned that gold into a muddy #4c4c4c
    // fill inside the letter. This one keeps just the black stroke, so it
    // inverts to a clean white outline like the other logos.
    logoImage: "/purdue-logo-outline.png",
    logoScale: "w-[64%] h-[64%]",
    logoFilter: "brightness-0 invert",
    logoText: "PU",
    brandColor: "#CFB991",
  },
  {
    id: 3,
    institution: "UNIVERSITY OF BRITISH COLUMBIA",
    program: "Bachelor of Management Honours",
    year: "2020–2025",
    logoImage: "/ubc-logo-transparent.png",
    logoScale: "w-[78%] h-[78%]",
    logoFilter: "grayscale brightness-0 invert",
    logoText: "UBC",
    brandColor: "#00A7E1",
  },
];

// Dot size = 14px (w-3.5 h-3.5). Logo box = h-14 (56px).
// To center dot vertically on logo box: mt = (56 - 14) / 2 = 21px
// Dot center from row-top = 21 + 7 = 28px  →  line uses top-[28px] / bottom-[28px]
const DOT_PX = 14;   // w-3.5 h-3.5
const LOGO_PX = 56;  // h-14
const DOT_MT = (LOGO_PX - DOT_PX) / 2;  // 21
const DOT_CENTER_FROM_TOP = DOT_MT + DOT_PX / 2; // 28

// ─── Circle that fills green as the scroll line reaches it ───
function FillDot({ mobileProgress, threshold }) {
  const start = Math.max(0, threshold - 0.18);
  const end   = Math.min(1, threshold + 0.06);

  const bg     = useTransform(mobileProgress, [start, end], ["#111111", "#16a34a"]);
  const border = useTransform(mobileProgress, [start, end], ["#333333", "#16a34a"]);
  const shadow = useTransform(mobileProgress, [start, end],
    ["0 0 0px transparent", "0 0 10px #16a34a"]);

  return (
    <motion.div
      className="rounded-full flex-shrink-0"
      style={{
        width:  DOT_PX,
        height: DOT_PX,
        marginTop: DOT_MT,
        backgroundColor: bg,
        border: "2px solid",
        borderColor: border,
        boxShadow: shadow,
      }}
    />
  );
}

// ─── Card content: logo + text, fades in as line reaches it ───
function MobileCard({ edu, mobileProgress, threshold }) {
  const start   = Math.max(0, threshold - 0.18);
  const end     = Math.min(1, threshold + 0.06);
  const opacity = useTransform(mobileProgress, [start, end], [0.15, 1]);
  const y       = useTransform(mobileProgress, [start, end], [8, 0]);

  return (
    <motion.div
      className="flex flex-row gap-4 items-start flex-1"
      style={{ opacity, y }}
    >
      {/* Logo box */}
      <div className="flex-shrink-0 w-14 h-14 bg-[#0a0a0a] border border-[#2a2a2a] rounded flex items-center justify-center overflow-hidden">
        {edu.logoImage ? (
          <img
            src={edu.logoImage}
            alt={edu.institution}
            className={`${edu.logoScale} object-contain ${edu.logoFilter}`}
          />
        ) : (
          <span className="text-[#666] font-['Outfit'] font-bold text-[10px]">
            {edu.logoText}
          </span>
        )}
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1 pt-1">
        <h3 className="text-[13px] font-bold font-['Outfit'] tracking-wide text-[#e0e0e0] uppercase leading-snug">
          {edu.institution}
        </h3>
        <p className="text-[#a3a3a3] text-[13px] font-light">{edu.program}</p>
        <span className="text-[11px] text-[#555] tracking-widest mt-1 uppercase">
          {edu.year}
        </span>
      </div>
    </motion.div>
  );
}

// Brand colour at reduced alpha, so a passed node keeps a hint of its colour
// against the section background instead of staying fully saturated.
const DIM_ALPHA = 0.45;
function dimmed(hex) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${DIM_ALPHA})`;
}

// ─── Desktop node — isolated component so hooks are at the top level ───
function DesktopNode({ edu, index, total, scrollYProgress, logoRef, crossAt, nextCrossAt }) {
  const threshold  = index / (total - 1);
  const inputStart = Math.max(0, threshold - 0.05);
  const inputEnd   = Math.max(0.001, threshold);
  const opacity    = useTransform(scrollYProgress, [inputStart, inputEnd], [0.3, 1]);
  const scale      = useTransform(scrollYProgress, [inputStart, inputEnd], [0.98, 1]);

  /* The border takes its institution's colour as the seek head reaches it, then
     fades back to a dim tint as the head travels on to the next school — so
     only the node the seek is currently at reads as fully lit, rather than
     every passed node staying vibrant. The last one has nowhere to hand off to,
     so it stays lit to the end. Border only — no glow around the box. */
  const lit = Math.max(0.0001, crossAt);
  const hasNext = typeof nextCrossAt === "number" && nextCrossAt > lit;
  const borderColor = useTransform(
    scrollYProgress,
    hasNext ? [lit - 0.0001, lit, nextCrossAt] : [lit - 0.0001, lit],
    hasNext
      ? ["#2a2a2a", edu.brandColor, dimmed(edu.brandColor)]
      : ["#2a2a2a", edu.brandColor]
  );

  return (
    <motion.div className="flex flex-col items-center w-64 relative" style={{ scale }}>
      <motion.div
        ref={logoRef}
        style={{ borderColor }}
        className="w-16 h-16 xl:w-20 xl:h-20 bg-[#0C0C0B] border rounded flex items-center justify-center mb-8 [@media(max-height:640px)]:mb-4 relative z-10 overflow-hidden"
      >
        <motion.div style={{ opacity }} className="w-full h-full flex items-center justify-center">
          {edu.logoImage ? (
            <img src={edu.logoImage} alt={edu.institution}
              className={`${edu.logoScale} object-contain ${edu.logoFilter}`} />
          ) : (
            <span className="text-[#666] font-['Outfit'] font-bold text-[10px] xl:text-xs">
              {edu.logoText}
            </span>
          )}
        </motion.div>
      </motion.div>
      <motion.div style={{ opacity }} className="text-center mt-6 [@media(max-height:640px)]:mt-3 flex flex-col gap-2 [@media(max-height:640px)]:gap-1">
        <h3 className="text-xs xl:text-sm font-bold font-['Outfit'] tracking-wide text-[#e0e0e0] uppercase leading-relaxed">
          {edu.institution}
        </h3>
        <p className="text-[#a3a3a3] text-xs xl:text-sm font-light">{edu.program}</p>
        <span className="text-[10px] xl:text-xs text-[#666] tracking-widest mt-1">{edu.year}</span>
      </motion.div>
    </motion.div>
  );
}

// ─── Main ───
export function EducationTimeline() {
  const desktopRef = useRef(null);
  const mobileRef  = useRef(null);
  const rowsRef    = useRef(null);   // ref on the flex column so we can measure row positions

  // trackHeight = pixel distance between the centre of the first dot and the centre of the last dot.
  // We measure it after render (and on resize) so text-wrapping doesn't throw off the line.
  const [trackHeight, setTrackHeight] = useState(0);

  useEffect(() => {
    function measure() {
      if (!rowsRef.current) return;
      const rows = Array.from(rowsRef.current.children);
      if (rows.length < 2) return;
      const containerTop = rowsRef.current.getBoundingClientRect().top;
      // Distance from top of first row to top of last row = distance between dot centres
      // (both dots have the same DOT_CENTER_FROM_TOP offset within their row)
      const lastRowTop = rows[rows.length - 1].getBoundingClientRect().top - containerTop;
      setTrackHeight(lastRowTop);
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (rowsRef.current) ro.observe(rowsRef.current);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: desktopRef,
    offset: ["start start", "end end"],
  });

  const { scrollYProgress: mobileProgress } = useScroll({
    target: rowsRef,
    offset: ["start 65%", "end 65%"],
  });

  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  /* ── Desktop seek line ─────────────────────────────────────────────────────
     The line and its glow are plain white. The colour coding lives on the logo
     box borders instead: each one takes its institution's colour as the seek
     head reaches it.

     The crossing points have to land on the logo centres, which are inset from
     the track's ends (each node is a w-64 box under justify-between). Measured
     rather than hardcoded so they stay locked to the logos at any window width. */
  const trackRef = useRef(null);
  const logoRefs = useRef([]);
  // Fallbacks are the geometry at a typical desktop width, so the first paint
  // before measurement is already close rather than visibly wrong.
  const [stops, setStops] = useState([0.107, 0.369, 0.631, 0.893]);

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      const tr = track.getBoundingClientRect();
      if (!tr.width) return;
      const next = logoRefs.current.map((el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return (r.left + r.width / 2 - tr.left) / tr.width;
      });
      if (next.every((v) => typeof v === "number")) setStops(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Line left offset: centre of the 14px dot = 6px
  const LINE_LEFT = DOT_PX / 2 - 1; // 6px (puts the 2px line centred under the dot)

  return (
    <section id="education" className="w-full bg-[#0C0C0B] relative z-20 text-white border-t border-white/[0.05]">

      {/* ── MOBILE: Animated vertical timeline ── */}
      <div ref={mobileRef} className="lg:hidden flex flex-col px-6 md:px-12 py-10 md:py-16">

        {/* Header */}
        <div className="flex flex-col gap-3 mb-16">
          <span className="font-['Outfit'] font-semibold text-[10px] tracking-[0.25em] text-[#a3a3a3] uppercase">
            <ScrambleLabel text="EDUCATION / 02" />
          </span>
          <h2 className="font-monument text-[28px] sm:text-[36px] md:text-[42px] font-bold leading-[1.08] text-[#f4f4f4] tracking-[0.03em] uppercase">
            LEARNING CURVE
          </h2>
          <p className="font-['Outfit'] text-[12px] md:text-[14px] leading-[1.8] font-medium tracking-[0.15em] text-[#8a8a8a] max-w-[400px] uppercase">
            ACADEMIC FOUNDATIONS IN BUSINESS STRATEGY, DIGITAL MARKETING, AND GLOBAL LEADERSHIP.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">

          {/* Gray background track — starts at first dot centre, height = measured distance to last dot centre */}
          {trackHeight > 0 && (
            <div
              className="absolute w-[2px] bg-[#222] z-0"
              style={{
                left: LINE_LEFT,
                top: DOT_CENTER_FROM_TOP,
                height: trackHeight,
              }}
            />
          )}

          {/* Animated green fill — same position/height, scaleY grows from top */}
          {trackHeight > 0 && (
            <motion.div
              className="absolute w-[2px] bg-[#16a34a] origin-top z-0 shadow-[0_0_10px_#16a34a]"
              style={{
                left: LINE_LEFT,
                top: DOT_CENTER_FROM_TOP,
                height: trackHeight,
                scaleY: mobileProgress,
              }}
            />
          )}

          {/* Rows — [dot] [card] inline so each dot is always next to its school */}
          <div ref={rowsRef} className="relative z-10 flex flex-col gap-14">
            {educationData.map((edu, index) => {
              const threshold = index / (educationData.length - 1);
              return (
                <div key={edu.id} className="flex flex-row items-start" style={{ gap: 24 }}>
                  <FillDot mobileProgress={mobileProgress} threshold={threshold} />
                  <MobileCard edu={edu} mobileProgress={mobileProgress} threshold={threshold} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── DESKTOP: Pinned horizontal scroll ── */}
      <div ref={desktopRef} className="max-lg:hidden w-full relative" style={{ height: "250vh" }}>
        <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden px-6 md:px-16 xl:px-24">

          {/* In flow rather than `absolute top-24`: pinned to the top while the
              timeline below was centred by this flex container, the two were
              positioned by different mechanisms, so on a short viewport the
              centred timeline rose into the fixed header and they overlapped.
              Both are laid out by `justify-center` now, so the gap between them
              compresses instead. The container's own px matches the `left-16
              xl:left-24` this replaces, so the x position is unchanged. */}
          <div className="relative flex flex-col gap-4 max-w-2xl z-10">
            <span className="font-['Outfit'] font-semibold text-[11px] tracking-[0.25em] text-[#a3a3a3] uppercase">
              EDUCATION / 02
            </span>
            <h2 className="font-monument text-[28px] sm:text-[36px] md:text-[42px] xl:text-[50px] font-bold leading-[1.08] text-[#f4f4f4] tracking-[0.03em] uppercase max-w-[760px]">
              LEARNING CURVE
            </h2>
            <p className="font-['Outfit'] text-[12px] md:text-[14px] leading-[1.8] font-medium tracking-[0.15em] text-[#8a8a8a] max-w-[500px] uppercase mt-2">
              ACADEMIC FOUNDATIONS IN BUSINESS STRATEGY, DIGITAL MARKETING, AND GLOBAL LEADERSHIP.
            </p>
          </div>

          {/* The vertical rhythm is fixed, so on a short viewport the stack
              (header + gap + 256px block) overran the sticky container and its
              overflow-hidden clipped the node labels. Below 640px tall the gap
              and the block tighten so the whole thing still fits. */}
          <div ref={trackRef} className="relative w-full max-w-[120rem] mx-auto mt-16 xl:mt-24 [@media(max-height:640px)]:!mt-8 h-64 [@media(max-height:640px)]:h-52 flex items-center">
            <div className="absolute left-0 right-0 top-[32px] xl:top-[40px] h-[1px] bg-[#222] z-0 -translate-y-1/2" />
            <motion.div
              className="absolute left-0 top-[32px] xl:top-[40px] h-[2px] bg-white z-10 origin-left shadow-[0_0_15px_#fff] -translate-y-1/2"
              style={{ width: progressWidth }}
            />
            <div className="relative z-20 w-full flex justify-between items-start">
              {educationData.map((edu, index) => (
                <DesktopNode
                  key={edu.id}
                  edu={edu}
                  index={index}
                  total={educationData.length}
                  scrollYProgress={scrollYProgress}
                  crossAt={stops[index]}
                  nextCrossAt={stops[index + 1]}
                  logoRef={(el) => { logoRefs.current[index] = el; }}
                />
              ))}
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
