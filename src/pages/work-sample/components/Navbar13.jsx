"use client";

import { Button, useMediaQuery } from "@relume_io/relume-ui";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

const useRelume = () => {
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 991px)");
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const openOnMobileDropdownMenu = () => {
    setIsDropdownOpen((prev) => !prev);
  };
  const openOnDesktopDropdownMenu = () => {
    !isMobile && setIsDropdownOpen(true);
  };
  const closeOnDesktopDropdownMenu = () => {
    !isMobile && setIsDropdownOpen(false);
  };
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const animateMobileMenu = isMobileMenuOpen ? "open" : "close";
  const animateDropdownMenu = isDropdownOpen ? "open" : "close";
  const animateDropdownMenuIcon = isDropdownOpen ? "rotate" : "initial";
  return {
    menuRef,
    buttonRef,
    toggleMobileMenu,
    openOnDesktopDropdownMenu,
    closeOnDesktopDropdownMenu,
    openOnMobileDropdownMenu,
    animateMobileMenu,
    animateDropdownMenu,
    animateDropdownMenuIcon,
  };
};

export function Navbar13() {
  const useActive = useRelume();
  return (
    <section
      id="relume"
      className="relative z-[999] mx-auto mt-5 flex w-full items-start justify-center bg-background-primary px-[5%] md:mt-6 lg:mx-[5%] lg:w-auto lg:px-0"
    >
      <div className="flex min-h-16 w-full items-center justify-between gap-4 border border-border-primary px-5 md:min-h-18 md:px-8 lg:w-auto">
        <a href="#">
          <img
            src="https://d22po4pjz3o32e.cloudfront.net/logo-image.svg"
            alt="Relume placeholder logo"
          />
        </a>
        <motion.div
          variants={{
            open: { height: "var(--height, 100vh)" },
            close: { height: "auto" },
          }}
          initial="close"
          exit="close"
          animate={useActive.animateMobileMenu}
          className="absolute left-0 right-0 top-full w-full overflow-hidden lg:static lg:left-auto lg:right-auto lg:top-auto lg:w-auto lg:overflow-visible lg:[--height:auto]"
        >
          <motion.div
            variants={{
              open: { y: 0 },
              close: { y: "var(--translate-y, -100%)" },
            }}
            animate={useActive.animateMobileMenu}
            initial="close"
            exit="close"
            transition={{ duration: 0.3 }}
            className="absolute left-0 right-0 top-0 mx-auto min-w-[200px] justify-self-center bg-background-primary px-[5%] text-center lg:static lg:inset-auto lg:mx-0 lg:px-0 lg:text-left lg:[--translate-y:0%]"
          >
            <div
              ref={useActive.menuRef}
              className="flex w-full flex-col border border-t-0 border-border-primary bg-background-primary p-5 md:p-8 lg:w-auto lg:flex-row lg:border-none lg:bg-none lg:p-0"
            >
              <a
                href="#"
                className="relative block py-3 text-center text-md lg:px-4 lg:py-2 lg:text-left lg:text-base"
              >
                About
              </a>
              <a
                href="#"
                className="relative block py-3 text-center text-md lg:px-4 lg:py-2 lg:text-left lg:text-base"
              >
                Experience
              </a>
              <a
                href="#"
                className="relative block py-3 text-center text-md lg:px-4 lg:py-2 lg:text-left lg:text-base"
              >
                Work Samples
              </a>
            </div>
          </motion.div>
        </motion.div>
        <div className="flex items-center justify-center gap-4">
          <Button title="Contact" size="sm">
            Contact
          </Button>
          <button
            ref={useActive.buttonRef}
            className="-mr-2 flex size-12 flex-col items-center justify-center justify-self-end lg:hidden"
            onClick={useActive.toggleMobileMenu}
          >
            <motion.span
              className="my-[3px] h-0.5 w-6 bg-black"
              animate={useActive.animateMobileMenu}
              variants={{
                open: {
                  translateY: 8,
                  rotate: 45,
                  transition: { duration: 0.3 },
                },
                close: {
                  translateY: 0,
                  rotate: 0,
                  transition: { duration: 0.2 },
                },
              }}
            />
            <motion.span
              className="my-[3px] h-0.5 w-6 bg-black"
              animate={useActive.animateMobileMenu}
              variants={{
                open: { opacity: 0, transition: { duration: 0.2 } },
                close: { opacity: 1, transition: { duration: 0.2 } },
              }}
            />
            <motion.span
              className="my-[3px] h-0.5 w-6 bg-black"
              animate={useActive.animateMobileMenu}
              variants={{
                open: {
                  translateY: -8,
                  rotate: -45,
                  transition: { duration: 0.3 },
                },
                close: {
                  translateY: 0,
                  rotate: 0,
                  transition: { duration: 0.2 },
                },
              }}
            />
          </button>
        </div>
      </div>
    </section>
  );
}
