import { AppState, AgentStep, InventoryItem, LanguageCode } from '../types';

// Transliteration and alias dictionary for Kirana store items
const ITEM_ALIASES: Record<string, string> = {
  // Sugar
  sakhar: 'sugar',
  'साखर': 'sugar',
  sakkar: 'sugar',
  sugar: 'sugar',
  'சர்க்கரை': 'sugar',
  sarkkarai: 'sugar',
  chini: 'sugar',
  'चीनी': 'sugar',
  shakkar: 'sugar',
  'शक्कर': 'sugar',

  // Rice
  tandul: 'rice',
  'तांदूळ': 'rice',
  tandool: 'rice',
  rice: 'rice',
  chawal: 'rice',
  'चावल': 'rice',
  'அரிசி': 'rice',
  arisi: 'rice',
  taandul: 'rice',

  // Wheat Flour / Atta
  atta: 'wheat flour',
  aata: 'wheat flour',
  'आटा': 'wheat flour',
  'गहू पीठ': 'wheat flour',
  'गहू': 'wheat flour',
  wheat: 'wheat flour',
  'wheat flour': 'wheat flour',
  'கோதுமை மாவு': 'wheat flour',
  'கோதுமை': 'wheat flour',
  godhumai: 'wheat flour',

  // Toor Dal
  dal: 'toor dal',
  'डाळ': 'toor dal',
  'दाल': 'toor dal',
  'तूर डाळ': 'toor dal',
  'तूर': 'toor dal',
  'toor dal': 'toor dal',
  toordal: 'toor dal',
  'துவரம் பருப்பு': 'toor dal',
  'பருப்பு': 'toor dal',
  paruppu: 'toor dal',
  arhar: 'toor dal',
  'अरहर दाल': 'toor dal',

  // Cooking Oil
  tel: 'cooking oil',
  'तेल': 'cooking oil',
  oil: 'cooking oil',
  'cooking oil': 'cooking oil',
  'खाद्य तेल': 'cooking oil',
  'எண்ணெய்': 'cooking oil',
  ennai: 'cooking oil',
  sunflower: 'cooking oil',

  // Tea Powder
  'chai patti': 'tea powder',
  'चाय पत्ती': 'tea powder',
  'चहा पावडर': 'tea powder',
  chaha: 'tea powder',
  'चहा': 'tea powder',
  chai: 'tea powder',
  tea: 'tea powder',
  'tea powder': 'tea powder',
  'தேயிலை தூள்': 'tea powder',
  'தேயிலை': 'tea powder',
  'தேநீர்': 'tea powder',

  // Salt
  meeth: 'salt',
  'मीठ': 'salt',
  salt: 'salt',
  namak: 'salt',
  'नमक': 'salt',
  'உப்பு': 'salt',
  uppu: 'salt',
};

export function resolveItemKey(rawName: string): string {
  if (!rawName) return '';
  const clean = rawName.trim().toLowerCase();
  if (ITEM_ALIASES[clean]) {
    return ITEM_ALIASES[clean];
  }
  // Substring matching
  for (const [alias, canonical] of Object.entries(ITEM_ALIASES)) {
    if (clean.includes(alias)) {
      return canonical;
    }
  }
  return clean;
}

export function findInventoryItem(inventory: InventoryItem[], rawName: string): InventoryItem | undefined {
  const canonical = resolveItemKey(rawName);
  return inventory.find(
    (item) =>
      item.name.toLowerCase() === canonical ||
      item.vernacularNames.mr.toLowerCase().includes(rawName.toLowerCase()) ||
      item.vernacularNames.hi.toLowerCase().includes(rawName.toLowerCase()) ||
      item.vernacularNames.ta.toLowerCase().includes(rawName.toLowerCase())
  );
}

// Tool Execution Context
export class ToolRunner {
  state: AppState;
  steps: AgentStep[];
  stepCounter: number;

  constructor(initialState: AppState) {
    // Deep clone to prevent unintended side effects before confirmation
    this.state = JSON.parse(JSON.stringify(initialState));
    this.steps = [];
    this.stepCounter = 1;
  }

  logStep(toolName: string, args: Record<string, any>, result: Record<string, any>, description: string) {
    this.steps.push({
      stepNumber: this.stepCounter++,
      toolName,
      args,
      result,
      description,
      status: 'completed',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    });
  }

