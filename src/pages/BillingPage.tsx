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
  Sparkles, Filter, Receipt, ArrowRight, ChevronRight, X, ArrowLeft, Search, Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function BillingPage() {
  const { client, userRole, isMasterAdmin, isDemoMode } = useAuth();
  const isAdmin = (isMasterAdmin || userRole === 'super_admin') && !isDemoMode;

  // Data listeners & state
  const [clients] = useState<ClientRow[]>(() => dbEngine.getClients());
  const [billingRecords, setBillingRecords] = useState<ClientBillingRecord[]>(() => dbEngine.getBillingRecords());
  const [dailyLogs, setDailyLogs] = useState<DailyLiveAppLog[]>(() => dbEngine.getDailyLiveLogs());
  const [invoices, setInvoices] = useState<ClientInvoiceRecord[]>(() => dbEngine.getInvoices());

  // Navigation View State: null = Card-by-Card View, or selected Client object = Date-by-Date View
  const [selectedAppClient, setSelectedAppClient] = useState<ClientRow | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL');

  // Modals state
  // 1. Edit App Contract & Master Excel Modal
  const [editingBilling, setEditingBilling] = useState<ClientBillingRecord | null>(null);
  const [editExcelUrl, setEditExcelUrl] = useState('');
  const [editTotalAmount, setEditTotalAmount] = useState<number>(0);
  const [editPaidAmount, setEditPaidAmount] = useState<number>(0);
  const [editNotes, setEditNotes] = useState('');

  // 2. Add / Edit Specific Date Entry Modal
  const [editingDateLog, setEditingDateLog] = useState<DailyLiveAppLog | null>(null);
  const [showAddDateModal, setShowAddDateModal] = useState(false);
  const [logClientId, setLogClientId] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logCount, setLogCount] = useState<number>(150);
  const [logRate, setLogRate] = useState<number>(50);
  const [logStatus, setLogStatus] = useState<'Live' | 'Pending' | 'Completed'>('Live');
  const [logNotes, setLogNotes] = useState('');

  // PDF Preview Modal State
  const [previewInvoice, setPreviewInvoice] = useState<any | null>(null);

  const refreshData = () => {
    setBillingRecords(dbEngine.getBillingRecords());
    setDailyLogs(dbEngine.getDailyLiveLogs());
    setInvoices(dbEngine.getInvoices());
  };

  const nonAdminClients = clients.filter((c) => !c.is_super_admin);
  const displayClients = isAdmin ? nonAdminClients : [client!].filter(Boolean);

  // Filtered Cards
  const filteredClients = displayClients.filter((c) => {
    const matchesSearch =
      c.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.app_name && c.app_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const bRecord = billingRecords.find((r) => r.client_id === c.id);
    const isPending = bRecord ? bRecord.pending_amount > 0 : false;

    if (statusFilter === 'PENDING' && !isPending) return false;
    if (statusFilter === 'PAID' && isPending) return false;

    return matchesSearch;
  });

  // Overall Calculated Metrics
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

  // Handler: Open Edit App Contract Modal
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

  // Handler: Add / Update Date Entry
  const handleSaveDateLog = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClientId = editingDateLog ? editingDateLog.client_id : (selectedAppClient?.id || logClientId || nonAdminClients[0]?.id);
    const targetClient = clients.find((c) => c.id === targetClientId);
    if (!targetClient) return;

    const totalAmt = logCount * logRate;

    if (editingDateLog) {
      dbEngine.updateDailyLiveLog({
        ...editingDateLog,
        date: logDate,
        live_count: logCount,
        unit_price: logRate,
        total_amount: totalAmt,
        status: logStatus,
        notes: logNotes,
      });
    } else {
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
    }

    setEditingDateLog(null);
    setShowAddDateModal(false);
    refreshData();
  };

  // Helper: Mark Specific Date or Client Invoice as Paid
  const handleMarkAsPaid = (targetClientId: string, dateLogId?: string) => {
    if (dateLogId) {
      const log = dailyLogs.find((l) => l.id === dateLogId);
      if (log) {
        dbEngine.updateDailyLiveLog({
          ...log,
          status: 'Live',
          notes: 'Marked as PAID by Admin',
        });
      }
    }

    const record = billingRecords.find((r) => r.client_id === targetClientId);
    if (record && record.pending_amount > 0) {
      dbEngine.updateBillingRecord({
        ...record,
        paid_amount: record.paid_amount + record.pending_amount,
        pending_amount: 0,
        notes: 'Invoice marked as PAID by Admin',
      });
    }
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
      {/* Page Header */}
      <PageHeader
        title="Client Invoice"
        subtitle={
          selectedAppClient
            ? `Date-by-date live status, amounts, and Excel records for ${selectedAppClient.company_name}`
            : "Select an App Card to inspect date-by-date live counts, update daily amounts, and access Google Excel sheets."
        }
        action={
          selectedAppClient && (
            <button
              onClick={() => setSelectedAppClient(null)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white font-bold text-xs transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back to App Cards
            </button>
          )
        }
      />

      {/* Top Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Outstanding Balance */}
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

        {/* Card 2: Total Payment Cleared */}
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
            Total Payment Cleared
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            ₹ {(isAdmin ? totalPaidSum : currentClientBilling.paid_amount).toLocaleString('en-IN')}
          </p>
        </div>

        {/* Card 3: Total Contracted Sum */}
        <div className="p-5 rounded-2xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-primary/15 text-primary border border-primary/30 uppercase">
              Contracted
            </span>
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-widest text-slate-500 dark:text-muted-foreground font-semibold">
            Total Agreed Contract
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            ₹ {(isAdmin ? totalContractedSum : currentClientBilling.total_amount).toLocaleString('en-IN')}
          </p>
        </div>

        {/* Card 4: Total Live Review Units */}
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

      {/* ========================================================================= */}
      {/* LEVEL 1: CARD-BY-CARD VIEW (Displayed when selectedAppClient is null) */}
      {/* ========================================================================= */}
      {!selectedAppClient && (
        <div className="space-y-6">
          {/* Search & Filter Controls */}
          <div className="p-4 rounded-2xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search app or client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white focus:outline-none focus:border-primary font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white font-bold"
              >
                <option value="ALL">All App Accounts</option>
                <option value="PENDING">Pending Balance Only</option>
                <option value="PAID">Paid / Cleared Only</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((c) => {
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

              const appLogs = dailyLogs.filter((l) => l.client_id === c.id);
              const totalAppLiveCount = appLogs.reduce((acc, l) => acc + l.live_count, 0);
              const hasPending = bRecord.pending_amount > 0;

              return (
                <div
                  key={c.id}
                  className="bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all flex flex-col justify-between space-y-5 group"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shrink-0 shadow-md overflow-hidden">
                          {c.app_icon_url ? (
                            <img src={c.app_icon_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-primary transition truncate">
                            {c.company_name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                            {c.app_name || c.email}
                          </p>
                        </div>
                      </div>

                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0",
                        hasPending
                          ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                          : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      )}>
                        {hasPending ? `Pending: ₹${bRecord.pending_amount.toLocaleString('en-IN')}` : "Cleared"}
                      </span>
                    </div>

                    {/* Financial Metrics Summary */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 text-center">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Total</div>
                        <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">₹ {bRecord.total_amount.toLocaleString('en-IN')}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Paid</div>
                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">₹ {bRecord.paid_amount.toLocaleString('en-IN')}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Pending</div>
                        <div className={cn("text-xs font-black mt-0.5", hasPending ? "text-rose-600 dark:text-rose-400" : "text-emerald-500")}>
                          ₹ {bRecord.pending_amount.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Excel Link & Notes */}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      {bRecord.excel_sheet_url ? (
                        <a
                          href={bRecord.excel_sheet_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500/20 transition border border-emerald-500/20 text-[11px]"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" /> Admin Excel Sheet ↗
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[10px]">No Excel link set</span>
                      )}

                      <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">
                        {totalAppLiveCount} Live Logged
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
                    {isAdmin && (
                      <button
                        onClick={() => handleOpenEditBilling(bRecord)}
                        className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs transition border border-slate-200 dark:border-white/5"
                      >
                        <Edit className="w-3.5 h-3.5 inline mr-1" /> Edit Contract
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedAppClient(c)}
                      className="flex-1 px-4 py-2 rounded-xl bg-primary text-slate-950 font-black text-xs hover:bg-primary/90 transition text-center shadow-md gold-glow flex items-center justify-center gap-1.5"
                    >
                      <span>Date-by-Date Breakdown</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 2: DATE-BY-DATE BREAKDOWN VIEW (When an App Card is clicked) */}
      {/* ========================================================================= */}
      {selectedAppClient && (
        <div className="space-y-6 animate-float-up">
          {/* Selected App Banner */}
          <div className="p-6 rounded-3xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shrink-0 shadow-md overflow-hidden">
                {selectedAppClient.app_icon_url ? (
                  <img src={selectedAppClient.app_icon_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-7 h-7" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  {selectedAppClient.company_name}
                  <span className="text-xs font-semibold text-slate-400">({selectedAppClient.app_name || selectedAppClient.email})</span>
                </h2>
                <div className="flex items-center gap-4 mt-1 text-xs font-bold text-slate-500 dark:text-slate-300">
                  <span>Total: ₹ {(billingRecords.find((r) => r.client_id === selectedAppClient.id)?.total_amount || 0).toLocaleString('en-IN')}</span>
                  <span>Paid: ₹ {(billingRecords.find((r) => r.client_id === selectedAppClient.id)?.paid_amount || 0).toLocaleString('en-IN')}</span>
                  <span className="text-rose-500 font-black">
                    Pending: ₹ {(billingRecords.find((r) => r.client_id === selectedAppClient.id)?.pending_amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {isAdmin && (
                <>
                  <button
                    onClick={() => {
                      setEditingDateLog(null);
                      setLogClientId(selectedAppClient.id);
                      setLogDate(new Date().toISOString().split('T')[0]);
                      setLogCount(150);
                      setLogRate(50);
                      setLogStatus('Live');
                      setLogNotes('');
                      setShowAddDateModal(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white/10 text-white font-bold text-xs hover:bg-slate-800 transition shadow-sm border border-white/10"
                  >
                    <Plus className="w-4 h-4" /> Add Date Entry
                  </button>

                  <button
                    onClick={() => handleMarkAsPaid(selectedAppClient.id)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Mark Account Paid
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Date-by-Date Table & Items */}
          <div className="bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Daily Live Reviews &amp; Date Breakdown
              </h3>
              <span className="text-xs text-slate-400 font-semibold">
                Click "Edit Date Amount &amp; Excel" to update any date directly
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium">
                <thead className="bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-extrabold tracking-wider border-b border-slate-200 dark:border-white/10">
                  <tr>
                    <th className="p-3.5">📅 Date</th>
                    <th className="p-3.5">App / Target Campaign</th>
                    <th className="p-3.5 text-right">🚀 Live Reviews</th>
                    <th className="p-3.5 text-right">Rate / Unit</th>
                    <th className="p-3.5 text-right">💰 Daily Amount</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Excel Sheet Link</th>
                    {isAdmin && <th className="p-3.5 text-center">Admin Direct Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10 text-slate-800 dark:text-slate-200">
                  {dailyLogs.filter((l) => l.client_id === selectedAppClient.id).length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 text-xs font-semibold">
                        No daily date logs added for {selectedAppClient.company_name} yet. Click "+ Add Date Entry" above to log a date.
                      </td>
                    </tr>
                  ) : (
                    dailyLogs
                      .filter((l) => l.client_id === selectedAppClient.id)
                      .map((log) => {
                        const bRec = billingRecords.find((r) => r.client_id === selectedAppClient.id);
                        return (
                          <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                            <td className="p-3.5 font-black text-slate-900 dark:text-white">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-primary" /> {log.date}
                              </span>
                            </td>
                            <td className="p-3.5 font-bold text-slate-900 dark:text-white">{log.app_name}</td>
                            <td className="p-3.5 text-right font-black text-amber-600 dark:text-amber-400">
                              {log.live_count} Live Reviews
                            </td>
                            <td className="p-3.5 text-right text-slate-500">₹ {log.unit_price}</td>
                            <td className="p-3.5 text-right font-black text-slate-900 dark:text-white">
                              ₹ {log.total_amount.toLocaleString('en-IN')}
                            </td>
                            <td className="p-3.5">
                              <span className={cn(
                                "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border",
                                log.status === 'Live'
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                              )}>
                                {log.status}
                              </span>
                            </td>
                            <td className="p-3.5">
                              {bRec?.excel_sheet_url ? (
                                <a
                                  href={bRec.excel_sheet_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500/20 text-[10px] border border-emerald-500/20"
                                >
                                  <FileSpreadsheet className="w-3 h-3" /> Open Excel ↗
                                </a>
                              ) : (
                                <span className="text-slate-400 text-[10px]">No link</span>
                              )}
                            </td>
                            {isAdmin && (
                              <td className="p-3.5 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingDateLog(log);
                                      setLogDate(log.date);
                                      setLogCount(log.live_count);
                                      setLogRate(log.unit_price);
                                      setLogStatus(log.status);
                                      setLogNotes(log.notes || '');
                                      setShowAddDateModal(true);
                                    }}
                                    className="px-3 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition font-bold text-[11px] border border-primary/20"
                                  >
                                    <Edit className="w-3 h-3 inline mr-1" /> Edit Date
                                  </button>

                                  <button
                                    onClick={() => {
                                      dbEngine.deleteDailyLiveLog(log.id);
                                      refreshData();
                                    }}
                                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition"
                                    title="Delete Date Entry"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT APP CONTRACT & MASTER EXCEL LINK */}
      {/* ========================================================================= */}
      {editingBilling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900 space-y-4 animate-float-up">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Update Contract Amounts &amp; Master Excel Link
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
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white font-medium"
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
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white font-bold"
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
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-700 dark:text-amber-300">
                Calculated Pending Amount: ₹ {Math.max(0, editTotalAmount - editPaidAmount).toLocaleString('en-IN')}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Campaign Remarks
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
                  Save Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT SPECIFIC DATE ENTRY */}
      {/* ========================================================================= */}
      {showAddDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900 space-y-4 animate-float-up">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingDateLog ? 'Edit Specific Date Record' : 'Add New Date Live Record'}
            </h3>
            <form onSubmit={handleSaveDateLog} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Date</label>
                <input
                  type="date"
                  required
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Live Reviews Count</label>
                  <input
                    type="number"
                    required
                    value={logCount}
                    onChange={(e) => setLogCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Rate per Review (₹)</label>
                  <input
                    type="number"
                    required
                    value={logRate}
                    onChange={(e) => setLogRate(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 text-xs font-bold text-slate-900 dark:text-white flex justify-between">
                <span>Calculated Date Amount:</span>
                <span className="text-primary font-black">₹ {(logCount * logRate).toLocaleString('en-IN')}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select
                  value={logStatus}
                  onChange={(e) => setLogStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white font-bold"
                >
                  <option value="Live">Live on Play Store</option>
                  <option value="Pending">Pending Sync</option>
                  <option value="Completed">Completed Batch</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Date Remarks</label>
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
                  onClick={() => {
                    setEditingDateLog(null);
                    setShowAddDateModal(false);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-primary text-slate-950 hover:bg-primary/90 transition shadow-sm"
                >
                  Save Date Record
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
