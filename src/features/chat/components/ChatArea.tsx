import { useEffect, useRef } from "react";
import cuteIcon from "../../../public/cute.png";
import MessageBubble from "./MessageBubble";
import SpaceStarter from "./SpaceStarter";
import { NewMessage } from "../types";

interface ChatAreaProps {
  messages: NewMessage[];
  conversationId?: string;
  isStreaming?: boolean;
  onCopy?: (content: string) => void;
  onShare?: (messageId: string) => void;
  onRegenerate?: (messageId: string) => void;
  onLike?: (messageId: string, like: boolean) => void;
  onPin?: (messageId: string) => void;
  onQuote?: (messageId: string, content: string) => void;
  onContinue?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onSelectVariant?: (messageId: string, variantId: string) => void;
  onFeedback?: (messageId: string, feedback: { like?: boolean; dislike?: boolean; note?: string; reason?: string }) => void;
  userName?: string;
}

const ChatArea = ({
  messages,
  conversationId,
  isStreaming = false,
  onCopy,
  onShare,
  onRegenerate,
  onLike,
  onPin,
  onQuote,
  onContinue,
  onEdit,
  onSelectVariant,
  onFeedback,
}: ChatAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto scroll to bottom when new message arrives
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        {/* removed decorative icon above header */}

        <img
          src={cuteIcon}
          alt="Cute assistant"
          className="w-72 h-72 mb-2 mx-auto rounded-full"
        />
        <div className="-mt-6 md:-mt-8 mb-2 leading-tight relative z-10">
          <p className="text-4xl md:text-5xl font-bold text-foreground">
            Chat to get started.
          </p>
          <p className="text-4xl md:text-5xl font-bold text-foreground">
            Or start with <span className="gradient-text">a Space!</span>
          </p>
        </div>

        <div className="w-full px-4 mt-4">
          <SpaceStarter />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto"
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
    >
      <div className="w-full py-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            conversationId={conversationId}
            onCopy={onCopy}
            onShare={onShare}
            onRegenerate={onRegenerate}
            onLike={onLike}
            onPin={onPin}
            onQuote={onQuote}
            onContinue={onContinue}
            onEdit={onEdit}
            onSelectVariant={onSelectVariant}
            onFeedback={onFeedback}
          />
        ))}

        {/* Streaming indicator */}
        {isStreaming && (
          <div className="flex gap-4 w-full max-w-[900px] mx-auto px-6 py-4">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-primary-foreground">
                AI
              </span>
            </div>
            <div className="flex-1">
              <div className="rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse [animation-delay:0ms]"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse [animation-delay:150ms]"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse [animation-delay:300ms]"></div>
                  </div>
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatArea;
