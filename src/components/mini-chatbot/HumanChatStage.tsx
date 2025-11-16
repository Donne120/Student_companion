
import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft } from "lucide-react";
import { Person } from "./types";
import { chatAgents } from "./mockData";

interface HumanChatStageProps {
  onPersonSelect: (person: Person) => void;
  onGoBack: () => void;
}

export const HumanChatStage: React.FC<HumanChatStageProps> = ({
  onPersonSelect,
  onGoBack
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" className="p-0 h-8 w-8" onClick={onGoBack}>
          <ChevronLeft size={16} />
        </Button>
        <h3 className="text-sm font-medium">Select an Agent to Chat With</h3>
      </div>
      
      <ScrollArea className="h-64 pr-4">
        <div className="space-y-2">
          {chatAgents.map((agent) => (
            <Button
              key={agent.id}
              variant="outline"
              className="w-full justify-start flex-col items-start p-3 h-auto"
              onClick={() => onPersonSelect(agent)}
              disabled={agent.status === "Away"}
            >
              <div className="font-medium text-left flex items-center gap-2">
                {agent.name}
                <span className={`w-2 h-2 rounded-full ${agent.status === "Online" ? "bg-green-500" : "bg-amber-500"}`}></span>
              </div>
              <div className="text-xs text-muted-foreground text-left">{agent.department}</div>
              <div className="text-xs text-muted-foreground text-left">Status: {agent.status}</div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
