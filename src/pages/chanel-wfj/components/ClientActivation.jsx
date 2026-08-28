import { motion } from 'framer-motion';
import {
  Section, SectionLabel, SectionHeading, SectionIntro, IllustrativeTag,
} from './primitives';
import { fadeUp, revealProps, EASE } from './motion';
import { FUNNEL, CLIENTS, ACTIVATION_NOTE } from '../data/applicationData';

/* ─── Client activation ──────────────────────────────────────────────────────
   Discretion is the point of this section as much as organisation is. Every
   record is anonymised at the source — Client 001, Segment A, Boutique 2 — and
   there is no field anywhere in the data that could hold a real name. That is a
   demonstration of how client information should be handled in a document like
   this, not a limitation of the mock.

   The funnel bars are drawn from the same FUNNEL array the recap section reads,
   so the two sections cannot disagree. */

const MAX = FUNNEL[0].value;

function FunnelBar({ item, index, previous }) {
  const width = (item.value / MAX) * 100;
  /* Step-to-step conversion, shown against the stage above rather than against
     the top of the funnel — that is the number a coordinator actually acts on. */
  const rate = previous ? Math.round((item.value / previous.value) * 100) : null;

  return (
    <motion.div variants={fadeUp} className="grid grid-cols-[100px_1fr] sm:grid-cols-[150px_1fr] gap-4 sm:gap-6 items-center">
      <span className="font-['Outfit'] text-[12.5px] sm:text-[13px] tracking-[0.16em] uppercase text-[var(--cw-ink-2)]">
        {item.label}
      </span>
      <div className="flex items-center gap-4 min-w-0">
        {/* Hollow track, solid fill. The fill was a 4.5%-alpha wash with a hairline
            edge, which on the black ground was all but invisible — the bar and the
            track were the same value and the proportions could not be read. A solid
            --cw-ink-2 fill works on both grounds without a per-tone variant. */}
        <div className="relative flex-1 h-[26px] min-w-0 border border-[var(--cw-line)] overflow-hidden">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-8%' }}
            transition={{ duration: 0.85, ease: EASE, delay: 0.1 + index * 0.09 }}
            style={{ width: `${width}%`, transformOrigin: 'left center' }}
            className="absolute inset-y-0 left-0 bg-[var(--cw-ink-2)]"
          />
        </div>
        <span className="cw-nums font-['Outfit'] text-[16px] sm:text-[17px] font-medium text-[var(--cw-ink)] w-[42px] text-right shrink-0">
          {item.value}
        </span>
        <span className="cw-nums hidden sm:block font-['Outfit'] text-[12px] tracking-[0.14em] text-[var(--cw-muted)] w-[52px] text-right shrink-0">
          {rate === null ? '—' : `${rate}%`}
        </span>
      </div>
    </motion.div>
  );
}

/* Cell tone. Never colour alone — the word in the cell is always the primary
   signal, and these only adjust emphasis. */
const toneFor = (value) => {
  if (['Confirmed', 'Complete', 'Yes', 'Allocated', 'Sent'].includes(value)) return 'text-[var(--cw-ink-2)]';
  if (['Awaiting', 'On hold', 'Scheduled'].includes(value)) return 'text-[var(--cw-attention)]';
  return 'text-[var(--cw-muted)]';
};

const COLUMNS = [
  { key: 'id',         label: 'Client' },
  { key: 'segment',    label: 'Segment' },
  { key: 'boutique',   label: 'Boutique owner' },
  { key: 'invitation', label: 'Invitation' },
  { key: 'rsvp',       label: 'RSVP' },
  { key: 'gifting',    label: 'Gifting' },
  { key: 'attended',   label: 'Attended' },
  { key: 'followUp',   label: 'Follow-up' },
];

