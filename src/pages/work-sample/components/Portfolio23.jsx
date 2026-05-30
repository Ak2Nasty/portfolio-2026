import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SecureFileViewer } from "./SecureFileViewer";
import { FileText, Image as ImageIcon, Lock, Terminal } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const ImageThumbnail = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && <div className="absolute inset-0 bg-[#222]/80 animate-pulse z-0 flex items-center justify-center"><ImageIcon className="w-6 h-6 text-[#333]" /></div>}
      <img 
        src={src} 
        alt={alt} 
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-700 relative z-0 ${loaded ? 'opacity-80 group-hover:opacity-100' : 'opacity-0'}`} 
      />
    </>
  );
};

const WORK_SECTIONS = [
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
    id: "d2l",
    company: "D2L",
    role: "Customer Marketing & Events Coordinator",
    metadata: "VANCOUVER, BC • CO-OP • SEP 2023 - DEC 2023",
    context: "A comprehensive strategic blueprint detailing vendor transition frameworks, field marketing logistics, and scaled event execution protocols for 'Project Event in a Box'.",
    files: [
      { id: "d2l-1", title: "Project EIAB", type: "pdf", url: "/work-samples/d2l/project-eiab.pdf" },
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
    context: "A curated collection of brand-aligned visual assets, event promotional materials, and multi-channel social media collateral designed to scale campus-wide engagement.",
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

export function Portfolio23() {
  const [selectedFile, setSelectedFile] = useState(null);
  const location = useLocation();
  const [isGlitching, setIsGlitching] = useState(false);

  const triggerMetaGlitch = () => {
    setIsGlitching(true);
    document.body.classList.add('is-glitching');
    setTimeout(() => {
      window.location.href = '/';
    }, 2500);
  };

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 500);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [location.pathname, location.hash]);

  return (
    <section className="w-full min-h-screen bg-[#0C0C0B] pt-24 md:pt-32 pb-16 md:pb-24 relative z-10 selection:bg-white/20 overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[100rem] mx-auto px-6 md:px-12 lg:px-16">
        
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 md:mb-24 xl:mb-32 max-w-4xl"
        >
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
            PORTFOLIO / ARCHIVE
          </span>
          <h1 className="font-monument text-[40px] md:text-[60px] lg:text-[72px] font-bold leading-[1.05] text-[#f4f4f4] tracking-[0.02em] uppercase mb-6">
            WORK SAMPLES
          </h1>
          <p className="font-['Outfit'] text-[14px] md:text-[16px] leading-[1.8] font-medium tracking-[0.1em] text-[#8a8a8a] max-w-2xl uppercase">
            A CURATED ARCHIVE OF PROJECTS, PRESENTATIONS, CAMPAIGNS, AND DELIVERABLES BEHIND THE EXECUTION.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="flex flex-col gap-20 md:gap-32">
          {WORK_SECTIONS.map((section, idx) => (
            <div key={section.id} id={section.id} className="scroll-mt-32">
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col lg:flex-row gap-12 lg:gap-24"
              >
                
                {/* Left: Company Details */}
                <div className="lg:w-1/3 flex flex-col gap-6">
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
                  </div>
                  <p className="font-['Outfit'] text-[15px] leading-[1.7] font-light text-[#c2c2c2]">
                    {section.context}
                  </p>
                </div>

                {/* Right: Files Grid */}
                <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {section.files.map((file) => (
                    <div 
                      key={file.id}
                      onClick={() => {
                        if (file.type === "meta") {
                          triggerMetaGlitch();
                        } else {
                          setSelectedFile(file);
                        }
                      }}
                      className="group relative bg-[#121211]/40 backdrop-blur-md border border-[#222] hover:border-[#444] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col aspect-[4/3]"
                    >
                      {/* Thumbnail Area */}
                      <div className="flex-1 bg-[#1a1a1a] flex items-center justify-center relative overflow-hidden">
                        {/* Placeholder graphic based on type */}
                        <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent" />
                        
                        {/* Frosted Glass Overlay */}
                        <div className="absolute inset-0 bg-[#0C0C0B]/20 backdrop-blur-[2px] group-hover:backdrop-blur-0 group-hover:bg-transparent transition-all duration-700 z-10 pointer-events-none" />

                        {file.type === "meta" ? (
                          <Terminal className="w-12 h-12 text-green-500/50 group-hover:text-green-400 transition-colors z-10" />
                        ) : file.thumbnail || file.type === 'image' || file.type === 'gallery' ? (
                          <ImageThumbnail src={file.thumbnail || (file.type === 'gallery' ? file.urls[0] : file.url)} alt={file.title} />
                        ) : file.type === 'pdf' ? (
                          <div className="w-full h-full absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden flex items-start justify-center pointer-events-none z-0">
                            <Document 
                              file={file.url} 
                              loading={<div className="absolute inset-0 bg-[#222]/80 animate-pulse flex items-center justify-center"><FileText className="w-8 h-8 text-[#444]" /></div>}
                              className="w-full"
                            >
                              <Page 
                                pageNumber={1} 
                                width={600} 
                                className="w-full [&>canvas]:!w-full [&>canvas]:!h-auto [&>canvas]:!object-cover"
                                renderTextLayer={false} 
                                renderAnnotationLayer={false} 
                              />
                            </Document>
                          </div>
                        ) : (
                          <ImageIcon className="w-12 h-12 text-[#444] group-hover:text-white/80 transition-colors duration-300 relative z-10" />
                        )}
                      </div>
                      <div className="p-4 bg-[#0a0a0a] border-t border-[#222]">
                        <h4 className="font-['Outfit'] font-semibold text-[13px] text-[#e5e5e5] truncate group-hover:text-white transition-colors">
                          {file.title}
                        </h4>
                        <span className="font-['Outfit'] text-[9px] text-[#8a8a8a] uppercase tracking-widest mt-1 block">
                          {file.type === 'pdf' ? 'DOCUMENT' : file.type === 'meta' ? 'SYSTEM' : file.type === 'gallery' ? 'GALLERY' : 'IMAGE'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
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
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black"
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
    </section>
  );
}
