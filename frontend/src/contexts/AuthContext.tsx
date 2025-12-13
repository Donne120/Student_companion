import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User, 
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

type AuthContextType = {
  currentUser: User | null;
  signup: (email: string, password: string, name: string) => Promise<User>;
  signupWithGoogle: () => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  // TEMPORARILY DISABLED - Mock user for testing without authentication
  const mockUser = {
    uid: 'demo-user-123',
    email: 'demo@alustudent.com',
    displayName: 'Demo User',
    emailVerified: true,
  } as User;
  
  const [currentUser, setCurrentUser] = useState<User | null>(mockUser);
  const [isAuthReady, setIsAuthReady] = useState(true);

  // Verify ALU email
  const verifyAluEmail = (email: string): boolean => {
    return email.endsWith('@alustudent.com') || email.endsWith('@alueducation.com');
  };

  // Email/Password signup
  async function signup(email: string, password: string, name: string): Promise<User> {
    // Validate ALU email
    if (!verifyAluEmail(email)) {
      throw new Error("Please use your ALU student or staff email");
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Add display name
      if (userCredential.user && name) {
        await updateProfile(userCredential.user, { displayName: name });
      }
      
      return userCredential.user;
    } catch (error: any) {
      console.error("Signup error:", error);
      throw error;
    }
  }

  // Google signup/login
  async function signupWithGoogle(): Promise<User> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if email is ALU email
      if (!user.email || !verifyAluEmail(user.email)) {
        // Sign out the user since they don't have ALU email
        await signOut(auth);
        throw new Error("Please use your ALU student or staff email");
      }
      
      return user;
    } catch (error: any) {
      console.error("Google auth error:", error);
      throw error;
    }
  }

  // Email/Password login
  async function login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // Logout
  async function logout(): Promise<void> {
    return signOut(auth);
  }

  // Effect to listen to auth state changes
  // TEMPORARILY DISABLED FOR TESTING
  useEffect(() => {
    // const unsubscribe = onAuthStateChanged(auth, (user) => {
    //   console.log("Auth state changed:", user ? `User ${user.email} logged in` : "User logged out");
    //   setCurrentUser(user);
    //   setIsAuthReady(true);
    // });

    // return unsubscribe;
    
    // Mock auth is already ready
    console.log("Auth bypassed - using mock user");
  }, []);

  const value = {
    currentUser,
    signup,
    signupWithGoogle,
    login,
    logout,
    isAuthReady
  };

  // Only render children after we've checked auth state
  if (!isAuthReady) {
    return <div>Loading authentication...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
