/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ShopProvider, useShop } from './context/ShopContext';
import { Header } from './components/common/Header';
import { StorefrontView } from './views/storefront/StorefrontView';
import { ShopDirectoryView } from './views/directory/ShopDirectoryView';
import { CartDrawer } from './views/storefront/CartDrawer';
import { AdminPortalView } from './views/admin/AdminPortalView';
import { SuperAdminPortal } from './views/superadmin/SuperAdminPortal';
import { AuthModal } from './views/auth/AuthModal';
import { NewShopModal } from './views/admin/NewShopModal';

export type AppMode = 'storefront' | 'directory' | 'admin' | 'super_admin';

const AppContent: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<AppMode>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/super-admin' || path.startsWith('/super-admin') || hash === '#/super-admin' || hash === '#super-admin') {
        return 'super_admin';
      }
      if (path === '/admin' || path.startsWith('/admin') || hash === '#/admin') {
        return 'admin';
      }
    }
    return 'storefront';
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isNewShopOpen, setIsNewShopOpen] = useState(false);
  const { setActiveShopId } = useShop();

  // Sync browser path/hash when mode changes
  const handleModeChange = (mode: AppMode) => {
    setCurrentMode(mode);
    if (typeof window !== 'undefined' && window.history?.pushState) {
      if (mode === 'super_admin') {
        window.history.pushState(null, '', '/super-admin');
      } else if (mode === 'admin') {
        window.history.pushState(null, '', '/admin');
      } else if (mode === 'directory') {
        window.history.pushState(null, '', '/shops');
      } else {
        window.history.pushState(null, '', '/');
      }
    }
  };

  // Listen for browser popstate
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/super-admin' || path.startsWith('/super-admin') || hash === '#/super-admin' || hash === '#super-admin') {
        setCurrentMode('super_admin');
      } else if (path === '/admin' || path.startsWith('/admin')) {
        setCurrentMode('admin');
      } else if (path === '/shops') {
        setCurrentMode('directory');
      } else {
        setCurrentMode('storefront');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSelectShopFromDirectory = (shopId: string, targetMode: 'storefront' | 'admin') => {
    setActiveShopId(shopId);
    handleModeChange(targetMode);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Universal Top Header with Multi-Shop Switcher & Navigation */}
      <Header
        currentMode={currentMode}
        onModeChange={handleModeChange}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenNewShopModal={() => setIsNewShopOpen(true)}
      />

      {/* Main Viewport */}
      <main className="flex-1">
        {currentMode === 'storefront' && (
          <StorefrontView
            onOpenCart={() => setIsCartOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)}
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
          />
        )}

        {currentMode === 'super_admin' && (
          <SuperAdminPortal
            onNavigateToShopAdmin={(shopId) => {
              setActiveShopId(shopId);
              handleModeChange('admin');
            }}
            onNavigateToStorefront={() => handleModeChange('storefront')}
          />
        )}
      </main>

      {/* Shopping Bag / Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
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
