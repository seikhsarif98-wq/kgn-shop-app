import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Shop, 
  Product, 
  Order, 
  KhataCustomer, 
  KhataTransaction, 
  CartItem, 
  SubscriptionTier,
  SubscriptionRequest
} from '../types';
import { 
  INITIAL_SHOPS, 
  INITIAL_PRODUCTS, 
  INITIAL_KHATA_CUSTOMERS, 
  INITIAL_ORDERS,
  INITIAL_SUBSCRIPTION_REQUESTS,
  DEMO_SHOP_OWNER_1,
  DEMO_SHOP_OWNER_2
} from '../lib/demoData';
import { 
  db, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  setDoc, 
  doc, 
  deleteDoc, 
  updateDoc 
} from '../lib/firebase';
import { useAuth } from './AuthContext';
import { 
  TIER_PLANS, 
  PlanConfig, 
  getTierPlan, 
  getTierProductLimit, 
  canAccessFeature 
} from '../lib/plans';
import { generateUniqueShopSlug } from '../lib/slugs';

interface ShopContextType {
  shops: Shop[];
  activeShop: Shop;
  setActiveShopId: (shopId: string) => void;
  products: Product[];
  orders: Order[];
  khataCustomers: KhataCustomer[];
  khataTransactions: KhataTransaction[];
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;
  
  // Phase 4 & 5: Tier Limits, Monetization & Plan Approval Engine
  tierPlan: PlanConfig;
  productLimit: number;
  isProductLimitReached: boolean;
  canAccess: (feature: 'pos' | 'khata' | 'analytics' | 'whatsapp_sync' | 'custom_branding') => boolean;
  upgradePlan: (newTier: SubscriptionTier) => Promise<void>;
  
  // Multi-Shop and Dynamic Slug Resolution
  isShopsLoaded: boolean;
  getShopBySlug: (slug: string) => Shop | undefined;
  getProductsForShop: (shopId: string, shopOwnerId?: string) => Product[];
  
  // Subscription Plan Upgrade Requests (Super Admin & Merchant)
  subscriptionRequests: SubscriptionRequest[];
  submitPlanUpgradeRequest: (requestedTier: SubscriptionTier, utrNumber: string, amount: number, receiptImageUrl?: string) => Promise<SubscriptionRequest>;
  approvePlanRequest: (requestId: string, adminRemarks?: string) => Promise<void>;
  rejectPlanRequest: (requestId: string, rejectionReason: string) => Promise<void>;
  toggleShopStatus: (shopId: string, isActive: boolean) => Promise<void>;
  superAdminSetTier: (shopId: string, newTier: SubscriptionTier) => Promise<void>;

