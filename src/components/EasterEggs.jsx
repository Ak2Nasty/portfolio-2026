import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { SnakeGame } from "./SnakeGame";

// ─────────────────────────────────────────────
// Right-Click Custom Context Menu
// ─────────────────────────────────────────────
function ContextMenu({ onPlayGame, gameOpen }) {
  const [menu, setMenu] = useState(null); // { x, y }
  const lastTapTime = useRef(0);
  const tapCount = useRef(0);
  const lastOpenTime = useRef(0);

  useEffect(() => {
    if (gameOpen) return;
    // Desktop: right-click
    const handleContextMenu = (e) => {
      e.preventDefault();
      setMenu({ x: e.clientX, y: e.clientY });
    };

    // Mobile: triple-tap detection (tap 3 times within 320ms intervals)
    const handleTouchStart = (e) => {
      const now = Date.now();
      const delay = now - lastTapTime.current;
      
      if (delay < 320) {
        tapCount.current += 1;
      } else {
        tapCount.current = 1;
      }
      
      lastTapTime.current = now;
      
      if (tapCount.current === 3) {
        const touch = e.touches[0];
        setMenu({ x: touch.clientX, y: touch.clientY });
        lastOpenTime.current = Date.now();
        tapCount.current = 0;
      }
    };

    const handleClick = () => {
      // Ignore click dismisses that follow immediately after a touchstart open
      if (Date.now() - lastOpenTime.current < 350) return;
      setMenu(null);
    };
    
    const handleScroll = () => setMenu(null);

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("click", handleClick);
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [gameOpen]);

  // Clamp to viewport edges
  const getPos = () => {
    if (!menu) return {};
    const menuW = 240;
    const menuH = 110;
    const x = menu.x + menuW > window.innerWidth  ? menu.x - menuW : menu.x;
    const y = menu.y + menuH > window.innerHeight ? menu.y - menuH : menu.y;
    return { left: x, top: y };
  };

  return (
    <AnimatePresence>
      {menu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: -6 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{ position: "fixed", zIndex: 99999, ...getPos() }}
          className="bg-[#141414] border border-white/10 rounded-xl shadow-2xl px-5 py-4 min-w-[220px] select-none"
        >
          <p className="font-['Outfit'] text-[12px] text-[#888] mb-1 tracking-wide">
            Nice try.
          </p>
          <p className="font-['Outfit'] font-semibold text-[13px] text-white tracking-wide">
            But seriously — hire me.
          </p>

          {/* Email */}
          <div className="mt-3 pt-3 border-t border-white/10">
            <a
              href="mailto:akshath4000@gmail.com"
              onClick={(e) => e.stopPropagation()}
              className="font-['Outfit'] text-[11px] text-[#a3a3a3] hover:text-white transition-colors tracking-wider"
            >
              → akshath4000@gmail.com
            </a>
          </div>

          {/* Game trigger */}
          <div className="mt-2.5 pt-2.5 border-t border-white/10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenu(null);
                onPlayGame();
              }}
              className="font-['Outfit'] text-[11px] text-[#a3a3a3] hover:text-[#16a34a] transition-colors tracking-wider flex items-center gap-1.5 w-full text-left"
            >
              <span>🐍</span>
              <span>wanna play a game?</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
// Idle Toast
// ─────────────────────────────────────────────
function IdleToast() {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const IDLE_MS = 30000; // 30 seconds

  const resetTimer = () => {
    setVisible(false);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(true), IDLE_MS);
  };

  useEffect(() => {
    resetTimer();
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("scroll", resetTimer, { passive: true });
    window.addEventListener("click", resetTimer);
    return () => {
      clearTimeout(timerRef.current);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-8 right-8 z-[9999] bg-[#141414] border border-white/10 rounded-2xl px-5 py-4 shadow-2xl max-w-[280px]"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">👀</span>
            <div>
              <p className="font-['Outfit'] font-semibold text-[13px] text-white mb-0.5">
                Still reading?
              </p>
              <p className="font-['Outfit'] text-[12px] text-[#a3a3a3] leading-relaxed">
                I appreciate that. Take your time.
              </p>
            </div>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="absolute top-3 right-3 text-[#555] hover:text-white transition-colors text-[16px] leading-none"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
// Tab Title Change
// ─────────────────────────────────────────────
const TEASER_TITLE = "Come back... 👀";

function TabTitleChange() {
  useEffect(() => {
    const originalTitle = document.title;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.title = TEASER_TITLE;
      } else {
        document.title = originalTitle;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Only undo OUR OWN change. This used to restore `originalTitle`
      // unconditionally, which meant unmounting on a route that sets its own
      // title (the unlisted case studies) reset the tab to the homepage's
      // title a beat after that route had correctly set its own.
      if (document.title === TEASER_TITLE) document.title = originalTitle;
    };
  }, []);

  return null;
}

// ─────────────────────────────────────────────
// Console Easter Egg (fires once on mount)
// ─────────────────────────────────────────────
function ConsoleEasterEgg() {
  useEffect(() => {
    const styles = {
      wave:    "font-size:20px; padding: 4px 0;",
      heading: "font-size:14px; font-weight:bold; color:#f4f4f4; background:#141414; padding:6px 12px; border-left: 3px solid #4ade80;",
      sub:     "font-size:12px; color:#a3a3a3; padding:4px 12px;",
      email:   "font-size:12px; color:#4ade80; padding:4px 12px; font-weight:bold;",
      divider: "color:#333; font-size:10px; padding: 0 12px;",
    };

    console.log("%c👋", styles.wave);
    console.log("%cHey — you found the console.", styles.heading);
    console.log("%cClearly you know what you're doing.", styles.sub);
    console.log("%c──────────────────────────────────", styles.divider);
    console.log("%c→ akshath4000@gmail.com", styles.email);
    console.log("%cLet's build something great.", styles.sub);
  }, []);

  return null;
}

// ─────────────────────────────────────────────
// Master Export
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// Routes the eggs stay off
//
// The unlisted application studies are documents sent to a named reader, not
// parts of the site. An idle toast reading "Still reading? I appreciate that"
// popping up over a medical-device safety case study — or a hijacked tab title,
// or a custom right-click menu offering a game — reads as a lapse in judgement
// to exactly the audience those pages exist for.
//
// This gates only the VISIBLE eggs. The console message is left on every route:
// it costs nothing, it is invisible unless you go looking, and anyone who opens
// devtools on a portfolio has opted in.
// ─────────────────────────────────────────────
const NO_EGG_ROUTES = ["/telaverge-medflow"];

export function EasterEggs() {
  const [gameOpen, setGameOpen] = useState(false);
  const location = useLocation();
  const quiet = NO_EGG_ROUTES.includes(location.pathname);

  // Lets the footer trigger open the game without prop drilling
  useEffect(() => {
    const open = () => setGameOpen(true);
    window.addEventListener("open-snake-game", open);
    return () => window.removeEventListener("open-snake-game", open);
  }, []);

  // A game left open when the reader navigates onto a quiet route unmounts with
  // the rest of the eggs, but `gameOpen` would stay true and spring it back the
  // moment they navigated off again.
  //
  // Adjusted during render rather than in an effect: this is React's documented
  // pattern for "reset some state when a prop changes", and it avoids the extra
  // render pass an effect would cost.
  const [lastQuiet, setLastQuiet] = useState(quiet);
  if (lastQuiet !== quiet) {
    setLastQuiet(quiet);
    if (quiet && gameOpen) setGameOpen(false);
  }

  return (
    <>
      <ConsoleEasterEgg />
      {!quiet && (
        <>
          <TabTitleChange />
          <IdleToast />
          <ContextMenu onPlayGame={() => setGameOpen(true)} gameOpen={gameOpen} />
          <SnakeGame isOpen={gameOpen} onClose={() => setGameOpen(false)} />
        </>
      )}
    </>
  );
}
