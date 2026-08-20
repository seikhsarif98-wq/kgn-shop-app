import React from 'react';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package, 
  AlertTriangle, 
  Sparkles, 
  ArrowUpRight, 
  Plus, 
  QrCode, 
  Receipt, 
  ShieldCheck,
  Zap,
  Store,
  ArrowRight
} from 'lucide-react';

interface DashboardOverviewProps {
  onNavigate: (tab: 'pos' | 'catalog' | 'orders' | 'khata' | 'settings' | 'subscription') => void;
  onOpenAddProduct: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate, onOpenAddProduct }) => {
  const { activeShop, products, orders, khataCustomers } = useShop();
  const { profile } = useAuth();

  // Metric calculations
  const totalSales = orders
    .filter(o => o.orderStatus === 'completed' || o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'new' || o.orderStatus === 'accepted').length;

  const totalKhataReceivable = khataCustomers
    .filter(c => c.currentBalance > 0)
    .reduce((sum, c) => sum + c.currentBalance, 0);

  const lowStockCount = products.filter(p => p.stockQuantity <= 5).length;

  return (
    <div className="space-y-6">
      
      {/* 1. CLEAN MINIMALIST HERO BANNER */}
      <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold uppercase tracking-widest mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Tenant Session Active: {activeShop.shopName}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-white mb-3">
            One Platform,<br />Infinite Shops.
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6 max-w-lg">
            Scale your multi-tenant SaaS with unified high-speed POS, Digital Khata ledger, and instant WhatsApp storefronts.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              id="dash-quick-pos-btn"
              onClick={() => onNavigate('pos')}
              className="px-5 py-2.5 bg-white text-slate-900 rounded-xl font-bold text-xs hover:bg-slate-100 transition shadow-xs flex items-center gap-2"
            >
              <Receipt className="w-4 h-4 text-blue-600" />
              Open POS Billing
            </button>
            <button
              id="dash-quick-add-prod-btn"
              onClick={onOpenAddProduct}
              className="px-5 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-xs border border-slate-700 hover:bg-slate-700 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>

        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-25 pointer-events-none" />
      </div>

      {/* 2. KEY METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Sales */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Revenue</p>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">₹{totalSales.toLocaleString()}</div>
          <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold flex items-center"><ArrowUpRight className="w-3 h-3" /> Live</span> across orders
          </p>
        </div>

        {/* Metric 2: Live Orders */}
        <div 
          onClick={() => onNavigate('orders')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs cursor-pointer hover:border-slate-300 transition"
        >
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Live Orders</p>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">{orders.length}</div>
          <p className="text-blue-600 font-semibold text-xs mt-1">
            {pendingOrdersCount} pending action
          </p>
        </div>

        {/* Metric 3: Khata Udhaar Due */}
        <div 
          onClick={() => onNavigate('khata')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs cursor-pointer hover:border-slate-300 transition"
        >
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Khata Balance Due</p>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">₹{totalKhataReceivable.toLocaleString()}</div>
          <p className="text-slate-500 text-xs mt-1">
            {khataCustomers.length} active ledger accounts
          </p>
        </div>

        {/* Metric 4: Total Inventory */}
        <div 
          onClick={() => onNavigate('catalog')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs cursor-pointer hover:border-slate-300 transition"
        >
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Catalog SKUs</p>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">{products.length}</div>
          <p className="text-slate-500 text-xs mt-1">
            {lowStockCount > 0 ? `${lowStockCount} items low stock` : 'Healthy stock levels'}
          </p>
        </div>

      </div>

      {/* 3. RECENT ORDERS & SUBSCRIPTION STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Recent Orders</h3>
              <p className="text-xs text-slate-500">Real-time storefront and POS invoices</p>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No orders recorded yet for this shop.
            </div>
          ) : (
            <div className="space-y-2.5">
              {orders.slice(0, 4).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-900 flex items-center justify-center font-bold text-[11px]">
                      {order.orderNumber.split('-')[1] || 'ORD'}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{order.customerName}</div>
                      <div className="text-[11px] text-slate-400">
                        {order.items.length} items • {order.paymentMethod.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-slate-900">₹{order.totalAmount}</div>
                    <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                      order.orderStatus === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : (order.orderStatus === 'new' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200')
                    }`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: SaaS Subscription & Security Card */}
        <div className="space-y-4">
          
          {/* Subscription Tier Card */}
          <div className="bg-[#EEF2FF] rounded-2xl p-6 border border-blue-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-800">
                  SaaS Architecture
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[10px] uppercase">
                  {activeShop.tier} Tier
                </span>
              </div>
              
              <h4 className="font-bold text-base text-slate-900">
                Tenant Isolation Active
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                All catalog, POS bills, and Khata ledger data are strictly encrypted and isolated for owner ID: <code className="text-blue-900 font-mono text-[10px]">{activeShop.shopOwnerId.substring(0, 10)}...</code>
              </p>
            </div>

            <button
              id="dash-upgrade-plan-btn"
              onClick={() => onNavigate('subscription')}
              className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              Manage Subscription Plan
            </button>
          </div>

          {/* Secure Storage Info */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Storage Security</p>
            <div className="text-2xl font-bold text-slate-900">99.9%</div>
            <p className="text-slate-500 text-xs mt-1">Isolated Firebase Rules verification</p>
          </div>

        </div>

      </div>

    </div>
  );
};
