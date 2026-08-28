import { useId, useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import {
  Section, SectionLabel, SectionHeading, SectionIntro, StatusChip, IllustrativeTag, Field,
} from './primitives';
import { fadeUp, revealProps } from './motion';
import { TIMELINE, WORKSTREAMS, STATUS } from '../data/applicationData';
import { WorkstreamIcon } from './icons';

/* ─── Launch control ─────────────────────────────────────────────────────────
   The operational instrument at the centre of the page: six workstreams read
   against six calibration points, with the detail behind a disclosure so the
   default view stays a readiness summary rather than a spreadsheet.

   INTERACTION MODEL
   Click, Enter or Space opens a row; hover only highlights it. The brief allows
   hover, focus or click, and hover-to-open was rejected deliberately — it does
   not exist on touch, it fires by accident on the way to something else, and it
   would mean the detail was unreachable for a keyboard user without also
   opening on focus, which hijacks tabbing.

   What a row shows without being opened is therefore load-bearing: name, active
   window, and status are always visible. Opening adds owner, next action,
   dependency and due point. Nothing critical is hidden behind an interaction.

   Native <button> with aria-expanded / aria-controls — the disclosure pattern,
   free keyboard support, no key handlers to get wrong. */

/* ── One grid template, used by the header AND every row ────────────────────
   These MUST be the same string. They were previously written out separately,
   both ending in `auto` — and `auto` resolved to 43px in the header (the word
   "STATUS") but 100px in a row (a status chip plus the disclosure glyph). The
   56px difference redistributed through the fr columns, so the track sat 18px
   further right in the header and was 38px wider, and the T-8 / T-6 / T-4
   labels could never line up with the gridlines the bars were drawn against.

   The third column is now a fixed width, sized for the widest chip
   ("Awaiting input") plus the glyph, so the header and the rows resolve
   identically and the scale means what it says. */
const GRID = 'md:grid-cols-[minmax(180px,0.9fr)_minmax(0,2.7fr)_152px]';

function TimelineHeader() {
  return (
    <div className={`hidden md:grid ${GRID} gap-6 items-end pb-3 border-b border-[var(--cw-line)]`}>
      <span className="font-['Outfit'] text-[9px] tracking-[0.22em] uppercase text-[var(--cw-muted)]">
        Workstream
      </span>
      {/* Labels sit flush to the left edge of their column, which is exactly
          where .cw-track draws its gridline — so each label names the tick
          beneath it rather than floating between two. */}
      <div className="grid grid-cols-6">
        {TIMELINE.map((t) => (
          <span
            key={t.id}
            className={`font-['Outfit'] text-[9.5px] tracking-[0.14em] uppercase ${
              t.id === 'launch'
                ? 'text-[var(--cw-accent)] font-semibold'
                : 'text-[var(--cw-muted)]'
            }`}
          >
            {t.short}
          </span>
        ))}
      </div>
      <span className="font-['Outfit'] text-[9px] tracking-[0.22em] uppercase text-[var(--cw-muted)] text-right">
        Status
      </span>
    </div>
  );
}

/* The bar spans its active window. grid-column is 1-indexed and end is
   exclusive, hence the +1 / +2 against the zero-indexed data.

   The fill inside it is scroll-LINKED: it travels from 0 to full as the section
   passes through the viewport, and runs backwards when you scroll up. Each row
   is offset slightly later than the one above, so the six bars fill in sequence
   as you read down them — the launch advancing under the reader's own scroll.

   scaleX on an absolutely-positioned child, so it composites and never triggers
   layout on any of the six rows. */
function Track({ span, progress }) {
  const [start, end] = span;
  return (
    <div className="cw-track">
      <div className="cw-bar" style={{ gridColumn: `${start + 1} / ${end + 2}` }}>
        <motion.span className="cw-bar__fill" style={{ scaleX: progress }} />
        <span className="cw-node cw-node--start" />
        <span className="cw-node cw-node--end" />
      </div>
    </div>
  );
}

function WorkstreamRow({ item, index, scroll, reduced, isOpen, onToggle }) {
  const uid = useId();
  const panelId = `${uid}-panel`;
  /* NOT named `window` — shadowing the global inside a component is a trap
     waiting for the first line that needs the real one. */
  const activeWindow = `${TIMELINE[item.span[0]].full} → ${TIMELINE[item.span[1]].full}`;

  /* Each row derives its own slice of the section's scroll rather than the
     parent precomputing six of them: useTransform is a hook, and six of them in
     a .map() would be a hooks-order violation the moment the list changed.

     Row i starts at 0.07i and takes 0.5 of the range, so the bars fill in
     sequence with a long overlap — a cascade, not six things happening one at a
     time. clamp keeps a bar full once filled instead of overshooting. */
  const startAt = index * 0.07;
  const fill = useTransform(scroll, [startAt, startAt + 0.5], [0, 1], { clamp: true });
  /* Reduced motion gets the finished state: the bars are simply full, since
     they carry real information about each window. */
  const progress = reduced ? 1 : fill;

  return (
    <motion.div variants={fadeUp} className="last:border-b last:border-[var(--cw-line)]">
      <button
        type="button"
        className="cw-row group"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <div className={`grid grid-cols-1 ${GRID} gap-4 md:gap-6 items-center`}>
          {/* Name */}
          <div className="flex items-center gap-3.5 min-w-0">
            <span className="cw-nums font-['Outfit'] text-[10px] tracking-[0.12em] text-[var(--cw-muted)] shrink-0">
              {item.num}
            </span>
            {/* The workstream's mark. Decorative — it sits beside a label that
                already names the thing — so it is aria-hidden and it slides a
                couple of pixels on hover to tie it to the row. */}
            <span className="shrink-0 text-[var(--cw-muted)] group-hover:text-[var(--cw-accent)] transition-all duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none">
              <WorkstreamIcon name={item.icon} className="w-[17px] h-[17px] block" />
            </span>
            <span className="font-['Outfit'] text-[13.5px] md:text-[14px] font-medium leading-snug text-[var(--cw-ink)] transition-colors duration-300">
              {item.name}
            </span>
          </div>

          {/* Track. The window is also written out for screen readers and for
              anyone who cannot resolve a 2px bar against a grid. */}
          <div className="min-w-0">
            <Track span={item.span} progress={progress} />
            <span className="sr-only">Active window: {activeWindow}</span>
            <span className="md:hidden block font-['Outfit'] text-[10px] tracking-[0.1em] uppercase text-[var(--cw-muted)] mt-2">
              {activeWindow}
            </span>
          </div>

          {/* Status + affordance */}
          <div className="flex items-center justify-between md:justify-end gap-4">
            <StatusChip status={item.status} />
            <span
              aria-hidden="true"
              className={`font-['Outfit'] text-[15px] leading-none text-[var(--cw-muted)] transition-transform duration-300 motion-reduce:transition-none ${
                isOpen ? 'rotate-45' : ''
              }`}
            >
              +
            </span>
          </div>
        </div>
      </button>

      {/* Disclosure. grid-rows 0fr→1fr animates an unmeasured height without a
          max-height guess that would clip the longest note. */}
      <div id={panelId} className={`cw-panel ${isOpen ? 'cw-panel--open' : ''}`} role="region">
        <div>
          <div className="pb-8 pt-1 md:pl-[calc(210px+1.5rem)]">
            <p className="font-['Outfit'] text-[13px] md:text-[13.5px] leading-[1.7] text-[var(--cw-ink-2)] max-w-[620px] mb-7 border-l border-[var(--cw-line-strong)] pl-5">
              {item.note}
            </p>
            <dl className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4 max-w-[900px]">
              <Field label="Status" value={`${STATUS[item.status].label} — ${item.coordinator}`} />
              <Field label="Owner" value={item.owner} />
              <Field label="Next action" value={item.nextAction} />
              <Field label="Dependency" value={item.dependency} />
              <Field label="Due" value={item.due} />
            </dl>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function LaunchControl({ openId, onToggle }) {
  /* openId is owned by the page, not by this section — the hero dial selects a
     workstream and this view has to reflect that. The first row arrives open so
     the disclosure explains itself without needing to be discovered. */

  /* One scroll source for all six rows. Measured across the rows container
     rather than the whole section, so the fills track the instrument itself and
     are not diluted by the heading block above it. */
  const rowsRef = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: rowsRef,
    offset: ['start 0.85', 'end 0.45'],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 95, damping: 28, mass: 0.3 });

  return (
    <Section id="launch-control" label>
      <motion.div {...revealProps} className="mb-14 md:mb-20">
        <SectionLabel className="mb-5">System / 01</SectionLabel>
        <SectionHeading id="launch-control-heading" className="mb-6">
          One launch. Six workstreams. Zero lost details.
        </SectionHeading>
        <SectionIntro>
          Product, CRM, retail, VM, vendors and reporting — one view.
        </SectionIntro>
      </motion.div>

      <motion.div {...revealProps}>
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-2 border-b border-[var(--cw-line-strong)]"
        >
          <span className="font-['Outfit'] text-[10px] md:text-[11px] font-semibold tracking-[0.24em] uppercase text-[var(--cw-ink)]">
            Illustrative readiness view
          </span>
          <IllustrativeTag>Illustrative sample data</IllustrativeTag>
        </motion.div>

        <motion.div variants={fadeUp}>
          <TimelineHeader />
        </motion.div>

        <div ref={rowsRef}>
          {WORKSTREAMS.map((item, i) => (
            <WorkstreamRow
              key={item.id}
              item={item}
              index={i}
              scroll={smooth}
              reduced={reduced}
              isOpen={openId === item.id}
              onToggle={() => onToggle(openId === item.id ? null : item.id)}
            />
          ))}
        </div>

        <motion.p
          variants={fadeUp}
          className="font-['Outfit'] text-[13px] md:text-[14px] leading-[1.7] text-[var(--cw-ink-2)] max-w-[520px] mt-10"
        >
          Five of six clear. The sixth flagged at T-8, not discovered at T-1.
        </motion.p>
      </motion.div>
    </Section>
  );
}
