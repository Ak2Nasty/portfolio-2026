import { useEffect, useState, useRef, memo, useCallback } from 'react';
import { useLenis } from 'lenis/react';
import { STUDY, SECTIONS, DISCLAIMER } from '../data/caseStudyData';
import { Icon } from './icons';

/* ─── Page chrome ────────────────────────────────────────────────────────────
   Header, section index and footer. None of these are the site's own — the
   portfolio's navbar and command palette are deliberately absent from this
   route, because this is a document rather than a part of the site's
   navigation, and an unlisted page carrying the site nav would invite the
   reader back out of it before they had read anything. */

/* ── Scroll spy ───────────────────────────────────────────────────────────────
   Which section the reader is currently in, for the index and the mobile
   readout.

   IntersectionObserver with a band rather than a threshold: a threshold on a
   tall section never fires because the section never fits the viewport, and a
   threshold on a short one fires twice. The band is a horizontal line 40% down
   the viewport, and the current section is whichever one is crossing it —
   which is how a reader would answer the question themselves.

   `rootMargin` collapses the viewport to that line: -40% from the top, -60%
   from the bottom, leaving a 0px-tall detection strip. */
/* ── ONE observer, shared ──
   The header and the rail both need the same single fact — which section am I
   in — and each used to install its own IntersectionObserver over all twenty
   sections. Two sets of observer callbacks and two React state updates per
   section boundary, for one piece of information.

   This is a module-level singleton with subscribers: the first consumer builds
   the observer, the last one to unmount tears it down. `ids` also no longer
   goes through a dependency array — it was a fresh array on every render, so
   the effect re-ran and rebuilt the observer far more often than it needed to. */
const SECTION_IDS = SECTIONS.map((s) => s.id);
let activeSection = SECTION_IDS[0];
let sectionObserver = null;
const sectionSubscribers = new Set();

function ensureSectionObserver() {
  if (sectionObserver) return;
  const seen = new Map();
  sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => seen.set(e.target.id, e.isIntersecting));
      /* Ids are in document order, so the first intersecting one is the correct
         answer whenever two briefly overlap. */
      const current = SECTION_IDS.find((id) => seen.get(id));
      /* Only notify on an actual change — the observer fires far more often
         than the answer changes. */
      if (current && current !== activeSection) {
        activeSection = current;
        sectionSubscribers.forEach((fn) => fn(current));
      }
    },
    { rootMargin: '-40% 0px -60% 0px', threshold: 0 },
  );
  SECTION_IDS.map((id) => document.getElementById(id))
    .filter(Boolean)
    .forEach((n) => sectionObserver.observe(n));
}

function useActiveSection() {
  const [active, setActive] = useState(activeSection);
  useEffect(() => {
    ensureSectionObserver();
    sectionSubscribers.add(setActive);
    /* No sync-on-mount needed: useState(activeSection) above already reads the
       current shared value, and nothing can move that value before the observer
       exists — the observer is created on the line above. */
    return () => {
      sectionSubscribers.delete(setActive);
      if (sectionSubscribers.size === 0 && sectionObserver) {
        sectionObserver.disconnect();
        sectionObserver = null;
        activeSection = SECTION_IDS[0];
      }
    };
  }, []);
  return active;
}

/* ── Header ───────────────────────────────────────────────────────────────────
   Hides on the way down, returns on the way up. On a twenty-section document a
   permanently pinned header is 60px of every screenful spent on something the
   reader already knows; returning it the moment they scroll up costs nothing
   and is there exactly when they are looking for a way out. */
export function CaseStudyHeader() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const active = useActiveSection();
  const current = SECTIONS.find((s) => s.id === active) ?? SECTIONS[0];

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      /* 12px of slack, so a trackpad's sub-pixel jitter cannot flicker it. */
      if (Math.abs(y - lastY.current) > 12) {
        setHidden(y > lastY.current && y > 220);
        lastY.current = y;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="mf-header fixed top-0 left-0 right-0 z-50 transition-transform duration-300"
      style={{
        transform: hidden ? 'translateY(-101%)' : 'translateY(0)',
        borderBottom: '1px solid var(--mf-line)',
      }}
    >
      <div className="mf-shell max-w-[88rem] mx-auto px-6 md:px-10 lg:px-14 h-[62px] flex items-center justify-between gap-4 md:gap-8">
        {/* ── Identity ──
            Links are padded to fill the bar's height rather than hugging their
            text: a 16px tap target in a 62px bar is a miss waiting to happen. */}
        <a href="#hero" className="flex items-center gap-3 min-w-0 h-full py-2 pr-1 group shrink-0">
          {/* The registration mark, which is the page's own motif — it opens
              every section head, so the header carries the same one. */}
          <span
            aria-hidden="true"
            className="mf-mark transition-transform duration-300 group-hover:rotate-45"
          />
          <span className="mf-wordmark text-[15px] shrink-0" style={{ color: 'var(--mf-ink)' }}>
            <span className="sr-only">{STUDY.name}</span>
            <span aria-hidden="true">{STUDY.name.toUpperCase()}</span>
          </span>
        </a>

        {/* ── Position ──
            The single most useful thing a header can carry on a document this
            long. Hidden below sm, where there is no room and the numbered
            section heads do the job instead. */}
        <a
          href={`#${current.id}`}
          className="mf-header__pos hidden sm:inline-flex min-w-0"
          aria-label={`Currently in section ${current.n}, ${current.name}`}
        >
          <span
            className="font-['Outfit'] text-[10.5px] font-semibold shrink-0"
            style={{ letterSpacing: '0.14em', color: 'var(--mf-accent)' }}
          >
            {current.n}
          </span>
          <span
            className="font-['Outfit'] text-[11.5px] font-medium truncate"
            style={{ color: 'var(--mf-ink-2)' }}
          >
            {current.name}
          </span>
        </a>

        {/* ── Actions ── */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0 h-full">
          <a
            href="#prototype"
            className="mf-tap inline-flex items-center gap-2 font-['Outfit'] text-[10.5px] font-semibold uppercase px-3 py-2.5 rounded-[4px] transition-colors duration-200"
            style={{
              letterSpacing: '0.13em',
              color: 'var(--mf-accent)',
              border: '1px solid var(--mf-accent-line)',
            }}
          >
            <Icon name="pump" size={13} />
            <span className="hidden md:inline">Try the prototype</span>
            <span className="md:hidden">Prototype</span>
          </a>

          <a
            href="https://akshathdayansuresh.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="mf-underline hidden lg:inline-flex items-center gap-2 font-['Outfit'] text-[10.5px] font-semibold uppercase py-2"
            style={{ letterSpacing: '0.13em', color: 'var(--mf-muted)', minHeight: 38 }}
          >
            Akshathdayan Suresh
            <Icon name="external" size={12} />
          </a>
        </div>
      </div>

    </header>
  );
}

