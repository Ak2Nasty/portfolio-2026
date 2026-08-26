import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ExperienceCard } from '../home/components/ExperienceCard';
import { experiences } from '../home/components/experiences';

/* ─── Stack geometry, as competing formulas ──────────────────────────────────
   The live stack puts card i at `15vh + i * 20px`. That spends 20px of vertical
   space per card, and the active card still needs its full height underneath —
   so past a certain depth the card's bottom falls below the fold. On a 682px
   viewport the budget is 682 − 480 (card) − 102 (15vh) = 100px for the WHOLE
   fan, but ten cards at 20px want 180px.

   Each variant below is a different answer to "where does the fan's height go?" */

export const VARIANTS = {
  current: {
    name: 'Current',
    blurb: 'i × 20px — unbounded',
    top: ({ i, TOP }) => TOP + i * 20,
  },
  tight: {
    /* The simplest answer: keep every step equal, just make it small enough to
       fit. The step is the fan budget shared across the gaps, so it shrinks on
       short screens instead of overflowing them. */
    name: 'D · Tighter step',
    blurb: 'even steps, sized to fit',
    top: ({ i, TOP, FAN, gaps }) => TOP + i * Math.min(20, FAN / gaps),
  },
  pocket: {
    name: 'A · Pocket',
    blurb: 'caps at 4 edges, then flat',
    top: ({ i, TOP }) => TOP + Math.min(i, 4) * 20,
  },
  fan: {
    name: 'B · Compressing fan',
    blurb: 'steps decay, total converges',
    top: ({ i, TOP, FAN }) => TOP + FAN * (1 - Math.exp(-i / 3)),
  },
  deck: {
    name: 'C · Receding deck',
    blurb: 'decaying fan + scale/dim by depth',
    top: ({ i, TOP, FAN }) => TOP + FAN * 0.76 * (1 - Math.exp(-i / 3)),
    depth: (d) => ({
      transform: `scale(${(1 - Math.min(d, 5) * 0.016).toFixed(3)})`,
      opacity: 1 - Math.min(d, 5) * 0.05,
    }),
  },
};

/* Unclamped keeps a hardcoded fan; clamped derives it from the viewport so the
   stack cannot mathematically push a card below the fold on any screen height. */
export function fanSize({ vh, cardH, TOP, clamp }) {
  const base = 100;
  if (!clamp) return base;
  return Math.max(24, Math.min(base, vh - cardH - TOP - 24));
}

export function StackPreview({ variant = 'current', clamp = true, at = 8 }) {
  const v = VARIANTS[variant] || VARIANTS.current;
  const wrapRef = useRef(null);
  const cardEls = useRef([]);
  const [geo, setGeo] = useState({ vh: 0, cardH: 480, TOP: 0, FAN: 100 });
  const [active, setActive] = useState(0);

  /* Measure before paint: the card's real height drives the whole calculation,
     and hardcoding 480 was what hid this bug in the first place. */
  useLayoutEffect(() => {
    const measure = () => {
      const vh = window.innerHeight;
      const first = cardEls.current[0];
      const back = first && first.querySelector('.exp-back');
      const cardH = back ? Math.round(back.getBoundingClientRect().height) : 480;
      const TOP = Math.round(vh * 0.15);
      setGeo({ vh, cardH, TOP, FAN: fanSize({ vh, cardH, TOP, clamp }) });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [clamp, variant]);

  /* Which card is currently the front of the pile — only needed by the deck
     variant, but cheap enough to keep general. rAF-throttled, same shape as the
     --live loop Career12 already runs. */
  useEffect(() => {
    if (!v.depth) return undefined;
    let raf = 0;
    const apply = () => {
      raf = 0;
      let a = 0;
      cardEls.current.forEach((el, i) => {
        if (!el) return;
        const top = parseFloat(getComputedStyle(el).top);
        if (el.getBoundingClientRect().top <= top + 1) a = i;
      });
      setActive(a);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };
    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [v]);

  /* Park the pile so card `at` is the one on top — otherwise every frame would
     show card 0 and the whole comparison would be pointless. */
  useEffect(() => {
    const t = setTimeout(() => {
      const el = cardEls.current[at];
      if (!el) return;
      const top = v.top({ i: at, TOP: geo.TOP, FAN: geo.FAN, gaps: experiences.length - 1 });
      const flow = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, Math.max(0, flow - top));
    }, 260);
    return () => clearTimeout(t);
  }, [at, geo.TOP, geo.FAN, v]);

  return (
    <div ref={wrapRef} style={{ background: '#0C0C0B', minHeight: '100vh' }}>
      <div className="w-full lg:w-[60%]" style={{ marginLeft: 'auto', marginRight: 'auto', paddingBottom: '40vh' }}>
        {experiences.map((exp, i) => {
          const top = v.top({ i, TOP: geo.TOP, FAN: geo.FAN, gaps: experiences.length - 1 });
          const d = v.depth ? v.depth(Math.max(0, active - i)) : null;
          return (
            <ExperienceCard
              key={i}
              exp={exp}
              index={i}
              cardRef={(el) => { cardEls.current[i] = el; }}
              topOverride={`${top.toFixed(1)}px`}
              depthTransform={d ? d.transform : undefined}
              depthOpacity={d ? d.opacity : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}

export default StackPreview;
