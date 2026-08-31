import { useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useLenis } from 'lenis/react';
import './medflow.css';

import { CaseStudyHeader, SectionIndex, CaseStudyFooter } from './components/Chrome';
import { Hero } from './components/Hero';
import { WhyThisStudy, Scenario, HumanFactors } from './components/Context';
import { UserNeeds, WorkflowAnalysis, RiskAnalysis } from './components/Analysis';
import { Wireframes, FinalInterface } from './components/Interface';
import { Prototype } from './components/Prototype';
import { DesignSystem, Accessibility } from './components/System';
import { ProposedStudy, IterationExample } from './components/Evaluation';
import { CrossFunctional, Traceability, Frameworks } from './components/Practice';
import { WhatILearned, Capabilities, Closing } from './components/Reflection';
import { SECTIONS } from './data/caseStudyData';

const TITLE = 'MedFlow — Safety-Oriented Infusion Management UX Study | Akshathdayan Suresh';
const DESCRIPTION =
  'An independent conceptual UI/UX study exploring how Human Factors principles, task analysis, use-related risk thinking and iterative interface design can inform a safety-critical healthcare workflow.';

/* ─── Route-scoped document metadata ─────────────────────────────────────────
   The site has no metadata library and index.html is static, so per-route head
   management happens here. Everything this hook writes, it also undoes: the
   title is restored, the description is put back to its previous value, and any
   tag this hook created is removed on unmount.

   THAT SYMMETRY IS THE WHOLE POINT.
   The robots directive MUST NOT survive a navigation to the homepage. Leaving a
   stray noindex behind would quietly deindex the live portfolio, which is by a
   wide margin the worst thing this page could do. So the tag is created here,
   owned here, and destroyed here — and the cleanup distinguishes between a tag
   this hook created (remove it) and one that already existed (restore its
   previous value), because those are different repairs.

   This is the same contract /chanel-wfj runs on, deliberately unchanged. */
function useCaseStudyMetadata() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = TITLE;

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
       anyone with the link can open it. It is simply kept out of search results
       and passes no link equity onward. */
    let robots = document.querySelector('meta[name="robots"]');
    const createdRobots = !robots;
    const previousRobots = robots ? robots.getAttribute('content') : null;
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.appendChild(robots);
    }
    robots.setAttribute('content', 'noindex, nofollow');

    /* EasterEggs is mounted app-wide and swaps the title to a teaser when the
       tab is hidden, restoring whatever the title was when IT mounted — which
       is the homepage's. Re-asserting on return keeps this route's title
       correct. This listener is registered after that one, so it runs second
       and wins. */
    const reassertTitle = () => {
      if (!document.hidden) document.title = TITLE;
    };
    document.addEventListener('visibilitychange', reassertTitle);

    /* ── Body ground ──
       :root and body are painted #0C0C0B site-wide. This route runs on paper,
       and without swapping the body the dark ground shows through on overscroll
       bounce and behind the fixed progress rule. Must match --mf-bg exactly.
       Restored by REMOVING the inline style rather than setting it back to a
       guess, so the stylesheet's own value takes over again. */
    const prevBodyBg = document.body.style.backgroundColor;
    const prevRootBg = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = '#f6f6f4';
    document.documentElement.style.backgroundColor = '#f6f6f4';

    return () => {
      document.removeEventListener('visibilitychange', reassertTitle);
      document.title = previousTitle;
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
   Reads page scroll directly and drives one hairline's scaleX, spring-smoothed
   so it glides rather than stepping with each scroll event.

   This is scroll-LINKED, and it is the only thing on the page that is: it has
   no start, no end and no duration of its own, and it runs backwards when you
   scroll up. That is what makes it a position readout rather than an animation
   — the distinction every other moving thing on this page is on the other side
   of. On a document this long it is also genuinely useful.

   scaleX on a 2px element is compositor-only: no layout, no paint. */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.3 });
  return <motion.div className="mdf-progress" style={{ scaleX }} aria-hidden="true" />;
}

export default function MedFlowPage() {
  const lenis = useLenis();
  useCaseStudyMetadata();

  /* Lenis persists scroll position across route changes, so arriving here from
     another route can land mid-page. Immediate, not animated — this is arrival,
     not navigation. Skipped when the URL carries a hash, because that is a
     deliberate request for a specific section. */
  useEffect(() => {
    if (window.location.hash) return;
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo({ top: 0, behavior: 'instant' });
  }, [lenis]);

  /* Development-only integrity check. The section index, the scroll spy and the
     capability links all address sections by id; a typo in either list would
     produce a dead link that nothing else would surface. Cheap to assert, and
     it strips from the production bundle with the rest of the DEV branch. */
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const missing = SECTIONS.filter((s) => !document.getElementById(s.id)).map((s) => s.id);
    if (missing.length) {
      console.warn('[medflow] SECTIONS ids with no matching element:', missing);
    }
  }, []);

  return (
    /* .mdf is the isolation root. Every rule in medflow.css is scoped beneath
       it, so none of this page's styling can reach another route. */
    <div className="mdf relative w-full min-h-screen overflow-x-hidden">
      {/* Skip link — first in the tab order, visible only when focused. */}
      <a
        href="#why"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[70] focus:top-4 focus:left-4 focus:px-5 focus:py-3 focus:font-['Outfit'] focus:text-[11px] focus:font-semibold focus:tracking-[0.18em] focus:uppercase"
        style={{ background: 'var(--mf-ink)', color: 'var(--mf-bg)' }}
      >
        Skip to the case study
      </a>

      <ScrollProgress />
      <CaseStudyHeader />
      <SectionIndex />

      {/* Clears the fixed header. */}
      <main className="pt-[58px]">
        <Hero />
        <WhyThisStudy />
        <Scenario />
        <HumanFactors />
        <UserNeeds />
        <WorkflowAnalysis />
        <RiskAnalysis />
        <Wireframes />
        <FinalInterface />
        <Prototype />
        <DesignSystem />
        <Accessibility />
        <ProposedStudy />
        <IterationExample />
        <CrossFunctional />
        <Traceability />
        <Frameworks />
        <WhatILearned />
        <Capabilities />
        <Closing />
      </main>

      <CaseStudyFooter />
    </div>
  );
}
