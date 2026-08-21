import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  ShoppingBag, 
  Clock, 
  Package, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Download, 
  Printer, 
  MessageSquare, 
  Store, 
  Phone, 
  MapPin, 
  ChevronRight,
  ReceiptText,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Order } from '../../types';
import { downloadInvoicePDF, printInvoiceDocument } from '../../lib/invoicePdfGenerator';

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueShopping?: () => void;
}

export const MyOrdersModal: React.FC<MyOrdersModalProps> = ({
  isOpen,
  onClose,
  onContinueShopping
}) => {
  const { orders, activeShop } = useShop();
  const { profile } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  if (!isOpen) return null;

  // Filter orders matching current active shop or search filter
  const currentShopOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const getStatusBadge = (status: Order['orderStatus']) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3" />
            <span>Order Placed</span>
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Order Accepted</span>
          </span>
        );
      case 'preparing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Package className="w-3 h-3" />
            <span>Preparing Items</span>
          </span>
        );
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Truck className="w-3 h-3" />
            <span>Out for Delivery / Ready</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return null;
    }
  };

  const handleDownloadPdf = async (order: Order) => {
    setIsDownloadingPdf(true);
    try {
      await downloadInvoicePDF(order, activeShop);
    } catch (err) {
      console.error('Download invoice failed:', err);
      printInvoiceDocument(order, activeShop);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const openWhatsAppHelp = (order: Order) => {
    const waNumber = activeShop.whatsappNumber || activeShop.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello ${activeShop.shopName}, I have a query regarding my order #${order.orderNumber} (Amount: ₹${order.totalAmount}).`
    );
    window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank');
  };

  return (
    <div id="my-orders-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150">
      <div id="my-orders-dialog" className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>My Orders</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {currentShopOrders.length} {currentShopOrders.length === 1 ? 'Order' : 'Orders'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Track live order status, download invoice receipts, and contact {activeShop.shopName}
              </p>
            </div>
          </div>

          <button
            id="close-my-orders-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              id="my-orders-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, Item name, or Mobile number..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 transition shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Orders Content / List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {currentShopOrders.length === 0 ? (
            <div className="py-16 text-center max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400 mb-4 shadow-2xs">
                <ReceiptText className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Orders Found</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {searchQuery 
                  ? 'No past orders matched your search query. Try clearing the filter.' 
                  : `You haven't placed any orders with ${activeShop.shopName} yet. Add items to your bag and checkout!`}
              </p>
              {onContinueShopping && (
                <button
                  onClick={() => {
                    onClose();
                    onContinueShopping();
                  }}
                  className="mt-5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  Start Shopping Now
                </button>
              )}
            </div>
          ) : (
            currentShopOrders.map((order) => (
              <div
                key={order.id}
                id={`order-card-${order.id}`}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition shadow-2xs p-4 sm:p-5 space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-black text-xs">
                      #{order.orderNumber.replace(/[^0-9]/g, '').slice(-3) || 'ORD'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 font-mono">#{order.orderNumber}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          • {order.deliveryType === 'delivery' ? 'Home Delivery' : 'Counter Pickup'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {getStatusBadge(order.orderStatus)}
                  </div>
                </div>

                {/* Items Summary */}
                <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {item.quantity}x
                          </span>
                          <span className="font-medium text-slate-800 truncate">{item.name}</span>
                          <span className="text-[10px] text-slate-400">({item.unit})</span>
                        </div>
                        <span className="font-semibold text-slate-900 shrink-0">₹{item.total}</span>
                      </div>
                    ))}
                  </div>

                  {/* Summary math */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <div className="text-[11px] text-slate-500">
                      Payment Mode: <strong className="uppercase text-slate-700">{order.paymentMethod}</strong> ({order.paymentStatus})
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 mr-2 text-[11px]">Total:</span>
                      <span className="text-sm font-extrabold text-slate-900">₹{order.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                {order.deliveryType === 'delivery' && order.deliveryAddress && (
                  <div className="text-xs text-slate-600 flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="truncate"><strong>Delivery to:</strong> {order.deliveryAddress}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleDownloadPdf(order)}
                    disabled={isDownloadingPdf}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Download Invoice</span>
                  </button>

                  <button
                    onClick={() => printInvoiceDocument(order, activeShop)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Print</span>
                  </button>

                  <button
                    onClick={() => openWhatsAppHelp(order)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-2xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Order Help (WhatsApp)</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Store className="w-3.5 h-3.5 text-slate-400" />
            <span>Store: <strong>{activeShop.shopName}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
