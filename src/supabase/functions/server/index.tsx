import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-Admin-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// ============= TYPES =============
interface User {
  id: string;
  email: string;
  name: string;
  role: 'learner' | 'mentor' | 'both';
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
  passwordHash: string;
  status?: 'active' | 'suspended';
  suspendedAt?: string;
  unsuspendedAt?: string;
  roles?: string[];
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt: string;
}

interface Course {
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
  createdAt: string;
}

interface CourseModule {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  completed?: boolean;
}

interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'link';
  url: string;
}

interface Session {
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
  createdAt: string;
}

interface Transaction {
  id: string;
  userId: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  status: 'completed' | 'pending' | 'failed';
}

interface ForumPost {
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

interface Review {
  id: string;
  courseId?: string;
  mentorId?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  tags: string[];
  comment: string;
  date: string;
}

interface Notification {
  id: string;
  userId: string;
  type: 'session' | 'badge' | 'message' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface Enrollment {
  userId: string;
  courseId: string;
  enrolledAt: string;
  progress: number;
  completedModules: string[];
}

interface ChatSession {
  id: string;
  participants: string[];
  participantNames: { [key: string]: string };
  participantAvatars: { [key: string]: string };
  lastMessage: string;
  lastMessageTime: string;
  isPaid: boolean;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'system';
}

// ============= HELPER FUNCTIONS =============

// Simple hash function (for demo purposes only - use proper hashing in production)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Calculate level from XP
function calculateLevel(xp: number): number {
  return Math.floor(xp / 1000) + 1;
}

// Award XP and check for level up
async function awardXP(userId: string, amount: number): Promise<{ leveledUp: boolean; newLevel: number }> {
  const userKey = `user:${userId}`;
  const user = await kv.get<User>(userKey);
  
  if (!user) {
    throw new Error('User not found');
  }

  const oldLevel = user.level;
  const newXP = user.xp + amount;
  const newLevel = calculateLevel(newXP);
  
  user.xp = newXP;
  user.level = newLevel;
  
  await kv.set(userKey, user);
  
  return {
    leveledUp: newLevel > oldLevel,
    newLevel
  };
}

// Check and award badges
async function checkAndAwardBadges(userId: string): Promise<Badge[]> {
  const userKey = `user:${userId}`;
  const user = await kv.get<User>(userKey);
  
  if (!user) {
    return [];
  }

  const newBadges: Badge[] = [];
  const existingBadgeIds = user.badges.map(b => b.id);

  // Check for various badge conditions
  if (user.totalSessions && user.totalSessions >= 100 && !existingBadgeIds.includes('top-mentor')) {
    newBadges.push({
      id: 'top-mentor',
      name: 'Top Mentor',
      icon: '🏆',
      description: 'Hosted 100+ sessions',
      earnedAt: new Date().toISOString()
    });
  }

  if (user.rating && user.rating >= 4.8 && !existingBadgeIds.includes('expert')) {
    newBadges.push({
      id: 'expert',
      name: 'Expert',
      icon: '⭐',
      description: 'Maintained 4.8+ rating',
      earnedAt: new Date().toISOString()
    });
  }

  if (user.level >= 10 && !existingBadgeIds.includes('level-10')) {
    newBadges.push({
      id: 'level-10',
      name: 'Level 10 Achiever',
      icon: '🎯',
      description: 'Reached level 10',
      earnedAt: new Date().toISOString()
    });
  }

  if (newBadges.length > 0) {
    user.badges = [...user.badges, ...newBadges];
    await kv.set(userKey, user);
  }

  return newBadges;
}

// Create notification
async function createNotification(userId: string, type: string, title: string, message: string) {
  const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const notification: Notification = {
    id: notificationId,
    userId,
    type: type as any,
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false
  };
  
  await kv.set(`notification:${notificationId}`, notification);
  
  // Add to user's notification list
  const userNotifKey = `userNotifications:${userId}`;
  const notifList = await kv.get<string[]>(userNotifKey) || [];
  notifList.unshift(notificationId);
  await kv.set(userNotifKey, notifList);
}

// ============= AUTHENTICATION =============

app.post("/make-server-d45a5820/auth/signup", async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();
    
    if (!email || !password || !name || !role) {
      return c.json({ error: 'Email, password, name, and role are required' }, 400);
    }

    // Check if user already exists
    const existingAuth = await kv.get(`auth:${email}`);
    if (existingAuth) {
      return c.json({ error: 'User already exists' }, 400);
    }

    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const passwordHash = await hashPassword(password);

    const user: User = {
      id: userId,
      email,
      name,
      role,
      skills: [],
      level: 1,
      xp: 0,
      tokens: 100, // Welcome bonus
      badges: [{
        id: 'early-adopter',
        name: 'Early Adopter',
        icon: '🚀',
        description: 'Joined the platform',
        earnedAt: new Date().toISOString()
      }],
      createdAt: new Date().toISOString(),
      passwordHash
    };

    // Store user and auth mapping
    await kv.set(`user:${userId}`, user);
    await kv.set(`auth:${email}`, userId);

    // Remove password hash from response
    const { passwordHash: _, ...userResponse } = user;

    return c.json({ user: userResponse });
  } catch (error) {
    console.log('Error during signup:', error);
    return c.json({ error: 'Signup failed: ' + String(error) }, 500);
  }
});

app.post("/make-server-d45a5820/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const userId = await kv.get<string>(`auth:${email}`);
    if (!userId) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const user = await kv.get<User>(`user:${userId}`);
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    const passwordHash = await hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Remove password hash from response
    const { passwordHash: _, ...userResponse } = user;

    return c.json({ user: userResponse });
  } catch (error) {
    console.log('Error during login:', error);
    return c.json({ error: 'Login failed: ' + String(error) }, 500);
  }
});

// ============= USER MANAGEMENT =============

app.get("/make-server-d45a5820/users/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const user = await kv.get<User>(`user:${userId}`);
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    const { passwordHash: _, ...userResponse } = user;
    return c.json(userResponse);
  } catch (error) {
    console.log('Error fetching user:', error);
    return c.json({ error: 'Failed to fetch user: ' + String(error) }, 500);
  }
});

