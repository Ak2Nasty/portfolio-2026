import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Navbar13 } from "./components/Navbar13";
import { Header88 } from "./components/Header88";
import { Layout42 } from "./components/Layout42";
import { EducationTimeline } from "./components/EducationTimeline";
import { Career12 } from "./components/Career12";
import { SkillsSection } from "./components/SkillsSection";
import { Contact22 } from "./components/Contact22";
import { FloatingNav } from "./components/FloatingNav";

export default function Page() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        // slight delay to ensure components are mounted
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location]);

  return (
    <div>
      <FloatingNav />
      <Navbar13 />
      <Header88 />
      <Layout42 />
      <EducationTimeline />
      <Career12 />
      <SkillsSection />
      <Contact22 />
    </div>
  );
}
