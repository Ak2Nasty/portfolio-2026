import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function BackgroundTexture() {
  const { scrollY } = useScroll();
  // Move the background slightly slower than the scroll to create parallax
  const y = useTransform(scrollY, [0, 4000], [0, -400]);

  return (
    <motion.div 
      className="fixed inset-[-20%] z-[-10] pointer-events-none opacity-[0.12] mix-blend-screen"
      style={{
        y,
        backgroundImage: `url('/bg-texture.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'grayscale(1) contrast(1.5) brightness(0.8)'
      }}
    />
  );
}
