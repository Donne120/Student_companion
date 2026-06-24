
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Stage, Department, Person, ChatMessage, EmailTemplate } from "./types";
import { InitialStage } from "./InitialStage";
import { SelectionListStage } from "./SelectionListStage";
import { BookingStage } from "./BookingStage";
import { ConfirmationStage } from "./ConfirmationStage";
import { HumanChatStage } from "./HumanChatStage";
import { HumanChatActiveStage } from "./HumanChatActiveStage";
import { EmailInquiryStage } from "./EmailInquiryStage";
import { EmailSentStage } from "./EmailSentStage";
import { emailTemplates } from "./mockData";
import { aiService } from "@/services/aiService";

export const MiniChatbotContent = () => {
  const [stage, setStage] = useState<Stage>("initial");
  const [department, setDepartment] = useState<Department | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<Person | null>(null);
  const [humanChatInput, setHumanChatInput] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [aiPersona, setAiPersona] = useState({
    name: "Academic Advisor",
    traits: { helpfulness: 85, creativity: 40, precision: 90, friendliness: 75 }
  });
  const [useNyptho, setUseNyptho] = useState<boolean>(false);
  const [nypthoStatus, setNypthoStatus] = useState<any>(null);

  useEffect(() => {
    loadAiPersonaSettings();
    initializeChat();
    checkNypthoStatus();
  }, []);

  const checkNypthoStatus = async () => {
    try {
      const status = await aiService.getNypthoStatus();
      setNypthoStatus(status);
      // If Nyptho is ready, enable it based on settings
      if (status?.ready) {
        const savedUseNyptho = localStorage.getItem("USE_NYPTHO");
        setUseNyptho(savedUseNyptho === "true");
      }
    } catch (error) {
      console.error("Error checking Nyptho status:", error);
    }
  };

  const loadAiPersonaSettings = () => {
    const savedPersona = localStorage.getItem("AI_PERSONA") || "academic";
    const savedTraits = JSON.parse(localStorage.getItem("AI_TRAITS") || JSON.stringify({ 
      helpfulness: 75, creativity: 50, precision: 85, friendliness: 70 
    }));
    
    const personaNames: {[key: string]: string} = {
      academic: "Academic Advisor",
      creative: "Creative Coach",
      technical: "Technical Assistant",
      supportive: "Supportive Guide",
      nyptho: "Nyptho Learning AI",
      custom: "Custom AI"
    };
    
    setAiPersona({
      name: personaNames[savedPersona] || "Academic Advisor",
      traits: savedTraits
    });

    // Check if we should use Nyptho based on saved persona
    if (savedPersona === "nyptho") {
      setUseNyptho(true);
      localStorage.setItem("USE_NYPTHO", "true");
    }
  };

  const initializeChat = () => {
    const greetings = [
      "Hi there! I'm your academic advisor. How can I help with your educational journey today?",
      "Hello! I'm here to assist with any questions about your courses, schedules, or academic resources.",
      "Welcome to ALU support! I'm your AI assistant. What can I help you with today?"
    ];

    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    setChatMessages([
      { 
        text: `Hi there! I'm your ${aiPersona.name}. How can I help you today?`, 
        isUser: false 
      }
    ]);
  };

  const handleDepartmentSelect = (dept: Department) => {
    setDepartment(dept);
    setStage("selection-list");
  };

  const handlePersonSelect = (person: Person) => {
    setSelectedPerson(person);
    
    if (person.calendarLink) {
      window.open(person.calendarLink, '_blank');
      return;
    }
    
    setStage("department-selection");
  };

  const handleBooking = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStage("confirmation");
    }, 1500);
  };

  const resetChat = () => {
    setStage("initial");
    setDepartment(null);
    setMessage("");
    setSelectedDate("");
    setSelectedTime("");
    setSelectedPerson(null);
    initializeChat();
    setEmailSubject("");
    setEmailBody("");
    setSelectedDepartment(null);
    setHumanChatInput("");
  };

  const goBack = () => {
    if (stage === "selection-list") {
      setStage("initial");
      setDepartment(null);
    } else if (stage === "department-selection") {
      setStage("selection-list");
      setSelectedPerson(null);
    } else if (stage === "human-chat" || stage === "email-inquiry") {
      setStage("initial");
    } else if (stage === "human-chat-active") {
      setStage("human-chat");
    }
  };

  const handleTemplateSelect = (templateId: EmailTemplate) => {
    setSelectedTemplate(templateId);
    const template = emailTemplates.find(t => t.id === templateId);
    
    if (template) {
      setEmailSubject(template.subject);
      setEmailBody(template.body);
    }
  };

  const sendHumanChatMessage = async () => {
    if (humanChatInput.trim() === "") return;
    
    setChatMessages(prev => [...prev, { text: humanChatInput, isUser: true }]);
    setHumanChatInput("");
    
    setIsLoading(true);
    
    try {
      // Convert chat messages to the format needed by aiService
      const history = chatMessages.map((msg, i) => ({
        id: `msg-${i}`,
        text: msg.text,
        isAi: !msg.isUser,
        timestamp: Date.now() - (chatMessages.length - i) * 1000
      }));
      
      // Use aiService to get response
      const options = {
        useNyptho: useNyptho,
        personality: aiPersona.traits
      };
      
      const response = await aiService.generateResponse(humanChatInput, history, options);
      
      setChatMessages(prev => [...prev, { text: response, isUser: false }]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setChatMessages(prev => [...prev, { 
        text: "I'm having trouble connecting to our knowledge base. Please try again later.", 
        isUser: false 
      }]);
      
      toast.error("Error connecting to AI service");
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmailInquiry = () => {
    if (!selectedDepartment || !emailSubject || !emailBody) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setStage("email-sent");
    }, 1500);
  };

  return (
    <div className="flex flex-col h-96">
      <div className="flex-1 overflow-y-auto p-4">
        {stage === "initial" && (
          <InitialStage 
            onDepartmentSelect={handleDepartmentSelect}
            onStageChange={setStage}
          />
        )}

        {stage === "selection-list" && department && (
          <SelectionListStage 
            department={department}
            onPersonSelect={handlePersonSelect}
            onGoBack={goBack}
          />
        )}

        {stage === "department-selection" && selectedPerson && (
          <BookingStage 
            selectedPerson={selectedPerson}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            message={message}
            isLoading={isLoading}
            onDateChange={setSelectedDate}
            onTimeChange={setSelectedTime}
            onMessageChange={setMessage}
            onBooking={handleBooking}
            onGoBack={goBack}
          />
        )}

        {stage === "confirmation" && selectedPerson && (
          <ConfirmationStage 
            selectedPerson={selectedPerson}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onReset={resetChat}
          />
        )}

        {stage === "human-chat" && (
          <HumanChatStage 
            onPersonSelect={(person) => {
              setSelectedPerson(person);
              setStage("human-chat-active");
            }}
            onGoBack={goBack}
          />
        )}

        {stage === "human-chat-active" && selectedPerson && (
          <HumanChatActiveStage 
            selectedPerson={selectedPerson}
            chatMessages={chatMessages}
            humanChatInput={humanChatInput}
            isLoading={isLoading}
            onInputChange={setHumanChatInput}
            onSendMessage={sendHumanChatMessage}
            onGoBack={goBack}
            useNyptho={useNyptho}
            aiPersona={aiPersona}
          />
        )}

        {stage === "email-inquiry" && (
          <EmailInquiryStage 
            selectedDepartment={selectedDepartment}
            emailSubject={emailSubject}
            emailBody={emailBody}
            selectedTemplate={selectedTemplate}
            isLoading={isLoading}
            onDepartmentSelect={setSelectedDepartment}
            onTemplateSelect={handleTemplateSelect}
            onSubjectChange={setEmailSubject}
            onBodyChange={setEmailBody}
            onSendEmail={sendEmailInquiry}
            onGoBack={goBack}
          />
        )}

        {stage === "email-sent" && selectedDepartment && (
          <EmailSentStage 
            selectedDepartment={selectedDepartment}
            onReset={resetChat}
          />
        )}
      </div>
    </div>
  );
};
