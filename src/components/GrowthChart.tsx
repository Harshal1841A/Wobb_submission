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
import { formatCount, formatMonthLabel } from '@/lib/formatters';

interface StatHistoryPoint {
  month: string;
  followers: number;
  following?: number;
  avg_likes?: number;
}

interface GrowthChartProps {
  data?: StatHistoryPoint[];
}

export const GrowthChart: React.FC<GrowthChartProps> = ({ data }) => {
  const [showAvgLikes, setShowAvgLikes] = useState(false);

  if (!data || data.length < 2) {
    return (
      <div className="mt-8 rounded-xl bg-[var(--surface)] border border-[var(--border)] p-6 text-center text-[var(--text-muted)] text-sm">
        Not enough history to show a trend.
      </div>
    );
  }

  const chartData = data.map((pt) => ({
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

      <div className="h-64 w-full">
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
      </div>
    </div>
  );
};
