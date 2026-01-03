import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Upload, Plus, X, Check, Loader } from 'lucide-react';
import { courseAPI } from '../utils/api';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

export const CreateCourse: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, refreshUser } = useApp();
  const [step, setStep] = useState(1);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Programming');
  const [price, setPrice] = useState('50');
  const [language, setLanguage] = useState('English');
  const [modules, setModules] = useState<Array<{ title: string; duration: string }>>([
    { title: '', duration: '' }
  ]);
  const [resources, setResources] = useState<Array<{ title: string; url: string; type: 'pdf' | 'link' }>>([]);
  const [publishing, setPublishing] = useState(false);

  const totalSteps = 4;

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnail(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addModule = () => {
    setModules([...modules, { title: '', duration: '' }]);
  };

  const updateModule = (index: number, field: 'title' | 'duration', value: string) => {
    const newModules = [...modules];
    newModules[index][field] = value;
    setModules(newModules);
  };

  const removeModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  const addResource = () => {
    setResources([...resources, { title: '', url: '', type: 'link' }]);
  };

  const updateResource = (index: number, field: 'title' | 'url' | 'type', value: string) => {
    const newResources = [...resources];
    newResources[index][field] = value;
    setResources(newResources);
  };

  const removeResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!currentUser) {
      toast.error('You must be logged in to create a course');
      navigate('/login');
      return;
    }

    // Validate required fields
    if (!title.trim()) {
      toast.error('Please enter a course title');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a course description');
      return;
    }

    const validModules = modules.filter(m => m.title.trim() && m.duration.trim());
    if (validModules.length === 0) {
      toast.error('Please add at least one module');
      return;
    }

    try {
      setPublishing(true);

      // Calculate total duration
      const totalMinutes = validModules.reduce((acc, module) => {
        const parts = module.duration.split(':');
        const minutes = parseInt(parts[0]) || 0;
        const seconds = parseInt(parts[1]) || 0;
        return acc + minutes + (seconds / 60);
      }, 0);

      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.floor(totalMinutes % 60);
      const durationString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      // Prepare modules with IDs
      const modulesWithIds = validModules.map((m, i) => ({
        id: `module-${Date.now()}-${i}`,
        title: m.title,
        duration: m.duration,
        videoUrl: '#'
      }));

      // Prepare resources with IDs
      const validResources = resources.filter(r => r.title.trim() && r.url.trim());
      const resourcesWithIds = validResources.map((r, i) => ({
        id: `resource-${Date.now()}-${i}`,
        title: r.title,
        url: r.url,
        type: r.type
      }));

      // Create course
      await courseAPI.createCourse({
        mentorId: currentUser.id,
        title,
        description,
        category,
        price: parseInt(price) || 0,
        thumbnail: thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=500&fit=crop',
        modules: modulesWithIds,
        resources: resourcesWithIds,
        duration: durationString,
        language
      });

      // Refresh user to get XP gain
      await refreshUser();

      toast.success('Course published successfully! +100 XP earned');
      navigate('/dashboard');

    } catch (error: any) {
      console.error('Error creating course:', error);
      toast.error(error.message || 'Failed to publish course');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl">Create Micro-Course</h1>
              <span className="text-gray-600">Step {step} of {totalSteps}</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl mb-6">Basic Information</h2>
                
                {/* Thumbnail */}
                <div className="mb-6">
                  <label className="block text-sm mb-2">Course Thumbnail</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    {thumbnail ? (
                      <div className="relative inline-block">
                        <img src={thumbnail} alt="Thumbnail" className="w-full max-w-md rounded-lg" />
                        <button
                          onClick={() => setThumbnail(null)}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="thumbnail-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Click to upload thumbnail</p>
                        <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                        <input
                          id="thumbnail-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div className="mb-6">
                  <label className="block text-sm mb-2">Course Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., React Hooks Masterclass"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what students will learn..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {/* Category and Price */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm mb-2">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Programming">Programming</option>
                      <option value="Design">Design</option>
                      <option value="Business">Business</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Language">Language</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Price (Tokens)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="50"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Language */}
                <div className="mb-6">
                  <label className="block text-sm mb-2">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Chinese">Chinese</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Content Upload */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl mb-6">Course Modules</h2>
                <p className="text-gray-600 mb-6">Add video modules to your course</p>

                <div className="space-y-4 mb-6">
                  {modules.map((module, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            value={module.title}
                            onChange={(e) => updateModule(idx, 'title', e.target.value)}
                            placeholder="Module title"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex gap-3">
                            <input
                              type="text"
                              value={module.duration}
                              onChange={(e) => updateModule(idx, 'duration', e.target.value)}
                              placeholder="Duration (e.g., 15:30)"
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <label className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer flex items-center gap-2">
                              <Upload className="w-5 h-5" />
                              Upload Video
                              <input type="file" accept="video/*" className="hidden" />
                            </label>
                          </div>
                        </div>
                        {modules.length > 1 && (
                          <button
                            onClick={() => removeModule(idx)}
                            className="w-8 h-8 text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addModule}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-600 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Module
                </button>
              </div>
            )}

            {/* Step 3: Resources */}
            {step === 3 && (
              <div>
                <h2 className="text-2xl mb-6">Course Resources</h2>
                <p className="text-gray-600 mb-6">Add downloadable resources or links (optional)</p>

                {resources.length > 0 && (
                  <div className="space-y-4 mb-6">
                    {resources.map((resource, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 space-y-3">
                            <input
                              type="text"
                              value={resource.title}
                              onChange={(e) => updateResource(idx, 'title', e.target.value)}
                              placeholder="Resource title"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              value={resource.url}
                              onChange={(e) => updateResource(idx, 'url', e.target.value)}
                              placeholder="URL or upload file"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <select
                              value={resource.type}
                              onChange={(e) => updateResource(idx, 'type', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="link">Link</option>
                              <option value="pdf">PDF</option>
                            </select>
                          </div>
                          <button
                            onClick={() => removeResource(idx)}
                            className="w-8 h-8 text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={addResource}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-600 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Resource
                </button>
              </div>
            )}

            {/* Step 4: Review & Publish */}
            {step === 4 && (
              <div>
                <h2 className="text-2xl mb-6">Review & Publish</h2>
                
                <div className="space-y-6">
                  {/* Preview */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {thumbnail && (
                      <img src={thumbnail} alt="Course" className="w-full h-48 object-cover" />
                    )}
                    <div className="p-6">
                      <h3 className="text-xl mb-2">{title || 'Course Title'}</h3>
                      <p className="text-gray-600 mb-4">{description || 'Course description...'}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>📚 {category}</span>
                        <span>🪙 {price} tokens</span>
                        <span>📹 {modules.length} modules</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg mb-2 text-green-800">Ready to publish?</h3>
                    <p className="text-green-700 mb-4">
                      Your course will be live immediately and available for students to enroll.
                      You'll earn +100 XP for publishing your first course!
                    </p>
                    <ul className="space-y-2 text-sm text-green-700">
                      <li>�� All modules uploaded</li>
                      <li>✓ Course details complete</li>
                      <li>✓ Ready for students</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className="px-6 py-2 text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Back
              </button>
              {step < totalSteps ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handlePublish}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  {publishing ? <Loader className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  Publish Course
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};