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
  value,
  preview,
  onChange,
}: {
  label: string;
  hint: string;
  icon: React.ReactNode;
  value: string | null;
  preview: string | null;
  onChange: (base64: string, preview: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

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
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className={`
        relative flex flex-col items-center justify-center gap-3
        w-full rounded-2xl border-2 border-dashed cursor-pointer
        transition-all duration-200 py-8 px-4
        ${preview
          ? "border-amber-400/60 bg-amber-400/5"
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
        onChange={handleChange}
      />

      {preview ? (
        <>
          <img src={preview} alt={label} className="w-24 h-24 rounded-xl object-cover border border-zinc-600" />
          <p className="text-xs text-amber-400 font-medium">✓ {label}</p>
          <p className="text-[10px] text-zinc-500">Clique para trocar</p>
        </>
      ) : (
        <>
          <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center">
            {icon}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-300">{label}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{hint}</p>
          </div>
        </>
      )}
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

  const bothReady = front && profile;

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
      <div className="grid grid-cols-2 gap-3">
        <SlotUpload
          label="Foto de Frente"
          hint="Rosto de frente, bem iluminado"
          icon={<FrontIcon />}
          value={front}
          preview={frontPreview}
          onChange={handleFront}
        />
        <SlotUpload
          label="Foto de Perfil"
          hint="Rosto de lado (esquerdo ou direito)"
          icon={<ProfileIcon />}
          value={profile}
          preview={profilePreview}
          onChange={handleProfile}
        />
      </div>

      {!bothReady && (
        <p className="text-center text-xs text-zinc-500">
          {!front && !profile
            ? "Envie as duas fotos para iniciar a análise"
            : !front
            ? "Falta a foto de frente"
            : "Falta a foto de perfil"}
        </p>
      )}
    </div>
  );
}

function FrontIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8"/>
      <circle cx="10" cy="7" r="4"/>
      <line x1="20" y1="8" x2="20" y2="14"/>
    </svg>
  );
}
