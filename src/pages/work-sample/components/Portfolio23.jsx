import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SecureFileViewer } from "./SecureFileViewer";
import { Image as ImageIcon, Terminal } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useLenis } from "lenis/react";
import { ScrambleLabel } from "../../../components/ScrambleLabel";
import { ArchiveTicker } from "./ArchiveTicker";
import { MedFlowScreen, DeviceFrame } from "../../telaverge-medflow/components/screens";

/* Card thumbnails come from pre-rendered WebPs (see scripts/generate-pdf-thumbs.mjs).
   Rendering them with react-pdf meant downloading every source PDF — ~19MB+ — just
   to paint a few hundred pixels. react-pdf now only loads inside SecureFileViewer,
   when a document is actually opened. Mirrors the script's naming. */
const thumbFor = (url) =>
  "/work-samples/thumbs/" +
  url
    .replace(/^\/work-samples\//, "")
    .replace(/\.pdf$/i, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .toLowerCase() + ".webp";

/* ── The MedFlow tile's thumbnail is the real device ─────────────────────────
   Not a screenshot. It mounts the same MedFlowScreen component the case study's
   hero renders, at the same monitoring screen, scaled to fit the card.

   A screenshot would have been one more asset to regenerate every time that
   interface changes, and it HAS changed repeatedly — the paused bar, the
   identity bar, the countdown. A picture of a component that no longer looks
   like that is worse than no picture. This cannot drift, because it is the
   component.

   It costs nothing to include: the app is a single bundle, so those components
   already ship whether this page imports them or not.

   `.mdf` is required. Every MedFlow rule is scoped beneath that class and the
   stylesheet is global, so the device renders correctly anywhere the class
   appears — the isolation contract that page was built on, used here for the
   first time outside it.

   ── Why the scale is measured rather than written down ──
   The thumbnail well is 214x91 in the three-column desktop grid and 332x179 in
   the two-column one. A fixed scale that fits the small well leaves the large
   one two-thirds empty, and one that fills the large well is clipped in the
   small one. So the device keeps its 380px design width and the scale is
   derived from whatever width the card actually has.

   IT MUST KEEP THAT WIDTH. Letting the card squeeze the element instead would
   take the screen under the 300px container query it uses, which stacks the
   field pairs and pushes it from 592px to 664px — the thumbnail would be
   showing a layout that exists nowhere else on the site.

   The crop is the band that reads at this size: state chip, medication, and the
   rate set at 44px. A whole device scaled to fit a 91px strip would be 107px
   wide and unreadable at every point. */
const DEVICE_W = 380;   // the device's design width
const CROP_TOP = 130;   // px into the device where the state chip begins

const MedFlowThumbnail = () => {
  const wellRef = useRef(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = wellRef.current;
    if (!el) return undefined;
    const measure = () => setScale(el.clientWidth / DEVICE_W);
    measure();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={wellRef}
      aria-hidden="true"
      className="mdf absolute inset-0 overflow-hidden pointer-events-none"
      style={{ background: "var(--mf-bg-alt)" }}
    >
      {/* Hidden until measured, so the first paint is never a 380px device
          overflowing a 214px card. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: DEVICE_W,
          transform: `scale(${scale}) translateY(${-CROP_TOP}px)`,
          transformOrigin: "top left",
          opacity: scale ? 1 : 0,
        }}
      >
        <DeviceFrame>
          <MedFlowScreen id="active" />
        </DeviceFrame>
      </div>
    </div>
  );
};

const ImageThumbnail = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && <div className="absolute inset-0 bg-[#222]/80 animate-pulse z-0 flex items-center justify-center"><ImageIcon className="w-6 h-6 text-[#333]" /></div>}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        loading="lazy"
        decoding="async"
        className={`w-full h-full object-cover transition-opacity duration-700 relative z-0 ${loaded ? 'opacity-80 group-hover:opacity-100' : 'opacity-0'}`}
      />
    </>
  );
};

const TYPE_LABEL = { pdf: "DOCUMENT", meta: "SYSTEM", gallery: "GALLERY", image: "IMAGE", route: "CASE STUDY" };
const TYPE_PLURAL = { DOCUMENT: "DOCUMENTS", SYSTEM: "SYSTEMS", GALLERY: "GALLERIES", IMAGE: "IMAGES", "CASE STUDY": "CASE STUDIES" };
const labelFor = (type) => TYPE_LABEL[type] || "IMAGE";

function countFiles(files) {
  const counts = {};
  files.forEach((f) => {
    const label = labelFor(f.type);
    counts[label] = (counts[label] || 0) + 1;
  });
  return Object.entries(counts).map(([label, n]) => ({
    label: n > 1 ? TYPE_PLURAL[label] : label,
    n,
  }));
}

export const WORK_SECTIONS = [
  {
    id: "portfolio-meta",
    company: "Akshathdayan",
    role: "Lead Developer & Designer",
    metadata: "127.0.0.1 • INDEPENDENT PROJECT • PRESENT",
    context: "A highly interactive, cinematic project built from the ground up to showcase my journey and technical capabilities.",
    files: [
      { id: "meta-1", title: "My Newest Project", type: "meta", url: "self" },
    ]
  },
  {
    id: "telaverge",
    company: "MedFlow",
    role: "UI/UX & Human Factors — Independent Concept Study",
    metadata: "SELF-DIRECTED • SAFETY-CRITICAL UX • 2026",
    context: "A conceptual infusion-pump interface exploring how design can support error detection and recovery in a safety-critical workflow. Nine interface states, a clickable prototype that blocks a ten-fold rate entry, a use-related risk analysis, and a proposed formative evaluation. Not a validated medical device.",
    files: [
      { id: "telaverge-1", title: "MedFlow — Full Case Study", type: "route", url: "/telaverge-medflow" },
    ]
  },
  {
    id: "d2l",
    company: "D2L",
    role: "Customer Marketing & Events Coordinator",
    metadata: "VANCOUVER, BC • CO-OP • SEP 2023 - DEC 2023",
    context: "A collection of strategic deliverables featuring scaled event execution protocols for 'Project Event in a Box', alongside a comprehensive enablement deck designed for internal leadership alignment.",
    files: [
      { id: "d2l-1", title: "Project EIAB", type: "pdf", url: "/work-samples/d2l/project-eiab.pdf" },
      { id: "d2l-2", title: "MODUS Enablement Deck", type: "pdf", url: "/work-samples/modus-enablement-deck.pdf" },
    ]
  },
  {
    id: "okhc",
    company: "OKHC",
    role: "Marketing & Communications Consultant",
    metadata: "KELOWNA, BC • UBC CAPSTONE • JAN 2025 - APR 2025",
    context: "A complete digital rebrand package and strategic marketing audit, featuring modernized visual assets, a government-facing fact sheet, and high-level stakeholder communication frameworks.",
    files: [
      { id: "okhc-1", title: "Capstone Final Report", type: "pdf", url: "/work-samples/okhc/capstone-full-report.pdf" },
      { id: "okhc-2", title: "Capstone Final Presentation", type: "pdf", url: "/work-samples/okhc/okhc-final-presentation.pdf" },
      { id: "okhc-3", title: "Website Redesign Mockup", type: "pdf", url: "/work-samples/okhc/okhc-web.pdf" },
      { id: "okhc-4", title: "Google Business Profile", type: "pdf", url: "/work-samples/okhc/okhc-google-business-profile.pdf" },
      { id: "okhc-5", title: "Govt. Facing Fact Sheet", type: "pdf", url: "/work-samples/okhc/okhc-fact-sheet.pdf" },
      { id: "okhc-6", title: "Business Card", type: "pdf", url: "/work-samples/okhc/okhc-business-card.pdf" },
    ]
  },
  {
    id: "marketing-club",
    company: "Marketing Club (UBC MSA)",
    role: "President",
    metadata: "KELOWNA, BC • STUDENT LEADERSHIP • AUG 2022 - APR 2023",
    context: "A collection of brand-aligned visual assets, event promotional materials, and multi-channel social media collateral designed to scale campus-wide engagement.",
    files: [
      { 
        id: "mc-1", 
        title: "Logo Design Assets", 
        type: "gallery", 
        urls: [
          "/work-samples/marketing-club/logo-mark.jpg",
          "/work-samples/marketing-club/logo-recovered.jpg",
          "/work-samples/marketing-club/logo-transparent-1.png"
        ] 
      },
      { 
        id: "mc-2", 
        title: "Event Posters", 
        type: "gallery", 
        urls: [
          "/work-samples/marketing-club/speak-up-event.jpg",
          "/work-samples/marketing-club/net-at-nite.png"
        ] 
      },
      {
        id: "mc-3",
        title: "Marketing Mondays",
        type: "gallery",
        urls: [
          "/work-samples/marketing-club/mm-1.jpg",
          "/work-samples/marketing-club/mm-2.jpg",
          "/work-samples/marketing-club/mm-3.0.jpg",
          "/work-samples/marketing-club/mm-3.1.jpg",
          "/work-samples/marketing-club/mm-3.2.jpg",
          "/work-samples/marketing-club/mm-3.3.jpg",
          "/work-samples/marketing-club/mm-4.jpg",
          "/work-samples/marketing-club/mm-5.jpg",
          "/work-samples/marketing-club/mm-6.jpg",
          "/work-samples/marketing-club/mm-7.jpg",
          "/work-samples/marketing-club/mm-8.jpg",
          "/work-samples/marketing-club/mm-9.jpg",
          "/work-samples/marketing-club/mm-10.jpg"
        ] 
      },
    ]
  },
  {
    id: "nespresso",
    company: "Nestlé Nespresso",
    role: "Sales Associate",
    metadata: "KELOWNA, BC • CONSUMER ENGAGEMENT • NOV 2022 - APR 2023",
    context: "A data-driven digital marketing playbook featuring market segmentation analysis, targeted PPC keyword architecture, and high-conversion creative ad mockups.",
    files: [
      { id: "nes-1", title: "Marketing Plan", type: "pdf", url: "/work-samples/nespresso/Marketing-Plan.pdf" },
      { id: "nes-2", title: "Audience Targeting", type: "pdf", url: "/work-samples/nespresso/Audience-Targeting-and-Strategy.pdf" },
      { id: "nes-3", title: "PPC Keyword Strategy", type: "pdf", url: "/work-samples/nespresso/PPC-Keyword-Project.pdf" },
      { id: "nes-4", title: "Ad Creation Project", type: "pdf", url: "/work-samples/nespresso/Ad-Creation-Project.pdf" },
    ]
  },
  {
    id: "cubs",
    company: "CUBS Vancouver",
    role: "Graphic Designer",
    metadata: "VANCOUVER, BC (REMOTE) • CREATIVE MARKETING • AUG 2022 - DEC 2022",
    context: "A centralized archive of brand identity assets, persuasive copywriting, and visual social media collateral developed for community-focused education initiatives.",
    files: [
      { 
        id: "cb-1",
        title: "Social Media Posts",
        type: "gallery",
        urls: [
          "/work-samples/cubs/Posts/1.jpg",
          "/work-samples/cubs/Posts/2.jpg",
          "/work-samples/cubs/Posts/3.jpg",
          "/work-samples/cubs/Posts/4.jpg",
          "/work-samples/cubs/Posts/5.jpg",
          "/work-samples/cubs/Posts/0.1.jpg",
          "/work-samples/cubs/Posts/0.2.jpg",
          "/work-samples/cubs/Posts/0.3.jpg",
          "/work-samples/cubs/Posts/0.4.jpg"
        ] 
      },
      { 
        id: "cb-2", 
        title: "Brand Assets", 
        type: "gallery", 
        urls: [
          "/work-samples/cubs/Brand Assets/CUBS Text Logo.jpg",
          "/work-samples/cubs/Brand Assets/1.jpg",
          "/work-samples/cubs/Brand Assets/2.jpg",
          "/work-samples/cubs/CUBS Text Logo no background.png",
          "/work-samples/cubs/CUBS white logo.jpg"
        ] 
      }
    ]
  },
  {
    id: "mindtree",
    company: "Mindtree",
    role: "Acquisitions Student Intern",
    metadata: "BANGALORE, INDIA • CORPORATE STRATEGY • SEP 2019 - JAN 2020",
    context: "An in-depth analysis of Larsen & Toubro's hostile takeover of MindTree, evaluating its impact on HR strategies and corporate culture integration.",
    files: [
      { id: "mt-1", title: "HR Strategy Analysis (Extended Essay)", type: "pdf", url: "/work-samples/mindtree/EE-Final-Ak.pdf" },
    ]
  },
  {
    id: "essemm",
    company: "EssEmm Corporation",
    role: "Marketing Student Intern",
    metadata: "COIMBATORE, INDIA • MARKETING STRATEGY • JUN 2019 - SEP 2019",
    context: "A strategic assessment evaluating marketing strategies to improve customer satisfaction. Utilizes business frameworks and sales forecasting to recommend e-commerce integrations.",
    files: [
      { id: "sm-1", title: "Marketing Strategy IA", type: "pdf", url: "/work-samples/essemm/Business-Mgmnt-IA-Final.pdf" },
    ]
  },
  {
    id: "shure",
    company: "Shure",
    role: "1st Place Winner",
    metadata: "BANGALORE, INDIA • ACADEMIC PROJECT • MAR 2019",
    context: "A strategic marketing proposal for Shure's expansion in India, analyzing target demographics and competitors to recommend localized sales strategies.",
    files: [
      { id: "shure-1", title: "Shure Marketing Proposal", type: "pdf", url: "/work-samples/shure/Shure-Marketing-Proposal.pdf" },
    ]
  }
];

/* Short forms for the header ticker — legal names read badly at poster size. */
const TICKER_ALIAS = {
  "marketing-club": "MARKETING CLUB",
  nespresso: "NESPRESSO",
  cubs: "CUBS",
  essemm: "ESSEMM",
};

// The ticker is the archive's index, so it reads straight off the sections.
// The meta card is this site itself, not a client, so it sits out.
const ARCHIVE_INDEX = WORK_SECTIONS
  .filter((s) => s.id !== "portfolio-meta")
  .map((s) => TICKER_ALIAS[s.id] || s.company.toUpperCase());

export function Portfolio23() {
  const [selectedFile, setSelectedFile] = useState(null);
  const location = useLocation();
  const lenis = useLenis();
  const [isGlitching, setIsGlitching] = useState(false);

  const triggerMetaGlitch = () => {
    setIsGlitching(true);
    document.body.classList.add('is-glitching');
    setTimeout(() => {
      window.location.href = '/';
    }, 2500);
  };

  // Lock scroll when glitch animation is playing
  useEffect(() => {
    if (isGlitching) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isGlitching]);

  /* Routed through Lenis, like the navbar. A native scrollTo sets the browser's
     position, but Lenis keeps its own and restores it on the next frame — so a
     plain window.scrollTo can be undone and leave you wherever the previous page
     was scrolled to. */
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const timer = setTimeout(() => {
        const element = document.getElementById(id);
        if (!element) return;
        if (lenis) lenis.scrollTo(element, { duration: 1.2 });
        else element.scrollIntoView({ behavior: "smooth" });
      }, 500);
      return () => clearTimeout(timer);
    }

    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname, location.hash, lenis]);

  return (
    <>
      <section className="w-full min-h-screen bg-[#0C0C0B] pt-24 md:pt-32 pb-16 md:pb-24 relative z-10 selection:bg-white/20 overflow-hidden">
        
        {/* Background Glow - Optimized for mobile GPU */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] md:w-[800px] h-[200px] md:h-[300px] bg-white/[0.02] blur-[60px] md:blur-[120px] rounded-full pointer-events-none transform-gpu" />

        <div className="max-w-[100rem] mx-auto px-6 md:px-12 lg:px-16">
        
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 md:mb-14 xl:mb-16"
        >
          <div className="max-w-4xl">
          <Link
            to="/#experience" 
            className="group flex items-center gap-2 text-[#a3a3a3] hover:text-[#f4f4f4] transition-colors w-fit mb-8 md:mb-12"
          >
            <span className="text-[14px] md:text-[16px] transition-transform duration-300 group-hover:-translate-x-1">←</span>
            <span className="font-['Outfit'] font-medium text-[11px] md:text-[12px] tracking-[0.15em] uppercase">
              Back to Experience
            </span>
          </Link>
          <span className="font-['Outfit'] font-semibold text-[10px] md:text-[11px] tracking-[0.25em] text-[#a3a3a3] uppercase mb-4 block">
            <ScrambleLabel text="PORTFOLIO / ARCHIVE" />
          </span>
          <h1 className="font-monument text-[40px] md:text-[60px] lg:text-[72px] font-bold leading-[1.05] text-[#f4f4f4] tracking-[0.02em] uppercase mb-6">
            WORK SAMPLES
          </h1>
          <p className="font-['Outfit'] text-[14px] md:text-[16px] leading-[1.8] font-medium tracking-[0.1em] text-[#8a8a8a] max-w-2xl uppercase">
            A CURATED ARCHIVE OF PROJECTS, PRESENTATIONS, CAMPAIGNS, AND DELIVERABLES BEHIND THE EXECUTION.
          </p>
          </div>

          {/* Ghost index — the tape the archive runs on */}
          <ArchiveTicker items={ARCHIVE_INDEX} />
        </motion.div>

        {/* Sections */}
        <div className="flex flex-col gap-20 md:gap-32 relative">
          {WORK_SECTIONS.map((section, idx) => (
            <div key={section.id} id={section.id} className="scroll-mt-32 relative">
              {/* Divider Line */}
              {idx > 0 && (
                <div className="absolute -top-10 md:-top-16 left-0 right-0 h-[1px] bg-white/[0.05]" />
              )}
              <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">

                {/* Left: Company Details */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="lg:w-1/3 flex flex-col gap-6"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-[1px] bg-white/20" />
                      <span className="font-['Outfit'] font-semibold text-[10px] tracking-[0.2em] text-[#a3a3a3] uppercase">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h2 className="font-['Outfit'] font-bold text-[32px] md:text-[40px] text-[#f4f4f4] uppercase tracking-tight leading-none mb-1">
                      {section.company}
                    </h2>
                    <h3 className="font-['Outfit'] text-[16px] md:text-[18px] text-[#e5e5e5] font-light mb-1.5">
                      {section.role}
                    </h3>
                    <p className="font-['Outfit'] text-[10px] md:text-[11px] font-semibold tracking-[0.2em] text-[#8a8a8a] uppercase">
                      {section.metadata}
                    </p>

                    {/* what this section holds, at a glance */}
                    <div className="flex flex-wrap items-center gap-2 mt-3.5">
                      {countFiles(section.files).map(({ label, n }) => (
                        <span
                          key={label}
                          className="font-['Outfit'] text-[9px] font-semibold tracking-[0.18em] uppercase text-[#9a9a9a] border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm rounded-full px-2.5 py-1"
                        >
                          {String(n).padStart(2, "0")} {label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="font-['Outfit'] text-[15px] leading-[1.7] font-light text-[#c2c2c2]">
                    {section.context}
                  </p>
                </motion.div>

                {/* Right: Files Grid — cards assemble in sequence */}
                <motion.div
                  className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-8%" }}
                  variants={{ visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}
                >
                  {section.files.map((file) => (
                    <motion.div
                      key={file.id}
                      variants={{
                        hidden: { opacity: 0, y: 26 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
                      }}
                      /* A `route` tile is a link to a page on this site, not a
                         file to open in the viewer. It is rendered as a real
                         anchor further down so it keeps middle-click, open-in-
                         new-tab and the keyboard behaviour an anchor has for
                         free; this handler simply leaves it alone. */
                      onClick={() => {
                        if (file.type === "route") return;
                        if (file.type === "meta") {
                          triggerMetaGlitch();
                        } else {
                          setSelectedFile(file);
                        }
                      }}
                      className="group relative bg-[#121211]/40 backdrop-blur-md border border-[#222] hover:border-[#444] rounded-xl overflow-hidden cursor-pointer transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col aspect-[4/3]"
                    >
                      {/* A REAL ANCHOR, stretched over the whole card.
                          The tile is a div because every other file type opens
                          a viewer rather than navigating. Giving the route type
                          an absolutely-positioned link instead of an onClick
                          costs nothing visually and buys back everything an
                          anchor does that a click handler does not: middle-click
                          to a new tab, cmd-click, "copy link address", a real
                          focus stop, and a status-bar preview of where it goes. */}
                      {file.type === "route" && (
                        <Link
                          to={file.url}
                          aria-label={`${file.title} — open the case study`}
                          className="absolute inset-0 z-30 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                        />
                      )}

                      {/* Thumbnail Area */}
                      <div className="flex-1 bg-[#1a1a1a] flex items-center justify-center relative overflow-hidden">
                        {/* Placeholder graphic based on type */}
                        <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent" />
                        
                        {/* Frosted Glass Overlay */}
                        <div className="absolute inset-0 bg-[#0C0C0B]/20 backdrop-blur-[2px] group-hover:backdrop-blur-0 group-hover:bg-transparent transition-all duration-700 z-10 pointer-events-none" />

                        {file.type === "route" ? (
                          <MedFlowThumbnail />
                        ) : file.type === "meta" ? (
                          <Terminal className="w-12 h-12 text-green-500/50 group-hover:text-green-400 transition-colors z-10" />
                        ) : (
                          <ImageThumbnail
                            src={
                              file.thumbnail ||
                              (file.type === 'gallery'
                                ? file.urls[0]
                                : file.type === 'pdf'
                                  ? thumbFor(file.url)
                                  : file.url)
                            }
                            alt={file.title}
                          />
                        )}
                      </div>
                      <div className="p-4 bg-[#0a0a0a] border-t border-[#222]">
                        <h4 className="font-['Outfit'] font-semibold text-[13px] text-[#e5e5e5] truncate group-hover:text-white transition-colors">
                          {file.title}
                        </h4>
                        <span className="font-['Outfit'] text-[9px] text-[#8a8a8a] uppercase tracking-widest mt-1 block">
                          {labelFor(file.type)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </section>

      {/* Render overlay elements outside the section to avoid stacking context issues */}
      <SecureFileViewer 
        isOpen={!!selectedFile} 
        file={selectedFile} 
        onClose={() => setSelectedFile(null)} 
      />
      <AnimatePresence>
        {isGlitching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-black"
            onContextMenu={(e) => e.preventDefault()}
            onWheel={(e) => e.stopPropagation()}
            data-lenis-prevent="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: [0, 1, 0.5, 1], x: [0, -5, 5, -2, 2, 0] }}
              transition={{ duration: 0.2, times: [0, 0.2, 0.4, 0.6, 0.8, 1], repeat: Infinity, repeatType: "mirror" }}
            >
              <h1 className="font-['Outfit'] font-bold text-[20px] md:text-[30px] text-green-500 tracking-[0.2em] uppercase">
                Executing Portfolio.exe...
              </h1>
            </motion.div>
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-10 opacity-70" />
            <motion.div 
              animate={{ y: [0, -20, 10, -50, 0], opacity: [0, 0.5, 0, 0.8, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute top-1/4 left-1/4 w-32 h-2 bg-green-500/20"
            />
            <motion.div 
              animate={{ y: [0, 40, -10, 60, 0], opacity: [0, 0.8, 0, 0.5, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
              className="absolute bottom-1/3 right-1/4 w-64 h-1 bg-green-500/20"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
