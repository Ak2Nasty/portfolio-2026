import { Label } from './primitives';
import { Icon } from './icons';
import { THERAPY } from '../data/caseStudyData';

/* ─── What an infusion is ────────────────────────────────────────────────────
   The explainer the study was missing. It demonstrated a guard against a
   rate-entry error without ever establishing why a rate error is worth
   guarding against — which left a non-clinical reader unable to tell whether
   the discrepancy screen solved a real problem or an invented one.

   Everything here is either general knowledge about how infusion pumps work,
   or arithmetic on this study's own fictional numbers. Neither is a clinical
   claim, and the panel says so at the point of use.

   ── The apparatus ──
   Drawn rather than photographed: a photograph of a real pump would import a
   real manufacturer's industrial design and imply a product this study has no
   relationship with. The schematic is also simply clearer — it can label the
   three parameters exactly where they act. */

/* The apparatus. viewBox is fixed and the SVG scales, so the labels never
   reflow away from the parts they point at. */
function Apparatus() {
  const ink = 'var(--mf-ink-2)';
  const line = 'var(--mf-line-strong)';
  const accent = 'var(--mf-accent)';
  return (
    <svg
      viewBox="0 0 190 320"
      role="img"
      aria-label="Schematic of an infusion setup: a bag of fluid hangs above a drip chamber, which feeds a pump that controls the rate, which feeds a line into the patient's arm."
      className="mf-apparatus w-full h-auto"
      style={{ maxWidth: 190 }}
      fill="none"
      strokeWidth="1.5"
      strokeLinecap="square"
    >
      {/* ── Hanger ── */}
      <path d="M95 6v10" stroke={line} />
      <path d="M83 6h24" stroke={line} />

      {/* ── The bag ──
          Outlined and filled at 40%, not solid. A solid block reads as a
          battery; a translucent fill with air above it and a drawn surface
          reads as liquid you can see the level of, which is what an IV bag
          actually looks like and what makes the drain legible.

          The fill is the SAME colour as the drop and the fluid collecting in
          the chamber — it is one liquid, so it is one colour. */}
      <rect x="66" y="16" width="58" height="70" rx="5" stroke={line} fill="var(--mf-surface)" />
      <g className="mf-bagfluid">
        <rect x="67" y="34" width="56" height="51" rx="3" fill={accent} opacity="0.4" stroke="none" />
      </g>
      {/* The surface, riding down on the same clock as the fill. */}
      <path className="mf-bagline" d="M67 34h56" stroke={accent} strokeWidth="1.5" opacity="0.9" />

      {/* ── Neck into the drip chamber ── */}
      <path d="M95 86v10" stroke={line} />

      {/* ── Drip chamber ── */}
      <rect x="83" y="96" width="24" height="42" rx="4" stroke={line} fill="var(--mf-surface)" />
      <path d="M95 100v4" stroke={line} />
      <circle className="mf-drop" cx="95" cy="108" r="3.2" fill={accent} />
      {/* The drop's lower edge lands at y=131.2; this surface sits at y=131.
          It swells as the drop arrives, on the same clock, so the landing is
          one event rather than two things happening near each other. */}
      <path
        className="mf-chamberfluid"
        d="M84 131h22v3a3 3 0 01-3 3h-16a3 3 0 01-3-3v-3z"
        fill={accent}
        opacity="0.4"
        stroke="none"
      />

      {/* ── Chamber to pump, with a bolus travelling it ── */}
      <path d="M95 138v22" stroke={line} />
      <rect className="mf-flow-a" x="93.4" y="139" width="3.2" height="9" rx="1.6" fill={accent} />

      {/* ── The pump. The rate lives here, and it is the only accented part. ── */}
      <rect x="48" y="160" width="94" height="56" rx="5" stroke={accent} strokeWidth="2" fill="var(--mf-accent-bg)" />
      <rect x="57" y="170" width="58" height="26" rx="3" fill="var(--mf-surface)" stroke="none" />
      <text x="86" y="188" textAnchor="middle" fontSize="13" fontWeight="600" fill={accent} fontFamily="Outfit, sans-serif">
        5 mL/hr
      </text>
      <circle cx="127" cy="176" r="3" fill={accent} opacity="0.5" />
      <circle cx="127" cy="190" r="3" fill={accent} opacity="0.5" />
      <text x="95" y="210" textAnchor="middle" fontSize="9" fontWeight="600" fill={accent} fontFamily="Outfit, sans-serif" letterSpacing="1.2">
        PUMP
      </text>

      {/* ── Pump to patient, with the second bolus ── */}
      <path d="M95 216v34" stroke={line} />
      <rect className="mf-flow-b" x="93.4" y="217" width="3.2" height="9" rx="1.6" fill={accent} />

      {/* ── The arm and cannula ── */}
      <path d="M40 262h110a12 12 0 010 24H40a12 12 0 010-24z" stroke={line} fill="var(--mf-bg-alt)" />
      <path d="M95 250v12" stroke={line} />
      <circle cx="95" cy="274" r="3.5" fill={accent} />
      <text x="95" y="306" textAnchor="middle" fontSize="9.5" fontWeight="600" fill={ink} fontFamily="Outfit, sans-serif" letterSpacing="1.2">
        PATIENT
      </text>
    </svg>
  );
}

