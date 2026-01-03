import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CourseReviews } from '../components/CourseReviews';
import { Star, Clock, Users, Globe, BookOpen, FileText, Play, Check, Loader, AlertCircle } from 'lucide-react';
import { courseAPI, reviewAPI, enrollmentAPI, walletAPI } from '../utils/api';
import { useApp } from '../context/AppContext';
import { Course, Review } from '../types';
import { toast } from 'sonner@2.0.3';

export const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, refreshUser } = useApp();
  const [activeTab, setActiveTab] = useState<'about' | 'modules' | 'reviews'>('about');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourseData();
    }
  }, [id]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // Fetch course
      const courseData = await courseAPI.getCourse(id!);
      setCourse(courseData);

      // Fetch reviews
      const reviewsData = await reviewAPI.getReviews({ courseId: id });
      setReviews(reviewsData);

      // Check if user is enrolled
      if (currentUser) {
        const enrollments = await enrollmentAPI.getEnrollments(currentUser.id);
        const enrolled = enrollments.some((e: any) => e.id === id);
        setIsEnrolled(enrolled);
      }

    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setShowEnrollModal(true);
  };

  const confirmEnroll = async () => {
    if (!currentUser || !course) return;

    try {
      setEnrolling(true);

      // Check if user has enough tokens
      if (currentUser.tokens < course.price) {
        const topUpAmount = course.price - currentUser.tokens + 50; // Add some extra
        const confirmTopUp = window.confirm(
          `You need ${course.price - currentUser.tokens} more tokens. Would you like to add ${topUpAmount} tokens?`
        );
        
        if (confirmTopUp) {
          await walletAPI.topUp(currentUser.id, topUpAmount);
          await refreshUser();
          toast.success(`Added ${topUpAmount} tokens to your wallet`);
        } else {
          setEnrolling(false);
          setShowEnrollModal(false);
          return;
        }
      }

      // Enroll in course
      await enrollmentAPI.enroll(currentUser.id, course.id);
      
      // Refresh user to get updated tokens and XP
      await refreshUser();

      setShowEnrollModal(false);
      setIsEnrolled(true);
      toast.success('Successfully enrolled! +50 XP earned');

    } catch (error: any) {
      console.error('Error enrolling:', error);
      toast.error(error.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

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

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h1 className="text-3xl mb-4">Course not found</h1>
            <button
              onClick={() => navigate('/explore')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Explore
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="mb-4">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {course.category}
                  </span>
                </div>
                <h1 className="text-4xl mb-4">{course.title}</h1>
                <p className="text-xl opacity-90 mb-6">{course.description}</p>
                
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={course.mentorAvatar || 'https://via.placeholder.com/48'}
                    alt={course.mentorName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p>Created by {course.mentorName}</p>
                    <div className="flex items-center gap-4 text-sm opacity-90">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current" />
                        {course.rating.toFixed(1)}
                      </span>
                      <span>·</span>
                      <span>{course.enrolled} students</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.modules.length} modules</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>{course.language}</span>
                  </div>
                </div>
              </div>

              {/* Course Card */}
              <div className="lg:sticky lg:top-24 h-fit">
                <div className="bg-white rounded-xl overflow-hidden shadow-xl">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="text-center mb-6">
                      <p className="text-3xl text-gray-900 mb-1">{course.price} Tokens</p>
                      <p className="text-sm text-gray-600">One-time payment</p>
                    </div>

                    {isEnrolled ? (
                      <button
                        onClick={() => navigate(`/course/${course.id}/play`)}
                        className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mb-3"
                      >
                        <Play className="w-5 h-5" />
                        Continue Learning
                      </button>
                    ) : (
                      <button
                        onClick={handleEnroll}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-3"
                      >
                        Enroll Now
                      </button>
                    )}

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Lifetime access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>{course.modules.length} video lessons</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>{course.resources.length} downloadable resources</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl">
            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200 mb-8">
              <button
                onClick={() => setActiveTab('about')}
                className={`pb-4 px-2 transition-colors ${
                  activeTab === 'about'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab('modules')}
                className={`pb-4 px-2 transition-colors ${
                  activeTab === 'modules'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Modules ({course.modules.length})
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-4 px-2 transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Reviews ({reviews.length})
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl mb-4">About this course</h2>
                  <p className="text-gray-600 leading-relaxed">{course.description}</p>
                </div>

                {course.resources.length > 0 && (
                  <div>
                    <h2 className="text-2xl mb-4">Resources</h2>
                    <div className="space-y-2">
                      {course.resources.map((resource) => (
                        <div
                          key={resource.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <FileText className="w-5 h-5 text-gray-600" />
                          <span>{resource.title}</span>
                          <span className="ml-auto text-xs text-gray-500 uppercase">
                            {resource.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'modules' && (
              <div className="space-y-3">
                {course.modules.map((module, index) => (
                  <div
                    key={module.id}
                    className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1">{module.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{module.duration}</span>
                      </div>
                    </div>
                    {isEnrolled ? (
                      <Play className="w-5 h-5 text-blue-600" />
                    ) : (
                      <div className="w-6 h-6 border-2 border-gray-300 rounded" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <CourseReviews courseId={course.id} canReview={isEnrolled} />
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Enroll Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-2xl mb-4">Confirm Enrollment</h2>
            <p className="text-gray-600 mb-6">
              You're about to enroll in <strong>{course.title}</strong> for <strong>{course.price} tokens</strong>.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Current balance: {currentUser?.tokens} tokens
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEnrollModal(false)}
                disabled={enrolling}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmEnroll}
                disabled={enrolling}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {enrolling ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};