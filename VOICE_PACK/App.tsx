
import React, { useState, useRef, useEffect } from 'react';
import { 
  Wand2, 
  Download, 
  Play, 
  Pause,
  Languages, 
  Mic2, 
  CheckCircle2, 
  PlayCircle,
  StopCircle,
  Film,
  PlusCircle,
  Upload,
  X,
  Key,
  AlertTriangle,
  RefreshCcw,
  Battery,
  BatteryMedium,
  BatteryWarning,
  Zap,
  Feather
} from 'lucide-react';
import { AppState, AgeGroup, BroadcastStyle, VoiceProfile } from './types';
import { UI_STRINGS, VOICE_BANK } from './constants';
import { analyzeScript, generateStudioAudio, generateVoicePreview } from './services/geminiService';

// Declare globals
declare const lamejs: any;
declare const window: any;

// --- QUOTA TRACKER UTILS ---
const DAILY_LIMIT_ESTIMATE = 50; // Conservative estimate for heavy audio gen
const STORAGE_KEY_PREFIX = 'md_voice_usage_';

const getTodayKey = () => `${STORAGE_KEY_PREFIX}${new Date().toISOString().split('T')[0]}`;

const getDailyUsage = (): number => {
  const key = getTodayKey();
  const stored = localStorage.getItem(key);
  return stored ? parseInt(stored, 10) : 0;
};

const incrementDailyUsage = () => {
  const key = getTodayKey();
  const current = getDailyUsage();
  localStorage.setItem(key, (current + 1).toString());
  return current + 1;
};

// --- Audio Utils (PCM -> MP3/WAV) ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Create a WAV Blob for immediate playback compatibility
const createWavHeader = (dataLength: number) => {
  const sampleRate = 24000; // Gemini TTS standard output
  const numChannels = 1;    // Mono
  const bitsPerSample = 16; // 16-bit PCM
  
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);
  
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
  view.setUint16(32, numChannels * (bitsPerSample / 8), true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  return buffer;
};

function getWavBlob(base64Data: string): Blob {
  const pcmData = decode(base64Data);
  const header = createWavHeader(pcmData.length);
  const wavData = new Uint8Array(header.byteLength + pcmData.length);
  wavData.set(new Uint8Array(header), 0);
  wavData.set(pcmData, header.byteLength);
  return new Blob([wavData], { type: 'audio/wav' });
}

// Convert PCM to MP3 using lamejs
function getMp3Blob(base64Data: string): Blob {
  const pcmData = decode(base64Data);
  
  // SAFETY FIX: Ensure data length is even for Int16Array
  let safePcmData = pcmData;
  if (pcmData.length % 2 !== 0) {
    safePcmData = new Uint8Array(pcmData.length + 1);
    safePcmData.set(pcmData);
  }
  
  // Convert Uint8Array PCM to Int16Array
  const samples = new Int16Array(safePcmData.buffer);
  
  // Check if lamejs is loaded
  if (typeof lamejs === 'undefined') {
    console.error("lamejs not found. Please check your internet connection.");
    throw new Error("MP3 Encoder library not loaded");
  }

  // Initialize lamejs encoder
  // @ts-ignore
  const mp3encoder = new lamejs.Mp3Encoder(1, 24000, 320); // 1 Channel, 24kHz, 320kbps
  const mp3Data = [];
  const sampleBlockSize = 1152; // multiple of 576
  
  for (let i = 0; i < samples.length; i += sampleBlockSize) {
    const sampleChunk = samples.subarray(i, i + sampleBlockSize);
    const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
  }
  
  const mp3buf = mp3encoder.flush();
  if (mp3buf.length > 0) {
    mp3Data.push(mp3buf);
  }
  
  return new Blob(mp3Data, { type: 'audio/mp3' });
}

