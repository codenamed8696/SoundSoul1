import { User, MoodEntry, WellnessResource, Counselor, Appointment } from '@/types';

// In-memory store for demo purposes
// In production, this would be replaced with a real database
let users: User[] = [];
let sessions: Map<string, string> = new Map(); // token -> userId
let moodEntries: MoodEntry[] = [];
let wellnessResources: WellnessResource[] = [];
let counselors: Counselor[] = [];
let appointments: Appointment[] = [];

// Demo users for testing
const DEMO_USERS: User[] = [
  {
    id: 'user-demo-1',
    email: 'demo@example.com',
    anonymousId: 'anon_1733395200_user123',
    isAnonymous: false,
    role: 'user',
    name: 'Demo User',
    createdAt: '2024-12-05T12:00:00Z',
    updatedAt: '2024-12-05T12:00:00Z'
  },
  {
    id: 'user-demo-2',
    email: 'user2@example.com',
    anonymousId: 'anon_1733395200_user456',
    isAnonymous: false,
    role: 'user',
    name: 'Jane Smith',
    createdAt: '2024-12-05T12:00:00Z',
    updatedAt: '2024-12-05T12:00:00Z'
  },
  {
    id: 'user-demo-3',
    email: 'user3@example.com',
    anonymousId: 'anon_1733395200_user789',
    isAnonymous: false,
    role: 'user',
    name: 'Bob Johnson',
    companyConnection: {
      token: 'ABC-1234-DEMO-5678',
      verified: true,
      benefits: [
        '10 free therapy sessions per year',
        'Premium AI wellness companion',
        'Access to wellness workshops',
        'Mental health resources library'
      ]
    },
    createdAt: '2024-12-05T12:00:00Z',
    updatedAt: '2024-12-05T12:00:00Z'
  },
  {
    id: 'user-demo-4',
    email: 'user4@example.com',
    anonymousId: 'anon_1733395200_user101',
    isAnonymous: false,
    role: 'user',
    name: 'Alice Brown',
    companyConnection: {
      token: 'ABC-1234-DEMO-5678',
      verified: true,
      benefits: [
        '10 free therapy sessions per year',
        'Premium AI wellness companion',
        'Access to wellness workshops',
        'Mental health resources library'
      ]
    },
    createdAt: '2024-12-05T12:00:00Z',
    updatedAt: '2024-12-05T12:00:00Z'
  },
  {
    id: 'user-demo-5',
    email: 'user5@example.com',
    anonymousId: 'anon_1733395200_user202',
    isAnonymous: false,
    role: 'user',
    name: 'Charlie Davis',
    companyConnection: {
      token: 'ABC-1234-DEMO-5678',
      verified: true,
      benefits: [
        '10 free therapy sessions per year',
        'Premium AI wellness companion',
        'Access to wellness workshops',
        'Mental health resources library'
      ]
    },
    createdAt: '2024-12-05T12:00:00Z',
    updatedAt: '2024-12-05T12:00:00Z'
  },
  {
    id: 'employer-demo-1',
    email: 'employer@example.com',
    anonymousId: 'anon_1733395200_emp123',
    isAnonymous: false,
    role: 'employer',
    name: 'HR Manager',
    createdAt: '2024-12-05T12:00:00Z',
    updatedAt: '2024-12-05T12:00:00Z'
  },
  {
    id: 'counselor-demo-1',
    email: 'counselor@example.com',
    anonymousId: 'anon_1733395200_coun123',
    isAnonymous: false,
    role: 'counselor',
    name: 'Dr. Sarah Chen',
    createdAt: '2024-12-05T12:00:00Z',
    updatedAt: '2024-12-05T12:00:00Z'
  },
  {
    id: 'admin-demo-1',
    email: 'admin@example.com',
    anonymousId: 'anon_1733395200_admin123',
    isAnonymous: false,
    role: 'admin',
    name: 'System Admin',
    createdAt: '2024-12-05T12:00:00Z',
    updatedAt: '2024-12-05T12:00:00Z'
  }
];

