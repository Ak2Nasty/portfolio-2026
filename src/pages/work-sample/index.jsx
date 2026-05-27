import React from "react";
import { Navbar13 } from "../home/components/Navbar13";
import { FloatingNav } from "../home/components/FloatingNav";
import { Portfolio23 } from "./components/Portfolio23";
import { WorkSamplesFooter } from "./components/WorkSamplesFooter";

export default function Page() {
  return (
    <div className="bg-[#0C0C0B] min-h-screen">
      <FloatingNav />
      <Navbar13 />
      <Portfolio23 />
      <WorkSamplesFooter />
    </div>
  );
}
