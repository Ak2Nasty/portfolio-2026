import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SecureFileViewer } from "./SecureFileViewer";
import { FileText, Image as ImageIcon, Lock } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const WORK_SECTIONS = [
  {
    id: "d2l",
    company: "D2L",
    role: "Customer Marketing & Events Coordinator",
    metadata: "VANCOUVER, BC • CO-OP • SEP 2023 - DEC 2023",
    context: "Strategic evaluation, vendor transition plans, and event coordination documentation.",
    files: [
      { id: "d2l-1", title: "Project EIAB", type: "pdf", url: "/work-samples/d2l/project-eiab.pdf" },
    ]
  },
  {
    id: "okhc",
    company: "OKHC",
    role: "Marketing & Communications Consultant",
    metadata: "KELOWNA, BC • UBC CAPSTONE • JAN 2025 - APR 2025",
    context: "Comprehensive marketing audits, social media strategies, and website redesign concepts.",
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
    context: "Brand-aligned promotional campaigns, sponsorship decks, and campus-wide event planning.",
    files: [
      { id: "mc-1", title: "Annual Sponsorship Deck", type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { id: "mc-2", title: "Campaign Launch Assets", type: "image", url: "https://images.unsplash.com/photo-1557838923-2985c318be48?auto=format&fit=crop&q=80&w=800" },
      { id: "mc-3", title: "Budget & Strategy Doc", type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
    ]
  },
  {
    id: "mindtree",
    company: "Mindtree",
    role: "Acquisitions Student Intern",
    metadata: "BANGALORE, INDIA • CORPORATE STRATEGY • SEP 2019 - JAN 2020",
    context: "Internal communication strategies and post-acquisition organizational reporting.",
    files: [
      { id: "mt-1", title: "Post-Acquisition Comms Plan", type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { id: "mt-2", title: "Stakeholder Alignment Chart", type: "image", url: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800" },
    ]
  },
  {
    id: "essemm",
    company: "EssEmm Corporation",
    role: "Marketing Student Intern",
    metadata: "COIMBATORE, INDIA • MARKETING STRATEGY • JUN 2019 - SEP 2019",
    context: "Data-driven market research, e-commerce recommendations, and product positioning analysis.",
    files: [
      { id: "sm-1", title: "E-Commerce Market Analysis", type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
    ]
  },
  {
    id: "cubs",
    company: "CUBS Vancouver",
    role: "Graphic Designer",
    metadata: "VANCOUVER, BC (REMOTE) • CREATIVE MARKETING • AUG 2022 - DEC 2022",
    context: "Developed social media campaigns, copywriting, and visual content for community-focused education initiatives.",
    files: [
      { id: "cb-1", title: "Social Media Campaign Grids", type: "image", url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800" },
      { id: "cb-2", title: "Brand Identity Guidelines", type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
    ]
  }
];

export function Portfolio23() {
  const [selectedFile, setSelectedFile] = useState(null);
  const location = useLocation();

  // Scroll to hash on load if present, otherwise scroll to top
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
    <section className="w-full min-h-screen bg-[#0C0C0B] pt-32 pb-24 relative z-10 selection:bg-white/20">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[100rem] mx-auto px-6 md:px-12 lg:px-16">
        
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-24 xl:mb-32 max-w-4xl"
        >
          <span className="font-['Outfit'] font-semibold text-[10px] md:text-[11px] tracking-[0.25em] text-[#a3a3a3] uppercase mb-4 block">
            PORTFOLIO / ARCHIVE
          </span>
          <h1 className="font-monument text-[40px] md:text-[60px] lg:text-[72px] font-bold leading-[1.05] text-[#f4f4f4] tracking-[0.02em] uppercase mb-6">
            WORK SAMPLES
          </h1>
          <p className="font-['Outfit'] text-[14px] md:text-[16px] leading-[1.8] font-medium tracking-[0.1em] text-[#8a8a8a] max-w-2xl uppercase">
            A CURATED ARCHIVE OF PROJECTS, PRESENTATIONS, CAMPAIGNS, AND DELIVERABLES BEHIND THE EXPERIENCE.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="flex flex-col gap-32">
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
                    <h3 className="font-['Outfit'] text-[16px] md:text-[18px] text-[#22c55e] font-light mb-1.5">
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
                      onClick={() => setSelectedFile(file)}
                      className="group relative bg-[#121211]/40 backdrop-blur-md border border-[#222] hover:border-[#444] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col aspect-[4/3]"
                    >
                      {/* Thumbnail Area */}
                      <div className="flex-1 bg-[#1a1a1a] flex items-center justify-center relative overflow-hidden">
                        {/* Placeholder graphic based on type */}
                        <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent" />
                        
                        {/* Frosted Glass Overlay */}
                        <div className="absolute inset-0 bg-[#0C0C0B]/20 backdrop-blur-[2px] group-hover:backdrop-blur-0 group-hover:bg-transparent transition-all duration-700 z-10 pointer-events-none" />

                        {file.thumbnail ? (
                          <img src={file.thumbnail} alt={file.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 relative z-0" />
                        ) : file.type === 'pdf' ? (
                          <div className="w-full h-full absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden flex items-start justify-center pointer-events-none z-0">
                            <Document 
                              file={file.url} 
                              loading={<FileText className="w-12 h-12 text-[#444] animate-pulse mt-12" />}
                              className="scale-[0.8] origin-top md:scale-[0.85] lg:scale-100"
                            >
                              <Page 
                                pageNumber={1} 
                                width={400} 
                                renderTextLayer={false} 
                                renderAnnotationLayer={false} 
                              />
                            </Document>
                          </div>
                        ) : (
                          <ImageIcon className="w-12 h-12 text-[#444] group-hover:text-white/80 transition-colors duration-300 relative z-10" />
                        )}
                        
                      </div>

                      {/* Info Area */}
                      <div className="p-4 bg-[#0a0a0a] border-t border-[#222]">
                        <h4 className="font-['Outfit'] font-semibold text-[13px] text-[#e5e5e5] truncate group-hover:text-white transition-colors">
                          {file.title}
                        </h4>
                        <span className="font-['Outfit'] text-[9px] text-[#8a8a8a] uppercase tracking-widest mt-1 block">
                          {file.type === 'pdf' ? 'DOCUMENT' : 'IMAGE'}
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

      {/* The Secure Modal */}
      <SecureFileViewer 
        isOpen={!!selectedFile} 
        file={selectedFile} 
        onClose={() => setSelectedFile(null)} 
      />
      
    </section>
  );
}