app.put("/make-server-d45a5820/users/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const updates = await c.req.json();
    
    const user = await kv.get<User>(`user:${userId}`);
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Update allowed fields
    const allowedFields = ['name', 'bio', 'avatar', 'skills', 'role'];
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        (user as any)[field] = updates[field];
      }
    }

    await kv.set(`user:${userId}`, user);

    const { passwordHash: _, ...userResponse } = user;
    return c.json(userResponse);
  } catch (error) {
    console.log('Error updating user:', error);
    return c.json({ error: 'Failed to update user: ' + String(error) }, 500);
  }
});

// Get all users (for admin/leaderboard)
app.get("/make-server-d45a5820/users", async (c) => {
  try {
    const users = await kv.getByPrefix<User>('user:');
    const usersWithoutPassword = users.map(({ passwordHash, ...user }) => user);
    
    return c.json(usersWithoutPassword);
  } catch (error) {
    console.log('Error fetching users:', error);
    return c.json({ error: 'Failed to fetch users: ' + String(error) }, 500);
  }
});

// ============= COURSES =============

app.post("/make-server-d45a5820/courses", async (c) => {
  try {
    const courseData = await c.req.json();
    const { mentorId, title, description, category, price, thumbnail, modules, resources, duration, language } = courseData;
    
    if (!mentorId || !title || !description) {
      return c.json({ error: 'Mentor ID, title, and description are required' }, 400);
    }

    // Get mentor info
    const mentor = await kv.get<User>(`user:${mentorId}`);
    if (!mentor) {
      return c.json({ error: 'Mentor not found' }, 404);
    }

    if (mentor.role !== 'mentor' && mentor.role !== 'both') {
      return c.json({ error: 'User is not a mentor' }, 403);
    }

    const courseId = `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const course: Course = {
      id: courseId,
      title,
      description,
      mentorId,
      mentorName: mentor.name,
      mentorAvatar: mentor.avatar,
      category: category || 'General',
      price: price || 0,
      rating: 0,
      thumbnail: thumbnail || '',
      modules: modules || [],
      resources: resources || [],
      enrolled: 0,
      duration: duration || '0m',
      language: language || 'English',
      createdAt: new Date().toISOString()
    };

    await kv.set(`course:${courseId}`, course);
    
    // Add to mentor's course list
    const mentorCoursesKey = `mentorCourses:${mentorId}`;
    const mentorCourses = await kv.get<string[]>(mentorCoursesKey) || [];
    mentorCourses.push(courseId);
    await kv.set(mentorCoursesKey, mentorCourses);

    // Award XP for course creation
    await awardXP(mentorId, 100);
    await createNotification(mentorId, 'system', 'Course Created', `Your course "${title}" has been published!`);

    return c.json(course);
  } catch (error) {
    console.log('Error creating course:', error);
    return c.json({ error: 'Failed to create course: ' + String(error) }, 500);
  }
});

app.get("/make-server-d45a5820/courses", async (c) => {
  try {
    const category = c.req.query('category');
    const search = c.req.query('search');
    const mentorId = c.req.query('mentorId');
    
    let courses = await kv.getByPrefix<Course>('course:');
    
    // Apply filters
    if (category) {
      courses = courses.filter(course => course.category === category);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      courses = courses.filter(course => 
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower)
      );
    }

    if (mentorId) {
      courses = courses.filter(course => course.mentorId === mentorId);
    }
    
    return c.json(courses);
  } catch (error) {
    console.log('Error fetching courses:', error);
    return c.json({ error: 'Failed to fetch courses: ' + String(error) }, 500);
  }
});

app.get("/make-server-d45a5820/courses/:courseId", async (c) => {
  try {
    const courseId = c.req.param('courseId');
    const course = await kv.get<Course>(`course:${courseId}`);
    
    if (!course) {
      return c.json({ error: 'Course not found' }, 404);
    }
    
    return c.json(course);
  } catch (error) {
    console.log('Error fetching course:', error);
    return c.json({ error: 'Failed to fetch course: ' + String(error) }, 500);
  }
});

app.put("/make-server-d45a5820/courses/:courseId", async (c) => {
  try {
    const courseId = c.req.param('courseId');
    const updates = await c.req.json();
    
    const course = await kv.get<Course>(`course:${courseId}`);
    if (!course) {
      return c.json({ error: 'Course not found' }, 404);
    }

    // Update allowed fields
    const allowedFields = ['title', 'description', 'category', 'price', 'thumbnail', 'modules', 'resources', 'duration', 'language'];
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        (course as any)[field] = updates[field];
      }
    }

    await kv.set(`course:${courseId}`, course);
    return c.json(course);
  } catch (error) {
    console.log('Error updating course:', error);
    return c.json({ error: 'Failed to update course: ' + String(error) }, 500);
  }
});

app.delete("/make-server-d45a5820/courses/:courseId", async (c) => {
  try {
    const courseId = c.req.param('courseId');
    const course = await kv.get<Course>(`course:${courseId}`);
    
    if (!course) {
      return c.json({ error: 'Course not found' }, 404);
    }

    await kv.del(`course:${courseId}`);
    
    // Remove from mentor's course list
    const mentorCoursesKey = `mentorCourses:${course.mentorId}`;
    const mentorCourses = await kv.get<string[]>(mentorCoursesKey) || [];
    const updatedCourses = mentorCourses.filter(id => id !== courseId);
    await kv.set(mentorCoursesKey, updatedCourses);

    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting course:', error);
    return c.json({ error: 'Failed to delete course: ' + String(error) }, 500);
  }
});

// ============= ENROLLMENTS =============

app.post("/make-server-d45a5820/enrollments", async (c) => {
  try {
    const { userId, courseId } = await c.req.json();
    
    if (!userId || !courseId) {
      return c.json({ error: 'User ID and course ID are required' }, 400);
    }

    const user = await kv.get<User>(`user:${userId}`);
    const course = await kv.get<Course>(`course:${courseId}`);
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    if (!course) {
      return c.json({ error: 'Course not found' }, 404);
    }

    // Check if already enrolled
    const enrollmentKey = `enrollment:${userId}:${courseId}`;
    const existing = await kv.get(enrollmentKey);
    if (existing) {
      return c.json({ error: 'Already enrolled in this course' }, 400);
    }

    // Check if user has enough tokens
    if (user.tokens < course.price) {
      return c.json({ error: 'Insufficient tokens' }, 400);
    }

    // Deduct tokens from user
    user.tokens -= course.price;
    await kv.set(`user:${userId}`, user);

    // Add tokens to mentor
    const mentor = await kv.get<User>(`user:${course.mentorId}`);
    if (mentor) {
      mentor.tokens += course.price;
      mentor.totalEarnings = (mentor.totalEarnings || 0) + course.price;
      await kv.set(`user:${course.mentorId}`, mentor);
    }

    // Create enrollment
    const enrollment: Enrollment = {
      userId,
      courseId,
      enrolledAt: new Date().toISOString(),
      progress: 0,
      completedModules: []
    };
    await kv.set(enrollmentKey, enrollment);

    // Update course enrollment count
    course.enrolled += 1;
    await kv.set(`course:${courseId}`, course);

    // Add to user's enrollment list
    const userEnrollmentsKey = `userEnrollments:${userId}`;
    const enrollments = await kv.get<string[]>(userEnrollmentsKey) || [];
    enrollments.push(courseId);
    await kv.set(userEnrollmentsKey, enrollments);

    // Create transaction
    const transactionId = `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const transaction: Transaction = {
      id: transactionId,
      userId,
      date: new Date().toISOString(),
      description: `Enrolled in ${course.title}`,
      amount: -course.price,
      type: 'debit',
      status: 'completed'
    };
    await kv.set(`transaction:${transactionId}`, transaction);

    // Add to user's transaction list
    const userTransKey = `userTransactions:${userId}`;
    const transactions = await kv.get<string[]>(userTransKey) || [];
    transactions.unshift(transactionId);
    await kv.set(userTransKey, transactions);

    // Create transaction for mentor
    const mentorTransId = `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const mentorTrans: Transaction = {
      id: mentorTransId,
      userId: course.mentorId,
      date: new Date().toISOString(),
      description: `Earnings from ${course.title}`,
      amount: course.price,
      type: 'credit',
      status: 'completed'
    };
    await kv.set(`transaction:${mentorTransId}`, mentorTrans);

    const mentorTransKey = `userTransactions:${course.mentorId}`;
    const mentorTransactions = await kv.get<string[]>(mentorTransKey) || [];
    mentorTransactions.unshift(mentorTransId);
    await kv.set(mentorTransKey, mentorTransactions);

    // Award XP
    await awardXP(userId, 50);

    // Create notifications
    await createNotification(userId, 'system', 'Enrollment Successful', `You've enrolled in ${course.title}`);
    await createNotification(course.mentorId, 'system', 'New Enrollment', `${user.name} enrolled in ${course.title}`);

    return c.json(enrollment);
  } catch (error) {
    console.log('Error creating enrollment:', error);
    return c.json({ error: 'Failed to enroll in course: ' + String(error) }, 500);
  }
});

