import type { InvoiceItem } from '@/types';
import { X, Printer, Download, CheckCircle2, FileText, Zap } from 'lucide-react';

interface InvoicePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceItem | null;
}

export function InvoicePdfModal({ isOpen, onClose, invoice }: InvoicePdfModalProps) {
  if (!isOpen || !invoice) return null;

  function handlePrint() {
    window.print();
  }

  function handleDownloadHtml() {
    if (!invoice) return;
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice_${invoice.invoiceNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; }
    .card { max-width: 700px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px; }
    .logo { font-size: 22px; font-weight: bold; color: #f59e0b; }
    .table { width: 100%; margin-top: 20px; border-collapse: collapse; }
    .table th, .table td { padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: left; }
    .total { margin-top: 20px; text-align: right; font-size: 16px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">⚡ Equinox Pulse ORM - Tax Invoice</div>
    <p>Invoice #: ${invoice.invoiceNumber}</p>
    <p>Date: ${new Date(invoice.billingDate).toLocaleDateString()}</p>
    <p>Status: ${invoice.status}</p>
    <table class="table">
      <thead>
        <tr><th>Description</th><th>Subtotal</th></tr>
      </thead>
      <tbody>
        <tr><td>Equinox Pulse Subscription</td><td>$${invoice.subtotal.toFixed(2)}</td></tr>
        ${invoice.discountAmount > 0 ? `<tr><td>Discount (${invoice.couponCode || 'Promo'} -${invoice.discountPct}%)</td><td>-$${invoice.discountAmount.toFixed(2)}</td></tr>` : ''}
        <tr><td>Estimated Tax (${invoice.taxPct}%)</td><td>+$${invoice.taxAmount.toFixed(2)}</td></tr>
      </tbody>
    </table>
    <div class="total">Total: $${invoice.totalAmount.toFixed(2)} ${invoice.currency}</div>
  </div>
</body>
</html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${invoice.invoiceNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-base-900 space-y-6 animate-float-up my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                Official Tax Invoice
              </h3>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {invoice.invoiceNumber} · Billed on {new Date(invoice.billingDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Invoice Printable View Container */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/[0.02] space-y-6 font-sans">
          {/* Top Brand Banner */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-white/10">
            <div>
              <span className="text-lg font-black text-amber-500 flex items-center gap-1.5">
                <Zap className="h-5 w-5" /> Equinox Pulse Enterprise
              </span>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Official SaaS Subscription & Tax Invoice
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-500 border border-emerald-500/20">
              STATUS: {invoice.status}
            </span>
          </div>

          {/* Details Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-700 dark:text-slate-300">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Billed Customer</span>
              <p className="text-slate-900 dark:text-slate-100 font-extrabold">Equinox Partner Client Account</p>
              <p>Tax ID: US-9982410-X</p>
              <p>Payment Method: {invoice.paymentMethod}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Invoice Info</span>
              <p className="text-slate-900 dark:text-slate-100 font-extrabold">Invoice #: {invoice.invoiceNumber}</p>
              <p>Billing Date: {new Date(invoice.billingDate).toLocaleDateString()}</p>
              <p>Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden dark:border-white/10">
            <table className="w-full text-left text-xs font-bold">
              <thead className="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase">
                <tr>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10 text-slate-800 dark:text-slate-200">
                <tr>
                  <td className="p-3">Equinox Pulse SaaS Subscription Plan</td>
                  <td className="p-3 text-right">${invoice.subtotal.toFixed(2)}</td>
                </tr>
                {invoice.discountAmount > 0 && (
                  <tr className="text-emerald-600 dark:text-emerald-400">
                    <td className="p-3">Applied Coupon Discount ({invoice.couponCode || 'Promo'} -{invoice.discountPct}%)</td>
                    <td className="p-3 text-right">-${invoice.discountAmount.toFixed(2)}</td>
                  </tr>
                )}
                <tr>
                  <td className="p-3">Estimated State/Federal Tax ({invoice.taxPct}%)</td>
                  <td className="p-3 text-right">+${invoice.taxAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Grand Total Breakdown */}
          <div className="flex flex-col items-end gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-white/10">
            <div>Subtotal: <span>${invoice.subtotal.toFixed(2)}</span></div>
            {invoice.discountAmount > 0 && (
              <div className="text-emerald-500">Discount: <span>-${invoice.discountAmount.toFixed(2)}</span></div>
            )}
            <div>Estimated Tax ({invoice.taxPct}%): <span>+${invoice.taxAmount.toFixed(2)}</span></div>
            <div className="text-base font-black text-slate-900 dark:text-white pt-1 flex items-center gap-2">
              Total Amount Billed: <span className="text-amber-500">${invoice.totalAmount.toFixed(2)} {invoice.currency}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={handleDownloadHtml}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 px-4 py-2 text-xs font-black text-slate-800 hover:bg-slate-200 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
          >
            <Download className="h-4 w-4" /> Download HTML Invoice
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2 text-xs font-black text-slate-950 transition hover:bg-amber-400 shadow-sm"
          >
            <Printer className="h-4 w-4" /> Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
}
