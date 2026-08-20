export type UserRole = 'customer' | 'shop_admin' | 'shop_owner' | 'super_admin' | 'admin';

export type SubscriptionTier = 'free' | 'starter' | 'growth' | 'pro' | 'enterprise';

export interface SubscriptionRequest {
  id: string;
  shopId: string;
  shopOwnerId: string;
  shopName: string;
  ownerEmail?: string;
  ownerPhone?: string;
  requestedTier: SubscriptionTier;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  paymentMethod: 'upi';
  upiId: string;
  utrNumber?: string;
  receiptImageUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  role: UserRole;
  activeShopId?: string;
  createdAt: string;
}

export interface Shop {
  id: string;
  shopOwnerId: string;
  shopName: string;
  slug: string;
  tagline?: string;
  category: string;
  phone: string;
  whatsappNumber?: string;
  upiId?: string;
  paymentQrUrl?: string;
  address?: string;
  city?: string;
  pincode?: string;
  logoUrl?: string;
  bannerUrl?: string;
  tier: SubscriptionTier;
  adminPin?: string;
  pendingUpgradeTier?: SubscriptionTier | null;
  pendingUtrNumber?: string | null;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  shopOwnerId: string;
  shopId: string;
  name: string;
  description?: string;
  category: string;
  mrp?: number;
  sellingPrice: number;
  stockQuantity: number;
  unit: string;
  imageUrl?: string;
  barcode?: string;
  isFeatured?: boolean;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  createdAt: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl?: string;
  total: number;
}

export interface Order {
  id: string;
  shopOwnerId: string;
  shopId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  deliveryType: 'delivery' | 'pickup' | 'pos';
  deliveryFee?: number;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  paymentMethod: 'cod' | 'upi' | 'cash' | 'khata_credit' | 'card';
  paymentStatus: 'pending' | 'paid' | 'credit' | 'failed';
  orderStatus: 'new' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  notes?: string;
  customerId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface KhataCustomer {
  id: string;
  shopOwnerId: string;
  shopId: string;
  name: string;
  phone: string;
  address?: string;
  currentBalance: number; // >0 means customer owes money to shop (Udhaar/Debit), <0 means advance
  creditLimit?: number;
  lastTransactionDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface KhataTransaction {
  id: string;
  shopOwnerId: string;
  shopId: string;
  customerId: string;
  type: 'credit_given' | 'payment_received';
  amount: number;
  balanceAfter: number;
  billNumber?: string;
  notes?: string;
  date: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface TierPlanInfo {
  tier: SubscriptionTier;
  name: string;
  priceMonthly: number;
  productLimit: number;
  features: string[];
  hasPos: boolean;
  hasKhata: boolean;
  hasPdfInvoice: boolean;
  hasCustomBranding: boolean;
}