// Demo counselors
const DEMO_COUNSELORS: Counselor[] = [
  {
    id: 'counselor-1',
    name: 'Dr. Sarah Chen',
    specialties: ['Anxiety', 'Depression', 'CBT'],
    bio: 'Licensed clinical psychologist with 10+ years of experience specializing in cognitive behavioral therapy and anxiety disorders.',
    rating: 4.9,
    experience: 10,
    pricePerSession: 120,
    availability: {
      'monday': ['09:00', '10:00', '14:00', '15:00'],
      'tuesday': ['09:00', '11:00', '14:00', '16:00'],
      'wednesday': ['10:00', '11:00', '15:00', '16:00'],
      'thursday': ['09:00', '10:00', '14:00', '15:00'],
      'friday': ['09:00', '11:00', '14:00']
    },
    image: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=300',
    credentials: ['PhD Psychology', 'Licensed Clinical Psychologist', 'CBT Certified']
  },
  {
    id: 'counselor-2',
    name: 'Dr. Michael Rodriguez',
    specialties: ['Trauma', 'PTSD', 'Mindfulness'],
    bio: 'Trauma specialist with expertise in EMDR and mindfulness-based interventions. Dedicated to helping clients heal from traumatic experiences.',
    rating: 4.8,
    experience: 8,
    pricePerSession: 110,
    availability: {
      'monday': ['10:00', '11:00', '15:00', '16:00'],
      'tuesday': ['09:00', '10:00', '14:00', '15:00'],
      'wednesday': ['09:00', '11:00', '16:00'],
      'thursday': ['10:00', '11:00', '15:00', '16:00'],
      'friday': ['09:00', '10:00', '15:00']
    },
    image: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=300',
    credentials: ['MD Psychiatry', 'EMDR Certified', 'Mindfulness Instructor']
  },
  {
    id: 'counselor-3',
    name: 'Dr. Emily Johnson',
    specialties: ['Relationship', 'Family', 'Communication'],
    bio: 'Marriage and family therapist helping couples and families build stronger, healthier relationships through evidence-based approaches.',
    rating: 4.7,
    experience: 12,
    pricePerSession: 130,
    availability: {
      'monday': ['14:00', '15:00', '16:00'],
      'tuesday': ['10:00', '11:00', '15:00', '16:00'],
      'wednesday': ['09:00', '10:00', '14:00'],
      'thursday': ['11:00', '14:00', '15:00', '16:00'],
      'friday': ['10:00', '11:00', '14:00', '15:00']
    },
    image: 'https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=300',
    credentials: ['LMFT', 'Gottman Method Certified', 'EFT Trained']
  }
];

// Demo appointments
const DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-demo-1',
    userId: 'user-demo-1',
    counselorId: 'counselor-1',
    userAnonymousId: 'anon_1733395200_user123',
    scheduledDate: '2024-12-10T14:00:00Z',
    duration: 60,
    type: 'video',
    status: 'confirmed',
    notes: 'Initial consultation for anxiety management',
    meetingLink: 'https://meet.wellness.app/room/apt-demo-1',
    createdAt: '2024-12-05T12:00:00Z',
    updatedAt: '2024-12-05T12:00:00Z'
  },
  {
    id: 'apt-demo-2',
    userId: 'user-demo-2',
    counselorId: 'counselor-2',
    userAnonymousId: 'anon_1733395200_user456',
    scheduledDate: '2024-12-08T10:00:00Z',
    duration: 45,
    type: 'audio',
    status: 'confirmed',
    notes: 'Follow-up session for trauma therapy',
    meetingLink: 'https://meet.wellness.app/room/apt-demo-2',
    createdAt: '2024-12-04T12:00:00Z',
    updatedAt: '2024-12-04T12:00:00Z'
  },
  {
    id: 'apt-demo-3',
    userId: 'user-demo-1',
    counselorId: 'counselor-3',
    userAnonymousId: 'anon_1733395200_user123',
    scheduledDate: '2024-12-12T16:00:00Z',
    duration: 60,
    type: 'video',
    status: 'pending',
    notes: 'Relationship counseling session',
    meetingLink: 'https://meet.wellness.app/room/apt-demo-3',
    createdAt: '2024-12-05T12:00:00Z',
    updatedAt: '2024-12-05T12:00:00Z'
  },
  {
    id: 'apt-demo-4',
    userId: 'user-demo-2',
    counselorId: 'counselor-1',
    userAnonymousId: 'anon_1733395200_user456',
    scheduledDate: '2024-12-06T09:00:00Z',
    duration: 60,
    type: 'chat',
    status: 'completed',
    notes: 'CBT session completed successfully',
    createdAt: '2024-12-03T12:00:00Z',
    updatedAt: '2024-12-06T10:00:00Z'
  },
  {
    id: 'apt-demo-5',
    userId: 'user-demo-3',
    counselorId: 'counselor-1',
    userAnonymousId: 'anon_1733395200_user789',
    scheduledDate: '2024-12-07T11:00:00Z',
    duration: 60,
    type: 'video',
    status: 'completed',
    notes: 'Company-sponsored wellness session',
    createdAt: '2024-12-03T12:00:00Z',
    updatedAt: '2024-12-07T12:00:00Z'
  },
  {
    id: 'apt-demo-6',
    userId: 'user-demo-4',
    counselorId: 'counselor-2',
    userAnonymousId: 'anon_1733395200_user101',
    scheduledDate: '2024-12-09T15:00:00Z',
    duration: 45,
    type: 'audio',
    status: 'completed',
    notes: 'Stress management session',
    createdAt: '2024-12-04T12:00:00Z',
    updatedAt: '2024-12-09T16:00:00Z'
  }
];

