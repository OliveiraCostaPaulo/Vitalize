import { GoogleGenAI, Type } from "@google/genai";
import { UserCheckIn, Protocol } from "../types";
import { PROTOCOLS } from "../constants";

export async function getProtocolSuggestion(checkIn: UserCheckIn): Promise<{ 
  protocolId: string; 
  reason: string; 
}> {
  // Inicializamos a instância apenas quando necessário para evitar erros globais de API Key
  const apiKey = (window as any).process?.env?.API_KEY || (process as any)?.env?.API_KEY || "";
  
  if (!apiKey) {
    console.warn("Vitalize: API_KEY não detectada. Usando recomendação padrão.");
    return {
      protocolId: PROTOCOLS[0].id,
      reason: "Para o seu estado atual, este protocolo básico de segurança é o ponto de partida ideal."
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      A user just completed a state check-in:
      - Body state: ${checkIn.body}
      - Predominant emotion: ${checkIn.emotion}
      - Vital energy: ${checkIn.energy}

      Based on these inputs, recommend ONE of the following protocols:
      ${PROTOCOLS.map(p => `${p.id}: ${p.title} - ${p.description}`).join('\n')}

      Rules:
      - Return exactly one protocol ID.
      - Provide a short, human, comforting reason (1 sentence) in Portuguese.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            protocolId: { type: Type.STRING },
            reason: { type: Type.STRING }
          },
          required: ["protocolId", "reason"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    const validId = PROTOCOLS.find(p => p.id === result.protocolId) ? result.protocolId : PROTOCOLS[0].id;
    
    return {
      protocolId: validId,
      reason: result.reason || "Este protocolo ajudará você a regular seu sistema agora."
    };
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return {
      protocolId: PROTOCOLS[0].id,
      reason: "Para o seu estado atual, este protocolo básico de segurança ajudará na sua regulação."
    };
  }
}