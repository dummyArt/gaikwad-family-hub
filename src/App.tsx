import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { QuickActions } from './components/QuickActions';
import { GlobalSearch } from './components/GlobalSearch';
import { PhotoGallery } from './components/PhotoGallery';
import { VideoLibrary } from './components/VideoLibrary';
import { MusicPlayer } from './components/MusicPlayer';
import { AlbumsSection } from './components/AlbumsSection';
import { FamilyDirectory } from './components/FamilyDirectory';
import { AiOrganizer } from './components/AiOrganizer';
import { AdminDashboard } from './components/AdminDashboard';
import { CreatorSection } from './components/CreatorSection';
import { Footer } from './components/Footer';
import { UploadModal } from './components/UploadModal';
import { AuthModal } from './components/AuthModal';
import { MediaItem } from './types';
import {
  Sparkles,
  Download,
  Maximize2,
  X,
  Upload,
  Heart,
  Calendar,
  Cake,
  Video,
  Music,
  ArrowRight
} from 'lucide-react';

function MainApp() {
  const { t, language } = useLanguage();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('home');
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(undefined);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFolderId, setUploadFolderId] = useState<string | undefined>(undefined);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Fullscreen banner/photo modal
  const [fullscreenImage, setFullscreenImage] = useState<{ url: string; title: string } | null>(null);

  // Selected media from search
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);

  // PWA Install prompt event
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the PWA install prompt');
        }
        setDeferredPrompt(null);
      });
    } else {
      alert(
        language === 'hi'
          ? '📱 ऐप इंस्टॉल करने के लिए अपने ब्राउज़र मेनू (⋮) में "Add to Home Screen" या "Install App" चुनें!'
          : '📱 To install this app, tap your browser menu (⋮) and select "Add to Home Screen" or "Install App"!'
      );
    }
  };

  const handleOpenUpload = (defaultFolderId?: string) => {
    setUploadFolderId(defaultFolderId);
    setIsUploadOpen(true);
  };

  const handleSelectAlbum = (albumId: string) => {
    setSelectedFolderId(albumId);
    setActiveTab('photos');
  };

  const handleSelectQuickAction = (actionId: string) => {
    if (actionId === 'memories') {
      setSelectedFolderId('f-memories');
      setActiveTab('photos');
    } else if (actionId === 'contacts') {
      setActiveTab('contacts');
    } else {
      setActiveTab(actionId);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-mandala transition-colors duration-200">
      
      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAuthModal={() => setIsAuthOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* VIEW: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Grand Family Elders Banner */}
            <HeroBanner
              onOpenUpload={handleOpenUpload}
              onViewFullscreen={(url, title) => setFullscreenImage({ url, title })}
            />

            {/* Quick Action Navigation Grid matching Reference Image */}
            <QuickActions
              onSelectAction={handleSelectQuickAction}
              onInstallApp={handleInstallApp}
            />

            {/* Global Search Bar with Natural Language Query AI Assistance */}
            <div className="pt-2">
              <GlobalSearch
                onSelectMedia={(item) => setPreviewMedia(item)}
                onSelectTab={(tab) => setActiveTab(tab)}
              />
            </div>

            {/* Photos Preview Section */}
            <div className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📸</span>
                  <h3 className="font-heading font-black text-xl sm:text-2xl text-stone-900 dark:text-amber-100">
                    {language === 'hi' ? 'नवीनतम पारिवारिक तस्वीरें' : 'Latest Family Photos'}
                  </h3>
                </div>

                <button
                  onClick={() => setActiveTab('photos')}
                  className="flex items-center gap-1 text-xs font-bold text-red-700 hover:text-red-800 dark:text-amber-400"
                >
                  <span>{language === 'hi' ? 'सभी देखें' : 'View All'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <PhotoGallery onOpenUpload={handleOpenUpload} />
            </div>

            {/* Dedicated Creator Tribute Card */}
            <div className="pt-4">
              <CreatorSection />
            </div>

            {/* AI Smart Organizer Preview */}
            <div className="pt-4">
              <AiOrganizer
                onSelectMedia={(item) => setPreviewMedia(item)}
                onOpenFolder={(fId) => handleSelectAlbum(fId)}
              />
            </div>

          </div>
        )}

        {/* VIEW: PHOTOS */}
        {activeTab === 'photos' && (
          <div className="animate-in fade-in duration-300">
            <PhotoGallery
              onOpenUpload={handleOpenUpload}
              selectedFolderId={selectedFolderId}
            />
          </div>
        )}

        {/* VIEW: VIDEOS */}
        {activeTab === 'videos' && (
          <div className="animate-in fade-in duration-300">
            <VideoLibrary onOpenUpload={handleOpenUpload} />
          </div>
        )}

        {/* VIEW: MUSIC */}
        {activeTab === 'music' && (
          <div className="animate-in fade-in duration-300">
            <MusicPlayer onOpenUpload={handleOpenUpload} />
          </div>
        )}

        {/* VIEW: ALBUMS */}
        {activeTab === 'albums' && (
          <div className="animate-in fade-in duration-300">
            <AlbumsSection onSelectAlbum={handleSelectAlbum} />
          </div>
        )}

        {/* VIEW: MEMBERS / DIRECTORY / CONTACTS */}
        {(activeTab === 'members' || activeTab === 'contacts') && (
          <div className="animate-in fade-in duration-300">
            <FamilyDirectory />
          </div>
        )}

        {/* VIEW: ADMIN PANEL */}
        {activeTab === 'admin' && (
          <div className="animate-in fade-in duration-300">
            <AdminDashboard />
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer
        onInstallApp={handleInstallApp}
        onSelectTab={setActiveTab}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        defaultFolderId={uploadFolderId}
        onUploadSuccess={() => {
          // Refresh views
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Fullscreen Image Lightbox Modal */}
      {fullscreenImage && (
        <div
          onClick={() => setFullscreenImage(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in select-none"
        >
          <div className="relative max-w-6xl max-h-[95vh] flex flex-col items-center">
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-amber-400 font-bold"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={fullscreenImage.url}
              alt={fullscreenImage.title}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-amber-400/40"
            />
            <div className="mt-3 flex items-center gap-3">
              <span className="text-sm font-bold text-amber-200">
                {fullscreenImage.title}
              </span>
              <a
                href={fullscreenImage.url}
                download
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Original</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Media Detail Lightbox from Search Results */}
      {previewMedia && (
        <div
          onClick={() => setPreviewMedia(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-amber-300 dark:border-stone-800"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-bold text-base text-stone-900 dark:text-white truncate">
                {previewMedia.title}
              </h3>
              <button onClick={() => setPreviewMedia(null)} className="p-1 rounded-full text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 rounded-2xl overflow-hidden bg-black aspect-16/9 flex items-center justify-center">
              {previewMedia.type === 'photo' ? (
                <img src={previewMedia.originalUrl} alt={previewMedia.title} className="max-w-full max-h-full object-contain" />
              ) : previewMedia.type === 'video' ? (
                <video src={previewMedia.originalUrl} controls autoPlay className="w-full h-full object-contain" />
              ) : (
                <audio src={previewMedia.originalUrl} controls autoPlay className="w-full px-4" />
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-stone-500">
                  {previewMedia.folderName} • Uploaded by {previewMedia.uploaderName} on {previewMedia.uploadDate}
                </p>
                {previewMedia.tags.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {previewMedia.tags.map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-amber-100 dark:bg-stone-800 text-amber-900 dark:text-amber-300 font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <a
                href={`/api/media/download/${previewMedia.id}`}
                download={previewMedia.fileName}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Original Download</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
