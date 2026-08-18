import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ReactLenis } from 'lenis/react';
import Home from "./pages/home";
import WorkSample from "./pages/work-sample";
import NotFound from "./pages/NotFound";
import { Loader } from "./components/Loader";
import { EasterEggs } from "./components/EasterEggs";
import { CommandPalette } from "./components/CommandPalette";

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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ReactLenis>
  );
}

export default App;
