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

/* ── Dial architecture ───────────────────────────────────────────────────────
   The first version drew everything at one hairline weight across one
   undifferentiated field, which is why it read as dead: no zones, no hierarchy,
   nothing for the eye to rank. A real dial is built in concentric ZONES, each
   at a different weight, and that is what makes it read as an object.

     R_BEZEL   122   outer case edge, the heaviest line on the dial
     R_TRACK   112   minute track, 60 graduations
     R_CHAPTER 106   chapter ring, the numerals 01-06
     R_MARK     89   applied markers
     R_GRAIN 62-82   guilloche band, circular graining
     R_CENTRE   58   clear field for the readout

   Everything below is precomputed at module scope, not per render. */
const R_BEZEL = 122;
const R_TRACK = 112;
const R_CHAPTER = 106;
const R_MARK = 89;
const R_GRAIN_IN = 62;
const R_GRAIN_OUT = 82;

const circumference = (r) => TAU * r;
const pt = (r, deg) => {
  const a = (deg * Math.PI) / 180 - Math.PI / 2;
  return { x: CX + Math.cos(a) * r, y: CY + Math.sin(a) * r };
};

/* 60 graduations. Every tenth runs long and heavy — the six that coincide with
   the section markers — so the minute track and the markers agree instead of
   being two unrelated rings. */
const TICKS = Array.from({ length: 60 }, (_, i) => {
  const deg = i * 6;
  const major = i % 10 === 0;
  const inner = major ? R_TRACK - 6 : R_TRACK - 3.5;
  const a = pt(inner, deg);
  const b = pt(R_BEZEL - 2, deg);
  return { i, major, x1: a.x, y1: a.y, x2: b.x, y2: b.y };
});

/* Circular graining — concentric rings rather than the radiating hairlines the
   first version used. Those converged on the centre and piled into a grey haze
   exactly where the readout sits; rings hold an even tone across the band and
   are the more classical treatment anyway. */
