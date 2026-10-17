import React, { useState } from 'react';
import { IndianRupee, TrendingUp, TrendingDown, Plus, Calendar, DollarSign, Wallet } from 'lucide-react';
import { Order, Expense, LanguageCode } from '../types';
import { LANGUAGE_CONFIGS } from '../data/seedData';

interface MoneyTabProps {
  orders: Order[];
  expenses: Expense[];
  currentLang: LanguageCode;
  onRecordExpense: (category: string, amount: number, note: string) => void;
}

export const MoneyTab: React.FC<MoneyTabProps> = ({
  orders,
  expenses,
  currentLang,
  onRecordExpense,
}) => {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [category, setCategory] = useState('Transport');
  const [amount, setAmount] = useState<number>(200);
  const [note, setNote] = useState('');
  const langMeta = LANGUAGE_CONFIGS[currentLang];

  const todayStr = new Date().toDateString();

  // Today's calculations
  const todayOrders = orders.filter(
    (o) => new Date(o.date).toDateString() === todayStr
  );
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const todayExpensesList = expenses.filter(
    (e) => new Date(e.date).toDateString() === todayStr
  );
  const todayExpensesTotal = todayExpensesList.reduce(
    (sum, e) => sum + e.amount,
    0
  );
  const todayNetProfit = todayRevenue - todayExpensesTotal;

  // Last 7 days revenue for the bar chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toDateString();
    const dayLabel = d.toLocaleDateString('en-IN', { weekday: 'short' });
    const dateNum = d.getDate();

    const daySales = orders
      .filter((o) => new Date(o.date).toDateString() === dayStr)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      dayLabel,
      dateNum,
      sales: daySales,
      isToday: dayStr === todayStr,
    };
  });

  const maxSale = Math.max(...last7Days.map((d) => d.sales), 500);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    onRecordExpense(category, amount, note);
    setAmount(100);
    setNote('');
    setShowAddExpense(false);
  };

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <IndianRupee size={20} className="text-emerald-400" />
            <span>{langMeta.tabs.money} (नफा-तोटा व खर्च)</span>
          </h2>
          <p className="text-xs text-slate-400">
            दुकान आर्थिक हिशोब व विक्री विश्लेषण
          </p>
        </div>

        <button
          onClick={() => setShowAddExpense(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md shadow-rose-900/30 transition-all active:scale-95"
        >
          <Plus size={14} />
          <span>+ खर्च नोंदवा</span>
        </button>
      </div>

      {/* Top 3 KPI Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        {/* Today's Sales */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[10px] font-mono uppercase text-slate-400 tracking-wider">
            <TrendingUp size={12} className="text-emerald-400" />
            <span>विक्री (Sales)</span>
          </div>
          <div className="text-lg font-black font-mono text-emerald-400 mt-1 tabular-nums">
            ₹{todayRevenue}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {todayOrders.length} ऑर्डर्स
          </div>
        </div>

        {/* Today's Expenses */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[10px] font-mono uppercase text-slate-400 tracking-wider">
            <TrendingDown size={12} className="text-rose-400" />
            <span>खर्च (Expense)</span>
          </div>
          <div className="text-lg font-black font-mono text-rose-400 mt-1 tabular-nums">
            ₹{todayExpensesTotal}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {todayExpensesList.length} नोंदी
          </div>
        </div>

        {/* Today's Net Profit */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[10px] font-mono uppercase text-slate-400 tracking-wider">
            <Wallet size={12} className="text-cyan-400" />
            <span>निव्वळ (Net)</span>
          </div>
          <div
            className={`text-lg font-black font-mono mt-1 tabular-nums ${
              todayNetProfit >= 0 ? 'text-cyan-300' : 'text-rose-400'
            }`}
          >
            ₹{todayNetProfit}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            आजचा शिल्लक
          </div>
        </div>
      </div>

      {/* 7-Day Revenue Bar Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            मागील ७ दिवसांची विक्री (Last 7 Days Sales)
          </span>
          <span className="text-[11px] text-cyan-400 font-mono font-semibold">
            एकूण: ₹{orders.reduce((s, o) => s + o.totalAmount, 0)}
          </span>
        </div>

        {/* Visual Bar Columns */}
        <div className="h-36 pt-4 flex items-end justify-between gap-2 border-b border-slate-800 pb-2">
          {last7Days.map((d, idx) => {
            const heightPercent = Math.max(12, Math.round((d.sales / maxSale) * 100));
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[9px] font-mono font-bold text-slate-400 tabular-nums">
                  {d.sales > 0 ? `₹${d.sales}` : '₹0'}
                </span>
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 ${
                    d.isToday
                      ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
                <span
                  className={`text-[10px] font-mono ${
                    d.isToday ? 'text-cyan-300 font-bold' : 'text-slate-400'
                  }`}
                >
                  {d.dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Business Expenses List */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">
          व्यवसाय खर्च तपशील (Recent Business Expenses)
        </div>

        <div className="space-y-2">
          {expenses.slice(0, 5).map((exp) => (
            <div
              key={exp.id}
              className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white">{exp.category}</div>
                <div className="text-[11px] text-slate-400">{exp.note}</div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {new Date(exp.date).toLocaleDateString('mr-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </div>
              </div>

              <div className="text-sm font-bold font-mono text-rose-400 tabular-nums">
                - ₹{exp.amount}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Record Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateExpense}
            className="bg-slate-900 border border-rose-500/30 rounded-2xl p-5 max-w-xs w-full shadow-2xl space-y-3"
          >
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus size={16} className="text-rose-400" />
              <span>खर्च नोंदवा (Record Shop Expense)</span>
            </h3>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">प्रवर्ग (Category)</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
              >
                <option value="Rent">दुकान भाडे (Rent)</option>
                <option value="Electricity">वीज बिल (Electricity)</option>
                <option value="Transport">वाहतूक / टेम्पो (Transport)</option>
                <option value="Packaging">पॅकिंग पिशव्या (Packaging)</option>
                <option value="Tea & Refreshment">चहा नाश्ता (Tea & Refreshment)</option>
                <option value="Other">इतर (Other)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">रक्कम ₹ (Amount)</label>
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">तपशील / टीप (Note)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="उदा. टेम्पो भाडे"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddExpense(false)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 border border-slate-700"
              >
                रद्द
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500"
              >
                खर्च जोडा
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
