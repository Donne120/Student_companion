import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { fetchRole, saveRole, ROLE_OPTIONS, type Role, type RoleStatus } from "@/lib/role";

/**
 * "I am a…" in Settings, for people whose university email doesn't say
 * whether they are a student, alumni or staff (GET /api/me/role).
 * Hidden for everyone else: their email already says who they are.
 */
export function RoleSettings() {
  const [status, setStatus] = useState<RoleStatus | null | undefined>(undefined);
  const [saving, setSaving] = useState<Role | null>(null);

  useEffect(() => {
    fetchRole().then(setStatus);
  }, []);

  if (status === undefined) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (status === null) return <p className="text-sm text-muted-foreground">This isn't available right now. Please try again later.</p>;
  if (!status.can_choose) {
    return <p className="text-sm text-muted-foreground">Your university email already shows who you are, so there's nothing to set.</p>;
  }

  const choose = async (role: Role) => {
    setSaving(role);
    const saved = await saveRole(role);
    setSaving(null);
    if (saved) {
      setStatus(saved);
      toast.success("Saved. Your answers will fit this from now on.");
    } else {
      toast.error("Couldn't save that. Please try again.");
    }
  };

  return (
    <div role="radiogroup" aria-label="I am a" className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {ROLE_OPTIONS.map((o) => {
        const selected = status.role === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={saving !== null}
            onClick={() => choose(o.id)}
            className={`flex items-start justify-between gap-2 rounded-xl border px-4 py-3 text-left transition-colors ${
              selected ? "border-[#D4AF37] bg-[#FBF7E9]" : "border-border hover:bg-muted/50"
            }`}
          >
            <span>
              <span className="block font-medium">{saving === o.id ? "Saving…" : o.name}</span>
              <span className="block text-sm text-muted-foreground">{o.hint}</span>
            </span>
            {selected && <Check className="h-4 w-4 text-[#A8832F] mt-1" />}
          </button>
        );
      })}
    </div>
  );
}
