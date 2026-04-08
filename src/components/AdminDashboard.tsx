import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DoorOpen, Lock, ArrowLeft, LogOut, Users, Calendar, Package,
  Clock, CheckCircle2, XCircle, AlertCircle, MapPin, X,
} from 'lucide-react';
import { OrderPreview } from './OrderPreview';
import { OrderData, OrderRecord } from '../types';

interface AdminOrder {
  id: string;
  data: OrderData;
  createdAt: string;
  userName: string;
  userEmail: string;
  userLocation?: string;
  status?: string;
  reviewNotes?: string | null;
}

interface ReviewQueueItem extends AdminOrder {
  floorPlanData?: any;
}

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'iddoors-admin';

const LOCATION_LABELS: Record<string, string> = {
  cromwell: 'Cromwell',
  christchurch: 'Christchurch',
  timaru: 'Timaru',
};

function LocationBadge({ location }: { location?: string }) {
  if (!location) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
      <MapPin className="w-3 h-3" strokeWidth={2.5} />
      {LOCATION_LABELS[location] || location}
    </span>
  );
}

export const AdminDashboard: React.FC = () => {
  const [authed, setAuthed] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [reviewQueue, setReviewQueue] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // Review modal state
  const [reviewingOrder, setReviewingOrder] = useState<ReviewQueueItem | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewActionLoading, setReviewActionLoading] = useState<'approve' | 'changes' | null>(null);
  const [showChangesForm, setShowChangesForm] = useState(false);

  // Location filter for review queue
  const [queueLocation, setQueueLocation] = useState('');

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

  const fetchReviewQueue = useCallback(async (loc?: string) => {
    const url = loc
      ? `/api/admin/review-queue?location=${encodeURIComponent(loc)}`
      : '/api/admin/review-queue';
    const data = await fetch(url, {
      headers: { 'x-admin-password': ADMIN_PASSWORD },
    }).then(r => r.json()).catch(() => []);
    setReviewQueue(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    Promise.all([
      fetch('/api/admin/orders', { headers: { 'x-admin-password': ADMIN_PASSWORD } })
        .then(r => r.json()).catch(() => []),
      fetch('/api/admin/review-queue', { headers: { 'x-admin-password': ADMIN_PASSWORD } })
        .then(r => r.json()).catch(() => []),
    ]).then(([allOrders, queue]) => {
      setOrders(Array.isArray(allOrders) ? allOrders : []);
      setReviewQueue(Array.isArray(queue) ? queue : []);
      setLoading(false);
    });
  }, [authed]);

  // Refetch queue when location filter changes
  useEffect(() => {
    if (!authed) return;
    fetchReviewQueue(queueLocation || undefined);
  }, [queueLocation, authed, fetchReviewQueue]);

  const handleApprove = async (orderId: string) => {
    setReviewActionLoading('approve');
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/approve`, {
        method: 'POST',
        headers: { 'x-admin-password': ADMIN_PASSWORD },
      });
      if (res.ok) {
        setReviewQueue(q => q.filter(o => o.id !== orderId));
        setReviewingOrder(null);
        // Refresh all orders list
        fetch('/api/admin/orders', { headers: { 'x-admin-password': ADMIN_PASSWORD } })
          .then(r => r.json()).then(d => setOrders(Array.isArray(d) ? d : [])).catch(() => {});
      }
    } finally {
      setReviewActionLoading(null);
    }
  };

  const handleRequestChanges = async (orderId: string) => {
    setReviewActionLoading('changes');
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/request-changes`, {
        method: 'POST',
        headers: { 'x-admin-password': ADMIN_PASSWORD, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewNotes }),
      });
      if (res.ok) {
        setReviewQueue(q => q.filter(o => o.id !== orderId));
        setReviewingOrder(null);
        setReviewNotes('');
        setShowChangesForm(false);
      }
    } finally {
      setReviewActionLoading(null);
    }
  };

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
                <p className="text-sm text-apple-gray font-medium mt-1">Customer Portal</p>
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
      <header className="glass sticky top-0 z-50 px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-apple-blue p-2 rounded-[10px] shadow-sm">
              <DoorOpen className="text-white w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-black">Portal</h1>
              <p className="text-[10px] text-apple-gray font-semibold uppercase tracking-wider">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {reviewQueue.length > 0 && (
              <span className="flex items-center gap-1.5 bg-amber-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                <Clock className="w-3 h-3" strokeWidth={2.5} />
                {reviewQueue.length} Pending Review
              </span>
            )}
            <button
              onClick={() => setAuthed(false)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-all active:scale-95"
            >
              <LogOut className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
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
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold text-black tracking-tight">{selectedOrder.data.jobName || 'Untitled Job'}</h2>
                    <LocationBadge location={selectedOrder.userLocation} />
                  </div>
                  <p className="text-sm text-apple-gray font-medium">
                    Submitted by {selectedOrder.userName} · {new Date(selectedOrder.createdAt).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="apple-card p-4 sm:p-10 lg:p-16">
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
                  <div className="bg-amber-500/10 p-3 rounded-[14px]">
                    <Clock className="w-6 h-6 text-amber-500" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-apple-gray uppercase tracking-tight">Pending Review</p>
                    <p className="text-2xl font-bold text-black">{reviewQueue.length}</p>
                  </div>
                </div>
              </div>

              {/* ── Review Queue ── */}
              <div className="apple-card overflow-hidden">
                <div className="px-4 sm:px-8 py-5 sm:py-6 border-b border-black/[0.05] flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-bold text-black tracking-tight">Review Queue</h2>
                      {reviewQueue.length > 0 && (
                        <span className="bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                          {reviewQueue.length}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-apple-gray font-medium mt-0.5">Spec sheets submitted by Internal Staff awaiting approval</p>
                  </div>
                  {/* Location filter */}
                  <select
                    value={queueLocation}
                    onChange={e => setQueueLocation(e.target.value)}
                    className="text-sm font-semibold border border-black/[0.10] rounded-xl px-3 py-2 bg-white text-black/70 focus:outline-none focus:border-apple-blue"
                  >
                    <option value="">All Locations</option>
                    <option value="cromwell">Cromwell</option>
                    <option value="christchurch">Christchurch</option>
                    <option value="timaru">Timaru</option>
                  </select>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-2 border-apple-blue border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : reviewQueue.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-apple-gray">
                    <CheckCircle2 className="w-10 h-10 mb-3 text-emerald-400" strokeWidth={1.5} />
                    <p className="text-base font-semibold">All clear — no items pending review</p>
                  </div>
                ) : (
                  <div className="divide-y divide-black/[0.04]">
                    {reviewQueue.map(item => (
                      <div
                        key={item.id}
                        onClick={() => { setReviewingOrder(item); setReviewNotes(''); setShowChangesForm(false); }}
                        className="px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-amber-50/60 transition-colors group"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-bold text-base text-black group-hover:text-amber-700 transition-colors">
                              {item.data.jobName || 'Untitled Job'}
                            </span>
                            <LocationBadge location={item.userLocation} />
                          </div>
                          <p className="text-sm text-apple-gray font-medium">
                            {item.userName} · {new Date(item.createdAt).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })} · {item.data.doors?.length || 0} doors
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[11px] font-bold bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 rounded-full">
                            Awaiting Review
                          </span>
                          <span className="text-apple-gray text-sm font-medium group-hover:text-amber-700 transition-colors">Review →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── All Orders ── */}
              <div className="apple-card overflow-hidden">
                <div className="px-4 sm:px-8 py-5 sm:py-6 border-b border-black/[0.05]">
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
                  <>
                    {/* Desktop table */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-black/[0.02] border-b border-black/[0.05]">
                            <th className="px-6 py-4 text-[11px] font-bold text-apple-gray uppercase tracking-tight">Job Name</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-apple-gray uppercase tracking-tight">Merchant</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-apple-gray uppercase tracking-tight">Doors</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-apple-gray uppercase tracking-tight">Status</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-apple-gray uppercase tracking-tight">Submitted</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-apple-gray uppercase tracking-tight">By</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-apple-gray uppercase tracking-tight">Location</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/[0.03]">
                          {orders.map(order => (
                            <tr key={order.id} onClick={() => setSelectedOrder(order)}
                              className="cursor-pointer hover:bg-apple-blue/[0.03] transition-colors group">
                              <td className="px-6 py-4">
                                <span className="text-[14px] font-bold text-black group-hover:text-apple-blue transition-colors">
                                  {order.data.jobName || 'Untitled'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-[13px] font-medium text-black/60">{order.data.merchant || '—'}</td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center justify-center bg-apple-blue/10 text-apple-blue text-[12px] font-bold px-3 py-1 rounded-full">
                                  {order.data.doors?.length || 0}
                                </span>
                              </td>
                              <td className="px-6 py-4"><AdminStatusBadge status={order.status} /></td>
                              <td className="px-6 py-4 text-[13px] font-medium text-black/60">
                                {new Date(order.createdAt).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="px-6 py-4 text-[13px] font-medium text-black/60">{order.userName || '—'}</td>
                              <td className="px-6 py-4"><LocationBadge location={order.userLocation} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile card list */}
                    <div className="sm:hidden divide-y divide-black/[0.04]">
                      {orders.map(order => (
                        <div key={order.id} onClick={() => setSelectedOrder(order)}
                          className="px-4 py-4 cursor-pointer hover:bg-apple-blue/[0.03] active:bg-apple-blue/[0.05] transition-colors">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="font-bold text-[15px] text-black">{order.data.jobName || 'Untitled'}</span>
                                <AdminStatusBadge status={order.status} />
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[12px] text-apple-gray font-medium">
                                  {new Date(order.createdAt).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                                {order.data.merchant && <span className="text-[12px] text-apple-gray font-medium">· {order.data.merchant}</span>}
                                <LocationBadge location={order.userLocation} />
                              </div>
                            </div>
                            <span className="inline-flex items-center justify-center bg-apple-blue/10 text-apple-blue text-[12px] font-bold px-2.5 py-1 rounded-full shrink-0">
                              {order.data.doors?.length || 0}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Review Modal ── */}
      <AnimatePresence>
        {reviewingOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-start justify-center p-4 sm:p-8 overflow-y-auto"
            onClick={e => { if (e.target === e.currentTarget) setReviewingOrder(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="w-full max-w-5xl bg-white rounded-[28px] shadow-2xl overflow-hidden my-4"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 border-b border-black/[0.06] bg-white sticky top-0 z-10">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold text-black tracking-tight">
                      {reviewingOrder.data.jobName || 'Untitled Job'}
                    </h2>
                    <LocationBadge location={reviewingOrder.userLocation} />
                    <span className="text-[11px] font-bold bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 rounded-full">
                      Awaiting Review
                    </span>
                  </div>
                  <p className="text-sm text-apple-gray font-medium mt-1">
                    Submitted by {reviewingOrder.userName} ({reviewingOrder.userEmail}) · {new Date(reviewingOrder.createdAt).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })} · {reviewingOrder.data.doors?.length || 0} doors
                  </p>
                </div>
                <button
                  onClick={() => setReviewingOrder(null)}
                  className="p-2 rounded-full hover:bg-black/[0.05] text-black/40 hover:text-black transition-all"
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>

              {/* Spec sheet */}
              <div className="px-4 sm:px-8 py-5 sm:py-8">
                <OrderPreview order={reviewingOrder.data} />
              </div>

              {/* Floor plan data */}
              {reviewingOrder.floorPlanData && (
                <div className="px-4 sm:px-8 pb-5 sm:pb-6">
                  <h3 className="text-sm font-bold text-black/60 uppercase tracking-wider mb-3">Floor Plan Data</h3>
                  {typeof reviewingOrder.floorPlanData === 'string' && (
                    reviewingOrder.floorPlanData.startsWith('data:') || reviewingOrder.floorPlanData.startsWith('http')
                      ? <img src={reviewingOrder.floorPlanData} alt="Floor plan" className="max-w-full rounded-2xl border border-black/[0.08]" />
                      : <pre className="text-xs bg-black/[0.03] rounded-2xl p-4 overflow-auto max-h-48">{JSON.stringify(reviewingOrder.floorPlanData, null, 2)}</pre>
                  )}
                  {Array.isArray(reviewingOrder.floorPlanData) && reviewingOrder.floorPlanData.map((img: any, i: number) => (
                    typeof img === 'string'
                      ? <img key={i} src={img} alt={`Floor plan ${i + 1}`} className="max-w-full rounded-2xl border border-black/[0.08] mb-3" />
                      : null
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="px-4 sm:px-8 pb-6 sm:pb-8 space-y-4">
                <div className="h-px bg-black/[0.06]" />

                {!showChangesForm ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleApprove(reviewingOrder.id)}
                      disabled={reviewActionLoading !== null}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-md shadow-emerald-500/20 disabled:opacity-60"
                    >
                      {reviewActionLoading === 'approve'
                        ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <><CheckCircle2 className="w-5 h-5" strokeWidth={2.5} /> Approve &amp; Send Quote</>
                      }
                    </button>
                    <button
                      onClick={() => setShowChangesForm(true)}
                      disabled={reviewActionLoading !== null}
                      className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-md shadow-orange-500/20 disabled:opacity-60"
                    >
                      <AlertCircle className="w-5 h-5" strokeWidth={2.5} />
                      Request Changes
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-bold text-black/60 uppercase tracking-wider mb-2 block">
                        Notes for the submitter
                      </label>
                      <textarea
                        value={reviewNotes}
                        onChange={e => setReviewNotes(e.target.value)}
                        placeholder="Explain what needs to be changed…"
                        rows={4}
                        className="w-full border border-black/[0.12] rounded-2xl px-4 py-3 text-sm font-medium resize-none focus:outline-none focus:border-orange-400 transition-colors"
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowChangesForm(false)}
                        className="apple-button-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleRequestChanges(reviewingOrder.id)}
                        disabled={reviewActionLoading !== null}
                        className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold py-3 px-6 rounded-2xl transition-all disabled:opacity-60"
                      >
                        {reviewActionLoading === 'changes'
                          ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <><XCircle className="w-5 h-5" strokeWidth={2.5} /> Send Changes Request</>
                        }
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Status badge (admin view) ─────────────────────────────────────────────────

function AdminStatusBadge({ status }: { status?: string }) {
  switch (status) {
    case 'approved':
      return <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">Approved</span>;
    case 'pending_review':
      return <span className="text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full">Pending Review</span>;
    case 'changes_requested':
      return <span className="text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full">Changes Requested</span>;
    case 'draft':
      return <span className="text-[11px] font-bold bg-black/5 text-black/40 border border-black/[0.08] px-2.5 py-0.5 rounded-full">Draft</span>;
    default:
      return <span className="text-[11px] font-bold bg-black/5 text-black/40 border border-black/[0.08] px-2.5 py-0.5 rounded-full">{status ?? '—'}</span>;
  }
}
