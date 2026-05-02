"use client";

import { useState, useEffect } from "react";
import CompareSlider from "./CompareSlider";

interface Recommendations {
  cabelo: string;
  barba: string;
  sobrancelha: string;
}

interface VisualEditorProps {
  originalImage: string;
  recommendations: Recommendations;
  gender: "masculino" | "feminino";
}

type ActiveMap = { cabelo: boolean; barba: boolean; sobrancelha: boolean };

export default function VisualEditor({ originalImage, recommendations, gender }: VisualEditorProps) {
  const CHIPS = [
    { key: "cabelo" as const, label: "Corte", icon: "✂️" },
    { key: "barba" as const, label: gender === "feminino" ? "Maquiagem" : "Barba", icon: gender === "feminino" ? "💄" : "🧔" },
    { key: "sobrancelha" as const, label: "Sobrancelha", icon: "〰️" },
  ];

  const [active, setActive] = useState<ActiveMap>({ cabelo: true, barba: true, sobrancelha: true });
  const [loading, setLoading] = useState(false);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [retries, setRetries] = useState(0);

  useEffect(() => {
    generate({ cabelo: true, barba: true, sobrancelha: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generate(activeMap: ActiveMap, attempt = 0) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: originalImage, active: activeMap, recommendations }),
      });
      const data = await res.json();
      if (data.erro) {
        if (attempt < 2) {
          setRetries(attempt + 1);
          setTimeout(() => generate(activeMap, attempt + 1), 1500);
          return;
        }
        setError(data.erro);
      } else {
        setEditedImage(data.image);
        setRetries(0);
      }
    } catch {
      if (attempt < 2) {
        setTimeout(() => generate(activeMap, attempt + 1), 1500);
        return;
      }
      setError("Erro de conexão. Tente novamente.");
    } finally {
      if (attempt >= 2 || !error) setLoading(false);
    }
  }

  function toggleChip(key: keyof ActiveMap) {
    const next = { ...active, [key]: !active[key] };
    if (!Object.values(next).some(Boolean)) return;
    setActive(next);
    setEditedImage(null);
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
        Arraste o divisor para comparar. Desmarque chips para remover cada elemento.
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

      {/* Image area */}
      {loading && (
        <div className="aspect-square rounded-xl bg-zinc-800 flex flex-col items-center justify-center gap-3">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <p className="text-xs text-zinc-400 text-center px-4">
            {retries > 0 ? `Tentativa ${retries + 1}... aguarde` : "Aplicando visual recomendado..."}
          </p>
          <p className="text-[10px] text-zinc-600">Imagem de alta qualidade — pode demorar até 30s</p>
        </div>
      )}

      {!loading && editedImage && (
        <CompareSlider before={originalImage} after={editedImage} />
      )}

      {!loading && !editedImage && !error && (
        <div className="aspect-square rounded-xl bg-zinc-800 flex items-center justify-center">
          <p className="text-xs text-zinc-600">Gerando visualização...</p>
        </div>
      )}

      {!loading && error && (
        <div className="aspect-square rounded-xl bg-zinc-800 flex flex-col items-center justify-center gap-3 px-6">
          <p className="text-xs text-red-400 text-center">{error}</p>
          <button
            onClick={() => generate(active)}
            className="text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 px-4 py-2 rounded-lg transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Download */}
      {editedImage && !loading && (
        <a
          href={editedImage}
          download="visagismo-resultado.png"
          className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500 hover:text-zinc-200 transition-colors"
        >
          ↓ Baixar imagem editada
        </a>
      )}
    </div>
  );
}
