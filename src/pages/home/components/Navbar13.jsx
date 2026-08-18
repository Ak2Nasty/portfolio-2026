import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Home, User, GraduationCap, Briefcase, Folder, Cpu, Send } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLenis } from "lenis/react";
import { useIntroReady } from "../../../components/Loader";

/* The navbar remounts on every route change, so the route the visitor came
   from has to live outside the component to survive it. */
let previousPath = null;

const getGreeting = (pathname, fromArchive) => {
  if (pathname === "/work-sample") return "Welcome to the archive. 🏛️";
  // Coming back off the work samples, the time of day is the least interesting
  // thing to say — they've just been through the whole archive.
  if (fromArchive) return "See anything you liked? 👀";

  const date = new Date();
  const month = date.getMonth(); // 0-indexed (0 = Jan)
  const day = date.getDate();

  if (month === 11 && day === 25) return "Merry Christmas 🎄";
  if (month === 11 && day === 31) return "Happy New Year's Eve 🥂";
  if (month === 0 && day === 1) return "Happy New Year 🎆";
  if (month === 9 && day === 31) return "Happy Halloween 🎃";
  if (month === 1 && day === 14) return "Happy Valentine's Day 💌";

  const hour = date.getHours();
  if (hour >= 5  && hour < 12) return "Good morning. 🌅";
  if (hour >= 12 && hour < 17) return "Good afternoon. ☀️";
  if (hour >= 17 && hour <= 23) return "Good evening. 🌆";
  return "Burning the midnight oil? 🌙";
};

/* The visitor's own wall clock, ticking alongside the greeting.
   No timeZone is passed, so Intl uses the device's zone and locale — the same
   source getGreeting() reads for "good evening", so the words and the clock can
   never disagree, and it costs no network request. */
function LocalClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // re-aimed at each second boundary, otherwise a fixed 1000ms interval
    // slowly drifts and the display visibly skips a second
    let timer;
    const tick = () => {
      setNow(new Date());
      timer = setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    timer = setTimeout(tick, 1000 - (Date.now() % 1000));
    return () => clearTimeout(timer);
  }, []);

  const formatter = React.useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    []
  );

  return (
    // tabular figures, so the pill doesn't twitch as the digits change
    <span className="tabular-nums shrink-0">{formatter.format(now)}</span>
  );
}

