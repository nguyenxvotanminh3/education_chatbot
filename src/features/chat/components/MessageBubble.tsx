import { useState } from "react";
import assistantAvatar from "../../../public/model_icon_dark.png";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { NewMessage } from "../types";
import ShareModal from "./ShareModal";
import FeedbackDialog from "./FeedbackDialog";
import { Button } from "@/components/ui/button";

interface MessageBubbleProps {
  message: NewMessage;
  conversationId?: string;
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
}

const MessageBubble = ({
  message,
  conversationId,
  onCopy,
  onRegenerate,
  onContinue,
  onEdit,
  onSelectVariant,
  onFeedback,
}: MessageBubbleProps) => {
  const [copied, setCopied] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"like" | "dislike">("like");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  const isUser = message.role === "user";
  const isError = message.isError === true;

  // Get current content (from selected variant or default)
  const getCurrentContent = () => {
    if (message.selectedVariantId && message.variants) {
      const selectedVariant = message.variants.find(
        (v) => v.id === message.selectedVariantId
      );
      return (
        selectedVariant?.contentMd || message.contentMd || message.content || ""
      );
    }
    return message.contentMd || message.content || "";
  };

  const content = getCurrentContent();
  const hasVariants = message.variants && message.variants.length > 0;
  const currentVariantIndex = hasVariants
    ? message.variants!.findIndex((v) => v.id === message.selectedVariantId) + 1
    : 0;

  const handleCopy = async (text?: string) => {
    const textToCopy = text || content;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      onCopy?.(textToCopy);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleLike = (like: boolean) => {
    setFeedbackType(like ? "like" : "dislike");
    setFeedbackDialogOpen(true);
  };

  const handleFeedbackSubmit = (note: string, reason?: string) => {
    onFeedback?.(message.id, {
      like: feedbackType === "like",
      dislike: feedbackType === "dislike",
      note,
      reason,
    });
  };

  const handleStartEdit = () => {
    setEditContent(message.content || "");
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(message.id, editContent);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent("");
  };

  const handlePreviousVariant = () => {
    if (!hasVariants || !message.variants) return;
    const currentIndex = message.variants.findIndex(
      (v) => v.id === message.selectedVariantId
    );
    const prevIndex =
      currentIndex <= 0 ? message.variants.length - 1 : currentIndex - 1;
    onSelectVariant?.(message.id, message.variants[prevIndex].id);
  };

  const handleNextVariant = () => {
    if (!hasVariants || !message.variants) return;
    const currentIndex = message.variants.findIndex(
      (v) => v.id === message.selectedVariantId
    );
    const nextIndex = (currentIndex + 1) % message.variants.length;
    onSelectVariant?.(message.id, message.variants[nextIndex].id);
  };

  return (
    <div
      className={`group flex gap-4 w-full max-w-[900px] mx-auto px-6 py-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* Avatar for assistant */}
      {!isUser && (
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-primary/10 border border-border/60">
          <img
            src={assistantAvatar}
            alt="Assistant avatar"
            className="w-[70%] h-[70%] sm:w-[75%] sm:h-[75%] object-contain"
          />
        </div>
      )}

      <div
        className={`flex-1 max-w-[85%] w-fit ${
          isUser ? "flex flex-col justify-end items-end" : ""
        }`}
      >
        {/* Message Header (for assistant with variants) */}
        {!isUser && hasVariants && (
          <div className="flex items-center gap-2 mb-2 px-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handlePreviousVariant}
              disabled={!message.variants || message.variants.length <= 1}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Button>
            <span className="text-xs text-muted-foreground">
              {currentVariantIndex} / {message.variants!.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleNextVariant}
              disabled={!message.variants || message.variants.length <= 1}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
          </div>
        )}

        <div
          className={`${
            isUser
              ? "rounded-2xl p-4 bg-primary/10 text-foreground shadow-sm"
              : isError
              ? "rounded-lg p-4 border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/10"
              : "rounded-none p-0 bg-transparent shadow-none border-0"
          }`}
        >
          {/* Editing mode for user messages */}
          {isUser && isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full min-h-[100px] p-2 rounded-md bg-background border border-border focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveEdit}>
                  Save & Resend
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : isUser ? (
            // User message display
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">
              {content}
              {message.isEdited && (
                <span className="text-xs text-muted-foreground ml-2">
                  (edited)
                </span>
              )}
            </p>
          ) : (
            // Assistant message with markdown
            <div
              className={`prose prose-sm dark:prose-invert max-w-none leading-relaxed ${
                isError ? "text-red-800 dark:text-red-300" : ""
              }`}
            >
              {isError ? (
                // Error message - plain text
                <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                  Error
                </p>
              ) : null}
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    const codeString = String(children).replace(/\n$/, "");
                    return !inline && match ? (
                      <div className="relative my-4 rounded-xl overflow-hidden border border-border/60">
                        <div className="flex items-center justify-between px-4 py-2 bg-muted/60 border-b border-border/60">
                          <span className="text-xs font-mono text-muted-foreground font-medium">
                            {match[1]}
                          </span>
                          <button
                            onClick={() => handleCopy(codeString)}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                          >
                            {copied ? "Copied" : "Copy"}
                          </button>
                        </div>
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          className="!m-0"
                          customStyle={{
                            margin: 0,
                            borderTopLeftRadius: 0,
                            borderTopRightRadius: 0,
                          }}
                          {...props}
                        >
                          {codeString}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code
                        className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  h1: ({ children }) => (
                    <h1 className="text-xl font-bold mb-2 mt-4 text-foreground">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-lg font-semibold mb-2 mt-3 text-foreground">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-medium mb-1 mt-2 text-foreground">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-2 text-foreground leading-relaxed">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-5 mb-2 space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-5 mb-2 space-y-1">
                      {children}
                    </ol>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="pl-4 my-2 italic text-muted-foreground border-l-4 border-primary/60">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4 rounded-xl border border-border/60">
                      <table className="min-w-full">{children}</table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="px-4 py-2 bg-muted/60 text-left font-semibold border-b border-border/60">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-2 border-b border-border/60">
                      {children}
                    </td>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}

          {/* Citations */}
          {!isUser && message.citations && message.citations.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Sources:
              </p>
              <div className="space-y-1">
                {message.citations.map((citation, idx) => (
                  <a
                    key={citation.id}
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 text-xs text-primary hover:underline"
                  >
                    <span className="shrink-0">[{idx + 1}]</span>
                    <span className="line-clamp-1">{citation.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions Bar */}
        <div className="flex items-center gap-1 mt-2 px-4 invisible group-hover:visible transition-opacity">
          {/* Copy */}
          <button
            onClick={() => handleCopy()}
            className="p-1.5 rounded hover:bg-muted transition-colors"
            title="Copy"
          >
            {copied ? (
              <svg
                className="w-4 h-4 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
          </button>

          {/* Share */}
          <button
            onClick={() => setShareModalOpen(true)}
            className="p-1.5 rounded hover:bg-muted transition-colors"
            title="Share"
          >
            <svg
              className="w-4 h-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </button>

          {/* Assistant-only actions */}
          {!isUser && (
            <>
              {/* Like/Dislike */}
              <button
                onClick={() => handleLike(true)}
                className={`p-1.5 rounded hover:bg-muted transition-colors ${
                  message.feedback?.like
                    ? "text-green-500"
                    : "text-muted-foreground"
                }`}
                title="Like"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  />
                </svg>
              </button>

              <button
                onClick={() => handleLike(false)}
                className={`p-1.5 rounded hover:bg-muted transition-colors ${
                  message.feedback?.dislike
                    ? "text-red-500"
                    : "text-muted-foreground"
                }`}
                title="Dislike"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                  />
                </svg>
              </button>

              {/* Regenerate */}
              <button
                onClick={() => onRegenerate?.(message.id)}
                className="p-1.5 rounded hover:bg-muted transition-colors"
                title="Regenerate"
              >
                <svg
                  className="w-4 h-4 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>

              {/* Continue */}
              {message.isContinuable && (
                <button
                  onClick={() => onContinue?.(message.id)}
                  className="p-1.5 rounded hover:bg-muted transition-colors"
                  title="Continue"
                >
                  <svg
                    className="w-4 h-4 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 5l7 7-7 7M5 5l7 7-7 7"
                    />
                  </svg>
                </button>
              )}
            </>
          )}

          {/* User-only actions */}
          {isUser && !isEditing && (
            <button
              onClick={handleStartEdit}
              className="p-1.5 rounded hover:bg-muted transition-colors"
              title="Edit"
            >
              <svg
                className="w-4 h-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        messageId={message.id}
        conversationId={conversationId}
      />

      <FeedbackDialog
        open={feedbackDialogOpen}
        onClose={() => setFeedbackDialogOpen(false)}
        feedbackType={feedbackType}
        onSubmit={handleFeedbackSubmit}
      />
    </div>
  );
};

export default MessageBubble;
