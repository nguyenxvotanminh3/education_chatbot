import { useEffect, useRef, useState } from "react";
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
  onContinue?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onSelectVariant?: (messageId: string, variantId: string) => void;
  onFeedback?: (
    messageId: string,
    feedback: {
      like?: boolean;
      dislike?: boolean;
      note?: string;
      reason?: string;
    }
  ) => void;
  userName?: string;
  isAuthenticated?: boolean;
}

const ChatArea = ({
  messages,
  conversationId,
  isStreaming = false,
  onCopy,
  onShare,
  onRegenerate,
  onLike,
  onContinue,
  onEdit,
  onSelectVariant,
  onFeedback,
  userName,
  isAuthenticated,
}: ChatAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const computeHeroScale = () => {
    if (typeof window === "undefined") return 1;
    const { innerWidth, innerHeight } = window;

    if (innerWidth <= 640) {
      return 1;
    }

    if (innerWidth >= 1200) {
      const widthAdjusted = innerWidth / 1520;
      const heightAdjusted = innerHeight / 960;
      const ratio = Math.min(widthAdjusted, heightAdjusted);
      return Math.min(0.9, Math.max(0.85, ratio));
    }

    if (innerWidth >= 992) {
      const widthAdjusted = innerWidth / 1200;
      const heightAdjusted = innerHeight / 820;
      return Math.min(1, Math.max(0.9, Math.min(widthAdjusted, heightAdjusted)));
    }

    const heightRatio = innerHeight / 900;
    const widthRatio = innerWidth / 1152;
    return Math.min(1, Math.max(0.8, Math.min(heightRatio, widthRatio)));
  };
  const [heroScale, setHeroScale] = useState(computeHeroScale);

  useEffect(() => {
    const handleResize = () => {
      setHeroScale((prev) => {
        const next = computeHeroScale();
        return Math.abs(next - prev) > 0.01 ? next : prev;
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Auto scroll to bottom when new message arrives
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <div
        ref={containerRef}
        className={`flex-1 min-h-0 ${
          isAuthenticated ? "overflow-y-auto" : "overflow-hidden"
        }`}
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        <div
        className={`flex flex-col items-center ${
            isAuthenticated
              ? "justify-start min-h-full pb-3 sm:pb-4 px-3 sm:px-4"
            : "justify-center gap-6 sm:gap-9 md:gap-10 pb-0 px-3 sm:px-4 md:px-8"
        } pt-4 sm:pt-5 md:pt-6 text-center w-full max-w-6xl mx-auto`}
        style={
          heroScale < 0.98
            ? {
                transform: `scale(${heroScale})`,
                transformOrigin: "top center",
                zoom: heroScale,
              }
            : undefined
        }
        >
          {/* removed decorative icon above header */}
          <div className="flex flex-col items-center">
            <img
              src={cuteIcon}
              alt="Cute assistant"
              className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-48 lg:h-48 mb-0.5 sm:mb-1 mx-auto rounded-full flex-shrink-0"
            />
            <div
              className={`-mt-1.5 sm:-mt-2 md:-mt-4 lg:-mt-5 ${
                isAuthenticated
                  ? "mb-4 sm:mb-6 md:mb-8"
                  : "mb-3 sm:mb-4 md:mb-6"
              } leading-tight relative z-10 px-2 sm:px-3 md:px-6 w-full`}
            >
              <p className="text-[0.95rem] sm:text-[1.45rem] md:text-[1.85rem] lg:text-[2.45rem] font-bold leading-tight text-foreground">
                {(() => {
                  const hour = new Date().getHours();
                  const partOfDay =
                    hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";
                  const name =
                    userName && userName !== "Guest" ? userName : "there";
                  return `Good ${partOfDay}, ${name}`;
                })()}
              </p>
              <p className="text-[0.95rem] sm:text-[1.45rem] md:text-[1.85rem] lg:text-[2.45rem] font-bold leading-tight text-foreground">
                What's on <span className="gradient-text">your mind?</span>
              </p>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="w-full pt-3 sm:pt-5 md:pt-6 px-1.5 sm:px-3 md:px-6">
              <SpaceStarter />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto min-h-0"
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
