"use client";

import { Button } from "@relume_io/relume-ui";
import React from "react";
import { LuMapPin } from "react-icons/lu";
import { MdAccessTime } from "react-icons/md";

export function Career12_1() {
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="grid auto-cols-fr gap-12 md:grid-cols-2 md:gap-y-16 lg:grid-cols-[0.75fr_1fr] lg:gap-x-20">
          <div>
            <p className="mb-3 font-semibold md:mb-4">Openings</p>
            <h2 className="mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
              Currently hiring
            </h2>
            <p className="md:text-md">
              We're building teams that ship real results. Join us.
            </p>
          </div>
          <div>
            <div className="border-t border-border-primary py-6 md:py-8">
              <div className="mb-3 flex items-center gap-4 md:mb-4">
                <h3 className="text-xl font-bold md:text-2xl">
                  Senior strategist
                </h3>
                <p className="bg-background-secondary px-2 py-1 text-sm font-semibold">
                  Strategy
                </p>
              </div>
              <p className="mb-5 md:mb-6">
                Lead campaign strategy across multiple brands and channels
              </p>
              <div className="flex flex-wrap gap-y-3">
                <div className="mr-6 flex items-center">
                  <div className="mr-3 flex-none">
                    <LuMapPin className="flex size-6 flex-col items-center justify-center" />
                  </div>
                  <span className="md:text-md">New York</span>
                </div>
                <div className="mr-6 flex items-center">
                  <div className="mr-3 flex-none">
                    <MdAccessTime className="flex size-6 flex-col items-center justify-center" />
                  </div>
                  <span className="md:text-md">Full time</span>
                </div>
              </div>
              <Button
                className="mt-6 md:mt-8"
                title="Apply now"
                variant="secondary"
                size="sm"
              >
                <a href="#">Apply now</a>
              </Button>
            </div>
            <div className="border-t border-border-primary py-6 md:py-8">
              <div className="mb-3 flex items-center gap-4 md:mb-4">
                <h3 className="text-xl font-bold md:text-2xl">
                  Social director
                </h3>
                <p className="bg-background-secondary px-2 py-1 text-sm font-semibold">
                  Social
                </p>
              </div>
              <p className="mb-5 md:mb-6">
                Own social strategy and community management for growth brands
              </p>
              <div className="flex flex-wrap gap-y-3">
                <div className="mr-6 flex items-center">
                  <div className="mr-3 flex-none">
                    <LuMapPin className="flex size-6 flex-col items-center justify-center" />
                  </div>
                  <span className="md:text-md">New York</span>
                </div>
                <div className="mr-6 flex items-center">
                  <div className="mr-3 flex-none">
                    <MdAccessTime className="flex size-6 flex-col items-center justify-center" />
                  </div>
                  <span className="md:text-md">Full time</span>
                </div>
              </div>
              <Button
                className="mt-6 md:mt-8"
                title="Apply now"
                variant="secondary"
                size="sm"
              >
                <a href="#">Apply now</a>
              </Button>
            </div>
            <div className="border-t border-border-primary py-6 md:py-8">
              <div className="mb-3 flex items-center gap-4 md:mb-4">
                <h3 className="text-xl font-bold md:text-2xl">Media manager</h3>
                <p className="bg-background-secondary px-2 py-1 text-sm font-semibold">
                  Paid
                </p>
              </div>
              <p className="mb-5 md:mb-6">
                Manage paid campaigns and optimize performance across platforms
              </p>
              <div className="flex flex-wrap gap-y-3">
                <div className="mr-6 flex items-center">
                  <div className="mr-3 flex-none">
                    <LuMapPin className="flex size-6 flex-col items-center justify-center" />
                  </div>
                  <span className="md:text-md">New York</span>
                </div>
                <div className="mr-6 flex items-center">
                  <div className="mr-3 flex-none">
                    <MdAccessTime className="flex size-6 flex-col items-center justify-center" />
                  </div>
                  <span className="md:text-md">Full time</span>
                </div>
              </div>
              <Button
                className="mt-6 md:mt-8"
                title="Apply now"
                variant="secondary"
                size="sm"
              >
                <a href="#">Apply now</a>
              </Button>
            </div>
            <div className="border-t border-border-primary py-6 md:py-8">
              <div className="mb-3 flex items-center gap-4 md:mb-4">
                <h3 className="text-xl font-bold md:text-2xl">Campaign lead</h3>
                <p className="bg-background-secondary px-2 py-1 text-sm font-semibold">
                  Strategy
                </p>
              </div>
              <p className="mb-5 md:mb-6">
                Own end-to-end campaign development for consumer and B2B brands
              </p>
              <div className="flex flex-wrap gap-y-3">
                <div className="mr-6 flex items-center">
                  <div className="mr-3 flex-none">
                    <LuMapPin className="flex size-6 flex-col items-center justify-center" />
                  </div>
                  <span className="md:text-md">New York</span>
                </div>
                <div className="mr-6 flex items-center">
                  <div className="mr-3 flex-none">
                    <MdAccessTime className="flex size-6 flex-col items-center justify-center" />
                  </div>
                  <span className="md:text-md">Full time</span>
                </div>
              </div>
              <Button
                className="mt-6 md:mt-8"
                title="Apply now"
                variant="secondary"
                size="sm"
              >
                <a href="#">Apply now</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
