import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/AppLayout';
import {
  dbEngine,
  type ClientBillingRecord,
  type DailyLiveAppLog,
  type ClientInvoiceRecord,
  type ClientRow
} from '@/lib/dbEngine';
import { InvoicePdfModal } from '@/components/InvoicePdfModal';
import {
  DollarSign, FileSpreadsheet, ExternalLink, Calendar, CheckCircle2,
  Clock, AlertTriangle, Plus, Edit, Trash2, Printer, Download, Eye,
  Building2, Layers, ArrowUpRight, FileText, Check, ShieldAlert, Sparkles, Filter, Receipt
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function BillingPage() {
  const { client, userRole, isMasterAdmin } = useAuth();
  const isAdmin = isMasterAdmin || userRole === 'super_admin';

  // Subscriptions & DB Listeners trigger re-render on dbEngine changes
  const [clients] = useState<ClientRow[]>(() => dbEngine.getClients());
  const [billingRecords, setBillingRecords] = useState<ClientBillingRecord[]>(() => dbEngine.getBillingRecords());
  const [dailyLogs, setDailyLogs] = useState<DailyLiveAppLog[]>(() => dbEngine.getDailyLiveLogs(isAdmin ? undefined : client?.id));
  const [invoices, setInvoices] = useState<ClientInvoiceRecord[]>(() => dbEngine.getInvoices(isAdmin ? undefined : client?.id));

  // Sync state when dbEngine triggers notification
  const refreshData = () => {
    setBillingRecords(dbEngine.getBillingRecords());
    setDailyLogs(dbEngine.getDailyLiveLogs(isAdmin ? undefined : client?.id));
    setInvoices(dbEngine.getInvoices(isAdmin ? undefined : client?.id));
  };

  // Modals state
  const [activeTab, setActiveTab] = useState<'overview' | 'live_logs' | 'invoices'>('overview');
  
  // Edit Billing Modal State
  const [editingBilling, setEditingBilling] = useState<ClientBillingRecord | null>(null);
  const [editExcelUrl, setEditExcelUrl] = useState('');
  const [editTotalAmount, setEditTotalAmount] = useState<number>(0);
  const [editPaidAmount, setEditPaidAmount] = useState<number>(0);
  const [editNotes, setEditNotes] = useState('');

  // Add Daily Log Modal State
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [logClientId, setLogClientId] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logCount, setLogCount] = useState<number>(100);
  const [logRate, setLogRate] = useState<number>(50);
  const [logStatus, setLogStatus] = useState<'Live' | 'Pending' | 'Completed'>('Live');
  const [logNotes, setLogNotes] = useState('');

  // Add Invoice Modal State
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [invClientId, setInvClientId] = useState('');
  const [invItemDesc, setInvItemDesc] = useState('');
  const [invQty, setInvQty] = useState<number>(500);
  const [invUnitPrice, setInvUnitPrice] = useState<number>(50);
  const [invTaxPct, setInvTaxPct] = useState<number>(18);
  const [invDueDate, setInvDueDate] = useState('');

  // PDF Preview Modal State
  const [previewInvoice, setPreviewInvoice] = useState<any | null>(null);

  // Filter clients list for admin view
  const nonAdminClients = clients.filter((c) => !c.is_super_admin);

  // Calculated Summary Metrics
  const totalContractedSum = billingRecords.reduce((acc, r) => acc + (r.total_amount || 0), 0);
  const totalPaidSum = billingRecords.reduce((acc, r) => acc + (r.paid_amount || 0), 0);
  const totalPendingSum = billingRecords.reduce((acc, r) => acc + (r.pending_amount || 0), 0);
  const totalLiveReviewsLogged = dailyLogs.reduce((acc, l) => acc + (l.live_count || 0), 0);

  // Specific client metrics if client mode
  const currentClientBilling = billingRecords.find((r) => r.client_id === client?.id) || {
    client_id: client?.id || '',
    app_name: client?.app_name || client?.company_name || 'App Review Campaign',
    excel_sheet_url: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
    total_amount: 120000,
    paid_amount: 85000,
    pending_amount: 35000,
    notes: 'Pending balance for verified Play Store 5-star live reviews campaign batch #4',
    updated_at: new Date().toISOString(),
  };

  // Helper: Open Edit Billing Modal
  const handleOpenEditBilling = (rec: ClientBillingRecord) => {
    setEditingBilling(rec);
    setEditExcelUrl(rec.excel_sheet_url || '');
    setEditTotalAmount(rec.total_amount || 0);
    setEditPaidAmount(rec.paid_amount || 0);
    setEditNotes(rec.notes || '');
  };

  const handleSaveBilling = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBilling) return;
    const calculatedPending = Math.max(0, editTotalAmount - editPaidAmount);

    dbEngine.updateBillingRecord({
      ...editingBilling,
      excel_sheet_url: editExcelUrl,
      total_amount: editTotalAmount,
      paid_amount: editPaidAmount,
      pending_amount: calculatedPending,
      notes: editNotes,
      updated_at: new Date().toISOString(),
    });

    setEditingBilling(null);
    refreshData();
  };

  // Helper: Save Daily Live Log
  const handleSaveDailyLog = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClient = clients.find((c) => c.id === logClientId) || nonAdminClients[0];
    if (!targetClient) return;

    const totalAmt = logCount * logRate;
    dbEngine.addDailyLiveLog({
      client_id: targetClient.id,
      date: logDate,
      app_name: targetClient.app_name || `${targetClient.company_name} Play Store App`,
      live_count: logCount,
      unit_price: logRate,
      total_amount: totalAmt,
      status: logStatus,
      notes: logNotes || `${logCount} Play Store reviews live on ${logDate}`,
    });

    setShowAddLogModal(false);
    refreshData();
  };

  // Helper: Save New Invoice
  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClient = clients.find((c) => c.id === invClientId) || nonAdminClients[0];
    if (!targetClient) return;

    const clientBilling = billingRecords.find((r) => r.client_id === targetClient.id);
    const subtotal = invQty * invUnitPrice;
    const taxAmt = Math.round((subtotal * invTaxPct) / 100);
    const grandTotal = subtotal + taxAmt;

    const invNum = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const todayStr = new Date().toISOString().split('T')[0];
    const dueStr = invDueDate || new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0];

    dbEngine.addInvoice({
      invoice_number: invNum,
      client_id: targetClient.id,
      client_name: targetClient.company_name,
      client_email: targetClient.email,
      invoice_date: todayStr,
      due_date: dueStr,
      app_name: targetClient.app_name || `${targetClient.company_name} App`,
      excel_sheet_url: clientBilling?.excel_sheet_url || 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
      items: [
        {
          description: invItemDesc || `Play Store Live Reviews (${invQty} units @ ₹${invUnitPrice}/unit)`,
          quantity: invQty,
          unit_price: invUnitPrice,
          total: subtotal,
        },
      ],
      subtotal,
      tax_amount: taxAmt,
      grand_total: grandTotal,
      status: 'pending',
    });

    setShowAddInvoiceModal(false);
    refreshData();
  };

  // Helper: Launch PDF Preview
  const handleOpenPdfModal = (inv: ClientInvoiceRecord) => {
    setPreviewInvoice({
      id: inv.id,
      invoiceNumber: inv.invoice_number,
      companyId: inv.client_id,
      billingDate: inv.invoice_date,
      dueDate: inv.due_date,
      subtotal: inv.subtotal,
      taxPct: Math.round((inv.tax_amount / inv.subtotal) * 100) || 18,
      taxAmount: inv.tax_amount,
      discountPct: 0,
      discountAmount: 0,
      totalAmount: inv.grand_total,
      currency: 'INR (₹)',
      status: inv.status.toUpperCase(),
      paymentMethod: 'Bank Transfer / UPI Direct',
      createdAt: inv.created_at,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title={isAdmin ? "Client Amounts & Play Store Live Tracker" : "My Invoices & Play Store Live Tracker"}
        subtitle={
          isAdmin
            ? "Manage per-client pending amounts, Google Excel sheet links, daily Play Store live review activity, and official tax invoices."
            : "Track your pending amount, live Play Store app activity by date, Google Excel sheet records, and official invoices."
        }
        action={
          isAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setLogClientId(nonAdminClients[0]?.id || '');
                  setShowAddLogModal(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white/10 text-white text-xs font-bold hover:bg-slate-800 transition shadow-sm border border-white/10"
              >
                <Plus className="w-4 h-4" /> Log Daily Live Activity
              </button>
              <button
                onClick={() => {
                  setInvClientId(nonAdminClients[0]?.id || '');
                  setShowAddInvoiceModal(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-slate-950 text-xs font-bold hover:bg-primary/90 transition shadow-sm gold-glow"
              >
                <Plus className="w-4 h-4" /> Create Invoice
              </button>
            </div>
          )
        }
      />

      {/* KPI Cards Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Outstanding Pending Amount */}
        <div className={cn(
          "p-5 rounded-2xl border backdrop-blur transition shadow-sm",
          (isAdmin ? totalPendingSum > 0 : currentClientBilling.pending_amount > 0)
            ? "bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200"
            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200"
        )}>
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 uppercase">
              Action Required
            </span>
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-widest text-slate-500 dark:text-muted-foreground font-semibold">
            {isAdmin ? "Total Outstanding Pending" : "My Pending Balance"}
          </p>
          <p className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            ₹ {(isAdmin ? totalPendingSum : currentClientBilling.pending_amount).toLocaleString('en-IN')}
          </p>
        </div>

        {/* Card 2: Total Contracted Amount */}
        <div className="p-5 rounded-2xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-primary/15 text-primary border border-primary/30 uppercase">
              Agreed Value
            </span>
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-widest text-slate-500 dark:text-muted-foreground font-semibold">
            {isAdmin ? "Total Agency Contract Value" : "My Total Campaign Amount"}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            ₹ {(isAdmin ? totalContractedSum : currentClientBilling.total_amount).toLocaleString('en-IN')}
          </p>
        </div>

        {/* Card 3: Paid Amount */}
        <div className="p-5 rounded-2xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase">
              Cleared
            </span>
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-widest text-slate-500 dark:text-muted-foreground font-semibold">
            {isAdmin ? "Total Payments Collected" : "Total Amount Paid"}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            ₹ {(isAdmin ? totalPaidSum : currentClientBilling.paid_amount).toLocaleString('en-IN')}
          </p>
        </div>

        {/* Card 4: Daily Live Reviews Logged */}
        <div className="p-5 rounded-2xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase">
              Live Verified
            </span>
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-widest text-slate-500 dark:text-muted-foreground font-semibold">
            Play Store Live Reviews
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {totalLiveReviewsLogged.toLocaleString('en-IN')} <span className="text-xs text-slate-400 font-normal">units</span>
          </p>
        </div>
      </div>

      {/* Client View Prominent Excel Banner */}
      {!isAdmin && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-primary/10 border border-amber-500/30 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-md">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                Play Store Live Activity & Review Excel Sheet
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium max-w-2xl">
                Super Admin updates your daily live review count, rating release status, and Excel sheet link here. Click below to view live raw campaign data directly in Google Sheets.
              </p>
              {currentClientBilling.notes && (
                <div className="mt-2 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg inline-block">
                  📌 Admin Note: {currentClientBilling.notes}
                </div>
              )}
            </div>
          </div>
          <a
            href={currentClientBilling.excel_sheet_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition shrink-0 shadow-md gold-glow"
          >
            Open Official Excel Sheet <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2",
            activeTab === 'overview'
              ? "bg-primary/15 text-primary border border-primary/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <Building2 className="w-4 h-4" /> {isAdmin ? "Client Amounts & Excel Registry" : "Financial Overview & Sheet"}
        </button>
        <button
          onClick={() => setActiveTab('live_logs')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2",
            activeTab === 'live_logs'
              ? "bg-primary/15 text-primary border border-primary/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <FileSpreadsheet className="w-4 h-4" /> Daily Live Reviews Log ({dailyLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2",
            activeTab === 'invoices'
              ? "bg-primary/15 text-primary border border-primary/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <Receipt className="w-4 h-4" /> Tax Invoices ({invoices.length})
        </button>
      </div>

      {/* Tab 1: Client Amounts & Excel Registry */}
      {activeTab === 'overview' && (
        <div className="bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isAdmin ? "Client Accounts Financial & Excel Master Sheet" : "My Account Financial Summary"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isAdmin
                  ? "Update contract amount, collected payment, pending balance, and Excel sheet links for each client."
                  : "View agreed contract amount, payments processed, and current pending balance."}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium">
              <thead className="bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-extrabold tracking-wider border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="p-3">Client Account & App</th>
                  <th className="p-3">Excel Data Link</th>
                  <th className="p-3 text-right">Total Amount</th>
                  <th className="p-3 text-right">Paid Amount</th>
                  <th className="p-3 text-right">Pending Amount</th>
                  <th className="p-3">Notes / Status</th>
                  {isAdmin && <th className="p-3 text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10 text-slate-800 dark:text-slate-200">
                {(isAdmin ? nonAdminClients : [client!]).map((c) => {
                  const bRecord = billingRecords.find((r) => r.client_id === c.id) || {
                    client_id: c.id,
                    app_name: c.app_name || c.company_name,
                    excel_sheet_url: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
                    total_amount: 100000,
                    paid_amount: 60000,
                    pending_amount: 40000,
                    notes: 'Play Store campaign in progress',
                    updated_at: new Date().toISOString(),
                  };

                  const hasPending = bRecord.pending_amount > 0;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {c.app_icon_url ? (
                            <img src={c.app_icon_url} alt="" className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-white/10" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                              {c.company_name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-xs">{c.company_name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{c.app_name || c.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        {bRecord.excel_sheet_url ? (
                          <a
                            href={bRecord.excel_sheet_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500/20 transition border border-emerald-500/20"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" /> Open Excel ↗
                          </a>
                        ) : (
                          <span className="text-slate-400 text-[10px]">No link added</span>
                        )}
                      </td>

                      <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                        ₹ {bRecord.total_amount.toLocaleString('en-IN')}
                      </td>

                      <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        ₹ {bRecord.paid_amount.toLocaleString('en-IN')}
                      </td>

                      <td className="p-3 text-right font-black">
                        <span className={cn(
                          "px-2 py-0.5 rounded-md",
                          hasPending ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30" : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        )}>
                          ₹ {bRecord.pending_amount.toLocaleString('en-IN')}
                        </span>
                      </td>

                      <td className="p-3 max-w-xs truncate text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                        {bRecord.notes || '—'}
                      </td>

                      {isAdmin && (
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleOpenEditBilling(bRecord)}
                            className="px-3 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition font-bold text-xs border border-primary/20"
                          >
                            <Edit className="w-3.5 h-3.5 inline mr-1" /> Edit Amount
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Daily Play Store Live Reviews Log */}
      {activeTab === 'live_logs' && (
        <div className="bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-white/10">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Play Store Daily Live Review Activity Log
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Date-wise breakdown of live reviews published on Google Play Store with unit rates and cost breakdown.
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => {
                  setLogClientId(nonAdminClients[0]?.id || '');
                  setShowAddLogModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-primary text-slate-950 font-bold text-xs hover:bg-primary/90 transition shadow-sm"
              >
                + Add Live Entry
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium">
              <thead className="bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-extrabold tracking-wider border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Client & App Name</th>
                  <th className="p-3 text-right">Live Reviews Count</th>
                  <th className="p-3 text-right">Unit Rate</th>
                  <th className="p-3 text-right">Total Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Notes</th>
                  {isAdmin && <th className="p-3 text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10 text-slate-800 dark:text-slate-200">
                {dailyLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-400 text-xs">
                      No live logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  dailyLogs.map((log) => {
                    const cObj = clients.find((c) => c.id === log.client_id);
                    return (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                        <td className="p-3 font-bold text-slate-900 dark:text-white">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-amber-500" /> {log.date}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900 dark:text-white">{cObj?.company_name || 'Client App'}</div>
                          <div className="text-[10px] text-slate-400 truncate">{log.app_name}</div>
                        </td>
                        <td className="p-3 text-right font-black text-amber-600 dark:text-amber-400">
                          {log.live_count} Live Reviews
                        </td>
                        <td className="p-3 text-right text-slate-500">
                          ₹ {log.unit_price} / unit
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                          ₹ {log.total_amount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                            log.status === 'Live'
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                          )}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3 max-w-xs text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {log.notes || '—'}
                        </td>
                        {isAdmin && (
                          <td className="p-3 text-center">
                            <button
                              onClick={() => {
                                dbEngine.deleteDailyLiveLog(log.id);
                                refreshData();
                              }}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition"
                              title="Delete Log Entry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Tax Invoices */}
      {activeTab === 'invoices' && (
        <div className="bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-white/10">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Official Tax Invoices &amp; Receipts
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Download or print itemized tax invoices for Play Store review campaigns and ORM subscription services.
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => {
                  setInvClientId(nonAdminClients[0]?.id || '');
                  setShowAddInvoiceModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-primary text-slate-950 font-bold text-xs hover:bg-primary/90 transition shadow-sm gold-glow"
              >
                + Create New Invoice
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium">
              <thead className="bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-extrabold tracking-wider border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="p-3">Invoice #</th>
                  <th className="p-3">Billed Client</th>
                  <th className="p-3">Invoice Date</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3 text-right">Grand Total</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10 text-slate-800 dark:text-slate-200">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400 text-xs">
                      No invoices created yet.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                      <td className="p-3 font-mono font-bold text-primary">
                        {inv.invoice_number}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white">{inv.client_name}</div>
                        <div className="text-[10px] text-slate-400">{inv.client_email}</div>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{inv.invoice_date}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{inv.due_date}</td>
                      <td className="p-3 text-right font-black text-slate-900 dark:text-white">
                        ₹ {inv.grand_total.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                          inv.status === 'paid'
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        )}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenPdfModal(inv)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-primary/20 text-slate-700 dark:text-slate-200 hover:text-primary transition font-bold text-[11px] flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> View / Print PDF
                          </button>
                          {isAdmin && inv.status !== 'paid' && (
                            <button
                              onClick={() => {
                                dbEngine.updateInvoiceStatus(inv.id, 'paid');
                                refreshData();
                              }}
                              className="px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 transition font-bold text-[11px]"
                            >
                              Mark Paid
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => {
                                dbEngine.deleteInvoice(inv.id);
                                refreshData();
                              }}
                              className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Billing Modal */}
      {editingBilling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900 space-y-4 animate-float-up">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Update Client Amount &amp; Excel Link
            </h3>
            <form onSubmit={handleSaveBilling} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Google Excel Sheet Link (Live Data Tracking)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={editExcelUrl}
                  onChange={(e) => setEditExcelUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Total Contract Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={editTotalAmount}
                    onChange={(e) => setEditTotalAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Paid Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={editPaidAmount}
                    onChange={(e) => setEditPaidAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-700 dark:text-amber-300">
                Calculated Pending Amount: ₹ {Math.max(0, editTotalAmount - editPaidAmount).toLocaleString('en-IN')}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Admin Remarks / Campaign Notes
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Pending ₹35,000 for Play Store 5-star live reviews batch #4"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBilling(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-primary text-slate-950 hover:bg-primary/90 transition shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Daily Live Activity Modal */}
      {showAddLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900 space-y-4 animate-float-up">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Log Play Store Live Reviews Entry
            </h3>
            <form onSubmit={handleSaveDailyLog} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Client Account</label>
                <select
                  value={logClientId}
                  onChange={(e) => setLogClientId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white"
                >
                  {nonAdminClients.map((c) => (
                    <option key={c.id} value={c.id}>{c.company_name} ({c.app_name || c.email})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Live Reviews Count</label>
                  <input
                    type="number"
                    required
                    value={logCount}
                    onChange={(e) => setLogCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Unit Rate (₹ / review)</label>
                  <input
                    type="number"
                    required
                    value={logRate}
                    onChange={(e) => setLogRate(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Live Status</label>
                  <select
                    value={logStatus}
                    onChange={(e) => setLogStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white"
                  >
                    <option value="Live">Live on Play Store</option>
                    <option value="Pending">Pending Sync</option>
                    <option value="Completed">Completed Batch</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                <input
                  type="text"
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  placeholder="e.g. 150 reviews live on Play Store store page"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLogModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-primary text-slate-950 hover:bg-primary/90 transition shadow-sm"
                >
                  Save Log Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Invoice Modal */}
      {showAddInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900 space-y-4 animate-float-up">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Create New Tax Invoice
            </h3>
            <form onSubmit={handleSaveInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Client Account</label>
                <select
                  value={invClientId}
                  onChange={(e) => setInvClientId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white"
                >
                  {nonAdminClients.map((c) => (
                    <option key={c.id} value={c.id}>{c.company_name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Item Description</label>
                <input
                  type="text"
                  required
                  value={invItemDesc}
                  onChange={(e) => setInvItemDesc(e.target.value)}
                  placeholder="e.g. Play Store 5-Star Verified Live Reviews Batch #4"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    value={invQty}
                    onChange={(e) => setInvQty(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={invUnitPrice}
                    onChange={(e) => setInvUnitPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">GST Tax (%)</label>
                  <input
                    type="number"
                    required
                    value={invTaxPct}
                    onChange={(e) => setInvTaxPct(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 text-xs space-y-1 font-semibold">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹ {(invQty * invUnitPrice).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST ({invTaxPct}%):</span>
                  <span>₹ {Math.round((invQty * invUnitPrice * invTaxPct) / 100).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-black text-amber-600 dark:text-primary pt-1 border-t border-slate-200 dark:border-white/10">
                  <span>Grand Total:</span>
                  <span>₹ {(invQty * invUnitPrice + Math.round((invQty * invUnitPrice * invTaxPct) / 100)).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddInvoiceModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-primary text-slate-950 hover:bg-primary/90 transition shadow-sm gold-glow"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Modal Viewer */}
      <InvoicePdfModal
        isOpen={!!previewInvoice}
        onClose={() => setPreviewInvoice(null)}
        invoice={previewInvoice}
      />
    </div>
  );
}
