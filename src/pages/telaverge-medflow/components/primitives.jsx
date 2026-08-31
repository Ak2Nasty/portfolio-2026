import { motion } from 'framer-motion';
import { fadeUp } from './motion';
import { StatusGlyph, Icon } from './icons';

/* ─── Shared page primitives ─────────────────────────────────────────────────
   Twenty sections is far too many to hand-build a heading in each one. These
   are page-local on purpose: extracting them into the wider codebase would mean
   editing components the homepage renders, which this route is not permitted to
   touch.

   Motion values live in motion.js and are imported directly by each component.
   They are deliberately NOT re-exported through this file — a module exporting
   both components and plain values breaks Fast Refresh. */

/* ── Section shell ──────────────────────────────────────────────────────────
   `tone` swaps the entire token set via .mf-invert, so no child knows or cares
   which ground it is on. Used exactly once, at the close.

   `alt` is the quieter alternation — same palette, one step darker ground. Over
   twenty sections a single flat ground turns into a wall, and the alternation
   gives the eye a chapter boundary without introducing a second design. */
export function Section({ id, labelled = true, tone, alt = false, children, className = '' }) {
  const dark = tone === 'dark';
  return (
    <section
      id={id}
      aria-labelledby={labelled ? `${id}-heading` : undefined}
      className={`w-full relative border-t border-[var(--mf-line)] ${
        dark ? 'mf-invert py-24 md:py-32' : 'py-16 md:py-24 xl:py-28'
      } ${className}`}
      style={{ background: alt ? 'var(--mf-bg-alt)' : 'var(--mf-bg)' }}
    >
      <div className="mf-shell max-w-[88rem] mx-auto px-6 md:px-10 lg:px-14">{children}</div>
    </section>
  );
}

/* ── Section header ─────────────────────────────────────────────────────────
   Number, registration mark, heading, lead. The number is not decoration: with
   twenty sections the reader needs to know where they are, and it is the same
   number the sticky index and the capabilities grid link against. */
export function SectionHead({ id, n, label, heading, lead, children, className = '' }) {
  return (
    <motion.div variants={fadeUp} className={`mb-10 md:mb-14 ${className}`}>
      <span className="flex items-center gap-3 mb-4">
        <span aria-hidden="true" className="mf-mark" />
        <span aria-hidden="true" className="mf-rule" />
      </span>

      <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-4">
        <span
          className="font-['Outfit'] text-[11px] font-semibold uppercase tabular-nums"
          style={{ letterSpacing: '0.18em', color: 'var(--mf-accent)' }}
        >
          {n}
        </span>
        <span
          className="font-['Outfit'] text-[11px] font-semibold uppercase"
          style={{ letterSpacing: '0.18em', color: 'var(--mf-muted)' }}
        >
          {label}
        </span>
      </span>

      <h2
        id={id ? `${id}-heading` : undefined}
        className="font-['Outfit'] font-semibold leading-[1.12] text-[27px] sm:text-[32px] md:text-[38px] max-w-[20ch]"
        style={{ color: 'var(--mf-ink)', letterSpacing: '-0.015em' }}
      >
        {heading}
      </h2>

      {lead ? (
        <p
          className="font-['Outfit'] text-[15.5px] md:text-[17px] leading-[1.72] max-w-[68ch] mt-5"
          style={{ color: 'var(--mf-ink-2)' }}
        >
          {lead}
        </p>
      ) : null}

      {children}
    </motion.div>
  );
}

export function Prose({ children, className = '', wide = false }) {
  return (
    <p
      className={`font-['Outfit'] text-[15.5px] md:text-[16.5px] leading-[1.78] ${
        wide ? 'max-w-[76ch]' : 'max-w-[66ch]'
      } ${className}`}
      style={{ color: 'var(--mf-ink-2)' }}
    >
      {children}
    </p>
  );
}

export function Label({ children, className = '', tone = 'muted' }) {
  return (
    <span
      className={`font-['Outfit'] text-[10.5px] font-semibold uppercase block ${className}`}
      style={{
        letterSpacing: '0.16em',
        color: tone === 'accent' ? 'var(--mf-accent)' : tone === 'ink' ? 'var(--mf-ink)' : 'var(--mf-muted)',
      }}
    >
      {children}
    </span>
  );
}

/* ── Status chip ────────────────────────────────────────────────────────────
   Glyph, then word, then colour. The `sr` prop lets a caller add context a
   sighted reader gets from position but a screen-reader user would not. */
const CHIP_SHAPES = { run: 'play', off: 'pause', attn: 'triangle', crit: 'octagon', info: 'dot', accent: 'dot', done: 'check' };

export function Chip({ tone = 'off', children, shape, className = '', sr }) {
  const glyph = shape || CHIP_SHAPES[tone] || 'dot';
  const toneClass = tone === 'done' ? 'run' : tone;
  return (
    <span className={`mf-chip mf-chip--${toneClass} ${className}`}>
      <StatusGlyph shape={glyph} />
      {children}
      {sr ? <span className="sr-only"> {sr}</span> : null}
    </span>
  );
}

