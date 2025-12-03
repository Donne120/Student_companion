import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader, Eye, EyeOff, CheckCircle, Sparkles, Target, Users, Lightbulb, MessageCircle, Send, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Demo chat conversations that showcase the platform's capabilities
const demoChats = [
  {
    id: 1,
    question: "How do I apply for a scholarship at ALU?",
    category: "Scholarships"
  },
  {
    id: 2,
    question: "What internship opportunities are available?",
    category: "Careers"
  },
  {
    id: 3,
    question: "What programs does ALU offer?",
    category: "Programs"
  },
  {
    id: 4,
    question: "How can I contact my professor?",
    category: "Faculty"
  },
  {
    id: 5,
    question: "What's the tuition fee at ALU?",
    category: "Fees"
  }
];

// Formatted responses with proper JSX rendering
const demoResponses: { [key: number]: React.ReactNode } = {
  0: (
    <div className="space-y-3">
      <p>Great question! ALU offers several scholarship options:</p>
      <div>
        <p>🎓 <span className="text-brand-gold font-semibold">Merit Scholarships</span> - Up to 100% coverage for exceptional students</p>
        <p>💰 <span className="text-brand-gold font-semibold">Need-Based Aid</span> - Financial support based on your situation</p>
        <p>🌍 <span className="text-brand-gold font-semibold">Regional Scholarships</span> - For students from specific African regions</p>
      </div>
      <p>To apply: Complete your admission application, then submit the Financial Aid form with required documents. <span className="text-yellow-400 font-semibold">Deadline: February 15th!</span></p>
      <p>Would you like me to guide you through the application process?</p>
    </div>
  ),
  1: (
    <div className="space-y-3">
      <p>ALU has partnerships with 200+ top organizations! 🚀</p>
      <div>
        <p><span className="text-brand-gold font-semibold">Tech Companies:</span> Google Africa, Microsoft, Andela</p>
        <p><span className="text-brand-gold font-semibold">Consulting:</span> McKinsey, BCG, Deloitte</p>
        <p><span className="text-brand-gold font-semibold">Social Impact:</span> UN agencies, World Bank, Ashoka</p>
      </div>
      <div>
        <p>✅ All students complete 2-3 internships</p>
        <p>✅ Paid opportunities available</p>
        <p>✅ Global & local placements</p>
      </div>
      <p className="text-green-400 font-semibold">85% of graduates are employed within 6 months!</p>
      <p>Want me to show you current openings?</p>
    </div>
  ),
  2: (
    <div className="space-y-3">
      <p>ALU offers innovative, leadership-focused programs:</p>
      <div>
        <p className="text-brand-gold font-semibold">📚 Undergraduate (4 years):</p>
        <p>• Entrepreneurial Leadership</p>
        <p>• Software Engineering</p>
        <p>• Global Challenges</p>
        <p>• Business & Economics</p>
      </div>
      <div>
        <p className="text-brand-gold font-semibold">🎯 Postgraduate:</p>
        <p>• Executive MBA (18-24 months)</p>
      </div>
      <div>
        <p className="text-brand-gold font-semibold">🏆 What makes us unique:</p>
        <p>• Project-based learning</p>
        <p>• Real-world challenges</p>
        <p>• Mentorship from industry leaders</p>
      </div>
      <p>Which area interests you most?</p>
    </div>
  ),
  3: (
    <div className="space-y-3">
      <p>I can help you connect with faculty! 👨‍🏫</p>
      <div>
        <p className="text-brand-gold font-semibold mb-1">Quick Options:</p>
        <p>📧 Email directly through the faculty directory</p>
        <p>📅 Book office hours via the scheduling system</p>
        <p>💬 Send a message through the student portal</p>
      </div>
      <p className="text-yellow-400">💡 Pro tip: Include your course code and specific question for faster responses!</p>
      <p>Want me to look up a specific professor's contact info or schedule?</p>
    </div>
  ),
  4: (
    <div className="space-y-3">
      <p>Here's the breakdown for ALU Rwanda:</p>
      <div>
        <p>💵 <span className="text-brand-gold font-semibold">Undergraduate:</span> $9,000 - $15,000/year</p>
        <p className="text-gray-400 text-xs">(Includes tuition, accommodation, meals)</p>
      </div>
      <div>
        <p className="text-brand-gold font-semibold mb-1">💳 Payment Options:</p>
        <p>• Full payment (5% discount)</p>
        <p>• Semester payments</p>
        <p>• Monthly installments</p>
        <p>• Scholarship coverage</p>
      </div>
      <p className="text-green-400 font-semibold">🎓 70%+ students receive financial aid!</p>
      <p>Want me to help you explore scholarship options to reduce costs?</p>
    </div>
  )
};

