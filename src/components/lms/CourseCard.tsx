import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from './ProgressBar';
import type { Course, Enrollment, CourseProgress } from '@/types/lms';

interface CourseCardProps {
  course: Course;
  enrollment?: Enrollment;
  progress?: CourseProgress;
  onClick?: () => void;
}

function priceLabel(course: Course): string {
  if (course.price === 0) return 'Free';
  return `${course.currency} ${course.price.toLocaleString()}`;
}

function ctaLabel(enrollment?: Enrollment): string {
  if (!enrollment) return 'Enroll';
  if (enrollment.status === 'trial') return 'Try Free';
  return 'Continue';
}

export function CourseCard({ course, enrollment, progress, onClick }: CourseCardProps) {
  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="aspect-video w-full overflow-hidden bg-alu-gold-soft">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-alu-gold-soft" />
        )}
      </div>

      <CardContent className="p-4 space-y-2">
        {/* Category badge */}
        <Badge
          variant="outline"
          className="border-alu-gold-border text-alu-gold-strong text-xs"
        >
          {course.category}
        </Badge>

        {/* Title */}
        <h3 className="font-semibold text-alu-ink leading-snug line-clamp-2">
          {course.title}
        </h3>

        {/* Subtitle */}
        <p className="text-sm text-muted-foreground truncate">{course.subtitle}</p>

        {/* Instructor */}
        <p className="text-xs text-muted-foreground">{course.instructor}</p>

        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {course.level}
          </Badge>
          <span className="text-sm font-semibold text-alu-gold-strong ml-auto">
            {priceLabel(course)}
          </span>
        </div>

        {/* Progress bar (enrolled only) */}
        {enrollment && (
          <ProgressBar percent={progress?.percentComplete ?? 0} className="mt-1" />
        )}
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0">
        <span className="text-xs font-semibold text-alu-gold uppercase tracking-wide">
          {ctaLabel(enrollment)}
        </span>
      </CardFooter>
    </Card>
  );
}
