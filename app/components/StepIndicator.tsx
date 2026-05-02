"use client";

const STEPS = [
  { id: "gender", label: "Gênero" },
  { id: "upload", label: "Fotos" },
  { id: "analysis", label: "Análise" },
  { id: "result", label: "Resultado" },
];

const STATE_TO_STEP: Record<string, string> = {
  gender: "gender",
  idle: "upload",
  loading: "analysis",
  result: "result",
  error: "upload",
};

export default function StepIndicator({ state }: { state: string }) {
  const current = STATE_TO_STEP[state] ?? "gender";
  const currentIndex = STEPS.findIndex((s) => s.id === current);

  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                  ${done ? "bg-amber-400 text-black" : active ? "bg-amber-400/20 border-2 border-amber-400 text-amber-400" : "bg-zinc-800 border border-zinc-700 text-zinc-600"}
                `}
              >
                {done ? "✓" : i + 1}
              </div>
              <span className={`text-[10px] font-medium ${active ? "text-amber-400" : done ? "text-zinc-400" : "text-zinc-600"}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-12 h-px mb-4 transition-all duration-300 ${done ? "bg-amber-400" : "bg-zinc-700"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
