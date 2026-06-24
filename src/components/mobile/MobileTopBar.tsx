import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface MobileTopBarProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
}

export const MobileTopBar = ({ title, subtitle, back, right }: MobileTopBarProps) => {
  const navigate = useNavigate();
  return (
    <header className="md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-[#E8DDB0] safe-top">
      <div className="h-14 px-3 flex items-center gap-2">
        {back ? (
          <button
            onClick={() => navigate(-1)}
            className="h-9 w-9 -ml-1 flex items-center justify-center rounded-full hover:bg-[#FBF7E9] text-[#1A1A1A]"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : (
          <div className="w-7 h-7 rounded-md bg-[#D4AF37] flex items-center justify-center text-[#1A1A1A] font-bold text-xs">
            A
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold tracking-tight text-[#1A1A1A] truncate leading-tight">
            {title}
          </div>
          {subtitle && (
            <div className="text-[11px] text-[#1A1A1A]/55 truncate leading-tight">{subtitle}</div>
          )}
        </div>
        {right}
      </div>
    </header>
  );
};
