import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Receipt, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings, 
  Zap, 
  Plus, 
  Store, 
  ShieldAlert, 
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Building2,
  Lock,
  LogOut,
  KeyRound,
  Shield
} from 'lucide-react';
import { AdminLoginScreen } from './AdminLoginScreen';
import { DashboardOverview } from './DashboardOverview';
import { ProductManagement } from './ProductManagement';
import { PosTerminal } from './PosTerminal';
import { OrdersManager } from './OrdersManager';
import { KhataManager } from './KhataManager';
import { ShopSettings } from './ShopSettings';
import { SubscriptionPlans } from './SubscriptionPlans';
import { NewShopModal } from './NewShopModal';

export type AdminTab = 'overview' | 'pos' | 'catalog' | 'orders' | 'khata' | 'settings' | 'subscription';

interface AdminPortalViewProps {
  onOpenAuth: () => void;
  onNavigateToStorefront?: (slug?: string) => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({ 
  onOpenAuth,
  onNavigateToStorefront 
}) => {
  const { activeShop, shops, setActiveShopId, canAccess } = useShop();
  const { user, profile, isDemoMode, switchDemoRole, activeShopOwnerId, role } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isNewShopModalOpen, setIsNewShopModalOpen] = useState(false);

  // Secure Password/PIN Lock Screen State - automatically unlocked for authenticated users
  const [isPinUnlocked, setIsPinUnlocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const stored = sessionStorage.getItem(`kgn_admin_unlocked_${activeShop.id}`);
      if (stored !== null) return stored === 'true';
    }
    // Authenticated users directly enter without roadblock
    return true;
  });

  // Re-verify lock when active shop switches
  useEffect(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const isShopUnlocked = sessionStorage.getItem(`kgn_admin_unlocked_${activeShop.id}`) === 'true';
      setIsPinUnlocked(isShopUnlocked);
    }
  }, [activeShop.id]);

  const handleUnlock = () => {
    setIsPinUnlocked(true);
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(`kgn_admin_unlocked_${activeShop.id}`, 'true');
    }
  };

  const handleLockTerminal = () => {
    setIsPinUnlocked(false);
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem(`kgn_admin_unlocked_${activeShop.id}`);
    }
  };

  // 1. Role verification: allow shop_owner or admin, or prompt merchant sign-in
  const isAuthorized = role === 'shop_owner' || role === 'admin' || role === 'super_admin';

  if (!isAuthorized) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
            <Store className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">Merchant Sign In Required</h2>
            <p className="text-xs text-slate-500 mt-1">
              Please sign in with your store owner credentials to access the POS terminal, catalog inventory, and Khata ledger.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              id="admin-portal-signin-btn"
              onClick={onOpenAuth}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Merchant Sign In / Register</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. PASSWORD / PIN LOCK SCREEN GUARD
  // All products, orders, POS terminal and controls remain strictly hidden until correct PIN/password is entered.
  if (!isPinUnlocked) {
    return (
      <AdminLoginScreen 
        onUnlock={handleUnlock}
        onOpenAuth={onOpenAuth}
      />
    );
  }

  const hasPos = canAccess('pos');
  const hasKhata = canAccess('khata');

  const navItems: Array<{ 
    id: AdminTab; 
    label: string; 
    icon: React.FC<{ className?: string }>;
    locked?: boolean;
    tierRequired?: string;
  }> = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'Point of Sale (POS)', icon: Receipt, locked: !hasPos, tierRequired: '₹199' },
    { id: 'catalog', label: 'Product Catalog', icon: Package },
    { id: 'orders', label: 'Live Orders', icon: ShoppingBag },
    { id: 'khata', label: 'Khata Ledger', icon: Users, locked: !hasKhata, tierRequired: '₹499' },
    { id: 'settings', label: 'Shop Settings', icon: Settings },
    { id: 'subscription', label: 'Plans & Limits', icon: Zap },
  ];

  return (
    <div id="admin-portal-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-150">
      
      {/* Top Security & Admin Terminal Bar */}
      <div className="mb-6 bg-white rounded-2xl border border-slate-200 shadow-2xs p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
            {activeShop.shopName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">{activeShop.shopName}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Admin Unlocked</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Store PIN: <strong className="text-slate-700">{activeShop.adminPin || '1234'}</strong> • <span className="text-emerald-700 font-bold">Store Active</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="admin-lock-terminal-btn"
            onClick={handleLockTerminal}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-2xs"
            title="Lock the admin screen"
          >
            <Lock className="w-3.5 h-3.5 text-rose-600" />
            <span>Lock Terminal</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Clean Minimal Sidebar */}
        <div className="w-full md:w-64 bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-6 shrink-0">
          
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              Merchant Management
            </h3>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`admin-nav-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.locked && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5 text-slate-400" />
                          {item.tierRequired}
                        </span>
                      )}
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Add New Shop / Branch Button */}
          <div>
            <button
              id="admin-launch-new-shop-btn"
              onClick={() => setIsNewShopModalOpen(true)}
              className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              <span>Register New Shop</span>
            </button>
          </div>

          {/* Store Active Status Card & Quick Lock */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {activeShop.shopName.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{activeShop.shopName}</p>
                <p className="text-[10px] text-slate-500 font-medium">Category: {activeShop.category}</p>
              </div>
            </div>
            
            <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-[11px] font-bold border border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Store Active</span>
              </div>
              <span className="text-[9px] font-semibold bg-emerald-200/60 px-1.5 py-0.5 rounded text-emerald-900">Online</span>
            </div>

            <button
              onClick={handleLockTerminal}
              className="w-full py-1.5 px-2.5 text-[11px] font-semibold text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Lock Terminal</span>
            </button>
          </div>

        </div>

        {/* Dynamic Main Content Workspace */}
        <div className="flex-1 w-full min-w-0">
          {activeTab === 'overview' && (
            <DashboardOverview 
              onNavigate={(tab) => setActiveTab(tab)} 
              onOpenAddProduct={() => {
                setActiveTab('catalog');
                setIsAddProductOpen(true);
              }}
              onViewStorefront={() => onNavigateToStorefront?.(activeShop.slug)}
            />
          )}

          {activeTab === 'pos' && <PosTerminal />}

          {activeTab === 'catalog' && (
            <ProductManagement 
              isAddModalOpen={isAddProductOpen}
              onCloseAddModal={() => setIsAddProductOpen(false)}
            />
          )}

          {activeTab === 'orders' && <OrdersManager />}

          {activeTab === 'khata' && <KhataManager />}

          {activeTab === 'settings' && <ShopSettings />}

          {activeTab === 'subscription' && <SubscriptionPlans />}
        </div>

      </div>

      {/* New Shop Onboarding Modal */}
      <NewShopModal
        isOpen={isNewShopModalOpen}
        onClose={() => setIsNewShopModalOpen(false)}
      />

    </div>
  );
};
