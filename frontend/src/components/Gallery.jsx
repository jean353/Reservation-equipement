import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';

export default function Gallery({ images, onClose, roomName }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!images || images.length === 0) return null;

  const next = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-md transition-all duration-500 ${isFullScreen ? 'p-0' : 'p-4 md:p-8'}`}>
      {/* Header */}
      <div className="flex justify-between items-center text-white mb-4 z-10">
        <div className="flex flex-col">
          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary-400 to-indigo-400 bg-clip-text text-transparent">
            {roomName}
          </h2>
          <p className="text-gray-400 text-sm">Image {currentIndex + 1} sur {images.length}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors hidden md:block"
          >
            {isFullScreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
          </button>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
        </div>
      </div>

      {/* Main Display */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        <button 
          onClick={prev}
          className="absolute left-4 z-10 p-4 bg-white/5 hover:bg-white/15 rounded-full backdrop-blur-sm text-white transition-all group"
        >
          <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="relative w-full h-full flex items-center justify-center p-4">
          <img 
            src={`${images[currentIndex].url}`} 
            alt={`Room view ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in fade-in zoom-in-95 duration-500"
          />
        </div>

        <button 
          onClick={next}
          className="absolute right-4 z-10 p-4 bg-white/5 hover:bg-white/15 rounded-full backdrop-blur-sm text-white transition-all group"
        >
          <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Thumbnails */}
      {!isFullScreen && (
        <div className="mt-8 flex justify-center space-x-4 overflow-x-auto py-4 px-2">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setCurrentIndex(idx)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                idx === currentIndex ? 'border-primary-500 scale-110 shadow-lg shadow-primary-500/20' : 'border-transparent opacity-50 hover:opacity-100'
              }`}
            >
              <img src={`${img.url}`} className="w-full h-full object-cover" alt="thumbnail" />
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
