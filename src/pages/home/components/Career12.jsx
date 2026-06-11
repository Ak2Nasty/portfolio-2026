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
      summary: [
        "Led a global vendor transition project, delivering a <strong class=\"font-medium text-[#f4f4f4]\">30% reduction</strong> in event costs.",
        "Analyzed pipeline data using <strong class=\"font-medium text-[#f4f4f4]\">Power BI</strong> to optimize targeted outreach and post-event engagement.",
        "Orchestrated end-to-end logistics for hybrid trade shows and cross-channel campaigns."
      ],
      metadata: "VANCOUVER, BC • CO-OP • SEP 2023 - DEC 2023",
      link: "/work-sample#d2l"
    },
    {
      company: "OKHC",
      logo: "/okhc-logo-transparent.png",
      logoClass: "brightness-0 invert",
      role: "Marketing & Communications Consultant",
      summary: [
        "Conducted a comprehensive <strong class=\"font-medium text-[#f4f4f4]\">marketing audit</strong> and designed an organic and paid social media strategy.",
        "Delivered a <strong class=\"font-medium text-[#f4f4f4]\">full website redesign mockup</strong>, including an AI chatbot, gallery, and contact architecture.",
        "Produced government-facing fact sheets and directed communications for board-level stakeholders."
      ],
      metadata: "KELOWNA, BC • UBC CAPSTONE • JAN 2025 - APR 2025",
      link: "/work-sample#okhc"
    },
    {
      company: "Foot Locker",
      logo: "/footlocker-seeklogo.png",
      logoClass: "grayscale invert contrast-200",
      role: "Sales Associate",
      summary: [
        "Maintained consistent high-volume transactions in a <strong class=\"font-medium text-[#f4f4f4]\">fast-paced retail environment</strong>.",
        "Delivered client-focused communication to provide clear, effective <strong class=\"font-medium text-[#f4f4f4]\">product recommendations</strong>.",
        "Supported operational execution by organizing inventory and upholding <strong class=\"font-medium text-[#f4f4f4]\">visual merchandising standards</strong>."
      ],
      metadata: "KELOWNA, BC • RETAIL OPERATIONS • NOV 2025 - PRESENT",
      link: null
    },
    {
      company: "UBC MSA",
      logo: "/msa-logo.png",
      logoClass: "grayscale invert contrast-200",
      role: "President, Marketing Club",
      summary: [
        "Developed external sponsorships and coordinated <strong class=\"font-medium text-[#f4f4f4]\">co-branded benefits</strong> across promotional channels.",
        "Directed digital content and social media strategy, producing brand-aligned materials using <strong class=\"font-medium text-[#f4f4f4]\">Photoshop and Canva</strong>.",
        "Organized campus-wide events and workshops, managing budgets and timelines across a <strong class=\"font-medium text-[#f4f4f4]\">four-member team</strong>."
      ],
      metadata: "KELOWNA, BC • STUDENT LEADERSHIP • AUG 2022 - APR 2023",
      link: "/work-sample#marketing-club"
    },
    {
      company: "Nestlé Nespresso",
      logo: "/nespresso-idr.svg",
      logoClass: "brightness-0 invert",
      role: "Sales Associate",
      summary: [
        "Delivered personalized product messaging and live demonstrations, contributing to an <strong class=\"font-medium text-[#f4f4f4]\">8% increase in sales</strong>.",
        "Designed and maintained brand-aligned visual merchandising to drive <strong class=\"font-medium text-[#f4f4f4]\">consumer engagement</strong>.",
        "Leveraged front-line customer insights to tailor recommendations and resolve inquiries."
      ],
      metadata: "KELOWNA, BC • CONSUMER ENGAGEMENT • NOV 2022 - APR 2023",
      link: "/work-sample#nespresso"
    },
    {
      company: "CUBS Vancouver",
      logo: "/cubs-logo.png",
      logoClass: "grayscale invert contrast-200 scale-[1.7] origin-right translate-x-20",
      role: "Graphic Designer",
      summary: [
        "Developed content strategies and wrote high-converting <strong class=\"font-medium text-[#f4f4f4]\">copy</strong> for social media campaigns.",
        "Designed engaging social media visuals using <strong class=\"font-medium text-[#f4f4f4]\">Photoshop and Illustrator</strong> to align with campaign goals.",
        "Promoted tutoring and education services specifically targeted toward <strong class=\"font-medium text-[#f4f4f4]\">underserved communities</strong>."
      ],
      metadata: "VANCOUVER, BC (REMOTE) • CREATIVE MARKETING • AUG 2022 - DEC 2022",
      link: "/work-sample#cubs"
    },
    {
      company: "Mindtree",
      logo: "/mindtree-logo.svg",
      logoClass: "brightness-0 invert",
      role: "Acquisitions Student Intern",
      summary: [
        "Developed post-acquisition internal communications to ensure consistent messaging during <strong class=\"font-medium text-[#f4f4f4]\">organizational change</strong>.",
        "Conducted stakeholder analysis and industry research to identify risks and support <strong class=\"font-medium text-[#f4f4f4]\">executive decision-making</strong>.",
        "Collaborated cross-functionally to streamline policy updates, contributing to a <strong class=\"font-medium text-[#f4f4f4]\">5% reduction in employee attrition</strong>."
      ],
      metadata: "BANGALORE, INDIA • CORPORATE STRATEGY • SEP 2019 - JAN 2020",
      link: "/work-sample#mindtree"
    },
    {
      company: "EssEmm Corporation",
      logo: "/essemm-logo.svg",
      logoClass: "brightness-0 invert",
      role: "Marketing Student Intern",
      summary: [
        "Conducted primary research through executive interviews and surveys to identify <strong class=\"font-medium text-[#f4f4f4]\">marketing strategy gaps</strong>.",
        "Analyzed four years of financial data to assess portfolio performance and <strong class=\"font-medium text-[#f4f4f4]\">growth opportunities</strong>.",
        "Presented data-driven recommendations to improve distribution, including an <strong class=\"font-medium text-[#f4f4f4]\">e-commerce application proposal</strong>."
      ],
      metadata: "COIMBATORE, INDIA • MARKETING STRATEGY • JUN 2019 - SEP 2019",
      link: "/work-sample#essemm"
    },
    {
      company: "Shure",
      logo: "/shure-logo.svg",
      logoClass: "brightness-0 invert scale-[2] md:scale-100 origin-bottom-right -translate-y-4 -translate-x-4 md:translate-y-0 md:translate-x-0",
      role: "1st Place Winner",
      summary: [
        "Developed an <strong class=\"font-medium text-[#f4f4f4]\">award-winning</strong> strategic marketing proposal for Shure's expansion in India.",
        "Analyzed target demographics and competitors to recommend highly <strong class=\"font-medium text-[#f4f4f4]\">localized sales strategies</strong>."
      ],
      metadata: "BANGALORE, INDIA • ACADEMIC PROJECT • MAR 2019",
      link: "/work-sample#shure"
    },
    {
      company: "Your Company Here",
      role: "Next Great Opportunity",
      isHighlight: true,
      summary: [
        "Ready to bring relentless execution and strategic vision to <strong class=\"font-medium text-[#f4f4f4]\">your team</strong>.",
        "Prepared to drive growth, solve complex challenges, and deliver <strong class=\"font-medium text-[#f4f4f4]\">high-impact results</strong>.",
        "Currently seeking opportunities to leverage my diverse background for your organization's <strong class=\"font-medium text-[#f4f4f4]\">next big win</strong>."
      ],
      metadata: "AVAILABLE FOR IMPACT • READY TO EXECUTE • 2026 & BEYOND",
      link: null
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
          <motion.div variants={itemVariants} className="w-full lg:w-[35%] flex flex-col gap-6 md:gap-8 justify-start lg:sticky lg:top-[15vh] h-fit">
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
              className="group relative flex items-center justify-center gap-3 w-fit px-8 py-3.5 bg-white text-black rounded-full overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:bg-gray-100 hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] cursor-pointer"
            >
              <span className="relative z-10 font-['Outfit'] text-[11px] tracking-[0.2em] font-bold uppercase transition-colors">
                View Work Samples
              </span>
              <span className="relative z-10 transition-all duration-300 group-hover:translate-x-1 font-bold">
                →
              </span>
            </Link>
          </motion.div>
          
          {/* Right: Experience List */}
          <div className="w-full lg:w-[60%] flex flex-col relative" style={{ paddingBottom: '25vh' }}>
            {experiences.map((exp, index) => {
              const topOffset = `calc(15vh + ${index * 20}px)`;
              return (
              <motion.div 
                key={index}
                variants={itemVariants}
                style={{ top: topOffset, zIndex: index }}
                className={`group sticky flex flex-row justify-between items-stretch ${exp.isHighlight ? 'bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(255,255,255,0.03)] hover:bg-white/[0.05] hover:border-white/[0.12] hover:shadow-[0_8px_32px_rgba(255,255,255,0.06)]' : 'bg-[#0a0a0a] border border-[#2a2a2a] shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]'} rounded-2xl p-6 sm:p-8 lg:p-10 2xl:p-12 mb-[10vh] lg:mb-[25vh] h-auto lg:h-[450px] min-h-[400px] overflow-hidden transition-all duration-500`}
              >
                <div className="flex flex-col gap-5 flex-1 relative z-10 justify-between">
                  <div>
                    {/* Header (Company & Role) */}
                    <div className="flex flex-col gap-1.5">
                      <h4 className={`font-['Outfit'] font-bold text-[24px] sm:text-[28px] md:text-[36px] ${exp.isHighlight ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'text-[#f4f4f4]'} uppercase tracking-tight leading-none`}>
                        {exp.company}
                      </h4>
                      <h5 className={`font-['Outfit'] text-[16px] sm:text-[18px] md:text-[20px] ${exp.isHighlight ? 'text-[#e5e5e5]' : 'text-[#e5e5e5]'} font-medium tracking-wide`}>
                        {exp.role}
                      </h5>
                    </div>

                    <ul className="flex flex-col gap-2 mt-4 mb-2">
                      {exp.summary.map((point, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className={`${exp.isHighlight ? 'text-[#16a34a] opacity-80' : 'text-[#16a34a]'} mt-[4px] text-[10px]`}>▹</span>
                          <span 
                            className={`font-['Outfit'] text-[13px] sm:text-[14px] md:text-[16px] leading-[1.6] font-light ${exp.isHighlight ? 'text-[#c4c4c4]' : 'text-[#b3b3b3]'} max-w-[600px]`}
                            dangerouslySetInnerHTML={{ __html: point }} 
                          />
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-4 mt-auto pt-6">
                    {/* CTA */}
                    {exp.link && (
                      <Link 
                        to={exp.link}
                        className="flex items-center gap-3 font-['Outfit'] text-[10px] md:text-[11px] font-semibold tracking-[0.2em] text-[#f4f4f4] uppercase transition-all duration-300 border border-white/20 rounded-full px-6 py-2.5 hover:bg-white hover:text-black hover:border-white hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] w-fit group/cta"
                      >
                        VIEW PROJECT 
                        <span className="transition-transform duration-300 group-hover/cta:translate-x-1.5 font-bold">→</span>
                      </Link>
                    )}

                    {/* Metadata */}
                    <p className={`font-['Outfit'] text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.2em] md:tracking-[0.25em] uppercase ${exp.isHighlight ? 'text-[#777]' : 'text-[#666]'}`}>
                      {exp.metadata}
                    </p>
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
