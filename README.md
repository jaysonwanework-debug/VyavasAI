# VyavasAI • 7.3 Vernacular
> **Voice-First Agentic Operating System for Indian MSME Kirana Store Owners**  
> *Zero typing. Zero menu navigation. Complete shop inventory, billing, and ledger management by speaking in regional languages.*

[![Gemini 3.8 Live API](https://img.shields.io/badge/Gemini-3.8--Live--API-00f0ff?style=flat-square&logo=google)](https://ai.google.dev/)
[![Gemini 3.8 Flash](https://img.shields.io/badge/Gemini-3.8--Flash-blue?style=flat-square&logo=google)](https://ai.google.dev/)
[![Gemini TTS](https://img.shields.io/badge/Gemini-TTS--3.8-emerald?style=flat-square&logo=google)](https://ai.google.dev/)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-ES2022-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

---

## 🌟 Overview

**VyavasAI** is a cyber-neon, voice-first operating system tailored for India's 13+ million micro-retailers (Kirana stores and local MSMEs). Small shop owners operate in noisy, fast-paced environments where standard POS software or typing into apps is impractical. 

VyavasAI eliminates all typing and complex navigation: the owner speaks naturally in **Marathi (मराठी)**, **Tamil (தமிழ்)**, **Hindi (हिन्दी)**, or **English**, including code-mixed vernacular terms (*"sakhar"*, *"tandul"*, *"tel"*, *"udhaar"*, *"bill"*). Powered by **Google Gemini API** with multi-turn function calling, the agent translates intent into chained tool executions, updates the store state, and speaks back in the merchant's mother tongue.

---

## 🚀 Key Features

### 🎙️ 1. Voice-First Hero Interface
- **Hero Microphone Button**: Large, centered, high-contrast microphone button designed for low-literacy touch ergonomics.
- **Audio Visualizer & VAD**: Web Audio API analyser decodes real-time decibel volume, causing the mic pulse rings to react dynamically to human speech.
- **Continuous Live Voice Mode (`🔴 LIVE`)**: Hands-free conversation loop where the agent listens, executes tools, replies with speech, and automatically waits for the next command.
- **Vernacular Language Switcher**: Instant switching between **Marathi (`mr-IN`)**, **Tamil (`ta-IN`)**, **Hindi (`hi-IN`)**, and **English (`en-IN`)**.

### 🧠 2. Agentic Architecture & Multi-Step Execution
Powered by **Gemini 3.8 Flash** with tool declarations. The agent receives a voice command, plans a multi-step sequence, calls tools in order, and repeats until the task is complete.

#### 10 Built-In MSME Tools:
1. `check_stock(item)`: Validates stock availability, unit, and unit price.
2. `create_order(customer, items)`: Computes item subtotals, grand totals, and creates an order receipt.
3. `update_stock(item, delta, reason)`: Modifies inventory quantity (negative for sales, positive for restock).
4. `add_to_customer_ledger(customer, amount, type)`: Modifies customer's *udhaar* (credit) balance.
5. `get_sales_summary(period)`: Calculates today's, weekly, or monthly revenue, order count, and top items.
6. `get_customer_balance(customer)`: Retrieves outstanding credit debt.
7. `add_item(name, unit, price, qty)`: Registers a new product in inventory.
8. `get_low_stock_items(threshold)`: Identifies items running low on stock.
9. `record_expense(category, amount, note)`: Tracks shop expenses (rent, electricity, delivery tempo, bags).
10. `record_payment(customer, amount)`: Records a customer debt repayment.

### 🔍 3. Agent Transparency Panel
A live HUD panel below the chat interface displaying:
- Every executed tool call in sequential order.
- Tool name, parameters, return payload, and human-readable vernacular explanation.
- Glowing `✅ Done` status badges proving genuine multi-step agentic execution.

### 🔊 4. Studio-Quality Gemini AI Speech (`gemini-3.8-flash-lite-tts`)
- Audio endpoint (`POST /api/tts`) delivers 24kHz natural speech synthesized directly by Gemini.
- Full fallback to browser `window.speechSynthesis` and `SpeechRecognition` ensures offline and low-bandwidth resilience.

### 📊 5. Real-Time Dashboard Tabs
- **Home (मुख्य)**: Holographic Kirana avatar, hero mic, live interim transcript, multi-turn chat feed, and agent steps pipeline.
- **Stock (स्टॉक)**: Real-time inventory cards with low-stock badges, price per unit, and quick restock actions.
- **Orders (ऑर्डर्स)**: Itemized sales orders with timestamps, customer names, and totals.
- **Khata (खाता)**: Customer ledger tracking outstanding debt (*udhaar*) with quick payment collection modals.
- **Money (हिशोब)**: Daily revenue, expense breakdown, net profit, and a 7-day sales bar chart.

---

## ⚡ The Benchmark Demo Flow

Say or tap:
> **"Ramesh ne 5 kg sakhar mangitli, order kar ani stock update kar"**  
> *(Marathi: "Ramesh asked for 5kg sugar, make an order and update stock")*

### The Agent Execution Pipeline:
