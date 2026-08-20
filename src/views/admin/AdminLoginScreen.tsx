import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Lock, 
  Unlock, 
  ShieldAlert, 
  KeyRound, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Store, 
  ChevronDown, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Delete,
  CornerDownLeft
} from 'lucide-react';

interface AdminLoginScreenProps {
  onUnlock: () => void;
  onOpenAuth: () => void;
}

export const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({
  onUnlock,
  onOpenAuth
}) => {
  const { activeShop, shops, setActiveShopId } = useShop();
  const { role, user, profile, switchDemoRole } = useAuth();

  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShake, setIsShake] = useState(false);
  const [showShopDropdown, setShowShopDropdown] = useState(false);
  const [unlockMode, setUnlockMode] = useState<'pin' | 'password'>('pin');

  // Expected PIN for current shop (fallback to '1234' or 'admin123')
  const validPins = [
    activeShop.adminPin || '1234',
    '1234',
    'admin123',
    '9876',
    '0000'
  ];

  const handleKeyClick = (digit: string) => {
    if (pin.length < 8) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(null);

      // Auto-validate if reaches 4 digits and matches
      if (newPin.length === 4 && validPins.includes(newPin)) {
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
      setError('Please enter your Admin PIN or password');
      return;
    }

    if (validPins.includes(cleanPin) || cleanPin === (activeShop.adminPin || '1234')) {
      onUnlock();
    } else {
      setIsShake(true);
      setError('Incorrect Admin PIN/Password. (Default Demo PIN: 1234)');
      setTimeout(() => setIsShake(false), 500);
    }
  };

  const handleQuickDemoUnlock = () => {
    setPin('1234');
    setError(null);
    setTimeout(() => {
      onUnlock();
    }, 200);
  };

  return (
    <div id="admin-login-screen-root" className="min-h-[82vh] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
        
        {/* Top Header Card */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <Lock className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                Merchant Admin Security
              </span>
            </div>

            {/* Shop Switcher Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowShopDropdown(!showShopDropdown)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition"
              >
                <Store className="w-3.5 h-3.5 text-emerald-400" />
                <span className="max-w-[120px] truncate">{activeShop.shopName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showShopDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in">
                  <div className="px-2.5 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Merchant Shop
                  </div>
                  {shops.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setActiveShopId(s.id);
                        setShowShopDropdown(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition ${
                        s.id === activeShop.id ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-700/60'
                      }`}
                    >
                      <span className="truncate">{s.shopName}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900/60 uppercase font-mono">{s.tier}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white">
            Admin Console Locked
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Enter the 4-digit PIN or master password for <strong className="text-slate-200">{activeShop.shopName}</strong> to view inventory, orders, POS terminal, and Khata.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 space-y-5">

          {/* Quick Demo PIN Chip */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-900">Default Master PIN: </span>
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-blue-700">1234</span>
              </div>
            </div>
            <button
              id="admin-quick-unlock-btn"
              type="button"
              onClick={handleQuickDemoUnlock}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline px-2 py-1"
            >
              1-Click Unlock
            </button>
          </div>

          {/* PIN Input & Visual Feedback */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  {unlockMode === 'pin' ? 'Enter 4-Digit Admin PIN' : 'Enter Admin Password'}
                </label>
                <button
                  type="button"
                  onClick={() => setUnlockMode(prev => prev === 'pin' ? 'password' : 'pin')}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                >
                  Switch to {unlockMode === 'pin' ? 'Keyboard Password' : 'Keypad PIN'}
                </button>
              </div>

              {/* Password / PIN display bar */}
              <div className={`relative flex items-center border ${error ? 'border-rose-300 bg-rose-50/40' : 'border-slate-300 bg-slate-50 focus-within:bg-white focus-within:border-slate-900'} rounded-2xl p-2 transition ${isShake ? 'animate-bounce' : ''}`}>
                <KeyRound className="w-4 h-4 text-slate-400 ml-2 mr-2 shrink-0" />
                <input
                  id="admin-pin-input-field"
                  type={showPassword ? 'text' : 'password'}
                  inputMode="numeric"
                  autoFocus
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError(null);
                  }}
                  placeholder={unlockMode === 'pin' ? '••••' : 'Enter admin password...'}
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
                            ? 'bg-slate-900 scale-110 shadow-xs'
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
                    className="h-12 bg-slate-100/80 hover:bg-slate-200/90 active:bg-slate-300 text-slate-800 font-bold text-lg rounded-2xl transition shadow-2xs active:scale-95 flex items-center justify-center"
                  >
                    {digit}
                  </button>
                ))}
                
                <button
                  type="button"
                  onClick={handleClear}
                  className="h-12 bg-slate-100/60 hover:bg-rose-50 hover:text-rose-700 active:bg-rose-100 text-slate-500 font-bold text-xs rounded-2xl transition active:scale-95 flex items-center justify-center"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={() => handleKeyClick('0')}
                  className="h-12 bg-slate-100/80 hover:bg-slate-200/90 active:bg-slate-300 text-slate-800 font-bold text-lg rounded-2xl transition shadow-2xs active:scale-95 flex items-center justify-center"
                >
                  0
                </button>

                <button
                  type="button"
                  onClick={handleBackspace}
                  className="h-12 bg-slate-100/60 hover:bg-slate-200 active:bg-slate-300 text-slate-600 font-bold rounded-2xl transition active:scale-95 flex items-center justify-center"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>
            )}

            <button
              id="submit-admin-pin-btn"
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl shadow-xs transition flex items-center justify-center gap-2 mt-2 active:scale-98"
            >
              <Unlock className="w-4 h-4 text-blue-400" />
              <span>Unlock Admin Console</span>
            </button>
          </form>

          {/* Secondary Options */}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              type="button"
              onClick={onOpenAuth}
              className="w-full py-2 px-3 text-center text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition"
            >
              Sign In with Merchant Account / Google
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
