
import React from "react";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { Person } from "./types";

interface EmailSentStageProps {
  selectedDepartment: Person;
  onReset: () => void;
}

export const EmailSentStage: React.FC<EmailSentStageProps> = ({
  selectedDepartment,
  onReset
}) => {
  return (
    <div className="space-y-4 text-center">
      <div className="py-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <Mail className="h-6 w-6 text-green-600" />
        </div>
      </div>
      <h3 className="font-medium">Email Sent Successfully!</h3>
      <p className="text-sm">
        Your inquiry has been sent to {selectedDepartment?.name} ({selectedDepartment?.email}).
      </p>
      <p className="text-xs text-muted-foreground">
        You should receive a response within 24-48 hours.
      </p>
      <Button className="w-full" onClick={onReset}>
        Return to Menu
      </Button>
    </div>
  );
};
