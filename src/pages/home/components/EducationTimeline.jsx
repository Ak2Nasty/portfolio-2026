import React, { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

const educationData = [
  {
    id: 0,
    institution: "STONEHILL INTERNATIONAL SCHOOL",
    program: "International Baccalaureate Diploma",
    year: "2018–2020",
    logoText: "SH",
    logoImage: "/stonehill-logo-transparent.png",
    logoScale: "w-[85%] h-[85%]",
    logoFilter: "grayscale brightness-0 invert",
  },
  {
    id: 1,
    institution: "YALE-NUS SUMMER DISCOVERY",
    program: "Global Leadership & Entrepreneurship",
    year: "2019",
    logoText: "YALE",
    logoImage: "/ync-logo-transparent.png",
    logoScale: "w-[50%] h-[50%]",
    logoFilter: "grayscale brightness-0 invert",
  },
  {
    id: 2,
    institution: "PURDUE UNIVERSITY & SIMPLILEARN",
    program: "Professional Certificate in Digital Marketing",
    year: "2023–2024",
    logoText: "PURDUE",
    logoImage: "/purdue-logo-transparent.png",
    logoScale: "w-[85%] h-[85%]",
    logoFilter: "grayscale invert brightness-125",
  },
  {
    id: 3,
    institution: "UNIVERSITY OF BRITISH COLUMBIA",
    program: "Bachelor of Management Honours",
    year: "2020–2025",
    logoText: "UBC",
    logoImage: "/ubc-logo-transparent.png",
    logoScale: "w-[80%] h-[80%]",
    logoFilter: "grayscale brightness-0 invert",
  }
];

export function EducationTimeline() {
  const containerRef = useRef(null);

  // Scroll tracking for the desktop horizontal timeline
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Map scroll progress to the width of the green progress bar (0% to 100%)
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="education" className="w-full bg-[#0C0C0B] relative z-20 text-white border-t border-[#1a1a1a]">
      
      {/* 
        ========================================
        MOBILE VIEW: Vertical Timeline 
        ========================================
      */}
      <div className="lg:hidden flex flex-col px-6 md:px-12 py-24">
        
        {/* Mobile Header */}
        <div className="flex flex-col gap-3 mb-16">
          <span className="font-['Outfit'] font-semibold text-[10px] tracking-[0.25em] text-[#a3a3a3] uppercase">
            EDUCATION / 02
          </span>
          <h2 className="font-monument text-[28px] sm:text-[36px] md:text-[42px] xl:text-[50px] font-bold leading-[1.08] text-[#f4f4f4] tracking-[0.03em] uppercase max-w-[760px]">
            LEARNING CURVE
          </h2>
          <p className="font-['Outfit'] text-[12px] md:text-[14px] leading-[1.8] font-medium tracking-[0.15em] text-[#8a8a8a] max-w-[400px] uppercase">
            FORMAL EDUCATION ACROSS BUSINESS, DIGITAL MARKETING, GLOBAL LEADERSHIP, AND MANAGEMENT.
          </p>
        </div>

        {/* Mobile Vertical List */}
        <div className="flex flex-col gap-12 relative border-l border-[#222] ml-4 pl-8">
          {educationData.map((edu) => (
            <motion.div 
              key={edu.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-2 relative"
            >
              {/* Node Dot */}
              <div className="absolute -left-[37px] top-1 w-2 h-2 bg-[#444] rounded-full border border-[#222]" />
              
              <h3 className="text-sm font-bold font-['Outfit'] tracking-wide text-[#d4d4d4]">
                {edu.institution}
              </h3>
              <p className="text-[#a3a3a3] text-sm">
                {edu.program}
              </p>
              <span className="text-xs text-[#666] tracking-widest mt-1">
                {edu.year}
              </span>
            </motion.div>
          ))}
        </div>
      </div>


      {/* 
        ========================================
        DESKTOP VIEW: Pinned Horizontal Scroll 
        ========================================
      */}
      <div 
        ref={containerRef} 
        className="max-lg:hidden w-full relative"
        style={{ height: "250vh" }}
      >
        <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden px-6 md:px-16 xl:px-24">
          
          {/* Desktop Header */}
          <div className="absolute top-24 xl:top-32 left-16 xl:left-24 flex flex-col gap-4 max-w-2xl z-10">
            <span className="font-['Outfit'] font-semibold text-[11px] tracking-[0.25em] text-[#a3a3a3] uppercase">
              EDUCATION / 02
            </span>
            <h2 className="font-monument text-[28px] sm:text-[36px] md:text-[42px] xl:text-[50px] font-bold leading-[1.08] text-[#f4f4f4] tracking-[0.03em] uppercase max-w-[760px]">
              LEARNING CURVE
            </h2>
            <p className="font-['Outfit'] text-[12px] md:text-[14px] leading-[1.8] font-medium tracking-[0.15em] text-[#8a8a8a] max-w-[500px] uppercase mt-2">
              FORMAL EDUCATION ACROSS BUSINESS, DIGITAL MARKETING, GLOBAL LEADERSHIP, AND MANAGEMENT.
            </p>
          </div>

          {/* Timeline Track Container */}
          <div className="relative w-full max-w-[120rem] mx-auto mt-32 xl:mt-48 h-64 flex items-center">
            
            {/* The Background Line */}
            <div className="absolute left-0 right-0 top-[32px] xl:top-[40px] h-[1px] bg-[#222] z-0 -translate-y-1/2" />
            
            {/* The Green Progress Line */}
            <motion.div 
              className="absolute left-0 top-[32px] xl:top-[40px] h-[2px] bg-[#16a34a] z-10 origin-left shadow-[0_0_15px_#16a34a] -translate-y-1/2"
              style={{ width: progressWidth }}
            />

            {/* The Nodes */}
            <div className="relative z-20 w-full flex justify-between items-start">
              {educationData.map((edu, index) => {
                // Calculate the activation threshold for each node (0, 0.33, 0.66, 1)
                const threshold = index / (educationData.length - 1);
                
                // Ensure strictly increasing input ranges for useTransform to prevent React crash
                const inputStart = Math.max(0, threshold - 0.05);
                const inputEnd = Math.max(0.001, threshold);

                // When progress reaches threshold, opacity goes from 0.3 to 1, scale goes 0.98 to 1
                const nodeOpacity = useTransform(
                  scrollYProgress,
                  [inputStart, inputEnd],
                  [0.3, 1]
                );
                
                const nodeScale = useTransform(
                  scrollYProgress,
                  [inputStart, inputEnd],
                  [0.98, 1]
                );

                return (
                  <motion.div 
                    key={edu.id} 
                    className="flex flex-col items-center w-64 relative"
                    style={{ scale: nodeScale }}
                  >
                    {/* Visual Node / Logo Placeholder (Always opaque to block the line) */}
                    <div className="w-16 h-16 xl:w-20 xl:h-20 bg-[#0C0C0B] border border-[#2a2a2a] rounded flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(255,255,255,0.02)] relative z-10 overflow-hidden">
                      <motion.div style={{ opacity: nodeOpacity }} className="w-full h-full flex items-center justify-center">
                        {edu.logoImage ? (
                          <img src={edu.logoImage} alt={edu.institution} className={`${edu.logoScale} object-contain ${edu.logoFilter}`} />
                        ) : (
                          <span className="text-[#666] font-['Outfit'] font-bold text-[10px] xl:text-xs">{edu.logoText}</span>
                        )}
                      </motion.div>
                    </div>

                    {/* Text Content */}
                    <motion.div style={{ opacity: nodeOpacity }} className="text-center mt-6 flex flex-col gap-2">
                      <h3 className="text-xs xl:text-sm font-bold font-['Outfit'] tracking-wide text-[#e0e0e0] uppercase leading-relaxed">
                        {edu.institution}
                      </h3>
                      <p className="text-[#a3a3a3] text-xs xl:text-sm font-light">
                        {edu.program}
                      </p>
                      <span className="text-[10px] xl:text-xs text-[#666] tracking-widest mt-1">
                        {edu.year}
                      </span>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </div>
      </div>

    </section>
  );
}
