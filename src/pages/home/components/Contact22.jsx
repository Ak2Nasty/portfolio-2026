"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Mail, Phone, ArrowUpRight, Check } from "lucide-react";

const LinkedinIcon = ({ className, strokeWidth = 1.5 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const WhatsAppIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
};

const contactItems = [
  {
    label: "EMAIL",
    value: "akshath4000@gmail.com",
    copyValue: "akshath4000@gmail.com",
    mobileHref: "mailto:akshath4000@gmail.com",
    subtext: "Typically responds within 24 hours.",
    icon: Mail,
    styles: {
      "--brand-glow": "rgba(239, 68, 68, 0.03)",
      "--brand-border": "rgba(239, 68, 68, 0.4)",
      "--brand-border-glow": "rgba(239, 68, 68, 0.25)",
      "--brand-icon": "rgba(239, 68, 68, 0.9)",
    },
  },
  {
    label: "LINKEDIN",
    value: "linkedin.com/in/akshathdayan",
    href: "https://linkedin.com/in/akshathdayan",
    subtext: "Professional background, experience and networking.",
    icon: LinkedinIcon,
    styles: {
      "--brand-glow": "rgba(56, 189, 248, 0.03)",
      "--brand-border": "rgba(56, 189, 248, 0.4)",
      "--brand-border-glow": "rgba(56, 189, 248, 0.25)",
      "--brand-icon": "rgba(56, 189, 248, 0.9)",
    },
  },
  {
    label: "WHATSAPP",
    value: "+1 (647) 521 - 2708",
    href: "https://wa.me/16475212708",
    subtext: "Voice call or direct message.",
    icon: WhatsAppIcon,
    styles: {
      "--brand-glow": "rgba(34, 197, 94, 0.03)",
      "--brand-border": "rgba(34, 197, 94, 0.4)",
      "--brand-border-glow": "rgba(34, 197, 94, 0.25)",
      "--brand-icon": "rgba(34, 197, 94, 0.9)",
    },
  },
  {
    label: "PHONE",
    numbers: [
      { flag: "🇨🇦", value: "+1 (437) 249-4834", mobileHref: "tel:+14372494834" },
      { flag: "🇮🇳", value: "+91 9894615404", mobileHref: "tel:+919894615404" }
    ],
    subtext: "Canadian and Indian direct lines.",
    icon: Phone,
    styles: {
      "--brand-glow": "rgba(168, 85, 247, 0.03)",
      "--brand-border": "rgba(168, 85, 247, 0.4)",
      "--brand-border-glow": "rgba(168, 85, 247, 0.25)",
      "--brand-icon": "rgba(168, 85, 247, 0.9)",
    },
  },
];

function ContactCard({ item }) {
  const [copied, setCopied] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const cardRef = useRef(null);
  const Icon = item.icon;

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  const handleCopy = (e) => {
    if (item.numbers) return;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile && item.mobileHref) {
      window.location.href = item.mobileHref;
      return;
    }

    if (item.copyValue) {
      e.preventDefault();
      navigator.clipboard.writeText(item.copyValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleNumberCopy = (e, numObj) => {
    e.stopPropagation();
    e.preventDefault();
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      window.location.href = numObj.mobileHref;
      return;
    }

    navigator.clipboard.writeText(numObj.value);
    setCopiedId(numObj.value);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const cardContent = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 relative z-10 pointer-events-none w-full">
      
      {/* Left: Icon + Label + Subtext */}
      <div className="flex items-start sm:items-center gap-4 sm:gap-5 w-full sm:w-auto">
        <div className="p-3 md:p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] group-hover:border-white/[0.1] transition-colors duration-500 shrink-0 mt-0.5 sm:mt-0">
          <Icon
            className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-[var(--brand-icon)] transition-colors duration-500"
            strokeWidth={1.5}
          />
        </div>
        <div className="flex flex-col">
          <span className="font-['Outfit'] font-semibold text-[11px] md:text-[12px] tracking-[0.2em] text-gray-300 group-hover:text-white transition-colors uppercase">
            {item.label}
          </span>
          <span className="font-['Outfit'] text-[10px] md:text-[11px] text-gray-400 font-light tracking-wide mt-1">
            {item.subtext}
          </span>
        </div>
      </div>
      
      {/* Right: Value + Arrow */}
      <div className={`flex items-center justify-between sm:justify-end gap-6 sm:gap-8 w-full sm:w-auto pl-[52px] sm:pl-0 ${item.numbers ? 'pointer-events-auto' : ''}`}>
        <div className={`relative w-full sm:w-[220px] md:w-[280px] flex ${item.numbers ? 'flex-col items-start sm:items-end gap-2' : 'h-6 items-center justify-start sm:justify-end'} overflow-hidden`}>
          {item.numbers ? (
            item.numbers.map((num, idx) => (
              <div 
                key={idx} 
                onClick={(e) => handleNumberCopy(e, num)}
                className="group/num relative flex items-center justify-end w-full cursor-pointer"
              >
                <AnimatePresence mode="wait">
                  {copiedId !== num.value ? (
                    <motion.span
                      key={`val-${idx}`}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="font-['Outfit'] text-[14px] sm:text-[15px] md:text-[16px] font-medium text-gray-300 group-hover/num:text-white transition-colors duration-300 truncate flex items-center gap-2"
                    >
                      <span className="text-[14px] sm:text-[16px]">{num.flag}</span> {num.value}
                    </motion.span>
                  ) : (
                    <motion.span
                      key={`cop-${idx}`}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="font-['Outfit'] text-[12px] sm:text-[13px] font-semibold text-[var(--brand-icon)] tracking-wider flex items-center gap-1.5 uppercase h-[24px]"
                    >
                      <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> Copied
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            ))
          ) : (
            <AnimatePresence mode="wait">
              {!copied ? (
                <motion.span
                  key="value"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute left-0 sm:left-auto sm:right-0 font-['Outfit'] text-[14px] sm:text-[15px] md:text-[16px] font-medium text-gray-300 group-hover:text-white transition-colors duration-300 truncate"
                >
                  {item.value}
                </motion.span>
              ) : (
                <motion.span
                  key="copied"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute left-0 sm:left-auto sm:right-0 font-['Outfit'] text-[12px] sm:text-[13px] font-semibold text-[var(--brand-icon)] tracking-wider flex items-center justify-start sm:justify-end gap-1.5 uppercase"
                >
                  <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> Copied
                </motion.span>
              )}
            </AnimatePresence>
          )}
        </div>
        {!item.numbers && (
          <ArrowUpRight className="w-5 h-5 text-gray-600 group-hover:text-gray-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300 shrink-0" />
        )}
      </div>
    </div>
  );

  const sharedProps = {
    ref: cardRef,
    onMouseMove: handleMouseMove,
    variants: fadeUp,
    whileHover: { y: -3, scale: 1.01 },
    transition: { type: "spring", stiffness: 200, damping: 20 },
    style: item.styles,
    className: "group relative block px-6 py-5 md:px-8 md:py-6 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] backdrop-blur-md overflow-hidden transition-[background,border-color,box-shadow] duration-500 hover:border-[var(--brand-border)] hover:shadow-[0_0_25px_var(--brand-border-glow)] select-none text-left w-full cursor-pointer"
  };

  return (
    <>
      {item.href ? (
        <motion.a
          {...sharedProps}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="absolute inset-0 bg-[radial-gradient(300px_circle_at_var(--mouse-x,0px)_var(--mouse-y,0px),var(--brand-glow),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out pointer-events-none" />
          {cardContent}
        </motion.a>
      ) : (
        <motion.div
          {...sharedProps}
          onClick={handleCopy}
        >
          <div className="absolute inset-0 bg-[radial-gradient(300px_circle_at_var(--mouse-x,0px)_var(--mouse-y,0px),var(--brand-glow),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out pointer-events-none" />
          {cardContent}
        </motion.div>
      )}
    </>
  );
}

export function Contact22() {
  const sectionRef = useRef(null);
  const [isTalkHovered, setIsTalkHovered] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 85%", "center center"]
  });

  const challengeLineWidth = useTransform(scrollYProgress, [0, 0.7], ["0%", "100%"]);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="w-full bg-[#0C0C0B] relative z-20 text-white py-24 xl:py-36 overflow-hidden border-t border-white/[0.05]"
    >


      <div className="max-w-[120rem] mx-auto px-6 md:px-12 lg:px-16 relative z-10">
        
        {/* ── HEADER ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-8%" }}
          variants={containerVariants}
          className="mb-10 xl:mb-12"
        >
          {/* Label + Pulsing Availability Status Indicator */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
            <motion.span
              variants={fadeUp}
              className="font-['Outfit'] font-semibold text-[10px] md:text-[11px] tracking-[0.25em] text-[#a3a3a3] uppercase"
            >
              CONTACT / 05
            </motion.span>
            
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-2 md:gap-3 border border-[#166534] rounded-full px-3 py-1 md:px-4 md:py-1.5 bg-transparent shadow-[0_0_15px_rgba(34,197,94,0.2)] hover:shadow-[0_0_25px_rgba(34,197,94,0.35)] transition-shadow duration-500 cursor-default"
            >
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
              <span className="font-['Outfit'] text-[9px] md:text-[10px] uppercase tracking-widest text-[#22c55e] pt-[1px] md:pt-[2px]">
                AVAILABLE FOR WORK
              </span>
            </motion.div>
          </div>

          <motion.h2
            variants={fadeUp}
            className="font-monument text-[28px] sm:text-[36px] md:text-[42px] xl:text-[50px] font-bold leading-[1.3] text-[#f4f4f4] tracking-[0.03em] uppercase max-w-none mb-6"
          >
            IN PURSUIT OF WHAT'S NEXT.{" "}
            <motion.span 
              className="cursor-pointer bg-clip-text whitespace-nowrap"
              style={{ 
                color: "#f4f4f4", 
                backgroundImage: "linear-gradient(90deg, #666 0%, #f4f4f4 30%, #ffffff 50%, #f4f4f4 70%, #666 100%)",
                backgroundSize: "200% auto"
              }}
              initial={{ backgroundPosition: "200% center" }}
              whileHover={{ 
                color: "rgba(244, 244, 244, 0)",
                backgroundPosition: "-200% center",
                transition: { 
                  backgroundPosition: { duration: 3, ease: "linear", repeat: Infinity }, 
                  color: { duration: 0.4 } 
                }
              }}
            >
              LET'S TALK?
            </motion.span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="font-['Outfit'] text-[12px] md:text-[13px] leading-[1.7] font-medium tracking-[0.12em] text-[#8a8a8a] uppercase max-w-[800px]"
          >
            OPEN TO ALL THINGS MARKETING - WHETHER IT'S A BIG IDEA, A NEW ROLE, OR A FRESH COLLABORATION — MY INBOX IS ALWAYS OPEN.
          </motion.p>
        </motion.div>

        {/* ── CARDS GRID ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-8%" }}
          variants={containerVariants}
          className="flex flex-col gap-4 relative z-10"
        >
          {contactItems.map((item) => (
            <ContactCard key={item.label} item={item} />
          ))}
        </motion.div>

        {/* ── CLOSING STATEMENT ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-4%" }}
          variants={containerVariants}
          className="mt-20 xl:mt-28 text-center flex flex-col items-center gap-5"
        >
          <motion.p
            variants={fadeUp}
            className="font-['Outfit'] text-[11px] md:text-[12px] tracking-[0.15em] text-[#8a8a8a] uppercase"
          >
            Brought to you by <span className="text-white font-semibold">#VibeCoding<motion.span animate={{ opacity: [1, 1, 0, 0, 1] }} transition={{ repeat: Infinity, duration: 1, times: [0, 0.49, 0.5, 0.99, 1] }} className="ml-[2px] font-mono font-bold text-gray-300">_</motion.span></span>
          </motion.p>
          <motion.p
            variants={fadeUp}
            className="font-['Outfit'] text-[10px] md:text-[11px] tracking-[0.25em] text-[#a3a3a3] uppercase font-medium"
          >
            BUILT THROUGH PRECISE EXECUTION, RELENTLESS CREATIVITY, AND CONSTANT LEARNING.
          </motion.p>
          <motion.p
            variants={fadeUp}
            className="font-['Outfit'] text-[9px] md:text-[10px] tracking-[0.2em] text-[#a3a3a3]/40 uppercase mt-2"
          >
            © {new Date().getFullYear()} AKSHATHDAYAN SURESH. ALL RIGHTS RESERVED.
          </motion.p>
        </motion.div>

      </div>
    </section>
  );
}
