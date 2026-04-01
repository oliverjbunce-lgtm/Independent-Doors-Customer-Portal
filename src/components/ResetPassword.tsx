import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center sm:p-6 bg-white sm:bg-apple-bg pb-safe">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-[440px]"
      >
        <div className="sm:apple-card p-6 sm:p-10 flex flex-col items-center">

          {/* Logo */}
          <div className="mb-5 sm:mb-6">
            <img
              src="https://iddoors.co.nz/wp-content/uploads/2023/11/logo.svg"
              alt="Independent Doors"
              className="h-9 sm:h-10 w-auto"
            />
          </div>

          {/* Title */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">Independent Doors</h1>
            <p className="text-apple-gray font-medium mt-1">
              {success ? 'Password updated' : 'Set a new password'}
            </p>
          </div>

          {/* No token */}
          {!token && !success && (
            <div className="w-full text-center space-y-4">
              <p className="text-[14px] text-red-500 font-semibold bg-red-50 py-3 px-4 rounded-xl border border-red-100">
                Invalid reset link — no token found.
              </p>
              <a href="/" className="text-[13px] font-bold text-apple-blue hover:underline block">
                ← Back to portal
              </a>
            </div>
          )}

          {/* Success state */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full text-center space-y-4"
            >
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7 text-emerald-600" strokeWidth={2} />
              </div>
              <div>
                <p className="font-bold text-black text-base">Password updated</p>
                <p className="text-[14px] text-apple-gray font-medium mt-1">
                  Your password has been changed successfully.
                </p>
              </div>
              <a
                href="/"
                className="apple-button-primary w-full flex items-center justify-center gap-2 no-underline"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" strokeWidth={3} />
              </a>
            </motion.div>
          )}

          {/* Reset form */}
          {token && !success && (
            <form onSubmit={handleSubmit} className="w-full space-y-5 sm:space-y-6">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-black/60 ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" strokeWidth={2} />
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="apple-input pl-12"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-black/60 ml-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" strokeWidth={2} />
                  <input
                    required
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    className="apple-input pl-12"
                    placeholder="Repeat new password"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-[13px] font-semibold text-center bg-red-50 py-2.5 px-4 rounded-xl border border-red-100">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="apple-button-primary w-full flex items-center justify-center gap-2 mt-4"
              >
                {isLoading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>Update Password</span><ArrowRight className="w-4 h-4" strokeWidth={3} /></>}
              </button>

              <div className="text-center">
                <a href="/" className="text-[13px] font-bold text-apple-blue hover:underline">
                  ← Back to portal
                </a>
              </div>
            </form>
          )}

          <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-black/[0.05] w-full flex items-center justify-center gap-2 text-apple-gray text-[13px] font-medium">
            <ShieldCheck className="w-4 h-4" strokeWidth={2} />
            Secure Trade Access
          </div>
        </div>

        <p className="text-center mt-6 sm:mt-8 text-apple-gray text-[12px] font-medium">
          © {new Date().getFullYear()} Independent Doors Ltd.
        </p>
      </motion.div>
    </div>
  );
};
