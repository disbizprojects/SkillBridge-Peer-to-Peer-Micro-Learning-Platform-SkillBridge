export type UserRole = 'learner' | 'mentor' | 'both';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  skills: string[];
  level: number;
  xp: number;
  tokens: number;
  badges: Badge[];
  rating?: number;
  totalSessions?: number;
  totalEarnings?: number;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  mentorId: string;
  mentorName: string;
  mentorAvatar?: string;
  category: string;
  price: number;
  rating: number;
  thumbnail: string;
  modules: CourseModule[];
  resources: Resource[];
  enrolled: number;
  duration: string;
  language: string;
}

export interface CourseModule {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  completed?: boolean;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'link';
  url: string;
}

export interface Session {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorAvatar?: string;
  learnerId?: string;
  learnerName?: string;
  type: '1-on-1' | 'group';
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  tokens: number;
  meetingUrl?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  tags: string[];
  comment: string;
  date: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  status: 'completed' | 'pending' | 'failed';
}

export interface ForumPost {
  id: string;
  category: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  replies: number;
  lastActive: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  xp: number;
  level: number;
}

export interface Notification {
  id: string;
  type: 'session' | 'badge' | 'message' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
