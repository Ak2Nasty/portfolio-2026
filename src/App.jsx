import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ReactLenis } from 'lenis/react';
import Home from "./pages/home";
import WorkSample from "./pages/work-sample";
import NotFound from "./pages/NotFound";
import ChanelWFJ from "./pages/chanel-wfj";
import { Loader } from "./components/Loader";
import { EasterEggs } from "./components/EasterEggs";
import { CommandPalette } from "./components/CommandPalette";
import { CardLab } from "./pages/card-lab/CardLab";

function App() {
  useEffect(() => {
    let scrollTimeout;
    let animationFrame;
    let currentAlpha = 0.03;
    const targetAlpha = 0.25;
    const idleAlpha = 0.03;

    const animateAlpha = (target) => {
      // Fast fade in (0.02/frame), slow fade out (-0.005/frame)
      const step = target > currentAlpha ? 0.02 : -0.005;
      
      const update = () => {
        currentAlpha += step;
        if ((step > 0 && currentAlpha >= target) || (step < 0 && currentAlpha <= target)) {
          currentAlpha = target;
        } else {
          animationFrame = requestAnimationFrame(update);
        }
        document.documentElement.style.setProperty('--scrollbar-alpha', currentAlpha.toFixed(3));
      };
      
      cancelAnimationFrame(animationFrame);
      update();
    };

    const handleScroll = () => {
      if (currentAlpha < targetAlpha) {
        animateAlpha(targetAlpha);
      }
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        animateAlpha(idleAlpha);
      }, 800);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <ReactLenis root options={{ lerp: 0.08, smoothWheel: true }}>
      <EasterEggs />
      <Router>
        <Loader />
        {/* inside the router: it navigates between routes */}
        <CommandPalette />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work-sample" element={<WorkSample />} />
          {/* Unlisted application study. Reachable by direct URL only — it is
              deliberately absent from the navbar, the command palette, the work
              archive and the homepage, and it sets its own noindex/nofollow
              while mounted. vercel.json already rewrites every path to
              index.html, so a direct load and a refresh both resolve here. */}
          <Route path="/chanel-wfj" element={<ChanelWFJ />} />
          {/* Card blueprint — a dev tool, not part of the site. import.meta.env.DEV
              is replaced with a literal false at build time, so this route and the
              CardLab import tree-shake out of the production bundle entirely. */}
          {import.meta.env.DEV && <Route path="/card-lab" element={<CardLab />} />}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ReactLenis>
  );
}

export default App;
