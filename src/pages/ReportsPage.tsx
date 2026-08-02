import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Sparkles, Loader2, Wand2, Download, FileBarChart2, Printer, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function ReportsPage() {
  const { client } = useAuth();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>('weekly');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<{ period: string; stats: { total: number; pos: number; neg: number; avgRating: number }; report: string } | null>(null);

  const generate = () => {
    setLoading(true);
    setReport(null);
    setTimeout(() => {
      setLoading(false);
      setReport({
        period,
        stats: {
          total: period === 'daily' ? 42 : period === 'weekly' ? 280 : period === 'monthly' ? 1482 : 4210,
          pos: period === 'daily' ? 36 : period === 'weekly' ? 245 : period === 'monthly' ? 1240 : 3680,
          neg: period === 'daily' ? 3 : period === 'weekly' ? 15 : period === 'monthly' ? 82 : 210,
          avgRating: 4.6,
        },
        report: `# Executive ${period.toUpperCase()} Reputation & Brand Intelligence Report\n**Organization:** ${client?.company_name || 'Equinox Motors India'} | **Generated:** ${new Date().toLocaleDateString()}\n\n## 1. Executive Summary\n- Overall Brand Reputation Score remains strong at **86/100**.\n- Total review volume for the ${period} period reached **${period === 'daily' ? 42 : period === 'weekly' ? 280 : 1482} reviews** across 5 monitored platforms.\n- Customer response SLA was maintained at **96.8%**, resolving critical queries within the 4-hour window.\n\n## 2. Key Insights & Sentiment Drivers\n- **Positive Highlights:** UPI checkout speed and instant AI support responses received high acclaim (88% positive sentiment).\n- **Area of Focus:** Android app v4.2 checkout crash on payment gateway redirect was identified as the primary negative driver.\n\n## 3. Platform Distribution & Benchmarks\n- **Google Play Store:** 620 reviews | 4.7★ average\n- **App Store:** 410 reviews | 4.5★ average\n- **Google Business Profile:** 280 reviews | 4.6★ average\n\n## 4. Recommended Action Items\n- Deploy hotfix build v4.2.1 for Android checkout module.\n- Expand AI Auto-Response rules for weekend support coverage.\n- Review packaging box structural specs with third-party logistics partners.`,
      });
      toast.success(`${period.toUpperCase()} executive report generated`);
    }, 700);
  };

  useEffect(() => {
    const handleCustomEvent = () => generate();
    window.addEventListener('equinox:new-report', handleCustomEvent);
    return () => window.removeEventListener('equinox:new-report', handleCustomEvent);
  }, [period]);

  const downloadMD = () => {
    if (!report) return;
    const blob = new Blob([report.report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `equinox-${period}-report.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded as Markdown');
  };

  const exportPDF = () => {
    if (!report) return;
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Executive Report Generator Card */}
      <div className="bg-slate-900 border border-amber-500/30 dark:bg-gradient-to-br dark:from-black dark:to-neutral-950 dark:border-primary/20 rounded-2xl p-6 gold-glow shadow-md">
        <div className="flex items-start justify-between flex-col md:flex-row gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              <Sparkles className="w-5 h-5 text-primary" /> Executive Boardroom Report Generator
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 dark:text-neutral-300 mt-1">
              AI-drafted boardroom reports across periods · export to PDF or Markdown
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="flex-1 md:w-[140px] md:flex-none bg-slate-800 border border-slate-700 dark:bg-black/40 dark:border-white/10 text-white text-xs font-semibold rounded-xl h-9 px-3 focus:outline-none"
            >
              <option value="daily" className="bg-slate-900 text-white">Daily</option>
              <option value="weekly" className="bg-slate-900 text-white">Weekly</option>
              <option value="monthly" className="bg-slate-900 text-white">Monthly</option>
              <option value="quarterly" className="bg-slate-900 text-white">Quarterly</option>
            </select>

            <button
              onClick={generate}
              disabled={loading}
              className="px-4 h-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs flex items-center gap-1.5 shrink-0 transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 text-black" />}
              <span>Generate</span>
            </button>
          </div>
        </div>
      </div>

      {report && (
        <div className="bg-white border border-slate-200 dark:bg-black/40 dark:border-white/5 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">{report.period} Boardroom Report</h3>
              <p className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">
                {report.stats.total} total reviews · {report.stats.pos} positive · {report.stats.neg} negative · Avg {report.stats.avgRating}★
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={downloadMD}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-neutral-200 transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Markdown
              </button>
              <button
                onClick={exportPDF}
                className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-black" /> Export PDF
              </button>
            </div>
          </div>

          <div className="prose prose-sm max-w-none space-y-1 text-slate-800 dark:text-neutral-200">
            {report.report.split('\n').map((line, i) => {
              if (line.startsWith('## ')) return <h3 key={i} className="text-amber-600 dark:text-primary text-base sm:text-lg font-semibold mt-4 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{line.slice(3)}</h3>;
              if (line.startsWith('# ')) return <h2 key={i} className="text-amber-600 dark:text-primary text-lg sm:text-xl font-bold mt-4" style={{ fontFamily: "'Playfair Display', serif" }}>{line.slice(2)}</h2>;
              if (line.startsWith('- ') || line.startsWith('* ')) return <div key={i} className="flex items-start gap-2 my-1"><ChevronRight className="w-4 h-4 text-amber-600 dark:text-primary mt-0.5 shrink-0" /><span className="text-xs sm:text-sm text-slate-700 dark:text-neutral-200">{line.slice(2)}</span></div>;
              if (line.trim() === '') return <div key={i} className="h-2" />;
              return <p key={i} className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 my-1">{line}</p>;
            })}
          </div>
        </div>
      )}

      {!report && !loading && (
        <div className="text-center py-16">
          <FileBarChart2 className="w-12 h-12 text-primary/40 mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-muted-foreground font-medium">Choose a period and click Generate to produce an executive report.</p>
        </div>
      )}
    </div>
  );
}