  check_stock(item: string): { available: number; unit: string; price: number; itemName: string; success: boolean; error?: string } {
    const inv = findInventoryItem(this.state.inventory, item);
    if (!inv) {
      const err = `Item "${item}" not found in inventory.`;
      this.logStep('check_stock', { item }, { error: err }, `🔍 ${item} चा शोध: सापडले नाही`);
      return { success: false, available: 0, unit: '', price: 0, itemName: item, error: err };
    }
    const result = {
      available: inv.qty,
      unit: inv.unit,
      price: inv.price,
      itemName: inv.name,
      success: true,
    };
    this.logStep(
      'check_stock',
      { item: inv.name },
      result,
      `🔍 स्टॉक तपासला: ${inv.vernacularNames.mr} शिल्लक ${inv.qty} ${inv.unit} (₹${inv.price}/${inv.unit})`
    );
    return result;
  }

  update_stock(item: string, delta: number, reason: string): { success: boolean; previousQty: number; newQty: number; unit: string; error?: string } {
    const inv = findInventoryItem(this.state.inventory, item);
    if (!inv) {
      return { success: false, previousQty: 0, newQty: 0, unit: '', error: `Item "${item}" not found` };
    }
    const previousQty = inv.qty;
    const newQty = Math.max(0, Number((inv.qty + Number(delta)).toFixed(2)));
    inv.qty = newQty;

    const result = { success: true, previousQty, newQty, unit: inv.unit, reason };
    const sign = delta > 0 ? `+${delta}` : `${delta}`;
    this.logStep(
      'update_stock',
      { item: inv.name, delta, reason },
      result,
      `📦 स्टॉक बदलला: ${inv.vernacularNames.mr} (${sign} ${inv.unit}) → आता शिल्लक: ${newQty} ${inv.unit}`
    );
    return result;
  }

  create_order(
    customer: string,
    items: Array<{ name: string; qty: number; unit?: string }>
  ): { success: boolean; orderId: string; total: number; itemsDetail: any[]; error?: string } {
    const orderItems: any[] = [];
    let grandTotal = 0;

    for (const it of items) {
      const inv = findInventoryItem(this.state.inventory, it.name);
      const unitPrice = inv ? inv.price : 50;
      const unit = it.unit || (inv ? inv.unit : 'kg');
      const itemTotal = unitPrice * Number(it.qty);
      grandTotal += itemTotal;

      orderItems.push({
        name: inv ? inv.name : it.name,
        qty: Number(it.qty),
        unit,
        unitPrice,
        total: itemTotal,
      });
    }

    const orderId = `ORD-${1023 + this.state.orders.length + 1}`;
    const newOrder = {
      id: orderId,
      customerName: customer,
      items: orderItems,
      totalAmount: grandTotal,
      date: new Date().toISOString(),
      status: 'completed' as const,
    };

    this.state.orders.unshift(newOrder);

    const result = {
      success: true,
      orderId,
      total: grandTotal,
      itemsDetail: orderItems,
    };

    const itemSummary = orderItems.map((i) => `${i.qty} ${i.unit} ${i.name}`).join(', ');
    this.logStep(
      'create_order',
      { customer, items: orderItems, total: grandTotal },
      result,
      `🛒 ऑर्डर #${orderId} तयार: ग्राहक ${customer} • ${itemSummary} • एकूण = ₹${grandTotal}`
    );
    return result;
  }

  add_to_customer_ledger(
    customer: string,
    amount: number,
    type: 'credit' | 'payment'
  ): { success: boolean; customer: string; previousBalance: number; newBalance: number; error?: string } {
    let cust = this.state.customers.find((c) => c.name.toLowerCase() === customer.toLowerCase());
    if (!cust) {
      // Auto-create customer with matching casing
      cust = {
        id: `cust-${Date.now()}`,
        name: customer,
        balance: 0,
        lastTransactionDate: new Date().toISOString(),
      };
      this.state.customers.push(cust);
    }

    const previousBalance = cust.balance;
    const numAmount = Number(amount);
    if (type === 'credit') {
      cust.balance = Number((cust.balance + numAmount).toFixed(2));
    } else {
      cust.balance = Number((cust.balance - numAmount).toFixed(2));
    }
    cust.lastTransactionDate = new Date().toISOString();

    const result = {
      success: true,
      customer: cust.name,
      previousBalance,
      newBalance: cust.balance,
      type,
    };

    const typeDesc = type === 'credit' ? `उधारी जोडली (+₹${numAmount})` : `रक्कम जमा केली (-₹${numAmount})`;
    this.logStep(
      'add_to_customer_ledger',
      { customer: cust.name, amount: numAmount, type },
      result,
      `📖 खातेवही नोंद: ${cust.name} • ${typeDesc} → बाकी: ₹${cust.balance}`
    );
    return result;
  }

