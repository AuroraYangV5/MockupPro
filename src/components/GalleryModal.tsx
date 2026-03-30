import React from 'react';
import { X, Heart, Share2, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { Language, translations } from '../i18n';
import { DEFAULT_MOCKUPS } from '../constants';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export function GalleryModal({ isOpen, onClose, lang }: GalleryModalProps) {
  if (!isOpen) return null;
  const t = translations[lang];

  const showcases = [
    ...DEFAULT_MOCKUPS.map(m => ({ ...m, likes: Math.floor(Math.random() * 500) + 100 })),
    { id: 'sc1', name: 'Coffee Brand', url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=1000&auto=format&fit=crop', likes: 842 },
    { id: 'sc2', name: 'Tech Startup', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop', likes: 1205 },
    { id: 'sc3', name: 'Fashion Label', url: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?q=80&w=1000&auto=format&fit=crop', likes: 938 },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl w-full max-w-6xl h-[80vh] overflow-hidden shadow-2xl relative flex flex-col"
      >
        <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t.gallery}</h2>
            <p className="text-sm text-zinc-500">Explore community creations and inspiration</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {showcases.map((item) => (
              <div key={item.id} className="relative group rounded-2xl overflow-hidden break-inside-avoid shadow-sm border border-zinc-100 hover:shadow-xl transition-all">
                <img 
                  src={item.url} 
                  alt={item.name} 
                  className="w-full h-auto object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider">{item.name}</p>
                      <p className="text-[10px] opacity-70">{item.likes} Likes</p>
                    </div>
                    <button className="p-2 bg-white text-zinc-900 rounded-full hover:bg-zinc-100 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
