import React, { useState, useMemo } from 'react';
import { useShop } from '../../context/ShopContext';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Camera, 
  Package, 
  Check, 
  X, 
  AlertCircle, 
  Sparkles,
  Barcode,
  Layers,
  FolderPlus,
  ArrowUpDown,
  Tag,
  Zap,
  Lock,
  ArrowRight,
  CheckCircle2,
  BookmarkCheck,
  CornerDownRight
} from 'lucide-react';
import { Product, SubscriptionTier } from '../../types';
import { MediaCaptureModal } from '../../components/common/MediaCaptureModal';
import { UsageMeter } from '../../components/admin/UsageMeter';
import { TIER_PLANS } from '../../lib/plans';
import { 
  getAdaptiveCategoriesForShop, 
  BUSINESS_STORE_TYPES, 
  UNIVERSAL_DEFAULT_CATEGORIES 
} from '../../lib/categories';

interface ProductManagementProps {
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
}

export const ProductManagement: React.FC<ProductManagementProps> = ({
  isAddModalOpen: externalIsAddModalOpen,
  onCloseAddModal: externalOnCloseAddModal
}) => {
  const { 
    products, 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    activeShop,
    isProductLimitReached,
    tierPlan,
    productLimit,
    upgradePlan,
    addCustomCategory,
    removeCustomCategory
  } = useShop();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  
  // Adaptive categories calculated from current store type + custom store categories
  const shopAdaptiveCategories = useMemo(() => {
    return getAdaptiveCategoriesForShop(activeShop?.category, activeShop?.customCategories || []);
  }, [activeShop?.category, activeShop?.customCategories]);

  // Inline Category Creator inside Add/Edit Product Modal
  const [isAddingInlineCategory, setIsAddingInlineCategory] = useState(false);
  const [inlineCategoryInput, setInlineCategoryInput] = useState('');
  const [categoryCreatedFeedback, setCategoryCreatedFeedback] = useState<string | null>(null);

  // Category Manager Modal state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isTierUpgradeModalOpen, setIsTierUpgradeModalOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Internal modal states
  const [isModalOpen, setIsModalOpen] = useState(externalIsAddModalOpen || false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState(() => shopAdaptiveCategories[0] || 'General');
  const [description, setDescription] = useState('');
  const [mrp, setMrp] = useState<number | ''>('');
  const [sellingPrice, setSellingPrice] = useState<number | ''>('');
  const [stockQuantity, setStockQuantity] = useState<number | ''>(10);
  const [unit, setUnit] = useState('packet');
  const [imageUrl, setImageUrl] = useState('');
  const [barcode, setBarcode] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // Merged categories (Adaptive store categories + existing product categories + custom)
  const allCategories = useMemo(() => {
    return Array.from(new Set(['All', ...shopAdaptiveCategories, ...products.map(p => p.category)]));
  }, [shopAdaptiveCategories, products]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.barcode && p.barcode.includes(searchQuery)) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesStock = stockFilter === 'all' || p.status === stockFilter;
    return matchesSearch && matchesCategory && matchesStock;
  });

  const openCreateModal = () => {
    if (isProductLimitReached) {
      setIsTierUpgradeModalOpen(true);
      return;
    }
    setEditingProduct(null);
    setName('');
    setCategory(shopAdaptiveCategories[0] || 'General');
    setIsAddingInlineCategory(false);
    setInlineCategoryInput('');
    setCategoryCreatedFeedback(null);
    setDescription('');
    setMrp('');
    setSellingPrice('');
    setStockQuantity(10);
    setUnit('packet');
    setImageUrl('');
    setBarcode(`890${Math.floor(1000000 + Math.random() * 9000000)}`);
    setIsFeatured(false);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category);
    setIsAddingInlineCategory(false);
    setInlineCategoryInput('');
    setCategoryCreatedFeedback(null);
    setDescription(product.description || '');
    setMrp(product.mrp || '');
    setSellingPrice(product.sellingPrice);
    setStockQuantity(product.stockQuantity);
    setUnit(product.unit);
    setImageUrl(product.imageUrl || '');
    setBarcode(product.barcode || '');
    setIsFeatured(!!product.isFeatured);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || sellingPrice === '') {
      alert('Please fill product title and selling price.');
      return;
    }

    const payload = {
      name,
      category: category || 'General',
      description,
      mrp: mrp === '' ? undefined : Number(mrp),
      sellingPrice: Number(sellingPrice),
      stockQuantity: Number(stockQuantity) || 0,
      unit: unit || 'packet',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
      barcode: barcode || undefined,
      isFeatured,
      status: (Number(stockQuantity) > 5 ? 'in_stock' : (Number(stockQuantity) > 0 ? 'low_stock' : 'out_of_stock')) as Product['status']
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await createProduct(payload);
      }

      setIsModalOpen(false);
      if (externalOnCloseAddModal) externalOnCloseAddModal();
    } catch (err: any) {
      if (err.message && err.message.includes('TIER_LIMIT_REACHED')) {
        setIsModalOpen(false);
        setIsTierUpgradeModalOpen(true);
      } else {
        alert(err.message || 'Failed to save product');
      }
    }
  };

  const handleUpgradeFromModal = async (targetTier: SubscriptionTier) => {
    setIsUpgrading(true);
    try {
      await upgradePlan(targetTier);
      setIsTierUpgradeModalOpen(false);
    } catch (err) {
      console.error('Upgrade failed:', err);
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleQuickStockAdjust = async (product: Product, delta: number) => {
    const newQty = Math.max(0, product.stockQuantity + delta);
    await updateProduct(product.id, { stockQuantity: newQty });
  };

  const handleDelete = async (id: string, prodName: string) => {
    if (confirm(`Are you sure you want to delete "${prodName}"?`)) {
      await deleteProduct(id);
    }
  };

  const handleSaveInlineCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inlineCategoryInput.trim();
    if (!trimmed) return;

    try {
      await addCustomCategory(trimmed);
      setCategory(trimmed);
      setInlineCategoryInput('');
      setIsAddingInlineCategory(false);
      setCategoryCreatedFeedback(`Category "${trimmed}" saved to your store and selected!`);
      setTimeout(() => setCategoryCreatedFeedback(null), 4000);
    } catch (err) {
      console.error('Failed to add custom category:', err);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (trimmed) {
      await addCustomCategory(trimmed);
      setCategory(trimmed);
      setNewCategoryName('');
    }
  };

  const handleRemoveCustomCategory = async (catName: string) => {
    if (confirm(`Remove custom category "${catName}" from store settings?`)) {
      await removeCustomCategory(catName);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 0. Real-time Quota Meter Widget */}
      <UsageMeter onUpgradeClick={() => setIsTierUpgradeModalOpen(true)} />

      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Catalog & Inventory Management</h2>
          <p className="text-xs text-slate-500">
            Isolated merchant stock, SKU barcode indexing, categories, and direct photo capture.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="manage-categories-btn"
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-2xs transition flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-slate-500" />
            <span>Categories</span>
          </button>

          <button
            id="open-create-product-modal-btn"
            onClick={openCreateModal}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-2 ${
              isProductLimitReached 
                ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {isProductLimitReached ? <Zap className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isProductLimitReached ? 'Limit Reached (Upgrade)' : 'Add New Product'}</span>
          </button>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, SKU or barcode..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-slate-900"
            />
          </div>

          {/* Stock Filter Pills */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setStockFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                stockFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setStockFilter('in_stock')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                stockFilter === 'in_stock' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              In Stock
            </button>
            <button
              onClick={() => setStockFilter('low_stock')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                stockFilter === 'low_stock' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              Low Stock
            </button>
            <button
              onClick={() => setStockFilter('out_of_stock')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                stockFilter === 'out_of_stock' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Out of Stock
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 scrollbar-none">
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Package className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700 text-sm">No products found</p>
            <p className="text-xs text-slate-400 mt-0.5">Click "Add New Product" to create your first item</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                  <th className="py-3.5 px-4">Item Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price (MRP / Sale)</th>
                  <th className="py-3.5 px-4">Stock Qty</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/70 transition">
                    
                    {/* Item Details */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&auto=format&fit=crop&q=80'}
                          alt={product.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
                        />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{product.name}</span>
                            {product.isFeatured && (
                              <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Barcode className="w-3 h-3 text-slate-400" />
                            {product.barcode || 'No barcode'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-700">
                        {product.category}
                      </span>
                    </td>

                    {/* Pricing */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">₹{product.sellingPrice}</div>
                      {product.mrp && product.mrp > product.sellingPrice && (
                        <div className="text-[10px] text-slate-400 line-through">MRP ₹{product.mrp}</div>
                      )}
                    </td>

                    {/* Stock Quantity with Quick Adjust */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleQuickStockAdjust(product, -1)}
                          className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs"
                          title="Decrease Stock"
                        >
                          -
                        </button>
                        <span className="font-bold text-slate-800 min-w-8 text-center">
                          {product.stockQuantity} <span className="text-[10px] text-slate-400 font-normal">{product.unit}</span>
                        </span>
                        <button
                          onClick={() => handleQuickStockAdjust(product, 1)}
                          className="w-5 h-5 rounded bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center font-bold text-xs"
                          title="Increase Stock"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        product.stockQuantity > 5
                          ? 'bg-emerald-100 text-emerald-800'
                          : (product.stockQuantity > 0 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')
                      }`}>
                        {product.stockQuantity > 5 ? 'In Stock' : (product.stockQuantity > 0 ? 'Low Stock' : 'Out of Stock')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          id={`edit-product-${product.id}`}
                          onClick={() => openEditModal(product)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          id={`delete-product-${product.id}`}
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. CATEGORY MANAGER MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-700" />
                  Product Categories Manager
                </h3>
                <p className="text-[11px] text-slate-500">
                  Store Type: <strong className="text-slate-800">{activeShop.category || 'General Store'}</strong> • Auto-filtered categories
                </p>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
              {/* Add New Custom Category Form */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  + Create Custom Category
                </label>
                <form onSubmit={handleAddCategory} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Dry Fruits, Tempered Glass, Party Wear..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 text-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition shrink-0 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Store</span>
                  </button>
                </form>
                <p className="text-[10px] text-slate-400">
                  Custom categories are saved directly to your store settings and will appear across the catalog & POS.
                </p>
              </div>

              {/* Custom Store Categories (if any) */}
              {activeShop.customCategories && activeShop.customCategories.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Your Custom Categories ({activeShop.customCategories.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeShop.customCategories.map(cat => (
                      <span
                        key={cat}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 font-semibold flex items-center gap-2 shadow-2xs"
                      >
                        <span>{cat}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomCategory(cat)}
                          className="text-blue-400 hover:text-rose-600 p-0.5 rounded transition"
                          title="Remove custom category"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Adaptive Categories for Store Type */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                  <span>Adaptive Categories for {activeShop.category}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">Store Type Default</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {shopAdaptiveCategories
                    .filter(cat => !(activeShop.customCategories || []).includes(cat))
                    .map(cat => (
                      <span
                        key={cat}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-medium flex items-center gap-1.5"
                      >
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>{cat}</span>
                      </span>
                    ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-5 py-2 bg-slate-900 text-white font-semibold text-xs rounded-xl hover:bg-slate-800 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. PRODUCT CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div id="product-form-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div id="product-form-dialog" className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingProduct ? 'Edit Product Details' : 'Add New Product to Store'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Store: <strong className="text-slate-800">{activeShop.shopName}</strong> ({activeShop.category})
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 flex-1">
              
              {/* Product Photo with Camera Trigger and Direct URL input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Product Photo (Web Link or Photo Picker)</label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative flex items-center justify-center">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Product" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="Paste image URL (https://...)"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-slate-900"
                      />
                      <button
                        type="button"
                        id="open-product-camera-btn"
                        onClick={() => setIsMediaModalOpen(true)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition shrink-0"
                      >
                        <Camera className="w-3.5 h-3.5 text-blue-600" />
                        <span>Presets / Photo</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Fortune Refined Sunflower Oil (1L)"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-slate-900 font-medium"
                />
              </div>

              {/* Category & Unit */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Enhanced Category Selector with Dynamic Management */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">Category *</label>
                      <button
                        type="button"
                        id="toggle-inline-custom-cat-btn"
                        onClick={() => setIsAddingInlineCategory(!isAddingInlineCategory)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Custom</span>
                      </button>
                    </div>

                    <select
                      value={category}
                      onChange={(e) => {
                        if (e.target.value === '__ADD_NEW_CUSTOM_TRIGGER__') {
                          setIsAddingInlineCategory(true);
                        } else {
                          setCategory(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-slate-900 font-medium text-slate-800"
                    >
                      <option value="__ADD_NEW_CUSTOM_TRIGGER__">✨ + Add Custom Category...</option>

                      {/* Custom Categories saved for this store */}
                      {activeShop?.customCategories && activeShop.customCategories.length > 0 && (
                        <optgroup label="🌟 My Custom Categories (Saved)">
                          {activeShop.customCategories.map(c => (
                            <option key={`custom-${c}`} value={c}>
                              ⭐ {c} (Custom)
                            </option>
                          ))}
                        </optgroup>
                      )}

                      {/* Store-Type Adaptive Categories */}
                      <optgroup label={`✨ Recommended for ${activeShop?.category || 'Store'}`}>
                        {shopAdaptiveCategories
                          .filter(c => !(activeShop?.customCategories || []).includes(c))
                          .map(c => (
                            <option key={`adaptive-${c}`} value={c}>
                              {c}
                            </option>
                          ))}
                      </optgroup>

                      {/* Other Universal Categories */}
                      <optgroup label="🌐 All Other Categories">
                        {UNIVERSAL_DEFAULT_CATEGORIES
                          .filter(c => !shopAdaptiveCategories.includes(c))
                          .map(c => (
                            <option key={`universal-${c}`} value={c}>
                              {c}
                            </option>
                          ))}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measure</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-slate-900"
                    >
                      <option value="packet">packet</option>
                      <option value="piece">piece (pc)</option>
                      <option value="kg">kg (Kilogram)</option>
                      <option value="gram">gram (g)</option>
                      <option value="liter">liter (L)</option>
                      <option value="ml">ml (Milliliter)</option>
                      <option value="box">box</option>
                      <option value="bottle">bottle</option>
                      <option value="pair">pair</option>
                      <option value="set">set</option>
                      <option value="meter">meter (m)</option>
                      <option value="dozen">dozen</option>
                    </select>
                  </div>
                </div>

                {/* Inline Custom Category Creator Box */}
                {isAddingInlineCategory && (
                  <div className="p-3 bg-blue-50/90 border border-blue-200 rounded-2xl space-y-2 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between text-[11px] font-bold text-blue-900">
                      <span className="flex items-center gap-1.5">
                        <FolderPlus className="w-3.5 h-3.5 text-blue-600" />
                        Create & Save Custom Category to Store
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingInlineCategory(false);
                          setInlineCategoryInput('');
                        }}
                        className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inlineCategoryInput}
                        onChange={(e) => setInlineCategoryInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveInlineCategory();
                          }
                        }}
                        placeholder="e.g. Dry Fruits & Nuts, Screen Protectors..."
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-blue-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-800"
                        autoFocus
                      />
                      <button
                        type="button"
                        id="save-inline-custom-cat-btn"
                        onClick={() => handleSaveInlineCategory()}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shrink-0 flex items-center gap-1 shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save to Store</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-blue-700">
                      Stored in your store settings so you can reuse it for future products anytime.
                    </p>
                  </div>
                )}

                {/* Category Created Feedback */}
                {categoryCreatedFeedback && (
                  <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{categoryCreatedFeedback}</span>
                  </div>
                )}
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="150"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">MRP Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="175"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600 focus:bg-white focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min={0}
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="25"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {/* Barcode & Featured */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Barcode / SKU</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="8901234001"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-700 focus:bg-white focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded text-slate-900 focus:ring-slate-900"
                    />
                    <span className="text-xs font-semibold text-slate-700">Feature on Storefront</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key features, ingredients or specifications..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-slate-900 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="save-product-btn"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  {editingProduct ? 'Update Product' : 'Save & Publish'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Media Capture Modal (Live Camera / Gallery) */}
      <MediaCaptureModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onCapture={(media) => setImageUrl(media)}
        title="Capture Product Photo"
        aspectRatio="square"
      />

      {/* Tier Quota Upgrade Modal */}
      {isTierUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            
            <div className="bg-slate-900 text-white p-6 pb-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Product Quota Reached</h3>
                  <p className="text-[10px] text-slate-400">
                    Your {tierPlan.name} plan allows up to {productLimit} items
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsTierUpgradeModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                You have reached your catalog limit of <strong>{productLimit} products</strong>. Upgrade your plan to instantly unlock more products and features:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Starter Option */}
                <div className="p-4 rounded-2xl border border-slate-200 hover:border-slate-400 transition flex flex-col justify-between space-y-3 bg-slate-50">
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Starter Merchant</div>
                    <div className="text-xl font-bold text-slate-900 mt-1">₹199<span className="text-[10px] font-normal text-slate-500">/mo</span></div>
                    <div className="text-[11px] text-slate-600 mt-2 space-y-1">
                      <div>✓ Up to 100 Products</div>
                      <div>✓ Full POS Terminal</div>
                      <div>✓ Thermal Bills</div>
                    </div>
                  </div>

                  <button
                    disabled={isUpgrading}
                    onClick={() => handleUpgradeFromModal('starter')}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <span>Upgrade (₹199)</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Pro Option */}
                <div className="p-4 rounded-2xl border-2 border-blue-600 transition flex flex-col justify-between space-y-3 bg-blue-50/50 relative">
                  <span className="absolute -top-2.5 right-3 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Best Value
                  </span>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Pro Business</div>
                    <div className="text-xl font-bold text-slate-900 mt-1">₹499<span className="text-[10px] font-normal text-slate-500">/mo</span></div>
                    <div className="text-[11px] text-slate-600 mt-2 space-y-1">
                      <div>✓ <strong>Unlimited</strong> Products</div>
                      <div>✓ Digital Khata Ledger</div>
                      <div>✓ WhatsApp Reminders</div>
                    </div>
                  </div>

                  <button
                    disabled={isUpgrading}
                    onClick={() => handleUpgradeFromModal('pro')}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-xs"
                  >
                    <span>Upgrade (₹499)</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsTierUpgradeModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Close
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

