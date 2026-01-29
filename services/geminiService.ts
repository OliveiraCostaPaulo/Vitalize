
import { GoogleGenAI, Type } from "@google/genai";
import { UserCheckIn, Protocol } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getProtocolSuggestion(checkIn: UserCheckIn, protocols: Protocol[]): Promise<{ 
  protocolId: string; 
  reason: string; 
}> {
  if (!protocols || protocols.length === 0) {
    return { protocolId: '', reason: 'Nenhum protocolo disponível no momento.' };
  }

  const prompt = `
    A user just completed a state check-in:
    - Body state: ${checkIn.body}
    - Predominant emotion: ${checkIn.emotion}
    - Vital energy: ${checkIn.energy}

    Based on these inputs, recommend ONE of the following protocols from our database:
    ${protocols.map(p => `${p.id}: ${p.title} - ${p.description}`).join('\n')}

    Rules:
    - Return exactly one protocol ID that MUST exist in the list above.
    - Provide a short, human, comforting reason (1 sentence) in Portuguese.
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
    const validId = protocols.find(p => p.id === result.protocolId) ? result.protocolId : protocols[0].id;
    
    return {
      protocolId: validId,
      reason: result.reason || "Este protocolo ajudará você a regular seu sistema agora."
    };
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return {
      protocolId: protocols[0].id,
      reason: "Para o seu estado atual, este protocolo de segurança é o ponto de partida ideal."
    };
  }
}