// Demo mood entries for company users
const DEMO_MOOD_ENTRIES: MoodEntry[] = [
  // User 3 (company user)
  { id: 'mood-1', userId: 'user-demo-3', mood: 4, notes: 'Feeling good today', date: '2024-12-05', createdAt: '2024-12-05T12:00:00Z' },
  { id: 'mood-2', userId: 'user-demo-3', mood: 3, notes: 'Average day', date: '2024-12-04', createdAt: '2024-12-04T12:00:00Z' },
  { id: 'mood-3', userId: 'user-demo-3', mood: 5, notes: 'Excellent mood', date: '2024-12-03', createdAt: '2024-12-03T12:00:00Z' },
  
  // User 4 (company user)
  { id: 'mood-4', userId: 'user-demo-4', mood: 2, notes: 'Stressful day at work', date: '2024-12-05', createdAt: '2024-12-05T12:00:00Z' },
  { id: 'mood-5', userId: 'user-demo-4', mood: 3, notes: 'Better today', date: '2024-12-04', createdAt: '2024-12-04T12:00:00Z' },
  { id: 'mood-6', userId: 'user-demo-4', mood: 4, notes: 'Good progress', date: '2024-12-03', createdAt: '2024-12-03T12:00:00Z' },
  
  // User 5 (company user)
  { id: 'mood-7', userId: 'user-demo-5', mood: 4, notes: 'Productive day', date: '2024-12-05', createdAt: '2024-12-05T12:00:00Z' },
  { id: 'mood-8', userId: 'user-demo-5', mood: 3, notes: 'Okay day', date: '2024-12-04', createdAt: '2024-12-04T12:00:00Z' },
  { id: 'mood-9', userId: 'user-demo-5', mood: 4, notes: 'Feeling optimistic', date: '2024-12-03', createdAt: '2024-12-03T12:00:00Z' },
  
  // Regular users
  { id: 'mood-10', userId: 'user-demo-1', mood: 3, notes: 'Regular day', date: '2024-12-05', createdAt: '2024-12-05T12:00:00Z' },
  { id: 'mood-11', userId: 'user-demo-2', mood: 4, notes: 'Good day', date: '2024-12-05', createdAt: '2024-12-05T12:00:00Z' },
];

