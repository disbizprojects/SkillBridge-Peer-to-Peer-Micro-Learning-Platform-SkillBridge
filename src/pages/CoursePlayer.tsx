import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { ChevronLeft, Check, FileText, Sparkles, Loader, Trophy } from 'lucide-react';
import { courseAPI, enrollmentAPI } from '../utils/api';
import { useApp } from '../context/AppContext';
import { Course } from '../types';
import { toast } from 'sonner@2.0.3';

export const CoursePlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, refreshUser } = useApp();
  const [course, setCourse] = useState<Course | null>(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [showCourseCompleteAnimation, setShowCourseCompleteAnimation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (id && currentUser) {
      fetchCourseData();
    }
  }, [id, currentUser]);

  const fetchCourseData = async () => {
    if (!id || !currentUser) return;

    try {
      setLoading(true);

      // Fetch course
      const courseData = await courseAPI.getCourse(id);
      setCourse(courseData);

      // Fetch enrollment to get progress
      const enrollments = await enrollmentAPI.getEnrollments(currentUser.id);
      const enrollment = enrollments.find((e: any) => e.id === id);
      
      if (enrollment && enrollment.completedModules) {
        setCompletedModules(enrollment.completedModules);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!course || !currentUser || marking) return;

    const currentModule = course.modules[currentModuleIndex];
    
    // Check if already completed
    if (completedModules.includes(currentModule.id)) {
      toast.info('Module already completed');
      return;
    }

    try {
      setMarking(true);

      // Update progress on backend
      await enrollmentAPI.updateProgress(
        currentUser.id,
        course.id,
        currentModule.id,
        true
      );

      // Update local state
      const newCompleted = [...completedModules, currentModule.id];
      setCompletedModules(newCompleted);

      // Refresh user to get XP gain
      await refreshUser();

      // Show completion animation
      setShowCompletionAnimation(true);
      setTimeout(() => setShowCompletionAnimation(false), 2000);

      // Check if course is complete
      if (newCompleted.length === course.modules.length) {
        setTimeout(() => {
          setShowCourseCompleteAnimation(true);
        }, 2500);
      } else {
        // Move to next module
        if (currentModuleIndex < course.modules.length - 1) {
          setTimeout(() => {
            setCurrentModuleIndex(currentModuleIndex + 1);
          }, 1500);
        }
      }

      toast.success('Module completed! +20 XP earned');
    } catch (error: any) {
      console.error('Error marking module complete:', error);
      toast.error(error.message || 'Failed to update progress');
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-white" />
        </main>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  const currentModule = course.modules[currentModuleIndex];
  const progress = (completedModules.length / course.modules.length) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />

      {/* Module Completion Animation */}
      {showCompletionAnimation && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fadeIn">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Sparkles className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-4xl text-white mb-2">+20 XP</h2>
            <p className="text-xl text-white/80">Module Completed!</p>
          </div>
        </div>
      )}

      {/* Course Complete Animation */}
      {showCourseCompleteAnimation && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl mb-3">🎉 Course Completed!</h2>
            <p className="text-gray-600 mb-2">Congratulations on finishing</p>
            <p className="text-xl mb-6">{course.title}</p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-blue-800">
                <strong>+100 XP Bonus Earned!</strong>
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Video Player Area */}
        <main className="flex-1 flex flex-col">
          {/* Back Button */}
          <div className="bg-gray-900 px-4 py-3 border-b border-gray-800">
            <button
              onClick={() => navigate(`/course/${id}`)}
              className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Course
            </button>
          </div>

          {/* Video Player */}
          <div className="flex-1 bg-black flex items-center justify-center">
            <div className="w-full max-w-6xl aspect-video bg-gray-900 rounded-lg overflow-hidden">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">▶</span>
                  </div>
                  <p className="text-xl">{currentModule.title}</p>
                  <p className="text-sm mt-2">Duration: {currentModule.duration}</p>
                  <p className="text-xs mt-4 text-gray-500">Video player placeholder</p>
                </div>
              </div>
            </div>
          </div>

          {/* Module Info and Actions */}
          <div className="bg-gray-900 px-6 py-4 border-t border-gray-800">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div>
                <h2 className="text-white text-xl mb-1">{currentModule.title}</h2>
                <p className="text-gray-400 text-sm">
                  Module {currentModuleIndex + 1} of {course.modules.length}
                </p>
              </div>
              {!completedModules.includes(currentModule.id) ? (
                <button
                  onClick={handleMarkComplete}
                  disabled={marking}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {marking ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Mark Complete
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-2 text-green-400">
                  <Check className="w-5 h-5" />
                  <span>Completed</span>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Sidebar - Module List */}
        <aside className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col">
          {/* Progress */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white">Course Progress</h3>
              <span className="text-white">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-gray-400 text-sm mt-2">
              {completedModules.length} of {course.modules.length} modules completed
            </p>
          </div>

          {/* Module List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-2">
              <h3 className="text-white mb-3">Modules</h3>
              {course.modules.map((module, index) => (
                <button
                  key={module.id}
                  onClick={() => setCurrentModuleIndex(index)}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${
                    currentModuleIndex === index
                      ? 'bg-blue-600 text-white'
                      : completedModules.includes(module.id)
                      ? 'bg-green-900/30 text-green-400'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        completedModules.includes(module.id)
                          ? 'bg-green-600'
                          : currentModuleIndex === index
                          ? 'bg-blue-700'
                          : 'bg-gray-700'
                      }`}
                    >
                      {completedModules.includes(module.id) ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <span className="text-sm">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate mb-1">{module.title}</p>
                      <p className="text-xs opacity-70">{module.duration}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Resources */}
          {course.resources.length > 0 && (
            <div className="p-6 border-t border-gray-800">
              <h3 className="text-white mb-3">Resources</h3>
              <div className="space-y-2">
                {course.resources.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-gray-300"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="text-sm flex-1">{resource.title}</span>
                    <span className="text-xs opacity-70 uppercase">{resource.type}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
