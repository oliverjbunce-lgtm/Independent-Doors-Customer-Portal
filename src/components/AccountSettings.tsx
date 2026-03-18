import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User as UserIcon, Building2, MapPin, Save, CheckCircle2, History, RotateCcw } from 'lucide-react';
import { User, OrderRecord } from '../types';

interface Props {
  user: User;
  onUpdate: (updatedUser: User) => void;
  onReorder: (orderData: any) => void;
}

export const AccountSettings: React.FC<Props> = ({ user, onUpdate, onReorder }) => {
  const [name, setName] = useState(user.name);
  const [defaultMerchant, setDefaultMerchant] = useState(user.defaultMerchant || '');
  const [defaultLocation, setDefaultLocation] = useState(user.defaultLocation || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setIsLoadingOrders(false);
      });
  }, [user.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`/api/user/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, defaultMerchant, defaultLocation }),
      });
      if (res.ok) {
        onUpdate({ ...user, name, defaultMerchant, defaultLocation });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="apple-card p-10 sm:p-16">
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-apple-blue p-3 rounded-2xl shadow-lg shadow-apple-blue/20">
            <UserIcon className="text-white w-6 h-6" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-black">Account Settings</h2>
            <p className="text-apple-gray font-medium">Manage your profile and defaults</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[13px] font-bold text-black/60 ml-1 uppercase tracking-wider">Full Name</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="apple-input"
                placeholder="Required"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[13px] font-bold text-black/60 ml-1 uppercase tracking-wider">Email Address</label>
              <input
                disabled
                type="email"
                value={user.email}
                className="apple-input opacity-50 cursor-not-allowed"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[13px] font-bold text-black/60 ml-1 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Default Merchant
              </label>
              <input
                type="text"
                value={defaultMerchant}
                onChange={(e) => setDefaultMerchant(e.target.value)}
                className="apple-input"
                placeholder="Optional"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[13px] font-bold text-black/60 ml-1 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Default Location
              </label>
              <input
                type="text"
                value={defaultLocation}
                onChange={(e) => setDefaultLocation(e.target.value)}
                className="apple-input"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className={`apple-button-primary flex items-center gap-3 ${showSuccess ? 'bg-emerald-500' : ''}`}
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : showSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="apple-card p-10 sm:p-16">
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-black p-3 rounded-2xl shadow-lg shadow-black/20">
            <History className="text-white w-6 h-6" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-black">Order History</h2>
            <p className="text-apple-gray font-medium">View and reorder previous specifications</p>
          </div>
        </div>

        {isLoadingOrders ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-apple-blue/30 border-t-apple-blue rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-black/[0.02] rounded-3xl border border-dashed border-black/10">
            <p className="text-apple-gray font-medium">No previous orders found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-black/[0.02] rounded-3xl border border-black/[0.05] hover:border-apple-blue/20 transition-all group">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-black">{order.data.jobName || 'Untitled Job'}</span>
                    <span className="text-[10px] font-bold bg-black/5 px-2 py-1 rounded-full text-black/40 uppercase tracking-tighter">
                      #{order.id.slice(0, 8)}
                    </span>
                  </div>
                  <p className="text-sm text-apple-gray font-medium">
                    {new Date(order.createdAt).toLocaleDateString()} • {order.data.doors.length} Doors
                  </p>
                </div>
                <button
                  onClick={() => onReorder(order.data)}
                  className="mt-4 sm:mt-0 apple-button-secondary flex items-center gap-2 group-hover:bg-apple-blue group-hover:text-white transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reorder
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
