import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useShop } from '../../context/ShopContext';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Store, 
  ShieldCheck, 
  ShoppingBag, 
  Sparkles, 
  ArrowRight, 
  Building2,
  CheckCircle2,
  Phone
} from 'lucide-react';
import { DEMO_SHOP_OWNER_1, DEMO_SHOP_OWNER_2 } from '../../lib/demoData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'merchant_signin' | 'customer_signin' | 'signup';
  onAuthenticated?: (targetMode: 'storefront' | 'admin' | 'super_admin') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'merchant_signin',
  onAuthenticated
}) => {
  const { loginWithEmail, signupWithEmail, loginWithGoogle, switchDemoRole } = useAuth();
  const { shops, setActiveShopId } = useShop();

  const [mode, setMode] = useState<'merchant_signin' | 'customer_signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'merchant_signin') {
        const user = await loginWithEmail(email, password);
        if (email.toLowerCase() === 'seikhsarif16@gmail.com' || user?.email?.toLowerCase() === 'seikhsarif16@gmail.com') {
          if (onAuthenticated) onAuthenticated('super_admin');
        } else {
          if (onAuthenticated) onAuthenticated('admin');
        }
      } else if (mode === 'customer_signin') {
        await loginWithEmail(email, password);
        if (onAuthenticated) onAuthenticated('storefront');
      } else {
        await signupWithEmail(email, password, name, 'shop_owner');
        if (onAuthenticated) onAuthenticated('admin');
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    try {
      await loginWithGoogle();
      if (onAuthenticated) onAuthenticated('admin');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google sign-in was cancelled or failed.');
    }
  };

  const handleQuickDemo = (role: 'shop_owner' | 'customer' | 'admin' | 'super_admin', ownerId?: string, shopId?: string) => {
    switchDemoRole(role, ownerId);
    if (shopId) {
      setActiveShopId(shopId);
    }
    if (onAuthenticated) {
      if (role === 'super_admin') {
        onAuthenticated('super_admin');
      } else if (role === 'shop_owner' || role === 'admin') {
        onAuthenticated('admin');
      } else {
        onAuthenticated('storefront');
      }
    }
    onClose();
  };

  return (
    <div id="auth-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div id="auth-dialog" className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="relative bg-slate-900 text-white p-6 pb-5">
          <button
            id="close-auth-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">KGN SHOP SaaS Auth</span>
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'merchant_signin' && 'Merchant Portal Sign In'}
            {mode === 'customer_signin' && 'Customer Sign In'}
            {mode === 'signup' && 'Register New Merchant Shop'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'merchant_signin' && 'Access your isolated catalog, POS billing & Khata ledger'}
            {mode === 'customer_signin' && 'Track online delivery orders and purchase receipts'}
            {mode === 'signup' && 'Launch a dedicated digital storefront with instant QR checkout'}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 p-1 text-xs">
          <button
            type="button"
            onClick={() => setMode('merchant_signin')}
            className={`flex-1 py-2 text-center rounded-lg font-bold transition ${
              mode === 'merchant_signin' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Merchant Login
          </button>
          <button
            type="button"
            onClick={() => setMode('customer_signin')}
            className={`flex-1 py-2 text-center rounded-lg font-bold transition ${
              mode === 'customer_signin' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Customer Login
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 text-center rounded-lg font-bold transition ${
              mode === 'signup' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Register Store
          </button>
        </div>

        {/* Sandbox Quick Logins */}
        <div className="bg-slate-50 border-b border-slate-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-600" />
              Instant Sandbox Switcher (Zero Config)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              id="demo-login-kgn-btn"
              onClick={() => handleQuickDemo('shop_owner', DEMO_SHOP_OWNER_1, 'shop_kgn_01')}
              className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition shadow-2xs group"
            >
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Shop A: KGN Market</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">owner_kgn_main</div>
            </button>

            <button
              id="demo-login-almadina-btn"
              onClick={() => handleQuickDemo('shop_owner', DEMO_SHOP_OWNER_2, 'shop_al_madina_02')}
              className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition shadow-2xs group"
            >
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>Shop B: Al-Madina</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">owner_al_madina</div>
            </button>

            <button
              id="demo-login-customer-btn"
              onClick={() => handleQuickDemo('customer')}
              className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition shadow-2xs"
            >
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                <ShoppingBag className="w-3 h-3 text-amber-600" />
                <span>Buyer / Shopper</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Storefront Cart & Orders</div>
            </button>

            <button
              id="demo-login-admin-btn"
              onClick={() => handleQuickDemo('super_admin')}
              className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition shadow-2xs"
            >
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                <ShieldCheck className="w-3 h-3 text-purple-600" />
                <span>Super Admin</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">All Tenants & Approvals</div>
            </button>
          </div>
        </div>

        {/* Email & Password Form */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name / Merchant Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Haji Sarif"
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-900 focus:outline-none transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="merchant@kgnshop.com"
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-900 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-900 focus:outline-none transition"
                />
              </div>
            </div>

            <button
              id="submit-auth-form-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? 'Processing...' : (
                mode === 'signup' ? 'Create Merchant Account' : 'Sign In Securely'
              )}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Social Sign In */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              id="google-signin-btn"
              type="button"
              onClick={handleGoogle}
              className="w-full py-2 px-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
