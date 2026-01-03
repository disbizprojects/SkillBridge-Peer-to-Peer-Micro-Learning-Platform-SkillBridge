import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, Trophy, MessageSquare, BookOpen, Wallet as WalletIcon, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, logout, notifications } = useApp();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getXPProgress = () => {
    if (!currentUser) return 0;
    const xpForNextLevel = currentUser.level * 1000;
    const currentLevelXP = currentUser.xp % 1000;
    return (currentLevelXP / xpForNextLevel) * 100;
  };

  if (!isAuthenticated) {
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white">✦</span>
            </div>
            <span className="text-xl">SkillBridge</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white">✦</span>
              </div>
              <span className="text-xl">SkillBridge</span>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => navigate('/explore')}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Explore
              </button>
              <button
                onClick={() => navigate('/leaderboard')}
                className="text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                Leaderboard
              </button>
              <button
                onClick={() => navigate('/community')}
                className="text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Community
              </button>
              <button
                onClick={() => navigate('/messages')}
                className="text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Messages
              </button>
              <button
                onClick={() => navigate('/wallet')}
                className="text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                <WalletIcon className="w-4 h-4" />
                Wallet
              </button>
            </nav>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-6">
            {/* XP and Level */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                  Level {currentUser.level}
                </span>
                <span className="text-gray-600">{currentUser.xp} XP</span>
              </div>
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                  style={{ width: `${getXPProgress()}%` }}
                />
              </div>
            </div>

            {/* Tokens */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors" onClick={() => navigate('/wallet')}>
              <span className="text-yellow-600">🪙</span>
              <span className="text-yellow-800">{currentUser.tokens}</span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h3>Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            !notif.read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xl">
                              {notif.type === 'session' && '📅'}
                              {notif.type === 'badge' && '🏆'}
                              {notif.type === 'message' && '💬'}
                              {notif.type === 'system' && '🔔'}
                            </span>
                            <div className="flex-1">
                              <p className="text-sm">{notif.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notif.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                )}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p>{currentUser.name}</p>
                    <p className="text-sm text-gray-500">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/explore')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    Explore Courses
                  </button>
                  <button
                    onClick={() => navigate('/leaderboard')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    Leaderboard
                  </button>
                  <button
                    onClick={() => navigate('/community')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    Community
                  </button>
                  <button
                    onClick={() => navigate('/messages')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    Messages
                  </button>
                  <button
                    onClick={() => navigate('/wallet')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    My Wallet
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};