
import { GoogleGenAI, Type } from "@google/genai";
import { UserCheckIn, Protocol } from "../types";
import { PROTOCOLS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getProtocolSuggestion(checkIn: UserCheckIn): Promise<{ 
  protocolId: string; 
  reason: string; 
}> {
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
    - Example: "Para o estado que você relatou, este protocolo ajuda seu corpo a sair da defesa."
  `;

  try {
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
    
    // Fallback logic if AI fails or returns invalid ID
    const validId = PROTOCOLS.find(p => p.id === result.protocolId) ? result.protocolId : PROTOCOLS[0].id;
    
    return {
      protocolId: validId,
      reason: result.reason || "Este protocolo ajudará você a regular seu sistema agora."
    };
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return {
      protocolId: PROTOCOLS[0].id,
      reason: "Para o seu estado atual, este protocolo básico de segurança é o ponto de partida ideal."
    };
  }
}
