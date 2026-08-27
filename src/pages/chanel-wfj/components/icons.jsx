
/* ─── Icon set ───────────────────────────────────────────────────────────────
   Drawn from scratch for this page. Nothing here is traced from, adapted from
   or inspired by any brand's iconography — these are geometric primitives on a
   16-unit grid, built from the same vocabulary as the hero diagram: circles,
   ticks, precise rules and right angles.

   Rules the set holds to, so it reads as one family:
     · 16×16 viewBox (status glyphs use 10×10 — they sit inline with 9.5px type)
     · 1.2 stroke, currentColor, no fill unless the shape is meant to be solid
     · square caps and joins, because every other line on this page is calibrated
     · no icon carries meaning on its own — each one sits beside its own label

   That last rule is why every icon here is aria-hidden. They are pace and
   scanning aids next to text that already says the same thing; announcing them
   would just make a screen reader read everything twice. */

const base = {
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  /* 1.1, not 1.2. Luxury-house iconography runs markedly thinner than the
     default weight of most icon sets — the delicacy IS the register. At 1.2 on
     a 16 grid these read as UI furniture; at 1.1 they read as drawn marks. */
  strokeWidth: 1.1,
  strokeLinecap: 'square',
  strokeLinejoin: 'miter',
  'aria-hidden': 'true',
};

/* ── Workstream marks ───────────────────────────────────────────────────── */

/* Stacked plates — product and asset readiness */
const IconAssets = (p) => (
  <svg {...base} {...p}>
    <rect x="2.2" y="5.6" width="8.2" height="8.2" />
    <rect x="5.6" y="2.2" width="8.2" height="8.2" />
  </svg>
);

