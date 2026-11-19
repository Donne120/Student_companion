import { useEffect, useState } from "react";
import { ExternalLink, MapPin, Plus, X } from "lucide-react";
import { useConversations } from "@/hooks/useConversations";
import { useChatMessageHandler } from "@/components/chat/ChatMessageHandler";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/ChatInput";
import { IN_FRAME } from "@/lib/afterAuth";
import { acceptEmbedPage, getEmbedPage, type EmbedPage } from "@/lib/embedPage";
import { suggestionsForPage } from "@/lib/embedSuggestions";

/**
 * /embed — the mini chat that partner websites show in a small window
 * (public/widget.js adds the button and the window). Same assistant, same
 * account and same saved chats as the full app; only the frame is smaller.
 * Signing in happens inside the window (ProtectedRoute sends the person to
 * /login and back here), so it works on any partner site.
 */

export default function Embed() {
  const {
    getCurrentConversation,
    createNewConversation,
    currentConversationId,
    addMessageToConversation,
    updateMessageInConversation,
  } = useConversations();
  const current = getCurrentConversation();

  const { isLoading, handleSendMessage, handleEditMessage } = useChatMessageHandler({
    currentConversationId,
    messages: current?.messages || [],
    onAddMessage: addMessageToConversation,
    onUpdateMessage: updateMessageInConversation,
  });

  const close = () => window.parent?.postMessage({ type: "sc-widget:close" }, "*");

  // Which partner page the chat was opened from (sent by widget.js).
  const [page, setPage] = useState<EmbedPage | null>(getEmbedPage());
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const accepted = acceptEmbedPage(event);
      if (accepted) setPage(accepted);
    };
    window.addEventListener("message", onMessage);
    // Ask for the page now that we are listening.
    if (IN_FRAME) window.parent.postMessage({ type: "sc-widget:ready" }, "*");
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-white font-sans text-[#1C1B19]">
      <header className="sticky top-0 z-20 h-12 px-3 flex items-center gap-2 border-b border-[#E5E3DE] bg-white/95 backdrop-blur">
        <img src="/logo-icon.png" alt="" className="w-7 h-7 object-contain flex-shrink-0" />
        <span className="flex-1 min-w-0 truncate text-[14px] font-semibold tracking-tight">
          {current?.messages?.length ? current.title : "Student Companion"}
        </span>
        <button
          type="button"
          onClick={createNewConversation}
          className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-[#F4F3F0]"
          aria-label="New chat"
          title="New chat"
        >
          <Plus className="h-4 w-4" />
        </button>
        <a
          href="/chat"
          target="_blank"
          rel="noopener"
          className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-[#F4F3F0]"
          aria-label="Open the full app in a new tab"
          title="Open the full app"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
        {IN_FRAME ? (
          <button
            type="button"
            onClick={close}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-[#F4F3F0]"
            aria-label="Close chat"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </header>
      {page?.title ? (
        <p className="px-3 py-1.5 flex items-center gap-1.5 text-[12px] text-[#6B6862] border-b border-[#EDEBE6] bg-[#FAFAF8]">
          <MapPin className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
          <span className="truncate">Helping with: {page.title.split(/\s+[|–—-]\s+/)[0]}</span>
        </p>
      ) : null}

      <div className="pb-36">
        <ChatMessages
          messages={current?.messages || []}
          isLoading={isLoading}
          onEditMessage={handleEditMessage}
          pageSuggestions={suggestionsForPage(page)}
        />
      </div>

      <ChatInput onSend={handleSendMessage} disabled={isLoading} embedded />
    </div>
  );
}
