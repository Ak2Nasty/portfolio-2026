import { motion } from 'framer-motion';
import {
  Section, SectionLabel, SectionHeading, SectionIntro, StatusChip,
} from './primitives';
import { fadeUp, revealProps } from './motion';
import { DOCUMENTS, RETAIL_STATEMENT } from '../data/applicationData';
import { DocumentIcon } from './icons';

/* ─── Retail readiness ───────────────────────────────────────────────────────
   Three miniature operational documents, built as real HTML rather than
   screenshots. That is a deliberate choice with consequences: the text is
   selectable, searchable, translatable, it reflows on a phone instead of
   forcing a pinch-zoom, it costs no image bytes, and a screen reader can read
   the whole document out as a definition list.

   Each carries only enough to show the structure — objective, date, required
   action, owner, dependency, escalation, status. A real document would run
   longer; the argument here is about the shape, not the length. */

function DocumentCard({ doc }) {
  return (
    <motion.article
      variants={fadeUp}
      className="cw-bezel-corners group relative flex flex-col bg-[var(--cw-surface)] border border-[var(--cw-line)] hover:border-[var(--cw-line-strong)] transition-colors duration-500 h-full"
    >
      {/* Header band — the document's identity strip.
          STACKED on narrow screens, side by side from sm up. Side by side at
          every width was the bug: the status chip is shrink-0 and grew to 167px
          with the type-scale lift, which squeezed the left column to almost
          nothing and broke "WFJ / VM / 021" onto one character per line with
          the chip overlapping it. whitespace-nowrap on the ref makes that
          unrecoverable rather than merely ugly if the layout is ever squeezed
          again. */}
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 px-6 py-5 border-b border-[var(--cw-line)]">
        <div className="flex items-start gap-3.5 min-w-0">
          {/* Document mark. Decorative beside a label that already names the
              kind, so aria-hidden; it takes the accent on hover with the rule
              at the foot of the card. */}
          <span className="shrink-0 mt-[1px] text-[var(--cw-muted)] group-hover:text-[var(--cw-accent)] transition-colors duration-500">
            <DocumentIcon name={doc.icon} className="w-[18px] h-[18px] block" />
          </span>
          <span className="flex flex-col gap-1.5 min-w-0">
            <span className="font-['Outfit'] text-[11px] tracking-[0.16em] uppercase text-[var(--cw-accent)] whitespace-nowrap">
              {doc.kind}
            </span>
            <span className="cw-nums font-['Outfit'] text-[11px] tracking-[0.14em] uppercase text-[var(--cw-muted)] whitespace-nowrap">
              {doc.ref}
            </span>
          </span>
        </div>
        <StatusChip status={doc.status} className="shrink-0 self-start" />
      </header>

      <div className="flex flex-col flex-1 px-6 py-6">
        <h3 className="font-['Outfit'] text-[16.5px] md:text-[17px] font-medium leading-[1.4] text-[var(--cw-ink)] mb-6 pb-5 border-b border-[var(--cw-line)]">
          {doc.title}
        </h3>

        <dl className="flex flex-col gap-4 flex-1">
          {doc.fields.map((f) => (
            <div key={f.label} className="flex flex-col gap-1">
              <dt className="font-['Outfit'] text-[11px] tracking-[0.15em] uppercase text-[var(--cw-muted)]">
                {f.label}
              </dt>
              <dd className="font-['Outfit'] text-[14.5px] font-medium leading-[1.6] text-[var(--cw-ink-2)] m-0">
                {f.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Knurled foot — the milled grip of a crown, so the card reads as a
          machined object rather than a rectangle. The rule beneath it extends
          on hover, the page's recurring gesture. Decorative only. */}
      <div aria-hidden="true" className="relative h-[7px] w-full cw-knurl opacity-50" />
      <div aria-hidden="true" className="h-px w-full bg-[var(--cw-line)] relative overflow-hidden">
        <span className="absolute inset-y-0 left-0 w-0 bg-[var(--cw-accent)] transition-[width] duration-700 ease-out group-hover:w-full motion-reduce:transition-none" />
      </div>
    </motion.article>
  );
}

export function RetailReadiness() {
  return (
    <Section id="retail-readiness" label>
      <motion.div {...revealProps} className="mb-14 md:mb-20">
        <SectionLabel className="mb-5">System / 03</SectionLabel>
        <SectionHeading id="retail-readiness-heading" className="mb-6">
          Clear in the boutique before the client sees it
        </SectionHeading>
        <SectionIntro>
          {RETAIL_STATEMENT}
        </SectionIntro>
      </motion.div>

      <motion.div {...revealProps} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8 items-stretch">
        {DOCUMENTS.map((doc) => (
          <DocumentCard key={doc.id} doc={doc} />
        ))}
      </motion.div>

      <motion.div {...revealProps} className="mt-12">
        <motion.p
          variants={fadeUp}
          className="font-['Outfit'] text-[15px] md:text-[16px] leading-[1.75] text-[var(--cw-ink-2)] max-w-[660px]"
        >
The checklist carries the same vendor dependency flagged in System / 01 — named identically, so nobody has to ask whether it is one issue or two.
        </motion.p>
      </motion.div>
    </Section>
  );
}
