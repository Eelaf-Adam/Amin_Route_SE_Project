import React, { useState } from 'react';
import { Shield, Mail, Lock, User, Eye, EyeOff, X, Check, ArrowRight } from 'lucide-react';

export default function Auth({ onLoginSuccess }) {
  // Mode options: 'landing' | 'login' | 'signup'
  const [mode, setMode] = useState('landing');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');

    const backendUrl = import.meta.env.VITE_API_URL || '';

    try {
      if (mode === 'signup') {
        const res = await fetch(`${backendUrl}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: fullName || email.split('@')[0],
            email: email,
            password: password,
            language_pref: 'en'
          })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.detail || 'Failed to create account');
        }
        // Successfully registered user in PostgreSQL
        onLoginSuccess({
          name: fullName || email.split('@')[0],
          email: email,
          phone: '',
          emergencyContact: '',
          homeAddress: ''
        });
      } else {
        const res = await fetch(`${backendUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            password: password
          })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.detail || 'Invalid email or password');
        }
        if (data.access_token) {
          localStorage.setItem('token', data.access_token);
        }
        const userData = data?.user || {};
        onLoginSuccess({
          id: userData.id || '',
          name: userData.name || data?.name || fullName || email.split('@')[0],
          email: userData.email || email,
          language_pref: userData.language_pref || 'en',
          phone: userData.phone || '',
          emergencyContact: userData.emergencyContact || '',
          homeAddress: userData.homeAddress || ''
        });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Make sure backend is running.');
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSent(true);
  };

  // 1. Landing Screen View
  if (mode === 'landing') {
    return (
      <div className="min-h-screen bg-blue-600 text-white flex flex-col justify-between p-6 sm:p-8 md:p-12 relative shadow-lg">
        <div className="flex-1 flex flex-col items-center justify-center text-center my-auto">
          <div className="w-24 h-24 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-6 shadow-xl backdrop-blur-sm">
            <Shield size={48} className="text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Aminroute</h1>
          <p className="text-blue-100 text-sm sm:text-base mt-2 font-medium max-w-sm">
            Navigating Safe roads in Conflict Affected Regions
          </p>
        </div>

        <div className="space-y-3 pb-6 max-w-md w-full mx-auto">
          <button
            onClick={() => setMode('login')}
            className="w-full bg-white text-blue-600 font-bold py-3.5 rounded-2xl shadow-md hover:bg-blue-50 transition active:scale-[0.98] cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  // 2. Log In & 3. Sign Up Views
  return (
    <div className="min-h-screen bg-blue-600 text-white flex flex-col justify-between p-6 sm:p-8 relative shadow-lg">
      {/* Top Shield Header */}
      <div className="flex flex-col items-center pt-8 pb-4">
        <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-3 shadow-lg">
          <Shield size={32} className="text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold">Aminroute</h1>
        <p className="text-blue-100 text-xs sm:text-sm">Navigating Safe roads in Conflict Affected Regions</p>
      </div>

      {/* White Form Card */}
      <div className="bg-white text-gray-900 rounded-3xl p-6 sm:p-8 shadow-xl max-w-md w-full mx-auto my-auto relative">
        <h2 className="text-xl font-bold text-center text-gray-900 mb-6">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-4 font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name (Sign Up only) */}
          {mode === 'signup' && (
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>
          )}

          {/* Email Address */}
          <div className="relative">
            <Mail size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {mode === 'login' && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setResetSent(false);
                  setIsForgotModalOpen(true);
                }}
                className="text-xs text-blue-600 font-medium hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-2xl shadow-md hover:bg-blue-700 transition mt-2 active:scale-[0.98] cursor-pointer"
          >
            {mode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {/* Mode Switcher */}
        <div className="text-center mt-6 text-xs text-gray-500">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>

      {/* MODAL: FORGOT PASSWORD */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-fadeIn space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <Lock className="text-blue-600" size={20} />
                <span>Reset Password</span>
              </h3>
              <button onClick={() => setIsForgotModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {!resetSent ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-xs text-gray-600">
                  Enter your account email address and we will send you a password reset verification link.
                </p>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Enter registered email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
                    required
                  />
                </div>
                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-bold text-xs rounded-xl hover:bg-gray-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 shadow-md cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <Check size={24} />
                </div>
                <h4 className="font-bold text-sm text-gray-900">Reset Email Sent!</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  We've sent password reset instructions to <strong className="text-gray-800">{resetEmail}</strong>.
                </p>
                <button
                  onClick={() => setIsForgotModalOpen(false)}
                  className="w-full py-2.5 bg-gray-900 text-white font-bold text-xs rounded-xl hover:bg-gray-800 cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer disclaimer */}
      <p className="text-[10px] text-center text-blue-100 py-2">
        By continuing, you agree to our Terms & Privacy Policy
      </p>
    </div>
  );
}