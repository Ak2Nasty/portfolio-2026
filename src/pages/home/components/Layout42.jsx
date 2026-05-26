import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function Layout42() {
  const [hasDownloaded, setHasDownloaded] = useState(false);

  useEffect(() => {
    if (hasDownloaded) {
      const timer = setTimeout(() => setHasDownloaded(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [hasDownloaded]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section id="about" className="w-full px-6 md:px-12 lg:px-16 pt-12 md:pt-20 lg:pt-24 pb-6 md:pb-12 lg:pb-16 relative z-20 bg-[#0C0C0B]">
      <div className="max-w-[120rem] mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px 0px -30% 0px" }}
          variants={containerVariants}
          className="grid grid-cols-1 items-start gap-12 md:grid-cols-[1.1fr_0.9fr] lg:gap-24 xl:gap-32"
        >
          {/* Left: Headline & Label */}
          <motion.div variants={itemVariants} className="flex flex-col">
            <div className="font-['Outfit'] font-semibold text-[10px] md:text-[11px] tracking-[0.25em] text-[#a3a3a3] uppercase mb-6 md:mb-[2.5rem] leading-none">
              ABOUT / 01
            </div>
            <h3 className="font-['Outfit'] text-[34px] md:text-[46px] lg:text-[54px] font-bold leading-[1.05] text-[#f4f4f4] tracking-[0.03em] max-w-[650px] uppercase">
              MARKETING<br />
              BUILT THROUGH<br />
              <span className="relative inline-block whitespace-nowrap pb-1">
                REAL-WORLD EXECUTION
                <motion.span
                  initial={{ width: "0%" }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true, margin: "0px 0px -30% 0px" }}
                  transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-0 bottom-[-2px] h-[1px] bg-[#f4f4f4]/40"
                ></motion.span>
              </span>
            </h3>

            {/* Resume Button */}
            <a 
              href="/Akshathdayan_Suresh_Resume_2026.pdf"
              download="Akshathdayan_Suresh_Resume_2026.pdf"
              onClick={() => setHasDownloaded(true)}
              className={`mt-10 md:mt-14 inline-flex items-center justify-center px-10 md:px-12 py-3.5 md:py-4 rounded-full font-['Outfit'] font-bold text-[11px] md:text-[12px] tracking-[0.2em] uppercase transition-all duration-300 min-w-[200px] md:min-w-[240px] ${hasDownloaded ? 'bg-[#22c55e] text-[#0C0C0B] shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-[#e8e8e8] text-[#050505] shadow-[0_0_15px_rgba(232,232,232,0.25)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:bg-white hover:-translate-y-[2px]'}`}
            >
              {hasDownloaded ? "THANK YOU!" : "DOWNLOAD RESUME"}
            </a>
          </motion.div>
          
          {/* Right: Bio */}
          <motion.div variants={itemVariants} className="flex flex-col justify-start md:pt-[2rem] lg:pt-[2.25rem] gap-6">
            <p className="font-['Outfit'] text-[17px] md:text-[20px] leading-[1.75] font-light text-[#c2c2c2] max-w-[600px]">
              Experience across <strong className="font-medium text-[#f4f4f4]">digital marketing, global events, campaign execution, marketing analytics</strong>, and <strong className="font-medium text-[#f4f4f4]">brand strategy</strong> through <strong className="font-medium text-[#f4f4f4]">corporate, consulting</strong>, and <strong className="font-medium text-[#f4f4f4]"><span className="whitespace-nowrap">consumer-facing environments</span></strong>.
            </p>
            <p className="font-['Outfit'] text-[17px] md:text-[20px] leading-[1.75] font-light text-[#c2c2c2] max-w-[600px]">
              I've worked across <strong className="font-medium text-[#f4f4f4]">event coordination</strong>, <strong className="font-medium text-[#f4f4f4]">social media campaigns</strong>, <strong className="font-medium text-[#f4f4f4]">copywriting</strong>, <strong className="font-medium text-[#f4f4f4]">client communication</strong>, and <strong className="font-medium text-[#f4f4f4]">content strategy</strong> — balancing <strong className="font-medium text-[#f4f4f4]">critical thinking</strong>, with <strong className="font-medium text-[#f4f4f4]">seamless execution</strong>.
            </p>
            <p className="font-['Outfit'] text-[17px] md:text-[20px] leading-[1.75] font-light text-[#c2c2c2] max-w-[600px]">
              My approach is <strong className="font-medium text-[#f4f4f4]">systems-driven</strong>, <strong className="font-medium text-[#f4f4f4]">research-oriented</strong>, with a strong focus on <strong className="font-medium text-[#f4f4f4]">constant learning, adaptability</strong>, and <strong className="font-medium text-[#f4f4f4]">creative problem solving</strong>.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
