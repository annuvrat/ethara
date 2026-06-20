import React, { useState } from 'react';
import { Plus, Search, Edit3, Trash2, X, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function ProductManagement({ products, refreshProducts, triggerAlert }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: 0,
    stock: 0
  });

  const resetForm = () => {
    setFormData({ name: '', sku: '', price: 0, stock: 0 });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleOpenEdit = (product) => {
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price,
      stock: product.stock
    });
    setEditingProduct(product);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : name === 'stock' ? parseInt(value) || 0 : value
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim()) {
      triggerAlert('Please fill in name and SKU code.', 'error');
      return;
    }
    if (formData.price < 0 || formData.stock < 0) {
      triggerAlert('Price and Stock quantity cannot be negative.', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.createProduct(formData);
      triggerAlert('Product added successfully!', 'success');
      setIsAddOpen(false);
      refreshProducts();
    } catch (err) {
      triggerAlert(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim()) {
      triggerAlert('Please fill in name and SKU code.', 'error');
      return;
    }
    if (formData.price < 0 || formData.stock < 0) {
      triggerAlert('Price and Stock quantity cannot be negative.', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.updateProduct(editingProduct.id, formData);
      triggerAlert('Product updated successfully!', 'success');
      setEditingProduct(null);
      refreshProducts();
    } catch (err) {
      triggerAlert(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) return;
    try {
      await api.deleteProduct(id);
      triggerAlert('Product deleted successfully!', 'success');
      refreshProducts();
    } catch (err) {
      triggerAlert(err.message, 'error');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Product Inventory</h2>
          <p className="text-slate-500 text-sm mt-1">Manage catalog details, pricing, SKUs, and stock quantities.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4.5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Control bar */}
      <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-2.5 max-w-md shadow-sm">
        <Search className="w-4.5 h-4.5 text-slate-400 shrink-0 mr-3" />
        <input
          type="text"
          placeholder="Search by product name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-sm outline-none"
        />
      </div>

      {/* Table grid */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">SKU / Code</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Price</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Level</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto opacity-45 mb-2" />
                    <p className="text-sm font-semibold">No products found matching search filter.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0 shadow-sm">
                          {product.name[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-slate-800">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 text-sm font-mono text-slate-500">{product.sku}</td>
                    <td className="px-6 py-4.5 text-sm font-bold text-slate-700">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        product.stock === 0 
                          ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' 
                          : product.stock <= 10 
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' 
                          : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          product.stock === 0 ? 'bg-rose-500' : product.stock <= 10 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                        {product.stock} left
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-right space-x-2 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-550 hover:text-indigo-600 border border-slate-200 transition-colors inline-flex shadow-sm"
                        title="Edit Details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-555 hover:text-rose-600 border border-slate-200 transition-colors inline-flex shadow-sm"
                        title="Delete Product"
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

      {/* Add Product Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex justify-center items-start py-8 sm:py-16">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-zoom-in text-slate-800 mx-4">
            <div className="flex items-center justify-between border-b border-slate-150 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add New Product</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-500 text-xs font-bold mb-1.5">Product Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  placeholder="e.g. Wireless Mouse"
                />
              </div>

              <div>
                <label className="block text-slate-500 text-xs font-bold mb-1.5">SKU / Code</label>
                <input
                  type="text"
                  name="sku"
                  required
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  placeholder="e.g. MOUSE-WRLS-01"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 text-xs font-bold mb-1.5">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    required
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-xs font-bold mb-1.5">Initial Stock</label>
                  <input
                    type="number"
                    name="stock"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-150 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4.5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-md"
                >
                  {loading ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex justify-center items-start py-8 sm:py-16">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-zoom-in text-slate-800 mx-4">
            <div className="flex items-center justify-between border-b border-slate-150 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Edit Product Details</h3>
              <button onClick={() => setEditingProduct(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-500 text-xs font-bold mb-1.5">Product Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-555 text-xs font-bold mb-1.5">SKU / Code</label>
                <input
                  type="text"
                  name="sku"
                  required
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-555 text-xs font-bold mb-1.5">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    required
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-555 text-xs font-bold mb-1.5">Quantity In Stock</label>
                  <input
                    type="number"
                    name="stock"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-150 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-250 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4.5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-md"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
