import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useLenis } from 'lenis/react';
import { EASE } from './motion';

/* ─── Precision dial ─────────────────────────────────────────────────────────
   Original geometry: a graduated bezel, an engine-turned ground, concentric
   calibration rings, and six milestone marks — one per section of the page.

   It is an instrument for coordinating time, which is what this page is about.
   Explicitly NOT a watch: no case, no crown, no lugs, no date window, nothing
   traced from a product. The resemblance stops at "round thing that measures
   time", which is geometry rather than anyone's brand.

   IT IS A CONTROL, NOT AN ORNAMENT
   The first version was decoration that happened to move when you scrolled,
   which is the worst of both — it drew the eye and then did nothing with it.
   Now every milestone is a real button: pointing at one swings the hand round
   to it and names the section in the middle of the dial, and activating it
   scrolls there. The dial is the table of contents for the whole document.

   MOTION
   The entrance plays once, on load, and never again. Nothing here is
   scroll-linked. A dial that spins as you scroll turns a precision instrument
   into a fidget toy, and it kept moving while you were trying to read. After
   the entrance the only thing that ever moves is the hand, and it moves only
   because someone pointed at a milestone. */

const CX = 130;
const CY = 130;
const TAU = Math.PI * 2;
const circumference = (r) => TAU * r;

/* 48 graduations, every fourth drawn long — the way a calibrated scale
   distinguishes major from minor divisions. */
const TICKS = Array.from({ length: 48 }, (_, i) => {
  const angle = (i / 48) * TAU - Math.PI / 2;
  const major = i % 4 === 0;
  return {
    i,
    major,
    x1: CX + Math.cos(angle) * (major ? 112 : 117),
    y1: CY + Math.sin(angle) * (major ? 112 : 117),
    x2: CX + Math.cos(angle) * 122,
    y2: CY + Math.sin(angle) * 122,
  };
});

/* Guilloché — the engine-turned ground of a dial, as 120 radiating hairlines.
   Precomputed once at module scope rather than per render. */
const GUILLOCHE = Array.from({ length: 120 }, (_, i) => {
  const a = (i / 120) * TAU;
  return {
    i,
    x1: CX + Math.cos(a) * 24,
    y1: CY + Math.sin(a) * 24,
    x2: CX + Math.cos(a) * 106,
    y2: CY + Math.sin(a) * 106,
  };
});

/* ── What the markers point at ───────────────────────────────────────────────
   The six markers are the six SECTIONS of the page, not the six workstreams
   inside System / 01. That was the earlier mapping and it was the wrong one:
   the dial sits at the top of the document, so a reader takes it as a map of
   the whole thing — and it quietly sent all six markers into the same section.

   Six sections, six markers, 60° apart. The dial is now literally the table of
   contents, and every marker lands somewhere different.

   `target` must match a real element id. Verified against the DOM: hero,
   launch-control, client-activation, retail-readiness, activation-recap,
   evidence, closing. */
const SECTIONS = [
  { id: 'launch-control',    num: '01', name: 'Launch control' },
  { id: 'client-activation', num: '02', name: 'Client activation' },
  { id: 'retail-readiness',  num: '03', name: 'Retail readiness' },
  { id: 'activation-recap',  num: '04', name: 'Post-activation recap' },
  { id: 'evidence',          num: '05', name: 'Evidence' },
  { id: 'closing',           num: '06', name: 'Precision' },
];

const MARKS = SECTIONS.map((s, i) => {
  const angle = (i / SECTIONS.length) * TAU - Math.PI / 2;
  return {
    ...s,
    deg: i * (360 / SECTIONS.length),
    x: CX + Math.cos(angle) * 88,
    y: CY + Math.sin(angle) * 88,
  };
});

