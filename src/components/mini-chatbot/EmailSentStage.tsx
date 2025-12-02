
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
      <h3 className="font-medium">Email Draft Ready!</h3>
      <p className="text-sm">
        Your email client should have opened with a draft to {selectedDepartment?.name}.
      </p>
      <p className="text-sm font-medium">
        To: {selectedDepartment?.email || selectedDepartment?.contact || "info@alueducation.com"}
      </p>
      <p className="text-xs text-muted-foreground">
        Please review and send the email from your email client. You should receive a response within 24-48 hours.
      </p>
      <p className="text-xs text-muted-foreground mt-2">
        If your email client didn't open, you can manually email {selectedDepartment?.email || selectedDepartment?.contact || "info@alueducation.com"}
      </p>
      <Button className="w-full" onClick={onReset}>
        Return to Menu
      </Button>
    </div>
  );
};
