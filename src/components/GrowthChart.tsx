import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { motion, useReducedMotion } from 'motion/react';
import { formatCount, formatMonthLabel } from '@/lib/formatters';
import { Skeleton } from '@/components/Skeleton';

interface StatHistoryPoint {
  month: string;
  followers: number;
  following?: number;
  avg_likes?: number;
}

interface GrowthChartProps {
  data?: StatHistoryPoint[];
  isLoading?: boolean;
}

type Timeframe = 'recent' | 'half' | 'year' | 'all';

const TIMEFRAME_OPTIONS: { id: Timeframe; label: string }[] = [
  { id: 'recent', label: 'Last 2mo' },
  { id: 'half', label: 'Last 4mo' },
  { id: 'year', label: 'Last year' },
  { id: 'all', label: 'All' },
];

export const GrowthChart: React.FC<GrowthChartProps> = ({ data, isLoading }) => {
  const [showAvgLikes, setShowAvgLikes] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>('all');
  const shouldReduceMotion = useReducedMotion();

  if (isLoading) {
    return (
      <div className="mt-8 rounded-xl bg-[var(--surface)] border border-[var(--border)] p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <Skeleton className="h-5 w-48 mb-1.5" />
            <Skeleton className="h-3 w-36" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-32 rounded-lg" />
            <Skeleton className="h-8 w-36 rounded-lg" />
          </div>
        </div>
        <div className="h-64 w-full">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!data || data.length < 2) {
    return (
      <div className="mt-8 rounded-xl bg-[var(--surface)] border border-[var(--border)] p-6 text-center text-[var(--text-muted)] text-sm">
        Not enough history to show a trend.
      </div>
    );
  }

  const getFilteredData = () => {
    switch (timeframe) {
      case 'recent':
        return data.slice(-2);
      case 'half':
        return data.slice(-4);
      case 'year':
        return data.slice(-12);
      case 'all':
      default:
        return data;
    }
  };

  const filtered = getFilteredData();
  const chartData = filtered.map((pt) => ({
    ...pt,
    formattedMonth: formatMonthLabel(pt.month),
  }));

  const hasAvgLikes = data.some((pt) => pt.avg_likes !== undefined && pt.avg_likes !== null);

  return (
    <div className="mt-8 border bg-white p-6" style={{ borderColor: "var(--border)" }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div>
          <h3 className="text-lg italic tracking-tight font-[var(--font-display)] text-[var(--text)]">
            Follower Trajectory
          </h3>
          <p className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mt-0.5">
            // Historical Audit Record
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center border p-0.5 bg-[var(--surface-raised)]" style={{ borderColor: "var(--border)" }}>
            {TIMEFRAME_OPTIONS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTimeframe(id)}
                className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                  timeframe === id
                    ? 'bg-[var(--accent)] text-[var(--on-accent)] font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {hasAvgLikes && (
            <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] cursor-pointer select-none bg-[var(--surface-raised)] border px-3 py-1.5 hover:border-black transition-colors" style={{ borderColor: "var(--border)" }}>
              <input
                type="checkbox"
                checked={showAvgLikes}
                onChange={(e) => setShowAvgLikes(e.target.checked)}
                className="rounded-none border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)] bg-[var(--bg)]"
              />
              <span>Compare Avg Likes</span>
            </label>
          )}
        </div>
      </div>

      <motion.div
        layout
        transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: 'easeInOut' }}
        className="h-64 w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid stroke="#e2dfd7" strokeDasharray="2 2" vertical={false} />
            <XAxis
              dataKey="formattedMonth"
              stroke="#757472"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              axisLine={{ stroke: '#e2dfd7' }}
            />
            <YAxis
              yAxisId="left"
              stroke="#757472"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => formatCount(Number(val))}
            />
            {showAvgLikes && (
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#757472"
                fontSize={11}
                fontFamily="monospace"
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => formatCount(Number(val))}
              />
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f0e0d',
                borderColor: '#0f0e0d',
                borderRadius: '0px',
                color: '#fbf9f5',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
              }}
              formatter={(value: unknown, name: unknown) => [
                formatCount(Number(value)),
                name === 'followers' ? 'Followers' : 'Avg Likes',
              ]}
              labelStyle={{ color: '#a6a4a0', fontWeight: 600, marginBottom: '0.25rem', textTransform: 'uppercase' }}
            />
            <Line
              isAnimationActive={!shouldReduceMotion}
              animationDuration={300}
              animationEasing="ease-in-out"
              yAxisId="left"
              type="monotone"
              dataKey="followers"
              name="followers"
              stroke="#0f0e0d"
              strokeWidth={2.5}
              dot={{ fill: '#0f0e0d', r: 3 }}
              activeDot={{ r: 5, fill: '#0f0e0d', stroke: '#fbf9f5', strokeWidth: 2 }}
            />
            {showAvgLikes && (
              <Line
                isAnimationActive={!shouldReduceMotion}
                animationDuration={300}
                animationEasing="ease-in-out"
                yAxisId="right"
                type="monotone"
                dataKey="avg_likes"
                name="avg_likes"
                stroke="#757472"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={{ fill: '#757472', r: 2 }}
                activeDot={{ r: 4, fill: '#757472', stroke: '#fbf9f5', strokeWidth: 2 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};
