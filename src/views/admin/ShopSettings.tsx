import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { 
  Store, 
  Camera, 
  MapPin, 
  Phone, 
  MessageSquare, 
  QrCode, 
  Check, 
  Save, 
  Sparkles, 
  ShieldCheck, 
  Zap,
  Upload,
  Trash2,
  ExternalLink,
  Cloud,
  CheckCircle2,
  Lock,
  KeyRound,
  Globe,
  Copy,
  AlertTriangle,
  RotateCcw,
  Layers
} from 'lucide-react';
import { MediaCaptureModal } from '../../components/common/MediaCaptureModal';
import { getShareableStoreUrl, slugifyShopName } from '../../lib/slugs';

interface ShopSettingsProps {
  onViewStorefront?: (slug?: string) => void;
}

export const ShopSettings: React.FC<ShopSettingsProps> = ({ onViewStorefront }) => {
  const { activeShop, shops, updateShopSettings, deleteShop, resetDemoShops, restoreDemoShops } = useShop();

  const [shopName, setShopName] = useState(activeShop.shopName);
  const [tagline, setTagline] = useState(activeShop.tagline || '');
  const [category, setCategory] = useState(activeShop.category);
  const [adminPin, setAdminPin] = useState(activeShop.adminPin || '1234');
  const [phone, setPhone] = useState(activeShop.phone);
  const [whatsappNumber, setWhatsappNumber] = useState(activeShop.whatsappNumber || '');
  const [address, setAddress] = useState(activeShop.address || '');
  const [city, setCity] = useState(activeShop.city || '');
  const [pincode, setPincode] = useState(activeShop.pincode || '');
  const [upiId, setUpiId] = useState(activeShop.upiId || '');
  const [paymentQrUrl, setPaymentQrUrl] = useState(activeShop.paymentQrUrl || '');
  const [logoUrl, setLogoUrl] = useState(activeShop.logoUrl || '');
  const [bannerUrl, setBannerUrl] = useState(activeShop.bannerUrl || '');

  // Media Capture Modal State
  const [mediaTarget, setMediaTarget] = useState<'logo' | 'banner' | 'qr' | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Sync state when activeShop changes
  useEffect(() => {
    setShopName(activeShop.shopName);
    setTagline(activeShop.tagline || '');
    setCategory(activeShop.category);
    setAdminPin(activeShop.adminPin || '1234');
    setPhone(activeShop.phone);
    setWhatsappNumber(activeShop.whatsappNumber || '');
    setAddress(activeShop.address || '');
    setCity(activeShop.city || '');
    setPincode(activeShop.pincode || '');
    setUpiId(activeShop.upiId || '');
    setPaymentQrUrl(activeShop.paymentQrUrl || '');
    setLogoUrl(activeShop.logoUrl || '');
    setBannerUrl(activeShop.bannerUrl || '');
  }, [activeShop.id, activeShop]);

  const activeStoreSlug = slugifyShopName(activeShop.slug || activeShop.shopName);
  const shareableStoreUrl = getShareableStoreUrl(activeStoreSlug);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareableStoreUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleResetDemoShops = async () => {
    if (window.confirm(`Are you sure you want to delete all other demo/test shops and keep ONLY "${activeShop.shopName}" as your 1 active main shop?`)) {
      await resetDemoShops(activeShop.id);
      setActionFeedback(`Extra test shops cleared! Kept 1 active main shop: ${activeShop.shopName}`);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  const handleDeleteThisShop = async () => {
    if (shops.length <= 1) {
      alert('You cannot delete your only active shop.');
      return;
    }
    if (window.confirm(`Are you sure you want to permanently delete "${activeShop.shopName}"?`)) {
      await deleteShop(activeShop.id);
      setActionFeedback(`Store "${activeShop.shopName}" deleted successfully.`);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  const handleRestoreDemoShops = async () => {
    if (window.confirm('Restore all default demo stores and product catalog?')) {
      await restoreDemoShops();
      setActionFeedback('Default demo shops restored successfully.');
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateShopSettings({
      shopName,
      tagline,
      category,
      adminPin: adminPin.trim() || '1234',
      phone,
      whatsappNumber,
      address,
      city,
      pincode,
      upiId,
      paymentQrUrl,
      logoUrl,
      bannerUrl
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Shop Settings & Store Branding</h2>
          <p className="text-xs text-slate-500">
            Configure your storefront visuals, UPI payment QR code, and contact information with direct web links, presets, or local photos.
          </p>
        </div>

        {isSaved && (
          <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl animate-in fade-in">
            <Check className="w-4 h-4" />
            Changes Saved Live
          </span>
        )}
      </div>

      {/* Feedback Alert */}
      {actionFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionFeedback}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-emerald-700 hover:text-emerald-900 text-xs">Dismiss</button>
        </div>
      )}

      {/* Shareable Store URL Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">Online Storefront Shareable URL</h3>
              <p className="text-xs text-slate-400">
                Direct public store link generated from this shop's exact name slug: <strong className="font-mono text-emerald-400">/store/{activeStoreSlug}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onViewStorefront && (
              <button
                type="button"
                id="settings-view-storefront-btn"
                onClick={() => onViewStorefront('/store/' + activeStoreSlug)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                <span>View Public Storefront</span>
              </button>
            )}

            <button
              type="button"
              id="settings-copy-store-url-btn"
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                copiedLink ? 'bg-emerald-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Store Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3">
          <span className="font-mono text-xs text-emerald-400 truncate font-semibold">
            {shareableStoreUrl}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider shrink-0">
            Active Store
          </span>
        </div>
      </div>

      {/* 2. Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* Banner & Logo Media Customizer */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>Visual Branding & Storefront Photos</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Web Links & Vector Support
            </span>
          </div>
          
          <div className="space-y-4">
            {/* Banner preview */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">Shop Banner Image</label>
                <input
                  type="url"
                  placeholder="Or paste banner image web link..."
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  className="text-[11px] p-1.5 bg-slate-50 border border-slate-200 rounded-lg w-72 focus:bg-white focus:outline-none"
                />
              </div>
              <div className="relative h-36 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group">
                <img
                  src={bannerUrl || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80'}
                  alt="Banner preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  id="change-banner-media-btn"
                  onClick={() => setMediaTarget('banner')}
                  className="absolute bottom-3 right-3 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Select / Change Banner Photo
                </button>
              </div>
            </div>

            {/* Logo preview */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Shop Logo / Avatar</label>
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 p-1 shadow-2xs overflow-hidden shrink-0">
                  <img
                    src={logoUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80'}
                    alt="Logo"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="change-logo-media-btn"
                      onClick={() => setMediaTarget('logo')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-2 transition"
                    >
                      <Upload className="w-4 h-4 text-emerald-600" />
                      Choose Photo / SVG
                    </button>
                  </div>
                  <input
                    type="url"
                    placeholder="Or enter logo web link (https://...)"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full max-w-sm text-[11px] p-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Info & Contact */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">Store Information & Business Profile</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Shop Name *</label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Store Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Kirana, Supermarket, Electronics"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Store Tagline / Promotional Slogan</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Fresh Groceries & Instant 30-Min Home Delivery"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">WhatsApp Order Number</label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Physical Store Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Shop No. 4, Main Market Road"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">City / Town</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* UPI Payments & Payment QR Code Upload */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>UPI Payments & Custom QR Standee</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-medium">Dynamic UPI & Custom QR</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Merchant VPA */}
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Merchant UPI ID / VPA *</label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="seikhsarif16@oksbi"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 font-mono text-emerald-800 font-bold"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Used to dynamically generate custom QR codes with exact bill amounts during POS counter billing and Online Storefront checkouts.
                </p>
              </div>

              {/* Dynamic QR Preview Info */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <QrCode className="w-5 h-5 text-slate-700" />
                </div>
                <div className="text-[11px] text-slate-600">
                  <span className="font-bold text-slate-900">Dynamic UPI Generator: </span>
                  Automatically crafts QR codes for Google Pay, PhonePe, Paytm, and BHIM apps.
                </div>
              </div>
            </div>

            {/* Custom Payment QR Photo Upload */}
            <div className="space-y-2">
              <label className="block font-semibold text-slate-700">Custom Shop QR Code / Standee URL (Optional)</label>
              <p className="text-[11px] text-slate-500">
                Upload your printed shop QR sticker or paste image web link. Customers can scan your merchant QR directly.
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="Paste QR image URL or click button..."
                  value={paymentQrUrl}
                  onChange={(e) => setPaymentQrUrl(e.target.value)}
                  className="flex-1 text-[11px] p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setMediaTarget('qr')}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs shrink-0 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Choose Photo</span>
                </button>
              </div>

              {paymentQrUrl && (
                <div className="relative border border-emerald-200 bg-emerald-50/50 p-3 rounded-2xl flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 p-1 shrink-0 overflow-hidden shadow-2xs">
                    <img src={paymentQrUrl} alt="Payment QR Code" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Custom QR Active</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPaymentQrUrl('')}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 mt-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove QR
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* 4. Admin Security & PIN Configuration */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>Admin Security & Terminal PIN Lock</span>
            </h3>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
              <KeyRound className="w-3 h-3 text-blue-600" /> POS & Inventory Protection
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Set a custom 4-digit numeric PIN or password for your shopkeeper dashboard. This PIN is required to unlock product management, inventory controls, POS cashier terminal, and the Khata ledger when accessing <strong className="text-slate-700">/admin</strong>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Console PIN / Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  maxLength={12}
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="e.g. 1234"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-slate-900 font-mono font-bold text-slate-900 text-sm tracking-wider"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Default demo master PIN is <strong className="text-slate-600">1234</strong>. You can change it to any custom PIN for your store.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-[11px] text-slate-600">
                <span className="font-bold text-slate-900">One-Click Lock: </span>
                Merchants can lock the terminal anytime using the "Lock Admin Terminal" button when away from the billing counter.
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            id="save-shop-settings-btn"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Store Configuration
          </button>
        </div>

      </form>

      {/* 5. Danger Zone & Demo Stores Fleet Management */}
      <div className="bg-white rounded-3xl p-6 border border-rose-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-rose-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Store Network & Demo Shops Management</h3>
              <p className="text-xs text-slate-500">
                Manage your registered shop profile or clear sample test stores from the multi-shop switcher.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            {shops.length} Registered {shops.length === 1 ? 'Shop' : 'Shops'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Option A: Clear Extra Demo Shops and Keep Only Active 1 */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-xs text-slate-900">Clear Extra Demo Shops</h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Delete all other unused demo/test stores from the switcher and keep ONLY <strong className="text-slate-800">"{activeShop.shopName}"</strong> as your 1 active main shop.
              </p>
            </div>

            <button
              type="button"
              id="reset-clear-extra-demo-shops-btn"
              onClick={handleResetDemoShops}
              className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Reset / Clear Extra Demo Shops (Keep 1 Main)</span>
            </button>
          </div>

          {/* Option B: Delete Currently Active Shop or Restore Defaults */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <h4 className="font-bold text-xs text-slate-900">Delete Current Store ({activeShop.shopName})</h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Permanently delete this specific shop. {shops.length <= 1 ? '(Disabled: At least 1 shop is required).' : 'The switcher will move to the next store.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="delete-current-shop-btn"
                disabled={shops.length <= 1}
                onClick={handleDeleteThisShop}
                className="flex-1 py-2.5 px-3 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Store</span>
              </button>

              <button
                type="button"
                id="restore-demo-shops-btn"
                onClick={handleRestoreDemoShops}
                className="py-2.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1"
                title="Restore all default sample shops"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Sample Shops</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Media Capture Modal */}
      {mediaTarget && (
        <MediaCaptureModal
          isOpen={!!mediaTarget}
          onClose={() => setMediaTarget(null)}
          onCapture={(capturedMedia) => {
            if (mediaTarget === 'logo') setLogoUrl(capturedMedia);
            if (mediaTarget === 'banner') setBannerUrl(capturedMedia);
            if (mediaTarget === 'qr') setPaymentQrUrl(capturedMedia);
            setMediaTarget(null);
          }}
          title={
            mediaTarget === 'logo' 
              ? 'Upload Shop Logo' 
              : mediaTarget === 'banner' 
              ? 'Upload Shop Banner' 
              : 'Upload Payment QR Code Photo'
          }
          aspectRatio={mediaTarget === 'banner' ? 'banner' : 'square'}
          category={mediaTarget === 'logo' ? 'logo' : mediaTarget === 'banner' ? 'banner' : 'qr'}
        />
      )}

    </div>
  );
};
