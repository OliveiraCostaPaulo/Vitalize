
import React, { useState, useRef, useEffect } from 'react';
import { Protocol } from '../types';

interface ProtocolPlayerProps {
  protocol: Protocol;
  onClose: () => void;
}

export const ProtocolPlayer: React.FC<ProtocolPlayerProps> = ({ protocol, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const p = (audio.currentTime / audio.duration) * 100;
      setProgress(p || 0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    return () => audio.removeEventListener('timeupdate', updateProgress);
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-50 z-50 flex flex-col px-6 py-12 animate-in fade-in duration-700">
      <button 
        onClick={onClose}
        className="self-end p-2 text-stone-400 hover:text-stone-800 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-64 h-64 bg-stone-200/50 rounded-full flex items-center justify-center mb-12 relative overflow-hidden group">
           <div className={`absolute inset-0 bg-orange-100/30 blur-2xl transition-all duration-1000 ${isPlaying ? 'scale-150 animate-pulse' : 'scale-100'}`}></div>
           <div className="serif text-6xl text-stone-800 font-light z-10 select-none">V</div>
        </div>

        <h2 className="serif text-4xl mb-3 text-stone-800">{protocol.title}</h2>
        <p className="text-stone-500 font-light max-w-xs mx-auto mb-12">
          {protocol.description}
        </p>

        <audio ref={audioRef} src={protocol.audioUrl} />

        {/* Custom Controls */}
        <div className="w-full max-w-sm">
          <div className="h-1 bg-stone-200 rounded-full mb-8 relative overflow-hidden">
             <div 
               className="absolute top-0 left-0 h-full bg-stone-800 transition-all duration-300" 
               style={{ width: `${progress}%` }}
             ></div>
          </div>

          <div className="flex items-center justify-center gap-12">
            <button className="text-stone-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 19 2 12 11 5 11 19"></polygon><polygon points="22 19 13 12 22 5 22 19"></polygon></svg>
            </button>
            <button 
              onClick={togglePlay}
              className="w-20 h-20 rounded-full btn-vitalize flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              )}
            </button>
            <button className="text-stone-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 19 22 12 13 5 13 19"></polygon><polygon points="2 19 11 12 2 5 2 19"></polygon></svg>
            </button>
          </div>
          
          <div className="mt-8 text-stone-400 text-sm font-medium">
            {protocol.duration}
          </div>
        </div>
      </div>
    </div>
  );
};
