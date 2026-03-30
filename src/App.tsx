import React, { useState, useEffect } from 'react';
import { LogoUploader } from './components/LogoUploader';
import { MockupCanvas } from './components/MockupCanvas';
import { AIImageGenerator } from './components/AIImageGenerator';
import { GalleryModal } from './components/GalleryModal';
import { DEFAULT_MOCKUPS } from './constants';
import { Mockup } from './types';
import { Boxes, Layout, Sparkles, Image as ImageIcon, ChevronRight, Languages, Plus, X } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Language, translations } from './i18n';

export default function App() {
  const [lang, setLang] = useState<Language>('zh');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [selectedMockup, setSelectedMockup] = useState<Mockup>(DEFAULT_MOCKUPS[0]);
  const [customMockups, setCustomMockups] = useState<Mockup[]>(() => {
    const saved = localStorage.getItem('custom_mockups');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTab, setActiveTab] = useState<'presets' | 'ai'>('presets');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isAddingPreset, setIsAddingPreset] = useState(false);
  const [newPreset, setNewPreset] = useState({ name: '', url: '' });

  useEffect(() => {
    localStorage.setItem('custom_mockups', JSON.stringify(customMockups));
  }, [customMockups]);

  const t = translations[lang];

  const handleLogoUpload = (url: string) => {
    setLogoUrl(url);
  };

  const handleLogoClear = () => {
    setLogoUrl(null);
  };

  const handleAIGenerated = (url: string) => {
    const newMockup: Mockup = {
      id: `ai-${Date.now()}`,
      name: t.aiGen,
      url,
      logoArea: {
        x: 0.35,
        y: 0.35,
        width: 0.3,
        height: 0.3,
        rotation: 0
      }
    };
    setCustomMockups(prev => [newMockup, ...prev]);
    setSelectedMockup(newMockup);
    setActiveTab('presets');
  };

  const handleAddPreset = () => {
    if (!newPreset.name || !newPreset.url) return;
    const mockup: Mockup = {
      id: `custom-${Date.now()}`,
      name: newPreset.name,
      url: newPreset.url,
      logoArea: {
        x: 0.3,
        y: 0.3,
        width: 0.4,
        height: 0.4,
        rotation: 0
      }
    };
    setCustomMockups(prev => [mockup, ...prev]);
    setSelectedMockup(mockup);
    setIsAddingPreset(false);
    setNewPreset({ name: '', url: '' });
  };

  const handleMockupFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewPreset(prev => ({ ...prev, url: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const allMockups = [...DEFAULT_MOCKUPS, ...customMockups];

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      <GalleryModal isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} lang={lang} />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">{t.appName}</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <Languages className="w-4 h-4" />
              {lang === 'zh' ? 'English' : '中文'}
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-12">
          
          {/* Sidebar Controls */}
          <aside className="flex flex-col gap-8">
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-zinc-500">
                <Layout className="w-4 h-4" />
                <h2 className="text-xs font-bold uppercase tracking-widest">{t.uploadLogo}</h2>
              </div>
              <LogoUploader 
                logoUrl={logoUrl} 
                onUpload={handleLogoUpload} 
                onClear={handleLogoClear} 
                lang={lang}
              />
            </section>

            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-zinc-500">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  <h2 className="text-xs font-bold uppercase tracking-widest">{t.chooseMockup}</h2>
                </div>
                <button 
                  onClick={() => setIsAddingPreset(true)}
                  className="p-1 hover:bg-zinc-200 rounded-full transition-colors"
                  title={t.addPreset}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex p-1 bg-zinc-200 rounded-xl">
                <button 
                  onClick={() => setActiveTab('presets')}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                    activeTab === 'presets' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                  )}
                >
                  <ImageIcon className="w-3.5 h-3.5" /> {t.presets}
                </button>
                <button 
                  onClick={() => setActiveTab('ai')}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                    activeTab === 'ai' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5" /> {t.aiGen}
                </button>
              </div>

              <AnimatePresence mode="wait">
                {isAddingPreset ? (
                  <motion.div
                    key="add-preset"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 bg-white rounded-2xl border border-zinc-200 shadow-sm flex flex-col gap-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider">{t.addPreset}</h3>
                      <button onClick={() => setIsAddingPreset(false)}><X className="w-4 h-4" /></button>
                    </div>
                    <input 
                      type="text" 
                      placeholder={t.mockupName}
                      value={newPreset.name}
                      onChange={(e) => setNewPreset(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900"
                    />
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t.uploadMockup}</label>
                      <div className="relative group">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleMockupFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className={cn(
                          "w-full p-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all",
                          newPreset.url ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-400"
                        )}>
                          {newPreset.url ? (
                            <img src={newPreset.url} alt="Preview" className="w-full aspect-video object-cover rounded-lg" />
                          ) : (
                            <>
                              <ImageIcon className="w-6 h-6 text-zinc-300" />
                              <span className="text-[10px] font-medium text-zinc-400">{t.uploadHint}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={handleAddPreset}
                      className="w-full py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                      {t.savePreset}
                    </button>
                  </motion.div>
                ) : activeTab === 'presets' ? (
                  <motion.div 
                    key="presets"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent"
                  >
                    {allMockups.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMockup(m)}
                        className={cn(
                          "relative aspect-square rounded-xl overflow-hidden border-2 transition-all group",
                          selectedMockup.id === m.id ? "border-zinc-900 shadow-md" : "border-transparent hover:border-zinc-300"
                        )}
                      >
                        <img 
                          src={m.url} 
                          alt={m.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-[10px] font-bold text-white uppercase tracking-tighter">{m.name}</p>
                        </div>
                        {m.id.startsWith('custom-') || m.id.startsWith('ai-') ? (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setCustomMockups(prev => prev.filter(item => item.id !== m.id));
                              if (selectedMockup.id === m.id) {
                                setSelectedMockup(DEFAULT_MOCKUPS[0]);
                              }
                            }}
                            className="absolute top-1 right-1 p-1 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        ) : null}
                      </button>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="ai"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <AIImageGenerator onGenerated={handleAIGenerated} lang={lang} />
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </aside>

          {/* Main Canvas Area */}
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium uppercase tracking-widest">
                  <span>{t.product}</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-zinc-900">{selectedMockup.name}</span>
                </div>
                <h3 className="text-2xl font-bold tracking-tight">{t.previewTitle}</h3>
              </div>
            </div>

            <MockupCanvas 
              mockup={selectedMockup} 
              logoUrl={logoUrl} 
              lang={lang}
            />
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-zinc-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-4 items-center md:items-start">
            <div className="flex items-center gap-2.5 opacity-50">
              <div className="w-6 h-6 bg-zinc-900 rounded flex items-center justify-center">
                <Boxes className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold tracking-tight">{t.appName}</span>
            </div>
            <a 
              href="https://beian.miit.gov.cn" 
              target="_blank" 
              rel="noreferrer"
              className="text-[10px] text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              京ICP备2026014244号-1
            </a>
          </div>
          
          <p className="text-xs text-zinc-400 font-medium">
            &copy; 2026 MockupPro AI. All rights reserved. Powered by Gemini & Doubao AI.
          </p>

          <div className="flex items-center gap-6">
            {/* Terms and Privacy removed per user request */}
          </div>
        </div>
      </footer>
    </div>
  );
}
