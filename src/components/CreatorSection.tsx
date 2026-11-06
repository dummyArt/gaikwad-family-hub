import React from 'react';
import { Crown, Sparkles, Heart, Shield, Award, Mail, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const CreatorSection: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#FFFBF2] via-[#FAF3E0] to-[#FFF9ED] dark:from-[#241714] dark:via-[#1c1210] dark:to-[#170e0b] border-2 border-amber-300 dark:border-amber-700/60 shadow-xl">
      
      {/* Decorative Gold Leaf Corner Embellishments */}
      <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
        <Crown className="w-24 h-24 text-amber-600" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
        
        {/* Creator Dedication Plaque Photo (User uploaded asset) */}
        <div className="w-full sm:w-80 md:w-96 rounded-2xl overflow-hidden shadow-lg border-2 border-amber-400 bg-white dark:bg-stone-900 p-2 shrink-0 group">
          <div className="rounded-xl overflow-hidden relative">
            <img
              src="/assets/aistudio/image_adabae82.png"
              alt="Created & Managed By Kunal Saxena - Gaikwad Family"
              className="w-full h-auto object-contain group-hover:scale-102 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Creator Bio & Permissions Details */}
        <div className="flex-1 space-y-3 text-center md:text-left">
          
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-red-700 to-amber-600 text-white font-extrabold text-xs shadow-sm uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>{t.creatorBadge}</span>
          </div>

          <h3 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 dark:text-amber-100">
            {t.createdBy}
          </h3>

          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            {language === 'hi'
              ? 'यह डिजिटल परिवार पोर्टल हमारे गायकवाड़ परिवार के इतिहास, अमूल्य यादों, उत्सवों और आने वाली पीढ़ियों के मार्गदर्शन के लिए विशेष रूप से तैयार किया गया है। यहाँ हमारी हर पुरानी और नई तस्वीर, वीडियो और मधुर स्वर हमेशा सुरक्षित और जीवंत रहेंगे।'
              : 'This digital home was envisioned and engineered to preserve the rich heritage, milestone celebrations, and heartfelt memories of the Gaikwad Family in original quality for generations to come.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-bold bg-amber-100 dark:bg-amber-950/70 px-3 py-1.5 rounded-xl border border-amber-300/60">
              <Shield className="w-3.5 h-3.5 text-amber-700" />
              <span>Super Admin Management</span>
            </div>

            <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 font-semibold bg-white dark:bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700">
              <Award className="w-3.5 h-3.5 text-red-600" />
              <span>Full Stack Family Architecture</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