// -----------------------------

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    step: 'input',
    scriptText: '',
    broadcastStyle: 'mixed_ur_en', // Default to Mixed
    directorsNote: '',
    analysis: null,
    characterMap: {},
    isProcessing: false,
    processStatus: '',
    audioBase64: null,
    isUrdu: false,
    isPoetryMode: false, // Default OFF
    customVoices: [], // Plugin
    voiceUsageHistory: {}, // History: voiceId -> timestamp
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Preview States
  const [previewVoiceId, setPreviewVoiceId] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Cloning Plugin State
  const [showCloningModal, setShowCloningModal] = useState(false);
  const [cloningState, setCloningState] = useState<{
     name: string;
     gender: 'M'|'F';
     age: AgeGroup;
     file: File | null;
     status: 'idle' | 'processing' | 'success';
  }>({ name: '', gender: 'M', age: 'mature', file: null, status: 'idle' });

  // API Key & Quota State
  const [hasApiKey, setHasApiKey] = useState(true);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [usageCount, setUsageCount] = useState(0);

  useEffect(() => {
    // Check if we are in an environment that supports key selection
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      window.aistudio.hasSelectedApiKey().then((has: boolean) => {
        setHasApiKey(has);
      });
    }
    // Load usage
    setUsageCount(getDailyUsage());
  }, []);

  const handleConnectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      try {
        await window.aistudio.openSelectKey();
        setHasApiKey(true);
        setShowQuotaModal(false); // Close modal on success
      } catch (e) {
        console.error(e);
      }
    } else {
       alert("API Key management is handled by the hosting platform.");
    }
  };

  const t = state.isUrdu ? UI_STRINGS.ur : UI_STRINGS.en;
  const dir = state.isUrdu ? 'rtl' : 'ltr';
  
  // Merged Voice Bank (Built-in + Custom)
  const fullVoiceBank = [...state.customVoices, ...VOICE_BANK];

  // Helper for Quota UI
  const getQuotaColor = () => {
    const percentage = (usageCount / DAILY_LIMIT_ESTIMATE) * 100;
    if (percentage > 90) return 'text-red-500';
    if (percentage > 60) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getQuotaIcon = () => {
    const percentage = (usageCount / DAILY_LIMIT_ESTIMATE) * 100;
    if (percentage > 90) return <BatteryWarning className="text-red-500" size={20} />;
    if (percentage > 50) return <BatteryMedium className="text-yellow-500" size={20} />;
    return <Battery className="text-green-500" size={20} />;
  };

  // Handlers
  const handleAnalyze = async () => {
    if (!state.scriptText.trim()) return;
    setState(prev => ({ ...prev, isProcessing: true }));
    
    // --- POETRY DETECTION LOGIC ---
    // If flag is ON, force detection logic
    const lowerScript = state.scriptText.toLowerCase();
    const isPoetry = state.isPoetryMode || 
      lowerScript.includes('ghazal') || 
      lowerScript.includes('sher') || 
      lowerScript.includes('shayari') || 
      lowerScript.includes('nazm');

    const result = await analyzeScript(state.scriptText);
    
    if (result) {
      // --- Smart Auto-Assign Logic (Weighted Scoring + History) ---
      const initialMap: Record<string, string> = {};
      const currentScriptUsedIds = new Set<string>(); // avoid dups in same scene
      const tempHistoryUpdate = { ...state.voiceUsageHistory };
      const currentTime = Date.now();

      result.characterProfiles.forEach((char) => {
        // Calculate fit score for EVERY voice in the bank
        const scoredVoices = fullVoiceBank.map(voice => {
          let score = 0;
          
          // --- SPECIAL POET OVERRIDE ---
          // If poetry mode button is ON, maximize Poet Voice score
          if (state.isPoetryMode && voice.id === 'special_poet') {
            score += 20000; // Unbeatable score
          }
          // Fallback poetry detection
          else if (isPoetry && voice.id === 'special_poet') {
            score += 5000;
          }

          // 1. Critical Fail: Gender Mismatch
          if (voice.gender !== char.gender) return { voice, score: -10000 };

          // 2. Age Match (High Priority)
          if (voice.ageGroup === char.ageGroup) {
            score += 100; // Exact match bonus
          } else {
             const ages = ['kid', 'young', 'mature', 'old'];
             const charIdx = ages.indexOf(char.ageGroup);
             const voiceIdx = ages.indexOf(voice.ageGroup);
             // Adjacent age groups are acceptable but less ideal
             if (Math.abs(charIdx - voiceIdx) === 1) score += 40;
             else score -= 50; // Strong penalty for distant ages
          }

          // 3. Trait & Tone Match (Nuance) - EXPANDED SEMANTIC MAP
          const charTraits = (char.personalityKeywords || []).map(t => t.toLowerCase());
          const voiceTraits = (voice.traits || []).map(t => t.toLowerCase());
          
          let traitScore = 0;
          
          charTraits.forEach(ct => {
            // Direct Match
            voiceTraits.forEach(vt => {
              if (ct === vt) traitScore += 30; // Exact match
              else if (ct.includes(vt) || vt.includes(ct)) traitScore += 15; // Partial
            });
          });

          score += traitScore;

          // 4. Custom Voice Bonus
          if (voice.isCustom) score += 50;

          // 6. Historical Usage Penalty (Diversity across sessions)
          const lastUsed = state.voiceUsageHistory[voice.id] || 0;
          const timeSince = currentTime - lastUsed;
          if (timeSince < 900000) { 
            const decayFactor = 1 - (timeSince / 900000); 
            const recencyPenalty = Math.floor(150 * (decayFactor * decayFactor * decayFactor));
            score -= recencyPenalty;
          }

          // 8. Randomness to break ties
          score += Math.random() * 10;
          
          return { voice, score };
        });

        // Sort descending by score
        scoredVoices.sort((a, b) => b.score - a.score);

        // Pick best fit
        const bestCandidate = scoredVoices[0];
        
        // If the best candidate is valid (not mismatched gender)
        if (bestCandidate.score > -5000) {
           initialMap[char.name] = bestCandidate.voice.id;
           currentScriptUsedIds.add(bestCandidate.voice.id);
           tempHistoryUpdate[bestCandidate.voice.id] = currentTime;
        } else {
           const fallback = fullVoiceBank.find(v => v.gender === char.gender) || fullVoiceBank[0];
           initialMap[char.name] = fallback.id;
        }
      });

      setState(prev => ({
        ...prev,
        step: 'casting',
        isProcessing: false,
        analysis: result,
        characterMap: initialMap,
        voiceUsageHistory: tempHistoryUpdate // Update history
      }));
    } else {
      setState(prev => ({ ...prev, isProcessing: false }));
      // Instead of generic alert, show friendly Quota Modal
      setShowQuotaModal(true);
    }
  };

  const handleGenerate = async () => {
    setState(prev => ({ ...prev, step: 'processing', isProcessing: true, processStatus: t.processing.render }));
    
    try {
      // 1. Generate Vocal Track
      const rawAudio = await generateStudioAudio(
        state.scriptText, 
        state.characterMap, 
        state.broadcastStyle,
        state.analysis, 
        state.directorsNote,
        state.isPoetryMode // Pass the mode flag
      );
      
      if (rawAudio) {
         // Increment usage only on success
         const newUsage = incrementDailyUsage();
         setUsageCount(newUsage);

         setState(prev => ({ 
           ...prev, 
           processStatus: t.processing.done, 
           isProcessing: false, 
           step: 'done', 
           audioBase64: rawAudio 
         }));
      } else {
        throw new Error("Generation returned null");
      }
    } catch (e) {
      console.error(e);
      setState(prev => ({ ...prev, step: 'casting', isProcessing: false }));
      // Instead of generic alert, show friendly Quota Modal
      setShowQuotaModal(true);
    }
  };

  const handleDownload = () => {
    if (!state.audioBase64) return;
    try {
      // Encode to MP3 320kbps
      const blob = getMp3Blob(state.audioBase64);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `story_${state.analysis?.globalAgeGroup}_${state.analysis?.speakerCount}_${Date.now()}.mp3`;
      a.click();
    } catch (e) {
      console.error("MP3 Encoding Failed", e);
      alert("MP3 Encoding failed. Ensure your browser supports this.");
    }
  };

  const togglePlay = () => {
    if (!state.audioBase64) return;
    
    // Init Audio if not ready
    if (!audioRef.current) {
      const blob = getWavBlob(state.audioBase64);
      const url = URL.createObjectURL(blob);
      audioRef.current = new Audio(url);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  const handleVoicePreview = async (voiceId: string) => {
    if (previewVoiceId === voiceId) {
      // Stop logic
      previewAudioRef.current?.pause();
      setPreviewVoiceId(null);
      return;
    }

    // Stop previous if any
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    setPreviewVoiceId(voiceId); // Set loading/active state

    try {
      const audioData = await generateVoicePreview(voiceId);
      if (audioData) {
         const blob = getWavBlob(audioData);
         const url = URL.createObjectURL(blob);
         previewAudioRef.current = new Audio(url);
         previewAudioRef.current.onended = () => setPreviewVoiceId(null);
         previewAudioRef.current.play();
      } else {
         setPreviewVoiceId(null);
      }
    } catch(e) {
      console.error(e);
      setPreviewVoiceId(null);
    }
  };

  // --- Voice Cloning Plugin Logic ---
  const handleProcessClone = () => {
     if (!cloningState.name || !cloningState.file) return;
     setCloningState(prev => ({ ...prev, status: 'processing' }));
     
     // Simulate processing delay
     setTimeout(() => {
        const newVoice: VoiceProfile = {
           id: `custom_${Date.now()}`,
           name: cloningState.name,
           gender: cloningState.gender,
           ageGroup: cloningState.age,
           // Map to a Gemini voice that fits the profile
           geminiVoiceName: cloningState.gender === 'M' ? (cloningState.age === 'old' ? 'Charon' : 'Fenrir') : 'Kore', 
           avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cloningState.name}&backgroundColor=ffdfbf`,
           traits: ['custom', 'cloned'],
           isCustom: true
        };
        
        setState(prev => ({ 
           ...prev, 
           customVoices: [...prev.customVoices, newVoice] 
        }));
        
        setCloningState(prev => ({ ...prev, status: 'success' }));
        
        // Close modal after brief success msg
        setTimeout(() => {
           setShowCloningModal(false);
           setCloningState({ name: '', gender: 'M', age: 'mature', file: null, status: 'idle' });
        }, 1500);

     }, 2000);
  };

  // --- Quota Error Modal ---
  const renderQuotaModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-[#1a1b26] border border-red-500/30 rounded-2xl w-full max-w-md p-6 shadow-[0_0_50px_rgba(239,68,68,0.2)] text-center relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl"></div>

        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
            <AlertTriangle className="text-red-400 w-8 h-8" />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-white mb-2">
          {state.isUrdu ? "آج کی مفت لمٹ ختم!" : "Daily Free Limit Reached!"}
        </h3>
        
        <p className="text-gray-400 mb-6 leading-relaxed text-sm">
          {state.isUrdu 
            ? "آپ نے کچھ غلط نہیں کیا۔ گوگل کا مفت کوٹہ (Free Quota) ختم ہو گیا ہے۔ آپ کل دوبارہ کوشش کریں یا ابھی اکاؤنٹ تبدیل کریں۔"
            : "You haven't done anything wrong. The free quota from Google has been exhausted for today. Please wait for tomorrow or switch your account."}
        </p>

        <div className="space-y-3">
          <button 
            onClick={handleConnectKey}
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
          >
            <RefreshCcw size={18} />
            {state.isUrdu ? "نیا اکاؤنٹ / Key منتخب کریں" : "Connect New Key / Account"}
          </button>
          
          <button 
            onClick={() => setShowQuotaModal(false)}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all text-sm"
          >
            {state.isUrdu ? "بند کریں" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );

  const renderStepInput = () => (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-r from-white via-slate-300 to-slate-500 bg-clip-text text-transparent">
          {t.title}
        </h1>
        <p className="text-lg text-slate-400 font-light tracking-wide max-w-xl mx-auto">
          {t.subtitle}
        </p>
      </div>

      <div className="bg-[#1a1b26] border border-white/5 rounded-2xl p-6 shadow-2xl space-y-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-brand-400 ml-1">{t.pasteLabel}</label>
          <textarea 
            value={state.scriptText}
            onChange={(e) => setState(prev => ({ ...prev, scriptText: e.target.value }))}
            className="w-full h-48 bg-black/40 border border-white/10 rounded-xl p-4 text-lg focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none resize-none transition-all placeholder:text-white/10"
            placeholder={state.isUrdu ? "یہاں کہانی لکھیں..." : "Paste your script here..."}
            dir={state.isUrdu ? 'rtl' : 'ltr'}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">{t.styleLabel}</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(t.styles) as BroadcastStyle[]).map((style) => (
                <button
                  key={style}
                  onClick={() => setState(prev => ({ ...prev, broadcastStyle: style }))}
                  className={`px-3 py-2 rounded-lg text-sm border transition-all ${state.broadcastStyle === style 
                    ? 'bg-brand-500 text-brand-950 border-brand-500 font-bold' 
                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
                >
                  {t.styles[style]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">{t.directorsNoteLabel}</label>
            <textarea
              value={state.directorsNote}
              onChange={(e) => setState(prev => ({ ...prev, directorsNote: e.target.value }))} 
              className="w-full h-[108px] bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:ring-1 focus:ring-brand-500 outline-none resize-none placeholder:text-white/10"
              placeholder={t.directorsNotePlaceholder}
            />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between gap-4">
           <button 
             onClick={() => setShowCloningModal(true)}
             className="px-6 py-4 rounded-xl bg-[#242636] hover:bg-[#2f3245] text-slate-300 font-medium transition-all flex items-center gap-2 border border-white/5"
           >
             <Mic2 size={18} />
             <span className="hidden md:inline">{t.cloneBtn}</span>
           </button>

           <button 
             onClick={handleAnalyze}
             disabled={!state.scriptText.trim() || state.isProcessing}
             className="flex-1 py-4 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed text-brand-950 font-bold rounded-xl transition-all shadow-[0_0_40px_-10px_rgba(45,212,191,0.3)] hover:shadow-[0_0_60px_-10px_rgba(45,212,191,0.5)] flex items-center justify-center gap-3 text-lg"
           >
             {state.isProcessing ? (
                <RefreshCcw className="animate-spin" />
             ) : (
                <Wand2 className="w-5 h-5" />
             )}
             {t.analyzeBtn}
           </button>
        </div>
      </div>
    </div>
  );

  const renderStepCasting = () => (
    <div className="max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 text-lg">2</span>
          {t.castHeader}
        </h2>
        <div className="px-4 py-2 bg-white/5 rounded-full text-sm font-mono text-brand-400 border border-white/5">
          {state.analysis?.speakerCount} Speakers Detected • {state.analysis?.globalAgeGroup.toUpperCase()} Group
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {state.analysis?.characterProfiles.map((char, idx) => (
          <div key={idx} className="bg-[#1a1b26] border border-white/5 p-5 rounded-2xl relative group hover:border-brand-500/30 transition-colors">
             <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-black/50 overflow-hidden border border-white/10 relative">
                   {state.characterMap[char.name] && (
                      <img 
                        src={fullVoiceBank.find(v => v.id === state.characterMap[char.name])?.avatarUrl} 
                        alt="Avatar" 
                        className="w-full h-full object-cover opacity-80"
                      />
                   )}
                   <div className="absolute bottom-0 right-0 px-1.5 py-0.5 bg-black/80 text-[10px] font-bold text-white uppercase rounded-tl-md">
                     {char.gender}
                   </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold truncate text-white">{char.name}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {char.personalityKeywords.slice(0, 3).map(k => (
                      <span key={k} className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-slate-400 border border-white/5">
                        {k}
                      </span>
                    ))}
                    <span className="px-2 py-0.5 rounded text-[10px] bg-brand-500/10 text-brand-400 border border-brand-500/20">
                      {char.ageGroup}
                    </span>
                  </div>
                </div>
             </div>

             <div className="mt-5 space-y-2">
               <label className="text-[10px] font-bold uppercase text-slate-600 ml-1">Assigned Voice</label>
               <select
                 className="w-full bg-black/30 border border-white/10 text-sm rounded-lg p-2.5 focus:border-brand-500 outline-none text-slate-300"
                 value={state.characterMap[char.name]}
                 onChange={(e) => setState(prev => ({ ...prev, characterMap: { ...prev.characterMap, [char.name]: e.target.value } }))}
               >
                 {fullVoiceBank
                    .filter(v => v.gender === char.gender) // Strict gender filter
                    .sort((a, b) => (a.ageGroup === char.ageGroup ? -1 : 1)) // Sort by age match
                    .map(voice => (
                    <option key={voice.id} value={voice.id}>
                       {voice.name} ({voice.ageGroup} - {voice.traits.join(', ')}) {voice.isCustom ? '★' : ''}
                    </option>
                 ))}
               </select>
             </div>
             
             <button 
               onClick={() => handleVoicePreview(state.characterMap[char.name])}
               className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-brand-500 hover:text-brand-950 flex items-center justify-center transition-all"
             >
               {previewVoiceId === state.characterMap[char.name] ? <Pause size={14} className="animate-pulse"/> : <Play size={14} />}
             </button>
          </div>
        ))}
      </div>

      <div className="mt-10 flex gap-4">
        <button 
          onClick={() => setState(prev => ({ ...prev, step: 'input' }))}
          className="px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 font-bold transition-all"
        >
          Back
        </button>
        <button 
          onClick={handleGenerate}
          className="flex-1 py-4 bg-brand-500 hover:bg-brand-400 text-brand-950 font-bold rounded-xl transition-all shadow-[0_0_40px_-10px_rgba(45,212,191,0.3)] hover:shadow-[0_0_60px_-10px_rgba(45,212,191,0.5)] flex items-center justify-center gap-3 text-lg"
        >
          <Zap className="fill-current" />
          {t.generateBtn}
        </button>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in duration-700">
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 border-4 border-brand-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <Wand2 className="absolute inset-0 m-auto text-brand-500 animate-pulse" size={40} />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">{state.processStatus}</h2>
      <p className="text-slate-500 max-w-sm animate-pulse">Running advanced neural TTS models on Google Cloud...</p>
    </div>
  );

  const renderDone = () => (
    <div className="max-w-2xl mx-auto text-center space-y-8 animate-in fade-in zoom-in-95 duration-500 pt-10">
      <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20 shadow-[0_0_40px_-10px_rgba(34,197,94,0.4)]">
        <CheckCircle2 size={48} />
      </div>
      
      <div>
        <h2 className="text-4xl font-bold text-white mb-2">{t.processing.done}</h2>
        <p className="text-slate-400">Your hyper-realistic audio drama is ready.</p>
      </div>

      <div className="bg-[#1a1b26] border border-white/10 rounded-2xl p-8 space-y-8">
        <div className="flex items-center justify-center gap-8">
           <button 
             onClick={togglePlay}
             className="w-20 h-20 bg-brand-500 hover:bg-brand-400 text-brand-950 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-110 active:scale-95"
           >
             {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1"/>}
           </button>
        </div>
        
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div className={`h-full bg-brand-500 transition-all duration-300 ${isPlaying ? 'w-full animate-[progress_2s_linear_infinite]' : 'w-0'}`} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setState(prev => ({ ...prev, step: 'input', audioBase64: null, analysis: null, scriptText: '' }))}
          className="py-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl transition-all"
        >
          Create New
        </button>
        <button 
          onClick={handleDownload}
          className="py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <Download size={20} />
          {t.downloadBtn}
        </button>
      </div>
    </div>
  );

  const renderCloningModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-[#1a1b26] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        <button 
          onClick={() => setShowCloningModal(false)}
          className="absolute top-4 right-4 text-slate-500 hover:text-white"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-brand-500/10 rounded-lg text-brand-500">
            <Mic2 size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{t.cloneHeader}</h3>
            <p className="text-xs text-slate-500">Instant Voice Cloning (Beta)</p>
          </div>
        </div>

        {cloningState.status === 'success' ? (
           <div className="text-center py-10 space-y-4">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
              <p className="text-xl font-bold text-white">Voice Cloned Successfully!</p>
           </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500">Voice Name</label>
              <input 
                type="text" 
                value={cloningState.name}
                onChange={(e) => setCloningState(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 focus:border-brand-500 outline-none"
                placeholder="e.g. My Narrator Voice"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">Gender</label>
                <div className="flex bg-black/30 rounded-lg p-1 border border-white/10">
                   {['M', 'F'].map(g => (
                      <button 
                        key={g}
                        onClick={() => setCloningState(prev => ({ ...prev, gender: g as any }))}
                        className={`flex-1 py-2 rounded text-sm font-bold transition-all ${cloningState.gender === g ? 'bg-brand-500 text-brand-950' : 'text-slate-500'}`}
                      >
                        {g === 'M' ? 'Male' : 'Female'}
                      </button>
                   ))}
                </div>
              </div>
              
              <div className="space-y-2">
                 <label className="text-xs font-bold uppercase text-slate-500">Age</label>
                 <select 
                    value={cloningState.age}
                    onChange={(e) => setCloningState(prev => ({ ...prev, age: e.target.value as AgeGroup }))}
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-3 focus:border-brand-500 outline-none text-slate-300 appearance-none"
                 >
                    <option value="kid">Kid (7-12)</option>
                    <option value="young">Young (13-30)</option>
                    <option value="mature">Mature (31-50)</option>
                    <option value="old">Old (50+)</option>
                 </select>
              </div>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-bold uppercase text-slate-500">{t.uploadLabel}</label>
               <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-brand-500/50 hover:bg-brand-500/5 transition-all cursor-pointer relative">
                  <input 
                    type="file" 
                    accept=".mp3,.wav" 
                    onChange={(e) => setCloningState(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="mx-auto text-slate-500 mb-2" />
                  <p className="text-sm text-slate-400">{cloningState.file ? cloningState.file.name : "Click to Upload Sample"}</p>
               </div>
            </div>

            <button 
              onClick={handleProcessClone}
              disabled={!cloningState.name || !cloningState.file || cloningState.status === 'processing'}
              className="w-full py-4 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-brand-950 font-bold rounded-xl transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
            >
              {cloningState.status === 'processing' ? (
                <>
                   <RefreshCcw className="animate-spin" size={20} />
                   {t.cloningProcessing}
                </>
              ) : (
                <>
                   <Wand2 size={20} />
                   Start Cloning
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-[#0f111a] text-slate-200 font-sans selection:bg-brand-500 selection:text-white`} dir={dir}>
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-[#0f111a]/80 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center font-bold text-brand-950">M</div>
             <span className="font-bold text-lg tracking-tight">{t.title} <span className="text-brand-500 text-xs font-normal px-2 py-0.5 bg-brand-500/10 rounded-full">BETA</span></span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* --- SMART QUOTA METER --- */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 border border-white/5" title="Daily Free Quota Estimate">
               <span className={`flex items-center gap-1.5 text-xs font-bold ${getQuotaColor()}`}>
                  {getQuotaIcon()}
                  {usageCount >= DAILY_LIMIT_ESTIMATE ? 'Empty' : `${DAILY_LIMIT_ESTIMATE - usageCount} Left`}
               </span>
            </div>

            <button onClick={() => setState(prev => ({ ...prev, isUrdu: !prev.isUrdu }))} className="p-2 hover:bg-white/5 rounded-full transition-colors flex items-center gap-2">
              <span className="text-xs font-bold text-brand-400">{state.isUrdu ? 'اردو' : 'EN'}</span>
              <Languages size={20} />
            </button>
            
            {/* POETRY MODE TOGGLE */}
             <button 
                onClick={() => setState(prev => ({ ...prev, isPoetryMode: !prev.isPoetryMode }))} 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${state.isPoetryMode ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'bg-transparent border-white/10 text-slate-400 hover:bg-white/5'}`}
             >
                <Feather size={16} />
                <span className="text-xs font-bold">{state.isUrdu ? 'شاعری' : 'Poetry'}</span>
             </button>

          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {state.step === 'input' && renderStepInput()}
        {state.step === 'casting' && renderStepCasting()}
        {state.step === 'processing' && renderProcessing()}
        {state.step === 'done' && renderDone()}
      </main>

      {/* Modals */}
      {showCloningModal && renderCloningModal()}
      {showQuotaModal && renderQuotaModal()}
      
      {/* Footer Minimal */}
      <footer className="fixed bottom-6 left-0 right-0 text-center pointer-events-none">
         <p className="text-[10px] text-white/10 uppercase tracking-[0.3em]">MD Voice Engine v1.0</p>
      </footer>
    </div>
  );
};

export default App;
