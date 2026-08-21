/**
 * Product & Store Category Definitions
 * Dynamic & Store-Type Adaptive Category Engine
 */

export interface BusinessStoreType {
  id: string;
  name: string;
  description: string;
  defaultCategories: string[];
}

export const BUSINESS_STORE_TYPES: BusinessStoreType[] = [
  {
    id: 'grocery',
    name: 'Grocery & Kirana',
    description: 'Daily provisions, grains, spices, packaged food, beverages & household essentials',
    defaultCategories: [
      'Staples & Grains',
      'Edible Oils & Ghee',
      'Spices & Masalas',
      'Snacks & Namkeen',
      'Dairy, Milk & Eggs',
      'Beverages & Tea/Coffee',
      'Packaged & Instant Foods',
      'Cleaning & Household',
      'Personal Care & Soaps',
      'Dry Fruits & Nuts',
      'Pooja & Incense Items'
    ]
  },
  {
    id: 'supermarket',
    name: 'Supermarket & Departmental',
    description: 'Multi-category retail, fresh produce, gourmet items & home supplies',
    defaultCategories: [
      'Fresh Fruits & Vegetables',
      'Gourmet & Imported Foods',
      'Breakfast & Cereals',
      'Dairy & Frozen Foods',
      'Chocolates & Confectionery',
      'Home Care & Detergents',
      'Kitchenware & Storage',
      'Personal Grooming',
      'Baby Products & Diapers',
      'Pet Food & Care'
    ]
  },
  {
    id: 'electronics',
    name: 'Electronics & Mobiles',
    description: 'Smartphones, gadgets, mobile accessories, cables, wearables & repair parts',
    defaultCategories: [
      'Smartphones & Feature Phones',
      'Mobile Covers & Cases',
      'Tempered Glass & Protectors',
      'Chargers, Cables & Adapters',
      'Power Banks & Batteries',
      'Earphones & Bluetooth Headsets',
      'Smartwatches & Fitness Bands',
      'Bluetooth Speakers & Soundbars',
      'Memory Cards & USB Drives',
      'Home & Kitchen Appliances',
      'Mobile Repair & Spare Parts'
    ]
  },
  {
    id: 'clothing',
    name: 'Clothing & Apparel',
    description: 'Men, women, kids garments, ethnic wear, fabrics & seasonal fashion',
    defaultCategories: [
      "Men's Casual & Formal Shirts",
      "Men's T-Shirts & Polos",
      "Men's Jeans & Trousers",
      "Women's Kurtis & Kurtas",
      "Women's Sarees & Lehengas",
      "Women's Western & Tops",
      'Kids & Infant Wear',
      'Innerwear & Loungewear',
      'Winter Wear, Jackets & Hoodies',
      'Ethnic & Festive Wear',
      'Unstitched Fabrics & Dress Materials'
    ]
  },
  {
    id: 'footwear',
    name: 'Footwear & Leather',
    description: 'Men, women, kids shoes, sandals, slippers, boots & shoe care',
    defaultCategories: [
      "Men's Formal Shoes",
      "Men's Casual Sneakers",
      'Sports & Running Shoes',
      "Women's Heels & Wedges",
      "Women's Flats & Bellies",
      'Sandals, Slippers & Clogs',
      'School & Kids Shoes',
      'Flip Flops & Daily Slippers',
      'Socks & Insole Care',
      'Shoe Polish, Brushes & Laces'
    ]
  },
  {
    id: 'cosmetics',
    name: 'Cosmetics & Beauty',
    description: 'Skincare, haircare, makeup, perfumes, grooming & salon supplies',
    defaultCategories: [
      'Skincare, Moisturisers & Serums',
      'Haircare, Shampoos & Oils',
      'Makeup, Foundations & Compacts',
      'Lipsticks, Gloss & Lip Balms',
      'Eye Makeup, Kajal & Mascaras',
      'Perfumes, Attar & Body Mists',
      'Deodorants & Roll-ons',
      'Face Washes & Scrubs',
      'Nail Polishes & Removers',
      'Men Grooming & Beard Care',
      'Salon Tools & Accessories'
    ]
  },
  {
    id: 'hardware',
    name: 'Hardware & Tools',
    description: 'Hand tools, power tools, plumbing, electricals, paints & fasteners',
    defaultCategories: [
      'Hand Tools, Hammers & Pliers',
      'Power Tools & Drill Machines',
      'Plumbing Pipes, Valves & Taps',
      'Paints, Primers & Brushes',
      'Electrical Switches & Sockets',
      'Wires, Cables & Extension Boards',
      'Nails, Screws, Bolts & Fasteners',
      'Adhesives, Silicones & Tapes',
      'Door Locks, Handles & Hinges',
      'Sanitaryware & Bathroom Fixtures',
      'Safety Gloves, Masks & Helmets'
    ]
  },
  {
    id: 'general_store',
    name: 'General Store & Variety',
    description: 'Daily stationery, plasticware, toys, gifts, batteries & utility goods',
    defaultCategories: [
      'Notebooks, Registers & Diaries',
      'Pens, Pencils & Art Supplies',
      'School Bags, Pouches & Bottles',
      'Plastic Containers & Buckets',
      'Toys, Board Games & Puzzles',
      'Gift Articles & Decorative Items',
      'Batteries, Bulbs & Torches',
      'Umbrellas, Raincoats & Seasonal',
      'Lock, Keys & Daily Utilities',
      'Party Items & Balloons'
    ]
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy & Healthcare',
    description: 'Prescription medicines, OTC drugs, first aid, vitamins & baby care',
    defaultCategories: [
      'Prescription Medicines',
      'OTC Cold, Fever & Pain Relief',
      'First Aid, Bandages & Antiseptics',
      'Vitamins, Minerals & Supplements',
      'Health Drinks & Protein Powders',
      'Baby Food, Formula & Diapers',
      'Medical Devices & Thermometers',
      'Ayurvedic & Herbal Formulations',
      'Sanitizers & Masks',
      'Personal Hygiene & Intimate Care'
    ]
  },
  {
    id: 'bakery',
    name: 'Bakery, Sweets & Dairy',
    description: 'Fresh bread, cakes, pastries, mithai, milk, paneer, butter & savories',
    defaultCategories: [
      'Fresh Cakes & Birthday Pastries',
      'Breads, Buns & Pav',
      'Biscuits, Cookies & Rusk',
      'Indian Sweets, Mithai & Halwa',
      'Fresh Milk, Paneer & Butter',
      'Curd, Lassi & Chaas',
      'Chocolates & Wafers',
      'Namkeen, Puffs & Savory Snacks',
      'Ice Creams & Kulfis'
    ]
  },
  {
    id: 'vegetables_fruits',
    name: 'Vegetables & Fruits',
    description: 'Farm-fresh green vegetables, seasonal fruits, herbs & organic produce',
    defaultCategories: [
      'Daily Vegetables (Potato, Onion, Tomato)',
      'Green Leafy Vegetables',
      'Seasonal Fresh Fruits',
      'Exotic Fruits & Salads',
      'Organic & Farm Produce',
      'Fresh Herbs, Ginger & Garlic',
      'Sprouts, Microgreens & Mushrooms'
    ]
  },
  {
    id: 'restaurant_cafe',
    name: 'Restaurant, Cafe & Fast Food',
    description: 'Cooked meals, fast food, biryani, pizzas, beverages & desserts',
    defaultCategories: [
      'Starters & Quick Bites',
      'Main Course & Curries',
      'Biryani, Rice & Pulao',
      'Roti, Naan & Parathas',
      'Pizzas, Burgers & Sandwiches',
      'Chinese & Noodles',
      'Cold Drinks, Shakes & Mocktails',
      'Hot Tea, Chai & Coffee',
      'Desserts & Ice Cream'
    ]
  }
];

