import React from 'react';
import { Mic, Package, ShoppingCart, BookOpen, IndianRupee } from 'lucide-react';
import { LanguageCode } from '../types';
import { LANGUAGE_CONFIGS } from '../data/seedData';

export type TabType = 'home' | 'stock' | 'orders' | 'khata' | 'money';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  currentLang: LanguageCode;
  orderCount?: number;
  lowStockCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  currentLang,
  orderCount = 0,
  lowStockCount = 0,
}) => {
  const langMeta = LANGUAGE_CONFIGS[currentLang];

  const navItems = [
    {
      id: 'home' as TabType,
      label: langMeta.tabs.home,
      icon: Mic,
    },
    {
      id: 'stock' as TabType,
      label: langMeta.tabs.stock,
      icon: Package,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-rose-500',
    },
    {
      id: 'orders' as TabType,
      label: langMeta.tabs.orders,
      icon: ShoppingCart,
      badge: orderCount > 0 ? orderCount : undefined,
      badgeColor: 'bg-amber-500',
    },
    {
      id: 'khata' as TabType,
      label: langMeta.tabs.khata,
      icon: BookOpen,
    },
    {
      id: 'money' as TabType,
      label: langMeta.tabs.money,
      icon: IndianRupee,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#030712]/95 backdrop-blur-xl border-t border-cyan-500/20 px-2 py-1 max-w-md mx-auto sm:max-w-xl">
      <div className="grid grid-cols-5 items-center">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative min-h-[50px] py-1.5 flex flex-col items-center justify-center transition-all ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  size={20}
                  className={`transition-transform duration-200 ${
                    isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]' : ''
                  }`}
                />
                {item.badge !== undefined && (
                  <span
                    className={`absolute -top-1.5 -right-2.5 min-w-[15px] h-[15px] text-[9px] font-mono font-bold text-white ${item.badgeColor} rounded-full flex items-center justify-center px-0.5`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              <span className="text-[10px] tracking-tight mt-1 truncate max-w-[64px]">
                {item.label}
              </span>

              {isActive && (
                <span className="absolute bottom-0.5 w-5 h-0.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
