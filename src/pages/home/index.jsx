import React from "react";
import { Navbar13 } from "./components/Navbar13";
import { Header88 } from "./components/Header88";
import { Layout42 } from "./components/Layout42";
import { EducationTimeline } from "./components/EducationTimeline";
import { Career12 } from "./components/Career12";
import { Career12_1 } from "./components/Career12_1";
import { SkillsSection } from "./components/SkillsSection";
import { Contact22 } from "./components/Contact22";
import { Footer4 } from "./components/Footer4";
import { FloatingNav } from "./components/FloatingNav";

export default function Page() {
  return (
    <div>
      <FloatingNav />
      <Navbar13 />
      <Header88 />
      <Layout42 />
      <EducationTimeline />
      <Career12 />
      <Career12_1 />
      <SkillsSection />
      <Contact22 />
      <Footer4 />
    </div>
  );
}