/**
 * Universal fallback category list covering diverse business spectrum
 */
export const UNIVERSAL_DEFAULT_CATEGORIES: string[] = [
  'General',
  'Staples & Grains',
  'Edible Oils & Spices',
  'Snacks & Beverages',
  'Dairy & Bakery',
  'Electronics & Gadgets',
  'Mobile Accessories',
  'Clothing & Fashion',
  'Footwear',
  'Cosmetics & Personal Care',
  'Hardware & Tools',
  'Stationery & Toys',
  'Healthcare & Pharmacy',
  'Household & Cleaning',
  'Gifts & Novelties'
];

/**
 * Intelligently resolves adaptive product categories for a given shop based on its shop category name
 * and any user-created custom categories saved in store settings.
 */
export function getAdaptiveCategoriesForShop(shopCategoryName?: string, customCategories: string[] = []): string[] {
  if (!shopCategoryName) {
    return Array.from(new Set([...customCategories, ...UNIVERSAL_DEFAULT_CATEGORIES]));
  }

  const cleanCategory = shopCategoryName.toLowerCase();

  // Find direct match or partial match in business types
  const matchedType = BUSINESS_STORE_TYPES.find(b => {
    const bName = b.name.toLowerCase();
    const bId = b.id.toLowerCase();
    return cleanCategory.includes(bId) || 
           bName.includes(cleanCategory) || 
           cleanCategory.includes(bName) ||
           // Keyword checks
           (cleanCategory.includes('kirana') && bId === 'grocery') ||
           (cleanCategory.includes('grocery') && bId === 'grocery') ||
           (cleanCategory.includes('supermarket') && bId === 'supermarket') ||
           (cleanCategory.includes('electronic') && bId === 'electronics') ||
           (cleanCategory.includes('mobile') && bId === 'electronics') ||
           (cleanCategory.includes('cloth') && bId === 'clothing') ||
           (cleanCategory.includes('fashion') && bId === 'clothing') ||
           (cleanCategory.includes('apparel') && bId === 'clothing') ||
           (cleanCategory.includes('footwear') && bId === 'footwear') ||
           (cleanCategory.includes('shoe') && bId === 'footwear') ||
           (cleanCategory.includes('cosmetic') && bId === 'cosmetics') ||
           (cleanCategory.includes('beauty') && bId === 'cosmetics') ||
           (cleanCategory.includes('hardware') && bId === 'hardware') ||
           (cleanCategory.includes('tool') && bId === 'hardware') ||
           (cleanCategory.includes('general') && bId === 'general_store') ||
           (cleanCategory.includes('stationery') && bId === 'general_store') ||
           (cleanCategory.includes('pharma') && bId === 'pharmacy') ||
           (cleanCategory.includes('medical') && bId === 'pharmacy') ||
           (cleanCategory.includes('health') && bId === 'pharmacy') ||
           (cleanCategory.includes('bakery') && bId === 'bakery') ||
           (cleanCategory.includes('sweet') && bId === 'bakery') ||
           (cleanCategory.includes('fruit') && bId === 'vegetables_fruits') ||
           (cleanCategory.includes('vegetable') && bId === 'vegetables_fruits') ||
           (cleanCategory.includes('restaurant') && bId === 'restaurant_cafe') ||
           (cleanCategory.includes('cafe') && bId === 'restaurant_cafe') ||
           (cleanCategory.includes('food') && bId === 'restaurant_cafe');
  });

  const baseList = matchedType ? matchedType.defaultCategories : UNIVERSAL_DEFAULT_CATEGORIES;

  // Merge custom categories at the top/front for instant access
  const uniqueSet = new Set<string>();
  customCategories.forEach(c => {
    if (c && c.trim()) uniqueSet.add(c.trim());
  });
  baseList.forEach(c => {
    if (c && c.trim()) uniqueSet.add(c.trim());
  });

  return Array.from(uniqueSet);
}
