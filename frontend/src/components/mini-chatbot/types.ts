
// Types for the mini chatbot
export type Department = "learning-coach" | "department" | "administration";
export type Stage = "initial" | "department-selection" | "selection-list" | "booking" | "confirmation" | "human-chat" | "email-inquiry" | "human-chat-active" | "email-sent";
export type EmailTemplate = "general" | "assignment" | "finance" | "technical" | "academic" | "custom";

export interface ChatMessage {
  text: string;
  isUser: boolean;
}

export interface Person {
  id: number;
  name: string;
  course?: string;
  head?: string;
  contact?: string;
  calendarLink?: string;
  department?: string;
  status?: string;
  email?: string;
}

export interface EmailTemplateItem {
  id: string;
  name: string;
  icon: JSX.Element;
  subject: string;
  body: string;
}
