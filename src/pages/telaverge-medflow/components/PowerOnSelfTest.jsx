import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLenis } from 'lenis/react';
import { STUDY } from '../data/caseStudyData';

/* ─── Power-on self-test ─────────────────────────────────────────────────────
   The page's entrance. Same shape as the portfolio's own welcome panel — a
   wordmark, a bar that fills, a line of text that steps — but the text is the
   sequence an infusion pump runs when it is switched on, so the two and a bit
   seconds before the study starts are already saying what kind of document this
   is.

   ── Why the copy is a self-test and not a loading message ──
   "Loading assets" would be honest about what the browser is doing and tell the
   reader nothing. A pump's power-on self-test is a real, recognisable thing: it
   checks the mechanism, the occlusion sensor, the air-in-line detector and the
   drug library before it will accept a rate, and a reader who works in this
   field will recognise the list. It sets the register of the page in the only
   two seconds where nothing else is competing for attention.

   THE LAST LINE IS THE DISCLAIMER, and it is not decoration. A convincing
   device boot sequence is exactly the moment where a reader could form the
   impression that this is a real product, so the panel says it is not while the
   impression is being formed rather than eleven sections later.

   ── What it does NOT do ──
   It does not gate content behind a fake delay for its own sake: the page is
   already rendered underneath, the panel is a cover, and it lifts on a timer
   rather than waiting on anything. Anyone who prefers less motion never sees it
   at all — the check is made before the first paint, so there is no flash of a
   panel that then disappears. */

const SELF_TEST = [
  'PUMP MECHANISM',
  'OCCLUSION SENSOR',
  'AIR-IN-LINE DETECTOR',
  'DRUG LIBRARY',
  'SELF-TEST COMPLETE',
];

const STEP_MS = 380;
const HOLD_MS = SELF_TEST.length * STEP_MS + 120; // 2020ms

/* Read once, synchronously, so the panel is never mounted for a reader who has
   asked for reduced motion. Guarded for SSR and for the older Safari signature
   of matchMedia. */
function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function PowerOnSelfTest() {
  const lenis = useLenis();
  const [running, setRunning] = useState(() => !prefersReducedMotion());
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!running) return undefined;

    /* Both locks, because the page has two scrollers. Lenis drives the smooth
       scroll and ignores body overflow; body overflow catches the browser's own
       scrolling if Lenis has not mounted yet. */
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    lenis?.stop();

    const tick = setInterval(() => {
      setStep((s) => (s < SELF_TEST.length - 1 ? s + 1 : s));
    }, STEP_MS);
    const done = setTimeout(() => setRunning(false), HOLD_MS);

    return () => {
      clearInterval(tick);
      clearTimeout(done);
      /* Restored here rather than in the exit handler: if the route unmounts
         mid-animation the page must not be left unscrollable. */
      document.body.style.overflow = previousOverflow;
      lenis?.start();
    };
  }, [running, lenis]);

  return (
    <AnimatePresence>
      {running && (
        <motion.div
          key="mf-post"
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center px-8"
          style={{ background: 'var(--mf-bg)' }}
          initial={{ y: 0 }}
          exit={{ y: '-100%', transition: { duration: 0.62, ease: [0.16, 1, 0.3, 1] } }}
          role="status"
          aria-live="polite"
          aria-label="Starting the MedFlow case study"
        >
          <motion.div
            className="w-full flex flex-col items-center"
            style={{ maxWidth: 360 }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* The registration mark that opens every section head, so the
                first thing on screen is already the page's own motif. */}
            <span aria-hidden="true" className="mf-mark mb-6" />

            <span
              className="mf-wordmark text-[30px] md:text-[38px] leading-none"
              style={{ color: 'var(--mf-ink)' }}
            >
              <span className="sr-only">{STUDY.name}</span>
              <span aria-hidden="true">{STUDY.name.toUpperCase()}</span>
            </span>

            {/* The bar. Width, not scaleX: it is 3px tall and 360px wide, so a
                scaled transform would blur its end cap for the whole fill. */}
            <span
              className="block w-full mt-7 rounded-full overflow-hidden"
              style={{ height: 3, background: 'var(--mf-line)' }}
              aria-hidden="true"
            >
              <motion.span
                className="block h-full rounded-full"
                style={{ background: 'var(--mf-accent)' }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: HOLD_MS / 1000, ease: [0.4, 0, 0.2, 1] }}
              />
            </span>

            {/* Fixed height, so the panel does not twitch as the lines change
                length under the bar. */}
            <span
              className="flex items-center justify-center gap-2.5 mt-5 w-full"
              style={{ height: 16 }}
            >
              <span
                aria-hidden="true"
                className="shrink-0 rounded-full"
                style={{ width: 5, height: 5, background: 'var(--mf-accent)' }}
              />
              <AnimatePresence mode="wait">
                <motion.span
                  key={SELF_TEST[step]}
                  className="font-['Outfit'] text-[9.5px] md:text-[10px] font-semibold uppercase"
                  style={{ letterSpacing: '0.24em', color: 'var(--mf-muted)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.16 }}
                >
                  {SELF_TEST[step]}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.div>

          {/* Anchored to the bottom rather than added to the centred column, so
              its height cannot push the wordmark off the true centre. */}
          <motion.span
            className="absolute left-1/2 -translate-x-1/2 font-['Outfit'] text-[9px] font-semibold uppercase text-center px-8"
            style={{ bottom: 40, letterSpacing: '0.2em', color: 'var(--mf-off)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Conceptual study &middot; not a medical device
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
