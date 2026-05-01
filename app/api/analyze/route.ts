import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const body = await req.text();
    const { image, gender } = JSON.parse(body);

    if (!image) {
      return NextResponse.json({ erro: "Nenhuma imagem recebida." }, { status: 400 });
    }

    const isFem = gender === "feminino";
    const barbaCampo = isFem
      ? `"maquiagem": { "recomendada": "técnica ou produto recomendado", "explicacao": "como valoriza o formato do rosto", "evitar": "o que evitar" }`
      : `"barba": { "recomendada": "estilo de barba ideal", "explicacao": "como esse estilo equilibra as proporções", "evitar": "estilos que não favorecem" }`;

    const systemPrompt = `You are a visagismo (face shape analysis) expert assistant. Your only task is to analyze the geometric shape of a face in an image — measuring proportions like forehead width, cheekbone width, jawline width, and face length — and return styling recommendations as JSON. You do NOT identify, recognize, or name any person. You only analyze geometric shapes and proportions, the same way a geometry tool would measure a drawing. Always respond with valid JSON only, no extra text.`;

    const userPrompt = isFem
      ? `Analyze the geometric proportions of the face in this image (forehead width, cheekbones, jawline, face length) to determine the face shape. This is for a female person. Return ONLY this exact JSON structure, no other text:

{
  "formato_rosto": "face shape name in Portuguese",
  "descricao_formato": "description of observed proportions in Portuguese",
  "corte_cabelo": {
    "recomendado": "ideal haircut name",
    "explicacao": "why this haircut suits these proportions, in Portuguese",
    "evitar": "styles to avoid, in Portuguese"
  },
  "maquiagem": {
    "recomendada": "recommended makeup technique or product",
    "explicacao": "how it enhances the face shape, in Portuguese",
    "evitar": "what to avoid, in Portuguese"
  },
  "sobrancelha": {
    "formato_ideal": "recommended eyebrow shape",
    "explicacao": "how this shape balances the face, in Portuguese"
  },
  "dicas_extras": ["tip 1 in Portuguese", "tip 2 in Portuguese", "tip 3 in Portuguese"]
}

If no face is visible, return: {"erro": "Não foi possível identificar um rosto na imagem. Por favor, envie uma foto mais clara."}`
      : `Analyze the geometric proportions of the face in this image (forehead width, cheekbones, jawline, face length) to determine the face shape. This is for a male person. Return ONLY this exact JSON structure, no other text:

{
  "formato_rosto": "face shape name in Portuguese",
  "descricao_formato": "description of observed proportions in Portuguese",
  "corte_cabelo": {
    "recomendado": "ideal haircut name",
    "explicacao": "why this haircut suits these proportions, in Portuguese",
    "evitar": "styles to avoid, in Portuguese"
  },
  "barba": {
    "recomendada": "ideal beard style",
    "explicacao": "how this style balances proportions, in Portuguese",
    "evitar": "styles to avoid, in Portuguese"
  },
  "sobrancelha": {
    "formato_ideal": "recommended eyebrow shape",
    "explicacao": "how this shape balances the face, in Portuguese"
  },
  "dicas_extras": ["tip 1 in Portuguese", "tip 2 in Portuguese", "tip 3 in Portuguese"]
}

If no face is visible, return: {"erro": "Não foi possível identificar um rosto na imagem. Por favor, envie uma foto mais clara."}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            { type: "image_url", image_url: { url: image, detail: "low" } },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const text = response.choices[0]?.message?.content ?? "";
    console.log("GPT-4o raw response:", text);

    // Extract JSON from response (handles markdown blocks and extra text)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", text);
      return NextResponse.json({ erro: "A IA não retornou uma análise válida. Tente novamente com outra foto." }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Analyze error:", err);
    if (err instanceof SyntaxError) {
      return NextResponse.json({ erro: "Erro ao processar resposta da IA. Tente novamente." }, { status: 500 });
    }
    return NextResponse.json({ erro: "Erro interno. Tente novamente." }, { status: 500 });
  }
}
