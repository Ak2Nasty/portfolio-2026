import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { ThemeLock } from "./ThemeLock";

/* The loader covers the page for its first few seconds, so anything underneath
   that animates on mount plays out unseen. Entrance animations wait for this
   signal instead. It stays set afterwards, so returning to a page by route
   change animates straight away rather than waiting for a loader that's done. */
const INTRO_EVENT = "intro-ready";
let introReady = false;

function markIntroReady() {
  if (introReady) return;
  introReady = true;
  window.dispatchEvent(new CustomEvent(INTRO_EVENT));
}

/* Runs the intro again without a page load — the "My Newest Project" card uses
   it to hand its own boot sequence straight to WELCOME. Clearing the flag first
   matters: the next page mounts behind the loader, and it has to read "not
   ready" at mount or its entrance plays out unseen underneath. Components that
   are already mounted keep their state, which is why the caller replays BEFORE
   it navigates. */
const REPLAY_EVENT = "intro-replay";

export function replayIntro() {
  introReady = false;
  window.dispatchEvent(new CustomEvent(REPLAY_EVENT));
}

const LOADING_TEXTS = [
  "INITIALIZING KERNEL...",
  "LOADING ASSETS...",
  "DECRYPTING DATA...",
  "COMPILING BUNDLE...",
  "ESTABLISHING CONNECTION...",
  "ACCESS GRANTED."
];

export function useIntroReady() {
  const [ready, setReady] = useState(introReady);

  useEffect(() => {
    if (ready) return;
    const onReady = () => setReady(true);
    window.addEventListener(INTRO_EVENT, onReady);
    return () => window.removeEventListener(INTRO_EVENT, onReady);
  }, [ready]);

  return ready;
}

export function Loader() {
  const location = useLocation();
  const validRoutes = ["/", "/work-sample"];
  const is404 = !validRoutes.includes(location.pathname);
  const [isLoading, setIsLoading] = useState(!is404);
  const [loadingText, setLoadingText] = useState(LOADING_TEXTS[0]);
  // Bumped by replayIntro(); re-running the effect below restarts the intro.
  const [run, setRun] = useState(0);

  useEffect(() => {
    const onReplay = () => {
      setLoadingText(LOADING_TEXTS[0]);
      setIsLoading(true);
      setRun((n) => n + 1);
    };
    window.addEventListener(REPLAY_EVENT, onReplay);
    return () => window.removeEventListener(REPLAY_EVENT, onReplay);
  }, []);

  useEffect(() => {
    // 404 shows no loader, so nothing is ever covered up. A replay always
    // shows it: it is asked for, and it is heading to the homepage.
    if (is404 && run === 0) {
      markIntroReady();
      return;
    }

    // Prevent scrolling while loading
    document.body.style.overflow = "hidden";
    
    // Hide the loader after 2 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = "auto";
      // Released as the panel starts lifting, not after it has gone: the page
      // animates in behind it, so there's no dead black beat in between.
      markIntroReady();
    }, 2000);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < LOADING_TEXTS.length) {
        setLoadingText(LOADING_TEXTS[step]);
      } else {
        clearInterval(interval);
      }
    }, 300); // 6 texts * 300ms = 1800ms (fits inside the 2000ms loader)

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      document.body.style.overflow = "auto";
    };
    // `is404` is read only for the first run; after a replay, a later route
    // change must not restart the intro, so it does not re-trigger by itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return (
    <AnimatePresence onExitComplete={markIntroReady}>
      {isLoading && (
        <motion.div
          key="loader"
          initial={{ y: 0 }}
          exit={{
            y: "-100vh",
            // no hold before lifting, and a shorter lift, so the hero's own
            // entrance is still visibly in progress when the panel clears
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
          }}
          className="fixed inset-0 z-[999999] bg-[#0C0C0B] flex items-center justify-center pointer-events-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-4"
          >
            <h1 className="font-monument text-[28px] sm:text-[36px] md:text-[50px] font-bold text-[#f4f4f4] tracking-[0.2em] uppercase">
              WELCOME
            </h1>
            <motion.div
              initial={{ 
                borderColor: "rgba(255, 255, 255, 0.05)",
                boxShadow: "0 0 0px rgba(255, 255, 255, 0)"
              }}
              animate={{ 
                borderColor: "rgba(255, 255, 255, 0.8)",
                boxShadow: "0 0 20px rgba(255, 255, 255, 0.2)"
              }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="w-full h-1.5 md:h-2 bg-white/[0.05] rounded-full mt-2 relative border overflow-hidden"
            >
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute top-0 left-0 h-full bg-white rounded-full"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-2 text-center"
            >
              <span className="font-['Outfit'] text-[8px] md:text-[9px] tracking-[0.25em] text-[#888] uppercase">
                {loadingText}
              </span>
            </motion.div>
          </motion.div>

          {/* Anchored to the bottom rather than added to the centred column:
              in the column its height shifted WELCOME and the bar off the true
              centre of the page. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="absolute bottom-12 md:bottom-16 left-1/2 -translate-x-1/2"
          >
            <ThemeLock />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
