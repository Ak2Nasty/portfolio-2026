import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import {
  Section, SectionLabel, SectionHeading, SectionIntro, IllustrativeTag,
} from './primitives';
import { fadeUp, revealProps } from './motion';
import { RECAP_METRICS, RECAP_QUALITATIVE, RECAP_NEXT } from '../data/applicationData';

/* ─── Post-activation recap ──────────────────────────────────────────────────
   The homepage's experience cards lean on oversized numerals, and that strength
   carries over here — but restrained. There, a metric is the loudest thing on
   the card and takes the brand colour. Here the numerals are large and plain
   white, set against generous space, with the qualitative reading given equal
   billing beside them. A recap that was only percentages would be the wrong
   answer to "the event ends, the learning doesn't".

   Every figure is derived in the data module from the funnel in System / 02,
   so the two sections cannot contradict each other. */

/* Counts up once on entry. The value is written into state rather than straight
   to the DOM because there are only four of them and they animate once — the
   scroll-linked DOM writes used elsewhere on the site exist to avoid re-renders
   on every frame of a continuous scroll, which is not the situation here. */
function CountUp({ value, suffix }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: '-15% 0px -15% 0px' });
  const [shown, setShown] = useState(reduced ? value : 0);

  useEffect(() => {
    /* Reduced motion never counts: the number is seeded at its final value in
       useState above, so there is nothing for this effect to do. Writing it
       here instead would be a setState in an effect body — a cascading render
       for a value that was already correct on the first one. */
    if (reduced || !inView) return undefined;

    let raf = 0;
    const start = performance.now();
    const DURATION = 1100;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, value]);

  return (
    /* The live number is hidden from assistive tech mid-count and the final
       value is exposed once, so a screen reader reads "53%" rather than every
       intermediate frame. */
    <span ref={ref} className="cw-nums inline-flex items-baseline">
      <span aria-hidden="true">{shown}</span>
      <span aria-hidden="true" className="text-[0.42em] ml-1 tracking-[0.1em] text-[var(--cw-muted)]">
        {suffix}
      </span>
      <span className="sr-only">{value}{suffix}</span>
    </span>
  );
}

function Metric({ item }) {
  return (
    <motion.div variants={fadeUp} className="flex flex-col border-t border-[var(--cw-line-strong)] pt-6">
      <span className="cw-display cw-display--figure text-[50px] sm:text-[60px] xl:text-[74px] text-[var(--cw-ink)] mb-5">
        <CountUp value={item.value} suffix={item.suffix} />
      </span>
      <span className="font-['Outfit'] text-[12.5px] font-semibold tracking-[0.15em] uppercase text-[var(--cw-ink)] mb-2">
        {item.label}
      </span>
      <span className="font-['Outfit'] text-[14px] leading-[1.6] text-[var(--cw-ink-2)]">
        {item.detail}
      </span>
    </motion.div>
  );
}

export function ActivationRecap() {
  return (
    <Section id="activation-recap" label tone="dark">
      <motion.div {...revealProps} className="mb-14 md:mb-20">
        <SectionLabel className="mb-5">System / 04</SectionLabel>
        <SectionHeading id="activation-recap-heading" className="mb-6">
          The event ends. The learning doesn&rsquo;t
        </SectionHeading>
        <SectionIntro>
          A recap is only useful if it changes the next one.
        </SectionIntro>
      </motion.div>

      <motion.div {...revealProps}>
        <motion.div variants={fadeUp} className="flex justify-end mb-8">
          <IllustrativeTag>Illustrative sample data</IllustrativeTag>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-10 sm:gap-8 xl:gap-10">
          {RECAP_METRICS.map((m) => (
            <Metric key={m.id} item={m} />
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-14 lg:gap-20 mt-20 md:mt-24">
        {/* Qualitative — deliberately beside the numbers, not beneath them */}
        <motion.div {...revealProps}>
          <motion.span
            variants={fadeUp}
            className="block font-['Outfit'] text-[12px] md:text-[13px] font-semibold tracking-[0.17em] uppercase text-[var(--cw-ink)] pb-5 mb-8 border-b border-[var(--cw-line-strong)]"
          >
            What the numbers don&rsquo;t say
          </motion.span>
          <dl className="flex flex-col gap-7">
            {RECAP_QUALITATIVE.map((q) => (
              <motion.div variants={fadeUp} key={q.label} className="flex flex-col gap-2">
                <dt className="font-['Outfit'] text-[11.5px] tracking-[0.15em] uppercase text-[var(--cw-accent)]">
                  {q.label}
                </dt>
                <dd className="font-['Outfit'] text-[15px] leading-[1.7] text-[var(--cw-ink-2)] m-0">
                  {q.value}
                </dd>
              </motion.div>
            ))}
          </dl>
        </motion.div>

        {/* Next actions */}
        <motion.div {...revealProps}>
          <motion.span
            variants={fadeUp}
            className="block font-['Outfit'] text-[12px] md:text-[13px] font-semibold tracking-[0.17em] uppercase text-[var(--cw-ink)] pb-5 mb-8 border-b border-[var(--cw-line-strong)]"
          >
            Three next actions
          </motion.span>
          <ol className="flex flex-col gap-6">
            {RECAP_NEXT.map((action, i) => (
              <motion.li variants={fadeUp} key={action} className="flex gap-5 items-start">
                <span className="cw-nums font-['Outfit'] text-[12px] tracking-[0.14em] text-[var(--cw-accent)] pt-[3px] shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-['Outfit'] text-[15px] leading-[1.7] text-[var(--cw-ink-2)]">
                  {action}
                </span>
              </motion.li>
            ))}
          </ol>
        </motion.div>
      </div>
    </Section>
  );
}
