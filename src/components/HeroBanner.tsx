import React, { useState } from 'react';
import { Sparkles, Maximize2, Download, Eye, Plus, Crown, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HeroBannerProps {
  onOpenUpload: (defaultFolderId?: string) => void;
  onViewFullscreen: (url: string, title: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onOpenUpload, onViewFullscreen }) => {
  const { t, language } = useLanguage();
  const [isEnhanced, setIsEnhanced] = useState(true);

  // Main banner photograph uploaded by the user
  const bannerImageSrc = '/assets/aistudio/3dc5a3de-e3e6-4517-ac18-ddb6dbeaa18b_1ff0570f.png';

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-2xl border-2 border-amber-300/80 dark:border-amber-700/60 bg-gradient-to-b from-[#FFFBEF] via-[#FDF5E6] to-[#FCEFD6] dark:from-[#211512] dark:via-[#1c110e] dark:to-[#170e0b]">
      
      {/* Top Auspicious Festive Toran / Marigold Floral Garlands */}
      <div className="absolute top-0 left-0 right-0 h-6 flex justify-between items-center px-4 overflow-hidden z-20 pointer-events-none opacity-90">
        <div className="flex space-x-3 text-sm">
          <span>🌼</span><span>🌺</span><span>🌼</span><span>🌸</span><span>🌼</span>
        </div>
        <div className="flex space-x-3 text-sm">
          <span>🌼</span><span>🌺</span><span>🌼</span><span>🌸</span><span>🌼</span>
        </div>
        <div className="flex space-x-3 text-sm">
          <span>🌼</span><span>🌺</span><span>🌼</span><span>🌸</span><span>🌼</span>
        </div>
      </div>

      {/* Main Banner Visual Container */}
      <div className="relative w-full aspect-16/9 sm:aspect-21/9 min-h-[360px] max-h-[580px] overflow-hidden group">
        
        {/* The Family Elders Banner Photograph */}
        <img
          src={bannerImageSrc}
          alt="Gaikwad Family Elders and Members"
          className={`w-full h-full object-cover sm:object-contain md:object-cover transition-all duration-700 ${
            isEnhanced
              ? 'brightness-105 contrast-105 saturate-110 filter drop-shadow-md'
              : 'brightness-100 contrast-100 saturate-100'
          }`}
        />

        {/* Traditional Vignette & Warm Golden Lighting */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-900/20 to-stone-950/40 pointer-events-none" />

        {/* Left Floating Sacred Quote */}
        <div className="hidden lg:flex absolute left-6 bottom-8 flex-col items-start z-10 pointer-events-none drop-shadow-lg">
          <div className="bg-stone-950/75 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-400/40 text-amber-200">
            <p className="font-serif font-bold text-base sm:text-lg tracking-wide flex items-center gap-1.5">
              <span>साथ हैं तो सब कुछ हैं...</span>
              <span className="text-red-500 animate-pulse">❤️</span>
            </p>
            <p className="text-[11px] text-amber-300/80 font-sans">
              Family is our greatest blessing
            </p>
          </div>
        </div>

        {/* Right Floating Sacred Quote */}
        <div className="hidden lg:flex absolute right-6 bottom-8 flex-col items-end z-10 pointer-events-none drop-shadow-lg">
          <div className="bg-stone-950/75 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-400/40 text-amber-200 text-right">
            <p className="font-serif font-bold text-base sm:text-lg tracking-wide flex items-center gap-1.5 justify-end">
              <span>एक परिवार...</span>
              <span className="text-amber-400 font-extrabold">सदा के लिए...</span>
            </p>
            <p className="text-[11px] text-amber-300/80 font-sans">
              United forever in love and respect
            </p>
          </div>
        </div>

        {/* Top-Right Quick Controls on Banner */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          
          {/* Enhance clarity toggle */}
          <button
            onClick={() => setIsEnhanced(!isEnhanced)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-md transition-all ${
              isEnhanced
                ? 'bg-amber-500 text-stone-950 border border-amber-300 font-bold'
                : 'bg-stone-900/80 text-white border border-white/20 hover:bg-stone-800'
            }`}
            title="Toggle HD Clarity Enhancement"
            aria-label="Toggle HD Clarity Enhancement"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isEnhanced ? t.enhanced : t.enhancePhoto}</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={() => onViewFullscreen(bannerImageSrc, 'Gaikwad Family Grand Portrait')}
            className="p-2 rounded-full bg-stone-900/80 hover:bg-stone-800 text-amber-300 border border-amber-400/40 backdrop-blur-md transition-all shadow-md"
            title="View Fullscreen"
            aria-label="View Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Download Original Quality */}
          <a
            href={bannerImageSrc}
            download="gaikwad_family_elders_grand_photo.png"
            className="p-2 rounded-full bg-amber-600 hover:bg-amber-500 text-white backdrop-blur-md transition-all shadow-md"
            title="Download Original Quality"
            aria-label="Download Original Quality"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>

        {/* Bottom Left Festive Diya & Swastik Badge */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 drop-shadow-md">
          <span className="text-2xl animate-bounce">🪔</span>
          <span className="text-xs font-bold text-amber-200 bg-stone-900/70 backdrop-blur-xs px-3 py-1 rounded-full border border-amber-500/40">
            शुभ व मंगलमय
          </span>
        </div>

        {/* Bottom Right Children Photo Prompt Button */}
        <div className="absolute bottom-4 right-4 z-20">
          <button
            onClick={() => onOpenUpload('f-childhood')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-lg border border-amber-200 transition-all transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addChildPhoto}</span>
          </button>
        </div>

      </div>

      {/* Welcome Message Card Below Banner */}
      <div className="p-4 sm:p-6 text-center border-t border-amber-200/80 dark:border-amber-900/40">
        <h3 className="text-lg sm:text-xl font-heading font-extrabold text-stone-900 dark:text-amber-100">
          {t.welcomeTitle}
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-3xl mx-auto leading-relaxed">
          {t.welcomeSubtitle}
        </p>
      </div>

    </div>
  );
};
