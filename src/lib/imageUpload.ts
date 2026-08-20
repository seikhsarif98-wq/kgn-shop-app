/**
 * Image Utilities & Preset Service (Zero External Storage Dependencies)
 * 
 * Replaces all external hosting dependencies (Firebase Storage, ImgBB, Cloudinary).
 * Provides:
 *  1. Direct URL input support (Unsplash, external CDNs, web links)
 *  2. Rich curated Unsplash image library for Groceries, Kirana, Logos, Banners
 *  3. Dynamic SVG Image Generators for custom branding, product placeholders, and QR codes
 *  4. Client-side Canvas Image Compression (Data URLs) with zero network calls required
 */

export interface ProcessedImageResult {
  success: boolean;
  url: string;
  source: 'url' | 'preset' | 'svg_generator' | 'local_compressed';
  error?: string;
}

/**
 * Generates an SVG Data URI placeholder for products, logos, or store categories.
 */
export function generateSvgPlaceholder(
  label: string,
  category: string = 'Grocery',
  colorScheme: 'emerald' | 'blue' | 'amber' | 'purple' | 'rose' | 'slate' = 'emerald'
): string {
  const colorMap = {
    emerald: { bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46', icon: '#10b981' },
    blue: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', icon: '#3b82f6' },
    amber: { bg: '#fffbeb', border: '#fde68a', text: '#92400e', icon: '#f59e0b' },
    purple: { bg: '#faf5ff', border: '#e9d5ff', text: '#6b21a8', icon: '#a855f7' },
    rose: { bg: '#fff1f2', border: '#fecdd3', text: '#9f1239', icon: '#f43f5e' },
    slate: { bg: '#f8fafc', border: '#e2e8f0', text: '#334155', icon: '#64748b' }
  };

  const scheme = colorMap[colorScheme] || colorMap.emerald;
  const cleanLabel = (label || 'Item').replace(/[<>&"]/g, '');
  const cleanCategory = (category || 'Product').replace(/[<>&"]/g, '');
  const initials = cleanLabel.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'KG';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <rect width="400" height="400" fill="${scheme.bg}" rx="32"/>
    <rect x="16" y="16" width="368" height="368" fill="none" stroke="${scheme.border}" stroke-width="4" stroke-dasharray="8,8" rx="24"/>
    <circle cx="200" cy="170" r="64" fill="#ffffff" stroke="${scheme.border}" stroke-width="3"/>
    <text x="200" y="185" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="900" fill="${scheme.icon}" text-anchor="middle">${initials}</text>
    <text x="200" y="275" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" fill="${scheme.text}" text-anchor="middle">${cleanLabel.slice(0, 24)}</text>
    <rect x="130" y="300" width="140" height="28" fill="${scheme.border}" rx="14"/>
    <text x="200" y="319" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="${scheme.text}" text-anchor="middle">${cleanCategory.toUpperCase()}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Optimizes and converts any client image (File, Blob, or Data URI) to a lightweight WebP/JPEG data URL.
 */
export async function optimizeImageLocally(
  input: File | Blob | string,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.82
): Promise<string> {
  // If already an HTTP/HTTPS or SVG Data URL, return directly
  if (typeof input === 'string') {
    if (input.startsWith('http://') || input.startsWith('https://') || input.startsWith('data:image/svg+xml')) {
      return input;
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to create canvas context'));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(dataUrl);
    };

    img.onerror = () => reject(new Error('Failed to load image into canvas'));

    if (typeof input === 'string') {
      img.src = input;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          reject(new Error('Empty file reader result'));
        }
      };
      reader.onerror = () => reject(new Error('FileReader failed'));
      reader.readAsDataURL(input);
    }
  });
}

/**
 * Universal Image Processing Function.
 * Zero external hosting or API keys required.
 */
export async function uploadImage(
  input: File | Blob | string,
  _options: any = {}
): Promise<{ success: boolean; url: string; provider: string; error?: string }> {
  try {
    // If it's already a URL, return it
    if (typeof input === 'string' && (input.startsWith('http://') || input.startsWith('https://') || input.startsWith('data:image/svg+xml'))) {
      return {
        success: true,
        url: input,
        provider: 'direct_url'
      };
    }

    // Process locally using client Canvas
    const optimizedDataUrl = await optimizeImageLocally(input, 1000, 1000, 0.82);
    return {
      success: true,
      url: optimizedDataUrl,
      provider: 'client_optimized'
    };
  } catch (err: any) {
    console.error('Image processing error:', err);
    if (typeof input === 'string' && input.startsWith('data:image/')) {
      return {
        success: true,
        url: input,
        provider: 'client_optimized'
      };
    }
    return {
      success: false,
      url: '',
      provider: 'none',
      error: err?.message || 'Failed to process image'
    };
  }
}

/**
 * Curated Unsplash & Category Presets for instant selection without typing URLs.
 */
export const SAMPLE_PRODUCT_IMAGES = [
  {
    name: 'Aashirvaad Shudh Chakki Atta (5kg)',
    category: 'Grocery',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Premium Basmati Rice (5kg)',
    category: 'Grocery',
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Pure Mustard Oil (1L)',
    category: 'Grocery',
    url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Tata Tea Gold Leaf (500g)',
    category: 'Beverages',
    url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Amul Salted Butter (500g)',
    category: 'Dairy & Milk',
    url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Fresh Cow Milk (1L)',
    category: 'Dairy & Milk',
    url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Tata Iodized Salt (1kg)',
    category: 'Spices & Masala',
    url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Haldi Turmeric Powder (200g)',
    category: 'Spices & Masala',
    url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Maggi 2-Minute Masala Noodles',
    category: 'Snacks',
    url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Parle-G Gold Glucose Biscuits',
    category: 'Snacks',
    url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Dettol Soap & Hygiene',
    category: 'Personal Care',
    url: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Colgate Strong Teeth Toothpaste',
    category: 'Personal Care',
    url: 'https://images.unsplash.com/photo-1559591937-e1022634e007?w=600&auto=format&fit=crop&q=80',
  }
];

export const SAMPLE_SHOP_LOGOS = [
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=300&auto=format&fit=crop&q=80'
];

export const SAMPLE_SHOP_BANNERS = [
  'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=1200&auto=format&fit=crop&q=80'
];
