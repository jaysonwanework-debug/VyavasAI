export type LanguageCode = 'mr-IN' | 'ta-IN' | 'hi-IN' | 'en-US';

export interface InventoryItem {
  id: string;
  name: string; // standard english key (e.g., 'sugar', 'rice')
  vernacularNames: {
    mr: string; // साखर
    ta: string; // சர்க்கரை
    hi: string; // चीनी / शक्कर
    en: string; // Sugar
  };
  unit: string; // 'kg' | 'L' | 'packet'
  price: number; // in INR ₹
  qty: number;
  lowStockThreshold: number;
  category: 'staples' | 'spices' | 'oils' | 'beverages' | 'daily';
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  balance: number; // pending udhaar (positive means customer owes money)
  lastTransactionDate?: string;
}

export interface OrderItem {
  name: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  date: string; // ISO string
  status: 'completed' | 'pending';
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  note: string;
  date: string;
}

export interface AppState {
  inventory: InventoryItem[];
  customers: Customer[];
  orders: Order[];
  expenses: Expense[];
}

export interface AgentStep {
  stepNumber: number;
  toolName: string;
  args: Record<string, any>;
  result: Record<string, any>;
  description: string;
  status: 'executing' | 'completed' | 'failed';
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  text: string;
  timestamp: string;
  agentSteps?: AgentStep[];
}
