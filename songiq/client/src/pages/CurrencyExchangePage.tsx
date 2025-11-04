import React, { useState, useEffect } from 'react';
import { ArrowDownUp, RefreshCw, DollarSign } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { API_ENDPOINTS } from '../config/api';

interface Currency {
  _id: string;
  symbol: string;
  name: string;
  type: string;
  priceUSD: number;
  icon?: string;
}

const CurrencyExchangePage: React.FC = () => {
  const { token } = useAuth();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [fromCurrency, setFromCurrency] = useState<string>('');
  const [toCurrency, setToCurrency] = useState<string>('');
  const [amount, setAmount] = useState('1');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  useEffect(() => {
    if (fromCurrency && toCurrency && amount) {
      const timer = setTimeout(() => {
        convertCurrency();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [fromCurrency, toCurrency, amount]);

  const fetchCurrencies = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/currencies`);
      const data = await response.json();
      setCurrencies(data.currencies || []);
      
      // Set default currencies
      if (data.currencies && data.currencies.length >= 2) {
        const eth = data.currencies.find((c: Currency) => c.symbol === 'ETH');
        const usdc = data.currencies.find((c: Currency) => c.symbol === 'USDC');
        setFromCurrency(eth?._id || data.currencies[0]._id);
        setToCurrency(usdc?._id || data.currencies[1]._id);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load currencies');
      setLoading(false);
    }
  };

  const convertCurrency = async () => {
    if (!fromCurrency || !toCurrency || !amount) return;

    const fromSymbol = currencies.find(c => c._id === fromCurrency)?.symbol;
    const toSymbol = currencies.find(c => c._id === toCurrency)?.symbol;

    if (!fromSymbol || !toSymbol) return;

    setConverting(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_ENDPOINTS.BASE_URL}/currencies/convert?from=${fromSymbol}&to=${toSymbol}&amount=${amount}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Conversion failed');
      }

      setConvertedAmount(data.convertedAmount);
      setRate(data.rate);
    } catch (err: any) {
      setError(err.message || 'Conversion failed');
      setConvertedAmount(null);
      setRate(null);
    } finally {
      setConverting(false);
    }
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          <ArrowDownUp className="inline mr-2" />
          Currency Exchange
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          {/* From Currency */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From
            </label>
            <div className="flex gap-3">
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {currencies.map((currency) => (
                  <option key={currency._id} value={currency._id}>
                    {currency.symbol} - {currency.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.0001"
                className="w-32 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="1.0"
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center mb-4">
            <button
              onClick={swapCurrencies}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* To Currency */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              To
            </label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {currencies.map((currency) => (
                <option key={currency._id} value={currency._id}>
                  {currency.symbol} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          {/* Conversion Result */}
          {convertedAmount !== null && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-lg p-6 mb-6">
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  You'll receive approximately
                </div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                  {convertedAmount.toFixed(6)}
                  <span className="ml-2 text-2xl text-gray-600 dark:text-gray-400">
                    {currencies.find(c => c._id === toCurrency)?.symbol}
                  </span>
                </div>
                {rate && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    1 {currencies.find(c => c._id === fromCurrency)?.symbol} = {rate.toFixed(6)}{' '}
                    {currencies.find(c => c._id === toCurrency)?.symbol}
                  </div>
                )}
                {converting && (
                  <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                    <RefreshCw className="inline w-4 h-4 animate-spin mr-1" />
                    Updating rate...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-400">
              <DollarSign className="inline w-4 h-4 mr-1" />
              Rates are updated in real-time from multiple sources. Actual trading rates may vary slightly based on market liquidity.
            </p>
          </div>
        </div>

        {/* Currency Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {fromCurrency && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {currencies.find(c => c._id === fromCurrency)?.symbol}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {currencies.find(c => c._id === fromCurrency)?.name}
              </p>
              <p className="text-lg font-bold text-green-600">
                ${currencies.find(c => c._id === fromCurrency)?.priceUSD.toFixed(2)}
              </p>
            </div>
          )}
          {toCurrency && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {currencies.find(c => c._id === toCurrency)?.symbol}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {currencies.find(c => c._id === toCurrency)?.name}
              </p>
              <p className="text-lg font-bold text-green-600">
                ${currencies.find(c => c._id === toCurrency)?.priceUSD.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurrencyExchangePage;

