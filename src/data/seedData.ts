import { AppState, LanguageCode } from '../types';

export const SEED_DATA: AppState = {
  inventory: [
    {
      id: 'inv-1',
      name: 'sugar',
      vernacularNames: {
        mr: 'साखर (Sugar)',
        ta: 'சர்க்கரை (Sugar)',
        hi: 'चीनी / शक्कर (Sugar)',
        en: 'Sugar',
      },
      unit: 'kg',
      price: 45,
      qty: 40,
      lowStockThreshold: 15,
      category: 'staples',
    },
    {
      id: 'inv-2',
      name: 'rice',
      vernacularNames: {
        mr: 'तांदूळ (Rice)',
        ta: 'அரிசி (Rice)',
        hi: 'चावल (Rice)',
        en: 'Rice (Kolam)',
      },
      unit: 'kg',
      price: 55,
      qty: 60,
      lowStockThreshold: 20,
      category: 'staples',
    },
    {
      id: 'inv-3',
      name: 'wheat flour',
      vernacularNames: {
        mr: 'गहू पीठ / आटा (Atta)',
        ta: 'கோதுமை மாவு (Wheat)',
        hi: 'गेहूं आटा (Atta)',
        en: 'Wheat Flour (Atta)',
      },
      unit: 'kg',
      price: 38,
      qty: 30,
      lowStockThreshold: 15,
      category: 'staples',
    },
    {
      id: 'inv-4',
      name: 'toor dal',
      vernacularNames: {
        mr: 'तूर डाळ (Toor Dal)',
        ta: 'துவரம் பருப்பு (Toor Dal)',
        hi: 'अरहर / तूर दाल (Dal)',
        en: 'Toor Dal (Arhar)',
      },
      unit: 'kg',
      price: 140,
      qty: 25,
      lowStockThreshold: 10,
      category: 'staples',
    },
    {
      id: 'inv-5',
      name: 'cooking oil',
      vernacularNames: {
        mr: 'खाद्य तेल (Oil)',
        ta: 'சமையல் எண்ணெய் (Oil)',
        hi: 'कुकिंग ऑयल (Oil)',
        en: 'Cooking Oil (Sunflow)',
      },
      unit: 'L',
      price: 130,
      qty: 20,
      lowStockThreshold: 10,
      category: 'oils',
    },
    {
      id: 'inv-6',
      name: 'tea powder',
      vernacularNames: {
        mr: 'चहा पावडर (Chai Patti)',
        ta: 'தேயிலை தூள் (Tea)',
        hi: 'चाय पत्ती (Tea)',
        en: 'Tea Powder (Chai)',
      },
      unit: 'kg',
      price: 420,
      qty: 10,
      lowStockThreshold: 12, // already low stock!
      category: 'beverages',
    },
    {
      id: 'inv-7',
      name: 'salt',
      vernacularNames: {
        mr: 'मीठ (Salt)',
        ta: 'உப்பு (Salt)',
        hi: 'नमक (Salt)',
        en: 'Iodized Salt',
      },
      unit: 'kg',
      price: 22,
      qty: 30,
      lowStockThreshold: 10,
      category: 'staples',
    },
  ],
  customers: [
    {
      id: 'cust-1',
      name: 'Ramesh',
      phone: '+91 98200 11223',
      balance: 150,
      lastTransactionDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'cust-2',
      name: 'Suresh',
      phone: '+91 98200 44556',
      balance: 500,
      lastTransactionDate: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: 'cust-3',
      name: 'Sunita',
      phone: '+91 98200 77889',
      balance: 0,
      lastTransactionDate: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'cust-4',
      name: 'Lakshmi',
      phone: '+91 98200 99001',
      balance: 200,
      lastTransactionDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ],
  orders: [
    {
      id: 'ORD-1019',
      customerName: 'Sunita',
      items: [
        { name: 'rice', qty: 5, unit: 'kg', unitPrice: 55, total: 275 },
        { name: 'sugar', qty: 2, unit: 'kg', unitPrice: 45, total: 90 },
      ],
      totalAmount: 365,
      date: new Date(Date.now() - 86400000 * 1).toISOString(),
      status: 'completed',
    },
    {
      id: 'ORD-1020',
      customerName: 'Lakshmi',
      items: [
        { name: 'cooking oil', qty: 2, unit: 'L', unitPrice: 130, total: 260 },
        { name: 'salt', qty: 1, unit: 'kg', unitPrice: 22, total: 22 },
      ],
      totalAmount: 282,
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: 'completed',
    },
    {
      id: 'ORD-1021',
      customerName: 'Suresh',
      items: [
        { name: 'toor dal', qty: 2, unit: 'kg', unitPrice: 140, total: 280 },
        { name: 'wheat flour', qty: 5, unit: 'kg', unitPrice: 38, total: 190 },
      ],
      totalAmount: 470,
      date: new Date(Date.now() - 86400000 * 3).toISOString(),
      status: 'completed',
    },
    {
      id: 'ORD-1022',
      customerName: 'Ramesh',
      items: [
        { name: 'tea powder', qty: 0.5, unit: 'kg', unitPrice: 420, total: 210 },
        { name: 'sugar', qty: 1, unit: 'kg', unitPrice: 45, total: 45 },
      ],
      totalAmount: 255,
      date: new Date(Date.now() - 86400000 * 4).toISOString(),
      status: 'completed',
    },
  ],
  expenses: [
    {
      id: 'exp-1',
      category: 'Rent',
      amount: 4000,
      note: 'Dukaan Monthly Rent share',
      date: new Date(Date.now() - 86400000 * 6).toISOString(),
    },
    {
      id: 'exp-2',
      category: 'Electricity',
      amount: 850,
      note: 'Refrigerator & lighting bill',
      date: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'exp-3',
      category: 'Transport',
      amount: 320,
      note: 'Market auto tempo goods delivery',
      date: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'exp-4',
      category: 'Packaging',
      amount: 180,
      note: 'Carry bags & paper parcels',
      date: new Date().toISOString(),
    },
  ],
};

export interface LanguageMeta {
  code: LanguageCode;
  name: string;
  nativeName: string;
  speechLang: string;
  welcome: string;
  tapToSpeak: string;
  listening: string;
  thinking: string;
  speaking: string;
  typeFallback: string;
  typePlaceholder: string;
  send: string;
  agentSteps: string;
  agentStepsSubtitle: string;
  resetConfirm: string;
  resetButton: string;
  lowStockBadge: string;
  available: string;
  tryText: string;
  tabs: {
    home: string;
    stock: string;
    orders: string;
    khata: string;
    money: string;
  };
  sampleChips: Array<{ text: string; label: string }>;
}

export const LANGUAGE_CONFIGS: Record<LanguageCode, LanguageMeta> = {
  'mr-IN': {
    code: 'mr-IN',
    name: 'Marathi',
    nativeName: 'मराठी',
    speechLang: 'mr-IN',
    welcome: 'नमस्कार! मी तुमचा दुकान साथी आहे. फक्त बोला, सर्व काम आपोआप होईल!',
    tapToSpeak: 'माईक दाबा आणि बोला',
    listening: 'ऐकत आहे... बोला!',
    thinking: 'विचार करत आहे आणि काम करत आहे...',
    speaking: 'उत्तर देत आहे...',
    typeFallback: 'टाईप करा',
    typePlaceholder: 'उदा. "रमेश ने ५ किलो साखर मागितली..."',
    send: 'पाठवा',
    agentSteps: 'एजंट कामाची पायरी (Agent Steps)',
    agentStepsSubtitle: 'प्रत्येक टूल कॉलची थेट पारदर्शकता',
    resetConfirm: 'सर्व डेमो डेटा मूळ स्थितीत रिसेट करायचा का?',
    resetButton: 'डेटा रिसेट',
    lowStockBadge: 'कमी स्टॉक!',
    available: 'उपलब्ध',
    tryText: 'असे बोलून पहा',
    tabs: {
      home: 'होम',
      stock: 'स्टॉक',
      orders: 'ऑर्डर्स',
      khata: 'खाता',
      money: 'हिशोब',
    },
    sampleChips: [
      {
        text: 'Ramesh ne 5 kg sakhar mangitli, order kar ani stock update kar',
        label: '⭐ रमेश ५ किलो साखर ऑर्डर',
      },
      {
        text: 'आज किती कमाई झाली?',
        label: '💰 आजची विक्री व कमाई',
      },
      {
        text: 'तांदूळ किती उरलाय?',
        label: '📦 तांदळाचा स्टॉक तपासा',
      },
      {
        text: 'सुरेशची उधारी किती आहे?',
        label: '📖 सुरेशचे बाकी पैसे',
      },
    ],
  },
  'ta-IN': {
    code: 'ta-IN',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    speechLang: 'ta-IN',
    welcome: 'வணக்கம்! நான் உங்கள் கடை உதவியாளர். பேசி உங்கள் கடையை நிர்வகிக்கலாம்!',
    tapToSpeak: 'பேச மைக் பட்டனைத் தொடவும்',
    listening: 'கேட்கிறது... பேசுங்கள்!',
    thinking: 'யோசித்து நடவடிக்கை எடுக்கிறது...',
    speaking: 'பதிலளிக்கிறது...',
    typeFallback: 'டைப் செய்க',
    typePlaceholder: 'எ.கா. "ரமேஷ் 5 கிலோ சர்க்கரை..."',
    send: 'அனுப்புக',
    agentSteps: 'செயல் படிகள் (Agent Steps)',
    agentStepsSubtitle: 'கருவி அழைப்புகளின் நேரடி விளக்கம்',
    resetConfirm: 'டெமோ தரவை மீட்டமைக்க விரும்புகிறீர்களா?',
    resetButton: 'மீட்டமை',
    lowStockBadge: 'குறைந்த இருப்பு!',
    available: 'இருப்பு',
    tryText: 'இப்படி பேசிப் பாருங்கள்',
    tabs: {
      home: 'முகப்பு',
      stock: 'சரக்கு',
      orders: 'ஆர்டர்கள்',
      khata: 'கணக்கு',
      money: 'பணம்',
    },
    sampleChips: [
      {
        text: 'ரமேஷ் 5 கிலோ சர்க்கரை கேட்டார், ஆர்டர் போட்டு ஸ்டாக் அப்டேட் செய்',
        label: '⭐ ரமேஷ் 5 கிலோ சர்க்கரை',
      },
      {
        text: 'இன்னைக்கு எவ்வளவு விற்பனை ஆச்சு?',
        label: '💰 இன்றைய விற்பனை',
      },
      {
        text: 'அரிசி எவ்வளவு மிச்சம் இருக்கு?',
        label: '📦 அரிசி இருப்பு',
      },
      {
        text: 'சுரேஷின் பாக்கி எவ்வளவு?',
        label: '📖 சுரேஷ் கணக்கு',
      },
    ],
  },
  'hi-IN': {
    code: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    speechLang: 'hi-IN',
    welcome: 'नमस्ते! मैं आपका दुकान साथी हूँ। बोलकर दुकान का पूरा हिसाब संभालें!',
    tapToSpeak: 'माइक दबाएं और बोलें',
    listening: 'सुन रहा हूँ... बोलिए!',
    thinking: 'सोचकर काम पूरा कर रहा हूँ...',
    speaking: 'जवाब दे रहा हूँ...',
    typeFallback: 'टाइप करें',
    typePlaceholder: 'उदा. "रमेश ने 5 किलो चीनी मांगी..."',
    send: 'भेजें',
    agentSteps: 'एजेंट स्टेप्स (Agent Steps)',
    agentStepsSubtitle: 'हर टूल का लाइव एग्जीक्यूशन',
    resetConfirm: 'क्या आप डेमो डेटा को रीसेट करना चाहते हैं?',
    resetButton: 'डेटा रीसेट',
    lowStockBadge: 'कम स्टॉक!',
    available: 'उपलब्ध',
    tryText: 'ऐसे बोलकर देखें',
    tabs: {
      home: 'होम',
      stock: 'स्टॉक',
      orders: 'ऑर्डर',
      khata: 'खाता',
      money: 'हिसाब',
    },
    sampleChips: [
      {
        text: 'रमेश ने 5 किलो चीनी मांगी, ऑर्डर करो और स्टॉक अपडेट करो',
        label: '⭐ रमेश 5 किलो चीनी ऑर्डर',
      },
      {
        text: 'आज कुल कितनी बिक्री हुई?',
        label: '💰 आज की कुल कमाई',
      },
      {
        text: 'चावल कितना बचा है?',
        label: '📦 चावल का स्टॉक',
      },
      {
        text: 'सुरेश की उधारी कितनी है?',
        label: '📖 सुरेश का खाता',
      },
    ],
  },
  'en-US': {
    code: 'en-US',
    name: 'English',
    nativeName: 'English',
    speechLang: 'en-IN',
    welcome: 'Welcome! I am your Dukaan Saathi voice agent. Speak to manage stock, orders, and ledger!',
    tapToSpeak: 'Tap mic to speak',
    listening: 'Listening... speak now!',
    thinking: 'Planning and executing tools...',
    speaking: 'Replying...',
    typeFallback: 'Type command',
    typePlaceholder: 'e.g. "Ramesh asked for 5kg sugar, create order and update stock"',
    send: 'Send',
    agentSteps: 'Agent Steps Pipeline',
    agentStepsSubtitle: 'Live transparency & tool execution',
    resetConfirm: 'Reset all demo data back to default?',
    resetButton: 'Reset Demo',
    lowStockBadge: 'Low Stock!',
    available: 'In Stock',
    tryText: 'Try saying',
    tabs: {
      home: 'Home',
      stock: 'Stock',
      orders: 'Orders',
      khata: 'Khata',
      money: 'Money',
    },
    sampleChips: [
      {
        text: 'Ramesh ordered 5 kg sugar, make order and update stock',
        label: '⭐ Ramesh 5kg Sugar Order',
      },
      {
        text: 'What are the total sales today?',
        label: '💰 Today\'s Revenue',
      },
      {
        text: 'How much rice is left in stock?',
        label: '📦 Check Rice Stock',
      },
      {
        text: 'What is Suresh\'s pending balance?',
        label: '📖 Suresh Khata Balance',
      },
    ],
  },
};
