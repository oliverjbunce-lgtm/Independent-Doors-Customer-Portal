import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  User as UserIcon, Building2, MapPin, Save, CheckCircle2,
  History, RotateCcw, Settings, FileEdit, ArrowRight,
  Store, Wrench, Shield,
} from 'lucide-react';
import { User, OrderRecord, GlobalSpecs, UserRole } from '../types';
import { GlobalSpecsCard } from './GlobalSpecs';

const DEFAULT_SPECS: GlobalSpecs = {
  hingeDetails: '',
  robeTrackColour: '',
  jambStyle: 'Flat',
  jambMaterial: 'MDF',
  drillingRequired: true,
  hardwareBrand: '',
  handleHeight: '1000',
};

const ROLE_LABELS: Record<UserRole, { label: string; icon: React.ElementType }> = {
  merchant: { label: 'Merchant',          icon: Store  },
  builder:  { label: 'Builder / Contractor', icon: Wrench },
  staff:    { label: 'Internal Staff',    icon: Shield },
};

interface Props {
  user: User;
  onUpdate: (updatedUser: User) => void;
  onReorder: (orderData: any) => void;
  onDraftCountChange?: (count: number) => void;
}

export const AccountSettings: React.FC<Props> = ({ user, onUpdate, onReorder, onDraftCountChange }) => {
  const [name, setName]                         = useState(user.name);
  const [defaultMerchant, setDefaultMerchant]   = useState(user.defaultMerchant || '');
  const [defaultLocation, setDefaultLocation]   = useState(user.defaultLocation || '');
  const [company, setCompany]                   = useState(user.company || '');
  const [globalSpecs, setGlobalSpecs]           = useState<GlobalSpecs>(
    user.defaultGlobalSpecs ? { ...DEFAULT_SPECS, ...user.defaultGlobalSpecs } : { ...DEFAULT_SPECS }
  );
  const [isSaving, setIsSaving]                 = useState(false);
  const [showSuccess, setShowSuccess]           = useState(false);

  const [orders, setOrders]                     = useState<OrderRecord[]>([]);
  const [drafts, setDrafts]                     = useState<OrderRecord[]>([]);
  const [isLoadingOrders, setIsLoadingOrders]   = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/orders/${user.id}`).then(r => r.json()),
      fetch(`/api/orders/drafts/${user.id}`).then(r => r.json()),
    ]).then(([allOrders, draftOrders]) => {
      const draftIds = new Set((draftOrders as OrderRecord[]).map(d => d.id));
      // Separate real orders from drafts
      setOrders((allOrders as OrderRecord[]).filter(o => !draftIds.has(o.id)));
      setDrafts(draftOrders as OrderRecord[]);
      onDraftCountChange?.(Array.isArray(draftOrders) ? draftOrders.length : 0);
      setIsLoadingOrders(false);
    }).catch(() => setIsLoadingOrders(false));
  }, [user.id]);

  const handleSpecsChange = (field: keyof GlobalSpecs, value: any) =>
    setGlobalSpecs(prev => ({ ...prev, [field]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`/api/user/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          defaultMerchant,
          defaultLocation,
          defaultGlobalSpecs: globalSpecs,
          role: user.role,
          company,
        }),
      });
      if (res.ok) {
        onUpdate({ ...user, name, defaultMerchant, defaultLocation, defaultGlobalSpecs: globalSpecs, company });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinueDraft = (draft: OrderRecord) => {
    // Load the draft into the order form, stripping isDraft flag
    const { isDraft: _removed, ...cleanData } = draft.data as any;
    onReorder(cleanData);
  };

  const roleInfo = user.role ? ROLE_LABELS[user.role] : null;

  return (
    <div className="space-y-12">

      {/* ── Profile card ────────────────────────────────────────────────────── */}
      <div className="apple-card p-10 sm:p-16">
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-apple-blue p-3 rounded-2xl shadow-lg shadow-apple-blue/20">
            <UserIcon className="text-white w-6 h-6" strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-black">Account Settings</h2>
              {roleInfo && (() => {
                const Icon = roleInfo.icon;
                return (
                  <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/[0.04] text-black/50 border border-black/[0.06]">
                    <Icon className="w-3 h-3" strokeWidth={2.5} />
                    {roleInfo.label}
                  </span>
                );
              })()}
            </div>
            <p className="text-apple-gray font-medium">Manage your profile and defaults</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[13px] font-bold text-black/60 ml-1 uppercase tracking-wider">Full Name</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)}
                className="apple-input" placeholder="Required" />
            </div>
            <div className="space-y-3">
              <label className="text-[13px] font-bold text-black/60 ml-1 uppercase tracking-wider">Email Address</label>
              <input disabled type="email" value={user.email}
                className="apple-input opacity-50 cursor-not-allowed" />
            </div>

            {/* Company — label adapts to role */}
            {user.role !== 'staff' && (
              <div className="space-y-3">
                <label className="text-[13px] font-bold text-black/60 ml-1 uppercase tracking-wider flex items-center gap-2">
                  {user.role === 'merchant' ? <Store className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                  {user.role === 'merchant' ? 'Merchant / Branch' : 'Company Name'}
                </label>
                <input type="text" value={company} onChange={e => setCompany(e.target.value)}
                  className="apple-input" placeholder="Optional" />
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[13px] font-bold text-black/60 ml-1 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Default Merchant
              </label>
              <input type="text" value={defaultMerchant} onChange={e => setDefaultMerchant(e.target.value)}
                className="apple-input" placeholder="Optional" />
            </div>

            <div className="space-y-3">
              <label className="text-[13px] font-bold text-black/60 ml-1 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Default Location
              </label>
              <input type="text" value={defaultLocation} onChange={e => setDefaultLocation(e.target.value)}
                className="apple-input" placeholder="Optional" />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={isSaving}
              className={`apple-button-primary flex items-center gap-3 ${showSuccess ? 'bg-emerald-500' : ''}`}>
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : showSuccess ? (
                <><CheckCircle2 className="w-5 h-5" /> Saved</>
              ) : (
                <><Save className="w-5 h-5" /> Save Changes</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Default Specs card ───────────────────────────────────────────────── */}
      <div className="apple-card p-10 sm:p-16">
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-purple-500 p-3 rounded-2xl shadow-lg shadow-purple-500/20">
            <Settings className="text-white w-6 h-6" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-black">Default Specs</h2>
            <p className="text-apple-gray font-medium">Pre-fill every new order with these values</p>
          </div>
        </div>
        <GlobalSpecsCard specs={globalSpecs} onChange={handleSpecsChange} />
        <div className="flex justify-end mt-8">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`apple-button-primary flex items-center gap-3 ${showSuccess ? 'bg-emerald-500' : ''}`}
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : showSuccess ? (
              <><CheckCircle2 className="w-5 h-5" /> Saved</>
            ) : (
              <><Save className="w-5 h-5" /> Save Defaults</>
            )}
          </button>
        </div>
      </div>

      {/* ── Draft Orders card ────────────────────────────────────────────────── */}
      {(isLoadingOrders || drafts.length > 0) && (
        <div className="apple-card p-10 sm:p-16">
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-apple-blue p-3 rounded-2xl shadow-lg shadow-apple-blue/20">
              <FileEdit className="text-white w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-black">Draft Orders</h2>
              <p className="text-apple-gray font-medium">Imported from Door AI — continue to complete and submit</p>
            </div>
          </div>

          {isLoadingOrders ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-apple-blue/30 border-t-apple-blue rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {drafts.map(draft => (
                <div
                  key={draft.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-apple-blue/[0.03] rounded-3xl border border-apple-blue/[0.10] hover:border-apple-blue/30 transition-all group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-lg text-black">{draft.data.jobName || 'Untitled Import'}</span>
                      <span className="text-[10px] font-bold bg-apple-blue/10 text-apple-blue px-2 py-1 rounded-full uppercase tracking-tighter">
                        Draft
                      </span>
                      <span className="text-[10px] font-bold bg-black/5 px-2 py-1 rounded-full text-black/40 uppercase tracking-tighter">
                        #{draft.id.slice(0, 8)}
                      </span>
                    </div>
                    <p className="text-sm text-apple-gray font-medium">
                      {new Date(draft.createdAt).toLocaleDateString()} · {draft.data.doors?.length ?? 0} Doors imported from Plan Analyser
                    </p>
                  </div>
                  <button
                    onClick={() => handleContinueDraft(draft)}
                    className="mt-4 sm:mt-0 flex items-center gap-2 bg-apple-blue text-white font-semibold text-sm px-5 py-2.5 rounded-2xl shadow-md shadow-apple-blue/20 hover:bg-apple-blue/90 active:scale-95 transition-all"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Order History card ───────────────────────────────────────────────── */}
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
            {orders.map(order => (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-black/[0.02] rounded-3xl border border-black/[0.05] hover:border-apple-blue/20 transition-all group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-black">{order.data.jobName || 'Untitled Job'}</span>
                    <span className="text-[10px] font-bold bg-black/5 px-2 py-1 rounded-full text-black/40 uppercase tracking-tighter">
                      #{order.id.slice(0, 8)}
                    </span>
                  </div>
                  <p className="text-sm text-apple-gray font-medium">
                    {new Date(order.createdAt).toLocaleDateString()} · {order.data.doors?.length ?? 0} Doors
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
