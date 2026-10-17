import express from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Type, FunctionDeclaration, Modality } from '@google/genai';
import { ToolRunner, executeCommandDeterministically } from './src/utils/toolExecutor.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);

// Initialize Gemini SDK with User-Agent header per skill instructions
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const SYSTEM_INSTRUCTION = (lang: string) => `
You are Dukaan Saathi, an intelligent, respectful, and voice-first assistant for an Indian Kirana shop owner (MSME).
You understand Marathi, Tamil, Hindi, English, and natural code-mixed speech (e.g. Marathi with English words like "order", "stock", "bill", "udhaar", "kg", "sakhar").
Language codes:
- mr-IN: Marathi (Primary). Transliterations: sakhar = sugar, tandul = rice, tel = cooking oil, dal/toor dal = toor dal, chai patti = tea powder, meeth = salt, gahu peeth = wheat flour.
- ta-IN: Tamil. Transliterations: sarkkarai = sugar, arisi = rice, ennai = oil, paruppu = toor dal, thool = tea powder, uppu = salt.
- hi-IN: Hindi. Transliterations: chini/shakkar = sugar, chawal = rice, tel = oil, dal = toor dal, chai patti = tea powder, namak = salt, aata = wheat flour.
- en-US: Indian English.

RULES FOR MULTI-STEP AGENT PLANNING:
1. Always plan multi-step tasks and execute every needed tool in order.
2. For an order command (e.g. "Ramesh ne 5 kg sakhar mangitli, order kar ani stock update kar"):
   Step 1: Call check_stock(item) to verify available quantity.
   Step 2: If stock is sufficient, call create_order(customer, items).
   Step 3: Call update_stock(item, delta: -orderedQty, reason: 'order').
   Step 4: Call add_to_customer_ledger(customer, amount: orderTotal, type: 'credit').
   If stock is insufficient, do NOT create the order or update stock; reply stating the available quantity.
3. If user asks about revenue or sales ("आज किती कमाई झाली?"), call get_sales_summary(period: 'today').
4. If user asks about customer balance ("सुरेशची उधारी किती आहे?"), call get_customer_balance(customer).
5. If user asks about stock ("तांदूळ किती उरलाय?"), call check_stock(item).
6. If user asks about low stock ("कमी स्टॉक असलेला सामान दाखव"), call get_low_stock_items(threshold: 15).
7. Maintain multi-turn context: if the user refers to previous items or customers ("आणि तांदूळ पण", "त्याने किती पैसे दिले?"), use previous turn context.
8. Reply briefly, warmly, and clearly in the selected language (${lang}). Confirm every action that was done with the total amount and remaining balance.
`;

