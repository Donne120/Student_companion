import React, { createContext, useContext, useEffect, useState } from "react";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

type User = FirebaseAuthTypes.User;

type AuthContextType = {
  user: User | null;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const ALU_DOMAINS = ["@alustudent.com", "@alueducation.com"];

const verifyAluEmail = (email: string) =>
  ALU_DOMAINS.some((d) => email.endsWith(d));

const roleFromEmail = (email: string) =>
  email.endsWith("@alueducation.com") ? "staff" : "student";

const upsertProfile = async (user: User, name?: string) => {
  try {
    const ref = firestore().collection("users").doc(user.uid);
    const snap = await ref.get();
    const providerData = user.providerData[0];
    const isGoogle = providerData?.providerId === "google.com";

    const data: Record<string, unknown> = {
      uid: user.uid,
      email: user.email ?? "",
      displayName: name ?? user.displayName ?? "",
      photoURL: user.photoURL ?? "",
      provider: isGoogle ? "google.com" : "password",
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    if (!snap.exists) {
      data.role = roleFromEmail(user.email ?? "");
      data.createdAt = firestore.FieldValue.serverTimestamp();
    }

    await ref.set(data, { merge: true });
  } catch (err) {
    console.error("[Firestore] upsertProfile failed:", err);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const unsub = auth().onAuthStateChanged((u) => {
      setUser(u);
      setIsReady(true);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    await auth().signInWithEmailAndPassword(email, password);
  };

  const signup = async (email: string, password: string, name: string) => {
    if (!verifyAluEmail(email)) {
      throw new Error("Please use your ALU student or staff email (@alustudent.com or @alueducation.com)");
    }
    const { user: newUser } = await auth().createUserWithEmailAndPassword(email, password);
    await newUser.updateProfile({ displayName: name });
    await upsertProfile(newUser, name);
  };

  const logout = async () => {
    await auth().signOut();
  };

  const sendPasswordReset = async (email: string) => {
    await auth().sendPasswordResetEmail(email);
  };

  return (
    <AuthContext.Provider value={{ user, isReady, login, signup, logout, sendPasswordReset }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
