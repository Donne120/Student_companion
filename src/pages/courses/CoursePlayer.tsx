import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChevronLeft, Menu, X, CheckCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getCourse,
  getUserEnrollments,
  updateProgress,
  getProgress,
} from '@/services/lmsService';
import { CourseOutline } from '@/components/lms/CourseOutline';
import { ProgressBar } from '@/components/lms/ProgressBar';
import { CourseTutorPanel } from '@/components/lms/CourseTutorPanel';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Course, Enrollment, CourseProgress } from '@/types/lms';

export default function CoursePlayer() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [marking, setMarking] = useState(false);
  const [scaOpen, setScaOpen] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<string | undefined>(undefined);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ── Auth gate ─────────────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <Navigate
        to="/login"
        state={{ from: `/courses/${courseId}/learn` }}
        replace
      />
    );
  }

  const uid = currentUser.uid;

  // ── Queries ───────────────────────────────────────────────────────────────
  const { data: course, isLoading: courseLoading } = useQuery<Course | null>({
    queryKey: ['course', courseId],
    queryFn: () => getCourse(courseId!),
    enabled: !!courseId,
  });

  const { data: enrollments = [] } = useQuery<Enrollment[]>({
    queryKey: ['enrollments', uid],
    queryFn: () => getUserEnrollments(uid),
  });

  const { data: progress, refetch: refetchProgress } = useQuery<CourseProgress | null>({
    queryKey: ['progress-detail', uid, courseId],
    queryFn: () => getProgress(uid, courseId!),
    enabled: !!courseId,
  });

  const enrollment = enrollments.find((e) => e.courseId === courseId);

  // ── Enrollment gates ──────────────────────────────────────────────────────
  // pending_payment: redirect to detail page
  if (enrollment?.status === 'pending_payment') {
    toast.info('Your payment is being reviewed.');
    return <Navigate to={`/courses/${courseId}`} replace />;
  }

  // Not enrolled at all: redirect to detail page
  if (enrollments.length > 0 && !enrollment) {
    return <Navigate to={`/courses/${courseId}`} replace />;
  }

  // ── xAPI / SCORM progress listener ───────────────────────────────────────
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.data) return;
      const pct: number | null =
        e.data.percentComplete != null
          ? Number(e.data.percentComplete)
          : e.data.verb === 'completed'
          ? 100
          : null;
      if (pct !== null && courseId) {
        updateProgress(uid, courseId, pct, e.data as Record<string, unknown>).catch(
          console.error,
        );
        refetchProgress();
      }
      // Capture lesson title from xAPI data
      if (e.data.lessonTitle) {
        setCurrentLesson(String(e.data.lessonTitle));
      } else if (e.data.activityName) {
        setCurrentLesson(String(e.data.activityName));
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [uid, courseId, refetchProgress]);

  // ── Mark complete handler ─────────────────────────────────────────────────
  const handleMarkComplete = async () => {
    if (!courseId) return;
    setMarking(true);
    try {
      await updateProgress(uid, courseId, 100);
      await refetchProgress();
      toast.success('Course marked as complete!');
    } catch (err) {
      console.error('Mark complete error:', err);
      toast.error('Could not update progress.');
    } finally {
      setMarking(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (courseLoading || !course) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <Skeleton className="h-8 w-48 bg-white/10" />
      </div>
    );
  }

  const percentComplete = progress?.percentComplete ?? 0;
  const isTrial = enrollment?.status === 'trial';
  const scormSrc = isTrial
    ? `${course.scormUrl}?module=1`
    : course.scormUrl;

  return (
    <div className="h-screen flex flex-col bg-[#0F0F0F] overflow-hidden">
      {/* ── Top bar ── */}
      <header className="flex-shrink-0 h-12 bg-[#1A1A1A] border-b border-white/10 flex items-center px-4 gap-3">
        {/* Back */}
        <button
          onClick={() => navigate(`/courses/${courseId}`)}
          className="inline-flex items-center gap-1 text-white/60 hover:text-white text-sm transition-colors flex-shrink-0"
          aria-label="Back to course"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        {/* Title */}
        <h1 className="flex-1 text-white text-sm font-medium truncate">
          {course.title}
        </h1>

        {/* Progress badge */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <span className="text-xs text-white/50 tabular-nums hidden sm:block">
            {percentComplete}% complete
          </span>

          <Button
            size="sm"
            disabled={marking}
            onClick={handleMarkComplete}
            className="bg-[#D4AF37] hover:bg-[#B8941F] text-[#1A1A1A] text-xs font-semibold h-7 px-3"
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            {marking ? 'Saving…' : 'Mark Complete'}
          </Button>

          {/* Mobile sidebar toggle */}
          <button
            className="lg:hidden text-white/60 hover:text-white"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle outline"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Progress bar strip */}
      <div className="flex-shrink-0 h-1 bg-white/10">
        <div
          className="h-full bg-[#D4AF37] transition-all"
          style={{ width: `${percentComplete}%` }}
        />
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <aside
          className={`flex-shrink-0 w-72 bg-[#1A1A1A] border-r border-white/10 overflow-y-auto transition-all duration-200 ${
            sidebarOpen ? 'block' : 'hidden'
          } lg:block`}
        >
          <div className="p-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">
              Course Outline
            </h2>
            <div className="[&_.accordion-item]:border-white/10 [&_button]:text-white/70 [&_button:hover]:text-white [&_.accordion-content]:text-white/50">
              <CourseOutline
                course={course}
                enrollment={enrollment}
              />
            </div>
            {isTrial && (
              <p className="mt-4 text-xs text-white/30 text-center">
                Trial: Module 1 only. Enroll for full access.
              </p>
            )}
            <div className="mt-4">
              <ProgressBar percent={percentComplete} />
            </div>
          </div>
        </aside>

        {/* Main iframe area */}
        <main className="flex-1 overflow-hidden bg-[#0F0F0F]">
          <iframe
            ref={iframeRef}
            src={scormSrc}
            title={course.title}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            allowFullScreen
          />
        </main>
      </div>

      {/* ── SCA floating button ── */}
      <button
        onClick={() => setScaOpen(true)}
        className="fixed bottom-20 right-4 z-50 flex items-center gap-2 bg-[#D4AF37] text-white px-4 py-2.5 rounded-full shadow-lg hover:bg-[#B8941F] transition-colors font-medium text-sm md:bottom-6"
        aria-label="Open SCA Course Assistant"
      >
        <Sparkles className="h-4 w-4" />
        Ask SCA
      </button>

      {/* ── SCA tutor panel ── */}
      <CourseTutorPanel
        isOpen={scaOpen}
        onClose={() => setScaOpen(false)}
        courseId={courseId!}
        courseTitle={course.title}
        currentLesson={currentLesson}
      />
    </div>
  );
}
