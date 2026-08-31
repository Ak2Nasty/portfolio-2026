import { motion } from 'framer-motion';
import {
  Section, SectionHead, Prose, Label, Card, ConceptTag, Field,
} from './primitives';
import { fadeUp, stepIn, revealProps, chainReveal } from './motion';
import { Icon } from './icons';
import { TherapyDiagram } from './TherapyDiagram';
import { SCENARIO, HF_PILLARS, HF_CHAIN, PATIENT_PROFILE, NURSE_PROFILE, USE_NARRATIVE } from '../data/caseStudyData';

/* ─── 02 · Why this study ────────────────────────────────────────────────────
   The honesty section, and it goes second on purpose. A reader who reaches the
   interface work without first being told this is a learning exercise by
   someone outside the domain will read every screen as a claim of experience.
   Saying it early costs nothing and buys the rest of the page its credibility.

   The comparison in the middle is the actual thesis of the whole study, so it
   is set as two contrasting cards rather than a sentence. */

export function WhyThisStudy() {
  return (
    <Section id="why" alt>
      <motion.div {...revealProps}>
        <SectionHead
          id="why"
          n="02"
          label="Why this study"
          heading="What separates ordinary UX from safety-critical UX"
        />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-10 lg:gap-16 items-start">
          <motion.div variants={fadeUp} className="flex flex-col gap-5">
            <Prose>
              I approached this exercise after reviewing a UI/UX Developer role focused on
              medical and digital-health applications. What stood out was that the role went
              beyond interface design: it connected UX decisions with Human Factors, task
              analysis, use-related risk, usability evaluation, design systems, and
              regulatory-oriented documentation.
            </Prose>
            <Prose>
              Medical-device UX is a new domain for me, so rather than presenting myself as an
              experienced Human Factors engineer, I used this study to understand how safety
              considerations change the way a designer approaches a workflow.
            </Prose>
          </motion.div>

          {/* The thesis. Two cards, a connector between them, and the second one
              carries the weight — that is the whole shift being described. */}
          <motion.div variants={fadeUp} className="flex flex-col items-stretch">
            <Card className="p-5 md:p-6">
              <Label>Conventional UX</Label>
              <p
                className="font-['Outfit'] text-[16px] md:text-[17.5px] leading-[1.55] mt-3 m-0"
                style={{ color: 'var(--mf-ink-2)' }}
              >
                Can the user complete the task easily?
              </p>
            </Card>

            <span aria-hidden="true" className="flex justify-center py-3" style={{ color: 'var(--mf-accent-line)' }}>
              <Icon name="arrow-down" size={18} />
            </span>

            <Card tone="accent" className="p-5 md:p-6">
              <Label tone="accent">Safety-critical UX</Label>
              <p
                className="font-['Outfit'] text-[16px] md:text-[17.5px] leading-[1.55] mt-3 m-0 font-medium"
                style={{ color: 'var(--mf-accent)' }}
              >
                Can the user complete the task safely and effectively, including under
                foreseeable error conditions?
              </p>
            </Card>
          </motion.div>
        </div>

        <motion.div
          variants={fadeUp}
          className="mt-10 md:mt-14 pt-8"
          style={{ borderTop: '1px solid var(--mf-line)' }}
        >
          <Prose wide className="font-medium" >
            The goal was not to design a clinically deployable infusion system. The goal was to
            demonstrate the thinking process I would bring into a regulated product team.
          </Prose>
        </motion.div>
      </motion.div>
    </Section>
  );
}

/* ─── 03 · The scenario ──────────────────────────────────────────────────────
   Everything downstream — the workflow, the risk rows, the eight screens, the
   proposed test protocol — describes this one situation. Fixing it precisely
   here is what stops the rest of the document from being generic.

   The fictional-content statement is not a footnote in this section. It is a
   line of body copy in the flow, because a page carrying a named patient with
   a date of birth and a medical record number has to be unambiguous about that
   the first time the reader meets it. */

