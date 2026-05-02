"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import UploadArea from "./components/UploadArea";
import ResultCards from "./components/ResultCards";
import VisualEditor from "./components/VisualEditor";
import StepIndicator from "./components/StepIndicator";
import LoadingAnalysis from "./components/LoadingAnalysis";

type State = "gender" | "idle" | "loading" | "result" | "error";
type Gender = "masculino" | "feminino";

interface Analysis {
  formato_rosto: string;
  descricao_formato: string;
  corte_cabelo: { recomendado: string; explicacao: string; evitar: string };
  barba?: { recomendada: string; explicacao: string; evitar: string };
  maquiagem?: { recomendada: string; explicacao: string; evitar: string };
  sobrancelha: { formato_ideal: string; explicacao: string };
  linha_perfil?: { tipo: string; descricao: string; recomendacoes: string };
  dicas_extras: string[];
}

export default function Home() {
  const [state, setState] = useState<State>("gender");
  const [gender, setGender] = useState<Gender | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [result, setResult] = useState<Analysis | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  function selectGender(g: Gender) {
    setGender(g);
    setState("idle");
  }

  async function handleImages(front: string, profile: string, frontPreview: string, profPreview: string) {
    setPreview(frontPreview);
    setProfilePreview(profPreview);
    setOriginalImage(front);
    setState("loading");
    setResult(null);
    setErrorMsg("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: front, profileImage: profile, gender }),
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

  async function exportPDF() {
    if (!resultsRef.current) return;
    const { default: html2canvas } = await import("html2canvas");
    const { default: jsPDF } = await import("jspdf");

    const canvas = await html2canvas(resultsRef.current, {
      backgroundColor: "#0f0f0f",
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("visagismo-analise.pdf");
  }

  function reset() {
    setState("gender");
    setGender(null);
    setPreview(null);
    setProfilePreview(null);
    setOriginalImage(null);
    setResult(null);
    setErrorMsg("");
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-4 py-10">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-1.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest">IA · Visagismo</span>
          </div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Análise de Rosto</h1>
          <p className="text-zinc-500 text-sm max-w-sm mx-auto">
            {state === "gender"
              ? "Análise profissional de formato de rosto com recomendações personalizadas de visagismo."
              : state === "idle"
              ? "Envie as duas fotos para uma análise completa do seu rosto e perfil."
              : state === "loading"
              ? "Processando sua análise com inteligência artificial..."
              : "Sua análise completa de visagismo está pronta."}
          </p>
        </div>

        {/* Step indicator */}
        <StepIndicator state={state} />

        {/* Gender selection */}
        {state === "gender" && (
          <div className="flex flex-col items-center gap-6">
            <div className="flex gap-4 w-full max-w-sm mx-auto">
              <button
                onClick={() => selectGender("masculino")}
                className="flex-1 flex flex-col items-center gap-3 py-10 rounded-2xl border-2 border-zinc-700 hover:border-blue-400 hover:bg-blue-400/5 transition-all duration-200 group"
              >
                <span className="text-5xl group-hover:scale-110 transition-transform duration-200">👨</span>
                <span className="text-sm font-semibold text-zinc-300">Masculino</span>
              </button>
              <button
                onClick={() => selectGender("feminino")}
                className="flex-1 flex flex-col items-center gap-3 py-10 rounded-2xl border-2 border-zinc-700 hover:border-pink-400 hover:bg-pink-400/5 transition-all duration-200 group"
              >
                <span className="text-5xl group-hover:scale-110 transition-transform duration-200">👩</span>
                <span className="text-sm font-semibold text-zinc-300">Feminino</span>
              </button>
            </div>
            <p className="text-xs text-zinc-600">A escolha adapta as recomendações de corte, barba/maquiagem e sobrancelha</p>
          </div>
        )}

        {/* Upload */}
        {state === "idle" && (
          <div className="flex flex-col gap-4">
            <UploadArea onImages={handleImages} />
            <button
              onClick={() => setState("gender")}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors text-center"
            >
              ← Voltar para seleção de gênero
            </button>
          </div>
        )}

        {/* Photo preview (loading / result / error) */}
        {(state === "loading" || state === "result" || state === "error") && preview && (
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="flex gap-3 justify-center">
              <div className="flex flex-col items-center gap-1">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-zinc-700">
                  <Image src={preview} alt="Frente" fill className="object-cover" />
                </div>
                <span className="text-[10px] text-zinc-500">Frente</span>
              </div>
              {profilePreview && (
                <div className="flex flex-col items-center gap-1">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-zinc-700">
                    <Image src={profilePreview} alt="Perfil" fill className="object-cover" />
                  </div>
                  <span className="text-[10px] text-zinc-500">Perfil</span>
                </div>
              )}
            </div>
            {state !== "loading" && (
              <button
                onClick={reset}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2"
              >
                ← Fazer nova análise
              </button>
            )}
          </div>
        )}

        {/* Loading */}
        {state === "loading" && <LoadingAnalysis />}

        {/* Error */}
        {state === "error" && (
          <div className="rounded-2xl bg-red-950/40 border border-red-800/40 p-6 text-center mb-4">
            <div className="text-2xl mb-2">⚠️</div>
            <p className="text-red-400 font-semibold mb-1">Não foi possível analisar</p>
            <p className="text-sm text-zinc-400 mb-4">{errorMsg}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={reset}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {state === "result" && result && (
          <div className="flex flex-col gap-4">
            {/* Summary hero */}
            <div className="rounded-2xl bg-gradient-to-br from-amber-400/10 to-amber-400/5 border border-amber-400/20 p-5 text-center">
              <p className="text-xs text-amber-400/70 uppercase tracking-widest font-semibold mb-1">Formato identificado</p>
              <h2 className="text-3xl font-bold text-amber-400 mb-1">{result.formato_rosto}</h2>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">{result.descricao_formato}</p>
            </div>

            <div ref={resultsRef}>
              <div className="flex flex-col gap-4">
                <ResultCards data={result} gender={gender ?? "masculino"} />
              </div>
            </div>

            {/* Visual editor */}
            {originalImage && (
              <VisualEditor
                originalImage={originalImage}
                recommendations={{
                  cabelo: result.corte_cabelo.recomendado,
                  barba: result.barba?.recomendada ?? result.maquiagem?.recomendada ?? "",
                  sobrancelha: result.sobrancelha.formato_ideal,
                }}
                gender={gender ?? "masculino"}
              />
            )}

            {/* Export */}
            <button
              onClick={exportPDF}
              className="flex items-center justify-center gap-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-3 rounded-xl transition-colors border border-zinc-700"
            >
              <span>📄</span> Exportar análise em PDF
            </button>

            <button
              onClick={reset}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors text-center pb-4"
            >
              ← Fazer nova análise
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
