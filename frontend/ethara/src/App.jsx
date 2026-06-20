import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProductManagement from './components/ProductManagement';
import CustomerManagement from './components/CustomerManagement';
import OrderManagement from './components/OrderManagement';
import Notification from './components/Notification';
import { api } from './services/api';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ message: '', type: 'success' });

  // Enforce Light Mode at Document root
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  // Data states
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);

  const triggerAlert = (message, type = 'success') => {
    setAlert({ message, type });
  };

  const handleCloseAlert = () => {
    setAlert({ message: '', type: 'success' });
  };

  // Centralized data loading
  const loadDashboardData = async () => {
    try {
      const summaryData = await api.getDashboardSummary();
      setSummary(summaryData);
    } catch (e) {
      console.error("Dashboard summary failed to load", e);
    }
  };

  const loadProducts = async () => {
    try {
      const prodData = await api.getProducts();
      setProducts(prodData);
    } catch (e) {
      console.error("Products failed to load", e);
    }
  };

  const loadCustomers = async () => {
    try {
      const custData = await api.getCustomers();
      setCustomers(custData);
    } catch (e) {
      console.error("Customers failed to load", e);
    }
  };

  const loadOrders = async () => {
    try {
      const ordData = await api.getOrders();
      setOrders(ordData);
    } catch (e) {
      console.error("Orders failed to load", e);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadDashboardData(),
      loadProducts(),
      loadCustomers(),
      loadOrders()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden font-sans text-slate-800 transition-colors duration-200">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 select-none">
          <div className="text-slate-500 text-xs font-semibold">
            Service Connectivity: <span className="text-emerald-600 font-bold ml-1">Connected</span>
          </div>
          <button 
            onClick={loadAllData} 
            className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-250"
          >
            Sync Database
          </button>
        </header>

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto px-8 py-8 bg-slate-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-semibold mt-4">Syncing inventory details...</p>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto w-full">
              {activeTab === 'dashboard' && (
                <Dashboard 
                  summary={summary} 
                  refreshSummary={loadDashboardData} 
                  onNavigate={setActiveTab} 
                />
              )}
              {activeTab === 'products' && (
                <ProductManagement 
                  products={products} 
                  refreshProducts={async () => { await loadProducts(); await loadDashboardData(); }}
                  triggerAlert={triggerAlert}
                />
              )}
              {activeTab === 'customers' && (
                <CustomerManagement 
                  customers={customers} 
                  refreshCustomers={async () => { await loadCustomers(); await loadDashboardData(); }}
                  triggerAlert={triggerAlert}
                />
              )}
              {activeTab === 'orders' && (
                <OrderManagement 
                  orders={orders} 
                  products={products} 
                  customers={customers}
                  refreshOrders={loadOrders}
                  refreshAll={loadAllData}
                  triggerAlert={triggerAlert}
                />
              )}
            </div>
          )}
        </main>
      </div>

      <Notification 
        message={alert.message} 
        type={alert.type} 
        onClose={handleCloseAlert} 
      />
    </div>
  );
}
