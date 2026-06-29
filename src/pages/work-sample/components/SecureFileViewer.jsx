import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Image as ImageIcon, ChevronLeft, ChevronRight, Layers, Loader2 } from "lucide-react";
import { Document, Page, pdfjs } from 'react-pdf';

function LazyPage({ pageNumber, width, devicePixelRatio }) {
  const [isVisible, setIsVisible] = useState(pageNumber <= 2);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { rootMargin: '100% 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref} 
      style={!isLoaded ? { minHeight: `${width * 0.75}px` } : {}} 
      className={`w-full flex justify-center mb-4 md:mb-8 max-w-full ${isLoaded ? 'shadow-[0_0_30px_rgba(0,0,0,0.8)]' : 'bg-white/5'}`}
    >
      {isVisible && (
        <Page
          pageNumber={pageNumber}
          width={width}
          devicePixelRatio={devicePixelRatio}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          onLoadSuccess={() => setIsLoaded(true)}
          className="max-w-full"
        />
      )}
    </div>
  );
}
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export function SecureFileViewer({ isOpen, onClose, file }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [numPages, setNumPages] = useState(null);
  
  // Custom download state
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [objectUrl, setObjectUrl] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const isPDF = file?.type === "pdf";
  const isGallery = file?.type === "gallery";

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      setCurrentIndex(0); // reset index when a file opens
      setNumPages(null); // reset pdf pages
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isOpen, file]);

  // XHR Fetch Logic for tracking progress
  useEffect(() => {
    if (!isOpen || !file) return;

    let urlToFetch = isGallery ? file.urls[currentIndex] : file.url;
    
    setIsDownloading(true);
    setDownloadProgress(0);
    setTimeRemaining(null);
    setElapsedSeconds(0);

    // Live elapsed-time ticker — always gives user feedback even when
    // Content-Length is missing and speed can't be calculated.
    const elapsedInterval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    // Clean up previous blob URL
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl.split('#')[0]);
      setObjectUrl(null);
    }

    const xhr = new XMLHttpRequest();
    xhr.open("GET", urlToFetch, true);
    xhr.responseType = "blob";
    
    let startTime = Date.now();
    let speedSamples = [];
    
    // Fallback: If Vercel caches the file or strips the Content-Length header, 
    // real progress won't fire. This interval creates a smooth "fake" progress 
    // that slows down as it approaches 90%, ensuring the UI never feels stuck.
    let fakeProgressInterval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 90) return 90;
        return prev + (90 - prev) * 0.15;
      });
    }, 250);

    xhr.onprogress = (event) => {
      if (event.lengthComputable) {
        // We have real progress data, so clear the fake interval!
        clearInterval(fakeProgressInterval);
        
        const percentComplete = (event.loaded / event.total) * 100;
        setDownloadProgress(percentComplete);
        
        const elapsedTime = (Date.now() - startTime) / 1000; // seconds
        if (elapsedTime > 0.5) {
          const currentSpeed = event.loaded / elapsedTime; // bytes per second
          speedSamples.push(currentSpeed);
          // Average the last 5 speed samples for stability
          if (speedSamples.length > 5) speedSamples.shift();
          const avgSpeed = speedSamples.reduce((a, b) => a + b, 0) / speedSamples.length;
          
          const remainingBytes = event.total - event.loaded;
          const remainingTime = remainingBytes / avgSpeed;
          setTimeRemaining(remainingTime);
        }
      }
    };

    xhr.onload = () => {
      clearInterval(fakeProgressInterval);
      clearInterval(elapsedInterval);
      
      if (xhr.status === 200 || xhr.status === 0) {
        const blob = xhr.response;
        const blobUrl = URL.createObjectURL(blob);
        
        // Force the bar to 100% so the user visually sees it complete
        setDownloadProgress(100);
        setTimeRemaining(0);
        
        // Wait 400ms to allow the CSS animation to smoothly fill the bar 
        // before we hide the loading screen and render the document.
        setTimeout(() => {
          if (isPDF) {
            setObjectUrl(`${blobUrl}#toolbar=0&navpanes=0&scrollbar=0`);
          } else {
            setObjectUrl(blobUrl);
          }
          setIsDownloading(false);
        }, 400);
        
      } else {
        setIsDownloading(false);
        setObjectUrl(isPDF ? `${urlToFetch}#toolbar=0&navpanes=0&scrollbar=0` : urlToFetch);
      }
    };

    xhr.onerror = () => {
      clearInterval(fakeProgressInterval);
      clearInterval(elapsedInterval);
      setIsDownloading(false);
      setObjectUrl(isPDF ? `${urlToFetch}#toolbar=0&navpanes=0&scrollbar=0` : urlToFetch);
    };

    xhr.send();

    return () => {
      clearInterval(fakeProgressInterval);
      clearInterval(elapsedInterval);
      xhr.abort();
    };
  }, [isOpen, file, currentIndex]);

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl.split('#')[0]);
      }
    };
  }, [objectUrl]);

  if (!isOpen || !file) return null;

  const handlePrev = (e) => {
    e.stopPropagation();
    if (!isDownloading) {
      setCurrentIndex(prev => (prev > 0 ? prev - 1 : file.urls.length - 1));
    }
  };
  
  const handleNext = (e) => {
    e.stopPropagation();
    if (!isDownloading) {
      setCurrentIndex(prev => (prev < file.urls.length - 1 ? prev + 1 : 0));
    }
  };

  // Helper to format time
  const formatTime = (seconds) => {
    if (!seconds || !isFinite(seconds) || seconds < 1) return "Less than a second";
    if (seconds < 60) return `${Math.ceil(seconds)} seconds`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.ceil(seconds % 60);
    return `${mins}m ${secs}s`;
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
          onContextMenu={(e) => e.preventDefault()}
          onWheel={(e) => e.stopPropagation()}
          data-lenis-prevent="true"
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
              
              {!isPDF && (
                <div 
                  className="absolute inset-0 z-10 cursor-default" 
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                />
              )}

              {isDownloading ? (
                /* Custom Progress Bar UI */
                <div className="flex flex-col items-center justify-center w-full max-w-md px-8 gap-6 z-20">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-10 h-10 animate-spin text-white/40 mb-2" />
                    <span className="font-['Outfit'] text-[12px] md:text-[14px] tracking-[0.25em] uppercase font-bold text-white">
                      DOWNLOADING ASSET
                    </span>
                    <span className="font-['Outfit'] text-[10px] text-gray-400 tracking-wider">
                      Please Wait..
                    </span>
                  </div>
                  
                  {/* Progress Bar Container */}
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                    <motion.div 
                      className="absolute left-0 top-0 h-full bg-[#16a34a]"
                      initial={{ width: 0 }}
                      animate={{ width: `${downloadProgress}%` }}
                      transition={{ ease: "linear", duration: 0.2 }}
                    />
                  </div>
                  <div className="w-full flex justify-center font-['Outfit'] text-[10px] text-gray-500 font-medium">
                    <span className="text-white">{Math.round(downloadProgress)}%</span>
                  </div>
                </div>
              ) : objectUrl ? (
                /* Loaded Content */
                isPDF ? (
                  <div 
                    className="w-full h-full overflow-y-auto bg-[#050505] flex flex-col items-center py-4 md:py-8 touch-pan-y" 
                    style={{ WebkitOverflowScrolling: 'touch' }}
                    data-lenis-prevent="true"
                    onWheel={(e) => e.stopPropagation()}
                  >
                    <Document
                      file={objectUrl}
                      onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                      loading={null}
                    >
                      {Array.from(new Array(numPages || 0), (el, index) => (
                        <LazyPage
                          key={`page_${index + 1}`}
                          pageNumber={index + 1}
                          width={typeof window !== 'undefined' ? (window.innerWidth < 768 ? window.innerWidth - 32 : Math.min(window.innerWidth - 120, 1000)) : 800}
                          devicePixelRatio={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1}
                        />
                      ))}
                    </Document>
                  </div>
                ) : (
                  <>
                    <img
                      key={objectUrl}
                      src={objectUrl}
                      alt={file.title}
                      className="w-full h-full object-contain relative z-10 select-none pointer-events-none"
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
                )
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
