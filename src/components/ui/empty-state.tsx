// Beautiful empty state components
import { ReactNode } from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { 
  MessageSquare, 
  FileText, 
  Search, 
  AlertCircle,
  Inbox,
  FolderOpen,
  Settings,
  Sparkles
} from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center py-12 px-4",
      className
    )}>
      {icon && (
        <div className="mb-4 text-gray-400 dark:text-gray-600">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || "default"}
          className="mt-2"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Preset empty states
export function NoConversations({ onNewChat }: { onNewChat: () => void }) {
  return (
    <EmptyState
      icon={<MessageSquare className="w-16 h-16" />}
      title="No conversations yet"
      description="Start a conversation to get help with ALU resources, academic questions, or campus information."
      action={{
        label: "Start New Chat",
        onClick: onNewChat,
      }}
    />
  );
}

export function NoDocuments({ onUpload }: { onUpload: () => void }) {
  return (
    <EmptyState
      icon={<FileText className="w-16 h-16" />}
      title="No documents uploaded"
      description="Upload documents to enhance the AI's knowledge and get more accurate, context-aware responses."
      action={{
        label: "Upload Document",
        onClick: onUpload,
      }}
    />
  );
}

export function NoSearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<Search className="w-16 h-16" />}
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try different keywords or check your spelling.`}
    />
  );
}

export function ErrorState({ 
  onRetry, 
  message = "Something went wrong" 
}: { 
  onRetry?: () => void;
  message?: string;
}) {
  return (
    <EmptyState
      icon={<AlertCircle className="w-16 h-16 text-red-500" />}
      title="Oops! Something went wrong"
      description={message}
      action={onRetry ? {
        label: "Try Again",
        onClick: onRetry,
        variant: "outline",
      } : undefined}
    />
  );
}

export function EmptyInbox() {
  return (
    <EmptyState
      icon={<Inbox className="w-16 h-16" />}
      title="All caught up!"
      description="You're all set. No new notifications or messages at the moment."
    />
  );
}

export function NoFavorites({ onBrowse }: { onBrowse?: () => void }) {
  return (
    <EmptyState
      icon={<Sparkles className="w-16 h-16" />}
      title="No favorites yet"
      description="Star conversations or documents to quickly access them later."
      action={onBrowse ? {
        label: "Browse Conversations",
        onClick: onBrowse,
        variant: "outline",
      } : undefined}
    />
  );
}

export function EmptyFolder() {
  return (
    <EmptyState
      icon={<FolderOpen className="w-16 h-16" />}
      title="This folder is empty"
      description="Add items to this folder to organize your content."
    />
  );
}

export function ConfigurationNeeded({ onConfigure }: { onConfigure: () => void }) {
  return (
    <EmptyState
      icon={<Settings className="w-16 h-16" />}
      title="Configuration required"
      description="Please complete the setup to start using this feature."
      action={{
        label: "Go to Settings",
        onClick: onConfigure,
      }}
    />
  );
}





