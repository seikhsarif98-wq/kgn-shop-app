import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Store, 
  Users, 
  Receipt, 
  MessageSquare,
  ArrowRight,
  QrCode,
  CheckCircle2,
  X,
  Lock,
  ArrowUpRight,
  Package,
  Copy,
  ExternalLink,
  Smartphone,
  Loader2,
  Info,
  Upload,
  Camera,
  Trash2
} from 'lucide-react';
import { SubscriptionTier } from '../../types';
import { TIER_PLANS, PlanConfig, getTierPlan } from '../../lib/plans';
import { UsageMeter } from '../../components/admin/UsageMeter';
import { MediaCaptureModal } from '../../components/common/MediaCaptureModal';

export const SubscriptionPlans: React.FC = () => {
  const { activeShop, upgradePlan, products, submitPlanUpgradeRequest, subscriptionRequests } = useShop();
  const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [upgradedSuccess, setUpgradedSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingUpgradeTier, setPendingUpgradeTier] = useState<SubscriptionTier | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [receiptImageUrl, setReceiptImageUrl] = useState('');
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const planTiers: SubscriptionTier[] = ['free', 'starter', 'pro', 'enterprise'];
  const PLATFORM_UPI_ID = 'seikhsarif16@oksbi';
  const PLATFORM_ADMIN_PHONE = activeShop.whatsappNumber || activeShop.phone.replace(/[^0-9]/g, '') || '919876543210';

  // Find any active/pending subscription request for this shop
  const shopSubRequests = subscriptionRequests.filter(r => r.shopId === activeShop.id);
  const latestRequest = shopSubRequests[0];

  const handleOpenUpgradeModal = (tier: SubscriptionTier) => {
    if (tier === activeShop.tier) return;
    setPendingUpgradeTier(tier);
    setUtrNumber('');
    setReceiptImageUrl('');
    setCopiedUpi(false);
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(PLATFORM_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleConfirmUpgrade = async () => {
    if (!pendingUpgradeTier) return;
    setIsProcessing(true);
    try {
      const plan = TIER_PLANS[pendingUpgradeTier];
      const amount = selectedBilling === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;

      if (amount > 0) {
        await submitPlanUpgradeRequest(
          pendingUpgradeTier, 
          utrNumber.trim() || `UPI_${Date.now().toString().slice(-8)}`, 
          amount,
          receiptImageUrl.trim() || undefined
        );
      }
      await upgradePlan(pendingUpgradeTier);
      
      setUpgradedSuccess(plan.name);
      setPendingUpgradeTier(null);
      setTimeout(() => setUpgradedSuccess(null), 6000);
    } catch (err) {
      console.error('Upgrade failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // WhatsApp verification message generator
  const sendWhatsAppSubscriptionProof = (tier: SubscriptionTier, amount: number) => {
    const plan = TIER_PLANS[tier];
    const message = encodeURIComponent(
      `*🌟 NEW SUBSCRIPTION UPGRADE REQUEST - KGN SHOP PLATFORM*\n\n` +
      `*Shop Name:* ${activeShop.shopName}\n` +
      `*Owner Phone:* ${activeShop.phone}\n` +
      `*Target Plan:* ${plan.name} (${selectedBilling.toUpperCase()})\n` +
      `*Amount Paid:* ₹${amount}\n` +
      `*Payment UPI ID:* ${PLATFORM_UPI_ID}\n` +
      (utrNumber ? `*Transaction / UTR No:* ${utrNumber}\n\n` : '\n') +
      `_Please verify the payment and maintain active plan status._`
    );

    window.open(`https://wa.me/${PLATFORM_ADMIN_PHONE}?text=${message}`, '_blank');
  };

  const currentPlan = getTierPlan(activeShop.tier);

  // Selected pending plan details for modal
  const targetPlan = pendingUpgradeTier ? TIER_PLANS[pendingUpgradeTier] : null;
  const targetAmount = targetPlan 
    ? (selectedBilling === 'yearly' ? targetPlan.yearlyPrice : targetPlan.monthlyPrice)
    : 0;

  const upiPayLink = targetPlan && targetAmount > 0
    ? `upi://pay?pa=${PLATFORM_UPI_ID}&pn=${encodeURIComponent('KGN SHOP Platform')}&am=${targetAmount}&cu=INR&tn=KGN_SUB_${encodeURIComponent(activeShop.shopName.replace(/\s+/g, '_'))}_${targetPlan.tier}`
    : '';

  const upiQrImageUrl = targetAmount > 0
    ? `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=10&data=${encodeURIComponent(upiPayLink)}`
    : '';

  return (
    <div id="subscription-management-root" className="space-y-8 animate-in fade-in">
      
      {/* 1. Current Active Plan & Quota Summary */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                Active Tenant Plan
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span>{currentPlan.name}</span>
              <span className="text-sm font-normal text-slate-500">
                (₹{currentPlan.monthlyPrice}/mo)
              </span>
            </h2>
            <p className="text-xs text-slate-500 max-w-md">
              {currentPlan.tagline}
            </p>
          </div>

          <div className="w-full md:w-80">
            <UsageMeter />
          </div>

        </div>
      </div>

      {/* 2. Success Banner */}
      {upgradedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs font-bold text-emerald-900 animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            🎉 Store tier successfully upgraded to <strong>{upgradedSuccess}</strong>! All features and quotas have been unlocked immediately.
          </div>
        </div>
      )}

      {/* 3. Header & Billing Switch */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
          Flexible Plans for Every Shop Size
        </h3>
        <p className="text-xs text-slate-500">
          Scale your Kirana store, Supermarket, or Retail brand with high-speed POS billing, dynamic UPI QR payments, and digital Khata ledger.
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 mt-2">
          <button
            onClick={() => setSelectedBilling('monthly')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedBilling === 'monthly'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setSelectedBilling('yearly')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              selectedBilling === 'yearly'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Annual (Save 20%)</span>
          </button>
        </div>
      </div>

      {/* 4. Plans Grid: Free, ₹199 Starter, ₹499 Pro, ₹999 Enterprise */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {planTiers.map((tierKey) => {
          const plan = TIER_PLANS[tierKey];
          const isCurrentPlan = activeShop.tier === plan.tier;
          const price = selectedBilling === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;

          return (
            <div
              key={plan.tier}
              id={`plan-card-${plan.tier}`}
              className={`rounded-3xl p-6 flex flex-col justify-between transition relative ${
                plan.popular
                  ? 'bg-slate-900 text-white shadow-xl ring-2 ring-blue-500'
                  : isCurrentPlan
                  ? 'bg-slate-50 text-slate-900 border-2 border-slate-900 shadow-2xs'
                  : 'bg-white text-slate-900 border border-slate-200 shadow-2xs hover:border-slate-300'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                  {plan.badge || 'Recommended'}
                </span>
              )}

              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-base">{plan.name}</h4>
                    <p className={`text-[11px] mt-1 line-clamp-2 ${plan.popular ? 'text-slate-400' : 'text-slate-500'}`}>
                      {plan.tagline}
                    </p>
                  </div>
                </div>

                <div className={`mt-4 pb-4 border-b ${plan.popular ? 'border-slate-800' : 'border-slate-100'}`}>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold tracking-tight">₹{price}</span>
                    <span className={`text-xs font-normal ${plan.popular ? 'text-slate-400' : 'text-slate-500'}`}>
                      / month
                    </span>
                  </div>
                  {selectedBilling === 'yearly' && price > 0 && (
                    <div className="text-[10px] text-blue-400 font-semibold mt-0.5">
                      Billed annually (₹{price * 12}/yr)
                    </div>
                  )}
                </div>

                {/* Features List */}
                <div className="py-4 space-y-2.5">
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${
                    plan.popular ? 'text-blue-400' : 'text-slate-400'
                  }`}>
                    What's included:
                  </div>

                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                        plan.popular ? 'text-blue-400' : 'text-emerald-600'
                      }`} />
                      <span className={plan.popular ? 'text-slate-300' : 'text-slate-600'}>
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100/10">
                {isCurrentPlan ? (
                  <button
                    disabled
                    className={`w-full py-2.5 rounded-xl font-bold text-xs text-center cursor-default ${
                      plan.popular 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    Current Active Plan
                  </button>
                ) : (
                  <button
                    id={`upgrade-to-${plan.tier}-btn`}
                    onClick={() => handleOpenUpgradeModal(plan.tier)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs ${
                      plan.popular
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <span>Upgrade to {plan.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* 5. Interactive Subscription UPI QR & Payment Modal */}
      {pendingUpgradeTier && targetPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 my-auto">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Upgrade to {targetPlan.name}</h3>
                  <p className="text-[10px] text-slate-400">Scan UPI QR to activate subscription</p>
                </div>
              </div>
              <button 
                onClick={() => setPendingUpgradeTier(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              
              {/* Plan Pricing Summary Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selected Plan</div>
                  <div className="text-base font-extrabold text-slate-900">
                    {targetPlan.name}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    {selectedBilling === 'yearly' ? 'Annual Billing (Save 20%)' : 'Monthly Billing'}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-slate-900">
                    ₹{targetAmount}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {selectedBilling === 'yearly' ? '/ year' : '/ month'}
                  </div>
                </div>
              </div>

              {/* PAID PLAN: UPI QR CODE & DIRECT PAY ENGINE */}
              {targetAmount > 0 ? (
                <div className="space-y-3">
                  
                  {/* High-Resolution QR Card */}
                  <div className="bg-gradient-to-b from-slate-50 to-blue-50/40 p-4 rounded-2xl border border-slate-200 text-center space-y-2.5">
                    <div className="flex items-center justify-center gap-1.5 text-slate-900 font-bold text-xs">
                      <QrCode className="w-4 h-4 text-blue-600" />
                      <span>Scan QR with Any UPI App</span>
                    </div>

                    <div className="relative inline-block bg-white p-3 rounded-2xl shadow-sm border border-slate-200 mx-auto">
                      <img
                        src={upiQrImageUrl}
                        alt="Subscription UPI QR Code"
                        className="w-48 h-48 sm:w-52 sm:h-52 object-contain mx-auto rounded-lg"
                      />
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-center gap-2">
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-semibold">
                        GPay • PhonePe • Paytm • BHIM
                      </span>
                    </div>
                  </div>

                  {/* UPI ID Copy Field */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-700">Platform UPI ID</label>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="font-mono font-bold text-xs text-slate-900 flex-1 truncate select-all pl-1">
                        {PLATFORM_UPI_ID}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1 shrink-0"
                      >
                        {copiedUpi ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 text-[11px]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-[11px]">Copy ID</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Direct Tap to Open UPI App (Mobile deep link) */}
                  <a
                    href={upiPayLink}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Tap to Pay ₹{targetAmount} via UPI App</span>
                  </a>

                  {/* UTR / Transaction ID Reference Field */}
                  <div className="space-y-1 pt-1">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      12-Digit UPI Transaction / UTR No. (Optional)
                    </label>
                    <input
                      type="text"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      placeholder="e.g. 423987123456"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-900 focus:outline-none"
                    />
                  </div>

                  {/* Payment Screenshot / Receipt Upload */}
                  <div className="space-y-1 pt-1">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      Payment Screenshot / Receipt Photo (Optional)
                    </label>
                    
                    {receiptImageUrl ? (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img 
                            src={receiptImageUrl} 
                            alt="Receipt preview" 
                            className="w-10 h-10 object-cover rounded-lg border border-slate-200 bg-white shrink-0" 
                          />
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold text-emerald-900 block truncate">Receipt Attached</span>
                            <span className="text-[9px] text-emerald-700">Verified for Super Admin Approval</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setReceiptImageUrl('')}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                          title="Remove receipt"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <button
                          type="button"
                          onClick={() => setIsReceiptModalOpen(true)}
                          className="w-full py-2 px-3 border border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/30 rounded-xl text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition"
                        >
                          <Upload className="w-3.5 h-3.5 text-blue-600" />
                          <span>Attach Receipt Photo / Link</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                /* FREE PLAN CONFIRMATION */
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <Info className="w-4 h-4 text-slate-500" />
                    <span>Free Plan Switch</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Switching to the Free Plan requires no payment. Your product limit will be adjusted to 20 items.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-2">
                {targetAmount > 0 && (
                  <button
                    type="button"
                    onClick={() => sendWhatsAppSubscriptionProof(pendingUpgradeTier, targetAmount)}
                    className="w-full sm:w-auto px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                    title="Send payment proof on WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Proof</span>
                  </button>
                )}

                <div className="flex-1 w-full flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setPendingUpgradeTier(null)}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold transition text-xs"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleConfirmUpgrade}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold transition flex items-center justify-center gap-2 shadow-xs text-xs"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Activating...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Confirm & Activate Plan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Receipt Image Upload Modal */}
      {isReceiptModalOpen && (
        <MediaCaptureModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          onCapture={(media) => {
            setReceiptImageUrl(media);
            setIsReceiptModalOpen(false);
          }}
          title="Upload UPI Payment Receipt"
          aspectRatio="square"
        />
      )}

    </div>
  );
};
