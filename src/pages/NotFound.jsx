import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Terminal } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="w-full min-h-[100svh] bg-[#0C0C0B] flex flex-col items-center justify-center relative overflow-hidden selection:bg-white/20">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/[0.03] blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center justify-center z-10 px-6 text-center"
      >
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
          <Terminal className="w-8 h-8 md:w-10 md:h-10 text-[#a3a3a3] relative z-10" />
        </div>
        
        <h1 className="font-monument text-[80px] md:text-[140px] leading-none text-[#f4f4f4] tracking-tight mb-4 select-none flex items-center justify-center gap-1">
          404
        </h1>
        
        <div className="font-['Outfit'] font-semibold text-[11px] md:text-[13px] tracking-[0.3em] text-[#a3a3a3] uppercase mb-4">
          PAGE CORRUPTED OR NOT FOUND
        </div>
        
        <p className="font-['Outfit'] text-[12px] md:text-[14px] text-[#666] mb-12 max-w-md">
          If issues persist, please email <a href="mailto:akshath4000@gmail.com" className="text-[#a3a3a3] hover:text-white transition-colors border-b border-transparent hover:border-white">akshath4000@gmail.com</a>
        </p>

        <Link 
          to="/"
          className="group relative px-8 py-4 bg-[#f4f4f4] text-[#0C0C0B] rounded-full font-['Outfit'] text-[11px] font-bold tracking-[0.2em] uppercase overflow-hidden hover:scale-105 transition-transform duration-300"
        >
          <span className="relative z-10">BACK TO HOME</span>
          <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
        </Link>
      </motion.div>
    </section>
  );
}
