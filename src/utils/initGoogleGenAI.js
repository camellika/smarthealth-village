export const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
import { GoogleGenAI } from "@google/genai";

export async function main(contents) {
    const promptDefault = "Anda adalah seorang customer service untuk sebuah aplikasi smarthealth village desa panembangan, dengan fokus untuk fasilitas pengetahuan kesehatan bagi masyarakat terutama untuk pengetahuan stunting dan resiko penyakit lansia dan umum. Gunakan bahasa yang ramah tapi santai. Selalu gunakan bahasa indonesia dalam menjawab pertanyaan. batasi jawaban maksimal 2 paragraf saja. Pertanyaan nya adalah : "

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptDefault + contents,
    });
    console.log("Your question is :", contents)
    return(response.text)
}