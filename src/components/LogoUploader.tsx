import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Check, Scissors } from 'lucide-react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop, PixelCrop } from 'react-image-crop';
import { cn } from '../lib/utils';
import { Language, translations } from '../i18n';

interface LogoUploaderProps {
  onUpload: (url: string) => void;
  onClear: () => void;
  logoUrl: string | null;
  lang: Language;
}

export function LogoUploader({ onUpload, onClear, logoUrl, lang }: LogoUploaderProps) {
  const t = translations[lang];
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setTempImage(url);
    }
  }, []);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    // Initial crop: 80% of the image, centered
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 80,
        },
        1, // Default aspect ratio 1:1, but user can change it
        width,
        height
      ),
      width,
      height
    );
    // Remove aspect constraint for free resizing
    setCrop({ ...initialCrop, aspect: undefined });
  };

  const handleCropSave = async () => {
    if (!imgRef.current || !completedCrop) return;

    const canvas = document.createElement('canvas');
    const image = imgRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const croppedUrl = canvas.toDataURL('image/png');
    onUpload(croppedUrl);
    setTempImage(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  } as any);

  if (tempImage) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
        <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col h-[85vh]">
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scissors className="w-5 h-5 text-zinc-900" />
              <h2 className="text-lg font-bold tracking-tight">
                {lang === 'zh' ? '自定义裁剪 Logo' : 'Custom Crop Logo'}
              </h2>
            </div>
            <button onClick={() => setTempImage(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative flex-1 bg-zinc-100 overflow-auto flex items-center justify-center p-8">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
            >
              <img
                ref={imgRef}
                src={tempImage}
                alt="Crop me"
                onLoad={onImageLoad}
                className="max-w-full max-h-[60vh] object-contain"
              />
            </ReactCrop>
          </div>

          <div className="p-6 bg-white border-t border-zinc-100 flex items-center justify-between gap-4">
            <p className="text-xs text-zinc-500 font-medium">
              {lang === 'zh' ? '拖拽边框可自定义宽高' : 'Drag edges to customize width and height'}
            </p>
            <button
              onClick={handleCropSave}
              className="px-8 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-lg shadow-zinc-200"
            >
              <Check className="w-4 h-4" />
              {lang === 'zh' ? '保存裁剪' : 'Save Crop'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (logoUrl) {
    return (
      <div className="relative w-full aspect-square max-w-[200px] border-2 border-dashed border-zinc-300 rounded-xl overflow-hidden group">
        <img 
          src={logoUrl} 
          alt="Uploaded Logo" 
          className="w-full h-full object-contain p-4"
          referrerPolicy="no-referrer"
        />
        <button 
          onClick={onClear}
          className="absolute top-2 right-2 p-1.5 bg-zinc-900/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div 
      {...getRootProps()} 
      className={cn(
        "w-full aspect-square max-w-[200px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors",
        isDragActive ? "border-zinc-900 bg-zinc-50" : "border-zinc-300 hover:border-zinc-400"
      )}
    >
      <input {...getInputProps()} />
      <Upload className="w-8 h-8 text-zinc-400 mb-2" />
      <p className="text-xs text-zinc-500 font-medium text-center px-4">
        {isDragActive ? t.dropLogo : t.uploadHint}
      </p>
    </div>
  );
}
