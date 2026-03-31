import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Mockup } from '../types';
import { Maximize, RotateCw, Move, Download } from 'lucide-react';
import { cn } from '../lib/utils';
import { Language, translations } from '../i18n';

interface MockupCanvasProps {
  mockup: Mockup;
  logoUrl: string | null;
  lang: Language;
}

export function MockupCanvas({ mockup, logoUrl, lang }: MockupCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mockupImgRef = useRef<HTMLImageElement | null>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const t = translations[lang];

  // Load mockup image once
  useEffect(() => {
    mockupImgRef.current = null; // Clear old image while loading new one
    const loadImg = (useCors: boolean) => {
      const img = new Image();
      if (useCors) img.crossOrigin = 'anonymous';
      img.onload = () => {
        mockupImgRef.current = img;
        draw();
      };
      img.onerror = () => {
        if (useCors) {
          console.warn("Retrying mockup image load without CORS:", mockup.url);
          loadImg(false);
        } else {
          console.error("Failed to load mockup image:", mockup.url);
        }
      };
      img.src = mockup.url;
    };
    loadImg(true);
  }, [mockup.url]);

  // Reset canvas state when mockup changes
  useEffect(() => {
    setOffset({ x: 0, y: 0 });
    setScale(1);
    setRotation(0);
  }, [mockup.id]);

  // Load logo image once
  useEffect(() => {
    if (logoUrl) {
      const loadLogo = (useCors: boolean) => {
        const img = new Image();
        if (useCors) img.crossOrigin = 'anonymous';
        img.onload = () => {
          logoImgRef.current = img;
          draw();
        };
        img.onerror = () => {
          if (useCors) {
            console.warn("Retrying logo image load without CORS:", logoUrl);
            loadLogo(false);
          } else {
            console.error("Failed to load logo image:", logoUrl);
          }
        };
        img.src = logoUrl;
      };
      loadLogo(true);
    } else {
      logoImgRef.current = null;
      draw();
    }
  }, [logoUrl]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mockupImgRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mockupImg = mockupImgRef.current;
    canvas.width = mockupImg.width;
    canvas.height = mockupImg.height;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(mockupImg, 0, 0);

    const logoImg = logoImgRef.current;
    if (logoImg) {
      const area = mockup.logoArea;
      
      // Base dimensions of the logo area on the mockup
      const baseAreaWidth = canvas.width * area.width;
      const baseAreaHeight = canvas.height * area.height;
      
      // Center of the logo area on the mockup
      const centerX = canvas.width * area.x + baseAreaWidth / 2 + offset.x;
      const centerY = canvas.height * area.y + baseAreaHeight / 2 + offset.y;
      
      // Calculate target dimensions maintaining logo aspect ratio
      const logoAspect = logoImg.width / logoImg.height;
      const areaAspect = baseAreaWidth / baseAreaHeight;
      
      let targetWidth, targetHeight;
      if (logoAspect > areaAspect) {
        targetWidth = baseAreaWidth * scale;
        targetHeight = (baseAreaWidth * scale) / logoAspect;
      } else {
        targetHeight = baseAreaHeight * scale;
        targetWidth = (baseAreaHeight * scale) * logoAspect;
      }

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(
        logoImg, 
        -targetWidth / 2, 
        -targetHeight / 2, 
        targetWidth, 
        targetHeight
      );
      ctx.restore();
    }
  }, [mockup, scale, rotation, offset]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `mockup-${mockup.id}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      <div className="relative bg-zinc-100 rounded-2xl overflow-hidden shadow-sm border border-zinc-200 aspect-square flex items-center justify-center group">
        <canvas 
          ref={canvasRef} 
          className={cn(
            "max-w-full max-h-full object-contain cursor-move",
            isDragging ? "cursor-grabbing" : "cursor-grab"
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={downloadImage}
            className="p-2 bg-white text-zinc-900 rounded-full shadow-lg hover:bg-zinc-50 transition-colors"
            title={t.download}
          >
            <Download className="w-5 h-5" />
          </button>
        </div>

        {!logoUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-100/50 backdrop-blur-[2px]">
            <p className="text-sm font-medium text-zinc-500 bg-white px-4 py-2 rounded-full shadow-sm">
              {lang === 'zh' ? '上传 Logo 以查看预览' : 'Upload a logo to see it here'}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm">
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Maximize className="w-3 h-3" /> {t.scale}
          </label>
          <input 
            type="range" 
            min="0.1" 
            max="3" 
            step="0.01" 
            value={scale} 
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <RotateCw className="w-3 h-3" /> {t.rotation}
          </label>
          <input 
            type="range" 
            min="-180" 
            max="180" 
            step="1" 
            value={rotation} 
            onChange={(e) => setRotation(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Move className="w-3 h-3" /> {t.position}
          </label>
          <button 
            onClick={() => {
              setOffset({ x: 0, y: 0 });
              setScale(1);
              setRotation(0);
            }}
            className="text-xs font-medium text-zinc-900 hover:underline text-left"
          >
            {t.reset}
          </button>
        </div>
      </div>
    </div>
  );
}
