import { useState, useEffect } from 'react';
import type { PlanItem, SubscriptionExtended, UsageLimits, InvoiceItem } from '@/types';
import {
  fetchPublicPlansApi,
  fetchCurrentSubscriptionApi,
  subscribePlanApi,
  renewSubscriptionApi,
  validateCouponApi,
  fetchInvoicesApi,
} from '@/lib/apiSubscription';
import { InvoicePdfModal } from './InvoicePdfModal';
import { cn } from '@/lib/utils';
import {
  Zap, Check, ShieldCheck, CreditCard, RefreshCw, Sparkles, FileText,
  Clock, AlertTriangle, ArrowUpRight, Percent, Tag, HardDrive, Users, Link2, Activity
} from 'lucide-react';

export function SubscriptionBillingCard() {
  const [loading, setLoading] = useState<boolean>(true);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionExtended | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanItem | null>(null);
  const [usageLimits, setUsageLimits] = useState<UsageLimits | null>(null);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);

  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [couponCodeInput, setCouponCodeInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPct: number } | null>(null);
  const [couponError, setCouponError] = useState<string>('');

  const [submittingPlanId, setSubmittingPlanId] = useState<string | null>(null);
  const [renewing, setRenewing] = useState<boolean>(false);

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  async function loadSubscriptionData() {
    setLoading(true);
    try {
      const [plansRes, currentRes, invsRes] = await Promise.all([
        fetchPublicPlansApi(),
        fetchCurrentSubscriptionApi(),
        fetchInvoicesApi(),
      ]);

      setPlans(plansRes);
      setSubscription(currentRes.subscription);
      setCurrentPlan(currentRes.plan);
      setUsageLimits(currentRes.usageLimits);
      setInvoices(invsRes);
      setBillingCycle(currentRes.subscription.billingCycle as any || 'MONTHLY');
    } catch (e) {
      console.error('Failed to load subscription data:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleValidateCoupon() {
    if (!couponCodeInput.trim()) return;
    setCouponError('');
    try {
      const res = await validateCouponApi(couponCodeInput.trim());
      setAppliedCoupon(res);
    } catch (e: any) {
      setCouponError(e.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    }
  }

  async function handleSelectPlan(plan: PlanItem) {
    setSubmittingPlanId(plan.id);
    try {
      const res = await subscribePlanApi({
        planId: plan.id,
        billingCycle,
        couponCode: appliedCoupon?.code,
      });

      setSubscription(res.subscription);
      setCurrentPlan(plan);
      setInvoices((prev) => [res.invoice, ...prev]);
      setAppliedCoupon(null);
      setCouponCodeInput('');
      alert(`Successfully subscribed to ${plan.name} Plan!`);
    } catch (e: any) {
      alert(e.message || 'Subscription failed');
    } finally {
      setSubmittingPlanId(null);
    }
  }

  async function handleRenew() {
    setRenewing(true);
    try {
      const res = await renewSubscriptionApi();
      setSubscription(res.subscription);
      setInvoices((prev) => [res.invoice, ...prev]);
      alert('Subscription renewed successfully!');
    } catch (e: any) {
      alert(e.message || 'Renewal failed');
    } finally {
      setRenewing(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-white/10 dark:bg-base-900 flex items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Current Active Plan Overview Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-base-900 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-md">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Active Subscription: {subscription?.planName || currentPlan?.name || 'Starter'}
                </h3>
                <span className="rounded-full bg-emerald-500/10 px-3 py-0.5 text-xs font-black text-emerald-500 border border-emerald-500/20">
                  {subscription?.status || 'ACTIVE'}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Billing Cycle: {subscription?.billingCycle || 'MONTHLY'} · Auto-Renewal Enabled
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRenew}
              disabled={renewing}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-black text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition disabled:opacity-50"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', renewing && 'animate-spin')} />
              Renew Subscription
            </button>
          </div>
        </div>

        {/* Dates & Expiry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-white/10 dark:bg-white/[0.02]">
            <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Plan Tier</span>
            <span className="text-slate-900 dark:text-white font-extrabold text-sm">{currentPlan?.name || 'Starter'}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-white/10 dark:bg-white/[0.02]">
            <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Start Date</span>
            <span className="text-slate-900 dark:text-white font-extrabold text-sm">
              {subscription?.startDate ? new Date(subscription.startDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-white/10 dark:bg-white/[0.02]">
            <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Expiry Date</span>
            <span className="text-amber-600 dark:text-amber-400 font-extrabold text-sm">
              {subscription?.expiryDate ? new Date(subscription.expiryDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-white/10 dark:bg-white/[0.02]">
            <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Next Renewal Date</span>
            <span className="text-slate-900 dark:text-white font-extrabold text-sm">
              {subscription?.renewalDate ? new Date(subscription.renewalDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>

        {/* Enforced Resource Limits Meters */}
        {usageLimits && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Enforced Plan Resource Limits & Usage
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              
              {/* Storage */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-white/10 dark:bg-white/[0.02] space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <HardDrive className="h-3.5 w-3.5 text-amber-500" /> Storage Limit
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {usageLimits.storageUsedMb} MB / {usageLimits.storageLimitMb} MB
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${Math.min(100, (usageLimits.storageUsedMb / usageLimits.storageLimitMb) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Employee Limit */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-white/10 dark:bg-white/[0.02] space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-sky-500" /> Employee Seats
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {usageLimits.employeesUsed} / {usageLimits.employeeLimit}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full"
                    style={{ width: `${Math.min(100, (usageLimits.employeesUsed / usageLimits.employeeLimit) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Connected Accounts */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-white/10 dark:bg-white/[0.02] space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Link2 className="h-3.5 w-3.5 text-purple-500" /> Connected Accounts
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {usageLimits.accountsConnected} / {usageLimits.connectedAccountsLimit}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${Math.min(100, (usageLimits.accountsConnected / usageLimits.connectedAccountsLimit) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Plan Selection & Upgrade Grid */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-base-900 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Upgrade or Switch Subscription Plan
            </h3>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Select monthly or yearly billing with instant discount code support.
            </p>
          </div>

          {/* Monthly / Yearly Toggle */}
          <div className="flex items-center gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-white/5">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={cn(
                'rounded-xl px-4 py-1.5 text-xs font-black transition',
                billingCycle === 'MONTHLY'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              )}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('YEARLY')}
              className={cn(
                'rounded-xl px-4 py-1.5 text-xs font-black transition flex items-center gap-1',
                billingCycle === 'YEARLY'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              )}
            >
              Yearly Billing <span className="text-[10px] bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded-md font-bold">20% OFF</span>
            </button>
          </div>
        </div>

        {/* Coupon Code Input Line */}
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10">
          <Tag className="h-5 w-5 text-amber-500 shrink-0" />
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={couponCodeInput}
              onChange={(e) => setCouponCodeInput(e.target.value)}
              placeholder="Enter coupon code (e.g., EQUINOX20, WELCOME50)..."
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
            <button
              onClick={handleValidateCoupon}
              className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-black text-white hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-white/20 shrink-0"
            >
              Apply Coupon
            </button>
          </div>
          {appliedCoupon && (
            <span className="text-xs font-black text-emerald-500 flex items-center gap-1">
              <Check className="h-4 w-4" /> Applied: {appliedCoupon.code} (-{appliedCoupon.discountPct}%)
            </span>
          )}
          {couponError && <span className="text-xs font-bold text-rose-500">{couponError}</span>}
        </div>

        {/* Plans 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p) => {
            const isCurrent = currentPlan?.id === p.id || currentPlan?.code === p.code;
            const price = billingCycle === 'YEARLY' ? p.yearlyPrice : p.monthlyPrice;

            return (
              <div
                key={p.id}
                className={cn(
                  'rounded-3xl border p-5 space-y-4 flex flex-col justify-between transition-all',
                  isCurrent
                    ? 'border-amber-500 bg-amber-500/5 shadow-md'
                    : 'border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/20'
                )}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-black text-slate-900 dark:text-white">{p.name}</h4>
                    {isCurrent && (
                      <span className="rounded-full bg-amber-500 text-slate-950 px-2.5 py-0.5 text-[10px] font-black uppercase">
                        Current Plan
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">${price}</span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      /{billingCycle === 'YEARLY' ? 'year' : 'month'}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-3 dark:border-white/10 text-xs font-bold space-y-1.5 text-slate-600 dark:text-slate-300">
                    <p>• {p.storageLimitMb >= 1000 ? `${p.storageLimitMb / 1000} GB` : `${p.storageLimitMb} MB`} Storage</p>
                    <p>• {p.employeeLimit} Employee Seats</p>
                    <p>• {p.connectedAccountsLimit} Connected Accounts</p>
                    <p>• {p.apiLimitPerMonth.toLocaleString()} API Calls/mo</p>
                    <p>• {p.reviewLimitPerMonth.toLocaleString()} Reviews/mo</p>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectPlan(p)}
                  disabled={isCurrent || submittingPlanId === p.id}
                  className={cn(
                    'w-full rounded-2xl py-2.5 text-xs font-black transition flex items-center justify-center gap-1.5',
                    isCurrent
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed dark:bg-white/10 dark:text-slate-400'
                      : 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm'
                  )}
                >
                  {submittingPlanId === p.id ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : isCurrent ? (
                    'Active Plan'
                  ) : (
                    'Select & Switch Plan'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoices & Payment History Table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-base-900 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="h-5 w-5 text-amber-500" /> Payment & Invoice History
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
          <table className="w-full text-left text-xs font-bold">
            <thead className="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase">
              <tr>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Billing Date</th>
                <th className="p-3">Subtotal</th>
                <th className="p-3">Tax (18%)</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">PDF Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10 text-slate-800 dark:text-slate-200">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="p-3 font-extrabold text-slate-900 dark:text-white">{inv.invoiceNumber}</td>
                  <td className="p-3">{new Date(inv.billingDate).toLocaleDateString()}</td>
                  <td className="p-3">${inv.subtotal.toFixed(2)}</td>
                  <td className="p-3">+${inv.taxAmount.toFixed(2)}</td>
                  <td className="p-3 font-black text-amber-600 dark:text-amber-400">${inv.totalAmount.toFixed(2)} {inv.currency}</td>
                  <td className="p-3">
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black text-emerald-500 border border-emerald-500/20">
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setShowPdfModal(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-800 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
                    >
                      <FileText className="h-3.5 w-3.5 text-amber-500" /> View PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice PDF Modal */}
      <InvoicePdfModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        invoice={selectedInvoice}
      />
    </div>
  );
}
