import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Store, 
  X, 
  Sparkles, 
  Building2, 
  Phone, 
  MapPin, 
  QrCode, 
  Check, 
  Zap, 
  User, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { SubscriptionTier } from '../../types';

interface NewShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewShopModal: React.FC<NewShopModalProps> = ({ isOpen, onClose }) => {
  const { createNewShop } = useShop();
  const { user, activeShopOwnerId } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState('Kirana & Grocery');
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('400001');
  const [upiId, setUpiId] = useState('');
  const [tier, setTier] = useState<SubscriptionTier>('starter');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setShopName(val);
    // Auto populate suggested UPI
    const clean = val.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean && !upiId) {
      setUpiId(`${clean}@okaxis`);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !phone) {
      alert('Please provide shop name and contact phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const slug = shopName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `shop-${Date.now()}`;
      
      await createNewShop({
        shopName,
        slug,
        tagline: tagline || `${category} store with instant delivery`,
        category,
        phone,
        whatsappNumber: whatsappNumber || phone,
        city: city || 'Mumbai',
        address: address || 'Main Market Road',
        pincode: pincode || '400001',
        upiId: upiId || `${slug.replace(/-/g, '')}@okhdfcbank`,
        logoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1000&auto=format&fit=crop&q=80',
        tier,
        currency: '₹',
        isActive: true
      });

      onClose();
    } catch (err) {
      console.error('Failed to create shop:', err);
      alert('Error creating shop. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="new-shop-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div id="new-shop-dialog" className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Onboard New Merchant Shop</h3>
              <p className="text-[10px] text-slate-400">Isolated database namespace & digital billing</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center border-b border-slate-100 bg-slate-50 px-6 py-2.5 text-xs">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center gap-1.5 font-bold ${step === 1 ? 'text-slate-900' : 'text-slate-400'}`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
            <span>Store Profile</span>
          </button>

          <span className="mx-3 text-slate-300">/</span>

          <button
            type="button"
            onClick={() => {
              if (shopName && phone) setStep(2);
            }}
            className={`flex items-center gap-1.5 font-bold ${step === 2 ? 'text-slate-900' : 'text-slate-400'}`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
            <span>Plan & Settlement</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          
          {step === 1 ? (
            <div className="space-y-3.5 animate-in fade-in">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Shop / Business Name *</label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Royal Fresh Supermarket"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-slate-900 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Shopkeeper / Owner Name</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Ahmed Farooqui"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Business Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-slate-900 font-medium text-slate-800"
                  >
                    <option value="Kirana & Grocery">Kirana & Grocery</option>
                    <option value="Supermarket">Supermarket</option>
                    <option value="Electronics & Mobiles">Electronics & Mobiles</option>
                    <option value="Vegetables & Fruits">Vegetables & Fruits</option>
                    <option value="Bakery & Sweets">Bakery & Sweets</option>
                    <option value="Dairy & Milk">Dairy & Milk</option>
                    <option value="Pharmacy & Healthcare">Pharmacy & Healthcare</option>
                    <option value="Clothing & Fashion">Clothing & Fashion</option>
                    <option value="General Retail">General Retail</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City / Region</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tagline / Short Description</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Fresh Daily Groceries, Instant POS & Free Home Delivery"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">WhatsApp Order Dispatch</label>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Physical Store Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Shop No. 15, Bazar Road"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="400008"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              {/* UPI ID */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Merchant UPI ID (For Instant QR Generation)</label>
                <div className="relative">
                  <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="merchant@okhdfcbank"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-slate-900 font-mono font-semibold text-blue-900"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Used to generate dynamic QR codes for GPay, PhonePe, Paytm, and BHIM.</p>
              </div>

              {/* Plan Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-2">Select Initial SaaS Plan</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <div 
                    onClick={() => setTier('starter')}
                    className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      tier === 'starter' ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-900">Starter Kirana</span>
                      {tier === 'starter' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                    <div className="mt-2 text-xs font-black text-slate-900">₹499<span className="text-[10px] font-normal text-slate-500">/mo</span></div>
                    <p className="text-[10px] text-slate-500 mt-1">Up to 500 SKUs, POS & Khata</p>
                  </div>

                  <div 
                    onClick={() => setTier('pro')}
                    className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between relative ${
                      tier === 'pro' ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="absolute -top-2 right-2 bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.2 rounded uppercase">Popular</span>
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-900">Multi-Shop Pro</span>
                      {tier === 'pro' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                    <div className="mt-2 text-xs font-black text-slate-900">₹999<span className="text-[10px] font-normal text-slate-500">/mo</span></div>
                    <p className="text-[10px] text-slate-500 mt-1">Unlimited SKUs & Auto WhatsApp</p>
                  </div>
                </div>
              </div>

              {/* Security & Tenant Badge */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tenant Data Isolation Assurance</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Upon provisioning, a unique namespace partition with dedicated Firestore security rules is allocated to this store.
                </p>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {step === 2 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition"
              >
                Cancel
              </button>
            )}

            {step === 1 ? (
              <button
                type="button"
                disabled={!shopName || !phone}
                onClick={() => setStep(2)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl font-bold transition shadow-xs flex items-center gap-1.5"
              >
                {isSubmitting ? 'Provisioning...' : 'Complete & Launch Store'}
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
};
