import { motion } from 'framer-motion';
import {
  Section, SectionLabel, SectionHeading, SectionIntro,
} from './primitives';
import { fadeUp, revealProps } from './motion';
import { EVIDENCE } from '../data/applicationData';

/* ─── Evidence ───────────────────────────────────────────────────────────────
   The only section on this page with no invented content, and therefore the one
   that has to carry the most weight. Everything here is a verified fact from a
   real role, reproduced exactly as supplied — no figure rounded, no
   responsibility widened, no adjective added. The whole page rests on this
   section being literally true, because it is the part a reference check lands
   on.

   IT WAS THE FLATTEST THING ON THE PAGE
   Four rows of bullet points, visually quieter than the illustrative scenarios
   above them — which had the credibility exactly backwards. The fix is not
   decoration: it is promoting the numbers that were already buried in the
   fourth or fifth bullet of each list up to display scale, where a hiring
   manager reads them in the first second. 30%. 8%. $2,500+. 3.

   The sentence each number came from still sits in the list underneath it, so
   nothing is asserted out of context. */

function EvidenceBlock({ item }) {
  const m = item.metric;
  return (
    <motion.article variants={fadeUp} className="cw-evidence group">
      <span aria-hidden="true" className="cw-evidence__ground" />

      <div className="cw-evidence__inner">
        {/* ── Identity ── */}
        <div className="flex flex-col">
          <span aria-hidden="true" className="cw-nums cw-evidence__num">{item.num}</span>

          <h3 className="cw-display cw-display--label text-[19px] sm:text-[22px] md:text-[26px] text-[var(--cw-ink)] mt-1">
            {item.org}
          </h3>

          <span className="font-['Outfit'] text-[11.5px] tracking-[0.16em] uppercase text-[var(--cw-muted)] mt-3">
            {item.role}
          </span>

          {/* The explicit line to the posting. */}
          <span className="inline-flex items-center gap-3 mt-6">
            <span aria-hidden="true" className="cw-evidence__tick" />
            <span className="font-['Outfit'] text-[9.5px] font-semibold tracking-[0.22em] uppercase text-[var(--cw-accent)]">
              {item.link}
            </span>
          </span>
        </div>

        {/* ── The number ──
            Pulled from this role's own verified points, not from anywhere else.
            Large enough to be the first thing read in the block. */}
        <div className="cw-evidence__metric">
          <span className="cw-display cw-display--figure cw-nums block text-[var(--cw-ink)] text-[46px] sm:text-[58px] md:text-[68px] xl:text-[80px]">
            {m.prefix ? <span className="cw-evidence__affix">{m.prefix}</span> : null}
            {m.value}
            {m.suffix ? <span className="cw-evidence__affix">{m.suffix}</span> : null}
          </span>
          <span className="font-['Outfit'] text-[10px] tracking-[0.2em] uppercase text-[var(--cw-muted)] block mt-3 max-w-[190px]">
            {m.label}
          </span>
        </div>

        {/* ── Verified points ── */}
        <ul className="flex flex-col gap-3.5">
          {item.points.map((p) => (
            <li key={p} className="flex gap-4 items-start">
              {/* A brilliant-cut facet, not the portfolio's registration
                  crosshair — that mark is engineering vocabulary and belongs on
                  the execution archive. */}
              <span aria-hidden="true" className="cw-facet mt-[6px]" />
              <span className="font-['Outfit'] text-[13px] md:text-[13.5px] leading-[1.7] text-[var(--cw-ink-2)]">
                {p}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}

export function ExperienceEvidence() {
  return (
    <Section id="evidence" label>
      <motion.div {...revealProps} className="mb-14 md:mb-20">
        <SectionLabel className="mb-5">Evidence / 05</SectionLabel>
        <SectionHeading id="evidence-heading" className="mb-6">
          Built from real-world execution.
        </SectionHeading>
        <SectionIntro>
          Everything above is a constructed scenario. Everything below is not.
        </SectionIntro>
      </motion.div>

      <motion.div {...revealProps} className="flex flex-col gap-5 md:gap-6">
        {EVIDENCE.map((item) => (
          <EvidenceBlock key={item.id} item={item} />
        ))}
      </motion.div>
    </Section>
  );
}
