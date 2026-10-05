import { Lock } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import type { Course, Enrollment } from '@/types/lms';

interface CourseOutlineProps {
  course: Course;
  enrollment?: Enrollment;
  currentModule?: string;
  onModuleClick?: (moduleId: string) => void;
}

interface ModuleEntry {
  id: string;
  title: string;
  description: string;
}

function buildModules(course: Course): ModuleEntry[] {
  return Array.from({ length: course.lessonsCount }, (_, i) => {
    const num = i + 1;
    return {
      id: `module-${num}`,
      title: `Module ${num}: ${moduleTitle(num)}`,
      description: `In this module you will explore key concepts and apply practical skills from the ${course.title} curriculum.`,
    };
  });
}

function moduleTitle(num: number): string {
  const TITLES = [
    'Introduction',
    'Core Concepts',
    'Practical Skills',
    'Applied Techniques',
    'Case Studies',
    'Deep Dive',
    'Advanced Topics',
    'Final Review',
  ];
  return TITLES[(num - 1) % TITLES.length];
}

function isModuleLocked(
  moduleId: string,
  enrollment: Enrollment | undefined,
  trialModuleId: string | undefined,
): boolean {
  if (!enrollment) {
    // No enrollment — only trial module is accessible (if defined)
    return moduleId !== trialModuleId;
  }
  if (enrollment.status === 'trial') {
    return moduleId !== trialModuleId;
  }
  // Fully enrolled/completed: nothing locked
  return false;
}

export function CourseOutline({
  course,
  enrollment,
  currentModule,
  onModuleClick,
}: CourseOutlineProps) {
  const modules = buildModules(course);

  return (
    <Accordion type="single" collapsible className="w-full">
      {modules.map((mod) => {
        const locked = isModuleLocked(mod.id, enrollment, course.trialModuleId);
        const isActive = currentModule === mod.id;

        return (
          <AccordionItem
            key={mod.id}
            value={mod.id}
            className={cn(
              isActive && 'bg-alu-gold-soft',
              'rounded-md',
            )}
          >
            <AccordionTrigger
              className={cn(
                'px-3 py-3 text-sm font-medium hover:no-underline',
                isActive ? 'text-alu-gold-strong' : 'text-alu-ink',
                locked && 'opacity-60 cursor-not-allowed',
              )}
              onClick={(e) => {
                if (locked) {
                  e.preventDefault();
                  return;
                }
                onModuleClick?.(mod.id);
              }}
            >
              <span className="flex items-center gap-2 text-left">
                {locked && <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                {mod.title}
              </span>
            </AccordionTrigger>

            {!locked && (
              <AccordionContent className="px-3 text-sm text-muted-foreground">
                {mod.description}
              </AccordionContent>
            )}
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
