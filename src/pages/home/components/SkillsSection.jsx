import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Sparkles } from "lucide-react"; // Using Sparkles for Antigravity

const techSkills = [
  { name: "Power BI", slug: "powerbi" },
  { name: "Google Analytics", slug: "googleanalytics" },
  { name: "Google Ads", slug: "googleads" },
  { name: "Meta Ads", slug: "meta" },
  { name: "Canva", slug: "canva" },
  { name: "Photoshop", slug: "adobephotoshop" },
  { name: "Illustrator", slug: "adobeillustrator" },
  { name: "Figma", slug: "figma" },
  { name: "Hootsuite", slug: "hootsuite" },
  { name: "Salesforce", slug: "salesforce" },
  { name: "Excel", slug: "microsoftexcel" },
  { name: "PowerPoint", slug: "microsoftpowerpoint" },
  { name: "WordPress", slug: "wordpress" },
  { name: "ChatGPT", slug: "openai" },
  { name: "Claude", slug: "anthropic" },
  { name: "Gemini", slug: "googlegemini" },
  { name: "Antigravity", slug: "custom-ag" } // Custom handling
];

const softSkills = [
  "Cross-Functional Collaboration",
  "Strategic Communication",
  "Campaign Coordination",
  "Creative Problem Solving",
  "Stakeholder Management",
  "Adaptability",
  "Research & Analysis",
  "Client Communication"
];

const languages = [
  { name: "English", level: 5 },
  { name: "Tamil", level: 5 },
  { name: "French", level: 2 },
  { name: "Spanish", level: 2 }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
  }
};

const LanguageMeter = ({ language, level }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <motion.div variants={itemVariants} className="flex items-center justify-between py-2 border-b border-[#1a1a1a] last:border-0 group">
      <span className="font-['Outfit'] text-[13px] tracking-[0.1em] text-[#d4d4d4] uppercase group-hover:text-white transition-colors">
        {language}
      </span>
      <div ref={ref} className="flex gap-1.5">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ backgroundColor: "rgba(0,0,0,0)", borderColor: "#333" }}
            animate={isInView ? {
              backgroundColor: i < level ? "#d4d4d4" : "rgba(0,0,0,0)",
              borderColor: i < level ? "#d4d4d4" : "#333"
            } : {}}
            transition={{ duration: 0.4, delay: i * 0.1 + 0.3 }}
            className="w-2.5 h-2.5 rounded-full border border-[#333]"
          />
        ))}
      </div>
    </motion.div>
  );
};

export function SkillsSection() {
  return (
    <section id="skills" className="w-full bg-[#0C0C0B] relative z-20 text-white border-t border-[#1a1a1a] py-24 xl:py-32 overflow-hidden">
      <div className="max-w-[120rem] mx-auto px-6 md:px-12 lg:px-16">
        
        {/* Header */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          variants={containerVariants}
          className="flex flex-col gap-4 mb-16 xl:mb-24"
        >
          <motion.span variants={itemVariants} className="font-['Outfit'] font-semibold text-[10px] md:text-[11px] tracking-[0.25em] text-[#a3a3a3] uppercase">
            SKILLS / 04
          </motion.span>
          <motion.h2 variants={itemVariants} className="font-monument text-[30px] md:text-[40px] xl:text-[48px] font-bold leading-[1.1] text-[#f4f4f4] tracking-[0.03em] max-w-[800px] uppercase">
            TOOLS, SYSTEMS & COMMUNICATION
          </motion.h2>
          <motion.p variants={itemVariants} className="font-['Outfit'] text-[12px] md:text-[14px] leading-[1.8] font-medium tracking-[0.15em] text-[#8a8a8a] max-w-[500px] uppercase mt-2">
            BUILT THROUGH REAL PROJECTS, CROSS-FUNCTIONAL TEAMS, AND CONSTANT LEARNING.
          </motion.p>
        </motion.div>

        {/* 50/50 Split */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 lg:gap-24 xl:gap-32 items-start">
          
          {/* LEFT: Technical Skills (Grid) */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
            variants={containerVariants}
            className="w-full"
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {techSkills.map((tech) => (
                <motion.div
                  key={tech.name}
                  variants={itemVariants}
                  className="aspect-square bg-[#0a0a0a] border border-[#1a1a1a] rounded flex flex-col items-center justify-center gap-3 relative group transition-all duration-300 hover:border-[#333] hover:bg-[#0f0f0f] hover:-translate-y-1"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                    {tech.slug === "custom-ag" ? (
                      <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-[#d4d4d4]" strokeWidth={1.5} />
                    ) : (
                      <img 
                        src={`https://cdn.simpleicons.org/${tech.slug}/d4d4d4`} 
                        alt={tech.name} 
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                  <span className="font-['Outfit'] text-[8px] md:text-[9px] tracking-wider text-[#666] uppercase group-hover:text-[#a3a3a3] transition-colors text-center px-1">
                    {tech.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT: Soft Skills & Languages */}
          <div className="w-full flex flex-col gap-16">
            
            {/* Soft Skills */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-10%" }}
              variants={containerVariants}
              className="flex flex-col"
            >
              <motion.div variants={itemVariants} className="pb-4 mb-4 border-b border-[#222]">
                <span className="font-['Outfit'] text-[10px] tracking-[0.2em] text-[#666] uppercase">Soft Skills Framework</span>
              </motion.div>
              <div className="flex flex-col gap-1">
                {softSkills.map((skill) => (
                  <motion.div 
                    key={skill}
                    variants={itemVariants}
                    className="py-2.5 px-3 -mx-3 rounded hover:bg-[#0a0a0a] transition-colors duration-300 cursor-default"
                  >
                    <span className="font-['Outfit'] text-[14px] xl:text-[15px] font-light tracking-[0.05em] text-[#b3b3b3]">
                      {skill}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Languages */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-10%" }}
              variants={containerVariants}
              className="flex flex-col"
            >
              <motion.div variants={itemVariants} className="pb-4 mb-4 border-b border-[#222]">
                <span className="font-['Outfit'] text-[10px] tracking-[0.2em] text-[#666] uppercase">Linguistic Proficiency</span>
              </motion.div>
              <div className="flex flex-col gap-2">
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
