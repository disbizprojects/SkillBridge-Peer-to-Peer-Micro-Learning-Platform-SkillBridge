import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Video, Trophy, Star, ArrowRight } from 'lucide-react';
import { Footer } from '../components/Footer';
import { mockUsers } from '../data/mockData';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  const topMentors = mockUsers.filter(u => u.role === 'mentor' || u.role === 'both').slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
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

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl mb-6">
                Master Skills via <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Peer-to-Peer Learning</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Connect with expert mentors for live sessions, micro-courses, and personalized guidance. Level up your skills through gamified learning experiences.
              </p>
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1762784574791-ded574c44c1f?w=800&h=600&fit=crop"
                alt="Online learning"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl text-center mb-16">Why Choose SkillBridge?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-8 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl mb-4">Micro-Courses</h3>
              <p className="text-gray-600">
                Bite-sized video lessons that fit your schedule. Learn at your own pace with high-quality content from expert mentors.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-8 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl mb-4">Live Sessions</h3>
              <p className="text-gray-600">
                Book 1-on-1 or group sessions with mentors. Get real-time feedback and personalized guidance for your learning journey.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-8 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-2xl mb-4">Gamification</h3>
              <p className="text-gray-600">
                Earn XP, unlock badges, and climb the leaderboard. Stay motivated with our engaging reward system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Top Mentors */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl text-center mb-16">Meet Our Top-Rated Mentors</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {topMentors.map(mentor => (
              <div key={mentor.id} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={mentor.avatar}
                    alt={mentor.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl">{mentor.name}</h3>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{mentor.rating}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-3">{mentor.bio}</p>
                <div className="flex flex-wrap gap-2">
                  {mentor.skills.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl text-center mb-16">What Our Users Say</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-xl p-8">
              <div className="flex items-center gap-1 text-yellow-500 mb-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "SkillBridge transformed my learning journey. The mentors are incredibly knowledgeable and the platform is so easy to use!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full" />
                <div>
                  <p>Emma Wilson</p>
                  <p className="text-sm text-gray-500">Web Developer</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-8">
              <div className="flex items-center gap-1 text-yellow-500 mb-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "As a mentor, I love how this platform helps me share my expertise and earn while doing what I love. The gamification keeps everyone engaged!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full" />
                <div>
                  <p>David Lee</p>
                  <p className="text-sm text-gray-500">Senior Designer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl mb-6">Ready to Start Your Learning Journey?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of learners and mentors already growing their skills on SkillBridge
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Get Started Free
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};