app.get("/make-server-d45a5820/enrollments/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const enrollments = await kv.getByPrefix<Enrollment>(`enrollment:${userId}:`);
    
    // Fetch full course data for each enrollment
    const enrolledCourses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await kv.get<Course>(`course:${enrollment.courseId}`);
        return {
          ...course,
          progress: enrollment.progress,
          completedModules: enrollment.completedModules,
          enrolledAt: enrollment.enrolledAt
        };
      })
    );
    
    return c.json(enrolledCourses.filter(c => c !== null));
  } catch (error) {
    console.log('Error fetching enrollments:', error);
    return c.json({ error: 'Failed to fetch enrollments: ' + String(error) }, 500);
  }
});

app.put("/make-server-d45a5820/enrollments/:userId/:courseId/progress", async (c) => {
  try {
    const userId = c.req.param('userId');
    const courseId = c.req.param('courseId');
    const { moduleId, completed } = await c.req.json();
    
    const enrollmentKey = `enrollment:${userId}:${courseId}`;
    const enrollment = await kv.get<Enrollment>(enrollmentKey);
    
    if (!enrollment) {
      return c.json({ error: 'Enrollment not found' }, 404);
    }

    const course = await kv.get<Course>(`course:${courseId}`);
    if (!course) {
      return c.json({ error: 'Course not found' }, 404);
    }

    if (completed && !enrollment.completedModules.includes(moduleId)) {
      enrollment.completedModules.push(moduleId);
      
      // Calculate progress
      enrollment.progress = Math.round((enrollment.completedModules.length / course.modules.length) * 100);
      
      await kv.set(enrollmentKey, enrollment);
      
      // Award XP for module completion
      await awardXP(userId, 20);

      // If course completed, award bonus XP and check badges
      if (enrollment.progress === 100) {
        await awardXP(userId, 100);
        await checkAndAwardBadges(userId);
        await createNotification(userId, 'system', 'Course Completed!', `Congratulations! You've completed ${course.title}`);
      }
    }
    
    return c.json(enrollment);
  } catch (error) {
    console.log('Error updating progress:', error);
    return c.json({ error: 'Failed to update progress: ' + String(error) }, 500);
  }
});

// ============= SESSIONS =============

