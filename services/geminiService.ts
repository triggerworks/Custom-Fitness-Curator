
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, WorkoutPlan } from "../types";

const API_KEY = process.env.API_KEY || "";

export interface ExerciseMotion {
  start: string;
  end: string;
}

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  async generateWorkoutPlan(profile: UserProfile): Promise<WorkoutPlan> {
    const prompt = `Generate a comprehensive fitness workout plan for a user with the following profile:
    - Equipment: ${profile.equipment.join(", ")}
    - Goals: ${profile.goals}
    - Schedule: ${profile.schedule}
    - Timeline: ${profile.timeline}
    - Experience Level: ${profile.experienceLevel}
    
    The plan should be professional, safe, and effective. Include a catchy title, a general overview, specific exercises for each day mentioned in the schedule, and brief dietary advice.`;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            overview: { type: Type.STRING },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayName: { type: Type.STRING },
                  focus: { type: Type.STRING },
                  exercises: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        sets: { type: Type.NUMBER },
                        reps: { type: Type.STRING },
                        instructions: { type: Type.STRING },
                        targetMuscle: { type: Type.STRING },
                      },
                      required: ["name", "sets", "reps", "instructions", "targetMuscle"],
                    },
                  },
                },
                required: ["dayName", "focus", "exercises"],
              },
            },
            dietaryAdvice: { type: Type.STRING },
          },
          required: ["title", "overview", "days", "dietaryAdvice"],
        },
      },
    });

    const text = response.text || "";
    return JSON.parse(text);
  }

  async generateExerciseMotion(exerciseName: string): Promise<ExerciseMotion | null> {
    try {
      // We perform two parallel requests for start and end positions to ensure specific framing
      const generateFrame = async (phase: 'start' | 'peak') => {
        const response = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              {
                text: `A clean, professional schematic illustration of a person performing ${exerciseName}. 
                Phase: ${phase === 'start' ? 'Initial starting position' : 'Final peak contraction/end position'}. 
                Style: Minimalist fitness diagram, blue and emerald color palette, dark background. 
                Focus on correct biomechanics. No text in image. High contrast.`,
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: "1:1"
            },
          },
        });

        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
        return null;
      };

      const [start, end] = await Promise.all([
        generateFrame('start'),
        generateFrame('peak')
      ]);

      if (start && end) {
        return { start, end };
      }
      return null;
    } catch (error) {
      console.error("Error generating exercise motion:", error);
      return null;
    }
  }

  async getMotivation(goal: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Give me a short, highly motivating, and punchy quote for someone trying to achieve: ${goal}. Limit to 2 sentences.`,
    });
    return response.text || "Push harder than yesterday if you want a different tomorrow.";
  }
}

export const geminiService = new GeminiService();
