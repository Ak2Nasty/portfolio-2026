import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function Header88() {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 200 });
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 200 });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);
    
    const handleMediaChange = (e) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  useEffect(() => {
    if (isReducedMotion || window.innerWidth <= 768) return;

    const handleMouseMove = (e) => {
      // Normalize to -1 to 1
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      // Max movement 3px for that subtle microscopic drift
      mouseX.set(x * 3);
      mouseY.set(y * 3);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, isReducedMotion]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: isReducedMotion ? 0 : 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <motion.section 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative w-full min-h-[100svh] bg-[#0C0C0B] text-[#f4f4f4] flex flex-col overflow-hidden selection:bg-gray-800 selection:text-white pt-24 md:pt-32"
    >
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-16 w-full max-w-[120rem] mx-auto relative z-10">
        
        {/* Role Label */}
        <motion.div variants={itemVariants} className="font-['Outfit'] text-[9px] md:text-[11px] tracking-[0.2em] text-gray-400 uppercase mb-4 md:mb-6">
          DIGITAL MARKETING • EVENT OPERATIONS • BRAND STRATEGY
        </motion.div>

        {/* Massive Name */}
        <motion.h1 
          variants={itemVariants} 
          style={isReducedMotion ? {} : { x: smoothX, y: smoothY }}
          className="font-monument text-[10vw] md:text-[8vw] leading-[1.05] text-[#f4f4f4] m-0 p-0 tracking-normal"
        >
          <span className="block mb-1 md:mb-2">AKSHATHDAYAN</span>
          <span className="block">SURESH</span>
        </motion.h1>

        {/* Education Metadata */}
        <motion.div variants={itemVariants} className="mt-5 md:mt-6">
          <p className="font-['Outfit'] font-semibold text-[9.5px] md:text-[11px] tracking-[0.25em] text-[#f4f4f4] opacity-80 uppercase">
            B.MGMT HONOURS • UBC ’25
          </p>
        </motion.div>
        
      </div>

      {/* Bottom Information Grid */}
      <div className="px-6 md:px-12 lg:px-16 w-full max-w-[120rem] mx-auto pb-8 md:pb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-10 md:gap-8 relative z-10">
        
        {/* Left Side: Positioning & Location */}
        <div className="flex flex-col gap-6 md:gap-10 max-w-[45%] min-w-[300px]">
          <motion.p variants={itemVariants} className="font-['Outfit'] text-[10px] md:text-[12px] leading-[1.8] text-gray-400 uppercase tracking-widest">
            BUSINESS MANAGEMENT GRADUATE WITH EXPERIENCE ACROSS DIGITAL MARKETING, GLOBAL EVENTS, DIGITAL CAMPAIGNS, MARKETING ANALYTICS, AND BRAND STRATEGY.
          </motion.p>
          <motion.div variants={itemVariants} className="font-['Outfit'] text-[9px] md:text-[11px] tracking-[0.2em] text-gray-500 uppercase flex items-center gap-2">
            BASED IN TORONTO, CANADA
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-80" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.051 0L9.444 6.78l-5.637-.626 2.656 5.864-6.463 2.112 7.027 3.328-1.503 3.972 6.012-1.922.385 4.492h1.493l.4-4.524 6.014 1.954-1.542-4.004 7.085-3.328-6.495-2.112 2.673-5.864-5.67.626L12.051 0z" />
            </svg>
          </motion.div>
        </div>

        {/* Right Side: Availability Badge & Scroll Cue */}
        <div className="flex flex-col items-start md:items-end gap-6 md:gap-10">
          {/* Badge */}
          <motion.div variants={itemVariants} className="flex items-center gap-2 md:gap-3 border border-[#166534] rounded-full px-3 py-1 md:px-4 md:py-1.5 bg-transparent shadow-[0_0_15px_rgba(34,197,94,0.2)] hover:shadow-[0_0_25px_rgba(34,197,94,0.35)] transition-shadow duration-500 cursor-default">
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
            <span className="font-['Outfit'] text-[9px] md:text-[10px] uppercase tracking-widest text-[#22c55e] pt-[1px] md:pt-[2px]">AVAILABLE FOR WORK</span>
          </motion.div>

          {/* Scroll Cue */}
          <motion.div variants={itemVariants} className="font-['Outfit'] text-[9px] md:text-[11px] tracking-[0.2em] text-gray-300 uppercase flex items-center gap-2 cursor-default drop-shadow-[0_0_8px_rgba(209,213,219,0.5)]">
            SCROLL TO ENTER PORTFOLIO
            <div className="relative w-4 h-4">
              {/* Tracer 2 */}
              <motion.div 
                animate={isReducedMotion ? {} : { y: [0, 7, 0], opacity: [0.1, 0.3, 0.1] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.3 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <ChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </motion.div>
              
              {/* Tracer 1 */}
              <motion.div 
                animate={isReducedMotion ? {} : { y: [0, 7, 0], opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.15 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <ChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </motion.div>

              {/* Main Arrow */}
              <motion.div 
                animate={isReducedMotion ? {} : { y: [0, 7, 0], opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <ChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Marquee Ticker */}
      <motion.div variants={itemVariants} className="w-full border-y border-gray-900 py-2.5 md:py-3 overflow-hidden flex bg-[#0C0C0B] group">
        <div className="flex font-['Outfit'] text-[9px] md:text-[11px] tracking-[0.25em] text-gray-400 uppercase animate-marquee whitespace-nowrap w-max group-hover:[animation-play-state:paused]">
          <span>INTEGRATED MARKETING • EVENT OPERATIONS • DIGITAL CAMPAIGNS • MARKETING ANALYTICS • BRAND STRATEGY • SOCIAL MEDIA MARKETING • CONTENT STRATEGY • POWER BI • GOOGLE ANALYTICS • EVENT COORDINATION • STAKEHOLDER COMMUNICATION • CONSUMER INSIGHTS • SEO/SEM • CAMPAIGN STRATEGY • CROSS-FUNCTIONAL COLLABORATION • CREATIVE EXECUTION • PROJECT COORDINATION • COPYWRITING • CONTENT MARKETING • MARKETING COMMUNICATIONS •&nbsp;</span>
          <span>INTEGRATED MARKETING • EVENT OPERATIONS • DIGITAL CAMPAIGNS • MARKETING ANALYTICS • BRAND STRATEGY • SOCIAL MEDIA MARKETING • CONTENT STRATEGY • POWER BI • GOOGLE ANALYTICS • EVENT COORDINATION • STAKEHOLDER COMMUNICATION • CONSUMER INSIGHTS • SEO/SEM • CAMPAIGN STRATEGY • CROSS-FUNCTIONAL COLLABORATION • CREATIVE EXECUTION • PROJECT COORDINATION • COPYWRITING • CONTENT MARKETING • MARKETING COMMUNICATIONS •&nbsp;</span>
        </div>
      </motion.div>
    </motion.section>
  );
}
