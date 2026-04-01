import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock, Mail, ArrowRight, ArrowLeft, ShieldCheck,
  User as UserIcon, Store, Wrench, Shield, Check, MapPin,
} from 'lucide-react';
import { User, UserRole, GlobalSpecs } from '../types';
import { GlobalSpecsCard } from './GlobalSpecs';

// ── Constants ─────────────────────────────────────────────────────────────────

const NZ_MERCHANTS = ['PlaceMakers', 'Carters', 'ITM', 'Mitre 10', 'Bunnings', 'Noel Leeming Hardware'];

const LOCATIONS: { value: string; label: string }[] = [
  { value: 'cromwell',      label: 'Cromwell' },
  { value: 'christchurch',  label: 'Christchurch' },
  { value: 'timaru',        label: 'Timaru' },
];

const DEFAULT_SPECS: GlobalSpecs = {
  hingeDetails: '',
  robeTrackColour: '',
  jambStyle: 'Flat',
  jambMaterial: 'MDF',
  drillingRequired: true,
  hardwareBrand: '',
  handleHeight: '1000',
};

const ROLE_CARDS: {
  value: UserRole;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}[] = [
  {
    value: 'merchant',
    icon: Store,
    title: 'Merchant',
    description: 'PlaceMakers, Carters, ITM, Mitre 10 and other building suppliers',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    value: 'builder',
    icon: Wrench,
    title: 'Builder / Contractor',
    description: 'Construction companies, independent builders and contractors',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  {
    value: 'staff',
    icon: Shield,
    title: 'Independent Doors Staff',
    description: 'Internal team members at Independent Doors Ltd',
    color: 'text-apple-blue bg-blue-50 border-blue-200',
  },
];

// ── Step indicator ────────────────────────────────────────────────────────────

const SIGNUP_STEPS = ['Account', 'Role', 'Details', 'Defaults'];

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i + 1 === current
              ? 'w-6 h-2 bg-apple-blue'
              : i + 1 < current
              ? 'w-2 h-2 bg-apple-blue/40'
              : 'w-2 h-2 bg-black/10'
          }`}
        />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  onLogin: (user: User) => void;
}

export const Login: React.FC<Props> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [signupStep, setSignupStep] = useState(1);

  // Shared fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Signup-only fields
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [selectedMerchant, setSelectedMerchant] = useState('');
  const [customCompany, setCustomCompany] = useState('');
  const [specs, setSpecs] = useState<GlobalSpecs>({ ...DEFAULT_SPECS });

  const [location, setLocation] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resolved company value
  const companyValue = role === 'merchant'
    ? (selectedMerchant === '__custom__' ? customCompany : selectedMerchant)
    : customCompany;

  // Number of visible steps (staff skips details step)
  const totalSteps = role === 'staff' ? 3 : 4;

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const resetSignup = () => {
    setSignupStep(1);
    setName('');
    setRole('');
    setSelectedMerchant('');
    setCustomCompany('');
    setLocation('');
    setSpecs({ ...DEFAULT_SPECS });
    setError(null);
  };

  const handleSpecsChange = (field: keyof GlobalSpecs, value: any) =>
    setSpecs(prev => ({ ...prev, [field]: value }));

  // ── Signup step navigation ───────────────────────────────────────────────────

  const goNext = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (signupStep === 1) {
      if (!name.trim() || !email.trim() || !password) {
        setError('All fields are required');
        return;
      }
      if (!location) {
        setError('Please select your branch location');
        return;
      }
      setSignupStep(2);
    } else if (signupStep === 2) {
      if (!role) {
        setError('Please select your role to continue');
        return;
      }
      setSignupStep(role === 'staff' ? 3 : 3); // Always go to 3 — staff's step 3 = specs
    } else if (signupStep === 3) {
      if (role !== 'staff') {
        // Validate role details
        if (!companyValue.trim()) {
          setError(
            role === 'merchant'
              ? 'Please select or enter your branch / company name'
              : 'Please enter your company name'
          );
          return;
        }
        setSignupStep(4);
      } else {
        // Staff: step 3 is specs — submit
        submitSignup();
      }
    } else if (signupStep === 4) {
      submitSignup();
    }
  };

  const goBack = () => {
    setError(null);
    if (signupStep === 3 && role === 'staff') {
      setSignupStep(2);
    } else if (signupStep > 1) {
      setSignupStep(signupStep - 1);
    }
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const submitSignup = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
          name: name.trim(),
          defaultGlobalSpecs: specs,
          role: role || null,
          company: companyValue.trim() || null,
          location: location || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data);
      } else {
        setError(data.error || 'Signup failed');
        setSignupStep(1);
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Determine visual step number for dots (staff has 3-step flow) ──────────

  const dotStep = role === 'staff' && signupStep >= 3 ? signupStep - 1 : signupStep;
  // Map signupStep to display labels
  const stepLabel = role === 'staff'
    ? ['Account', 'Role', 'Defaults'][dotStep - 1]
    : SIGNUP_STEPS[signupStep - 1];

  // ── Render ───────────────────────────────────────────────────────────────────

  // Widen container on specs step (step 4, or step 3 for staff)
  const isSpecsStep = (signupStep === 4) || (signupStep === 3 && role === 'staff');
  const cardWidth = isSpecsStep ? 'max-w-3xl' : 'max-w-[440px]';

  return (
    <div className="min-h-screen flex items-start sm:items-center justify-center sm:p-6 bg-white sm:bg-apple-bg pb-safe">
      <AnimatePresence mode="wait">
        <motion.div
          key={cardWidth}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className={`w-full ${cardWidth} sm:mt-0`}
        >
          <div className="sm:apple-card p-6 sm:p-10 flex flex-col items-center min-h-screen sm:min-h-0">

            {/* Logo */}
            <div className="mb-5 sm:mb-6">
              <img src="https://iddoors.co.nz/wp-content/uploads/2023/11/logo.svg" alt="Independent Doors" className="h-9 sm:h-10 w-auto" />
            </div>

            {/* Title */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">Independent Doors</h1>
              <p className="text-apple-gray font-medium mt-1">
                {mode === 'login' ? 'Sign in to your portal' : 'Create your trade account'}
              </p>
            </div>

            {/* Step dots (signup only) */}
            {mode === 'signup' && (
              <StepDots current={dotStep} total={totalSteps} />
            )}

            {/* ── LOGIN ────────────────────────────────────────────────────── */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="w-full space-y-5 sm:space-y-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-black/60 ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" strokeWidth={2} />
                    <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                      className="apple-input pl-12" placeholder="name@company.com" inputMode="email" autoComplete="email" autoCorrect="off" autoCapitalize="off" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-black/60 ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" strokeWidth={2} />
                    <input required type="password" value={password} onChange={e => setPassword(e.target.value)}
                      className="apple-input pl-12" placeholder="Required" autoComplete="current-password" />
                  </div>
                </div>
                {error && <ErrorBanner message={error} />}
                <button type="submit" disabled={isLoading}
                  className="apple-button-primary w-full flex items-center justify-center gap-2 mt-4">
                  {isLoading
                    ? <Spinner />
                    : <><span>Sign In</span><ArrowRight className="w-4 h-4" strokeWidth={3} /></>}
                </button>
              </form>
            )}

            {/* ── SIGNUP STEP 1 — Basic info ───────────────────────────────── */}
            {mode === 'signup' && signupStep === 1 && (
              <form onSubmit={goNext} className="w-full space-y-5 sm:space-y-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-black/60 ml-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" strokeWidth={2} />
                    <input required type="text" value={name} onChange={e => setName(e.target.value)}
                      className="apple-input pl-12" placeholder="John Doe" autoComplete="name" autoCapitalize="words" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-black/60 ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" strokeWidth={2} />
                    <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                      className="apple-input pl-12" placeholder="name@company.com" inputMode="email" autoComplete="email" autoCorrect="off" autoCapitalize="off" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-black/60 ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" strokeWidth={2} />
                    <input required type="password" value={password} onChange={e => setPassword(e.target.value)}
                      className="apple-input pl-12" placeholder="Required" autoComplete="current-password" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-black/60 ml-1">Branch Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20 pointer-events-none" strokeWidth={2} />
                    <select
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="apple-input pl-12 appearance-none bg-white cursor-pointer"
                    >
                      <option value="">Select your location…</option>
                      {LOCATIONS.map(l => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {error && <ErrorBanner message={error} />}
                <button type="submit" className="apple-button-primary w-full flex items-center justify-center gap-2">
                  Continue <ArrowRight className="w-4 h-4" strokeWidth={3} />
                </button>
              </form>
            )}

            {/* ── SIGNUP STEP 2 — Role selection ───────────────────────────── */}
            {mode === 'signup' && signupStep === 2 && (
              <div className="w-full space-y-3 sm:space-y-4">
                <p className="text-sm text-apple-gray font-medium text-center -mt-2 mb-4 sm:mb-6">
                  How will you be using the portal?
                </p>
                {ROLE_CARDS.map(card => {
                  const Icon = card.icon;
                  const isSelected = role === card.value;
                  return (
                    <button
                      key={card.value}
                      type="button"
                      onClick={() => { setRole(card.value); setError(null); }}
                      className={`w-full flex items-start gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl border-2 text-left transition-all active:scale-[0.99] ${
                        isSelected
                          ? 'border-apple-blue bg-apple-blue/[0.04] shadow-sm'
                          : 'border-black/[0.06] hover:border-black/[0.12] bg-white'
                      }`}
                    >
                      <div className={`p-2.5 sm:p-3 rounded-xl border flex-shrink-0 mt-0.5 ${
                        isSelected ? 'bg-apple-blue/10 border-apple-blue/20 text-apple-blue' : card.color
                      }`}>
                        <Icon className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold text-base tracking-tight ${isSelected ? 'text-apple-blue' : 'text-black'}`}>
                            {card.title}
                          </span>
                          {isSelected && (
                            <div className="w-5 h-5 bg-apple-blue rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <p className="text-[13px] text-apple-gray font-medium mt-1 leading-relaxed">
                          {card.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
                {error && <ErrorBanner message={error} />}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={goBack}
                    className="apple-button-secondary flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
                    Back
                  </button>
                  <button type="button" onClick={() => goNext()}
                    disabled={!role}
                    className="apple-button-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40">
                    Continue <ArrowRight className="w-4 h-4" strokeWidth={3} />
                  </button>
                </div>
              </div>
            )}

            {/* ── SIGNUP STEP 3 — Role details (merchant / builder) ─────────── */}
            {mode === 'signup' && signupStep === 3 && role !== 'staff' && (
              <div className="w-full space-y-5 sm:space-y-6">
                <p className="text-sm text-apple-gray font-medium text-center -mt-2 mb-2">
                  {role === 'merchant'
                    ? 'Which branch or company are you ordering for?'
                    : 'What is your company name?'}
                </p>

                {role === 'merchant' ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold text-black/60 ml-1">Select your merchant</label>
                      {/* Single column on mobile, 2-col on sm+ */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {NZ_MERCHANTS.map(m => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => { setSelectedMerchant(m); setCustomCompany(''); setError(null); }}
                            className={`py-3 px-4 rounded-2xl border-2 text-sm font-semibold transition-all text-left active:scale-[0.98] min-h-[44px] ${
                              selectedMerchant === m
                                ? 'border-apple-blue text-apple-blue bg-apple-blue/[0.04]'
                                : 'border-black/[0.07] text-black/70 hover:border-black/20 bg-white'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => { setSelectedMerchant('__custom__'); setError(null); }}
                          className={`py-3 px-4 rounded-2xl border-2 text-sm font-semibold transition-all text-left active:scale-[0.98] min-h-[44px] ${
                            selectedMerchant === '__custom__'
                              ? 'border-apple-blue text-apple-blue bg-apple-blue/[0.04]'
                              : 'border-dashed border-black/[0.12] text-black/40 hover:border-black/30 bg-white'
                          }`}
                        >
                          Other…
                        </button>
                      </div>
                    </div>
                    {selectedMerchant === '__custom__' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                      >
                        <label className="text-[13px] font-semibold text-black/60 ml-1">Company / branch name</label>
                        <input
                          type="text"
                          value={customCompany}
                          onChange={e => setCustomCompany(e.target.value)}
                          className="apple-input"
                          placeholder="e.g. Mico, Plumbing World…"
                          autoFocus
                        />
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold text-black/60 ml-1">Company name</label>
                    <div className="relative">
                      <Wrench className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" strokeWidth={2} />
                      <input
                        type="text"
                        value={customCompany}
                        onChange={e => setCustomCompany(e.target.value)}
                        className="apple-input pl-12"
                        placeholder="e.g. Smith Build Ltd"
                      />
                    </div>
                  </div>
                )}

                {error && <ErrorBanner message={error} />}
                <div className="flex gap-3">
                  <button type="button" onClick={goBack}
                    className="apple-button-secondary flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
                    Back
                  </button>
                  <button type="button" onClick={() => goNext()}
                    className="apple-button-primary flex-1 flex items-center justify-center gap-2">
                    Continue <ArrowRight className="w-4 h-4" strokeWidth={3} />
                  </button>
                </div>
              </div>
            )}

            {/* ── SIGNUP STEP 3 (staff) / STEP 4 — Global spec defaults ─────── */}
            {mode === 'signup' && isSpecsStep && (
              <div className="w-full space-y-6 sm:space-y-8">
                <div className="text-center -mt-2">
                  <p className="text-sm text-apple-gray font-medium">
                    Set your default specs — these pre-fill every new order.
                  </p>
                  <p className="text-xs text-black/30 font-medium mt-1">You can change these any time in Account Settings.</p>
                </div>
                <GlobalSpecsCard specs={specs} onChange={handleSpecsChange} />
                {error && <ErrorBanner message={error} />}
                <div className="flex gap-3">
                  <button type="button" onClick={goBack}
                    className="apple-button-secondary flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => goNext()}
                    disabled={isLoading}
                    className="apple-button-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {isLoading
                      ? <Spinner />
                      : <><Check className="w-4 h-4" strokeWidth={3} /> Create Account</>}
                  </button>
                </div>
              </div>
            )}

            {/* ── Toggle login/signup ──────────────────────────────────────── */}
            <button
              type="button"
              onClick={() => {
                if (mode === 'login') {
                  setMode('signup');
                  resetSignup();
                  setError(null);
                } else {
                  setMode('login');
                  resetSignup();
                  setError(null);
                }
              }}
              className="mt-5 sm:mt-6 text-[13px] font-bold text-apple-blue hover:underline"
            >
              {mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </button>

            <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-black/[0.05] w-full flex items-center justify-center gap-2 text-apple-gray text-[13px] font-medium">
              <ShieldCheck className="w-4 h-4" strokeWidth={2} />
              Secure Trade Access
            </div>
          </div>

          <p className="text-center mt-6 sm:mt-8 text-apple-gray text-[12px] font-medium">
            © {new Date().getFullYear()} Independent Doors Ltd.
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <p className="text-red-500 text-[13px] font-semibold text-center bg-red-50 py-2.5 px-4 rounded-xl border border-red-100">
      {message}
    </p>
  );
}

function Spinner() {
  return <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />;
}
