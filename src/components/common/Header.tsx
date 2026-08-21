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
  Compass,
  Package,
  ReceiptText
} from 'lucide-react';
import { AppMode } from '../../App';

interface HeaderProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode, targetSlug?: string) => void;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onOpenOrders?: () => void;
  onOpenNewShopModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onModeChange,
  onOpenCart,
  onOpenAuth,
  onOpenOrders,
  onOpenNewShopModal
}) => {
  const { profile, role, isSuperAdmin, isShopAdmin, logout, user } = useAuth();
  const { activeShop, shops, setActiveShopId, cartItemCount, subscriptionRequests, orders } = useShop();
  const [showShopDropdown, setShowShopDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Strictly define merchant/admin view: must be authenticated admin or super admin, or demo admin
  const isMerchantOrAdmin = isSuperAdmin || (isShopAdmin && role !== 'customer' && (!!user || Boolean(profile?.role && profile.role !== 'customer')));
  const pendingApprovalsCount = subscriptionRequests.filter(r => r.status === 'pending').length;
  const currentShopOrderCount = orders.length;

  return (
    <header id="app-main-header" className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Brand: Store Identity */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => onModeChange(isMerchantOrAdmin ? 'admin' : 'storefront')}
              className="cursor-pointer flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center shadow-xs">
                <span className="text-white font-bold text-xs tracking-wider">KGN</span>
              </div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                  {isMerchantOrAdmin ? activeShop.shopName : activeShop.shopName}
                </h1>
                {isMerchantOrAdmin ? (
                  <span className="hidden sm:inline-block text-blue-700 font-bold text-[10px] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 uppercase tracking-wider">
                    Merchant Portal
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 text-emerald-700 font-semibold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Verified Store
                  </span>
                )}
              </div>
            </div>

            {/* Shop Selector Dropdown: ONLY visible for Admin / Shop Owner */}
            {isMerchantOrAdmin && (
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
                      <span>My Stores ({shops.length})</span>
                      <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[9px] font-bold border border-emerald-200">Store Active</span>
                    </div>

                    <div className="py-1 space-y-1 max-h-56 overflow-y-auto">
                      {shops.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setActiveShopId(s.id);
                            setShowShopDropdown(false);
                            onModeChange('admin');
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
            )}

          </div>

          {/* Center Switcher: Tailored navigation for logged-in Merchants vs Super Admin */}
          {isMerchantOrAdmin ? (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                id="nav-merchant-dashboard-tab-btn"
                onClick={() => onModeChange('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  currentMode === 'admin'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Merchant Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </button>

              <button
                id="nav-storefront-tab-btn"
                onClick={() => onModeChange('storefront', activeShop.slug)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  currentMode === 'storefront'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View Storefront</span>
                <span className="sm:hidden">Storefront</span>
              </button>

              {isSuperAdmin && (
                <button
                  id="nav-super-admin-tab-btn"
                  onClick={() => onModeChange('super_admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    currentMode === 'super_admin'
                      ? 'bg-purple-900 text-white shadow-2xs font-bold'
                      : 'text-purple-700 hover:text-purple-950'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Super Admin</span>
                  <span className="sm:hidden">Admin</span>
                </button>
              )}
            </div>
          ) : null}

          {/* Right Actions: My Orders, Cart & Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Quick My Orders Action (Customer friendly) */}
            {onOpenOrders && (
              <button
                id="header-my-orders-btn"
                onClick={onOpenOrders}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition"
                title="View My Orders"
              >
                <ReceiptText className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">My Orders</span>
              </button>
            )}

            {/* Storefront Cart */}
            <button
              id="header-cart-btn"
              onClick={onOpenCart}
              className="relative p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 transition"
              title="Shopping Cart"
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

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                id="header-user-menu-btn"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium transition"
              >
                <div className={`w-6 h-6 rounded-lg text-white flex items-center justify-center font-bold text-xs ${
                  isSuperAdmin ? 'bg-purple-700' : (isMerchantOrAdmin ? 'bg-slate-900' : 'bg-slate-800')
                }`}>
                  {isMerchantOrAdmin ? (
                    profile?.displayName ? profile.displayName.charAt(0).toUpperCase() : (isSuperAdmin ? 'S' : 'M')
                  ) : (
                    <User className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="hidden lg:block text-left leading-tight">
                  <div className="font-semibold text-slate-900 truncate max-w-[110px]">
                    {isMerchantOrAdmin 
                      ? (profile?.displayName || (isSuperAdmin ? 'Master Admin' : 'Merchant')) 
                      : (user?.displayName || 'Account')}
                  </div>
                  {isMerchantOrAdmin && (
                    <div className={`text-[10px] font-bold capitalize ${
                      isSuperAdmin ? 'text-purple-700' : 'text-blue-700'
                    }`}>
                      {role === 'super_admin' ? 'Super Admin' : (role === 'shop_owner' ? 'Shop Owner' : role)}
                    </div>
                  )}
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
              </button>

              {showUserDropdown && (
                <div 
                  id="user-profile-menu"
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  {/* Dropdown Header */}
                  <div className="p-3 border-b border-slate-100 bg-slate-50 rounded-xl mb-1">
                    <p className="text-xs font-bold text-slate-900">
                      {isMerchantOrAdmin 
                        ? (profile?.displayName || (isSuperAdmin ? 'Platform Super Admin' : 'Shopkeeper')) 
                        : (user?.displayName || 'Guest Visitor')}
                    </p>
                    
                    {/* Subtitle / Email */}
                    {user?.email ? (
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    ) : isMerchantOrAdmin ? (
                      <p className="text-[11px] text-slate-500">Merchant Session</p>
                    ) : (
                      <p className="text-[11px] text-slate-500">Sign in to track orders & save address</p>
                    )}

                    {/* Role badge ONLY visible to authentic admin / merchant */}
                    {isMerchantOrAdmin && (
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-100">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Role: {role.replace('_', ' ').toUpperCase()}</span>
                      </div>
                    )}
                  </div>

                  <div className="py-1 space-y-0.5">
                    {/* Admin portal shortcuts (Merchant only) */}
                    {isMerchantOrAdmin && (
                      <>
                        <button
                          id="menu-merchant-portal-btn"
                          onClick={() => {
                            setShowUserDropdown(false);
                            onModeChange('admin');
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 transition"
                        >
                          <Store className="w-3.5 h-3.5 text-blue-600" />
                          <span>Shop Admin Portal</span>
                        </button>

                        {isSuperAdmin && (
                          <button
                            id="menu-super-admin-portal-btn"
                            onClick={() => {
                              setShowUserDropdown(false);
                              onModeChange('super_admin');
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-medium text-purple-700 hover:bg-purple-50 rounded-lg flex items-center gap-2 transition"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                            <span>Super Admin Console</span>
                          </button>
                        )}
                        <div className="my-1 border-t border-slate-100" />
                      </>
                    )}

                    {/* Customer-specific Options */}
                    {onOpenOrders && (
                      <button
                        id="menu-customer-orders-btn"
                        onClick={() => {
                          setShowUserDropdown(false);
                          onOpenOrders();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 transition"
                      >
                        <ReceiptText className="w-3.5 h-3.5 text-blue-600" />
                        <span>My Orders</span>
                      </button>
                    )}

                    <button
                      id="menu-customer-cart-btn"
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenCart();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between transition"
                    >
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-3.5 h-3.5 text-slate-600" />
                        <span>Shopping Bag</span>
                      </div>
                      {cartItemCount > 0 && (
                        <span className="bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                          {cartItemCount}
                        </span>
                      )}
                    </button>

                    <div className="pt-1 mt-1 border-t border-slate-100">
                      <button
                        id="menu-open-auth-btn"
                        onClick={() => {
                          setShowUserDropdown(false);
                          onOpenAuth();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-2 transition"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{user || isMerchantOrAdmin ? 'Switch Account' : 'Sign In / Register'}</span>
                      </button>
                      
                      {(user || isMerchantOrAdmin) && (
                        <button
                          id="menu-logout-btn"
                          onClick={() => {
                            setShowUserDropdown(false);
                            logout();
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 transition"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      )}
                    </div>
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

