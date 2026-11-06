import React, { useState, useEffect } from 'react';
import { Video, Play, Download, Upload, Calendar, Clock, User, Plus, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { MediaItem } from '../types';

interface VideoLibraryProps {
  onOpenUpload: (defaultFolderId?: string) => void;
}

export const VideoLibrary: React.FC<VideoLibraryProps> = ({ onOpenUpload }) => {
  const { t, language } = useLanguage();
  const { currentUser } = useAuth();

  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<MediaItem | null>(null);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media?type=video');
      const data = await res.json();
      setVideos(data.media || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-red-600/10 via-amber-500/10 to-rose-600/10 dark:from-red-950/20 dark:to-amber-950/20 border border-red-300/60 dark:border-red-900/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎬</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-stone-900 dark:text-amber-100">
              {t.videosTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-1">
            {t.videosSubtitle}
          </p>
        </div>

        <button
          onClick={() => onOpenUpload('f-videos')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-700 to-rose-800 hover:from-red-600 hover:to-rose-700 text-white font-bold text-sm shadow-lg shadow-red-900/20 transition-all select-none"
        >
          <Upload className="w-4 h-4" />
          <span>{t.uploadVideo}</span>
        </button>
      </div>

      {/* Videos Grid */}
      {loading ? (
        <div className="py-20 text-center text-stone-500">{t.loading}</div>
      ) : videos.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-stone-900 rounded-3xl border border-dashed border-red-300 dark:border-stone-800 p-8">
          <Video className="w-12 h-12 mx-auto text-red-400 mb-3" />
          <h3 className="font-bold text-base text-stone-800 dark:text-stone-200">
            {language === 'hi' ? 'अभी कोई पारिवारिक वीडियो नहीं है' : 'No family videos uploaded yet'}
          </h3>
          <button
            onClick={() => onOpenUpload('f-videos')}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-700 text-white font-bold text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t.uploadVideo}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((vid) => (
            <div
              key={vid.id}
              className="group rounded-2xl overflow-hidden bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Thumbnail / Play Preview */}
              <div
                onClick={() => setActiveVideo(vid)}
                className="aspect-16/9 w-full bg-stone-950 relative overflow-hidden cursor-pointer"
              >
                {vid.thumbnailUrl ? (
                  <img
                    src={vid.thumbnailUrl}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-stone-900 text-stone-600">
                    <Video className="w-12 h-12" />
                  </div>
                )}

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-stone-950/40 group-hover:bg-stone-950/20 transition-colors" />

                {/* Play Button Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Duration Badge */}
                {vid.duration && (
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-white flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{Math.floor(vid.duration / 60)}:{(vid.duration % 60).toString().padStart(2, '0')}</span>
                  </div>
                )}
              </div>

              {/* Video Info & Download */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4
                    onClick={() => setActiveVideo(vid)}
                    className="font-bold text-sm text-stone-900 dark:text-stone-100 hover:text-red-700 cursor-pointer line-clamp-1"
                  >
                    {vid.title}
                  </h4>
                  {vid.description && (
                    <p className="text-xs text-stone-500 line-clamp-2 mt-1">
                      {vid.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3 text-red-700" />
                    <span>{vid.uploaderName}</span>
                  </div>

                  <a
                    href={`/api/media/download/${vid.id}`}
                    download={vid.fileName}
                    className="flex items-center gap-1 font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-400"
                    title={t.downloadVideo}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'डाउनलोड' : 'Download'}</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="relative w-full max-w-4xl bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-red-500/40">
            
            {/* Header bar */}
            <div className="p-4 bg-stone-950 flex items-center justify-between text-white border-b border-stone-800">
              <div>
                <h3 className="font-bold text-base line-clamp-1">{activeVideo.title}</h3>
                <p className="text-xs text-amber-400">{activeVideo.folderName} • {activeVideo.uploadDate}</p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`/api/media/download/${activeVideo.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.downloadVideo}</span>
                </a>

                <button
                  onClick={() => setActiveVideo(null)}
                  className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* In-Browser Video Player */}
            <div className="aspect-16/9 w-full bg-black flex items-center justify-center">
              <video
                src={activeVideo.originalUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Video Footer info */}
            {activeVideo.description && (
              <div className="p-4 bg-stone-950 text-stone-300 text-xs">
                <p>{activeVideo.description}</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
