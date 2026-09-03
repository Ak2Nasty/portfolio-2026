/* ─── Icons ──────────────────────────────────────────────────────────────────
   Drawn here rather than pulled from a library because this page needs a small,
   very specific set, and consistency between them matters more than breadth:
   every glyph sits in a 16-unit box with a 1.5 stroke and square terminals, so
   they read as one family at 11px as well as at 20px.

   ── ONE GLYPH, ONE MEANING ──
   This set was rebuilt after an audit found three glyphs carrying nine
   meanings. `shield` meant Regulatory AND the IEC/FDA frameworks AND every
   accuracy note on the page; `user` meant both the Human Factors pillar and the
   Human Factors function; `check` meant both Quality and "completed". A glyph
   that means three things communicates none of them, so each of those was split
   into its own mark.

   Two metaphors were also simply wrong. `task` was three flat lines, which is
   the universal hamburger-menu glyph, not a task. `environment` was a globe,
   which says "worldwide" — the use environment here is one hospital ward, so
   it is now a bed.

   ── DOMAIN VOCABULARY ──
   A study about infusion pumps previously contained no infusion imagery at all.
   The bag, drip, pump, wristband, vial and line glyphs below exist so the
   subject of the page is legible from its marks, not only from its prose.

   ── EVERY ICON HERE IS DECORATIVE ──
   Each one sits beside a word that already names the thing, so all are
   aria-hidden and none is ever the only signal for a state. That is the rule
   section 12 states, applied to its own page. The four STATUS glyphs at the
   bottom are deliberately distinct in SHAPE, not just colour — printed in
   greyscale they remain four different marks, which matters for the roughly
   1 in 12 men with a colour vision deficiency. */

const base = {
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'square',
  strokeLinejoin: 'miter',
  'aria-hidden': 'true',
  focusable: 'false',
};

