import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ExperienceCard } from '../home/components/ExperienceCard';
import { experiences } from '../home/components/experiences';
import { StackPreview, VARIANTS } from './StackPreview';

/* ─── Card blueprint ─────────────────────────────────────────────────────────
   A workbench for the experience card. Renders ExperienceCard — the same
   component the live section uses, not a copy — outside the sticky stack, at
   several widths at once.

   Each preview is an IFRAME rather than a scaled div, and that is the whole
   point: the card's breakpoints are viewport media queries, so a 1440px card
   inside a 900px window would still render its 900px layout. An iframe gets its
   own viewport, so `md:`, `lg:` and `min-[1440px]:` all resolve honestly. The
   frame is laid out at its true width and then visually scaled to fit. */

/* The width at which the metric moves from inline to its own rail. Kept here so
   the lab can label which side of the line each frame falls on. */
const RAIL_AT = 1440;

/* `Your screen` is measured, not assumed. OS display scaling (125% is the common
   Windows laptop default) means a 1920px panel reports a ~1536px CSS viewport,
   so eyeballing the hardware resolution gives the wrong breakpoint. */
function buildFrames(vw) {
  return [
    { label: 'Mobile', w: 375, h: 700, face: 'back', note: 'same card as desktop' },
    { label: 'Your screen', w: vw, h: 760, face: 'back', note: 'this browser’s actual CSS viewport', you: true },
    { label: 'Desktop 1024', w: 1024, h: 800, face: 'back', note: 'narrowest the card ever gets (479px)' },
    { label: `Desktop ${RAIL_AT}`, w: RAIL_AT, h: 700, face: 'back', note: 'rail threshold' },
  ];
}

export function CardLab() {
  const [params] = useSearchParams();
  const frameMode = params.get('frame') === '1';
  const idx = Math.min(Math.max(parseInt(params.get('i') || '0', 10) || 0, 0), experiences.length - 1);
  const face = params.get('face') === 'front' ? 'front' : 'back';

  /* Stack frame: the whole pile under one geometry formula. */
  if (params.get('stack')) {
    return (
      <StackPreview
        variant={params.get('stack')}
        clamp={params.get('clamp') !== '0'}
        at={parseInt(params.get('at') || '8', 10)}
      />
    );
  }

  /* Inside a frame: just the card, centred, nothing else. */
  if (frameMode) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', background: '#0C0C0B' }}>
        <div className="w-full lg:w-[60%]">
          <ExperienceCard
            exp={experiences[idx]}
            index={0}
            standalone
          />
        </div>
      </div>
    );
  }

  return <LabShell idx={idx} />;
}

function LabShell({ idx: initialIdx }) {
  const [idx, setIdx] = useState(initialIdx);
  const [nonce, setNonce] = useState(0);
  const [vw, setVw] = useState(() => window.innerWidth);
  const exp = experiences[idx];

  React.useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const frames = buildFrames(vw);

  return (
    <div style={{ minHeight: '100vh', background: '#0C0C0B', color: '#f4f4f4', padding: '32px 28px 80px' }}>
      <header style={{ marginBottom: 26 }}>
        <div style={{ fontFamily: 'Outfit', fontSize: 10, letterSpacing: '0.28em', color: '#8a8a8a', textTransform: 'uppercase' }}>
          Blueprint · not a route on the live site
        </div>
        <h1 className="font-monument" style={{ fontSize: 34, margin: '8px 0 0', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          Card Lab
        </h1>
        <p style={{ fontFamily: 'Outfit', fontSize: 13, color: '#8a8a8a', maxWidth: 620, lineHeight: 1.6, marginTop: 10 }}>
          Renders <code style={{ color: '#c9c9c9' }}>ExperienceCard</code> — the same component the live
          section maps over. Edit that file and every card here and on the site changes together.
        </p>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {experiences.map((e, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            style={{
              fontFamily: 'Outfit', fontSize: 11, letterSpacing: '0.08em', cursor: 'pointer',
              padding: '7px 13px', borderRadius: 999,
              border: `1px solid ${i === idx ? (e.brandColor || '#f4f4f4') : '#2a2a2a'}`,
              background: i === idx ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: i === idx ? (e.brandColor || '#f4f4f4') : '#9a9a9a',
            }}
          >
            {e.company}
          </button>
        ))}
        <button
          onClick={() => setNonce((n) => n + 1)}
          style={{
            fontFamily: 'Outfit', fontSize: 11, letterSpacing: '0.08em', cursor: 'pointer',
            padding: '7px 13px', borderRadius: 999, border: '1px solid #2a2a2a',
            background: 'transparent', color: '#9a9a9a', marginLeft: 'auto',
          }}
        >
          ↻ Reload frames
        </button>
      </div>

      <div style={{ fontFamily: 'Outfit', fontSize: 11, color: '#666', marginBottom: 10, letterSpacing: '0.06em' }}>
        Showing <span style={{ color: exp.brandColor || '#f4f4f4' }}>{exp.company}</span>
        {exp.metric ? ` · metric ${exp.metricPrefix || ''}${exp.metric}${exp.metricSuffix || ''}` : ' · no metric'}
      </div>

      <div style={{ fontFamily: 'Outfit', fontSize: 11, color: '#8a8a8a', marginBottom: 26, letterSpacing: '0.04em' }}>
        Your CSS viewport is <strong style={{ color: '#f4f4f4' }}>{vw}px</strong>
        {window.devicePixelRatio !== 1 && (
          <> · OS/browser scaling <strong style={{ color: '#f4f4f4' }}>{Math.round(window.devicePixelRatio * 100)}%</strong> (panel reports {Math.round(vw * window.devicePixelRatio)}px)</>
        )}
        {' · '}
        <span style={{ color: vw >= RAIL_AT ? '#7CD65C' : '#D6A35C' }}>
          {vw >= RAIL_AT ? 'metric rail is ON here' : 'metric is inline here'}
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 30, alignItems: 'flex-start' }}>
        {frames.map((f) => (
          <Frame key={f.label} {...f} idx={idx} nonce={nonce} />
        ))}
      </div>

      <StackSection vw={vw} nonce={nonce} />
    </div>
  );
}

