"use client";

import { Button } from "@relume_io/relume-ui";
import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef } from "react";
import { RxChevronRight } from "react-icons/rx";

const useAnimation = (projects) => {
  const refs = projects.map(() => useRef(null));
  const computedStyles = refs.map((ref) => {
    const { scrollYProgress } = useScroll({
      target: ref,
      offset: ["start end", "end start"],
    });
    const scale = useTransform(
      scrollYProgress,
      [0, 0.2, 0.7, 0.9, 1],
      [0.9, 1, 1, 0.95, 0.9],
    );
    const opacity = useTransform(
      scrollYProgress,
      [0, 0.2, 0.7, 0.9, 0.95],
      [0, 1, 1, 0.5, 0],
    );
    const style = {
      scale,
      opacity,
    };
    return style;
  });
  return {
    refs,
    computedStyles,
  };
};

export function Portfolio23() {
  const useActive = useAnimation([
    {
      heading: "Project name",
      tags: ["Tag one", "Tag two", "Tag three"],
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
      buttons: [
        { title: "Button", variant: "secondary" },
        {
          title: "Button",
          variant: "link",
          size: "link",
          iconRight: <RxChevronRight />,
        },
      ],
      image: {
        src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg",
        alt: "Relume placeholder image center",
      },
    },
    {
      heading: "Project name",
      tags: ["Tag one", "Tag two", "Tag three"],
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
      buttons: [
        { title: "Button", variant: "secondary" },
        {
          title: "Button",
          variant: "link",
          size: "link",
          iconRight: <RxChevronRight />,
        },
      ],
      image: {
        src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg",
        alt: "Relume placeholder image center",
      },
    },
    {
      heading: "Project name",
      tags: ["Tag one", "Tag two", "Tag three"],
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
      buttons: [
        { title: "Button", variant: "secondary" },
        {
          title: "Button",
          variant: "link",
          size: "link",
          iconRight: <RxChevronRight />,
        },
      ],
      image: {
        src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg",
        alt: "Relume placeholder image center",
      },
    },
  ]);
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <header className="mx-auto mb-12 max-w-lg text-center md:mb-18 lg:mb-20">
          <p className="mb-3 font-semibold md:mb-4">Campaign</p>
          <h2 className="mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
            Campaign that moved the needle
          </h2>
          <p className="md:text-md">
            A strategic initiative that delivered measurable results
          </p>
        </header>
        <div className="grid grid-cols-1 gap-6 md:gap-12 lg:gap-20">
          <motion.div
            ref={useActive.refs[0]}
            style={useActive.computedStyles[0]}
            className="grid grid-cols-1 gap-x-20 gap-y-6 border border-border-primary p-6 md:grid-cols-[3fr_4fr] md:gap-y-20 md:p-8 lg:p-12"
            ref={useActive.refs[0]}
          >
            <div className="flex flex-col justify-between">
              <div>
                <h3 className="text-4xl font-bold leading-[1.2] md:text-5xl lg:text-6xl">
                  Brand awareness lift
                </h3>
                <div className="mt-3 flex flex-wrap gap-2 md:mt-4">
                  <li className="flex">
                    <div className="inline-flex border border-neutral-lightest bg-neutral-lightest px-2 py-1 text-sm font-semibold text-text-primary">
                      Social strategy
                    </div>
                  </li>
                  <li className="flex">
                    <div className="inline-flex border border-neutral-lightest bg-neutral-lightest px-2 py-1 text-sm font-semibold text-text-primary">
                      Content creation
                    </div>
                  </li>
                  <li className="flex">
                    <div className="inline-flex border border-neutral-lightest bg-neutral-lightest px-2 py-1 text-sm font-semibold text-text-primary">
                      Paid media
                    </div>
                  </li>
                </div>
              </div>
              <div className="mt-6 md:mt-8 md:text-md">
                Developed a multi-channel campaign targeting high-intent
                audiences across Instagram, TikTok, and LinkedIn. The strategy
                balanced organic storytelling with precision-targeted paid
                placements to maximize reach and engagement.
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
                <Button title="Link" variant="secondary">
                  Link
                </Button>
                <Button
                  title="Link"
                  variant="link"
                  size="link"
                  iconRight={<RxChevronRight />}
                >
                  Link
                </Button>
              </div>
            </div>
            <div>
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                alt="Relume placeholder image center"
                className="aspect-[3/2] w-full object-cover"
              />
            </div>
          </motion.div>
          <motion.div
            ref={useActive.refs[1]}
            style={useActive.computedStyles[1]}
            className="grid grid-cols-1 gap-x-20 gap-y-6 border border-border-primary p-6 md:grid-cols-[3fr_4fr] md:gap-y-20 md:p-8 lg:p-12"
            ref={useActive.refs[1]}
          >
            <div className="flex flex-col justify-between">
              <div>
                <h3 className="text-4xl font-bold leading-[1.2] md:text-5xl lg:text-6xl">
                  Email sequence
                </h3>
                <div className="mt-3 flex flex-wrap gap-2 md:mt-4">
                  <li className="flex">
                    <div className="inline-flex border border-neutral-lightest bg-neutral-lightest px-2 py-1 text-sm font-semibold text-text-primary">
                      Conversion optimization
                    </div>
                  </li>
                  <li className="flex">
                    <div className="inline-flex border border-neutral-lightest bg-neutral-lightest px-2 py-1 text-sm font-semibold text-text-primary">
                      Copywriting
                    </div>
                  </li>
                  <li className="flex">
                    <div className="inline-flex border border-neutral-lightest bg-neutral-lightest px-2 py-1 text-sm font-semibold text-text-primary">
                      Marketing automation
                    </div>
                  </li>
                </div>
              </div>
              <div className="mt-6 md:mt-8 md:text-md">
                Built a segmented email nurture series that converted cold leads
                into qualified prospects. Used behavioral triggers and
                personalized messaging to increase open rates by 34% and
                click-through rates by 28%.
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
                <Button title="Link" variant="secondary">
                  Link
                </Button>
                <Button
                  title="Link"
                  variant="link"
                  size="link"
                  iconRight={<RxChevronRight />}
                >
                  Link
                </Button>
              </div>
            </div>
            <div>
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                alt="Relume placeholder image center"
                className="aspect-[3/2] w-full object-cover"
              />
            </div>
          </motion.div>
          <motion.div
            ref={useActive.refs[2]}
            style={useActive.computedStyles[2]}
            className="grid grid-cols-1 gap-x-20 gap-y-6 border border-border-primary p-6 md:grid-cols-[3fr_4fr] md:gap-y-20 md:p-8 lg:p-12"
            ref={useActive.refs[2]}
          >
            <div className="flex flex-col justify-between">
              <div>
                <h3 className="text-4xl font-bold leading-[1.2] md:text-5xl lg:text-6xl">
                  Product launch
                </h3>
                <div className="mt-3 flex flex-wrap gap-2 md:mt-4">
                  <li className="flex">
                    <div className="inline-flex border border-neutral-lightest bg-neutral-lightest px-2 py-1 text-sm font-semibold text-text-primary">
                      Go-to-market
                    </div>
                  </li>
                  <li className="flex">
                    <div className="inline-flex border border-neutral-lightest bg-neutral-lightest px-2 py-1 text-sm font-semibold text-text-primary">
                      Brand positioning
                    </div>
                  </li>
                  <li className="flex">
                    <div className="inline-flex border border-neutral-lightest bg-neutral-lightest px-2 py-1 text-sm font-semibold text-text-primary">
                      Community building
                    </div>
                  </li>
                </div>
              </div>
              <div className="mt-6 md:mt-8 md:text-md">
                Orchestrated a full launch campaign from positioning through
                post-launch momentum. Coordinated cross-functional teams to
                execute a cohesive narrative across owned, earned, and paid
                channels.
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
                <Button title="Link" variant="secondary">
                  Link
                </Button>
                <Button
                  title="Link"
                  variant="link"
                  size="link"
                  iconRight={<RxChevronRight />}
                >
                  Link
                </Button>
              </div>
            </div>
            <div>
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                alt="Relume placeholder image center"
                className="aspect-[3/2] w-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
      <div className="h-screen" />
    </section>
  );
}
