import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export interface AnimalAnalysis {
  species: string;
  behavior: string;
  detailedBehaviors: string[]; // Added list for more specificity
  alertLevel: number;
  confidence: number;
  insight: string;
  researchNotes: string;
  boundingBox?: { // Normalized 0-1000 coordinates (top, left, height, width)
    ymin: number;
    xmin: number;
    ymax: number;
    xmax: number;
  };
}

export async function analyzeAnimal(file: File, userContext?: string): Promise<AnimalAnalysis> {
  const base64Data = await fileToBase64(file);
  const mimeType = file.type;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `Analyze the animal in this image or video. 
            Perform the following:
            1. Detect the species.
            2. Classify behavior (e.g., alert, hunting, relaxed, stressed, social).
            3. Provide a list of detailed atomic behaviors observed (detailedBehaviors).
            4. Calculate an "Alert Level Score" from 0 to 100 based on body language, posture, and gaze.
            5. Provide a brief research insight explaining the behavior.
            6. Identify the bounding box of the animal as normalized coordinates [ymin, xmin, ymax, xmax] between 0 and 1000.
            
            ${userContext ? `User Provided Context: "${userContext}" - Use this to inform your analysis.` : ""}
            
            Return the result in strict JSON format matching the provided schema.`,
          },
          {
            inlineData: {
              data: base64Data.split(",")[1],
              mimeType: mimeType,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          species: { type: Type.STRING, description: "Species name (Scientific and Common)" },
          behavior: { type: Type.STRING, description: "Primary observed behavior" },
          detailedBehaviors: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of specific behavioral cues" 
          },
          alertLevel: { type: Type.NUMBER, description: "Score from 0-100" },
          confidence: { type: Type.NUMBER, description: "Detection confidence (0-1)" },
          insight: { type: Type.STRING, description: "Immediate behavioral analysis" },
          researchNotes: { type: Type.STRING, description: "Broader research context/insights" },
          boundingBox: {
            type: Type.OBJECT,
            properties: {
              ymin: { type: Type.NUMBER },
              xmin: { type: Type.NUMBER },
              ymax: { type: Type.NUMBER },
              xmax: { type: Type.NUMBER },
            },
            required: ["ymin", "xmin", "ymax", "xmax"]
          }
        },
        required: ["species", "behavior", "detailedBehaviors", "alertLevel", "confidence", "insight", "researchNotes", "boundingBox"],
      },
    },
  });

  if (!response.text) {
    throw new Error("No response from AI");
  }

  return JSON.parse(response.text.trim()) as AnimalAnalysis;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
