import { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Section, SectionLabel, SectionHeading, SectionIntro, StatusChip, IllustrativeTag, Field,
} from './primitives';
import { EASE, fadeUp, revealProps } from './motion';
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

   The third column is a fixed width sized for the widest chip plus the
   disclosure glyph, so the header and the rows resolve identically and the
   scale means what it says. 200px, not 152px: the type-scale lift took
   "Awaiting input" from 118px to 167px, and 152 no longer fit it. */
const GRID = 'md:grid-cols-[minmax(170px,0.85fr)_minmax(0,2.6fr)_200px]';

function TimelineHeader() {
  return (
    <div className={`hidden md:grid ${GRID} gap-6 items-end pb-3 border-b border-[var(--cw-line)]`}>
      <span className="font-['Outfit'] text-[11px] tracking-[0.16em] uppercase text-[var(--cw-muted)]">
        Workstream
      </span>
      {/* Labels sit flush to the left edge of their column, which is exactly
          where .cw-track draws its gridline — so each label names the tick
          beneath it rather than floating between two. */}
      <div className="grid grid-cols-6">
        {TIMELINE.map((t) => (
          <span
            key={t.id}
            className={`font-['Outfit'] text-[11.5px] tracking-[0.14em] uppercase ${
              t.id === 'launch'
                ? 'text-[var(--cw-accent)] font-semibold'
                : 'text-[var(--cw-muted)]'
            }`}
          >
            {t.short}
          </span>
        ))}
      </div>
      <span className="font-['Outfit'] text-[11px] tracking-[0.16em] uppercase text-[var(--cw-muted)] text-right">
        Status
      </span>
    </div>
  );
}

/* The bar spans its active window. grid-column is 1-indexed and end is
   exclusive, hence the +1 / +2 against the zero-indexed data.

   THE FILL IS NOT SCROLL-LINKED, DELIBERATELY.
   It was, and it made the chart lie. A bar that fills with scroll position sits
   at some arbitrary fraction whenever you stop, and on a Gantt-shaped row a
   part-filled bar reads as "this workstream is 60% complete" — which is not
   what it meant and not a claim the data supports. Worse, the bar only reached
   full if you happened to scroll far enough, so the window it was supposed to
   show was rarely the window you saw.

   It now draws itself once when the row arrives, and stays full. Full bar =
   the whole active window, always, which is the only honest reading. The
   stagger is on the entrance, not on the reader's scroll position.

   scaleX on an absolutely-positioned child, so it composites and never triggers
   layout on any of the six rows. */
function Track({ span, index, reduced }) {
  const [start, end] = span;
  /* The fill is driven by VARIANTS inherited from the row, not by its own
     whileInView.

     whileInView on this element deadlocks. It starts at scaleX(0), which gives
     it a 0x4px bounding box, and IntersectionObserver cannot report a zero-area
     box as intersecting — so the element that needs to be seen in order to grow
     can never be seen. Some rows animated anyway, purely on the timing of when
     the observer first attached, which is why five of six worked and the second
     one silently never filled.

     Variants propagate by name from any motion ancestor, so the row's existing
     hidden/visible orchestration drives this and no observer ever has to
     measure the collapsed element. */
  const fillVariants = {
    hidden: { scaleX: reduced ? 1 : 0 },
    visible: {
      scaleX: 1,
      transition: { duration: reduced ? 0 : 0.75, ease: EASE, delay: reduced ? 0 : 0.05 + index * 0.09 },
    },
  };
  return (
    <div className="cw-track">
      <div className="cw-bar" style={{ gridColumn: `${start + 1} / ${end + 2}` }}>
        <motion.span className="cw-bar__fill" variants={fillVariants} />
        <span className="cw-node cw-node--start" />
        <span className="cw-node cw-node--end" />
      </div>
    </div>
  );
}

function WorkstreamRow({ item, index, reduced, isOpen, onToggle }) {
  const uid = useId();
  const panelId = `${uid}-panel`;
  /* NOT named `window` — shadowing the global inside a component is a trap
     waiting for the first line that needs the real one. */
  const activeWindow = `${TIMELINE[item.span[0]].full} → ${TIMELINE[item.span[1]].full}`;

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
            <span className="cw-nums font-['Outfit'] text-[12px] tracking-[0.12em] text-[var(--cw-muted)] shrink-0">
              {item.num}
            </span>
            {/* The workstream's mark. Decorative — it sits beside a label that
                already names the thing — so it is aria-hidden and it slides a
                couple of pixels on hover to tie it to the row. */}
            <span className="shrink-0 text-[var(--cw-muted)] group-hover:text-[var(--cw-accent)] transition-all duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none">
              <WorkstreamIcon name={item.icon} className="w-[17px] h-[17px] block" />
            </span>
            <span className="font-['Outfit'] text-[15.5px] md:text-[16px] font-medium leading-snug text-[var(--cw-ink)] transition-colors duration-300">
              {item.name}
            </span>
          </div>

          {/* Track. The window is also written out for screen readers and for
              anyone who cannot resolve a 2px bar against a grid. */}
          <div className="min-w-0">
            <Track span={item.span} index={index} reduced={reduced} />
            <span className="sr-only">Active window: {activeWindow}</span>
            <span className="md:hidden block font-['Outfit'] text-[12px] tracking-[0.1em] uppercase text-[var(--cw-muted)] mt-2">
              {activeWindow}
            </span>
          </div>

          {/* Status + affordance */}
          <div className="flex items-center justify-between md:justify-end gap-4">
            <StatusChip status={item.status} />
            <span
              aria-hidden="true"
              className={`font-['Outfit'] text-[17px] leading-none text-[var(--cw-muted)] transition-transform duration-300 motion-reduce:transition-none ${
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
            <p className="font-['Outfit'] text-[15px] md:text-[15.5px] leading-[1.7] text-[var(--cw-ink-2)] max-w-[620px] mb-7 border-l border-[var(--cw-line-strong)] pl-5">
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

  const reduced = useReducedMotion();

  return (
    <Section id="launch-control" label>
      <motion.div {...revealProps} className="mb-14 md:mb-20">
        <SectionLabel className="mb-5">System / 01</SectionLabel>
        <SectionHeading id="launch-control-heading" className="mb-6">
          One launch. Six workstreams. Zero lost details
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
          <span className="font-['Outfit'] text-[12px] md:text-[13px] font-semibold tracking-[0.17em] uppercase text-[var(--cw-ink)]">
            Illustrative readiness view
          </span>
          <IllustrativeTag>Illustrative sample data</IllustrativeTag>
        </motion.div>

        <motion.div variants={fadeUp}>
          <TimelineHeader />
        </motion.div>

        <div>
          {WORKSTREAMS.map((item, i) => (
            <WorkstreamRow
              key={item.id}
              item={item}
              index={i}
              reduced={reduced}
              isOpen={openId === item.id}
              onToggle={() => onToggle(openId === item.id ? null : item.id)}
            />
          ))}
        </div>

        <motion.p
          variants={fadeUp}
          className="font-['Outfit'] text-[15px] md:text-[16px] leading-[1.7] text-[var(--cw-ink-2)] max-w-[520px] mt-10"
        >
          Five of six clear. The sixth flagged at T-8, not discovered at T-1.
        </motion.p>
      </motion.div>
    </Section>
  );
}