const GRAIN = Array.from(
  { length: Math.floor((R_GRAIN_OUT - R_GRAIN_IN) / 2.6) + 1 },
  (_, i) => ({ i, r: R_GRAIN_IN + i * 2.6 })
);

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
  const deg = i * (360 / SECTIONS.length);
  const m = pt(R_MARK, deg);
  const c = pt(R_CHAPTER, deg);
  return {
    ...s,
    deg,
    x: m.x,
    y: m.y,
    /* Where the chapter numeral sits, just outside its marker. */
    nx: c.x,
    ny: c.y,
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
              An independent study of how I would run the role, by Akshathdayan Suresh.
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
                <defs>
                  {/* The dial face. A flat disc reads as a drawing; a light
                      raked across it from upper-left reads as a surface, which
                      is most of what makes this feel like an object. */}
                  <radialGradient id="cwFace" cx="34%" cy="26%" r="78%">
                    <stop offset="0%" stopColor="#fffdf8" stopOpacity="0.95" />
                    <stop offset="55%" stopColor="#f6f0e3" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#d8ccb2" stopOpacity="0.30" />
                  </radialGradient>
                  {/* Applied markers and the hand take a gold ramp rather than a
                      flat fill, so they catch light like set metal. */}
                  <linearGradient id="cwGold" x1="0" y1="0" x2="0.4" y2="1">
                    <stop offset="0%" stopColor="#c9a961" />
                    <stop offset="48%" stopColor="#8a6d2c" />
                    <stop offset="100%" stopColor="#6f5822" />
                  </linearGradient>
                </defs>

                {/* Face */}
                <circle cx={CX} cy={CY} r={R_BEZEL - 1} fill="url(#cwFace)" />

                {/* Circular graining, bounded top and bottom so it reads as a
                    deliberate band rather than a smudge. */}
                <g className="cw-grain">
                  {GRAIN.map((g) => (
                    <circle key={g.i} cx={CX} cy={CY} r={g.r} fill="none" strokeWidth="0.5" />
                  ))}
                </g>
                <circle cx={CX} cy={CY} r={R_GRAIN_IN - 2} className="cw-dial-hair" fill="none" strokeWidth="0.7" />
                <circle cx={CX} cy={CY} r={R_GRAIN_OUT + 2} className="cw-dial-hair" fill="none" strokeWidth="0.7" />

                {/* Minute track */}
                <g>
                  {TICKS.map((t) => (
                    <line
                      key={t.i}
                      className={`cw-mark ${t.major ? 'cw-tick-major' : 'cw-tick-minor'}`}
                      style={{ '--cw-delay': `${380 + t.i * 7}ms` }}
                      x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
                      strokeWidth={t.major ? 2 : 0.7}
                      strokeLinecap="butt"
                    />
                  ))}
                </g>

                {/* Bezel — the heaviest line on the dial, and the outer edge of
                    the object. Everything inside is lighter than it. */}
                <circle
                  className="cw-ring cw-dial-bezel"
                  style={{ '--cw-len': circumference(R_BEZEL), '--cw-delay': '0ms' }}
                  cx={CX} cy={CY} r={R_BEZEL} fill="none" strokeWidth="1.8"
                  transform={`rotate(-90 ${CX} ${CY})`}
                />
                {/* Marker ring */}
                <circle
                  className="cw-ring cw-dial-mid"
                  style={{ '--cw-len': circumference(R_MARK), '--cw-delay': '240ms' }}
                  cx={CX} cy={CY} r={R_MARK} fill="none" strokeWidth="0.9"
                  transform={`rotate(-90 ${CX} ${CY})`}
                />

                {/* Chapter numerals */}
                <g>
                  {MARKS.map((m, i) => (
                    <text
                      key={m.id}
                      className={`cw-mark cw-chapter${active === i ? ' is-active' : ''}`}
                      style={{ '--cw-delay': `${1000 + i * 80}ms` }}
                      x={m.nx} y={m.ny}
                      textAnchor="middle" dominantBaseline="central"
                    >
                      {m.num}
                    </text>
                  ))}
                </g>

                {/* The hand. cw-sweep carries the one-time entrance; --cw-hand
                    is driven purely by which marker is active, so after load it
                    moves only when someone points at one.

                    Tapered rather than a hairline: a polygon that is widest at
                    the hub and comes to a point, which is what a real hand does
                    and what stops it reading as a stray line. */}
                <g className="cw-sweep" style={{ '--cw-hand': `${handDeg}deg` }}>
                  <polygon
                    className="cw-sweep-body"
                    points={`${CX - 2.6},${CY} ${CX},${CY - (R_BEZEL - 8)} ${CX + 2.6},${CY}`}
                  />
                  <polygon
                    className="cw-sweep-tail"
                    points={`${CX - 2.2},${CY} ${CX},${CY + 26} ${CX + 2.2},${CY}`}
                  />
                  <circle cx={CX} cy={CY - (R_BEZEL - 8)} r="2.6" className="cw-sweep-dot" />
                </g>

                {/* Applied markers — a jewel setting: an outer collet, a gold
                    ring and a stone. Three parts at three weights is what makes
                    them read as applied to the dial rather than printed on it. */}
                {MARKS.map((m, i) => (
                  <g
                    key={m.id}
                    className={`cw-mark cw-milestone${active === i ? ' is-active' : ''}`}
                    style={{ '--cw-delay': `${820 + i * 85}ms` }}
                  >
                    <circle cx={m.x} cy={m.y} r="9" className="cw-milestone-halo" />
                    <circle cx={m.x} cy={m.y} r="6.2" className="cw-milestone-ring" strokeWidth="1.6" />
                    <circle cx={m.x} cy={m.y} r="2.6" className="cw-milestone-dot" />
                  </g>
                ))}

                {/* Hub. No ring at the centre any more — one sat at r=60,
                    exactly where the readout used to be, and sliced through the
                    text. The readout has moved out of the dial entirely, so the
                    hub is now just a hub. */}
                <circle cx={CX} cy={CY} r="5.4" className="cw-hub" />
                <circle cx={CX} cy={CY} r="1.8" className="cw-hub-pin" />
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

            </div>

            {/* Readout — BELOW the dial, not inside it.

                It used to sit in the centre, which stopped working the moment
                the dial got real architecture: the graining band, the hub ring
                and the hand all pass through that space, so the text was being
                sliced by geometry drawn on top of it. There is no reliable
                clear field at the centre of a dial that has a hand in it.

                Out here it is always legible, can run to two lines without
                colliding with anything, and gets to be considerably larger.
                Fixed min-height so the layout does not jump between the resting
                caption and a two-line section name.

                aria-live so a screen reader hears the change without focus
                having to move. */}
            <div className="cw-readout" aria-live="polite">
              {activeMark ? (
                <>
                  <span className="cw-readout__num">Section {activeMark.num}</span>
                  <span className="cw-readout__name">{activeMark.name}</span>
                </>
              ) : (
                <span className="cw-readout__idle">
                  Select a marker to jump to its section
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
