export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnailUrl: string;
  category: string;
  level: string;
  price: number;
  currency: 'RWF' | 'USD';
  duration: string;
  lessonsCount: number;
  instructor: string;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  trialModuleId?: string;
  scormUrl: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Enrollment {
  userId: string;
  courseId: string;
  status: 'trial' | 'enrolled' | 'completed';
  paymentRef?: string;
  enrolledAt?: unknown;
  completedAt?: unknown;
}

export interface CourseProgress {
  userId: string;
  courseId: string;
  percentComplete: number;
  lastAccessedAt?: unknown;
  scormData?: Record<string, unknown>;
}

export interface CourseFilter {
  category?: string;
  level?: string;
  free?: boolean;
  search?: string;
}
