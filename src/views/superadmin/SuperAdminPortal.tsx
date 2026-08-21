import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useShop } from '../../context/ShopContext';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Store, 
  IndianRupee, 
  Users, 
  Search, 
  Filter, 
  Check, 
  X, 
  AlertTriangle, 
  Lock, 
  ExternalLink, 
  Copy, 
  ArrowRight, 
  Sparkles, 
  RefreshCw, 
  Eye, 
  Phone, 
  Mail, 
  Layers, 
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  CreditCard,
  MessageSquare,
  KeyRound,
  Shield,
  Save
} from 'lucide-react';
import { SubscriptionTier, SubscriptionRequest, Shop } from '../../types';
import { TIER_PLANS, getTierPlan } from '../../lib/plans';
import { SuperAdminLoginScreen } from './SuperAdminLoginScreen';

interface SuperAdminPortalProps {
  onNavigateToShopAdmin?: (shopId: string) => void;
  onNavigateToStorefront?: (slug?: string) => void;
}

export const SuperAdminPortal: React.FC<SuperAdminPortalProps> = ({
  onNavigateToShopAdmin,
  onNavigateToStorefront
}) => {
  const { isSuperAdmin, role, profile, switchDemoRole } = useAuth();
  const { 
    shops, 
    subscriptionRequests, 
    approvePlanRequest, 
    rejectPlanRequest, 
    toggleShopStatus, 
    superAdminSetTier,
    setActiveShopId
  } = useShop();

  const [activeTab, setActiveTab] = useState<'pending' | 'all_requests' | 'shops' | 'settings'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Payment reference / UTR not found in bank statement.');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [selectedReceiptImage, setSelectedReceiptImage] = useState<string | null>(null);

  // Super Admin PIN / Password Security Unlock State
  const [isSuperAdminUnlocked, setIsSuperAdminUnlocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return sessionStorage.getItem('kgn_superadmin_unlocked') === 'true';
    }
    return false;
  });

  // Master PIN customization state
  const [superAdminPinInput, setSuperAdminPinInput] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kgn_super_admin_custom_pin') || '9999';
    }
    return '9999';
  });
  const [customUpiInput, setCustomUpiInput] = useState<string>('seikhsarif16@oksbi');

  const handleUnlock = () => {
    setIsSuperAdminUnlocked(true);
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem('kgn_superadmin_unlocked', 'true');
    }
    if (role !== 'super_admin') {
      switchDemoRole('super_admin');
    }
  };

  const handleLockConsole = () => {
    setIsSuperAdminUnlocked(false);
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem('kgn_superadmin_unlocked');
    }
  };

  const handleSaveSecuritySettings = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = superAdminPinInput.trim() || '9999';
    localStorage.setItem('kgn_super_admin_custom_pin', cleanPin);
    setActionSuccessMsg(`🔒 Super Admin Master PIN updated to "${cleanPin}".`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // 2. Computed Super Admin Stats (Must be declared before any early return to satisfy Rules of Hooks)
  const pendingRequests = subscriptionRequests.filter(r => r.status === 'pending');
  const approvedRequests = subscriptionRequests.filter(r => r.status === 'approved');
  const rejectedRequests = subscriptionRequests.filter(r => r.status === 'rejected');

  const totalPlatformRevenue = approvedRequests.reduce((sum, req) => sum + req.amount, 0);

  const tierCounts = useMemo(() => {
    return {
      free: shops.filter(s => s.tier === 'free').length,
      starter: shops.filter(s => s.tier === 'starter').length,
      pro: shops.filter(s => s.tier === 'pro').length,
      enterprise: shops.filter(s => s.tier === 'enterprise').length,
    };
  }, [shops]);

  const handleCopyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(utr);
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  const handleApprove = async (requestId: string) => {
    try {
      await approvePlanRequest(requestId);
      const req = subscriptionRequests.find(r => r.id === requestId);
      setActionSuccessMsg(`✅ Plan upgrade approved for ${req?.shopName || 'Shop'}. Higher-tier product limit and features unlocked!`);
      setTimeout(() => setActionSuccessMsg(null), 4500);
    } catch (err) {
      console.error('Approve failed', err);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingRequestId) return;
    try {
      await rejectPlanRequest(rejectingRequestId, rejectionReason);
      const req = subscriptionRequests.find(r => r.id === rejectingRequestId);
      setActionSuccessMsg(`❌ Payment rejected for ${req?.shopName || 'Shop'}. Reason logged.`);
      setRejectingRequestId(null);
      setTimeout(() => setActionSuccessMsg(null), 4500);
    } catch (err) {
      console.error('Reject failed', err);
    }
  };

  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.phone.includes(searchQuery);
    const matchesTier = filterTier === 'all' || shop.tier === filterTier;
    return matchesSearch && matchesTier;
  });

  // 3. SECURITY PIN / PASSWORD GATE:
  // Must unlock with dedicated Super Admin PIN/Password before viewing platform controls or merchant payments
  if (!isSuperAdminUnlocked) {
    return (
      <SuperAdminLoginScreen
        onUnlock={handleUnlock}
        onReturnToStorefront={onNavigateToStorefront}
      />
    );
  }

  return (
    <div id="super-admin-portal-view" className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-in fade-in">
      
      {/* Top Security & Admin Terminal Bar */}
      <div className="bg-white rounded-2xl border border-purple-200 shadow-2xs p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-950 text-purple-300 flex items-center justify-center font-bold text-sm shadow-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">Network Master Super Admin</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>Console Authenticated</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Root PIN: <strong className="text-purple-900 font-bold">{superAdminPinInput}</strong> • Operator: seikhsarif16@gmail.com
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="super-admin-lock-terminal-btn"
            onClick={handleLockConsole}
            className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-2xs"
            title="Lock the Super Admin console immediately"
          >
            <Lock className="w-3.5 h-3.5 text-rose-600" />
            <span>Lock Super Admin</span>
          </button>
        </div>
      </div>

      {/* Top Banner & Super Admin Identity */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Super Administrator Portal</span>
              </span>
              <span className="text-slate-400 text-xs font-medium">seikhsarif16@gmail.com</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Platform Master Control & Payment Verification
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Review shopkeeper UPI subscription receipts, verify ₹199 Starter & ₹499 Pro Business upgrades, and control tenant activations across the platform.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3.5 bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700 text-center min-w-[120px]">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</div>
              <div className="text-xl font-extrabold text-emerald-400 flex items-center justify-center">
                <span>₹{totalPlatformRevenue.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="p-3.5 bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700 text-center min-w-[120px]">
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Pending Approvals</div>
              <div className="text-xl font-extrabold text-white flex items-center justify-center gap-1">
                <span>{pendingRequests.length}</span>
                {pendingRequests.length > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Notification Message */}
      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center justify-between shadow-2xs animate-in fade-in">
          <span>{actionSuccessMsg}</span>
          <button onClick={() => setActionSuccessMsg(null)} className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Shops</span>
            <Store className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{shops.length}</div>
          <div className="text-[11px] text-slate-500 font-medium">
            {shops.filter(s => s.isActive).length} active, {shops.filter(s => !s.isActive).length} suspended
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Starter (₹199)</span>
            <span className="w-2 h-2 rounded-full bg-slate-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{tierCounts.starter}</div>
          <div className="text-[11px] text-slate-500 font-medium">100 Products, POS Terminal</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-semibold">Pro Business (₹499)</span>
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{tierCounts.pro}</div>
          <div className="text-[11px] text-blue-600/80 font-medium">Unlimited Products, Digital Khata</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-semibold">Free Tier Shops</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{tierCounts.free}</div>
          <div className="text-[11px] text-slate-500 font-medium">Limited to 20 Products</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            id="tab-pending-requests-btn"
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'pending'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Approvals</span>
            {pendingRequests.length > 0 && (
              <span className="bg-amber-400 text-slate-900 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            id="tab-all-requests-btn"
            onClick={() => setActiveTab('all_requests')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'all_requests'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>All Payment Logs ({subscriptionRequests.length})</span>
          </button>

          <button
            id="tab-manage-shops-btn"
            onClick={() => setActiveTab('shops')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'shops'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Manage All Shops ({shops.length})</span>
          </button>

          <button
            id="tab-super-admin-settings-btn"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'settings'
                ? 'bg-purple-950 text-white shadow-2xs'
                : 'bg-white text-purple-800 hover:bg-purple-50 border border-purple-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-purple-400" />
            <span>Master PIN & Platform Security</span>
          </button>
        </div>

        {/* UPI Platform Info Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-xl text-[11px] text-slate-700 font-medium">
          <span>Platform Receiving UPI:</span>
          <strong className="text-slate-900 font-bold font-mono">seikhsarif16@oksbi</strong>
        </div>
      </div>

      {/* TAB 1: PENDING PLAN APPROVALS */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">All Plan Upgrades Cleared</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                There are no pending ₹199 or ₹499 payment approvals at this moment. New requests submitted with UTR reference will appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((req) => {
                const requestedPlan = getTierPlan(req.requestedTier);
                return (
                  <div 
                    key={req.id}
                    className="p-6 bg-white rounded-3xl border-2 border-amber-200 shadow-sm space-y-4 relative flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      
                      {/* Top Header: Shop & Target Plan */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                              Pending Verification
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(req.submittedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-slate-900 mt-1">{req.shopName}</h3>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                            {req.ownerPhone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {req.ownerPhone}
                              </span>
                            )}
                            {req.ownerEmail && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" />
                                {req.ownerEmail}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Amount Due</div>
                          <div className="text-xl font-black text-emerald-600">₹{req.amount}</div>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                            req.requestedTier === 'pro'
                              ? 'bg-blue-100 text-blue-800'
                              : req.requestedTier === 'starter'
                              ? 'bg-slate-800 text-white'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            Upgrade: {requestedPlan.name}
                          </span>
                        </div>
                      </div>

                      {/* Payment Verification Box */}
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                        <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                          <span>UPI Transaction / UTR Number:</span>
                          <span className="text-slate-500 font-normal">Receiver: {req.upiId}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
                          <span className="font-mono text-xs font-bold text-slate-900 tracking-wider">
                            {req.utrNumber || 'No UTR provided'}
                          </span>
                          {req.utrNumber && (
                            <button
                              onClick={() => handleCopyUtr(req.utrNumber!)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{copiedUtr === req.utrNumber ? 'Copied' : 'Copy'}</span>
                            </button>
                          )}
                        </div>

                        {/* Payment Screenshot Thumbnail if attached */}
                        {req.receiptImageUrl && (
                          <div className="pt-1 flex items-center justify-between bg-emerald-50/70 border border-emerald-200 p-2 rounded-xl">
                            <div className="flex items-center gap-2">
                              <img
                                src={req.receiptImageUrl}
                                alt="Receipt screenshot"
                                className="w-8 h-8 rounded-lg object-cover border border-slate-200 bg-white"
                              />
                              <span className="text-[11px] font-bold text-emerald-900">Payment Screenshot Attached</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedReceiptImage(req.receiptImageUrl!)}
                              className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View Receipt</span>
                            </button>
                          </div>
                        )}

                        <p className="text-[10px] text-slate-500">
                          Verify that ₹{req.amount} with UTR <strong className="font-mono">{req.utrNumber}</strong> has settled in your SBI Account (seikhsarif16@oksbi).
                        </p>
                      </div>

                    </div>

                    {/* Action Buttons: Approve / Reject */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <button
                        id={`reject-plan-btn-${req.id}`}
                        onClick={() => {
                          setRejectingRequestId(req.id);
                          setRejectionReason('Payment reference / UTR not found in bank statement.');
                        }}
                        className="flex-1 py-2.5 px-3 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs transition flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject Payment</span>
                      </button>

                      <button
                        id={`approve-plan-btn-${req.id}`}
                        onClick={() => handleApprove(req.id)}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve & Unlock Tier</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALL PAYMENT LOGS */}
      {activeTab === 'all_requests' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Subscription Approval History & Audits
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Total {subscriptionRequests.length} transactions recorded
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5 pl-5">Shop Name</th>
                  <th className="p-3.5">Plan</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">UTR / Reference</th>
                  <th className="p-3.5">Submitted</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-5">Review Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscriptionRequests.map((req) => {
                  const plan = getTierPlan(req.requestedTier);
                  return (
                    <tr key={req.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-3.5 pl-5 font-bold text-slate-900">
                        {req.shopName}
                        <div className="text-[10px] text-slate-400 font-normal">{req.ownerPhone}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                          {plan.name}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">₹{req.amount}</td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <span>{req.utrNumber || '—'}</span>
                          {req.receiptImageUrl && (
                            <button
                              type="button"
                              onClick={() => setSelectedReceiptImage(req.receiptImageUrl!)}
                              className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                              title="View Payment Receipt"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {new Date(req.submittedAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          req.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status === 'approved' && <Check className="w-3 h-3" />}
                          {req.status === 'rejected' && <X className="w-3 h-3" />}
                          {req.status === 'pending' && <Clock className="w-3 h-3" />}
                          <span>{req.status}</span>
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 text-slate-500 text-[11px]">
                        {req.reviewedBy ? (
                          <div>
                            <div className="text-slate-800 font-medium">By: {req.reviewedBy}</div>
                            {req.rejectionReason && (
                              <div className="text-rose-600 text-[10px]">{req.rejectionReason}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-amber-600 font-medium">Awaiting Review</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MANAGE ALL SHOPS */}
      {activeTab === 'shops' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search shops by name, phone, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-medium">Filter Tier:</span>
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-semibold text-slate-800"
              >
                <option value="all">All Plans ({shops.length})</option>
                <option value="free">Free ({tierCounts.free})</option>
                <option value="starter">Starter ({tierCounts.starter})</option>
                <option value="pro">Pro Business ({tierCounts.pro})</option>
                <option value="enterprise">Enterprise ({tierCounts.enterprise})</option>
              </select>
            </div>
          </div>

          {/* Shops Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 pl-5">Shop Details</th>
                    <th className="p-3.5">Category & Location</th>
                    <th className="p-3.5">Current Tier</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right pr-5">Super Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredShops.map((shop) => (
                    <tr key={shop.id} className="hover:bg-slate-50/60 transition">
                      
                      <td className="p-3.5 pl-5">
                        <div className="font-bold text-slate-900">{shop.shopName}</div>
                        <div className="text-[11px] text-slate-500">{shop.phone} • UPI: {shop.upiId || '—'}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-medium text-slate-800">{shop.category}</div>
                        <div className="text-[11px] text-slate-500">{shop.city || 'India'} (Pin: {shop.pincode || '—'})</div>
                      </td>

                      <td className="p-3.5">
                        <select
                          value={shop.tier}
                          onChange={(e) => superAdminSetTier(shop.id, e.target.value as SubscriptionTier)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold capitalize bg-white hover:border-slate-400 focus:outline-none"
                        >
                          <option value="free">Free (20 Products)</option>
                          <option value="starter">Starter ₹199 (100 Products)</option>
                          <option value="pro">Pro Business ₹499 (Unlimited)</option>
                          <option value="enterprise">Enterprise ₹999</option>
                        </select>
                      </td>

                      <td className="p-3.5">
                        <button
                          onClick={() => toggleShopStatus(shop.id, !shop.isActive)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition ${
                            shop.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {shop.isActive ? 'Active' : 'Suspended'}
                        </button>
                      </td>

                      <td className="p-3.5 pr-5 text-right space-x-2">
                        {onNavigateToStorefront && (
                          <button
                            onClick={() => {
                              setActiveShopId(shop.id);
                              onNavigateToStorefront(shop.slug);
                            }}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-semibold transition inline-flex items-center gap-1"
                            title="View Public Storefront"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Storefront</span>
                          </button>
                        )}
                        {onNavigateToShopAdmin && (
                          <button
                            onClick={() => {
                              setActiveShopId(shop.id);
                              onNavigateToShopAdmin(shop.id);
                            }}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-semibold transition inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Open Admin</span>
                          </button>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: MASTER SECURITY & PIN SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-4xl">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-purple-600" />
                  <span>Super Admin Master Access PIN & Password</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Protect network-level operations, shopkeeper plan approvals, and global tenant suspensions from store owners and public visitors.
                </p>
              </div>

              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                Root Security Gate
              </span>
            </div>

            <form onSubmit={handleSaveSecuritySettings} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Master Super Admin PIN
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      maxLength={12}
                      value={superAdminPinInput}
                      onChange={(e) => setSuperAdminPinInput(e.target.value)}
                      placeholder="9999"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-900 font-mono font-bold text-slate-900 text-sm tracking-wider"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Default master PIN is <strong className="text-slate-700">9999</strong>. You can change it to any custom numeric PIN or security phrase.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Platform Master UPI Receiving ID
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={customUpiInput}
                      onChange={(e) => setCustomUpiInput(e.target.value)}
                      placeholder="seikhsarif16@oksbi"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-slate-900 font-mono font-bold text-slate-900 text-sm"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Receives ₹199 Starter & ₹499 Pro merchant subscription payments.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl flex items-start gap-3.5">
                <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
                <div className="text-xs text-purple-950 leading-relaxed">
                  <p className="font-bold">Role-Based Access Control (RBAC):</p>
                  <p className="text-purple-800 text-[11px] mt-0.5">
                    Regular shop owners and storefront customers are locked out of the <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-purple-200">/super-admin</code> route unless they enter this Super Admin PIN or Master Password.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleLockConsole}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Lock Super Admin Console Now</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-950 hover:bg-purple-900 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4 text-purple-300" />
                  <span>Save Security Settings</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectingRequestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xl w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Reject Subscription Payment</span>
              </h3>
              <button onClick={() => setRejectingRequestId(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Please specify the reason for rejecting this payment reference. The merchant will be alerted to re-submit or contact support.
            </p>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">Rejection Reason</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectingRequestId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Receipt Lightbox Modal */}
      {selectedReceiptImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-4 p-5">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm">UPI Payment Proof Verification</span>
              </div>
              <button
                onClick={() => setSelectedReceiptImage(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 rounded-2xl p-2 max-h-[70vh] flex items-center justify-center overflow-hidden border border-slate-800">
              <img
                src={selectedReceiptImage}
                alt="Receipt screenshot full"
                className="max-h-[65vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <a
                href={selectedReceiptImage}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Original Image</span>
              </a>
              <button
                onClick={() => setSelectedReceiptImage(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