/* One row of the rail, memoised on its own active flag. Without this, moving
   between two sections re-rendered all twenty anchors; now only the row being
   left and the row being entered actually change. */
const IndexRow = memo(function IndexRow({ s, isActive, onClick }) {
  return (
    <a
      href={`#${s.id}`}
      aria-current={isActive ? 'true' : undefined}
      onClick={(e) => onClick(e, s.id)}
    >
      <span className="tabular-nums mr-2" style={{ opacity: 0.7 }}>{s.n}</span>
      {s.name}
    </a>
  );
});

/* ── Section index ────────────────────────────────────────────────────────────
   Desktop only, from 1280px. Below that it would take a column the layout does
   not have to spare, and the mobile answer is the progress hairline plus the
   numbered section heads — which are already there.

   Anchors, not buttons: they work without JavaScript, they are in the tab
   order for free, they can be opened in a new tab, and Lenis is only used to
   soften the jump when it is available. */
export function SectionIndex() {
  const lenis = useLenis();
  const active = useActiveSection();

  /* Stable identity, or every IndexRow's memo is defeated by a new function
     on each render. */
  const onClick = useCallback((e, id) => {
    const el = document.getElementById(id);
    if (!el || !lenis) return; /* no Lenis → let the browser do its native jump */
    e.preventDefault();
    lenis.scrollTo(el, { offset: -80 });
    /* The anchor still belongs in the URL so the position is shareable and the
       back button behaves. */
    window.history.replaceState(null, '', `#${id}`);
  }, [lenis]);

  return (
    <nav
      aria-label="Case study sections"
      className="hidden xl:block fixed left-6 top-1/2 -translate-y-1/2 z-40 w-[190px]"
    >
      <div className="mf-index flex flex-col max-h-[76vh] overflow-y-auto pr-2">
        {SECTIONS.map((s) => (
          <IndexRow key={s.id} s={s} isActive={active === s.id} onClick={onClick} />
        ))}
      </div>
    </nav>
  );
}

/* ── Footer ───────────────────────────────────────────────────────────────── */
export function CaseStudyFooter() {
  return (
    <footer
      className="w-full"
      style={{ background: 'var(--mf-bg-alt)', borderTop: '1px solid var(--mf-line)' }}
    >
      {/* mf-shell so the fixed section index does not land on the footer when
          the reader is scrolled to the bottom of the document. The header does
          NOT need it: the rail is vertically centred and never reaches 58px. */}
      <div className="mf-shell max-w-[88rem] mx-auto px-6 md:px-10 lg:px-14 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-8 lg:gap-16">
          <div>
            {/* Same logotype treatment as the hero and header. This was still
                on the old negative tracking, which is exactly what made the
                lowercase l collapse into the F — the bug was fixed in the hero
                and left here. */}
            <span className="mf-wordmark text-[22px] block" style={{ color: 'var(--mf-ink)' }}>
              <span className="sr-only">{STUDY.name}</span>
              <span aria-hidden="true">{STUDY.name.toUpperCase()}</span>
            </span>
            <span
              className="font-['Outfit'] text-[12px] block mt-3"
              style={{ color: 'var(--mf-muted)' }}
            >
              {STUDY.subtitle}
            </span>
            <span
              className="font-['Outfit'] text-[10.5px] font-semibold uppercase block mt-5"
              style={{ letterSpacing: '0.16em', color: 'var(--mf-muted)' }}
            >
              {STUDY.label}
            </span>
          </div>

          <div>
            <span
              className="font-['Outfit'] text-[10px] font-semibold uppercase block mb-4"
              style={{ letterSpacing: '0.16em', color: 'var(--mf-muted)' }}
            >
              Disclaimer
            </span>
            <p
              className="font-['Outfit'] text-[12.5px] leading-[1.75] m-0"
              style={{ color: 'var(--mf-muted)' }}
            >
              {DISCLAIMER}
            </p>
          </div>
        </div>

        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-12 pt-7"
          style={{ borderTop: '1px solid var(--mf-line)' }}
        >
          <span className="font-['Outfit'] text-[11.5px]" style={{ color: 'var(--mf-muted)' }}>
            &copy; {new Date().getFullYear()} Akshathdayan Suresh
          </span>
          <a
            href="https://akshathdayansuresh.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="mf-tap inline-flex items-center gap-2 font-['Outfit'] text-[11px] font-semibold uppercase py-2"
            style={{ letterSpacing: '0.14em', color: 'var(--mf-accent)' }}
          >
            akshathdayansuresh.com
            <Icon name="external" size={12} />
          </a>
        </div>
      </div>
    </footer>
  );
}
