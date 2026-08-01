import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/AppLayout';
import type { ReportType, ExportFormat, ReportFilterState, ReportLogItem } from '@/types';
import {
  generateReportApi,
  fetchReportHistoryApi,
  deleteReportHistoryApi,
  exportReportFileApi,
  type GeneratedReportPayload,
} from '@/lib/apiReports';
import { cn } from '@/lib/utils';
import {
  BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, TrendingUp,
  Download, FileText, FileSpreadsheet, Trash2, Calendar, Filter, RefreshCw,
  Sparkles, CheckCircle2, Star, Users, Building2, Globe, Clock, Layers
} from 'lucide-react';

const REPORT_TABS: { id: ReportType; label: string; icon: any }[] = [
  { id: 'REVIEW', label: 'Review Report', icon: FileText },
  { id: 'RATING', label: 'Rating Report', icon: Star },
  { id: 'EMPLOYEE', label: 'Employee Report', icon: Users },
  { id: 'PLATFORM', label: 'Platform Report', icon: Globe },
  { id: 'CUSTOMER', label: 'Customer Report', icon: Building2 },
];

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportType>('REVIEW');
  const [dateRange, setDateRange] = useState<string>('Last 30 Days');
  const [startDate, setStartDate] = useState<string>('2026-07-01');
  const [endDate, setEndDate] = useState<string>('2026-08-01');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('ALL');
  const [selectedRating, setSelectedRating] = useState<string>('ALL');
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');

  const [generating, setGenerating] = useState<boolean>(false);
  const [reportData, setReportData] = useState<GeneratedReportPayload | null>(null);
  const [reportHistory, setReportHistory] = useState<ReportLogItem[]>([]);

  useEffect(() => {
    handleGenerateReport();
    loadHistory();
  }, [activeTab]);

  async function loadHistory() {
    try {
      const logs = await fetchReportHistoryApi();
      setReportHistory(logs);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleGenerateReport() {
    setGenerating(true);
    try {
      const filters: ReportFilterState = {
        reportType: activeTab,
        startDate,
        endDate,
        platform: selectedPlatform,
        employee: selectedEmployee,
        rating: selectedRating,
        companyId: selectedCompany,
      };

      const res = await generateReportApi(filters);
      setReportData(res);
      setReportHistory((prev) => [res.reportLog, ...prev.filter((l) => l.id !== res.reportLog.id)]);
    } catch (e: any) {
      console.error('Failed to generate report:', e);
    } finally {
      setGenerating(false);
    }
  }

  async function handleDeleteHistory(id: string) {
    try {
      await deleteReportHistoryApi(id);
      setReportHistory((prev) => prev.filter((l) => l.id !== id));
    } catch (e: any) {
      console.error(e);
    }
  }

  function handleExport(format: ExportFormat) {
    if (!reportData?.reportLog?.id) return;
    exportReportFileApi(reportData.reportLog.id, format);
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <PageHeader
        title="Analytics & Intelligence Reports"
        subtitle="Generate, preview, and export multi-channel ORM analytics, ratings, employee performance, and customer reports"
      />

      {/* Report Type Selection Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-white/10 overflow-x-auto">
        {REPORT_TABS.map((tab) => {
          const isSelected = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black transition-all shrink-0',
                isSelected
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Multi-Field Filter Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-base-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-amber-500" /> Apply Report Filters
          </span>
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-1.5 text-xs font-black text-slate-950 hover:bg-amber-400 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', generating && 'animate-spin')} />
            Update & Preview Report
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs font-bold">
          
          {/* Date Range Preset */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-slate-900 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 90 Days">Last 90 Days</option>
              <option value="Custom Range">Custom Range</option>
            </select>
          </div>

          {/* Platform Filter */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Platform Filter</label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-slate-900 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="ALL">All Platforms</option>
              <option value="Play Store">Play Store</option>
              <option value="Amazon">Amazon</option>
              <option value="Google Business">Google Business</option>
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="X">X (Twitter)</option>
              <option value="YouTube">YouTube</option>
            </select>
          </div>

          {/* Employee Filter */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Employee Filter</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-slate-900 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="ALL">All Employees</option>
              <option value="Rahul Sharma">Rahul Sharma</option>
              <option value="Ananya Roy">Ananya Roy</option>
              <option value="Shivam">Shivam</option>
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Rating Filter</label>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-slate-900 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="ALL">All Star Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          {/* Company Filter */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Company Account</label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-slate-900 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="ALL">All Company Accounts</option>
              <option value="c-client-demo">Equinox Partner Client</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Metric Cards */}
      {reportData?.metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-base-900">
            <span className="text-[10px] font-black uppercase text-slate-400 block">Total Volume</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{reportData.metrics.totalVolume.toLocaleString()}</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-base-900">
            <span className="text-[10px] font-black uppercase text-slate-400 block">Average Rating</span>
            <span className="text-xl font-black text-amber-500">{reportData.metrics.avgRating} ★</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-base-900">
            <span className="text-[10px] font-black uppercase text-slate-400 block">Response Rate</span>
            <span className="text-xl font-black text-emerald-500">{reportData.metrics.responseRatePct}%</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-base-900">
            <span className="text-[10px] font-black uppercase text-slate-400 block">Positive Sentiment</span>
            <span className="text-xl font-black text-sky-500">{reportData.metrics.positiveSentimentPct}%</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-base-900">
            <span className="text-[10px] font-black uppercase text-slate-400 block">Growth Rate</span>
            <span className="text-xl font-black text-purple-500">+{reportData.metrics.growthRatePct}%</span>
          </div>
        </div>
      )}

      {/* Exporters Quick Action Bar */}
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-600/10 p-4 border border-amber-500/30">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <span className="text-xs font-black text-slate-900 dark:text-white">
            Export Generated Report ({reportData?.reportType || activeTab})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('PDF')}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-black text-slate-950 hover:bg-amber-400 transition shadow-sm"
          >
            <FileText className="h-3.5 w-3.5" /> Export PDF
          </button>
          <button
            onClick={() => handleExport('EXCEL')}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-black text-white hover:bg-emerald-500 transition shadow-sm"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" /> Export Excel (XLSX)
          </button>
          <button
            onClick={() => handleExport('CSV')}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-black text-white hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-white/20 transition shadow-sm"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* 4 Interactive Visual Charts Grid */}
      {reportData?.charts && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Bar Chart: Rating Breakdown */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-base-900 space-y-4">
            <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-amber-500" /> Bar Chart: Rating Distribution
            </h4>
            <div className="space-y-3 pt-2">
              {reportData.charts.barChart.map((b, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>{b.category}</span>
                    <span className="font-extrabold">{b.count}</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${Math.min(100, (b.count / 1500) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Line Chart: Rating Trend */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-base-900 space-y-4">
            <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <LineChartIcon className="h-4 w-4 text-sky-500" /> Line Chart: Weekly Rating Trend
            </h4>
            <div className="h-44 flex items-end justify-between gap-2 pt-6 border-b border-slate-200 pb-2 dark:border-white/10">
              {reportData.charts.lineChart.map((l, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-extrabold text-amber-500">{l.avgRating}★</span>
                  <div
                    className="w-full bg-sky-500 rounded-t-lg transition-all"
                    style={{ height: `${(l.volume / 450) * 100}%` }}
                  />
                  <span className="text-[10px] font-bold text-slate-400">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pie Chart: Sentiment Distribution */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-base-900 space-y-4">
            <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <PieChartIcon className="h-4 w-4 text-emerald-500" /> Pie Chart: Sentiment Share
            </h4>
            <div className="space-y-3 pt-2">
              {reportData.charts.pieChart.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-slate-800 dark:text-slate-200">{p.name}</span>
                  </div>
                  <span className="font-extrabold text-slate-900 dark:text-white">{p.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Growth Graph: Growth Rate Trend */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-base-900 space-y-4">
            <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-purple-500" /> Growth Graph: Month-over-Month Growth
            </h4>
            <div className="h-44 flex items-end justify-between gap-3 pt-6 border-b border-slate-200 pb-2 dark:border-white/10">
              {reportData.charts.growthGraph.map((g, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-extrabold text-purple-500">+{g.rate}%</span>
                  <div
                    className="w-full bg-purple-500 rounded-t-lg transition-all"
                    style={{ height: `${(g.rate / 25) * 100}%` }}
                  />
                  <span className="text-[10px] font-bold text-slate-400">{g.month}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Live Tabular Report Preview */}
      {reportData?.previewRows && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-base-900 space-y-4">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-500" /> Interactive Report Data Preview
          </h3>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
            <table className="w-full text-left text-xs font-bold">
              <thead className="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Author</th>
                  <th className="p-3">Platform</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3">Sentiment</th>
                  <th className="p-3">Excerpt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10 text-slate-800 dark:text-slate-200">
                {reportData.previewRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                    <td className="p-3">{row.date}</td>
                    <td className="p-3 font-extrabold text-slate-900 dark:text-white">{row.author}</td>
                    <td className="p-3">{row.platform}</td>
                    <td className="p-3 font-black text-amber-500">{row.rating} ★</td>
                    <td className="p-3">
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-500 border border-emerald-500/20">
                        {row.sentiment}
                      </span>
                    </td>
                    <td className="p-3 font-normal text-slate-600 dark:text-slate-400">"{row.snippet}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report History Ledger */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-base-900 space-y-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" /> Generated Report History Logs
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
          <table className="w-full text-left text-xs font-bold">
            <thead className="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase">
              <tr>
                <th className="p-3">Title & Type</th>
                <th className="p-3">Format</th>
                <th className="p-3">File Size</th>
                <th className="p-3">Created Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10 text-slate-800 dark:text-slate-200">
              {reportHistory.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="p-3">
                    <span className="font-extrabold text-slate-900 dark:text-white block">{log.title}</span>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Type: {log.reportType}</span>
                  </td>
                  <td className="p-3 font-black">{log.format}</td>
                  <td className="p-3">{log.fileSizeKb} KB</td>
                  <td className="p-3">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => exportReportFileApi(log.id, log.format || 'PDF')}
                        className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-800 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
                      >
                        <Download className="h-3.5 w-3.5 text-amber-500" /> Download
                      </button>
                      <button
                        onClick={() => handleDeleteHistory(log.id)}
                        className="inline-flex items-center gap-1 rounded-xl p-1 text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
