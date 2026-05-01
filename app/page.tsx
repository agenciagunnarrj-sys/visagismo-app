"use client";

import { useState } from "react";
import Image from "next/image";
import UploadArea from "./components/UploadArea";
import ResultCards from "./components/ResultCards";
import VisualEditor from "./components/VisualEditor";

type State = "idle" | "loading" | "result" | "error";

interface Analysis {
  formato_rosto: string;
  descricao_formato: string;
  corte_cabelo: { recomendado: string; explicacao: string; evitar: string };
  barba: { recomendada: string; explicacao: string; evitar: string };
  sobrancelha: { formato_ideal: string; explicacao: string };
  dicas_extras: string[];
}

export default function Home() {
  const [state, setState] = useState<State>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [result, setResult] = useState<Analysis | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleImage(base64: string, previewUrl: string) {
    setPreview(previewUrl);
    setOriginalImage(base64);
    setState("loading");
    setResult(null);
    setErrorMsg("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      const data = await res.json();

      if (data.erro) {
        setErrorMsg(data.erro);
        setState("error");
        return;
      }

      setResult(data as Analysis);
      setState("result");
    } catch {
      setErrorMsg("Erro de conexão. Verifique sua internet e tente novamente.");
      setState("error");
    }
  }

  function reset() {
    setState("idle");
    setPreview(null);
    setOriginalImage(null);
    setResult(null);
    setErrorMsg("");
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-4 py-10">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest">IA · Visagismo</span>
          </div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Análise de Rosto</h1>
          <p className="text-zinc-500 text-sm">
            Envie uma foto e descubra o corte de cabelo, barba e sobrancelha ideais para o seu formato de rosto.
          </p>
        </div>

        {/* Upload / Preview */}
        {state === "idle" && (
          <UploadArea onImage={handleImage} />
        )}

        {(state === "loading" || state === "result" || state === "error") && preview && (
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="relative w-40 h-40 rounded-2xl overflow-hidden border-2 border-zinc-700">
              <Image src={preview} alt="Foto enviada" fill className="object-cover" />
            </div>

            {state !== "loading" && (
              <button
                onClick={reset}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2"
              >
                Analisar outra foto
              </button>
            )}
          </div>
        )}

        {/* Loading */}
        {state === "loading" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <p className="text-zinc-400 text-sm font-medium">Analisando seu rosto...</p>
            <p className="text-zinc-600 text-xs">Isso pode levar alguns segundos</p>
          </div>
        )}

        {/* Error */}
        {state === "error" && (
          <div className="rounded-2xl bg-red-950/40 border border-red-800/40 p-5 text-center mb-4">
            <p className="text-red-400 font-medium mb-1">Não foi possível analisar</p>
            <p className="text-sm text-zinc-400">{errorMsg}</p>
            <button
              onClick={reset}
              className="mt-4 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Results */}
        {state === "result" && result && (
          <div className="flex flex-col gap-4">
            <ResultCards data={result} />
            {originalImage && (
              <VisualEditor
                originalImage={originalImage}
                recommendations={{
                  cabelo: result.corte_cabelo.recomendado,
                  barba: result.barba.recomendada,
                  sobrancelha: result.sobrancelha.formato_ideal,
                }}
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
