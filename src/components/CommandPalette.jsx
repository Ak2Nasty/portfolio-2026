import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useLenis } from "lenis/react";
import { WORK_SECTIONS } from "../pages/work-sample/components/Portfolio23";

/* Keyboard-first navigation, in the voice the loader and the meta card already
   speak. Desktop only: it is opened by a key, so a device without one would
   only ever see dead weight. */

const EMAIL = "akshath4000@gmail.com";
/* One file, one name. These used to disagree: the href served the V2 file
   while the download attribute renamed it to the NON-V2 filename on the way
   out, so anyone who downloaded the resume got the current document saved
   under the name of the previous one. */
const RESUME_FILE = "/Akshathdayan-Suresh-Resume.pdf";
const RESUME_NAME = "Akshathdayan-Suresh-Resume.pdf";

// Numbers match the section labels already on screen (ABOUT / 01, CONTACT / 05)
const SECTIONS = [
  { num: "00", label: "Home", section: "home" },
  { num: "01", label: "About", section: "about", keywords: "bio profile" },
  { num: "02", label: "Education", section: "education", keywords: "ubc degree" },
  { num: "03", label: "Experience", section: "experience", keywords: "career work history" },
  { num: "04", label: "Skills", section: "skills", keywords: "tools stack" },
  { num: "05", label: "Contact", section: "contact", keywords: "email hire reach" },
];

// Reads off the archive itself, so a new section appears here without edits
const ARCHIVE = [
  { label: "Work Samples", route: "/work-sample", keywords: "portfolio archive all" },
  ...WORK_SECTIONS.filter((s) => s.id !== "portfolio-meta").map((s) => ({
    label: s.company,
    route: "/work-sample",
    hash: s.id,
    meta: `${String(s.files.length).padStart(2, "0")} files`,
    keywords: s.role,
  })),
];

const COMMANDS = [
  ...SECTIONS.map((s) => ({ ...s, group: "Navigate" })),
  ...ARCHIVE.map((a) => ({ ...a, group: "Archive", num: "→" })),
  { group: "Actions", num: "↵", label: "Copy Email", action: "copy", hint: "C", keywords: "mail contact" },
  { group: "Actions", num: "↵", label: "Download Resume", action: "resume", hint: "R", keywords: "cv pdf" },
  // Left out of the default list so the footer sprite keeps its discovery;
  // still reachable by typing for anyone who goes looking.
  { group: "Actions", num: "↵", label: "Play Snake", action: "snake", keywords: "game easter egg", hidden: true },
];

const isTypingTarget = (el) =>
  !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);

function Highlight({ text, query }) {
  if (!query) return text;
  const i = text.toLowerCase().indexOf(query);
  if (i === -1) return text;
  return (
    <>
      {text.slice(0, i)}
      <span className="text-[#4ade80]">{text.slice(i, i + query.length)}</span>
      {text.slice(i + query.length)}
    </>
  );
}

