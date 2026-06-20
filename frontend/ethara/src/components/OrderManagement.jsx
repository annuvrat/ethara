import React, { useState } from 'react';
import { Plus, Trash2, Eye, X, AlertTriangle, User, Calendar, ShoppingCart } from 'lucide-react';
import { api } from '../services/api';

export default function OrderManagement({ orders, products, customers, refreshOrders, refreshAll, triggerAlert }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  // New Order State
  const [orderCustomer, setOrderCustomer] = useState('');
  const [orderItems, setOrderItems] = useState([
    { product_id: '', quantity: 1 }
  ]);

  const handleOpenAdd = () => {
    if (customers.length === 0) {
      triggerAlert('Please register a customer first before creating an order.', 'error');
      return;
    }
    if (products.length === 0) {
      triggerAlert('No products available in the catalog.', 'error');
      return;
    }
    setOrderCustomer('');
    setOrderItems([{ product_id: '', quantity: 1 }]);
    setIsAddOpen(true);
  };

  const handleAddItemRow = () => {
    setOrderItems(prev => [...prev, { product_id: '', quantity: 1 }]);
  };

  const handleRemoveItemRow = (idx) => {
    setOrderItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx, field, value) => {
    setOrderItems(prev => {
      const newItems = [...prev];
      if (field === 'quantity') {
        newItems[idx][field] = parseInt(value) || 1;
      } else {
        newItems[idx][field] = value;
      }
      return newItems;
    });
  };

  // Helper to find selected product stock/price
  const getProductDetails = (productId) => {
    return products.find(p => p.id === productId) || null;
  };

  // Calculate order total reactively
  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => {
      const prod = getProductDetails(item.product_id);
      if (!prod) return sum;
      return sum + (prod.price * item.quantity);
    }, 0);
  };

  // Validation: Check stock levels for all rows
  const validateOrder = () => {
    if (!orderCustomer) return { valid: false, message: 'Please select a customer.' };
    if (orderItems.length === 0) return { valid: false, message: 'Please add at least one item.' };
    
    // Check if any product is unselected
    const hasEmptyProduct = orderItems.some(item => !item.product_id);
    if (hasEmptyProduct) return { valid: false, message: 'Please select a product for all rows.' };

    // Group quantities to check total requested vs available
    const requestedQuantities = {};
    for (const item of orderItems) {
      requestedQuantities[item.product_id] = (requestedQuantities[item.product_id] || 0) + item.quantity;
    }

    for (const [prodId, qty] of Object.entries(requestedQuantities)) {
      const prod = getProductDetails(prodId);
      if (!prod) continue;
      if (prod.stock < qty) {
        return { 
          valid: false, 
          message: `Insufficient stock for "${prod.name}". Available: ${prod.stock}, Requested: ${qty}` 
        };
      }
    }

    return { valid: true };
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    const validation = validateOrder();
    if (!validation.valid) {
      triggerAlert(validation.message, 'error');
      return;
    }

    setLoading(true);
    try {
      await api.createOrder({
        customer_id: orderCustomer,
        items: orderItems
      });
      triggerAlert('Order placed successfully!', 'success');
      setIsAddOpen(false);
      refreshAll(); // Refresh orders, products (for stock), and dashboard
    } catch (err) {
      triggerAlert(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (id) => {
    if (!window.confirm('Are you sure you want to cancel/delete this order? Product stocks will be restored.')) return;
    try {
      await api.deleteOrder(id);
      triggerAlert('Order cancelled and stocks restored.', 'success');
      refreshAll();
    } catch (err) {
      triggerAlert(err.message, 'error');
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Find Customer Name for Display
  const getCustomerName = (custId) => {
    const cust = customers.find(c => c.id === custId);
    return cust ? cust.name : 'Unknown Customer';
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Order Management</h2>
          <p className="text-slate-500 text-sm mt-1">Submit new orders, view invoice details, and handle order cancellations.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4.5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Order
        </button>
      </div>

      {/* Table grid */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <ShoppingCart className="w-8 h-8 mx-auto opacity-45 mb-2" />
                    <p className="text-sm font-semibold">No orders recorded in system.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-55 transition-colors">
                    <td className="px-6 py-4.5 text-sm font-mono text-slate-500">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4.5">
                      <span className="text-sm font-bold text-slate-800">{getCustomerName(order.customer_id)}</span>
                    </td>
                    <td className="px-6 py-4.5 text-sm text-slate-600">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4.5 text-sm font-bold text-indigo-650">${order.total_amount.toFixed(2)}</td>
                    <td className="px-6 py-4.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-555 hover:text-indigo-600 border border-slate-200 transition-colors inline-flex shadow-sm"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-555 hover:text-rose-600 border border-slate-200 transition-colors inline-flex shadow-sm"
                        title="Cancel Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Order Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl p-6 animate-zoom-in max-h-[90vh] flex flex-col text-slate-800 mx-4">
            <div className="flex items-center justify-between border-b border-slate-150 pb-4 mb-4 shrink-0">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Create New Purchase Order</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitOrder} className="flex-1 flex flex-col overflow-hidden space-y-5">
              {/* Customer Selector */}
              <div className="shrink-0">
                <label className="block text-slate-500 text-xs font-bold mb-2">Select Customer</label>
                <select
                  required
                  value={orderCustomer}
                  onChange={(e) => setOrderCustomer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none"
                >
                  <option value="" className="text-slate-500 bg-white">-- Select Customer Account --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id} className="bg-white text-slate-800">{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              {/* Order Items List */}
              <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                <div className="flex items-center justify-between shrink-0 mb-2">
                  <label className="block text-slate-500 text-xs font-bold">Order Items</label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs font-bold text-indigo-650 hover:text-indigo-700"
                  >
                    + Add Another Product
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-0">
                  {orderItems.map((item, idx) => {
                    const selectedProd = getProductDetails(item.product_id);
                    const isOutOfStock = selectedProd && selectedProd.stock < item.quantity;
                    return (
                      <div key={idx} className="bg-slate-50 border border-slate-150 p-4.5 rounded-xl space-y-3">
                        {/* Grid aligning selects and input fields */}
                        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                          {/* Product Dropdown */}
                          <div className="flex-1">
                            <select
                              required
                              value={item.product_id}
                              onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
                              className="h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-full"
                            >
                              <option value="" className="bg-white text-slate-500">-- Choose Catalog Product --</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id} disabled={p.stock === 0} className="bg-white text-slate-800">
                                  {p.name} (SKU: {p.sku}) — ${p.price.toFixed(2)} [Stock: {p.stock}]
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Quantity Input & Delete Button Box */}
                          <div className="flex items-center gap-3 shrink-0">
                            <input
                              type="number"
                              min="1"
                              required
                              value={item.quantity}
                              onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                              className="h-10 w-24 px-3 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-center"
                              placeholder="Qty"
                            />

                            {/* Delete Row button */}
                            {orderItems.length > 1 ? (
                              <button
                                type="button"
                                onClick={() => handleRemoveItemRow(idx)}
                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-rose-600 border border-slate-200 transition-colors shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              /* Spacer to keep alignment when delete is disabled */
                              <div className="w-10 h-10 shrink-0" />
                            )}
                          </div>
                        </div>

                        {/* Stock availability & calculations */}
                        {selectedProd && (
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span>
                              {isOutOfStock ? (
                                <span className="text-rose-600 inline-flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 shrink-0" /> Invalid Stock (Available: {selectedProd.stock})
                                </span>
                              ) : (
                                <span className="text-emerald-600">In stock: {selectedProd.stock}</span>
                              )}
                            </span>
                            <span className="text-slate-500 font-mono">
                              Subtotal: ${(selectedProd.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Sum */}
              <div className="border-t border-slate-150 pt-4 flex justify-between items-center shrink-0">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Purchase Value</span>
                <span className="text-2xl font-extrabold text-indigo-650 font-mono">${calculateTotal().toFixed(2)}</span>
              </div>

              <div className="flex gap-3 justify-end pt-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4.5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                  {loading ? 'Creating...' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex justify-center items-start py-8 sm:py-16">
          <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl shadow-2xl p-6 animate-zoom-in text-slate-800 mx-4">
            <div className="flex items-center justify-between border-b border-slate-150 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Invoice details</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-4.5 grid grid-cols-2 gap-4 shadow-sm">
                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-slate-450 uppercase font-bold">Customer Account</p>
                    <p className="text-xs font-bold text-slate-800">{getCustomerName(selectedOrder.customer_id)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-slate-455 uppercase font-bold">Order Placed At</p>
                    <p className="text-xs font-bold text-slate-700">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-455 uppercase tracking-wider mb-2">Purchased Products</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/20 shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200">
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Item / SKU</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Price</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs">
                      {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-100">
                          <td className="px-4 py-3.5">
                            <p className="font-bold text-slate-850">{item.product ? item.product.name : 'Deleted Product'}</p>
                            <p className="text-[9px] text-slate-450 font-mono">{item.product ? item.product.sku : ''}</p>
                          </td>
                          <td className="px-4 py-3.5 text-slate-700">${item.price_at_order.toFixed(2)}</td>
                          <td className="px-4 py-3.5 text-slate-600 font-semibold">{item.quantity} units</td>
                          <td className="px-4 py-3.5 text-right font-bold font-mono text-slate-800">
                            ${(item.price_at_order * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Invoice Summary */}
              <div className="flex items-center justify-between border-t border-slate-150 pt-4.5 mt-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Grand Total Amount</span>
                <span className="text-xl font-extrabold text-indigo-650 font-mono">${selectedOrder.total_amount.toFixed(2)}</span>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
