export interface School {
  id: string;
  name: string;
  address: string;
  country: string;
  totalStudents: number;
  totalTeachers: number;
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  schoolId: string;
  schoolName: string;
  standard: string; // grade/class
  subject: string;
  uploadedBy: string;
  uploadedAt: string;
  indexed: boolean;
}

export interface UserLog {
  id: string;
  timestamp: string;
  type: 'login' | 'document' | 'chat' | 'billing' | 'admin';
  description: string;
  ipAddress?: string;
  location?: string;
  device?: string;
}

export interface UserUsageSummary {
  messagesThisMonth: number;
  documentsUploaded: number;
  storageUsedMb: number;
  tokensConsumed: number;
  avgResponseTimeMs: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  location: string;
  schoolId?: string;
  schoolName?: string;
  standard?: string;
  joinedAt: string;
  lastActive: string;
  status: 'active' | 'inactive';
  plan: 'Free' | 'Starter' | 'Pro' | 'Enterprise';
  subscriptionStatus: 'trialing' | 'active' | 'past_due' | 'canceled';
  billingCycle: 'monthly' | 'annual';
  totalSpendUsd: number;
  usage: UserUsageSummary;
  logs: UserLog[];
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'refunded' | 'cancelled';
  createdAt: string;
  renewsAt: string;
  billingCycle: 'monthly' | 'annual';
  seats: number;
  paymentMethod: string;
  couponApplied?: string;
  isActive: boolean;
}

export interface Statistics {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalSchools: number;
  totalDocuments: number;
  totalChats: number;
  activeToday: number;
  storageUsed: number; // in MB
  monthlyRecurringRevenue: number;
  activeSubscriptions: number;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'indexing' | 'completed' | 'error';
  error?: string;
}

export interface HomePageContent {
  hero: {
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
  highlights: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  placeholders: {
    chatInput: string;
    signupEmail: string;
    searchBar: string;
  };
  announcements: string[];
}

