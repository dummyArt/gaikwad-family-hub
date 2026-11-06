import React from 'react';
import { Crown, Heart, Sparkles, Shield, Smartphone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onInstallApp: () => void;
  onSelectTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onInstallApp, onSelectTab }) => {
  const { t, language } = useLanguage();

  return (
    <footer className="mt-16 bg-gradient-to-b from-[#FAF6EE] to-[#F5ECE0] dark:from-[#1c1210] dark:to-[#130b0a] border-t-2 border-amber-300 dark:border-amber-900/60 transition-colors">
      
      {/* Decorative Rangoli Pattern Divider */}
      <div className="h-1.5 w-full bg-gradient-to-r from-red-700 via-amber-500 to-red-700" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
          
          {/* Brand & Crest */}
          <div className="space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-700 to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                GF
              </div>
              <h3 className="font-heading font-black text-xl text-stone-900 dark:text-amber-100">
                GAIKWAD FAMILY
              </h3>
            </div>
            <p className="text-xs text-amber-900/90 dark:text-amber-300 font-semibold">
              {language === 'hi' ? 'हमारा परिवार • हमारी यादें • हमारी खुशी ❤️' : 'One Family. One Place. Infinite Memories ❤️'}
            </p>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 max-w-sm">
              {language === 'hi'
                ? 'सभी पारिवारिक तस्वीरों, वीडियो, ऑडियो रिकॉर्डिंग और दस्तावेज़ों को मूल गुणवत्ता में सुरक्षित रखने का विश्वसनीय माध्यम।'
                : 'A sacred digital home safeguarding family photographs, videos, audio recordings and heritage in original quality.'}
            </p>
          </div>

          {/* Quick Nav Links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold text-stone-700 dark:text-stone-300">
            <button onClick={() => onSelectTab('home')} className="hover:text-red-700 dark:hover:text-amber-400">{t.navHome}</button>
            <button onClick={() => onSelectTab('photos')} className="hover:text-red-700 dark:hover:text-amber-400">{t.navPhotos}</button>
            <button onClick={() => onSelectTab('videos')} className="hover:text-red-700 dark:hover:text-amber-400">{t.navVideos}</button>
            <button onClick={() => onSelectTab('music')} className="hover:text-red-700 dark:hover:text-amber-400">{t.navMusic}</button>
            <button onClick={() => onSelectTab('albums')} className="hover:text-red-700 dark:hover:text-amber-400">{t.navAlbums}</button>
            <button onClick={() => onSelectTab('members')} className="hover:text-red-700 dark:hover:text-amber-400">{t.navMembers}</button>
            <button onClick={() => onSelectTab('contacts')} className="hover:text-red-700 dark:hover:text-amber-400">{t.navContacts}</button>
          </div>

          {/* PWA & Install action */}
          <div className="flex flex-col items-center md:items-end space-y-2.5">
            <button
              onClick={onInstallApp}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs shadow-md transform hover:scale-105 transition-all"
            >
              <Smartphone className="w-4 h-4" />
              <span>{t.tickerInstallApp}</span>
            </button>
            <p className="text-[10px] text-stone-500 text-center md:text-right">
              PWA Ready • Installable on Android, iPhone & Desktop
            </p>
          </div>

        </div>

        {/* Prominent Creator Credit Banner in Footer */}
        <div className="mt-8 pt-6 border-t border-amber-200/80 dark:border-stone-800/80 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-amber-100/70 dark:bg-stone-800/80 border border-amber-300 dark:border-stone-700 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-950 dark:text-amber-200">
              <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span className="text-sm font-heading font-extrabold">{t.createdBy}</span>
            </div>
            <span className="hidden sm:inline text-amber-400">•</span>
            <span className="text-xs font-semibold text-amber-900/80 dark:text-amber-300">
              Super Admin & Architecture
            </span>
          </div>

          <p className="mt-3 text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-center gap-1">
            <span>© {new Date().getFullYear()} Gaikwad Family. Blessed by our elders with infinite love</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" />
          </p>
        </div>

      </div>
    </footer>
  );
};
