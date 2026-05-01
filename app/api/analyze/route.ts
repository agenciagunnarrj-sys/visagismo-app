import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PROMPT = `Você é um consultor de imagem e visagismo. Sua tarefa é observar a GEOMETRIA e PROPORÇÕES do rosto na imagem — não identificar quem é a pessoa — e recomendar estilos de cabelo, barba e sobrancelha que harmonizem com essas proporções.

Analise apenas: formato geral do rosto (oval, redondo, quadrado, retangular, triangular, losango, coração), largura da testa, maçãs do rosto, mandíbula e comprimento do rosto.

Retorne APENAS um JSON válido com esta estrutura exata, sem texto adicional fora do JSON:

{
  "formato_rosto": "nome do formato",
  "descricao_formato": "explicação breve sobre as proporções identificadas",
  "corte_cabelo": {
    "recomendado": "nome do corte",
    "explicacao": "por que esse corte funciona para esse formato",
    "evitar": "cortes que não favorecem"
  },
  "barba": {
    "recomendada": "estilo de barba ideal",
    "explicacao": "por que essa barba equilibra o rosto",
    "evitar": "estilos que não favorecem"
  },
  "sobrancelha": {
    "formato_ideal": "formato recomendado",
    "explicacao": "como esse formato equilibra o rosto"
  },
  "dicas_extras": ["dica 1", "dica 2", "dica 3"]
}

Se a imagem não contiver um rosto humano visível, retorne: {"erro": "Não foi possível identificar um rosto na imagem. Por favor, envie uma foto mais clara."}`;

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const { image } = JSON.parse(body);

    if (!image) {
      return NextResponse.json({ erro: "Nenhuma imagem recebida." }, { status: 400 });
    }

    console.log("Image received, length:", image.length, "starts with:", image.slice(0, 30));

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Você é um consultor especialista em visagismo e estética. Sua função é analisar proporções geométricas faciais visíveis em imagens para recomendar cortes de cabelo, estilos de barba e formatos de sobrancelha. Você não identifica pessoas — apenas analisa formas, ângulos e proporções como um designer analisa uma figura geométrica. Sempre responda em JSON válido conforme solicitado.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Observe as proporções geométricas do rosto nesta imagem (largura da testa, maçãs do rosto, mandíbula, comprimento) e determine o formato do rosto. Com base nisso, retorne APENAS o seguinte JSON válido sem nenhum texto adicional:

{
  "formato_rosto": "nome do formato",
  "descricao_formato": "descrição das proporções observadas",
  "corte_cabelo": {
    "recomendado": "nome do corte ideal",
    "explicacao": "por que esse corte harmoniza com essas proporções",
    "evitar": "estilos que desarmonizan"
  },
  "barba": {
    "recomendada": "estilo de barba ideal",
    "explicacao": "como esse estilo equilibra as proporções",
    "evitar": "estilos que não favorecem"
  },
  "sobrancelha": {
    "formato_ideal": "formato recomendado",
    "explicacao": "como esse formato equilibra o rosto"
  },
  "dicas_extras": ["dica 1", "dica 2", "dica 3"]
}

Se não houver rosto visível na imagem, retorne: {"erro": "Não foi possível identificar um rosto na imagem. Por favor, envie uma foto mais clara."}`,
            },
            {
              type: "image_url",
              image_url: { url: image, detail: "high" },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const text = response.choices[0]?.message?.content ?? "";
    console.log("GPT-4o raw response:", text);

    // Strip markdown code blocks if present
    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

    const result = JSON.parse(cleaned);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Analyze error:", err);
    if (err instanceof SyntaxError) {
      return NextResponse.json({ erro: "Erro ao processar resposta da IA. Tente novamente." }, { status: 500 });
    }
    return NextResponse.json({ erro: "Erro interno. Tente novamente." }, { status: 500 });
  }
}
