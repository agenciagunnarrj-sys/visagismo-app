"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Detectando formato do rosto...",
  "Analisando proporções faciais...",
  "Avaliando linha de perfil...",
  "Calculando recomendações personalizadas...",
  "Finalizando análise de visagismo...",
];

export default function LoadingAnalysis() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 py-10">
      {/* Spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-zinc-700" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400 animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-amber-400/40 animate-spin" style={{ animationDuration: "1.5s", animationDirection: "reverse" }} />
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-2 w-full max-w-xs">
        {STEPS.map((step, i) => (
          <div
            key={step}
            className={`flex items-center gap-2.5 text-xs transition-all duration-500 ${
              i < stepIndex ? "text-amber-400/60" : i === stepIndex ? "text-amber-400" : "text-zinc-700"
            }`}
          >
            <span className="shrink-0">
              {i < stepIndex ? "✓" : i === stepIndex ? "●" : "○"}
            </span>
            <span className={i === stepIndex ? "font-medium" : ""}>{step}</span>
          </div>
        ))}
      </div>

      <p className="text-zinc-600 text-xs">Isso pode levar alguns segundos</p>
    </div>
  );
}
