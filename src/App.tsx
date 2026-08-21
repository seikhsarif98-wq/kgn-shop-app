/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ShopProvider, useShop } from './context/ShopContext';
import { Header } from './components/common/Header';
import { StorefrontView } from './views/storefront/StorefrontView';
import { ShopDirectoryView } from './views/directory/ShopDirectoryView';
import { CartDrawer } from './views/storefront/CartDrawer';
import { AdminPortalView } from './views/admin/AdminPortalView';
import { SuperAdminPortal } from './views/superadmin/SuperAdminPortal';
import { AuthModal } from './views/auth/AuthModal';
import { NewShopModal } from './views/admin/NewShopModal';
import { MyOrdersModal } from './views/storefront/MyOrdersModal';
import { parseStoreSlugFromUrl, slugifyShopName } from './lib/slugs';

export type AppMode = 'storefront' | 'directory' | 'admin' | 'super_admin';

const AppContent: React.FC = () => {
  const { role, isSuperAdmin, isShopAdmin, user } = useAuth();
  const { shops, activeShop, setActiveShopId, getShopBySlug } = useShop();

  const [currentStoreSlug, setCurrentStoreSlug] = useState<string | null>(() => parseStoreSlugFromUrl());

  const [currentMode, setCurrentMode] = useState<AppMode>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (
        path === '/super-admin' || 
        path.startsWith('/super-admin') || 
        path === '/admin-login' || 
        path.startsWith('/admin-login') ||
        hash === '#/super-admin' || 
        hash === '#super-admin' ||
        hash === '#/admin-login' ||
        hash === '#admin-login'
      ) {
        return 'super_admin';
      }
      if (
        path === '/admin' || 
        path.startsWith('/admin') || 
        path === '/dashboard' || 
        path.startsWith('/dashboard') ||
        path === '/merchant' || 
        path.startsWith('/merchant') ||
        hash === '#/admin' ||
        hash === '#admin' ||
        hash === '#/dashboard' ||
        hash === '#dashboard' ||
        hash === '#/merchant' ||
        hash === '#merchant'
      ) {
        return 'admin';
      }
      if (path === '/shops' || hash === '#/shops' || hash === '#shops') {
        return 'directory';
      }
    }
    return 'storefront';
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isNewShopOpen, setIsNewShopOpen] = useState(false);

  // Sync browser path/hash when mode or store slug changes
  const handleModeChange = (mode: AppMode, targetSlug?: string) => {
    setCurrentMode(mode);

    if (mode === 'storefront') {
      // Strip any path/hash prefixes like "/store/" or "#/store/" if passed
      let cleanTarget = targetSlug ? targetSlug.replace(/^#?\/?store\//i, '').replace(/^\/+/, '').trim() : '';
      
      const fallbackStoreSlug = shops?.[0]?.slug || (shops?.[0]?.shopName ? slugifyShopName(shops[0].shopName) : null);
      const activeStoreSlug = activeShop?.slug || (activeShop?.shopName ? slugifyShopName(activeShop.shopName) : null);
      const rawSlug = cleanTarget || activeStoreSlug || fallbackStoreSlug || currentStoreSlug;
      const resolvedSlug = rawSlug ? slugifyShopName(rawSlug) : fallbackStoreSlug;
      setCurrentStoreSlug(resolvedSlug);
      
      // Sync active shop in context if matched
      if (resolvedSlug) {
        const found = getShopBySlug(resolvedSlug);
        if (found) {
          setActiveShopId(found.id);
        }
      }

      if (typeof window !== 'undefined') {
        const newHash = resolvedSlug ? `#/store/${resolvedSlug}` : '#/';
        if (window.history?.pushState) {
          window.history.pushState(null, '', newHash);
        } else {
          window.location.hash = newHash;
        }
      }
    } else {
      if (typeof window !== 'undefined') {
        let newHash = '#/';
        if (mode === 'super_admin') {
          newHash = '#/admin-login';
        } else if (mode === 'admin') {
          newHash = '#/dashboard';
        } else if (mode === 'directory') {
          newHash = '#/shops';
        }
        if (window.history?.pushState) {
          window.history.pushState(null, '', newHash);
        } else {
          window.location.hash = newHash;
        }
      }
    }
  };

  // Track previous role to trigger instant redirection upon fresh login
  const prevUserRef = useRef<string | null>(null);

  useEffect(() => {
    const currentUserId = user?.uid || null;
    const isFreshLogin = currentUserId && currentUserId !== prevUserRef.current;
    prevUserRef.current = currentUserId;

    if (isFreshLogin) {
      if (isSuperAdmin) {
        handleModeChange('super_admin');
      } else if (isShopAdmin) {
        // Automatically direct merchant to Merchant Dashboard
        handleModeChange('admin');
      }
    }
  }, [user, role, isSuperAdmin, isShopAdmin]);

  // Listen for browser back / forward navigation (popstate / hashchange)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const parsedSlug = parseStoreSlugFromUrl();
      setCurrentStoreSlug(parsedSlug);

      if (parsedSlug) {
        const matched = getShopBySlug(parsedSlug);
        if (matched) {
          setActiveShopId(matched.id);
        }
      }

      if (
        path === '/super-admin' || 
        path.startsWith('/super-admin') || 
        path === '/admin-login' || 
        path.startsWith('/admin-login') ||
        hash === '#/super-admin' || 
        hash === '#super-admin' ||
        hash === '#/admin-login' ||
        hash === '#admin-login'
      ) {
        setCurrentMode('super_admin');
      } else if (
        path === '/admin' || 
        path.startsWith('/admin') || 
        path === '/dashboard' || 
        path.startsWith('/dashboard') ||
        path === '/merchant' || 
        path.startsWith('/merchant') ||
        hash === '#/admin' ||
        hash === '#admin' ||
        hash === '#/dashboard' ||
        hash === '#dashboard' ||
        hash === '#/merchant' ||
        hash === '#merchant'
      ) {
        setCurrentMode('admin');
      } else if (path === '/shops' || hash === '#/shops' || hash === '#shops') {
        setCurrentMode('directory');
      } else {
        setCurrentMode('storefront');
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const handleSelectShopFromDirectory = (shopId: string, targetMode: 'storefront' | 'admin') => {
    const targetShop = shops.find(s => s.id === shopId);
    setActiveShopId(shopId);
    if (targetMode === 'storefront' && targetShop) {
      handleModeChange('storefront', targetShop.slug);
    } else {
      handleModeChange(targetMode);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Universal Top Header with Multi-Shop Switcher & Navigation */}
      <Header
        currentMode={currentMode}
        onModeChange={handleModeChange}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenNewShopModal={() => setIsNewShopOpen(true)}
      />

      {/* Main Viewport */}
      <main className="flex-1">
        {currentMode === 'storefront' && (
          <StorefrontView
            storeSlug={currentStoreSlug}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenOrders={() => setIsOrdersOpen(true)}
            onOpenNewShopModal={() => setIsNewShopOpen(true)}
            onNavigateToMode={handleModeChange}
          />
        )}

        {currentMode === 'directory' && (
          <ShopDirectoryView
            onSelectShop={handleSelectShopFromDirectory}
            onOpenNewShopModal={() => setIsNewShopOpen(true)}
          />
        )}

        {currentMode === 'admin' && (
          <AdminPortalView
            onOpenAuth={() => setIsAuthOpen(true)}
            onNavigateToStorefront={(slug) => handleModeChange('storefront', slug || activeShop.slug)}
          />
        )}

        {currentMode === 'super_admin' && (
          <SuperAdminPortal
            onNavigateToShopAdmin={(shopId) => {
              setActiveShopId(shopId);
              handleModeChange('admin');
            }}
            onNavigateToStorefront={(slug) => handleModeChange('storefront', slug || activeShop.slug)}
          />
        )}
      </main>

      {/* Shopping Bag / Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {/* Customer Orders Tracking Modal */}
      <MyOrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        onContinueShopping={() => setIsCartOpen(false)}
      />

      {/* Authentication & Role Switcher Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthenticated={(targetMode) => handleModeChange(targetMode)}
      />

      {/* New Shop Registration Modal */}
      <NewShopModal
        isOpen={isNewShopOpen}
        onClose={() => setIsNewShopOpen(false)}
        onNavigateToStorefront={(slug) => handleModeChange('storefront', slug || activeShop.slug)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <AppContent />
      </ShopProvider>
    </AuthProvider>
  );
}