export function Icon({ name, className = '', size = 16 }) {
  const p = { ...base, width: size, height: size, className };
  switch (name) {
    /* ── Domain ─────────────────────────────────────────────────────────── */

    /* IV bag on a hanger, with the line leaving the bottom. */
    case 'infusion-bag':
      return (
        <svg {...p}>
          <path d="M8 1v1.5" />
          <path d="M6 2.5h4" />
          <path d="M4.5 4h7v5.5a2 2 0 01-2 2h-3a2 2 0 01-2-2V4z" />
          <path d="M8 11.5v3.5" />
        </svg>
      );

    /* A single droplet. Rate, and the thing a drip chamber counts. */
    case 'drip':
      return (
        <svg {...p}>
          <path d="M8 2c2.3 3.2 3.6 4.9 3.6 6.6a3.6 3.6 0 11-7.2 0C4.4 6.9 5.7 5.2 8 2z" />
        </svg>
      );

    /* The pump: a device with a readout and two keys. The rate lives here. */
    case 'pump':
      return (
        <svg {...p}>
          <path d="M2 3.5h12v9H2v-9z" />
          <path d="M4 6h5v4H4V6z" />
          <path d="M11.5 6.5v.01M11.5 9.5v.01" strokeLinecap="round" strokeWidth="2" />
        </svg>
      );

    /* Patient wristband — the identity artifact, and what gets scanned. */
    case 'wristband':
      return (
        <svg {...p}>
          <path d="M2 8a2.5 2.5 0 012.5-2.5h7A2.5 2.5 0 0114 8a2.5 2.5 0 01-2.5 2.5h-7A2.5 2.5 0 012 8z" />
          <path d="M6 5.5h4v5H6v-5z" />
        </svg>
      );

    /* Medication vial. */
    case 'vial':
      return (
        <svg {...p}>
          <path d="M6 1.5h4v2H6v-2z" />
          <path d="M6.5 3.5h3v9a1.5 1.5 0 01-3 0v-9z" />
          <path d="M6.5 8h3" />
        </svg>
      );

    /* IV line / tubing run. */
    case 'line':
      return (
        <svg {...p}>
          <path d="M3.5 2v5a3 3 0 003 3h3a3 3 0 013 3v1" />
          <path d="M2 2h3M11 14h3" />
        </svg>
      );

    case 'clock':
      return (
        <svg {...p}>
          <circle cx="8" cy="8" r="6" />
          <path d="M8 4.5V8l2.5 1.5" />
        </svg>
      );

    /* Alarm. Distinct from the octagon status glyph: this is the concept of an
       alert, that is the state of being interrupted. */
    case 'bell-alert':
      return (
        <svg {...p}>
          <path d="M8 2a4 4 0 014 4v3l1.5 2.5h-11L4 9V6a4 4 0 014-4z" />
          <path d="M6.5 13a1.5 1.5 0 003 0" />
        </svg>
      );

    /* The same bell with a stroke through it. A muted state drawn as a
       DIFFERENT glyph rather than as the same glyph greyed out — the toggle has
       to be readable at a glance and in greyscale, which is the rule the rest of
       this interface follows. */
    case 'bell-off':
      return (
        <svg {...p}>
          <path d="M8 2a4 4 0 014 4v3l1.5 2.5h-11L4 9V6a4 4 0 014-4z" />
          <path d="M6.5 13a1.5 1.5 0 003 0" />
          <path d="M3 3l10 10" />
        </svg>
      );

    /* ── Human factors triad ────────────────────────────────────────────── */

    case 'user':
      return (
        <svg {...p}>
          <circle cx="8" cy="5" r="2.5" />
          <path d="M2.5 14c0-2.9 2.4-4.6 5.5-4.6s5.5 1.7 5.5 4.6" />
        </svg>
      );

    /* Was three flat lines — a hamburger menu. Now an actual checklist: two
       items done, one outstanding. */
    case 'checklist':
      return (
        <svg {...p}>
          <path d="M1.5 3.5l1.4 1.4 2.4-2.4" />
          <path d="M7.5 4h7" />
          <path d="M1.5 8.5l1.4 1.4 2.4-2.4" />
          <path d="M7.5 9h7" />
          <path d="M1.5 12.5h2.8" />
          <path d="M7.5 13.5h7" />
        </svg>
      );

    /* Was a globe, which says "worldwide". The use environment is one ward, so
       it is a bed. */
    case 'ward':
      return (
        <svg {...p}>
          <path d="M1.5 14v-5h9a3 3 0 013 3v2" />
          <path d="M1.5 9V4.5" />
          <path d="M4 9V7h3.5v2" />
          <path d="M1 14h14" />
        </svg>
      );

    /* ── Cross-functional roles. One mark each, none shared. ─────────────── */

    case 'target':
      return (
        <svg {...p}>
          <circle cx="8" cy="8" r="6" />
          <circle cx="8" cy="8" r="2.25" />
        </svg>
      );

    case 'layers':
      return (
        <svg {...p}>
          <path d="M8 2l6 3-6 3-6-3 6-3z" />
          <path d="M2 11l6 3 6-3" />
        </svg>
      );

    case 'code':
      return (
        <svg {...p}>
          <path d="M5.5 4L2 8l3.5 4M10.5 4L14 8l-3.5 4" />
        </svg>
      );

    /* Human Factors: the human, under observation. Distinct from `user`, which
       is the human as a design input rather than the discipline studying them. */
    case 'person-study':
      return (
        <svg {...p}>
          <path d="M1.5 4.5v-3h3M14.5 4.5v-3h-3M1.5 11.5v3h3M14.5 11.5v3h-3" />
          <circle cx="8" cy="6.3" r="1.9" />
          <path d="M4.9 12.2c0-1.9 1.4-3 3.1-3s3.1 1.1 3.1 3" />
        </svg>
      );

    /* Quality: a checked record. Distinct from a bare tick, which means done. */
    case 'clipboard-check':
      return (
        <svg {...p}>
          <path d="M5.5 2.5h5v2h-5v-2z" />
          <path d="M5.5 3.5H3v11h10v-11h-2.5" />
          <path d="M5.5 9.5l1.6 1.6 3.4-3.4" />
        </svg>
      );

    /* Regulatory: a document bearing a seal. */
    case 'certificate':
      return (
        <svg {...p}>
          <path d="M3.5 1.5h5.5l3 3v6h-8.5v-9z" />
          <path d="M9 1.5v3h3" />
          <circle cx="8" cy="11.5" r="2.2" />
          <path d="M6.6 13.2L6 15.5l2-1.1 2 1.1-.6-2.3" />
        </svg>
      );

    /* Frameworks / standards: something read, not something complied with. */
    case 'book':
      return (
        <svg {...p}>
          <path d="M2.5 2.5A1.5 1.5 0 014 1h9.5v11.5H4A1.5 1.5 0 002.5 14v-11.5z" />
          <path d="M4 12.5h9.5V15H4a1.5 1.5 0 010-2.5z" />
        </svg>
      );

    /* ── Meta ───────────────────────────────────────────────────────────── */

    /* Accuracy / scope notes. These sit on the cyan information tier, and an
       information mark is exactly what they are — they were a shield, which
       implied protection or certification. */
    case 'info-circle':
      return (
        <svg {...p}>
          <circle cx="8" cy="8" r="6" />
          <path d="M8 7.3v4" />
          <path d="M8 4.9v.9" />
        </svg>
      );

    case 'shield':
      return (
        <svg {...p}>
          <path d="M8 2l5 2v4.5c0 3-2.2 5.2-5 6-2.8-.8-5-3-5-6V4l5-2z" />
        </svg>
      );

    case 'scan':
      return (
        <svg {...p}>
          <path d="M2 5.5V2.5h3M14 5.5V2.5h-3M2 10.5v3h3M14 10.5v3h-3M4.5 8h7" />
        </svg>
      );

    case 'lock':
      return (
        <svg {...p}>
          <path d="M3 7h10v7H3V7z" />
          <path d="M5.5 7V5a2.5 2.5 0 015 0v2" />
        </svg>
      );

    case 'pencil':
      return (
        <svg {...p}>
          <path d="M11 2.5l2.5 2.5L5 13.5H2.5V11L11 2.5z" />
        </svg>
      );

    case 'diamond':
      return (
        <svg {...p}>
          <path d="M8 2l6 6-6 6-6-6 6-6z" />
        </svg>
      );

    case 'check':
      return (
        <svg {...p}>
          <path d="M3 8.5l3.5 3.5L13 5" />
        </svg>
      );

    case 'refresh':
      return (
        <svg {...p}>
          <path d="M13.5 8a5.5 5.5 0 01-9.7 3.5M2.5 8a5.5 5.5 0 019.7-3.5" />
          <path d="M2.5 12.5V8.5h4M13.5 3.5v4h-4" />
        </svg>
      );

    case 'external':
      return (
        <svg {...p}>
          <path d="M6.5 3H3v10h10V9.5M9.5 2.5H13.5V6.5M13 3L7.5 8.5" />
        </svg>
      );

    /* ── Direction ──────────────────────────────────────────────────────── */

    case 'arrow-right':
      return (
        <svg {...p}>
          <path d="M2.5 8h11M9.5 4l4 4-4 4" />
        </svg>
      );

    case 'arrow-left':
      return (
        <svg {...p}>
          <path d="M13.5 8h-11M6.5 4l-4 4 4 4" />
        </svg>
      );

    case 'arrow-down':
      return (
        <svg {...p}>
          <path d="M8 2.5v11M4 9.5l4 4 4-4" />
        </svg>
      );

    default:
      return null;
  }
}