export function ClientActivation() {
  return (
    <Section id="client-activation" label tone="dark">
      <motion.div {...revealProps} className="mb-14 md:mb-20">
        <SectionLabel className="mb-5">System / 02</SectionLabel>
        <SectionHeading id="client-activation-heading" className="mb-6">
          From invitation to follow-through.
        </SectionHeading>
        <SectionIntro>
          One record per client, from targeting to the conversation after. Anonymised throughout.
        </SectionIntro>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-16 xl:gap-20 items-start">
        {/* ── Funnel ── */}
        <motion.div {...revealProps}>
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-8 border-b border-[var(--cw-line-strong)]"
          >
            <span className="font-['Outfit'] text-[12px] md:text-[13px] font-semibold tracking-[0.17em] uppercase text-[var(--cw-ink)]">
              Activation funnel
            </span>
            <IllustrativeTag>Illustrative sample data</IllustrativeTag>
          </motion.div>

          {/* Column headers. "Step" previously sat BELOW the last bar, where it
              read as a stray word rather than as the heading for the rightmost
              column. Above the bars it does the job it was written for. */}
          <div className="hidden sm:flex items-center gap-4 pl-[150px] mb-3">
            <span className="flex-1" />
            <span className="font-['Outfit'] text-[11px] tracking-[0.15em] uppercase text-[var(--cw-muted)] w-[42px] text-right shrink-0">No.</span>
            <span className="font-['Outfit'] text-[11px] tracking-[0.15em] uppercase text-[var(--cw-muted)] w-[52px] text-right shrink-0">Step</span>
          </div>

          <div className="flex flex-col gap-3.5">
            {FUNNEL.map((item, i) => (
              <FunnelBar key={item.id} item={item} index={i} previous={i === 0 ? null : FUNNEL[i - 1]} />
            ))}
          </div>

          <motion.p
            variants={fadeUp}
            className="font-['Outfit'] text-[15px] md:text-[16px] leading-[1.75] text-[var(--cw-ink-2)] mt-9 border-l border-[var(--cw-line-strong)] pl-5 max-w-[460px]"
          >
            {ACTIVATION_NOTE}
          </motion.p>
        </motion.div>

        {/* ── Record view ── */}
        <motion.div {...revealProps}>
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-[var(--cw-line-strong)]"
          >
            <span className="font-['Outfit'] text-[12px] md:text-[13px] font-semibold tracking-[0.17em] uppercase text-[var(--cw-ink)]">
              Client record — extract
            </span>
            <IllustrativeTag>Anonymised · illustrative</IllustrativeTag>
          </motion.div>

          {/* The one element on the page allowed to exceed a narrow viewport.
              It scrolls inside its own container so the page body never does. */}
          <motion.div variants={fadeUp} className="cw-scroll-x -mx-6 px-6 md:mx-0 md:px-0">
            <table className="w-full min-w-[660px] border-collapse">
              <caption className="sr-only">
                Illustrative sample data. Anonymised extract of six client records
                showing invitation, RSVP, gifting, attendance and follow-up status.
              </caption>
              <thead>
                <tr>
                  {COLUMNS.map((c) => (
                    <th
                      key={c.key}
                      scope="col"
                      className="font-['Outfit'] text-[11px] tracking-[0.16em] uppercase text-[var(--cw-muted)] font-medium text-left pb-3 pr-5 whitespace-nowrap border-b border-[var(--cw-line-strong)]"
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CLIENTS.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--cw-line)]">
                    {COLUMNS.map((c) => (
                      <td
                        key={c.key}
                        className={`font-['Outfit'] text-[14px] md:text-[14.5px] py-3.5 pr-5 whitespace-nowrap ${
                          c.key === 'id' ? 'cw-nums text-[var(--cw-ink)] font-medium' : toneFor(row[c.key])
                        }`}
                      >
                        {row[c.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="font-['Outfit'] text-[13px] leading-[1.7] text-[var(--cw-muted)] mt-6"
          >
Client 004 confirmed and did not attend. The record stays open.
          </motion.p>
        </motion.div>
      </div>
    </Section>
  );
}