app.post("/make-server-d45a5820/sessions", async (c) => {
  try {
    const sessionData = await c.req.json();
    const { mentorId, learnerId, type, title, date, startTime, endTime, tokens } = sessionData;
    
    if (!mentorId || !title || !date || !startTime || !endTime) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const mentor = await kv.get<User>(`user:${mentorId}`);
    if (!mentor) {
      return c.json({ error: 'Mentor not found' }, 404);
    }

    let learner = null;
    let learnerName = undefined;
    if (learnerId) {
      learner = await kv.get<User>(`user:${learnerId}`);
      if (!learner) {
        return c.json({ error: 'Learner not found' }, 404);
      }
      learnerName = learner.name;

      // Check if learner has enough tokens
      if (learner.tokens < tokens) {
        return c.json({ error: 'Insufficient tokens' }, 400);
      }
    }

    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const session: Session = {
      id: sessionId,
      mentorId,
      mentorName: mentor.name,
      mentorAvatar: mentor.avatar,
      learnerId,
      learnerName,
      type: type || '1-on-1',
      title,
      date,
      startTime,
      endTime,
      status: 'upcoming',
      tokens: tokens || 0,
      meetingUrl: `https://meet.skillshare.com/${sessionId}`,
      createdAt: new Date().toISOString()
    };

    await kv.set(`session:${sessionId}`, session);

    // Add to mentor's sessions
    const mentorSessionsKey = `userSessions:${mentorId}`;
    const mentorSessions = await kv.get<string[]>(mentorSessionsKey) || [];
    mentorSessions.push(sessionId);
    await kv.set(mentorSessionsKey, mentorSessions);

    if (learnerId && learner) {
      // Deduct tokens from learner
      learner.tokens -= tokens;
      await kv.set(`user:${learnerId}`, learner);

      // Add to learner's sessions
      const learnerSessionsKey = `userSessions:${learnerId}`;
      const learnerSessions = await kv.get<string[]>(learnerSessionsKey) || [];
      learnerSessions.push(sessionId);
      await kv.set(learnerSessionsKey, learnerSessions);

      // Create transaction for learner
      const transactionId = `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const transaction: Transaction = {
        id: transactionId,
        userId: learnerId,
        date: new Date().toISOString(),
        description: `Session with ${mentor.name}`,
        amount: -tokens,
        type: 'debit',
        status: 'completed'
      };
      await kv.set(`transaction:${transactionId}`, transaction);

      const learnerTransKey = `userTransactions:${learnerId}`;
      const transactions = await kv.get<string[]>(learnerTransKey) || [];
      transactions.unshift(transactionId);
      await kv.set(learnerTransKey, transactions);

      // Create notifications
      await createNotification(learnerId, 'session', 'Session Booked', `Your session with ${mentor.name} is scheduled for ${date} at ${startTime}`);
      await createNotification(mentorId, 'session', 'New Booking', `${learner.name} booked a session with you on ${date} at ${startTime}`);
    }

    return c.json(session);
  } catch (error) {
    console.log('Error creating session:', error);
    return c.json({ error: 'Failed to create session: ' + String(error) }, 500);
  }
});

app.get("/make-server-d45a5820/sessions", async (c) => {
  try {
    const userId = c.req.query('userId');
    const status = c.req.query('status');
    
    let sessions = await kv.getByPrefix<Session>('session:');
    
    if (userId) {
      sessions = sessions.filter(s => s.mentorId === userId || s.learnerId === userId);
    }

    if (status) {
      sessions = sessions.filter(s => s.status === status);
    }
    
    return c.json(sessions);
  } catch (error) {
    console.log('Error fetching sessions:', error);
    return c.json({ error: 'Failed to fetch sessions: ' + String(error) }, 500);
  }
});

app.get("/make-server-d45a5820/sessions/:sessionId", async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const session = await kv.get<Session>(`session:${sessionId}`);
    
    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }
    
    return c.json(session);
  } catch (error) {
    console.log('Error fetching session:', error);
    return c.json({ error: 'Failed to fetch session: ' + String(error) }, 500);
  }
});

app.put("/make-server-d45a5820/sessions/:sessionId", async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const { status } = await c.req.json();
    
    const session = await kv.get<Session>(`session:${sessionId}`);
    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }

    session.status = status;
    await kv.set(`session:${sessionId}`, session);

    // If session completed, award tokens to mentor and XP to both
    if (status === 'completed') {
      const mentor = await kv.get<User>(`user:${session.mentorId}`);
      if (mentor) {
        mentor.tokens += session.tokens;
        mentor.totalSessions = (mentor.totalSessions || 0) + 1;
        mentor.totalEarnings = (mentor.totalEarnings || 0) + session.tokens;
        await kv.set(`user:${session.mentorId}`, mentor);

        // Create transaction for mentor
        const transactionId = `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const transaction: Transaction = {
          id: transactionId,
          userId: session.mentorId,
          date: new Date().toISOString(),
          description: `Session earnings: ${session.title}`,
          amount: session.tokens,
          type: 'credit',
          status: 'completed'
        };
        await kv.set(`transaction:${transactionId}`, transaction);

        const mentorTransKey = `userTransactions:${session.mentorId}`;
        const transactions = await kv.get<string[]>(mentorTransKey) || [];
        transactions.unshift(transactionId);
        await kv.set(mentorTransKey, transactions);
      }

      // Award XP
      await awardXP(session.mentorId, 80);
      if (session.learnerId) {
        await awardXP(session.learnerId, 50);
      }

      // Check badges
      await checkAndAwardBadges(session.mentorId);

      // Create notifications
      await createNotification(session.mentorId, 'session', 'Session Completed', `Your session "${session.title}" has been completed`);
      if (session.learnerId) {
        await createNotification(session.learnerId, 'session', 'Session Completed', `Your session with ${session.mentorName} has been completed`);
      }
    }

    return c.json(session);
  } catch (error) {
    console.log('Error updating session:', error);
    return c.json({ error: 'Failed to update session: ' + String(error) }, 500);
  }
});

// ============= TRANSACTIONS & WALLET =============

app.get("/make-server-d45a5820/transactions/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const transKey = `userTransactions:${userId}`;
    const transactionIds = await kv.get<string[]>(transKey) || [];
    
    const transactions = await Promise.all(
      transactionIds.map(id => kv.get<Transaction>(`transaction:${id}`))
    );
    
    return c.json(transactions.filter(t => t !== null));
  } catch (error) {
    console.log('Error fetching transactions:', error);
    return c.json({ error: 'Failed to fetch transactions: ' + String(error) }, 500);
  }
});

