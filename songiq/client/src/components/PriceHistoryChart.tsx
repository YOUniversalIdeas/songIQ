import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface PriceHistoryChartProps {
  marketId: string;
  outcomes: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

const COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ marketId, outcomes }) => {
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'1h' | '24h' | '7d' | '30d' | 'all'>('24h');
  const [selectedOutcomes, setSelectedOutcomes] = useState<Set<string>>(
    new Set(outcomes.map(o => o.id))
  );

  useEffect(() => {
    fetchPriceHistory();
  }, [marketId, period]);

  const fetchPriceHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/markets/${marketId}/price-history?period=${period}`
      );

      if (!response.ok) throw new Error('Failed to fetch price history');

      const data = await response.json();
      
      // Transform data for Recharts
      const transformedData = transformHistoryData(data.history);
      setHistoryData(transformedData);
    } catch (error) {
      console.error('Error fetching price history:', error);
    } finally {
      setLoading(false);
    }
  };

  const transformHistoryData = (history: any) => {
    if (Array.isArray(history)) {
      // Single outcome history
      return history.map((point: any) => ({
        timestamp: new Date(point.timestamp).getTime(),
        price: point.price * 100, // Convert to percentage
      }));
    }

    // Multiple outcomes - merge by timestamp
    const timeMap: { [key: number]: any } = {};

    Object.keys(history).forEach((outcomeId) => {
      history[outcomeId].forEach((point: any) => {
        const time = new Date(point.timestamp).getTime();
        if (!timeMap[time]) {
          timeMap[time] = { timestamp: time };
        }
        timeMap[time][outcomeId] = point.price * 100; // Convert to percentage
      });
    });

    return Object.values(timeMap).sort((a: any, b: any) => a.timestamp - b.timestamp);
  };

  const toggleOutcome = (outcomeId: string) => {
    const newSelected = new Set(selectedOutcomes);
    if (newSelected.has(outcomeId)) {
      newSelected.delete(outcomeId);
    } else {
      newSelected.add(outcomeId);
    }
    setSelectedOutcomes(newSelected);
  };

  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp);
    if (period === '1h') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (period === '24h') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {new Date(label).toLocaleString()}
          </p>
          {payload.map((entry: any, index: number) => {
            const outcome = outcomes.find(o => o.id === entry.dataKey);
            return (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                <span className="font-medium">{outcome?.name || entry.dataKey}:</span>{' '}
                {entry.value.toFixed(1)}%
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Price History
        </h3>
        <div className="flex items-center space-x-2">
          {[
            { value: '1h', label: '1H' },
            { value: '24h', label: '24H' },
            { value: '7d', label: '7D' },
            { value: '30d', label: '30D' },
            { value: 'all', label: 'All' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setPeriod(option.value as any)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                period === option.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Outcome Toggles */}
      <div className="flex flex-wrap gap-2">
        {outcomes.map((outcome, index) => (
          <button
            key={outcome.id}
            onClick={() => toggleOutcome(outcome.id)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              selectedOutcomes.has(outcome.id)
                ? 'shadow-md'
                : 'opacity-50 hover:opacity-75'
            }`}
            style={{
              backgroundColor: selectedOutcomes.has(outcome.id)
                ? COLORS[index % COLORS.length]
                : '#e5e7eb',
              color: selectedOutcomes.has(outcome.id) ? 'white' : '#6b7280',
            }}
          >
            {outcome.name} • {(outcome.price * 100).toFixed(1)}%
          </button>
        ))}
      </div>

      {/* Chart */}
      {loading ? (
        <div className="flex items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : historyData.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatXAxis}
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px' }}
                formatter={(value) => {
                  const outcome = outcomes.find(o => o.id === value);
                  return outcome?.name || value;
                }}
              />
              {outcomes.map((outcome, index) => {
                if (!selectedOutcomes.has(outcome.id)) return null;
                return (
                  <Line
                    key={outcome.id}
                    type="monotone"
                    dataKey={outcome.id}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    name={outcome.id}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No price history available yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Price history will appear after trading begins
          </p>
        </div>
      )}
    </div>
  );
};

export default PriceHistoryChart;

