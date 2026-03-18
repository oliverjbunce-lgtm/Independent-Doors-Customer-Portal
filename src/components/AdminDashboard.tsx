import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DoorOpen, Lock, ArrowLeft, LogOut, Users, Calendar, Package } from 'lucide-react';
import { OrderPreview } from './OrderPreview';
import { OrderData } from '../types';

interface AdminOrder {
  id: string;
  data: OrderData;
  createdAt: string;
  userName: string;
  userEmail: string;
}

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'iddoors-admin';

export const AdminDashboard: React.FC = () => {
  const [authed, setAuthed] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthed(true);
      setError('');
    } else {
      setError('Incorrect password.');
      setPasswordInput('');
    }
  };

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    fetch('/api/admin/orders', {
      headers: { 'x-admin-password': ADMIN_PASSWORD },
    })
      .then(r => r.json())
      .then(data => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setOrders([]);
        setLoading(false);
      });
  }, [authed]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-apple-bg flex items-center justify-center font-sans px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="apple-card p-10 space-y-8">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-apple-blue p-4 rounded-[18px] shadow-lg shadow-apple-blue/20">
                <Lock className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold tracking-tight text-black">Admin Access</h1>
                <p className="text-sm text-apple-gray font-medium mt-1">Independent Doors Portal</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                className="apple-input"
                placeholder="Admin password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-500 font-medium text-center">{error}</p>
              )}
              <button type="submit" className="apple-button-primary w-full flex items-center justify-center gap-3">
                Unlock Dashboard
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-apple-bg font-sans">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-apple-blue p-2 rounded-[10px] shadow-sm">
              <DoorOpen className="text-white w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-black">Independent Doors</h1>
              <p className="text-[10px] text-apple-gray font-semibold uppercase tracking-wider">Admin Dashboard</p>
            </div>
          </div>
          <button
            onClick={() => setAuthed(false)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-all active:scale-95"
          >
            <LogOut className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          {selectedOrder ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="apple-button-secondary flex items-center gap-2 !px-6 !py-3"
                >
                  <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
                  Back to Orders
                </button>
                <div>
                  <h2 className="text-xl font-bold text-black tracking-tight">{selectedOrder.data.jobName || 'Untitled Job'}</h2>
                  <p className="text-sm text-apple-gray font-medium">
                    Submitted by {selectedOrder.userName} · {new Date(selectedOrder.createdAt).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="apple-card p-10 sm:p-16">
                <OrderPreview order={selectedOrder.data} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="apple-card p-6 flex items-center gap-4">
                  <div className="bg-apple-blue/10 p-3 rounded-[14px]">
                    <Package className="w-6 h-6 text-apple-blue" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-apple-gray uppercase tracking-tight">Total Orders</p>
                    <p className="text-2xl font-bold text-black">{orders.length}</p>
                  </div>
                </div>
                <div className="apple-card p-6 flex items-center gap-4">
                  <div className="bg-emerald-500/10 p-3 rounded-[14px]">
                    <Users className="w-6 h-6 text-emerald-600" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-apple-gray uppercase tracking-tight">Total Doors</p>
                    <p className="text-2xl font-bold text-black">
                      {orders.reduce((sum, o) => sum + (o.data.doors?.length || 0), 0)}
                    </p>
                  </div>
                </div>
                <div className="apple-card p-6 flex items-center gap-4">
                  <div className="bg-orange-500/10 p-3 rounded-[14px]">
                    <Calendar className="w-6 h-6 text-orange-500" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-apple-gray uppercase tracking-tight">This Week</p>
                    <p className="text-2xl font-bold text-black">
                      {orders.filter(o => {
                        const d = new Date(o.createdAt);
                        const now = new Date();
                        const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
                        return diff <= 7;
                      }).length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <div className="apple-card overflow-hidden">
                <div className="px-8 py-6 border-b border-black/[0.05]">
                  <h2 className="text-lg font-bold text-black tracking-tight">All Orders</h2>
                  <p className="text-sm text-apple-gray font-medium mt-0.5">Click a row to view full details</p>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-24">
                    <div className="w-8 h-8 border-2 border-apple-blue border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-apple-gray">
                    <Package className="w-12 h-12 mb-4 opacity-30" strokeWidth={1.5} />
                    <p className="text-base font-semibold">No orders yet</p>
                    <p className="text-sm opacity-60 mt-1">Orders will appear here once submitted</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-black/[0.02] border-b border-black/[0.05]">
                          <th className="px-6 py-4 text-[11px] font-bold text-apple-gray uppercase tracking-tight">Job Name</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-apple-gray uppercase tracking-tight">Merchant</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-apple-gray uppercase tracking-tight">Contact</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-apple-gray uppercase tracking-tight">Doors</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-apple-gray uppercase tracking-tight">Required By</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-apple-gray uppercase tracking-tight">Submitted</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-apple-gray uppercase tracking-tight">By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/[0.03]">
                        {orders.map(order => (
                          <tr
                            key={order.id}
                            onClick={() => setSelectedOrder(order)}
                            className="cursor-pointer hover:bg-apple-blue/[0.03] transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <span className="text-[14px] font-bold text-black group-hover:text-apple-blue transition-colors">
                                {order.data.jobName || 'Untitled'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-[13px] font-medium text-black/60">
                              {order.data.merchant || '—'}
                            </td>
                            <td className="px-6 py-4 text-[13px] font-medium text-black/60">
                              {order.data.contactName || '—'}
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center justify-center bg-apple-blue/10 text-apple-blue text-[12px] font-bold px-3 py-1 rounded-full">
                                {order.data.doors?.length || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-[13px] font-medium text-black/60">
                              {order.data.requiredBy || 'TBC'}
                            </td>
                            <td className="px-6 py-4 text-[13px] font-medium text-black/60">
                              {new Date(order.createdAt).toLocaleDateString('en-NZ', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </td>
                            <td className="px-6 py-4 text-[13px] font-medium text-black/60">
                              {order.userName || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