export function Navbar13() {
  const introReady = useIntroReady();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [showGreeting, setShowGreeting] = useState(true);
  const [isHoveringNav, setIsHoveringNav] = useState(false);
  const timerExpired = React.useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const lenis = useLenis();

  // Resolved once at mount, before the effect below overwrites previousPath.
  // The clock only pairs with the home greeting — it has nothing to say next to
  // the archive lines.
  const [greeting] = useState(() => {
    const fromArchive = previousPath === "/work-sample";
    const isArrival = location.pathname === "/" && !fromArchive;
    return {
      text: getGreeting(location.pathname, fromArchive),
      withClock: isArrival,
      // The time-of-day line is the one people actually arrive on, and it carries
      // the clock, so it holds longer. The archive and return lines are quick
      // acknowledgements from someone already moving through the site.
      holdMs: isArrival ? 4500 : 4000,
    };
  });

  useEffect(() => {
    previousPath = location.pathname;
  }, [location.pathname]);

  // Counted from when the navbar is actually on screen. Started at mount it ran
  // out behind the loader, leaving barely a second of it readable.
  useEffect(() => {
    if (!introReady) return;
    const timer = setTimeout(() => {
      timerExpired.current = true;
      setShowGreeting(false);
    }, greeting.holdMs);
    return () => clearTimeout(timer);
  }, [introReady, greeting.holdMs]);

  const navItems = [
    { label: "HOME", id: "home", icon: Home },
    { label: "ABOUT", id: "about", icon: User },
    { label: "EDUCATION", id: "education", icon: GraduationCap },
    { label: "EXPERIENCE", id: "experience", icon: Briefcase },
    { label: "WORK", id: "work-samples", href: "/work-sample", icon: Folder },
    { label: "SKILLS", id: "skills", icon: Cpu },
    { label: "CONTACT", id: "contact", icon: Send }
  ];

  const handleClick = (e, item) => {
    e.preventDefault();
    if (item.href) {
      navigate(item.href);
      return;
    }
    if (location.pathname !== "/") {
      navigate(`/#${item.id}`);
      return;
    }
    const element = document.getElementById(item.id);
    if (element) {
      // Route through Lenis so programmatic scrolls don't fight the smooth-scroll engine
      if (lenis) {
        lenis.scrollTo(element, { duration: 1.2 });
      } else {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      // waits for the loader, otherwise it drops in behind it and is simply there
      animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="absolute top-0 left-0 right-0 z-[999] w-full px-4 md:px-6 lg:px-12 pt-6 lg:pt-8 flex justify-center"
    >
      <div 
        className={`w-full max-w-[80rem] flex items-center justify-between backdrop-blur-md rounded-[2rem] px-3 md:px-6 lg:px-8 py-2 lg:py-3.5 overflow-hidden transition-all duration-1000 ease-out ${
          showGreeting 
            ? "bg-white/95 border border-white/50 shadow-[0_0_40px_rgba(255,255,255,0.15)]" 
            : "bg-[#121211]/40 border border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
        }`}
        onMouseEnter={() => { if (!timerExpired.current) { setIsHoveringNav(true); setShowGreeting(false); } }}
        onMouseLeave={() => { if (!timerExpired.current) { setIsHoveringNav(false); setShowGreeting(true); } }}
      >
        
        {/* LOGO */}
        <div 
          onClick={(e) => handleClick(e, { id: 'home' })}
          className={`font-monument text-[11px] lg:text-[13px] tracking-[0.15em] lg:tracking-[0.2em] font-black uppercase cursor-pointer select-none shrink-0 transition-colors duration-1000 ${
            showGreeting ? "text-[#050505]" : "text-[#f4f4f4]"
          }`}
        >
          AKSHATH<span className={`transition-colors duration-1000 ${showGreeting ? "text-[#555]" : "text-[#a3a3a3]"}`}>.</span>
        </div>

        {/* RIGHT: greeting crossfades to nav links */}
        <div className="relative flex-1 flex items-center justify-end h-8 min-w-0 px-2">
          <AnimatePresence mode="wait">
            {showGreeting ? (
              <motion.p
                key="greeting"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full font-['Outfit'] font-bold text-[8.5px] sm:text-[10px] md:text-[11px] tracking-[0.15em] sm:tracking-[0.2em] text-[#050505] uppercase whitespace-nowrap overflow-hidden text-center flex items-center justify-center gap-2 sm:gap-3"
              >
                <span className="truncate">{greeting.text}</span>
                {greeting.withClock && (
                  <>
                    <span aria-hidden="true" className="opacity-25 shrink-0">|</span>
                    <LocalClock />
                  </>
                )}
              </motion.p>
            ) : (
              <motion.ul
                key="navlinks"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-nowrap items-center justify-end gap-0 sm:gap-1 lg:gap-2"
              >
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <li 
                      key={item.label} 
                      className="relative group" 
                      onMouseEnter={() => setHoveredIndex(index)} 
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      <a 
                        href={`#${item.id}`} 
                        onClick={(e) => handleClick(e, item)}
                        className="relative z-10 px-1.5 sm:px-2 py-1.5 md:px-2.5 lg:px-4 lg:py-2 inline-flex items-center justify-center gap-1.5 font-['Outfit'] text-[9px] md:text-[9.5px] lg:text-[10px] tracking-[0.1em] lg:tracking-[0.15em] font-medium text-gray-400 hover:text-white transition-colors duration-300 uppercase whitespace-nowrap"
                      >
                        <span className="max-md:hidden">{item.label}</span>
                        {Icon && <Icon className="w-4 h-4 md:hidden" strokeWidth={1.5} />}
                      </a>
                      <AnimatePresence>
                        {hoveredIndex === index && (
                          <motion.div
                            layoutId="navHover"
                            className="absolute inset-0 bg-white/[0.05] border border-white/[0.08] rounded-full z-0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.nav>
  );
}
