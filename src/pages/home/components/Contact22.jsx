"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Mail, Phone, ArrowUpRight, Check, Loader2, AlertCircle } from "lucide-react";
import emailjs from "@emailjs/browser";

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
      { flag: "https://flagcdn.com/ca.svg", value: "+1 (437) 249-4834", mobileHref: "tel:+14372494834" },
      { flag: "https://flagcdn.com/in.svg", value: "+91 9894615404", mobileHref: "tel:+919894615404" }
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
                className="group/num relative flex items-center justify-start sm:justify-end w-full cursor-pointer"
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
                      <span className="flex items-center justify-center w-[18px]"><img src={num.flag} alt="flag" className="w-full rounded-[2px]" /></span> {num.value}
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

/* Floating Input Helper Component */
function FloatingInput({ label, id, type = "text", value, onChange, error, onFocus, onBlur, isFocused }) {
  const hasValue = value.length > 0;
  return (
    <div className="relative flex flex-col w-full mb-6">
      <div className="relative w-full">
        <motion.label
          htmlFor={id}
          animate={{
            y: isFocused || hasValue ? -22 : 0,
            scale: isFocused || hasValue ? 0.85 : 1,
            color: error ? "#ef4444" : isFocused ? "#ffffff" : "#888888",
          }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-0 top-3 pointer-events-none origin-left font-['Outfit'] text-[13px] md:text-[14px] tracking-wide"
        >
          {label}
        </motion.label>
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder=""
          className={`w-full bg-transparent border-b ${error ? 'border-red-500/80' : 'border-white/10'} py-3 text-white focus:border-white focus:outline-none transition-colors duration-300 font-['Outfit'] text-[14px] md:text-[15px]`}
        />
      </div>
      <AnimatePresence>
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-[10px] text-red-500 font-['Outfit'] tracking-wide mt-1.5 flex items-center gap-1 uppercase"
          >
            <AlertCircle className="w-3 h-3" /> {error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Floating Textarea Helper Component */
function FloatingTextarea({ label, id, value, onChange, error, onFocus, onBlur, isFocused, maxLength }) {
  const hasValue = value.length > 0;
  return (
    <div className="relative flex flex-col w-full mb-4">
      <div className="relative w-full">
        <motion.label
          htmlFor={id}
          animate={{
            y: isFocused || hasValue ? -22 : 0,
            scale: isFocused || hasValue ? 0.85 : 1,
            color: error ? "#ef4444" : isFocused ? "#ffffff" : "#888888",
          }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-0 top-3 pointer-events-none origin-left font-['Outfit'] text-[13px] md:text-[14px] tracking-wide"
        >
          {label}
        </motion.label>
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          maxLength={maxLength}
          rows={4}
          placeholder=""
          className={`w-full bg-transparent border-b ${error ? 'border-red-500/80' : 'border-white/10'} py-3 text-white focus:border-white focus:outline-none transition-colors duration-300 font-['Outfit'] text-[14px] md:text-[15px] resize-none`}
        />
      </div>
      <div className="flex justify-between items-center mt-1.5">
        <div>
          <AnimatePresence>
            {error && (
              <motion.span
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-[10px] text-red-500 font-['Outfit'] tracking-wide flex items-center gap-1 uppercase"
              >
                <AlertCircle className="w-3 h-3" /> {error}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <span className="text-[10px] text-gray-500 font-['Outfit'] tracking-wide">
          {value.length} / {maxLength}
        </span>
      </div>
    </div>
  );
}

export function Contact22() {
  const sectionRef = useRef(null);
  const formRef = useRef(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
  const [shake, setShake] = useState(false);
  const [particles, setParticles] = useState([]);

  // Fetch credentials from environmental variables or default template values
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_f0pekfg";
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_default";
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ""; // Set this up in deployment!

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 85%", "center center"]
  });

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const triggerParticles = () => {
    const newParticles = Array.from({ length: 15 }).map((_, i) => ({
      id: Math.random(),
      angle: (i * 360) / 15 + (Math.random() * 15 - 7.5),
      distance: Math.random() * 60 + 40,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1200);
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!form.name.trim()) tempErrors.name = "Name is required";
    if (!form.email.trim()) {
      tempErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      tempErrors.email = "Invalid email address";
    }
    if (!form.message.trim()) tempErrors.message = "Message cannot be empty";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (status === "loading") return;

    if (!validateForm()) {
      triggerShake();
      return;
    }

    setStatus("loading");

    // EmailJS sending or graceful local simulation fallback
    if (!publicKey) {
      console.warn("VITE_EMAILJS_PUBLIC_KEY is not defined. Simulating message dispatch...");
      setTimeout(() => {
        setStatus("success");
        triggerParticles();
        setForm({ name: "", email: "", message: "" });
        setTimeout(() => {
          setStatus("idle");
        }, 3000);
      }, 1500);
    } else {
      emailjs
        .send(
          serviceId,
          templateId,
          {
            from_name: form.name,
            reply_to: form.email,
            message: form.message,
            from_email: form.email,
          },
          publicKey
        )
        .then(() => {
          setStatus("success");
          triggerParticles();
          setForm({ name: "", email: "", message: "" });
          setTimeout(() => {
            setStatus("idle");
          }, 3000);
        })
        .catch((err) => {
          console.error("EmailJS Error: Failed to transmit message", err);
          setStatus("error");
          triggerShake();
          setTimeout(() => {
            setStatus("idle");
          }, 3000);
        });
    }
  };

  const handleMouseMoveForm = (e) => {
    const card = formRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--form-mouse-x", `${x}px`);
    card.style.setProperty("--form-mouse-y", `${y}px`);
  };

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
          className="mb-12 xl:mb-16"
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

        {/* ── SPLIT GRID LAYOUT (Option C) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10 items-stretch">
          
          {/* Left Column: Social/Contact Cards */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-8%" }}
            variants={containerVariants}
            className="flex flex-col gap-4 lg:col-span-5 justify-between"
          >
            {contactItems.map((item) => (
              <ContactCard key={item.label} item={item} />
            ))}
          </motion.div>

          {/* Right Column: Sleek Glass Contact Form */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-8%" }}
            variants={containerVariants}
            className="lg:col-span-7 flex"
          >
            <motion.div
              ref={formRef}
              onMouseMove={handleMouseMoveForm}
              variants={fadeUp}
              animate={shake ? { x: [0, -8, 8, -8, 8, -4, 4, 0], transition: { duration: 0.4 } } : { x: 0 }}
              className="group/form relative flex flex-col w-full p-6 md:p-8 lg:p-10 rounded-2xl bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] backdrop-blur-md overflow-hidden transition-[background,border-color] duration-500 w-full"
            >
              {/* Radial gradient spotlight on hover */}
              <div className="absolute inset-0 bg-[radial-gradient(400px_circle_at_var(--form-mouse-x,0px)_var(--form-mouse-y,0px),rgba(255,255,255,0.015),transparent_60%)] opacity-0 group-hover/form:opacity-100 transition-opacity duration-700 ease-out pointer-events-none" />

              <h3 className="font-['Outfit'] font-semibold text-[13px] md:text-[14px] tracking-[0.2em] text-[#a3a3a3] uppercase mb-8 border-b border-white/[0.05] pb-4 flex items-center justify-between">
                <span>SEND A DIRECT MESSAGE</span>
                <span className="text-[10px] text-gray-500 font-light lowercase">encrypted transmission</span>
              </h3>

              <form onSubmit={handleSubmit} className="flex flex-col flex-grow justify-between gap-2 relative z-10">
                <div className="flex flex-col sm:flex-row gap-0 sm:gap-6">
                  <FloatingInput
                    label="Name"
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    error={errors.name}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    isFocused={focusedField === "name"}
                  />
                  <FloatingInput
                    label="Email"
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    error={errors.email}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    isFocused={focusedField === "email"}
                  />
                </div>

                <FloatingTextarea
                  label="Message"
                  id="message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  error={errors.message}
                  onFocus={() => setFocusedField("message")}
                  onBlur={() => setFocusedField(null)}
                  isFocused={focusedField === "message"}
                  maxLength={1000}
                />

                {/* State Machine Send Button */}
                <div className="relative mt-4">
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className={`w-full relative flex items-center justify-center py-4 px-6 rounded-xl font-['Outfit'] text-[11px] md:text-[12px] font-semibold tracking-[0.25em] uppercase transition-all duration-500 select-none overflow-hidden ${
                      status === "loading"
                        ? "bg-white/5 border border-white/10 text-white/50 cursor-not-allowed"
                        : status === "success"
                        ? "bg-[#22c55e]/10 border border-[#22c55e]/40 text-[#22c55e]"
                        : status === "error"
                        ? "bg-red-500/10 border border-red-500/40 text-red-500"
                        : "bg-white text-black hover:bg-black hover:text-white border border-white hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {status === "loading" && (
                        <motion.span
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center"
                        >
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          TRANSMITTING...
                        </motion.span>
                      )}

                      {status === "success" && (
                        <motion.span
                          key="success"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center"
                        >
                          {/* Animated drawing checkmark */}
                          <motion.svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2"
                          >
                            <motion.path
                              d="M20 6L9 17L4 12"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 0.4, ease: "easeOut" }}
                            />
                          </motion.svg>
                          MESSAGE SENT!
                        </motion.span>
                      )}

                      {status === "error" && (
                        <motion.span
                          key="error"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center"
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          TRANSMISSION FAILED
                        </motion.span>
                      )}

                      {status === "idle" && (
                        <motion.span
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          SEND MESSAGE
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Particle burst animation on success */}
                    {particles.map((p) => (
                      <motion.span
                        key={p.id}
                        className="absolute w-2 h-2 rounded-full bg-[#22c55e] pointer-events-none"
                        style={{ left: "50%", top: "50%" }}
                        initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                        animate={{
                          x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
                          y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
                          scale: 0,
                          opacity: 0,
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    ))}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </div>

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