/* Concentric rings and a centre mark — targeting. The hero diagram in miniature. */
const IconTarget = (p) => (
  <svg {...base} {...p}>
    <circle cx="8" cy="8" r="6" />
    <circle cx="8" cy="8" r="2.9" />
    <circle cx="8" cy="8" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

/* Card and flap — invitations and RSVP */
const IconInvitation = (p) => (
  <svg {...base} {...p}>
    <rect x="1.8" y="3.6" width="12.4" height="9" />
    <path d="M1.8 3.6 L8 9 L14.2 3.6" />
  </svg>
);

/* Emitting arcs — retail briefing going out to the floor */
const IconBriefing = (p) => (
  <svg {...base} {...p}>
    <circle cx="3.4" cy="8" r="1.1" fill="currentColor" stroke="none" />
    <path d="M6.6 4.6 A4.8 4.8 0 0 1 6.6 11.4" strokeLinecap="round" />
    <path d="M9.6 2.4 A7.6 7.6 0 0 1 9.6 13.6" strokeLinecap="round" />
  </svg>
);

/* Case with a lid seam — VM, samples and vendor movement */
const IconCase = (p) => (
  <svg {...base} {...p}>
    <rect x="2.2" y="4.6" width="11.6" height="9.2" />
    <path d="M2.2 7.6 H13.8" />
    <path d="M6.4 4.6 V2.4 H9.6 V4.6" />
  </svg>
);

/* Ascending bars on a baseline — reporting */
const IconReporting = (p) => (
  <svg {...base} {...p}>
    <path d="M2 13.8 H14" />
    <path d="M4.6 13.8 V9.6" />
    <path d="M8 13.8 V6.4" />
    <path d="M11.4 13.8 V3.2" />
  </svg>
);

const WORKSTREAM_ICONS = {
  assets: IconAssets,
  target: IconTarget,
  invitation: IconInvitation,
  briefing: IconBriefing,
  case: IconCase,
  reporting: IconReporting,
};

export function WorkstreamIcon({ name, className = '' }) {
  const Cmp = WORKSTREAM_ICONS[name];
  return Cmp ? <Cmp className={className} /> : null;
}

/* ── Document marks ─────────────────────────────────────────────────────── */

/* Marker on a rule — a reminder pinned to a date */
const IconPin = (p) => (
  <svg {...base} {...p}>
    <path d="M5.4 2.2 V13.8" />
    <path d="M5.4 2.6 L12.6 4.8 L5.4 7 Z" />
  </svg>
);

/* Folded page — the brief */
const IconPage = (p) => (
  <svg {...base} {...p}>
    <path d="M3.4 1.8 H9.8 L12.8 4.8 V14.2 H3.4 Z" />
    <path d="M9.8 1.8 V4.8 H12.8" />
    <path d="M5.8 9 H10.4" />
    <path d="M5.8 11.4 H10.4" />
  </svg>
);

/* Bounded tick — the checklist */
const IconCheck = (p) => (
  <svg {...base} {...p}>
    <rect x="2.2" y="2.2" width="11.6" height="11.6" />
    <path d="M5.2 8.2 L7.2 10.2 L11 6.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DOCUMENT_ICONS = { pin: IconPin, page: IconPage, check: IconCheck };

export function DocumentIcon({ name, className = '' }) {
  const Cmp = DOCUMENT_ICONS[name];
  return Cmp ? <Cmp className={className} /> : null;
}

/* ── Status glyphs ──────────────────────────────────────────────────────────
   These replace the literal characters ■ ◆ ◐ ○ △ that the status chips used
   first. Those render at wildly different weights and baselines depending on
   which font in the stack actually has the glyph, and ◐ in particular is
   missing from Outfit and fell back to something noticeably heavier. Drawn as
   SVG they are consistent everywhere and align to the cap height on purpose.

   The shape is the primary status signal, the word beside it is the second,
   and colour is only the third — so status survives greyscale, colour vision
   deficiency and a screen reader. */

const glyphBase = {
  viewBox: '0 0 10 10',
  'aria-hidden': 'true',
  className: 'cw-status__glyph',
};

const GlyphSquare = () => (
  <svg {...glyphBase}><rect x="1.6" y="1.6" width="6.8" height="6.8" fill="currentColor" /></svg>
);
const GlyphDiamond = () => (
  <svg {...glyphBase}><path d="M5 0.8 L9.2 5 L5 9.2 L0.8 5 Z" fill="currentColor" /></svg>
);
/* Half-filled — in progress. The fill is the completed half. */
const GlyphHalf = () => (
  <svg {...glyphBase}>
    <circle cx="5" cy="5" r="3.7" fill="none" stroke="currentColor" strokeWidth="1.2" />
    <path d="M5 1.3 A3.7 3.7 0 0 1 5 8.7 Z" fill="currentColor" />
  </svg>
);
const GlyphCircle = () => (
  <svg {...glyphBase}>
    <circle cx="5" cy="5" r="3.7" fill="none" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);
/* Open triangle — the one state that needs attention. Deliberately the only
   shape in the set with a point at the top. */
const GlyphTriangle = () => (
  <svg {...glyphBase}>
    <path d="M5 1 L9.2 8.6 L0.8 8.6 Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
);

const GLYPHS = {
  square: GlyphSquare,
  diamond: GlyphDiamond,
  half: GlyphHalf,
  circle: GlyphCircle,
  triangle: GlyphTriangle,
};

export function StatusGlyph({ shape }) {
  const Cmp = GLYPHS[shape];
  return Cmp ? <Cmp /> : null;
}

/* ── Utility marks ──────────────────────────────────────────────────────── */

/* Outbound arrow, for links that leave the page */
export function ArrowOut({ className = '' }) {
  return (
    <svg viewBox="0 0 14 14" fill="none" aria-hidden="true" className={`shrink-0 ${className}`}>
      <path d="M4 10L10 4M10 4H5M10 4V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* The registration crosshair already used as the bullet marker across the
   portfolio's experience cards. Repeated here so the evidence section speaks in
   the same voice as the section it draws from. */
export function Crosshair({ className = '', stroke = '#8a8a8a' }) {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true" className={className}>
      <path d="M4.5 0v9M0 4.5h9" stroke={stroke} strokeWidth="1.1" />
    </svg>
  );
}
