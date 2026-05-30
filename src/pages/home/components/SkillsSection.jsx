import React, { useState, useEffect } from "react";
import { motion, useInView, useScroll, useTransform, useMotionValueEvent, useSpring } from "framer-motion";
import { useRef } from "react";

/* ─────────────────────────────────────────────
   ICON SOURCE MAP
   Priority: cdn.simpleicons.org → jsdelivr simple-icons → vscode-icons
   CSS filter: brightness(0) invert(0.78) makes any black SVG render as #c8c8c8
───────────────────────────────────────────── */

// Working confirmed sources (tested live)
const SI  = (slug) => `https://cdn.simpleicons.org/${slug}/c8c8c8`;           // colored CDN
const JSD = (slug) => `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`; // npm package (black SVGs – filtered)
const VSC = (slug) => `https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/${slug}.svg`; // colorful – filtered

const techCategories = [
  {
    label: "Marketing & Analytics",
    tools: [
      { name: "Power BI",         src: JSD("powerbi"),              filter: true,  color: "#F2C811" },
      { name: "Google Analytics", src: SI("googleanalytics"),       filter: false, color: "#E37400" },
      { name: "Google Ads",       src: SI("googleads"),             filter: false, color: "#F4B400" },
      { name: "Meta Ads",         src: SI("meta"),                  filter: false, color: "#0668E1" },
      { name: "Hootsuite",        src: SI("hootsuite"),             filter: false, color: "#FF4040" },
      { name: "WordPress",        src: SI("wordpress"),             filter: false, color: "#21759B" },
    ],
  },
  {
    label: "Productivity & Reporting",
    tools: [
      { name: "Excel",      src: JSD("microsoftexcel"),      filter: true, color: "#217346" },
      { name: "PowerPoint", src: JSD("microsoftpowerpoint"), filter: true, color: "#B7472A" },
      { name: "Word",       src: JSD("microsoftword"),       filter: true, color: "#2B579A" },
    ],
  },
  {
    label: "Content & Design",
    tools: [
      // Local file — grayscale filter applied:
      // Inline SVG — white circle with hollow C cutout, no filter needed
      { name: "Canva",       src: "custom-canva",            filter: false, color: "#00C4CC" },
      { name: "Photoshop",   src: JSD("adobephotoshop"),    filter: true,  color: "#31A8FF" },
      { name: "Illustrator", src: JSD("adobeillustrator"),  filter: true,  color: "#FF9A00" },
      { name: "Figma",       src: SI("figma"),              filter: false, color: "#F24E1E" },
    ],
  },
  {
    label: "AI Tools",
    tools: [
      // openai slug = ChatGPT icon; no standalone ChatGPT slug exists
      { name: "ChatGPT",     src: JSD("openai"),            filter: true,  color: "#10A37F" },
      // Local SVG — grayscale filter:
      { name: "Claude",      src: "/logos/claude.svg",      filter: true,  color: "#d97757" },
      { name: "Gemini",      src: SI("googlegemini"),       filter: false, color: "#8E75B2" },
      // Local PNG white — no filter needed:
      { name: "Antigravity", src: "/logos/antigravity.png", filter: false, color: "#f4f4f4", isLocal: true },
    ],
  },
];

const softSkills = [
  "Content Strategy",
  "Campaign Execution",
  "Social Media Marketing",
  "Copywriting",
  "Marketing Analytics",
  "Event Coordination",
  "Stakeholder Communication",
  "Cross-Functional Collaboration",
  "AI Fluency",
];

const languages = [
  { name: "English", level: 5 },
  { name: "Tamil",   level: 5 },
  { name: "French",  level: 2 },
  { name: "Spanish", level: 2 },
];

/* ─────────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ─────────────────────────────────────────────
   LANGUAGE METER
───────────────────────────────────────────── */

