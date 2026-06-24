import { NavLink } from "react-router-dom";
import { MessageSquare, Newspaper, Sparkles, FileText, User } from "lucide-react";

const tabs = [
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/news", label: "News", icon: Newspaper },
  { to: "/opportunities", label: "Discover", icon: Sparkles },
  { to: "/documents", label: "Docs", icon: FileText },
  { to: "/profile", label: "Me", icon: User },
];

export const MobileTabBar = () => {
  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-[#E8DDB0] safe-bottom"
    >
      <ul className="grid grid-cols-5">
        {tabs.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                  isActive
                    ? "text-[#B8941F]"
                    : "text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`flex items-center justify-center h-7 w-12 rounded-full transition-all ${
                      isActive ? "bg-[#FBF7E9]" : ""
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                  </div>
                  <span className="leading-none">{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
