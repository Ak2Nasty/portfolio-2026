import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

export function Loader() {
  const location = useLocation();
  const validRoutes = ["/", "/work-sample"];
  const is404 = !validRoutes.includes(location.pathname);
  const [isLoading, setIsLoading] = useState(!is404);
  const [loadingText, setLoadingText] = useState("INITIALIZING KERNEL...");

  useEffect(() => {
    if (is404) return; // Don't run loader logic on 404 page

    // Prevent scrolling while loading
    document.body.style.overflow = "hidden";
    
    // Hide the loader after 2 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = "auto";
    }, 2000);

    const texts = [
      "INITIALIZING KERNEL...",
      "LOADING ASSETS...",
      "DECRYPTING DATA...",
      "COMPILING BUNDLE...",
      "ESTABLISHING CONNECTION...",
      "ACCESS GRANTED."
    ];
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < texts.length) {
        setLoadingText(texts[step]);
      } else {
        clearInterval(interval);
      }
    }, 300); // 6 texts * 300ms = 1800ms (fits inside the 2000ms loader)

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      document.body.style.overflow = "auto";
    };
  }, [is404]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loader"
          initial={{ y: 0 }}
          exit={{ 
            y: "-100vh",
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 } 
          }}
          className="fixed inset-0 z-[999999] bg-[#0C0C0B] flex items-center justify-center pointer-events-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-4"
          >
            <h1 className="font-monument text-[28px] sm:text-[36px] md:text-[50px] font-bold text-[#f4f4f4] tracking-[0.2em] uppercase">
              WELCOME
            </h1>
            <motion.div
              initial={{ 
                borderColor: "rgba(255, 255, 255, 0.05)",
                boxShadow: "0 0 0px rgba(255, 255, 255, 0)"
              }}
              animate={{ 
                borderColor: "rgba(255, 255, 255, 0.8)",
                boxShadow: "0 0 20px rgba(255, 255, 255, 0.2)"
              }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="w-full h-1.5 md:h-2 bg-white/[0.05] rounded-full mt-2 relative border overflow-hidden"
            >
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute top-0 left-0 h-full bg-white rounded-full"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-2 text-center"
            >
              <span className="font-['Outfit'] text-[8px] md:text-[9px] tracking-[0.25em] text-[#888] uppercase">
                {loadingText}
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
