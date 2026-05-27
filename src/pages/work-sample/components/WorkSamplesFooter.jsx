import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, Check } from "lucide-react";

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

export function WorkSamplesFooter() {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleCopy = (e, value, type) => {
    e.preventDefault();
    navigator.clipboard.writeText(value);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 1800);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 1800);
    }
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

          <button 
            onClick={(e) => handleCopy(e, "+14372494834", "phone")}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-green-500/40 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)] transition-all duration-300 group relative"
            title="Copy Phone"
          >
            <AnimatePresence>
              {copiedPhone && (
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
              {copiedPhone ? (
                <motion.div
                  key="check"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center text-green-500"
                >
                  <Check className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="phone"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center text-[#8a8a8a] group-hover:text-green-500 transition-colors duration-300"
                >
                  <Phone className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
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
