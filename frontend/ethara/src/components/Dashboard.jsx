import React, { useState } from 'react';
import { Package, Users, ShoppingCart, AlertTriangle, ArrowRight, Plus } from 'lucide-react';
import { api } from '../services/api';

export default function Dashboard({ summary, refreshSummary, onNavigate }) {
  const [restockProduct, setRestockProduct] = useState(null);
  const [restockAmount, setRestockAmount] = useState(50);
  const [loading, setLoading] = useState(false);

  const {
    total_products = 0,
    total_customers = 0,
    total_orders = 0,
    low_stock_count = 0,
    low_stock_products = []
  } = summary || {};

  // Calculate inventory health percentage
  const healthyProductsCount = total_products - low_stock_count;
  const healthPercentage = total_products > 0 
    ? Math.round((healthyProductsCount / total_products) * 100) 
    : 100;

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockProduct) return;
    setLoading(true);
    try {
      const newStock = restockProduct.stock + parseInt(restockAmount);
      await api.updateProduct(restockProduct.id, { stock: newStock });
      setRestockProduct(null);
      setRestockAmount(50);
      refreshSummary();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const kpis = [
    {
      title: 'Total Products',
      value: total_products,
      icon: Package,
      gradient: 'from-indigo-600 to-indigo-400',
      shadow: 'shadow-indigo-500/10',
      actionLabel: 'Manage catalog',
      actionTab: 'products'
    },
    {
      title: 'Total Customers',
      value: total_customers,
      icon: Users,
      gradient: 'from-purple-600 to-purple-400',
      shadow: 'shadow-purple-500/10',
      actionLabel: 'View directory',
      actionTab: 'customers'
    },
    {
      title: 'Total Orders',
      value: total_orders,
      icon: ShoppingCart,
      gradient: 'from-emerald-600 to-emerald-400',
      shadow: 'shadow-emerald-500/10',
      actionLabel: 'View orders',
      actionTab: 'orders'
    },
    {
      title: 'Low Stock Alert',
      value: low_stock_count,
      icon: AlertTriangle,
      gradient: low_stock_count > 0 ? 'from-rose-600 to-rose-400' : 'from-slate-650 to-slate-450',
      shadow: low_stock_count > 0 ? 'shadow-rose-500/15' : 'shadow-slate-500/5',
      actionLabel: low_stock_count > 0 ? 'Urgent attention' : 'All healthy',
      actionTab: 'products',
      alert: low_stock_count > 0
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Overview Dashboard</h2>
        <p className="text-slate-500 text-sm mt-1">Real-time statistics and inventory status indicators.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={idx}
              className={`bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-350 transition-all duration-300 shadow-md ${kpi.shadow}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-450 text-xs font-bold uppercase tracking-wider">{kpi.title}</p>
                  <h3 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">{kpi.value}</h3>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.gradient} text-white shadow-md`}>
                  <Icon className={`w-6 h-6 ${kpi.alert ? 'animate-pulse' : ''}`} />
                </div>
              </div>
              
              <button 
                onClick={() => onNavigate(kpi.actionTab)}
                className="mt-6 flex items-center justify-between text-xs font-semibold text-indigo-600 hover:text-indigo-700 group transition-colors self-start"
              >
                <span>{kpi.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform ml-1" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Analytics & Warning Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Health Ring Chart */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-1">Stock Health Gauge</h4>
            <p className="text-xs text-slate-500">Percentage of catalog items currently in healthy stock.</p>
          </div>

          <div className="flex justify-center items-center py-6 relative">
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="60"
                strokeWidth="10"
                className="stroke-slate-100 fill-none"
              />
              <circle
                cx="72"
                cy="72"
                r="60"
                strokeWidth="10"
                stroke={healthPercentage > 75 ? '#10b981' : healthPercentage > 40 ? '#f59e0b' : '#f43f5e'}
                fill="transparent"
                strokeDasharray="377"
                strokeDashoffset={377 - (377 * healthPercentage) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-slate-900">{healthPercentage}%</span>
              <span className="text-[10px] text-slate-455 uppercase tracking-widest mt-1 font-bold">Healthy</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 text-center border border-slate-150">
            <p className="text-xs text-slate-600 font-medium">
              {low_stock_count > 0 
                ? `Need to restock ${low_stock_count} item(s) immediately.` 
                : 'Inventory is completely healthy! Good job.'}
            </p>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Low Stock Products</h4>
              <p className="text-xs text-slate-500">Items with stock level below 10 units.</p>
            </div>
            {low_stock_count > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-[10px] font-semibold text-rose-600 uppercase tracking-wider animate-pulse">
                Action Required
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto max-h-56 pr-1 space-y-3">
            {low_stock_products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
                <Package className="w-8 h-8 opacity-45 mb-2" />
                <p className="text-sm font-semibold">No low stock items found.</p>
              </div>
            ) : (
              low_stock_products.map((product) => (
                <div 
                  key={product.id}
                  className="bg-slate-50 border border-slate-150 hover:border-slate-250 rounded-xl p-3 flex items-center justify-between transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-extrabold text-slate-500 text-xs shrink-0 shadow-sm">
                      {product.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{product.name}</p>
                      <p className="text-[10px] text-slate-450 font-mono">SKU: {product.sku}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs font-bold text-rose-600">{product.stock} units left</p>
                      <p className="text-[10px] text-slate-500">${product.price.toFixed(2)} / unit</p>
                    </div>
                    <button
                      onClick={() => setRestockProduct(product)}
                      className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-200 hover:border-indigo-600 transition-all shadow-sm"
                      title="Quick Restock"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Restock Modal */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex justify-center items-start py-8 sm:py-16">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-zoom-in text-slate-800 mx-4">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Restock Product</h3>
            <p className="text-slate-600 text-xs mt-1">
              Add inventory for <strong>{restockProduct.name}</strong> (Current stock: {restockProduct.stock}).
            </p>

            <form onSubmit={handleRestockSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-slate-500 text-xs font-semibold mb-1.5">Restock Amount</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 rounded-xl px-3 py-2 text-sm outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setRestockProduct(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 shadow-md"
                >
                  {loading ? 'Restocking...' : 'Add Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
