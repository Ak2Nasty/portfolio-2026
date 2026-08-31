import { motion } from 'framer-motion';
import {
  Section, SectionHead, Prose, Label, Card, ScopeNote, Ref,
} from './primitives';
import { fadeUp, stepIn, revealProps, chainReveal } from './motion';
import { Icon } from './icons';
import { FUNCTIONS, TRACE, FRAMEWORKS, FRAMEWORK_CAVEAT } from '../data/caseStudyData';

/* ─── 15 · Cross-functional workflow ─────────────────────────────────────────
   A statement of understanding, explicitly labelled as one. The disclaimer here
   is the most important on the page after the hero: a diagram of a
   medical-device development team, on a page full of medical-device UX work,
   invites exactly the wrong inference.

   UX is highlighted rather than centred. Putting it in the middle with arrows
   radiating out would make a claim about importance that a coordinator role has
   no business making — it sits in the row like everything else, marked only as
   "where I would sit". */

export function CrossFunctional() {
  return (
    <Section id="cross-functional">
      <motion.div {...revealProps}>
        <SectionHead
          id="cross-functional"
          n="15"
          label="Collaboration"
          heading="UX does not work in isolation"
          lead="How I understand the functions around a medical-device design decision, and what each one is accountable for."
        />

        <motion.div variants={fadeUp} className="mb-8">
          <ScopeNote>
            This represents how I understand a cross-functional medical-device development
            environment, assembled from reading. It does not represent teams I personally worked
            with on MedFlow, or anywhere else.
          </ScopeNote>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
        >
          {FUNCTIONS.map((f) => (
            <Card
              key={f.id}
              tone={f.self ? 'accent' : undefined}
              className="p-5 md:p-6 flex flex-col"
            >
              <span className="flex items-center justify-between gap-3 mb-4">
                <span className="flex items-center gap-3">
                  <span style={{ color: f.self ? 'var(--mf-accent)' : 'var(--mf-muted)' }}>
                    <Icon name={f.icon} size={18} />
                  </span>
                  <span
                    className="font-['Outfit'] text-[12px] font-semibold uppercase"
                    style={{ letterSpacing: '0.15em', color: f.self ? 'var(--mf-accent)' : 'var(--mf-ink)' }}
                  >
                    {f.name}
                  </span>
                </span>
                {f.self && (
                  <span
                    className="font-['Outfit'] text-[9.5px] font-semibold uppercase px-2 py-1 rounded-[3px] shrink-0"
                    style={{ letterSpacing: '0.13em', color: 'var(--mf-accent)', border: '1px solid var(--mf-accent-line)' }}
                  >
                    This role
                  </span>
                )}
              </span>

              <p
                className="font-['Outfit'] text-[13.5px] leading-[1.6] m-0"
                style={{ color: f.self ? 'var(--mf-accent)' : 'var(--mf-ink-2)' }}
              >
                {f.body}
              </p>
            </Card>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="mt-10">
          <Prose wide>
            The relationships that matter most to a UI/UX role are the two either side of it:
            Human Factors, which decides whether a design response actually addresses the risk it
            claims to, and Engineering, which decides whether it can be built as specified. Quality
            and Regulatory shape what has to be written down about both.
          </Prose>
        </motion.div>
      </motion.div>
    </Section>
  );
}

/* ─── 16 · Traceability ──────────────────────────────────────────────────────
   The section that ties the document together, and the one a reviewer from this
   field is most likely to look for. It follows a single thread — UN-04 — from
   need through risk, requirement, interface and proposed evaluation, using
   references that appear elsewhere on this page and resolve to real anchors.

   That the links WORK is the argument. Anyone can draw a five-box chain; a
   chain whose every reference lands on the thing it names is a document rather
   than a diagram.

   It is not regulatory documentation. It is a demonstration of the shape
   regulatory documentation takes. */

const TRACE_TONE = {
  neutral: { color: 'var(--mf-ink)', bg: 'var(--mf-surface)', line: 'var(--mf-line-strong)' },
  attn: { color: 'var(--mf-attn)', bg: 'var(--mf-attn-bg)', line: 'var(--mf-attn-line)' },
  accent: { color: 'var(--mf-accent)', bg: 'var(--mf-accent-bg)', line: 'var(--mf-accent-line)' },
  info: { color: 'var(--mf-info)', bg: 'var(--mf-info-bg)', line: 'var(--mf-info-line)' },
};

/* Where each stage's reference points. These resolve to ids that genuinely
   exist elsewhere on the page — the user-need row, the risk row, the screen. */
const TRACE_HREF = {
  'UN-04': '#UN-04',
  'R-03': '#R-03',
  'Screen 06': '#screen-confirm',
};

export function Traceability() {
  return (
    <Section id="traceability" alt>
      <motion.div {...revealProps}>
        <SectionHead
          id="traceability"
          n="16"
          label="Documentation"
          heading="Design decisions need traceability"
          lead="One thread, followed end to end. In a regulated environment the reasoning behind an interface matters alongside the interface itself."
        />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)] gap-10 lg:gap-16 items-start">
          <motion.div {...chainReveal} className="mf-chain flex flex-col gap-[22px]">
            {TRACE.map((t) => {
              const tone = TRACE_TONE[t.tone];
              const href = TRACE_HREF[t.ref];
              return (
                <motion.div key={t.stage} variants={stepIn}>
                  <div
                    className="rounded-[4px] border p-5"
                    style={{ background: tone.bg, borderColor: tone.line }}
                  >
                    <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 mb-3">
                      <span
                        className="font-['Outfit'] text-[10.5px] font-semibold uppercase"
                        style={{ letterSpacing: '0.16em', color: tone.color }}
                      >
                        {t.stage}
                      </span>
                      {href ? (
                        <Ref href={href}>{t.ref}</Ref>
                      ) : (
                        <span
                          className="font-['Outfit'] text-[10.5px] font-semibold tabular-nums"
                          style={{ letterSpacing: '0.12em', color: tone.color }}
                        >
                          {t.ref}
                        </span>
                      )}
                    </span>
                    <p
                      className="font-['Outfit'] text-[14.5px] leading-[1.6] m-0"
                      style={{ color: tone.color }}
                    >
                      {t.body}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-col gap-6">
            <Prose>
              This conceptual trace demonstrates how a user need could connect to a design
              requirement, an interface decision, and an evaluation activity. Every reference above
              is a live link to the item it names elsewhere on this page.
            </Prose>

            <ScopeNote>
              This is not actual regulatory documentation. A real design history file has version
              control, approval signatures, change records, and links to verification evidence
              &mdash; none of which exist here.
            </ScopeNote>

            <Card className="p-5">
              <Label className="mb-3">Why it is worth the effort</Label>
              <p className="font-['Outfit'] text-[13.5px] leading-[1.6] m-0" style={{ color: 'var(--mf-ink-2)' }}>
                A design decision with no recorded reason cannot be reviewed, cannot be safely
                changed by someone who was not in the room, and cannot be defended when a regulator
                asks why the interface behaves the way it does.
              </p>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </Section>
  );
}

/* ─── 17 · Frameworks ────────────────────────────────────────────────────────
   Short, and deliberately unimpressive. The temptation in a section like this
   is to imply more familiarity than exists by quoting clause numbers — so there
   are none, no certifications, no compliance badges, and no citation of any
   specific requirement.

   Each card says what the framework INTRODUCED or REINFORCED. That verb is the
   accurate one for reading something, and it is the only claim being made. */

export function Frameworks() {
  return (
    <Section id="frameworks">
      <motion.div {...revealProps}>
        <SectionHead
          id="frameworks"
          n="17"
          label="Frameworks"
          heading="Frameworks informing the exercise"
          lead="What I read while working on this, and what each one changed about how I approached the design."
        />

        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {FRAMEWORKS.map((f) => (
            <Card key={f.name} className="p-5 md:p-6 flex flex-col">
              <span className="flex items-center gap-3 mb-4">
                <span style={{ color: 'var(--mf-accent)' }}><Icon name="book" size={17} /></span>
                <span
                  className="font-['Outfit'] text-[13.5px] font-semibold"
                  style={{ color: 'var(--mf-ink)', letterSpacing: '0.01em' }}
                >
                  {f.name}
                </span>
              </span>
              <p className="font-['Outfit'] text-[13.5px] leading-[1.65] m-0" style={{ color: 'var(--mf-ink-2)' }}>
                {f.body}
              </p>
            </Card>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="mt-8">
          <ScopeNote>{FRAMEWORK_CAVEAT}</ScopeNote>
        </motion.div>
      </motion.div>
    </Section>
  );
}