export function Scenario() {
  const { patient, user, environment, situation, order } = SCENARIO;
  return (
    <Section id="scenario">
      <motion.div {...revealProps}>
        <SectionHead
          id="scenario"
          n="03"
          label="The scenario"
          heading="A safety-critical workflow"
          lead={situation}
        />

        <motion.div variants={fadeUp} className="mb-8">
          <p
            className="font-['Outfit'] text-[13.5px] leading-[1.6] m-0 pl-4"
            style={{ color: 'var(--mf-muted)', borderLeft: '2px solid var(--mf-line-strong)' }}
          >
            All identities, medication names, clinical values and scenarios on this page are
            fictional. &ldquo;Med-A&rdquo; is a placeholder rather than a real medication, and the
            values shown are illustrative UI content &mdash; they are not, and must not be read as,
            appropriate dosing.
          </p>
        </motion.div>

        {/* ── 03a · What an infusion is ──
            The explainer the study was missing. Without it, a non-clinical
            reader has no way to judge whether the discrepancy guard several
            sections below solves a real problem or an invented one. */}
        <motion.div variants={fadeUp} className="mb-12 md:mb-16">
          <Label className="mb-6">First, what is actually being delivered</Label>
          <TherapyDiagram />
        </motion.div>

        {/* ── 03b · The two people ── */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
          {[PATIENT_PROFILE, NURSE_PROFILE].map((prof, i) => (
            <Card key={prof.heading} className="p-5 md:p-6">
              <span className="flex items-center gap-3 mb-5">
                <span style={{ color: 'var(--mf-accent)' }}>
                  <Icon name={i === 0 ? 'wristband' : 'user'} size={18} />
                </span>
                <span
                  className="font-['Outfit'] text-[12px] font-semibold uppercase"
                  style={{ letterSpacing: '0.15em', color: 'var(--mf-accent)' }}
                >
                  {prof.heading}
                </span>
              </span>

              <dl className="flex flex-col gap-3">
                {prof.lines.map(([k, v]) => (
                  <div key={k} className="flex flex-col sm:flex-row gap-1 sm:gap-5">
                    <dt
                      className="font-['Outfit'] text-[10px] font-semibold uppercase sm:w-[104px] sm:shrink-0 sm:pt-[3px]"
                      style={{ letterSpacing: '0.14em', color: 'var(--mf-muted)' }}
                    >
                      {k}
                    </dt>
                    <dd className="font-['Outfit'] text-[13.5px] leading-[1.6] m-0" style={{ color: 'var(--mf-ink-2)' }}>
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>

              <p
                className="font-['Outfit'] text-[12.5px] leading-[1.6] mt-5 pt-4 m-0"
                style={{ color: 'var(--mf-muted)', borderTop: '1px solid var(--mf-line)' }}
              >
                {prof.note}
              </p>
            </Card>
          ))}
        </motion.div>

        {/* ── 03c · How they actually meet the product ──
            The narrative spine. Sections 06 through 10 formalise exactly this
            sequence, so a reader who only reads section 03 has still followed
            the whole workflow once in plain language. */}
        <motion.div variants={fadeUp} className="mb-12 md:mb-16">
          <Label className="mb-5">How the app gets used, start to finish</Label>
          <ol className="grid grid-cols-1 md:grid-cols-2 gap-3 m-0 p-0 list-none">
            {USE_NARRATIVE.map((u) => (
              <li key={u.n}>
                <div
                  className="flex items-start gap-3.5 p-4 rounded-[4px] h-full"
                  style={{ background: 'var(--mf-surface)', border: '1px solid var(--mf-line)' }}
                >
                  <span
                    className="grid place-items-center shrink-0"
                    style={{
                      width: 30, height: 30, borderRadius: 4,
                      background: 'var(--mf-accent-bg)', color: 'var(--mf-accent)',
                    }}
                  >
                    <Icon name={u.icon} size={15} />
                  </span>
                  <span className="flex flex-col min-w-0">
                    <span className="flex items-baseline gap-2.5 mb-1.5">
                      <span
                        className="font-['Outfit'] text-[10px] font-semibold tabular-nums"
                        style={{ letterSpacing: '0.12em', color: 'var(--mf-muted)' }}
                      >
                        {u.n}
                      </span>
                      <span
                        className="font-['Outfit'] text-[10px] font-semibold uppercase"
                        style={{ letterSpacing: '0.13em', color: 'var(--mf-accent)' }}
                      >
                        {u.actor}
                      </span>
                    </span>
                    <span className="font-['Outfit'] text-[13.5px] leading-[1.6]" style={{ color: 'var(--mf-ink-2)' }}>
                      {u.text}
                    </span>
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </motion.div>

        <Label className="mb-5">The scenario, in reference form</Label>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
          {/* ── Who and where ── */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5">
              <Label className="mb-3">Patient</Label>
              <span className="flex items-center gap-3">
                <span
                  className="grid place-items-center shrink-0 text-[12px] font-semibold"
                  style={{ width: 34, height: 34, borderRadius: 999, background: 'var(--mf-accent-bg)', color: 'var(--mf-accent)' }}
                >
                  {patient.initials}
                </span>
                <span className="flex flex-col">
                  <span className="font-['Outfit'] text-[15px] font-semibold leading-tight" style={{ color: 'var(--mf-ink)' }}>
                    {patient.name}
                  </span>
                  <span className="font-['Outfit'] text-[12px] leading-tight mt-1" style={{ color: 'var(--mf-muted)' }}>
                    {patient.age}
                  </span>
                </span>
              </span>
              <p className="font-['Outfit'] text-[13px] leading-[1.6] mt-4 m-0" style={{ color: 'var(--mf-ink-2)' }}>
                {patient.context}
                <br />
                {patient.room}
              </p>
            </Card>

            <Card className="p-5">
              <Label className="mb-3">Primary user</Label>
              <span className="flex items-center gap-3">
                <span className="shrink-0" style={{ color: 'var(--mf-accent)' }}>
                  <Icon name="user" size={20} />
                </span>
                <span className="font-['Outfit'] text-[15px] font-semibold" style={{ color: 'var(--mf-ink)' }}>
                  {user.name}
                </span>
              </span>
              <p className="font-['Outfit'] text-[13px] leading-[1.6] mt-4 m-0" style={{ color: 'var(--mf-ink-2)' }}>
                {user.role}
              </p>
            </Card>

            <Card className="p-5">
              <Label className="mb-3">Environment</Label>
              <span className="flex items-center gap-3">
                <span className="shrink-0" style={{ color: 'var(--mf-accent)' }}>
                  <Icon name="ward" size={20} />
                </span>
                <span className="font-['Outfit'] text-[15px] font-semibold" style={{ color: 'var(--mf-ink)' }}>
                  Ward
                </span>
              </span>
              <p className="font-['Outfit'] text-[13px] leading-[1.6] mt-4 m-0" style={{ color: 'var(--mf-ink-2)' }}>
                {environment}
              </p>
            </Card>
          </motion.div>

          {/* ── The simulated order ──
              Styled as the prescribed block from the interface itself, so the
              reader meets the visual language of "read-only" before they meet
              the screen that depends on it. */}
          <motion.div variants={fadeUp}>
            <Card className="p-5 md:p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <Label>Simulated order</Label>
                <span style={{ color: 'var(--mf-muted)' }}><Icon name="lock" size={13} /></span>
              </div>
              <dl className="flex flex-col gap-3.5">
                <Field label="Medication" value={order.medication} />
                <Field label="Concentration" value={order.concentration} mono />
                <Field label="Infusion rate" value={order.rate} mono />
                <Field label="Volume" value={order.volume} mono />
                <Field label="Ordered by" value={order.prescriber} />
              </dl>
              <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--mf-line)' }}>
                <ConceptTag>Illustrative UI content &middot; not dosing guidance</ConceptTag>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </Section>
  );
}

/* ─── 04 · Human factors ─────────────────────────────────────────────────────
   Three pillars and a chain. The chain is the important half: it is the model
   the whole rest of the document follows, and sections 05 through 14 are
   literally its stages worked through in order.

   The chain arrives one stage at a time on entry, once. Not scroll-linked — a
   scroll-linked chain sits half-drawn whenever the reader stops, which on a
   process diagram reads as "this process is 60% complete". */

const TONE_STYLE = {
  neutral: { color: 'var(--mf-ink)', background: 'var(--mf-surface)', borderColor: 'var(--mf-line-strong)' },
  attn: { color: 'var(--mf-attn)', background: 'var(--mf-attn-bg)', borderColor: 'var(--mf-attn-line)' },
  accent: { color: 'var(--mf-accent)', background: 'var(--mf-accent-bg)', borderColor: 'var(--mf-accent-line)' },
  info: { color: 'var(--mf-info)', background: 'var(--mf-info-bg)', borderColor: 'var(--mf-info-line)' },
};

export function HumanFactors() {
  return (
    <Section id="human-factors" alt>
      <motion.div {...revealProps}>
        <SectionHead
          id="human-factors"
          n="04"
          label="Human factors"
          heading="Designing around the human"
          lead="Human Factors Engineering asks designers to consider the capabilities, limitations, behaviors, tasks, and environments of the people interacting with a system. In a safety-critical context, predictable user mistakes must be considered as part of the design problem rather than treated simply as user failure."
        />

        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {HF_PILLARS.map((p) => (
            <Card key={p.id} className="p-5 md:p-6 flex flex-col">
              <span className="flex items-center gap-3 mb-3">
                <span style={{ color: 'var(--mf-accent)' }}><Icon name={p.icon} size={18} /></span>
                <span
                  className="font-['Outfit'] text-[12px] font-semibold uppercase"
                  style={{ letterSpacing: '0.16em', color: 'var(--mf-accent)' }}
                >
                  {p.title}
                </span>
              </span>

              <p className="font-['Outfit'] text-[14px] leading-[1.6] m-0 mb-5" style={{ color: 'var(--mf-ink-2)' }}>
                {p.blurb}
              </p>

              <ul className="flex flex-col gap-2.5 mt-auto m-0 p-0 list-none">
                {p.items.map((it) => (
                  <li key={it} className="flex items-start gap-2.5">
                    <span
                      aria-hidden="true"
                      className="shrink-0 mt-[7px]"
                      style={{ width: 4, height: 4, borderRadius: 999, background: 'var(--mf-accent-line)' }}
                    />
                    <span className="font-['Outfit'] text-[13.5px] leading-[1.5]" style={{ color: 'var(--mf-ink-2)' }}>
                      {it}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </motion.div>

        {/* ── The model the rest of the document follows ── */}
        <motion.div {...chainReveal} className="mt-12 md:mt-16 pt-10" style={{ borderTop: '1px solid var(--mf-line)' }}>
          <motion.div variants={stepIn}>
            <Label className="mb-6">How the three become a design decision</Label>
          </motion.div>

          <div className="flex flex-col md:flex-row md:items-stretch gap-0">
            {HF_CHAIN.map((c, i) => (
              <motion.div key={c.label} variants={stepIn} className="flex md:flex-1 md:flex-col items-stretch">
                <span
                  className="flex-1 flex items-center justify-center text-center rounded-[4px] border px-4 py-4 font-['Outfit'] text-[12.5px] md:text-[13px] font-semibold leading-[1.4]"
                  style={TONE_STYLE[c.tone]}
                >
                  {c.label}
                </span>
                {i < HF_CHAIN.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="flex items-center justify-center shrink-0 py-2 md:py-0 md:px-2"
                    style={{ color: 'var(--mf-line-strong)' }}
                  >
                    <span className="md:hidden"><Icon name="arrow-down" size={15} /></span>
                    <span className="hidden md:block"><Icon name="arrow-right" size={15} /></span>
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </Section>
  );
}
