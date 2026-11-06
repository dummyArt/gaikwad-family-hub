import React, { useState, useEffect, useRef } from 'react';
import {
  Music,
  Play,
  Pause,
  Download,
  Upload,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
  Disc,
  Clock,
  User,
  Plus
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { MediaItem } from '../types';

interface MusicPlayerProps {
  onOpenUpload: (defaultFolderId?: string) => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ onOpenUpload }) => {
  const { t, language } = useLanguage();
  const [audioList, setAudioList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Player state
  const [currentTrack, setCurrentTrack] = useState<MediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loadAudio = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media?type=audio');
      const data = await res.json();
      setAudioList(data.media || []);
      if (data.media && data.media.length > 0 && !currentTrack) {
        setCurrentTrack(data.media[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudio();
  }, []);

  // Audio element listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      handleNext();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack]);

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const playTrack = (track: MediaItem) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.src = track.originalUrl;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleNext = () => {
    if (!currentTrack || audioList.length === 0) return;
    const currentIndex = audioList.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % audioList.length;
    playTrack(audioList[nextIndex]);
  };

  const handlePrev = () => {
    if (!currentTrack || audioList.length === 0) return;
    const currentIndex = audioList.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + audioList.length) % audioList.length;
    playTrack(audioList[prevIndex]);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <audio ref={audioRef} src={currentTrack?.originalUrl} preload="metadata" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-600/10 via-amber-500/10 to-indigo-600/10 dark:from-purple-950/20 dark:to-amber-950/20 border border-purple-300/60 dark:border-purple-900/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎵</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-stone-900 dark:text-amber-100">
              {t.musicTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-1">
            {t.musicSubtitle}
          </p>
        </div>

        <button
          onClick={() => onOpenUpload('f-music')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-purple-900/20 transition-all select-none"
        >
          <Upload className="w-4 h-4" />
          <span>{t.uploadAudio}</span>
        </button>
      </div>

      {/* Current Player Deck */}
      {currentTrack && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 text-white shadow-xl border-2 border-amber-500/50 relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            
            {/* Spinning Disc / Vinyl Art */}
            <div className="relative shrink-0">
              <div
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-amber-600 via-stone-800 to-amber-400 p-1 shadow-2xl flex items-center justify-center ${
                  isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''
                }`}
              >
                <div className="w-full h-full rounded-full bg-stone-900 flex items-center justify-center border-4 border-stone-950">
                  <Disc className="w-10 h-10 text-amber-400" />
                </div>
              </div>
            </div>

            {/* Track Info & Controls */}
            <div className="flex-1 w-full space-y-3">
              <div>
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  {t.playingNow}
                </span>
                <h3 className="text-lg sm:text-xl font-bold font-serif text-white truncate">
                  {currentTrack.title}
                </h3>
                <p className="text-xs text-stone-400 truncate">
                  {currentTrack.description || currentTrack.eventName || 'Gaikwad Family Collection'} • {currentTrack.uploaderName}
                </p>
              </div>

              {/* Progress Slider */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[11px] text-stone-400 font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrev}
                    className="p-2 rounded-full hover:bg-stone-800 text-stone-300 hover:text-white transition-colors"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg transition-transform transform hover:scale-105"
                  >
                    {isPlaying ? <Pause className="w-6 h-6 fill-stone-950" /> : <Play className="w-6 h-6 fill-stone-950 ml-0.5" />}
                  </button>

                  <button
                    onClick={handleNext}
                    className="p-2 rounded-full hover:bg-stone-800 text-stone-300 hover:text-white transition-colors"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <a
                    href={`/api/media/download/${currentTrack.id}`}
                    download={currentTrack.fileName}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t.downloadAudio}</span>
                  </a>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Playlist Table */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-sm">
        <h4 className="font-bold text-sm text-stone-900 dark:text-white uppercase tracking-wider mb-4">
          {language === 'hi' ? 'पारिवारिक ऑडियो सूची' : 'Family Audio Playlist'} ({audioList.length})
        </h4>

        {loading ? (
          <div className="py-12 text-center text-stone-500">{t.loading}</div>
        ) : audioList.length === 0 ? (
          <div className="py-12 text-center text-stone-500">
            <Music className="w-10 h-10 mx-auto text-stone-400 mb-2" />
            <p>{language === 'hi' ? 'कोई ऑडियो फ़ाइल नहीं मिली' : 'No audio files found'}</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {audioList.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isCurrent
                      ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200'
                      : 'hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <span className="text-xs font-bold text-stone-400 w-5 text-right">
                      {isCurrent && isPlaying ? '▶' : idx + 1}
                    </span>

                    <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-stone-800 flex items-center justify-center shrink-0">
                      <Music className={`w-4 h-4 ${isCurrent ? 'text-amber-700 dark:text-amber-400' : 'text-stone-500'}`} />
                    </div>

                    <div className="overflow-hidden">
                      <p className="text-xs sm:text-sm font-bold truncate">
                        {track.title}
                      </p>
                      <p className="text-[11px] text-stone-400 truncate">
                        {track.uploaderName} • {track.uploadDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {track.duration && (
                      <span className="text-xs text-stone-400 font-mono">
                        {formatTime(track.duration)}
                      </span>
                    )}

                    <a
                      href={`/api/media/download/${track.id}`}
                      onClick={(e) => e.stopPropagation()}
                      download={track.fileName}
                      className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 text-amber-700 dark:text-amber-400"
                      title={t.downloadAudio}
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
