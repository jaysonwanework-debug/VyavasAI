import React, { useState } from 'react';
import { BookOpen, UserCheck, AlertCircle, ArrowDownLeft, Phone, Search } from 'lucide-react';
import { Customer, LanguageCode } from '../types';
import { LANGUAGE_CONFIGS } from '../data/seedData';

interface KhataTabProps {
  customers: Customer[];
  currentLang: LanguageCode;
  onRecordPayment: (customerName: string, amount: number) => void;
}

export const KhataTab: React.FC<KhataTabProps> = ({
  customers,
  currentLang,
  onRecordPayment,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(100);
  const langMeta = LANGUAGE_CONFIGS[currentLang];

  const totalOutstanding = customers.reduce((sum, c) => sum + c.balance, 0);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || paymentAmount <= 0) return;
    onRecordPayment(selectedCustomer.name, paymentAmount);
    setSelectedCustomer(null);
  };

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Title & Total Ledger Balance Banner */}
      <div>
        <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
          <BookOpen size={20} className="text-emerald-400" />
          <span>{langMeta.tabs.khata} (ग्राहक खातेवही)</span>
        </h2>
        <p className="text-xs text-slate-400">
          एकूण उधारी आणि वसुलीचे रेकॉर्ड
        </p>
      </div>

      {/* KPI Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
        <div>
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            एकूण येणे बाकी उधारी (Total Outstanding):
          </div>
          <div className="text-2xl font-black font-mono text-rose-400 mt-0.5 tabular-nums">
            ₹{totalOutstanding}
          </div>
        </div>
        <div className="text-right text-xs text-slate-400 font-mono">
          <div>{customers.length} नोंदणीकृत ग्राहक</div>
          <div className="text-emerald-400 font-semibold">
            {customers.filter((c) => c.balance === 0).length} पूर्ण भरलेले
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ग्राहक शोधा (Search Ramesh, Suresh...)"
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      {/* Customer Ledger Cards */}
      <div className="space-y-2.5">
        {filtered.map((customer) => {
          const hasDebt = customer.balance > 0;
          return (
            <div
              key={customer.id}
              className={`bg-slate-900/90 border rounded-2xl p-3.5 flex items-center justify-between transition-all ${
                hasDebt
                  ? 'border-slate-800 hover:border-rose-500/30'
                  : 'border-slate-800/80 hover:border-emerald-500/30 opacity-90'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">
                    {customer.name}
                  </span>
                  {hasDebt ? (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      उधारी बाकी
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      क्लिअर (₹0)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  {customer.phone && <span>{customer.phone}</span>}
                  {customer.lastTransactionDate && (
                    <span>
                      · शेवटची नोंद:{' '}
                      {new Date(customer.lastTransactionDate).toLocaleDateString('mr-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  )}
                </div>
              </div>

              {/* Balance & Action */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div
                    className={`text-lg font-black font-mono tabular-nums ${
                      hasDebt ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    ₹{customer.balance}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {hasDebt ? 'बाकी रक्कम' : 'सर्व भरले'}
                  </div>
                </div>

                {hasDebt && (
                  <button
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setPaymentAmount(customer.balance);
                    }}
                    title="रक्कम जमा करा"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-colors"
                  >
                    <ArrowDownLeft size={13} />
                    <span>जमा</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Record Payment Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handlePaymentSubmit}
            className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 max-w-xs w-full shadow-2xl space-y-4"
          >
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ArrowDownLeft size={16} className="text-emerald-400" />
              <span>रक्कम जमा नोंदवा ({selectedCustomer.name})</span>
            </h3>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
              सध्याची एकूण उधारी बाकी:{' '}
              <strong className="text-rose-400 font-mono">₹{selectedCustomer.balance}</strong>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                ग्राहकाने दिलेली रक्कम (₹):
              </label>
              <input
                type="number"
                min="1"
                max={selectedCustomer.balance}
                required
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 border border-slate-700"
              >
                रद्द
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500"
              >
                जमा करा (Pay)
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