/* ─── Stack comparison ───────────────────────────────────────────────────────
   Each frame is the FULL pile under one geometry formula, parked so card 9 is
   on top — the depth where the current formula runs out of room. Frames are
   your own viewport height, so what clips here clips on your screen. */
function StackSection({ vw, nonce }) {
  const [at, setAt] = useState(8);
  const keys = Object.keys(VARIANTS);

  return (
    <div style={{ marginTop: 56 }}>
      <div style={{ fontFamily: 'Outfit', fontSize: 11, letterSpacing: '0.28em', color: '#8a8a8a', textTransform: 'uppercase' }}>
        Stack geometry
      </div>
      <h2 className="font-monument" style={{ fontSize: 24, margin: '8px 0 6px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
        Where does the fan’s height go?
      </h2>
      <p style={{ fontFamily: 'Outfit', fontSize: 12, color: '#8a8a8a', maxWidth: 700, lineHeight: 1.6, margin: '0 0 16px' }}>
        Top row derives the fan from viewport height (clamped). Bottom row uses a fixed 100px (unclamped).
        Watch the bottom edge of the front card — the CTA and the location line are what fall off.
      </p>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 22, fontFamily: 'Outfit', fontSize: 11 }}>
        <span style={{ color: '#7a7a7a', letterSpacing: '0.08em' }}>Parked on card</span>
        {[4, 6, 8, 9].map((n) => (
          <button
            key={n}
            onClick={() => setAt(n)}
            style={{
              cursor: 'pointer', padding: '5px 12px', borderRadius: 999,
              border: `1px solid ${n === at ? '#f4f4f4' : '#2a2a2a'}`,
              background: 'transparent', color: n === at ? '#f4f4f4' : '#8a8a8a', fontFamily: 'Outfit', fontSize: 11,
            }}
          >
            {n}
          </button>
        ))}
      </div>

      {[true, false].map((clamp) => (
        <div key={String(clamp)} style={{ marginBottom: 30 }}>
          <div style={{ fontFamily: 'Outfit', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: clamp ? '#7CD65C' : '#D6A35C', marginBottom: 10 }}>
            {clamp ? 'Clamped · fan derived from 100vh' : 'Unclamped · fixed 100px fan'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-start' }}>
            {keys.map((k) => (
              <StackFrame key={k} variant={k} clamp={clamp} at={at} vw={vw} nonce={nonce} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function StackFrame({ variant, clamp, at, vw, nonce }) {
  const v = VARIANTS[variant];
  const w = vw;
  const h = window.innerHeight;
  const scale = Math.min(1, 330 / w);

  return (
    <figure style={{ margin: 0 }}>
      <figcaption style={{ fontFamily: 'Outfit', marginBottom: 8 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: variant === 'current' ? '#D6A35C' : '#f4f4f4' }}>
          {v.name}
        </div>
        <div style={{ fontSize: 10, color: '#7a7a7a', marginTop: 3 }}>{v.blurb}</div>
      </figcaption>
      <div style={{ width: w * scale, height: h * scale, overflow: 'hidden', borderRadius: 8, border: '1px solid #1f1f1f' }}>
        <iframe
          key={`${variant}-${clamp}-${at}-${nonce}`}
          title={`${variant}-${clamp}`}
          src={`/card-lab?stack=${variant}&clamp=${clamp ? 1 : 0}&at=${at}`}
          width={w}
          height={h}
          style={{ border: 0, transform: `scale(${scale})`, transformOrigin: 'top left', display: 'block' }}
        />
      </div>
    </figure>
  );
}


function Frame({ label, w, h, face, note, idx, nonce, you }) {
  /* Wide frames are scaled down to fit on screen. The iframe keeps its true
     pixel width so media queries still see 1440 — only the painted result is
     shrunk, via a transform on a wrapper sized to the scaled result so the
     layout does not reserve the unscaled footprint. */
  const max = w >= 1280 ? 620 : w >= 1024 ? 540 : 375;
  const scale = Math.min(1, max / w);
  const railOn = w >= RAIL_AT;

  return (
    <figure style={{ margin: 0 }}>
      <figcaption style={{ fontFamily: 'Outfit', marginBottom: 9 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: you ? '#7CD65C' : '#f4f4f4' }}>
          {label}{you ? ' ←' : ''}
        </div>
        <div style={{ fontSize: 10, color: '#7a7a7a', marginTop: 3 }}>
          {w}px wide · {w >= 768 ? (railOn ? 'metric rail' : 'metric inline') : 'flip card'}
          {note ? ` · ${note}` : ''}{scale < 1 ? ` · shown at ${Math.round(scale * 100)}%` : ''}
        </div>
      </figcaption>
      <div style={{ width: w * scale, height: h * scale, overflow: 'hidden', borderRadius: 10, border: `1px solid ${you ? 'rgba(124,214,92,0.4)' : '#1f1f1f'}` }}>
        <iframe
          key={`${idx}-${face}-${nonce}`}
          title={label}
          src={`/card-lab?frame=1&i=${idx}&face=${face}`}
          width={w}
          height={h}
          style={{ border: 0, transform: `scale(${scale})`, transformOrigin: 'top left', display: 'block' }}
        />
      </div>
    </figure>
  );
}

export default CardLab;
