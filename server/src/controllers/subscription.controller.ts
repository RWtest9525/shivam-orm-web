import { Request, Response } from 'express';

// Standard 4 Default Subscription Plans
let memoryPlans: any[] = [
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
    featuresIncluded: JSON.stringify([
      'Basic Review Monitoring',
      '1 Connected Channel',
      'Standard Email Support',
      '500 MB Storage',
    ]),
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    featuresIncluded: JSON.stringify([
      'Google, FB & IG Review Ingestion',
      'Up to 3 Connected Accounts',
      '5 Team Seats',
      '5 GB File Storage',
      'AI Smart Replies (50/mo)',
    ]),
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    featuresIncluded: JSON.stringify([
      'All 6 Official OAuth Channels',
      'Up to 10 Connected Accounts',
      '20 Team Seats',
      '25 GB Storage',
      'Unlimited AI Smart Replies',
      'Unified Social Inbox',
      'Priority Support',
    ]),
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    featuresIncluded: JSON.stringify([
      'Unlimited OAuth & API Channels',
      'Dedicated Account Manager',
      'Custom SLA & 24/7 Phone Support',
      '100 GB Storage & Advanced Analytics',
      'Custom API Integrations & Webhooks',
    ]),
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Valid Coupons
let memoryCoupons: any[] = [
  { id: 'c-1', code: 'EQUINOX20', discountPct: 20.0, maxUses: 500, usedCount: 12, isActive: true },
  { id: 'c-2', code: 'WELCOME50', discountPct: 50.0, maxUses: 100, usedCount: 45, isActive: true },
];

// Subscriptions & Invoices In-Memory Store
let memorySubscriptions: any[] = [
  {
    id: 'sub-demo-1',
    companyId: 'c-client-demo',
    planId: 'plan-pro',
    planCode: 'PRO',
    planName: 'Professional',
    billingCycle: 'MONTHLY',
    status: 'ACTIVE',
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(),
    renewalDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(),
    autoRenew: true,
    appliedCouponCode: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let memoryInvoices: any[] = [
  {
    id: 'inv-1001',
    invoiceNumber: 'INV-2026-001',
    companyId: 'c-client-demo',
    subscriptionId: 'sub-demo-1',
    billingDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    subtotal: 89.0,
    taxPct: 18.0,
    taxAmount: 16.02,
    couponCode: null,
    discountPct: 0,
    discountAmount: 0,
    totalAmount: 105.02,
    currency: 'USD',
    status: 'PAID',
    paymentMethod: 'CREDIT_CARD',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
  },
];

export async function getPlansHandler(req: Request, res: Response): Promise<void> {
  try {
    const plans = memoryPlans.filter((p) => p.isActive);
    res.json({ success: true, data: plans });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function createPlanHandler(req: Request, res: Response): Promise<void> {
  try {
    const { name, code, monthlyPrice, yearlyPrice, storageLimitMb, employeeLimit, connectedAccountsLimit, apiLimitPerMonth, reviewLimitPerMonth, featuresIncluded } = req.body;

    const newPlan = {
      id: `plan-${Date.now()}`,
      name,
      code: code.toUpperCase(),
      monthlyPrice: Number(monthlyPrice),
      yearlyPrice: Number(yearlyPrice),
      storageLimitMb: Number(storageLimitMb),
      employeeLimit: Number(employeeLimit),
      connectedAccountsLimit: Number(connectedAccountsLimit),
      apiLimitPerMonth: Number(apiLimitPerMonth),
      reviewLimitPerMonth: Number(reviewLimitPerMonth),
      featuresIncluded: typeof featuresIncluded === 'string' ? featuresIncluded : JSON.stringify(featuresIncluded || []),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryPlans.push(newPlan);
    res.json({ success: true, data: newPlan });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updatePlanHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const planIndex = memoryPlans.findIndex((p) => p.id === id);

    if (planIndex < 0) {
      res.status(404).json({ success: false, error: 'Plan not found.' });
      return;
    }

    memoryPlans[planIndex] = {
      ...memoryPlans[planIndex],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    res.json({ success: true, data: memoryPlans[planIndex] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function deletePlanHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const planIndex = memoryPlans.findIndex((p) => p.id === id);

    if (planIndex >= 0) {
      memoryPlans[planIndex].isActive = false;
    }

    res.json({ success: true, message: 'Plan deactivated successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getCurrentSubscriptionHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyId = (req as any).user?.companyId || 'c-client-demo';
    let sub = memorySubscriptions.find((s) => s.companyId === companyId);

    if (!sub) {
      // Create default starter subscription for company if none present
      sub = {
        id: `sub-${Date.now()}`,
        companyId,
        planId: 'plan-starter',
        planCode: 'STARTER',
        planName: 'Starter',
        billingCycle: 'MONTHLY',
        status: 'ACTIVE',
        startDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        renewalDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        autoRenew: true,
        appliedCouponCode: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memorySubscriptions.push(sub);
    }

    const currentPlan = memoryPlans.find((p) => p.id === sub.planId || p.code === sub.planCode) || memoryPlans[1];

    // Current Resource Usage Meters
    const usageLimits = {
      storageUsedMb: 1240,
      storageLimitMb: currentPlan.storageLimitMb,
      employeesUsed: 3,
      employeeLimit: currentPlan.employeeLimit,
      accountsConnected: 2,
      connectedAccountsLimit: currentPlan.connectedAccountsLimit,
      apiCallsMonth: 3420,
      apiLimitPerMonth: currentPlan.apiLimitPerMonth,
      reviewsFetchedMonth: 890,
      reviewLimitPerMonth: currentPlan.reviewLimitPerMonth,
    };

    res.json({
      success: true,
      data: {
        subscription: sub,
        plan: currentPlan,
        usageLimits,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function validateCouponHandler(req: Request, res: Response): Promise<void> {
  try {
    const { code } = req.body;
    if (!code) {
      res.status(400).json({ success: false, error: 'Coupon code is required.' });
      return;
    }

    const coupon = memoryCoupons.find(
      (c) => c.code.toUpperCase() === String(code).toUpperCase() && c.isActive
    );

    if (!coupon) {
      res.status(404).json({ success: false, error: 'Invalid or expired coupon code.' });
      return;
    }

    res.json({
      success: true,
      data: {
        code: coupon.code,
        discountPct: coupon.discountPct,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function subscribePlanHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyId = (req as any).user?.companyId || 'c-client-demo';
    const { planId, billingCycle = 'MONTHLY', couponCode } = req.body;

    const targetPlan = memoryPlans.find((p) => p.id === planId || p.code === planId);
    if (!targetPlan) {
      res.status(404).json({ success: false, error: 'Target plan not found.' });
      return;
    }

    // Financial & Tax Calculations
    const basePrice = billingCycle === 'YEARLY' ? targetPlan.yearlyPrice : targetPlan.monthlyPrice;
    
    let discountPct = 0;
    let discountAmount = 0;

    if (couponCode) {
      const coupon = memoryCoupons.find((c) => c.code.toUpperCase() === String(couponCode).toUpperCase() && c.isActive);
      if (coupon) {
        discountPct = coupon.discountPct;
        discountAmount = Math.round((basePrice * (discountPct / 100)) * 100) / 100;
        coupon.usedCount += 1;
      }
    }

    const subtotal = Math.max(0, basePrice - discountAmount);
    const taxPct = 18.0; // 18% Tax
    const taxAmount = Math.round((subtotal * (taxPct / 100)) * 100) / 100;
    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

    const days = billingCycle === 'YEARLY' ? 365 : 30;
    const now = new Date();
    const expiryDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    // Update Subscription Record
    let sub = memorySubscriptions.find((s) => s.companyId === companyId);
    if (sub) {
      sub.planId = targetPlan.id;
      sub.planCode = targetPlan.code;
      sub.planName = targetPlan.name;
      sub.billingCycle = billingCycle;
      sub.status = 'ACTIVE';
      sub.expiryDate = expiryDate.toISOString();
      sub.renewalDate = expiryDate.toISOString();
      sub.appliedCouponCode = couponCode || null;
      sub.updatedAt = now.toISOString();
    } else {
      sub = {
        id: `sub-${Date.now()}`,
        companyId,
        planId: targetPlan.id,
        planCode: targetPlan.code,
        planName: targetPlan.name,
        billingCycle,
        status: 'ACTIVE',
        startDate: now.toISOString(),
        expiryDate: expiryDate.toISOString(),
        renewalDate: expiryDate.toISOString(),
        autoRenew: true,
        appliedCouponCode: couponCode || null,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      memorySubscriptions.push(sub);
    }

    // Generate Invoice Ledger Record
    const newInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      companyId,
      subscriptionId: sub.id,
      billingDate: now.toISOString(),
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      subtotal,
      taxPct,
      taxAmount,
      couponCode: couponCode || null,
      discountPct,
      discountAmount,
      totalAmount,
      currency: 'USD',
      status: 'PAID',
      paymentMethod: 'CREDIT_CARD',
      createdAt: now.toISOString(),
    };

    memoryInvoices.unshift(newInvoice);

    res.json({
      success: true,
      message: `Plan ${targetPlan.name} subscribed successfully!`,
      data: {
        subscription: sub,
        invoice: newInvoice,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function renewSubscriptionHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyId = (req as any).user?.companyId || 'c-client-demo';
    const sub = memorySubscriptions.find((s) => s.companyId === companyId);

    if (!sub) {
      res.status(404).json({ success: false, error: 'Active subscription not found.' });
      return;
    }

    const currentPlan = memoryPlans.find((p) => p.id === sub.planId || p.code === sub.planCode) || memoryPlans[1];
    const basePrice = sub.billingCycle === 'YEARLY' ? currentPlan.yearlyPrice : currentPlan.monthlyPrice;
    const taxPct = 18.0;
    const taxAmount = Math.round((basePrice * (taxPct / 100)) * 100) / 100;
    const totalAmount = Math.round((basePrice + taxAmount) * 100) / 100;

    const days = sub.billingCycle === 'YEARLY' ? 365 : 30;
    const newExpiry = new Date(new Date(sub.expiryDate).getTime() + days * 24 * 60 * 60 * 1000);

    sub.expiryDate = newExpiry.toISOString();
    sub.renewalDate = newExpiry.toISOString();
    sub.status = 'ACTIVE';
    sub.updatedAt = new Date().toISOString();

    const newInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      companyId,
      subscriptionId: sub.id,
      billingDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      subtotal: basePrice,
      taxPct,
      taxAmount,
      couponCode: null,
      discountPct: 0,
      discountAmount: 0,
      totalAmount,
      currency: 'USD',
      status: 'PAID',
      paymentMethod: 'CREDIT_CARD',
      createdAt: new Date().toISOString(),
    };

    memoryInvoices.unshift(newInvoice);

    res.json({
      success: true,
      message: 'Subscription renewed successfully.',
      data: { subscription: sub, invoice: newInvoice },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateSubscriptionStatusHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'ACTIVE', 'SUSPENDED', 'CANCELED'

    const sub = memorySubscriptions.find((s) => s.id === id || s.companyId === id);
    if (!sub) {
      res.status(404).json({ success: false, error: 'Subscription not found.' });
      return;
    }

    sub.status = String(status).toUpperCase();
    sub.updatedAt = new Date().toISOString();

    res.json({ success: true, message: `Subscription status updated to ${sub.status}.`, data: sub });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function listInvoicesHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyId = (req as any).user?.companyId || req.query.companyId || 'c-client-demo';
    const invoices = memoryInvoices.filter((inv) => inv.companyId === companyId);
    res.json({ success: true, data: invoices });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getInvoicePdfHtmlHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const inv = memoryInvoices.find((i) => i.id === id || i.invoiceNumber === id);

    if (!inv) {
      res.status(404).send('Invoice not found.');
      return;
    }

    // Render HTML invoice template for printable / downloadable PDF preview
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${inv.invoiceNumber}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
    .invoice-card { max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; }
    .logo { font-size: 24px; font-weight: 900; color: #f59e0b; }
    .badge { background: #dcfce7; color: #15803d; padding: 4px 12px; border-radius: 99px; font-weight: 800; font-size: 12px; }
    .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { text-align: left; padding: 12px; background: #f8fafc; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #64748b; }
    td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 600; }
    .totals { margin-top: 30px; text-align: right; font-size: 13px; }
    .totals div { margin-bottom: 8px; }
    .grand-total { font-size: 18px; font-weight: 900; color: #0f172a; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="logo">⚡ Equinox Pulse Enterprise ORM</div>
        <p style="font-size: 12px; color: #64748b; margin-top: 4px;">Official Billing Tax Invoice</p>
      </div>
      <div>
        <span class="badge">STATUS: ${inv.status}</span>
      </div>
    </div>

    <div class="details">
      <div>
        <strong>Billed To:</strong><br>
        Equinox Partner Client<br>
        Tax ID: US-9982410-X<br>
        Billing Email: billing@equinoxpulse.com
      </div>
      <div style="text-align: right;">
        <strong>Invoice Number:</strong> ${inv.invoiceNumber}<br>
        <strong>Billing Date:</strong> ${new Date(inv.billingDate).toLocaleDateString()}<br>
        <strong>Payment Method:</strong> ${inv.paymentMethod}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Cycle</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Equinox Pulse SaaS Subscription Services</td>
          <td>Monthly / Yearly</td>
          <td style="text-align: right;">$${inv.subtotal.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <div class="totals">
      <div>Subtotal: <strong>$${inv.subtotal.toFixed(2)}</strong></div>
      ${inv.discountAmount > 0 ? `<div style="color: #059669;">Discount (${inv.couponCode || 'Promo'} -${inv.discountPct}%): <strong>-$${inv.discountAmount.toFixed(2)}</strong></div>` : ''}
      <div>Estimated Tax (${inv.taxPct}%): <strong>+$${inv.taxAmount.toFixed(2)}</strong></div>
      <div class="grand-total">Total Billed: $${inv.totalAmount.toFixed(2)} ${inv.currency}</div>
    </div>

    <div style="margin-top: 40px; border-top: 1px solid #f1f5f9; pt-20px; font-size: 11px; color: #94a3b8; text-align: center;">
      Thank you for choosing Equinox Pulse. For billing inquiries, contact support@equinoxmarketingagency.in
    </div>
  </div>
</body>
</html>
`;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error: any) {
    res.status(500).send('Error generating invoice PDF.');
  }
}
