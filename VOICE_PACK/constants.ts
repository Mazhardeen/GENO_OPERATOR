
import { VoiceProfile, AgeGroup } from './types';

export const UI_STRINGS = {
  en: {
    title: "MD Voice",
    subtitle: "Hyper-Realistic AI Audio Engine",
    pasteLabel: "Paste Script (Auto-Foley & Emotion)",
    styleLabel: "Broadcast Style",
    directorsNoteLabel: "Director's Note (Speed, Mood, Style)",
    directorsNotePlaceholder: "e.g., 'Make it scary', 'Speak very fast', 'Whisper the end'...",
    analyzeBtn: "Analyze Script & Detect Voices",
    detectHeader: "AI Cast Result",
    castHeader: "Casting Panel",
    generateBtn: "Generate Masterpiece (Perfect Pronunciation)",
    downloadBtn: "Download MP3 (HQ)",
    previewBtn: "Play Drama",
    pauseBtn: "Pause",
    cloneBtn: "Clone New Voice",
    cloneHeader: "Voice Cloning Studio",
    uploadLabel: "Upload Voice Sample (.wav/.mp3)",
    cloningProcessing: "Analyzing Timbre & Prosody...",
    processing: {
      render: "Injecting Human Nuances (Sighs, Laughter)...",
      analyse: "Modulating Gender & Resonance...",
      fix: "Mixing Audio...",
      done: "Showtime Ready"
    },
    panelLabels: {
      kid: "Kids Panel (7-12 yrs)",
      young: "Young Panel (13-30)",
      mature: "Mature Panel (31-50)",
      old: "Old Panel (≥ 51)"
    },
    styles: {
      english_full: "Full English",
      mixed_ur_en: "Mixed (Eng/Urdu)",
      urdu_full: "Full Urdu",
      hindi: "Hindi",
      hindi_urdu: "Hindi+Urdu Mix"
    }
  },
  ur: {
    title: "ایم ڈی وائس",
    subtitle: "انتہائی حقیقت پسندانہ آڈیو انجن",
    pasteLabel: "کہانی کا اسکرپٹ یہاں لکھیں (خودکار سانسیں اور جذبات)",
    styleLabel: "بولنے کا انداز",
    directorsNoteLabel: "ہدایت کار کا نوٹ (رفتار، موڈ، انداز)",
    directorsNotePlaceholder: "مثلاً: 'ڈرائونا انداز رکھیں'، 'بہت تیز بولیں'، 'آخر میں سرگوشی کریں'...",
    analyzeBtn: "اسکرپٹ کا تجزیہ اور آواز کا انتخاب",
    detectHeader: "تجزیہ کا نتیجہ (عمر + جذبات)",
    castHeader: "کاسٹنگ پینل",
    generateBtn: "انتہائی نیچرل آڈیو (بہترین تلفظ + جذبات)",
    downloadBtn: "ڈاؤن لوڈ MP3 (HQ)",
    previewBtn: "سنیں",
    pauseBtn: "روکیں",
    cloneBtn: "نئی آواز کلون کریں",
    cloneHeader: "وائس کلوننگ اسٹوڈیو",
    uploadLabel: "آواز کا نمونہ اپ لوڈ کریں (.wav/.mp3)",
    cloningProcessing: "آواز کا تجزیہ جاری ہے...",
    processing: {
      render: "اداکاری جاری ہے (سانس، ہنسی، ٹھہراؤ)...",
      analyse: "آوازوں کی تبدیلی جاری ہے...",
      fix: "آڈیو مکسنگ جاری ہے...",
      done: "ڈرامہ تیار ہے"
    },
    panelLabels: {
      kid: "بچوں کی آوازیں (7-12 سال)",
      young: "نوجوانوں کی آوازیں (13-30)",
      mature: "بڑوں کی آوازیں (31-50)",
      old: "بزرگوں کی آوازیں (≥ 51)"
    },
    styles: {
      english_full: "انگریزی",
      mixed_ur_en: "مکسڈ (اردو + انگلش)",
      urdu_full: "خالص اردو",
      hindi: "ہندی",
      hindi_urdu: "ہندی + اردو مکس"
    }
  }
};

