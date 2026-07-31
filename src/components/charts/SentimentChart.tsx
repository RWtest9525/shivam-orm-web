import { useState } from 'react';
import { SENTIMENT_COLORS } from '@/data/constants';
import { Activity } from 'lucide-react';
import { SectionCard } from '@/components/ui/SectionCard';

interface Props {
  data: { label: string; positive: number; neutral: number; negative: number }[];
}

export function SentimentChart({ data }: Props) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <SectionCard
        title="Sentiment & Review Volume"
        subtitle="Daily review breakdown by sentiment"
        icon={<Activity className="h-4 w-4" />}
      >
        <div className="h-64 flex items-center justify-center text-xs text-slate-400">
          No sentiment data available.
        </div>
      </SectionCard>
    );
  }

  // Calculate chart boundaries
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.positive, d.neutral, d.negative, 1))
  );

  const height = 220;
  const width = 600;
  const paddingX = 40;
  const paddingY = 20;

  const innerW = width - paddingX * 2;
  const innerH = height - paddingY * 2;

  const getX = (idx: number) => {
    if (data.length <= 1) return paddingX + innerW / 2;
    return paddingX + (idx / (data.length - 1)) * innerW;
  };

  const getY = (val: number) => {
    return height - paddingY - (val / maxVal) * innerH;
  };

  // Build SVG path strings
  const buildPath = (key: 'positive' | 'neutral' | 'negative') => {
    const pts = data.map((d, i) => `${getX(i)},${getY(d[key])}`);
    return `M ${pts.join(' L ')}`;
  };

  const buildAreaPath = (key: 'positive' | 'neutral' | 'negative') => {
    const linePath = buildPath(key);
    const lastX = getX(data.length - 1);
    const firstX = getX(0);
    const bottomY = height - paddingY;
    return `${linePath} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  };

  const hoveredData = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <SectionCard
      title="Sentiment & Review Volume"
      subtitle="Daily review volume breakdown across positive, neutral, and negative ratings"
      icon={<Activity className="h-4 w-4 text-accent-500 dark:text-accent-400" />}
      actions={
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-600 dark:text-slate-300">Positive</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
            <span className="text-slate-600 dark:text-slate-300">Neutral</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="text-slate-600 dark:text-slate-300">Negative</span>
          </div>
        </div>
      }
    >
      <div className="relative w-full overflow-hidden">
        {/* Hover Tooltip Overlay */}
        {hoveredData && (
          <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-md dark:border-white/10 dark:bg-base-900">
            <span className="font-extrabold text-slate-900 dark:text-slate-100">{hoveredData.label}</span>
            <div className="flex items-center gap-4">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                Positive: {hoveredData.positive}
              </span>
              <span className="font-bold text-cyan-600 dark:text-cyan-400">
                Neutral: {hoveredData.neutral}
              </span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                Negative: {hoveredData.negative}
              </span>
            </div>
          </div>
        )}

        {/* SVG Render Container */}
        <div className="relative h-60 w-full">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-full w-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="svgPosGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="svgNeuGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="svgNegGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 0.33, 0.66, 1].map((ratio, i) => {
              const y = paddingY + ratio * innerH;
              return (
                <line
                  key={i}
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-white/10"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Filled Gradient Areas */}
            <path d={buildAreaPath('positive')} fill="url(#svgPosGrad)" />
            <path d={buildAreaPath('neutral')} fill="url(#svgNeuGrad)" />
            <path d={buildAreaPath('negative')} fill="url(#svgNegGrad)" />

            {/* Lines */}
            <path
              d={buildPath('positive')}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={buildPath('neutral')}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={buildPath('negative')}
              fill="none"
              stroke="#f43f5e"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Data Points & Hover Triggers */}
            {data.map((d, idx) => {
              const x = getX(idx);
              const isHovered = hoveredIdx === idx;
              return (
                <g key={idx} onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)}>
                  {/* Vertical hover guide line */}
                  {isHovered && (
                    <line
                      x1={x}
                      y1={paddingY}
                      x2={x}
                      y2={height - paddingY}
                      stroke="#22d3ee"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                  )}

                  {/* Positive point */}
                  <circle
                    cx={x}
                    cy={getY(d.positive)}
                    r={isHovered ? 5 : 3.5}
                    className="fill-emerald-400 stroke-white dark:stroke-base-950 stroke-2 transition-all cursor-pointer"
                  />
                  {/* Neutral point */}
                  <circle
                    cx={x}
                    cy={getY(d.neutral)}
                    r={isHovered ? 5 : 3.5}
                    className="fill-cyan-400 stroke-white dark:stroke-base-950 stroke-2 transition-all cursor-pointer"
                  />
                  {/* Negative point */}
                  <circle
                    cx={x}
                    cy={getY(d.negative)}
                    r={isHovered ? 5 : 3.5}
                    className="fill-rose-400 stroke-white dark:stroke-base-950 stroke-2 transition-all cursor-pointer"
                  />
                </g>
              );
            })}
          </svg>

          {/* X Axis Labels */}
          <div className="mt-2 flex justify-between px-6 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            {data.map((d, i) => (
              <span key={i} className="truncate">
                {d.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
