import { motion } from 'framer-motion';
import {
  Section, SectionHead, Prose, Label, ScopeNote, Ref, ConceptTag,
} from './primitives';
import { fadeUp, stepIn, revealProps, chainReveal } from './motion';
import { Icon } from './icons';
import { USER_NEEDS, WORKFLOW, TASK_ANALYSIS, RISKS } from '../data/caseStudyData';

/* ─── 05 · User needs ────────────────────────────────────────────────────────
   Set as lightweight requirements documentation — numbered, individually
   addressable, one statement each — because that is the form they would take in
   a real programme and the form is part of what is being demonstrated.

   The provenance line is not optional. These came from reasoning about a
   scenario, not from talking to nurses, and every later section that cites a
   UN- number inherits that limitation. */

export function UserNeeds() {
  return (
    <Section id="user-needs">
      <motion.div {...revealProps}>
        <SectionHead
          id="user-needs"
          n="05"
          label="User needs"
          heading="Defining the user needs"
          lead="Seven conceptual needs, each written so that a later design decision can be traced back to exactly one of them."
        />

        <motion.div variants={fadeUp} className="mb-8">
          <ScopeNote>
            Conceptual user needs derived from the scenario and task analysis on this page. They
            were not gathered from interviews, observation, or contextual inquiry with nurses.
          </ScopeNote>
        </motion.div>

        <motion.div variants={fadeUp}>
          <div style={{ border: '1px solid var(--mf-line)', borderRadius: 4, overflow: 'hidden' }}>
            {USER_NEEDS.map((n, i) => (
              <div
                key={n.id}
                id={n.id}
                className="grid grid-cols-[68px_minmax(0,1fr)] md:grid-cols-[110px_minmax(0,1fr)] gap-4 md:gap-6 px-4 md:px-6 py-4 md:py-5 items-baseline"
                style={{
                  background: i % 2 ? 'var(--mf-bg-alt)' : 'var(--mf-surface)',
                  borderTop: i ? '1px solid var(--mf-line)' : undefined,
                  /* scroll-margin so a jump from the traceability section or a
                     risk row lands the heading clear of the sticky header */
                  scrollMarginTop: '96px',
                }}
              >
                <span
                  className="font-['Outfit'] text-[12px] md:text-[13px] font-semibold tabular-nums"
                  style={{ letterSpacing: '0.08em', color: 'var(--mf-accent)' }}
                >
                  {n.id}
                </span>
                <span
                  className="font-['Outfit'] text-[14.5px] md:text-[15.5px] leading-[1.65]"
                  style={{ color: 'var(--mf-ink-2)' }}
                >
                  {n.text}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </Section>
  );
}

/* ─── 06 · Task and workflow analysis ────────────────────────────────────────
   Ten steps, five of them marked safety-significant. The marking is the point:
   an undifferentiated list of ten steps says nothing, and the whole argument
   for the interface that follows is that attention was spent unevenly, on
   purpose, where a use error would cost most.

   Safety-significant steps carry a diamond AND a heavier border AND a label.
   Three signals, so the distinction survives greyscale — the same rule the
   interface itself follows. */

export function WorkflowAnalysis() {
  const criticalCount = WORKFLOW.filter((s) => s.critical).length;
  return (
    <Section id="workflow" alt>
      <motion.div {...revealProps}>
        <SectionHead
          id="workflow"
          n="06"
          label="Task &amp; workflow analysis"
          heading="Mapping the critical workflow"
          lead="Mapping the workflow before designing individual screens helped identify where additional confirmation, persistent context, error prevention, or stronger system feedback could be valuable."
        />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-10 lg:gap-14 items-start">
          {/* ── The chain ── */}
          <motion.div {...chainReveal}>
            <motion.div variants={stepIn} className="flex items-center justify-between gap-4 mb-5">
              <Label>Workflow &mdash; 10 steps</Label>
              <span
                className="font-['Outfit'] text-[10.5px] font-semibold uppercase inline-flex items-center gap-2"
                style={{ letterSpacing: '0.14em', color: 'var(--mf-accent)' }}
              >
                <Icon name="diamond" size={11} />
                {criticalCount} safety-significant
              </span>
            </motion.div>

            <ol className="flex flex-col gap-2 m-0 p-0 list-none">
              {WORKFLOW.map((s) => (
                <motion.li key={s.n} variants={stepIn}>
                  <div className={`mf-step ${s.critical ? 'mf-step--critical' : ''}`}>
                    <span
                      className="font-['Outfit'] text-[11.5px] font-semibold tabular-nums shrink-0 pt-[2px]"
                      style={{ color: s.critical ? 'var(--mf-accent)' : 'var(--mf-muted)', minWidth: 18 }}
                    >
                      {String(s.n).padStart(2, '0')}
                    </span>

                    {s.critical && (
                      <span className="shrink-0 pt-[1px]" style={{ color: 'var(--mf-accent)' }}>
                        <Icon name="diamond" size={13} />
                      </span>
                    )}

                    <span
                      className="font-['Outfit'] text-[14px] md:text-[14.5px] leading-[1.45] font-medium"
                      style={{ color: s.critical ? 'var(--mf-accent)' : 'var(--mf-ink-2)' }}
                    >
                      {s.label}
                      {s.critical && <span className="sr-only"> — safety-significant interaction</span>}
                    </span>
                  </div>
                </motion.li>
              ))}
            </ol>
          </motion.div>

          {/* ── The analysis ── */}
          <motion.div variants={fadeUp}>
            <Label className="mb-5">Task analysis</Label>

            <div style={{ border: '1px solid var(--mf-line)', borderRadius: 4, overflow: 'hidden' }}>
              <table className="mf-table">
                <thead>
                  <tr>
                    <th scope="col">Task</th>
                    <th scope="col">User goal</th>
                    <th scope="col">Potential interaction issue</th>
                    <th scope="col">Design consideration</th>
                  </tr>
                </thead>
                <tbody>
                  {TASK_ANALYSIS.map((t) => (
                    <tr key={t.task}>
                      <td data-label="Task">
                        <span className="font-semibold" style={{ color: 'var(--mf-ink)' }}>{t.task}</span>
                      </td>
                      <td data-label="User goal">{t.goal}</td>
                      <td data-label="Potential interaction issue" style={{ color: 'var(--mf-attn)' }}>{t.issue}</td>
                      <td data-label="Design consideration">
                        <span className="font-medium block" style={{ color: 'var(--mf-ink)' }}>{t.response}</span>
                        <Ref href={`#${t.need}`} className="mt-2">{t.need}</Ref>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ConceptTag className="mt-4">Conceptual analysis &middot; not derived from observed clinical practice</ConceptTag>
          </motion.div>
        </div>
      </motion.div>
    </Section>
  );
}

/* ─── 07 · Illustrative use-related risk analysis ────────────────────────────
   THE NAMING IS LOAD-BEARING.
   This is not a UFMEA. It has no severity scores, no occurrence ratings, no
   risk priority numbers, no acceptability determination, and no verification
   of effectiveness — all of which a UFMEA has and all of which would be
   fabricated if they appeared here. Calling it what it is costs nothing and
   protects everything else on the page.

   The layout puts the design response last and heaviest, because the direction
   of the argument runs left to right: a potential error CAUSED an interface
   decision. Each row links to the need it satisfies and the screen it produced,
   so a reviewer can follow any claim in either direction. */

export function RiskAnalysis() {
  return (
    <Section id="risk">
      <motion.div {...revealProps}>
        <SectionHead
          id="risk"
          n="07"
          label="Use-related risk"
          heading="Designing for foreseeable use errors"
          lead="Five potential use errors, each traced to the interface decision it produced. Reading a row left to right is reading the reason a screen looks the way it does."
        />

        <motion.div variants={fadeUp} className="mb-8">
          <ScopeNote>
            This is not a formal UFMEA or regulatory risk assessment, and it carries no severity,
            occurrence, or risk-priority ratings. It is a conceptual exercise showing how potential
            use errors can influence interface decisions.
          </ScopeNote>
        </motion.div>

        {/* Desktop: a table, because it is comparative data and a table is what
            comparative data is. Mobile: the same rows become cards via the
            data-label reflow in medflow.css — no horizontal scroll, nothing
            shrunk to illegibility. */}
        <motion.div variants={fadeUp}>
          <div style={{ border: '1px solid var(--mf-line)', borderRadius: 4, overflow: 'hidden' }}>
            <table className="mf-table">
              <thead>
                <tr>
                  <th scope="col" style={{ width: '9%' }}>Ref</th>
                  <th scope="col" style={{ width: '19%' }}>Potential use error</th>
                  <th scope="col" style={{ width: '21%' }}>Possible outcome</th>
                  <th scope="col" style={{ width: '21%' }}>Possible contributing factor</th>
                  <th scope="col" style={{ width: '30%' }}>Design response</th>
                </tr>
              </thead>
              <tbody>
                {RISKS.map((r) => (
                  <tr key={r.id} id={r.id} style={{ scrollMarginTop: '96px' }}>
                    <td data-label="Ref">
                      <span
                        className="font-['Outfit'] text-[12px] font-semibold tabular-nums"
                        style={{ color: 'var(--mf-muted)' }}
                      >
                        {r.id}
                      </span>
                    </td>
                    <td data-label="Potential use error">
                      <span className="inline-flex items-start gap-2 font-medium" style={{ color: 'var(--mf-attn)' }}>
                        <span className="shrink-0 mt-[3px]"><Icon name="diamond" size={11} /></span>
                        {r.error}
                      </span>
                    </td>
                    <td data-label="Possible outcome">{r.outcome}</td>
                    <td data-label="Possible contributing factor">{r.factor}</td>
                    {/* The column the section exists for. Tinted, heavier, and
                        carrying the two cross-references. */}
                    <td
                      data-label="Design response"
                      style={{ background: 'var(--mf-accent-bg)', borderLeft: '1px solid var(--mf-accent-line)' }}
                    >
                      <span className="font-medium block" style={{ color: 'var(--mf-accent)' }}>{r.response}</span>
                      <span className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5">
                        <Ref href={`#${r.need}`}>{r.need}</Ref>
                        <Ref href="#final-interface">Screen</Ref>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-10">
          <Prose wide>
            Every one of these responses is visible in the interface that follows. The discrepancy
            screen exists because of R-02, the confirmation stage because of R-03, and the
            persistent identity bar on every safety-significant screen because of R-01 and R-05.
          </Prose>
        </motion.div>
      </motion.div>
    </Section>
  );
}
