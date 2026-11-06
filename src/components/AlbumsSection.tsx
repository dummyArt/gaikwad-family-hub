import React, { useState, useEffect } from 'react';
import {
  FolderHeart,
  Plus,
  Edit2,
  Trash2,
  FolderOpen,
  Image,
  Video,
  Music,
  Heart,
  Sparkles,
  Calendar,
  Compass,
  Flame,
  Cake,
  Clock,
  BookOpen,
  FileText,
  Smile,
  X,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { AlbumFolder } from '../types';

interface AlbumsSectionProps {
  onSelectAlbum: (albumId: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Heart,
  Image,
  Video,
  Cake,
  Sparkles,
  Sun: Sparkles,
  Flame,
  Music2: Music,
  Compass,
  Smile,
  BookOpen,
  FileText,
  Music,
  Clock,
  Folder: FolderOpen
};

export const AlbumsSection: React.FC<AlbumsSectionProps> = ({ onSelectAlbum }) => {
  const { t, language } = useLanguage();
  const { isSuperAdmin, isAdmin } = useAuth();

  const [albums, setAlbums] = useState<AlbumFolder[]>([]);
  const [loading, setLoading] = useState(true);

  // New Album Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumHindi, setNewAlbumHindi] = useState('');
  const [newAlbumDesc, setNewAlbumDesc] = useState('');

  // Editing album state
  const [editingAlbum, setEditingAlbum] = useState<AlbumFolder | null>(null);

  const loadAlbums = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/albums');
      const data = await res.json();
      setAlbums(data.albums || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlbums();
  }, []);

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumName.trim()) return;

    try {
      const token = localStorage.getItem('gaikwad_auth_token');
      const res = await fetch('/api/albums', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newAlbumName.trim(),
          hindiName: newAlbumHindi.trim() || newAlbumName.trim(),
          description: newAlbumDesc.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAlbums(prev => [...prev, data.album]);
        setShowCreateModal(false);
        setNewAlbumName('');
        setNewAlbumHindi('');
        setNewAlbumDesc('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlbum) return;

    try {
      const token = localStorage.getItem('gaikwad_auth_token');
      const res = await fetch(`/api/albums/${editingAlbum.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editingAlbum.name,
          hindiName: editingAlbum.hindiName,
          description: editingAlbum.description
        })
      });
      if (res.ok) {
        setAlbums(prev => prev.map(a => (a.id === editingAlbum.id ? editingAlbum : a)));
        setEditingAlbum(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAlbum = async (album: AlbumFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    if (album.isDefault) {
      alert(language === 'hi' ? 'डिफ़ॉल्ट फ़ोल्डर हटाया नहीं जा सकता।' : 'Default family album cannot be deleted.');
      return;
    }
    if (!confirm(`Delete album "${album.name}"? Media items will be moved to Family Memories.`)) return;

    try {
      const token = localStorage.getItem('gaikwad_auth_token');
      const res = await fetch(`/api/albums/${album.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setAlbums(prev => prev.filter(a => a.id !== album.id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-amber-600/10 via-yellow-500/10 to-amber-600/10 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-300/60 dark:border-amber-800/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📁</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-stone-900 dark:text-amber-100">
              {t.albumsTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-1">
            {language === 'hi'
              ? '१४ विशेष डिफ़ॉल्ट पारिवारिक श्रेणियां और कस्टम एल्बम'
              : '14 default family folders and customized milestone collections'}
          </p>
        </div>

        {(isSuperAdmin || isAdmin) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-900/20 transition-all select-none"
          >
            <Plus className="w-4 h-4" />
            <span>{t.createAlbum}</span>
          </button>
        )}
      </div>

      {/* Albums Grid */}
      {loading ? (
        <div className="py-20 text-center text-stone-500">{t.loading}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {albums.map((album) => {
            const Icon = ICON_MAP[album.iconName] || FolderOpen;
            return (
              <div
                key={album.id}
                onClick={() => onSelectAlbum(album.id)}
                className="group relative p-5 rounded-2xl bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-stone-800 flex items-center justify-center text-amber-800 dark:text-amber-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-stone-800 text-amber-900 dark:text-amber-300 border border-amber-200/60 dark:border-stone-700">
                        {album.itemCount} {t.itemsCount}
                      </span>

                      {(isSuperAdmin || isAdmin) && !album.isDefault && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingAlbum(album);
                            }}
                            className="p-1 rounded text-stone-400 hover:text-amber-600"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteAlbum(album, e)}
                            className="p-1 rounded text-stone-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 group-hover:text-red-800 dark:group-hover:text-amber-400 transition-colors">
                    {language === 'hi' ? album.hindiName : album.name}
                  </h3>

                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80 font-medium">
                    {language === 'hi' ? album.name : album.hindiName}
                  </p>

                  {album.description && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 line-clamp-2">
                      {album.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-semibold text-amber-700 dark:text-amber-400">
                  <span>{language === 'hi' ? 'खोलें' : 'Open Album'}</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Album Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-amber-300 dark:border-stone-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-bold text-lg text-stone-900 dark:text-white">
                {t.createAlbum}
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAlbum} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Album Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  placeholder="e.g. Goa Vacation 2026"
                  className="w-full text-xs p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  एल्बम का नाम (हिंदी)
                </label>
                <input
                  type="text"
                  value={newAlbumHindi}
                  onChange={(e) => setNewAlbumHindi(e.target.value)}
                  placeholder="उदा. गोवा यात्रा २०२६"
                  className="w-full text-xs p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newAlbumDesc}
                  onChange={(e) => setNewAlbumDesc(e.target.value)}
                  placeholder="Details about this memory folder..."
                  className="w-full text-xs p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Album Modal */}
      {editingAlbum && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-amber-300 dark:border-stone-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-bold text-lg text-stone-900 dark:text-white">
                Edit Album
              </h3>
              <button onClick={() => setEditingAlbum(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAlbum} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Album Name
                </label>
                <input
                  type="text"
                  required
                  value={editingAlbum.name}
                  onChange={(e) => setEditingAlbum({ ...editingAlbum, name: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  हिंदी नाम
                </label>
                <input
                  type="text"
                  value={editingAlbum.hindiName}
                  onChange={(e) => setEditingAlbum({ ...editingAlbum, hindiName: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingAlbum.description}
                  onChange={(e) => setEditingAlbum({ ...editingAlbum, description: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAlbum(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
