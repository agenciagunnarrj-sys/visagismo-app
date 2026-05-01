import { NextRequest, NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";

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
    changes.push(`change the hairstyle to "${rec.cabelo}"`);
  }
  if (active.barba) {
    changes.push(`change the beard/makeup to "${rec.barba}"`);
  }
  if (active.sobrancelha) {
    changes.push(`reshape the eyebrows to "${rec.sobrancelha}"`);
  }

  if (changes.length === 0) return "";

  return (
    `Professional beauty salon photo retouching. This is the same person, same photo, same everything — only apply these specific beauty changes: ${changes.join(", ")}. ` +
    `CRITICAL REQUIREMENTS: ` +
    `- Keep the exact same face, skin tone, eye color, facial features, and bone structure ` +
    `- Keep the exact same background, lighting, pose, and camera angle ` +
    `- Keep the exact same clothing and accessories ` +
    `- Only modify the specific hair/beard/eyebrow areas mentioned ` +
    `- Result must be indistinguishable from a real photograph ` +
    `- Ultra-high resolution, sharp details, natural shadows and highlights ` +
    `- No cartoon, no painting, no AI artifacts — pure photorealism`
  );
}

export async function POST(req: NextRequest) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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
      quality: "high",
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
