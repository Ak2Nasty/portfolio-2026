"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef } from "react";

const useScrollAnimation = () => {
  const sectionRef = useRef();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const headingTranslate = useTransform(
    scrollYProgress,
    [0, 1],
    ["-50%", "0%"],
  );

  return {
    sectionRef,
    headingTranslate,
  };
};

export function Banner14() {
  const useAnimations = useScrollAnimation();
  return (
    <section
      id="relume"
      ref={useAnimations.sectionRef}
      className="overflow-hidden"
      ref={useAnimations.sectionRef}
    >
      <div className="flex whitespace-nowrap border-b border-t border-border-primary">
        <div className="flex w-full items-center overflow-hidden whitespace-nowrap py-4">
          <motion.div
            className="ml-12 grid auto-cols-max grid-flow-col grid-cols-[max-content] gap-12"
            style={{ x: useAnimations.headingTranslate }}
          >
            <h1 className="text-md font-bold md:text-lg">Growth strategy</h1>
            <h1 className="text-md font-bold md:text-lg">Growth strategy</h1>
            <h1 className="text-md font-bold md:text-lg">Growth strategy</h1>
            <h1 className="text-md font-bold md:text-lg">Growth strategy</h1>
            <h1 className="text-md font-bold md:text-lg">Growth strategy</h1>
          </motion.div>
          <motion.div
            className="ml-12 grid auto-cols-max grid-flow-col grid-cols-[max-content] gap-12"
            style={{ x: useAnimations.headingTranslate }}
          >
            <h1 className="text-md font-bold md:text-lg">Growth strategy</h1>
            <h1 className="text-md font-bold md:text-lg">Growth strategy</h1>
            <h1 className="text-md font-bold md:text-lg">Growth strategy</h1>
            <h1 className="text-md font-bold md:text-lg">Growth strategy</h1>
            <h1 className="text-md font-bold md:text-lg">Growth strategy</h1>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
