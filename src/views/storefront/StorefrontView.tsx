import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { 
  Search, 
  ShoppingBag, 
  Plus, 
  Minus, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Sparkles, 
  Tag, 
  Check, 
  Share2, 
  QrCode,
  ShieldCheck,
  Store,
  Truck
} from 'lucide-react';
import { Product } from '../../types';

interface StorefrontViewProps {
  onOpenCart: () => void;
  onOpenAuth: () => void;
}

export const StorefrontView: React.FC<StorefrontViewProps> = ({ onOpenCart, onOpenAuth }) => {
  const { activeShop, products, cart, addToCart, updateCartQuantity, cartTotal, cartItemCount } = useShop();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedLink, setCopiedLink] = useState(false);

  // Extract unique categories from current shop's isolated products
  const categories = ['All', ...Array.from(new Set<string>(products.map(p => p.category)))];

  // Filter products by search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCartQuantity = (productId: string) => {
    const item = cart.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const handleShareStore = () => {
    if (navigator.share) {
      navigator.share({
        title: activeShop.shopName,
        text: `Shop products online from ${activeShop.shopName}!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div id="storefront-container" className="min-h-screen bg-[#F8FAFC] text-[#0F172A] pb-28">
      
      {/* 1. CLEAN MINIMALIST HERO & STORE HEADER */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            
            {/* Shop Brand Details */}
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-50 border border-slate-200 p-2 shadow-2xs shrink-0 overflow-hidden flex items-center justify-center">
                <img
                  src={activeShop.logoUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80'}
                  alt={activeShop.shopName}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                    {activeShop.shopName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100 uppercase tracking-wider">
                    {activeShop.category}
                  </span>
                  {activeShop.isActive && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live Store
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                  {activeShop.tagline || 'Direct storefront with instant home delivery, counter pickup, and UPI payments.'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-3">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{activeShop.address || `${activeShop.city} - ${activeShop.pincode}`}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{activeShop.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 self-stretch md:self-auto">
              <a
                id="shop-direct-whatsapp-btn"
                href={`https://wa.me/${activeShop.whatsappNumber || activeShop.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(activeShop.shopName)},%20I%20want%20to%20place%20an%20order`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 md:flex-initial px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
              >
                <MessageSquare className="w-4 h-4" />
                Order via WhatsApp
              </a>

              <button
                id="share-shop-btn"
                onClick={handleShareStore}
                className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied' : 'Share'}</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 2. PROMOTIONAL DELIVERY NOTICE & CONTROLS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Free Delivery Banner */}
        <div className="mb-6 p-3.5 sm:p-4 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-blue-500/10 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <span>FREE Home Delivery on Orders of ₹499 & Above!</span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                  Special Offer
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Orders below ₹499 have a nominal ₹30 delivery fee • Store self-pickup is always 100% Free
              </p>
            </div>
          </div>

          <button
            onClick={onOpenCart}
            className="self-start sm:self-auto px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl transition shadow-2xs shrink-0 flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
            <span>View Bag {cartItemCount > 0 && `(${cartItemCount})`}</span>
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              id="storefront-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search catalog in ${activeShop.shopName}...`}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 shadow-2xs transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Results Summary */}
          <div className="text-xs text-slate-500 font-semibold flex items-center gap-2">
            <span>Showing <strong className="text-slate-900">{filteredProducts.length}</strong> items</span>
            <span className="text-slate-300">•</span>
            <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-bold text-[11px] border border-blue-100">
              Direct Tenant Inventory
            </span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              id={`cat-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* 3. PRODUCT CATALOG GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-2xs mt-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No products found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try searching with another keyword or pick a different category.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredProducts.map((product) => {
              const qty = getCartQuantity(product.id);
              const discountPercent = product.mrp && product.mrp > product.sellingPrice
                ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
                : 0;

              return (
                <div
                  key={product.id}
                  id={`product-card-${product.id}`}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition flex flex-col justify-between overflow-hidden group"
                >
                  {/* Product Thumbnail */}
                  <div className="relative aspect-square w-full bg-slate-50 overflow-hidden border-b border-slate-100">
                    <img
                      src={product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-103 transition duration-300"
                    />

                    {/* Savings Tag */}
                    {discountPercent > 0 && (
                      <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                        {discountPercent}% OFF
                      </span>
                    )}

                    {/* Stock Status Badge */}
                    {product.status === 'out_of_stock' && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center">
                        <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Meta */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        {product.category}
                      </div>
                      
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 mt-1" title={product.name}>
                        {product.name}
                      </h3>

                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Per {product.unit}
                      </div>
                    </div>

                    {/* Pricing & Add Button */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                      <div>
                        <div className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                          ₹{product.sellingPrice}
                        </div>
                        {product.mrp && product.mrp > product.sellingPrice && (
                          <div className="text-[10px] text-slate-400 line-through">
                            ₹{product.mrp}
                          </div>
                        )}
                      </div>

                      {/* Add / Quantity Control */}
                      {qty === 0 ? (
                        <button
                          id={`add-to-cart-${product.id}`}
                          onClick={() => addToCart(product, 1)}
                          disabled={product.status === 'out_of_stock'}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-2xs active:scale-95 transition disabled:opacity-30"
                        >
                          ADD
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl p-0.5">
                          <button
                            onClick={() => updateCartQuantity(product.id, qty - 1)}
                            className="w-6 h-6 rounded-lg bg-white text-slate-800 flex items-center justify-center font-bold text-xs hover:bg-slate-200 transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-black text-slate-900">{qty}</span>
                          <button
                            onClick={() => updateCartQuantity(product.id, qty + 1)}
                            className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs hover:bg-slate-800 transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* 4. FLOATING MOBILE CART BAR */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-xl mx-auto animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-slate-900 text-white rounded-2xl p-3.5 shadow-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                {cartItemCount}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">{cartItemCount} Items Added</div>
                <div className="text-sm font-black text-white">₹{cartTotal}</div>
              </div>
            </div>

            <button
              id="floating-view-cart-btn"
              onClick={onOpenCart}
              className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" />
              View Cart & Pay
            </button>
          </div>
        </div>
      )}

      {/* 5. Minimalist Footer */}
      <footer className="mt-20 border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-600">Store Status: Operational</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] uppercase tracking-wider font-semibold">
            <span>Tenant: {activeShop.shopName}</span>
            <span>•</span>
            <span>Powered by KGN Shop SaaS</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
