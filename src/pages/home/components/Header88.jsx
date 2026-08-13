import React, { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { ChevronDown } from "lucide-react";

const MapleLeaf = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12.051 0L9.444 6.78l-5.637-.626 2.656 5.864-6.463 2.112 7.027 3.328-1.503 3.972 6.012-1.922.385 4.492h1.493l.4-4.524 6.014 1.954-1.542-4.004 7.085-3.328-6.495-2.112 2.673-5.864-5.67.626L12.051 0z" />
  </svg>
);

const CYCLE_PHRASES = [
  "RUNNING CAMPAIGNS",
  "BUILDING BRANDS",
  "OPERATING GLOBAL EVENTS",
  "DECODING ANALYTICS",
  "CRAFTING CONTENT"
];
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ•/—";

// Isolated so the animation ticks don't re-render the whole hero
function ScrambleCycler({ reduced }) {
  const [display, setDisplay] = useState(CYCLE_PHRASES[0]);

  useEffect(() => {
    let idx = 0;
    let timer;

    const scrambleTo = (text) => {
      let progress = 0;
      const total = text.length + 8;
      const step = () => {
        progress++;
        const resolved = Math.floor((progress / total) * text.length);
        let out = "";
        for (let i = 0; i < text.length; i++) {
          out += i < resolved || text[i] === " "
            ? text[i]
            : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
        setDisplay(out);
        timer = progress < total ? setTimeout(step, 35) : setTimeout(next, 3200);
      };
      step();
    };

    const next = () => {
      idx = (idx + 1) % CYCLE_PHRASES.length;
      if (reduced) {
        setDisplay(CYCLE_PHRASES[idx]);
        timer = setTimeout(next, 4000);
      } else {
        scrambleTo(CYCLE_PHRASES[idx]);
      }
    };

    timer = setTimeout(next, 3200);
    return () => clearTimeout(timer);
  }, [reduced]);

  return <span>{display}</span>;
}

export function Header88() {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  // Mobile: name block drifts up + fades as you scroll away from the hero
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const nameY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const nameOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  // Mobile: name lines counter-shift with the phone's physical tilt (gyroscope)
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const tiltSpring = { stiffness: 60, damping: 16, mass: 0.6 };
  const tiltLine1 = useSpring(useTransform(tiltX, [-30, 30], [-12, 12]), tiltSpring);
  const tiltLine2 = useSpring(useTransform(tiltX, [-30, 30], [16, -16]), tiltSpring);
  const tiltLine3 = useSpring(useTransform(tiltX, [-30, 30], [-9, 9]), tiltSpring);
  const tiltLift = useSpring(useTransform(tiltY, [-20, 20], [-6, 6]), tiltSpring);

  useEffect(() => {
    if (isReducedMotion) return;

    const handleTilt = (e) => {
      if (e.gamma == null) return;
      tiltX.set(Math.max(-30, Math.min(30, e.gamma)));
      // beta ~45° is how a phone is naturally held; react to deviation from that
      tiltY.set(Math.max(-20, Math.min(20, (e.beta ?? 45) - 45)));
    };

    const attach = () => window.addEventListener("deviceorientation", handleTilt);
    let requestOnTouch;

    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      // iOS: motion access needs a user gesture — request on the first tap
      requestOnTouch = () => {
        window.removeEventListener("touchend", requestOnTouch);
        DeviceOrientationEvent.requestPermission()
          .then((state) => { if (state === "granted") attach(); })
          .catch(() => {});
      };
      window.addEventListener("touchend", requestOnTouch);
    } else {
      attach();
    }

    return () => {
      window.removeEventListener("deviceorientation", handleTilt);
      if (requestOnTouch) window.removeEventListener("touchend", requestOnTouch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReducedMotion]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: isReducedMotion ? 0 : 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
    }
  };

  // Mobile name lines rise out of an overflow mask, staggered per line
  const lineReveal = {
    hidden: { y: isReducedMotion ? "0%" : "115%" },
    visible: (i) => ({
      y: "0%",
      transition: { duration: 1.15, ease: [0.16, 1, 0.3, 1], delay: 0.35 + i * 0.14 }
    })
  };

  // Ambient shimmer for mobile (no hover on touch, so it plays on its own)
  const shimmerStyle = {
    backgroundImage: "linear-gradient(90deg, #f4f4f4 0%, #ffffff 35%, #6b6b6b 50%, #ffffff 65%, #f4f4f4 100%)",
    backgroundSize: "250% auto",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent"
  };
  const shimmerAnimate = isReducedMotion
    ? {}
    : { backgroundPosition: ["250% center", "-250% center"] };
  const shimmerTransition = { duration: 9, ease: "linear", repeat: Infinity, repeatDelay: 2.5 };

  const outlineStyle = {
    WebkitTextStroke: "1.5px #f4f4f4",
    color: "transparent"
  };

  return (
    <motion.section
      ref={heroRef}
      id="home"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative w-full min-h-[100svh] bg-[#0C0C0B] text-[#f4f4f4] flex flex-col overflow-hidden selection:bg-gray-800 selection:text-white pt-24 md:pt-32"
    >
      {/* ================= MOBILE HERO (poster layout) ================= */}

      {/* Ghost outline ticker, sliced by the marquee band */}
      <div aria-hidden="true" className="md:hidden absolute bottom-1 left-0 w-full overflow-hidden pointer-events-none select-none">
        <motion.div
          className="font-monument whitespace-nowrap leading-none text-[30vw] w-max pt-[0.08em]"
          style={{ WebkitTextStroke: "1px rgba(244,244,244,0.09)", color: "transparent" }}
          animate={isReducedMotion ? {} : { x: ["0%", "-50%"] }}
          transition={{ duration: 70, ease: "linear", repeat: Infinity }}
        >
          <span>PORTFOLIO — N° 001 — </span>
          <span>PORTFOLIO — N° 001 — </span>
        </motion.div>
      </div>

      <div className="md:hidden flex-1 flex flex-col justify-center w-full relative z-10 pb-6">

        {/* Cycling status line, pinned under the navbar */}
        <motion.div variants={itemVariants} className="absolute top-0 left-0 w-full px-5 flex items-center justify-between font-['Outfit'] text-[8.5px] tracking-[0.18em] text-gray-500 uppercase">
          <span>CURRENTLY</span>
          <ScrambleCycler reduced={isReducedMotion} />
        </motion.div>

        {/* Spec-sheet header row */}
        <motion.div variants={itemVariants} className="px-5 flex items-end justify-between font-['Outfit'] font-semibold text-[8.5px] tracking-[0.22em] text-gray-400 uppercase">
          <span>N° 001 — PORTFOLIO</span>
          <span>B.MGMT HONS • UBC ’25</span>
        </motion.div>
        <motion.div variants={itemVariants} className="mx-5 mt-3 border-t border-white/[0.08]" />

        {/* Full-bleed stacked name */}
        <motion.div style={{ y: nameY, opacity: nameOpacity }} className="mt-7 px-4">
          <motion.h1 style={{ y: tiltLift }} className="font-monument m-0 p-0 leading-[0.98] tracking-normal cursor-default">
            <motion.span style={{ x: tiltLine1 }} className="block overflow-hidden pb-[0.06em]">
              <motion.span custom={0} variants={lineReveal} initial="hidden" animate="visible" className="block will-change-transform">
                <motion.span
                  className="block text-[12.8vw]"
                  style={shimmerStyle}
                  animate={shimmerAnimate}
                  transition={shimmerTransition}
                >
                  AKSHATH
                </motion.span>
              </motion.span>
            </motion.span>
            <motion.span style={{ x: tiltLine2 }} className="block overflow-hidden pb-[0.06em]">
              <motion.span custom={1} variants={lineReveal} initial="hidden" animate="visible" className="block will-change-transform">
                <span className="block text-[17.8vw]" style={outlineStyle}>
                  DAYAN
                </span>
              </motion.span>
            </motion.span>
            <motion.span style={{ x: tiltLine3 }} className="block overflow-hidden pb-[0.1em]">
              <motion.span custom={2} variants={lineReveal} initial="hidden" animate="visible" className="block will-change-transform">
                <motion.span
                  className="block text-[15vw]"
                  style={shimmerStyle}
                  animate={shimmerAnimate}
                  transition={shimmerTransition}
                >
                  SURESH
                </motion.span>
              </motion.span>
            </motion.span>
          </motion.h1>
        </motion.div>

        {/* Bottom rule */}
        <motion.div variants={itemVariants} className="mx-5 mt-7 border-t border-white/[0.08]" />

        {/* Roles */}
        <motion.div variants={itemVariants} className="px-5 mt-4 font-['Outfit'] text-[9px] tracking-[0.22em] text-gray-300 uppercase leading-[2.1]">
          DIGITAL MARKETING • EVENT OPERATIONS<br />BRAND STRATEGY
        </motion.div>

        {/* Location */}
        <motion.div variants={itemVariants} className="px-5 mt-4 font-['Outfit'] text-[9px] tracking-[0.2em] text-gray-200 uppercase flex items-center gap-2">
          BASED IN TORONTO, CANADA
          <MapleLeaf className="w-3.5 h-3.5 text-[#ef4444] drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]" />
        </motion.div>

        {/* Badge + scroll cue */}
        <div className="px-5 mt-6 flex items-center justify-between">
          <motion.div variants={itemVariants} className="flex items-center gap-2 border border-[#166534] rounded-full px-3 py-1 bg-transparent shadow-[0_0_15px_rgba(34,197,94,0.2)] cursor-default">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
            <span className="font-['Outfit'] text-[9px] uppercase tracking-widest text-[#22c55e] pt-[1px]">AVAILABLE FOR WORK</span>
          </motion.div>
          <motion.div variants={itemVariants} className="font-['Outfit'] text-[9px] tracking-[0.2em] text-gray-300 uppercase flex items-center gap-2 cursor-default drop-shadow-[0_0_8px_rgba(209,213,219,0.5)]">
            SCROLL
            <div className="flex flex-col -space-y-1.5 pt-0.5">
              {[0, 0.2, 0.4].map((delay) => (
                <motion.div
                  key={delay}
                  animate={isReducedMotion ? {} : { opacity: [0.1, 1, 0.1], y: [0, 2, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay }}
                >
                  <ChevronDown className="w-3.5 h-3.5" strokeWidth={2.5} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ================= DESKTOP HERO (unchanged) ================= */}
      {/* Main Content Area */}
      <div className="hidden md:flex flex-1 flex-col justify-center px-6 md:px-12 lg:px-16 w-full max-w-[120rem] mx-auto relative z-10">

        {/* Role Label */}
        <motion.div variants={itemVariants} className="font-['Outfit'] text-[9px] md:text-[11px] tracking-[0.2em] text-gray-300 uppercase mb-4 md:mb-6">
          DIGITAL MARKETING • EVENT OPERATIONS • BRAND STRATEGY
        </motion.div>

        {/* Massive Name */}
        <motion.h1
          variants={itemVariants}
          className="font-monument text-[10vw] md:text-[8vw] leading-[1.05] m-0 p-0 tracking-normal cursor-default z-10"
        >
          <motion.span
            className="block mb-1 md:mb-2 bg-clip-text"
            style={{
              backgroundImage: "linear-gradient(90deg, #f4f4f4 0%, #ffffff 30%, #555555 50%, #ffffff 70%, #f4f4f4 100%)",
              backgroundSize: "200% auto"
            }}
            initial={{ backgroundPosition: "200% center", color: "#f4f4f4" }}
            whileHover={{
              color: "rgba(244, 244, 244, 0)",
              backgroundPosition: "-200% center",
              transition: {
                backgroundPosition: { duration: 3, ease: "linear", repeat: Infinity },
                color: { duration: 0.4 }
              }
            }}
          >
            <span className="block md:inline mb-1 md:mb-0">AKSHATH</span><span className="block md:inline">DAYAN</span>
          </motion.span>
          <motion.span
            className="block bg-clip-text"
            style={{
              backgroundImage: "linear-gradient(90deg, #f4f4f4 0%, #ffffff 30%, #555555 50%, #ffffff 70%, #f4f4f4 100%)",
              backgroundSize: "200% auto"
            }}
            initial={{ backgroundPosition: "200% center", color: "#f4f4f4" }}
            whileHover={{
              color: "rgba(244, 244, 244, 0)",
              backgroundPosition: "-200% center",
              transition: {
                backgroundPosition: { duration: 3, ease: "linear", repeat: Infinity },
                color: { duration: 0.4 }
              }
            }}
          >
            SURESH
          </motion.span>
        </motion.h1>

        {/* Education Metadata */}
        <motion.div variants={itemVariants} className="mt-5 md:mt-6">
          <p className="font-['Outfit'] font-semibold text-[9.5px] md:text-[11px] tracking-[0.25em] text-[#f4f4f4] opacity-80 uppercase">
            B.MGMT HONOURS • UBC ’25
          </p>
        </motion.div>

      </div>

      {/* Bottom Information Grid */}
      <div className="hidden px-6 md:px-12 lg:px-16 w-full max-w-[120rem] mx-auto pb-8 md:pb-10 md:flex flex-col md:flex-row justify-between items-start md:items-end gap-10 md:gap-8 relative z-10">

        {/* Left Side: Positioning & Location */}
        <div className="flex flex-col gap-6 md:gap-10 max-w-[45%] min-w-[300px]">
          <motion.p variants={itemVariants} className="font-['Outfit'] text-[10px] md:text-[12px] leading-[1.8] text-gray-300 uppercase tracking-widest">
            BUSINESS MANAGEMENT GRADUATE WITH EXPERIENCE ACROSS DIGITAL MARKETING, GLOBAL EVENTS, DIGITAL CAMPAIGNS, MARKETING ANALYTICS, AND BRAND STRATEGY.
          </motion.p>
          <motion.div variants={itemVariants} className="font-['Outfit'] text-[9px] md:text-[11px] tracking-[0.2em] text-gray-200 uppercase flex items-center gap-2">
            BASED IN TORONTO, CANADA
            <MapleLeaf className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#ef4444] drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]" />
          </motion.div>
        </div>

        {/* Right Side: Availability Badge & Scroll Cue */}
        <div className="flex flex-col items-start md:items-end gap-6 md:gap-10">
          {/* Badge */}
          <motion.div variants={itemVariants} className="flex items-center gap-2 md:gap-3 border border-[#166534] rounded-full px-3 py-1 md:px-4 md:py-1.5 bg-transparent shadow-[0_0_15px_rgba(34,197,94,0.2)] hover:shadow-[0_0_25px_rgba(34,197,94,0.35)] transition-shadow duration-500 cursor-default">
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
            <span className="font-['Outfit'] text-[9px] md:text-[10px] uppercase tracking-widest text-[#22c55e] pt-[1px] md:pt-[2px]">AVAILABLE FOR WORK</span>
          </motion.div>
          {/* Scroll Cue */}
          <motion.div variants={itemVariants} className="font-['Outfit'] text-[9px] md:text-[11px] tracking-[0.2em] text-gray-300 uppercase flex items-center gap-2 cursor-default drop-shadow-[0_0_8px_rgba(209,213,219,0.5)]">
            SCROLL TO ENTER PORTFOLIO
            <div className="flex flex-col -space-y-1.5 md:-space-y-2 pt-0.5">
              {/* Top Arrow */}
              <motion.div
                animate={isReducedMotion ? {} : { opacity: [0.1, 1, 0.1], y: [0, 2, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0 }}
              >
                <ChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={2.5} />
              </motion.div>

              {/* Middle Arrow */}
              <motion.div
                animate={isReducedMotion ? {} : { opacity: [0.1, 1, 0.1], y: [0, 2, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.2 }}
              >
                <ChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={2.5} />
              </motion.div>

              {/* Bottom Arrow */}
              <motion.div
                animate={isReducedMotion ? {} : { opacity: [0.1, 1, 0.1], y: [0, 2, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.4 }}
              >
                <ChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={2.5} />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Marquee Ticker */}
      <motion.div variants={itemVariants} className="relative w-full border-y border-white/[0.08] py-2.5 md:py-3 overflow-hidden flex bg-[#0C0C0B] group">
        <div className="flex font-['Outfit'] text-[9px] md:text-[11px] tracking-[0.25em] text-gray-400 uppercase animate-marquee whitespace-nowrap w-max group-hover:[animation-play-state:paused]">
          <span>INTEGRATED MARKETING • EVENT OPERATIONS • DIGITAL CAMPAIGNS • MARKETING ANALYTICS • BRAND STRATEGY • SOCIAL MEDIA MARKETING • CONTENT STRATEGY • POWER BI • GOOGLE ANALYTICS • EVENT COORDINATION • STAKEHOLDER COMMUNICATION • CONSUMER INSIGHTS • SEO/SEM • CAMPAIGN STRATEGY • CROSS-FUNCTIONAL COLLABORATION • CREATIVE EXECUTION • PROJECT COORDINATION • COPYWRITING • CONTENT MARKETING • MARKETING COMMUNICATIONS •&nbsp;</span>
          <span>INTEGRATED MARKETING • EVENT OPERATIONS • DIGITAL CAMPAIGNS • MARKETING ANALYTICS • BRAND STRATEGY • SOCIAL MEDIA MARKETING • CONTENT STRATEGY • POWER BI • GOOGLE ANALYTICS • EVENT COORDINATION • STAKEHOLDER COMMUNICATION • CONSUMER INSIGHTS • SEO/SEM • CAMPAIGN STRATEGY • CROSS-FUNCTIONAL COLLABORATION • CREATIVE EXECUTION • PROJECT COORDINATION • COPYWRITING • CONTENT MARKETING • MARKETING COMMUNICATIONS •&nbsp;</span>
        </div>
      </motion.div>
    </motion.section>
  );
}
