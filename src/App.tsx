import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  Send,
  CheckCircle2,
  X,
  ArrowRight,
  ArrowLeft,
  Settings,
  Layers,
  Eye,
  Check,
  User as UserIcon,
  LogOut,
  Printer,
  Store,
  Wrench,
  Shield,
  FileEdit,
} from 'lucide-react';
import { OrderData, DoorOrderRow, GlobalSpecs, User, OrderRecord, UserRole } from './types';
import { OrderHeader } from './components/OrderHeader';
import { GlobalSpecsCard } from './components/GlobalSpecs';
import { OrderTable } from './components/OrderTable';
import { Login } from './components/Login';
import { OrderPreview } from './components/OrderPreview';
import { AccountSettings } from './components/AccountSettings';

type Step = 'INFO' | 'SPECS' | 'SCHEDULE' | 'REVIEW' | 'SETTINGS';

const STEPS: { id: Step; label: string; icon: any }[] = [
  { id: 'INFO',     label: 'Order Info',    icon: Building2 },
  { id: 'SPECS',    label: 'Global Specs',  icon: Settings  },
  { id: 'SCHEDULE', label: 'Door Schedule', icon: Layers    },
  { id: 'REVIEW',   label: 'Review & Send', icon: Eye       },
];

const DEFAULT_GLOBAL_SPECS: GlobalSpecs = {
  hingeDetails: '',
  robeTrackColour: '',
  jambStyle: 'Flat',
  jambMaterial: 'MDF',
  drillingRequired: true,
  hardwareBrand: '',
  handleHeight: '1000',
};

const INITIAL_STATE: OrderData = {
  jobName: '',
  contactName: '',
  siteAddress: '',
  orderNumber: '',
  merchant: '',
  requiredBy: '',
  deliveryType: 'Delivery',
  globalSpecs: { ...DEFAULT_GLOBAL_SPECS },
  doors: [],
};

// ── Role helpers ──────────────────────────────────────────────────────────────