app.post("/make-server-d45a5820/wallet/topup", async (c) => {
  try {
    const { userId, amount } = await c.req.json();
    
    if (!userId || !amount || amount <= 0) {
      return c.json({ error: 'Valid user ID and amount are required' }, 400);
    }

    const user = await kv.get<User>(`user:${userId}`);
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Add tokens
    user.tokens += amount;
    await kv.set(`user:${userId}`, user);

    // Create transaction
    const transactionId = `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const transaction: Transaction = {
      id: transactionId,
      userId,
      date: new Date().toISOString(),
      description: 'Token Top-up',
      amount,
      type: 'credit',
      status: 'completed'
    };
    await kv.set(`transaction:${transactionId}`, transaction);

    const transKey = `userTransactions:${userId}`;
    const transactions = await kv.get<string[]>(transKey) || [];
    transactions.unshift(transactionId);
    await kv.set(transKey, transactions);

    await createNotification(userId, 'system', 'Tokens Added', `${amount} tokens have been added to your wallet`);

    return c.json({ tokens: user.tokens, transaction });
  } catch (error) {
    console.log('Error topping up wallet:', error);
    return c.json({ error: 'Failed to top up wallet: ' + String(error) }, 500);
  }
});

// ============= REVIEWS =============

app.post("/make-server-d45a5820/reviews", async (c) => {
  try {
    const { userId, courseId, mentorId, rating, tags, comment } = await c.req.json();
    
    if (!userId || !rating || (!courseId && !mentorId)) {
      return c.json({ error: 'User ID, rating, and either course ID or mentor ID are required' }, 400);
    }

    const user = await kv.get<User>(`user:${userId}`);
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    const reviewId = `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const review: Review = {
      id: reviewId,
      userId,
      userName: user.name,
      userAvatar: user.avatar,
      courseId,
      mentorId,
      rating,
      tags: tags || [],
      comment: comment || '',
      date: new Date().toISOString()
    };

    await kv.set(`review:${reviewId}`, review);

    // Update course rating if it's a course review
    if (courseId) {
      const course = await kv.get<Course>(`course:${courseId}`);
      if (course) {
        const courseReviews = await kv.getByPrefix<Review>('review:');
        const relevantReviews = courseReviews.filter(r => r.courseId === courseId);
        const avgRating = relevantReviews.reduce((sum, r) => sum + r.rating, 0) / relevantReviews.length;
        course.rating = Math.round(avgRating * 10) / 10;
        await kv.set(`course:${courseId}`, course);
      }

      // Add to course reviews list
      const courseReviewsKey = `courseReviews:${courseId}`;
      const reviewIds = await kv.get<string[]>(courseReviewsKey) || [];
      reviewIds.unshift(reviewId);
      await kv.set(courseReviewsKey, reviewIds);
    }

    // Update mentor rating if it's a mentor review
    if (mentorId) {
      const mentor = await kv.get<User>(`user:${mentorId}`);
      if (mentor) {
        const mentorReviews = await kv.getByPrefix<Review>('review:');
        const relevantReviews = mentorReviews.filter(r => r.mentorId === mentorId);
        const avgRating = relevantReviews.reduce((sum, r) => sum + r.rating, 0) / relevantReviews.length;
        mentor.rating = Math.round(avgRating * 10) / 10;
        await kv.set(`user:${mentorId}`, mentor);
        
        // Check badges after rating update
        await checkAndAwardBadges(mentorId);
      }

      // Add to mentor reviews list
      const mentorReviewsKey = `mentorReviews:${mentorId}`;
      const reviewIds = await kv.get<string[]>(mentorReviewsKey) || [];
      reviewIds.unshift(reviewId);
      await kv.set(mentorReviewsKey, reviewIds);
    }

    // Award XP for leaving review
    await awardXP(userId, 10);

    return c.json(review);
  } catch (error) {
    console.log('Error creating review:', error);
    return c.json({ error: 'Failed to create review: ' + String(error) }, 500);
  }
});

app.get("/make-server-d45a5820/reviews", async (c) => {
  try {
    const courseId = c.req.query('courseId');
    const mentorId = c.req.query('mentorId');
    
    let reviews = await kv.getByPrefix<Review>('review:');
    
    if (courseId) {
      reviews = reviews.filter(r => r.courseId === courseId);
    }
    
    if (mentorId) {
      reviews = reviews.filter(r => r.mentorId === mentorId);
    }
    
    return c.json(reviews);
  } catch (error) {
    console.log('Error fetching reviews:', error);
    return c.json({ error: 'Failed to fetch reviews: ' + String(error) }, 500);
  }
});

// ============= FORUM =============

