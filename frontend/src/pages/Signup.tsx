import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader, Eye, EyeOff, CheckCircle, Sparkles, Target, Users, Lightbulb } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Validate ALU student emails
const validateEmail = (email: string) => {
  return email.endsWith('@alustudent.com') || 
         email.endsWith('@alueducation.com');
};

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { signup, signupWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Check password strength
  useEffect(() => {
    let strength = 0;
    if (password.length > 0) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  }, [password]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 3) return "Medium";
    return "Strong";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!validateEmail(email)) {
      toast.error("Please use your ALU student email (@alustudent.com or @alueducation.com)");
      setIsLoading(false);
      return;
    }

    if (passwordStrength < 3) {
      toast.error("Please use a stronger password (at least 8 characters with uppercase, numbers)");
      setIsLoading(false);
      return;
    }

    try {
      await signup(email, password, name);
      toast.success("Welcome to ALU Student Companion!");
      
      const redirectPath = localStorage.getItem("redirectAfterAuth");
      if (redirectPath) {
        localStorage.removeItem("redirectAfterAuth");
        navigate(redirectPath);
      } else {
        navigate("/");
      }
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
      toast.success("Welcome to ALU Student Companion!");
      
      setTimeout(() => {
        const redirectPath = localStorage.getItem("redirectAfterAuth");
        if (redirectPath) {
          localStorage.removeItem("redirectAfterAuth");
          navigate(redirectPath);
        } else {
          navigate("/", { replace: true });
        }
      }, 750);
    } catch (error: unknown) {
      console.error("Google signup error:", error);
      toast.error("Failed to sign up with Google");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#1e40af] relative overflow-hidden">
      {/* Logo watermark background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <img 
          src="/logo.png" 
          alt="ALU Background" 
          className="w-[800px] h-[800px] object-contain opacity-[0.03] select-none"
        />
      </div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-brand-gold/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-3xl"></div>
      </div>

      {/* Left side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
            {/* Mobile Logo */}
            <div className="lg:hidden flex flex-col items-center mb-8">
              <img 
                src="/logo.png" 
                alt="ALU Logo" 
                className="h-16 w-auto object-contain mb-4"
              />
              <h2 className="text-2xl font-bold text-brand-blue">
                Student Companion
              </h2>
              <p className="text-brand-gold text-sm font-medium">
                African Leadership University
              </p>
            </div>

            {/* Welcome Text */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-brand-blue mb-2">
                Join ALU Student Companion
              </h2>
              <p className="text-gray-600">
                Begin your leadership journey today
              </p>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 bg-white border-gray-300 focus:border-brand-blue focus:ring-brand-blue"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  ALU Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.name@alustudent.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-white border-gray-300 focus:border-brand-blue focus:ring-brand-blue"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use your @alustudent.com or @alueducation.com email
                </p>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 bg-white border-gray-300 focus:border-brand-blue focus:ring-brand-blue pr-12"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            level <= passwordStrength ? getPasswordStrengthColor() : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${
                      passwordStrength <= 2 ? "text-red-600" :
                      passwordStrength <= 3 ? "text-yellow-600" :
                      "text-green-600"
                    }`}>
                      Password strength: {getPasswordStrengthText()}
                    </p>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-brand-blue to-blue-600 hover:from-brand-blue-dark hover:to-blue-700 text-white font-semibold text-base shadow-lg"
                disabled={isLoading || isGoogleLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>

              {/* Separator */}
              <div className="relative my-6">
                <Separator className="bg-gray-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="px-4 text-sm text-gray-500 bg-white">
                    Or sign up with
                  </span>
                </div>
              </div>

              {/* Google Sign Up */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium"
                onClick={handleGoogleSignup}
                disabled={isLoading || isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Signing up...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                    </svg>
                    <span>Sign up with Google</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Terms & Sign In Link */}
            <div className="mt-6 space-y-4">
              <p className="text-xs text-gray-500 text-center">
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </p>
              <p className="text-center text-gray-600">
                Already have an account?{" "}
                <Link 
                  to="/login" 
                  className="text-brand-blue hover:text-brand-blue-dark font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-white/80 text-sm mt-6">
            © 2024 African Leadership University Rwanda
          </p>
        </div>
      </div>

      {/* Right side - ALU Values & Mission */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative z-10">
        <div className="max-w-xl space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-8">
            <img 
              src="/logo.png" 
              alt="ALU Logo" 
              className="h-20 w-auto object-contain drop-shadow-2xl"
            />
            <div>
              <h1 className="text-4xl font-bold text-white">
                Student Companion
              </h1>
              <p className="text-brand-gold text-lg font-medium">
                African Leadership University
              </p>
            </div>
          </div>

          {/* ALU Values */}
          <div className="space-y-6 text-white">
            <div className="flex items-start gap-4 p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <Target className="w-8 h-8 text-brand-gold flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
                <p className="text-gray-200 leading-relaxed">
                  To transform Africa by developing 3 million ethical and entrepreneurial leaders who will shape the continent's future by 2060.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <Users className="w-8 h-8 text-brand-gold flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Leadership Excellence</h3>
                <p className="text-gray-200 leading-relaxed">
                  Join a community of changemakers committed to solving Africa's greatest challenges through innovation, entrepreneurship, and ethical leadership.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <Lightbulb className="w-8 h-8 text-brand-gold flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Innovation & Impact</h3>
                <p className="text-gray-200 leading-relaxed">
                  Access cutting-edge resources, mentorship, and opportunities designed to accelerate your growth and maximize your impact on the world.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <CheckCircle className="w-8 h-8 text-brand-gold flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Your Success Partner</h3>
                <ul className="text-gray-200 space-y-2">
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-gold" />
                    AI-powered academic assistance
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-gold" />
                    Career & internship opportunities
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-gold" />
                    Faculty & staff connections
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-gold" />
                    24/7 support & resources
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
