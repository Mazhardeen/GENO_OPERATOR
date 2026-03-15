
export enum Language {
  ENGLISH = 'en',
  URDU = 'ur',
  MIXED = 'mixed'
}

export type AgeGroup = 'kid' | 'young' | 'mature' | 'old';

export type BroadcastStyle = 'english_full' | 'mixed_ur_en' | 'urdu_full' | 'hindi' | 'hindi_urdu';

export interface VoiceProfile {
  id: string;
  name: string;
  gender: 'M' | 'F';
  ageGroup: AgeGroup;
  geminiVoiceName: string; // Underlying Gemini ID
  avatarUrl: string;
  traits: string[]; // e.g., 'deep', 'soft', 'energetic', 'raspy', 'melodious', 'nasal', 'breathy', 'calm'
  isCustom?: boolean; // Plugin flag
  isSinger?: boolean; // Singing capability flag
}

export interface CharacterProfile {
  name: string;
  gender: 'M' | 'F';
  ageGroup: AgeGroup;
  personalityKeywords: string[]; // e.g., 'cheerful', 'angry', 'shy'
}

export interface ScriptAnalysis {
  globalAgeGroup: AgeGroup;
  speakerCount: number;
  characterProfiles: CharacterProfile[];
  durationEstimate: number;
}

export interface AppState {
  step: 'input' | 'casting' | 'processing' | 'done';
  scriptText: string;
  broadcastStyle: BroadcastStyle;
  directorsNote: string;
  analysis: ScriptAnalysis | null;
  characterMap: Record<string, string>; // characterName -> voiceId
  isProcessing: boolean;
  processStatus: string; // "Rendering", "Analysing", "Fixing"
  audioBase64: string | null;
  isUrdu: boolean;
  isPoetryMode: boolean; // NEW: Toggle for Poetry/Mushaira
  customVoices: VoiceProfile[]; // Plugin: Store user uploaded voices
  voiceUsageHistory: Record<string, number>; // voiceId -> timestamp (last used)
}
