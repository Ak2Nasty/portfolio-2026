import { motion } from 'framer-motion';
import {
  Section, SectionHead, Label, Card, Chip, ScopeNote,
} from './primitives';
import { fadeUp, revealProps } from './motion';
import { StatusGlyph } from './icons';
import { CUE_SPEC } from './sound';
import {
  TYPE_SCALE, INPUT_STATES, ALERT_TIERS, STATUS_TIERS, COMPONENTS, A11Y,
} from '../data/caseStudyData';

/* ─── 11 · Design system ─────────────────────────────────────────────────────
   Every specimen below is the REAL component, pulled from the same stylesheet
   the screens use. Nothing here is a picture of a component — change
   medflow.css and this section changes with the interface, which is the only
   version of a design system section worth showing.

   The claim is deliberately narrow. Consistency reduces the amount a user has
   to interpret; it does not make anything safe. A design system that is
   internally consistent and wrong is consistently wrong. */

function Swatch({ label, tone, hex, ratio }) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="shrink-0 rounded-[3px]"
        style={{ width: 34, height: 34, background: `var(--mf-${tone})`, border: '1px solid var(--mf-line-strong)' }}
      />
      <span className="flex flex-col min-w-0">
        <span className="font-['Outfit'] text-[12.5px] font-semibold leading-tight" style={{ color: 'var(--mf-ink)' }}>
          {label}
        </span>
        <span className="font-['Outfit'] text-[11px] leading-tight mt-1 tabular-nums" style={{ color: 'var(--mf-muted)' }}>
          {hex} &middot; {ratio}
        </span>
      </span>
    </div>
  );
}

