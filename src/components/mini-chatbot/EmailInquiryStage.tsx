
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Loader2, Send } from "lucide-react";
import { Person, EmailTemplate } from "./types";
import { emailDepartments, emailTemplates } from "./mockData";

interface EmailInquiryStageProps {
  selectedDepartment: Person | null;
  emailSubject: string;
  emailBody: string;
  selectedTemplate: EmailTemplate | null;
  isLoading: boolean;
  onDepartmentSelect: (dept: Person) => void;
  onTemplateSelect: (templateId: EmailTemplate) => void;
  onSubjectChange: (subject: string) => void;
  onBodyChange: (body: string) => void;
  onSendEmail: () => void;
  onGoBack: () => void;
}

export const EmailInquiryStage: React.FC<EmailInquiryStageProps> = ({
  selectedDepartment,
  emailSubject,
  emailBody,
  selectedTemplate,
  isLoading,
  onDepartmentSelect,
  onTemplateSelect,
  onSubjectChange,
  onBodyChange,
  onSendEmail,
  onGoBack
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" className="p-0 h-8 w-8" onClick={onGoBack}>
          <ChevronLeft size={16} />
        </Button>
        <h3 className="text-sm font-medium">Send Email Inquiry</h3>
      </div>
      
      <div className="space-y-3">
        {/* Email Templates Section */}
        <div>
          <p className="text-xs font-medium mb-1">Choose a Template:</p>
          <ScrollArea className="h-24 pr-4 mb-2">
            <div className="grid grid-cols-2 gap-2">
              {emailTemplates.map((template) => (
                <Button
                  key={template.id}
                  variant={selectedTemplate === template.id ? "default" : "outline"}
                  size="sm"
                  className="justify-start h-auto py-2"
                  onClick={() => onTemplateSelect(template.id as EmailTemplate)}
                >
                  <span className="flex items-center gap-1">
                    {template.icon}
                    <span className="text-xs">{template.name}</span>
                  </span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
        
        <div>
          <p className="text-xs font-medium mb-1">Select Department:</p>
          <ScrollArea className="h-24 pr-4">
            <div className="space-y-2">
              {emailDepartments.map((dept) => (
                <Button
                  key={dept.id}
                  variant={selectedDepartment?.id === dept.id ? "default" : "outline"}
                  size="sm"
                  className="w-full justify-between text-left h-auto py-2"
                  onClick={() => onDepartmentSelect(dept)}
                >
                  <span>{dept.name}</span>
                  <span className="text-xs text-muted-foreground">{dept.email}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
        
        <div>
          <p className="text-xs font-medium mb-1">Subject:</p>
          <Input
            placeholder="Enter subject"
            value={emailSubject}
            onChange={(e) => onSubjectChange(e.target.value)}
          />
        </div>
        
        <div>
          <p className="text-xs font-medium mb-1">Message:</p>
          <Textarea
            placeholder="Type your message here..."
            value={emailBody}
            onChange={(e) => onBodyChange(e.target.value)}
            className="min-h-[120px] resize-none"
            autoResize
          />
          <p className="text-xs text-muted-foreground mt-1">
            Replace [bracketed text] with your specific information.
          </p>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" size="sm" onClick={onGoBack}>
          Back
        </Button>
        <Button 
          size="sm"
          onClick={onSendEmail}
          disabled={!selectedDepartment || !emailSubject || !emailBody || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send size={16} className="mr-2" />
              Send Email
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
