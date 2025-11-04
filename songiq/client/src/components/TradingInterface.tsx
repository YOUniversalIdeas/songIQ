import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';

interface Outcome {
  id: string;
  name: string;
  description: string;
  shares: number;
  price: number;
  totalVolume: number;
}

interface TradingInterfaceProps {
  outcomes: Outcome[];
  marketId: string;
  onTrade: (outcomeId: string, type: 'buy' | 'sell', shares: number) => Promise<void>;
  userPosition?: {
    outcomeId: string;
    shares: number;
    averageCost: number;
  }[];
}

const TradingInterface: React.FC<TradingInterfaceProps> = ({
  outcomes,
  marketId,
  onTrade,
  userPosition = [],
}) => {
  const [selectedOutcome, setSelectedOutcome] = useState<string>(outcomes[0]?.id || '');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [shares, setShares] = useState<number>(10);
  const [isTrading, setIsTrading] = useState(false);
  const [error, setError] = useState<string>('');

  const selectedOutcomeData = outcomes.find(o => o.id === selectedOutcome);
  const userPositionForOutcome = userPosition.find(p => p.outcomeId === selectedOutcome);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const calculateTotalCost = () => {
    if (!selectedOutcomeData) return 0;
    const cost = shares * selectedOutcomeData.price;
    const fee = cost * 0.02; // 2% fee
    return cost + fee;
  };

  const calculatePotentialReturn = () => {
    if (!selectedOutcomeData) return 0;
    const cost = calculateTotalCost();
    const maxReturn = shares * 1.0; // If outcome wins, each share is worth 1.0
    return maxReturn - cost;
  };

  const handleTrade = async () => {
    if (!selectedOutcomeData) return;

    setError('');
    setIsTrading(true);

    try {
      if (tradeType === 'sell' && (!userPositionForOutcome || userPositionForOutcome.shares < shares)) {
        throw new Error('Insufficient shares to sell');
      }

      await onTrade(selectedOutcome, tradeType, shares);
      setShares(10); // Reset
    } catch (err: any) {
      setError(err.message || 'Trade failed');
    } finally {
      setIsTrading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
        Trade
      </h3>

      {/* Trade Type Selector */}
      <div className="flex space-x-2">
        <button
          onClick={() => setTradeType('buy')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            tradeType === 'buy'
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <TrendingUp className="w-5 h-5 inline mr-2" />
          Buy
        </button>
        <button
          onClick={() => setTradeType('sell')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            tradeType === 'sell'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <TrendingDown className="w-5 h-5 inline mr-2" />
          Sell
        </button>
      </div>

      {/* Outcome Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Outcome
        </label>
        <select
          value={selectedOutcome}
          onChange={(e) => setSelectedOutcome(e.target.value)}
          className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {outcomes.map((outcome) => (
            <option key={outcome.id} value={outcome.id}>
              {outcome.name} - {formatPercentage(outcome.price)}
            </option>
          ))}
        </select>
      </div>

      {/* Shares Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Number of Shares
        </label>
        <input
          type="number"
          min="1"
          step="1"
          value={shares}
          onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Current Position */}
      {userPositionForOutcome && userPositionForOutcome.shares > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Your Position
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-blue-700 dark:text-blue-300">Shares Held</div>
              <div className="font-bold text-blue-900 dark:text-blue-100">
                {userPositionForOutcome.shares.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-blue-700 dark:text-blue-300">Avg. Cost</div>
              <div className="font-bold text-blue-900 dark:text-blue-100">
                {formatCurrency(userPositionForOutcome.averageCost)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trade Summary */}
      {selectedOutcomeData && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Current Price</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(selectedOutcomeData.price)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Shares</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {shares}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Fee (2%)</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(shares * selectedOutcomeData.price * 0.02)}
            </span>
          </div>
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Total Cost
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(calculateTotalCost())}
              </span>
            </div>
          </div>
          {tradeType === 'buy' && (
            <div className="pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600 dark:text-green-400">
                  Potential Profit (if wins)
                </span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  +{formatCurrency(calculatePotentialReturn())}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
          <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
        </div>
      )}

      {/* Trade Button */}
      <button
        onClick={handleTrade}
        disabled={isTrading || !selectedOutcomeData}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
          tradeType === 'buy'
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-red-600 hover:bg-red-700 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg`}
      >
        {isTrading ? (
          'Processing...'
        ) : (
          <>
            <DollarSign className="w-5 h-5 inline mr-2" />
            {tradeType === 'buy' ? 'Buy' : 'Sell'} Shares
          </>
        )}
      </button>
    </div>
  );
};

export default TradingInterface;

