import React, { useState } from 'react';
import { Package, AlertTriangle, Plus, Search, Check, RefreshCw } from 'lucide-react';
import { InventoryItem, LanguageCode } from '../types';
import { LANGUAGE_CONFIGS } from '../data/seedData';

interface StockTabProps {
  inventory: InventoryItem[];
  currentLang: LanguageCode;
  onUpdateStock: (itemId: string, delta: number, reason: string) => void;
  onAddItem: (name: string, unit: string, price: number, qty: number) => void;
}

export const StockTab: React.FC<StockTabProps> = ({
  inventory,
  currentLang,
  onUpdateStock,
  onAddItem,
}) => {
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [stockDelta, setStockDelta] = useState<number>(5);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('kg');
  const [newItemPrice, setNewItemPrice] = useState<number>(50);
  const [newItemQty, setNewItemQty] = useState<number>(20);

  const langMeta = LANGUAGE_CONFIGS[currentLang];

  const filtered = inventory.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.vernacularNames.mr.toLowerCase().includes(q) ||
      item.vernacularNames.ta.toLowerCase().includes(q) ||
      item.vernacularNames.hi.toLowerCase().includes(q)
    );
  });

  const getVernacularItemName = (item: InventoryItem) => {
    if (currentLang === 'ta-IN') return item.vernacularNames.ta;
    if (currentLang === 'hi-IN') return item.vernacularNames.hi;
    if (currentLang === 'en-US') return item.vernacularNames.en;
    return item.vernacularNames.mr;
  };

  const handleQuickRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    onUpdateStock(selectedItem.name, stockDelta, 'manual restock');
    setSelectedItem(null);
  };

  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    onAddItem(newItemName.trim(), newItemUnit, newItemPrice, newItemQty);
    setNewItemName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Title & Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <Package size={20} className="text-cyan-400" />
            <span>{langMeta.tabs.stock}</span>
          </h2>
          <p className="text-xs text-slate-400">
            एकूण {inventory.length} वस्तू नोंदणीकृत (Total {inventory.length} items)
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-900/30 transition-all active:scale-95"
        >
          <Plus size={14} />
          <span>+ नवीन माल</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="वस्तू शोधा (Search sugar, rice, tel...)"
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      {/* Low Stock Warning Banner if applicable */}
      {inventory.some((i) => i.qty <= i.lowStockThreshold) && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 flex items-center gap-2.5 shadow-sm">
          <AlertTriangle size={18} className="text-amber-400 shrink-0" />
          <div className="text-xs text-amber-200">
            <span className="font-bold">सावधान: </span>
            {inventory
              .filter((i) => i.qty <= i.lowStockThreshold)
              .map((i) => getVernacularItemName(i))
              .join(', ')}{' '}
            चा साठा कमी आहे. नवीन ऑर्डर नोंदवा.
          </div>
        </div>
      )}

      {/* Inventory Items List */}
      <div className="grid grid-cols-1 gap-2.5">
        {filtered.map((item) => {
          const isLow = item.qty <= item.lowStockThreshold;
          return (
            <div
              key={item.id}
              className={`bg-slate-900/90 border rounded-2xl p-3.5 flex items-center justify-between transition-all ${
                isLow
                  ? 'border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
                  : 'border-slate-800 hover:border-cyan-500/30 shadow-sm'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">
                    {getVernacularItemName(item)}
                  </span>
                  {isLow && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse flex items-center gap-1">
                      <AlertTriangle size={10} />
                      {langMeta.lowStockBadge}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <span>दर: ₹{item.price} / {item.unit}</span>
                  <span>·</span>
                  <span className="capitalize">{item.category}</span>
                </div>
              </div>

              {/* Quantity & Restock button */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div
                    className={`text-lg font-black font-mono tabular-nums ${
                      isLow ? 'text-rose-400' : 'text-cyan-300'
                    }`}
                  >
                    {item.qty} {item.unit}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                    {langMeta.available}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedItem(item)}
                  title="Update Stock"
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-cyan-900/50 text-slate-300 hover:text-cyan-200 border border-slate-700 hover:border-cyan-500/40 flex items-center justify-center transition-colors"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Restock Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleQuickRestock}
            className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-5 max-w-xs w-full shadow-2xl space-y-4"
          >
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <RefreshCw size={16} className="text-cyan-400" />
              <span>स्टॉक अपडेट करा ({selectedItem.vernacularNames.mr})</span>
            </h3>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                वाढवायचा किंवा कमी करायचा साठा ({selectedItem.unit}):
              </label>
              <div className="flex items-center gap-2">
                {[-5, -1, 1, 5, 10, 20].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setStockDelta(v)}
                    className={`flex-1 py-1 text-xs font-mono font-bold rounded-lg border transition-colors ${
                      stockDelta === v
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {v > 0 ? `+${v}` : v}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 border border-slate-700"
              >
                रद्द (Cancel)
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 hover:bg-cyan-500"
              >
                अपडेट करा
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add New Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNewItem}
            className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-5 max-w-xs w-full shadow-2xl space-y-3"
          >
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus size={16} className="text-cyan-400" />
              <span>नवीन वस्तू जोडा (Add New Product)</span>
            </h3>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">वस्तूचे नाव (Item Name)</label>
              <input
                type="text"
                required
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="उदा. पोहे / Poha"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">एकक (Unit)</label>
                <select
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                >
                  <option value="kg">kg (किलो)</option>
                  <option value="L">L (लिटर)</option>
                  <option value="packet">packet (पाकीट)</option>
                  <option value="piece">piece (नग)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">दर ₹ (Price)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">प्रारंभिक साठा (Initial Qty)</label>
              <input
                type="number"
                min="0"
                required
                value={newItemQty}
                onChange={(e) => setNewItemQty(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 border border-slate-700"
              >
                रद्द
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 hover:bg-cyan-500"
              >
                जतन करा
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
