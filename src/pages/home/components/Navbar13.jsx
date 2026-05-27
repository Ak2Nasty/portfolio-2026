import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export function Navbar13() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: "HOME", id: "home" },
    { label: "ABOUT", id: "about" },
    { label: "EDUCATION", id: "education" },
    { label: "EXPERIENCE", id: "experience" },
    { label: "WORK", id: "work-samples", href: "/work-sample" },
    { label: "SKILLS", id: "skills" },
    { label: "CONTACT", id: "contact" }
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
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="absolute top-0 left-0 right-0 z-[999] w-full px-4 sm:px-6 md:px-12 pt-6 md:pt-8 flex justify-center"
    >
      <div className="w-full max-w-[80rem] flex items-center justify-between bg-[#121211]/40 border border-white/[0.05] backdrop-blur-md rounded-full px-6 md:px-8 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        
        {/* LOGO */}
        <div 
          onClick={(e) => handleClick(e, 'home')}
          className="font-monument text-[11px] sm:text-[13px] tracking-[0.2em] font-black text-[#f4f4f4] uppercase cursor-pointer select-none"
        >
          AKSHATH<span className="text-[#a3a3a3]">.</span>
        </div>

        {/* LINKS */}
        <ul className="flex flex-wrap md:flex-nowrap items-center justify-center gap-1 sm:gap-2">
          {navItems.map((item, index) => {
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
                  className="relative z-10 px-3 py-1.5 sm:px-4 sm:py-2 inline-flex items-center gap-1.5 font-['Outfit'] text-[9px] sm:text-[10px] tracking-[0.15em] font-medium text-gray-400 hover:text-white transition-colors duration-300 uppercase whitespace-nowrap"
                >
                  {item.label}
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
        </ul>
        
      </div>
    </motion.nav>
  );
}
