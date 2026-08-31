import { motion } from 'framer-motion';
import {
  Section, SectionHead, Prose, Label,
} from './primitives';
import { fadeUp, revealProps } from './motion';
import { Icon } from './icons';
import { CAPABILITIES, DISCLAIMER } from '../data/caseStudyData';

/* ─── 18 · What I learned ────────────────────────────────────────────────────
   First person, and the only section on the page with no diagram, no table and
   no interface. After seventeen sections of structure, the argument needs
   somewhere to be said plainly.

   The closing line is the thesis of the whole study compressed to one sentence,
   so it is set as a pull quote rather than buried in a paragraph. */

export function WhatILearned() {
  return (
    <Section id="learned" alt>
      <motion.div {...revealProps}>
        <SectionHead
          id="learned"
          n="18"
          label="Reflection"
          heading="What changed in my thinking"
        />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] gap-10 lg:gap-16 items-start">
          <motion.div variants={fadeUp} className="flex flex-col gap-5">
            <Prose>
              Building MedFlow changed the way I thought about interface design. In conventional
              digital products, friction usually affects conversion, engagement, or satisfaction. In
              a safety-critical product, ambiguity, poor feedback, or an unclear workflow can have
              much more serious consequences.
            </Prose>
            <Prose>
              The exercise pushed me to think beyond individual screens and consider the complete
              system: the user, the task, the environment, foreseeable errors, interface states,
              recovery paths, testing strategy, and the documentation behind each decision.
            </Prose>
            <Prose>
              The most useful habit it built was asking &ldquo;what happens when this goes
              wrong?&rdquo; before asking &ldquo;does this look right?&rdquo; &mdash; and treating
              the answer as a design requirement rather than as an edge case to handle later.
            </Prose>
          </motion.div>

          <motion.blockquote
            variants={fadeUp}
            className="m-0 p-6 md:p-8 rounded-[4px]"
            style={{ background: 'var(--mf-accent-bg)', border: '1px solid var(--mf-accent-line)' }}
          >
            <Label tone="accent" className="mb-5">The takeaway</Label>
            <p
              className="font-['Outfit'] text-[19px] md:text-[23px] leading-[1.45] font-medium m-0"
              style={{ color: 'var(--mf-accent)', letterSpacing: '-0.01em' }}
            >
              Good medical UX is not about making a complicated interface look simple. It is about
              making important actions, information, risks, and system states difficult to
              misunderstand.
            </p>
          </motion.blockquote>
        </div>
      </motion.div>
    </Section>
  );
}

/* ─── 19 · Capabilities ──────────────────────────────────────────────────────
   Ten capabilities, each linking to the section that evidences it. The links
   are the whole reason this section is defensible rather than a keyword list:
   nothing is claimed here that is not demonstrated above, and a sceptical
   reader can check any single claim in one click.

   Not titled "JD alignment", per the brief — and it should not be. A capability
   summary at the end of a case study is a normal thing for a case study to
   have; a section that announces it was written against a job description is
   not. */

