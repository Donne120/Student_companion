
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Person } from "./types";

interface ConfirmationStageProps {
  selectedPerson: Person;
  selectedDate: string;
  selectedTime: string;
  onReset: () => void;
}

export const ConfirmationStage: React.FC<ConfirmationStageProps> = ({
  selectedPerson,
  selectedDate,
  selectedTime,
  onReset
}) => {
  return (
    <div className="space-y-4 text-center">
      <div className="py-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <Calendar className="h-6 w-6 text-green-600" />
        </div>
      </div>
      <h3 className="font-medium">Booking Confirmed!</h3>
      <p className="text-sm">
        Your session has been booked with
        {selectedPerson && ` ${selectedPerson.name}`}
        {" on "}
        {new Date(selectedDate).toLocaleDateString()} at {selectedTime}.
      </p>
      <p className="text-xs text-muted-foreground">
        You will receive a confirmation email shortly.
      </p>
      <Button className="w-full" onClick={onReset}>
        Book Another Session
      </Button>
    </div>
  );
};
