import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { SENTIMENT_COLORS } from '@/data/constants';
import { Activity } from 'lucide-react';
import { SectionCard } from '@/components/ui/SectionCard';

interface Props {
  data: { label: string; positive: number; neutral: number; negative: number }[];
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-base-900/95 px-3 py-2 text-xs shadow-card backdrop-blur-md">
      <p className="mb-1.5 font-semibold text-slate-200">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 capitalize text-slate-400">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            {p.dataKey}
          </span>
          <span className="font-semibold text-slate-100">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export function SentimentChart({ data }: Props) {
  return (
    <SectionCard
      title="Sentiment & Review Volume"
      subtitle="Daily review breakdown by sentiment"
      icon={<Activity className="h-4 w-4" />}
    >
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="gPos2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SENTIMENT_COLORS.positive} stopOpacity={0.45} />
                <stop offset="100%" stopColor={SENTIMENT_COLORS.positive} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gNeu2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SENTIMENT_COLORS.neutral} stopOpacity={0.35} />
                <stop offset="100%" stopColor={SENTIMENT_COLORS.neutral} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gNeg2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SENTIMENT_COLORS.negative} stopOpacity={0.4} />
                <stop offset="100%" stopColor={SENTIMENT_COLORS.negative} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} interval="preserveStartEnd" minTickGap={18} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={42} allowDecimals={false} />
            <RTooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(34,211,238,0.35)', strokeDasharray: '4 4' }} />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: 8, fontSize: 12 }} formatter={(v) => <span className="capitalize text-slate-300">{v}</span>} />
            <Area type="monotone" dataKey="positive" stroke={SENTIMENT_COLORS.positive} strokeWidth={2} fill="url(#gPos2)" />
            <Area type="monotone" dataKey="neutral" stroke={SENTIMENT_COLORS.neutral} strokeWidth={2} fill="url(#gNeu2)" />
            <Area type="monotone" dataKey="negative" stroke={SENTIMENT_COLORS.negative} strokeWidth={2} fill="url(#gNeg2)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}
