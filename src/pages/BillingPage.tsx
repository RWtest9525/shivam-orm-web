import { useState, useMemo } from 'react';
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
  Building2, Folder, FolderOpen, ArrowUpRight, FileText, Check, ShieldAlert,
  Sparkles, Filter, Receipt, ArrowRight, ChevronRight, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function BillingPage() {
  const { client, userRole, isMasterAdmin } = useAuth();
  const isAdmin = isMasterAdmin || userRole === 'super_admin';

  // Subscriptions & DB Listeners
  const [clients] = useState<ClientRow[]>(() => dbEngine.getClients());
  const [billingRecords, setBillingRecords] = useState<ClientBillingRecord[]>(() => dbEngine.getBillingRecords());
  const [dailyLogs, setDailyLogs] = useState<DailyLiveAppLog[]>(() => dbEngine.getDailyLiveLogs(isAdmin ? undefined : client?.id));
  const [invoices, setInvoices] = useState<ClientInvoiceRecord[]>(() => dbEngine.getInvoices(isAdmin ? undefined : client?.id));

  // Filter States
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL');
  const [activeFolderModal, setActiveFolderModal] = useState<{
    clientObj: ClientRow;
    monthKey: string;
    monthLabel: string;
  } | null>(null);

  // Modals state
  const [editingBilling, setEditingBilling] = useState<ClientBillingRecord | null>(null);
  const [editExcelUrl, setEditExcelUrl] = useState('');
  const [editTotalAmount, setEditTotalAmount] = useState<number>(0);
  const [editPaidAmount, setEditPaidAmount] = useState<number>(0);
  const [editNotes, setEditNotes] = useState('');

  // Add Daily Log Modal State
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [logClientId, setLogClientId] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logCount, setLogCount] = useState<number>(150);
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

  const nonAdminClients = clients.filter((c) => !c.is_super_admin);
  const displayClients = isAdmin ? nonAdminClients : [client!].filter(Boolean);

  const refreshData = () => {
    setBillingRecords(dbEngine.getBillingRecords());
    setDailyLogs(dbEngine.getDailyLiveLogs(isAdmin ? undefined : client?.id));
    setInvoices(dbEngine.getInvoices(isAdmin ? undefined : client?.id));
  };

  // Calculated Overall Metrics
  const totalContractedSum = useMemo(() => billingRecords.reduce((acc, r) => acc + (r.total_amount || 0), 0), [billingRecords]);
  const totalPaidSum = useMemo(() => billingRecords.reduce((acc, r) => acc + (r.paid_amount || 0), 0), [billingRecords]);
  const totalPendingSum = useMemo(() => billingRecords.reduce((acc, r) => acc + (r.pending_amount || 0), 0), [billingRecords]);
  const totalLiveReviewsLogged = useMemo(() => dailyLogs.reduce((acc, l) => acc + (l.live_count || 0), 0), [dailyLogs]);

  // Current client specific billing if client mode
  const currentClientBilling = useMemo(() => {
    return billingRecords.find((r) => r.client_id === client?.id) || {
      client_id: client?.id || '',
      app_name: client?.app_name || client?.company_name || 'App Campaign',
      excel_sheet_url: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
      total_amount: 120000,
      paid_amount: 85000,
      pending_amount: 35000,
      notes: 'Pending balance for Play Store 5-star live reviews campaign batch #4',
      updated_at: new Date().toISOString(),
    };
  }, [billingRecords, client]);

  // Helper: Mark Month / Invoice as Paid by Super Admin
  const handleMarkAsPaid = (targetClientId: string, invoiceId?: string) => {
    if (invoiceId) {
      dbEngine.updateInvoiceStatus(invoiceId, 'paid');
    } else {
      const record = billingRecords.find((r) => r.client_id === targetClientId);
      if (record && record.pending_amount > 0) {
        dbEngine.updateBillingRecord({
          ...record,
          paid_amount: record.paid_amount + record.pending_amount,
          pending_amount: 0,
          notes: 'Invoice marked as PAID by Admin',
        });
      }
    }
    refreshData();
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

  // Predefined Month Folders
  const MONTH_FOLDERS = [
    { key: '2026-08', label: 'August 2026', range: '01 Aug - 31 Aug 2026' },
    { key: '2026-07', label: 'July 2026', range: '01 Jul - 31 Jul 2026' },
    { key: '2026-06', label: 'June 2026', range: '01 Jun - 30 Jun 2026' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title={isAdmin ? "Client Amounts & Invoicing Workspace" : "My Account Invoices & Live Tracker"}
        subtitle={
          isAdmin
            ? "Per-client folder invoice system. Update amounts, manage Excel links, log Play Store daily live reviews, and mark payments as paid."
            : "View your campaign folders, daily Play Store live activity breakdown, Excel sheet records, and official invoices."
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

      {/* Top Summary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Outstanding Pending */}
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
              {isAdmin ? "Total Outstanding" : "My Balance Due"}
            </span>
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-widest text-slate-500 dark:text-muted-foreground font-semibold">
            Total Outstanding Pending
          </p>
          <p className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            ₹ {(isAdmin ? totalPendingSum : currentClientBilling.pending_amount).toLocaleString('en-IN')}
          </p>
        </div>

        {/* Card 2: Total Payments Received */}
        <div className="p-5 rounded-2xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase">
              Received / Paid
            </span>
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-widest text-slate-500 dark:text-muted-foreground font-semibold">
            Total Payment Cleared
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            ₹ {(isAdmin ? totalPaidSum : currentClientBilling.paid_amount).toLocaleString('en-IN')}
          </p>
        </div>

        {/* Card 3: Total Contract Value */}
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
            Total Agreed Contract
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            ₹ {(isAdmin ? totalContractedSum : currentClientBilling.total_amount).toLocaleString('en-IN')}
          </p>
        </div>

        {/* Card 4: Total Live Reviews Count */}
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
            Total Play Store Live Count
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {totalLiveReviewsLogged.toLocaleString('en-IN')} <span className="text-xs text-slate-400 font-normal">units</span>
          </p>
        </div>
      </div>

      {/* Filter Bar (Month & Status Filter) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 pr-2 border-r border-slate-200 dark:border-white/10 shrink-0">
            <Filter className="w-3.5 h-3.5 text-primary" /> Filter Month:
          </span>
          <button
            onClick={() => setSelectedMonth('ALL')}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0",
              selectedMonth === 'ALL'
                ? "bg-primary text-slate-950 shadow-sm"
                : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
            )}
          >
            All Months
          </button>
          {MONTH_FOLDERS.map((m) => (
            <button
              key={m.key}
              onClick={() => setSelectedMonth(m.key)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5",
                selectedMonth === m.key
                  ? "bg-primary text-slate-950 shadow-sm"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
              )}
            >
              <Calendar className="w-3.5 h-3.5" /> {m.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-slate-500">Status:</span>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white font-bold"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending Balance Only</option>
            <option value="PAID">Paid / Cleared Only</option>
          </select>
        </div>
      </div>

      {/* Main Per-Client & App Month Folder Grid */}
      <div className="space-y-6">
        {displayClients.map((c) => {
          const bRecord = billingRecords.find((r) => r.client_id === c.id) || {
            client_id: c.id,
            app_name: c.app_name || c.company_name,
            excel_sheet_url: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
            total_amount: 120000,
            paid_amount: 85000,
            pending_amount: 35000,
            notes: 'Pending ₹35,000 for Play Store 5-star live reviews batch #4',
            updated_at: new Date().toISOString(),
          };

          const clientLogs = dailyLogs.filter((l) => l.client_id === c.id);
          const clientInvoices = invoices.filter((i) => i.client_id === c.id);

          const hasPending = bRecord.pending_amount > 0;

          if (selectedStatusFilter === 'PENDING' && !hasPending) return null;
          if (selectedStatusFilter === 'PAID' && hasPending) return null;

          return (
            <div
              key={c.id}
              className="bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-6 transition hover:border-primary/30"
            >
              {/* App / Client Header Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shrink-0 shadow-md overflow-hidden">
                    {c.app_icon_url ? (
                      <img src={c.app_icon_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      {c.company_name}
                      {hasPending ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 uppercase">
                          Pending: ₹{bRecord.pending_amount.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase">
                          Paid / Cleared
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      App: {c.app_name || 'Play Store App'} · Email: {c.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {bRecord.excel_sheet_url && (
                    <a
                      href={bRecord.excel_sheet_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs hover:bg-emerald-500/20 transition border border-emerald-500/20 shadow-sm"
                    >
                      <FileSpreadsheet className="w-4 h-4" /> Open Admin Excel Sheet ↗
                    </a>
                  )}

                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleOpenEditBilling(bRecord)}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-primary/20 text-slate-800 dark:text-white font-bold text-xs transition border border-slate-200 dark:border-white/10"
                      >
                        <Edit className="w-3.5 h-3.5 inline mr-1" /> Edit Amounts
                      </button>

                      {hasPending && (
                        <button
                          onClick={() => handleMarkAsPaid(c.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition font-black text-xs shadow-md"
                        >
                          ✓ Mark as Paid
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Financial Progress Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 text-xs font-semibold">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-extrabold">Agreed Contract Amount</span>
                  <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">₹ {bRecord.total_amount.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-extrabold">Amount Paid so far</span>
                  <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">₹ {bRecord.paid_amount.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-extrabold">Remaining Pending Balance</span>
                  <p className={cn("text-base font-black mt-0.5", hasPending ? "text-rose-600 dark:text-rose-400" : "text-emerald-500")}>
                    ₹ {bRecord.pending_amount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Month Folders Container */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Folder className="w-4 h-4 text-amber-500" /> Monthly Report Folders (1st to Last Date)
                  </span>
                  <span>Click folder to open date-wise breakdown</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {MONTH_FOLDERS.filter((m) => selectedMonth === 'ALL' || selectedMonth === m.key).map((m) => {
                    const monthLogs = clientLogs.filter((l) => l.date.startsWith(m.key));
                    const monthLiveSum = monthLogs.reduce((acc, l) => acc + l.live_count, 0);
                    const monthCostSum = monthLogs.reduce((acc, l) => acc + l.total_amount, 0);

                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setActiveFolderModal({ clientObj: c, monthKey: m.key, monthLabel: m.label })}
                        className="group flex flex-col justify-between p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/30 hover:border-amber-500/50 hover:bg-amber-500/5 transition text-left shadow-sm"
                      >
                        <div className="flex items-start justify-between w-full">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center group-hover:scale-110 transition shrink-0">
                              <FolderOpen className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition">
                                {m.label}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-medium">{m.range}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition" />
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs w-full font-bold">
                          <span className="text-slate-500 dark:text-slate-400">
                            {monthLiveSum} Live Reviews
                          </span>
                          <span className="text-amber-600 dark:text-amber-400">
                            ₹ {monthCostSum.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Invoices List for this Client */}
              {clientInvoices.length > 0 && (
                <div className="pt-2 border-t border-slate-200 dark:border-white/10 space-y-2">
                  <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-primary" /> Generated Tax Invoices
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {clientInvoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] flex items-center justify-between text-xs font-bold"
                      >
                        <div>
                          <div className="font-mono text-primary">{inv.invoice_number}</div>
                          <div className="text-slate-500 text-[10px]">{inv.invoice_date} · Due: {inv.due_date}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900 dark:text-white">₹ {inv.grand_total.toLocaleString('en-IN')}</span>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[9px] uppercase font-bold",
                            inv.status === 'paid' ? "bg-emerald-500/15 text-emerald-500" : "bg-amber-500/15 text-amber-500"
                          )}>
                            {inv.status}
                          </span>
                          <button
                            onClick={() => handleOpenPdfModal(inv)}
                            className="p-1 text-slate-400 hover:text-primary transition"
                            title="View / Print PDF"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Month Folder Detailed Popup / Modal */}
      {activeFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900 space-y-5 animate-float-up my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    {activeFolderModal.clientObj.company_name} — {activeFolderModal.monthLabel}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Date-wise breakdown of live reviews published on Google Play Store from 1st to last date of month.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveFolderModal(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Folder Date-Wise Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium">
                <thead className="bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-extrabold tracking-wider border-b border-slate-200 dark:border-white/10">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">App Name</th>
                    <th className="p-3 text-right">Live Count</th>
                    <th className="p-3 text-right">Rate / Review</th>
                    <th className="p-3 text-right">Daily Cost</th>
                    <th className="p-3">Live Status</th>
                    <th className="p-3">Excel Sheet Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10 text-slate-800 dark:text-slate-200">
                  {dailyLogs
                    .filter((l) => l.client_id === activeFolderModal.clientObj.id && l.date.startsWith(activeFolderModal.monthKey))
                    .length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400 text-xs">
                        No daily logs recorded for {activeFolderModal.monthLabel} yet.
                      </td>
                    </tr>
                  ) : (
                    dailyLogs
                      .filter((l) => l.client_id === activeFolderModal.clientObj.id && l.date.startsWith(activeFolderModal.monthKey))
                      .map((log) => {
                        const bRec = billingRecords.find((r) => r.client_id === activeFolderModal.clientObj.id);
                        return (
                          <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                            <td className="p-3 font-bold text-slate-900 dark:text-white">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-amber-500" /> {log.date}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-slate-900 dark:text-white">{log.app_name}</td>
                            <td className="p-3 text-right font-black text-amber-600 dark:text-amber-400">{log.live_count} Live</td>
                            <td className="p-3 text-right text-slate-500">₹ {log.unit_price}</td>
                            <td className="p-3 text-right font-bold text-slate-900 dark:text-white">₹ {log.total_amount.toLocaleString('en-IN')}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-500 uppercase">
                                {log.status}
                              </span>
                            </td>
                            <td className="p-3">
                              {bRec?.excel_sheet_url ? (
                                <a
                                  href={bRec.excel_sheet_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold hover:bg-emerald-500/20"
                                >
                                  Open Excel ↗
                                </a>
                              ) : (
                                <span className="text-slate-400 text-[10px]">No link</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/10">
              <div className="text-xs font-bold text-slate-500">
                Total Live for Month: {dailyLogs.filter((l) => l.client_id === activeFolderModal.clientObj.id && l.date.startsWith(activeFolderModal.monthKey)).reduce((acc, l) => acc + l.live_count, 0)} units
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    onClick={() => {
                      handleMarkAsPaid(activeFolderModal.clientObj.id);
                      setActiveFolderModal(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition"
                  >
                    ✓ Mark Month as Paid
                  </button>
                )}
                <button
                  onClick={() => setActiveFolderModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Close Folder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Billing Modal */}
      {editingBilling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900 space-y-4 animate-float-up">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Update Client Amounts &amp; Excel Sheet Link
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
