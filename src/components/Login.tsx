import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DoorOpen, Lock, Mail, ArrowRight, ShieldCheck, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface Props {
  onLogin: (user: User) => void;
}

export const Login: React.FC<Props> = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
    const body = isSignup ? { email, password, name } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        onLogin(data);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-apple-bg">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-[400px]"
      >
        <div className="apple-card p-10 flex flex-col items-center">
          <div className="bg-apple-blue p-4 rounded-[22%] shadow-lg shadow-apple-blue/20 mb-8">
            <DoorOpen className="text-white w-10 h-10" strokeWidth={2.5} />
          </div>
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-black tracking-tight">Independent Doors</h1>
            <p className="text-apple-gray font-medium mt-1">
              {isSignup ? 'Create your trade account' : 'Sign in to your portal'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <AnimatePresence mode="wait">
              {isSignup && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-[13px] font-semibold text-black/60 ml-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" strokeWidth={2} />
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="apple-input pl-12"
                      placeholder="John Doe"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-black/60 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" strokeWidth={2} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="apple-input pl-12"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-black/60 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" strokeWidth={2} />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="apple-input pl-12"
                  placeholder="Required"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-[13px] font-semibold text-center bg-red-50 py-2 rounded-xl border border-red-100">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="apple-button-primary w-full flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isSignup ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" strokeWidth={3} />
                </>
              )}
            </button>
          </form>

          <button
            onClick={() => setIsSignup(!isSignup)}
            className="mt-6 text-[13px] font-bold text-apple-blue hover:underline"
          >
            {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>

          <div className="mt-10 pt-8 border-t border-black/[0.05] w-full flex items-center justify-center gap-2 text-apple-gray text-[13px] font-medium">
            <ShieldCheck className="w-4 h-4" strokeWidth={2} />
            Secure Trade Access
          </div>
        </div>
        
        <p className="text-center mt-8 text-apple-gray text-[12px] font-medium">
          © {new Date().getFullYear()} Independent Doors Ltd.
        </p>
      </motion.div>
    </div>
  );
};
