import React from "react";
import { motion } from "framer-motion";

export function Navbar13() {
  return (
    <motion.nav 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className="absolute top-0 left-0 right-0 z-[999] w-full px-6 md:px-12 lg:px-16 pt-8 md:pt-12"
    >
      <div className="max-w-[120rem] mx-auto flex justify-end items-center">
        <ul className="flex gap-6 md:gap-10 font-['Outfit'] text-[9px] md:text-[11px] tracking-[0.15em] text-gray-400 uppercase">
          {["ABOUT", "EXPERIENCE", "WORK SAMPLES", "CONTACT"].map((item, index) => (
            <li key={item}>
              <a 
                href={`#${item.toLowerCase().replace(" ", "-")}`} 
                className="inline-block hover:text-[#f4f4f4] hover:tracking-[0.2em] transition-all duration-300 hover:-translate-y-[1px]"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </motion.nav>
  );
}
