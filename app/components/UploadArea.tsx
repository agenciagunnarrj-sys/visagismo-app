"use client";

import { useRef, useState, DragEvent, ChangeEvent } from "react";

interface UploadAreaProps {
  onImage: (base64: string, preview: string) => void;
}

export default function UploadArea({ onImage }: UploadAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function processFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const original = e.target?.result as string;
      resizeImage(original, 1024, (resized) => {
        onImage(resized, original);
      });
    };
    reader.readAsDataURL(file);
  }

  function resizeImage(dataUrl: string, maxSize: number, cb: (resized: string) => void) {
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      cb(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.src = dataUrl;
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        relative flex flex-col items-center justify-center gap-4
        w-full max-w-sm mx-auto rounded-2xl border-2 border-dashed
        cursor-pointer transition-all duration-200 py-12 px-6
        ${dragging
          ? "border-amber-400 bg-amber-400/5"
          : "border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900"
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={onChange}
      />
      <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
        <CameraIcon />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-zinc-300">Arraste uma foto ou clique para selecionar</p>
        <p className="text-xs text-zinc-500 mt-1">JPG, PNG ou HEIC · Câmera suportada no celular</p>
      </div>
    </div>
  );
}

function CameraIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}
