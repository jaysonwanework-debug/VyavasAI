import { LanguageCode } from '../types';

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

let activeAudioElement: HTMLAudioElement | null = null;
let silenceTimer: any = null;

export function createSpeechRecognizer(
  lang: LanguageCode,
  onInterim: (interim: string) => void,
  onFinal: (transcript: string) => void,
  onError: (error: string) => void,
  onEnd: () => void
): any {
  if (!isSpeechRecognitionSupported()) {
    onError('Browser does not support Speech Recognition.');
    return null;
  }

  const SpeechRecognitionClass =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognizer = new SpeechRecognitionClass();

  // Regional language mapping
  const langMap: Record<LanguageCode, string> = {
    'mr-IN': 'mr-IN',
    'ta-IN': 'ta-IN',
    'hi-IN': 'hi-IN',
    'en-US': 'en-IN',
  };

  recognizer.lang = langMap[lang] || 'mr-IN';
  recognizer.continuous = true;
  recognizer.interimResults = true;
  recognizer.maxAlternatives = 1;

  let accumulatedFinal = '';

  recognizer.onresult = (event: any) => {
    let interimText = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const res = event.results[i];
      if (res.isFinal) {
        accumulatedFinal += (accumulatedFinal ? ' ' : '') + res[0].transcript;
      } else {
        interimText += res[0].transcript;
      }
    }

    const currentCombined = (accumulatedFinal + ' ' + interimText).trim();
    if (currentCombined) {
      onInterim(currentCombined);

      // Debounce endpointing: if user stops speaking for 900ms, finalize!
      if (silenceTimer) clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => {
        if (currentCombined) {
          onFinal(currentCombined);
          try {
            recognizer.stop();
          } catch (e) {
            // ignore
          }
        }
      }, 950);
    }
  };

  recognizer.onerror = (event: any) => {
    if (event.error !== 'no-speech') {
      console.warn('SpeechRecognition error:', event.error);
      onError(event.error);
    }
  };

  recognizer.onend = () => {
    if (silenceTimer) clearTimeout(silenceTimer);
    onEnd();
  };

  return recognizer;
}

// Speak aloud using Gemini TTS API (WAV) with instant fallback to browser SpeechSynthesis
export async function speakAloud(
  text: string,
  lang: LanguageCode,
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  stopSpeaking();

  if (onStart) onStart();

  try {
    // Attempt Studio Gemini TTS API first
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.available && data.audioBase64) {
        const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
        activeAudioElement = audio;

        audio.onended = () => {
          activeAudioElement = null;
          if (onEnd) onEnd();
        };

        audio.onerror = () => {
          activeAudioElement = null;
          speakWithBrowser(text, lang, onEnd);
        };

        await audio.play();
        return;
      }
    }
  } catch (e) {
    console.warn('Gemini TTS fetch error, falling back to browser:', e);
  }

  // Fallback to browser SpeechSynthesis
  speakWithBrowser(text, lang, onEnd);
}

function speakWithBrowser(
  text: string,
  lang: LanguageCode,
  onEnd?: () => void
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  const langMap: Record<LanguageCode, string> = {
    'mr-IN': 'mr-IN',
    'ta-IN': 'ta-IN',
    'hi-IN': 'hi-IN',
    'en-US': 'en-IN',
  };
  utterance.lang = langMap[lang] || 'mr-IN';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const targetPrefix = utterance.lang.split('-')[0];
  const matchingVoice = voices.find(
    (v) => v.lang === utterance.lang || v.lang.startsWith(targetPrefix)
  );
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  utterance.onend = () => {
    if (onEnd) onEnd();
  };
  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (silenceTimer) clearTimeout(silenceTimer);
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    } catch (e) {
      // ignore
    }
    activeAudioElement = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Live Mic Volume Audio Meter for real-time sound visualization
export async function startAudioLevelMeter(
  onVolume: (vol: number) => void
): Promise<() => void> {
  if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return () => {};
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let isRunning = true;

    const tick = () => {
      if (!isRunning) return;
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      onVolume(Math.min(100, Math.round((avg / 128) * 100)));
      requestAnimationFrame(tick);
    };

    tick();

    return () => {
      isRunning = false;
      stream.getTracks().forEach((t) => t.stop());
      try {
        audioCtx.close();
      } catch (e) {
        // ignore
      }
    };
  } catch (err) {
    return () => {};
  }
}
