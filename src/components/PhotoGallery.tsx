import React, { useState, useEffect } from 'react';
import {
  Image,
  Upload,
  Heart,
  MessageCircle,
  Download,
  Maximize2,
  Trash2,
  Filter,
  Sparkles,
  Calendar,
  User,
  Plus,
  Send,
  X,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { MediaItem, AlbumFolder } from '../types';

interface PhotoGalleryProps {
  onOpenUpload: (defaultFolderId?: string) => void;
  selectedFolderId?: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ onOpenUpload, selectedFolderId }) => {
  const { t, language } = useLanguage();
  const { currentUser, isSuperAdmin, isAdmin } = useAuth();

  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [albums, setAlbums] = useState<AlbumFolder[]>([]);
  const [filterFolder, setFilterFolder] = useState<string>(selectedFolderId || 'all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Active modal viewing photo
  const [viewingPhoto, setViewingPhoto] = useState<MediaItem | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Load photos and albums
  const loadData = async () => {
    setLoading(true);
    try {
      const [mediaRes, albumRes] = await Promise.all([
        fetch('/api/media?type=photo'),
        fetch('/api/albums')
      ]);
      const mediaData = await mediaRes.json();
      const albumData = await albumRes.json();

      setPhotos(mediaData.media || []);
      setAlbums(albumData.albums || []);
    } catch (err) {
      console.error('Failed to load photos', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedFolderId) {
      setFilterFolder(selectedFolderId);
    }
  }, [selectedFolderId]);

  // Handle Likes
  const handleLike = async (photoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const token = localStorage.getItem('gaikwad_auth_token');
      const res = await fetch(`/api/media/${photoId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPhotos(prev =>
          prev.map(p => (p.id === photoId ? { ...p, likes: data.likes } : p))
        );
        if (viewingPhoto && viewingPhoto.id === photoId) {
          setViewingPhoto(prev => (prev ? { ...prev, likes: data.likes } : null));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Favorite toggle
  const handleFavorite = async (photoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const token = localStorage.getItem('gaikwad_auth_token');
      const res = await fetch(`/api/media/${photoId}/favorite`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPhotos(prev =>
          prev.map(p => (p.id === photoId ? { ...p, isFavorite: data.isFavorite } : p))
        );
        if (viewingPhoto && viewingPhoto.id === photoId) {
          setViewingPhoto(prev => (prev ? { ...prev, isFavorite: data.isFavorite } : null));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Comment Submission
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingPhoto || !newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const token = localStorage.getItem('gaikwad_auth_token');
      const res = await fetch(`/api/media/${viewingPhoto.id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: newComment })
      });
      const data = await res.json();
      if (res.ok) {
        setViewingPhoto(prev => (prev ? { ...prev, comments: data.comments } : null));
        setPhotos(prev =>
          prev.map(p => (p.id === viewingPhoto.id ? { ...p, comments: data.comments } : p))
        );
        setNewComment('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle Delete Photo
  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    try {
      const token = localStorage.getItem('gaikwad_auth_token');
      const res = await fetch(`/api/media/${photoId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPhotos(prev => prev.filter(p => p.id !== photoId));
        setViewingPhoto(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Extract all distinct tags for filter
  const allTags = Array.from(new Set(photos.flatMap(p => p.tags))).filter(Boolean);

  // Filtered photos
  const filteredPhotos = photos.filter(p => {
    if (filterFolder !== 'all' && p.folderId !== filterFolder) return false;
    if (onlyFavorites && !p.isFavorite) return false;
    if (selectedTag !== 'all' && !p.tags.includes(selectedTag)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-red-500/10 to-amber-500/10 dark:from-amber-950/20 dark:to-red-950/20 border border-amber-300/60 dark:border-amber-800/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📸</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-stone-900 dark:text-amber-100">
              {t.photosTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-1">
            {t.photosSubtitle}
          </p>
        </div>

        <button
          onClick={() => onOpenUpload(filterFolder !== 'all' ? filterFolder : 'f-photos')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-700 via-red-800 to-red-900 hover:from-red-600 hover:to-red-800 text-white font-bold text-sm shadow-lg shadow-red-900/20 transform hover:-translate-y-0.5 transition-all select-none"
        >
          <Upload className="w-4 h-4" />
          <span>{t.uploadPhotos}</span>
        </button>
      </div>

      {/* Filter and Category Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 shadow-xs">
        
        {/* Folders selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setFilterFolder('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterFolder === 'all'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            {t.allPhotos} ({photos.length})
          </button>

          {albums.map(alb => (
            <button
              key={alb.id}
              onClick={() => setFilterFolder(alb.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterFolder === alb.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              {language === 'hi' ? alb.hindiName : alb.name}
            </button>
          ))}
        </div>

        {/* Favorite toggle & Tags dropdown */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              onlyFavorites
                ? 'bg-red-50 text-red-600 border-red-300 dark:bg-red-950/60 dark:border-red-800'
                : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-red-600 text-red-600' : ''}`} />
            <span>{t.favorites}</span>
          </button>

          {allTags.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="text-xs font-medium py-1.5 px-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 focus:outline-none"
            >
              <option value="all">
                {language === 'hi' ? 'सभी सदस्य टैग' : 'All Member Tags'}
              </option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Grid of Photos */}
      {loading ? (
        <div className="py-20 text-center text-stone-500">{t.loading}</div>
      ) : filteredPhotos.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-stone-900 rounded-3xl border border-dashed border-amber-300 dark:border-stone-800 p-8">
          <Image className="w-12 h-12 mx-auto text-amber-300 dark:text-stone-700 mb-3" />
          <h3 className="font-bold text-base text-stone-800 dark:text-stone-200">
            {language === 'hi' ? 'इस श्रेणी में अभी कोई फ़ोटो नहीं है' : 'No photos in this category yet'}
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            {language === 'hi'
              ? 'परिवार के अनमोल पलों को संजोने के लिए नई फ़ोटो अपलोड करें।'
              : 'Upload new photographs to preserve cherished family moments.'}
          </p>
          <button
            onClick={() => onOpenUpload(filterFolder !== 'all' ? filterFolder : 'f-photos')}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t.uploadPhotos}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => {
            const isLiked = currentUser ? photo.likes.includes(currentUser.id) : false;
            return (
              <div
                key={photo.id}
                onClick={() => setViewingPhoto(photo)}
                className="group relative rounded-2xl overflow-hidden bg-white dark:bg-stone-900 border border-amber-200/60 dark:border-stone-800 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* Photo Thumbnail Container */}
                <div className="aspect-4/3 w-full overflow-hidden bg-stone-100 dark:bg-stone-800 relative">
                  <img
                    src={photo.thumbnailUrl || photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Top-Right Favorite & Download Overlay */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={(e) => handleFavorite(photo.id, e)}
                      className="p-1.5 rounded-full bg-stone-950/70 hover:bg-stone-900 text-white backdrop-blur-xs transition-colors"
                      title={t.favorites}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${photo.isFavorite ? 'fill-red-500 text-red-500' : ''}`}
                      />
                    </button>

                    <a
                      href={`/api/media/download/${photo.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-full bg-stone-950/70 hover:bg-stone-900 text-amber-300 backdrop-blur-xs transition-colors"
                      title={t.downloadOriginal}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Album / Event Pill */}
                  <div className="absolute bottom-2 left-2 z-10">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-950/70 text-amber-200 backdrop-blur-xs border border-amber-400/30">
                      {photo.folderName}
                    </span>
                  </div>
                </div>

                {/* Info Card Content */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate group-hover:text-red-800 dark:group-hover:text-amber-400 transition-colors">
                      {photo.title}
                    </h4>
                    {photo.description && (
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                        {photo.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-stone-100 dark:border-stone-800/80 text-[11px] text-stone-500">
                    <div className="flex items-center gap-1 text-stone-600 dark:text-stone-400 truncate max-w-[140px]">
                      <User className="w-3 h-3 text-amber-700" />
                      <span className="truncate">{photo.uploaderName}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={(e) => handleLike(photo.id, e)}
                        className={`flex items-center gap-1 font-semibold ${
                          isLiked ? 'text-red-600' : 'text-stone-500 hover:text-red-600'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-600' : ''}`} />
                        <span>{photo.likes.length}</span>
                      </button>

                      <div className="flex items-center gap-1 font-semibold text-stone-500">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{photo.comments.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fullscreen Photo Modal with Original Download, Zoom, and Live Comments */}
      {viewingPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
          <div className="relative w-full max-w-5xl h-[90vh] bg-white dark:bg-stone-900 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl border border-amber-400/40">
            
            {/* Left: Original Quality Photo View */}
            <div className="flex-1 bg-stone-950 flex items-center justify-center relative overflow-hidden group">
              <img
                src={viewingPhoto.originalUrl}
                alt={viewingPhoto.title}
                className="max-w-full max-h-full object-contain select-none"
              />

              {/* Close button */}
              <button
                onClick={() => setViewingPhoto(null)}
                className="absolute top-4 left-4 p-2 rounded-full bg-stone-900/80 hover:bg-stone-800 text-white backdrop-blur-xs transition-colors z-20 md:hidden"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Quick original quality download badge */}
              <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                <a
                  href={`/api/media/download/${viewingPhoto.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.downloadOriginal}</span>
                </a>
                <span className="text-[11px] font-medium text-stone-300 bg-stone-900/80 px-2.5 py-1 rounded-full backdrop-blur-xs border border-white/10">
                  {Math.round((viewingPhoto.fileSize || 0) / 1024)} KB • Original
                </span>
              </div>
            </div>

            {/* Right: Sidebar with metadata, tagged family members, and comments */}
            <div className="w-full md:w-80 lg:w-96 flex flex-col bg-stone-50 dark:bg-stone-900 border-t md:border-t-0 md:border-l border-amber-200 dark:border-stone-800">
              
              {/* Header */}
              <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-stone-900 dark:text-white line-clamp-1">
                    {viewingPhoto.title}
                  </h3>
                  <p className="text-xs text-amber-800 dark:text-amber-400 font-medium">
                    {viewingPhoto.folderName} • {viewingPhoto.uploadDate}
                  </p>
                </div>

                <button
                  onClick={() => setViewingPhoto(null)}
                  className="hidden md:flex p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Details & Tags */}
              <div className="p-4 border-b border-stone-200 dark:border-stone-800 space-y-2 text-xs">
                {viewingPhoto.description && (
                  <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                    {viewingPhoto.description}
                  </p>
                )}

                <div className="text-stone-500 space-y-1 pt-1">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-700" />
                    <span>{t.uploadedBy}: <strong>{viewingPhoto.uploaderName}</strong></span>
                  </div>
                  {viewingPhoto.eventName && (
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      <span>Event: {viewingPhoto.eventName}</span>
                    </div>
                  )}
                  {viewingPhoto.dateTaken && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-700" />
                      <span>{t.dateTaken}: {viewingPhoto.dateTaken}</span>
                    </div>
                  )}
                </div>

                {/* Tagged Family Members */}
                {viewingPhoto.tags.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                      {t.tags}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {viewingPhoto.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-[10px] font-semibold border border-amber-300/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Like / Favorite Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleLike(viewingPhoto.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/50 hover:bg-red-100 text-red-700 dark:text-red-300 text-xs font-bold border border-red-200 dark:border-red-900"
                  >
                    <Heart className="w-4 h-4 fill-red-600 text-red-600" />
                    <span>{viewingPhoto.likes.length} {t.like}</span>
                  </button>

                  <button
                    onClick={() => handleFavorite(viewingPhoto.id)}
                    className={`p-2 rounded-xl border ${
                      viewingPhoto.isFavorite
                        ? 'bg-amber-100 border-amber-300 text-amber-800'
                        : 'bg-stone-100 border-stone-200 text-stone-600'
                    }`}
                    title={t.favorites}
                  >
                    <Heart className={`w-4 h-4 ${viewingPhoto.isFavorite ? 'fill-amber-600 text-amber-600' : ''}`} />
                  </button>

                  {(isSuperAdmin || isAdmin || (currentUser && currentUser.id === viewingPhoto.uploaderId)) && (
                    <button
                      onClick={() => handleDeletePhoto(viewingPhoto.id)}
                      className="p-2 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-600 border border-stone-200"
                      title={t.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                  {t.comments} ({viewingPhoto.comments.length})
                </span>

                {viewingPhoto.comments.length === 0 ? (
                  <p className="text-xs text-stone-400 text-center py-4">
                    {language === 'hi' ? 'पहला संदेश लिखें...' : 'Be the first to comment...'}
                  </p>
                ) : (
                  viewingPhoto.comments.map(c => (
                    <div key={c.id} className="p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700/60 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-stone-800 dark:text-stone-200">
                          {c.userName}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-stone-600 dark:text-stone-300">
                        {c.text}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="p-3 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={t.addComment}
                  className="flex-1 text-xs px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="p-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-40 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