app.post("/make-server-d45a5820/forum/posts", async (c) => {
  try {
    const { authorId, category, title, content } = await c.req.json();
    
    if (!authorId || !title || !content) {
      return c.json({ error: 'Author ID, title, and content are required' }, 400);
    }

    const author = await kv.get<User>(`user:${authorId}`);
    if (!author) {
      return c.json({ error: 'Author not found' }, 404);
    }

    const postId = `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const post: ForumPost = {
      id: postId,
      category: category || 'General',
      title,
      content,
      authorId,
      authorName: author.name,
      authorAvatar: author.avatar,
      replies: 0,
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    await kv.set(`forumPost:${postId}`, post);

    // Award XP for creating post
    await awardXP(authorId, 15);

    return c.json(post);
  } catch (error) {
    console.log('Error creating forum post:', error);
    return c.json({ error: 'Failed to create forum post: ' + String(error) }, 500);
  }
});

app.get("/make-server-d45a5820/forum/posts", async (c) => {
  try {
    const category = c.req.query('category');
    const search = c.req.query('search');
    
    let posts = await kv.getByPrefix<ForumPost>('forumPost:');
    
    if (category) {
      posts = posts.filter(p => p.category === category);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      posts = posts.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.content.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by last active
    posts.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
    
    return c.json(posts);
  } catch (error) {
    console.log('Error fetching forum posts:', error);
    return c.json({ error: 'Failed to fetch forum posts: ' + String(error) }, 500);
  }
});

app.get("/make-server-d45a5820/forum/posts/:postId", async (c) => {
  try {
    const postId = c.req.param('postId');
    const post = await kv.get<ForumPost>(`forumPost:${postId}`);
    
    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }
    
    return c.json(post);
  } catch (error) {
    console.log('Error fetching forum post:', error);
    return c.json({ error: 'Failed to fetch forum post: ' + String(error) }, 500);
  }
});

// ============= NOTIFICATIONS =============

app.get("/make-server-d45a5820/notifications/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const notifKey = `userNotifications:${userId}`;
    const notificationIds = await kv.get<string[]>(notifKey) || [];
    
    const notifications = await Promise.all(
      notificationIds.slice(0, 50).map(id => kv.get<Notification>(`notification:${id}`))
    );
    
    return c.json(notifications.filter(n => n !== null));
  } catch (error) {
    console.log('Error fetching notifications:', error);
    return c.json({ error: 'Failed to fetch notifications: ' + String(error) }, 500);
  }
});

app.put("/make-server-d45a5820/notifications/:notificationId/read", async (c) => {
  try {
    const notificationId = c.req.param('notificationId');
    const notification = await kv.get<Notification>(`notification:${notificationId}`);
    
    if (!notification) {
      return c.json({ error: 'Notification not found' }, 404);
    }

    notification.read = true;
    await kv.set(`notification:${notificationId}`, notification);
    
    return c.json(notification);
  } catch (error) {
    console.log('Error marking notification as read:', error);
    return c.json({ error: 'Failed to mark notification as read: ' + String(error) }, 500);
  }
});

// ============= LEADERBOARD =============

app.get("/make-server-d45a5820/leaderboard", async (c) => {
  try {
    const users = await kv.getByPrefix<User>('user:');
    
    // Sort by XP
    const sorted = users
      .map(({ passwordHash, ...user }) => user)
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 100)
      .map((user, index) => ({
        rank: index + 1,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        xp: user.xp,
        level: user.level
      }));
    
    return c.json(sorted);
  } catch (error) {
    console.log('Error fetching leaderboard:', error);
    return c.json({ error: 'Failed to fetch leaderboard: ' + String(error) }, 500);
  }
});

// ============= GAMIFICATION =============

app.post("/make-server-d45a5820/gamification/award-xp", async (c) => {
  try {
    const { userId, amount, reason } = await c.req.json();
    
    if (!userId || !amount) {
      return c.json({ error: 'User ID and amount are required' }, 400);
    }

    const result = await awardXP(userId, amount);
    const badges = await checkAndAwardBadges(userId);

    if (result.leveledUp) {
      await createNotification(userId, 'system', 'Level Up!', `Congratulations! You've reached level ${result.newLevel}!`);
    }

    for (const badge of badges) {
      await createNotification(userId, 'badge', 'Badge Earned!', `You've earned the "${badge.name}" badge!`);
    }

    return c.json({ 
      ...result, 
      newBadges: badges,
      reason 
    });
  } catch (error) {
    console.log('Error awarding XP:', error);
    return c.json({ error: 'Failed to award XP: ' + String(error) }, 500);
  }
});

// ============= ADMIN PANEL =============

// Admin login
app.post("/make-server-d45a5820/admin/login", async (c) => {
  console.log('=== ADMIN LOGIN ATTEMPT ===');
  try {
    const body = await c.req.json();
    console.log('Request body received:', { email: body.email, password: '***' });
    
    const { email, password } = body;
    
    // Hardcoded admin credentials (in production, use environment variables and proper hashing)
    const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'admin@skillbridge.com';
    const ADMIN_PASSWORD = Deno.env.get('ADMIN_PASSWORD') || 'admin123';
    
    console.log('Checking credentials against:', { ADMIN_EMAIL, ADMIN_PASSWORD: '***' });
    
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      console.log('Invalid credentials provided');
      return c.json({ message: 'Invalid credentials' }, 401);
    }
    
    // Generate admin token (in production, use proper JWT)
    const adminToken = crypto.randomUUID();
    console.log('Generated admin token:', adminToken.substring(0, 8) + '...');
    
    // Store admin session
    await kv.set(`adminSession:${adminToken}`, {
      email,
      loginTime: new Date().toISOString(),
    });
    
    console.log('Admin session stored successfully');
    
    const response = {
      token: adminToken,
      admin: {
        id: 'admin-1',
        name: 'Admin',
        email,
      },
    };
    
    console.log('Sending response:', response);
    return c.json(response);
  } catch (error) {
    console.log('Error in admin login:', error);
    console.log('Error stack:', error.stack);
    return c.json({ error: 'Login failed: ' + String(error) }, 500);
  }
});

// Get all withdrawals
app.get("/make-server-d45a5820/admin/withdrawals", async (c) => {
  try {
    // Verify admin token
    const adminToken = c.req.header('X-Admin-Token');
    if (!adminToken) {
      return c.json({ error: 'Unauthorized - Missing admin token' }, 401);
    }
    
    const session = await kv.get(`adminSession:${adminToken}`);
    
    if (!session) {
      return c.json({ error: 'Invalid or expired session' }, 401);
    }
    
    // Get all withdrawals
    const withdrawals = await kv.getByPrefix<any>('withdrawal:');
    
    // Enhance with user data
    const enhanced = await Promise.all(withdrawals.map(async (w) => {
      const user = await kv.get<User>(`user:${w.userId}`);
      return {
        id: w.id,
        mentorId: w.userId,
        mentorName: user?.name || 'Unknown',
        mentorAvatar: user?.avatar,
        amount: w.amount,
        paymentMethod: w.paymentMethod || 'Stripe',
        paymentDestination: w.paymentDestination || '**** 4242',
        requestedDate: w.requestedDate || w.createdAt,
        status: w.status || 'pending',
      };
    }));
    
    return c.json(enhanced);
  } catch (error) {
    console.log('Error fetching withdrawals:', error);
    return c.json({ error: 'Failed to fetch withdrawals: ' + String(error) }, 500);
  }
});

