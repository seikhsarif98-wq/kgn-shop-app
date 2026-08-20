import React, { useState } from 'react';
import { 
  Lock, 
  Sparkles, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  QrCode,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { SubscriptionTier } from '../../types';
import { TIER_PLANS, PlanConfig } from '../../lib/plans';

interface FeatureLockPaywallProps {
  featureName: string;
  featureDescription: string;
  requiredTier: SubscriptionTier;
  icon?: React.FC<{ className?: string }>;
  onUpgradeSuccess?: () => void;
}

export const FeatureLockPaywall: React.FC<FeatureLockPaywallProps> = ({
  featureName,
  featureDescription,
  requiredTier,
  icon: Icon = Lock,
  onUpgradeSuccess
}) => {
  const { activeShop, upgradePlan } = useShop();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedPlanTier, setSelectedPlanTier] = useState<SubscriptionTier>(requiredTier);
  const [isSuccess, setIsSuccess] = useState(false);

  const targetPlan = TIER_PLANS[selectedPlanTier];

  const handleInstantUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await upgradePlan(selectedPlanTier);
      setIsSuccess(true);
      if (onUpgradeSuccess) {
        setTimeout(() => {
          onUpgradeSuccess();
        }, 1200);
      }
    } catch (err) {
      console.error('Upgrade failed:', err);
    } finally {
      setIsUpgrading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center max-w-lg mx-auto my-12 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Plan Upgraded Successfully!</h3>
        <p className="text-xs text-slate-500 mt-1">
          Your shop is now on the <strong>{targetPlan.name}</strong> (₹{targetPlan.monthlyPrice}/mo).
          <br />
          <strong>{featureName}</strong> and higher limits have been unlocked immediately.
        </p>
      </div>
    );
  }

  return (
    <div id="feature-lock-paywall" className="max-w-2xl mx-auto my-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
      
      {/* Banner */}
      <div className="bg-slate-900 text-white p-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>Feature Locked • {targetPlan.name} Required</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Unlock {featureName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg leading-relaxed">
            {featureDescription}
          </p>
        </div>

        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-600 rounded-full blur-[80px] opacity-25 pointer-events-none" />
      </div>

      {/* Body & Tier Comparison */}
      <div className="p-6 sm:p-8 space-y-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Starter Merchant Card */}
          <div 
            onClick={() => setSelectedPlanTier('starter')}
            className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
              selectedPlanTier === 'starter'
                ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/10'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Starter Merchant</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">High-Speed POS & Invoices</p>
                </div>
                {selectedPlanTier === 'starter' && (
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                )}
              </div>

              <div className="mt-3 text-2xl font-bold text-slate-900">
                ₹199<span className="text-xs font-normal text-slate-500">/month</span>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Up to 100 Products Catalog</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Full POS Billing Terminal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Thermal & PDF Receipts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pro Business Card */}
          <div 
            onClick={() => setSelectedPlanTier('pro')}
            className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between relative ${
              selectedPlanTier === 'pro'
                ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/10'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="absolute -top-2.5 right-4 bg-blue-600 text-white font-bold text-[9px] uppercase px-2 py-0.5 rounded-full tracking-wider">
              Recommended
            </span>

            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Pro Business</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Khata + Unlimited Catalog</p>
                </div>
                {selectedPlanTier === 'pro' && (
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                )}
              </div>

              <div className="mt-3 text-2xl font-bold text-slate-900">
                ₹499<span className="text-xs font-normal text-slate-500">/month</span>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Unlimited Products & SKUs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Digital Khata (Credit Ledger)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>WhatsApp Payment Reminders</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Sales Reports & Analytics</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Instant activation • Cancel anytime • Zero setup fee</span>
          </div>

          <button
            id="paywall-upgrade-confirm-btn"
            onClick={handleInstantUpgrade}
            disabled={isUpgrading}
            className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
          >
            {isUpgrading ? (
              <span>Activating Subscription...</span>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                <span>Upgrade to {targetPlan.name} (₹{targetPlan.monthlyPrice}/mo)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
