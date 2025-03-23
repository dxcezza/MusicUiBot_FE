import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';

interface Track {
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
}

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');

  const handleSearch = async () => { // Добавьте async
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL; // Используйте REACT_APP_API_URL
      const response = await fetch(`${apiUrl}/search?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setTracks(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const playTrack = async (track: Track) => {
    setCurrentTrack(track);
    const apiUrl = process.env.REACT_APP_API_URL; // Используйте REACT_APP_API_URL
    const audioUrl = `${apiUrl}/get_audio/${track.videoId}`;
    setAudioUrl(audioUrl);

    if (waveformRef.current) {
      waveformRef.current.load(audioUrl);
      waveformRef.current.on('ready', () => {
        waveformRef.current?.play();
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Header */}
      <header className="px-6 py-8 bg-black/20">
        <div className="max-w-6xl mx-auto">
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Поиск треков..."
              className="w-full px-6 py-4 bg-white/5 backdrop-blur-lg rounded-2xl pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all border border-white/10"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Поиск...
                </>
              ) : (
                'Поиск'
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8 pb-32">
        <div className="max-w-6xl mx-auto">
          {/* Tracks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.map((track) => (
              <div
                key={track.videoId}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 hover:bg-white/10 transition-all group border border-white/10"
              >
                {/* Thumbnail and Play Button */}
                <div className="relative aspect-square mb-4 overflow-hidden rounded-xl">
                  <img
                    src={track.thumbnail}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={() => playTrack(track)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Play className="w-12 h-12 text-white" />
                  </button>
                </div>
                {/* Track Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold truncate">{track.title}</h3>
                  <p className="text-gray-400 truncate">{track.artist}</p>
                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => playTrack(track)}
                      className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      Слушать
                    </button>
                    <button
                      onClick={() => window.location.href = `/api/get_audio/${track.videoId}`}
                      className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Скачать
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Custom Audio Player */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10">
          <div className="max-w-6xl mx-auto p-4">
            {/* Player Controls */}
            <audio
              ref={audioRef}
              src={audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onLoadedMetadata={handleTimeUpdate}
              autoPlay
              className="hidden"
            />
            {/* Add more player controls here */}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