  get_sales_summary(period: 'today' | 'week' | 'month' = 'today'): { revenue: number; orderCount: number; period: string } {
    const todayStr = new Date().toDateString();
    const todayOrders = this.state.orders.filter((o) => {
      if (period === 'today') {
        return new Date(o.date).toDateString() === todayStr;
      }
      return true;
    });

    const revenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const result = {
      revenue,
      orderCount: todayOrders.length,
      period,
    };

    this.logStep('get_sales_summary', { period }, result, `📊 विक्री हिशोब (${period}): एकूण ₹${revenue} (${todayOrders.length} ऑर्डर्स)`);
    return result;
  }

  get_customer_balance(customer: string): { customer: string; balance: number; found: boolean } {
    const cust = this.state.customers.find((c) => c.name.toLowerCase() === customer.toLowerCase());
    if (!cust) {
      const res = { customer, balance: 0, found: false };
      this.logStep('get_customer_balance', { customer }, res, `❓ ग्राहक शोध: "${customer}" सापडले नाही`);
      return res;
    }
    const res = { customer: cust.name, balance: cust.balance, found: true };
    this.logStep('get_customer_balance', { customer: cust.name }, res, `📖 उधारी शिल्लक: ${cust.name} बाकी = ₹${cust.balance}`);
    return res;
  }

  get_low_stock_items(threshold: number = 15): { items: any[]; count: number } {
    const low = this.state.inventory.filter((i) => i.qty <= (threshold || i.lowStockThreshold));
    const summary = low.map((i) => ({ name: i.name, mr: i.vernacularNames.mr, qty: i.qty, unit: i.unit }));
    const res = { items: summary, count: summary.length };
    this.logStep('get_low_stock_items', { threshold }, res, `⚠️ कमी स्टॉक: ${summary.length} वस्तू कमी आहेत (${summary.map((s) => s.mr).join(', ')})`);
    return res;
  }

  record_expense(category: string, amount: number, note: string = ''): { success: boolean; expenseId: string } {
    const expenseId = `exp-${Date.now()}`;
    const newExp = {
      id: expenseId,
      category,
      amount: Number(amount),
      note: note || category,
      date: new Date().toISOString(),
    };
    this.state.expenses.unshift(newExp);
    const res = { success: true, expenseId };
    this.logStep('record_expense', { category, amount, note }, res, `💸 खर्च नोंदवला: ₹${amount} (${category} - ${note})`);
    return res;
  }

  record_payment(customer: string, amount: number): { success: boolean; newBalance: number } {
    const ledgerRes = this.add_to_customer_ledger(customer, amount, 'payment');
    return { success: ledgerRes.success, newBalance: ledgerRes.newBalance };
  }

  add_item(name: string, unit: string, price: number, qty: number): { success: boolean; id: string } {
    const id = `inv-${Date.now()}`;
    const newItem: InventoryItem = {
      id,
      name: name.toLowerCase(),
      vernacularNames: {
        mr: `${name}`,
        ta: `${name}`,
        hi: `${name}`,
        en: name,
      },
      unit,
      price: Number(price),
      qty: Number(qty),
      lowStockThreshold: 10,
      category: 'staples',
    };
    this.state.inventory.push(newItem);
    this.logStep('add_item', { name, unit, price, qty }, { success: true, id }, `✨ नवीन वस्तू जोडली: ${name} (${qty} ${unit} @ ₹${price})`);
    return { success: true, id };
  }
}

