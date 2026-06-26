import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isOnScrollbar, setIsOnScrollbar] = useState(false);

  // Motion values for exact position
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Quick spring for a snappy but smooth feel
  const springConfig = { damping: 25, stiffness: 400, mass: 0.15 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Detect mouse support — bail out on touch/coarse pointer devices
    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
      return;
    }

    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      // Hide custom cursor when hovering over the native scrollbar area
      // The scrollbar lives in the gap between clientX and innerWidth
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const isNearScrollbar = e.clientX > window.innerWidth - Math.max(scrollbarWidth + 4, 20);
      setIsOnScrollbar(isNearScrollbar);
    };

    const handleMouseOver = (e) => {
      const target = e.target;

      // Don't expand for nav/header elements — keep the cursor minimal there
      const isInNav = target.closest("nav, header, [data-no-cursor-expand]");
      if (isInNav) {
        setIsHovered(false);
        return;
      }

      const isInteractable = target.closest(
        'a, button, [role="button"], input, select, textarea, .cursor-pointer'
      );
      setIsHovered(!!isInteractable);
    };

    const handleMouseOut = () => {
      setIsHovered(false);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      setIsOnScrollbar(false);
    };

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [cursorX, cursorY, isVisible]);

  // SSR guard
  if (typeof window !== "undefined" && window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
    return null;
  }

  // Fully hide when on the scrollbar so the native scrollbar remains usable
  if (isOnScrollbar) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[99999999]"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        translateX: "-50%",
        translateY: "-50%",
        opacity: isVisible ? 1 : 0,
      }}
    >
      <motion.div
        animate={{
          width: isHovered ? 80 : 20,
          height: isHovered ? 80 : 20,
          backgroundColor: isHovered ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,1)",
          border: isHovered ? "1.5px solid rgba(255,255,255,0.8)" : "1.5px solid transparent",
        }}
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 300,
          mass: 0.5,
        }}
        style={{ borderRadius: "50%" }}
      />
    </motion.div>
  );
}
