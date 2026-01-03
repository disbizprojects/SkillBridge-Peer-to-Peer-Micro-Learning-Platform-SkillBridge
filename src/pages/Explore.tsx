import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Search, Filter, Star, MessageCircle, User } from 'lucide-react';
import { courseAPI } from '../utils/api';
import { Course } from '../types';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useApp } from '../context/AppContext';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d45a5820`;

interface MentorUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  bio?: string;
  skills: string[];
  rating?: number;
  studentsCount?: number;
}

export const Explore: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useApp();
  const [viewMode, setViewMode] = useState<'courses' | 'mentors'>('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [showFilters, setShowFilters] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [mentors, setMentors] = useState<MentorUser[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'Programming', 'Design', 'Business', 'Marketing', 'Language'];

  // Fetch courses from backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await courseAPI.getCourses();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Fetch mentors from backend
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await fetch(`${API_URL}/users`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch mentors');

        const data = await response.json();
        // Filter only mentors and users with 'both' role
        const mentorUsers = data.filter((u: MentorUser) => 
          u.role === 'mentor' || u.role === 'both'
        );
        setMentors(mentorUsers);
      } catch (error) {
        console.error('Error fetching mentors:', error);
      }
    };

    fetchMentors();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesRating = course.rating >= selectedRating;
    const matchesPrice = course.price >= priceRange[0] && course.price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesRating && matchesPrice;
  });

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.bio?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = mentor.rating >= selectedRating;
    
    return matchesSearch && matchesRating;
  });

  const startChatWithMentor = async (mentor: MentorUser) => {
    if (!isAuthenticated) {
      toast.error('Please login to start a chat');
      navigate('/login');
      return;
    }

    if (mentor.id === currentUser.id) {
      toast.error('You cannot chat with yourself');
      return;
    }

    try {
      // Create new chat session
      const response = await fetch(`${API_URL}/chat/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId1: currentUser.id,
          userId2: mentor.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start chat');
      }

      // Update user token balance
      const userResponse = await fetch(`${API_URL}/users/${currentUser.id}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      if (userResponse.ok) {
        const updatedUser = await userResponse.json();
        localStorage.setItem('skillshare_user', JSON.stringify(updatedUser));
      }

      toast.success(`Chat started with ${mentor.name}!`);
      navigate('/messages');
    } catch (error: any) {
      console.error('Error starting chat:', error);
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl mb-2">Explore Courses & Mentors</h1>
          <p className="text-gray-600">Discover the perfect learning experience for you</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for courses, skills, or mentors..."
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Category */}
              <div className="mb-6">
                <h3 className="mb-3">Category</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <label key={category} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category}
                        onChange={() => setSelectedCategory(category)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm capitalize">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <h3 className="mb-3">Minimum Rating</h3>
                <div className="space-y-2">
                  {[4.5, 4.0, 3.5, 3.0].map(rating => (
                    <label key={rating} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        checked={selectedRating === rating}
                        onChange={() => setSelectedRating(rating)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm">{rating} & up</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="mb-3">Price (Tokens)</h3>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>0</span>
                    <span>{priceRange[1]} tokens</span>
                  </div>
                </div>
              </div>

              {/* Reset Filters */}
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedRating(0);
                  setPriceRange([0, 100]);
                  setSearchQuery('');
                }}
                className="w-full py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="flex-1">
            {/* Tab Switcher */}
            <div className="mb-6 flex items-center gap-4 bg-white rounded-lg p-1 border border-gray-200 w-fit">
              <button
                onClick={() => setViewMode('courses')}
                className={`px-6 py-2 rounded-md transition-colors ${
                  viewMode === 'courses'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Courses
              </button>
              <button
                onClick={() => setViewMode('mentors')}
                className={`px-6 py-2 rounded-md transition-colors ${
                  viewMode === 'mentors'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mentors
              </button>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden mb-6 flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>

            {/* Results Count */}
            <p className="text-gray-600 mb-6">
              Showing {viewMode === 'courses' ? filteredCourses.length : filteredMentors.length}{' '}
              {(viewMode === 'courses' ? filteredCourses.length : filteredMentors.length) === 1 ? 'result' : 'results'}
            </p>

            {/* Courses View */}
            {viewMode === 'courses' && (
              <>
                {filteredCourses.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl mb-2">No courses found</h3>
                    <p className="text-gray-600">Try adjusting your filters or search query</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCourses.map(course => (
                      <div
                        key={course.id}
                        onClick={() => navigate(`/course/${course.id}`)}
                        className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                      >
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <img
                              src={course.mentorAvatar}
                              alt={course.mentorName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <span className="text-sm text-gray-600">{course.mentorName}</span>
                          </div>
                          <h3 className="mb-2 line-clamp-2">{course.title}</h3>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {course.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-yellow-500">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-sm">{course.rating}</span>
                              <span className="text-sm text-gray-500">({course.enrolled})</span>
                            </div>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                              {course.price} tokens
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Mentors View */}
            {viewMode === 'mentors' && (
              <>
                {filteredMentors.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl mb-2">No mentors found</h3>
                    <p className="text-gray-600">Try adjusting your filters or search query</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredMentors.map(mentor => (
                      <div
                        key={mentor.id}
                        className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg transition-shadow"
                      >
                        <div className="p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                              {mentor.avatar ? (
                                <img
                                  src={mentor.avatar}
                                  alt={mentor.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-2xl">{mentor.name[0]}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="mb-1 truncate">{mentor.name}</h3>
                              <p className="text-sm text-gray-500 capitalize">{mentor.role}</p>
                            </div>
                          </div>

                          {mentor.bio && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                              {mentor.bio}
                            </p>
                          )}

                          {mentor.skills && mentor.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {mentor.skills.slice(0, 3).map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                >
                                  {skill}
                                </span>
                              ))}
                              {mentor.skills.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                                  +{mentor.skills.length - 3} more
                                </span>
                              )}
                            </div>
                          )}

                          <button
                            onClick={() => startChatWithMentor(mentor)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>Message (50 tokens)</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};