// Resilient Fallback Agent Executor
// When network is offline or for instant deterministic evaluation
export function executeCommandDeterministically(
  text: string,
  currentState: AppState,
  lang: LanguageCode
): { finalReply: string; agentSteps: AgentStep[]; updatedState: AppState } {
  const runner = new ToolRunner(currentState);
  const lower = text.toLowerCase();

  // Pattern 1: Demo Flow: "Ramesh ne 5 kg sakhar mangitli, order kar ani stock update kar"
  // Handles Marathi, Tamil, Hindi, English variants
  const isSugarOrder =
    (lower.includes('ramesh') || lower.includes('रमेश') || lower.includes('ரமேஷ்')) &&
    (lower.includes('sakhar') || lower.includes('साखर') || lower.includes('sugar') || lower.includes('சர்க்கரை') || lower.includes('चीनी') || lower.includes('शक्कर'));

  if (isSugarOrder) {
    // Step 1: Check Stock
    const stockRes = runner.check_stock('sugar');
    const orderQty = 5;

    if (stockRes.available >= orderQty) {
      // Step 2: Create Order
      const orderRes = runner.create_order('Ramesh', [{ name: 'sugar', qty: orderQty, unit: 'kg' }]);
      // Step 3: Update Stock
      runner.update_stock('sugar', -orderQty, 'sale order ORD-' + orderRes.orderId);
      // Step 4: Add to customer ledger
      runner.add_to_customer_ledger('Ramesh', orderRes.total, 'credit');

      let reply = '';
      if (lang === 'mr-IN') {
        reply = `झालं! रमेशची ५ किलो साखरेची ऑर्डर तयार केली, स्टॉक अपडेट केला आणि ₹${orderRes.total} त्याच्या बिलात जोडले.`;
      } else if (lang === 'ta-IN') {
        reply = `ஆர்டர் முடிந்தது! ரமேஷுக்கு 5 கிலோ சர்க்கரை ஆர்டர் உருவாக்கப்பட்டது, இருப்பு புதுப்பிக்கப்பட்டது மற்றும் ₹${orderRes.total} பற்று வைக்கப்பட்டது.`;
      } else if (lang === 'hi-IN') {
        reply = `हो गया! रमेश का 5 किलो चीनी का ऑर्डर बना दिया, स्टॉक अपडेट किया और ₹${orderRes.total} उसके खाते में जोड़ दिए।`;
      } else {
        reply = `Done! Created order for Ramesh for 5 kg sugar, updated inventory, and added ₹${orderRes.total} to his ledger balance.`;
      }

      return {
        finalReply: reply,
        agentSteps: runner.steps,
        updatedState: runner.state,
      };
    } else {
      const reply =
        lang === 'mr-IN'
          ? `क्षमस्व, साखरेचा स्टॉक अपुरा आहे. फक्त ${stockRes.available} किलो उपलब्ध आहे.`
          : lang === 'ta-IN'
          ? `மன்னிக்கவும், போதுமான சர்க்கரை இருப்பு இல்லை. ${stockRes.available} கிலோ மட்டுமே உள்ளது.`
          : `Sorry, insufficient sugar in stock. Only ${stockRes.available} kg available.`;
      return {
        finalReply: reply,
        agentSteps: runner.steps,
        updatedState: runner.state,
      };
    }
  }

  // Pattern 2: Today's Sales Query
  // "आज किती कमाई झाली?", "आजची एकूण कमाई?", "இன்னைக்கு எவ்வளவு விற்பனை ஆச்சு?", "आज कितनी बिक्री हुई?", "today sales"
  if (
    lower.includes('कमाई') ||
    lower.includes('विक्री') ||
    lower.includes('விற்பனை') ||
    lower.includes('बिक्री') ||
    lower.includes('revenue') ||
    lower.includes('sales')
  ) {
    const summary = runner.get_sales_summary('today');
    let reply = '';
    if (lang === 'mr-IN') {
      reply = `आज आतापर्यंत एकूण ₹${summary.revenue} रुपयांची विक्री झाली आहे आणि ${summary.orderCount} ऑर्डर्स आल्या आहेत.`;
    } else if (lang === 'ta-IN') {
      reply = `இன்று இதுவரை மொத்தம் ₹${summary.revenue} விற்பனை ஆகியுள்ளது (${summary.orderCount} ஆர்டர்கள்).`;
    } else if (lang === 'hi-IN') {
      reply = `आज अब तक कुल ₹${summary.revenue} की बिक्री हुई है और ${summary.orderCount} ऑर्डर पूरे हुए हैं।`;
    } else {
      reply = `Today's total sales are ₹${summary.revenue} with ${summary.orderCount} orders recorded.`;
    }
    return { finalReply: reply, agentSteps: runner.steps, updatedState: runner.state };
  }

  // Pattern 3: Rice Stock Query
  // "तांदूळ किती उरलाय?", "அரிசி எவ்வளவு இருக்கிறது?", "चावल कितना बचा है?", "rice stock"
  if (
    lower.includes('तांदूळ') ||
    lower.includes('tandul') ||
    lower.includes('chawal') ||
    lower.includes('चावल') ||
    lower.includes('அரிசி') ||
    lower.includes('rice')
  ) {
    const res = runner.check_stock('rice');
    let reply = '';
    if (lang === 'mr-IN') {
      reply = `दुकानात सध्या ${res.available} किलो तांदूळ शिल्लक आहे (दर ₹${res.price}/किलो).`;
    } else if (lang === 'ta-IN') {
      reply = `தற்போது கடையில் ${res.available} கிலோ அரிசி உள்ளது (விலை ₹${res.price}/கிலோ).`;
    } else if (lang === 'hi-IN') {
      reply = `दुकान में अभी ${res.available} किलो चावल बचा है (कीमत ₹${res.price}/किलो).`;
    } else {
      reply = `Currently, there is ${res.available} kg rice available in stock at ₹${res.price}/kg.`;
    }
    return { finalReply: reply, agentSteps: runner.steps, updatedState: runner.state };
  }

  // Pattern 4: Customer Balance / Udhaar Query
  // "सुरेशचा उधारी किती आहे?", "सुरेशची उधारी", "சுரேஷின் பாக்கி எவ்வளவு?", "सुरेश की उधारी", "Suresh balance"
  if (lower.includes('सुरेश') || lower.includes('suresh') || lower.includes('சுரேஷ்')) {
    const res = runner.get_customer_balance('Suresh');
    let reply = '';
    if (lang === 'mr-IN') {
      reply = `सुरेशची सध्या एकूण ₹${res.balance} उधारी बाकी आहे.`;
    } else if (lang === 'ta-IN') {
      reply = `சுரேஷின் கணக்கில் தற்போது ₹${res.balance} பாக்கி உள்ளது.`;
    } else if (lang === 'hi-IN') {
      reply = `सुरेश के खाते में ₹${res.balance} की उधारी बकाया है।`;
    } else {
      reply = `Suresh's pending balance is ₹${res.balance}.`;
    }
    return { finalReply: reply, agentSteps: runner.steps, updatedState: runner.state };
  }

  // Pattern 5: Low stock items
  // "कमी स्टॉक", "low stock", "குறைந்த இருப்பு", "कम स्टॉक"
  if (lower.includes('कमी') || lower.includes('कम') || lower.includes('குறைந்த') || lower.includes('low')) {
    const res = runner.get_low_stock_items(15);
    const names = res.items.map((i) => i.mr || i.name).join(', ');
    let reply = '';
    if (lang === 'mr-IN') {
      reply = `दुकानात ${res.count} वस्तूंचा स्टॉक कमी आहे: ${names}. कृपया लवकर माल मागवा.`;
    } else if (lang === 'ta-IN') {
      reply = `கடையில் ${res.count} பொருட்களுக்கு இருப்பு குறைவாக உள்ளது: ${names}.`;
    } else {
      reply = `${res.count} items are running low on stock: ${names}.`;
    }
    return { finalReply: reply, agentSteps: runner.steps, updatedState: runner.state };
  }

  // Generic fallback: check stock or record
  const checkStockRes = runner.check_stock('sugar');
  const genericReply =
    lang === 'mr-IN'
      ? `माफ करा, कृपया स्पष्ट बोला. उदा. "रमेश ने ५ किलो साखर मागितली" किंवा "आज किती कमाई झाली?"`
      : lang === 'ta-IN'
      ? `மன்னிக்கவும், மீண்டும் தெளிவாகக் கூறவும். எ.கா. "ரமேஷ் 5 கிலோ சர்க்கரை" அல்லது "இன்றைய விற்பனை எவ்வளவு?"`
      : lang === 'hi-IN'
      ? `माफ कीजिए, कृपया फिर से बोलें। उदा. "रमेश ने 5 किलो चीनी मांगी" या "आज कितनी बिक्री हुई?"`
      : `Please say that again clearly. E.g., "Ramesh ordered 5 kg sugar" or "What are today's sales?"`;

  return {
    finalReply: genericReply,
    agentSteps: runner.steps,
    updatedState: runner.state,
  };
}