/* ── Status glyphs ─────────────────────────────────────────────────────────
   Filled, because they have to read at 10px where a stroked mark would close
   up. Four distinct SHAPES, not four colours of the same dot. */
export function StatusGlyph({ shape, size = 11 }) {
  const p = { width: size, height: size, viewBox: '0 0 12 12', fill: 'currentColor', 'aria-hidden': 'true', focusable: 'false' };
  switch (shape) {
    case 'play':
      return <svg {...p}><path d="M3.5 2.5v7l6-3.5-6-3.5z" /></svg>;
    case 'pause':
      return <svg {...p}><path d="M3.5 2.5h2v7h-2zM6.5 2.5h2v7h-2z" /></svg>;
    case 'triangle':
      return <svg {...p}><path d="M6 1.5l5 8.5H1l5-8.5z" /></svg>;
    case 'octagon':
      return <svg {...p}><path d="M4.2 1h3.6L11 4.2v3.6L7.8 11H4.2L1 7.8V4.2L4.2 1z" /></svg>;
    case 'check':
      return <svg {...p}><path d="M1.5 6.2l3 3L10.5 3l1 1-7 7-4-4 1-.8z" /></svg>;
    case 'dot':
    default:
      return <svg {...p}><circle cx="6" cy="6" r="3.2" /></svg>;
  }
}