/* ── Conceptual-content marker ──────────────────────────────────────────────
   Required wherever invented content appears, at the point of use rather than
   only in the footer. Every screen, every table, every figure on this page is
   fictional, and the page says so where the reader meets it. */
export function ConceptTag({ children = 'Conceptual · fictional data', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-['Outfit'] text-[10.5px] uppercase ${className}`}
      style={{ letterSpacing: '0.15em', color: 'var(--mf-muted)' }}
    >
      <span aria-hidden="true" className="inline-block w-3 h-px" style={{ background: 'var(--mf-line-strong)' }} />
      {children}
    </span>
  );
}

/* ── Accuracy note ──────────────────────────────────────────────────────────
   The stronger form, used where a section could plausibly be mistaken for real
   regulatory or clinical work — the risk analysis, the proposed study, the
   frameworks. Deliberately styled as a note rather than a warning: it is a
   statement of scope, not an error. */
export function ScopeNote({ children, className = '' }) {
  return (
    <div
      className={`flex gap-3.5 p-4 md:p-5 rounded-[4px] ${className}`}
      style={{ background: 'var(--mf-info-bg)', border: '1px solid var(--mf-info-line)' }}
    >
      <span className="shrink-0 mt-[1px]" style={{ color: 'var(--mf-info)' }}>
        <Icon name="info-circle" size={15} />
      </span>
      <p className="font-['Outfit'] text-[13.5px] leading-[1.65] m-0" style={{ color: 'var(--mf-info)' }}>
        {children}
      </p>
    </div>
  );
}

/* ── Field row ──────────────────────────────────────────────────────────────
   A definition list, because that is what it is. */
export function Field({ label, value, mono = false }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-5">
      <dt
        className="font-['Outfit'] text-[10.5px] font-semibold uppercase sm:w-[118px] sm:shrink-0 sm:pt-[3px]"
        style={{ letterSpacing: '0.15em', color: 'var(--mf-muted)' }}
      >
        {label}
      </dt>
      <dd
        className={`font-['Outfit'] text-[14.5px] leading-[1.6] m-0 ${mono ? 'tabular-nums' : ''}`}
        style={{ color: 'var(--mf-ink-2)' }}
      >
        {value}
      </dd>
    </div>
  );
}

/* ── Cross-reference ────────────────────────────────────────────────────────
   The small link that ties a row back to the user need or screen it came from.
   These are what make the document traceable rather than merely long — a
   reviewer can follow any design decision back to what caused it. */
export function Ref({ children, href, className = '' }) {
  const content = (
    <>
      {/* Inherits the link colour. It was set in --mf-accent-line, which
          measured 1.64:1 against the accent tint it usually sits on — an arrow
          nobody could actually see. It is aria-hidden and therefore exempt from
          the contrast requirement, but "exempt" is not a reason to ship an
          invisible glyph. */}
      <span aria-hidden="true">&#8599;</span>
      {children}
    </>
  );
  /* min-height 26px, not the 17px this used to be. WCAG 2.5.8 asks for 24×24
     on a target that is not inline in a sentence, and these are standalone
     links in table cells and card footers — they are exactly the case the
     exemption does not cover. The padding is vertical only so the reference
     still sits on the text baseline it belongs to. */
  const cls = `inline-flex items-center gap-1.5 font-['Outfit'] text-[10.5px] font-semibold uppercase tabular-nums ${className}`;
  const style = {
    letterSpacing: '0.12em',
    color: 'var(--mf-accent)',
    minHeight: 26,
    paddingTop: 4,
    paddingBottom: 4,
  };
  if (!href) return <span className={cls} style={style}>{content}</span>;
  return (
    <a className={`${cls} mf-underline`} style={style} href={href}>
      {content}
    </a>
  );
}

/* ── Card ───────────────────────────────────────────────────────────────────
   The single raised surface used throughout. One definition, so twenty
   sections cannot drift into five slightly different cards. */
export function Card({ children, className = '', tone, interactive = false, as: As = 'div', ...rest }) {
  const toneStyle =
    tone === 'accent'
      ? { background: 'var(--mf-accent-bg)', borderColor: 'var(--mf-accent-line)' }
      : { background: 'var(--mf-surface)', borderColor: 'var(--mf-line)' };
  /* Hover is opt-IN. A card that lifts under the cursor and then does nothing
     when clicked is a lie about affordance, and this page is full of cards that
     are purely informational. Only cards that actually respond get `mf-lift`. */
  return (
    <As
      className={`rounded-[4px] border ${interactive ? 'mf-lift' : ''} ${className}`}
      style={toneStyle}
      {...rest}
    >
      {children}
    </As>
  );
}
