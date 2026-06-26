import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Motion values for exact position
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Quick spring for a snappy but smooth brutalist feel
  const springConfig = { damping: 25, stiffness: 400, mass: 0.15 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Detect mouse support
    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
      return;
    }

    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      const isInteractable = target.closest('a, button, [role="button"], input, select, textarea, .cursor-pointer');
      setIsHovered(!!isInteractable);
    };

    const handleMouseOut = () => {
       setIsHovered(false);
    };

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [cursorX, cursorY, isVisible]);

  if (typeof window !== "undefined" && window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
    return null;
  }

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[99999999] mix-blend-difference"
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
        }}
        transition={{ 
          type: "spring", 
          damping: 20, 
          stiffness: 300, 
          mass: 0.5 
        }}
        className="bg-white rounded-full flex items-center justify-center"
      />
    </motion.div>
  );
}
