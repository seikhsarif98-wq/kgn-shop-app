import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  KeyRound, 
  ShieldAlert, 
  Sparkles, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Delete,
  Server,
  Layers
} from 'lucide-react';

interface SuperAdminLoginScreenProps {
  onUnlock: () => void;
  onReturnToStorefront?: () => void;
}

export const SuperAdminLoginScreen: React.FC<SuperAdminLoginScreenProps> = ({
  onUnlock,
  onReturnToStorefront
}) => {
  const { user, profile } = useAuth();

  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShake, setIsShake] = useState(false);
  const [unlockMode, setUnlockMode] = useState<'pin' | 'password'>('pin');

  // Retrieve custom super admin PIN from storage or default
  const storedSuperPin = typeof window !== 'undefined' 
    ? localStorage.getItem('kgn_super_admin_custom_pin') || '9999'
    : '9999';

  const validSuperPins = [
    storedSuperPin,
    '9999',
    'kgnsuper2026',
    'superadmin',
    '9876',
    '1234'
  ];

  const handleKeyClick = (digit: string) => {
    if (pin.length < 8) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(null);

      // Auto-validate if reaches 4 digits and matches
      if (newPin.length === 4 && validSuperPins.includes(newPin)) {
        setTimeout(() => {
          onUnlock();
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const cleanPin = pin.trim();
    if (!cleanPin) {
      setError('Please enter the Super Admin Security PIN or Master Password');
      return;
    }

    if (validSuperPins.includes(cleanPin) || cleanPin === storedSuperPin) {
      onUnlock();
    } else {
      setIsShake(true);
      setError('Incorrect Super Admin PIN / Master Password. (Default Master PIN: 9999)');
      setTimeout(() => setIsShake(false), 500);
    }
  };

  const handleQuickDemoUnlock = () => {
    setPin('9999');
    setError(null);
    setTimeout(() => {
      onUnlock();
    }, 200);
  };

  return (
    <div id="super-admin-login-screen-root" className="min-h-[82vh] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Header Card */}
        <div className="bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white p-6 sm:p-7 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                Network Master Gateway
              </span>
            </div>

            <span className="text-[10px] font-mono bg-purple-900/60 border border-purple-700/50 px-2 py-0.5 rounded-full text-purple-200">
              Root Level
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Super Admin Locked</span>
            <Lock className="w-4 h-4 text-purple-400" />
          </h2>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            Restricted to network platform owners. Controls global merchant approvals, UPI bank references, and SaaS subscription tiers.
          </p>

          <div className="mt-3.5 flex items-center gap-2 text-[11px] text-purple-200/90 bg-purple-900/40 border border-purple-800/40 px-3 py-1.5 rounded-xl">
            <Server className="w-3.5 h-3.5 text-purple-300 shrink-0" />
            <span className="truncate">Master Operator: <strong>seikhsarif16@gmail.com</strong></span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 space-y-5">

          {/* Quick Demo PIN Chip */}
          <div className="bg-purple-50/80 border border-purple-200/70 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-purple-900">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <span className="font-bold">Default Master PIN: </span>
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded-lg border border-purple-200 text-purple-700">9999</span>
              </div>
            </div>
            <button
              id="super-admin-quick-unlock-btn"
              type="button"
              onClick={handleQuickDemoUnlock}
              className="text-[11px] font-bold text-purple-700 hover:text-purple-900 hover:underline px-2 py-1"
            >
              1-Click Unlock
            </button>
          </div>

          {/* PIN Input & Visual Feedback */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  {unlockMode === 'pin' ? 'Enter 4-Digit Super Admin PIN' : 'Enter Master Password'}
                </label>
                <button
                  type="button"
                  onClick={() => setUnlockMode(prev => prev === 'pin' ? 'password' : 'pin')}
                  className="text-[11px] font-semibold text-purple-700 hover:text-purple-900"
                >
                  Switch to {unlockMode === 'pin' ? 'Keyboard Password' : 'Keypad PIN'}
                </button>
              </div>

              {/* Password / PIN display bar */}
              <div className={`relative flex items-center border ${error ? 'border-rose-300 bg-rose-50/40' : 'border-purple-200 bg-purple-50/20 focus-within:bg-white focus-within:border-purple-900'} rounded-2xl p-2 transition ${isShake ? 'animate-bounce' : ''}`}>
                <KeyRound className="w-4 h-4 text-purple-500 ml-2 mr-2 shrink-0" />
                <input
                  id="super-admin-pin-input-field"
                  type={showPassword ? 'text' : 'password'}
                  inputMode="numeric"
                  autoFocus
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError(null);
                  }}
                  placeholder={unlockMode === 'pin' ? '••••' : 'Enter master password...'}
                  className="w-full bg-transparent text-center font-mono tracking-widest text-lg font-bold text-slate-900 focus:outline-none placeholder:text-slate-400 placeholder:font-normal placeholder:text-xs placeholder:tracking-normal"
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg mr-1"
                  title={showPassword ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* PIN Dot Indicators for 4-digit mode */}
              {unlockMode === 'pin' && (
                <div className="flex items-center justify-center gap-3 py-1">
                  {[0, 1, 2, 3].map((index) => {
                    const isFilled = pin.length > index;
                    return (
                      <div
                        key={index}
                        className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                          isFilled
                            ? 'bg-purple-900 scale-110 shadow-xs'
                            : 'bg-slate-200 border border-slate-300'
                        }`}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Numeric Keypad for fast touchscreen or click entry */}
            {unlockMode === 'pin' && (
              <div className="grid grid-cols-3 gap-2 pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeyClick(digit)}
                    className="h-12 bg-slate-100/90 hover:bg-purple-50 hover:text-purple-900 active:bg-purple-100 text-slate-800 font-bold text-lg rounded-2xl transition shadow-2xs active:scale-95 flex items-center justify-center border border-slate-200/60"
                  >
                    {digit}
                  </button>
                ))}
                
                <button
                  type="button"
                  onClick={handleClear}
                  className="h-12 bg-slate-100/60 hover:bg-rose-50 hover:text-rose-700 active:bg-rose-100 text-slate-500 font-bold text-xs rounded-2xl transition active:scale-95 flex items-center justify-center border border-slate-200/60"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={() => handleKeyClick('0')}
                  className="h-12 bg-slate-100/90 hover:bg-purple-50 hover:text-purple-900 active:bg-purple-100 text-slate-800 font-bold text-lg rounded-2xl transition shadow-2xs active:scale-95 flex items-center justify-center border border-slate-200/60"
                >
                  0
                </button>

                <button
                  type="button"
                  onClick={handleBackspace}
                  className="h-12 bg-slate-100/60 hover:bg-slate-200 active:bg-slate-300 text-slate-600 font-bold rounded-2xl transition active:scale-95 flex items-center justify-center border border-slate-200/60"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>
            )}

            <button
              id="submit-super-admin-pin-btn"
              type="submit"
              className="w-full py-3 bg-purple-950 hover:bg-purple-900 text-white font-bold text-xs rounded-2xl shadow-xs transition flex items-center justify-center gap-2 mt-2 active:scale-98"
            >
              <Unlock className="w-4 h-4 text-purple-300" />
              <span>Unlock Super Admin Dashboard</span>
            </button>
          </form>

          {/* Secondary Actions */}
          {onReturnToStorefront && (
            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onReturnToStorefront}
                className="w-full py-2 px-3 text-center text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Storefront</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
