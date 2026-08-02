import { useState } from 'react';
import { Trophy, TrendingUp, Star, BarChart2, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GOLD, BLUE } from '@/lib/equinox/design';

export function CompetitorsPage() {
  const compData = [
    { name: 'Equinox Pulse (Your Brand)', rating: 4.6, reviews: 1482, shareOfVoice: 42, sentiment: 86 },
    { name: 'Competitor A Motors', rating: 4.2, reviews: 1120, shareOfVoice: 28, sentiment: 74 },
    { name: 'Competitor B Tech', rating: 3.9, reviews: 890, shareOfVoice: 18, sentiment: 62 },
    { name: 'Competitor C Auto', rating: 4.1, reviews: 640, shareOfVoice: 12, sentiment: 70 },
  ];

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-black/40 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Competitor Benchmark Matrix
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Share of voice, sentiment comparisons, and Play Store rating leaderboards.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Share of Voice Comparison */}
        <div className="p-5 rounded-2xl bg-black/40 border border-white/5">
          <h3 className="text-base font-semibold text-white mb-1">Share of Voice (%)</h3>
          <p className="text-xs text-muted-foreground mb-4">Market share based on total social &amp; app reviews volume</p>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={compData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" fontSize={11} width={140} />
              <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
              <Bar dataKey="shareOfVoice" fill={GOLD} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment Index Comparison */}
        <div className="p-5 rounded-2xl bg-black/40 border border-white/5">
          <h3 className="text-base font-semibold text-white mb-1">Brand Sentiment Index</h3>
          <p className="text-xs text-muted-foreground mb-4">Net positive score calculated from customer feedback</p>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={compData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} />
              <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
              <Bar dataKey="sentiment" fill={BLUE} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="p-5 rounded-2xl bg-black/40 border border-white/5">
        <h3 className="text-base font-semibold text-white mb-3">Market Leaderboard Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="text-[10px] uppercase text-muted-foreground border-b border-white/10">
              <tr>
                <th className="py-2.5 px-3">Brand</th>
                <th className="py-2.5 px-3">Average Rating</th>
                <th className="py-2.5 px-3">Review Volume</th>
                <th className="py-2.5 px-3">Share of Voice</th>
                <th className="py-2.5 px-3">Sentiment Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {compData.map((row, idx) => (
                <tr key={idx} className={idx === 0 ? 'bg-primary/10 font-semibold text-white' : ''}>
                  <td className="py-3 px-3 flex items-center gap-2">
                    {idx === 0 && <span className="text-primary font-bold">★ #1</span>}
                    {row.name}
                  </td>
                  <td className="py-3 px-3 flex items-center gap-1 font-bold text-white">
                    <Star className="w-3.5 h-3.5 fill-primary text-primary" /> {row.rating}
                  </td>
                  <td className="py-3 px-3">{row.reviews.toLocaleString()}</td>
                  <td className="py-3 px-3">{row.shareOfVoice}%</td>
                  <td className="py-3 px-3 font-bold text-emerald-400">{row.sentiment}/100</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
