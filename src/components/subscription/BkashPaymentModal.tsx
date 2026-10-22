import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  Crown, 
  PhoneCall, 
  ArrowRight,
  ExternalLink,
  History
} from 'lucide-react';
import { 
  usePaymentStore, 
  PaymentMethod, 
  PaymentPackageId, 
  PRO_PAYMENT_PACKAGES 
} from '../../store/usePaymentStore';
import { useUserStore } from '../../store/useUserStore';
import { cn } from '../../lib/utils';

export const BkashPaymentModal: React.FC = () => {
  const { 
    isBkashModalOpen, 
    closeBkashModal, 
    personalNumber, 
    submitPaymentRequest, 
    paymentRequests 
  } = usePaymentStore();
  const { currentUser, isPremium, premiumExpiresAt } = useUserStore();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('bkash');
  const [selectedPackage, setSelectedPackage] = useState<PaymentPackageId>('1_month');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [activeTab, setActiveTab] = useState<'pay' | 'history'>('pay');

  if (!isBkashModalOpen) return null;

  const currentPkg = PRO_PAYMENT_PACKAGES.find(p => p.id === selectedPackage) || PRO_PAYMENT_PACKAGES[0];

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(personalNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!senderNumber.trim() || senderNumber.trim().length < 11) {
      setFormError('Please enter a valid 11-digit sender phone number (e.g. 017xxxxxxxx)');
      return;
    }

    if (!trxId.trim() || trxId.trim().length < 6) {
      setFormError('Please enter the valid Transaction ID (TrxID) received via SMS');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      submitPaymentRequest({
        userEmail: email.trim() || currentUser?.email || 'guest@nesttube.com',
        userName: name.trim() || currentUser?.name || 'Viewer',
        method: selectedMethod,
        senderNumber: senderNumber.trim(),
        trxId: trxId.trim(),
        packageId: selectedPackage,
      });

      setIsSubmitting(false);
      setSubmitSuccess(true);
      setSenderNumber('');
      setTrxId('');
    }, 600);
  };

  // Filter requests submitted by this user or email
  const userRequests = paymentRequests.filter(
    r => (currentUser?.email && r.userEmail === currentUser.email) || r.userEmail === email
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-600 via-orange-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-md">
              <Crown className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-neutral-900 dark:text-white leading-tight">
                  bKash / Nagad / Rocket PRO Pay
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Instant Verification
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Send Money & submit TrxID for manual Admin PRO activation
              </p>
            </div>
          </div>

          <button
            onClick={closeBkashModal}
            className="p-1.5 hover:bg-neutral-200 dark:hover:bg-white/10 rounded-full text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-900/60 px-5 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('pay')}
            className={cn(
              "px-4 py-2 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5",
              activeTab === 'pay'
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            )}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Purchase Plan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={cn(
              "px-4 py-2 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5",
              activeTab === 'history'
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            )}
          >
            <History className="w-3.5 h-3.5" />
            <span>My Submission Status ({userRequests.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar text-neutral-800 dark:text-neutral-200 text-xs">
          
          {activeTab === 'pay' ? (
            submitSuccess ? (
              <div className="p-6 text-center space-y-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                  <Check className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-emerald-800 dark:text-emerald-300">
                    Payment Request Submitted Successfully!
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 max-w-md mx-auto">
                    আপনার ট্রানজেকশন আইডি (TrxID) অ্যাডমিন রিভিউতে রয়েছে। অ্যাডমিন ভেরিফাই করার সাথে সাথেই আপনার অ্যাকাউন্টে স্বয়ংক্রিয়ভাবে <strong>{currentPkg.name}</strong> সক্রিয় হয়ে যাবে।
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-left max-w-sm mx-auto space-y-1">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Package:</span>
                    <span className="font-bold">{currentPkg.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Amount:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{currentPkg.amountBDT} ৳</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Method:</span>
                    <span className="font-bold uppercase">{selectedMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Status:</span>
                    <span className="font-bold text-amber-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 animate-spin" /> Pending Admin Review
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="px-4 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-white font-semibold hover:bg-neutral-300 cursor-pointer"
                  >
                    Submit Another
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold cursor-pointer"
                  >
                    View Status
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Step 1: Select Plan */}
                <div className="space-y-2">
                  <label className="font-bold text-neutral-900 dark:text-white flex items-center justify-between">
                    <span>১. প্যাকেজ নির্বাচন করুন (Select Plan):</span>
                    <span className="text-[11px] text-amber-500 font-normal">সব প্যাকেজেই ১০০% Ad-Free</span>
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {PRO_PAYMENT_PACKAGES.map((pkg) => {
                      const isSelected = selectedPackage === pkg.id;
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPackage(pkg.id)}
                          className={cn(
                            "relative p-3 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between",
                            isSelected
                              ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30 dark:bg-amber-950/20"
                              : "bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                          )}
                        >
                          {pkg.popular && (
                            <span className="absolute -top-2 right-3 bg-amber-500 text-black text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs">
                              Popular
                            </span>
                          )}
                          <div>
                            <span className="font-bold text-xs block text-neutral-900 dark:text-white">
                              {pkg.nameBn}
                            </span>
                            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                              {pkg.name}
                            </span>
                          </div>
                          <div className="mt-2 pt-1 border-t border-neutral-200 dark:border-white/10 flex items-baseline justify-between">
                            <span className="text-base font-extrabold text-neutral-900 dark:text-white">
                              {pkg.amountBDT} ৳
                            </span>
                            {pkg.savings && (
                              <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                                {pkg.savings}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Payment Method */}
                <div className="space-y-2">
                  <label className="font-bold text-neutral-900 dark:text-white block">
                    ২. পেমেন্ট মাধ্যম নির্বাচন করুন (Payment Method):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {/* bKash */}
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('bkash')}
                      className={cn(
                        "p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer font-bold",
                        selectedMethod === 'bkash'
                          ? "bg-pink-500/10 border-pink-500 text-pink-600 dark:text-pink-400 ring-2 ring-pink-500/30"
                          : "bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700"
                      )}
                    >
                      <span className="text-sm font-black">bKash</span>
                      <span className="text-[10px] opacity-75">বিকাশ পার্সোনাল</span>
                    </button>

                    {/* Nagad */}
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('nagad')}
                      className={cn(
                        "p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer font-bold",
                        selectedMethod === 'nagad'
                          ? "bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400 ring-2 ring-orange-500/30"
                          : "bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700"
                      )}
                    >
                      <span className="text-sm font-black">Nagad</span>
                      <span className="text-[10px] opacity-75">নগদ পার্সোনাল</span>
                    </button>

                    {/* Rocket */}
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('rocket')}
                      className={cn(
                        "p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer font-bold",
                        selectedMethod === 'rocket'
                          ? "bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400 ring-2 ring-purple-500/30"
                          : "bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700"
                      )}
                    >
                      <span className="text-sm font-black">Rocket</span>
                      <span className="text-[10px] opacity-75">রকেট পার্সোনাল</span>
                    </button>
                  </div>
                </div>

                {/* Step 3: Send Money Instruction Box with Copy */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-orange-500/10 border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <PhoneCall className="w-4 h-4 text-amber-500" />
                      <span>{selectedMethod.toUpperCase()} Send Money Number (Personal):</span>
                    </span>
                    <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400">
                      Amount: {currentPkg.amountBDT} ৳
                    </span>
                  </div>

                  {/* Copyable Phone Box */}
                  <div className="flex items-center justify-between bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl p-2.5 shadow-inner">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-extrabold tracking-wider text-neutral-900 dark:text-white select-all">
                        {personalNumber}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-medium">(Personal)</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyNumber}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer",
                        copiedNumber
                          ? "bg-emerald-500 text-white shadow-xs"
                          : "bg-amber-500 hover:bg-amber-600 text-black shadow-xs"
                      )}
                    >
                      {copiedNumber ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Number</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Step instruction list */}
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    <li>আপনার <strong>{selectedMethod.toUpperCase()}</strong> অ্যাপে যান এবং <strong>"Send Money"</strong> অপশন সিলেক্ট করুন।</li>
                    <li>উপরের নম্বরে (<strong>{personalNumber}</strong>) মোট <strong>{currentPkg.amountBDT} ৳</strong> সেন্ড মানি করুন।</li>
                    <li>পেমেন্ট সফল হলে এসএমএস থেকে <strong>Transaction ID (TrxID)</strong> এবং আপনার <strong>প্রেরকের নম্বরটি</strong> নিচে লিখে সাবমিট করুন।</li>
                  </ol>
                </div>

                {/* Step 4: Submission Form Inputs */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold block mb-1 text-[11px]">
                        আপনার প্রেরক ফোন নম্বর (Sender Number) *
                      </label>
                      <input
                        type="text"
                        placeholder="017xxxxxxxx"
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl outline-none focus:border-amber-500 font-mono text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-semibold block mb-1 text-[11px]">
                        ট্রানজেকশন আইডি (Transaction ID / TrxID) *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. BL749KQ982"
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl outline-none focus:border-amber-500 font-mono uppercase text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold block mb-1 text-[11px]">
                        আপনার নাম (Name)
                      </label>
                      <input
                        type="text"
                        placeholder="Subscriber Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl outline-none focus:border-amber-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-semibold block mb-1 text-[11px]">
                        ইমেইল (Email)
                      </label>
                      <input
                        type="email"
                        placeholder="yourname@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl outline-none focus:border-amber-500 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {formError && (
                  <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 flex items-center gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-extrabold text-sm shadow-lg hover:shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Submitting TrxID...</span>
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4 fill-black" />
                      <span>Submit Payment & Request PRO ({currentPkg.amountBDT} ৳)</span>
                    </>
                  )}
                </button>
              </form>
            )
          ) : (
            /* History & Status Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
                <span className="font-bold text-neutral-900 dark:text-white">
                  আপনার সাবমিট করা রিকোয়েস্টের তালিকা:
                </span>
                <span className="text-[11px] text-neutral-500">
                  Total: {userRequests.length}
                </span>
              </div>

              {userRequests.length === 0 ? (
                <div className="py-8 text-center text-neutral-500 dark:text-neutral-400 space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-neutral-400" />
                  <p>আপনি এখনো কোনো পেমেন্ট রিকোয়েস্ট সাবমিট করেননি।</p>
                  <button
                    onClick={() => setActiveTab('pay')}
                    className="text-amber-500 font-bold hover:underline"
                  >
                    নতুন প্যাকেজ কিনুন
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {userRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider",
                            req.method === 'bkash' ? "bg-pink-500/15 text-pink-600" : req.method === 'nagad' ? "bg-orange-500/15 text-orange-600" : "bg-purple-500/15 text-purple-600"
                          )}>
                            {req.method}
                          </span>
                          <span className="font-bold text-xs text-neutral-900 dark:text-white">
                            {req.packageName}
                          </span>
                        </div>

                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1",
                          req.status === 'approved'
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : req.status === 'rejected'
                            ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        )}>
                          {req.status === 'approved' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Approved • PRO Active</span>
                            </>
                          ) : req.status === 'rejected' ? (
                            <>
                              <AlertCircle className="w-3 h-3" />
                              <span>Rejected</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 animate-spin" />
                              <span>Pending Review</span>
                            </>
                          )}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-600 dark:text-neutral-400 pt-1 border-t border-neutral-200 dark:border-white/5">
                        <div>
                          <span>TrxID: </span>
                          <strong className="font-mono text-neutral-900 dark:text-white">{req.trxId}</strong>
                        </div>
                        <div>
                          <span>Sender: </span>
                          <strong className="font-mono text-neutral-900 dark:text-white">{req.senderNumber}</strong>
                        </div>
                        <div>
                          <span>Submitted: </span>
                          <span>{new Date(req.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div>
                          <span>Amount: </span>
                          <strong className="text-amber-600 dark:text-amber-400">{req.amountBDT} ৳</strong>
                        </div>
                      </div>

                      {req.status === 'approved' && (
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5">
                          <Crown className="w-3.5 h-3.5 text-emerald-500" />
                          <span>আপনার প্যাকেজ সক্রিয়! মেয়াদ: {req.durationDays} দিন।</span>
                        </div>
                      )}

                      {req.status === 'rejected' && req.rejectReason && (
                        <div className="p-2 rounded-xl bg-red-500/10 text-red-700 dark:text-red-300 text-[11px]">
                          কারণ: {req.rejectReason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex items-center justify-between text-[11px] text-neutral-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>100% Secure Manual Verification</span>
          </div>
          <button
            onClick={closeBkashModal}
            className="px-3 py-1 text-xs font-semibold hover:text-neutral-900 dark:hover:text-white cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
