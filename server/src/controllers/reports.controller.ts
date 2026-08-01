import { Request, Response } from 'express';

// In-memory store for generated report logs
let memoryReportLogs: any[] = [
  {
    id: 'rep-101',
    companyId: 'c-client-demo',
    reportType: 'REVIEW',
    title: 'Monthly Review Performance & Sentiment Report',
    format: 'PDF',
    filtersUsed: JSON.stringify({ dateRange: 'Last 30 Days', platform: 'All Platforms', rating: 'All Ratings' }),
    metricsSummary: JSON.stringify({ totalReviews: 1240, avgRating: 4.6, responseRate: '94.2%', growthRate: '+14.5%' }),
    fileSizeKb: 148.2,
    downloadUrl: '/api/v1/reports/export/rep-101/pdf',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'rep-102',
    companyId: 'c-client-demo',
    reportType: 'RATING',
    title: 'Multi-Channel Rating & Star Distribution Report',
    format: 'EXCEL',
    filtersUsed: JSON.stringify({ dateRange: 'Last 90 Days', platform: 'Play Store' }),
    metricsSummary: JSON.stringify({ totalRatings: 850, '5StarPct': '78%', '1StarPct': '4%' }),
    fileSizeKb: 210.5,
    downloadUrl: '/api/v1/reports/export/rep-102/excel',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

export async function generateReportHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyId = (req as any).user?.companyId || 'c-client-demo';
    const {
      reportType = 'REVIEW',
      startDate,
      endDate,
      platform = 'ALL',
      employee = 'ALL',
      rating = 'ALL',
    } = req.body;

    const reportTitle = `${reportType} Intelligence Report (${platform !== 'ALL' ? platform : 'All Platforms'})`;

    // 1. Summary Metrics
    const metrics = {
      totalVolume: reportType === 'EMPLOYEE' ? 420 : 1850,
      avgRating: 4.65,
      responseRatePct: 96.4,
      positiveSentimentPct: 82.5,
      growthRatePct: 18.4,
    };

    // 2. Chart Visualizations Data
    // Bar Chart
    const barChart = [
      { category: '5 Stars / Excellent', count: 1240 },
      { category: '4 Stars / Good', count: 320 },
      { category: '3 Stars / Average', count: 140 },
      { category: '2 Stars / Poor', count: 90 },
      { category: '1 Star / Crisis', count: 60 },
    ];

    // Line Chart (Trend over time)
    const lineChart = [
      { label: 'Mon', volume: 180, avgRating: 4.5 },
      { label: 'Tue', volume: 240, avgRating: 4.6 },
      { label: 'Wed', volume: 310, avgRating: 4.7 },
      { label: 'Thu', volume: 290, avgRating: 4.6 },
      { label: 'Fri', volume: 410, avgRating: 4.8 },
      { label: 'Sat', volume: 220, avgRating: 4.5 },
      { label: 'Sun', volume: 200, avgRating: 4.7 },
    ];

    // Pie Chart (Sentiment Distribution)
    const pieChart = [
      { name: 'Positive', value: 82.5, color: '#10b981' },
      { name: 'Neutral', value: 10.2, color: '#94a3b8' },
      { name: 'Negative', value: 5.1, color: '#f59e0b' },
      { name: 'Crisis', value: 2.2, color: '#f43f5e' },
    ];

    // Growth Graph Data
    const growthGraph = [
      { month: 'Jan', rate: 8.2 },
      { month: 'Feb', rate: 11.5 },
      { month: 'Mar', rate: 14.2 },
      { month: 'Apr', rate: 18.4 },
    ];

    // 3. Tabular Preview Rows
    const previewRows = [
      { id: '1', date: '2026-08-01', author: 'Rahul Sharma', platform: 'Play Store', rating: 5, sentiment: 'POSITIVE', snippet: 'Loved the fast interface and instant updates!' },
      { id: '2', date: '2026-07-31', author: 'Ananya Roy', platform: 'Google Business', rating: 4, sentiment: 'POSITIVE', snippet: 'Great support team resolution.' },
      { id: '3', date: '2026-07-30', author: 'Amit Kumar', platform: 'Amazon', rating: 1, sentiment: 'CRISIS', snippet: 'Delivery package damaged.' },
      { id: '4', date: '2026-07-29', author: 'Vikram Singh', platform: 'Facebook', rating: 5, sentiment: 'POSITIVE', snippet: 'Superb customer service experience.' },
      { id: '5', date: '2026-07-28', author: 'Priya Verma', platform: 'Instagram', rating: 5, sentiment: 'POSITIVE', snippet: 'Awesome response speed!' },
    ];

    // Create Report Log Entry
    const logId = `rep-${Date.now()}`;
    const newReportLog = {
      id: logId,
      companyId,
      reportType,
      title: reportTitle,
      format: 'PDF',
      filtersUsed: JSON.stringify({ startDate, endDate, platform, employee, rating }),
      metricsSummary: JSON.stringify(metrics),
      fileSizeKb: Math.round((120 + Math.random() * 80) * 10) / 10,
      downloadUrl: `/api/v1/reports/export/${logId}/pdf`,
      createdAt: new Date().toISOString(),
    };

    memoryReportLogs.unshift(newReportLog);

    res.json({
      success: true,
      data: {
        reportLog: newReportLog,
        title: reportTitle,
        reportType,
        metrics,
        charts: {
          barChart,
          lineChart,
          pieChart,
          growthGraph,
        },
        previewRows,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getReportHistoryHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyId = (req as any).user?.companyId || 'c-client-demo';
    const logs = memoryReportLogs.filter((l) => l.companyId === companyId);
    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteReportHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    memoryReportLogs = memoryReportLogs.filter((l) => l.id !== id);
    res.json({ success: true, message: 'Report log deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function exportReportHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id, format } = req.params;
    const report = memoryReportLogs.find((r) => r.id === id) || memoryReportLogs[0];
    const fmt = (format || 'pdf').toLowerCase();

    if (fmt === 'csv') {
      const csv = `Date,Author,Platform,Rating,Sentiment,Snippet\n2026-08-01,"Rahul Sharma","Play Store",5,"POSITIVE","Loved the fast interface!"\n2026-07-31,"Ananya Roy","Google Business",4,"POSITIVE","Great support team resolution."\n2026-07-30,"Amit Kumar","Amazon",1,"CRISIS","Delivery package damaged."\n`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=Report_${id}.csv`);
      res.send(csv);
      return;
    }

    if (fmt === 'excel' || fmt === 'xlsx') {
      const xml = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Report"><Table><Row><Cell><Data ss:Type="String">Date</Data></Cell><Cell><Data ss:Type="String">Author</Data></Cell><Cell><Data ss:Type="String">Rating</Data></Cell></Row><Row><Cell><Data ss:Type="String">2026-08-01</Data></Cell><Cell><Data ss:Type="String">Rahul Sharma</Data></Cell><Cell><Data ss:Type="Number">5</Data></Cell></Row></Table></Worksheet></Workbook>`;
      res.setHeader('Content-Type', 'application/vnd.ms-excel');
      res.setHeader('Content-Disposition', `attachment; filename=Report_${id}.xls`);
      res.send(xml);
      return;
    }

    // Default PDF HTML Stream
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>${report?.title || 'ORM Report'}</title>
  <style>
    body { font-family: Helvetica, Arial, sans-serif; padding: 40px; color: #0f172a; }
    .header { border-bottom: 3px solid #f59e0b; padding-bottom: 15px; margin-bottom: 30px; }
    .logo { font-size: 22px; font-weight: 900; color: #f59e0b; }
    .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; text-align: center; }
    .val { font-size: 20px; font-weight: 900; color: #0f172a; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #1e293b; color: #fff; padding: 10px; font-size: 11px; text-align: left; uppercase; }
    td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">⚡ Equinox Pulse Enterprise Analytics & Reports</div>
    <h2>${report?.title || 'ORM Report Summary'}</h2>
    <p style="font-size: 12px; color: #64748b;">Generated Date: ${new Date(report?.createdAt || Date.now()).toLocaleDateString()}</p>
  </div>

  <div class="metrics">
    <div class="card"><div>Total Volume</div><div class="val">1,850</div></div>
    <div class="card"><div>Avg Rating</div><div class="val">4.65 ★</div></div>
    <div class="card"><div>Response Rate</div><div class="val">96.4%</div></div>
    <div class="card"><div>Growth Rate</div><div class="val">+18.4%</div></div>
  </div>

  <table>
    <thead>
      <tr><th>Date</th><th>Author</th><th>Platform</th><th>Rating</th><th>Sentiment</th></tr>
    </thead>
    <tbody>
      <tr><td>2026-08-01</td><td>Rahul Sharma</td><td>Play Store</td><td>5 ★</td><td>POSITIVE</td></tr>
      <tr><td>2026-07-31</td><td>Ananya Roy</td><td>Google Business</td><td>4 ★</td><td>POSITIVE</td></tr>
      <tr><td>2026-07-30</td><td>Amit Kumar</td><td>Amazon</td><td>1 ★</td><td>CRISIS</td></tr>
    </tbody>
  </table>
</body>
</html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error: any) {
    res.status(500).send('Export failed.');
  }
}
