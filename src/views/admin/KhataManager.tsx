import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { 
  Users, 
  Plus, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  MessageSquare, 
  Phone, 
  UserPlus, 
  X, 
  Clock, 
  Receipt,
  FileText,
  AlertCircle
} from 'lucide-react';
import { KhataCustomer, KhataTransaction } from '../../types';
import { FeatureLockPaywall } from '../../components/common/FeatureLockPaywall';

export const KhataManager: React.FC = () => {
  const { 
    khataCustomers, 
    khataTransactions, 
    addKhataCustomer, 
    addKhataTransaction, 
    activeShop,
    canAccess 
  } = useShop();

  const hasKhataAccess = canAccess('khata');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    khataCustomers[0]?.id || null
  );

  // Modals
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [txType, setTxType] = useState<'credit_given' | 'payment_received'>('credit_given');

  // Customer Form
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustLimit, setNewCustLimit] = useState<number | ''>(5000);

  // Transaction Form
  const [txAmount, setTxAmount] = useState<number | ''>('');
  const [txNotes, setTxNotes] = useState('');
  const [txBillNumber, setTxBillNumber] = useState('');

  if (!hasKhataAccess) {
    return (
      <FeatureLockPaywall
        featureName="Digital Khata (Udhaar Credit Ledger) & WhatsApp Reminders"
        featureDescription="Track customer debts, send automated WhatsApp payment reminders with dynamic UPI links, generate PDF account statements, and manage credit limits with the Pro Business plan (₹499/mo)."
        requiredTier="pro"
        icon={Users}
      />
    );
  }

  const selectedCustomer = khataCustomers.find(c => c.id === selectedCustomerId) || khataCustomers[0];

  const filteredCustomers = khataCustomers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  // Ledger transactions for selected customer
  const customerTransactions = khataTransactions.filter(t => t.customerId === selectedCustomer?.id);

  // Overall totals
  const totalReceivable = khataCustomers
    .filter(c => c.currentBalance > 0)
    .reduce((sum, c) => sum + c.currentBalance, 0);

  const totalAdvance = khataCustomers
    .filter(c => c.currentBalance < 0)
    .reduce((sum, c) => sum + Math.abs(c.currentBalance), 0);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) {
      alert('Please enter name and phone number');
      return;
    }

    await addKhataCustomer({
      name: newCustName,
      phone: newCustPhone,
      address: newCustAddress,
      creditLimit: Number(newCustLimit) || 5000
    });

    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    setIsAddCustomerModalOpen(false);
  };

  const handleRecordTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !txAmount || Number(txAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    await addKhataTransaction(
      selectedCustomer.id,
      txType,
      Number(txAmount),
      txNotes,
      txBillNumber
    );

    setTxAmount('');
    setTxNotes('');
    setTxBillNumber('');
    setIsTransactionModalOpen(false);
  };

  const sendWhatsAppReminder = (customer: KhataCustomer) => {
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    const upiLink = `upi://pay?pa=${activeShop.upiId || 'kgnshop@oksbi'}&pn=${encodeURIComponent(activeShop.shopName)}&am=${customer.currentBalance}&cu=INR`;
    
    const text = encodeURIComponent(
      `Dear *${customer.name}*,\n\n` +
      `Your total outstanding balance with *${activeShop.shopName}* is *₹${customer.currentBalance}*.\n\n` +
      `You can pay directly via UPI: ${activeShop.upiId || 'kgnshop@oksbi'}\n\n` +
      `For queries, call us at ${activeShop.phone}.\n` +
      `_Sent via KGN Digital Khata Ledger_`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Summary Cards */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Digital Khata & Customer Udhaar Ledger
          </h2>
          <p className="text-xs text-slate-500">
            Maintain customer debit/credit history, record payments, and send instant WhatsApp reminders.
          </p>
        </div>

        <button
          id="add-khata-customer-btn"
          onClick={() => setIsAddCustomerModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add Khata Customer
        </button>
      </div>

      {/* Balance Summary Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">You Will Receive (Udhaar Due)</span>
          <div className="text-2xl font-black text-rose-600 mt-1">₹{totalReceivable.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Total credit balance owed by customers</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">You Will Give (Advance Jama)</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">₹{totalAdvance.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Advance customer deposits</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Active Khata Accounts</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{khataCustomers.length}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Strictly isolated to {activeShop.shopName}</p>
        </div>
      </div>

      {/* 2. Main Khata Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left 4 Cols: Customers List */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-slate-100 bg-slate-50 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer name or phone..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No Khata customers found.
              </div>
            ) : (
              filteredCustomers.map(cust => {
                const isSelected = selectedCustomer?.id === cust.id;
                return (
                  <button
                    key={cust.id}
                    id={`khata-cust-${cust.id}`}
                    onClick={() => setSelectedCustomerId(cust.id)}
                    className={`w-full text-left p-3.5 transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50/80 border-l-4 border-emerald-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-xs text-slate-900 truncate">{cust.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{cust.phone}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`font-black text-xs ${
                        cust.currentBalance > 0
                          ? 'text-rose-600'
                          : (cust.currentBalance < 0 ? 'text-emerald-600' : 'text-slate-500')
                      }`}>
                        ₹{Math.abs(cust.currentBalance)}
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">
                        {cust.currentBalance > 0 ? 'Due' : (cust.currentBalance < 0 ? 'Advance' : 'Settled')}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right 7 Cols: Selected Customer Ledger Details & Transactions */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-2xs flex flex-col overflow-hidden">
          {selectedCustomer ? (
            <>
              {/* Customer Banner Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 text-base">{selectedCustomer.name}</h3>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                      Limit: ₹{selectedCustomer.creditLimit || 5000}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedCustomer.phone} • {selectedCustomer.address || 'Local Customer'}</p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedCustomer.currentBalance > 0 && (
                    <button
                      id="whatsapp-reminder-btn"
                      onClick={() => sendWhatsAppReminder(selectedCustomer)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Send WhatsApp Reminder
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons: Give Credit vs Receive Payment */}
              <div className="p-4 bg-slate-100/60 border-b border-slate-200 grid grid-cols-2 gap-3">
                <button
                  id="btn-give-credit"
                  onClick={() => {
                    setTxType('credit_given');
                    setIsTransactionModalOpen(true);
                  }}
                  className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Give Credit (Udhaar Diya)
                </button>

                <button
                  id="btn-receive-payment"
                  onClick={() => {
                    setTxType('payment_received');
                    setIsTransactionModalOpen(true);
                  }}
                  className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  Receive Payment (Jama Mila)
                </button>
              </div>

              {/* Transactions History Table */}
              <div className="p-4 flex-1 overflow-y-auto max-h-[380px]">
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                  Transaction Entries
                </div>

                {customerTransactions.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                    No recent transactions recorded for this customer yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customerTransactions.map(tx => (
                      <div
                        key={tx.id}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                            tx.type === 'credit_given'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {tx.type === 'credit_given' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">
                              {tx.type === 'credit_given' ? 'Credit Given (Udhaar)' : 'Payment Received (Jama)'}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {new Date(tx.date).toLocaleString()} {tx.billNumber ? `• Bill #${tx.billNumber}` : ''}
                            </div>
                            {tx.notes && <div className="text-[11px] text-slate-600 mt-0.5">{tx.notes}</div>}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`font-black text-sm ${
                            tx.type === 'credit_given' ? 'text-rose-600' : 'text-emerald-600'
                          }`}>
                            {tx.type === 'credit_given' ? '+' : '-'}₹{tx.amount}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            Bal: ₹{tx.balanceAfter}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Current Net Balance Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Net Customer Ledger Balance</span>
                <span className={`text-base font-black ${
                  selectedCustomer.currentBalance > 0
                    ? 'text-rose-600'
                    : (selectedCustomer.currentBalance < 0 ? 'text-emerald-600' : 'text-slate-800')
                }`}>
                  ₹{selectedCustomer.currentBalance} {selectedCustomer.currentBalance > 0 ? '(Due)' : ''}
                </span>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400">
              Select a customer to view transaction history.
            </div>
          )}
        </div>

      </div>

      {/* 3. ADD NEW CUSTOMER MODAL */}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-xs">Add New Khata Customer</span>
              <button onClick={() => setIsAddCustomerModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Mohammad Aslam"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Number (WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address / Locality</label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="Flat 102, Green Avenue"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Credit Limit (₹)</label>
                <input
                  type="number"
                  value={newCustLimit}
                  onChange={(e) => setNewCustLimit(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="5000"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs"
                >
                  Create Khata Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. RECORD TRANSACTION MODAL */}
      {isTransactionModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
            <div className={`p-4 text-white flex items-center justify-between ${
              txType === 'credit_given' ? 'bg-rose-900' : 'bg-emerald-900'
            }`}>
              <div>
                <div className="font-bold text-xs">
                  {txType === 'credit_given' ? 'Give Credit (Udhaar Diya)' : 'Receive Payment (Jama Mila)'}
                </div>
                <div className="text-[10px] text-white/80">{selectedCustomer.name}</div>
              </div>
              <button onClick={() => setIsTransactionModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordTransaction} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transaction Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="500"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bill / Invoice Number (Optional)</label>
                <input
                  type="text"
                  value={txBillNumber}
                  onChange={(e) => setTxBillNumber(e.target.value)}
                  placeholder="e.g. KGN-1002"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item Notes / Details (Optional)</label>
                <input
                  type="text"
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  placeholder="e.g. 5kg Rice and Tea Packet"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTransactionModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white rounded-xl font-bold transition shadow-xs ${
                    txType === 'credit_given' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  Confirm Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
