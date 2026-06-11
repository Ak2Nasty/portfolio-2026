import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, Check, ChevronUp } from "lucide-react";

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

export function WorkSamplesFooter() {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopy = (e, value, type) => {
    e.preventDefault();
    navigator.clipboard.writeText(value);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 1800);
    }
  };

  const [phoneMenuOpen, setPhoneMenuOpen] = useState(false);
  const [copiedPhoneId, setCopiedPhoneId] = useState(null);
  const phoneMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (phoneMenuRef.current && !phoneMenuRef.current.contains(event.target)) {
        setPhoneMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const phoneNumbers = [
    { id: "can", flag: "https://flagcdn.com/ca.svg", value: "+1 (437) 249-4834", href: "tel:+14372494834" },
    { id: "ind", flag: "https://flagcdn.com/in.svg", value: "+91 9894615404", href: "tel:+919894615404" }
  ];

  const handleNumberClick = (e, numObj) => {
    e.preventDefault();
    e.stopPropagation();
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      window.location.href = numObj.href;
      return;
    }
    navigator.clipboard.writeText(numObj.value);
    setCopiedPhoneId(numObj.id);
    setTimeout(() => setCopiedPhoneId(null), 1800);
  };

  return (
    <footer className="w-full bg-[#0C0C0B] border-t border-white/[0.05] pt-12 pb-24 md:pt-16 md:pb-28 relative z-20">
      <div className="max-w-[80rem] mx-auto px-6 md:px-12 flex flex-col items-center gap-10">
        
        {/* Contact Links */}
        <div className="flex items-center gap-6 md:gap-8 mt-2">
          <button 
            onClick={(e) => handleCopy(e, "akshath4000@gmail.com", "email")}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-red-500/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all duration-300 group relative"
            title="Copy Email"
          >
            <AnimatePresence>
              {copiedEmail && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.8 }}
                  className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#1a1a1a] border border-[#333] text-gray-300 text-[9px] md:text-[10px] uppercase tracking-[0.15em] font-semibold py-1.5 px-3 rounded shadow-[0_0_20px_rgba(0,0,0,0.5)] pointer-events-none z-50"
                >
                  Copied to clipboard
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
              {copiedEmail ? (
                <motion.div
                  key="check"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center text-red-500"
                >
                  <Check className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="mail"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center text-[#8a8a8a] group-hover:text-red-500 transition-colors duration-300"
                >
                  <Mail className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
          
          <a 
            href="https://linkedin.com/in/akshathdayan"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-12 h-12 rounded-full bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-sky-400/40 hover:shadow-[0_0_15px_rgba(56,189,248,0.2)] transition-all duration-300 group"
            title="LinkedIn"
          >
            <LinkedinIcon className="w-5 h-5 text-[#8a8a8a] group-hover:text-sky-400 transition-colors duration-300" />
          </a>

          <a 
            href="https://wa.me/16475212708"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-12 h-12 rounded-full bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-green-500/40 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)] transition-all duration-300 group relative"
            title="WhatsApp"
          >
            <WhatsAppIcon className="w-5 h-5 text-[#8a8a8a] group-hover:text-green-500 transition-colors duration-300" />
          </a>

          <div ref={phoneMenuRef} className="relative">
            <AnimatePresence>
              {phoneMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-[calc(100%+16px)] left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-[#333] rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] p-2 w-[220px] z-50 flex flex-col gap-1"
                >
                  {phoneNumbers.map((num) => (
                    <button
                      key={num.id}
                      onClick={(e) => handleNumberClick(e, num)}
                      className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg hover:bg-white/[0.05] transition-colors group/num"
                    >
                      <div className="flex items-center gap-2 text-gray-300 group-hover/num:text-white transition-colors">
                        <span className="flex items-center justify-center w-[16px]"><img src={num.flag} alt="flag" className="w-full rounded-[2px]" /></span>
                        <span className="font-['Outfit'] text-[12px] md:text-[13px] font-medium truncate">{num.value}</span>
                      </div>
                      <div className="w-4 flex items-center justify-center">
                        {copiedPhoneId === num.id && <Check className="w-3.5 h-3.5 text-purple-500" strokeWidth={3} />}
                      </div>
                    </button>
                  ))}
                  {/* Triangle pointer */}
                  <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1a1a1a] border-b border-r border-[#333] rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>
            
            <button 
              onClick={() => setPhoneMenuOpen(!phoneMenuOpen)}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-purple-500/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all duration-300 group relative"
              title="Phone Numbers"
            >
              <Phone className="w-5 h-5 text-[#8a8a8a] group-hover:text-purple-500 transition-colors duration-300" />
            </button>
          </div>
        </div>

        {/* Closing Statement */}
        <div className="text-center flex flex-col items-center gap-4">
          <p className="font-['Outfit'] text-[10px] md:text-[11px] tracking-[0.15em] text-[#8a8a8a] uppercase">
            Brought to you by <span className="text-white font-semibold">#VibeCoding<motion.span animate={{ opacity: [1, 1, 0, 0, 1] }} transition={{ repeat: Infinity, duration: 1, times: [0, 0.49, 0.5, 0.99, 1] }} className="ml-[2px] font-mono font-bold text-gray-300">_</motion.span></span>
          </p>
          <p className="font-['Outfit'] text-[10px] md:text-[11px] tracking-[0.25em] text-[#a3a3a3] uppercase font-medium">
            BUILT THROUGH PRECISE EXECUTION, RELENTLESS CREATIVITY, AND CONSTANT LEARNING.
          </p>
          <p className="font-['Outfit'] text-[9px] md:text-[10px] tracking-[0.2em] text-[#a3a3a3]/40 uppercase mt-2">
            © {new Date().getFullYear()} AKSHATHDAYAN SURESH. ALL RIGHTS RESERVED.
          </p>
        </div>

      </div>
    </footer>
  );
}
