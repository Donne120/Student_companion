import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader, Eye, EyeOff } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, signupWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Logged in successfully!");
      navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    
    try {
      console.log("Opening Google sign-in popup...");
      await signupWithGoogle();
      console.log("Google login successful!");
      toast.success("Logged in successfully with Google!");
      
      // Force a small delay to ensure the auth state updates before navigation
      setTimeout(() => {
        // Check if there's a saved redirect path
        const redirectPath = localStorage.getItem("redirectAfterAuth");
        console.log("Redirecting to:", redirectPath || "/");
        
        if (redirectPath) {
          localStorage.removeItem("redirectAfterAuth");
          navigate(redirectPath);
        } else {
          // Navigate to the root path which is set up in your routes
          navigate("/", { replace: true });
        }
      }, 750); // Increased delay to ensure auth state updates
    } catch (error: unknown) {
      // Error handling...
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-gradient">
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/10">
        <div className="text-center">
          <div className="flex items-center justify-center mx-auto mb-6">
            <img 
              src="/logo.png" 
              alt="ALU Student Companion" 
              className="h-20 w-auto object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome Back
          </h2>
            <p className="text-gray-300 mb-6">
              Sign in to continue your journey with the ALU Student Companion
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-white mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.name@alustudent.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-[#003366]/50 border-[#FF0033]/20 text-white placeholder:text-gray-400 focus-visible:ring-[#FF0033]/50"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-[#003366]/50 border-[#FF0033]/20 text-white placeholder:text-gray-400 focus-visible:ring-[#FF0033]/50 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-brand-gradient-gold hover:opacity-90 text-brand-blue-dark font-semibold"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
            
            {/* Separator and Google sign-in */}
            <div className="relative">
              <Separator className="my-4 bg-gray-600" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="px-2 text-gray-400 text-sm bg-[#2A2F4A]">
                  OR
                </span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 bg-transparent border border-gray-600 hover:bg-white/5 text-white flex items-center justify-center gap-2"
              onClick={handleGoogleLogin}
              disabled={isLoading || isGoogleLoading}
            >
              {isGoogleLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Signing in with Google...</span>
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </Button>
            
            <div className="text-center space-y-4">
              <p className="text-white">
                Don't have an account?{" "}
                <Link to="/signup" className="text-[#FF0033] hover:underline">
                  Sign up
                </Link>
              </p>
              <div className="text-sm text-gray-400">
                <p>Need assistance with tasks, scheduling, or resources?</p>
                <p>The ALU Student Companion chat is ready to help once you log in.</p>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div className="py-4 text-center text-gray-400 text-sm">
        <p>African Leadership University Student Companion</p>
      </div>
    </div>
  );
}
