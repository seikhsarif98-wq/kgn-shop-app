import React from 'react';
import { useShop } from '../../context/ShopContext';
import { Package, Zap, AlertTriangle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { getTierPlan, getTierProductLimit } from '../../lib/plans';

interface UsageMeterProps {
  onUpgradeClick?: () => void;
  compact?: boolean;
}

export const UsageMeter: React.FC<UsageMeterProps> = ({ onUpgradeClick, compact = false }) => {
  const { activeShop, products } = useShop();

  const plan = getTierPlan(activeShop.tier);
  const limit = plan.productLimit;
  const currentCount = products.length;
  const isUnlimited = limit >= 9999;
  const percentage = isUnlimited ? 0 : Math.min(100, Math.round((currentCount / limit) * 100));
  const isNearLimit = !isUnlimited && percentage >= 80;
  const isLimitReached = !isUnlimited && currentCount >= limit;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-500">Catalog Usage:</span>
        <span className="font-bold text-slate-900">
          {currentCount} {isUnlimited ? 'products' : `/ ${limit}`}
        </span>
        {!isUnlimited && (
          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${isLimitReached ? 'bg-rose-500' : isNearLimit ? 'bg-amber-500' : 'bg-blue-600'}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div id="tier-usage-meter-widget" className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-slate-900">Catalog Quota</h4>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 uppercase">
                {plan.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {isUnlimited 
                ? 'Unlimited products & categories enabled' 
                : `${currentCount} of ${limit} products used (${percentage}%)`
              }
            </p>
          </div>
        </div>

        {onUpgradeClick && !isUnlimited && (
          <button
            id="meter-upgrade-plan-btn"
            onClick={onUpgradeClick}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs"
          >
            <Zap className="w-3 h-3 text-blue-400" />
            <span>Upgrade</span>
          </button>
        )}
      </div>

      {!isUnlimited && (
        <div className="space-y-1.5">
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isLimitReached ? 'bg-rose-500' : isNearLimit ? 'bg-amber-500' : 'bg-slate-900'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {isLimitReached && (
            <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Product limit reached (15/15). Upgrade to Starter (₹199) or Pro (₹499) to add more.</span>
            </div>
          )}

          {isNearLimit && !isLimitReached && (
            <div className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Approaching product quota ({limit - currentCount} remaining).</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
