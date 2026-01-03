import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Upload, X, Check } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useApp();
  const [step, setStep] = useState(1);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  const totalSteps = currentUser?.role === 'mentor' || currentUser?.role === 'both' ? 4 : 3;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleComplete = () => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        avatar: avatar || currentUser.avatar,
        bio,
        skills
      });
    }
    navigate('/dashboard');
  };

  const suggestedSkills = [
    'React', 'JavaScript', 'TypeScript', 'Python', 'UI/UX Design',
    'Figma', 'Node.js', 'GraphQL', 'Public Speaking', 'Leadership'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Step {step} of {totalSteps}</span>
            <span className="text-sm text-gray-600">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Upload Profile Picture */}
        {step === 1 && (
          <div>
            <h2 className="text-3xl mb-2">Add a Profile Picture</h2>
            <p className="text-gray-600 mb-8">Help others recognize you</p>

            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-32 h-32 rounded-full object-cover" />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                    <Upload className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  <Upload className="w-5 h-5 text-white" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-gray-500">Click the icon to upload an image</p>
            </div>
          </div>
        )}

        {/* Step 2: Bio */}
        {step === 2 && (
          <div>
            <h2 className="text-3xl mb-2">Tell us about yourself</h2>
            <p className="text-gray-600 mb-8">Write a short introduction</p>

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="I'm passionate about..."
              className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-sm text-gray-500 mt-2">{bio.length} / 500 characters</p>
          </div>
        )}

        {/* Step 3: Skills */}
        {step === 3 && (
          <div>
            <h2 className="text-3xl mb-2">Add your skills</h2>
            <p className="text-gray-600 mb-8">Tag skills you want to learn or teach</p>

            <div className="mb-4">
              <label className="block text-sm mb-2">Type a skill and press Enter</label>
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={addSkill}
                placeholder="e.g., React, Design, Marketing..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Selected Skills */}
            {skills.length > 0 && (
              <div className="mb-6">
                <p className="text-sm mb-2">Your skills:</p>
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center gap-2"
                    >
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-blue-900">
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Skills */}
            <div>
              <p className="text-sm mb-2">Or choose from popular skills:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedSkills
                  .filter(s => !skills.includes(s))
                  .map(skill => (
                    <button
                      key={skill}
                      onClick={() => setSkills([...skills, skill])}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      + {skill}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Payment (Mentors only) */}
        {step === 4 && (currentUser?.role === 'mentor' || currentUser?.role === 'both') && (
          <div>
            <h2 className="text-3xl mb-2">Connect Payment Method</h2>
            <p className="text-gray-600 mb-8">Set up Stripe to receive payments</p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-2xl">💳</span>
                </div>
                <div>
                  <h3 className="text-lg mb-2">Stripe Integration</h3>
                  <p className="text-gray-700 mb-4">
                    Connect your Stripe account to receive payments from your mentoring sessions and courses.
                  </p>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Connect Stripe Account
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleComplete}
              className="text-blue-600 hover:underline"
            >
              Skip for now (you can set this up later)
            </button>
          </div>
        )}

        {/* Navigation Buttons */}
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              Next
              <Check className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              Complete
              <Check className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
