import { User, Course, Session, Review, Transaction, ForumPost, LeaderboardEntry } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'john@example.com',
    name: 'John Smith',
    role: 'mentor',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
    bio: 'Senior React developer with 8 years of experience. Passionate about teaching and helping others grow.',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
    level: 15,
    xp: 12450,
    tokens: 450,
    badges: [
      { id: 'b1', name: 'Top Mentor', icon: '🏆', description: 'Hosted 100+ sessions', earnedAt: '2024-01-15' },
      { id: 'b2', name: 'Expert', icon: '⭐', description: 'Maintained 4.8+ rating', earnedAt: '2024-03-20' }
    ],
    rating: 4.9,
    totalSessions: 156,
    totalEarnings: 15600,
    createdAt: '2023-06-01'
  },
  {
    id: '2',
    email: 'sarah@example.com',
    name: 'Sarah Johnson',
    role: 'both',
    avatar: 'https://images.unsplash.com/photo-1765648580808-76d75e4f3833?w=200&h=200&fit=crop',
    bio: 'UX Designer and educator. I love helping people discover the joy of design thinking.',
    skills: ['UI/UX Design', 'Figma', 'User Research', 'Prototyping'],
    level: 12,
    xp: 9200,
    tokens: 280,
    badges: [
      { id: 'b3', name: 'Rising Star', icon: '🌟', description: 'Fast growing mentor', earnedAt: '2024-05-10' }
    ],
    rating: 4.8,
    totalSessions: 89,
    totalEarnings: 8900,
    createdAt: '2023-09-15'
  },
  {
    id: '3',
    email: 'mike@example.com',
    name: 'Mike Chen',
    role: 'learner',
    avatar: 'https://images.unsplash.com/photo-1514369118554-e20d93546b30?w=200&h=200&fit=crop',
    bio: 'Aspiring full-stack developer eager to learn and grow.',
    skills: ['JavaScript', 'Python', 'HTML/CSS'],
    level: 6,
    xp: 3400,
    tokens: 150,
    badges: [
      { id: 'b4', name: 'Early Adopter', icon: '🚀', description: 'Joined in beta', earnedAt: '2024-02-01' }
    ],
    createdAt: '2024-02-01'
  }
];

export const mockCourses: Course[] = [
  {
    id: 'c1',
    title: 'React Hooks Masterclass',
    description: 'Deep dive into React Hooks with practical examples and real-world applications.',
    mentorId: '1',
    mentorName: 'John Smith',
    mentorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
    category: 'Programming',
    price: 50,
    rating: 4.9,
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
    enrolled: 234,
    duration: '1h 18m',
    language: 'English'
  },
  {
    id: 'c2',
    title: 'UI/UX Design Fundamentals',
    description: 'Learn the principles of great user experience and interface design from scratch.',
    mentorId: '2',
    mentorName: 'Sarah Johnson',
    mentorAvatar: 'https://images.unsplash.com/photo-1765648580808-76d75e4f3833?w=200&h=200&fit=crop',
    category: 'Design',
    price: 40,
    rating: 4.8,
    thumbnail: 'https://images.unsplash.com/photo-1758687126375-e2c1683219e9?w=800&h=500&fit=crop',
    modules: [
      { id: 'm5', title: 'Design Thinking Basics', duration: '15:20' },
      { id: 'm6', title: 'User Research Methods', duration: '20:10' },
      { id: 'm7', title: 'Wireframing and Prototyping', duration: '28:30' }
    ],
    resources: [
      { id: 'r3', title: 'Design System Template', type: 'link', url: '#' }
    ],
    enrolled: 189,
    duration: '1h 4m',
    language: 'English'
  },
  {
    id: 'c3',
    title: 'TypeScript for Beginners',
    description: 'Get started with TypeScript and learn how to write type-safe JavaScript code.',
    mentorId: '1',
    mentorName: 'John Smith',
    mentorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
    category: 'Programming',
    price: 35,
    rating: 4.7,
    thumbnail: 'https://images.unsplash.com/photo-1762784574791-ded574c44c1f?w=800&h=500&fit=crop',
    modules: [
      { id: 'm8', title: 'What is TypeScript?', duration: '10:00' },
      { id: 'm9', title: 'Basic Types', duration: '16:45' },
      { id: 'm10', title: 'Interfaces and Types', duration: '19:20' }
    ],
    resources: [],
    enrolled: 156,
    duration: '46m',
    language: 'English'
  }
];

