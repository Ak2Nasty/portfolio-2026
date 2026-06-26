import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, User, GraduationCap, Briefcase, Cpu, Send, Folder } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export function FloatingNav() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "about", label: "About", icon: User },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "work-samples", label: "Work", icon: Folder, href: "/work-sample" },
    { id: "skills", label: "Skills", icon: Cpu },
    { id: "contact", label: "Contact", icon: Send }
  ];

  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Show when we've scrolled past the top header nav (approx 150px)
      const pastHeader = currentScrollY > 150;
      const isScrollingUp = currentScrollY < lastScrollY.current;

      // Check if we're at the very bottom of the page (within 50px buffer)
      const isAtBottom = window.innerHeight + currentScrollY >= document.documentElement.scrollHeight - 50;

      // Show when scrolling up past the header, OR when at the absolute bottom
      if ((pastHeader && isScrollingUp) || isAtBottom) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      lastScrollY.current = currentScrollY;

      // Very simple active section tracking
      if (location.pathname === "/work-sample") {
        setActiveSection("work-samples");
      } else {
        const sections = navItems.map(item => item.id).filter(id => id !== "work-samples");
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
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 20, x: "-50%" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-8 left-1/2 z-[9999]"
          onMouseEnter={() => {
            if (window.innerWidth >= 768) setIsHovered(true);
          }}
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
                <div key={item.id} className="relative flex items-center justify-center group/dropdown">
                  <a
                    href={item.href || `#${item.id}`}
                    onClick={(e) => handleClick(e, item)}
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
                </div>
              );
            })}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