// Demo wellness resources
const DEMO_WELLNESS_RESOURCES: WellnessResource[] = [
  {
    id: 'resource-1',
    title: 'Guided Meditation for Beginners',
    description: 'A gentle introduction to mindfulness meditation with breathing techniques',
    type: 'meditation',
    duration: 10,
    difficulty: 'beginner',
    category: 'Mindfulness',
    content: {
      instructions: [
        'Find a comfortable seated position',
        'Close your eyes and focus on your breath',
        'Notice thoughts without judgment',
        'Return attention to breathing when mind wanders'
      ]
    },
    tags: ['meditation', 'mindfulness', 'breathing', 'relaxation'],
    imageUrl: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=400',
    isPopular: true,
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },
  {
    id: 'resource-2',
    title: '4-7-8 Breathing Exercise',
    description: 'A powerful breathing technique to reduce anxiety and promote relaxation',
    type: 'breathing',
    duration: 5,
    difficulty: 'beginner',
    category: 'Anxiety Relief',
    content: {
      steps: [
        'Inhale through nose for 4 counts',
        'Hold breath for 7 counts',
        'Exhale through mouth for 8 counts',
        'Repeat cycle 3-4 times'
      ]
    },
    tags: ['breathing', 'anxiety', 'relaxation', 'quick'],
    imageUrl: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=400',
    isPopular: true,
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },
  {
    id: 'resource-3',
    title: 'Daily Gratitude Journal',
    description: 'Structured journaling prompts to cultivate gratitude and positive thinking',
    type: 'journal',
    duration: 15,
    difficulty: 'beginner',
    category: 'Positive Psychology',
    content: {
      instructions: [
        'Write down 3 things you\'re grateful for today',
        'Describe why each item is meaningful to you',
        'Reflect on how these positives affected your day',
        'Set an intention for tomorrow'
      ]
    },
    tags: ['journaling', 'gratitude', 'positivity', 'reflection'],
    imageUrl: 'https://images.pexels.com/photos/1925536/pexels-photo-1925536.jpeg?auto=compress&cs=tinysrgb&w=400',
    isPopular: false,
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },
  {
    id: 'resource-4',
    title: 'Progressive Muscle Relaxation',
    description: 'Systematic tension and release technique for physical and mental relaxation',
    type: 'exercise',
    duration: 20,
    difficulty: 'intermediate',
    category: 'Stress Relief',
    content: {
      steps: [
        'Start with your toes, tense for 5 seconds then release',
        'Move up to calves, thighs, abdomen',
        'Continue with hands, arms, shoulders',
        'Finish with face and head muscles',
        'Notice the contrast between tension and relaxation'
      ]
    },
    tags: ['relaxation', 'stress', 'body', 'tension'],
    imageUrl: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=400',
    isPopular: false,
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },
  {
    id: 'resource-5',
    title: 'Understanding Anxiety',
    description: 'Educational video about anxiety symptoms, causes, and coping strategies',
    type: 'video',
    duration: 12,
    difficulty: 'beginner',
    category: 'Education',
    content: {
      url: 'https://example.com/anxiety-video',
      instructions: [
        'Watch the full video without distractions',
        'Take notes on strategies that resonate with you',
        'Practice one technique mentioned in the video'
      ]
    },
    tags: ['anxiety', 'education', 'coping', 'strategies'],
    imageUrl: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=400',
    isPopular: true,
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },
  {
    id: 'resource-6',
    title: 'Mindful Walking',
    description: 'Transform your daily walk into a mindfulness practice',
    type: 'exercise',
    duration: 25,
    difficulty: 'beginner',
    category: 'Mindfulness',
    content: {
      instructions: [
        'Choose a quiet route for your walk',
        'Focus on the sensation of your feet touching the ground',
        'Notice your surroundings without judgment',
        'Coordinate breathing with your steps',
        'Return attention to walking when mind wanders'
      ]
    },
    tags: ['mindfulness', 'walking', 'nature', 'movement'],
    imageUrl: 'https://images.pexels.com/photos/1308881/pexels-photo-1308881.jpeg?auto=compress&cs=tinysrgb&w=400',
    isPopular: false,
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  }
];

// Initialize with demo data
users = [...DEMO_USERS];
counselors = [...DEMO_COUNSELORS];
appointments = [...DEMO_APPOINTMENTS];
moodEntries = [...DEMO_MOOD_ENTRIES];
wellnessResources = [...DEMO_WELLNESS_RESOURCES];

export function generateToken(): string {
  return `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateAnonymousId(): string {
  return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createUser(email: string, password: string, name?: string, role: User['role'] = 'user'): User {
  const user: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email,
    anonymousId: generateAnonymousId(),
    isAnonymous: false,
    role,
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  users.push(user);
  return user;
}

export function createAnonymousUser(): User {
  const user: User = {
    id: `anon-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email: '',
    anonymousId: generateAnonymousId(),
    isAnonymous: true,
    role: 'user',
    name: 'Anonymous User',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  users.push(user);
  return user;
}

