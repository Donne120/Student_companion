import { Navigate, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getCourses, getUserEnrollments, getProgress } from '@/services/lmsService';
import { CourseCard } from '@/components/lms/CourseCard';
import { ProgressBar } from '@/components/lms/ProgressBar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Course, Enrollment, CourseProgress } from '@/types/lms';

const FILTER_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Free', value: 'free' },
  { label: 'Career Development', value: 'Career Development' },
  { label: 'Technology', value: 'Technology' },
] as const;

type FilterValue = (typeof FILTER_OPTIONS)[number]['value'];

function statusLabel(status: Enrollment['status']): string {
  switch (status) {
    case 'trial': return 'Trial';
    case 'enrolled': return 'Enrolled';
    case 'completed': return 'Completed';
    case 'pending_payment': return 'Pending Payment';
  }
}

function statusColor(status: Enrollment['status']): string {
  switch (status) {
    case 'trial': return 'bg-blue-100 text-blue-700';
    case 'enrolled': return 'bg-green-100 text-green-700';
    case 'completed': return 'bg-purple-100 text-purple-700';
    case 'pending_payment': return 'bg-amber-100 text-amber-700';
  }
}

export default function CourseCatalog() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterValue>('');

  // Redirect unauthenticated users
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: '/courses' }} replace />;
  }

  const uid = currentUser.uid;

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: allCourses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: () => getCourses(),
  });

  const { data: enrollments = [] } = useQuery<Enrollment[]>({
    queryKey: ['enrollments', uid],
    queryFn: () => getUserEnrollments(uid),
  });

  // Build lookup maps
  const enrollmentMap = new Map(enrollments.map((e) => [e.courseId, e]));

  // Fetch progress for each enrolled course
  const enrolledCourseIds = enrollments.map((e) => e.courseId);
  const { data: progressMap = new Map<string, CourseProgress>() } = useQuery<
    Map<string, CourseProgress>
  >({
    queryKey: ['progress', uid],
    queryFn: async () => {
      const entries = await Promise.all(
        enrolledCourseIds.map(async (id) => {
          const p = await getProgress(uid, id);
          return [id, p] as [string, CourseProgress | null];
        }),
      );
      const map = new Map<string, CourseProgress>();
      for (const [id, p] of entries) {
        if (p) map.set(id, p);
      }
      return map;
    },
    enabled: enrolledCourseIds.length > 0,
  });

  // ── Filtering ────────────────────────────────────────────────────────────
  const filteredCourses = allCourses.filter((course) => {
    if (activeFilter === 'free') return course.price === 0;
    if (activeFilter !== '') return course.category === activeFilter;
    return true;
  });

  const featuredCourses = filteredCourses.filter((c) => c.isFeatured);
  const myCourses = allCourses.filter((c) => enrollmentMap.has(c.id));

  // ── Navigation helpers ───────────────────────────────────────────────────
  const handleCourseClick = (course: Course) => {
    const enrollment = enrollmentMap.get(course.id);
    if (enrollment?.status === 'enrolled' || enrollment?.status === 'completed') {
      navigate(`/courses/${course.id}/learn`);
    } else {
      navigate(`/courses/${course.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* ── Header ── */}
      <div className="bg-[#1A1A1A] text-white py-16 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Learning Hub
          </h1>
          <p className="mt-3 text-white/60 text-lg max-w-xl">
            Grow your career with expert-led courses
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* ── Filter bar ── */}
        <div className="mt-8 flex flex-wrap gap-2">
          {FILTER_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setActiveFilter(value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeFilter === value
                  ? 'bg-[#D4AF37] border-[#D4AF37] text-[#1A1A1A]'
                  : 'bg-white border-[#E8DDB0] text-[#1A1A1A]/60 hover:border-[#D4AF37] hover:text-[#1A1A1A]'
              }`}
              aria-pressed={activeFilter === value}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Featured hero banner ── */}
        {featuredCourses.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">Featured</h2>
            <div
              className="relative rounded-2xl overflow-hidden bg-[#1A1A1A] cursor-pointer group"
              onClick={() => navigate(`/courses/${featuredCourses[0].id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate(`/courses/${featuredCourses[0].id}`);
              }}
              aria-label={`View ${featuredCourses[0].title}`}
            >
              {featuredCourses[0].thumbnailUrl && (
                <img
                  src={featuredCourses[0].thumbnailUrl}
                  alt={featuredCourses[0].title}
                  className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity"
                />
              )}
              <div className="relative p-8 md:p-12">
                <Badge className="mb-4 bg-[#D4AF37] text-[#1A1A1A] hover:bg-[#B8941F]">
                  Featured
                </Badge>
                <h3 className="text-2xl md:text-4xl font-bold text-white leading-tight max-w-xl">
                  {featuredCourses[0].title}
                </h3>
                <p className="mt-3 text-white/70 max-w-lg">
                  {featuredCourses[0].subtitle}
                </p>
                <div className="mt-5 flex flex-wrap gap-3 text-sm text-white/50">
                  <span>{featuredCourses[0].level}</span>
                  <span>·</span>
                  <span>{featuredCourses[0].duration}</span>
                  <span>·</span>
                  <span>{featuredCourses[0].lessonsCount} lessons</span>
                </div>
                <button className="mt-6 inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8941F] text-[#1A1A1A] font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors">
                  {featuredCourses[0].price === 0
                    ? 'Start for Free'
                    : `Enroll — ${featuredCourses[0].currency} ${featuredCourses[0].price.toLocaleString()}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── My Courses ── */}
        {myCourses.length > 0 && (
          <section className="mt-14" aria-labelledby="my-courses-heading">
            <h2
              id="my-courses-heading"
              className="text-xl font-bold text-[#1A1A1A] mb-5"
            >
              My Courses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myCourses.map((course) => {
                const enrollment = enrollmentMap.get(course.id)!;
                const progress = progressMap.get(course.id);
                return (
                  <div
                    key={course.id}
                    className="border border-[#E8DDB0] rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow bg-white"
                    onClick={() => handleCourseClick(course)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCourseClick(course);
                    }}
                    aria-label={`${course.title} — ${statusLabel(enrollment.status)}`}
                  >
                    {course.thumbnailUrl && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-[#1A1A1A] text-sm leading-snug line-clamp-2">
                          {course.title}
                        </h3>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${statusColor(enrollment.status)}`}
                        >
                          {statusLabel(enrollment.status)}
                        </span>
                      </div>
                      <ProgressBar
                        percent={progress?.percentComplete ?? 0}
                        className="mt-2"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── All Courses grid ── */}
        <section className="mt-14" aria-labelledby="all-courses-heading">
          <h2
            id="all-courses-heading"
            className="text-xl font-bold text-[#1A1A1A] mb-5"
          >
            {activeFilter === '' ? 'All Courses' : FILTER_OPTIONS.find((f) => f.value === activeFilter)?.label}
          </h2>

          {coursesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((n) => (
                <div key={n} className="space-y-3">
                  <Skeleton className="h-40 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No courses found for this filter.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  enrollment={enrollmentMap.get(course.id)}
                  progress={progressMap.get(course.id)}
                  onClick={() => navigate(`/courses/${course.id}`)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