const ROLE_META: Record<UserRole, { icon: React.ElementType; label: string; color: string }> = {
  merchant: { icon: Store,   label: 'Merchant', color: 'bg-amber-50 text-amber-700 border-amber-200'  },
  builder:  { icon: Wrench,  label: 'Builder',  color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  staff:    { icon: Shield,  label: 'Internal', color: 'bg-blue-50 text-blue-700 border-blue-200'     },
  admin:    { icon: Shield,  label: 'Admin',    color: 'bg-purple-50 text-purple-700 border-purple-200'  },
};

function RoleBadge({ user }: { user: User }) {
  if (!user.role) return null;
  const meta = ROLE_META[user.role];
  const Icon = meta.icon;
  const label = user.company ? `${user.company} · ${meta.label}` : meta.label;
  return (
    <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${meta.color}`}>
      <Icon className="w-3 h-3" strokeWidth={2.5} />
      {label}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

const SESSION_KEY = 'id_portal_user';

export default function App() {
  const [user, setUser]               = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? (JSON.parse(saved) as User) : null;
    } catch { return null; }
  });
  const [order, setOrder]             = useState<OrderData>(INITIAL_STATE);
  const [currentStep, setCurrentStep] = useState<Step>('INFO');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSavedAnimation, setShowSavedAnimation] = useState(false);
  const [draftCount, setDraftCount]   = useState(0);

  const handleLogin = useCallback((loggedInUser: User) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  }, []);

  // Apply user defaults whenever user is set
  useEffect(() => {
    if (!user) return;

    const globalSpecs = user.defaultGlobalSpecs
      ? { ...DEFAULT_GLOBAL_SPECS, ...user.defaultGlobalSpecs }
      : DEFAULT_GLOBAL_SPECS;

    setOrder(prev => ({
      ...prev,
      globalSpecs,
      // Merchant → pre-fill merchant field from their company
      merchant: user.role === 'merchant' ? (user.company || prev.merchant) : (user.defaultMerchant || prev.merchant),
      // Builder → pre-fill contact name from their name
      contactName: user.role === 'builder' ? (user.name || prev.contactName) : prev.contactName,
      siteAddress: user.defaultLocation || prev.siteAddress,
    }));

    // Fetch draft count for badge
    fetch(`/api/orders/drafts/${user.id}`)
      .then(r => r.json())
      .then((drafts: OrderRecord[]) => setDraftCount(Array.isArray(drafts) ? drafts.length : 0))
      .catch(() => {});
  }, [user]);

  const handleHeaderChange = (field: keyof OrderData, value: any) => {
    setOrder(prev => ({ ...prev, [field]: value }));
  };

  const handleGlobalSpecsChange = (field: keyof GlobalSpecs, value: any) => {
    setOrder(prev => ({
      ...prev,
      globalSpecs: { ...prev.globalSpecs, [field]: value },
    }));
  };

  const addDoor = () => {
    const newDoor: DoorOrderRow = {
      id: crypto.randomUUID(),
      location: '',
      hanging: 'LH',
      height: '1980',
      width: '760',
      thickness: '35',
      trimHeight: '',
      trimWidth: '',
      floorGap: '20',
      gibFrameSize: '90',
      softClose: false,
      doorFinish: 'Primed',
      doorCore: 'Honeycomb',
      frameType: 'Standard',
      hardwareCode: '',
      notes: '',
    };
    setOrder(prev => ({ ...prev, doors: [...prev.doors, newDoor] }));
  };

  const updateDoor = (id: string, field: keyof DoorOrderRow, value: any) => {
    setOrder(prev => ({
      ...prev,
      doors: prev.doors.map(d => d.id === id ? { ...d, [field]: value } : d),
    }));
  };

  const deleteDoor = (id: string) => {
    setOrder(prev => ({ ...prev, doors: prev.doors.filter(d => d.id !== id) }));
  };

  const nextStep = () => {
    const idx = STEPS.findIndex(s => s.id === currentStep);
    if (idx < STEPS.length - 1) {
      setShowSavedAnimation(true);
      setTimeout(() => {
        setShowSavedAnimation(false);
        setCurrentStep(STEPS[idx + 1].id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 600);
    }
  };

  const prevStep = () => {
    const idx = STEPS.findIndex(s => s.id === currentStep);
    if (idx > 0) {
      setCurrentStep(STEPS[idx - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const confirmSubmit = async () => {
    if (!user) return;
    setIsSubmitted(true);
    // Strip isDraft flag before submitting for real
    const { isDraft: _removed, ...cleanOrder } = order as any;
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, data: cleanOrder }),
      });
      // Refresh draft count
      fetch(`/api/orders/drafts/${user.id}`)
        .then(r => r.json())
        .then((drafts: OrderRecord[]) => setDraftCount(Array.isArray(drafts) ? drafts.length : 0))
        .catch(() => {});
      setTimeout(() => {
        setIsSubmitted(false);
        setCurrentStep('INFO');
        setOrder(INITIAL_STATE);
      }, 3000);
    } catch (error) {
      console.error('Failed to submit order:', error);
      setIsSubmitted(false);
    }
  };

  const handleReorder = (orderData: OrderData) => {
    // Strip draft flag and old order number when re-using
    const { isDraft: _d, ...clean } = orderData as any;
    setOrder({ ...clean, orderNumber: '' });
    setCurrentStep('INFO');
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setCurrentStep('INFO');
    setOrder(INITIAL_STATE);
    setDraftCount(0);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="min-h-screen bg-apple-bg flex flex-col font-sans">

      {/* ── Navigation / Header ─────────────────────────────────────────────── */}
      <header className="glass sticky top-0 z-50 no-print shrink-0 px-3 sm:px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer min-w-0" onClick={() => setCurrentStep('INFO')}>
            <span className="text-xl font-black tracking-tight text-black">Plan Analyser</span>
            <div className="hidden sm:block">
              <p className="text-[10px] text-apple-gray font-semibold uppercase tracking-wider">Order Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Role badge — hidden on xs */}
            <RoleBadge user={user} />

            {/* Drafts badge — hidden on xs */}
            {draftCount > 0 && (
              <button
                onClick={() => setCurrentStep('SETTINGS')}
                className="hidden sm:flex items-center gap-1.5 bg-apple-blue/10 hover:bg-apple-blue/20 px-3 py-1.5 rounded-full transition-all"
                title="You have draft orders"
              >
                <FileEdit className="w-3.5 h-3.5 text-apple-blue" strokeWidth={2.5} />
                <span className="text-[11px] font-bold text-apple-blue">{draftCount} Draft{draftCount !== 1 ? 's' : ''}</span>
              </button>
            )}

            {/* Draft icon-only on mobile */}
            {draftCount > 0 && (
              <button
                onClick={() => setCurrentStep('SETTINGS')}
                className="sm:hidden relative p-2 text-apple-blue hover:bg-apple-blue/10 rounded-full transition-all"
                title="You have draft orders"
              >
                <FileEdit className="w-4.5 h-4.5" strokeWidth={2.5} />
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-apple-blue text-white rounded-full text-[9px] font-bold flex items-center justify-center">{draftCount}</span>
              </button>
            )}

            <button
              onClick={() => setCurrentStep('SETTINGS')}
              className={`p-2 rounded-full transition-all active:scale-95 ${
                currentStep === 'SETTINGS' ? 'bg-apple-blue text-white' : 'text-apple-blue hover:bg-black/[0.05]'
              }`}
            >
              <UserIcon className="w-5 h-5" strokeWidth={2} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-all active:scale-95"
            >
              <LogOut className="w-5 h-5" strokeWidth={2} />
            </button>
            <div className="hidden sm:block h-6 w-[1px] bg-black/[0.05]" />
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-[11px] font-semibold text-black/60 uppercase tracking-tight max-w-[120px] truncate">{user.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Step Indicator ──────────────────────────────────────────────────── */}
      {currentStep !== 'SETTINGS' && (
        <div className="bg-white/50 backdrop-blur-md border-b border-black/[0.05] no-print sticky top-[52px] sm:top-[56px] z-40 shrink-0">
          <div className="max-w-5xl mx-auto px-3 sm:px-6">

            {/* Mobile step indicator (< sm) */}
            <div className="flex sm:hidden items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-apple-blue text-white text-[11px] font-bold shrink-0">
                  {currentStepIndex + 1}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-black/40 uppercase tracking-tight">Step {currentStepIndex + 1} of {STEPS.length}</p>
                  <p className="text-sm font-bold text-apple-blue">{STEPS[currentStepIndex]?.label}</p>
                </div>
              </div>
              {/* Mini progress dots */}
              <div className="flex items-center gap-1">
                {STEPS.map((step, i) => (
                  <div
                    key={step.id}
                    className={`rounded-full transition-all duration-300 ${
                      i === currentStepIndex
                        ? 'w-5 h-2 bg-apple-blue'
                        : i < currentStepIndex
                        ? 'w-2 h-2 bg-emerald-500'
                        : 'w-2 h-2 bg-black/[0.10]'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Full step bar (sm+) */}
            <div className="hidden sm:flex items-center justify-between py-6">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive    = step.id === currentStep;
                const isCompleted = STEPS.findIndex(s => s.id === currentStep) > index;
                return (
                  <div key={step.id} className="flex items-center flex-1 last:flex-none">
                    <button
                      onClick={() => { if (isCompleted || isActive) setCurrentStep(step.id); }}
                      className={`flex flex-col items-center gap-2 transition-all outline-none ${
                        isActive ? 'scale-105' : ''
                      } ${isCompleted || isActive ? 'cursor-pointer' : 'cursor-default opacity-30'}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive    ? 'bg-apple-blue text-white shadow-lg shadow-apple-blue/20' :
                        isCompleted ? 'bg-emerald-500 text-white' : 'bg-black/[0.05] text-black/40'
                      }`}>
                        {isCompleted
                          ? <Check className="w-5 h-5" strokeWidth={3} />
                          : <Icon className="w-5 h-5" strokeWidth={2} />}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-tight ${
                        isActive ? 'text-apple-blue' : 'text-black/40'
                      }`}>
                        {step.label}
                      </span>
                    </button>
                    {index < STEPS.length - 1 && (
                      <div className="flex-1 mx-6 h-[2px] bg-black/[0.05] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-apple-blue"
                          initial={false}
                          animate={{ width: isCompleted ? '100%' : '0%' }}
                          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full"
          >
            {currentStep === 'INFO' && (
              <div className="space-y-8 sm:space-y-12">
                <OrderHeader data={order} onChange={handleHeaderChange} />
                <div className="flex justify-end pt-2 sm:pt-4">
                  <button onClick={nextStep} className="apple-button-primary w-full sm:w-auto flex items-center justify-center gap-3">
                    Continue
                    <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                </div>

              </div>
            )}

            {currentStep === 'SPECS' && (
              <div className="space-y-8 sm:space-y-12">
                <GlobalSpecsCard specs={order.globalSpecs} onChange={handleGlobalSpecsChange} />
                <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-2 sm:pt-4">
                  <button onClick={prevStep} className="apple-button-secondary w-full sm:w-auto">Back</button>
                  <button onClick={nextStep} className="apple-button-primary w-full sm:w-auto flex items-center justify-center gap-3">
                    Continue
                    <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'SCHEDULE' && (
              <div className="space-y-8 sm:space-y-12">
                <OrderTable
                  data={order}
                  onAddRow={addDoor}
                  onUpdateRow={updateDoor}
                  onDeleteRow={deleteDoor}
                />
                <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-2 sm:pt-4">
                  <button onClick={prevStep} className="apple-button-secondary w-full sm:w-auto">Back</button>
                  <button onClick={nextStep} className="apple-button-primary w-full sm:w-auto flex items-center justify-center gap-3">
                    Review Order
                    <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'REVIEW' && (
              <div className="space-y-8 sm:space-y-12">
                <div className="apple-card p-4 sm:p-10 lg:p-16">
                  <OrderPreview order={order} />
                </div>
                <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6 pt-2 sm:pt-4 no-print">
                  <button onClick={prevStep} className="apple-button-secondary order-2 sm:order-1">Back to Edit</button>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 order-1 sm:order-2">
                    <button
                      onClick={() => window.print()}
                      className="apple-button-secondary flex items-center justify-center gap-3"
                    >
                      <Printer className="w-5 h-5" strokeWidth={2} />
                      Print Order
                    </button>
                    <button
                      onClick={confirmSubmit}
                      disabled={isSubmitted}
                      className={`apple-button-primary flex items-center justify-center gap-3 ${
                        isSubmitted ? 'bg-emerald-500' : ''
                      }`}
                    >
                      {isSubmitted ? (
                        <><CheckCircle2 className="w-6 h-6" strokeWidth={2.5} /> {user?.role === 'staff' ? 'Sent for Review' : 'Order Sent'}</>
                      ) : (
                        user?.role === 'staff'
                          ? <>Send for Admin Review <Send className="w-5 h-5" strokeWidth={2.5} /></>
                          : <>Confirm and Send <Send className="w-5 h-5" strokeWidth={2.5} /></>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'SETTINGS' && (
              <AccountSettings
                user={user}
                onUpdate={setUser}
                onReorder={handleReorder}
                onDraftCountChange={setDraftCount}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Saved animation overlay ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showSavedAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/40 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-white rounded-[32px] p-10 shadow-2xl flex flex-col items-center gap-6 border border-black/[0.05]"
            >
              <div className="bg-emerald-500 text-white p-5 rounded-full shadow-lg shadow-emerald-500/20">
                <Check className="w-12 h-12" strokeWidth={4} />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold tracking-tight text-black">Section Saved</p>
                <p className="text-sm text-black/40 font-medium">Updating schedule…</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Success toast ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-[110] bg-white rounded-[24px] px-6 sm:px-8 py-5 shadow-2xl flex items-center gap-5 border border-black/[0.05] backdrop-blur-xl"
          >
            <div className="bg-emerald-500 p-3 rounded-full shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-bold text-lg tracking-tight text-black">
                {user?.role === 'staff' ? 'Sent for Review!' : 'Order Confirmed!'}
              </p>
              <p className="text-xs text-black/40 font-semibold uppercase tracking-tight">
                {user?.role === 'staff'
                  ? 'Admin has been notified for review'
                  : `Our team will be in touch`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
