import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { BookOpen, Video, DollarSign, Star, TrendingUp, Calendar, Play, Loader } from 'lucide-react';
import { courseAPI, sessionAPI, enrollmentAPI } from '../utils/api';
import { Course, Session } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [loading, setLoading] = useState(true);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [createdCourses, setCreatedCourses] = useState<Course[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    fetchDashboardData();
  }, [currentUser]);

  const fetchDashboardData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // Fetch sessions
      const sessions = await sessionAPI.getSessions({ userId: currentUser.id, status: 'upcoming' });
      setUpcomingSessions(sessions.slice(0, 3));

      // Fetch enrolled courses (for learners)
      if (currentUser.role === 'learner' || currentUser.role === 'both') {
        const enrolled = await enrollmentAPI.getEnrollments(currentUser.id);
        setEnrolledCourses(enrolled.slice(0, 3));
      }

      // Fetch created courses (for mentors)
      if (currentUser.role === 'mentor' || currentUser.role === 'both') {
        const created = await courseAPI.getCourses({ mentorId: currentUser.id });
        setCreatedCourses(created);
      }

      // Fetch recommended courses
      const allCourses = await courseAPI.getCourses();
      setRecommendedCourses(allCourses.slice(0, 3));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  const isLearner = currentUser.role === 'learner' || currentUser.role === 'both';
  const isMentor = currentUser.role === 'mentor' || currentUser.role === 'both';

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl mb-2">Welcome back, {currentUser.name}! 👋</h1>
          <p className="text-gray-600">Ready to continue your learning journey?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {isLearner && (
            <>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-500">In Progress</span>
                </div>
                <p className="text-3xl mb-1">{enrolledCourses.length}</p>
                <p className="text-gray-600">Courses</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-500">This Month</span>
                </div>
                <p className="text-3xl mb-1">{upcomingSessions.length}</p>
                <p className="text-gray-600">Upcoming Sessions</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                  <span className="text-sm text-gray-500">Available</span>
                </div>
                <p className="text-3xl mb-1">{currentUser.tokens}</p>
                <p className="text-gray-600">Tokens</p>
              </div>
            </>
          )}

          {isMentor && (
            <>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-500">Total</span>
                </div>
                <p className="text-3xl mb-1">{currentUser.totalEarnings || 0}</p>
                <p className="text-gray-600">Tokens Earned</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Video className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-500">Completed</span>
                </div>
                <p className="text-3xl mb-1">{currentUser.totalSessions || 0}</p>
                <p className="text-gray-600">Sessions Hosted</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-sm text-gray-500">Average</span>
                </div>
                <p className="text-3xl mb-1">{currentUser.rating?.toFixed(1) || 'N/A'}</p>
                <p className="text-gray-600">Rating</p>
              </div>
            </>
          )}
        </div>

        {/* XP Progress */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl mb-1">Level {currentUser.level}</h2>
              <p className="text-blue-100">
                {currentUser.xp} XP · {1000 - (currentUser.xp % 1000)} XP to next level
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="bg-white h-3 rounded-full transition-all"
              style={{ width: `${(currentUser.xp % 1000) / 10}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Continue Learning / My Courses */}
          {isLearner && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl">Continue Learning</h2>
                <button
                  onClick={() => navigate('/explore')}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {enrolledCourses.length > 0 ? (
                  enrolledCourses.map((course: any) => (
                    <div
                      key={course.id}
                      className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate(`/course/${course.id}/play`)}
                    >
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-24 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="mb-1">{course.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">by {course.mentorName}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${course.progress || 0}%` }}
                          />
                        </div>
                      </div>
                      <button className="self-center">
                        <Play className="w-6 h-6 text-blue-600" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No enrolled courses yet</p>
                    <button
                      onClick={() => navigate('/explore')}
                      className="mt-3 text-blue-600 hover:text-blue-700"
                    >
                      Explore Courses
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* My Courses (Mentor) */}
          {isMentor && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl">My Courses</h2>
                <button
                  onClick={() => navigate('/create-course')}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Create New
                </button>
              </div>

              <div className="space-y-4">
                {createdCourses.length > 0 ? (
                  createdCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate(`/course/${course.id}`)}
                    >
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-24 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="mb-1">{course.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{course.enrolled} students</span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            {course.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No courses created yet</p>
                    <button
                      onClick={() => navigate('/create-course')}
                      className="mt-3 text-blue-600 hover:text-blue-700"
                    >
                      Create Your First Course
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upcoming Sessions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl">Upcoming Sessions</h2>
              <button
                onClick={() => navigate('/explore')}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/session/${session.id}`)}
                  >
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex flex-col items-center justify-center">
                      <span className="text-xs text-purple-600">
                        {new Date(session.date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-sm text-purple-600">
                        {new Date(session.date).getDate()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1">{session.title}</h3>
                      <p className="text-sm text-gray-600">
                        with {isMentor && session.learnerName ? session.learnerName : session.mentorName} · {session.startTime}
                      </p>
                    </div>
                    <Video className="w-5 h-5 text-gray-400" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No upcoming sessions</p>
                </div>
              )}
            </div>
          </div>

          {/* Recommended Courses */}
          {isLearner && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl">Recommended for You</h2>
                <button
                  onClick={() => navigate('/explore')}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Explore
                </button>
              </div>

              <div className="space-y-4">
                {recommendedCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-24 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="mb-1">{course.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          {course.rating.toFixed(1)}
                        </span>
                        <span>·</span>
                        <span>{course.price} tokens</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