// Approve withdrawal
app.post("/make-server-d45a5820/admin/withdrawals/:id/approve", async (c) => {
  try {
    // Verify admin token
    const adminToken = c.req.header('X-Admin-Token');
    if (!adminToken) {
      return c.json({ error: 'Unauthorized - Missing admin token' }, 401);
    }
    
    const session = await kv.get(`adminSession:${adminToken}`);
    
    if (!session) {
      return c.json({ error: 'Invalid or expired session' }, 401);
    }
    
    const withdrawalId = c.req.param('id');
    const withdrawal = await kv.get<any>(`withdrawal:${withdrawalId}`);
    
    if (!withdrawal) {
      return c.json({ error: 'Withdrawal not found' }, 404);
    }
    
    // Update withdrawal status
    withdrawal.status = 'approved';
    withdrawal.approvedAt = new Date().toISOString();
    await kv.set(`withdrawal:${withdrawalId}`, withdrawal);
    
    // Send notification to user
    await createNotification(
      withdrawal.userId,
      'system',
      'Withdrawal Approved',
      `Your withdrawal of $${withdrawal.amount} has been approved and processed.`
    );
    
    return c.json({ message: 'Withdrawal approved successfully', withdrawal });
  } catch (error) {
    console.log('Error approving withdrawal:', error);
    return c.json({ error: 'Failed to approve withdrawal: ' + String(error) }, 500);
  }
});

// Reject withdrawal
app.post("/make-server-d45a5820/admin/withdrawals/:id/reject", async (c) => {
  try {
    // Verify admin token
    const adminToken = c.req.header('X-Admin-Token');
    if (!adminToken) {
      return c.json({ error: 'Unauthorized - Missing admin token' }, 401);
    }
    
    const session = await kv.get(`adminSession:${adminToken}`);
    
    if (!session) {
      return c.json({ error: 'Invalid or expired session' }, 401);
    }
    
    const withdrawalId = c.req.param('id');
    const { reason } = await c.req.json();
    const withdrawal = await kv.get<any>(`withdrawal:${withdrawalId}`);
    
    if (!withdrawal) {
      return c.json({ error: 'Withdrawal not found' }, 404);
    }
    
    // Update withdrawal status
    withdrawal.status = 'rejected';
    withdrawal.rejectedAt = new Date().toISOString();
    withdrawal.rejectionReason = reason;
    await kv.set(`withdrawal:${withdrawalId}`, withdrawal);
    
    // Send notification to user
    const message = reason 
      ? `Your withdrawal of $${withdrawal.amount} has been rejected. Reason: ${reason}`
      : `Your withdrawal of $${withdrawal.amount} has been rejected.`;
    
    await createNotification(
      withdrawal.userId,
      'system',
      'Withdrawal Rejected',
      message
    );
    
    return c.json({ message: 'Withdrawal rejected successfully', withdrawal });
  } catch (error) {
    console.log('Error rejecting withdrawal:', error);
    return c.json({ error: 'Failed to reject withdrawal: ' + String(error) }, 500);
  }
});

// Get users (with search)
app.get("/make-server-d45a5820/admin/users", async (c) => {
  try {
    // Verify admin token
    const adminToken = c.req.header('X-Admin-Token');
    if (!adminToken) {
      return c.json({ error: 'Unauthorized - Missing admin token' }, 401);
    }
    
    const session = await kv.get(`adminSession:${adminToken}`);
    
    if (!session) {
      return c.json({ error: 'Invalid or expired session' }, 401);
    }
    
    const searchQuery = c.req.query('search')?.toLowerCase() || '';
    
    // Get all users
    let users = await kv.getByPrefix<User>('user:');
    
    // Filter by search query
    if (searchQuery) {
      users = users.filter(u => 
        u.name.toLowerCase().includes(searchQuery) || 
        u.email.toLowerCase().includes(searchQuery)
      );
    }
    
    // Return user data
    return c.json(users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      roles: u.roles,
      status: u.status || 'active',
    })));
  } catch (error) {
    console.log('Error fetching users:', error);
    return c.json({ error: 'Failed to fetch users: ' + String(error) }, 500);
  }
});

// Suspend user
app.post("/make-server-d45a5820/admin/users/:id/suspend", async (c) => {
  try {
    // Verify admin token
    const adminToken = c.req.header('X-Admin-Token');
    if (!adminToken) {
      return c.json({ error: 'Unauthorized - Missing admin token' }, 401);
    }
    
    const session = await kv.get(`adminSession:${adminToken}`);
    
    if (!session) {
      return c.json({ error: 'Invalid or expired session' }, 401);
    }
    
    const userId = c.req.param('id');
    const user = await kv.get<User>(`user:${userId}`);
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Update user status
    user.status = 'suspended';
    user.suspendedAt = new Date().toISOString();
    await kv.set(`user:${userId}`, user);
    
    // Send notification
    await createNotification(
      userId,
      'system',
      'Account Suspended',
      'Your account has been suspended. Please contact support for more information.'
    );
    
    return c.json({ message: 'User suspended successfully', user });
  } catch (error) {
    console.log('Error suspending user:', error);
    return c.json({ error: 'Failed to suspend user: ' + String(error) }, 500);
  }
});

// Unsuspend user
app.post("/make-server-d45a5820/admin/users/:id/unsuspend", async (c) => {
  try {
    // Verify admin token
    const adminToken = c.req.header('X-Admin-Token');
    if (!adminToken) {
      return c.json({ error: 'Unauthorized - Missing admin token' }, 401);
    }
    
    const session = await kv.get(`adminSession:${adminToken}`);
    
    if (!session) {
      return c.json({ error: 'Invalid or expired session' }, 401);
    }
    
    const userId = c.req.param('id');
    const user = await kv.get<User>(`user:${userId}`);
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Update user status
    user.status = 'active';
    user.unsuspendedAt = new Date().toISOString();
    await kv.set(`user:${userId}`, user);
    
    // Send notification
    await createNotification(
      userId,
      'system',
      'Account Reactivated',
      'Your account has been reactivated. Welcome back!'
    );
    
    return c.json({ message: 'User reactivated successfully', user });
  } catch (error) {
    console.log('Error reactivating user:', error);
    return c.json({ error: 'Failed to reactivate user: ' + String(error) }, 500);
  }
});

// ============= CHAT & MESSAGING =============

