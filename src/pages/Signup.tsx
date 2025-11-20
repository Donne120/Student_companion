import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader, CheckCircle, BookOpen, Calendar, FileText, Users, GraduationCap, 
         MapPin, Globe, ChevronRight, AlertCircle, Eye, EyeOff, Shield } from "lucide-react";
import { motion } from "framer-motion"; // Add framer-motion for animations
import { Separator } from "@/components/ui/separator"; // Assuming you have this component

// Add validation for ALU student emails
const validateEmail = (email: string) => {
  return email.endsWith('@alustudent.com') || 
         email.endsWith('@alueducation.com');
};

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false); // New state for Google loading
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formStep, setFormStep] = useState(0); // For multi-step animation
  const { signup, signupWithGoogle } = useAuth(); // Add signupWithGoogle
  const navigate = useNavigate();

  // Check password strength
  useEffect(() => {
    // Simple password strength checker
    let strength = 0;
    if (password.length > 0) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  }, [password]);

  // Animate first step appearance
  useEffect(() => {
    const timer = setTimeout(() => {
      setFormStep(1);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!validateEmail(email)) {
      toast.error("Please use your ALU student email");
      setIsLoading(false);
      return;
    }

    try {
      await signup(email, password, name);
      toast.success("Account created successfully!");
      
      // Check if there's a saved redirect path
      const redirectPath = localStorage.getItem("redirectAfterAuth");
      if (redirectPath) {
        localStorage.removeItem("redirectAfterAuth");
        navigate(redirectPath);
      } else {
        navigate("/"); // Default redirect to home
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    console.log("Starting Google signup...");
    
    try {
      await signupWithGoogle();
      console.log("Google signup successful!");
      toast.success("Account created successfully with Google!");
      
      // Force a small delay to ensure the auth state updates before navigation
      setTimeout(() => {
        // Check if there's a saved redirect path
        const redirectPath = localStorage.getItem("redirectAfterAuth");
        console.log("Redirecting to:", redirectPath || "/");
        
        if (redirectPath) {
          localStorage.removeItem("redirectAfterAuth");
          navigate(redirectPath);
        } else {
          // Navigate to the root path
          navigate("/", { replace: true });
        }
      }, 750); // Increased delay to ensure auth state updates
    } catch (error: unknown) {
      console.error("Google signup failed:", error);
      
      // More specific error handling
      if (error && typeof error === 'object' && 'code' in error && error.code === "auth/popup-closed-by-user") {
        toast.error("Sign-up canceled. You closed the Google login window.");
      } else if (error && typeof error === 'object' && 'code' in error && error.code === "auth/popup-blocked") {
        toast.error("Pop-up was blocked. Please allow pop-ups for this website.");
      } else if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.includes('ALU')) {
        toast.error("Please use your ALU student or staff email");
      } else {
        toast.error(error && typeof error === 'object' && 'message' in error 
          ? String(error.message) 
          : "Failed to sign up with Google");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-[#0F4C81]/90 to-[#0F4C81]/70">
      {/* Hero background with ALU campus image - enhanced with overlay blend */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F4C81]/90 to-[#0F4C81]/70 mix-blend-overlay" />
        <img 
          src="https://www.alueducation.com/wp-content/uploads/2023/01/alu-rwanda-campus.jpg" 
          alt="ALU Campus" 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-[#0F4C81]/20 backdrop-blur-[1px]" />
      </div>
      
      <div className="relative z-10 flex-1 flex items-center justify-center py-12">
        {/* Container for both columns with reduced gap */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container flex flex-col lg:flex-row items-center lg:items-stretch max-w-6xl mx-auto px-4"
        >
          {/* Left side - Value proposition - with enhancements */}
          <div className="hidden lg:flex lg:w-1/2 flex-col justify-center pr-8 p-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center space-x-3 mb-8">
                <div className="bg-white p-2 rounded-lg shadow-md">
                  <img 
                    src="https://www.alueducation.com/wp-content/uploads/2021/11/ALU-logo.png" 
                    alt="ALU Logo" 
                    className="h-8" 
                  />
                </div>
                <h1 className="text-2xl font-bold text-white">Student Companion</h1>
              </div>
              
              <div>
                <h2 className="text-4xl font-bold text-white leading-tight tracking-tight">
                  Your AI-powered guide <br />through the ALU journey
                </h2>
                <p className="mt-6 text-white/90 text-lg max-w-lg leading-relaxed">
                  Join thousands of ALU students who use the Student Companion 
                  to navigate campus life, academic requirements, and university resources.
                </p>
                
                <div className="mt-8 grid grid-cols-1 gap-4">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="flex items-start space-x-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm"
                  >
                    <div className="mt-1 bg-[#FFC72C]/20 p-2 rounded-full">
                      <CheckCircle className="h-5 w-5 text-[#FFC72C]" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-base">24/7 Instant Answers</h3>
                      <p className="text-white/80 text-sm mt-1">Get immediate responses to your questions about ALU policies and procedures</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    className="flex items-start space-x-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm"
                  >
                    <div className="mt-1 bg-[#E94E1B]/20 p-2 rounded-full">
                      <CheckCircle className="h-5 w-5 text-[#E94E1B]" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-base">Academic Support</h3>
                      <p className="text-white/80 text-sm mt-1">Navigate course requirements, graduation pathways, and learning resources</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 }}
                    className="flex items-start space-x-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm"
                  >
                    <div className="mt-1 bg-white/20 p-2 rounded-full">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-base">Campus Navigation</h3>
                      <p className="text-white/80 text-sm mt-1">Find the right contacts, departments and support services across ALU</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="mt-10 p-4 bg-white/10 rounded-xl backdrop-blur-sm"
            >
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-4">
                  <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-md" />
                  <img src="https://randomuser.me/api/portraits/men/86.jpg" alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-md" />
                  <img src="https://randomuser.me/api/portraits/women/22.jpg" alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-md" />
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-[#E94E1B] flex items-center justify-center text-white font-medium text-sm shadow-md">
                    2K+
                  </div>
                </div>
                <p className="text-white/90 text-sm">
                  <span className="font-semibold">Trusted by 2,000+ students</span><br/>
                  Ease the hard things we do with student companion
                </p>
              </div>
            </motion.div>
          </div>
          
          {/* Right side - Sign up form - enhanced with animation and design */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full lg:w-1/2 p-4"
          >
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 mx-auto border border-gray-100">
              <div className="text-center lg:text-left mb-6">
                <h2 className="text-2xl font-bold text-[#0F4C81]">
                  Create your account
                </h2>
                <p className="text-gray-600 mt-2 text-sm">
                  Join the ALU Student Companion community
                </p>
              </div>
              
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    ALU Email Address
                  </label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.name@alustudent.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-gray-300 focus:ring-[#0F4C81] focus:border-[#0F4C81] h-11 pl-3 pr-10 text-sm rounded-md shadow-sm"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <GraduationCap className={`h-4 w-4 ${validateEmail(email) ? 'text-green-500' : 'text-gray-400'}`} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Must be a valid ALU student or staff email
                  </p>
                </div>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="As it appears on your student ID"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="border-gray-300 focus:ring-[#0F4C81] focus:border-[#0F4C81] h-11 text-sm rounded-md shadow-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a secure password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-gray-300 focus:ring-[#0F4C81] focus:border-[#0F4C81] h-11 pr-10 text-sm rounded-md shadow-sm"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password strength indicator */}
                  {password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex space-x-1 mb-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div 
                            key={level}
                            className={`h-1.5 flex-1 rounded-full ${
                              passwordStrength >= level 
                                ? level <= 2 
                                  ? 'bg-red-400' 
                                  : level <= 3 
                                    ? 'bg-yellow-400' 
                                    : 'bg-green-400'
                                : 'bg-gray-200'
                            }`}
                          ></div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Shield className="h-3 w-3 mr-1" />
                        {passwordStrength < 3 ? 'Weak password' : passwordStrength < 5 ? 'Good password' : 'Strong password'}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1.5">
                    Minimum 8 characters with letters and numbers
                  </p>
                </div>
                
                <div className="flex items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="h-4 w-4 text-[#0F4C81] focus:ring-[#0F4C81] border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                    I agree to the{" "}
                    <a href="/terms" className="text-[#0F4C81] hover:underline font-medium">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="/privacy" className="text-[#0F4C81] hover:underline font-medium">
                      Privacy Policy
                    </a>
                  </label>
                </div>
                
                <Button
                  type="submit"
                  className="w-full h-12 bg-[#0F4C81] hover:bg-[#0F4C81]/90 text-white text-base rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading || isGoogleLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>Creating your account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span>Create Account</span>
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </div>
                  )}
                </Button>
              </form>
              
              {/* Add separator and Google sign-up option */}
              <div className="mt-6 relative">
                <Separator className="my-4" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-white px-2 text-sm text-gray-500">
                    OR
                  </span>
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full mt-4 h-12 border-gray-300 hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-2 text-base rounded-lg shadow-sm transition-all duration-200"
                onClick={handleGoogleSignup}
                disabled={isLoading || isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Connecting to Google...</span>
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
                    <span>Sign up with Google</span>
                  </>
                )}
              </Button>
              
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  Already have an account?{" "}
                  <Link to="/login" className="text-[#E94E1B] hover:underline font-medium">
                    Sign in instead
                  </Link>
                </p>
              </div>
              
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-center text-xs uppercase text-gray-500 font-semibold tracking-wider mb-4">
                  What You'll Get Access To
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-lg border border-gray-200 bg-gray-50 flex items-center hover:bg-gray-100 transition-colors">
                    <BookOpen className="h-4 w-4 text-[#0F4C81] mr-2" />
                    <span className="text-xs text-gray-700 font-medium">Course Resources</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-gray-200 bg-gray-50 flex items-center hover:bg-gray-100 transition-colors">
                    <Calendar className="h-4 w-4 text-[#0F4C81] mr-2" />
                    <span className="text-xs text-gray-700 font-medium">Important Dates</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-gray-200 bg-gray-50 flex items-center hover:bg-gray-100 transition-colors">
                    <FileText className="h-4 w-4 text-[#0F4C81] mr-2" />
                    <span className="text-xs text-gray-700 font-medium">ALU Policies</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-gray-200 bg-gray-50 flex items-center hover:bg-gray-100 transition-colors">
                    <Users className="h-4 w-4 text-[#0F4C81] mr-2" />
                    <span className="text-xs text-gray-700 font-medium">Department Contacts</span>
                  </div>
                </div>
                
                <div className="mt-5 px-4 py-3 bg-[#FFC72C]/10 rounded-lg border border-[#FFC72C]/30 flex items-center">
                  <GraduationCap className="h-5 w-5 text-[#E94E1B] mr-3 flex-shrink-0" />
                  <p className="text-xs text-gray-700">
                    <span className="font-medium">Student exclusive:</span> Access is only available to verified ALU students and staff.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      <footer className="relative z-10 bg-[#0F4C81] text-white py-3 px-6 shadow-md">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-xs">
          <div className="flex items-center space-x-6 mb-3 md:mb-0">
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1.5" />
              <span>Kigali / Rwanda Campuses</span>
            </div>
            <div className="flex items-center">
              <Globe className="h-3 w-3 mr-1.5" />
              <span>alueducation.com</span>
            </div>
          </div>
          <div className="flex space-x-6">
            <Link to="/about" className="hover:underline transition-all">About</Link>
            <Link to="/support" className="hover:underline transition-all">Support</Link>
            <Link to="/privacy" className="hover:underline transition-all">Privacy</Link>
            <Link to="/terms" className="hover:underline transition-all">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}