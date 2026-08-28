import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useLenis } from 'lenis/react';
import './chanel-wfj.css';
import { ApplicationHeader } from './components/ApplicationHeader';
import { PrecisionHero } from './components/PrecisionHero';
import { LaunchControl } from './components/LaunchControl';
import { ClientActivation } from './components/ClientActivation';
import { RetailReadiness } from './components/RetailReadiness';
import { ActivationRecap } from './components/ActivationRecap';
import { ExperienceEvidence } from './components/ExperienceEvidence';
import { ApplicationClosing } from './components/ApplicationClosing';
import { ApplicationFooter } from './components/ApplicationFooter';
import { WORKSTREAMS } from './data/applicationData';

const TITLE = 'The Work Behind the Moment | Akshathdayan Suresh';
const DESCRIPTION =
  'An independent application study exploring launch coordination, client activation, retail readiness and post-activation reporting for luxury watches and fine jewellery.';

/* ─── Route-scoped document metadata ─────────────────────────────────────────
   The site has no metadata library and index.html is static, so per-route head
   management is done here directly. Everything this hook writes, it also undoes:
   the title is restored, the description is put back to its previous value, and
   any tag this hook created is removed on unmount.

   That symmetry is the whole point. The robots directive MUST NOT survive a
   navigation to the homepage — leaving a stray noindex behind would quietly
   deindex the live portfolio, which is by far the worst thing this page could
   do. So the tag is created here, owned here, and destroyed here. */
function useApplicationMetadata() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = TITLE;

    /* Reuse the existing description tag if index.html already provides one,
       remembering its value; only create a tag when none exists. */
    let description = document.querySelector('meta[name="description"]');
    const createdDescription = !description;
    const previousDescription = description ? description.getAttribute('content') : null;
    if (!description) {
      description = document.createElement('meta');
      description.setAttribute('name', 'description');
      document.head.appendChild(description);
    }
    description.setAttribute('content', DESCRIPTION);

    /* noindex, nofollow — this route only. The page is unlisted, not private:
       anyone with the link can open it, it is simply kept out of search results
       and carries no link equity onward. */
    let robots = document.querySelector('meta[name="robots"]');
    const createdRobots = !robots;
    const previousRobots = robots ? robots.getAttribute('content') : null;
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.appendChild(robots);
    }
    robots.setAttribute('content', 'noindex, nofollow');

    /* EasterEggs (mounted app-wide) swaps the title to a teaser when the tab is
       hidden and restores whatever the title was when IT mounted — which is the
       homepage's. Re-asserting on return keeps this route's title correct. This
       listener is added after that one, so it runs second and wins. */
    const reassertTitle = () => {
      if (!document.hidden) document.title = TITLE;
    };
    document.addEventListener('visibilitychange', reassertTitle);

    /* ── Display face, route-scoped ────────────────────────────────────────
       Jost is loaded here rather than @imported in the stylesheet: an @import
       lands in the shared bundle and would download the face on every route,
       including a homepage that never sets a word in it.

       preconnect first, because the stylesheet on fonts.googleapis.com then
       pulls the font binary from a SECOND origin (fonts.gstatic.com) — without
       it that connection is only opened after the CSS has parsed. */
    const fontNodes = [
      Object.assign(document.createElement('link'), { rel: 'preconnect', href: 'https://fonts.googleapis.com' }),
      Object.assign(document.createElement('link'), { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' }),
      Object.assign(document.createElement('link'), {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700&display=swap',
      }),
    ];
    fontNodes.forEach((n) => document.head.appendChild(n));

    /* ── Body ground ──────────────────────────────────────────────────────
       :root and body are painted #0C0C0B site-wide. This route runs on cream,
       and without swapping the body the dark ground shows through on overscroll
       bounce and behind the fixed progress rule. Swapped on mount, restored
       exactly on unmount — the inline style is removed rather than set back to
       a guess, so the stylesheet's own value takes over again. */
    const prevBodyBg = document.body.style.backgroundColor;
    const prevRootBg = document.documentElement.style.backgroundColor;
    /* Must match --cw-bg exactly. It was left at #ffffff after the palette
       moved to cream, which showed as a white band behind the page on
       overscroll bounce. */
    document.body.style.backgroundColor = '#efe8d9';
    document.documentElement.style.backgroundColor = '#efe8d9';

    return () => {
      document.removeEventListener('visibilitychange', reassertTitle);
      document.title = previousTitle;
      fontNodes.forEach((n) => n.remove());
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.backgroundColor = prevRootBg;

      if (createdDescription) description.remove();
      else if (previousDescription !== null) description.setAttribute('content', previousDescription);

      if (createdRobots) robots.remove();
      else if (previousRobots !== null) robots.setAttribute('content', previousRobots);
    };
  }, []);
}

/* ─── Scroll progress ────────────────────────────────────────────────────────
   Reads page scroll directly and drives one hairline's scaleX. Spring-smoothed
   so it glides rather than stepping with each scroll event.

   This is scroll-LINKED, not scroll-triggered: it has no start, no end and no
   duration of its own, and it runs backwards when you scroll back up. That is
   the distinction the whole page now follows.

   scaleX on a 1px element is compositor-only — no layout, no paint. */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.3 });
  return <motion.div className="cwfj-progress" style={{ scaleX }} aria-hidden="true" />;
}

export default function ChanelWFJPage() {
  const lenis = useLenis();
  useApplicationMetadata();

  /* Which workstream row is open. Lifted to the page because TWO components
     drive it: the hero dial selects one, and the readiness view opens and
     closes them directly. Anything lower would need an event bus to cross
     between the two sections. */
  const [openWorkstream, setOpenWorkstream] = useState(WORKSTREAMS[0].id);

  /* Lenis persists scroll position across route changes, so arriving here from
     another route can land mid-page. Immediate, not animated — this is arrival,
     not navigation. */
  useEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo({ top: 0, behavior: 'instant' });
  }, [lenis]);

  return (
    /* .cwfj is the isolation root. Every rule in chanel-wfj.css is scoped
       beneath it, so none of this page's styling can reach another route. */
    <div className="cwfj relative w-full min-h-screen overflow-x-hidden">
      {/* Skip link — first thing in the tab order, visible only when focused. */}
      <a
        href="#launch-control"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:top-4 focus:left-4 focus:px-5 focus:py-3 focus:bg-[var(--cw-ink)] focus:text-[var(--cw-bg)] focus:font-['Outfit'] focus:text-[11px] focus:font-semibold focus:tracking-[0.2em] focus:uppercase"
      >
        Skip to the system
      </a>

      <ScrollProgress />
      <ApplicationHeader />

      <main>
        <PrecisionHero />
        <LaunchControl openId={openWorkstream} onToggle={setOpenWorkstream} />
        <ClientActivation />
        <RetailReadiness />
        <ActivationRecap />
        <ExperienceEvidence />
        <ApplicationClosing />
      </main>

      <ApplicationFooter />
    </div>
  );
}
