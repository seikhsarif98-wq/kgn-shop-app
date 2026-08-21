/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shop } from '../types';

/**
 * Normalizes a shop name into a clean, URL-safe base slug.
 * e.g., "KGN Super Market & Kirana" -> "kgn-super-market-kirana"
 * e.g., "Al-Madina 100% Halal!" -> "al-madina-100-halal"
 */
export function slugifyShopName(name: string): string {
  if (!name) return 'store';
  
  const clean = name
    .toLowerCase()
    .trim()
    // Replace accents/diacritics if any
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Remove apostrophes and quotes cleanly
    .replace(/['"`]/g, '')
    // Replace any non-alphanumeric character with hyphen
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '');

  return clean || 'store';
}

/**
 * Validates whether a custom slug is well-formed.
 */
export function isValidShopSlug(slug: string): boolean {
  if (!slug) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.toLowerCase()) && slug.length >= 2 && slug.length <= 60;
}

/**
 * Dynamically parses the target store slug from the current browser URL.
 * Supports:
 * 1. Pathname: /store/:storeSlug (e.g. /store/fancy-dukan, /store/kgn-supermarket)
 * 2. Hash: #/store/:storeSlug or #store/:storeSlug
 * 3. Search parameters: ?store=:storeSlug or ?slug=:storeSlug
 */
export function parseStoreSlugFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const path = window.location.pathname;
    const hash = window.location.hash;

    // 1. Match pathname: /store/:slug or /store/:slug/
    const pathMatch = path.match(/^\/store\/([a-zA-Z0-9_-]+)/i);
    if (pathMatch && pathMatch[1]) {
      const candidate = decodeURIComponent(pathMatch[1]).trim().toLowerCase();
      if (candidate && candidate !== 'undefined' && candidate !== 'null') {
        return candidate;
      }
    }

    // 2. Match hash: #/store/:slug or #store/:slug
    const hashMatch = hash.match(/^#\/?store\/([a-zA-Z0-9_-]+)/i);
    if (hashMatch && hashMatch[1]) {
      const candidate = decodeURIComponent(hashMatch[1]).trim().toLowerCase();
      if (candidate && candidate !== 'undefined' && candidate !== 'null') {
        return candidate;
      }
    }

    // 3. Match query string parameters: ?store=slug or ?slug=slug
    const searchParams = new URLSearchParams(window.location.search);
    const querySlug = searchParams.get('store') || searchParams.get('slug');
    if (querySlug) {
      const candidate = querySlug.trim().toLowerCase();
      if (candidate && candidate !== 'undefined' && candidate !== 'null') {
        return candidate;
      }
    }
  } catch (e) {
    console.warn('Error parsing store slug from URL:', e);
  }

  return null;
}

/**
 * Generates a short random alphanumeric string (e.g. "abc", "7k2").
 */
export function generateRandomSlugSuffix(length = 3): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Automatically generates a unique URL slug based on the shop name.
 * If the generated base slug conflicts with any existing shop,
 * appends a short random string (e.g., /store/kgn-market-abc).
 * 
 * @param shopName The merchant's shop name (e.g. "KGN Market")
 * @param existingShops List of existing shops to check for collisions
 * @param currentShopId Optional shop ID to ignore (for updates on existing shop)
 */
export function generateUniqueShopSlug(
  shopName: string,
  existingShops: Array<{ id?: string; slug?: string }>,
  currentShopId?: string
): string {
  const baseSlug = slugifyShopName(shopName);

  // Check if a candidate slug is already in use by another shop
  const isSlugTaken = (slugCandidate: string): boolean => {
    return existingShops.some(shop => {
      if (currentShopId && shop.id === currentShopId) {
        return false;
      }
      return shop.slug && shop.slug.toLowerCase() === slugCandidate.toLowerCase();
    });
  };

  // If base slug is free, use it directly (e.g., "kgn-market")
  if (!isSlugTaken(baseSlug)) {
    return baseSlug;
  }

  // Conflict detected! Append a short random string (e.g., "kgn-market-abc")
  let attempts = 0;
  while (attempts < 100) {
    const candidate = `${baseSlug}-${generateRandomSlugSuffix(3)}`;
    if (!isSlugTaken(candidate)) {
      return candidate;
    }
    attempts++;
  }

  // Fallback with timestamp if many collisions
  return `${baseSlug}-${Date.now().toString(36).slice(-4)}`;
}

/**
 * Returns the full shareable URL for a store slug.
 */
export function getShareableStoreUrl(slug: string, origin?: string): string {
  const base = origin || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/store/${slug}`;
}

/**
 * Generates a pre-filled WhatsApp share URL for customers.
 */
export function getWhatsAppShareUrl(shopName: string, storeUrl: string, phone?: string): string {
  const text = `🛍️ *Order Online from ${shopName}!*\n\n` +
    `Browse our full digital catalog, check daily prices & place orders with instant counter delivery:\n` +
    `👉 ${storeUrl}\n\n` +
    `Fast billing & UPI payment supported!`;

  const encodedText = encodeURIComponent(text);
  if (phone) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}
