import React, { useState } from 'react';
import { Search, Sparkles, Filter, X, Image, Video, Music, User, FolderHeart, Calendar } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { MediaItem } from '../types';

interface GlobalSearchProps {
  onSelectMedia: (item: MediaItem) => void;
  onSelectTab: (tab: string) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ onSelectMedia, onSelectTab }) => {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  const sampleQueries = language === 'hi' ? [
    'दीवाली की यादें',
    'गरबा वीडियो 2025',
    'कुणाल द्वारा अपलोड',
    'शाम की आरती'
  ] : [
    'Diwali Memories',
    'Garba Video 2025',
    'Uploaded by Kunal',
    'Evening Aarti Bhajan'
  ];

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setHasSearched(true);

    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      const data = await res.json();
      setResults(data.results || []);
      setAiExplanation(data.explanation || null);
    } catch (err) {
      console.error('Search error', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setAiExplanation(null);
  };

  return (
    <div className="w-full relative">
      <div className="relative flex items-center">
        <div className="absolute left-4 pointer-events-none text-amber-700 dark:text-amber-400">
          <Search className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.searchPlaceholder}
          className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white/95 dark:bg-stone-900/95 border-2 border-amber-300 dark:border-amber-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 shadow-sm focus:outline-none focus:ring-3 focus:ring-amber-500/40 text-sm font-medium transition-all"
        />

        <div className="absolute right-2.5 flex items-center gap-1.5">
          {query && (
            <button
              onClick={clearSearch}
              className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              aria-label="Clear Search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => handleSearch()}
            disabled={isSearching}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSearching ? t.loading : t.searchButton}</span>
          </button>
        </div>
      </div>

      {/* Suggested Quick Searches */}
      <div className="flex flex-wrap items-center gap-2 mt-2 px-1 text-xs text-stone-500 dark:text-stone-400">
        <span className="font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          {language === 'hi' ? 'सुझाव:' : 'Try:'}
        </span>
        {sampleQueries.map((sq, i) => (
          <button
            key={i}
            onClick={() => {
              setQuery(sq);
              handleSearch(sq);
            }}
            className="px-2.5 py-1 rounded-full bg-amber-100/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-200 dark:hover:bg-stone-700 transition-colors"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Search Results Dropdown/Overlay */}
      {hasSearched && (
        <div className="mt-3 p-4 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-amber-200 dark:border-stone-800 animate-in fade-in slide-in-from-top-2 z-30">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
            <div>
              <h4 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                <span>{t.searchResults}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  {results.length} found
                </span>
              </h4>
              {aiExplanation && (
                <p className="text-xs text-amber-800 dark:text-amber-400 mt-0.5">
                  ✨ {aiExplanation}
                </p>
              )}
            </div>

            <button
              onClick={clearSearch}
              className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 font-medium"
            >
              {t.close}
            </button>
          </div>

          {results.length === 0 ? (
            <div className="py-8 text-center text-stone-500 dark:text-stone-400 text-sm">
              <Search className="w-8 h-8 mx-auto mb-2 text-stone-300 dark:text-stone-600" />
              <p>{t.noResultsFound}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-3 max-h-96 overflow-y-auto p-1">
              {results.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectMedia(item)}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-amber-100 dark:border-stone-800 hover:bg-amber-50 dark:hover:bg-stone-800/80 cursor-pointer transition-all group"
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0 relative">
                    {item.type === 'photo' ? (
                      <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : item.type === 'video' ? (
                      <div className="w-full h-full flex items-center justify-center bg-red-950 text-red-200">
                        <Video className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-purple-950 text-purple-200">
                        <Music className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate group-hover:text-red-700 dark:group-hover:text-amber-400">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                      {item.folderName} • {item.uploadDate}
                    </p>
                    {item.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                          {item.tags[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
