import React, { useState, useEffect } from 'react';
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
  Truck,
  AlertCircle,
  Compass,
  ArrowRight,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Product, Shop } from '../../types';
import { parseStoreSlugFromUrl, getShareableStoreUrl, getWhatsAppShareUrl } from '../../lib/slugs';

interface StorefrontViewProps {
  storeSlug?: string | null;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onOpenOrders?: () => void;
  onOpenNewShopModal?: () => void;
  onNavigateToMode?: (mode: 'storefront' | 'directory' | 'admin' | 'super_admin', targetSlug?: string) => void;
}

export const StorefrontView: React.FC<StorefrontViewProps> = ({ 
  storeSlug,
  onOpenCart, 
  onOpenAuth, 
  onOpenOrders, 
  onOpenNewShopModal,
  onNavigateToMode 
}) => {
  const { 
    activeShop, 
    shops, 
    isShopsLoaded, 
    getShopBySlug, 
    getProductsForShop,
    setActiveShopId,
    cart, 
    addToCart, 
    updateCartQuantity, 
    cartTotal, 
    cartItemCount 
  } = useShop();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedLink, setCopiedLink] = useState(false);

  // Determine target slug from prop or browser URL
  const currentSlugFromUrl = parseStoreSlugFromUrl();
  const targetSlug = (storeSlug || currentSlugFromUrl || '').trim().toLowerCase();

  // If a slug was explicitly requested via URL (e.g. /store/:slug), resolve that specific shop
  const matchedShop = targetSlug ? getShopBySlug(targetSlug) : null;
  const isSpecificSlugRequested = Boolean(targetSlug);

  // Determine the shop to display:
  // If a specific slug is requested: use ONLY the matched shop. (If not found -> 404).
  // If NO specific slug in URL: use activeShop.
  const displayShop: Shop | null = isSpecificSlugRequested ? (matchedShop || null) : activeShop;

  // Sync activeShopId in context so cart & POS operations link to this exact shop
  useEffect(() => {
    if (displayShop && displayShop.id !== activeShop.id) {
      setActiveShopId(displayShop.id);
    }
  }, [displayShop?.id]);

  // Retrieve products strictly for the display shop
  const shopProducts = displayShop ? getProductsForShop(displayShop.id, displayShop.shopOwnerId) : [];

  // Extract unique categories from current shop's isolated products
  const categories = ['All', ...Array.from(new Set<string>(shopProducts.map(p => p.category)))];

  // Filter products by search and category
  const filteredProducts = shopProducts.filter(product => {
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
    if (!displayShop) return;
    const shareUrl = getShareableStoreUrl(displayShop.slug || displayShop.shopName);
    if (navigator.share) {
      navigator.share({
        title: displayShop.shopName,
        text: `Shop products online from ${displayShop.shopName}!`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // --------------------------------------------------------------------------
  // 1. LOADING STATE (Waiting for Firestore / local state initialization)
  // --------------------------------------------------------------------------
  if (isSpecificSlugRequested && !displayShop && !isShopsLoaded) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-4">
          <RefreshCw className="w-6 h-6 text-slate-700 animate-spin" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Locating Storefront...</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Fetching digital catalog and merchant details for <span className="font-mono text-slate-700 font-bold">/store/{targetSlug}</span>
        </p>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 2. STORE NOT FOUND 404 STATE (NO Hardcoded Fallback)
  // --------------------------------------------------------------------------
  if (isSpecificSlugRequested && !displayShop) {
    return (
      <div id="store-not-found-container" className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-between">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-6">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>HTTP 404 • Storefront Not Found</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Storefront Unavailable
          </h1>

          <p className="text-sm sm:text-base text-slate-600 mt-3 max-w-lg mx-auto leading-relaxed">
            We could not locate any active merchant store at the custom link{' '}
            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              /store/{targetSlug}
            </span>.
            The store may have been updated, renamed, or the link may have a typo.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="btn-404-browse-shops"
              onClick={() => onNavigateToMode ? onNavigateToMode('directory') : (window.location.href = '/shops')}
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Browse All Verified Stores ({shops.length})</span>
            </button>

            {onOpenNewShopModal && (
              <button
                id="btn-404-register-shop"
                onClick={onOpenNewShopModal}
                className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl font-bold text-xs shadow-2xs transition flex items-center justify-center gap-2"
              >
                <Store className="w-4 h-4 text-blue-600" />
                <span>Claim or Register This Store Name</span>
              </button>
            )}
          </div>

          {/* Other Available Stores Quick Links */}
          <div className="mt-14 pt-10 border-t border-slate-200 text-left">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4 text-center sm:text-left">
              Explore Active Local Stores:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {shops.slice(0, 6).map((shop) => (
                <div
                  key={shop.id}
                  onClick={() => onNavigateToMode ? onNavigateToMode('storefront', shop.slug) : (window.location.href = `/store/${shop.slug}`)}
                  className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-sm cursor-pointer transition flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center p-1">
                    <img 
                      src={shop.logoUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&auto=format&fit=crop&q=80'} 
                      alt={shop.shopName} 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                      {shop.shopName}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium truncate">
                      {shop.category} • {shop.city || 'India'}
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-700 transition shrink-0" />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-6">
          <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
            KGN Multi-Tenant Digital Storefront Engine • Instant WhatsApp & UPI Ordering
          </div>
        </footer>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 3. REGULAR STOREFRONT VIEW (Dynamic Store Data)
  // --------------------------------------------------------------------------
  const shopData = displayShop!;
  const waShareUrl = getWhatsAppShareUrl(
    shopData.shopName, 
    getShareableStoreUrl(shopData.slug), 
    shopData.whatsappNumber || shopData.phone
  );

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
                  src={shopData.logoUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80'}
                  alt={shopData.shopName}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                    {shopData.shopName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100 uppercase tracking-wider">
                    {shopData.category}
                  </span>
                  {shopData.isActive && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live Store
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                  {shopData.tagline || 'Direct storefront with instant home delivery, counter pickup, and UPI payments.'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-3">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{shopData.address || `${shopData.city} - ${shopData.pincode}`}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{shopData.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 self-stretch md:self-auto">
              <a
                id="shop-direct-whatsapp-btn"
                href={`https://wa.me/${shopData.whatsappNumber || shopData.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(shopData.shopName)},%20I%20want%20to%20place%20an%20order`}
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
              placeholder={`Search catalog in ${shopData.shopName}...`}
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
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold text-[11px] border border-emerald-100">
              Fresh Inventory
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
              This store has not listed products under this filter yet, or try searching another keyword.
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

      {/* 5. Minimalist Storefront Footer */}
      <footer className="mt-20 border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-700">{shopData.shopName} • Open for Delivery & Pickup</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>Fast Home Delivery</span>
            <span>•</span>
            <span>Counter Pickup</span>
            <span>•</span>
            <span>UPI & Cash on Delivery</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              id="footer-merchant-login-btn"
              onClick={onOpenAuth}
              className="text-slate-500 hover:text-slate-900 transition font-medium"
            >
              Merchant / Staff Login
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};
