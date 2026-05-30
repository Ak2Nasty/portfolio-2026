import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function Career12() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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

  const experiences = [
    {
      company: "D2L",
      logo: "/d2l-inverted.png",
      role: "Customer Marketing & Events Coordinator",
      summary: "Contributed to global event operations and cross-functional marketing initiatives, leading a large-scale event vendor transition through strategic evaluation, stakeholder communication, Power BI reporting, and trade show coordination.",
      metadata: "VANCOUVER, BC • CO-OP • SEP 2023 - DEC 2023",
      link: "/work-sample#d2l"
    },
    {
      company: "OKHC",
      logo: "/okhc-logo-transparent.png",
      logoClass: "brightness-0 invert",
      role: "Marketing & Communications Consultant",
      summary: "Led communications, strategic marketing, and website redesign development for a non-profit consulting engagement through client outreach, marketing audits, social media strategy, stakeholder communication, and content development.",
      metadata: "KELOWNA, BC • UBC CAPSTONE • JAN 2025 - APR 2025",
      link: "/work-sample#okhc"
    },
    {
      company: "Foot Locker",
      logo: "/footlocker-seeklogo.png",
      logoClass: "grayscale invert contrast-200",
      role: "Sales Associate",
      summary: "Delivered client-focused customer experiences in a high-volume retail environment through product recommendations, visual merchandising, inventory coordination, and fast-paced frontline operations.",
      metadata: "KELOWNA, BC • RETAIL OPERATIONS • NOV 2025 - PRESENT",
      link: null
    },
    {
      company: "UBC Management Student Association",
      logo: "/msa-logo.png",
      logoClass: "grayscale invert contrast-200",
      role: "President, Marketing Club",
      summary: "Led digital content, social media strategy, sponsorship partnerships, and campus-wide event execution through cross-channel promotional campaigns, budget coordination, and brand-aligned marketing initiatives.",
      metadata: "KELOWNA, BC • STUDENT LEADERSHIP • AUG 2022 - APR 2023",
      link: "/work-sample#marketing-club"
    },
    {
      company: "Nestlé Nespresso",
      logo: "/nespresso-idr.svg",
      logoClass: "brightness-0 invert",
      role: "Sales Associate",
      summary: "Delivered brand-focused customer experiences through product demonstrations, consumer engagement, visual merchandising, and personalized sales communication, contributing to an 8% increase in sales performance.",
      metadata: "KELOWNA, BC • CONSUMER ENGAGEMENT • NOV 2022 - APR 2023",
      link: "/work-sample#nespresso"
    },
    {
      company: "CUBS Vancouver",
      logo: "/cubs-logo.png",
      logoClass: "grayscale invert contrast-200 scale-[1.7] origin-right translate-x-20",
      role: "Graphic Designer",
      summary: "Developed social media campaigns, copywriting, and visual content for community-focused education initiatives through content strategy, digital design, and creative communication.",
      metadata: "VANCOUVER, BC (REMOTE) • CREATIVE MARKETING • AUG 2022 - DEC 2022",
      link: "/work-sample#cubs"
    },
    {
      company: "Mindtree",
      logo: "/mindtree-logo.svg",
      logoClass: "brightness-0 invert",
      role: "Acquisitions Student Intern",
      summary: "Supported post-acquisition communications and organizational change initiatives through stakeholder coordination, internal communication strategy, operational research, and cross-functional collaboration.",
      metadata: "BANGALORE, INDIA • CORPORATE STRATEGY • SEP 2019 - JAN 2020",
      link: "/work-sample#mindtree"
    },
    {
      company: "EssEmm Corporation",
      logo: "/essemm-logo.svg",
      logoClass: "brightness-0 invert",
      role: "Marketing Student Intern",
      summary: "Conducted market research, strategic analysis, and customer insight reporting to support distribution strategy, product positioning, and e-commerce recommendations through data-driven marketing initiatives.",
      metadata: "COIMBATORE, INDIA • MARKETING STRATEGY • JUN 2019 - SEP 2019",
      link: "/work-sample#essemm"
    },
    {
      company: "Shure",
      logo: "/shure-logo.svg",
      logoClass: "brightness-0 invert scale-[2] md:scale-100 origin-bottom-right -translate-y-4 -translate-x-4 md:translate-y-0 md:translate-x-0",
      role: "1st Place Winner",
      summary: "Developed an award-winning strategic marketing proposal for Shure's expansion in India, analyzing target demographics and competitors to recommend localized sales strategies.",
      metadata: "BANGALORE, INDIA • ACADEMIC PROJECT • MAR 2019",
      link: "/work-sample#shure"
    }
  ];

  return (
    <section id="experience" className="w-full px-6 md:px-12 lg:px-16 pt-8 md:pt-12 pb-10 md:pb-16 lg:pb-20 relative z-20 bg-[#0C0C0B] border-t border-white/[0.05]">
      <div className="max-w-[120rem] mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px 0px -20% 0px" }}
          variants={containerVariants}
          className="flex flex-col lg:flex-row gap-16 lg:gap-24"
        >
          
          {/* Left: Section Header */}
          <motion.div variants={itemVariants} className="w-full lg:w-[45%] flex flex-col gap-6 md:gap-8 justify-start lg:sticky lg:top-[15vh] h-fit">
            <div className="flex flex-col gap-3 md:gap-4">
              <span className="font-['Outfit'] font-semibold text-[10px] md:text-[11px] tracking-[0.25em] text-[#a3a3a3] uppercase">
                EXPERIENCE / 03
              </span>
              <h3 className="font-monument text-[34px] md:text-[46px] lg:text-[54px] font-bold leading-[1.05] text-[#f4f4f4] tracking-[0.03em] uppercase">
                EXECUTION ARCHIVE
              </h3>
            </div>
            
            <p className="font-['Outfit'] text-[12px] md:text-[14px] leading-[1.8] font-medium tracking-[0.15em] text-[#8a8a8a] max-w-[400px] uppercase mb-6">
              A TRACK RECORD OF IMPACT ACROSS MARKETING, CORPORATE STRATEGY, AND LEADERSHIP ROLES.
            </p>

            <Link 
              to="/work-sample"
              className="group relative flex items-center justify-center gap-3 w-fit px-8 py-3.5 bg-[#0a0a0a]/50 border border-white/[0.1] rounded-full overflow-hidden transition-all duration-500 hover:bg-white/[0.04] hover:border-white/[0.15] hover:shadow-[0_0_25px_rgba(255,255,255,0.05)] backdrop-blur-sm cursor-pointer"
            >
              <span className="relative z-10 font-['Outfit'] text-[11px] tracking-[0.2em] font-medium text-gray-300 group-hover:text-white uppercase transition-colors">
                View Work Samples
              </span>
              <span className="relative z-10 text-gray-500 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white">
                →
              </span>
            </Link>
          </motion.div>
          
          {/* Right: Experience List */}
          <div className="w-full lg:w-[55%] flex flex-col relative" style={{ paddingBottom: '25vh' }}>
            {experiences.map((exp, index) => {
              const topOffset = `calc(15vh + ${index * 20}px)`;
              return (
              <motion.div 
                key={index}
                variants={itemVariants}
                style={{ top: topOffset }}
                className="group sticky flex flex-row justify-between items-stretch bg-[#0a0a0a] border border-[#2a2a2a] rounded-2xl p-6 sm:p-8 lg:p-10 2xl:p-12 mb-[10vh] lg:mb-[25vh] shadow-[0_0_15px_rgba(255,255,255,0.05)] h-auto min-h-[400px] md:h-[480px] lg:h-[450px] overflow-hidden transition-shadow duration-500 hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]"
              >
                <div className="flex flex-col gap-5 flex-1 relative z-10 justify-between">
                  <div>
                    {/* Header (Company & Role) */}
                    <div className="flex flex-col gap-1.5">
                      <h4 className="font-['Outfit'] font-bold text-[24px] sm:text-[28px] md:text-[36px] text-[#f4f4f4] uppercase tracking-tight leading-none">
                        {exp.company}
                      </h4>
                      <h5 className="font-['Outfit'] text-[16px] sm:text-[18px] md:text-[20px] text-[#e5e5e5] font-medium tracking-wide">
                        {exp.role}
                      </h5>
                    </div>

                    <p className="font-['Outfit'] text-[13px] sm:text-[14px] md:text-[16px] leading-[1.8] font-light text-[#b3b3b3] max-w-[600px] mt-4 sm:mt-6 mb-2">
                      {exp.summary}
                    </p>
                  </div>

                  <div>
                    {/* Metadata */}
                    <p className="font-['Outfit'] text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.2em] md:tracking-[0.25em] text-[#666] uppercase">
                      {exp.metadata}
                    </p>

                    {/* CTA */}
                    {exp.link && (
                      <Link 
                        to={exp.link}
                        className="mt-4 flex items-center gap-3 font-['Outfit'] text-[10px] md:text-[11px] font-semibold tracking-[0.2em] text-[#f4f4f4] uppercase transition-all duration-300 hover:text-[#16a34a] w-fit group/cta"
                      >
                        VIEW PROJECT 
                        <span className="transition-transform duration-300 group-hover/cta:translate-x-1.5">→</span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Logo Watermark */}
                {exp.logo && (
                  <div className="absolute -right-10 -bottom-10 md:relative md:right-0 md:bottom-0 flex flex-shrink-0 items-center justify-center w-[200px] sm:w-[250px] md:w-[150px] lg:w-[180px] xl:w-[200px] 2xl:w-[250px] pointer-events-none select-none md:pl-4 transition-all duration-700 opacity-[0.08] md:opacity-90 group-hover:opacity-[0.15] md:group-hover:opacity-100 mix-blend-screen drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_25px_rgba(255,255,255,0.2)] z-0">
                    <img 
                      src={exp.logo} 
                      alt="" 
                      className={`w-full h-auto object-contain ${exp.logoClass || "brightness-0 invert"}`}
                      draggable="false"
                    />
                  </div>
                )}
              </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
