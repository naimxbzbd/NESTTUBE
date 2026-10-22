import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Check, 
  XCircle, 
  Trash2, 
  Search, 
  Clock, 
  CheckCircle2, 
  Crown, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Plus, 
  AlertCircle,
  Copy
} from 'lucide-react';
import { usePaymentStore, ManualPaymentRequest } from '../../store/usePaymentStore';
import { cn } from '../../lib/utils';

export const AdminPaymentModal: React.FC = () => {
  const { 
    isAdminModalOpen, 
    closeAdminModal, 
    paymentRequests, 
    approvePaymentRequest, 
    rejectPaymentRequest, 
    deletePaymentRequest,
    seedDemoRequest,
    isAdminUnlocked,
    unlockAdmin,
    lockAdmin
  } = usePaymentStore();

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  if (!isAdminModalOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const success = unlockAdmin(pinInput);
    if (!success) {
      setPinError(true);
    } else {
      setPinError(false);
      setPinInput('');
    }
  };

  const handleApprove = (id: string) => {
    const success = approvePaymentRequest(id);
    if (success) {
      setActionSuccess(`Payment ${id} approved! PRO privileges activated.`);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const handleReject = (id: string) => {
    rejectPaymentRequest(id, 'Invalid TrxID or funds not received in bKash/Nagad/Rocket account');
    setActionSuccess(`Payment ${id} rejected.`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const filteredRequests = paymentRequests.filter(req => {
    if (filter !== 'all' && req.status !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        req.trxId.toLowerCase().includes(q) ||
        req.senderNumber.includes(q) ||
        req.userName.toLowerCase().includes(q) ||
        req.userEmail.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = paymentRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base leading-tight">
                  NESTTube Admin Payment Panel
                </h3>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                    {pendingCount} Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400">
                Verify bKash / Nagad / Rocket TrxID & approve user PRO subscriptions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminUnlocked && (
              <button
                type="button"
                onClick={lockAdmin}
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Lock Panel"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={closeAdminModal}
              className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Locked Screen if not authenticated */}
        {!isAdminUnlocked ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-amber-500 shadow-md">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-neutral-900 dark:text-white">Admin Authentication Required</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Enter your Admin PIN to manage subscriptions. Default PIN is <code className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 font-mono font-bold text-amber-500">1234</code>.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="w-full space-y-3">
              <input
                type="password"
                placeholder="Enter Admin PIN (Default: 1234)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-center font-mono tracking-widest text-base font-bold outline-none focus:border-amber-500"
                autoFocus
              />

              {pinError && (
                <p className="text-xs text-red-500 font-medium">Incorrect PIN. Please use 1234.</p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Unlock className="w-4 h-4" />
                <span>Unlock Admin Dashboard</span>
              </button>
            </form>
          </div>
        ) : (
          /* Unlocked Admin Management View */
          <div className="flex-1 overflow-y-auto flex flex-col custom-scrollbar text-xs">
            
            {/* Top Toolbar */}
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-neutral-200/70 dark:bg-neutral-800 p-1 rounded-xl shrink-0 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={cn(
                    "px-3 py-1 font-bold rounded-lg transition-all cursor-pointer",
                    filter === 'all' ? "bg-white dark:bg-neutral-700 shadow-xs text-neutral-900 dark:text-white" : "text-neutral-500"
                  )}
                >
                  All ({paymentRequests.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('pending')}
                  className={cn(
                    "px-3 py-1 font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1",
                    filter === 'pending' ? "bg-amber-500 text-black shadow-xs" : "text-amber-600 dark:text-amber-400"
                  )}
                >
                  <span>Pending</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px] font-mono">{pendingCount}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('approved')}
                  className={cn(
                    "px-3 py-1 font-bold rounded-lg transition-all cursor-pointer",
                    filter === 'approved' ? "bg-emerald-600 text-white shadow-xs" : "text-neutral-500"
                  )}
                >
                  Approved
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('rejected')}
                  className={cn(
                    "px-3 py-1 font-bold rounded-lg transition-all cursor-pointer",
                    filter === 'rejected' ? "bg-red-600 text-white shadow-xs" : "text-neutral-500"
                  )}
                >
                  Rejected
                </button>
              </div>

              {/* Search & Actions */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search TrxID or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={seedDemoRequest}
                  className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                  title="Generate a demo test request for testing approval"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Add Test Order</span>
                </button>
              </div>
            </div>

            {/* Notification Bar */}
            {actionSuccess && (
              <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* Submissions List */}
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              {filteredRequests.length === 0 ? (
                <div className="py-12 text-center text-neutral-400 space-y-2">
                  <ShieldCheck className="w-8 h-8 mx-auto text-neutral-500" />
                  <p>No payment requests found in this filter.</p>
                </div>
              ) : (
                filteredRequests.map((req) => (
                  <div
                    key={req.id}
                    className={cn(
                      "p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4",
                      req.status === 'pending'
                        ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-500/40 shadow-xs"
                        : req.status === 'approved'
                        ? "bg-white dark:bg-neutral-800/70 border-emerald-500/30"
                        : "bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-800 opacity-75"
                    )}
                  >
                    {/* User and Plan Info */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn(
                          "px-2 py-0.5 rounded font-black text-[10px] uppercase tracking-wide",
                          req.method === 'bkash' ? "bg-pink-500 text-white" : req.method === 'nagad' ? "bg-orange-500 text-white" : "bg-purple-600 text-white"
                        )}>
                          {req.method}
                        </span>

                        <span className="font-extrabold text-sm text-neutral-900 dark:text-white">
                          {req.packageName}
                        </span>

                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          req.status === 'approved'
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : req.status === 'rejected'
                            ? "bg-red-500/20 text-red-600 dark:text-red-400"
                            : "bg-amber-500 text-black font-black"
                        )}>
                          {req.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-neutral-600 dark:text-neutral-300 text-[11px]">
                        <div>
                          <span className="text-neutral-400">User: </span>
                          <strong className="text-neutral-900 dark:text-white">{req.userName}</strong>
                          <span className="text-[10px] text-neutral-400 block truncate">{req.userEmail}</span>
                        </div>

                        <div>
                          <span className="text-neutral-400">Sender Number: </span>
                          <strong className="font-mono text-neutral-900 dark:text-white block">{req.senderNumber}</strong>
                        </div>

                        <div>
                          <span className="text-neutral-400">TrxID: </span>
                          <div className="flex items-center gap-1">
                            <strong className="font-mono text-amber-600 dark:text-amber-400 font-extrabold text-xs">
                              {req.trxId}
                            </strong>
                            <button
                              type="button"
                              onClick={() => handleCopy(req.trxId, req.id)}
                              className="text-neutral-400 hover:text-white cursor-pointer"
                              title="Copy TrxID"
                            >
                              {copiedId === req.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="text-[10px] text-neutral-400 pt-0.5">
                        Submitted: {new Date(req.submittedAt).toLocaleString()} ({Math.round((Date.now() - req.submittedAt) / (1000 * 60))}m ago)
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      {req.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprove(req.id)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Approve PRO</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleReject(req.id)}
                            className="px-3 py-2 rounded-xl bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      {req.status === 'approved' && (
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-500 font-bold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Subscribed</span>
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => deletePaymentRequest(req.id)}
                        className="p-2 text-neutral-400 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex items-center justify-between text-neutral-500 text-[11px]">
              <div>
                Connected Personal Wallet: <strong className="font-mono text-amber-500">01703223141</strong>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={lockAdmin}
                  className="hover:underline text-neutral-400 hover:text-white cursor-pointer"
                >
                  Lock Panel
                </button>
                <button
                  type="button"
                  onClick={closeAdminModal}
                  className="px-3 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold hover:bg-neutral-300 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
