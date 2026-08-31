import { motion } from 'framer-motion';
import {
  Section, SectionHead, Prose, Label, Card, ScopeNote, Ref,
} from './primitives';
import { fadeUp, stepIn, revealProps, chainReveal } from './motion';
import { Icon } from './icons';
import {
  STUDY_TASKS, OBSERVATIONS, STUDY_LOOP, ITERATION, SCENARIO,
} from '../data/caseStudyData';

/* ─── 13 · Proposed formative usability study ────────────────────────────────
   EVERY VERB IN THIS SECTION IS CONDITIONAL, and that is not stylistic
   hedging — it is the difference between describing a method and claiming a
   result. No participant has ever seen MedFlow. Nothing here was run.

   The section is written as a protocol rather than as a description because a
   protocol is checkable: a reader who knows this domain can look at the task
   list and the observation list and judge whether the person who wrote it
   understands what a formative study is for.

   Sample size is deliberately absent. Naming a number would be inventing a
   study design decision that depends on the programme, the risk profile and
   the stage — and picking "5 participants" because it is the number people
   quote would be exactly the kind of borrowed authority this page avoids. */

export function ProposedStudy() {
  return (
    <Section id="proposed-study">
      <motion.div {...revealProps}>
        <SectionHead
          id="proposed-study"
          n="13"
          label="Proposed evaluation"
          heading="How I would test it"
          lead="Interface assumptions should be tested rather than treated as facts. If this were a real development program, I would expect representative users and Human Factors specialists to evaluate the workflow iteratively."
        />

        <motion.div variants={fadeUp} className="mb-8">
          <ScopeNote>
            This is a proposed protocol. No usability study has been conducted, no participants
            have been recruited, and no data exists. Nothing in this section should be read as a
            finding.
          </ScopeNote>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 md:gap-8 items-start">
          {/* ── Setup ── */}
          <motion.div variants={fadeUp} className="flex flex-col gap-5">
            <Card className="p-5 md:p-6">
              <Label className="mb-3">Participants</Label>
              <p className="font-['Outfit'] text-[14.5px] leading-[1.65] m-0" style={{ color: 'var(--mf-ink-2)' }}>
                Representative nurses familiar with the relevant clinical workflow.
              </p>
              <p className="font-['Outfit'] text-[12.5px] leading-[1.55] mt-3 m-0" style={{ color: 'var(--mf-muted)' }}>
                No sample size is proposed here. That is a study design decision that depends on the
                programme stage and risk profile, and naming a number would be inventing one.
              </p>
            </Card>

            <Card className="p-5 md:p-6">
              <Label className="mb-3">Simulated scenario</Label>
              <p
                className="font-['Outfit'] text-[14.5px] leading-[1.65] m-0 pl-4"
                style={{ color: 'var(--mf-ink-2)', borderLeft: '2px solid var(--mf-accent-line)' }}
              >
                &ldquo;You are caring for {SCENARIO.patient.name} following surgery. Using the
                provided simulated order, verify the patient and configure the prescribed
                infusion.&rdquo;
              </p>
            </Card>

            <Card className="p-5 md:p-6">
              <Label className="mb-4">What I would observe</Label>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 m-0 p-0 list-none">
                {OBSERVATIONS.map((o) => (
                  <li key={o} className="flex items-start gap-2.5">
                    <span
                      aria-hidden="true"
                      className="shrink-0 mt-[7px]"
                      style={{ width: 4, height: 4, borderRadius: 999, background: 'var(--mf-accent-line)' }}
                    />
                    <span className="font-['Outfit'] text-[13.5px] leading-[1.5]" style={{ color: 'var(--mf-ink-2)' }}>{o}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>

          {/* ── Tasks ── */}
          <motion.div variants={fadeUp}>
            <Label className="mb-5">Task list</Label>
            <ol className="flex flex-col gap-2 m-0 p-0 list-none">
              {STUDY_TASKS.map((t, i) => {
                /* Tasks 5 and 6 are the introduced discrepancy and the
                   recovery from it — the pair the whole protocol exists to
                   observe, so they are marked. */
                const isCore = i === 4 || i === 5;
                return (
                  <li key={t}>
                    <div
                      className="flex items-start gap-3.5 px-4 py-3 rounded-[4px] border"
                      style={{
                        background: isCore ? 'var(--mf-accent-bg)' : 'var(--mf-surface)',
                        borderColor: isCore ? 'var(--mf-accent-line)' : 'var(--mf-line)',
                      }}
                    >
                      <span
                        className="font-['Outfit'] text-[11.5px] font-semibold tabular-nums shrink-0 pt-[2px]"
                        style={{ color: isCore ? 'var(--mf-accent)' : 'var(--mf-muted)', minWidth: 16 }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        className="font-['Outfit'] text-[14px] leading-[1.45]"
                        style={{ color: isCore ? 'var(--mf-accent)' : 'var(--mf-ink-2)', fontWeight: isCore ? 600 : 400 }}
                      >
                        {t}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>

            <p className="font-['Outfit'] text-[12.5px] leading-[1.55] mt-4 m-0" style={{ color: 'var(--mf-muted)' }}>
              Tasks 05 and 06 are the reason the protocol exists. Whether a participant notices the
              discrepancy, understands what the interface is telling them, and can recover from it
              is the question the whole design is making a bet on.
            </p>
          </motion.div>
        </div>

        {/* ── The loop ── */}
        <motion.div {...chainReveal} className="mt-12 md:mt-16 pt-10" style={{ borderTop: '1px solid var(--mf-line)' }}>
          <motion.div variants={stepIn}>
            <Label className="mb-6">Formative, iterative</Label>
          </motion.div>

          <div className="flex flex-col md:flex-row md:items-stretch">
            {STUDY_LOOP.map((s, i) => (
              <motion.div key={s} variants={stepIn} className="flex md:flex-1 md:flex-col items-stretch">
                <span
                  className="flex-1 flex items-center justify-center text-center rounded-[4px] border px-3 py-4 font-['Outfit'] text-[12.5px] font-semibold leading-[1.35]"
                  style={{ background: 'var(--mf-surface)', borderColor: 'var(--mf-line-strong)', color: 'var(--mf-ink)' }}
                >
                  {s}
                </span>
                <span
                  aria-hidden="true"
                  className="flex items-center justify-center shrink-0 py-2 md:py-0 md:px-2"
                  style={{ color: 'var(--mf-line-strong)' }}
                >
                  <span className="md:hidden"><Icon name={i === STUDY_LOOP.length - 1 ? 'refresh' : 'arrow-down'} size={15} /></span>
                  <span className="hidden md:block"><Icon name={i === STUDY_LOOP.length - 1 ? 'refresh' : 'arrow-right'} size={15} /></span>
                </span>
              </motion.div>
            ))}
          </div>

          <motion.div variants={stepIn} className="mt-8">
            <Prose wide>
              This represents a formative, iterative approach. It should not be described as formal
              Human Factors validation, which is a separate activity with a different purpose,
              different participants, and a different standard of evidence.
            </Prose>
          </motion.div>
        </motion.div>
      </motion.div>
    </Section>
  );
}

/* ─── 14 · Iteration ─────────────────────────────────────────────────────────
   The most easily faked section on a portfolio page, so the framing is the
   careful part: these are not findings. They are worked examples of how a
   finding WOULD translate into a design change, and the V1 column describes
   decisions I actually made first and then reasoned my way out of.

   Each row ends at the user need it produced, which is what makes the chain
   close: the concerns in this section are why sections 05 and 07 contain what
   they contain. */

export function IterationExample() {
  return (
    <Section id="iteration" alt>
      <motion.div {...revealProps}>
        <SectionHead
          id="iteration"
          n="14"
          label="Iteration"
          heading="Design, observe, improve"
          lead="Four conceptual iterations. The V1 column describes decisions I made first; the concern column is the reasoning that changed them."
        />

        <motion.div variants={fadeUp} className="mb-8">
          <ScopeNote>
            These concerns were identified through analysis, not through observation. No clinical
            testing was conducted, and nothing here represents a finding from a participant.
          </ScopeNote>
        </motion.div>

        <motion.div variants={fadeUp} className="flex flex-col gap-4 md:gap-5">
          {ITERATION.map((it, i) => (
            <Card key={it.concern} className="p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <span className="flex items-center gap-3">
                  <span
                    className="font-['Outfit'] text-[10.5px] font-semibold tabular-nums"
                    style={{ letterSpacing: '0.12em', color: 'var(--mf-muted)' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-['Outfit'] text-[15px] md:text-[16px] font-semibold" style={{ color: 'var(--mf-ink)' }}>
                    {it.concern}
                  </span>
                </span>
                <Ref href={`#${it.need}`}>{it.need}</Ref>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-4 md:gap-6 items-stretch">
                <div className="rounded-[4px] p-4" style={{ background: 'var(--mf-bg-alt)', border: '1px solid var(--mf-line)' }}>
                  <Label className="mb-2.5">V1</Label>
                  <p className="font-['Outfit'] text-[13.5px] leading-[1.6] m-0" style={{ color: 'var(--mf-muted)' }}>
                    {it.v1}
                  </p>
                </div>

                <span
                  aria-hidden="true"
                  className="hidden md:flex items-center justify-center"
                  style={{ color: 'var(--mf-accent-line)' }}
                >
                  <Icon name="arrow-right" size={17} />
                </span>
                <span
                  aria-hidden="true"
                  className="flex md:hidden items-center justify-center"
                  style={{ color: 'var(--mf-accent-line)' }}
                >
                  <Icon name="arrow-down" size={17} />
                </span>

                <div
                  className="rounded-[4px] p-4"
                  style={{ background: 'var(--mf-accent-bg)', border: '1px solid var(--mf-accent-line)' }}
                >
                  <Label tone="accent" className="mb-2.5">V2</Label>
                  <p className="font-['Outfit'] text-[13.5px] leading-[1.6] m-0 font-medium" style={{ color: 'var(--mf-accent)' }}>
                    {it.v2}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="mt-10">
          <Prose wide>
            In a real programme, the concern column would be filled by observation rather than
            analysis &mdash; a participant hesitating, misreading a unit, or confirming a
            configuration without pausing. The structure of the response would be the same; only
            the source of the evidence would change.
          </Prose>
        </motion.div>
      </motion.div>
    </Section>
  );
}
