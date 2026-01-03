import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white">✦</span>
              </div>
              <span className="text-white text-xl">SkillBridge</span>
            </div>
            <p className="text-gray-400">
              Master skills via peer-to-peer learning. Connect with mentors and learners worldwide.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Browse Courses</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Find Mentors</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Become a Mentor</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white mb-4">Connect</h3>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex justify-between items-center">
          <p className="text-gray-500">&copy; 2025 SkillBridge. All rights reserved.</p>
          
          {/* Admin Login Button */}
          <button
            onClick={() => navigate('/admin/login')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
          >
            <Shield className="w-4 h-4" />
            Admin Login
          </button>
        </div>
      </div>
    </footer>
  );
};