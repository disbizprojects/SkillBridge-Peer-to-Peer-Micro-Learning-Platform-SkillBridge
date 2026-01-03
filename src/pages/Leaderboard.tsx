import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Trophy, Star, TrendingUp, Award, Loader } from 'lucide-react';
import { leaderboardAPI } from '../utils/api';
import { LeaderboardEntry } from '../types';
import { useApp } from '../context/AppContext';

export const Leaderboard: React.FC = () => {
  const { currentUser } = useApp();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await leaderboardAPI.getLeaderboard();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-600';
    return 'text-gray-600';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-4xl">Leaderboard</h1>
              <p className="text-gray-600">Top learners and mentors on SkillShare</p>
            </div>
          </div>

          {/* Timeframe Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setTimeframe('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeframe === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeframe === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeframe('week')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeframe === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              This Week
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Top 3 Podium */}
          {!loading && leaderboard.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {/* 2nd Place */}
              <div className="flex flex-col items-center mt-8">
                <div className="relative mb-4">
                  <img
                    src={leaderboard[1].userAvatar || 'https://via.placeholder.com/80'}
                    alt={leaderboard[1].userName}
                    className="w-20 h-20 rounded-full object-cover border-4 border-gray-300"
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-lg">
                    🥈
                  </div>
                </div>
                <h3 className="text-center mb-1">{leaderboard[1].userName}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{leaderboard[1].xp.toLocaleString()} XP</span>
                </div>
                <div className="mt-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
                  Level {leaderboard[1].level}
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <img
                    src={leaderboard[0].userAvatar || 'https://via.placeholder.com/96'}
                    alt={leaderboard[0].userName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-yellow-400 shadow-lg"
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-xl shadow-lg">
                    🥇
                  </div>
                </div>
                <h3 className="text-center mb-1">{leaderboard[0].userName}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{leaderboard[0].xp.toLocaleString()} XP</span>
                </div>
                <div className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                  Level {leaderboard[0].level}
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center mt-8">
                <div className="relative mb-4">
                  <img
                    src={leaderboard[2].userAvatar || 'https://via.placeholder.com/80'}
                    alt={leaderboard[2].userName}
                    className="w-20 h-20 rounded-full object-cover border-4 border-orange-400"
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-lg">
                    🥉
                  </div>
                </div>
                <h3 className="text-center mb-1">{leaderboard[2].userName}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{leaderboard[2].xp.toLocaleString()} XP</span>
                </div>
                <div className="mt-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                  Level {leaderboard[2].level}
                </div>
              </div>
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl flex items-center gap-2">
                <Award className="w-6 h-6 text-blue-600" />
                Rankings
              </h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : leaderboard.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.userId}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      entry.userId === currentUser?.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className={`text-2xl w-12 text-center ${getRankColor(entry.rank)}`}>
                        {getRankIcon(entry.rank)}
                      </div>

                      {/* Avatar */}
                      <img
                        src={entry.userAvatar || 'https://via.placeholder.com/48'}
                        alt={entry.userName}
                        className="w-12 h-12 rounded-full object-cover"
                      />

                      {/* Name & Stats */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3>{entry.userName}</h3>
                          {entry.userId === currentUser?.id && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            Level {entry.level}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            {entry.xp.toLocaleString()} XP
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="hidden md:block w-32">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(entry.xp % 1000) / 10}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-center">
                          {1000 - (entry.xp % 1000)} to next level
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No rankings yet</p>
                <p className="text-sm">Start earning XP to appear on the leaderboard!</p>
              </div>
            )}
          </div>

          {/* Your Rank Card */}
          {currentUser && !loading && (
            <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
              <h3 className="text-xl mb-4">Your Progress</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm opacity-90 mb-1">Your Rank</p>
                  <p className="text-3xl">
                    #{leaderboard.findIndex(e => e.userId === currentUser.id) + 1 || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm opacity-90 mb-1">Level</p>
                  <p className="text-3xl">{currentUser.level}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90 mb-1">Total XP</p>
                  <p className="text-3xl">{currentUser.xp.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
