import { SubscriptionTier, TierPlanInfo } from '../types';

export interface PlanConfig {
  tier: SubscriptionTier;
  name: string;
  badge?: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  productLimit: number;
  hasPos: boolean;
  hasKhata: boolean;
  hasAnalytics: boolean;
  hasWhatsAppSync: boolean;
  hasCustomBranding: boolean;
  hasPdfInvoice: boolean;
  features: string[];
  popular?: boolean;
}

export const TIER_PLANS: Record<SubscriptionTier, PlanConfig> = {
  free: {
    tier: 'free',
    name: 'Free Forever',
    tagline: 'Basic digital catalog for small solo shops',
    monthlyPrice: 0,
    yearlyPrice: 0,
    productLimit: 15,
    hasPos: false,
    hasKhata: false,
    hasAnalytics: false,
    hasWhatsAppSync: false,
    hasCustomBranding: false,
    hasPdfInvoice: false,
    features: [
      'Up to 15 Products Catalog',
      'Standard Online Storefront',
      'Basic Order Tracking',
      'Customer Cart & Checkout',
      'Standard Web Support'
    ]
  },
  starter: {
    tier: 'starter',
    name: 'Starter Merchant',
    badge: 'Best for Kiranas',
    tagline: 'High-speed POS counter billing & instant UPI',
    monthlyPrice: 199,
    yearlyPrice: 159,
    productLimit: 100,
    hasPos: true,
    hasKhata: false,
    hasAnalytics: false,
    hasWhatsAppSync: true,
    hasCustomBranding: false,
    hasPdfInvoice: true,
    features: [
      'Up to 100 Products Catalog',
      'High-Speed POS Counter Terminal',
      'Thermal & PDF Bill Generator',
      'Direct WhatsApp Order Sync',
      'Dynamic UPI / QR Payment Integration',
      'Barcode Scanner & Fast Search'
    ]
  },
  growth: {
    tier: 'growth',
    name: 'Growth Merchant',
    tagline: 'Advanced catalog & automated workflows',
    monthlyPrice: 349,
    yearlyPrice: 279,
    productLimit: 500,
    hasPos: true,
    hasKhata: true,
    hasAnalytics: true,
    hasWhatsAppSync: true,
    hasCustomBranding: false,
    hasPdfInvoice: true,
    features: [
      'Up to 500 Products Catalog',
      'Everything in Starter Plan',
      'Digital Khata Credit Ledger',
      'Sales Reports & Analytics',
      'Automated WhatsApp Reminders'
    ]
  },
  pro: {
    tier: 'pro',
    name: 'Pro Business',
    popular: true,
    badge: 'Most Popular',
    tagline: 'Unlimited products, full Khata ledger & reports',
    monthlyPrice: 499,
    yearlyPrice: 399,
    productLimit: 99999,
    hasPos: true,
    hasKhata: true,
    hasAnalytics: true,
    hasWhatsAppSync: true,
    hasCustomBranding: true,
    hasPdfInvoice: true,
    features: [
      'Unlimited Products & Categories',
      'High-Speed POS & Thermal Invoices',
      'Full Digital Khata (Credit Ledger)',
      'Automated WhatsApp Payment Reminders',
      'Advanced Sales Analytics & Revenue Reports',
      'Custom Brand Banners & Logo Upload',
      'Priority 24/7 Phone & WhatsApp Support'
    ]
  },
  enterprise: {
    tier: 'enterprise',
    name: 'Retail Enterprise',
    tagline: 'Multi-branch franchises & custom integrations',
    monthlyPrice: 999,
    yearlyPrice: 799,
    productLimit: 999999,
    hasPos: true,
    hasKhata: true,
    hasAnalytics: true,
    hasWhatsAppSync: true,
    hasCustomBranding: true,
    hasPdfInvoice: true,
    features: [
      'Everything in Pro Business',
      'Multi-Branch Account Management',
      'Staff Role-Based Access Control (RBAC)',
      'Custom ERP & Tally Ledger Export',
      'Dedicated SaaS Account Manager'
    ]
  }
};

export function getTierPlan(tier?: SubscriptionTier): PlanConfig {
  if (!tier || !TIER_PLANS[tier]) {
    return TIER_PLANS.free;
  }
  return TIER_PLANS[tier];
}

export function getTierProductLimit(tier?: SubscriptionTier): number {
  return getTierPlan(tier).productLimit;
}

export function canAccessFeature(
  tier: SubscriptionTier | undefined, 
  feature: 'pos' | 'khata' | 'analytics' | 'whatsapp_sync' | 'custom_branding'
): boolean {
  const plan = getTierPlan(tier);
  switch (feature) {
    case 'pos':
      return plan.hasPos;
    case 'khata':
      return plan.hasKhata;
    case 'analytics':
      return plan.hasAnalytics;
    case 'whatsapp_sync':
      return plan.hasWhatsAppSync;
    case 'custom_branding':
      return plan.hasCustomBranding;
    default:
      return true;
  }
}
