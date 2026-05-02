"use client";

import { useRef, useState, ChangeEvent } from "react";

interface UploadAreaProps {
  onImages: (front: string, profile: string, frontPreview: string, profilePreview: string) => void;
}

function resizeImage(dataUrl: string, maxSize: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.src = dataUrl;
  });
}

function SlotUpload({
  label,
  hint,
  icon,
  preview,
  onChange,
}: {
  label: string;
  hint: string;
  icon: React.ReactNode;
  preview: string | null;
  onChange: (base64: string, preview: string) => void;
}) {
  // Two separate inputs: one for gallery/file, one for camera
  const uploadRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  async function processFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const original = e.target?.result as string;
      const resized = await resizeImage(original, 1024);
      onChange(resized, original);
    };
    reader.readAsDataURL(file);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset so same file can be re-selected
    e.target.value = "";
  }

  if (preview) {
    return (
      <div className="relative flex flex-col items-center justify-center gap-2 w-full rounded-2xl border-2 border-amber-400/60 bg-amber-400/5 py-6 px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt={label} className="w-20 h-20 rounded-xl object-cover border border-zinc-600" />
        <p className="text-xs text-amber-400 font-medium">✓ {label}</p>
        <div className="flex gap-2 mt-1">
          <button
            type="button"
            onClick={() => uploadRef.current?.click()}
            className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors bg-zinc-800 px-2 py-1 rounded-lg"
          >
            📁 Trocar
          </button>
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors bg-zinc-800 px-2 py-1 rounded-lg"
          >
            📷 Câmera
          </button>
        </div>
        {/* Hidden inputs */}
        <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
        <input ref={cameraRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleChange} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full rounded-2xl border-2 border-dashed border-zinc-700 py-6 px-4">
      {/* Icon */}
      <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
        {icon}
      </div>

      {/* Label + hint */}
      <div className="text-center">
        <p className="text-xs font-semibold text-zinc-300">{label}</p>
        <p className="text-[10px] text-zinc-600 mt-0.5">{hint}</p>
      </div>

      {/* Primary: Upload (desktop focus) / Camera (mobile focus) — both visible */}
      <button
        type="button"
        onClick={() => uploadRef.current?.click()}
        className="w-full flex items-center justify-center gap-1.5 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-400 text-xs font-medium py-2 rounded-xl transition-all duration-150"
      >
        📁 <span>Escolher arquivo</span>
      </button>

      <button
        type="button"
        onClick={() => cameraRef.current?.click()}
        className="w-full flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 text-xs py-1.5 rounded-xl transition-all duration-150"
      >
        📷 <span>Tirar foto</span>
      </button>

      {/* Hidden inputs */}
      <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      <input ref={cameraRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleChange} />
    </div>
  );
}

export default function UploadArea({ onImages }: UploadAreaProps) {
  const [front, setFront] = useState<string | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [profile, setProfile] = useState<string | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  function handleFront(base64: string, preview: string) {
    setFront(base64);
    setFrontPreview(preview);
    if (profile) onImages(base64, profile, preview, profilePreview!);
  }

  function handleProfile(base64: string, preview: string) {
    setProfile(base64);
    setProfilePreview(preview);
    if (front) onImages(front, base64, frontPreview!, preview);
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
      <div className="grid grid-cols-2 gap-3">
        <SlotUpload
          label="Foto de Frente"
          hint="Rosto de frente, iluminado"
          icon={<FrontIcon />}
          preview={frontPreview}
          onChange={handleFront}
        />
        <SlotUpload
          label="Foto de Perfil"
          hint="Rosto de lado"
          icon={<ProfileIcon />}
          preview={profilePreview}
          onChange={handleProfile}
        />
      </div>

      <p className="text-center text-xs text-zinc-600">
        {!front && !profile
          ? "Envie as duas fotos para iniciar a análise"
          : !front
          ? "Falta a foto de frente"
          : !profile
          ? "Falta a foto de perfil"
          : ""}
      </p>
    </div>
  );
}

function FrontIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8"/>
      <circle cx="10" cy="7" r="4"/>
      <line x1="20" y1="8" x2="20" y2="14"/>
    </svg>
  );
}
