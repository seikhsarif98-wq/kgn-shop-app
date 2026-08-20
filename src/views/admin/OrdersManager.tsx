import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { 
  Search, 
  ShoppingBag, 
  CheckCircle, 
  Clock, 
  Truck, 
  XCircle, 
  MessageSquare, 
  Printer, 
  Phone, 
  MapPin, 
  ArrowUpRight,
  Filter,
  CreditCard,
  Download,
  Check,
  Share2,
  Loader2
} from 'lucide-react';
import { Order } from '../../types';
import { downloadInvoicePDF, printInvoiceDocument } from '../../lib/invoicePdfGenerator';

export const OrdersManager: React.FC = () => {
  const { orders, updateOrderStatus, activeShop } = useShop();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  const handleDownloadPdf = async (order: Order) => {
    setIsGeneratingPdf(true);
    try {
      await downloadInvoicePDF(order, activeShop, 'tax-invoice-capture-area');
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (err) {
      console.error('PDF download error:', err);
      alert('Could not generate PDF. Trying direct print dialog instead.');
      printInvoiceDocument(order, activeShop);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = (order: Order) => {
    printInvoiceDocument(order, activeShop);
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.customerPhone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const sendWhatsAppUpdate = (order: Order, newStatus: string) => {
    const phone = order.customerPhone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hello *${order.customerName}*,\n\n` +
      `Your order *#${order.orderNumber}* from *${activeShop.shopName}* is now *${newStatus.toUpperCase()}*.\n\n` +
      `*Total Amount:* ₹${order.totalAmount}\n` +
      `*Fulfillment:* ${order.deliveryType.toUpperCase()}\n\n` +
      `Thank you for shopping with ${activeShop.shopName}!`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const statusPills: Array<{ key: string; label: string }> = [
    { key: 'all', label: 'All Orders' },
    { key: 'new', label: 'New' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready', label: 'Ready' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Quick Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Orders & Deliveries Dashboard</h2>
          <p className="text-xs text-slate-500">
            Track online customer orders, counter POS receipts, and dispatch WhatsApp updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            Total Orders: <strong className="text-slate-900">{orders.length}</strong>
          </span>
        </div>
      </div>

      {/* 2. Search and Status Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, customer name, or phone..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pt-1 scrollbar-none">
          {statusPills.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
                statusFilter === tab.key
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <h3 className="font-bold text-slate-700 text-sm">No orders matching filter</h3>
            <p className="text-xs text-slate-400 mt-0.5">When buyers place orders or POS sales occur, they appear here.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              id={`order-card-${order.id}`}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 hover:border-slate-300 transition space-y-4"
            >
              {/* Order Top Meta */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {order.orderNumber.split('-')[1] || 'ORD'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{order.orderNumber}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-medium flex items-center gap-2 mt-0.5">
                      <span>{order.customerName}</span>
                      <span className="text-slate-300">•</span>
                      <a href={`tel:${order.customerPhone}`} className="text-blue-700 hover:underline flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {order.customerPhone}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {/* Status Badge */}
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    order.orderStatus === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : (order.orderStatus === 'new'
                          ? 'bg-blue-100 text-blue-800 animate-pulse'
                          : (order.orderStatus === 'cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'))
                  }`}>
                    {order.orderStatus}
                  </span>

                  {/* Payment status */}
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${
                    order.paymentStatus === 'paid'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {order.paymentStatus} ({order.paymentMethod})
                  </span>
                </div>
              </div>

              {/* Items & Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* Items */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5">
                  <div className="font-bold text-[11px] text-slate-500 uppercase tracking-wider">
                    Ordered Items ({order.items.length})
                  </div>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-slate-800">
                      <span className="truncate pr-2">
                        {item.name} <span className="text-slate-400">× {item.quantity} {item.unit}</span>
                      </span>
                      <span className="font-bold">₹{item.total}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-xs">
                    <span>Total Bill</span>
                    <span className="text-slate-900 text-sm font-black">₹{order.totalAmount}</span>
                  </div>
                </div>

                {/* Delivery & Notes */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-slate-600">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 capitalize">{order.deliveryType} Delivery:</span>
                      <p className="text-slate-500 mt-0.5">{order.deliveryAddress || 'Store Self Pickup'}</p>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="p-2.5 bg-amber-50/70 rounded-xl text-amber-900 border border-amber-100">
                      <strong>Customer Note:</strong> {order.notes}
                    </div>
                  )}
                </div>

              </div>

              {/* Action Controls & WhatsApp Notifications */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                
                <div className="flex items-center gap-1.5">
                  <button
                    id={`notify-whatsapp-${order.id}`}
                    onClick={() => sendWhatsAppUpdate(order, order.orderStatus)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs rounded-xl border border-blue-200 transition flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    Notify via WhatsApp
                  </button>

                  <button
                    onClick={() => setSelectedOrderForInvoice(order)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Invoice
                  </button>
                </div>

                {/* State Progress Switchers */}
                <div className="flex items-center gap-1.5">
                  {order.orderStatus === 'new' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'accepted')}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
                    >
                      Accept Order
                    </button>
                  )}

                  {order.orderStatus === 'accepted' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                    >
                      Mark Ready for Dispatch
                    </button>
                  )}

                  {order.orderStatus === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'completed', 'paid')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Mark Delivered / Complete
                    </button>
                  )}

                  {order.orderStatus !== 'completed' && order.orderStatus !== 'cancelled' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>

              </div>

            </div>
          ))
        )}
      </div>

      {/* Invoice Viewer Modal */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-xs">Tax Invoice: #{selectedOrderForInvoice.orderNumber}</span>
              <button
                onClick={() => setSelectedOrderForInvoice(null)}
                className="text-xs text-slate-400 hover:text-white font-semibold"
              >
                Close
              </button>
            </div>

            <div id="tax-invoice-capture-area" className="p-6 text-xs text-slate-800 space-y-4 bg-white">
              <div className="flex justify-between border-b pb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{activeShop.shopName}</h3>
                  <p className="text-slate-500">{activeShop.address || activeShop.city}</p>
                  <p className="text-slate-500">Phone: {activeShop.phone}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-700">INVOICE</div>
                  <div className="font-mono text-slate-900 font-bold">{selectedOrderForInvoice.orderNumber}</div>
                  <div className="text-[10px] text-slate-400">{new Date(selectedOrderForInvoice.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              <div>
                <div className="text-slate-500 font-semibold mb-1">Billed To:</div>
                <div className="font-bold text-slate-900">{selectedOrderForInvoice.customerName}</div>
                <div className="text-slate-500">{selectedOrderForInvoice.customerPhone}</div>
                <div className="text-slate-500">{selectedOrderForInvoice.deliveryAddress}</div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                    <tr>
                      <th className="p-2">Item</th>
                      <th className="p-2">Qty</th>
                      <th className="p-2 text-right">Price</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {selectedOrderForInvoice.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-medium">{it.name}</td>
                        <td className="p-2">{it.quantity} {it.unit}</td>
                        <td className="p-2 text-right">₹{it.price}</td>
                        <td className="p-2 text-right font-bold">₹{it.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-right text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{selectedOrderForInvoice.subtotal}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-100">
                  <span>Net Amount Paid:</span>
                  <span className="text-slate-900 text-base font-black">₹{selectedOrderForInvoice.totalAmount}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const phone = selectedOrderForInvoice.customerPhone.replace(/[^0-9]/g, '');
                  const text = encodeURIComponent(
                    `*TAX INVOICE - ${activeShop.shopName}*\n` +
                    `Order: #${selectedOrderForInvoice.orderNumber}\n` +
                    `Date: ${new Date(selectedOrderForInvoice.createdAt).toLocaleDateString()}\n` +
                    `Billed to: ${selectedOrderForInvoice.customerName}\n\n` +
                    `*Items:*\n` +
                    selectedOrderForInvoice.items.map(it => `• ${it.name} (${it.quantity} ${it.unit}) - ₹${it.total}`).join('\n') +
                    `\n\n*Net Total Paid:* ₹${selectedOrderForInvoice.totalAmount}\n` +
                    `Thank you for your business!`
                  );
                  window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
                }}
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Bill</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrint(selectedOrderForInvoice)}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Print</span>
                </button>

                <button
                  type="button"
                  id="print-save-pdf-btn"
                  disabled={isGeneratingPdf}
                  onClick={() => handleDownloadPdf(selectedOrderForInvoice)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  {isGeneratingPdf ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                      <span>Saving PDF...</span>
                    </>
                  ) : pdfSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>PDF Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Save / Download PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
