import { motion } from 'framer-motion';
import { STATUS } from '../data/applicationData';
import { StatusGlyph } from './icons';
import { fadeUp } from './motion';

/* ─── Shared page primitives ─────────────────────────────────────────────────
   The portfolio has no component library — each section builds its own labels
   and headings from the same Tailwind recipe. That recipe is repeated seven
   times on this page, so it is factored out here rather than copied, but the
   values are unchanged from the live site: same label size, same tracking, same
   Monument display face, same easing curve.

   These are page-local on purpose. Extracting a shared primitive into the wider
   codebase would mean editing components the homepage renders, which this route
   is not permitted to touch. */

/* Motion values live in motion.js and are imported from there directly by each
   component. They are deliberately NOT re-exported through this file: a module
   that exports both components and plain values breaks Fast Refresh. */

/* ── Section shell ──────────────────────────────────────────────────────────
   The page alternates white and black grounds. `tone="dark"` swaps the whole
   token set via .cw-invert — no child component knows or cares which ground it
   is on, which is the entire payoff of tokenising the palette.

   Dark sections carry NO texture. They had a diagonal lattice and a guilloche
   ground; stacked, the two crossing line systems read as a wire mesh over the
   type rather than as surface. Flat near-black is stronger, and it matches the
   restraint the rest of the page runs on.

   Generous vertical padding on the dark bands specifically, because a black
   section needs more air around its type than a light one to avoid feeling
   compressed. */
export function Section({ id, label, children, tone = 'light', className = '' }) {
  const dark = tone === 'dark';
  return (
    <section
      id={id}
      aria-labelledby={label ? `${id}-heading` : undefined}
      className={`w-full relative border-t border-[var(--cw-line)] ${
        dark ? 'cw-invert py-24 md:py-32 xl:py-44' : 'py-20 md:py-28 xl:py-36'
      } ${className}`}
    >
      {/* Light sections get the warm vignette. Dark sections get nothing — no
          lattice, no guilloche, no marble. See the notes in chanel-wfj.css. */}
      {dark ? null : <div aria-hidden="true" className="cw-vignette" />}
      <div className="max-w-[120rem] mx-auto px-6 md:px-12 lg:px-16 relative">{children}</div>
    </section>
  );
}

/* ── Editorial section label ────────────────────────────────────────────────
   The site's numbered label convention (SKILLS / 04, CONTACT / 05) continues
   here as SYSTEM / 01 through EVIDENCE / 05.

   The homepage wraps these in <ScrambleLabel>, which glitch-decodes the text on
   entry. That is deliberately not used on this page: a label that resolves out
   of random characters is the right voice for an execution archive and the
   wrong one for fine jewellery. Same size, tracking and colour — quieter
   behaviour. */
export function SectionLabel({ children, className = '' }) {
  return (
    <motion.div variants={fadeUp} className={`flex flex-col gap-3 ${className}`}>
      {/* A bezel index and a minute track — a dial's applied marker followed by
          its graduated edge. Every section opens on the same calibrated mark. */}
      <span className="flex items-center gap-3">
        <span aria-hidden="true" className="cw-index-mark">
          <i /><i /><i />
        </span>
        <span aria-hidden="true" className="cw-minute-track" />
      </span>
      <span className="block font-['Outfit'] font-semibold text-[10px] md:text-[11px] tracking-[0.25em] text-[var(--cw-muted)] uppercase">
        {children}
      </span>
    </motion.div>
  );
}

/* ── Display heading ────────────────────────────────────────────────────────
   Set in the Didone, not Monument — see the note at the top of chanel-wfj.css.

   Sentence case, not uppercase. A Didone's whole character lives in the
   ascenders, descenders and the ball terminals, and setting it in caps throws
   all three away; the caps treatment is reserved for the short mastheads where
   it belongs. Sizes run considerably larger than the homepage's headings
   because a high-contrast serif needs the scale to keep its hairlines. */
export function SectionHeading({ id, children, className = '' }) {
  return (
    <motion.h2
      id={id}
      variants={fadeUp}
      className={`cw-display text-[21px] sm:text-[26px] md:text-[31px] xl:text-[37px] text-[var(--cw-ink)] max-w-[19ch] ${className}`}
    >
      {children}
    </motion.h2>
  );
}

export function SectionIntro({ children, className = '' }) {
  return (
    <motion.p
      variants={fadeUp}
      className={`font-['Outfit'] text-[14px] md:text-[16px] leading-[1.75] text-[var(--cw-ink-2)] max-w-[620px] ${className}`}
    >
      {children}
    </motion.p>
  );
}

/* ── Status chip ────────────────────────────────────────────────────────────
   Glyph + word, always. Colour is the third signal, never the only one, so the
   readiness view survives greyscale printing, colour vision deficiency and a
   screen reader reading it aloud. */
export function StatusChip({ status, className = '' }) {
  const s = STATUS[status];
  if (!s) return null;
  return (
    <span className={`cw-status cw-status--${s.tone} font-['Outfit'] ${className}`}>
      <StatusGlyph shape={s.shape} />
      {s.label}
    </span>
  );
}

/* ── Illustrative-data marker ───────────────────────────────────────────────
   Required wherever a figure appears. Every number on this page is invented,
   and the page says so at the point of use rather than only in the footer. */
export function IllustrativeTag({ children = 'Illustrative sample data', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-['Outfit'] text-[9px] md:text-[9.5px] tracking-[0.22em] uppercase text-[var(--cw-muted)] ${className}`}
    >
      <span aria-hidden="true" className="inline-block w-3 h-px bg-[var(--cw-faint)]" />
      {children}
    </span>
  );
}

/* ── Field row ──────────────────────────────────────────────────────────────
   The label/value pair used by the readiness panel and the retail documents.
   A definition list, because that is what it is. */
export function Field({ label, value }) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:gap-5">
      <dt className="font-['Outfit'] text-[9.5px] tracking-[0.2em] uppercase text-[var(--cw-muted)] sm:w-[104px] sm:shrink-0 sm:pt-[3px]">
        {label}
      </dt>
      <dd className="font-['Outfit'] text-[13px] md:text-[13.5px] leading-[1.6] text-[var(--cw-ink-2)] m-0">
        {value}
      </dd>
    </div>
  );
}
