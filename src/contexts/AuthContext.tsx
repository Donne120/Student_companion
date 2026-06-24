import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { upsertUserProfile, updateUserProfileFields } from "@/services/userService";

type ProfileUpdate = { name?: string; picture?: string };

type AuthContextType = {
  currentUser: User | null;
  signup: (email: string, password: string, name: string) => Promise<User>;
  signupWithGoogle: () => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  isAuthReady: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const verifyAluEmail = (email: string): boolean =>
  email.endsWith("@alustudent.com") || email.endsWith("@alueducation.com");

const friendlyAuthError = (error: unknown): Error => {
  const code: string = (error as { code?: string })?.code ?? "";
  const message: string = (() => {
    switch (code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/invalid-login-credentials":
        return "Wrong email or password. If you signed up with Google, use the Google button instead.";
      case "auth/user-not-found":
        return "No account found for that email. Create one to get started.";
      case "auth/email-already-in-use":
        return "An account already exists for this email. Try signing in instead.";
      case "auth/weak-password":
        return "Password is too weak. Use at least 8 characters.";
      case "auth/invalid-email":
        return "That doesn't look like a valid email address.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a moment and try again.";
      case "auth/network-request-failed":
        return "Network error. Check your connection and try again.";
      case "auth/popup-closed-by-user":
      case "auth/cancelled-popup-request":
        return "Sign-in was cancelled.";
      case "auth/account-exists-with-different-credential":
        return "This email is linked to a different sign-in method. Try Google sign-in.";
      case "auth/user-disabled":
        return "This account has been disabled. Contact ALU support.";
      case "auth/operation-not-allowed":
        return "Email/password sign-in is not enabled. Contact the administrator.";
      default: {
        const msg = (error as { message?: string })?.message ?? "";
        return msg.startsWith("Please use your ALU") ? msg : "Something went wrong. Please try again.";
      }
    }
  })();
  const out = new Error(message);
  (out as { code?: string }).code = code;
  return out;
};

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  /** Email / password sign-up + Firestore profile write */
  async function signup(email: string, password: string, name: string): Promise<User> {
    if (!verifyAluEmail(email)) {
      throw new Error("Please use your ALU student or staff email");
    }
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      if (name) {
        await updateProfile(user, { displayName: name });
      }
      // Persist to Firestore — non-blocking; errors are logged but don't fail auth
      upsertUserProfile({
        uid: user.uid,
        email: user.email!,
        displayName: name,
        photoURL: user.photoURL ?? "",
        provider: "password",
      }).catch((err) => console.error("[Firestore] upsertUserProfile failed:", err));
      return user;
    } catch (error) {
      throw friendlyAuthError(error);
    }
  }

  /** Google sign-in/sign-up + Firestore profile write */
  async function signupWithGoogle(): Promise<User> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user.email || !verifyAluEmail(user.email)) {
        await signOut(auth);
        throw new Error("Please use your ALU student or staff email");
      }

      upsertUserProfile({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName ?? "",
        photoURL: user.photoURL ?? "",
        provider: "google.com",
      }).catch((err) => console.error("[Firestore] upsertUserProfile failed:", err));

      return user;
    } catch (error) {
      throw friendlyAuthError(error);
    }
  }

  /** Email / password sign-in */
  async function login(email: string, password: string): Promise<User> {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return user;
    } catch (error) {
      throw friendlyAuthError(error);
    }
  }

  async function logout(): Promise<void> {
    return signOut(auth);
  }

  /** Update Firebase Auth profile + Firestore document */
  async function updateUserProfile(updates: ProfileUpdate): Promise<void> {
    if (!auth.currentUser) throw new Error("Not signed in");
    await updateProfile(auth.currentUser, {
      displayName: updates.name ?? auth.currentUser.displayName ?? undefined,
      photoURL: updates.picture ?? auth.currentUser.photoURL ?? undefined,
    });
    await updateUserProfileFields(auth.currentUser.uid, {
      displayName: updates.name ?? auth.currentUser.displayName ?? "",
      photoURL: updates.picture ?? auth.currentUser.photoURL ?? "",
    });
    setCurrentUser({ ...auth.currentUser });
  }

  /** Password reset email */
  async function sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw friendlyAuthError(error);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthReady(true);
    });
    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    signup,
    signupWithGoogle,
    login,
    logout,
    updateProfile: updateUserProfile,
    sendPasswordReset,
    isAuthReady,
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        {/* Brand mark */}
        <img src="/logo.png" alt="ALU Student Companion" className="w-12 h-12 rounded-2xl object-contain" />
        {/* Spinner */}
        <svg
          className="h-6 w-6 animate-spin text-[#D4AF37]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-label="Loading"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <p className="text-sm text-[#1A1A1A]/50 tracking-wide">Loading…</p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
