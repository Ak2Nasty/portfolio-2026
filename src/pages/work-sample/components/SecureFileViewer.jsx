import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Image as ImageIcon } from "lucide-react";

export function SecureFileViewer({ isOpen, onClose, file }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !file) return null;

  const isPDF = file.type === "pdf";

  // Add toolbar=0 to PDF urls to hide default browser controls
  const fileUrl = isPDF ? `${file.url}#toolbar=0&navpanes=0&scrollbar=0` : file.url;

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
                ) : (
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                )}
                <div className="flex flex-col">
                  <h3 className="font-['Outfit'] font-semibold text-[14px] md:text-[16px] text-white tracking-wide">
                    {file.title}
                  </h3>
                  <span className="font-['Outfit'] text-[10px] md:text-[11px] text-gray-400 uppercase tracking-widest">
                    {isPDF ? "DOCUMENT PREVIEW" : "IMAGE PREVIEW"}
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
                <img
                  src={fileUrl}
                  alt={file.title}
                  className="w-full h-full object-contain relative z-0 select-none pointer-events-none"
                  draggable="false"
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
