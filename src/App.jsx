import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ReactLenis } from 'lenis/react';
import Home from "./pages/home";
import WorkSample from "./pages/work-sample";

function App() {
  return (
    <ReactLenis root options={{ lerp: 0.08, smoothWheel: true }}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work-sample" element={<WorkSample />} />
        </Routes>
      </Router>
    </ReactLenis>
  );
}

export default App;
