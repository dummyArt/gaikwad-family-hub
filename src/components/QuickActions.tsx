import React from 'react';
import {
  Image,
  Video,
  Music,
  FolderOpen,
  Users,
  Contact,
  Star,
  Settings,
  Sparkles,
  Heart,
  Smile,
  Smartphone
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface QuickActionsProps {
  onSelectAction: (actionId: string) => void;
  onInstallApp: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onSelectAction, onInstallApp }) => {
  const { t, language } = useLanguage();

  const actions = [
    {
      id: 'photos',
      title: t.quickPhotoGallery,
      subtitle: language === 'hi' ? 'सभी तस्वीरें' : 'All Photos',
      icon: Image,
      color: 'from-amber-400 to-amber-600',
      iconColor: 'text-amber-800'
    },
    {
      id: 'videos',
      title: t.quickVideoLibrary,
      subtitle: language === 'hi' ? 'यादगार वीडियो' : 'Video Moments',
      icon: Video,
      color: 'from-red-500 to-rose-700',
      iconColor: 'text-red-800'
    },
    {
      id: 'music',
      title: t.quickMusic,
      subtitle: language === 'hi' ? 'भजन व संगीत' : 'Songs & Bhajans',
      icon: Music,
      color: 'from-purple-500 to-indigo-700',
      iconColor: 'text-purple-800'
    },
    {
      id: 'albums',
      title: t.quickAlbums,
      subtitle: language === 'hi' ? '१४ पारिवारिक फ़ोल्डर' : '14 Folders',
      icon: FolderOpen,
      color: 'from-amber-500 to-yellow-600',
      iconColor: 'text-amber-900'
    },
    {
      id: 'members',
      title: t.quickMembers,
      subtitle: language === 'hi' ? 'सभी सदस्य' : 'Family Tree',
      icon: Users,
      color: 'from-blue-500 to-sky-700',
      iconColor: 'text-blue-800'
    },
    {
      id: 'contacts',
      title: t.quickContacts,
      subtitle: language === 'hi' ? 'फ़ोन व पता' : 'Phone & Address',
      icon: Contact,
      color: 'from-emerald-500 to-teal-700',
      iconColor: 'text-emerald-800'
    },
    {
      id: 'memories',
      title: t.quickMemories,
      subtitle: language === 'hi' ? 'पसंदीदा पल' : 'Star Highlights',
      icon: Star,
      color: 'from-amber-400 to-orange-600',
      iconColor: 'text-orange-900'
    },
    {
      id: 'admin',
      title: t.quickSettings,
      subtitle: language === 'hi' ? 'एडमिन व सुरक्षा' : 'Admin & Security',
      icon: Settings,
      color: 'from-stone-500 to-stone-700',
      iconColor: 'text-stone-800'
    }
  ];

  return (
    <div className="space-y-4">
      {/* 8 Rounded Quick Access Cards matching the user's reference UI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => onSelectAction(act.id)}
              className="group relative flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-[#FFFDF8] via-[#FAF5E8] to-[#F5ECE0] dark:from-[#241714] dark:via-[#1f1412] dark:to-[#1a100e] border border-amber-300/70 dark:border-amber-800/50 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 select-none cursor-pointer"
            >
              {/* Icon Container with glossy Indian gold background */}
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-stone-800 shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200 border border-amber-200 dark:border-stone-700">
                <Icon className={`w-6 h-6 ${act.iconColor} dark:text-amber-400`} />
              </div>

              {/* Title & Subtitle */}
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-red-800 dark:group-hover:text-amber-300 text-center transition-colors">
                {act.title}
              </span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 text-center font-medium">
                {act.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* Traditional Marquee Status Bar / Ticker (as shown in reference image) */}
      <div className="rounded-2xl bg-gradient-to-r from-red-900 via-amber-950 to-red-950 text-amber-100 px-4 py-2.5 shadow-md border border-amber-600/40 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-semibold select-none">
        
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-red-400 fill-red-400 animate-pulse" />
            <span>{t.tickerStrength}</span>
          </div>

          <span className="hidden md:inline text-amber-500/60">|</span>

          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>{t.tickerTogether}</span>
          </div>

          <span className="hidden md:inline text-amber-500/60">|</span>

          <div className="flex items-center gap-1.5">
            <Smile className="w-4 h-4 text-amber-300" />
            <span>{t.tickerSmile}</span>
          </div>
        </div>

        {/* Install PWA Button on Right */}
        <button
          onClick={onInstallApp}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold text-xs shadow-md transform hover:scale-105 transition-all"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{t.tickerInstallApp}</span>
        </button>

      </div>
    </div>
  );
};
