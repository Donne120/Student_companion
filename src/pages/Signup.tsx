import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader, ShieldCheck } from "lucide-react";

const SIDE_IMAGE = "/signup-hero.png";

const validateEmail = (email: string) =>
  email.endsWith("@alustudent.com") || email.endsWith("@alueducation.com");

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signup, signupWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let strength = 0;
    if (password.length > 0) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  }, [password]);

  const strengthLabel =
    passwordStrength === 0
      ? ""
      : passwordStrength < 3
      ? "Weak"
      : passwordStrength < 5
      ? "Good"
      : "Strong";
  const strengthColor =
    passwordStrength < 3 ? "bg-red-400" : passwordStrength < 5 ? "bg-amber-400" : "bg-emerald-500";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      toast.error("Please use your ALU student or staff email");
      return;
    }
    setIsLoading(true);
    try {
      await signup(email, password, name);
      toast.success("Account created");
      navigate("/chat");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      await signupWithGoogle();
      toast.success("Account created");
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
      const msg = error instanceof Error ? error.message : "Failed to sign up with Google";
      toast.error(msg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Form side */}
      <div className="flex flex-col px-6 py-10 lg:px-16 lg:py-14 order-2 lg:order-1">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors mb-12"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="flex items-center gap-2 mb-10">
              <div className="w-8 h-8 rounded-md bg-[#D4AF37] flex items-center justify-center text-[#1A1A1A] font-bold text-sm">
                A
              </div>
              <span className="font-semibold tracking-tight text-[#1A1A1A]">
                ALU Student Companion
              </span>
            </div>

            <h1 className="font-serif text-4xl text-[#1A1A1A] tracking-tight mb-3">
              Create your account
            </h1>
            <p className="text-[#1A1A1A]/70 mb-10">
              Free for every ALU student. Takes less than a minute.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#1A1A1A] mb-2">
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
                <p className="mt-2 text-xs text-[#1A1A1A]/50">
                  Must end in @alustudent.com or @alueducation.com
                </p>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  Full name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="As it appears on your student ID"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11 bg-white border-[#E8DDB0] text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-0"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
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
                {password.length > 0 && (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            passwordStrength >= level ? strengthColor : "bg-[#E8DDB0]"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-[#1A1A1A]/60 min-w-[3rem]">{strengthLabel}</span>
                  </div>
                )}
              </div>

              <label className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 rounded border-[#E8DDB0] text-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <span className="text-sm text-[#1A1A1A]/70">
                  I agree to the{" "}
                  <a href="/terms" className="text-[#B8941F] hover:underline">
                    Terms
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-[#B8941F] hover:underline">
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>

              <Button
                type="submit"
                className="w-full h-12 bg-[#1A1A1A] hover:bg-black text-white font-medium"
                disabled={isLoading || isGoogleLoading}
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    Creating your account…
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
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
                onClick={handleGoogleSignup}
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
              Already have an account?{" "}
              <Link to="/login" className="text-[#B8941F] hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Image side */}
      <div className="hidden lg:block relative bg-[#FBF7E9] order-1 lg:order-2">
        <img src={SIDE_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-bl from-[#1A1A1A]/60 via-[#1A1A1A]/20 to-transparent" />
        <div className="absolute top-0 left-0 h-1 w-full bg-[#D4AF37]" />
        <div className="relative z-10 h-full flex flex-col justify-end p-14 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur border border-white/20 text-xs font-medium mb-6 w-fit">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified ALU students only
          </div>
          <h2 className="font-serif text-4xl leading-tight max-w-md">
            Join thousands of students already exploring with the Companion.
          </h2>
          <p className="mt-6 text-sm opacity-80 max-w-md">
            Built on ALU's own knowledge — your answers come from policies,
            handbooks, and resources made for you.
          </p>
        </div>
      </div>
    </div>
  );
}
