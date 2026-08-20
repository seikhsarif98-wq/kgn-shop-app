import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useShop } from '../../context/ShopContext';
import { 
  Store, 
  ShoppingBag, 
  LayoutDashboard, 
  User, 
  LogOut, 
  ChevronDown, 
  Sparkles,
  ShieldCheck, 
  Plus,
  QrCode,
  Layers,
  CheckCircle2,
  Compass
} from 'lucide-react';
import { AppMode } from '../../App';

interface HeaderProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onOpenNewShopModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onModeChange,
  onOpenCart,
  onOpenAuth,
  onOpenNewShopModal
}) => {
  const { profile, role, isSuperAdmin, logout, switchDemoRole, isDemoMode, activeShopOwnerId } = useAuth();
  const { activeShop, shops, setActiveShopId, cartItemCount, subscriptionRequests } = useShop();
  const [showShopDropdown, setShowShopDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const isMerchant = role === 'shop_owner' || role === 'admin';
  const pendingApprovalsCount = subscriptionRequests.filter(r => r.status === 'pending').length;

  return (
    <header id="app-main-header" className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Brand & Clean Typography */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => onModeChange('storefront')}
              className="cursor-pointer flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center shadow-xs">
                <span className="text-white font-bold text-xs tracking-wider">KGN</span>
              </div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                  KGN SHOP
                </h1>
                <span className="hidden sm:inline-block text-blue-700 font-bold text-[10px] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 uppercase tracking-wider">
                  SaaS Multi-Tenant
                </span>
              </div>
            </div>

            {/* Shop Selector Dropdown */}
            <div className="relative ml-2 pl-3 border-l border-slate-200">
              <button
                id="shop-selector-btn"
                onClick={() => setShowShopDropdown(!showShopDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold transition"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="max-w-[120px] sm:max-w-[150px] truncate">{activeShop.shopName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showShopDropdown && (
                <div 
                  id="shop-switcher-menu"
                  className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 flex items-center justify-between">
                    <span>Isolated Tenants ({shops.length})</span>
                    <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[9px] font-bold">100% Isolated</span>
                  </div>

                  <div className="py-1 space-y-1 max-h-56 overflow-y-auto">
                    {shops.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setActiveShopId(s.id);
                          setShowShopDropdown(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition ${
                          s.id === activeShop.id
                            ? 'bg-slate-900 text-white font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold truncate">{s.shopName}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              s.tier === 'pro' 
                                ? (s.id === activeShop.id ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200')
                                : s.tier === 'starter'
                                ? (s.id === activeShop.id ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700')
                                : (s.id === activeShop.id ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 border border-amber-200')
                            }`}>
                              {s.tier}
                            </span>
                          </div>
                          <div className={`text-[10px] ${s.id === activeShop.id ? 'text-slate-300' : 'text-slate-400'}`}>
                            {s.category} • {s.city || 'India'}
                          </div>
                        </div>
                        {s.id === activeShop.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>

                  {onOpenNewShopModal && (
                    <div className="pt-2 mt-1 border-t border-slate-100">
                      <button
                        id="header-create-shop-btn"
                        onClick={() => {
                          setShowShopDropdown(false);
                          onOpenNewShopModal();
                        }}
                        className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5 text-blue-400" />
                        <span>Register New Shop</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Center Switcher: Clean Minimalist Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              id="nav-storefront-tab-btn"
              onClick={() => onModeChange('storefront')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentMode === 'storefront'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Storefront</span>
              <span className="sm:hidden">Store</span>
            </button>

            <button
              id="nav-directory-tab-btn"
              onClick={() => onModeChange('directory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentMode === 'directory'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">All Shops</span>
              <span className="sm:hidden">Directory</span>
            </button>

            <button
              id="nav-admin-portal-tab-btn"
              onClick={() => {
                if (!isMerchant && !isSuperAdmin) {
                  switchDemoRole('shop_owner', activeShop.shopOwnerId);
                }
                onModeChange('admin');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentMode === 'admin'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin Portal</span>
              <span className="sm:hidden">Admin</span>
            </button>

            {/* Super Admin Access Tab */}
            {(isSuperAdmin || role === 'super_admin' || role === 'admin') && (
              <button
                id="nav-super-admin-tab-btn"
                onClick={() => onModeChange('super_admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  currentMode === 'super_admin'
                    ? 'bg-purple-900 text-white shadow-2xs'
                    : 'text-purple-700 hover:bg-purple-50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Super Admin</span>
                <span className="sm:hidden">Super</span>
                {pendingApprovalsCount > 0 && (
                  <span className="bg-amber-400 text-slate-900 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Right Actions: Cart & Profile */}
          <div className="flex items-center gap-2.5">
            
            {/* Storefront Cart */}
            {currentMode === 'storefront' && (
              <button
                id="header-cart-btn"
                onClick={onOpenCart}
                className="relative p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 transition"
              >
                <ShoppingBag className="w-4 h-4 text-slate-800" />
                {cartItemCount > 0 && (
                  <span 
                    id="header-cart-badge"
                    className="absolute -top-1 -right-1 bg-slate-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs"
                  >
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                id="header-user-menu-btn"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium transition"
              >
                <div className={`w-6 h-6 rounded-lg text-white flex items-center justify-center font-bold text-xs ${
                  isSuperAdmin ? 'bg-purple-700' : 'bg-slate-900'
                }`}>
                  {profile?.displayName ? profile.displayName.charAt(0).toUpperCase() : (isSuperAdmin ? 'S' : 'M')}
                </div>
                <div className="hidden lg:block text-left leading-tight">
                  <div className="font-semibold text-slate-900 truncate max-w-[100px]">
                    {profile?.displayName || (isSuperAdmin ? 'Master Admin' : 'Merchant')}
                  </div>
                  <div className={`text-[10px] font-bold capitalize ${
                    isSuperAdmin ? 'text-purple-700' : 'text-blue-700'
                  }`}>
                    {role === 'super_admin' ? 'Super Admin' : (role === 'shop_owner' ? 'Shop Owner' : role)}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
              </button>

              {showUserDropdown && (
                <div 
                  id="user-profile-menu"
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="p-3 border-b border-slate-100 bg-slate-50 rounded-xl mb-1">
                    <p className="text-xs font-bold text-slate-900">{profile?.displayName || 'User'}</p>
                    <p className="text-[11px] text-slate-500 truncate">{profile?.email || 'Active Session'}</p>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-100">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Role: {role.replace('_', ' ').toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="py-1 space-y-0.5">
                    {/* Direct Super Admin Navigation */}
                    <button
                      id="menu-open-super-admin-btn"
                      onClick={() => {
                        setShowUserDropdown(false);
                        if (!isSuperAdmin) {
                          switchDemoRole('super_admin');
                        }
                        onModeChange('super_admin');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 rounded-lg flex items-center justify-between transition"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                        <span>Super Admin Panel</span>
                      </div>
                      {pendingApprovalsCount > 0 && (
                        <span className="bg-amber-400 text-slate-900 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                          {pendingApprovalsCount}
                        </span>
                      )}
                    </button>

                    <button
                      id="menu-open-auth-btn"
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenAuth();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Switch Account / Sign In
                    </button>
                    
                    <button
                      id="menu-logout-btn"
                      onClick={() => {
                        setShowUserDropdown(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