  // Business operations with strict shopOwnerId isolation and programmatic limit enforcement
  createProduct: (product: Omit<Product, 'id' | 'shopOwnerId' | 'shopId' | 'createdAt'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  createOrder: (orderData: Omit<Order, 'id' | 'shopOwnerId' | 'shopId' | 'orderNumber' | 'createdAt'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, orderStatus: Order['orderStatus'], paymentStatus?: Order['paymentStatus']) => Promise<void>;
  
  addKhataCustomer: (custData: Omit<KhataCustomer, 'id' | 'shopOwnerId' | 'shopId' | 'currentBalance' | 'createdAt'>) => Promise<void>;
  addKhataTransaction: (customerId: string, type: 'credit_given' | 'payment_received', amount: number, notes?: string, billNumber?: string) => Promise<void>;
  
  updateShopProfile: (updates: Partial<Shop>) => Promise<void>;
  updateShopSettings: (updates: Partial<Shop>) => Promise<void>;
  addCustomCategory: (categoryName: string) => Promise<void>;
  removeCustomCategory: (categoryName: string) => Promise<void>;
  createNewShop: (shopData: Omit<Shop, 'id' | 'shopOwnerId' | 'createdAt'>) => Promise<Shop>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const LOCAL_SHOPS_KEY = 'kgn_custom_shops';
const LOCAL_PRODUCTS_KEY = 'kgn_custom_products';

const getInitialShops = (): Shop[] => {
  try {
    const raw = localStorage.getItem(LOCAL_SHOPS_KEY);
    if (raw) {
      const customShops: Shop[] = JSON.parse(raw);
      const merged = [...customShops];
      INITIAL_SHOPS.forEach(initShop => {
        if (!merged.some(s => s.id === initShop.id)) {
          merged.push(initShop);
        }
      });
      return merged;
    }
  } catch (e) {
    console.warn('Could not parse local shops', e);
  }
  return INITIAL_SHOPS;
};

const getInitialProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (raw) {
      const customProds: Product[] = JSON.parse(raw);
      const merged = [...customProds];
      INITIAL_PRODUCTS.forEach(initP => {
        if (!merged.some(p => p.id === initP.id)) {
          merged.push(initP);
        }
      });
      return merged;
    }
  } catch (e) {
    console.warn('Could not parse local products', e);
  }
  return INITIAL_PRODUCTS;
};

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeShopOwnerId, user, isDemoMode } = useAuth();
  
  const [shops, setShops] = useState<Shop[]>(getInitialShops);
  const [isShopsLoaded, setIsShopsLoaded] = useState(false);
  const [activeShopId, setActiveShopIdState] = useState<string>(() => {
    const init = getInitialShops();
    return init[0]?.id || INITIAL_SHOPS[0].id;
  });
  
  // In-memory tenant data store
  const [allProducts, setAllProducts] = useState<Product[]>(getInitialProducts);
  const [allOrders, setAllOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [allKhataCustomers, setAllKhataCustomers] = useState<KhataCustomer[]>(INITIAL_KHATA_CUSTOMERS);
  const [allKhataTransactions, setAllKhataTransactions] = useState<KhataTransaction[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [subscriptionRequests, setSubscriptionRequests] = useState<SubscriptionRequest[]>(INITIAL_SUBSCRIPTION_REQUESTS);

  // Find active shop
  const activeShop = shops.find(s => s.id === activeShopId) || shops[0] || INITIAL_SHOPS[0];
  const currentTenantOwnerId = isDemoMode ? activeShop.shopOwnerId : (user?.uid || activeShop.shopOwnerId);

  // Helper: Retrieve shop by URL slug (case-insensitive)
  const getShopBySlug = (slug: string): Shop | undefined => {
    if (!slug) return undefined;
    const cleanSlug = slug.trim().toLowerCase();
    return shops.find(s => s.slug && s.slug.trim().toLowerCase() === cleanSlug);
  };

  // Helper: Retrieve isolated products for a specific shop
  const getProductsForShop = (shopId: string, shopOwnerId?: string): Product[] => {
    return allProducts.filter(p => p.shopId === shopId || (shopOwnerId && p.shopOwnerId === shopOwnerId));
  };

  // Sync / Listen to Firestore for Shops
  useEffect(() => {
    try {
      const shopsCol = collection(db, 'shops');
      const unsubShops = onSnapshot(shopsCol, (snapshot) => {
        if (!snapshot.empty) {
          const loadedShops: Shop[] = [];
          snapshot.forEach((docSnap) => {
            loadedShops.push({ id: docSnap.id, ...(docSnap.data() as Omit<Shop, 'id'>) });
          });
          // Merge initial shops with loaded
          setShops(prev => {
            const merged = [...loadedShops];
            INITIAL_SHOPS.forEach(initShop => {
              if (!merged.some(s => s.id === initShop.id)) {
                merged.push(initShop);
              }
            });
            return merged;
          });
        }
        setIsShopsLoaded(true);
      }, (err) => {
        console.warn('Firestore shops listener note:', err);
        setIsShopsLoaded(true);
      });

      // Listen to all public products across shops
      const allProdCol = collection(db, 'products');
      const unsubAllProds = onSnapshot(allProdCol, (snapshot) => {
        if (!snapshot.empty) {
          const dbProducts: Product[] = [];
          snapshot.forEach((d) => dbProducts.push({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }));
          setAllProducts(prev => {
            const merged = [...dbProducts];
            INITIAL_PRODUCTS.forEach(initP => {
              if (!merged.some(p => p.id === initP.id)) {
                merged.push(initP);
              }
            });
            return merged;
          });
        }
      }, (err) => console.warn('Public products listener note:', err));

      // Listen to subscription requests
      const subReqCol = collection(db, 'subscription_requests');
      const unsubSubReq = onSnapshot(subReqCol, (snapshot) => {
        if (!snapshot.empty) {
          const loadedReqs: SubscriptionRequest[] = [];
          snapshot.forEach((docSnap) => {
            loadedReqs.push({ id: docSnap.id, ...(docSnap.data() as Omit<SubscriptionRequest, 'id'>) });
          });
          setSubscriptionRequests(prev => {
            const merged = [...loadedReqs];
            INITIAL_SUBSCRIPTION_REQUESTS.forEach(initReq => {
              if (!merged.some(r => r.id === initReq.id)) {
                merged.push(initReq);
              }
            });
            return merged;
          });
        }
      }, (err) => console.warn('Subscription requests listener note:', err));

      return () => {
        unsubShops();
        unsubAllProds();
        unsubSubReq();
      };
    } catch (e) {
      console.warn('Firestore init note:', e);
      setIsShopsLoaded(true);
    }
  }, []);

  // Sync Firestore listeners for current tenant
  useEffect(() => {
    try {
      // 1. Products Listener for current owner
      const prodQuery = query(collection(db, 'products'), where('shopOwnerId', '==', currentTenantOwnerId));
      const unsubProd = onSnapshot(prodQuery, (snapshot) => {
        if (!snapshot.empty) {
          const dbProducts: Product[] = [];
          snapshot.forEach((d) => dbProducts.push({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }));
          setAllProducts(prev => {
            const others = prev.filter(p => p.shopOwnerId !== currentTenantOwnerId);
            return [...dbProducts, ...others];
          });
        }
      }, (err) => console.warn('Products sync note:', err));

      // 2. Orders Listener for current owner
      const orderQuery = query(collection(db, 'orders'), where('shopOwnerId', '==', currentTenantOwnerId));
      const unsubOrder = onSnapshot(orderQuery, (snapshot) => {
        if (!snapshot.empty) {
          const dbOrders: Order[] = [];
          snapshot.forEach((d) => dbOrders.push({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }));
          setAllOrders(prev => {
            const others = prev.filter(o => o.shopOwnerId !== currentTenantOwnerId);
            return [...dbOrders, ...others];
          });
        }
      }, (err) => console.warn('Orders sync note:', err));

      // 3. Khata Customers Listener for current owner
      const khataQuery = query(collection(db, 'khata_customers'), where('shopOwnerId', '==', currentTenantOwnerId));
      const unsubKhata = onSnapshot(khataQuery, (snapshot) => {
        if (!snapshot.empty) {
          const dbKhata: KhataCustomer[] = [];
          snapshot.forEach((d) => dbKhata.push({ id: d.id, ...(d.data() as Omit<KhataCustomer, 'id'>) }));
          setAllKhataCustomers(prev => {
            const others = prev.filter(k => k.shopOwnerId !== currentTenantOwnerId);
            return [...dbKhata, ...others];
          });
        }
      }, (err) => console.warn('Khata sync note:', err));

      // 4. Khata Transactions Listener for current owner
      const txQuery = query(collection(db, 'khata_transactions'), where('shopOwnerId', '==', currentTenantOwnerId));
      const unsubTx = onSnapshot(txQuery, (snapshot) => {
        if (!snapshot.empty) {
          const dbTx: KhataTransaction[] = [];
          snapshot.forEach((d) => dbTx.push({ id: d.id, ...(d.data() as Omit<KhataTransaction, 'id'>) }));
          setAllKhataTransactions(prev => {
            const others = prev.filter(t => t.shopOwnerId !== currentTenantOwnerId);
            return [...dbTx, ...others];
          });
        }
      }, (err) => console.warn('Transactions sync note:', err));

      return () => {
        unsubProd();
        unsubOrder();
        unsubKhata();
        unsubTx();
      };
    } catch (e) {
      console.warn('Realtime sync setup note:', e);
    }
  }, [currentTenantOwnerId]);

  // STRICT ZERO-LEAKAGE FILTERED TENANT VIEWS
  const products = allProducts.filter(p => p.shopOwnerId === currentTenantOwnerId);
  const orders = allOrders.filter(o => o.shopOwnerId === currentTenantOwnerId);
  const khataCustomers = allKhataCustomers.filter(k => k.shopOwnerId === currentTenantOwnerId);
  const khataTransactions = allKhataTransactions.filter(t => t.shopOwnerId === currentTenantOwnerId);

  // Tier limit calculations
  const tierPlan = getTierPlan(activeShop.tier);
  const productLimit = tierPlan.productLimit;
  const isProductLimitReached = productLimit < 9999 && products.length >= productLimit;

  const canAccess = (feature: 'pos' | 'khata' | 'analytics' | 'whatsapp_sync' | 'custom_branding') => {
    return canAccessFeature(activeShop.tier, feature);
  };

  const setActiveShopId = (id: string) => {
    setActiveShopIdState(id);
    setCart([]);
  };

  // Cart Management
  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.sellingPrice * item.quantity,
    0
  );

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Plan Upgrade Operation
  const upgradePlan = async (newTier: SubscriptionTier) => {
    const updatedShop: Shop = {
      ...activeShop,
      tier: newTier,
      updatedAt: new Date().toISOString()
    };

    setShops(prev => prev.map(s => s.id === activeShop.id ? updatedShop : s));

    try {
      await updateDoc(doc(db, 'shops', activeShop.id), {
        tier: newTier,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Firestore tier update note (persisted locally):', err);
    }
  };

  // Submit Plan Upgrade Request (Merchant with UTR)
  const submitPlanUpgradeRequest = async (requestedTier: SubscriptionTier, utrNumber: string, amount: number, receiptImageUrl?: string) => {
    const reqId = `req_${Date.now()}`;
    const newRequest: SubscriptionRequest = {
      id: reqId,
      shopId: activeShop.id,
      shopOwnerId: currentTenantOwnerId,
      shopName: activeShop.shopName,
      ownerEmail: user?.email || (currentTenantOwnerId === DEMO_SHOP_OWNER_1 ? 'kgn.store@demo.com' : 'merchant@demo.com'),
      ownerPhone: activeShop.phone || '+91 98765 43210',
      requestedTier,
      amount,
      billingCycle: 'monthly',
      paymentMethod: 'upi',
      upiId: 'seikhsarif16@oksbi',
      utrNumber,
      receiptImageUrl,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    // Update in-memory state
    setSubscriptionRequests(prev => [newRequest, ...prev]);

    // Update shop with pending flag
    const updatedShop: Shop = {
      ...activeShop,
      pendingUpgradeTier: requestedTier,
      pendingUtrNumber: utrNumber,
      updatedAt: new Date().toISOString()
    };
    setShops(prev => prev.map(s => s.id === activeShop.id ? updatedShop : s));

    try {
      await setDoc(doc(db, 'subscription_requests', reqId), newRequest);
      await updateDoc(doc(db, 'shops', activeShop.id), {
        pendingUpgradeTier: requestedTier,
        pendingUtrNumber: utrNumber,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Firestore subscription request note:', err);
    }

    return newRequest;
  };

  // Super Admin: Approve Plan Request
  const approvePlanRequest = async (requestId: string, adminRemarks?: string) => {
    const req = subscriptionRequests.find(r => r.id === requestId);
    if (!req) return;

    const now = new Date().toISOString();
    const updatedRequest: SubscriptionRequest = {
      ...req,
      status: 'approved',
      reviewedAt: now,
      reviewedBy: user?.email || 'seikhsarif16@gmail.com (Super Admin)'
    };

    setSubscriptionRequests(prev => prev.map(r => r.id === requestId ? updatedRequest : r));

    // Update target shop's tier to unlocked tier and activate
    setShops(prev => prev.map(s => {
      if (s.id === req.shopId) {
        return {
          ...s,
          tier: req.requestedTier,
          isActive: true,
          pendingUpgradeTier: null,
          pendingUtrNumber: null,
          updatedAt: now
        };
      }
      return s;
    }));

    try {
      await updateDoc(doc(db, 'subscription_requests', requestId), {
        status: 'approved',
        reviewedAt: now,
        reviewedBy: user?.email || 'seikhsarif16@gmail.com (Super Admin)'
      });
      await updateDoc(doc(db, 'shops', req.shopId), {
        tier: req.requestedTier,
        isActive: true,
        pendingUpgradeTier: null,
        pendingUtrNumber: null,
        updatedAt: now
      });
    } catch (err) {
      console.warn('Firestore approve plan note:', err);
    }
  };

  // Super Admin: Reject Plan Request
  const rejectPlanRequest = async (requestId: string, rejectionReason: string) => {
    const req = subscriptionRequests.find(r => r.id === requestId);
    if (!req) return;

    const now = new Date().toISOString();
    const updatedRequest: SubscriptionRequest = {
      ...req,
      status: 'rejected',
      rejectionReason: rejectionReason || 'Payment verification unsuccessful or invalid UTR reference.',
      reviewedAt: now,
      reviewedBy: user?.email || 'seikhsarif16@gmail.com (Super Admin)'
    };

    setSubscriptionRequests(prev => prev.map(r => r.id === requestId ? updatedRequest : r));

    // Clear shop pending flags
    setShops(prev => prev.map(s => {
      if (s.id === req.shopId) {
        return {
          ...s,
          pendingUpgradeTier: null,
          pendingUtrNumber: null,
          updatedAt: now
        };
      }
      return s;
    }));

    try {
      await updateDoc(doc(db, 'subscription_requests', requestId), {
        status: 'rejected',
        rejectionReason: rejectionReason || 'Payment verification unsuccessful',
        reviewedAt: now,
        reviewedBy: user?.email || 'seikhsarif16@gmail.com (Super Admin)'
      });
      await updateDoc(doc(db, 'shops', req.shopId), {
        pendingUpgradeTier: null,
        pendingUtrNumber: null,
        updatedAt: now
      });
    } catch (err) {
      console.warn('Firestore reject plan note:', err);
    }
  };

  // Super Admin: Toggle Shop Active Status
  const toggleShopStatus = async (shopId: string, isActive: boolean) => {
    setShops(prev => prev.map(s => s.id === shopId ? { ...s, isActive, updatedAt: new Date().toISOString() } : s));
    try {
      await updateDoc(doc(db, 'shops', shopId), {
        isActive,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Firestore toggle shop status note:', err);
    }
  };

  // Super Admin: Override Shop Tier
  const superAdminSetTier = async (shopId: string, newTier: SubscriptionTier) => {
    setShops(prev => prev.map(s => s.id === shopId ? { ...s, tier: newTier, updatedAt: new Date().toISOString() } : s));
    try {
      await updateDoc(doc(db, 'shops', shopId), {
        tier: newTier,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Firestore override tier note:', err);
    }
  };

  // Business Operations with strict Tenant Metadata Injection and Limits Enforcement
  const createProduct = async (productData: Omit<Product, 'id' | 'shopOwnerId' | 'shopId' | 'createdAt'>) => {
    // PROGRAMMATIC TIER LIMIT CHECK
    if (isProductLimitReached) {
      throw new Error(
        `TIER_LIMIT_REACHED: Your store is on the ${tierPlan.name} plan (max ${productLimit} products). Please upgrade to Starter (₹199/mo) or Pro Business (₹499/mo) to add more products.`
      );
    }

    const ownerId = currentTenantOwnerId;
    const newId = `prod_${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id: newId,
      shopOwnerId: ownerId,
      shopId: activeShop.id,
      createdAt: new Date().toISOString(),
      status: productData.stockQuantity > 5 ? 'in_stock' : (productData.stockQuantity > 0 ? 'low_stock' : 'out_of_stock')
    };

    setAllProducts(prev => [newProduct, ...prev]);

    try {
      await setDoc(doc(db, 'products', newId), newProduct);
    } catch (err) {
      console.warn('Firestore product create note:', err);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const updatedStatus = updates.stockQuantity !== undefined
      ? (updates.stockQuantity > 5 ? 'in_stock' : (updates.stockQuantity > 0 ? 'low_stock' : 'out_of_stock'))
      : undefined;

    const finalUpdates = {
      ...updates,
      ...(updatedStatus ? { status: updatedStatus } : {}),
      updatedAt: new Date().toISOString()
    };

    setAllProducts(prev => prev.map(p => p.id === id ? { ...p, ...finalUpdates } : p));

    try {
      await updateDoc(doc(db, 'products', id), finalUpdates);
    } catch (err) {
      console.warn('Firestore product update note:', err);
    }
  };

  const deleteProduct = async (id: string) => {
    setAllProducts(prev => prev.filter(p => p.id !== id));
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      console.warn('Firestore product delete note:', err);
    }
  };

  const createOrder = async (orderData: Omit<Order, 'id' | 'shopOwnerId' | 'shopId' | 'orderNumber' | 'createdAt'>): Promise<Order> => {
    const ownerId = activeShop.shopOwnerId;
    const newId = `ord_${Date.now()}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `KGN-${randomSuffix}`;

    const newOrder: Order = {
      ...orderData,
      id: newId,
      shopOwnerId: ownerId,
      shopId: activeShop.id,
      orderNumber,
      createdAt: new Date().toISOString()
    };

    setAllOrders(prev => [newOrder, ...prev]);
    clearCart();

    // Auto deduct inventory stock
    orderData.items.forEach(item => {
      setAllProducts(prev => prev.map(p => {
        if (p.id === item.productId) {
          const newStock = Math.max(0, p.stockQuantity - item.quantity);
          return {
            ...p,
            stockQuantity: newStock,
            status: newStock > 5 ? 'in_stock' : (newStock > 0 ? 'low_stock' : 'out_of_stock')
          };
        }
        return p;
      }));
    });

    try {
      await setDoc(doc(db, 'orders', newId), newOrder);
    } catch (err) {
      console.warn('Firestore order create note:', err);
    }

    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, orderStatus: Order['orderStatus'], paymentStatus?: Order['paymentStatus']) => {
    const updates: Partial<Order> = {
      orderStatus,
      ...(paymentStatus ? { paymentStatus } : {}),
      updatedAt: new Date().toISOString()
    };

    setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));

    try {
      await updateDoc(doc(db, 'orders', orderId), updates);
    } catch (err) {
      console.warn('Firestore order status update note:', err);
    }
  };

  const addKhataCustomer = async (custData: Omit<KhataCustomer, 'id' | 'shopOwnerId' | 'shopId' | 'currentBalance' | 'createdAt'>) => {
    const ownerId = currentTenantOwnerId;
    const newId = `khata_cust_${Date.now()}`;
    const newCust: KhataCustomer = {
      ...custData,
      id: newId,
      shopOwnerId: ownerId,
      shopId: activeShop.id,
      currentBalance: 0,
      createdAt: new Date().toISOString()
    };

    setAllKhataCustomers(prev => [newCust, ...prev]);

    try {
      await setDoc(doc(db, 'khata_customers', newId), newCust);
    } catch (err) {
      console.warn('Firestore khata customer create note:', err);
    }
  };

  const addKhataTransaction = async (
    customerId: string, 
    type: 'credit_given' | 'payment_received', 
    amount: number, 
    notes?: string, 
    billNumber?: string
  ) => {
    const ownerId = currentTenantOwnerId;
    const targetCustomer = khataCustomers.find(c => c.id === customerId);
    if (!targetCustomer) return;

    const balanceDelta = type === 'credit_given' ? amount : -amount;
    const newBalance = targetCustomer.currentBalance + balanceDelta;
    const nowIso = new Date().toISOString();

    const newTx: KhataTransaction = {
      id: `tx_${Date.now()}`,
      shopOwnerId: ownerId,
      shopId: activeShop.id,
      customerId,
      type,
      amount,
      balanceAfter: newBalance,
      billNumber,
      notes,
      date: nowIso,
      createdAt: nowIso
    };

    setAllKhataCustomers(prev => prev.map(c => 
      c.id === customerId 
        ? { ...c, currentBalance: newBalance, lastTransactionDate: nowIso, updatedAt: nowIso } 
        : c
    ));
    setAllKhataTransactions(prev => [newTx, ...prev]);

    try {
      await setDoc(doc(db, 'khata_transactions', newTx.id), newTx);
      await updateDoc(doc(db, 'khata_customers', customerId), {
        currentBalance: newBalance,
        lastTransactionDate: nowIso,
        updatedAt: nowIso
      });
    } catch (err) {
      console.warn('Firestore khata tx note:', err);
    }
  };

  const updateShopProfile = async (updates: Partial<Shop>) => {
    const updated = {
      ...activeShop,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    setShops(prev => {
      const newShops = prev.map(s => s.id === activeShop.id ? updated : s);
      try {
        localStorage.setItem(LOCAL_SHOPS_KEY, JSON.stringify(newShops.filter(s => !INITIAL_SHOPS.some(i => i.id === s.id))));
      } catch (e) {
        console.warn('Local shop save note:', e);
      }
      return newShops;
    });

    try {
      await updateDoc(doc(db, 'shops', activeShop.id), updates);
    } catch (err) {
      console.warn('Firestore shop profile update note:', err);
    }
  };

  const addCustomCategory = async (categoryName: string) => {
    const trimmed = categoryName.trim();
    if (!trimmed) return;
    const existing = activeShop.customCategories || [];
    if (existing.includes(trimmed)) return;
    const updatedCategories = [...existing, trimmed];
    await updateShopProfile({ customCategories: updatedCategories });
  };

  const removeCustomCategory = async (categoryName: string) => {
    const trimmed = categoryName.trim();
    const existing = activeShop.customCategories || [];
    const updatedCategories = existing.filter(c => c.toLowerCase() !== trimmed.toLowerCase());
    await updateShopProfile({ customCategories: updatedCategories });
  };

  const createNewShop = async (shopData: Omit<Shop, 'id' | 'shopOwnerId' | 'createdAt'>): Promise<Shop> => {
    const ownerId = user ? user.uid : `owner_tenant_${Date.now()}`;
    const newId = `shop_${Date.now()}`;

    // Guarantee a unique conflict-free slug based on shopName
    const uniqueSlug = shopData.slug 
      ? generateUniqueShopSlug(shopData.slug, shops)
      : generateUniqueShopSlug(shopData.shopName, shops);

    const newShop: Shop = {
      ...shopData,
      slug: uniqueSlug,
      id: newId,
      shopOwnerId: ownerId,
      createdAt: new Date().toISOString()
    };

    const sampleProduct1: Product = {
      id: `prod_${newId}_01`,
      shopOwnerId: ownerId,
      shopId: newId,
      name: `${shopData.category} Featured Special (Pack)`,
      description: 'Handpicked fresh essentials ready for fast billing & delivery.',
      category: shopData.category,
      mrp: 350,
      sellingPrice: 299,
      stockQuantity: 25,
      unit: 'packet',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
      barcode: `890${Date.now().toString().slice(-7)}`,
      isFeatured: true,
      status: 'in_stock',
      createdAt: new Date().toISOString()
    };

    const sampleProduct2: Product = {
      id: `prod_${newId}_02`,
      shopOwnerId: ownerId,
      shopId: newId,
      name: 'Premium Daily Essentials Combo',
      description: 'High quality value pack with instant counter discount.',
      category: shopData.category,
      mrp: 500,
      sellingPrice: 420,
      stockQuantity: 18,
      unit: 'packet',
      imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&auto=format&fit=crop&q=80',
      barcode: `890${(Date.now() + 1).toString().slice(-7)}`,
      isFeatured: true,
      status: 'in_stock',
      createdAt: new Date().toISOString()
    };

    setShops(prev => {
      const updated = [newShop, ...prev];
      try {
        localStorage.setItem(LOCAL_SHOPS_KEY, JSON.stringify(updated.filter(s => !INITIAL_SHOPS.some(i => i.id === s.id))));
      } catch (e) {
        console.warn('Local shop save note:', e);
      }
      return updated;
    });

    setAllProducts(prev => {
      const updated = [sampleProduct1, sampleProduct2, ...prev];
      try {
        localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(updated.filter(p => !INITIAL_PRODUCTS.some(i => i.id === p.id))));
      } catch (e) {
        console.warn('Local product save note:', e);
      }
      return updated;
    });

    setActiveShopIdState(newId);

    try {
      await setDoc(doc(db, 'shops', newId), newShop);
      await setDoc(doc(db, 'products', sampleProduct1.id), sampleProduct1);
      await setDoc(doc(db, 'products', sampleProduct2.id), sampleProduct2);
    } catch (err) {
      console.warn('Firestore shop create note:', err);
    }

    return newShop;
  };

  return (
    <ShopContext.Provider
      value={{
        shops,
        activeShop,
        setActiveShopId,
        products,
        orders,
        khataCustomers,
        khataTransactions,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartItemCount,
        tierPlan,
        productLimit,
        isProductLimitReached,
        canAccess,
        upgradePlan,
        isShopsLoaded,
        getShopBySlug,
        getProductsForShop,
        subscriptionRequests,
        submitPlanUpgradeRequest,
        approvePlanRequest,
        rejectPlanRequest,
        toggleShopStatus,
        superAdminSetTier,
        createProduct,
        updateProduct,
        deleteProduct,
        createOrder,
        updateOrderStatus,
        addKhataCustomer,
        addKhataTransaction,
        updateShopProfile,
        updateShopSettings: updateShopProfile,
        addCustomCategory,
        removeCustomCategory,
        createNewShop
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
