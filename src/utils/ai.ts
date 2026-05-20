import { GoogleGenAI } from "@google/genai";
import { config } from "@/core/config";

const ai = new GoogleGenAI({ apiKey: config.googleAiKey });

interface Img2ImgResult {
  success: true;
  buffer: Buffer;
}

interface Img2ImgError {
  success: false;
  text: string;
}

export type Img2ImgResponse = Img2ImgResult | Img2ImgError;

export async function img2img(
  imageBuffer: Buffer,
  mimeType: string,
  prompt: string,
): Promise<Img2ImgResponse> {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-exp-image-generation",
    contents: [
      { text: prompt },
      { inlineData: { mimeType, data: imageBuffer.toString("base64") } },
    ],
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p: { inlineData?: { mimeType?: string; data?: string } }) =>
    p.inlineData?.mimeType?.startsWith("image/"),
  );

  if (imagePart?.inlineData?.data) {
    return { success: true, buffer: Buffer.from(imagePart.inlineData.data, "base64") };
  }

  const text = parts
    .map((p: { text?: string }) => p.text ?? "")
    .filter(Boolean)
    .join("\n");

  return { success: false, text: text || "Gagal menghasilkan gambar" };
}
