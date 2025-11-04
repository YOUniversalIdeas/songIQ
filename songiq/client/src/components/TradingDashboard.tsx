import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';

interface MarketOverview {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
}

const TradingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<MarketOverview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchOverview, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchOverview = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/currencies`);
      const data = await response.json();
      
      const marketData = (data.currencies || []).map((currency: any) => ({
        symbol: currency.symbol,
        name: currency.name,
        price: currency.priceUSD,
        change24h: currency.price24hChange || 0,
        volume24h: 0 // Can be calculated from trading pairs
      }));
      
      setOverview(marketData);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load market overview:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overview.slice(0, 4).map((market, index) => (
          <div
            key={index}
            onClick={() => navigate('/trading')}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer hover:scale-105"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {market.symbol}
              </span>
              {market.change24h >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              ${market.price.toLocaleString()}
            </div>
            <div
              className={`text-sm font-semibold ${
                market.change24h >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {market.change24h >= 0 ? '+' : ''}
              {market.change24h.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>

      {/* Market Overview Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Activity className="mr-2" />
            Market Overview
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Currency
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  24h Change
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {overview.map((market, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {market.symbol.substring(0, 2)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {market.symbol}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {market.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">
                    ${market.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span
                      className={`text-sm font-semibold ${
                        market.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {market.change24h >= 0 ? '+' : ''}
                      {market.change24h.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => navigate('/trading')}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      Trade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;

