import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChevronLeft, Clock, BookOpen, BarChart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getCourse,
  getUserEnrollments,
  enrollUserFree,
} from '@/services/lmsService';
import { CourseOutline } from '@/components/lms/CourseOutline';
import { PaymentModal } from '@/components/lms/PaymentModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Course, Enrollment } from '@/types/lms';

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  const { data: course, isLoading: courseLoading } = useQuery<Course | null>({
    queryKey: ['course', courseId],
    queryFn: () => getCourse(courseId!),
    enabled: !!courseId,
  });

  const { data: enrollments = [], refetch: refetchEnrollments } = useQuery<Enrollment[]>({
    queryKey: ['enrollments', currentUser?.uid],
    queryFn: () => getUserEnrollments(currentUser!.uid),
    enabled: !!currentUser,
  });

  const enrollment = enrollments.find((e) => e.courseId === courseId);

  const handleStartFree = async () => {
    if (!currentUser || !course) return;
    setEnrolling(true);
    try {
      await enrollUserFree(currentUser.uid, course.id);
      await refetchEnrollments();
      navigate(`/courses/${course.id}/learn`);
    } catch (err) {
      console.error('Enroll error:', err);
      toast.error('Could not enroll. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleTrialFree = async () => {
    if (!currentUser) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (!course) return;
    setEnrolling(true);
    try {
      await enrollUserFree(currentUser.uid, course.id);
      await refetchEnrollments();
      navigate(`/courses/${course.id}/learn`);
    } catch (err) {
      console.error('Trial enroll error:', err);
      toast.error('Could not start trial. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (courseLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 space-y-6">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold">Course not found.</p>
          <Button onClick={() => navigate('/courses')} variant="outline">
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  // ── Build bullet list from description ────────────────────────────────────
  const learningPoints = course.description
    .split(/[.!]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* ── Auth gate banner ── */}
      {!currentUser && (
        <div className="bg-[#FBF7E9] border-b border-[#E8DDB0] px-5 py-3 flex items-center justify-between gap-4">
          <p className="text-sm text-[#1A1A1A]/70">
            Sign in to access course content
          </p>
          <Button
            size="sm"
            className="bg-[#1A1A1A] hover:bg-[#333] text-white text-xs"
            onClick={() => navigate('/login', { state: { from: location.pathname } })}
          >
            Sign In
          </Button>
        </div>
      )}

      {/* ── Back nav ── */}
      <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-6">
        <button
          onClick={() => navigate('/courses')}
          className="inline-flex items-center gap-1.5 text-sm text-[#1A1A1A]/50 hover:text-[#1A1A1A] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Learning Hub
        </button>
      </div>

      {/* ── Hero ── */}
      <div className="max-w-5xl mx-auto px-5 sm:px-8 mt-6 grid lg:grid-cols-3 gap-10">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thumbnail */}
          {course.thumbnailUrl && (
            <div className="rounded-2xl overflow-hidden aspect-video bg-[#F5F5F5]">
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Title & meta */}
          <div>
            <Badge
              variant="outline"
              className="border-[#E8DDB0] text-[#B8941F] text-xs mb-3"
            >
              {course.category}
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] leading-tight">
              {course.title}
            </h1>
            <p className="mt-2 text-[#1A1A1A]/60">{course.subtitle}</p>
            <p className="mt-1 text-sm text-[#1A1A1A]/40">
              By {course.instructor}
            </p>
          </div>

          {/* Chips */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs bg-[#F5F5F5] border border-[#E8DDB0] text-[#1A1A1A]/60 px-3 py-1.5 rounded-full">
              <BarChart className="h-3.5 w-3.5" />
              {course.level}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs bg-[#F5F5F5] border border-[#E8DDB0] text-[#1A1A1A]/60 px-3 py-1.5 rounded-full">
              <Clock className="h-3.5 w-3.5" />
              {course.duration}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs bg-[#F5F5F5] border border-[#E8DDB0] text-[#1A1A1A]/60 px-3 py-1.5 rounded-full">
              <BookOpen className="h-3.5 w-3.5" />
              {course.lessonsCount} lessons
            </span>
          </div>

          {/* What you will learn */}
          <div>
            <h2 className="text-lg font-semibold text-[#1A1A1A] mb-3">
              What you will learn
            </h2>
            <ul className="space-y-2">
              {learningPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[#1A1A1A]/70">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#D4AF37] flex-shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Course outline */}
          <div>
            <h2 className="text-lg font-semibold text-[#1A1A1A] mb-3">
              Course Outline
            </h2>
            <CourseOutline course={course} enrollment={enrollment} />
          </div>
        </div>

        {/* ── Sticky sidebar ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 border border-[#E8DDB0] rounded-2xl p-6 space-y-4 bg-white shadow-sm">
            {/* Price */}
            <div className="text-2xl font-bold text-[#1A1A1A]">
              {course.price === 0 ? (
                <span className="text-green-600">Free</span>
              ) : (
                `${course.currency} ${course.price.toLocaleString()}`
              )}
            </div>

            {/* CTA based on enrollment status */}
            {enrollment?.status === 'enrolled' || enrollment?.status === 'completed' ? (
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => navigate(`/courses/${course.id}/learn`)}
              >
                Continue Learning
              </Button>
            ) : enrollment?.status === 'pending_payment' ? (
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
                Payment under review — we'll notify you when approved
              </div>
            ) : enrollment?.status === 'trial' ? (
              <div className="space-y-2">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => navigate(`/courses/${course.id}/learn`)}
                >
                  Continue Trial
                </Button>
                {currentUser && (
                  <Button
                    variant="outline"
                    className="w-full border-[#D4AF37] text-[#B8941F] hover:bg-[#FBF7E9]"
                    onClick={() => setPaymentOpen(true)}
                  >
                    Upgrade to Full Access
                  </Button>
                )}
              </div>
            ) : !currentUser ? (
              <Button
                className="w-full bg-[#1A1A1A] hover:bg-[#333] text-white"
                onClick={() =>
                  navigate('/login', { state: { from: location.pathname } })
                }
              >
                Sign In to Enroll
              </Button>
            ) : course.price === 0 ? (
              <Button
                className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-[#1A1A1A] font-semibold"
                disabled={enrolling}
                onClick={handleStartFree}
              >
                {enrolling ? 'Starting…' : 'Start for Free'}
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full border-[#E8DDB0] text-[#1A1A1A]/70 hover:border-[#D4AF37]"
                  disabled={enrolling}
                  onClick={handleTrialFree}
                >
                  {enrolling ? 'Loading…' : 'Try First Module Free'}
                </Button>
                <Button
                  className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-[#1A1A1A] font-semibold"
                  onClick={() => setPaymentOpen(true)}
                >
                  Enroll Now — {course.currency} {course.price.toLocaleString()}
                </Button>
              </div>
            )}

            {/* Course meta */}
            <div className="pt-2 border-t border-[#E8DDB0] space-y-2 text-sm text-[#1A1A1A]/60">
              <div className="flex justify-between">
                <span>Level</span>
                <span className="font-medium text-[#1A1A1A]">{course.level}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration</span>
                <span className="font-medium text-[#1A1A1A]">{course.duration}</span>
              </div>
              <div className="flex justify-between">
                <span>Lessons</span>
                <span className="font-medium text-[#1A1A1A]">{course.lessonsCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment modal — only rendered when user is authenticated */}
      {currentUser && course && (
        <PaymentModal
          open={paymentOpen}
          onOpenChange={setPaymentOpen}
          course={course}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
