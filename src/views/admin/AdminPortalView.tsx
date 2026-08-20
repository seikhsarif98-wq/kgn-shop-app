import React, { useState } from 'react';
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
  Lock
} from 'lucide-react';
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
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({ onOpenAuth }) => {
  const { activeShop, shops, setActiveShopId, canAccess } = useShop();
  const { user, profile, isDemoMode, switchDemoRole, activeShopOwnerId, role } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isNewShopModalOpen, setIsNewShopModalOpen] = useState(false);

  // Role verification: allow shop_owner or admin, or prompt demo switch
  const isAuthorized = role === 'shop_owner' || role === 'admin';

  if (!isAuthorized) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto border border-slate-200">
            <Lock className="w-5 h-5" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">Merchant Dashboard Protected</h2>
            <p className="text-xs text-slate-500 mt-1">
              You are currently browsing as a <strong>Customer</strong>. To manage catalog inventory, POS billing terminal, and the Khata ledger, sign in as a shopkeeper.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => switchDemoRole('shop_owner', activeShop.shopOwnerId)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Switch to Demo Merchant ({activeShop.shopName})</span>
            </button>

            <button
              onClick={onOpenAuth}
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
            >
              Sign In with Account
            </button>
          </div>
        </div>
      </div>
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
    <div id="admin-portal-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
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

          {/* Tenant Session Active Card */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {activeShop.shopName.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{activeShop.shopName}</p>
                <p className="text-[10px] text-slate-400 font-mono">UID: {activeShop.shopOwnerId.substring(0, 10)}...</p>
              </div>
            </div>
            
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold border border-blue-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span>Tenant Partition Isolated</span>
            </div>
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
