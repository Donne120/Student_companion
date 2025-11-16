import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, UserPlus, LogIn, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [showContinuePrompt, setShowContinuePrompt] = useState(false);
  
  // After 5 seconds, show the continue prompt
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContinuePrompt(true);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F4C81] to-[#0F4C81]/90 text-white">
      <div className="container mx-auto pt-20 px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-8">
            <img 
              src="/logo.png" 
              alt="ALU Student Companion" 
              className="h-24 md:h-32 w-auto object-contain"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            ALU Student Companion
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto">
            Your AI guide to navigating ALU resources, policies, and student life
          </p>
        </div>
        
        <div className="flex flex-col items-center justify-center mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Button 
              className="bg-white text-[#0F4C81] hover:bg-white/90 text-lg px-8 py-6 h-auto rounded-xl flex items-center gap-2"
              onClick={() => navigate("/signup")}
            >
              <UserPlus className="h-5 w-5" />
              Sign Up with ALU Email
            </Button>
            
            <Button 
              variant="outline"
              className="border-white text-white hover:bg-white/20 text-lg px-8 py-6 h-auto rounded-xl flex items-center gap-2"
              onClick={() => navigate("/login")}
            >
              <LogIn className="h-5 w-5" />
              Log In to Your Account
            </Button>
          </div>
          
          {showContinuePrompt && (
            <div className="mt-12 text-center animate-fadeIn">
              <p className="mb-4 text-white/80 text-lg">Already a part of ALU family?</p>
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/10 text-lg px-8 py-4 h-auto rounded-xl flex items-center gap-2"
                onClick={() => navigate("/")}
              >
                <GraduationCap className="h-5 w-5" />
                Continue to ALU Resources
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="mt-24 text-center">
          <h2 className="text-2xl font-semibold mb-8">What you can do with ALU Companion</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 p-6 rounded-lg">
              <h3 className="text-xl font-medium mb-3">Find Academic Resources</h3>
              <p className="text-white/80">Access course materials, grading policies, and academic calendars</p>
            </div>
            <div className="bg-white/10 p-6 rounded-lg">
              <h3 className="text-xl font-medium mb-3">Navigate Campus Life</h3>
              <p className="text-white/80">Discover student activities, housing information, and campus services</p>
            </div>
            <div className="bg-white/10 p-6 rounded-lg">
              <h3 className="text-xl font-medium mb-3">Get Quick Answers</h3>
              <p className="text-white/80">Ask questions about ALU policies, procedures, and opportunities</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add this to your global CSS for the fade-in animation
// In your global.css or similar file:
// @keyframes fadeIn {
//   from { opacity: 0; }
//   to { opacity: 1; }
// }
// .animate-fadeIn {
//   animation: fadeIn 0.5s ease-in;
// }