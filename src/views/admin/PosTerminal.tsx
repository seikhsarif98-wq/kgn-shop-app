import React, { useState, useRef } from 'react';
import { useShop } from '../../context/ShopContext';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  QrCode, 
  Printer, 
  CheckCircle, 
  User, 
  ShoppingBag, 
  CreditCard, 
  DollarSign, 
  Receipt, 
  Barcode,
  Sparkles,
  ArrowRight,
  Download,
  MessageSquare,
  Loader2,
  Check
} from 'lucide-react';
import { Product, OrderItem, Order } from '../../types';
import { FeatureLockPaywall } from '../../components/common/FeatureLockPaywall';
import { downloadInvoicePDF, printThermalReceipt, printInvoiceDocument } from '../../lib/invoicePdfGenerator';

export const PosTerminal: React.FC = () => {
  const { products, activeShop, createOrder, khataCustomers, addKhataTransaction, canAccess } = useShop();

  const hasPosAccess = canAccess('pos');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [posItems, setPosItems] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'khata_credit'>('cash');
  const [selectedKhataCustomerId, setSelectedKhataCustomerId] = useState('');
  
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [qrDisplayMode, setQrDisplayMode] = useState<'dynamic' | 'custom'>('dynamic');

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  if (!hasPosAccess) {
    return (
      <FeatureLockPaywall
        featureName="High-Speed POS Counter Terminal"
        featureDescription="Process counter orders with barcode scanning, automated change calculation, thermal invoice generation, and dynamic UPI QR payments on the Starter (₹199/mo) or Pro plan."
        requiredTier="starter"
        icon={Receipt}
      />
    );
  }

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matches = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (p.barcode && p.barcode.includes(searchQuery)) ||
                    p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const catMatch = selectedCategory === 'All' || p.category === selectedCategory;
    return matches && catMatch;
  });

  const addItemToBill = (product: Product) => {
    if (product.stockQuantity <= 0) {
      alert('This item is out of stock.');
      return;
    }

    setPosItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          alert('Cannot add more than available stock.');
          return prev;
        }
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeItem(productId);
      return;
    }
    setPosItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));
  };

  const removeItem = (productId: string) => {
    setPosItems(prev => prev.filter(i => i.product.id !== productId));
  };

  const clearBill = () => {
    setPosItems([]);
    setDiscountAmount(0);
    setCustomerName('Walk-in Customer');
    setCustomerPhone('');
    setCompletedOrder(null);
  };

  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matched = products.find(p => p.barcode === barcodeInput.trim());
    if (matched) {
      addItemToBill(matched);
      setBarcodeInput('');
    } else {
      alert(`No product found with barcode: ${barcodeInput}`);
    }
  };

  const subtotal = posItems.reduce((sum, item) => sum + (item.product.sellingPrice * item.quantity), 0);
  const totalPayable = Math.max(0, subtotal - (Number(discountAmount) || 0));

  const handleCheckoutBill = async () => {
    if (posItems.length === 0) {
      alert('Please add at least one item to the bill.');
      return;
    }

    if (paymentMode === 'khata_credit' && !selectedKhataCustomerId) {
      alert('Please select a Khata customer ledger for credit billing.');
      return;
    }

    const orderItems: OrderItem[] = posItems.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.sellingPrice,
      quantity: item.quantity,
      unit: item.product.unit,
      total: item.product.sellingPrice * item.quantity
    }));

    const finalOrder = await createOrder({
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || activeShop.phone,
      deliveryType: 'pos',
      items: orderItems,
      subtotal,
      discount: Number(discountAmount) || 0,
      totalAmount: totalPayable,
      paymentMethod: paymentMode,
      paymentStatus: paymentMode === 'khata_credit' ? 'credit' : 'paid',
      orderStatus: 'completed',
      notes: `POS Counter Sale - ${paymentMode.toUpperCase()}`
    });

    // If Khata credit, append transaction to ledger
    if (paymentMode === 'khata_credit' && selectedKhataCustomerId) {
      await addKhataTransaction(
        selectedKhataCustomerId,
        'credit_given',
        totalPayable,
        `POS Bill #${finalOrder.orderNumber}`,
        finalOrder.orderNumber
      );
    }

    setCompletedOrder(finalOrder);
    setPosItems([]);
  };

  // Instant UPI String
  const upiPayLink = `upi://pay?pa=${activeShop.upiId || 'seikhsarif16@oksbi'}&pn=${encodeURIComponent(activeShop.shopName)}&am=${totalPayable}&cu=INR&tn=POS_BILL`;
  const upiQrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=8&data=${encodeURIComponent(upiPayLink)}`;

  const [isSavingPdf, setIsSavingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  const printBillReceipt = (order: Order) => {
    printThermalReceipt(order, activeShop);
  };

  const handleSavePdf = async (order: Order) => {
    setIsSavingPdf(true);
    try {
      await downloadInvoicePDF(order, activeShop, 'printable-receipt-content');
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (err) {
      console.error('POS PDF download error:', err);
      printInvoiceDocument(order, activeShop);
    } finally {
      setIsSavingPdf(false);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* 1. Header & Scanner Input */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            POS Terminal & Fast Billing
          </h2>
          <p className="text-xs text-slate-500">
            Instant counter billing, Barcode scanning, UPI QR generator & Printable Thermal Invoices.
          </p>
        </div>

        {/* Barcode Quick Scan Bar */}
        <form onSubmit={handleBarcodeScan} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              ref={barcodeInputRef}
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Scan Barcode / SKU..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-mono shadow-2xs"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            Add SKU
          </button>
        </form>
      </div>

      {/* 2. Main POS Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left 7 Cols: Catalog Items Picker */}
        <div className="lg:col-span-7 space-y-3">
          
          {/* Search & Category Filter */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog items..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[520px] overflow-y-auto pr-1">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                id={`pos-item-${product.id}`}
                onClick={() => addItemToBill(product)}
                className="p-2.5 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-500 hover:shadow-xs text-left transition flex flex-col justify-between group active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&auto=format&fit=crop&q=80'}
                    alt={product.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-slate-900 truncate">{product.name}</div>
                    <div className="text-[10px] text-slate-400">{product.category}</div>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-black text-xs text-slate-900">₹{product.sellingPrice}</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                    Stock: {product.stockQuantity}
                  </span>
                </div>
              </button>
            ))}
          </div>

        </div>

        {/* Right 5 Cols: Active Bill & Checkout Register */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-2xs flex flex-col overflow-hidden">
          
          {/* Bill Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                {posItems.length}
              </div>
              <span className="font-bold text-slate-900 text-sm">Active Counter Bill</span>
            </div>
            {posItems.length > 0 && (
              <button
                onClick={clearBill}
                className="text-xs text-rose-600 hover:underline font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Customer Details */}
          <div className="p-3 bg-slate-50/60 border-b border-slate-100 grid grid-cols-2 gap-2">
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer Name"
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
            />
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Phone (Optional)"
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Items in Bill */}
          <div className="p-4 flex-1 overflow-y-auto max-h-56 space-y-2 divide-y divide-slate-100">
            {posItems.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                <p className="text-xs font-semibold text-slate-600">No items on bill</p>
                <p className="text-[11px] text-slate-400">Click products or scan barcode to add</p>
              </div>
            ) : (
              posItems.map(item => (
                <div key={item.product.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                  <div className="flex-1 pr-2">
                    <div className="font-bold text-slate-900 truncate">{item.product.name}</div>
                    <div className="text-[10px] text-slate-500">₹{item.product.sellingPrice} × {item.quantity} {item.product.unit}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-100 rounded-l"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 font-bold text-xs">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-100 rounded-r"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="font-black text-slate-900 w-14 text-right">
                      ₹{item.product.sellingPrice * item.quantity}
                    </div>

                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-slate-300 hover:text-rose-500 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Select Payment Mode
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaymentMode('cash')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
                    paymentMode === 'cash'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('upi')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
                    paymentMode === 'upi'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>UPI QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('khata_credit')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
                    paymentMode === 'khata_credit'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Khata Udhaar</span>
                </button>
              </div>
            </div>

            {/* If Khata Credit selected, pick Customer */}
            {paymentMode === 'khata_credit' && (
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                <label className="block font-bold text-amber-900 mb-1">Select Khata Customer Ledger *</label>
                <select
                  value={selectedKhataCustomerId}
                  onChange={(e) => setSelectedKhataCustomerId(e.target.value)}
                  className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-semibold focus:outline-none"
                >
                  <option value="">-- Choose Registered Customer --</option>
                  {khataCustomers.map(cust => (
                    <option key={cust.id} value={cust.id}>
                      {cust.name} ({cust.phone}) • Balance Due: ₹{cust.currentBalance}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* UPI QR Display Preview if UPI chosen */}
            {paymentMode === 'upi' && totalPayable > 0 && (
              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-center shadow-xs">
                {activeShop.paymentQrUrl && (
                  <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs w-full mb-1">
                    <button
                      type="button"
                      onClick={() => setQrDisplayMode('dynamic')}
                      className={`flex-1 py-1 px-2 rounded-lg font-bold transition text-[10px] ${
                        qrDisplayMode === 'dynamic'
                          ? 'bg-white text-emerald-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Dynamic Amount QR
                    </button>
                    <button
                      type="button"
                      onClick={() => setQrDisplayMode('custom')}
                      className={`flex-1 py-1 px-2 rounded-lg font-bold transition text-[10px] ${
                        qrDisplayMode === 'custom'
                          ? 'bg-white text-emerald-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Shop Standee QR
                    </button>
                  </div>
                )}
                <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <img
                    src={qrDisplayMode === 'custom' && activeShop.paymentQrUrl ? activeShop.paymentQrUrl : upiQrImageUrl}
                    alt="UPI QR Code"
                    className="w-36 h-36 object-contain rounded-lg"
                  />
                </div>
                <div className="text-xs">
                  <div className="font-extrabold text-slate-900 text-sm">Scan & Pay ₹{totalPayable}</div>
                  <div className="text-[11px] font-mono font-semibold text-slate-600">UPI: {activeShop.upiId || 'seikhsarif16@oksbi'}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Google Pay • PhonePe • Paytm • BHIM</div>
                </div>
              </div>
            )}

            {/* Bill Summary Calculation */}
            <div className="space-y-1.5 text-xs pt-2 border-t border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({posItems.length} items)</span>
                <span className="font-semibold text-slate-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Special Discount (₹)</span>
                <input
                  type="number"
                  min={0}
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                  className="w-20 px-2 py-0.5 text-right bg-white border border-slate-200 rounded-md text-xs font-bold text-emerald-700"
                />
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Total Payable</span>
                <span className="text-emerald-700 text-base">₹{totalPayable}</span>
              </div>
            </div>

            {/* Checkout Trigger */}
            <button
              id="pos-complete-bill-btn"
              onClick={handleCheckoutBill}
              disabled={posItems.length === 0}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              Complete POS Sale & Print Bill
            </button>
          </div>

        </div>

      </div>

      {/* 3. PRINTABLE INVOICE / RECEIPT MODAL */}
      {completedOrder && (
        <div id="receipt-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div id="receipt-dialog" className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-300" />
                <span className="font-bold text-xs">Printable Bill Receipt</span>
              </div>
              <button
                onClick={() => setCompletedOrder(null)}
                className="text-xs text-emerald-300 hover:text-white font-semibold"
              >
                Done
              </button>
            </div>

            {/* Printable Thermal Receipt Container */}
            <div id="printable-receipt-content" className="p-6 text-xs text-slate-800 font-mono space-y-3 bg-white">
              <div className="text-center border-b border-dashed border-slate-300 pb-3">
                <h3 className="text-base font-black text-slate-900">{activeShop.shopName}</h3>
                <p className="text-[10px] text-slate-500">{activeShop.address || activeShop.city}</p>
                <p className="text-[10px] text-slate-500">Phone: {activeShop.phone}</p>
                <div className="mt-2 text-[10px] font-bold bg-slate-100 py-1 rounded">
                  TAX INVOICE / CASH BILL: #{completedOrder.orderNumber}
                </div>
                <div className="text-[9px] text-slate-400 mt-1">
                  Date: {new Date(completedOrder.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="text-[11px] space-y-0.5 border-b border-dashed border-slate-300 pb-2">
                <div>Customer: <strong>{completedOrder.customerName}</strong></div>
                {completedOrder.customerPhone && <div>Phone: {completedOrder.customerPhone}</div>}
                <div>Payment Mode: <strong className="uppercase">{completedOrder.paymentMethod}</strong></div>
              </div>

              {/* Items List */}
              <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3">
                <div className="flex justify-between font-bold text-[10px] uppercase text-slate-500">
                  <span>Item</span>
                  <span>Qty × Rate</span>
                  <span>Amt</span>
                </div>
                {completedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-[150px]">{item.name}</span>
                    <span>{item.quantity} × ₹{item.price}</span>
                    <span className="font-bold">₹{item.total}</span>
                  </div>
                ))}
              </div>

              {/* Total Calculation */}
              <div className="space-y-1 text-right text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{completedOrder.subtotal}</span>
                </div>
                {completedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span>-₹{completedOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black pt-1 border-t border-slate-300">
                  <span>NET PAYABLE:</span>
                  <span>₹{completedOrder.totalAmount}</span>
                </div>
              </div>

              <div className="text-center pt-3 text-[10px] text-slate-400">
                <p>Thank you for shopping with us!</p>
                <p className="text-[9px]">Powered by KGN SHOP SaaS</p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-wrap gap-2 items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="print-receipt-btn"
                  onClick={() => printBillReceipt(completedOrder)}
                  className="py-2.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>

                <button
                  type="button"
                  id="save-pos-pdf-btn"
                  disabled={isSavingPdf}
                  onClick={() => handleSavePdf(completedOrder)}
                  className="py-2.5 px-3.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  {isSavingPdf ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                      <span>Saving...</span>
                    </>
                  ) : pdfSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Save PDF</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                {completedOrder.customerPhone && (
                  <button
                    type="button"
                    onClick={() => {
                      const phone = completedOrder.customerPhone.replace(/[^0-9]/g, '');
                      const text = encodeURIComponent(
                        `*RECEIPT - ${activeShop.shopName}*\n` +
                        `Bill: #${completedOrder.orderNumber}\n` +
                        `Customer: ${completedOrder.customerName}\n` +
                        `Amount Paid: ₹${completedOrder.totalAmount}\n` +
                        `Payment: ${completedOrder.paymentMethod.toUpperCase()}\n\n` +
                        `Thank you for shopping with us!`
                      );
                      window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
                    }}
                    className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setCompletedOrder(null)}
                  className="px-3.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition"
                >
                  New Bill
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
