import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Check, Moon, Smartphone, Sun } from "lucide-react";
import { toast } from "sonner";

/**
 * How the Companion looks: following the device, dark, or bright. The
 * Student Companion colours (or the university's own) stay the same.
 * next-themes keeps the choice on this device.
 */
const OPTIONS = [
  { id: "system", name: "Device", hint: "Follows your phone or computer", icon: Smartphone },
  { id: "dark", name: "Dark", hint: "Easier on the eyes at night", icon: Moon },
  { id: "light", name: "Bright", hint: "The classic Student Companion look", icon: Sun },
] as const;

export function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const current = mounted ? theme || "light" : null;

  return (
    <div role="radiogroup" aria-label="Theme" className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {OPTIONS.map((o) => {
        const selected = current === o.id;
        const Icon = o.icon;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => {
              if (selected) return;
              setTheme(o.id);
              toast.success("Theme updated", { description: o.name });
            }}
            className={`flex items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${
              selected ? "border-[#D4AF37] bg-[#FBF7E9]" : "border-[#E8DDB0] hover:bg-[#FBF7E9]"
            }`}
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F4F3F0] text-[#1A1A1A]">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-sm font-medium text-[#1A1A1A]">
                {o.name}
                {selected && <Check className="h-4 w-4 text-[#B8941F]" strokeWidth={3} />}
              </span>
              <span className="block text-xs text-[#6B6355]">{o.hint}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
