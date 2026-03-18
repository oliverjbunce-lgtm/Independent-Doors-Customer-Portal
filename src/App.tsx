import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Send, 
  CheckCircle2, 
  X,
  DoorOpen,
  ArrowRight,
  ArrowLeft,
  Settings,
  Layers,
  Eye,
  Check,
  User as UserIcon,
  LogOut,
  Printer
} from 'lucide-react';
import { OrderData, DoorOrderRow, GlobalSpecs, User } from './types';
import { OrderHeader } from './components/OrderHeader';
import { GlobalSpecsCard } from './components/GlobalSpecs';
import { OrderTable } from './components/OrderTable';
import { Login } from './components/Login';
import { OrderPreview } from './components/OrderPreview';
import { AccountSettings } from './components/AccountSettings';

type Step = 'INFO' | 'SPECS' | 'SCHEDULE' | 'REVIEW' | 'SETTINGS';

const STEPS: { id: Step; label: string; icon: any }[] = [
  { id: 'INFO', label: 'Order Info', icon: Building2 },
  { id: 'SPECS', label: 'Global Specs', icon: Settings },
  { id: 'SCHEDULE', label: 'Door Schedule', icon: Layers },
  { id: 'REVIEW', label: 'Review & Send', icon: Eye },
];

const INITIAL_STATE: OrderData = {
  jobName: '',
  contactName: '',
  siteAddress: '',
  orderNumber: '',
  merchant: '',
  requiredBy: '',
  deliveryType: 'Delivery',
  globalSpecs: {
    hingeDetails: '',
    robeTrackColour: '',
    jambStyle: 'Flat',
    jambMaterial: 'MDF',
    drillingRequired: true,
    hardwareBrand: '',
    handleHeight: '1000',
  },
  doors: [],
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [order, setOrder] = useState<OrderData>(INITIAL_STATE);
  const [currentStep, setCurrentStep] = useState<Step>('INFO');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSavedAnimation, setShowSavedAnimation] = useState(false);

  useEffect(() => {
    if (user) {
      setOrder(prev => ({
        ...prev,
        merchant: user.defaultMerchant || prev.merchant,
        siteAddress: user.defaultLocation || prev.siteAddress,
      }));
    }
  }, [user]);

  const handleHeaderChange = (field: keyof OrderData, value: any) => {
    setOrder(prev => ({ ...prev, [field]: value }));
  };

  const handleGlobalSpecsChange = (field: keyof GlobalSpecs, value: any) => {
    setOrder(prev => ({
      ...prev,
      globalSpecs: { ...prev.globalSpecs, [field]: value }
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
      doors: prev.doors.map(d => d.id === id ? { ...d, [field]: value } : d)
    }));
  };

  const deleteDoor = (id: string) => {
    setOrder(prev => ({
      ...prev,
      doors: prev.doors.filter(d => d.id !== id)
    }));
  };

  const nextStep = () => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex < STEPS.length - 1) {
      setShowSavedAnimation(true);
      setTimeout(() => {
        setShowSavedAnimation(false);
        setCurrentStep(STEPS[currentIndex + 1].id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 600);
    }
  };

  const prevStep = () => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const confirmSubmit = async () => {
    if (!user) return;
    setIsSubmitted(true);
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, data: order }),
      });
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
    setOrder({ ...orderData, orderNumber: '' }); // Clear old order number
    setCurrentStep('INFO');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentStep('INFO');
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-apple-bg flex flex-col font-sans">
      {/* Navigation / Header */}
      <header className="glass sticky top-0 z-50 no-print shrink-0 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-apple-blue p-2 rounded-[10px] shadow-sm cursor-pointer" onClick={() => setCurrentStep('INFO')}>
              <DoorOpen className="text-white w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-black">Independent Doors</h1>
              <p className="text-[10px] text-apple-gray font-semibold uppercase tracking-wider">Order Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentStep('SETTINGS')}
              className={`p-2 rounded-full transition-all active:scale-95 ${currentStep === 'SETTINGS' ? 'bg-apple-blue text-white' : 'text-apple-blue hover:bg-black/[0.05]'}`}
            >
              <UserIcon className="w-5 h-5" strokeWidth={2} />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-all active:scale-95"
            >
              <LogOut className="w-5 h-5" strokeWidth={2} />
            </button>
            <div className="h-6 w-[1px] bg-black/[0.05]" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-[11px] font-semibold text-black/60 uppercase tracking-tight">{user.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Step Indicator */}
      {currentStep !== 'SETTINGS' && (
        <div className="bg-white/50 backdrop-blur-md border-b border-black/[0.05] no-print sticky top-[56px] z-40 shrink-0">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex items-center justify-between py-6">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = STEPS.findIndex(s => s.id === currentStep) > index;
                
                return (
                  <div key={step.id} className="flex items-center flex-1 last:flex-none">
                    <button
                      onClick={() => {
                        if (isCompleted || isActive) setCurrentStep(step.id);
                      }}
                      className={`flex flex-col items-center gap-2 transition-all outline-none group ${
                        isActive ? 'scale-105' : ''
                      } ${isCompleted || isActive ? 'cursor-pointer' : 'cursor-default opacity-30'}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive ? 'bg-apple-blue text-white shadow-lg shadow-apple-blue/20' : 
                        isCompleted ? 'bg-emerald-500 text-white' : 'bg-black/[0.05] text-black/40'
                      }`}>
                        {isCompleted ? <Check className="w-5 h-5" strokeWidth={3} /> : <Icon className="w-5 h-5" strokeWidth={2} />}
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

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="max-w-5xl mx-auto px-6 py-10 w-full"
          >
            {currentStep === 'INFO' && (
              <div className="space-y-12">
                <OrderHeader data={order} onChange={handleHeaderChange} />
                <div className="flex justify-end pt-4">
                  <button onClick={nextStep} className="apple-button-primary flex items-center gap-3">
                    Continue
                    <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'SPECS' && (
              <div className="space-y-12">
                <GlobalSpecsCard specs={order.globalSpecs} onChange={handleGlobalSpecsChange} />
                <div className="flex justify-between pt-4">
                  <button onClick={prevStep} className="apple-button-secondary">Back</button>
                  <button onClick={nextStep} className="apple-button-primary flex items-center gap-3">
                    Continue
                    <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'SCHEDULE' && (
              <div className="space-y-12">
                <OrderTable 
                  data={order} 
                  onAddRow={addDoor} 
                  onUpdateRow={updateDoor} 
                  onDeleteRow={deleteDoor} 
                />
                <div className="flex justify-between pt-4">
                  <button onClick={prevStep} className="apple-button-secondary">Back</button>
                  <button onClick={nextStep} className="apple-button-primary flex items-center gap-3">
                    Review Order
                    <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'REVIEW' && (
              <div className="space-y-12">
                <div className="apple-card p-10 sm:p-16">
                  <OrderPreview order={order} />
                </div>
                <div className="flex flex-col sm:flex-row justify-between gap-6 pt-4 no-print">
                  <button onClick={prevStep} className="apple-button-secondary order-2 sm:order-1">Back to Edit</button>
                  <div className="flex flex-col sm:flex-row gap-4 order-1 sm:order-2">
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
                        <>
                          <CheckCircle2 className="w-6 h-6" strokeWidth={2.5} />
                          Order Sent
                        </>
                      ) : (
                        <>
                          Confirm and Send
                          <Send className="w-5 h-5" strokeWidth={2.5} />
                        </>
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
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Saved Animation Overlay */}
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
                <p className="text-sm text-black/40 font-medium">Updating schedule...</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] bg-white rounded-[24px] px-8 py-5 shadow-2xl flex items-center gap-5 border border-black/[0.05] backdrop-blur-xl"
          >
            <div className="bg-emerald-500 p-3 rounded-full shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-bold text-lg tracking-tight text-black">Order Sent Successfully!</p>
              <p className="text-xs text-black/40 font-semibold uppercase tracking-tight">Merchant notified</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
