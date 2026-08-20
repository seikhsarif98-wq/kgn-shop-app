import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Store, 
  Search, 
  MapPin, 
  Phone, 
  MessageSquare, 
  ExternalLink, 
  ShieldCheck, 
  Plus, 
  Sparkles, 
  Package,
  Layers,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Building2,
  Zap
} from 'lucide-react';
import { Shop } from '../../types';

interface ShopDirectoryViewProps {
  onSelectShop: (shopId: string, targetMode: 'storefront' | 'admin') => void;
  onOpenNewShopModal: () => void;
}

export const ShopDirectoryView: React.FC<ShopDirectoryViewProps> = ({
  onSelectShop,
  onOpenNewShopModal
}) => {
  const { shops, activeShop, products } = useShop();
  const { profile, role, activeShopOwnerId, switchDemoRole } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [activeTab, setActiveTab] = useState<'directory' | 'platform_overview'>('directory');

  const categories = ['All', ...Array.from(new Set(shops.map(s => s.category)))];
  const cities = ['All', ...Array.from(new Set(shops.map(s => s.city || 'Mumbai')))];

  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          shop.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (shop.city && shop.city.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || shop.category === selectedCategory;
    const matchesCity = selectedCity === 'All' || shop.city === selectedCity;
    return matchesSearch && matchesCat && matchesCity;
  });

  // Platform metrics for Super Admin tab
  const totalShops = shops.length;
  const activeShops = shops.filter(s => s.isActive).length;
  const proShops = shops.filter(s => s.tier === 'pro' || s.tier === 'enterprise').length;

  return (
    <div id="shop-directory-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-blue-400 text-xs font-semibold uppercase tracking-widest mb-3">
            <Building2 className="w-3.5 h-3.5" />
            <span>Multi-Tenant Network</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
            Explore Tenant Shops
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
            Discover verified neighborhood Kirana stores, supermarkets, and electronics shops powered by KGN SHOP SaaS with 100% isolated merchant databases.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3">
          <button
            id="directory-launch-shop-btn"
            onClick={onOpenNewShopModal}
            className="px-5 py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Register Your Shop</span>
          </button>
        </div>

        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 pointer-events-none" />
      </div>

      {/* 2. Top Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <button
            id="tab-shops-directory-btn"
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              activeTab === 'directory'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>All Stores Directory ({shops.length})</span>
          </button>

          <button
            id="tab-platform-overview-btn"
            onClick={() => setActiveTab('platform_overview')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              activeTab === 'platform_overview'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>SaaS Architecture & Tenant Health</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Multi-Tenant Real-Time Isolation Active</span>
        </div>
      </div>

      {/* 3. MAIN DIRECTORY CONTENT */}
      {activeTab === 'directory' ? (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search store name, category, or city..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-slate-900 transition"
                />
              </div>

              {/* City Filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-slate-900"
                >
                  {cities.map(city => (
                    <option key={city} value={city}>{city === 'All' ? 'All Cities' : city}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Stores Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map((shop) => {
              const isCurrentActive = shop.id === activeShop.id;
              const isOwner = activeShopOwnerId === shop.shopOwnerId || role === 'admin';

              return (
                <div
                  key={shop.id}
                  id={`shop-card-${shop.id}`}
                  className={`bg-white rounded-2xl border transition overflow-hidden shadow-2xs flex flex-col justify-between ${
                    isCurrentActive ? 'border-blue-600 ring-2 ring-blue-600/10' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Shop Banner Header */}
                  <div className="relative h-32 bg-slate-800 overflow-hidden">
                    <img
                      src={shop.bannerUrl || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1000&auto=format&fit=crop&q=80'}
                      alt={shop.shopName}
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                    
                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider border border-white/10">
                        {shop.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase">
                        {shop.tier}
                      </span>
                    </div>

                    {/* Store Title on Banner */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                      <div>
                        <h3 className="font-bold text-white text-base leading-tight drop-shadow-xs">
                          {shop.shopName}
                        </h3>
                        <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                          <span>{shop.city || 'India'}</span>
                        </p>
                      </div>

                      {isCurrentActive && (
                        <span className="bg-emerald-500 text-white font-bold text-[9px] uppercase px-2 py-0.5 rounded-md shadow-2xs">
                          Active Store
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between text-xs">
                    <div className="space-y-2">
                      <p className="text-slate-600 line-clamp-2">
                        {shop.tagline || 'Reliable retail store with doorstep delivery and store pickup.'}
                      </p>

                      <div className="pt-2 border-t border-slate-100 space-y-1 text-slate-500 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span>Phone / WhatsApp:</span>
                          <span className="font-semibold text-slate-800">{shop.phone}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>UPI Settlement:</span>
                          <span className="font-mono text-slate-800">{shop.upiId || 'Direct QR'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Tenant UID:</span>
                          <span className="font-mono text-blue-700">{shop.shopOwnerId.substring(0, 14)}...</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center">
                      <button
                        id={`visit-storefront-${shop.id}`}
                        onClick={() => onSelectShop(shop.id, 'storefront')}
                        className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                      >
                        <Store className="w-3.5 h-3.5" />
                        <span>Visit Storefront</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* PLATFORM OVERVIEW TAB */
        <div className="space-y-6 animate-in fade-in">
          
          {/* SaaS Health Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Registered Shops</p>
              <div className="text-3xl font-bold text-slate-900">{totalShops}</div>
              <p className="text-emerald-600 text-xs mt-1 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {activeShops} active storefronts
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Pro / Enterprise Tier</p>
              <div className="text-3xl font-bold text-slate-900">{proShops}</div>
              <p className="text-blue-600 text-xs mt-1 font-semibold">
                High-scale billing & POS enabled
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Data Isolation SLA</p>
              <div className="text-3xl font-bold text-slate-900">100%</div>
              <p className="text-slate-500 text-xs mt-1">
                Zero cross-tenant leakage guarantee
              </p>
            </div>
          </div>

          {/* Tenant Registry Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Tenant Partition Database Directory</h3>
                <p className="text-xs text-slate-500">Live indexed tenant metadata across Firestore namespaces</p>
              </div>
              <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-bold border border-blue-100">
                Firestore: /shops
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                    <th className="py-3 px-4">Shop Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">City</th>
                    <th className="py-3 px-4">Tier Plan</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Storefront</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shops.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {s.shopName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{s.category}</td>
                      <td className="py-3 px-4 text-slate-600">{s.city || 'Mumbai'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                          {s.tier}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          Online
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onSelectShop(s.id, 'storefront')}
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition"
                        >
                          Visit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