export function DesignSystem() {
  return (
    <Section id="design-system">
      <motion.div {...revealProps}>
        <SectionHead
          id="design-system"
          n="11"
          label="Design system"
          heading="Consistency as a safety tool"
          lead="Reusable components were designed so that similar actions, states, and information patterns behave predictably across the workflow. Consistency reduces unnecessary interpretation — it does not, on its own, make a system safe."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
          {/* ── Type ── */}
          <Card className="p-5 md:p-6">
            <Label className="mb-5">Typography</Label>
            <div className="flex flex-col gap-4">
              {TYPE_SCALE.map((t) => (
                <div key={t.name} className="flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-5 pb-4 last:pb-0" style={{ borderBottom: '1px solid var(--mf-line)' }}>
                  <span className="sm:w-[110px] sm:shrink-0">
                    <span className="font-['Outfit'] text-[11px] font-semibold uppercase block" style={{ letterSpacing: '0.14em', color: 'var(--mf-muted)' }}>
                      {t.name}
                    </span>
                    <span className="font-['Outfit'] text-[10.5px] block mt-1 tabular-nums" style={{ color: 'var(--mf-muted)' }}>
                      {t.size}
                    </span>
                  </span>
                  <span className="flex flex-col min-w-0">
                    <span
                      className="font-['Outfit'] truncate"
                      style={{
                        color: 'var(--mf-ink)',
                        fontSize: t.name === 'Display' ? 30 : t.name === 'Heading' ? 19 : t.name === 'Critical value' ? 20 : t.name === 'Label' ? 10.5 : 15,
                        fontWeight: t.name === 'Body' ? 400 : 600,
                        letterSpacing: t.name === 'Label' ? '0.15em' : '-0.01em',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {t.sample}
                    </span>
                    <span className="font-['Outfit'] text-[11.5px] mt-1.5" style={{ color: 'var(--mf-muted)' }}>{t.use}</span>
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* ── Colour, with the rule stated ── */}
          <Card className="p-5 md:p-6">
            <Label className="mb-3">Colour</Label>
            <p className="font-['Outfit'] text-[13.5px] leading-[1.6] m-0 mb-5" style={{ color: 'var(--mf-ink-2)' }}>
              Saturated colour belongs to state. The structural accent is deliberately desaturated
              so that it never competes with an alarm, and the one cyan in the palette is reserved
              for the informational tier. Ratios are measured against the surface each value
              actually sits on.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Swatch label="Accent / structure" tone="accent" hex="#17456F" ratio="9.17:1" />
              <Swatch label="Information" tone="info" hex="#0E6D87" ratio="5.46:1" />
              <Swatch label="Running" tone="run" hex="#2A7343" ratio="5.06:1" />
              <Swatch label="Requires attention" tone="attn" hex="#8A5D06" ratio="5.11:1" />
              <Swatch label="Interrupted" tone="crit" hex="#A8322C" ratio="5.80:1" />
              <Swatch label="Inactive" tone="off" hex="#63635C" ratio="5.59:1" />
            </div>
          </Card>

          {/* ── Buttons ── */}
          <Card className="p-5 md:p-6">
            <Label className="mb-5">Buttons</Label>
            <div className="flex flex-wrap gap-3">
              <span className="mf-btn mf-btn--primary" role="presentation">Primary</span>
              <span className="mf-btn mf-btn--secondary" role="presentation">Secondary</span>
              <span className="mf-btn mf-btn--critical" role="presentation">Destructive</span>
              <button type="button" className="mf-btn mf-btn--primary" disabled tabIndex={-1}>Disabled</button>
            </div>
            <p className="font-['Outfit'] text-[12.5px] leading-[1.55] mt-5 m-0" style={{ color: 'var(--mf-muted)' }}>
              Every control clears 44&times;44px. A disabled control is always accompanied by text
              explaining what would re-enable it &mdash; a dead button with no reason is its own
              recovery failure.
            </p>
          </Card>

          {/* ── Inputs ── */}
          <Card className="p-5 md:p-6">
            <Label className="mb-5">Inputs</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {INPUT_STATES.map((s) => {
                const error = s === 'Error';
                const ok = s === 'Matches order';
                const disabled = s === 'Disabled';
                return (
                  <div key={s} className="flex flex-col gap-2">
                    <span
                      className="font-['Outfit'] text-[10px] font-semibold uppercase"
                      style={{
                        letterSpacing: '0.14em',
                        color: error ? 'var(--mf-crit)' : ok ? 'var(--mf-run)' : 'var(--mf-muted)',
                      }}
                    >
                      {s}
                    </span>
                    <span
                      className={`mf-field ${error ? 'mf-field--error' : ''} ${ok ? 'mf-field--ok' : ''}`}
                      style={{
                        opacity: disabled ? 0.55 : 1,
                        borderColor: s === 'Focused' ? 'var(--mf-accent)' : undefined,
                        boxShadow: s === 'Focused' ? '0 0 0 3px var(--mf-accent-bg)' : undefined,
                        background: disabled ? 'var(--mf-off-bg)' : undefined,
                      }}
                    >
                      <input value={error ? '50' : '5'} readOnly tabIndex={-1} style={{ width: 46, fontSize: 17, padding: '8px 0 8px 10px' }} />
                      <span className="mf-field__unit" style={{ fontSize: 12, padding: '0 6px 0 4px' }}>mL/hr</span>
                      {/* The tick carries the state; the colour is the second
                          signal, exactly as it is everywhere else on the page. */}
                      {ok && (
                        <span className="mf-field__tick">
                          <StatusGlyph shape="check" size={12} />
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="font-['Outfit'] text-[12.5px] leading-[1.55] mt-5 m-0" style={{ color: 'var(--mf-muted)' }}>
              The unit lives inside the field permanently. It is never a column header, never a
              neighbouring element, and never something that can scroll away from its number.
            </p>
          </Card>

          {/* ── Alerts ── */}
          <Card className="p-5 md:p-6">
            <Label className="mb-5">Alerts</Label>
            <div className="flex flex-col gap-3">
              {ALERT_TIERS.map((a) => (
                <div key={a.tone} className={`mf-alert mf-alert--${a.tone}`}>
                  <span className="shrink-0 mt-[2px]" style={{ color: `var(--mf-${a.tone === 'crit' ? 'crit' : a.tone})` }}>
                    <StatusGlyph shape={a.tone === 'crit' ? 'octagon' : a.tone === 'attn' ? 'triangle' : 'dot'} size={14} />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold m-0" style={{ color: `var(--mf-${a.tone})` }}>{a.label}</p>
                    <p className="text-[12.5px] leading-[1.5] mt-1 m-0" style={{ color: `var(--mf-${a.tone})` }}>{a.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* ── Status ── */}
          <Card className="p-5 md:p-6">
            <Label className="mb-5">Status</Label>
            <div className="flex flex-wrap gap-2.5">
              {STATUS_TIERS.map((s) => (
                <Chip key={s.tone} tone={s.tone} shape={s.shape}>{s.label}</Chip>
              ))}
            </div>
            <p className="font-['Outfit'] text-[12.5px] leading-[1.55] mt-5 m-0" style={{ color: 'var(--mf-muted)' }}>
              Four distinct glyph shapes, not four colours of the same dot. Printed in greyscale
              these remain four different marks.
            </p>

            <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--mf-line)' }}>
              <Label className="mb-3.5">Components</Label>
              <div className="flex flex-wrap gap-2">
                {COMPONENTS.map((c) => (
                  <span
                    key={c}
                    className="font-['Outfit'] text-[12px] px-2.5 py-1.5 rounded-[3px]"
                    style={{ background: 'var(--mf-bg-alt)', color: 'var(--mf-ink-2)', border: '1px solid var(--mf-line)' }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </Section>
  );
}

/* ─── 12 · Accessibility ─────────────────────────────────────────────────────
   Framed as design considerations, not as conformance. This page has not been
   audited against WCAG by anyone but me, and "considered" is the honest verb.

   The first two items are the ones this page can actually evidence, because
   they were measured rather than asserted — so they go first. */

export function Accessibility() {
  return (
    <Section id="accessibility" alt>
      <motion.div {...revealProps}>
        <SectionHead
          id="accessibility"
          n="12"
          label="Accessibility"
          heading="Beyond visual polish"
          lead="Considerations applied throughout the interface. These are design decisions, not conformance claims — nothing here has been through a formal accessibility audit."
        />

        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {A11Y.map((a, i) => (
            <Card key={a.title} className="p-5 flex flex-col">
              <span className="flex items-baseline gap-3 mb-3">
                <span
                  className="font-['Outfit'] text-[10.5px] font-semibold tabular-nums shrink-0"
                  style={{ letterSpacing: '0.12em', color: 'var(--mf-accent)' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-['Outfit'] text-[14.5px] font-semibold leading-[1.35]" style={{ color: 'var(--mf-ink)' }}>
                  {a.title}
                </span>
              </span>
              <p className="font-['Outfit'] text-[13.5px] leading-[1.6] m-0" style={{ color: 'var(--mf-ink-2)' }}>
                {a.body}
              </p>
            </Card>
          ))}
        </motion.div>

        {/* ── The auditory channel ────────────────────────────────────────
            Sound is the one modality a screenshot cannot show, so it gets a
            table rather than a sentence. The cues are real and audible in the
            prototype, and the table is generated from the same definitions that
            play them, so the description cannot drift from the behaviour.

            The limits paragraph is not boilerplate. Alarm signals for medical
            electrical equipment are the subject of IEC 60601-1-8, which
            specifies sound pressure levels at stated distances on characterised
            hardware — none of which a web page has, and all of which would be
            invented if this section claimed conformance. */}
        <motion.div variants={fadeUp} className="mt-14 md:mt-20 pt-10" style={{ borderTop: '1px solid var(--mf-line-strong)' }}>
          <Label tone="accent" className="mb-3">Auditory signals</Label>
          <h3
            className="font-['Outfit'] font-semibold leading-[1.2] text-[21px] sm:text-[24px] md:text-[27px] max-w-[26ch] m-0 mb-4"
            style={{ color: 'var(--mf-ink)', letterSpacing: '-0.015em' }}
          >
            Sound is the fourth signal, never the first
          </h3>
          <p className="font-['Outfit'] text-[14.5px] leading-[1.7] max-w-[72ch] m-0 mb-7" style={{ color: 'var(--mf-ink-2)' }}>
            Every cue in the prototype accompanies a state already carried by a word, a glyph, a
            position and a colour. Turn the sound off and nothing is lost &mdash; which is the test,
            because the volume may be down, the room may be loud, and the user may be deaf or hard
            of hearing. Priority is carried by pattern rather than by loudness: the occlusion is ten
            pulses in two falling bursts, a blocked progression is three, a deliberate pause is two
            flat tones. Alarms fall and completions rise, because a confirmation that sounds like an
            alarm teaches people to ignore alarms.
          </p>

          <div style={{ border: '1px solid var(--mf-line)', borderRadius: 4, overflow: 'hidden' }}>
            <table className="mf-table">
              <thead>
                <tr>
                  <th scope="col" style={{ width: '26%' }}>Cue</th>
                  <th scope="col" style={{ width: '30%' }}>Pattern</th>
                  <th scope="col" style={{ width: '44%' }}>Raised when</th>
                </tr>
              </thead>
              <tbody>
                {CUE_SPEC.map((c) => (
                  <tr key={c.id}>
                    <td data-label="Cue">
                      <span className="inline-flex items-center gap-2.5 font-medium" style={{ color: 'var(--mf-ink)' }}>
                        <span aria-hidden="true" className={`mf-chip mf-chip--${c.tone === 'done' ? 'run' : c.tone}`} style={{ padding: 0, border: 0, background: 'transparent' }}>
                          <StatusGlyph shape={c.tone === 'crit' ? 'octagon' : c.tone === 'attn' ? 'triangle' : c.tone === 'off' ? 'pause' : c.tone === 'info' ? 'dot' : 'play'} size={11} />
                        </span>
                        {c.label}
                      </span>
                    </td>
                    <td data-label="Pattern" style={{ color: 'var(--mf-muted)' }}>{c.shape}</td>
                    <td data-label="Raised when">{c.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <ScopeNote>
              These are conceptual cues, not compliant alarm signals, and they could not be. Alarm
              signals for medical electrical equipment fall under IEC 60601-1-8 rather than IEC
              62366, and that standard specifies sound pressure level at a stated distance,
              verified acoustic output, and behaviour under alarm-off and audio-paused states. The
              volume here is whatever the reader&rsquo;s device is set to, through speakers nobody
              specified, in a room nobody characterised. Nothing on this page has been tested
              against any standard.
            </ScopeNote>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-8">
          <ScopeNote>
            The colour ratios quoted throughout this page were computed against the exact surface
            each value sits on. That check caught a real failure during the build: a status green
            that passed at 4.67:1 against the page ground dropped to 4.42:1 against its own chip
            tint, which is where it is actually used.
          </ScopeNote>
        </motion.div>
      </motion.div>
    </Section>
  );
}
