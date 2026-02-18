import { GoogleGenerativeAI } from "@google-cloud/generative-ai";

export default async function handler(req, res) {
  // 1. Vercel inyecta estas variables automáticamente desde su panel
  const llaves = [process.env.GEMINI_KEY_A, process.env.GEMINI_KEY_B];
  
  const { prompt } = req.body;

  // 2. Lógica de rotación
  for (let key of llaves) {
    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;

      return res.status(200).json({ respuesta: response.text() });
    } catch (error) {
      console.error("Fallo una llave, intentando la siguiente...");
      continue; // Si falla, el bucle prueba la siguiente llave
    }
  }

  res.status(500).json({ error: "No hay llaves disponibles." });
}