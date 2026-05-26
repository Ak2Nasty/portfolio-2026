import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, User, GraduationCap, Briefcase, Layers, Mail } from "lucide-react";

export function FloatingNav() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "about", label: "About", icon: User },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "work-samples", label: "Work", icon: Layers },
    { id: "contact", label: "Contact", icon: Mail }
  ];

  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const pastHero = currentScrollY > window.innerHeight * 0.8;
      const isScrollingUp = currentScrollY < lastScrollY.current;

      // Show only when scrolling up AND past the hero
      if (pastHero && isScrollingUp) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      lastScrollY.current = currentScrollY;

      // Very simple active section tracking
      const sections = navItems.map(item => item.id);
      let current = "";
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            current = section;
          }
        }
      }
      if (current) {
        setActiveSection(current);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 20, x: "-50%" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-8 left-1/2 z-[9999]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div 
            className="flex items-center gap-1 bg-[#0a0a0a]/80 backdrop-blur-md border border-[#2a2a2a] rounded-full px-2 py-2"
            animate={{ 
              opacity: isHovered ? 1 : 0.85,
              backgroundColor: isHovered ? "rgba(10, 10, 10, 0.95)" : "rgba(10, 10, 10, 0.8)",
              borderColor: isHovered ? "rgba(64, 64, 64, 1)" : "rgba(42, 42, 42, 1)"
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleClick(e, item.id)}
                  className="relative group flex items-center justify-center rounded-full overflow-hidden transition-colors duration-300"
                >
                  <motion.div
                    className={`flex items-center justify-center h-10 px-3 md:px-4 ${isActive ? 'text-[#f4f4f4]' : 'text-[#888]'}`}
                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)", color: "#f4f4f4" }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon strokeWidth={isActive ? 2.5 : 1.5} className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                    
                    <AnimatePresence>
                      {isHovered && (
                        <motion.span
                          initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                          animate={{ width: "auto", opacity: 1, marginLeft: 8 }}
                          exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className="font-['Outfit'] text-[10px] md:text-[11px] font-medium tracking-[0.1em] uppercase whitespace-nowrap overflow-hidden"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </a>
              );
            })}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
