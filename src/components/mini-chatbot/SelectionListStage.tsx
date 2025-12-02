
import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft } from "lucide-react";
import { Department, Person } from "./types";
import { learningCoaches, departments, administrationOffices, missionCurators, belProgram } from "./mockData";

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
      case "mission-curators":
        return missionCurators;
      case "bel-program":
        return belProgram;
      default:
        return [];
    }
  };

  const getTitle = () => {
    switch (department) {
      case "learning-coach":
        return "Select a Learning Coach";
      case "department":
        return "Select Faculty Member";
      case "administration":
        return "Select an Administrative Office";
      case "mission-curators":
        return "Select a Mission Curator";
      case "bel-program":
        return "BEL Program Office Hours";
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
              className="w-full justify-start flex-col items-start p-3 h-auto hover:bg-white/10 border-white/20 text-white"
              onClick={() => onPersonSelect(person)}
            >
              <div className="font-medium text-left">{person.name}</div>
              {person.missionArea && (
                <div className="text-xs text-gray-300 text-left">Mission: {person.missionArea}</div>
              )}
              {person.email && (
                <div className="text-xs text-gray-300 text-left">Email: {person.email}</div>
              )}
              {person.course && (
                <div className="text-xs text-gray-300 text-left">{person.course}</div>
              )}
              {person.head && (
                <div className="text-xs text-gray-300 text-left">Head: {person.head}</div>
              )}
              {person.contact && (
                <div className="text-xs text-gray-300 text-left">{person.contact}</div>
              )}
              {person.department && (
                <div className="text-xs text-gray-300 text-left">{person.department}</div>
              )}
              {person.bio && (
                <div className="text-xs text-gray-400 text-left mt-2 line-clamp-3">{person.bio}</div>
              )}
              {person.calendarLink && (
                <div className="text-xs text-blue-400 mt-1 font-medium">📅 Click to book office hours</div>
              )}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