/* One row per parameter, with where it lives and whether the nurse can change
   it — the prescribed/editable distinction (UN-02) introduced here, before the
   reader ever meets the screen that depends on it. */
function Parameter({ p }) {
  return (
    <div
      className="flex flex-col gap-2 p-4 rounded-[4px]"
      style={{
        background: p.critical ? 'var(--mf-accent-bg)' : 'var(--mf-surface)',
        border: `1px solid ${p.critical ? 'var(--mf-accent-line)' : 'var(--mf-line)'}`,
      }}
    >
      <span className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
        <span className="flex items-center gap-2">
          <span style={{ color: p.editable ? 'var(--mf-accent)' : 'var(--mf-muted)' }}>
            <Icon name={p.editable ? 'pencil' : 'lock'} size={12} />
          </span>
          <span
            className="font-['Outfit'] text-[10.5px] font-semibold uppercase"
            style={{ letterSpacing: '0.15em', color: p.critical ? 'var(--mf-accent)' : 'var(--mf-muted)' }}
          >
            {p.label}
          </span>
        </span>
        <span
          className="font-['Outfit'] text-[15px] font-semibold tabular-nums"
          style={{ color: p.critical ? 'var(--mf-accent)' : 'var(--mf-ink)' }}
        >
          {p.value}
        </span>
      </span>

      <span className="flex items-center gap-2">
        <span
          className="font-['Outfit'] text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-[2px]"
          style={{
            letterSpacing: '0.1em',
            color: 'var(--mf-muted)',
            background: 'var(--mf-bg-alt)',
          }}
        >
          {p.where}
        </span>
        <span className="font-['Outfit'] text-[10px] uppercase" style={{ letterSpacing: '0.1em', color: 'var(--mf-muted)' }}>
          {p.editable ? 'Nurse enters' : 'Prescribed'}
        </span>
      </span>

      <p
        className="font-['Outfit'] text-[12.5px] leading-[1.55] m-0"
        style={{ color: p.critical ? 'var(--mf-accent)' : 'var(--mf-ink-2)' }}
      >
        {p.means}
      </p>
    </div>
  );
}

/* The consequence, side by side. This is the sentence the whole study rests on
   and it had never been written down. */
