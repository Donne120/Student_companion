import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, Loader } from "lucide-react";

const SIDE_IMAGE = "/login-hero.png";

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
      toast.success("Welcome back");
      navigate("/chat");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await signupWithGoogle();
      toast.success("Welcome back");
      setTimeout(() => {
        const redirectPath = localStorage.getItem("redirectAfterAuth");
        if (redirectPath) {
          localStorage.removeItem("redirectAfterAuth");
          navigate(redirectPath);
        } else {
          navigate("/chat", { replace: true });
        }
      }, 400);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign-in failed");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#FBFAF6]">
      {/* Form side */}
      <div className="relative flex flex-col px-6 py-10 lg:px-16 lg:py-14">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 brand-glow" />
        <Link
          to="/"
          className="relative inline-flex items-center gap-2 text-sm text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors mb-12"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-full max-w-md animate-rise">
            <div className="flex items-center gap-2.5 mb-10">
              <img
                src="/logo.png"
                alt="ALU Student Companion"
                className="w-12 h-12 rounded-2xl object-cover flex-shrink-0"
              />
              <span className="font-semibold tracking-tight text-[#1A1A1A]">
                ALU Student Companion
              </span>
            </div>

            <h1 className="font-serif text-4xl md:text-5xl text-[#1A1A1A] tracking-tight mb-3">
              Welcome <span className="text-gradient-gold">back</span>
            </h1>
            <p className="text-[#1A1A1A]/70 mb-10">
              Sign in to continue your conversation with the Companion.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#1A1A1A] mb-2"
                >
                  ALU email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.name@alustudent.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-white border-[#E8DDB0] text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-0"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-[#1A1A1A]"
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-[#B8941F] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 bg-white border-[#E8DDB0] text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-0 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#1A1A1A]/50 hover:text-[#1A1A1A]"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#1A1A1A] hover:bg-black text-white font-medium"
                disabled={isLoading || isGoogleLoading}
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E8DDB0]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest">
                  <span className="bg-white px-3 text-[#1A1A1A]/50">or</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 bg-white border-[#E8DDB0] hover:bg-[#FBF7E9] text-[#1A1A1A]"
                onClick={handleGoogleLogin}
                disabled={isLoading || isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    Connecting…
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button>
            </form>

            <p className="mt-10 text-sm text-center text-[#1A1A1A]/70">
              New to the Companion?{" "}
              <Link to="/signup" className="text-[#B8941F] hover:underline font-medium">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Image side */}
      <div className="hidden lg:block relative bg-[#FBF7E9]">
        <img
          src={SIDE_IMAGE}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#1A1A1A]/60 via-[#1A1A1A]/20 to-transparent" />
        <div className="absolute top-0 left-0 h-1 w-full bg-[#D4AF37]" />
        <div className="relative z-10 h-full flex flex-col justify-end p-14 text-white">
          <blockquote className="font-serif text-3xl leading-tight max-w-md">
            "The Companion is the first place I check when I have a question
            about anything at ALU."
          </blockquote>
          <p className="mt-6 text-sm opacity-80">— ALU Student, Class of 2025</p>
        </div>
      </div>
    </div>
  );
}
