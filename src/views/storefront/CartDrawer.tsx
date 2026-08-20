import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  QrCode, 
  MessageSquare, 
  CheckCircle, 
  Phone, 
  MapPin, 
  User, 
  CreditCard,
  Truck,
  Building2,
  Sparkles,
  Download,
  Printer,
  Loader2,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { Order } from '../../types';
import { downloadInvoicePDF, printInvoiceDocument } from '../../lib/invoicePdfGenerator';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateCartQuantity, clearCart, cartTotal, activeShop, createOrder } = useShop();
  
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'cash' | 'khata_credit'>('upi');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [qrDisplayMode, setQrDisplayMode] = useState<'dynamic' | 'custom'>('dynamic');

  const handleCopyUpi = () => {
    const vpa = activeShop.upiId || 'seikhsarif16@oksbi';
    navigator.clipboard.writeText(vpa);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleDownloadOrderPdf = async (order: Order) => {
    setIsDownloadingPdf(true);
    try {
      await downloadInvoicePDF(order, activeShop);
    } catch (err) {
      console.error('Invoice PDF error:', err);
      printInvoiceDocument(order, activeShop);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (!isOpen) return null;

  const FREE_DELIVERY_THRESHOLD = 499;
  const STANDARD_DELIVERY_FEE = 30;
  const isFreeDelivery = cartTotal >= FREE_DELIVERY_THRESHOLD;
  const amountNeededForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - cartTotal);
  const deliveryFee = deliveryType === 'delivery' ? (isFreeDelivery ? 0 : STANDARD_DELIVERY_FEE) : 0;
  const discount = 0;
  const finalTotal = Math.max(0, cartTotal - discount + deliveryFee);

  const handleProceedToCheckout = () => {
    if (cart.length === 0) return;
    setStep('checkout');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert('Please provide your name and phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems = cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.sellingPrice,
        quantity: item.quantity,
        unit: item.product.unit,
        imageUrl: item.product.imageUrl,
        total: item.product.sellingPrice * item.quantity
      }));

      const newOrder = await createOrder({
        customerName,
        customerPhone,
        deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : 'Store Self-Pickup',
        deliveryType,
        deliveryFee,
        items: orderItems,
        subtotal: cartTotal,
        discount,
        totalAmount: finalTotal,
        paymentMethod,
        paymentStatus: paymentMethod === 'upi' ? 'paid' : (paymentMethod === 'cod' ? 'pending' : 'paid'),
        orderStatus: 'new',
        notes
      });

      setPlacedOrder(newOrder);
      setStep('success');
    } catch (err) {
      console.error('Order creation failed:', err);
      alert('Could not place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp Order Link Generator
  const sendWhatsAppOrder = (order: Order) => {
    const waNumber = activeShop.whatsappNumber || activeShop.phone.replace(/[^0-9]/g, '');
    const itemsList = order.items.map((i, idx) => `${idx + 1}. ${i.name} (${i.quantity} ${i.unit}) - ₹${i.total}`).join('\n');
    const feeText = order.deliveryType === 'delivery'
      ? (order.deliveryFee && order.deliveryFee > 0 ? `₹${order.deliveryFee}` : 'FREE (Order ₹499+)')
      : 'FREE (Store Pickup)';
    
    const message = encodeURIComponent(
      `*🛒 NEW ORDER #${order.orderNumber} - ${activeShop.shopName}*\n\n` +
      `*Customer:* ${order.customerName} (${order.customerPhone})\n` +
      `*Delivery Type:* ${order.deliveryType.toUpperCase()}\n` +
      `*Address:* ${order.deliveryAddress || 'N/A'}\n\n` +
      `*Items Ordered:*\n${itemsList}\n\n` +
      `*Subtotal:* ₹${order.subtotal}\n` +
      `*Delivery Charge:* ${feeText}\n` +
      `*Total Amount:* ₹${order.totalAmount}\n` +
      `*Payment Mode:* ${order.paymentMethod.toUpperCase()} (${order.paymentStatus})\n` +
      (order.notes ? `*Notes:* ${order.notes}\n\n` : '\n') +
      `_Order placed via KGN SHOP Digital Storefront_`
    );

    window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank');
  };

  // UPI payment QR string (High resolution 360x360 with generous margin)
  const upiVpa = activeShop.upiId || 'seikhsarif16@oksbi';
  const upiPayLink = `upi://pay?pa=${upiVpa}&pn=${encodeURIComponent(activeShop.shopName)}&am=${finalTotal}&cu=INR&tn=Order_${placedOrder ? placedOrder.orderNumber : 'KGN'}`;
  const upiQrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=10&data=${encodeURIComponent(upiPayLink)}`;

  return (
    <div id="cart-drawer-backdrop" className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-0 overflow-hidden">
        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="pointer-events-auto w-screen max-w-md bg-white shadow-2xl flex flex-col">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">
                    {step === 'cart' ? 'Your Shopping Bag' : (step === 'checkout' ? 'Complete Checkout' : 'Order Placed')}
                  </h2>
                  <p className="text-[11px] text-slate-500">{activeShop.shopName}</p>
                </div>
              </div>
              
              <button
                id="close-cart-drawer-btn"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STEP 1: CART ITEMS */}
            {step === 'cart' && (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {/* Free Delivery Target Banner & Progress */}
                  {cart.length > 0 && (
                    <div className={`p-3.5 rounded-2xl border transition ${
                      isFreeDelivery 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-2xs' 
                        : 'bg-blue-50/80 border-blue-200 text-blue-900'
                    }`}>
                      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Truck className={`w-4 h-4 shrink-0 ${isFreeDelivery ? 'text-emerald-600' : 'text-blue-600'}`} />
                          {isFreeDelivery ? (
                            <span className="text-emerald-800">🎉 FREE Delivery Unlocked!</span>
                          ) : (
                            <span>Add <strong className="text-blue-700 font-black">₹{amountNeededForFreeDelivery}</strong> more for FREE Delivery</span>
                          )}
                        </div>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isFreeDelivery ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isFreeDelivery ? '₹0 Fee' : 'Orders <₹499: ₹30'}
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-white/90 rounded-full overflow-hidden border border-slate-200/60">
                        <div 
                          className={`h-full transition-all duration-300 rounded-full ${
                            isFreeDelivery ? 'bg-emerald-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${Math.min(100, Math.round((cartTotal / FREE_DELIVERY_THRESHOLD) * 100))}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-300">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm mb-1">Your bag is empty</h3>
                      <p className="text-xs text-slate-400 max-w-xs mb-4">Add products from the catalog to place an instant order</p>
                      <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
                      >
                        Browse Storefront
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {cart.map((item) => (
                          <div
                            key={item.product.id}
                            id={`cart-item-${item.product.id}`}
                            className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition"
                          >
                            <img
                              src={item.product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&auto=format&fit=crop&q=80'}
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded-xl bg-slate-50 shrink-0 border border-slate-100"
                            />
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-xs text-slate-900 truncate">{item.product.name}</h4>
                              <p className="text-[11px] text-slate-500">
                                ₹{item.product.sellingPrice} / {item.product.unit}
                              </p>
                              <div className="text-xs font-bold text-slate-900 mt-0.5">
                                ₹{item.product.sellingPrice * item.quantity}
                              </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 p-0.5 rounded-lg shadow-2xs">
                              <button
                                onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                                className="w-5 h-5 rounded bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                                className="w-5 h-5 rounded bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="p-1.5 text-slate-300 hover:text-rose-600 transition"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 flex justify-between items-center text-xs text-slate-400">
                        <span>Fulfillment by: {activeShop.address || activeShop.city}</span>
                        <button
                          onClick={clearCart}
                          className="text-rose-600 hover:underline font-medium text-xs"
                        >
                          Clear All
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-3">
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>Items Subtotal</span>
                        <span className="font-semibold text-slate-900">₹{cartTotal}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <span>Delivery Charges</span>
                          <span className="text-[10px] text-slate-400 block">Free on orders above ₹499</span>
                        </div>
                        <span className={`font-bold ${isFreeDelivery ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {isFreeDelivery ? 'FREE (₹0)' : '₹30'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                        <span>Estimated Total</span>
                        <span className="text-slate-900 text-base font-extrabold">₹{cartTotal + (isFreeDelivery ? 0 : 30)}</span>
                      </div>
                    </div>

                    <button
                      id="proceed-checkout-btn"
                      onClick={handleProceedToCheckout}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                    >
                      Proceed to Delivery & Payment
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}

            {/* STEP 2: CHECKOUT FORM */}
            {step === 'checkout' && (
              <form onSubmit={handlePlaceOrder} className="flex-1 flex flex-col justify-between overflow-y-auto">
                <div className="p-6 space-y-4 flex-1">
                  
                  {/* Fulfillment Mode */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Fulfillment Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryType('delivery')}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
                          deliveryType === 'delivery'
                            ? 'bg-slate-900 border-slate-900 text-white font-semibold shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Truck className={`w-4 h-4 shrink-0 ${deliveryType === 'delivery' ? 'text-white' : 'text-slate-600'}`} />
                          <div>
                            <div className="text-xs">Home Delivery</div>
                            <div className={`text-[10px] ${deliveryType === 'delivery' ? 'text-slate-300' : 'text-slate-400'}`}>To doorstep</div>
                          </div>
                        </div>
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                          isFreeDelivery 
                            ? 'bg-emerald-500 text-white' 
                            : (deliveryType === 'delivery' ? 'bg-slate-800 text-amber-300' : 'bg-slate-100 text-slate-700')
                        }`}>
                          {isFreeDelivery ? 'FREE' : '+₹30'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryType('pickup')}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
                          deliveryType === 'pickup'
                            ? 'bg-slate-900 border-slate-900 text-white font-semibold shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className={`w-4 h-4 shrink-0 ${deliveryType === 'pickup' ? 'text-white' : 'text-slate-600'}`} />
                          <div>
                            <div className="text-xs">Store Pickup</div>
                            <div className={`text-[10px] ${deliveryType === 'pickup' ? 'text-slate-300' : 'text-slate-400'}`}>At counter</div>
                          </div>
                        </div>
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                          deliveryType === 'pickup' ? 'bg-slate-800 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          FREE
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Bill Summary Breakdown */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Items Subtotal ({cart.length} items)</span>
                      <span className="font-semibold text-slate-900">₹{cartTotal}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <div>
                        <span>Delivery Fee</span>
                        {deliveryType === 'delivery' && (
                          <span className="text-[10px] text-slate-400 block">
                            {isFreeDelivery ? '🎉 ₹499+ Order Benefit' : 'Free on orders above ₹499'}
                          </span>
                        )}
                      </div>
                      <span className={`font-bold ${deliveryFee === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {deliveryType === 'delivery' 
                          ? (isFreeDelivery ? 'FREE (₹0)' : '₹30') 
                          : 'FREE (Store Pickup)'}
                      </span>
                    </div>
                    <div className="flex justify-between font-black text-slate-900 pt-2 border-t border-slate-200 text-sm">
                      <span>Total Payable</span>
                      <span className="text-slate-900 text-base">₹{finalTotal}</span>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name *</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="e.g. Salim Merchant"
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile / WhatsApp Number *</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    {deliveryType === 'delivery' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Complete Delivery Address *</label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <textarea
                            required
                            rows={2}
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            placeholder="Flat/House No., Street, Landmark, Area"
                            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-900 focus:outline-none resize-none"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Order Notes (Optional)</label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Call before delivery"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Payment Mode */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Payment Mode
                    </label>
                    <div className="space-y-2">
                      <label
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                          paymentMethod === 'upi'
                            ? 'bg-blue-50 border-blue-200 text-blue-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === 'upi'}
                            onChange={() => setPaymentMethod('upi')}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex items-center gap-1.5">
                            <QrCode className="w-4 h-4 text-blue-600" />
                            <span className="text-xs">Instant UPI QR Payment</span>
                          </div>
                        </div>
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">Fastest</span>
                      </label>

                      <label
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                          paymentMethod === 'cod'
                            ? 'bg-slate-50 border-slate-300 text-slate-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === 'cod'}
                            onChange={() => setPaymentMethod('cod')}
                            className="text-slate-900 focus:ring-slate-900"
                          />
                          <div className="flex items-center gap-1.5">
                            <Truck className="w-4 h-4 text-slate-600" />
                            <span className="text-xs">Cash on Delivery (COD)</span>
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Prominent Large UPI QR & Instant Payment Card */}
                    {paymentMethod === 'upi' && (
                      <div className="mt-4 p-4 sm:p-5 bg-white border-2 border-blue-500/30 rounded-2xl shadow-sm space-y-3.5 animate-in fade-in zoom-in-95 duration-200">
                        {/* Header with Amount and App Badges */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div>
                            <span className="text-[10px] uppercase font-extrabold tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                              Instant UPI Payment
                            </span>
                            <div className="text-xs font-bold text-slate-800 mt-1">
                              Pay to: <span className="text-slate-900 font-extrabold">{activeShop.shopName}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 font-medium block">Total Payable</span>
                            <span className="text-base sm:text-lg font-black text-slate-900">₹{finalTotal}</span>
                          </div>
                        </div>

                        {/* QR Mode Switcher if Merchant has uploaded their own QR Standee/Sticker */}
                        {activeShop.paymentQrUrl && (
                          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                            <button
                              type="button"
                              onClick={() => setQrDisplayMode('dynamic')}
                              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition text-[11px] ${
                                qrDisplayMode === 'dynamic'
                                  ? 'bg-white text-blue-900 shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Auto-Amount QR (₹{finalTotal})
                            </button>
                            <button
                              type="button"
                              onClick={() => setQrDisplayMode('custom')}
                              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition text-[11px] ${
                                qrDisplayMode === 'custom'
                                  ? 'bg-white text-blue-900 shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Shop Standee QR
                            </button>
                          </div>
                        )}

                        {/* Large High-Contrast QR Code Card */}
                        <div className="flex flex-col items-center justify-center p-3 bg-slate-50/80 border border-slate-200 rounded-2xl">
                          <div className="relative p-2.5 bg-white rounded-2xl shadow-xs border border-slate-200">
                            <img
                              src={qrDisplayMode === 'custom' && activeShop.paymentQrUrl ? activeShop.paymentQrUrl : upiQrImageUrl}
                              alt="Instant UPI QR Code"
                              className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl"
                            />
                            {/* Visual Scan Center Overlay / Accent */}
                            <div className="absolute inset-x-0 bottom-3 flex justify-center">
                              <span className="bg-slate-900/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1">
                                <QrCode className="w-3 h-3 text-blue-400" />
                                Scan to Pay ₹{finalTotal}
                              </span>
                            </div>
                          </div>

                          <p className="text-[11px] font-semibold text-slate-600 mt-2.5 text-center">
                            Scan with <span className="text-slate-900 font-bold">Google Pay</span>, <span className="text-slate-900 font-bold">PhonePe</span>, <span className="text-slate-900 font-bold">Paytm</span> or <span className="text-slate-900 font-bold">BHIM</span>
                          </p>
                        </div>

                        {/* Quick UPI ID Copy Field */}
                        <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Merchant UPI ID / VPA</div>
                            <div className="font-mono text-xs font-bold text-slate-900 truncate select-all">{upiVpa}</div>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                              copiedUpi
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
                            }`}
                          >
                            {copiedUpi ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy ID</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Direct Pay via UPI App (Single Mobile Device Action) */}
                        <a
                          id="direct-open-upi-btn"
                          href={upiPayLink}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Tap to Open UPI App (GPay / PhonePe / Paytm)</span>
                        </a>
                      </div>
                    )}
                  </div>

                </div>

                {/* Footer Buttons */}
                <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('cart')}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
                  >
                    Back
                  </button>

                  <button
                    id="submit-place-order-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Placing Order...' : `Confirm Order (₹${finalTotal})`}
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: ORDER SUCCESS */}
            {step === 'success' && placedOrder && (
              <div className="flex-1 flex flex-col justify-between p-6 overflow-y-auto">
                <div className="text-center my-auto space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                    <CheckCircle className="w-8 h-8" />
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                      Order Confirmed
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">
                      Thank you, {placedOrder.customerName}!
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Your order <span className="font-mono font-bold text-slate-800">#{placedOrder.orderNumber}</span> has been dispatched to {activeShop.shopName}.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Items Subtotal</span>
                      <span className="font-semibold text-slate-900">₹{placedOrder.subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Delivery Fee</span>
                      <span className={`font-semibold ${(placedOrder.deliveryFee && placedOrder.deliveryFee > 0) ? 'text-slate-900' : 'text-emerald-600'}`}>
                        {(placedOrder.deliveryFee && placedOrder.deliveryFee > 0) ? `₹${placedOrder.deliveryFee}` : 'FREE (₹0)'}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200">
                      <span className="text-slate-700 font-bold">Total Amount</span>
                      <span className="font-extrabold text-slate-900 text-sm">₹{placedOrder.totalAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payment Status</span>
                      <span className="font-bold text-emerald-600 uppercase text-[11px]">{placedOrder.paymentStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Fulfillment</span>
                      <span className="font-medium text-slate-800 capitalize">{placedOrder.deliveryType === 'delivery' ? 'Home Delivery' : 'Store Pickup'}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      id="whatsapp-order-confirm-btn"
                      onClick={() => sendWhatsAppOrder(placedOrder)}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Send Order Details on WhatsApp
                    </button>

                    <button
                      type="button"
                      id="download-order-pdf-btn"
                      disabled={isDownloadingPdf}
                      onClick={() => handleDownloadOrderPdf(placedOrder)}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 border border-slate-200"
                    >
                      {isDownloadingPdf ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                          <span>Preparing PDF Bill...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 text-slate-600" />
                          <span>Download Tax Invoice (PDF)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setStep('cart');
                      onClose();
                    }}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