function Arithmetic() {
  const { correct, mistyped } = THERAPY.arithmetic;
  const col = (d, tone) => {
    const c = tone === 'crit' ? 'var(--mf-crit)' : 'var(--mf-accent)';
    const bg = tone === 'crit' ? 'var(--mf-crit-bg)' : 'var(--mf-accent-bg)';
    const bd = tone === 'crit' ? 'var(--mf-crit-line)' : 'var(--mf-accent-line)';
    return (
      <div className="p-4 rounded-[4px]" style={{ background: bg, border: `1px solid ${bd}` }}>
        <span
          className="font-['Outfit'] text-[10px] font-semibold uppercase block mb-3"
          style={{ letterSpacing: '0.14em', color: c }}
        >
          {tone === 'crit' ? 'If 50 is typed' : 'As ordered'}
        </span>
        <span className="font-['Outfit'] text-[24px] font-semibold tabular-nums block leading-none" style={{ color: c }}>
          {d.rate}
        </span>
        <dl className="mt-3.5 flex flex-col gap-1.5 m-0">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="font-['Outfit'] text-[11.5px]" style={{ color: c, opacity: 0.85 }}>Delivered per hour</dt>
            <dd className="font-['Outfit'] text-[13px] font-semibold tabular-nums m-0" style={{ color: c }}>{d.perHour}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="font-['Outfit'] text-[11.5px]" style={{ color: c, opacity: 0.85 }}>Bag lasts</dt>
            <dd className="font-['Outfit'] text-[13px] font-semibold tabular-nums m-0" style={{ color: c }}>{d.duration}</dd>
          </div>
        </dl>
      </div>
    );
  };

  return (
    <div>
      <Label className="mb-3.5">The same bag, one digit apart</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {col(correct, 'ok')}
        {col(mistyped, 'crit')}
      </div>
      <p className="font-['Outfit'] text-[11.5px] leading-[1.55] mt-3 m-0" style={{ color: 'var(--mf-muted)' }}>
        {THERAPY.notDosing}
      </p>
    </div>
  );
}

export function TherapyDiagram() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)] gap-8 lg:gap-12 items-start">
      {/* ── The apparatus ── */}
      <div className="flex flex-col items-center lg:items-start">
        <Apparatus />
        {/* The bag's own figures sit BELOW it, not inside it. With the level
            falling they would be crossed by the fluid surface, and a label a
            liquid line wipes through is worse than a label placed once,
            clearly, out of the way. */}
        <span
          className="font-['Outfit'] text-[12px] font-semibold mt-3 text-center lg:text-left"
          style={{ color: 'var(--mf-ink)' }}
        >
          100 mL bag &middot; 10 mg/mL
        </span>
        <span
          className="font-['Outfit'] text-[10px] uppercase mt-2 text-center lg:text-left"
          style={{ letterSpacing: '0.14em', color: 'var(--mf-muted)' }}
        >
          Schematic &middot; not a real device
        </span>
      </div>

      {/* ── What it means ── */}
      <div className="flex flex-col gap-6">
        <p
          className="font-['Outfit'] text-[15.5px] md:text-[16.5px] leading-[1.75] m-0 max-w-[64ch]"
          style={{ color: 'var(--mf-ink-2)' }}
        >
          {THERAPY.definition}
        </p>

        <div>
          <Label className="mb-3.5">The three numbers, and where each one acts</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {THERAPY.parameters.map((p) => (
              <Parameter key={p.id} p={p} />
            ))}
          </div>
        </div>

        <Arithmetic />

        {/* The keystone. Set as a pull quote because it is the reason every
            other decision on this page exists. */}
        <div
          className="flex gap-4 p-5 rounded-[4px]"
          style={{ background: 'var(--mf-attn-bg)', border: '1px solid var(--mf-attn-line)' }}
        >
          <span className="shrink-0 mt-[2px]" style={{ color: 'var(--mf-attn)' }}>
            <Icon name="clock" size={17} />
          </span>
          <div>
            <span
              className="font-['Outfit'] text-[10.5px] font-semibold uppercase block mb-2"
              style={{ letterSpacing: '0.15em', color: 'var(--mf-attn)' }}
            >
              Why the rate field is the one this study guards
            </span>
            <p
              className="font-['Outfit'] text-[14.5px] md:text-[15.5px] leading-[1.65] m-0 font-medium"
              style={{ color: 'var(--mf-attn)' }}
            >
              {THERAPY.whyRate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
