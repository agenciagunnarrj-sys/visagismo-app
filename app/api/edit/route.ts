import { NextRequest, NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const maxDuration = 60;

interface EditRequest {
  image: string;
  active: {
    cabelo: boolean;
    barba: boolean;
    sobrancelha: boolean;
  };
  recommendations: {
    cabelo: string;
    barba: string;
    sobrancelha: string;
  };
}

function buildPrompt(active: EditRequest["active"], rec: EditRequest["recommendations"]): string {
  const changes: string[] = [];

  if (active.cabelo) {
    changes.push(`hair styled as "${rec.cabelo}" — cut and shape the hair to match this exact style`);
  }
  if (active.barba) {
    changes.push(`beard styled as "${rec.barba}" — add or shape the beard to match this exact style`);
  }
  if (active.sobrancelha) {
    changes.push(`eyebrows shaped as "${rec.sobrancelha}" — reshape the eyebrows to match this exact shape`);
  }

  if (changes.length === 0) return "";

  const changesList = changes.map((c, i) => `${i + 1}. Apply ${c}`).join(". ");

  return (
    `Ultra-realistic photo edit of the exact same person in this image. ` +
    `Preserve 100% of their identity: same face structure, skin tone, eye color, age, expression, background, and lighting. ` +
    `Apply ONLY these specific changes: ${changesList}. ` +
    `Do not alter anything else. The result must look like a real photograph, not AI-generated. ` +
    `Photorealistic, high detail, natural lighting, same camera angle and framing.`
  );
}

export async function POST(req: NextRequest) {
  try {
    const body: EditRequest = await req.json();
    const { image, active, recommendations } = body;

    if (!image || !active || !recommendations) {
      return NextResponse.json({ erro: "Dados incompletos." }, { status: 400 });
    }

    const prompt = buildPrompt(active, recommendations);
    if (!prompt) {
      return NextResponse.json({ erro: "Nenhuma alteração selecionada." }, { status: 400 });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const imageFile = await toFile(buffer, "photo.png", { type: "image/png" });

    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: imageFile,
      prompt,
      size: "1024x1024",
    });

    const resultB64 = response.data?.[0]?.b64_json;
    if (!resultB64) {
      return NextResponse.json({ erro: "Não foi possível gerar a imagem." }, { status: 500 });
    }

    return NextResponse.json({ image: `data:image/png;base64,${resultB64}` });
  } catch (err: unknown) {
    console.error("Edit error:", err);
    const message = err instanceof Error ? err.message : "Erro interno.";
    return NextResponse.json({ erro: message }, { status: 500 });
  }
}
