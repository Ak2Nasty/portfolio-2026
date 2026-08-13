import React, { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/•—";

// Mobile: label glitch-decodes once when it scrolls into view. Desktop: static text.
export function ScrambleLabel({ text, className }) {
  const ref = useRef(null);
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });
  const [display, setDisplay] = useState(text);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!isMobile || reduced || !inView || startedRef.current) return;
    startedRef.current = true;

    let progress = 0;
    let timer;
    const total = text.length + 6;

    const step = () => {
      progress++;
      const resolved = Math.floor((progress / total) * text.length);
      let out = "";
      for (let i = 0; i < text.length; i++) {
        out += i < resolved || text[i] === " "
          ? text[i]
          : CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      setDisplay(out);
      if (progress < total) timer = setTimeout(step, 52);
    };

    step();
    return () => clearTimeout(timer);
  }, [inView, isMobile, reduced, text]);

  return <span ref={ref} className={className}>{display}</span>;
}