export function Capabilities() {
  return (
    <Section id="capabilities">
      <motion.div {...revealProps}>
        <SectionHead
          id="capabilities"
          n="19"
          label="Summary"
          heading="Capabilities explored"
          lead="Each of these links to the section of this study that demonstrates it. Nothing is claimed here that is not shown above."
        />

        <motion.div
          variants={fadeUp}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
        >
          {CAPABILITIES.map((c, i) => (
            <a
              key={c.title}
              href={`#${c.section}`}
              className="group mf-lift rounded-[4px] border p-5 flex flex-col"
              style={{ background: 'var(--mf-surface)', borderColor: 'var(--mf-line)' }}
            >
              <span className="flex items-center justify-between gap-3 mb-3">
                <span
                  className="font-['Outfit'] text-[10.5px] font-semibold tabular-nums"
                  style={{ letterSpacing: '0.12em', color: 'var(--mf-muted)' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  aria-hidden="true"
                  className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300"
                  style={{ color: 'var(--mf-accent)' }}
                >
                  <Icon name="arrow-right" size={13} />
                </span>
              </span>

              <span
                className="font-['Outfit'] text-[14px] font-semibold leading-[1.35] mb-2"
                style={{ color: 'var(--mf-ink)' }}
              >
                {c.title}
              </span>
              <span className="font-['Outfit'] text-[12.5px] leading-[1.5]" style={{ color: 'var(--mf-ink-2)' }}>
                {c.body}
              </span>
            </a>
          ))}
        </motion.div>
      </motion.div>
    </Section>
  );
}

/* ─── 20 · Closing ───────────────────────────────────────────────────────────
   The one inverted band on the page, used here and nowhere else. Twenty
   sections of paper need a full stop, and inverting the ground is the quietest
   way to make one — no new colours, no new type, just the token set flipped.

   The full disclaimer sits here in complete form. It is also in the hero; a
   reader who lands mid-page from a link, reads two sections and leaves, and a
   reader who reads to the end, should both have seen it. */

export function Closing() {
  return (
    <Section id="closing" tone="dark">
      <motion.div {...revealProps}>
        <motion.span variants={fadeUp} className="flex items-center gap-3 mb-6">
          <span aria-hidden="true" className="mf-mark" />
          <span aria-hidden="true" className="mf-rule" />
        </motion.span>

        <motion.span variants={fadeUp} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-6">
          <span
            className="font-['Outfit'] text-[11px] font-semibold uppercase tabular-nums"
            style={{ letterSpacing: '0.18em', color: 'var(--mf-accent)' }}
          >
            20
          </span>
          <span
            className="font-['Outfit'] text-[11px] font-semibold uppercase"
            style={{ letterSpacing: '0.18em', color: 'var(--mf-muted)' }}
          >
            Closing
          </span>
        </motion.span>

        <motion.h2
          id="closing-heading"
          variants={fadeUp}
          className="font-['Outfit'] font-semibold leading-[1.28] text-[21px] sm:text-[26px] md:text-[32px] max-w-[30ch]"
          style={{ color: 'var(--mf-ink)', letterSpacing: '-0.015em' }}
        >
          MedFlow is not presented as finished medical-device engineering work.
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="font-['Outfit'] text-[16px] md:text-[18px] leading-[1.72] max-w-[62ch] mt-7"
          style={{ color: 'var(--mf-ink-2)' }}
        >
          It represents how I approach an unfamiliar, high-accountability design problem: understand
          the user, understand the workflow, identify where interaction can fail, design
          deliberately, test assumptions, document decisions, and iterate.
        </motion.p>

        <motion.p
          variants={fadeUp}
          className="font-['Outfit'] text-[13.5px] uppercase mt-8"
          style={{ letterSpacing: '0.15em', color: 'var(--mf-muted)' }}
        >
          Prepared as an independent exploration of safety-oriented digital product design.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 mt-10">
          <a href="#prototype" className="mf-btn mf-btn--primary">
            View interactive prototype
            <Icon name="arrow-down" size={14} />
          </a>
          {/* Absolute URL in a new tab, so the portfolio's own entrance
              animation plays from the beginning rather than the router
              swapping the page in behind it. */}
          <a
            href="https://akshathdayansuresh.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="mf-btn mf-btn--secondary"
          >
            Back to portfolio
            <Icon name="external" size={14} />
          </a>
        </motion.div>

        {/* The full disclaimer, complete, at the close. */}
        <motion.div
          variants={fadeUp}
          className="mt-14 pt-8 max-w-[86ch]"
          style={{ borderTop: '1px solid var(--mf-line)' }}
        >
          <Label className="mb-4">Disclaimer</Label>
          <p className="font-['Outfit'] text-[12.5px] md:text-[13px] leading-[1.75] m-0" style={{ color: 'var(--mf-muted)' }}>
            {DISCLAIMER}
          </p>
        </motion.div>
      </motion.div>
    </Section>
  );
}
