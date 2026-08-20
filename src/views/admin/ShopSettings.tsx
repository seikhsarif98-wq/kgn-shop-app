import React, { useState } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { MediaCaptureModal } from '../../components/common/MediaCaptureModal';

export const ShopSettings: React.FC = () => {
  const { activeShop, updateShopSettings } = useShop();

  const [shopName, setShopName] = useState(activeShop.shopName);
  const [tagline, setTagline] = useState(activeShop.tagline || '');
  const [category, setCategory] = useState(activeShop.category);
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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateShopSettings({
      shopName,
      tagline,
      category,
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
