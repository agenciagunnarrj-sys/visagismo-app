import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const body = await req.text();
    const { image, profileImage, gender } = JSON.parse(body);

    if (!image) {
      return NextResponse.json({ erro: "Nenhuma imagem recebida." }, { status: 400 });
    }

    const isFem = gender === "feminino";

    const systemPrompt = `You are a visagismo (face shape analysis) expert assistant. Your only task is to analyze the geometric shape of a face — measuring proportions like forehead width, cheekbone width, jawline width, face length, and profile line — and return styling recommendations as JSON. You do NOT identify, recognize, or name any person. You only analyze geometric shapes and proportions. Always respond with valid JSON only, no extra text.`;

    const barbaCampoJson = isFem
      ? `"maquiagem": {
    "recomendada": "recommended makeup technique",
    "explicacao": "how it enhances the face shape, in Portuguese",
    "evitar": "what to avoid, in Portuguese"
  }`
      : `"barba": {
    "recomendada": "ideal beard style",
    "explicacao": "how this style balances proportions, in Portuguese",
    "evitar": "styles to avoid, in Portuguese"
  }`;

    const profileSection = profileImage
      ? `"linha_perfil": {
    "tipo": "profile line type (côncavo, convexo, reto, etc) in Portuguese",
    "descricao": "description of what was observed in the profile, in Portuguese",
    "recomendacoes": "specific recommendations based on profile line, in Portuguese"
  },`
      : "";

    const userPrompt = `You will receive ${profileImage ? "two images: first a frontal face photo, then a side profile photo" : "one frontal face photo"}. Analyze the geometric proportions to determine the face shape${profileImage ? " and profile line" : ""}. This is for a ${isFem ? "female" : "male"} person. Return ONLY this exact JSON, no other text:

{
  "formato_rosto": "face shape name in Portuguese",
  "descricao_formato": "description of observed proportions in Portuguese",
  "corte_cabelo": {
    "recomendado": "ideal haircut name",
    "explicacao": "why this haircut suits these proportions, in Portuguese",
    "evitar": "styles to avoid, in Portuguese"
  },
  ${barbaCampoJson},
  "sobrancelha": {
    "formato_ideal": "recommended eyebrow shape",
    "explicacao": "how this shape balances the face, in Portuguese"
  },
  ${profileSection}
  "dicas_extras": ["tip 1 in Portuguese", "tip 2 in Portuguese", "tip 3 in Portuguese"]
}

If no face is visible, return: {"erro": "Não foi possível identificar um rosto na imagem. Por favor, envie uma foto mais clara."}`;

    const imageContent: OpenAI.Chat.ChatCompletionContentPart[] = [
      { type: "text", text: userPrompt },
      { type: "image_url", image_url: { url: image, detail: "high" } },
    ];

    if (profileImage) {
      imageContent.push({ type: "image_url", image_url: { url: profileImage, detail: "high" } });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: imageContent },
      ],
      max_tokens: 1200,
    });

    const text = response.choices[0]?.message?.content ?? "";
    console.log("GPT-4o raw response:", text);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", text);
      return NextResponse.json({ erro: `IA retornou: ${text.slice(0, 300)}` }, { status: 500 });
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