export function findUserByEmail(email: string): User | undefined {
  return users.find(user => user.email === email);
}

export function findUserById(id: string): User | undefined {
  return users.find(user => user.id === id);
}

export function validatePassword(email: string, password: string): boolean {
  // Simple password validation for demo
  // In production, use proper password hashing (bcrypt, etc.)
  return password === 'password';
}

export function createSession(userId: string): string {
  const token = generateToken();
  sessions.set(token, userId);
  return token;
}

export function validateSession(token: string): User | null {
  const userId = sessions.get(token);
  if (!userId) return null;
  
  return findUserById(userId) || null;
}

export function invalidateSession(token: string): void {
  sessions.delete(token);
}

export function updateUser(userId: string, updates: Partial<User>): User | null {
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex === -1) return null;
  
  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  return users[userIndex];
}

export function linkCompanyToUser(userId: string, token: string): boolean {
  // Demo company token validation
  const validTokens = ['ABC-1234-DEMO-5678', 'XYZ-9876-TEST-4321'];
  if (!validTokens.includes(token)) return false;
  
  const user = updateUser(userId, {
    companyConnection: {
      token,
      verified: true,
      benefits: [
        '10 free therapy sessions per year',
        'Premium AI wellness companion',
        'Access to wellness workshops',
        'Mental health resources library'
      ]
    }
  });
  
  return user !== null;
}

// Wellness-related functions
export function createMoodEntry(userId: string, mood: number, notes?: string): MoodEntry {
  const entry: MoodEntry = {
    id: `mood-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    mood,
    notes,
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };
  
  moodEntries.push(entry);
  return entry;
}

export function getMoodEntriesByUser(userId: string): MoodEntry[] {
  return moodEntries.filter(entry => entry.userId === userId);
}

export function getAllMoodEntries(): MoodEntry[] {
  return moodEntries;
}

export function getAllUsers(): User[] {
  return users;
}

export function getWellnessResources(): WellnessResource[] {
  return wellnessResources;
}

export function getWellnessResourcesByCategory(category?: string): WellnessResource[] {
  if (!category) return wellnessResources;
  return wellnessResources.filter(resource => 
    resource.category.toLowerCase().includes(category.toLowerCase())
  );
}

export function getPopularWellnessResources(): WellnessResource[] {
  return wellnessResources.filter(resource => resource.isPopular);
}

// Counselor management functions
export function getAllCounselors(): Counselor[] {
  return counselors;
}

export function findCounselorById(id: string): Counselor | undefined {
  return counselors.find(counselor => counselor.id === id);
}

export function createCounselor(counselorData: Omit<Counselor, 'id'>): Counselor {
  const counselor: Counselor = {
    id: `counselor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...counselorData
  };
  
  counselors.push(counselor);
  return counselor;
}

export function updateCounselor(id: string, updates: Partial<Counselor>): Counselor | null {
  const counselorIndex = counselors.findIndex(counselor => counselor.id === id);
  if (counselorIndex === -1) return null;
  
  counselors[counselorIndex] = {
    ...counselors[counselorIndex],
    ...updates
  };
  
  return counselors[counselorIndex];
}

