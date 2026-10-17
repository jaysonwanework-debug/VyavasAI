import React from 'react';
import { ShoppingCart, CheckCircle2, Calendar, User, ArrowUpRight } from 'lucide-react';
import { Order, LanguageCode } from '../types';
import { LANGUAGE_CONFIGS } from '../data/seedData';

interface OrdersTabProps {
  orders: Order[];
  currentLang: LanguageCode;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({ orders, currentLang }) => {
  const langMeta = LANGUAGE_CONFIGS[currentLang];

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <ShoppingCart size={20} className="text-amber-400" />
            <span>{langMeta.tabs.orders}</span>
          </h2>
          <p className="text-xs text-slate-400">
            एकूण {orders.length} ऑर्डर्स नोंदवल्या आहेत (Total {orders.length} orders)
          </p>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
          <ShoppingCart size={32} className="mx-auto mb-2 text-slate-600" />
          <p className="text-sm font-semibold">अद्याप कोणतीही ऑर्डर नाही</p>
          <p className="text-xs text-slate-500 mt-1">
            माईक दाबून बोला: "रमेश ने ५ किलो साखर मागितली"
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const formattedDate = new Date(order.date).toLocaleDateString('mr-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={order.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-4 shadow-sm transition-all"
              >
                {/* Header: Customer + Total Amount */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <User size={14} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {order.customerName}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span>{order.id}</span>
                        <span>·</span>
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-black font-mono text-amber-400 tabular-nums">
                      ₹{order.totalAmount}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.2 rounded-full border border-emerald-500/30">
                      <CheckCircle2 size={10} /> पूर्ण झाले
                    </span>
                  </div>
                </div>

                {/* Items Breakdown */}
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
                    सामान तपशील (Itemized Breakdown):
                  </div>
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1 px-2.5 bg-slate-950/50 rounded-lg border border-slate-800/80 font-mono"
                    >
                      <span className="text-slate-300">
                        {item.name} × {item.qty} {item.unit}
                      </span>
                      <span className="text-slate-400">
                        @{item.unitPrice} = <strong className="text-white">₹{item.total}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
