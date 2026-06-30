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
    <div className="mt-8 rounded-xl bg-[var(--surface)] border border-[var(--border)] p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-semibold font-[var(--font-display)] text-[var(--text)]">
            Follower Growth & Trend
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Historical trajectory over time
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] p-0.5">
            {TIMEFRAME_OPTIONS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTimeframe(id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  timeframe === id
                    ? 'bg-[var(--accent)] text-[#0b0b10]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {hasAvgLikes && (
            <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] cursor-pointer select-none bg-[var(--surface-raised)] border border-[var(--border)] px-3 py-1.5 rounded-lg hover:border-[var(--border-strong)] transition-colors">
              <input
                type="checkbox"
                checked={showAvgLikes}
                onChange={(e) => setShowAvgLikes(e.target.checked)}
                className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)] bg-[var(--bg)]"
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
            <CartesianGrid stroke="#26252f" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="formattedMonth"
              stroke="#8b8997"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#26252f' }}
            />
            <YAxis
              yAxisId="left"
              stroke="#8b8997"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => formatCount(Number(val))}
            />
            {showAvgLikes && (
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#8b8997"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => formatCount(Number(val))}
              />
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: '#1c1c26',
                borderColor: '#34333f',
                borderRadius: '0.5rem',
                color: '#e8e6f0',
                fontSize: '0.75rem',
              }}
              formatter={(value: unknown, name: unknown) => [
                formatCount(Number(value)),
                name === 'followers' ? 'Followers' : 'Avg Likes',
              ]}
              labelStyle={{ color: '#8b8997', fontWeight: 600, marginBottom: '0.25rem' }}
            />
            <Line
              isAnimationActive={!shouldReduceMotion}
              animationDuration={300}
              animationEasing="ease-in-out"
              yAxisId="left"
              type="monotone"
              dataKey="followers"
              name="followers"
              stroke="#ff5c39"
              strokeWidth={2.5}
              dot={{ fill: '#ff5c39', r: 4 }}
              activeDot={{ r: 6, fill: '#ff5c39', stroke: '#15151d', strokeWidth: 2 }}
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
                stroke="#8b8997"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ fill: '#8b8997', r: 3 }}
                activeDot={{ r: 5, fill: '#8b8997', stroke: '#15151d', strokeWidth: 2 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};
