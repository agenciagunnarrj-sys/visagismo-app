"use client";

import Image from "next/image";

type ShapeKey = "oval" | "oblong" | "square" | "inverted-triangle" | "diamond" | "round" | "heart" | "rectangle";

const SHAPE_MAP: Record<string, ShapeKey> = {
  oval: "oval",
  oblong: "oblong",
  alongado: "oblong",
  retangular: "oblong",
  quadrado: "square",
  quadrada: "square",
  square: "square",
  invertido: "inverted-triangle",
  "inverted triangle": "inverted-triangle",
  triangulo: "inverted-triangle",
  diamante: "diamond",
  diamond: "diamond",
  redondo: "round",
  round: "round",
  circular: "round",
  coracao: "heart",
  "heart-shaped": "heart",
  retangulo: "rectangle",
  rectangle: "rectangle",
};

function getFaceShapeImage(formato: string, gender: "masculino" | "feminino"): string | null {
  const key = formato.toLowerCase().trim().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const folder = gender === "feminino" ? "mulher" : "homem";
  for (const [k, shape] of Object.entries(SHAPE_MAP)) {
    if (key.includes(k)) return `/face-shapes/${folder}/${shape}.png`;
  }
  return null;
}

interface Analysis {
  formato_rosto: string;
  descricao_formato: string;
  corte_cabelo: {
    recomendado: string;
    explicacao: string;
    evitar: string;
  };
  barba?: {
    recomendada: string;
    explicacao: string;
    evitar: string;
  };
  maquiagem?: {
    recomendada: string;
    explicacao: string;
    evitar: string;
  };
  sobrancelha: {
    formato_ideal: string;
    explicacao: string;
  };
  linha_perfil?: {
    tipo: string;
    descricao: string;
    recomendacoes: string;
  };
  dicas_extras: string[];
}

