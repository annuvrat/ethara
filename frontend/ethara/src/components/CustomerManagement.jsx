import React, { useState } from 'react';
import { Plus, Search, Trash2, X, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function CustomerManagement({ customers, refreshCustomers, triggerAlert }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '' });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      triggerAlert('Please enter full name and email.', 'error');
      return;
    }

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      triggerAlert('Please enter a valid email address.', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.createCustomer(formData);
      triggerAlert('Customer registered successfully!', 'success');
      setIsAddOpen(false);
      refreshCustomers();
    } catch (err) {
      triggerAlert(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete customer "${name}"? This will delete all their orders.`)) return;
    try {
      await api.deleteCustomer(id);
      triggerAlert('Customer deleted successfully!', 'success');
      refreshCustomers();
    } catch (err) {
      triggerAlert(err.message, 'error');
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Customer Directory</h2>
          <p className="text-slate-500 text-sm mt-1">Manage client accounts, contact details, and view purchase histories.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4.5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Control bar */}
      <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-2.5 max-w-md shadow-sm">
        <Search className="w-4.5 h-4.5 text-slate-400 shrink-0 mr-3" />
        <input
          type="text"
          placeholder="Search by customer name or email..."
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
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto opacity-45 mb-2" />
                    <p className="text-sm font-semibold">No customers registered yet.</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-extrabold text-indigo-600 text-xs shrink-0 shadow-sm">
                          {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-slate-800">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 text-sm text-slate-705">{customer.email}</td>
                    <td className="px-6 py-4.5 text-sm text-slate-500 font-mono">
                      {customer.phone || <span className="text-slate-400 italic">Not provided</span>}
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <button
                        onClick={() => handleDelete(customer.id, customer.name)}
                        className="p-2 rounded-lg bg-slate-55 hover:bg-slate-100 text-slate-500 hover:text-rose-600 border border-slate-200 transition-colors inline-flex shadow-sm"
                        title="Delete Customer"
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

      {/* Add Customer Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex justify-center items-start py-8 sm:py-16">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-zoom-in text-slate-800 mx-4">
            <div className="flex items-center justify-between border-b border-slate-150 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Register New Customer</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-500 text-xs font-bold mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  placeholder="e.g. Jane Smith"
                />
              </div>

              <div>
                <label className="block text-slate-500 text-xs font-bold mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  placeholder="e.g. jane.smith@example.com"
                />
              </div>

              <div>
                <label className="block text-slate-500 text-xs font-bold mb-1.5">Phone Number (Optional)</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  placeholder="e.g. +1 555-0199"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-150 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-655 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4.5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-md"
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