// Typing animation component
const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    <div className="flex gap-1">
      <span className="w-2 h-2 bg-brand-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
      <span className="w-2 h-2 bg-brand-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
      <span className="w-2 h-2 bg-brand-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
    </div>
    <span className="text-xs text-gray-400 ml-2">ALU AI is typing...</span>
  </div>
);

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

  // Demo chat state
  const [activeDemo, setActiveDemo] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  // Handle demo question click
  const handleDemoClick = (index: number) => {
    setActiveDemo(index);
    setShowResponse(false);
    setIsTyping(true);
    
    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false);
      setShowResponse(true);
    }, 1500);
  };

  // Auto-cycle through demos
  useEffect(() => {
    // Start with first demo after 2 seconds
    const initialTimer = setTimeout(() => {
      if (activeDemo === null) {
        handleDemoClick(0);
      }
    }, 2000);

    return () => clearTimeout(initialTimer);
  }, []);

  // Auto-advance to next demo
  useEffect(() => {
    if (showResponse && activeDemo !== null) {
      const advanceTimer = setTimeout(() => {
        const nextIndex = (activeDemo + 1) % demoChats.length;
        handleDemoClick(nextIndex);
      }, 8000); // Show each response for 8 seconds

      return () => clearTimeout(advanceTimer);
    }
  }, [showResponse, activeDemo]);

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

      {/* Right side - Interactive Demo Chat */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-6 relative z-10">
        <div className="max-w-xl w-full space-y-4">
          {/* Header with Large Logo */}
          <div className="text-center mb-4">
            <div className="flex flex-col items-center gap-3 mb-3">
              <img src="/logo.png" alt="ALU" className="h-20 w-auto drop-shadow-2xl" />
              <div>
                <h2 className="text-3xl font-bold text-white">Try It Now!</h2>
                <p className="text-brand-gold text-base font-medium mt-1">
                  See how ALU Student Companion can help you
                </p>
              </div>
            </div>
          </div>

          {/* Demo Chat Window */}
          <div className="bg-[#0A1628]/95 backdrop-blur-xl rounded-2xl border-2 border-brand-gold/40 shadow-2xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-brand-blue via-blue-600 to-blue-700 px-5 py-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-brand-gold/50">
                <img src="/logo.png" alt="ALU AI" className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">ALU Student Companion</h3>
                <p className="text-green-400 text-sm flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></span>
                  Online - Ready to help
                </p>
              </div>
              <div className="ml-auto">
                <span className="px-3 py-1 bg-brand-gold/20 rounded-full text-brand-gold text-xs font-semibold">
                  LIVE DEMO
                </span>
              </div>
            </div>

            {/* Demo Chat Content */}
            <div className="h-[320px] overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-brand-gold/30 scrollbar-track-transparent">
              {/* Current demo conversation */}
              {activeDemo !== null && (
                <>
                  {/* User Question */}
                  <div className="flex justify-end animate-fade-in">
                    <div className="bg-gradient-to-r from-brand-gold to-yellow-500 text-brand-blue-dark px-5 py-3 rounded-2xl rounded-br-md max-w-[85%] shadow-lg">
                      <p className="text-sm font-semibold">{demoChats[activeDemo].question}</p>
                    </div>
                  </div>

                  {/* AI Response */}
                  {isTyping ? (
                    <div className="flex justify-start">
                      <div className="bg-white/10 rounded-2xl rounded-bl-md">
                        <TypingIndicator />
                      </div>
                    </div>
                  ) : showResponse && (
                    <div className="flex justify-start gap-3 animate-fade-in">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-gold/30 to-brand-gold/10 flex items-center justify-center flex-shrink-0 ring-2 ring-brand-gold/30">
                        <img src="/logo.png" alt="AI" className="w-6 h-6" />
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm px-5 py-4 rounded-2xl rounded-bl-md max-w-[85%] border border-white/20 shadow-lg">
                        <div className="text-gray-100 text-sm leading-relaxed">
                          {demoResponses[activeDemo]}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Initial state - show prompt */}
              {activeDemo === null && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-gold/30 to-brand-gold/10 flex items-center justify-center animate-pulse">
                    <MessageCircle className="w-10 h-10 text-brand-gold" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg mb-1">Click a question below</h4>
                    <p className="text-gray-400 text-sm">See how I can help you succeed at ALU!</p>
                  </div>
                </div>
              )}
            </div>

            {/* Demo Input (Visual Only) */}
            <div className="px-5 py-4 border-t border-white/10 bg-gradient-to-r from-white/5 to-white/10">
              <div className="flex items-center gap-3 bg-white/10 rounded-full px-5 py-3 border border-white/20">
                <input
                  type="text"
                  placeholder="Sign up to start chatting..."
                  className="flex-1 bg-transparent text-white text-sm placeholder-gray-400 outline-none"
                  disabled
                />
                <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center cursor-pointer hover:bg-brand-gold-light transition-colors">
                  <Send className="w-5 h-5 text-brand-blue-dark" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Question Buttons */}
          <div className="space-y-3">
            <p className="text-white/80 text-sm text-center font-medium">👆 Click a question to see the AI in action:</p>
            <div className="flex flex-wrap gap-2.5 justify-center">
              {demoChats.map((chat, index) => (
                <button
                  key={chat.id}
                  onClick={() => handleDemoClick(index)}
                  className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border-2 ${
                    activeDemo === index
                      ? 'bg-brand-gold text-brand-blue-dark border-brand-gold shadow-lg shadow-brand-gold/30 scale-105'
                      : 'bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-brand-gold/60 hover:scale-105'
                  }`}
                >
                  {chat.category}
                </button>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center pt-3 space-y-2">
            <p className="text-white text-base">
              <span className="text-brand-gold font-bold">1,000+ students</span> already using ALU Companion
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-300 text-sm">
              <ChevronRight className="w-5 h-5 text-brand-gold animate-bounce" />
              <span>Create your account to unlock full access</span>
              <ChevronRight className="w-5 h-5 text-brand-gold animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
