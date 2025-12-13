
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, HeadsetIcon, Mail, School, Users } from "lucide-react";
import { Department } from "./types";

interface InitialStageProps {
  onDepartmentSelect: (dept: Department) => void;
  onStageChange: (stage: "human-chat" | "email-inquiry") => void;
}

export const InitialStage: React.FC<InitialStageProps> = ({ 
  onDepartmentSelect, 
  onStageChange 
}) => {
  return (
    <div className="space-y-4">
      <p className="text-center text-sm">How can we assist you today?</p>
      <div className="grid grid-cols-1 gap-2">
        <Button 
          variant="outline" 
          className="flex justify-between"
          onClick={() => onDepartmentSelect("learning-coach")}
        >
          <span className="flex items-center gap-2">
            <Users size={16} />
            Learning Coach
          </span>
          <ArrowRight size={16} />
        </Button>
        <Button 
          variant="outline" 
          className="flex justify-between"
          onClick={() => onDepartmentSelect("department")}
        >
          <span className="flex items-center gap-2">
            <School size={16} />
            Academic Department
          </span>
          <ArrowRight size={16} />
        </Button>
        <Button 
          variant="outline" 
          className="flex justify-between"
          onClick={() => onDepartmentSelect("administration")}
        >
          <span className="flex items-center gap-2">
            <Calendar size={16} />
            Administration
          </span>
          <ArrowRight size={16} />
        </Button>
        <Button 
          variant="outline" 
          className="flex justify-between"
          onClick={() => onStageChange("human-chat")}
        >
          <span className="flex items-center gap-2">
            <HeadsetIcon size={16} />
            Chat with a Human
          </span>
          <ArrowRight size={16} />
        </Button>
        <Button 
          variant="outline" 
          className="flex justify-between"
          onClick={() => onStageChange("email-inquiry")}
        >
          <span className="flex items-center gap-2">
            <Mail size={16} />
            Send an Email Inquiry
          </span>
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
};
