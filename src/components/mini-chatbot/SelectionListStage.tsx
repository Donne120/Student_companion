
import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft } from "lucide-react";
import { Department, Person } from "./types";
import { learningCoaches, departments, administrationOffices } from "./mockData";

interface SelectionListStageProps {
  department: Department;
  onPersonSelect: (person: Person) => void;
  onGoBack: () => void;
}

export const SelectionListStage: React.FC<SelectionListStageProps> = ({
  department,
  onPersonSelect,
  onGoBack
}) => {
  const getPersonList = () => {
    switch (department) {
      case "learning-coach":
        return learningCoaches;
      case "department":
        return departments;
      case "administration":
        return administrationOffices;
      default:
        return [];
    }
  };

  const getTitle = () => {
    switch (department) {
      case "learning-coach":
        return "Select a Learning Coach";
      case "department":
        return "Select a Department";
      case "administration":
        return "Select an Administrative Office";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" className="p-0 h-8 w-8" onClick={onGoBack}>
          <ChevronLeft size={16} />
        </Button>
        <h3 className="text-sm font-medium">{getTitle()}</h3>
      </div>
      
      <ScrollArea className="h-64 pr-4">
        <div className="space-y-2">
          {getPersonList().map((person) => (
            <Button
              key={person.id}
              variant="outline"
              className="w-full justify-start flex-col items-start p-3 h-auto"
              onClick={() => onPersonSelect(person)}
            >
              <div className="font-medium text-left">{person.name}</div>
              {person.course && (
                <div className="text-xs text-muted-foreground text-left">{person.course}</div>
              )}
              {person.head && (
                <div className="text-xs text-muted-foreground text-left">Head: {person.head}</div>
              )}
              {person.contact && (
                <div className="text-xs text-muted-foreground text-left">{person.contact}</div>
              )}
              {person.calendarLink && (
                <div className="text-xs text-blue-500 mt-1">Click to book office hours</div>
              )}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
