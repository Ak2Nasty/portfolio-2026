import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ScrambleLabel } from "../../../components/ScrambleLabel";

// About copy as runs of { t, strong } so the word-reveal can split it into words
const aboutParas = [
  [
    { t: "An integrated marketing strategist blending rigorous analytics with high-converting creative execution. I specialize in " },
    { t: "digital campaigns, global events, cross-channel brand development, and strategic consulting.", strong: true },
  ],
  [
    { t: "My approach is " },
    { t: "systems and research-driven.", strong: true },
    { t: " I bring a distinct technical edge—bridging the gap between creative vision and technical reality to turn complex data into " },
    { t: "flawless execution.", strong: true },
  ],
];

function RevealWord({ progress, start, end, strong, children }) {
  const opacity = useTransform(progress, [start, end], [0.16, 1]);
  return (
    <motion.span style={{ opacity }} className={strong ? "font-medium text-[#f4f4f4]" : undefined}>
      {children}{" "}
    </motion.span>
  );
}

// Words light up from dark gray to full colour as the reader scrolls through
function ScrollyParagraphs({ paras }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 82%", "end 60%"]
  });

  const totalWords = paras.reduce(
    (n, runs) => n + runs.reduce((m, r) => m + r.t.split(/\s+/).filter(Boolean).length, 0),
    0
  );

  let wordIndex = 0;
  return (
    <div ref={ref} className="flex flex-col gap-6">
      {paras.map((runs, pi) => (
        <p key={pi} className="font-['Outfit'] text-[17px] md:text-[20px] leading-[1.75] font-light text-[#c2c2c2] max-w-[600px]">
          {runs.map((run, ri) =>
            run.t.split(/\s+/).filter(Boolean).map((word, wi) => {
              const idx = wordIndex++;
              const start = idx / totalWords;
              const end = Math.min(1, (idx + 2) / totalWords);
              return (
                <RevealWord key={`${ri}-${wi}`} progress={scrollYProgress} start={start} end={end} strong={run.strong}>
                  {word}
                </RevealWord>
              );
            })
          )}
        </p>
      ))}
    </div>
  );
}

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

  const sectionRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 40%", "center center"]
  });

  const firstLineWidth = useTransform(scrollYProgress, [0, 0.5], ["0%", "100%"]);
  const secondLineWidth = useTransform(scrollYProgress, [0.5, 1], ["0%", "100%"]);

  return (
    <section ref={sectionRef} id="about" className="w-full px-6 md:px-12 lg:px-16 min-h-screen flex items-center py-20 relative z-20 bg-[#0C0C0B] border-t border-white/[0.05]">
      <div className="max-w-[120rem] mx-auto w-full">
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
              <ScrambleLabel text="ABOUT / 01" />
            </div>
            <h3 className="font-monument text-[34px] md:text-[46px] lg:text-[54px] font-bold leading-[1.05] text-[#f4f4f4] tracking-[0.03em] max-w-[650px] uppercase">
              MARKETING<br />
              BUILT THROUGH<br />
              {/* The sweep bar blends with difference: |backdrop - source|. At
                  #E8E8E9 it knocks the #f4f4f4 text back to exactly #0C0C0B, the
                  section background, rather than the pure black a #f4f4f4 bar
                  produced. Retune this if the text or background colour changes. */}
              <span className="relative inline-block pb-1 pr-2">
                REAL-WORLD
                <motion.div
                  style={{ width: firstLineWidth }}
                  className="absolute left-[-4px] top-0 bottom-1 bg-[#E8E8E9] mix-blend-difference z-10 origin-left"
                />
              </span>
              <br />
              <span className="relative inline-block pb-1 pr-2">
                EXECUTION
                <motion.div
                  style={{ width: secondLineWidth }}
                  className="absolute left-[-4px] top-0 bottom-1 bg-[#E8E8E9] mix-blend-difference z-10 origin-left"
                />
              </span>
            </h3>

            {/* Resume Button */}
            <a 
              href="/Akshathdayan_Suresh_Resume_1Page_2026V2.pdf"
              download="Akshathdayan_Suresh_Resume_1Page_2026.pdf"
              onClick={() => setHasDownloaded(true)}
              onPointerDown={() => setHasDownloaded(true)}
              className={`mt-10 md:mt-14 inline-flex items-center justify-center px-10 md:px-12 py-3.5 md:py-4 rounded-full font-['Outfit'] font-bold text-[11px] md:text-[12px] tracking-[0.2em] uppercase transition-all duration-300 min-w-[200px] md:min-w-[240px] ${hasDownloaded ? 'bg-[#22c55e] text-[#0C0C0B] shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-[#e8e8e8] text-[#050505] shadow-[0_0_15px_rgba(232,232,232,0.25)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:bg-white hover:-translate-y-[2px]'}`}
            >
              {hasDownloaded ? "THANK YOU!" : "DOWNLOAD RESUME"}
            </a>
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex flex-col justify-start md:pt-[2rem] lg:pt-[2.25rem] gap-6">
            {/* Scroll-driven word reveal, all viewports */}
            <ScrollyParagraphs paras={aboutParas} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