// Helper to generate voices
const createVoice = (id: string, name: string, gender: 'M'|'F', age: AgeGroup, voice: string, seed: string, traits: string[], isSinger: boolean = false): VoiceProfile => ({
  id, name, gender, ageGroup: age, geminiVoiceName: voice,
  avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=${isSinger ? 'ffd700' : 'b6e3f4'}`,
  traits,
  isSinger
});

// 46 Voice Bank (10 per age group + 6 Singers + 1 Special Poet)
export const VOICE_BANK: VoiceProfile[] = [
  // --- SPECIAL: THE POET ---
  createVoice('special_poet', 'Ustad Jaun (Poet)', 'M', 'old', 'Charon', 'JaunElia', ['poetic', 'deep', 'melancholic', 'professional', 'intense'], true),

  // --- SINGERS (SPECIAL CATEGORY) ---
  createVoice('s_m_1', 'Singer Aarav', 'M', 'young', 'Zephyr', 'AaravSinger', ['melodious', 'romantic', 'soft', 'crooner'], true),
  createVoice('s_m_2', 'Singer Rock', 'M', 'young', 'Fenrir', 'RockSinger', ['powerful', 'high-pitch', 'energetic', 'raspy'], true),
  createVoice('s_m_3', 'Ustad Sufi', 'M', 'mature', 'Charon', 'SufiSinger', ['deep', 'soulful', 'resonant', 'classical'], true),
  createVoice('s_f_1', 'Singer Melody', 'F', 'young', 'Kore', 'MelodySinger', ['sweet', 'high-pitch', 'disney-style', 'clear'], true),
  createVoice('s_f_2', 'Singer Diva', 'F', 'mature', 'Kore', 'DivaSinger', ['strong', 'operatic', 'vibrato', 'dramatic'], true),
  createVoice('s_f_3', 'Abida Ji', 'F', 'old', 'Kore', 'AbidaSinger', ['husky', 'folk', 'raw', 'emotional'], true),

  // --- KIDS (≤ 12) ---
  createVoice('k_m_1', 'Bunty', 'M', 'kid', 'Puck', 'Bunty', ['playful', 'energetic', 'loud', 'nasal']),
  createVoice('k_m_2', 'Raju', 'M', 'kid', 'Puck', 'Raju', ['shy', 'soft', 'innocent', 'breathy']),
  createVoice('k_m_3', 'Sunny', 'M', 'kid', 'Puck', 'Sunny', ['brave', 'assertive', 'clear', 'melodious']),
  createVoice('k_m_4', 'Ali', 'M', 'kid', 'Puck', 'AliKid', ['calm', 'smart', 'composed', 'soft-spoken']),
  createVoice('k_m_5', 'Zain', 'M', 'kid', 'Puck', 'ZainKid', ['mischievous', 'fast', 'funny', 'high-pitch']),
  createVoice('k_f_1', 'Zoya', 'F', 'kid', 'Kore', 'Zoya', ['cheerful', 'bubbly', 'sweet', 'melodious']),
  createVoice('k_f_2', 'Mina', 'F', 'kid', 'Kore', 'Mina', ['quiet', 'gentle', 'sad', 'breathy']),
  createVoice('k_f_3', 'Sara', 'F', 'kid', 'Kore', 'SaraKid', ['bossy', 'loud', 'confident', 'sharp']),
  createVoice('k_f_4', 'Haniya', 'F', 'kid', 'Kore', 'Haniya', ['curious', 'smart', 'soft', 'clear']),
  createVoice('k_f_5', 'Dua', 'F', 'kid', 'Kore', 'Dua', ['innocent', 'cute', 'babyish', 'nasal']),

  // --- YOUNG (13-30) ---
  createVoice('y_m_1', 'Bilal', 'M', 'young', 'Zephyr', 'Bilal', ['cool', 'casual', 'urban', 'relaxed']),
  createVoice('y_m_2', 'Hamza', 'M', 'young', 'Zephyr', 'Hamza', ['serious', 'nerdy', 'formal', 'monotone']),
  createVoice('y_m_3', 'Fahad', 'M', 'young', 'Zephyr', 'Fahad', ['aggressive', 'loud', 'angry', 'raspy']),
  createVoice('y_m_4', 'Saad', 'M', 'young', 'Zephyr', 'Saad', ['romantic', 'soft', 'poetic', 'breathy']),
  createVoice('y_m_5', 'Omar', 'M', 'young', 'Zephyr', 'Omar', ['funny', 'joker', 'fast', 'energetic']),
  createVoice('y_f_1', 'Ayesha', 'F', 'young', 'Kore', 'Ayesha', ['friendly', 'warm', 'host', 'melodious']),
  createVoice('y_f_2', 'Fatima', 'F', 'young', 'Kore', 'Fatima', ['strict', 'professional', 'clear', 'sharp']),
  createVoice('y_f_3', 'Sana', 'F', 'young', 'Kore', 'Sana', ['emotional', 'dramatic', 'soft', 'tearful']),
  createVoice('y_f_4', 'Zara', 'F', 'young', 'Kore', 'Zara', ['modern', 'stylish', 'confident', 'husky']),
  createVoice('y_f_5', 'Mahnoor', 'F', 'young', 'Kore', 'Mahnoor', ['shy', 'whispery', 'gentle', 'breathy']),

  // --- MATURE (31-50) ---
  createVoice('m_m_1', 'Mr. Khan', 'M', 'mature', 'Fenrir', 'Khan', ['deep', 'authoritative', 'boss', 'resonant']),
  createVoice('m_m_2', 'Dr. Ahmed', 'M', 'mature', 'Fenrir', 'Ahmed', ['calm', 'wise', 'soothing', 'soft']),
  createVoice('m_m_3', 'Officer Roy', 'M', 'mature', 'Fenrir', 'Roy', ['loud', 'rough', 'strong', 'gravelly']),
  createVoice('m_m_4', 'Chef Kabir', 'M', 'mature', 'Fenrir', 'Kabir', ['cheerful', 'energetic', 'friendly', 'booming']),
  createVoice('m_m_5', 'Boss', 'M', 'mature', 'Fenrir', 'Boss', ['cold', 'stern', 'villain', 'flat']),
  createVoice('m_f_1', 'Mrs. Malik', 'F', 'mature', 'Kore', 'Malik', ['motherly', 'warm', 'caring', 'melodious']),
  createVoice('m_f_2', 'Dr. Salma', 'F', 'mature', 'Kore', 'Salma', ['professional', 'intelligent', 'sharp', 'crisp']),
  createVoice('m_f_3', 'Principal', 'F', 'mature', 'Kore', 'Principal', ['strict', 'loud', 'commanding', 'strident']),
  createVoice('m_f_4', 'Judge Naheed', 'F', 'mature', 'Kore', 'Naheed', ['serious', 'fair', 'balanced', 'calm']),
  createVoice('m_f_5', 'News Anchor', 'F', 'mature', 'Kore', 'Anchor', ['neutral', 'clear', 'fast', 'polished']),

  // --- OLD (≥ 51) ---
  createVoice('o_m_1', 'Chacha Bashir', 'M', 'old', 'Charon', 'Bashir', ['raspy', 'funny', 'villager', 'wheezy']),
  createVoice('o_m_2', 'Grandpa Joe', 'M', 'old', 'Charon', 'Joe', ['weak', 'slow', 'gentle', 'trembling']),
  createVoice('o_m_3', 'Baba Jee', 'M', 'old', 'Charon', 'Baba', ['wise', 'deep', 'spiritual', 'resonant']),
  createVoice('o_m_4', 'Old Captain', 'M', 'old', 'Charon', 'Captain', ['gruff', 'loud', 'storyteller', 'gravelly']),
  createVoice('o_m_5', 'Hakeem Sahab', 'M', 'old', 'Charon', 'Hakeem', ['soft', 'knowledgeable', 'calm', 'measured']),
  createVoice('o_f_1', 'Nani Jaan', 'F', 'old', 'Kore', 'Nani', ['sweet', 'loving', 'weak', 'thin']), 
  createVoice('o_f_2', 'Dadi Amma', 'F', 'old', 'Kore', 'Dadi', ['strict', 'traditional', 'loud', 'nasal']),
  createVoice('o_f_3', 'Old Lady Rose', 'F', 'old', 'Kore', 'Rose', ['posh', 'elegant', 'soft', 'haughty']),
  createVoice('o_f_4', 'Auntie Shamim', 'F', 'old', 'Kore', 'Shamim', ['gossip', 'fast', 'high-pitch', 'shrill']),
  createVoice('o_f_5', 'Granny', 'F', 'old', 'Kore', 'Granny', ['crackly', 'witch', 'scary', 'raspy']),
];