const LanguageMeter = ({ language, level }) => {
  const ref = useRef(null);
  // Extremely narrow band to ensure only ONE item is active at a time
  const isActive = useInView(ref, { margin: "-48% 0px -48% 0px" });
  
  // Lock the fill state once it has been triggered
  const [hasTriggered, setHasTriggered] = useState(false);
  useEffect(() => {
    if (isActive && !hasTriggered) {
      setHasTriggered(true);
    }
  }, [isActive, hasTriggered]);

  return (
    <div 
      ref={ref}
      className={`flex items-center justify-between py-3.5 border-b border-[#2a2a2a] last:border-0 group cursor-default transition-all duration-300 px-2 -mx-2 rounded-md ${
        isActive
          ? "bg-[#0a0a0a] -translate-y-[2px] shadow-lg border-transparent"
          : "hover:bg-[#0a0a0a] hover:-translate-y-[2px] hover:shadow-lg hover:border-transparent"
      }`}
    >
      <span 
        className={`font-['Outfit'] text-[12px] md:text-[13px] tracking-[0.12em] uppercase transition-colors duration-300 ${
          isActive ? "text-[#f4f4f4]" : "text-[#c2c2c2] group-hover:text-[#f4f4f4]"
        }`}
      >
        {language}
      </span>
      <div className="flex gap-[7px] items-center">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ backgroundColor: "transparent", borderColor: "#2a2a2a" }}
            animate={hasTriggered ? {
              backgroundColor: i < level ? "#e5e5e5" : "transparent",
              borderColor:     i < level ? "#e5e5e5" : "#2a2a2a",
            } : {
              backgroundColor: "transparent",
              borderColor: "#2a2a2a",
            }}
            transition={{ duration: 0.35, delay: i * 0.09 }}
            className={`w-[9px] h-[9px] rounded-full border transition-all duration-300 ${
              isActive && i < level ? "shadow-[0_0_10px_#fff] scale-125" : "group-hover:border-[#444]"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   CANVA ICON — inline SVG, circle + hollow C
   Uses fill-rule="evenodd" so the C punches a
   transparent hole through the filled circle.
───────────────────────────────────────────── */

const CanvaIcon = () => (
  <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      fill="#e5e5e5"
      d="
        M40 80C62.0914 80 80 62.0914 80 40C80 17.9086 62.0914 0 40 0C17.9086 0 0 17.9086 0 40C0 62.0914 17.9086 80 40 80Z
        M57.2691 48.2052C56.939 48.2052 56.6485 48.484 56.3462 49.0928C52.9323 56.0153 47.0358 60.9134 40.2125 60.9134C32.3228 60.9134 27.437 53.7913 27.437 43.9522C27.437 27.2855 36.7232 17.6491 44.8796 17.6491C48.691 17.6491 51.0186 20.0443 51.0186 23.8559C51.0186 28.3796 48.4485 30.7748 48.4485 32.3702C48.4485 33.0864 48.8939 33.5201 49.7773 33.5201C53.3264 33.5201 57.4918 29.4419 57.4918 23.6808C57.4918 18.0947 52.63 13.9888 44.4737 13.9888C30.994 13.9888 19.0142 26.4858 19.0142 43.777C19.0142 57.1614 26.6572 66.0061 38.45 66.0061C50.9668 66.0061 58.2043 53.5526 58.2043 49.5105C58.2043 48.6153 57.7466 48.2052 57.2691 48.2052Z
      "
    />
  </svg>
);

/* ─────────────────────────────────────────────
   SMART ICON — with filter + two-letter fallback
───────────────────────────────────────────── */

const SmartIcon = ({ src, name, filter, customFilter }) => {
  const [failed, setFailed] = useState(false);

  if (src === "custom-canva") return <CanvaIcon />;

  if (failed) {
    return (
      <span className="font-['Outfit'] font-semibold text-[12px] tracking-tight text-[#c8c8c8] select-none">
        {name.slice(0, 2).toUpperCase()}
      </span>
    );
  }

  // Per-logo override takes priority
  const filterStyle = customFilter
    ? customFilter
    : filter
      ? "brightness(0) invert(0.78)"        // black SVG (JSD) → rendered as #c8c8c8
      : "grayscale(1) brightness(1.1)";      // colored SVG (SI CDN) → muted monochrome

  return (
    <img
      src={src}
      alt={name}
      className="w-full h-full object-contain"
      loading="lazy"
      onError={() => setFailed(true)}
      style={{ filter: filterStyle }}
    />
  );
};

/* ─────────────────────────────────────────────
   TECH TILE
───────────────────────────────────────────── */

const TechTile = ({ name, src, filter, customFilter, color = "#f4f4f4" }) => {
  const [isTapped, setIsTapped] = useState(false);

  const handleTap = () => {
    setIsTapped(true);
    setTimeout(() => {
      setIsTapped(false);
    }, 400); // Wait 400ms to simulate the glow pulse, then fade back
  };

  return (
    <motion.div
      variants={fadeUp}
      onTouchStart={handleTap}
      onClick={handleTap}
      style={{ 
        "--brand": color, 
        "--brand-glow": `${color}25`,
        "--brand-icon": `${color}60`,
        "--brand-half": `${color}80`
      }}
      className={[
        "aspect-square flex flex-col items-center justify-center gap-2.5",
        "bg-[#0a0a0a]/70 lg:bg-[#0a0a0a]/60 backdrop-blur-md",
        "border rounded-sm",
        "relative group cursor-default",
        "transition-all duration-300 ease-out",
        isTapped
          ? "border-[var(--brand)] bg-[#0f0f0f]/80 -translate-y-[2px] shadow-[0_0_20px_var(--brand-glow)]"
          : "border-[var(--brand-icon)] lg:border-[#2a2a2a] shadow-[0_0_10px_var(--brand-glow)] lg:shadow-[0_0_12px_var(--brand-glow)] -translate-y-[1px] lg:translate-y-0",
        "lg:hover:border-[var(--brand)] lg:hover:bg-[#0f0f0f]/80 lg:hover:-translate-y-[3px] lg:hover:shadow-[0_0_25px_var(--brand-glow)]"
      ].join(" ")}
    >
      <div className={[
        "w-7 h-7 md:w-9 md:h-9 flex items-center justify-center transition-all duration-300",
        isTapped
          ? "opacity-100 drop-shadow-[0_0_6px_var(--brand-icon)]"
          : "opacity-80 lg:opacity-85 drop-shadow-[0_0_3px_var(--brand-icon)] lg:drop-shadow-[0_0_5px_var(--brand-icon)]",
        "lg:group-hover:opacity-100 lg:group-hover:drop-shadow-[0_0_10px_var(--brand-icon)]"
      ].join(" ")}>
        <SmartIcon src={src} name={name} filter={filter} customFilter={customFilter} />
      </div>
      <span className={[
        "font-['Outfit'] text-[7.5px] md:text-[8.5px] tracking-[0.14em] uppercase text-center leading-tight px-1 transition-colors duration-300",
        isTapped
          ? "text-[var(--brand)]"
          : "text-[var(--brand-half)] lg:text-[#8a8a8a]",
        "lg:group-hover:text-[var(--brand)]"
      ].join(" ")}>
        {name}
      </span>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   SOFT SKILL ITEM
───────────────────────────────────────────── */

const SoftSkillItem = ({ skill, isActive, onMouseEnter, onMouseLeave }) => {
  return (
    <motion.div
      variants={fadeUp}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`flex items-center gap-4 py-3.5 border-b border-[#2a2a2a] last:border-0 cursor-default transition-all duration-300 px-2 -mx-2 rounded-md ${
        isActive 
          ? "bg-[#0a0a0a] -translate-y-[2px] shadow-lg border-transparent" 
          : "hover:bg-[#0a0a0a] hover:-translate-y-[2px] hover:shadow-lg hover:border-transparent"
      }`}
    >
      <div 
        className={`relative h-1.5 rounded-full transition-all duration-300 shrink-0 ${
          isActive 
            ? "w-4 bg-[#f4f4f4] shadow-[0_0_10px_#f4f4f4]" 
            : "w-1.5 bg-[#444]"
        }`} 
      />
      <span 
        className={`font-['Outfit'] text-[13px] md:text-[14px] xl:text-[15px] font-light tracking-[0.04em] transition-all duration-300 ${
          isActive 
            ? "text-[#f4f4f4] translate-x-1" 
            : "text-[#c2c2c2]"
        }`}
      >
        {skill}
      </span>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   SOFT SKILLS LIST
───────────────────────────────────────────── */

const SoftSkillsList = ({ skills }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [scrollActiveIndex, setScrollActiveIndex] = useState(0);
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  // Spring smooths out fast scrolls so the index ripples sequentially
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 40,
    damping: 15,
    mass: 0.5
  });

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    if (latest <= 0) {
      setScrollActiveIndex(0);
    } else if (latest >= 1) {
      setScrollActiveIndex(skills.length - 1);
    } else {
      const index = Math.floor(latest * skills.length);
      setScrollActiveIndex(index);
    }
  });

  return (
    <div ref={containerRef} className="flex flex-col relative pb-8">
      {skills.map((skill, index) => {
        const isActive = hoveredIndex !== null 
          ? hoveredIndex === index 
          : scrollActiveIndex === index;

        return (
          <SoftSkillItem 
            key={skill} 
            skill={skill} 
            isActive={isActive}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        );
      })}
    </div>
  );
};

/* ─────────────────────────────────────────────
   CATEGORY BLOCK
───────────────────────────────────────────── */

const CategoryBlock = ({ label, tools }) => (
  <motion.div variants={fadeUp} className="flex flex-col gap-4">
    <div className="flex items-center gap-4">
      <span className="font-['Outfit'] font-semibold text-[11px] md:text-[13px] tracking-[0.2em] text-[#f4f4f4] uppercase whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-[#333]" />
    </div>
    <motion.div
      variants={containerVariants}
      className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 md:gap-3"
    >
      {tools.map((tech) => (
        <TechTile key={tech.name} name={tech.name} src={tech.src} filter={tech.filter} customFilter={tech.customFilter} color={tech.color} />
      ))}
    </motion.div>
  </motion.div>
);

/* ─────────────────────────────────────────────
   SECTION LABEL
───────────────────────────────────────────── */

const SectionLabel = ({ children }) => (
  <motion.div variants={fadeUp} className="pb-3 md:pb-4 mb-6 border-b border-[#333]">
    <span className="font-['Outfit'] font-semibold text-[11px] md:text-[13px] tracking-[0.2em] text-[#f4f4f4] uppercase">
      {children}
    </span>
  </motion.div>
);

/* ─────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────── */

export function SkillsSection() {
  const sectionRef = useRef(null);

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="w-full bg-[#0C0C0B] relative z-20 text-white py-10 md:py-16 overflow-hidden group/section border-t border-white/[0.05]"
    >
      <div className="max-w-[120rem] mx-auto px-6 md:px-12 lg:px-16 relative z-10">

        {/* ── HEADER ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-8%" }}
          variants={containerVariants}
          className="mb-20 xl:mb-28"
        >
          <motion.span variants={fadeUp} className="block font-['Outfit'] font-semibold text-[10px] md:text-[11px] tracking-[0.25em] text-[#a3a3a3] uppercase mb-5">
            SKILLS / 04
          </motion.span>
          <motion.h2 variants={fadeUp} className="font-monument text-[28px] sm:text-[36px] md:text-[42px] xl:text-[50px] font-bold leading-[1.08] text-[#f4f4f4] tracking-[0.03em] uppercase max-w-[760px] mb-6">
            CORE CAPABILITIES
          </motion.h2>
          <motion.p variants={fadeUp} className="font-['Outfit'] text-[12px] md:text-[14px] leading-[1.8] font-medium tracking-[0.15em] text-[#8a8a8a] uppercase max-w-[600px]">
            TECHNICAL FLUENCY. ANALYTICAL RIGOR. CREATIVE EXECUTION. A STRATEGIC TOOLKIT BUILT FOR REAL-WORLD IMPACT.
          </motion.p>
        </motion.div>

        {/* ── SPLIT CONSOLE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-20 lg:gap-28 xl:gap-36 items-start relative z-10">

          {/* LEFT: TECHNICAL ARSENAL */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-8%" }}
            variants={containerVariants}
            className="flex flex-col gap-10"
          >
            {techCategories.map((cat) => (
              <CategoryBlock key={cat.label} label={cat.label} tools={cat.tools} />
            ))}
          </motion.div>

          {/* RIGHT: SOFT SKILLS + LANGUAGES */}
          <div className="flex flex-col gap-14">

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-8%" }}
              variants={containerVariants}
            >
              <SectionLabel>Soft Skills</SectionLabel>
              <SoftSkillsList skills={softSkills} />
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-8%" }}
              variants={containerVariants}
            >
              <SectionLabel>Linguistic Proficiency</SectionLabel>
              <div className="flex flex-col">
                {languages.map((lang) => (
                  <LanguageMeter key={lang.name} language={lang.name} level={lang.level} />
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
