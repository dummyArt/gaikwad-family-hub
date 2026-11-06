import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  X,
  Image,
  Video,
  Music,
  File,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Calendar,
  Tag
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { AlbumFolder } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFolderId?: string;
  onUploadSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  defaultFolderId,
  onUploadSuccess
}) => {
  const { t, language } = useLanguage();

  const [albums, setAlbums] = useState<AlbumFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>(defaultFolderId || 'f-photos');
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventName, setEventName] = useState('');
  const [dateTaken, setDateTaken] = useState(new Date().toISOString().split('T')[0]);
  const [tags, setTags] = useState('');
  const [approvedFamilyNames, setApprovedFamilyNames] = useState<string[]>([]);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [duplicateAlerts, setDuplicateAlerts] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (defaultFolderId) setSelectedFolder(defaultFolderId);

    // Fetch albums and approved members
    async function init() {
      try {
        const [albumRes, memRes] = await Promise.all([
          fetch('/api/albums'),
          fetch('/api/members')
        ]);
        const albumData = await albumRes.json();
        const memData = await memRes.json();
        setAlbums(albumData.albums || []);
        if (memData.members) {
          setApprovedFamilyNames(memData.members.map((m: any) => m.name));
        }
      } catch (err) {
        console.error(err);
      }
    }
    if (isOpen) init();
  }, [isOpen, defaultFolderId]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const addTag = (name: string) => {
    const existing = tags.split(',').map(s => s.trim()).filter(Boolean);
    if (!existing.includes(name)) {
      setTags([...existing, name].join(', '));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setErrorMessage('Please select at least one photo, video, or audio file.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);
    setErrorMessage(null);
    setDuplicateAlerts([]);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    formData.append('folderId', selectedFolder);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('eventName', eventName);
    formData.append('dateTaken', dateTaken);
    formData.append('tags', tags);

    try {
      const token = localStorage.getItem('gaikwad_auth_token');
      setUploadProgress(60);

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });

      setUploadProgress(100);
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Upload failed');
      } else {
        setSuccessMessage(data.message || 'Files uploaded successfully!');
        if (data.duplicateAlerts && data.duplicateAlerts.length > 0) {
          setDuplicateAlerts(data.duplicateAlerts);
        }
        setTimeout(() => {
          onUploadSuccess();
          onClose();
        }, 1500);
      }
    } catch (err) {
      setErrorMessage('Network error during upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-amber-300 dark:border-stone-800 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-700 dark:text-amber-400" />
            <h3 className="font-heading font-extrabold text-lg text-stone-900 dark:text-white">
              {language === 'hi' ? 'परिवार की यादें अपलोड करें' : 'Upload Family Memories'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {duplicateAlerts.length > 0 && (
          <div className="mt-2 space-y-1">
            {duplicateAlerts.map((msg, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-amber-50 dark:bg-stone-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{msg}</span>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Drag & Drop File Upload Surface */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-amber-300 dark:border-amber-700/60 rounded-2xl p-6 text-center bg-amber-50/50 dark:bg-stone-800/40 hover:bg-amber-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*,video/*,audio/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            <Upload className="w-10 h-10 mx-auto text-amber-700 dark:text-amber-400 mb-2 animate-bounce" />
            <p className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
              {files.length > 0
                ? `${files.length} file(s) selected`
                : t.dragDropPhotos}
            </p>
            <p className="text-[11px] text-stone-500 mt-1">
              Supports Original Quality: JPG, PNG, WEBP, MP4, MP3, WAV
            </p>

            {files.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                {files.slice(0, 5).map((f, i) => (
                  <span key={i} className="text-[10px] font-medium bg-white dark:bg-stone-900 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700 truncate max-w-[120px]">
                    {f.name}
                  </span>
                ))}
                {files.length > 5 && (
                  <span className="text-[10px] font-bold text-stone-500">
                    +{files.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Folder / Album Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              {language === 'hi' ? 'एल्बम / फ़ोल्डर चुनें' : 'Select Family Folder'} *
            </label>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="w-full text-xs p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
            >
              {albums.map(a => (
                <option key={a.id} value={a.id}>
                  {language === 'hi' ? a.hindiName : a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Title / शीर्षक
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Diwali Evening Pooja 2025"
                className="w-full text-xs p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Event / अवसर
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Diwali / Wedding / Birthday"
                className="w-full text-xs p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Date Taken / फ़ोटो की तारीख
              </label>
              <input
                type="date"
                value={dateTaken}
                onChange={(e) => setDateTaken(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Tagged Members / सदस्य टैग
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Separated by comma"
                className="w-full text-xs p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Quick Tag Pills from Approved Members */}
          {approvedFamilyNames.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] font-bold text-stone-500">
                + Quick Tag:
              </span>
              {approvedFamilyNames.slice(0, 5).map(name => (
                <button
                  type="button"
                  key={name}
                  onClick={() => addTag(name)}
                  className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-stone-800 text-amber-900 dark:text-amber-300 text-[10px] font-medium hover:bg-amber-200"
                >
                  +{name}
                </button>
              ))}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Description / विवरण
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell the story behind this memory..."
              className="w-full text-xs p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1">
              <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-red-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-center text-stone-500 font-semibold">
                Uploading in original quality... {uploadProgress}%
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isUploading || files.length === 0}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-bold text-xs shadow-md disabled:opacity-50 transition-all"
            >
              {isUploading ? t.loading : t.uploadPhotos}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
