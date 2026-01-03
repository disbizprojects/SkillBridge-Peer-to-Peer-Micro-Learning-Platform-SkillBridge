// This is a utility to help you seed initial data for testing
// You can call these functions from your browser console or from a dedicated seeding page

import { courseAPI, authAPI, forumAPI } from './api';

export async function seedInitialData() {
  console.log('🌱 Starting data seeding...');

  try {
    // Create mentor users
    console.log('Creating mentor users...');
    
    const mentor1 = await authAPI.signup(
      'john@example.com',
      'password123',
      'John Smith',
      'mentor'
    );
    console.log('✅ Created mentor:', mentor1.user.name);

    const mentor2 = await authAPI.signup(
      'sarah@example.com',
      'password123',
      'Sarah Johnson',
      'both'
    );
    console.log('✅ Created mentor:', mentor2.user.name);

    // Create learner
    console.log('Creating learner...');
    const learner = await authAPI.signup(
      'mike@example.com',
      'password123',
      'Mike Chen',
      'learner'
    );
    console.log('✅ Created learner:', learner.user.name);

    // Update mentor profiles
    console.log('Updating mentor profiles...');
    await fetch(`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-d45a5820/users/${mentor1.user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        bio: 'Senior React developer with 8 years of experience. Passionate about teaching and helping others grow.',
        skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop'
      })
    });

    await fetch(`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-d45a5820/users/${mentor2.user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        bio: 'UX Designer and educator. I love helping people discover the joy of design thinking.',
        skills: ['UI/UX Design', 'Figma', 'User Research', 'Prototyping'],
        avatar: 'https://images.unsplash.com/photo-1765648580808-76d75e4f3833?w=200&h=200&fit=crop'
      })
    });
    console.log('✅ Updated mentor profiles');

    // Create courses
    console.log('Creating courses...');
    
    const course1 = await courseAPI.createCourse({
      mentorId: mentor1.user.id,
      title: 'React Hooks Masterclass',
      description: 'Deep dive into React Hooks with practical examples and real-world applications.',
      category: 'Programming',
      price: 50,
      thumbnail: 'https://images.unsplash.com/photo-1762784574791-ded574c44c1f?w=800&h=500&fit=crop',
      modules: [
        { id: 'm1', title: 'Introduction to Hooks', duration: '12:30' },
        { id: 'm2', title: 'useState in Depth', duration: '18:45' },
        { id: 'm3', title: 'useEffect and Side Effects', duration: '22:15' },
        { id: 'm4', title: 'Custom Hooks', duration: '25:00' }
      ],
      resources: [
        { id: 'r1', title: 'Hooks Cheat Sheet', type: 'pdf', url: '#' },
        { id: 'r2', title: 'Official React Docs', type: 'link', url: 'https://react.dev' }
      ],
      duration: '1h 18m',
      language: 'English'
    });
    console.log('✅ Created course:', course1.title);

    const course2 = await courseAPI.createCourse({
      mentorId: mentor2.user.id,
      title: 'UI/UX Design Fundamentals',
      description: 'Learn the principles of great user experience and interface design from scratch.',
      category: 'Design',
      price: 40,
      thumbnail: 'https://images.unsplash.com/photo-1758687126375-e2c1683219e9?w=800&h=500&fit=crop',
      modules: [
        { id: 'm5', title: 'Design Thinking Basics', duration: '15:20' },
        { id: 'm6', title: 'User Research Methods', duration: '20:10' },
        { id: 'm7', title: 'Wireframing and Prototyping', duration: '28:30' }
      ],
      resources: [
        { id: 'r3', title: 'Design System Template', type: 'link', url: '#' }
      ],
      duration: '1h 4m',
      language: 'English'
    });
    console.log('✅ Created course:', course2.title);

    const course3 = await courseAPI.createCourse({
      mentorId: mentor1.user.id,
      title: 'TypeScript for Beginners',
      description: 'Get started with TypeScript and learn how to write type-safe JavaScript code.',
      category: 'Programming',
      price: 35,
      thumbnail: 'https://images.unsplash.com/photo-1762784574791-ded574c44c1f?w=800&h=500&fit=crop',
      modules: [
        { id: 'm8', title: 'What is TypeScript?', duration: '10:00' },
        { id: 'm9', title: 'Basic Types', duration: '16:45' },
        { id: 'm10', title: 'Interfaces and Types', duration: '19:20' }
      ],
      resources: [],
      duration: '46m',
      language: 'English'
    });
    console.log('✅ Created course:', course3.title);

    // Create forum posts
    console.log('Creating forum posts...');
    
    await forumAPI.createPost({
      authorId: learner.user.id,
      category: 'Programming',
      title: 'How to handle async state in React?',
      content: "I'm struggling with managing async state in my React app. Any tips?"
    });

    await forumAPI.createPost({
      authorId: learner.user.id,
      category: 'Design',
      title: 'Best practices for mobile-first design?',
      content: 'Looking for advice on creating mobile-first design systems.'
    });
    console.log('✅ Created forum posts');

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📝 Test Accounts:');
    console.log('Mentor 1: john@example.com / password123');
    console.log('Mentor 2: sarah@example.com / password123');
    console.log('Learner: mike@example.com / password123');
    
    return {
      mentors: [mentor1.user, mentor2.user],
      learner: learner.user,
      courses: [course1, course2, course3]
    };
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

// Quick function to test if backend is working
export async function testBackend() {
  try {
    const response = await fetch('https://' + import.meta.env.VITE_SUPABASE_PROJECT_ID + '.supabase.co/functions/v1/make-server-d45a5820/health');
    const data = await response.json();
    
    if (data.status === 'ok') {
      console.log('✅ Backend is running!');
      return true;
    } else {
      console.log('❌ Backend returned unexpected response:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Backend is not responding:', error);
    return false;
  }
}

// Usage:
// In browser console:
// import { seedInitialData, testBackend } from './utils/seedData';
// await testBackend();
// await seedInitialData();
