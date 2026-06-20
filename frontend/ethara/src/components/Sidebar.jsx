import React from 'react';
import { LayoutDashboard, Package, Users, ShoppingCart } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 text-slate-800 flex flex-col h-full select-none transition-colors duration-200">
      <div className="p-6 border-b border-slate-200 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
          IMS
        </div>
        <div>
          <h1 className="font-bold text-md leading-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Ethara AI
          </h1>
          <p className="text-[10px] text-slate-450 uppercase tracking-wider font-semibold">Inventory System</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 border ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-inner'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700">
            ES
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700">Ethara Staff</p>
            <p className="text-[10px] text-slate-400">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}