export function PrecisionHero() {
  const lenis = useLenis();
  /* Which milestone the pointer or keyboard is on. null = at rest, hand parked
     at the launch point. */
  const [active, setActive] = useState(null);

  const activeMark = active === null ? null : MARKS[active];
  const handDeg = activeMark ? activeMark.deg : 0;

  const scrollToSystem = useCallback(() => {
    const target = document.getElementById('launch-control');
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { duration: 1.15 });
    else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [lenis]);

  /* Each marker scrolls to its own section. Lenis owns scrolling site-wide, so
     this routes through it; window.scrollTo would fight the smooth-scroll
     engine and stutter. */
  const goTo = useCallback(
    (sectionId) => {
      const target = document.getElementById(sectionId);
      if (!target) return;
      if (lenis) lenis.scrollTo(target, { duration: 1.2 });
      else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [lenis]
  );

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative w-full min-h-[100vh] min-h-[100svh] flex items-center pt-28 pb-16 md:pt-32 md:pb-20"
    >
      <div aria-hidden="true" className="cw-wash" />

      <div className="max-w-[120rem] mx-auto w-full px-6 md:px-12 lg:px-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-20 items-center">
          {/* ── Copy ── */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.12 } },
            }}
            className="flex flex-col"
          >
            <motion.div
              variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
              className="flex flex-col gap-2 mb-8 md:mb-10"
            >
              {/* CHANEL is named textually, which an application study may do.
                  The wording carries the DIRECTION of the relationship, which is
                  the part that matters: "in application to" says this was
                  addressed to them. "For" or "prepared for" would have implied
                  a brief, and the footer disclaimer states the opposite. */}
              <span className="font-['Outfit'] font-semibold text-[12px] md:text-[13px] tracking-[0.17em] text-[var(--cw-muted)] uppercase">
                Application Study / 001
              </span>
              <span className="font-['Outfit'] text-[12px] md:text-[13px] tracking-[0.17em] text-[var(--cw-muted)] uppercase">
                Marketing &amp; Retail Coordination
              </span>
              <span className="font-['Outfit'] font-semibold text-[12px] md:text-[13px] tracking-[0.17em] text-[var(--cw-accent)] uppercase">
                Watches &amp; Fine Jewellery
              </span>
              <span className="font-['Outfit'] text-[12px] md:text-[13px] tracking-[0.17em] text-[var(--cw-muted)] uppercase mt-1">
                In application to CHANEL Canada
              </span>
            </motion.div>

            <motion.h1
              id="hero-heading"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } } }}
              className="cw-display cw-display--mast text-[30px] sm:text-[40px] md:text-[48px] xl:text-[58px] text-[var(--cw-ink)] max-w-[12ch]"
            >
              The work behind the moment.
            </motion.h1>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } } }}
              className="font-['Outfit'] text-[16px] md:text-[18px] leading-[1.75] text-[var(--cw-ink-2)] max-w-[520px] mt-8 md:mt-10"
            >
              A luxury launch is experienced in an instant. It is built through
              disciplined timelines, precise communication and hundreds of
              invisible decisions. I build the system behind that moment.
            </motion.p>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
              className="font-['Outfit'] text-[13px] md:text-[14px] tracking-[0.14em] text-[var(--cw-muted)] uppercase mt-6"
            >
              An independent operational concept by Akshathdayan Suresh.
            </motion.p>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
              className="mt-11 md:mt-14"
            >
              <a
                href="#launch-control"
                onClick={(e) => { e.preventDefault(); scrollToSystem(); }}
                className="group inline-flex items-center gap-4 font-['Outfit'] font-semibold text-[13px] md:text-[14px] tracking-[0.17em] uppercase text-[var(--cw-ink)] py-3"
              >
                Enter the system
                <span aria-hidden="true" className="relative block w-12 md:w-16 h-px bg-[var(--cw-line-strong)] overflow-hidden">
                  <span className="absolute inset-y-0 left-0 w-0 bg-[var(--cw-accent)] transition-[width] duration-500 ease-out group-hover:w-full group-focus-visible:w-full motion-reduce:transition-none" />
                </span>
              </a>
            </motion.div>
          </motion.div>

          {/* ── Dial ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
            className="relative order-last"
          >
            {/* Dial and buttons share one square box, so the buttons can be
                positioned as a percentage of the viewBox and stay locked to
                their marks at every size. */}
            <div className="relative w-full max-w-[260px] sm:max-w-[320px] lg:max-w-[420px] mx-auto aspect-square">
              <svg
                viewBox="0 0 260 260"
                aria-hidden="true"
                className="absolute inset-0 w-full h-full overflow-visible"
              >
                <g className="cw-guilloche">
                  {GUILLOCHE.map((g) => (
                    <line key={g.i} x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2} strokeWidth="0.4" />
                  ))}
                </g>

                <g>
                  {TICKS.map((t) => (
                    <line
                      key={t.i}
                      className={`cw-mark ${t.major ? 'cw-tick-major' : 'cw-tick-minor'}`}
                      style={{ '--cw-delay': `${420 + t.i * 9}ms` }}
                      x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
                      strokeWidth={t.major ? 1.3 : 0.8}
                      strokeLinecap="butt"
                    />
                  ))}
                </g>

                <circle
                  className="cw-ring cw-dial-outer"
                  style={{ '--cw-len': circumference(118), '--cw-delay': '0ms' }}
                  cx={CX} cy={CY} r={118} fill="none" strokeWidth="1"
                  transform={`rotate(-90 ${CX} ${CY})`}
                />
                <circle
                  className="cw-ring cw-dial-mid"
                  style={{ '--cw-len': circumference(88), '--cw-delay': '200ms' }}
                  cx={CX} cy={CY} r={88} fill="none" strokeWidth="1"
                  transform={`rotate(-90 ${CX} ${CY})`}
                />
                <circle
                  className="cw-ring cw-dial-inner"
                  style={{ '--cw-len': circumference(54), '--cw-delay': '360ms' }}
                  cx={CX} cy={CY} r={54} fill="none" strokeWidth="1"
                  transform={`rotate(-90 ${CX} ${CY})`}
                />

                {/* The hand. cw-sweep carries the one-time entrance; --cw-hand
                    is driven purely by which milestone is active, so after load
                    it moves only when someone points at one. */}
                <g className="cw-sweep" style={{ '--cw-hand': `${handDeg}deg` }}>
                  <line x1={CX} y1={CY} x2={CX} y2={CY - 116} className="cw-sweep-line" strokeWidth="1.1" />
                  <circle cx={CX} cy={CY - 116} r="3.2" className="cw-sweep-dot" />
                  {/* Counterweight — what makes a rotating hairline read as
                      balanced rather than a stray line through the middle. */}
                  <line x1={CX} y1={CY} x2={CX} y2={CY + 22} className="cw-sweep-tail" strokeWidth="1" />
                </g>

                {MARKS.map((m, i) => (
                  <g
                    key={m.id}
                    className={`cw-mark cw-milestone${active === i ? ' is-active' : ''}`}
                    style={{ '--cw-delay': `${900 + i * 90}ms` }}
                  >
                    <circle cx={m.x} cy={m.y} r="5" className="cw-milestone-ring" strokeWidth="1.2" />
                    <circle cx={m.x} cy={m.y} r="1.6" className="cw-milestone-dot" />
                  </g>
                ))}

                <circle cx={CX} cy={CY} r="2.6" className="cw-hub" />
                <circle
                  className="cw-mark cw-hub-ring"
                  style={{ '--cw-delay': '1400ms' }}
                  cx={CX} cy={CY} r="20" fill="none" strokeWidth="1"
                />
              </svg>

              {/* Real buttons over the marks. HTML rather than SVG, so they come
                  with focus, keyboard activation and an accessible name for
                  free; positioned as a percentage of the viewBox so they track
                  their marks at any size. */}
              {MARKS.map((m, i) => (
                <button
                  key={m.id}
                  type="button"
                  className="cw-dial-btn"
                  style={{ left: `${(m.x / 260) * 100}%`, top: `${(m.y / 260) * 100}%` }}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  onClick={() => goTo(m.id)}
                  aria-label={`Go to section ${m.num}, ${m.name}`}
                />
              ))}

              {/* Centre readout. Names whichever milestone is active and falls
                  back to the dial's caption at rest. aria-live so the change is
                  announced without focus having to move. */}
              <div className="cw-readout" aria-live="polite">
                {activeMark ? (
                  <>
                    <span className="cw-readout__num">{activeMark.num}</span>
                    <span className="cw-readout__name">{activeMark.name}</span>
                  </>
                ) : (
                  <span className="cw-readout__idle">Six workstreams<br />One launch</span>
                )}
              </div>
            </div>

            <p className="mt-7 text-center font-['Outfit'] text-[11.5px] tracking-[0.16em] uppercase text-[var(--cw-muted)]">
              Select a marker to jump to its section
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
