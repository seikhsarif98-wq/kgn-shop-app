import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { 
  ShoppingBag, 
  Package, 
  Plus, 
  Receipt, 
  Settings,
  ArrowRight,
  Store,
  ExternalLink,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Copy,
  Check,
  Globe,
  MessageCircle,
  Share2
} from 'lucide-react';
import { getShareableStoreUrl, getWhatsAppShareUrl, slugifyShopName } from '../../lib/slugs';

interface DashboardOverviewProps {
  onNavigate: (tab: 'pos' | 'catalog' | 'orders' | 'khata' | 'settings' | 'subscription') => void;
  onOpenAddProduct: () => void;
  onViewStorefront?: (slug?: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ 
  onNavigate, 
  onOpenAddProduct,
  onViewStorefront 
}) => {
  const { activeShop, shops, products, orders, khataCustomers } = useShop();
  const [copied, setCopied] = useState(false);

  // Single reactive source of truth for current active store
  const currentStore = activeShop || shops[0];
  const fallbackSlug = shops?.[0]?.slug || (shops?.[0]?.shopName ? slugifyShopName(shops[0].shopName) : 'store');
  const storeSlug = currentStore?.slug || (currentStore?.shopName ? slugifyShopName(currentStore.shopName) : '') || fallbackSlug;
  const shareableUrl = getShareableStoreUrl(storeSlug);
  const whatsappShareUrl = getWhatsAppShareUrl(currentStore?.shopName || 'Store', shareableUrl, currentStore?.whatsappNumber || currentStore?.phone);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Metric calculations
  const totalSales = orders
    .filter(o => o.orderStatus === 'completed' || o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'new' || o.orderStatus === 'accepted').length;

  const totalKhataReceivable = khataCustomers
    .filter(c => c.currentBalance > 0)
    .reduce((sum, c) => sum + c.currentBalance, 0);

  const lowStockCount = products.filter(p => p.stockQuantity <= 5).length;
  const outOfStockCount = products.filter(p => p.stockQuantity === 0).length;

  return (
    <div id="merchant-dashboard-overview" className="space-y-6">
      
      {/* 1. STORE OPERATIONS COMMAND CENTER HEADER */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Store: {activeShop.shopName}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-white mb-2">
              Merchant Operations Hub
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">
              Manage your product catalog, process incoming customer orders, review real-time POS sales, and maintain your store settings.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-300">
              <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 font-mono">
                Category: <strong>{activeShop.category}</strong>
              </span>
              <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 font-mono">
                UPI: <strong>{activeShop.upiId || 'Not Set'}</strong>
              </span>
              <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 font-mono">
                PIN: <strong>{activeShop.adminPin || '1234'}</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <button
              id="dash-quick-add-prod-hero-btn"
              onClick={onOpenAddProduct}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition shadow-xs flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>

            <button
              id="dash-quick-pos-hero-btn"
              onClick={() => onNavigate('pos')}
              className="px-5 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-xs border border-slate-700 hover:bg-slate-700 transition flex items-center justify-center gap-2"
            >
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>Open POS Billing</span>
            </button>

            {onViewStorefront && (
              <button
                id="dash-preview-storefront-btn"
                type="button"
                onClick={() => {
                  const targetSlug = currentStore?.slug || storeSlug || fallbackSlug;
                  onViewStorefront('/store/' + targetSlug);
                }}
                title={`Open /store/${storeSlug}`}
                className="px-5 py-2.5 bg-slate-800/60 text-slate-300 rounded-xl font-semibold text-xs border border-slate-700/80 hover:bg-slate-800 hover:text-white transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Public Storefront</span>
              </button>
            )}
          </div>
        </div>

        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 pointer-events-none" />
      </div>

      {/* PROMINENT SHAREABLE STORE LINK & QR BAR */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  Customer Store Link
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live & Shareable
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-0.5">
                Slug: <strong className="font-mono text-slate-800">/store/{storeSlug}</strong> • Share this link with customers on WhatsApp, Instagram, and SMS.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Display Link Box */}
            <div id="dash-store-link-display-box" className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2 max-w-xs sm:max-w-none">
              <span id="dash-store-link-display-text" className="text-xs font-mono font-semibold text-slate-700 truncate">
                {shareableUrl}
              </span>
            </div>

            {/* Copy Button */}
            <button
              id="dash-copy-store-url-btn"
              onClick={handleCopyLink}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs ${
                copied 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Store Link</span>
                </>
              )}
            </button>

            {/* WhatsApp Share Button */}
            <a
              id="dash-share-whatsapp-btn"
              href={whatsappShareUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Share on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. PROMINENT CORE MERCHANT ACTION TILES */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Primary Store Management Actions
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Action 1: Add Products */}
          <div 
            id="action-card-add-product"
            onClick={onOpenAddProduct}
            className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-400 transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition">
                <Plus className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-blue-600 transition">
                Add New Product
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Add items with custom photos, stock counts, SKU price, and category tags.
              </p>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
              <span>Launch Creator</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Action 2: View Orders */}
          <div 
            id="action-card-view-orders"
            onClick={() => onNavigate('orders')}
            className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-amber-400 transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                {pendingOrdersCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                    {pendingOrdersCount} Pending
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-amber-600 transition">
                View Live Orders
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Review, accept, and dispatch customer online delivery and pickup orders.
              </p>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
              <span>{orders.length} Total Orders</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Action 3: Manage Inventory */}
          <div 
            id="action-card-manage-inventory"
            onClick={() => onNavigate('catalog')}
            className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-400 transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
                  <Package className="w-5 h-5" />
                </div>
                {lowStockCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-bold">
                    {lowStockCount} Low Stock
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-emerald-600 transition">
                Manage Inventory
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Update stock counts, adjust item prices, organize categories, and delete SKUs.
              </p>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
              <span>{products.length} Products Active</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Action 4: Store Settings */}
          <div 
            id="action-card-store-settings"
            onClick={() => onNavigate('settings')}
            className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-purple-400 transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition">
                <Settings className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-purple-600 transition">
                Store Settings
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Configure store contact, WhatsApp order alert number, UPI ID, and security PIN.
              </p>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
              <span>Configure Shop</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </div>

      {/* 3. KEY METRICS SUMMARY */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Sales */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Sales Revenue</p>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">₹{totalSales.toLocaleString()}</div>
          <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold flex items-center"><ArrowUpRight className="w-3 h-3" /> Live</span> across orders & POS
          </p>
        </div>

        {/* Metric 2: Live Orders */}
        <div 
          onClick={() => onNavigate('orders')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs cursor-pointer hover:border-slate-300 transition"
        >
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Orders</p>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">{orders.length}</div>
          <p className="text-blue-600 font-semibold text-xs mt-1">
            {pendingOrdersCount} pending fulfillment
          </p>
        </div>

        {/* Metric 3: Khata Udhaar Due */}
        <div 
          onClick={() => onNavigate('khata')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs cursor-pointer hover:border-slate-300 transition"
        >
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Khata Credit Due</p>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">₹{totalKhataReceivable.toLocaleString()}</div>
          <p className="text-slate-500 text-xs mt-1">
            {khataCustomers.length} active customer accounts
          </p>
        </div>

        {/* Metric 4: Total Inventory */}
        <div 
          onClick={() => onNavigate('catalog')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs cursor-pointer hover:border-slate-300 transition"
        >
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Catalog SKUs</p>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">{products.length}</div>
          <p className="text-slate-500 text-xs mt-1">
            {outOfStockCount > 0 ? (
              <span className="text-rose-600 font-medium">{outOfStockCount} out of stock</span>
            ) : lowStockCount > 0 ? (
              <span className="text-amber-600 font-medium">{lowStockCount} items low stock</span>
            ) : (
              <span className="text-emerald-600 font-medium">All items in stock</span>
            )}
          </p>
        </div>

      </div>

      {/* 4. RECENT ORDERS & QUICK TOOLS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
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

        {/* Right Col: Quick Store Tools */}
        <div className="space-y-4">
          
          {/* POS Quick Launch Card */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                In-Store Terminal
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                Fast POS
              </span>
            </div>
            
            <h4 className="font-bold text-sm text-slate-900">
              Counter Billing & Receipts
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Create instant thermal receipts, barcode lookup, and record cash/UPI payments directly.
            </p>

            <button
              id="dash-open-pos-terminal-btn"
              onClick={() => onNavigate('pos')}
              className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-400" />
              <span>Open POS Terminal</span>
            </button>
          </div>

          {/* Khata Ledger Quick Launch */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Credit Book
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                WhatsApp Ready
              </span>
            </div>
            
            <h4 className="font-bold text-sm text-slate-900">
              Customer Khata Ledger
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Track customer balances, credit purchases, and send automated payment reminder links.
            </p>

            <button
              id="dash-open-khata-ledger-btn"
              onClick={() => onNavigate('khata')}
              className="mt-4 w-full py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs rounded-xl transition shadow-2xs flex items-center justify-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Manage Khata Customers</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

