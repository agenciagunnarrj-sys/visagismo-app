"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Recommendations {
  cabelo: string;
  barba: string;
  sobrancelha: string;
}

interface VisualEditorProps {
  originalImage: string;
  recommendations: Recommendations;
}

type ActiveMap = { cabelo: boolean; barba: boolean; sobrancelha: boolean };

const CHIPS = [
  { key: "cabelo" as const, label: "Corte", icon: "✂️" },
  { key: "barba" as const, label: "Barba", icon: "🧔" },
  { key: "sobrancelha" as const, label: "Sobrancelha", icon: "〰️" },
];

export default function VisualEditor({ originalImage, recommendations }: VisualEditorProps) {
  const [active, setActive] = useState<ActiveMap>({ cabelo: true, barba: true, sobrancelha: true });
  const [loading, setLoading] = useState(false);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState(false);

  // Auto-generate on mount
  useEffect(() => {
    generate({ cabelo: true, barba: true, sobrancelha: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generate(activeMap: ActiveMap) {
    setLoading(true);
    setEditedImage(null);
    setError("");

    try {
      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: originalImage, active: activeMap, recommendations }),
      });
      const data = await res.json();
      if (data.erro) {
        setError(data.erro);
      } else {
        setEditedImage(data.image);
        setGenerated(true);
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function toggleChip(key: keyof ActiveMap) {
    const next = { ...active, [key]: !active[key] };
    const anyActive = Object.values(next).some(Boolean);
    if (!anyActive) return; // keep at least one
    setActive(next);
    generate(next);
  }

  return (
    <div className="rounded-2xl bg-zinc-900 border border-purple-400/20 p-5 w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <span className="text-lg">✨</span>
        <h2 className="font-semibold text-zinc-100">Visualização Recomendada</h2>
      </div>
      <p className="text-xs text-zinc-500 mb-4 ml-9">
        A IA aplicou o visual ideal para o seu formato de rosto. Desmarque para remover cada elemento.
      </p>

      {/* Chips */}
      <div className="flex gap-2 flex-wrap mb-5">
        {CHIPS.map((chip) => (
          <button
            key={chip.key}
            onClick={() => toggleChip(chip.key)}
            disabled={loading}
            title={recommendations[chip.key]}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
              border transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed
              ${active[chip.key]
                ? "bg-purple-600/20 border-purple-500 text-purple-300"
                : "bg-zinc-800 border-zinc-700 text-zinc-500 line-through"
              }
            `}
          >
            <span>{chip.icon}</span>
            <span>{chip.label}</span>
            {active[chip.key] && (
              <span className="ml-1 text-purple-400 text-[10px] max-w-[120px] truncate hidden sm:inline">
                {recommendations[chip.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Image comparison */}
      <div className="grid grid-cols-2 gap-3">
        {/* Original */}
        <div className="flex flex-col gap-2">
          <span className="text-xs text-zinc-500 text-center font-medium">Original</span>
          <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-800">
            <Image src={originalImage} alt="Foto original" fill className="object-cover" />
          </div>
        </div>

        {/* Result */}
        <div className="flex flex-col gap-2">
          <span className="text-xs text-zinc-500 text-center font-medium">
            {loading ? "Gerando..." : generated ? "Com recomendações" : "Aguardando"}
          </span>
          <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-800 flex items-center justify-center">
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-900/80 backdrop-blur-sm z-10">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <p className="text-xs text-zinc-400 text-center px-4">Aplicando visual recomendado...</p>
              </div>
            )}

            {editedImage && (
              <Image src={editedImage} alt="Foto editada" fill className="object-cover" />
            )}

            {!loading && !editedImage && !error && (
              <p className="text-xs text-zinc-600 text-center px-4">Gerando visualização...</p>
            )}

            {!loading && error && (
              <div className="flex flex-col items-center gap-2 px-4">
                <p className="text-xs text-red-400 text-center">{error}</p>
                <button
                  onClick={() => generate(active)}
                  className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Download */}
      {editedImage && !loading && (
        <a
          href={editedImage}
          download="visagismo-resultado.png"
          className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500 hover:text-zinc-200 transition-colors"
        >
          ↓ Baixar resultado
        </a>
      )}
    </div>
  );
}
