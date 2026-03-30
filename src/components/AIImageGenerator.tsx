import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Key, CheckCircle2, AlertCircle, Cpu } from 'lucide-react';
import { generateMockupImage } from '../lib/ai';
import { ImageSize } from '../types';
import { Language, translations } from '../i18n';
import { cn } from '../lib/utils';

interface AIImageGeneratorProps {
  onGenerated: (url: string) => void;
  lang: Language;
}

export type AIModel = 'gemini' | 'doubao';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export function AIImageGenerator({ onGenerated, lang }: AIImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>('1K');
  const [model, setModel] = useState<AIModel>('gemini');
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [doubaoKey, setDoubaoKey] = useState(() => localStorage.getItem('doubao_api_key') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem('gemini_api_key', geminiKey);
  }, [geminiKey]);

  useEffect(() => {
    localStorage.setItem('doubao_api_key', doubaoKey);
  }, [doubaoKey]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const url = await generateMockupImage(prompt, size, model, doubaoKey, geminiKey);
      onGenerated(url);
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || (lang === 'zh' ? "生成图像失败。请重试。" : "Failed to generate image. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const isReady = model === 'gemini' ? !!geminiKey.trim() : !!doubaoKey.trim();

  return (
    <div className="flex flex-col gap-6 p-6 bg-zinc-50 rounded-2xl border border-zinc-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-zinc-900" />
          <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider">{t.aiTitle}</h2>
        </div>
        
        <div className="flex items-center gap-2">
          {isReady ? (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-tight border border-emerald-100">
              <CheckCircle2 className="w-3 h-3" /> {t.apiKeyReady}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-tight border border-amber-100">
              <AlertCircle className="w-3 h-3" /> {lang === 'zh' ? '未配置密钥' : 'No Key'}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-3 h-3" /> {t.model}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['gemini', 'doubao'] as AIModel[]).map((m) => (
              <button
                key={m}
                onClick={() => setModel(m)}
                className={cn(
                  "py-2 text-[10px] font-bold rounded-lg border transition-all uppercase tracking-wider",
                  model === m 
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-sm" 
                    : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
                )}
              >
                {t[m]}
              </button>
            ))}
          </div>
        </div>

        {model === 'gemini' && (
          <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-3 h-3" /> {t.geminiKey}
            </label>
            <input 
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder={t.enterGeminiKey}
              className="w-full p-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
            />
            <p className="text-[10px] text-zinc-400 italic">{t.geminiKeyHint}</p>
          </div>
        )}

        {model === 'doubao' && (
          <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-3 h-3" /> {t.doubaoKey}
            </label>
            <input 
              type="password"
              value={doubaoKey}
              onChange={(e) => setDoubaoKey(e.target.value)}
              placeholder={t.enterDoubaoKey}
              className="w-full p-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
            />
            <p className="text-[10px] text-zinc-400 italic">{t.doubaoKeyHint}</p>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{t.describeMockup}</label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={lang === 'zh' ? "例如：大理石桌面上的极简白色陶瓷杯，带有柔和的晨光" : "e.g., A minimalist white ceramic mug on a marble table with soft morning light"}
            className="w-full h-24 p-3 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all resize-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{t.imageSize}</label>
          <div className="grid grid-cols-3 gap-2">
            {(['1K', '2K', '4K'] as ImageSize[]).map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={cn(
                  "py-2 text-xs font-bold rounded-lg border transition-all",
                  size === s 
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-sm" 
                    : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-xs font-medium border border-red-100 break-all">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim() || !isReady}
          className={cn(
            "w-full py-3 flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition-all shadow-sm",
            loading || !prompt.trim() || !isReady
              ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
              : "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98]"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t.generating}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {t.generate}
            </>
          )}
        </button>
        
        {!isReady && (
          <p className="text-[10px] text-zinc-400 text-center italic">
            {t.aiHint}
          </p>
        )}
      </div>
    </div>
  );
}
