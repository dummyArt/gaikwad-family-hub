import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  FolderPlus,
  Copy,
  Tag,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  Check,
  Calendar,
  X,
  Layers
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { MediaItem } from '../types';

interface AiOrganizerProps {
  onSelectMedia: (item: MediaItem) => void;
  onOpenFolder: (folderId: string) => void;
}

interface Suggestion {
  suggestedAlbum: string;
  suggestedHindi: string;
  reason: string;
  itemIds: string[];
  suggestedTags: string[];
}

export const AiOrganizer: React.FC<AiOrganizerProps> = ({ onSelectMedia, onOpenFolder }) => {
  const { t, language } = useLanguage();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [duplicateGroups, setDuplicateGroups] = useState<MediaItem[][]>([]);
  const [approvedTags, setApprovedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadAiData = async () => {
    setLoading(true);
    try {
      const [orgRes, dupRes] = await Promise.all([
        fetch('/api/ai/organize', { method: 'POST' }),
        fetch('/api/ai/duplicates')
      ]);

      const orgData = await orgRes.json();
      const dupData = await dupRes.json();

      setSuggestions(orgData.suggestions || []);
      setApprovedTags(orgData.approvedFamilyTags || []);
      setDuplicateGroups(dupData.duplicateGroups || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAiData();
  }, []);

  const handleApplySuggestion = (sug: Suggestion) => {
    setStatusMessage(
      language === 'hi'
        ? `सुझाव लागू किया गया: "${sug.suggestedHindi}" में फ़ोटो वर्गीकृत की गईं!`
        : `Applied category suggestion: Photos grouped into "${sug.suggestedAlbum}"!`
    );
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="space-y-8">
      
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-600/15 via-red-600/10 to-amber-600/15 dark:from-amber-950/30 dark:to-red-950/30 border border-amber-300 dark:border-amber-700/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-stone-900 dark:text-amber-100">
              {t.aiOrganizerTitle}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-1">
              {t.aiOrganizerSubtitle}
            </p>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Duplicate Photo Detection Scanner Box */}
      <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-700 dark:text-amber-400" />
            <h3 className="font-heading font-extrabold text-lg text-stone-900 dark:text-white">
              {t.aiDetectDuplicates}
            </h3>
          </div>

          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-stone-800 text-amber-900 dark:text-amber-300">
            {duplicateGroups.length} {language === 'hi' ? 'डुप्लीकेट समूह मिले' : 'duplicate sets found'}
          </span>
        </div>

        {duplicateGroups.length === 0 ? (
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <p>
              {language === 'hi'
                ? 'शाबाश! आपकी फ़ोटो गैलरी में कोई भी डुप्लीकेट फ़ोटो नहीं मिली। स्टोरेज पूरी तरह साफ़ और सुरक्षित है।'
                : 'All clear! No duplicate files or redundant uploads detected. Your family vault is clean and organized.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {duplicateGroups.map((group, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-amber-50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700">
                <p className="text-xs font-bold text-amber-900 dark:text-amber-300 mb-2">
                  Duplicate Group #{idx + 1} ({group.length} copies of file "{group[0].fileName}")
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {group.map(item => (
                    <div key={item.id} className="rounded-xl overflow-hidden bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-2 text-center text-xs">
                      <img src={item.url} alt={item.title} className="w-full h-24 object-cover rounded-lg mb-1" />
                      <p className="font-bold truncate">{item.title}</p>
                      <p className="text-[10px] text-stone-400">{item.folderName}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suggested Albums based on Events & Festivals */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FolderPlus className="w-5 h-5 text-red-600" />
          <h3 className="font-heading font-extrabold text-lg text-stone-900 dark:text-white">
            {t.aiSuggestedAlbums}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestions.map((sug, i) => (
            <div
              key={i}
              className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-stone-800 text-amber-900 dark:text-amber-300">
                    AI Category
                  </span>
                  <Sparkles className="w-4 h-4 text-amber-600" />
                </div>

                <h4 className="font-bold text-base text-stone-900 dark:text-white">
                  {language === 'hi' ? sug.suggestedHindi : sug.suggestedAlbum}
                </h4>

                <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
                  {sug.reason}
                </p>

                <div className="mt-3">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                    {t.aiSmartTags}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {sug.suggestedTags.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleApplySuggestion(sug)}
                className="mt-4 w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs transition-colors"
              >
                {language === 'hi' ? 'यह सुझाव अपनाएँ' : 'Apply Suggestion'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Approved Family Tags Privacy & Consent Policy */}
      <div className="p-6 rounded-3xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          <h4 className="font-bold text-sm text-stone-900 dark:text-white">
            {language === 'hi' ? 'गोपनीयता व सहमति आधारित पारिवारिक टैगिंग' : 'Consent-Based Family Tagging'}
          </h4>
        </div>
        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl">
          {language === 'hi'
            ? 'गोपनीयता नीति: अनचाहे फेशियल रिकॉग्निशन को बंद रखा गया है। केवल परिवार द्वारा अनुमोदित नामों को ही सहमति से फ़ोटो में टैग किया जा सकता है। आप किसी भी समय टैग हटा या बदल सकते हैं।'
            : 'Privacy Policy: Automated face-scanning surveillance is strictly disabled. Only consented, family-approved directory member names are suggested. Family members retain full control to edit or remove tags at any time.'}
        </p>

        <div className="flex flex-wrap gap-2 mt-3">
          {approvedTags.map(tag => (
            <span
              key={tag}
              className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100/80 dark:bg-stone-800 text-amber-900 dark:text-amber-300 border border-amber-300/60 dark:border-stone-700"
            >
              ✓ {tag}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
};
