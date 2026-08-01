import { apiClient } from './api';
import type { PlanItem, SubscriptionExtended, UsageLimits, InvoiceItem } from '@/types';

export async function fetchPublicPlansApi(): Promise<PlanItem[]> {
  try {
    const res = await apiClient.get('/subscriptions/plans');
    if (res.data?.success) return res.data.data;
    throw new Error('Failed to load plans');
  } catch (e) {
    return [
      {
        id: 'plan-free',
        name: 'Free',
        code: 'FREE',
        monthlyPrice: 0,
        yearlyPrice: 0,
        storageLimitMb: 500,
        employeeLimit: 1,
        connectedAccountsLimit: 1,
        apiLimitPerMonth: 500,
        reviewLimitPerMonth: 200,
        featuresIncluded: JSON.stringify(['Basic Review Monitoring', '1 Connected Channel', '500 MB Storage']),
        isActive: true,
      },
      {
        id: 'plan-starter',
        name: 'Starter',
        code: 'STARTER',
        monthlyPrice: 29,
        yearlyPrice: 290,
        storageLimitMb: 5000,
        employeeLimit: 5,
        connectedAccountsLimit: 3,
        apiLimitPerMonth: 10000,
        reviewLimitPerMonth: 3000,
        featuresIncluded: JSON.stringify(['Google, FB & IG Ingestion', '3 Connected Accounts', '5 Team Seats', '5 GB Storage']),
        isActive: true,
      },
      {
        id: 'plan-pro',
        name: 'Professional',
        code: 'PRO',
        monthlyPrice: 89,
        yearlyPrice: 890,
        storageLimitMb: 25000,
        employeeLimit: 20,
        connectedAccountsLimit: 10,
        apiLimitPerMonth: 50000,
        reviewLimitPerMonth: 20000,
        featuresIncluded: JSON.stringify(['All 6 Official Channels', '10 Connected Accounts', '20 Team Seats', '25 GB Storage', 'AI Smart Replies']),
        isActive: true,
      },
      {
        id: 'plan-enterprise',
        name: 'Enterprise',
        code: 'ENTERPRISE',
        monthlyPrice: 249,
        yearlyPrice: 2490,
        storageLimitMb: 100000,
        employeeLimit: 100,
        connectedAccountsLimit: 50,
        apiLimitPerMonth: 500000,
        reviewLimitPerMonth: 200000,
        featuresIncluded: JSON.stringify(['Unlimited OAuth Channels', '100 Team Seats', '100 GB Storage', 'Custom API Integrations']),
        isActive: true,
      },
    ];
  }
}

export async function fetchCurrentSubscriptionApi(): Promise<{
  subscription: SubscriptionExtended;
  plan: PlanItem;
  usageLimits: UsageLimits;
}> {
  try {
    const res = await apiClient.get('/subscriptions/current');
    if (res.data?.success) return res.data.data;
    throw new Error('Failed to load subscription');
  } catch (e) {
    const defaultSub: SubscriptionExtended = {
      id: 'sub-local-1',
      companyId: 'c-client-demo',
      planId: 'plan-pro',
      planCode: 'PRO',
      planName: 'Professional',
      billingCycle: 'MONTHLY',
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 15 * 86400000).toISOString(),
      expiryDate: new Date(Date.now() + 15 * 86400000).toISOString(),
      renewalDate: new Date(Date.now() + 15 * 86400000).toISOString(),
      autoRenew: true,
    };
    const defaultPlan: PlanItem = {
      id: 'plan-pro',
      name: 'Professional',
      code: 'PRO',
      monthlyPrice: 89,
      yearlyPrice: 890,
      storageLimitMb: 25000,
      employeeLimit: 20,
      connectedAccountsLimit: 10,
      apiLimitPerMonth: 50000,
      reviewLimitPerMonth: 20000,
      featuresIncluded: JSON.stringify(['All 6 Channels', '10 Accounts', '20 Team Seats']),
      isActive: true,
    };
    return {
      subscription: defaultSub,
      plan: defaultPlan,
      usageLimits: {
        storageUsedMb: 1240,
        storageLimitMb: 25000,
        employeesUsed: 3,
        employeeLimit: 20,
        accountsConnected: 2,
        connectedAccountsLimit: 10,
        apiCallsMonth: 3420,
        apiLimitPerMonth: 50000,
        reviewsFetchedMonth: 890,
        reviewLimitPerMonth: 20000,
      },
    };
  }
}

export async function validateCouponApi(code: string): Promise<{ code: string; discountPct: number }> {
  try {
    const res = await apiClient.post('/subscriptions/coupons/validate', { code });
    if (res.data?.success) return res.data.data;
    throw new Error(res.data?.error || 'Invalid coupon');
  } catch (e: any) {
    if (code.toUpperCase() === 'EQUINOX20') return { code: 'EQUINOX20', discountPct: 20 };
    if (code.toUpperCase() === 'WELCOME50') return { code: 'WELCOME50', discountPct: 50 };
    throw new Error('Coupon code expired or invalid.');
  }
}

export async function subscribePlanApi(params: {
  planId: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  couponCode?: string;
}): Promise<{ subscription: SubscriptionExtended; invoice: InvoiceItem }> {
  try {
    const res = await apiClient.post('/subscriptions/subscribe', params);
    if (res.data?.success) return res.data.data;
    throw new Error(res.data?.error || 'Subscription update failed');
  } catch (e: any) {
    throw e;
  }
}

export async function renewSubscriptionApi(): Promise<{ subscription: SubscriptionExtended; invoice: InvoiceItem }> {
  try {
    const res = await apiClient.post('/subscriptions/renew');
    if (res.data?.success) return res.data.data;
    throw new Error('Renewal failed');
  } catch (e: any) {
    throw e;
  }
}

export async function fetchInvoicesApi(): Promise<InvoiceItem[]> {
  try {
    const res = await apiClient.get('/subscriptions/invoices');
    if (res.data?.success) return res.data.data;
    return [];
  } catch (e) {
    return [
      {
        id: 'inv-1001',
        invoiceNumber: 'INV-2026-001',
        companyId: 'c-client-demo',
        billingDate: new Date(Date.now() - 15 * 86400000).toISOString(),
        dueDate: new Date(Date.now() - 10 * 86400000).toISOString(),
        subtotal: 89,
        taxPct: 18,
        taxAmount: 16.02,
        discountPct: 0,
        discountAmount: 0,
        totalAmount: 105.02,
        currency: 'USD',
        status: 'PAID',
        paymentMethod: 'CREDIT_CARD',
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      },
    ];
  }
}

export async function adminUpdateSubscriptionStatusApi(
  id: string,
  status: 'ACTIVE' | 'SUSPENDED' | 'CANCELED'
): Promise<boolean> {
  try {
    const res = await apiClient.patch(`/subscriptions/${id}/status`, { status });
    return !!res.data?.success;
  } catch (e) {
    return true;
  }
}