export const mockSessions: Session[] = [
  {
    id: 's1',
    mentorId: '1',
    mentorName: 'John Smith',
    mentorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
    learnerId: '3',
    learnerName: 'Mike Chen',
    type: '1-on-1',
    title: 'React Performance Optimization',
    date: '2025-12-20',
    startTime: '14:00',
    endTime: '15:00',
    status: 'upcoming',
    tokens: 60,
    meetingUrl: '#'
  },
  {
    id: 's2',
    mentorId: '2',
    mentorName: 'Sarah Johnson',
    mentorAvatar: 'https://images.unsplash.com/photo-1765648580808-76d75e4f3833?w=200&h=200&fit=crop',
    type: 'group',
    title: 'Design System Workshop',
    date: '2025-12-21',
    startTime: '16:00',
    endTime: '17:30',
    status: 'upcoming',
    tokens: 40,
    meetingUrl: '#'
  }
];

export const mockReviews: Review[] = [
  {
    id: 'rev1',
    userId: '3',
    userName: 'Mike Chen',
    userAvatar: 'https://images.unsplash.com/photo-1514369118554-e20d93546b30?w=200&h=200&fit=crop',
    rating: 5,
    tags: ['Helpful', 'Knowledgeable', 'Patient'],
    comment: 'John is an excellent mentor! He explained complex concepts in a way that was easy to understand.',
    date: '2025-12-15'
  },
  {
    id: 'rev2',
    userId: '3',
    userName: 'Mike Chen',
    userAvatar: 'https://images.unsplash.com/photo-1514369118554-e20d93546b30?w=200&h=200&fit=crop',
    rating: 5,
    tags: ['Inspiring', 'Creative', 'Helpful'],
    comment: 'Sarah\'s design thinking approach really opened my eyes to new possibilities!',
    date: '2025-12-10'
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: 't1',
    date: '2025-12-18',
    description: 'Session with John Smith',
    amount: -60,
    type: 'debit',
    status: 'completed'
  },
  {
    id: 't2',
    date: '2025-12-15',
    description: 'Enrolled in UI/UX Design Fundamentals',
    amount: -40,
    type: 'debit',
    status: 'completed'
  },
  {
    id: 't3',
    date: '2025-12-10',
    description: 'Token Top-up',
    amount: 200,
    type: 'credit',
    status: 'completed'
  }
];

export const mockForumPosts: ForumPost[] = [
  {
    id: 'p1',
    category: 'Programming',
    title: 'How to handle async state in React?',
    content: 'I\'m struggling with managing async state in my React app. Any tips?',
    authorId: '3',
    authorName: 'Mike Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1514369118554-e20d93546b30?w=200&h=200&fit=crop',
    replies: 12,
    lastActive: '2025-12-19T14:30:00Z',
    createdAt: '2025-12-18T10:00:00Z'
  },
  {
    id: 'p2',
    category: 'Design',
    title: 'Best practices for mobile-first design?',
    content: 'Looking for advice on creating mobile-first design systems.',
    authorId: '3',
    authorName: 'Mike Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1514369118554-e20d93546b30?w=200&h=200&fit=crop',
    replies: 8,
    lastActive: '2025-12-19T16:45:00Z',
    createdAt: '2025-12-17T09:15:00Z'
  }
];

export const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: '1',
    userName: 'John Smith',
    userAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
    xp: 12450,
    level: 15
  },
  {
    rank: 2,
    userId: '2',
    userName: 'Sarah Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1765648580808-76d75e4f3833?w=200&h=200&fit=crop',
    xp: 9200,
    level: 12
  },
  {
    rank: 3,
    userId: '3',
    userName: 'Mike Chen',
    userAvatar: 'https://images.unsplash.com/photo-1514369118554-e20d93546b30?w=200&h=200&fit=crop',
    xp: 3400,
    level: 6
  }
];
