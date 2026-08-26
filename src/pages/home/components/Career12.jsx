import React, { useRef, useEffect } from 'react';
import { useLenis } from 'lenis/react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ScrambleLabel } from "../../../components/ScrambleLabel";
import { ExperienceCard } from "./ExperienceCard";
import { experiences } from "./experiences";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] }
  }
};

export function Career12() {

  /* Mobile has no hover, and colouring every card at rest was a wall of colour
     with no hierarchy. Instead each card carries a --live value from 0 to 1:
     it fades in as the card slides up into place, sits at 1 while the card is
     the one you're actually reading, and fades back out as the next card slides
     up over it. The CSS in index.css mixes the brand colour by that amount.

     Written straight to the DOM node as a custom property rather than held in
     state — this updates every scroll frame, and re-rendering ten cards that
     often would be wasteful. */
  const cardRefs = useRef([]);

  /* Tapping an index tab jumps to that card.
     Lenis owns scrolling on this site, so the jump goes through its instance —
     window.scrollTo gets fought or desyncs it outright. */
  const lenis = useLenis();

  const jumpToCard = (i) => {
    const els = cardRefs.current.filter(Boolean);
    const el = cardRefs.current[i];
    if (!el || !els.length) return;

    /* Where this card would sit if it were not sticky. A stuck card reports its
       PINNED position, so the only honest read is to drop sticky for one
       synchronous measure and put it straight back — no paint happens in
       between, so nothing flickers.

       Measured here rather than cached: a cache taken on mount or resize goes
       stale as soon as layout settles (card heights change with width), which
       landed jumps ~24px off. One reflow per click is not worth being wrong. */
    const prev = els.map((e) => e.style.position);
    els.forEach((e) => { e.style.position = "static"; });
    const flow = el.getBoundingClientRect().top + window.scrollY;
    els.forEach((e, n) => { e.style.position = prev[n] || ""; });

    // scroll to the point where this card has just become the front of the stack
    const stickyTop = parseFloat(getComputedStyle(el).top) || 0;
    const target = Math.max(0, flow - stickyTop);
    if (lenis) lenis.scrollTo(target, { duration: 1.05 });
    else window.scrollTo({ top: target, behavior: "smooth" });
  };

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    let raf = 0;
    let front = -1;

    /* Each card's sticky top, cached. Front-of-stack detection needs it every
       frame, and getComputedStyle on ten cards per frame is not worth paying
       when the value only changes with the viewport. */
    let stickyTops = [];
    const readTops = () => {
      stickyTops = cardRefs.current.map((el) =>
        el ? parseFloat(getComputedStyle(el).top) || 0 : 0);
    };

    const apply = () => {
      raf = 0;
      const vh = window.innerHeight;
      const els = cardRefs.current;
      const mobile = mq.matches;

      /* Self-heal: on the first frames the refs may not be attached yet, which
         leaves the cache zeroed and makes every card look "stuck" — the front
         then resolves one card early. Re-read until the values are real. */
      if (stickyTops.length !== els.length || stickyTops.some((v) => !v)) readTops();

      /* The last card that has reached its sticky position is the one on top of
         the pile. This drives the lit index tab, so unlike --live it has to run
         at every width, not just mobile. */
      let nextFront = 0;

      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= (stickyTops[i] || 0) + 1) nextFront = i;

        if (!mobile) { el.style.removeProperty("--live"); continue; }
        // rises into place
        const fadeIn = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.55)));
        // and is covered by the next card sliding over it. The deadzone matters:
        // stacked cards sit ~20px apart, so without it a fully covered card kept
        // roughly 9% of its colour and the section never went properly neutral.
        const next = els[i + 1];
        const uncovered = next ? next.getBoundingClientRect().top - r.top : vh;
        const dead = r.height * 0.14;
        const fadeOut = Math.min(1, Math.max(0, (uncovered - dead) / (r.height * 0.5)));
        const live = Math.min(fadeIn, fadeOut);
        el.style.setProperty("--live", live.toFixed(3));
      }

      // touch the DOM only when the front actually changes, not every frame
      if (nextFront !== front) {
        if (els[front]) els[front].classList.remove("is-front");
        if (els[nextFront]) els[nextFront].classList.add("is-front");
        front = nextFront;
      }
    };

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };
    const onResize = () => { readTops(); onScroll(); };
    readTops();
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);


  return (
    <section id="experience" className="w-full px-6 md:px-12 lg:px-16 pt-8 md:pt-12 pb-10 md:pb-16 lg:pb-20 relative z-20 bg-[#0C0C0B] border-t border-white/[0.05]">
      <div className="max-w-[120rem] mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px 0px -20% 0px" }}
          variants={containerVariants}
          className="flex flex-col lg:flex-row gap-16 lg:gap-24"
        >
          
          {/* Left: Section Header */}
          <motion.div variants={itemVariants} className="w-full lg:w-[35%] flex flex-col gap-6 md:gap-8 justify-start lg:sticky lg:top-[15vh] h-fit">
            <div className="flex flex-col gap-3 md:gap-4">
              <span className="font-['Outfit'] font-semibold text-[10px] md:text-[11px] tracking-[0.25em] text-[#a3a3a3] uppercase">
                <ScrambleLabel text="EXPERIENCE / 03" />
              </span>
              <h3 className="font-monument text-[34px] md:text-[46px] lg:text-[54px] font-bold leading-[1.05] text-[#f4f4f4] tracking-[0.03em] uppercase">
                EXECUTION ARCHIVE
              </h3>
            </div>
            
            <p className="font-['Outfit'] text-[12px] md:text-[14px] leading-[1.8] font-medium tracking-[0.15em] text-[#8a8a8a] max-w-[400px] uppercase mb-6">
              A TRACK RECORD OF IMPACT ACROSS MARKETING, CORPORATE STRATEGY, AND LEADERSHIP ROLES.
            </p>

            <Link 
              to="/work-sample"
              className="group relative flex items-center justify-center gap-3 w-fit px-8 py-3.5 bg-white text-black rounded-full overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:bg-gray-100 hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] cursor-pointer"
            >
              <span className="relative z-10 font-['Outfit'] text-[11px] tracking-[0.2em] font-bold uppercase transition-colors">
                View Work Samples
              </span>
              <span className="relative z-10 transition-all duration-300 group-hover:translate-x-1 font-bold">
                →
              </span>
            </Link>
          </motion.div>
          
          {/* Right: Experience List */}
          {/* Trailing space after the last card. 25vh was sized for the old
              deeper stack; with the shallower mobile offsets it left a large
              empty run before the skills section. */}
          {/* --stack-gaps feeds the derived --stack-step in index.css. Taken from
              the data rather than hardcoded, so adding or removing a role
              re-divides the fan instead of silently overshooting the fold. */}
          <div
            className="w-full lg:w-[60%] flex flex-col relative pb-[6vh] lg:pb-[25vh]"
            style={{
              "--stack-gaps": Math.max(1, experiences.length - 1),
              /* Index tabs divide the card's width between them, so they need
                 the count too — same reason: adding a role re-divides the row
                 instead of overflowing it. */
              "--tab-count": experiences.length,
            }}
          >
            {experiences.map((exp, index) => (
              <ExperienceCard
                key={index}
                exp={exp}
                index={index}
                cardRef={(el) => { cardRefs.current[index] = el; }}
                variants={itemVariants}
                onJump={jumpToCard}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
