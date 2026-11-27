import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";

/**
 * "Sign out", asked once before it happens (a stray tap shouldn't log anyone
 * out). `menu` fits the chat's side menu; `row` is a full-width button for the
 * bottom of Profile and Settings, where people look for it on a phone.
 */
export function SignOutButton({ variant = "row", collapsed = false }: { variant?: "menu" | "row"; collapsed?: boolean }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const signOut = async () => {
    setBusy(true);
    try {
      await logout();
      toast.success("Signed out");
      navigate("/", { replace: true });
    } catch {
      toast.error("Couldn't sign out. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const trigger =
    variant === "menu" ? (
      <button
        className={`w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-lg text-[#1C1B19]/70 hover:bg-[#F4F3F0] hover:text-[#1C1B19] text-sm transition-colors ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <LogOut className="h-4 w-4 flex-shrink-0" />
        {!collapsed && <span>Sign out</span>}
      </button>
    ) : (
      <button className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border border-[#E8DDB0] bg-white text-[#B42318] font-medium hover:bg-[#FEF3F2] transition-colors">
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Sign out?</AlertDialogTitle>
          <AlertDialogDescription>
            Your conversations stay saved. Sign back in any time with your university email.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={signOut} disabled={busy} className="bg-[#1A1A1A] hover:bg-black">
            Sign out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