const functionDeclarations: FunctionDeclaration[] = [
  {
    name: 'check_stock',
    description: 'Check available quantity, unit, and price of an item in inventory.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        item: {
          type: Type.STRING,
          description: 'Name of the item to check (e.g. sugar, sakhar, rice, tandul, oil, tel, toor dal, salt).',
        },
      },
      required: ['item'],
    },
  },
  {
    name: 'create_order',
    description: 'Create a customer sales order, itemize products, and calculate total bill amount.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        customer: {
          type: Type.STRING,
          description: 'Name of customer (e.g. Ramesh, Suresh, Sunita, Lakshmi).',
        },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Item name, e.g. sugar, rice, dal' },
              qty: { type: Type.NUMBER, description: 'Quantity ordered' },
              unit: { type: Type.STRING, description: 'Unit of measure, e.g. kg, L' },
            },
            required: ['name', 'qty'],
          },
          description: 'List of items in the order',
        },
      },
      required: ['customer', 'items'],
    },
  },
  {
    name: 'update_stock',
    description: 'Update the store inventory quantity by delta (negative when sold, positive when restocked).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        item: { type: Type.STRING, description: 'Item name (e.g. sugar, rice, oil)' },
        delta: { type: Type.NUMBER, description: 'Quantity change (e.g. -5 for sale, +10 for stock delivery)' },
        reason: { type: Type.STRING, description: 'Reason for update, e.g. customer sale, restock' },
      },
      required: ['item', 'delta', 'reason'],
    },
  },
  {
    name: 'add_to_customer_ledger',
    description: 'Update customer credit/udhaar balance in the ledger. Type "credit" adds to bill; type "payment" reduces balance.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        customer: { type: Type.STRING, description: 'Customer name' },
        amount: { type: Type.NUMBER, description: 'Amount in INR' },
        type: { type: Type.STRING, description: 'credit or payment' },
      },
      required: ['customer', 'amount', 'type'],
    },
  },
  {
    name: 'get_sales_summary',
    description: 'Get revenue, total orders, and sales stats for today, week, or month.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        period: { type: Type.STRING, description: 'today, week, or month' },
      },
    },
  },
  {
    name: 'get_customer_balance',
    description: 'Get current pending udhaar credit balance for a customer.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        customer: { type: Type.STRING, description: 'Customer name' },
      },
      required: ['customer'],
    },
  },
  {
    name: 'get_low_stock_items',
    description: 'List all inventory items running low on stock below threshold.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        threshold: { type: Type.NUMBER, description: 'Threshold quantity below which item is flagged' },
      },
    },
  },
  {
    name: 'record_expense',
    description: 'Record a business expense (rent, electricity, transport, packaging, etc.).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        category: { type: Type.STRING, description: 'Expense category' },
        amount: { type: Type.NUMBER, description: 'Amount in INR' },
        note: { type: Type.STRING, description: 'Optional description note' },
      },
      required: ['category', 'amount'],
    },
  },
  {
    name: 'record_payment',
    description: 'Record a customer paying off their pending udhaar.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        customer: { type: Type.STRING, description: 'Customer name' },
        amount: { type: Type.NUMBER, description: 'Amount paid in INR' },
      },
      required: ['customer', 'amount'],
    },
  },
  {
    name: 'add_item',
    description: 'Add a new product to inventory.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: 'Name of the product' },
        unit: { type: Type.STRING, description: 'Unit of measure, e.g. kg, L, pkt' },
        price: { type: Type.NUMBER, description: 'Price per unit in INR' },
        qty: { type: Type.NUMBER, description: 'Initial quantity in stock' },
      },
      required: ['name', 'unit', 'price', 'qty'],
    },
  },
];

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  app.use(express.json());

  // WebSocket Server for Gemini Live API
  const wss = new WebSocketServer({ server, path: '/live' });

  wss.on('connection', async (clientWs: WebSocket) => {
    console.log('[Live API] Client connected to /live');

    let liveSession: any = null;

    if (ai) {
      try {
        liveSession = await ai.live.connect({
          model: 'gemini-3.8-live',
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
            },
            systemInstruction: 'You are Dukaan Saathi, an interactive voice assistant for an Indian shopkeeper. Speak warmly in Marathi, Tamil, Hindi, or English.',
          },
          callbacks: {
            onmessage: (message: any) => {
              const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              const text = message.serverContent?.modelTurn?.parts?.[0]?.text;
              if (audio && clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ type: 'audio', audio }));
              }
              if (text && clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ type: 'text', text }));
              }
              if (message.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ type: 'interrupted' }));
              }
            },
            onclose: () => {
              console.log('[Live API] Gemini session closed');
            },
            onerror: (err: any) => {
              console.warn('[Live API] Gemini session error:', err);
            },
          },
        });

        clientWs.send(JSON.stringify({ type: 'connected', model: 'gemini-3.8-live' }));
      } catch (err: any) {
        console.warn('[Live API] Could not connect to gemini-3.8-live:', err?.message || err);
        clientWs.send(JSON.stringify({ type: 'fallback', message: 'Live audio fallback active' }));
      }
    } else {
      clientWs.send(JSON.stringify({ type: 'fallback', message: 'Local agent active' }));
    }

    clientWs.on('message', (data: any) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.audio && liveSession) {
          liveSession.sendRealtimeInput({
            audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        }
      } catch (e) {
        // ignore malformed
      }
    });

    clientWs.on('close', () => {
      if (liveSession && typeof liveSession.close === 'function') {
        try {
          liveSession.close();
        } catch (e) {
          // ignore
        }
      }
    });
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: !!apiKey,
      liveModel: 'gemini-3.8-live',
      chatModel: 'gemini-3.8-flash',
      timestamp: new Date().toISOString(),
    });
  });

  // High quality TTS Endpoint using gemini-3.8-flash-lite-tts
  app.post('/api/tts', async (req, res) => {
    const { text, lang = 'mr-IN' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Missing text' });
    }

    if (!ai) {
      return res.json({ available: false });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text,
                speechMetadata: {
                  style: 'Warm, respectful Indian shopkeeper assistant speaking clearly',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioBase64) {
        return res.json({ available: true, audioBase64, mimeType: 'audio/wav' });
      }
      return res.json({ available: false });
    } catch (err: any) {
      console.warn('TTS error:', err?.message || err);
      return res.json({ available: false });
    }
  });

  // Agent execution endpoint with multi-turn history and function calling
  app.post('/api/agent/run', async (req, res) => {
    const {
      transcript,
      lang = 'mr-IN',
      currentState,
      history = [],
      modelChoice = 'gemini-3.8-flash',
    } = req.body;

    if (!transcript || !currentState) {
      return res.status(400).json({ error: 'Missing transcript or currentState' });
    }

    const runner = new ToolRunner(currentState);

    // If Gemini client is not initialized or API call fails, seamlessly fall back
    if (!ai) {
      const fallbackResult = executeCommandDeterministically(transcript, currentState, lang);
      return res.json({
        success: true,
        replyText: fallbackResult.finalReply,
        agentSteps: fallbackResult.agentSteps,
        updatedState: fallbackResult.updatedState,
        mode: 'deterministic-agent',
      });
    }

    try {
      // Build multi-turn contents array preserving history
      const contents: any[] = [];

      // Include previous turns (up to last 6 turns for optimal context)
      if (Array.isArray(history) && history.length > 0) {
        const recentHistory = history.slice(-6);
        for (const item of recentHistory) {
          if (item.text) {
            contents.push({
              role: item.role === 'user' ? 'user' : 'model',
              parts: [{ text: item.text }],
            });
          }
        }
      }

      // Add the current user turn
      contents.push({
        role: 'user',
        parts: [{ text: transcript }],
      });

      let iterations = 0;
      const MAX_ITERATIONS = 5;
      let finalReply = '';

      while (iterations < MAX_ITERATIONS) {
        const response = await ai.models.generateContent({
          model: modelChoice || 'gemini-3.8-flash',
          contents,
          config: {
            tools: [{ functionDeclarations }],
            systemInstruction: SYSTEM_INSTRUCTION(lang),
            temperature: 0.2,
          },
        });

        const candidate = response.candidates?.[0];
        const functionCalls = response.functionCalls;

        if (functionCalls && functionCalls.length > 0) {
          if (candidate?.content) {
            contents.push(candidate.content);
          }

          const responseParts: any[] = [];
          for (const call of functionCalls) {
            const toolName = call.name as keyof ToolRunner;
            const args = (call.args || {}) as any;

            let toolResult: any;
            if (typeof (runner as any)[toolName] === 'function') {
              if (toolName === 'check_stock') {
                toolResult = runner.check_stock(args.item);
              } else if (toolName === 'create_order') {
                toolResult = runner.create_order(args.customer, args.items);
              } else if (toolName === 'update_stock') {
                toolResult = runner.update_stock(args.item, args.delta, args.reason);
              } else if (toolName === 'add_to_customer_ledger') {
                toolResult = runner.add_to_customer_ledger(args.customer, args.amount, args.type);
              } else if (toolName === 'get_sales_summary') {
                toolResult = runner.get_sales_summary(args.period);
              } else if (toolName === 'get_customer_balance') {
                toolResult = runner.get_customer_balance(args.customer);
              } else if (toolName === 'get_low_stock_items') {
                toolResult = runner.get_low_stock_items(args.threshold);
              } else if (toolName === 'record_expense') {
                toolResult = runner.record_expense(args.category, args.amount, args.note);
              } else if (toolName === 'record_payment') {
                toolResult = runner.record_payment(args.customer, args.amount);
              } else if (toolName === 'add_item') {
                toolResult = runner.add_item(args.name, args.unit, args.price, args.qty);
              } else {
                toolResult = { error: 'Unknown tool' };
              }
            } else {
              toolResult = { error: `Tool ${toolName} not supported` };
            }

            responseParts.push({
              functionResponse: {
                name: toolName,
                response: { output: toolResult },
              },
            });
          }

          contents.push({
            role: 'user',
            parts: responseParts,
          });
          iterations++;
        } else {
          finalReply = response.text || '';
          break;
        }
      }

      // If loop finished without reply, give appropriate reply
      if (!finalReply) {
        if (runner.steps.length > 0) {
          const lastStep = runner.steps[runner.steps.length - 1];
          finalReply = `काम पूर्ण झाले: ${lastStep.description}`;
        } else {
          finalReply = 'हो, समजले.';
        }
      }

      return res.json({
        success: true,
        replyText: finalReply,
        agentSteps: runner.steps,
        updatedState: runner.state,
        mode: 'gemini-agent-loop',
      });
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to deterministic agent:', err?.message || err);
      const fallbackResult = executeCommandDeterministically(transcript, currentState, lang);
      return res.json({
        success: true,
        replyText: fallbackResult.finalReply,
        agentSteps: fallbackResult.agentSteps,
        updatedState: fallbackResult.updatedState,
        mode: 'deterministic-agent-fallback',
      });
    }
  });

  // Vite middleware in dev or static files in production
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`VyavasAI Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
