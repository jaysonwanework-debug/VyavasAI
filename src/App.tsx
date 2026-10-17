import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { HeroMic } from './components/HeroMic';
import { AgentStepsTimeline } from './components/AgentStepsTimeline';
import { ChatFeed } from './components/ChatFeed';
import { StockTab } from './components/StockTab';
import { OrdersTab } from './components/OrdersTab';
import { KhataTab } from './components/KhataTab';
import { MoneyTab } from './components/MoneyTab';
import { BottomNav, TabType } from './components/BottomNav';
import { AppState, ChatMessage, AgentStep, LanguageCode } from './types';
import { SEED_DATA, LANGUAGE_CONFIGS } from './data/seedData';
import {
  createSpeechRecognizer,
  speakAloud,
  stopSpeaking,
  startAudioLevelMeter,
} from './utils/speech';
import {
  playMicStart,
  playMicStop,
  playStepSuccess,
  playAgentComplete,
} from './utils/audioEffects';
import { executeCommandDeterministically } from './utils/toolExecutor';

export default function App() {
  const [lang, setLang] = useState<LanguageCode>(() => {
    return (localStorage.getItem('vyavas_lang') as LanguageCode) || 'mr-IN';
  });

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [modelChoice, setModelChoice] = useState('gemini-3.8-flash');
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0);

  const [data, setData] = useState<AppState>(() => {
    const saved = localStorage.getItem('vyavas_state_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return SEED_DATA;
      }
    }
    return SEED_DATA;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const initialWelcome = LANGUAGE_CONFIGS['mr-IN'].welcome;
    return [
      {
        id: 'msg-welcome',
        role: 'agent',
        text: initialWelcome,
        timestamp: new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ];
  });

  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [activeToolNode, setActiveToolNode] = useState<string | undefined>();
  const [toast, setToast] = useState<string | null>(null);

  const recognizerRef = useRef<any>(null);
  const toastTimeoutRef = useRef<any>(null);
  const audioMeterStopRef = useRef<(() => void) | null>(null);
  const isLiveModeRef = useRef(isLiveMode);

  useEffect(() => {
    isLiveModeRef.current = isLiveMode;
  }, [isLiveMode]);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('vyavas_state_v1', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('vyavas_lang', lang);
  }, [lang]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (audioMeterStopRef.current) {
        audioMeterStopRef.current();
      }
    };
  }, []);

  const handleLanguageChange = (newLang: LanguageCode) => {
    setLang(newLang);
    stopSpeaking();
    showToast(`भाषा बदलली: ${LANGUAGE_CONFIGS[newLang].name}`);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Reset demo data back to clean SEED_DATA
  const handleResetData = () => {
    setData(SEED_DATA);
    setAgentSteps([]);
    stopSpeaking();
    const welcome = LANGUAGE_CONFIGS[lang].welcome;
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: 'agent',
        text: welcome,
        timestamp: new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
    showToast('डेमो डेटा मूळ स्थितीत रिसेट झाला!');
  };

  const handleClearChat = () => {
    const welcome = LANGUAGE_CONFIGS[lang].welcome;
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: 'agent',
        text: welcome,
        timestamp: new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
    setAgentSteps([]);
    showToast('संभाषण साफ केले (Chat cleared)');
  };

  // Audio Speech Recognition Controls
  const handleStartListening = async () => {
    stopSpeaking();
    playMicStart();
    setCurrentTranscript('');

    // Start live audio volume meter for visualizer
    try {
      const stopMeter = await startAudioLevelMeter((vol) => {
        setAudioVolume(vol);
      });
      audioMeterStopRef.current = stopMeter;
    } catch (e) {
      // ignore
    }

    const rec = createSpeechRecognizer(
      lang,
      (interim) => {
        setCurrentTranscript(interim);
      },
      (finalText) => {
        setCurrentTranscript(finalText);
        handleStopListening();
        handleExecuteVoiceCommand(finalText);
      },
      (error) => {
        setIsListening(false);
        if (audioMeterStopRef.current) {
          audioMeterStopRef.current();
          audioMeterStopRef.current = null;
        }
        showToast(`माईक एरर: ${error}`);
      },
      () => {
        setIsListening(false);
        if (audioMeterStopRef.current) {
          audioMeterStopRef.current();
          audioMeterStopRef.current = null;
        }
      }
    );

    if (rec) {
      recognizerRef.current = rec;
      try {
        rec.start();
        setIsListening(true);
      } catch (err) {
        console.warn('SpeechRecognition start error:', err);
      }
    }
  };

  const handleStopListening = () => {
    playMicStop();
    setIsListening(false);
    setAudioVolume(0);
    if (audioMeterStopRef.current) {
      audioMeterStopRef.current();
      audioMeterStopRef.current = null;
    }
    if (recognizerRef.current) {
      try {
        recognizerRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
  };

  const handleToggleLiveMode = () => {
    const nextState = !isLiveMode;
    setIsLiveMode(nextState);
    if (nextState) {
      showToast('🔴 LIVE VOICE MODE सुरू झाला! बोला...');
      if (!isListening) {
        handleStartListening();
      }
    } else {
      showToast('Live Mode बंद केला');
      if (isListening) {
        handleStopListening();
      }
    }
  };

  // Execute Voice Command (The Multi-Turn Agent Loop)
  const handleExecuteVoiceCommand = async (userInputText: string) => {
    if (!userInputText.trim()) return;

    setActiveTab('home');
    setIsThinking(true);
    setActiveToolNode('check_stock');

    const userMsgId = `user-${Date.now()}`;
    const nowTime = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newHistory = [
      ...messages,
      {
        id: userMsgId,
        role: 'user' as const,
        text: userInputText,
        timestamp: nowTime,
      },
    ];

    setMessages(newHistory);

    try {
      // Step 1: Call full-stack server endpoint /api/agent/run with history
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: userInputText,
          lang,
          currentState: data,
          history: newHistory,
          modelChoice,
        }),
      });

      let agentResult: {
        success: boolean;
        replyText: string;
        agentSteps: AgentStep[];
        updatedState: AppState;
      };

      if (res.ok) {
        agentResult = await res.json();
      } else {
        const fallback = executeCommandDeterministically(userInputText, data, lang);
        agentResult = {
          success: true,
          replyText: fallback.finalReply,
          agentSteps: fallback.agentSteps,
          updatedState: fallback.updatedState,
        };
      }

      // Step 2: Show tool steps in Agent Transparency Panel
      if (agentResult.agentSteps && agentResult.agentSteps.length > 0) {
        setAgentSteps(agentResult.agentSteps);
        playStepSuccess();
      }

      // Step 3: Update local state
      setData(agentResult.updatedState);

      // Step 4: Add agent message to chat
      const agentMsgId = `agent-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: agentMsgId,
          role: 'agent',
          text: agentResult.replyText,
          timestamp: new Date().toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          agentSteps: agentResult.agentSteps,
        },
      ]);

      playAgentComplete();
      showToast('काम पूर्ण झाले! सर्व टूल्स यशस्वी.');

      // Step 5: Speak reply aloud in regional language using Gemini TTS / Web Speech
      if (!isMuted) {
        setIsSpeaking(true);
        await speakAloud(
          agentResult.replyText,
          lang,
          () => setIsSpeaking(true),
          () => {
            setIsSpeaking(false);
            // If in continuous Live Mode, resume listening for the next voice turn!
            if (isLiveModeRef.current) {
              setTimeout(() => {
                if (isLiveModeRef.current) {
                  handleStartListening();
                }
              }, 400);
            }
          }
        );
      } else {
        if (isLiveModeRef.current) {
          setTimeout(() => {
            if (isLiveModeRef.current) {
              handleStartListening();
            }
          }, 400);
        }
      }
    } catch (err: any) {
      console.warn('Agent loop execution error:', err);
      const fallbackResult = executeCommandDeterministically(userInputText, data, lang);
      setData(fallbackResult.updatedState);
      setAgentSteps(fallbackResult.agentSteps);
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          role: 'agent',
          text: fallbackResult.finalReply,
          timestamp: new Date().toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
      playAgentComplete();
      if (!isMuted) {
        speakAloud(fallbackResult.finalReply, lang);
      }
    } finally {
      setIsThinking(false);
      setActiveToolNode(undefined);
      setCurrentTranscript('');
    }
  };

  const handleReplaySpeech = (text: string) => {
    setIsSpeaking(true);
    speakAloud(
      text,
      lang,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  // Stock mutators
  const handleUpdateStock = (itemName: string, delta: number, reason: string) => {
    setData((prev) => {
      const idx = prev.inventory.findIndex(
        (i) => i.name.toLowerCase() === itemName.toLowerCase()
      );
      if (idx === -1) return prev;
      const copy = { ...prev };
      const newQty = Math.max(0, copy.inventory[idx].qty + delta);
      copy.inventory[idx] = { ...copy.inventory[idx], qty: newQty };
      return copy;
    });
    playStepSuccess();
    showToast(`स्टॉक अपडेट: ${itemName} (${delta > 0 ? `+${delta}` : delta})`);
  };

  const handleAddItem = (name: string, unit: string, price: number, qty: number) => {
    const newItem = {
      id: `inv-${Date.now()}`,
      name: name.toLowerCase(),
      vernacularNames: {
        mr: name,
        ta: name,
        hi: name,
        en: name,
      },
      unit,
      price,
      qty,
      lowStockThreshold: 10,
      category: 'staples' as const,
    };
    setData((prev) => ({
      ...prev,
      inventory: [...prev.inventory, newItem],
    }));
    playAgentComplete();
    showToast(`नवीन वस्तू जोडली: ${name}`);
  };

  // Khata payment mutator
  const handleRecordPayment = (customerName: string, amount: number) => {
    setData((prev) => {
      const idx = prev.customers.findIndex(
        (c) => c.name.toLowerCase() === customerName.toLowerCase()
      );
      if (idx === -1) return prev;
      const copy = { ...prev };
      const newBal = Math.max(0, copy.customers[idx].balance - amount);
      copy.customers[idx] = {
        ...copy.customers[idx],
        balance: newBal,
        lastTransactionDate: new Date().toISOString(),
      };
      return copy;
    });
    playAgentComplete();
    showToast(`₹${amount} जमा केले: ${customerName}`);
  };

  // Expense mutator
  const handleRecordExpense = (category: string, amount: number, note: string) => {
    const newExp = {
      id: `exp-${Date.now()}`,
      category,
      amount,
      note: note || category,
      date: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      expenses: [newExp, ...prev.expenses],
    }));
    playAgentComplete();
    showToast(`खर्च नोंदवला: ₹${amount} (${category})`);
  };

  const lowStockCount = data.inventory.filter(
    (i) => i.qty <= i.lowStockThreshold
  ).length;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <Header
        currentLang={lang}
        onLanguageChange={handleLanguageChange}
        onResetData={handleResetData}
        isMuted={isMuted}
        onToggleMute={() => {
          if (!isMuted) stopSpeaking();
          setIsMuted(!isMuted);
        }}
      />

      {/* Main Container - Mobile First Canvas */}
      <main className="flex-1 w-full max-w-md sm:max-w-xl mx-auto px-4 py-2 overflow-y-auto">
        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-cyan-950/90 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-full text-xs font-semibold shadow-[0_0_15px_rgba(6,182,212,0.4)] backdrop-blur-md animate-fadeIn flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>{toast}</span>
          </div>
        )}

        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="space-y-3 pb-20 animate-fadeIn">
            {/* The Hero Microphone & Holographic Avatar */}
            <HeroMic
              currentLang={lang}
              isListening={isListening}
              isThinking={isThinking}
              isSpeaking={isSpeaking}
              isLiveMode={isLiveMode}
              onToggleLiveMode={handleToggleLiveMode}
              onStartListening={handleStartListening}
              onStopListening={handleStopListening}
              onCommandSubmit={handleExecuteVoiceCommand}
              activeTool={activeToolNode}
              audioVolume={audioVolume}
              modelChoice={modelChoice}
              onModelChange={setModelChoice}
            />

            {/* Chat Feed */}
            <ChatFeed
              messages={messages}
              currentTranscript={currentTranscript}
              isListening={isListening}
              isThinking={isThinking}
              onReplay={handleReplaySpeech}
              currentLang={lang}
              onSendMessage={handleExecuteVoiceCommand}
              onClearChat={handleClearChat}
              onToggleMic={isListening ? handleStopListening : handleStartListening}
            />

            {/* Agent Steps Timeline (Agent Transparency Panel) */}
            <AgentStepsTimeline
              steps={agentSteps}
              isThinking={isThinking}
              currentLang={lang}
            />
          </div>
        )}

        {/* Stock Tab */}
        {activeTab === 'stock' && (
          <StockTab
            inventory={data.inventory}
            currentLang={lang}
            onUpdateStock={handleUpdateStock}
            onAddItem={handleAddItem}
          />
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <OrdersTab orders={data.orders} currentLang={lang} />
        )}

        {/* Khata Tab */}
        {activeTab === 'khata' && (
          <KhataTab
            customers={data.customers}
            currentLang={lang}
            onRecordPayment={handleRecordPayment}
          />
        )}

        {/* Money Tab */}
        {activeTab === 'money' && (
          <MoneyTab
            orders={data.orders}
            expenses={data.expenses}
            currentLang={lang}
            onRecordExpense={handleRecordExpense}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          stopSpeaking();
          setActiveTab(tab);
        }}
        currentLang={lang}
        orderCount={data.orders.length}
        lowStockCount={lowStockCount}
      />
    </div>
  );
}
