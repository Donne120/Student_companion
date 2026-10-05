import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Course, Enrollment, CourseProgress, CourseFilter } from '@/types/lms';

const COURSES_COL = 'courses';
const ENROLLMENTS_COL = 'enrollments';
const PROGRESS_COL = 'courseProgress';

// ─── Courses ─────────────────────────────────────────────────────────────────

export async function getCourses(filter?: CourseFilter): Promise<Course[]> {
  const ref = collection(db, COURSES_COL);
  // Base constraint: published only
  const constraints: QueryConstraint[] = [where('isPublished', '==', true)];

  if (filter?.category) {
    constraints.push(where('category', '==', filter.category));
  }
  if (filter?.level) {
    constraints.push(where('level', '==', filter.level));
  }
  if (filter?.free) {
    constraints.push(where('price', '==', 0));
  }

  constraints.push(orderBy('createdAt', 'desc'));

  const snap = await getDocs(query(ref, ...constraints));
  const courses = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Course));

  if (filter?.search) {
    const term = filter.search.toLowerCase();
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(term) ||
        c.subtitle.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term) ||
        c.tags.some((t) => t.toLowerCase().includes(term)),
    );
  }

  return courses;
}

export async function getCourse(id: string): Promise<Course | null> {
  const ref = doc(db, COURSES_COL, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Course;
}

// ─── Enrollments ─────────────────────────────────────────────────────────────

export async function getUserEnrollments(uid: string): Promise<Enrollment[]> {
  const ref = collection(db, ENROLLMENTS_COL);
  const q = query(ref, where('userId', '==', uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Enrollment);
}

export async function enrollUserFree(uid: string, courseId: string): Promise<void> {
  const docId = `${uid}_${courseId}`;
  const ref = doc(db, ENROLLMENTS_COL, docId);
  const enrollment: Omit<Enrollment, 'enrolledAt'> & { enrolledAt: ReturnType<typeof serverTimestamp> } = {
    userId: uid,
    courseId,
    status: 'enrolled',
    enrolledAt: serverTimestamp(),
  };
  await setDoc(ref, enrollment, { merge: true });
}

export async function enrollUserPaid(
  uid: string,
  courseId: string,
  paymentRef: string,
): Promise<void> {
  const docId = `${uid}_${courseId}`;
  const ref = doc(db, ENROLLMENTS_COL, docId);
  const enrollment: Omit<Enrollment, 'enrolledAt'> & { enrolledAt: ReturnType<typeof serverTimestamp> } = {
    userId: uid,
    courseId,
    status: 'enrolled',
    paymentRef,
    enrolledAt: serverTimestamp(),
  };
  await setDoc(ref, enrollment, { merge: true });
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export async function updateProgress(
  uid: string,
  courseId: string,
  percent: number,
  scormData?: Record<string, unknown>,
): Promise<void> {
  const docId = `${uid}_${courseId}`;
  const ref = doc(db, PROGRESS_COL, docId);
  const progress: Omit<CourseProgress, 'lastAccessedAt'> & {
    lastAccessedAt: ReturnType<typeof serverTimestamp>;
  } = {
    userId: uid,
    courseId,
    percentComplete: percent,
    lastAccessedAt: serverTimestamp(),
    ...(scormData ? { scormData } : {}),
  };
  await setDoc(ref, progress, { merge: true });
}

export async function getProgress(uid: string, courseId: string): Promise<CourseProgress | null> {
  const docId = `${uid}_${courseId}`;
  const ref = doc(db, PROGRESS_COL, docId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as CourseProgress;
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

export async function seedFirstCourse(): Promise<void> {
  const ref = doc(db, COURSES_COL, 'career-readiness-101');
  const courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'> & {
    createdAt: ReturnType<typeof serverTimestamp>;
    updatedAt: ReturnType<typeof serverTimestamp>;
  } = {
    title: 'Career Readiness 101',
    subtitle: 'Build the skills employers actually want',
    description:
      'A practical, self-paced course that walks you through CV writing, interview preparation, ' +
      'personal branding, and job-search strategy — specifically designed for African university students ' +
      'entering a competitive global workforce.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80',
    category: 'Career Development',
    level: 'Beginner',
    price: 0,
    currency: 'RWF',
    duration: '4 hours',
    lessonsCount: 8,
    instructor: 'Student Companion AI Team',
    tags: ['career', 'cv', 'interview', 'job-search', 'professional-development'],
    isPublished: true,
    isFeatured: true,
    trialModuleId: 'module-1',
    scormUrl: 'https://share.articulate.com/z08w8cMiDEbwgFjZHJDnC',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(ref, courseData, { merge: true });
}