export function CommandPalette() {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [flash, setFlash] = useState(null);

  const inputRef = useRef(null);
  const listRef = useRef(null);
  const overlayRef = useRef(null);
  const restoreFocusTo = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const lenis = useLenis();

  // A palette you can only summon with a key has nothing to offer a touch device
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setEnabled(mq.matches);
    const onChange = (e) => setEnabled(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COMMANDS.filter((c) => {
      if (!q) return !c.hidden;
      return `${c.label} ${c.keywords || ""} ${c.group}`.toLowerCase().includes(q);
    });
  }, [query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
    setFlash(null);
  }, []);

  const run = useCallback(
    (cmd) => {
      if (!cmd) return;

      if (cmd.action === "copy") {
        navigator.clipboard?.writeText(EMAIL);
        setFlash("Email copied");
        setTimeout(close, 900);
        return;
      }
      if (cmd.action === "resume") {
        const a = document.createElement("a");
        a.href = RESUME_FILE;
        a.download = RESUME_NAME;
        a.click();
        close();
        return;
      }
      if (cmd.action === "snake") {
        close();
        window.dispatchEvent(new CustomEvent("open-snake-game"));
        return;
      }
      if (cmd.route) {
        navigate(cmd.hash ? `${cmd.route}#${cmd.hash}` : cmd.route);
        close();
        return;
      }
      if (cmd.section) {
        close();
        // Same path the navbar takes, so scrolling behaves identically
        if (location.pathname !== "/") {
          navigate(`/#${cmd.section}`);
          return;
        }
        // Lenis is paused while the overlay is up. Scrolling a stopped instance
        // silently does nothing, so restart it and wait a frame for the close.
        requestAnimationFrame(() => {
          const el = document.getElementById(cmd.section);
          if (!el) return;
          if (lenis) {
            lenis.start();
            lenis.scrollTo(el, { duration: 1.2 });
          } else {
            el.scrollIntoView({ behavior: "smooth" });
          }
        });
      }
    },
    [close, lenis, location.pathname, navigate]
  );

  // Global triggers
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (k === "escape" && open) {
        e.preventDefault();
        close();
        return;
      }
      // "/" is a plain character, so it must never steal a keystroke from a form
      if (e.key === "/" && !open && !isTypingTarget(e.target)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, open, close]);

  // Freeze the page behind the overlay, and hand focus back where it came from
  useEffect(() => {
    if (!open) return;
    restoreFocusTo.current = document.activeElement;
    lenis?.stop();
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      clearTimeout(t);
      lenis?.start();
      const el = restoreFocusTo.current;
      if (el && typeof el.focus === "function") el.focus();
    };
  }, [open, lenis]);

  // lenis.stop() alone still lets the page scroll behind the overlay, so the
  // document is locked outright. Safe to hide overflow because html reserves a
  // stable scrollbar gutter (index.css) — without that, losing the scrollbar
  // shunts every fixed and absolute element 12px sideways as this opens.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => setActive(0), [query]);

  // Keep the highlighted row in view when arrowing past the fold
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`[data-idx="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const onInputKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(results[active]);
    }
  };

  if (!enabled) return null;

  const q = query.trim().toLowerCase();
  let lastGroup = null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="palette"
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onMouseDown={(e) => e.target === e.currentTarget && close()}
          className="fixed inset-0 z-[99998] flex items-start justify-center pt-[12vh] px-6 bg-[#0C0C0B]/80 backdrop-blur-[6px]"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[560px] bg-[#121211]/70 backdrop-blur-2xl border border-[#242424] rounded-2xl overflow-hidden shadow-[0_34px_100px_rgba(0,0,0,0.75)]"
          >
            {/* Prompt */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.07]">
              <span className="font-['Outfit'] text-[13px] font-extrabold text-[#4ade80] leading-none">&gt;</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKey}
                placeholder={flash || "Type a command"}
                aria-label="Search commands"
                className={`flex-1 bg-transparent outline-none border-none font-['Outfit'] text-[12px] font-bold tracking-[0.2em] uppercase ${
                  flash ? "placeholder:text-[#4ade80]" : "placeholder:text-[#4f4f4f]"
                } text-[#f4f4f4]`}
              />
              <span className="font-['Outfit'] text-[9px] font-semibold tracking-[0.14em] text-[#7a7a7a] border border-[#2b2b2b] rounded px-1.5 py-1 leading-none">
                ESC
              </span>
            </div>

            {/* Results */}
            {/* data-lenis-prevent, or Lenis swallows the wheel globally and this
                list can never be scrolled — same as the gallery and file viewer */}
            <div
              ref={listRef}
              data-lenis-prevent="true"
              className="max-h-[46vh] overflow-y-auto overscroll-contain py-1"
            >
              {results.length === 0 && (
                <div className="font-['Outfit'] text-[11px] tracking-[0.2em] uppercase text-[#5f5f5f] px-5 py-6 text-center">
                  No matches
                </div>
              )}

              {results.map((cmd, i) => {
                const header = cmd.group !== lastGroup ? cmd.group : null;
                lastGroup = cmd.group;
                const selected = i === active;
                return (
                  <React.Fragment key={`${cmd.group}-${cmd.label}`}>
                    {header && (
                      <div className="font-['Outfit'] text-[8px] font-bold tracking-[0.28em] text-[#5f5f5f] uppercase px-5 pt-3 pb-1.5">
                        {header}
                      </div>
                    )}
                    <button
                      type="button"
                      data-idx={i}
                      onMouseMove={() => setActive(i)}
                      onClick={() => run(cmd)}
                      className={`relative w-full flex items-center gap-4 px-5 py-2.5 text-left transition-colors ${
                        selected ? "bg-white/[0.055]" : "bg-transparent"
                      }`}
                    >
                      {selected && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-[#4ade80] rounded-r-sm" />
                      )}
                      <span
                        className={`font-['Outfit'] text-[9px] font-bold tracking-[0.12em] w-4 shrink-0 ${
                          selected ? "text-[#4ade80]" : "text-[#5f5f5f]"
                        }`}
                      >
                        {cmd.num}
                      </span>
                      <span
                        className={`font-['Outfit'] text-[11px] font-bold tracking-[0.19em] uppercase truncate ${
                          selected ? "text-white" : "text-[#d4d4d4]"
                        }`}
                      >
                        <Highlight text={cmd.label} query={q} />
                      </span>
                      {cmd.meta && (
                        <span className="font-['Outfit'] text-[9px] tracking-[0.16em] uppercase text-[#6a6a6a] shrink-0">
                          {cmd.meta}
                        </span>
                      )}
                      {cmd.hint && (
                        <span className="ml-auto font-['Outfit'] text-[8px] font-semibold tracking-[0.14em] text-[#7a7a7a] border border-[#2b2b2b] rounded px-1.5 py-0.5 leading-none shrink-0">
                          {cmd.hint}
                        </span>
                      )}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Hint bar */}
            <div className="flex gap-4 px-5 py-2.5 border-t border-white/[0.07] font-['Outfit'] text-[8px] font-semibold tracking-[0.18em] text-[#5f5f5f] uppercase">
              <span>&uarr;&darr; Navigate</span>
              <span>&crarr; Open</span>
              <span>ESC Close</span>
              <span className="ml-auto text-[#3f3f3f]">127.0.0.1</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
