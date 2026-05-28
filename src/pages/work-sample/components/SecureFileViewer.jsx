import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Image as ImageIcon, ChevronLeft, ChevronRight, Layers } from "lucide-react";

export function SecureFileViewer({ isOpen, onClose, file }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      setCurrentIndex(0); // reset index when a file opens
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  const isPDF = file.type === "pdf";
  const isGallery = file.type === "gallery";

  // Add toolbar=0 to PDF urls to hide default browser controls
  const fileUrl = isPDF 
    ? `${file.url}#toolbar=0&navpanes=0&scrollbar=0` 
    : (isGallery ? file.urls[currentIndex] : file.url);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : file.urls.length - 1));
  };
  
  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev < file.urls.length - 1 ? prev + 1 : 0));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0C0C0B]/90 backdrop-blur-xl p-4 md:p-8 lg:p-12"
          // Prevent right-click on the backdrop
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full h-full max-w-7xl max-h-full bg-[#111] rounded-2xl md:rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
          >
            {/* Header Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161616]">
              <div className="flex items-center gap-3">
                {isPDF ? (
                  <FileText className="w-5 h-5 text-gray-400" />
                ) : isGallery ? (
                  <Layers className="w-5 h-5 text-gray-400" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                )}
                <div className="flex flex-col">
                  <h3 className="font-['Outfit'] font-semibold text-[14px] md:text-[16px] text-white tracking-wide">
                    {file.title}
                  </h3>
                  <span className="font-['Outfit'] text-[10px] md:text-[11px] text-gray-400 uppercase tracking-widest">
                    {isPDF ? "DOCUMENT PREVIEW" : isGallery ? `IMAGE GALLERY (${currentIndex + 1} OF ${file.urls.length})` : "IMAGE PREVIEW"}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Viewer Content Area */}
            <div className="relative flex-1 w-full h-full bg-[#050505] overflow-hidden flex items-center justify-center">
              
              {/* Invisible Shield Overlay to prevent dragging/saving for images */}
              {!isPDF && (
                <div 
                  className="absolute inset-0 z-10 cursor-default" 
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                />
              )}

              {isPDF ? (
                <iframe
                  src={fileUrl}
                  className="w-full h-full border-none relative z-0"
                  title={file.title}
                />
              ) : (
                <>
                  <img
                    key={fileUrl} // Re-render image when url changes
                    src={fileUrl}
                    alt={file.title}
                    className="w-full h-full object-contain relative z-0 select-none pointer-events-none"
                    draggable="false"
                  />
                  
                  {/* Gallery Controls */}
                  {isGallery && file.urls.length > 1 && (
                    <>
                      <button 
                        onClick={handlePrev}
                        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all z-20 border border-white/10 pointer-events-auto"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={handleNext}
                        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all z-20 border border-white/10 pointer-events-auto"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
