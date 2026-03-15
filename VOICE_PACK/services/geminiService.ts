
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ScriptAnalysis, AgeGroup, VoiceProfile, BroadcastStyle } from "../types";
import { VOICE_BANK } from "../constants";

// --- AUTO-FIX UTILITIES ---

const getClient = () => {
  // robust check for process.env
  let apiKey = '';
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      apiKey = process.env.API_KEY;
    }
  } catch (e) {
    console.warn("Error accessing process.env", e);
  }
  
  if (!apiKey) {
    console.warn("API_KEY not found in process.env. Using empty key (may fail).");
  }
  
  return new GoogleGenAI({ apiKey });
};

/**
 * Wrapper to execute GenAI calls with Smart Exponential Backoff
 */
async function safeExecute<T>(operation: (ai: GoogleGenAI) => Promise<T>, fallbackValue: T | null = null): Promise<T | null> {
  const ai = getClient();
  const maxRetries = 3; // Increased to 3 for better resilience
  let delay = 1000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation(ai);
    } catch (e: any) {
      const errString = e.toString().toLowerCase();
      
      // CRITICAL FIX: Do not retry on Bad Requests (400), Auth Errors (401/403), or Not Found
      if (
        errString.includes('400') || 
        errString.includes('401') || 
        errString.includes('403') || 
        errString.includes('invalid') || 
        errString.includes('found') // covers 'not found'
      ) {
        console.error("Non-retriable API Error:", e);
        break; 
      }

      const isQuota = errString.includes('429') || errString.includes('quota') || errString.includes('exhausted');
      
      console.warn(`API Attempt ${attempt + 1}/${maxRetries + 1} failed. Retrying...`, e);
      
      if (attempt === maxRetries) {
         console.error("Max retries reached. Final Error:", e);
         break;
      }

      // Backoff
      const waitTime = isQuota ? delay * 2 : delay;
      await new Promise(r => setTimeout(r, waitTime));
      delay *= 2; 
    }
  }

  return fallbackValue;
}

// Helper: Generate a soft placeholder audio (Soft Sine Wave)
const createFallbackAudio = (durationSec: number = 2): string => {
  const sampleRate = 24000;
  const numFrames = sampleRate * durationSec;
  const buffer = new Uint8Array(numFrames * 2);
  const view = new DataView(buffer.buffer);
  
  for (let i = 0; i < numFrames; i++) {
    const sample = Math.sin(2 * Math.PI * 220 * (i / sampleRate)) * 3000;
    view.setInt16(i * 2, sample, true); 
  }
  
  let binary = '';
  const len = buffer.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
};

// --- CORE SERVICES ---

export const analyzeScript = async (scriptText: string): Promise<ScriptAnalysis | null> => {
  return safeExecute(async (ai) => {
    // Optimized Prompt: JSON Schema forced
    const prompt = `
      Analyze the following script. 
      Identify speaker names, their gender (M/F), and age group (kid/young/mature/old).
      Return JSON.
      
      Script:
      "${scriptText.slice(0, 3000)}"
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            globalAgeGroup: { type: Type.STRING, enum: ['kid', 'young', 'mature', 'old'] },
            speakerCount: { type: Type.NUMBER },
            characterProfiles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  gender: { type: Type.STRING, enum: ['M', 'F'] },
                  ageGroup: { type: Type.STRING, enum: ['kid', 'young', 'mature', 'old'] },
                  personalityKeywords: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['name', 'gender', 'ageGroup', 'personalityKeywords']
              }
            },
            durationEstimate: { type: Type.NUMBER }
          },
          required: ['globalAgeGroup', 'speakerCount', 'characterProfiles', 'durationEstimate']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    return JSON.parse(text) as ScriptAnalysis;
  }, {
    // Light Fallback
    globalAgeGroup: 'young',
    speakerCount: 1,
    characterProfiles: [
      { name: 'Narrator', gender: 'M', ageGroup: 'mature', personalityKeywords: ['neutral'] }
    ],
    durationEstimate: 30
  });
};

export const generateVoicePreview = async (voiceId: string): Promise<string | null> => {
  const profile = VOICE_BANK.find(v => v.id === voiceId);
  if (!profile) return createFallbackAudio(1);

  return safeExecute(async (ai) => {
    const prompt = `Hello, this is ${profile.name}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: profile.geminiVoiceName } }
        }
      }
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || createFallbackAudio(1);
  }, createFallbackAudio(1));
};

export const generateStudioAudio = async (
  scriptText: string, 
  characterMap: Record<string, string>,
  style: BroadcastStyle,
  analysis: ScriptAnalysis | null,
  directorsNote: string,
  isPoetryMode: boolean = false
): Promise<string | null> => {
  
  return safeExecute(async (ai) => {
    // 1. Configs
    const configs = Object.entries(characterMap).map(([charName, voiceId]) => {
      const profile = VOICE_BANK.find(v => v.id === voiceId) || VOICE_BANK[0];
      // Sanitize speaker name to ensure it works with multi-speaker config
      const safeSpeakerName = charName.replace(/[^a-zA-Z0-9 ]/g, '').trim() || "Speaker";
      return {
        speaker: safeSpeakerName,
        profile,
        voiceConfig: { prebuiltVoiceConfig: { voiceName: profile.geminiVoiceName } }
      };
    });

    if (configs.length === 0) {
      configs.push({ 
        speaker: 'Narrator', 
        profile: VOICE_BANK[0], 
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } 
      });
    }

    const speechConfig = configs.length === 1 
      ? { voiceConfig: configs[0].voiceConfig }
      : { multiSpeakerVoiceConfig: { speakerVoiceConfigs: configs.map(c => ({ speaker: c.speaker, voiceConfig: c.voiceConfig })) } };

    // 2. Simplified Prompt for TTS Stability
    
    const contextInstruction = directorsNote 
      ? `(Context: ${directorsNote})` 
      : `(Context: ${style === 'urdu_full' ? 'Urdu language, clear pronunciation' : 'Natural flow'})`;

    // 3. Inject Poet Rules if the poet voice is active OR poetry mode is ON
    // Updated Rule: Removed "Slow" and "Long Pauses". Added "Normal Pace" and "Professional".
    const hasPoet = configs.some(c => c.profile.id === 'special_poet');
    const poetRule = (hasPoet || isPoetryMode)
      ? "**SPECIAL INSTRUCTION: Recite this text with deep, resonant, and intense emotion fitting a professional poet. Maintain a NORMAL speaking tempo. Do NOT speak slowly. Do NOT add excessive pauses or theatrical sighs. Focus on the gravity and feeling of the words.**" 
      : "";

    const prompt = `
      ${contextInstruction}
      ${poetRule}
      
      Script:
      ${scriptText}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: speechConfig
      }
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) throw new Error("No audio returned from API");
    return audioData;

  }, createFallbackAudio(3));
};
