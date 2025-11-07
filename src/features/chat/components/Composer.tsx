import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { sessionService } from "../services/sessionService";
import SlashCommandMenu from "./SlashCommandMenu";

interface ComposerProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  placeholder?: string;
  disabled?: boolean;
  tools?: { web?: boolean; code?: boolean; vision?: boolean };
  memoryEnabled?: boolean;
  enterToSend?: boolean;
  role?: "student" | "teacher";
  onRoleChange?: (role: "student" | "teacher") => void;
  compact?: boolean;
  onNewChat?: () => void;
}

const Composer = ({
  onSend,
  onStop,
  isStreaming = false,
  placeholder = "Message...",
  disabled = false,
  tools,
  memoryEnabled,
  enterToSend = true,
  role: externalRole,
  onRoleChange,
  compact = false,
  onNewChat,
}: ComposerProps) => {
  const [input, setInput] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [internalRole, setInternalRole] = useState<"student" | "teacher">("student");
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Use external role if provided, otherwise use internal state
  const role = externalRole !== undefined ? externalRole : internalRole;
  const handleRoleChange = (newRole: "student" | "teacher") => {
    if (onRoleChange) {
      onRoleChange(newRole);
    } else {
      setInternalRole(newRole);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      if (compact && !input.trim()) {
        // When compact and empty, keep it small but not too small
        textareaRef.current.style.height = "56px";
      } else {
        // Otherwise, auto-resize based on content
        textareaRef.current.style.height = `${Math.min(
          textareaRef.current.scrollHeight,
          200
        )}px`;
      }
    }
  }, [input, compact]);

  useEffect(() => {
    const handleSuggestion = (e: CustomEvent) => {
      const question = e.detail as string;
      if (question && !isStreaming && !disabled) {
        onSend(question);
      }
    };
    window.addEventListener(
      "suggestion-click",
      handleSuggestion as EventListener
    );
    return () =>
      window.removeEventListener(
        "suggestion-click",
        handleSuggestion as EventListener
      );
  }, [onSend, isStreaming, disabled]);

  // Detect slash command
  useEffect(() => {
    const shouldShowMenu = input.startsWith("/") && input.length > 0 && input.indexOf(" ") === -1;
    setShowSlashMenu(shouldShowMenu);
  }, [input]);

  const handleSend = () => {
    const trimmedInput = input.trim();
    if (trimmedInput && !disabled) {
      onSend(trimmedInput);
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Don't send if slash menu is open
    if (showSlashMenu && (e.key === "Enter" || e.key === "Tab")) {
      return; // Let SlashCommandMenu handle it
    }

    if (enterToSend && e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    } else if (!enterToSend && e.key === "Enter" && e.shiftKey && !isComposing) {
      // If enterToSend is false, Shift+Enter sends
      e.preventDefault();
      handleSend();
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const handleSlashCommandSelect = (command: string) => {
    setInput(command + " ");
    setShowSlashMenu(false);
    textareaRef.current?.focus();
  };

  const hasAnyVisibleCharacter = input.replace(/\s/g, "").length > 0;

  // Calculate token count (rough estimate)
  const tokenCount = Math.ceil(input.length / 4);
  const maxTokens = 4000;
  const tokenPercentage = (tokenCount / maxTokens) * 100;

  // Dynamic placeholder based on role
  const roleBasedPlaceholder = role === "student" 
    ? (placeholder === "Message..." ? "Ask a question or request help..." : placeholder)
    : (placeholder === "Message..." ? "Create lesson plans, quizzes, or teaching materials..." : placeholder);

  return (
    <div className="bg-background/50 backdrop-blur-sm relative">
      {/* Context Chips */}
      {(tools?.web || tools?.code || tools?.vision || memoryEnabled) && (
        <div className="mx-auto max-w-[900px] px-4 pt-2">
          <div className="flex items-center gap-2 flex-wrap">
            {tools?.web && (
              <div className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Web
              </div>
            )}
            {tools?.code && (
              <div className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Code
              </div>
            )}
            {tools?.vision && (
              <div className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Vision
              </div>
            )}
            {memoryEnabled && (
              <div className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                Memory
              </div>
            )}
          </div>
        </div>
      )}

      <div className={`mx-auto max-w-[900px] px-4 ${compact ? 'pt-0 pb-2' : 'py-4'} relative`}>
        {/* Slash Command Menu */}
        <SlashCommandMenu
          show={showSlashMenu}
          onSelect={handleSlashCommandSelect}
          onClose={() => setShowSlashMenu(false)}
        />

        {/* Quick suggestions row - hidden when compact (empty state) */}
        {!hasAnyVisibleCharacter && !isStreaming && !compact && (
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {[
              "Summarize this article",
              "Explain like I'm 5",
              "Create a lesson plan",
              "Multiple-choice quiz",
              "Translate to Vietnamese",
            ].map((label) => (
              <button
                key={label}
                onClick={() => {
                  setInput(label + " ");
                  textareaRef.current?.focus();
                }}
                className="px-3 py-1.5 rounded-lg bg-muted text-xs text-foreground hover:bg-accent border border-border"
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* New Chat button - only visible when compact (no messages) */}
          {onNewChat && compact && (
            <Button
              onClick={onNewChat}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full border border-border bg-background hover:bg-muted shrink-0 focus:outline-none focus:ring-0 focus-visible:ring-0"
              aria-label="New chat"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </Button>
          )}
          {/* Textarea container with inline actions */}
          <div className="flex-1 relative flex items-center">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              placeholder={roleBasedPlaceholder}
              disabled={disabled || isStreaming}
              rows={1}
              className={`w-full ${compact ? 'px-3 py-3 pr-48' : 'px-4 py-5 pr-52'} bg-muted/50 border border-border rounded-2xl resize-none focus:outline-none focus:ring-0 focus:border-border disabled:opacity-50 disabled:cursor-not-allowed max-h-[320px] overflow-y-auto transition-all`}
              style={{ minHeight: compact ? "56px" : "112px", height: compact && !input.trim() ? "56px" : "auto" }}
            />
            {/* Left dock: camera, attach, and school chip pinned to bottom-left - hidden when compact */}
            {!compact && (
              <div className="absolute left-2 bottom-2 flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full border border-border bg-background hover:bg-muted focus:outline-none focus:ring-0 focus-visible:ring-0"
                  aria-label="Camera"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full border border-border bg-background hover:bg-muted focus:outline-none focus:ring-0 focus-visible:ring-0"
                  aria-label="Attach"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-paperclip-icon lucide-paperclip"
                  >
                    <path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551" />
                  </svg>
                </Button>
                <div className="ml-1 px-2 py-1 rounded-md bg-background border border-border text-[11px] leading-none text-muted-foreground max-w-[160px] truncate">
                  {sessionService.getSession().schoolName || 'Select school'}
                </div>
              </div>
            )}

            {/* Inline controls - center when compact, bottom-right when normal */}
            {compact ? (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {/* Role toggle button with sliding background */}
                <button
                  type="button"
                  onClick={() => handleRoleChange(role === "student" ? "teacher" : "student")}
                  className="relative px-1 py-1 rounded-md bg-muted/50 border border-border hover:bg-muted transition-colors focus:outline-none focus:ring-0 text-[10px] font-medium leading-tight overflow-hidden"
                  aria-label="Toggle role"
                >
                  {/* Sliding background */}
                  <span
                    className={`absolute inset-y-1 rounded transition-all duration-300 ease-in-out bg-black ${
                      role === "student" ? "left-1 right-1/2" : "left-1/2 right-1"
                    }`}
                  />
                  <div className="relative flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded transition-colors duration-300 ${
                      role === "student" ? "text-white font-semibold" : "text-muted-foreground"
                    }`}>
                      Student
                    </span>
                    <span className={`px-2 py-0.5 rounded transition-colors duration-300 ${
                      role === "teacher" ? "text-white font-semibold" : "text-muted-foreground"
                    }`}>
                      Teacher
                    </span>
                  </div>
                </button>

                {/* Send/Stop button inside input */}
                {isStreaming && onStop ? (
                  <Button
                    onClick={onStop}
                    variant="destructive"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    aria-label="Stop generating"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 6h12v12H6z" />
                    </svg>
                  </Button>
                ) : (
                  <Button
                    onClick={handleSend}
                    disabled={!hasAnyVisibleCharacter || disabled}
                    size="icon"
                    className="h-9 w-9 rounded-lg bg-black text-white hover:bg-black/90 disabled:opacity-50"
                    aria-label="Send message"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m5 12 7-7 7 7" />
                    </svg>
                  </Button>
                )}
              </div>
            ) : (
              <div className="absolute right-2 bottom-2 flex items-center gap-2">
                {/* Role toggle button with sliding background */}
                <button
                  type="button"
                  onClick={() => handleRoleChange(role === "student" ? "teacher" : "student")}
                  className="relative px-1 py-1 rounded-md bg-muted/50 border border-border hover:bg-muted transition-colors focus:outline-none focus:ring-0 text-[10px] font-medium leading-tight overflow-hidden"
                  aria-label="Toggle role"
                >
                  {/* Sliding background */}
                  <span
                    className={`absolute inset-y-1 rounded transition-all duration-300 ease-in-out bg-black ${
                      role === "student" ? "left-1 right-1/2" : "left-1/2 right-1"
                    }`}
                  />
                  <div className="relative flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded transition-colors duration-300 ${
                      role === "student" ? "text-white font-semibold" : "text-muted-foreground"
                    }`}>
                      Student
                    </span>
                    <span className={`px-2 py-0.5 rounded transition-colors duration-300 ${
                      role === "teacher" ? "text-white font-semibold" : "text-muted-foreground"
                    }`}>
                      Teacher
                    </span>
                  </div>
                </button>

                {/* Send/Stop button inside input */}
                {isStreaming && onStop ? (
                  <Button
                    onClick={onStop}
                    variant="destructive"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    aria-label="Stop generating"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 6h12v12H6z" />
                    </svg>
                  </Button>
                ) : (
                  <Button
                    onClick={handleSend}
                    disabled={!hasAnyVisibleCharacter || disabled}
                    size="icon"
                    className="h-9 w-9 rounded-lg bg-black text-white hover:bg-black/90 disabled:opacity-50"
                    aria-label="Send message"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m5 12 7-7 7 7" />
                    </svg>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Token Counter */}
        {hasAnyVisibleCharacter && (
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>~{tokenCount} tokens</span>
              {tokenPercentage > 80 && (
                <span className="text-amber-500">
                  ⚠️ Approaching limit
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Type <kbd className="px-1 py-0.5 bg-muted rounded border border-border">/</kbd> for commands
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Composer;
