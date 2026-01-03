import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useApp } from '../context/AppContext';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Plus, TrendingUp, Loader } from 'lucide-react';
import { walletAPI } from '../utils/api';
import { Transaction } from '../types';
import { toast } from 'sonner@2.0.3';

export const Wallet: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, refreshUser } = useApp();
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('100');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    fetchTransactions();
  }, [currentUser]);

  const fetchTransactions = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const data = await walletAPI.getTransactions(currentUser.id);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async () => {
    if (!currentUser) return;

    const amount = parseInt(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setProcessing(true);
      await walletAPI.topUp(currentUser.id, amount);
      await refreshUser();
      await fetchTransactions();
      
      setShowTopUpModal(false);
      toast.success(`Successfully added ${amount} tokens to your wallet!`);
    } catch (error: any) {
      console.error('Error topping up:', error);
      toast.error(error.message || 'Failed to top up');
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = () => {
    // Simulate withdrawal
    toast.success('Withdrawal request submitted! Funds will be transferred within 3-5 business days.');
    setShowWithdrawModal(false);
  };

  if (!currentUser) {
    return null;
  }

  const isMentor = currentUser.role === 'mentor' || currentUser.role === 'both';
  const exchangeRate = 0.1; // 1 token = $0.10

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl mb-2">My Wallet</h1>
            <p className="text-gray-600">Manage your tokens and transactions</p>
          </div>

          {/* Balance Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Token Balance */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
                <span className="text-xl opacity-90">Token Balance</span>
              </div>
              <p className="text-5xl mb-2">{currentUser.tokens}</p>
              <p className="opacity-90">
                ≈ ${(currentUser.tokens * exchangeRate).toFixed(2)} USD
              </p>
            </div>

            {/* Earnings (Mentors only) */}
            {isMentor && (
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <span className="text-xl opacity-90">Total Earnings</span>
                </div>
                <p className="text-5xl mb-2">{currentUser.totalEarnings || 0}</p>
                <p className="opacity-90">
                  ≈ ${((currentUser.totalEarnings || 0) * exchangeRate).toFixed(2)} USD
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setShowTopUpModal(true)}
              className="flex-1 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Top Up Tokens
            </button>
            {isMentor && (
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="flex-1 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowDownCircle className="w-5 h-5" />
                Withdraw Earnings
              </button>
            )}
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-2xl mb-6">Transaction History</h2>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'credit'
                            ? 'bg-green-100'
                            : 'bg-red-100'
                        }`}
                      >
                        {transaction.type === 'credit' ? (
                          <ArrowUpCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <ArrowDownCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="mb-1">{transaction.description}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-xl ${
                          transaction.type === 'credit'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'credit' ? '+' : ''}
                        {transaction.amount}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No transactions yet</p>
                <p className="text-sm">Your transaction history will appear here</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-2xl mb-4">Top Up Tokens</h2>
            <p className="text-gray-600 mb-6">
              Add tokens to your wallet to enroll in courses and book sessions.
            </p>

            <div className="mb-6">
              <label className="block text-sm mb-2">Amount (tokens)</label>
              <input
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="100"
                min="1"
              />
              <p className="text-sm text-gray-500 mt-2">
                ≈ ${(parseInt(topUpAmount) * exchangeRate || 0).toFixed(2)} USD
              </p>
            </div>

            {/* Preset Amounts */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[50, 100, 200].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTopUpAmount(String(amount))}
                  className="py-2 border border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  {amount}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowTopUpModal(false)}
                disabled={processing}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleTopUp}
                disabled={processing}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Top Up'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-2xl mb-4">Withdraw Earnings</h2>
            <p className="text-gray-600 mb-6">
              Request to withdraw your earned tokens to your bank account.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Available to withdraw:</strong> {currentUser.totalEarnings || 0} tokens
                (≈ ${((currentUser.totalEarnings || 0) * exchangeRate).toFixed(2)} USD)
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                Withdrawals are processed within 3-5 business days. A 5% processing fee applies.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Request Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
