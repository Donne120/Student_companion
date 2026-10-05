import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  percent: number;
  className?: string;
}

export function ProgressBar({ percent, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Progress
        value={clamped}
        className="flex-1 h-2 [&>div]:bg-[#D4AF37]"
      />
      <span className="text-xs font-medium text-alu-gold-strong tabular-nums w-8 text-right">
        {clamped}%
      </span>
    </div>
  );
}