// Appointment management functions
export function createAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Appointment {
  const appointment: Appointment = {
    id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...appointmentData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  appointments.push(appointment);
  return appointment;
}

export function findAppointmentById(id: string): Appointment | undefined {
  return appointments.find(appointment => appointment.id === id);
}

export function updateAppointment(id: string, updates: Partial<Appointment>): Appointment | null {
  const appointmentIndex = appointments.findIndex(appointment => appointment.id === id);
  if (appointmentIndex === -1) return null;
  
  appointments[appointmentIndex] = {
    ...appointments[appointmentIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  return appointments[appointmentIndex];
}

export function getAppointmentsByUserId(userId: string): Appointment[] {
  return appointments.filter(appointment => appointment.userId === userId);
}

export function getAppointmentsByCounselorId(counselorId: string): Appointment[] {
  return appointments.filter(appointment => appointment.counselorId === counselorId);
}

export function getAllAppointments(): Appointment[] {
  return appointments;
}

// Privacy-Enhancing Technologies (PETs) functions
export function addNoise(value: number, noiseLevel: number = 0.1): number {
  // Add Laplacian noise for differential privacy
  const noise = (Math.random() - 0.5) * 2 * noiseLevel * value;
  return Math.max(0, Math.round(value + noise));
}

export function addFloatNoise(value: number, noiseLevel: number = 0.05): number {
  // Add noise to floating point values
  const noise = (Math.random() - 0.5) * 2 * noiseLevel * value;
  return Math.max(0, value + noise);
}

export function applyKAnonymity<T>(groups: T[], minGroupSize: number = 5): T[] {
  // Filter out groups smaller than k to prevent re-identification
  return groups.filter((group: any) => {
    if (typeof group === 'object' && group.count !== undefined) {
      return group.count >= minGroupSize;
    }
    return true;
  });
}

export function getCompanyAnalytics(companyToken: string): any {
  // Get users associated with the company token
  const companyUsers = users.filter(user => 
    user.companyConnection?.token === companyToken && user.companyConnection?.verified
  );

  if (companyUsers.length === 0) {
    return {
      companyToken,
      totalUsers: 0,
      activeSessions: 0,
      moodTrends: {
        average: 0,
        trend: 'stable',
        data: []
      },
      utilization: {
        aiChat: 0,
        therapy: 0,
        resources: 0
      },
      demographics: {
        ageGroups: [],
        riskLevels: []
      }
    };
  }

  // Get mood entries for company users
  const companyMoodEntries = moodEntries.filter(entry => 
    companyUsers.some(user => user.id === entry.userId)
  );

  // Get appointments for company users
  const companyAppointments = appointments.filter(appointment => 
    companyUsers.some(user => user.id === appointment.userId)
  );

  // Calculate metrics with noise added for privacy
  const totalUsers = addNoise(companyUsers.length, 0.1);
  const activeSessions = addNoise(
    companyAppointments.filter(apt => 
      new Date(apt.scheduledDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length,
    0.15
  );

  // Calculate mood trends with privacy protection
  const moodAverage = companyMoodEntries.length > 0 
    ? addFloatNoise(
        companyMoodEntries.reduce((sum, entry) => sum + entry.mood, 0) / companyMoodEntries.length,
        0.05
      )
    : 3.5;

  // Generate trend data with noise
  const trendData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i * 7);
    const weekEntries = companyMoodEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000) && 
             entryDate < date;
    });
    
    const weekAverage = weekEntries.length > 0 
      ? addFloatNoise(
          weekEntries.reduce((sum, entry) => sum + entry.mood, 0) / weekEntries.length,
          0.08
        )
      : moodAverage;
    
    trendData.push({
      date: date.toISOString().split('T')[0],
      value: Math.max(1, Math.min(5, weekAverage))
    });
  }

  // Determine trend
  const recentAvg = trendData.slice(-2).reduce((sum, d) => sum + d.value, 0) / 2;
  const olderAvg = trendData.slice(0, 2).reduce((sum, d) => sum + d.value, 0) / 2;
  const trend = recentAvg > olderAvg + 0.2 ? 'up' : 
                recentAvg < olderAvg - 0.2 ? 'down' : 'stable';

  // Calculate utilization with noise
  const aiChatUtilization = addNoise(Math.min(100, Math.max(0, 
    (companyMoodEntries.length / companyUsers.length) * 20
  )), 0.1);
  
  const therapyUtilization = addNoise(Math.min(100, Math.max(0,
    (companyAppointments.length / companyUsers.length) * 25
  )), 0.15);
  
  const resourcesUtilization = addNoise(Math.min(100, Math.max(0,
    (companyUsers.length / Math.max(1, companyUsers.length)) * 60
  )), 0.1);

  // Generate demographics with k-anonymity
  const ageGroups = [
    { range: '18-25', count: addNoise(Math.floor(companyUsers.length * 0.2), 0.2) },
    { range: '26-35', count: addNoise(Math.floor(companyUsers.length * 0.4), 0.2) },
    { range: '36-45', count: addNoise(Math.floor(companyUsers.length * 0.3), 0.2) },
    { range: '46-55', count: addNoise(Math.floor(companyUsers.length * 0.1), 0.2) }
  ];

  // Apply k-anonymity (minimum group size of 5)
  const filteredAgeGroups = applyKAnonymity(ageGroups, 5);

  // Calculate risk levels based on mood data
  const lowRiskUsers = companyMoodEntries.filter(entry => entry.mood >= 4).length;
  const mediumRiskUsers = companyMoodEntries.filter(entry => entry.mood === 3).length;
  const highRiskUsers = companyMoodEntries.filter(entry => entry.mood <= 2).length;
  const totalMoodEntries = Math.max(1, lowRiskUsers + mediumRiskUsers + highRiskUsers);

  const riskLevels = [
    { 
      level: 'Low', 
      percentage: addNoise(Math.round((lowRiskUsers / totalMoodEntries) * 100), 0.1)
    },
    { 
      level: 'Medium', 
      percentage: addNoise(Math.round((mediumRiskUsers / totalMoodEntries) * 100), 0.1)
    },
    { 
      level: 'High', 
      percentage: addNoise(Math.round((highRiskUsers / totalMoodEntries) * 100), 0.1)
    }
  ];

  // Ensure percentages add up to approximately 100%
  const totalPercentage = riskLevels.reduce((sum, level) => sum + level.percentage, 0);
  if (totalPercentage > 0) {
    riskLevels.forEach(level => {
      level.percentage = Math.round((level.percentage / totalPercentage) * 100);
    });
  }

  return {
    companyToken,
    totalUsers,
    activeSessions,
    moodTrends: {
      average: Math.round(moodAverage * 10) / 10,
      trend,
      data: trendData
    },
    utilization: {
      aiChat: Math.min(100, aiChatUtilization),
      therapy: Math.min(100, therapyUtilization),
      resources: Math.min(100, resourcesUtilization)
    },
    demographics: {
      ageGroups: filteredAgeGroups,
      riskLevels
    }
  };
}

