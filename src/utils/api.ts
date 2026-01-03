import { projectId, publicAnonKey } from './supabase/info';
import { 
  User, 
  Course, 
  Session, 
  Transaction, 
  ForumPost, 
  Review, 
  Notification, 
  LeaderboardEntry 
} from '../types';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d45a5820`;

// Helper function for API calls
async function apiCall<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// ============= AUTH API =============
export const authAPI = {
  signup: async (email: string, password: string, name: string, role: 'learner' | 'mentor' | 'both') => {
    return apiCall<{ user: User }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
  },

  login: async (email: string, password: string) => {
    return apiCall<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
};

// ============= USER API =============
export const userAPI = {
  getUser: async (userId: string) => {
    return apiCall<User>(`/users/${userId}`);
  },

  updateUser: async (userId: string, updates: Partial<User>) => {
    return apiCall<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  getAllUsers: async () => {
    return apiCall<User[]>('/users');
  },
};

// ============= COURSE API =============
export const courseAPI = {
  createCourse: async (courseData: {
    mentorId: string;
    title: string;
    description: string;
    category?: string;
    price?: number;
    thumbnail?: string;
    modules?: any[];
    resources?: any[];
    duration?: string;
    language?: string;
  }) => {
    return apiCall<Course>('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  },

  getCourses: async (filters?: { category?: string; search?: string; mentorId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.mentorId) params.append('mentorId', filters.mentorId);
    
    const query = params.toString();
    return apiCall<Course[]>(`/courses${query ? `?${query}` : ''}`);
  },

  getCourse: async (courseId: string) => {
    return apiCall<Course>(`/courses/${courseId}`);
  },

  updateCourse: async (courseId: string, updates: Partial<Course>) => {
    return apiCall<Course>(`/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteCourse: async (courseId: string) => {
    return apiCall<{ success: boolean }>(`/courses/${courseId}`, {
      method: 'DELETE',
    });
  },
};

// ============= ENROLLMENT API =============
export const enrollmentAPI = {
  enroll: async (userId: string, courseId: string) => {
    return apiCall('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ userId, courseId }),
    });
  },

  getEnrollments: async (userId: string) => {
    return apiCall<Course[]>(`/enrollments/${userId}`);
  },

  updateProgress: async (userId: string, courseId: string, moduleId: string, completed: boolean) => {
    return apiCall(`/enrollments/${userId}/${courseId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ moduleId, completed }),
    });
  },
};

// ============= SESSION API =============
export const sessionAPI = {
  createSession: async (sessionData: {
    mentorId: string;
    learnerId?: string;
    type?: '1-on-1' | 'group';
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    tokens?: number;
  }) => {
    return apiCall<Session>('/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  },

  getSessions: async (filters?: { userId?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.status) params.append('status', filters.status);
    
    const query = params.toString();
    return apiCall<Session[]>(`/sessions${query ? `?${query}` : ''}`);
  },

  getSession: async (sessionId: string) => {
    return apiCall<Session>(`/sessions/${sessionId}`);
  },

  updateSession: async (sessionId: string, status: string) => {
    return apiCall<Session>(`/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// ============= WALLET API =============
export const walletAPI = {
  getTransactions: async (userId: string) => {
    return apiCall<Transaction[]>(`/transactions/${userId}`);
  },

  topUp: async (userId: string, amount: number) => {
    return apiCall<{ tokens: number; transaction: Transaction }>('/wallet/topup', {
      method: 'POST',
      body: JSON.stringify({ userId, amount }),
    });
  },
};

// ============= REVIEW API =============
export const reviewAPI = {
  createReview: async (reviewData: {
    userId: string;
    courseId?: string;
    mentorId?: string;
    rating: number;
    tags?: string[];
    comment?: string;
  }) => {
    return apiCall<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  getReviews: async (filters?: { courseId?: string; mentorId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.courseId) params.append('courseId', filters.courseId);
    if (filters?.mentorId) params.append('mentorId', filters.mentorId);
    
    const query = params.toString();
    return apiCall<Review[]>(`/reviews${query ? `?${query}` : ''}`);
  },
};

// ============= FORUM API =============
export const forumAPI = {
  createPost: async (postData: {
    authorId: string;
    category?: string;
    title: string;
    content: string;
  }) => {
    return apiCall<ForumPost>('/forum/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  getPosts: async (filters?: { category?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    
    const query = params.toString();
    return apiCall<ForumPost[]>(`/forum/posts${query ? `?${query}` : ''}`);
  },

  getPost: async (postId: string) => {
    return apiCall<ForumPost>(`/forum/posts/${postId}`);
  },
};

// ============= NOTIFICATION API =============
export const notificationAPI = {
  getNotifications: async (userId: string) => {
    return apiCall<Notification[]>(`/notifications/${userId}`);
  },

  markAsRead: async (notificationId: string) => {
    return apiCall<Notification>(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },
};

// ============= LEADERBOARD API =============
export const leaderboardAPI = {
  getLeaderboard: async () => {
    return apiCall<LeaderboardEntry[]>('/leaderboard');
  },
};

// ============= GAMIFICATION API =============
export const gamificationAPI = {
  awardXP: async (userId: string, amount: number, reason?: string) => {
    return apiCall<{ leveledUp: boolean; newLevel: number; newBadges: any[]; reason?: string }>('/gamification/award-xp', {
      method: 'POST',
      body: JSON.stringify({ userId, amount, reason }),
    });
  },
};
