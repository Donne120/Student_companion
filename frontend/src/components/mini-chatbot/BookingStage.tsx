
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Person } from "./types";
import { availableTimes } from "./mockData";

interface BookingStageProps {
  selectedPerson: Person;
  selectedDate: string;
  selectedTime: string;
  message: string;
  isLoading: boolean;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onMessageChange: (message: string) => void;
  onBooking: () => void;
  onGoBack: () => void;
}

export const BookingStage: React.FC<BookingStageProps> = ({
  selectedPerson,
  selectedDate,
  selectedTime,
  message,
  isLoading,
  onDateChange,
  onTimeChange,
  onMessageChange,
  onBooking,
  onGoBack
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" className="p-0 h-8 w-8" onClick={onGoBack}>
          <ChevronLeft size={16} />
        </Button>
        <h3 className="text-sm font-medium">
          {selectedPerson && selectedPerson.name}
        </h3>
      </div>
      
      <div className="space-y-2">
        <p className="text-xs font-medium">Select a date:</p>
        <Input 
          type="date" 
          min={new Date().toISOString().split('T')[0]}
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>
      
      {selectedDate && (
        <div className="space-y-2">
          <p className="text-xs font-medium">Available times:</p>
          <div className="grid grid-cols-3 gap-2">
            {availableTimes.map((time) => (
              <Button
                key={time}
                variant={selectedTime === time ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => onTimeChange(time)}
              >
                {time}
              </Button>
            ))}
          </div>
        </div>
      )}

      {selectedDate && selectedTime && (
        <div className="space-y-2">
          <p className="text-xs font-medium">Add a message (optional):</p>
          <Input
            placeholder="What would you like to discuss?"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
          />
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" size="sm" onClick={onGoBack}>
          Back
        </Button>
        <Button 
          disabled={!selectedDate || !selectedTime || isLoading}
          size="sm"
          onClick={onBooking}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Booking...
            </>
          ) : (
            "Book Session"
          )}
        </Button>
      </div>
    </div>
  );
};
