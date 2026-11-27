import { useEffect, useState } from "react";
import { GraduationCap, BookOpen, Briefcase } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { viewAsOrgId } from "@/lib/viewAs";
import { fetchRole, saveRole, ROLE_OPTIONS, type Role } from "@/lib/role";

const ICONS: Record<Role, typeof BookOpen> = { student: BookOpen, alumni: GraduationCap, staff: Briefcase };
const ASKED = "sc_role_asked:";

/**
 * A one-time question after sign-in: "I am a current student / alumni /
 * staff". Shown only when the person's university email doesn't already
 * say (the backend decides: GET /api/me/role needs_choice), never to
 * parents, and never while a platform admin is viewing as a university.
 * "Not now" hides it for this browser session; Settings can change it.
 */
export const RoleQuestion = () => {
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState<Role | null>(null);
  const email = (currentUser?.email || "").toLowerCase();

  useEffect(() => {
    if (!email || viewAsOrgId()) return;
    try {
      if (sessionStorage.getItem(ASKED + email)) return;
    } catch {
      /* storage unavailable: ask anyway */
    }
    let cancelled = false;
    fetchRole().then((s) => {
      if (!cancelled && s?.needs_choice) setOpen(true);
    });
    return () => {
      cancelled = true;
    };
  }, [email]);

  const close = () => {
    try {
      sessionStorage.setItem(ASKED + email, "1");
    } catch {
      /* fine */
    }
    setOpen(false);
  };

  const choose = async (role: Role) => {
    setSaving(role);
    const saved = await saveRole(role);
    setSaving(null);
    if (saved) close();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Which describes you best?</DialogTitle>
          <DialogDescription>
            So your answers fit you: alumni get alumni services, staff get answers for the situation they describe.
            You can change this later in Settings.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 pt-2">
          {ROLE_OPTIONS.map((o) => {
            const Icon = ICONS[o.id];
            return (
              <button
                key={o.id}
                type="button"
                disabled={saving !== null}
                onClick={() => choose(o.id)}
                className="flex items-center gap-3 rounded-xl border border-[#E8DDB0] bg-white px-4 py-3 text-left transition-colors hover:bg-[#FBF7E9] disabled:opacity-60"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FBF7E9] text-[#A8832F]">
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block font-medium text-[#1C1B19]">{saving === o.id ? "Saving…" : o.name}</span>
                  <span className="block text-sm text-[#6B6559]">{o.hint}</span>
                </span>
              </button>
            );
          })}
        </div>
        <button type="button" onClick={close} className="mx-auto mt-1 text-sm text-[#6B6559] hover:text-[#1C1B19]">
          Not now
        </button>
      </DialogContent>
    </Dialog>
  );
};
