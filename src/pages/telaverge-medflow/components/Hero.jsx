import { motion } from 'framer-motion';
import { ConceptTag } from './primitives';
import { fadeUp, revealProps } from './motion';
import { Icon } from './icons';
import { MedFlowScreen, DeviceFrame } from './screens';
import { STUDY } from '../data/caseStudyData';

/* ─── 01 · Hero ──────────────────────────────────────────────────────────────
   Four things have to land before a reader scrolls: what this is, that it is a
   study rather than shipped product work, what it looks like, and that the
   interface is conceptual.

   The device preview shows the ACTIVE INFUSION screen rather than the
   dashboard. The dashboard is where the workflow starts, but it is also the
   least distinctive screen in the set — a list of patient cards could belong to
   any product. The active screen is the one that says "this is a
   safety-critical instrument" in a single glance.

   The concept label sits directly under the title and the full disclaimer sits
   at the foot of the hero, not buried at the bottom of the page. The brief's
   instruction was "do not bury it, but do not let it dominate", so it is
   present, complete, and set at the size of a footnote rather than a warning. */

export function Hero() {
  return (
    <section id="hero" aria-labelledby="hero-heading" className="w-full relative">
      <div className="mf-shell max-w-[88rem] mx-auto px-6 md:px-10 lg:px-14 pt-16 md:pt-24 pb-14 md:pb-20">
        {/* The right column is a hard 380px, and the left is the one that
            flexes. As a fraction the right resolved to 343px at 1440, so the
            hero's device came out 37px narrower than the identical device in
            sections 09 and 10 — near enough to look like a mistake, far enough
            to trip the screen's own 340px container query and render the
            numeric fields a size smaller than they are everywhere else.

            minmax(0,380px) was not enough either: with an fr sibling whose
            min-content is a wide meta grid, the flexible track wins the argument
            and the capped one gets whatever is left, which at 1024px was 333px.
            A definite track and a minmax(0,1fr) beside it puts the shrinking
            where prose can absorb it. */}
        <motion.div {...revealProps} className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-12 lg:gap-16 items-start">
          {/* ── Left: the argument ── */}
          <div>
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-3 font-['Outfit'] text-[11px] font-semibold uppercase"
              style={{ letterSpacing: '0.2em', color: 'var(--mf-muted)' }}
            >
              <span aria-hidden="true" className="inline-block" style={{ width: 22, height: 1, background: 'var(--mf-accent)' }} />
              {STUDY.eyebrow}
            </motion.span>

            {/* ── The wordmark ──
                Monument Extended is an EXTENDED display face: it is drawn with
                wide sidebearings and it wants air. The portfolio's other
                headings carry -0.01em tracking, which suits them and actively
                damages this — at that setting the lowercase `l`, which in this
                face is a bare rectangular stem, collapsed toward the `F` and
                read as a stray bar rather than a letter. "MedFlow" rendered as
                something closer to "MedF|ow".

                Two changes: positive tracking instead of negative, and set in
                caps. Monument Extended is a caps-first face — its lowercase is
                the weakest part of it — and a product wordmark set in caps is
                what a device logotype looks like anyway. The `Fl` collision
                disappears entirely because `FL` has a foot on the L.

                Running text keeps "MedFlow" in mixed case, set in Outfit, where
                it reads correctly. A logotype and a word are allowed to differ. */}
            <motion.h1
              id="hero-heading"
              variants={fadeUp}
              className="mf-wordmark mt-6 leading-[0.94]"
              style={{
                color: 'var(--mf-ink)',
                fontSize: 'clamp(48px, 7.4vw, 92px)',
                letterSpacing: '0.005em',
              }}
            >
              <span className="sr-only">{STUDY.name}</span>
              <span aria-hidden="true">{STUDY.name.toUpperCase()}</span>
            </motion.h1>

            {/* The scope label, immediately under the name. Anyone who reads
                only the title and this line has still been told what it is. */}
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 font-['Outfit'] text-[10.5px] font-semibold uppercase mt-5 px-2.5 py-1.5 rounded-[3px]"
              style={{
                letterSpacing: '0.16em',
                color: 'var(--mf-accent)',
                background: 'var(--mf-accent-bg)',
                border: '1px solid var(--mf-accent-line)',
              }}
            >
              {STUDY.label}
            </motion.span>

            <motion.p
              variants={fadeUp}
              className="font-['Outfit'] mt-6 text-[18px] md:text-[21px] font-medium leading-[1.4]"
              style={{ color: 'var(--mf-ink)' }}
            >
              {STUDY.subtitle}
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="font-['Outfit'] mt-5 text-[15.5px] md:text-[16.5px] leading-[1.78] max-w-[58ch]"
              style={{ color: 'var(--mf-ink-2)' }}
            >
              {STUDY.lead}
            </motion.p>

            <motion.dl
              variants={fadeUp}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-6 mt-10 pt-8"
              style={{ borderTop: '1px solid var(--mf-line)' }}
            >
              {STUDY.meta.map(([k, v]) => (
                <div key={k}>
                  <dt
                    className="font-['Outfit'] text-[10px] font-semibold uppercase"
                    style={{ letterSpacing: '0.17em', color: 'var(--mf-muted)' }}
                  >
                    {k}
                  </dt>
                  <dd className="font-['Outfit'] text-[13px] leading-[1.5] mt-2 m-0" style={{ color: 'var(--mf-ink)' }}>
                    {v}
                  </dd>
                </div>
              ))}
            </motion.dl>

            <motion.a
              variants={fadeUp}
              href="#why"
              className="mf-btn mf-btn--primary mt-10 w-full sm:w-auto"
              style={{ letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: 12 }}
            >
              Explore the case study
              <Icon name="arrow-down" size={14} />
            </motion.a>
          </div>

          {/* ── Right: the artifact ── */}
          <motion.div variants={fadeUp} className="w-full flex flex-col lg:items-end">
            <DeviceFrame className="w-full max-w-[380px]">
              <MedFlowScreen id="active" />
            </DeviceFrame>
            <ConceptTag className="mt-4">Screen 07 &middot; conceptual interface</ConceptTag>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