export default function ResultCards({ data, gender }: { data: Analysis; gender: "masculino" | "feminino" }) {
  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
      {/* Formato do Rosto */}
      <Card icon={<FaceIcon />} title="Formato do Rosto" accent="amber">
        <div className="flex gap-4 items-start">
          <div className="flex-1">
            <p className="text-xl font-semibold text-amber-400">{data.formato_rosto}</p>
            <p className="text-sm text-zinc-400 mt-1">{data.descricao_formato}</p>
          </div>
          {getFaceShapeImage(data.formato_rosto, gender) && (
            <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-zinc-700">
              <Image
                src={getFaceShapeImage(data.formato_rosto, gender)!}
                alt={`Formato ${data.formato_rosto}`}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Corte de Cabelo */}
      <Card icon={<ScissorsIcon />} title="Corte de Cabelo" accent="blue">
        <Recommendation
          label="Recomendado"
          value={data.corte_cabelo.recomendado}
          color="text-blue-400"
        />
        <p className="text-sm text-zinc-400 mt-2">{data.corte_cabelo.explicacao}</p>
        <Avoid text={data.corte_cabelo.evitar} />
      </Card>

      {/* Barba (masculino) */}
      {data.barba && (
        <Card icon={<BeardIcon />} title="Barba" accent="emerald">
          <Recommendation label="Recomendada" value={data.barba.recomendada} color="text-emerald-400" />
          <p className="text-sm text-zinc-400 mt-2">{data.barba.explicacao}</p>
          <Avoid text={data.barba.evitar} />
        </Card>
      )}

      {/* Maquiagem (feminino) */}
      {data.maquiagem && (
        <Card icon={<MakeupIcon />} title="Maquiagem" accent="emerald">
          <Recommendation label="Recomendada" value={data.maquiagem.recomendada} color="text-emerald-400" />
          <p className="text-sm text-zinc-400 mt-2">{data.maquiagem.explicacao}</p>
          <Avoid text={data.maquiagem.evitar} />
        </Card>
      )}

      {/* Sobrancelha */}
      <Card icon={<BrowIcon />} title="Sobrancelha" accent="violet">
        <Recommendation
          label="Formato Ideal"
          value={data.sobrancelha.formato_ideal}
          color="text-violet-400"
        />
        <p className="text-sm text-zinc-400 mt-2">{data.sobrancelha.explicacao}</p>
      </Card>

      {/* Linha de Perfil */}
      {data.linha_perfil && (
        <Card icon={<ProfileLineIcon />} title="Linha de Perfil" accent="sky">
          <Recommendation label="Tipo" value={data.linha_perfil.tipo} color="text-sky-400" />
          <p className="text-sm text-zinc-400 mt-2">{data.linha_perfil.descricao}</p>
          <div className="mt-3 flex gap-2 items-start rounded-lg bg-zinc-800/60 px-3 py-2">
            <span className="text-sky-400 text-xs font-bold uppercase tracking-wide shrink-0 mt-0.5">Recomendações:</span>
            <span className="text-xs text-zinc-400">{data.linha_perfil.recomendacoes}</span>
          </div>
        </Card>
      )}

      {/* Dicas Extras */}
      <Card icon={<StarIcon />} title="Dicas Extras" accent="rose">
        <ul className="flex flex-col gap-2 mt-1">
          {data.dicas_extras.map((dica, i) => (
            <li key={i} className="flex gap-3 text-sm text-zinc-300">
              <span className="text-rose-400 font-bold shrink-0">{i + 1}.</span>
              <span>{dica}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Card({
  icon,
  title,
  accent,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  accent: "amber" | "blue" | "emerald" | "violet" | "rose" | "sky";
  children: React.ReactNode;
}) {
  const border: Record<string, string> = {
    amber: "border-amber-400/20",
    blue: "border-blue-400/20",
    emerald: "border-emerald-400/20",
    violet: "border-violet-400/20",
    rose: "border-rose-400/20",
    sky: "border-sky-400/20",
  };

  return (
    <div className={`rounded-2xl bg-zinc-900 border ${border[accent]} p-5`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 flex items-center justify-center">{icon}</div>
        <h2 className="font-semibold text-zinc-100">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Recommendation({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xs text-zinc-500 uppercase tracking-wide">{label}:</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  );
}

function Avoid({ text }: { text: string }) {
  return (
    <div className="mt-3 flex gap-2 items-start rounded-lg bg-zinc-800/60 px-3 py-2">
      <span className="text-red-400 text-xs font-bold uppercase tracking-wide shrink-0 mt-0.5">Evitar:</span>
      <span className="text-xs text-zinc-400">{text}</span>
    </div>
  );
}

function FaceIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
      <line x1="9" y1="9" x2="9.01" y2="9"/>
      <line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>
  );
}

function ScissorsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3"/>
      <circle cx="6" cy="18" r="3"/>
      <line x1="20" y1="4" x2="8.12" y2="15.88"/>
      <line x1="14.47" y1="14.48" x2="20" y2="20"/>
      <line x1="8.12" y1="8.12" x2="12" y2="12"/>
    </svg>
  );
}

function BeardIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11c0-1 .5-6 9-6s9 5 9 6"/>
      <path d="M3 11c0 6 4 10 9 10s9-4 9-10"/>
      <path d="M12 11v10"/>
      <path d="M7 14c0 3 2 5 5 5"/>
      <path d="M17 14c0 3-2 5-5 5"/>
    </svg>
  );
}

function BrowIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12c2-4 5-6 10-6s8 2 10 6"/>
      <circle cx="9" cy="15" r="2"/>
      <circle cx="15" cy="15" r="2"/>
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

function ProfileLineIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 4c-2 0-4 1-5 3-1 1.5-1 3-2 4.5C12 13 10 14 8 14c-2 0-3.5-1-4-3"/>
      <circle cx="6" cy="18" r="2"/>
    </svg>
  );
}

function MakeupIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a5 5 0 0 1 5 5c0 3-5 11-5 11S7 10 7 7a5 5 0 0 1 5-5z"/>
      <circle cx="12" cy="7" r="1.5" fill="#34d399"/>
      <path d="M5 20c2-1 4-1.5 7-1.5s5 .5 7 1.5"/>
    </svg>
  );
}