// Create new chat session (costs 50 tokens)
app.post("/make-server-d45a5820/chat/sessions", async (c) => {
  try {
    const { userId1, userId2 } = await c.req.json();
    
    if (!userId1 || !userId2) {
      return c.json({ error: 'Both user IDs are required' }, 400);
    }

    // Check if session already exists
    const allSessions = await kv.getByPrefix<ChatSession>('chatSession:');
    const existingSession = allSessions.find(s => 
      (s.participants.includes(userId1) && s.participants.includes(userId2))
    );

    if (existingSession) {
      return c.json(existingSession);
    }

    // Get both users
    const user1 = await kv.get<User>(`user:${userId1}`);
    const user2 = await kv.get<User>(`user:${userId2}`);

    if (!user1 || !user2) {
      return c.json({ error: 'One or both users not found' }, 404);
    }

    // Check if user1 has enough tokens (50 tokens to start chat)
    if (user1.tokens < 50) {
      return c.json({ error: 'Insufficient tokens. You need 50 tokens to start a chat.' }, 400);
    }

    // Deduct 50 tokens from user1
    user1.tokens -= 50;
    await kv.set(`user:${userId1}`, user1);

    // Create new chat session
    const sessionId = `chatSession-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const session: ChatSession = {
      id: sessionId,
      participants: [userId1, userId2],
      participantNames: {
        [userId1]: user1.name,
        [userId2]: user2.name,
      },
      participantAvatars: {
        [userId1]: user1.avatar || '',
        [userId2]: user2.avatar || '',
      },
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      isPaid: true,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`chatSession:${sessionId}`, session);

    // Add to both users' session lists
    const user1SessionsKey = `userChatSessions:${userId1}`;
    const user1Sessions = await kv.get<string[]>(user1SessionsKey) || [];
    user1Sessions.unshift(sessionId);
    await kv.set(user1SessionsKey, user1Sessions);

    const user2SessionsKey = `userChatSessions:${userId2}`;
    const user2Sessions = await kv.get<string[]>(user2SessionsKey) || [];
    user2Sessions.unshift(sessionId);
    await kv.set(user2SessionsKey, user2Sessions);

    // Create transaction
    const transactionId = `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const transaction: Transaction = {
      id: transactionId,
      userId: userId1,
      date: new Date().toISOString(),
      description: `Started chat with ${user2.name}`,
      amount: -50,
      type: 'debit',
      status: 'completed'
    };
    await kv.set(`transaction:${transactionId}`, transaction);

    const userTransKey = `userTransactions:${userId1}`;
    const transactions = await kv.get<string[]>(userTransKey) || [];
    transactions.unshift(transactionId);
    await kv.set(userTransKey, transactions);

    // Create notifications
    await createNotification(userId1, 'message', 'Chat Started', `You started a chat with ${user2.name} (50 tokens deducted)`);
    await createNotification(userId2, 'message', 'New Chat', `${user1.name} started a chat with you`);

    // Send welcome message
    const welcomeMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      senderId: 'system',
      senderName: 'System',
      content: `Chat started between ${user1.name} and ${user2.name}`,
      timestamp: new Date().toISOString(),
      type: 'system',
    };
    await kv.set(`chatMessage:${welcomeMessage.id}`, welcomeMessage);

    return c.json(session);
  } catch (error) {
    console.log('Error creating chat session:', error);
    return c.json({ error: 'Failed to create chat session: ' + String(error) }, 500);
  }
});

// Get user's chat sessions
app.get("/make-server-d45a5820/chat/sessions", async (c) => {
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    const sessionKey = `userChatSessions:${userId}`;
    const sessionIds = await kv.get<string[]>(sessionKey) || [];

    const sessions = await Promise.all(
      sessionIds.map(id => kv.get<ChatSession>(`chatSession:${id}`))
    );

    // Filter out null sessions and add unread count
    const validSessions = sessions
      .filter(s => s !== null)
      .map(s => ({
        ...s,
        unreadCount: 0, // TODO: Implement unread count tracking
      }));

    return c.json(validSessions);
  } catch (error) {
    console.log('Error fetching chat sessions:', error);
    return c.json({ error: 'Failed to fetch chat sessions: ' + String(error) }, 500);
  }
});

// Send a message
app.post("/make-server-d45a5820/chat/messages", async (c) => {
  try {
    const { sessionId, senderId, content, type } = await c.req.json();
    
    if (!sessionId || !senderId || !content) {
      return c.json({ error: 'Session ID, sender ID, and content are required' }, 400);
    }

    const session = await kv.get<ChatSession>(`chatSession:${sessionId}`);
    if (!session) {
      return c.json({ error: 'Chat session not found' }, 404);
    }

    const sender = await kv.get<User>(`user:${senderId}`);
    if (!sender && senderId !== 'system') {
      return c.json({ error: 'Sender not found' }, 404);
    }

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const message: ChatMessage = {
      id: messageId,
      sessionId,
      senderId,
      senderName: sender?.name || 'System',
      content,
      timestamp: new Date().toISOString(),
      type: type || 'text',
    };

    await kv.set(`chatMessage:${messageId}`, message);

    // Update session last message
    session.lastMessage = content;
    session.lastMessageTime = message.timestamp;
    await kv.set(`chatSession:${sessionId}`, session);

    // Send notification to other participant
    const otherUserId = session.participants.find(id => id !== senderId);
    if (otherUserId && type !== 'system') {
      await createNotification(
        otherUserId,
        'message',
        'New Message',
        `${sender?.name}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`
      );
    }

    return c.json(message);
  } catch (error) {
    console.log('Error sending message:', error);
    return c.json({ error: 'Failed to send message: ' + String(error) }, 500);
  }
});

// Get messages for a session
app.get("/make-server-d45a5820/chat/messages", async (c) => {
  try {
    const sessionId = c.req.query('sessionId');
    
    if (!sessionId) {
      return c.json({ error: 'Session ID is required' }, 400);
    }

    const allMessages = await kv.getByPrefix<ChatMessage>('chatMessage:');
    const sessionMessages = allMessages
      .filter(m => m.sessionId === sessionId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return c.json(sessionMessages);
  } catch (error) {
    console.log('Error fetching messages:', error);
    return c.json({ error: 'Failed to fetch messages: ' + String(error) }, 500);
  }
});

// Health check endpoint
app.get("/make-server-d45a5820/health", (c) => {
  return c.json({ status: "ok" });
});

Deno.serve(app.fetch);