export function calculateUserInsights(userId: string): any {
  const userMoods = getMoodEntriesByUser(userId);
  const user = findUserById(userId);
  
  if (!user) return null;
  
  const average = userMoods.length > 0 
    ? userMoods.reduce((sum, entry) => sum + entry.mood, 0) / userMoods.length 
    : 3;
  
  // Calculate trend based on recent entries
  const recentEntries = userMoods.slice(-7); // Last 7 entries
  const olderEntries = userMoods.slice(-14, -7); // Previous 7 entries
  
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (recentEntries.length > 0 && olderEntries.length > 0) {
    const recentAvg = recentEntries.reduce((sum, entry) => sum + entry.mood, 0) / recentEntries.length;
    const olderAvg = olderEntries.reduce((sum, entry) => sum + entry.mood, 0) / olderEntries.length;
    
    if (recentAvg > olderAvg + 0.3) trend = 'improving';
    else if (recentAvg < olderAvg - 0.3) trend = 'declining';
  }
  
  // Calculate streak days (consecutive days with mood entries)
  const today = new Date().toISOString().split('T')[0];
  let streakDays = 0;
  const sortedEntries = userMoods.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  for (let i = 0; i < sortedEntries.length; i++) {
    const entryDate = new Date(sortedEntries[i].date);
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() - i);
    
    if (entryDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
      streakDays++;
    } else {
      break;
    }
  }
  
  // Generate recommendations based on mood and trend
  const recommendations = [];
  if (average < 3) {
    recommendations.push('Consider scheduling a therapy session');
    recommendations.push('Try the 4-7-8 breathing exercise when feeling anxious');
  }
  if (trend === 'declining') {
    recommendations.push('Practice daily gratitude journaling');
    recommendations.push('Increase physical activity with mindful walking');
  }
  if (streakDays < 3) {
    recommendations.push('Continue daily mood tracking for better insights');
  }
  if (average >= 4) {
    recommendations.push('Great job maintaining positive mental health!');
    recommendations.push('Consider sharing your strategies with others');
  }
  
  return {
    userId,
    moodAverage: average,
    moodTrend: trend,
    streakDays,
    totalSessions: getAppointmentsByUserId(userId).filter(apt => apt.status === 'completed').length,
    riskLevel: average < 2.5 ? 'high' : average < 3.5 ? 'medium' : 'low',
    recommendations,
    nextAppointment: undefined // This would come from appointments data
  };
}