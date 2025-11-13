import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  schoolName?: string;
  onChangeSchool?: () => void;
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
  schoolName,
  onChangeSchool,
}: ComposerProps) => {
  const [input, setInput] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [internalRole, setInternalRole] = useState<"student" | "teacher">(
    "student"
  );
  const [modeDialogOpen, setModeDialogOpen] = useState(false);
  const [isMultiLine, setIsMultiLine] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Use external role if provided, otherwise use internal state
  const role = externalRole !== undefined ? externalRole : internalRole;
  const handleRoleChange = (newRole: "student" | "teacher") => {
    setModeDialogOpen(true);
    if (onRoleChange) {
      onRoleChange(newRole);
    } else {
      setInternalRole(newRole);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      // Check if mobile (screen width < 640px = sm breakpoint)
      const isMobile = window.innerWidth < 640;

      if (isMobile) {
        // On mobile: allow wrap and auto-resize with max height
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.overflowX = "visible";
        textareaRef.current.style.whiteSpace = "normal";
        
        const minHeight = compact ? "44px" : "52px";
        const maxHeight = "200px";
        const scrollHeight = textareaRef.current.scrollHeight;
        const lineHeight = parseInt(getComputedStyle(textareaRef.current).lineHeight) || 24;
        const numberOfLines = Math.ceil(scrollHeight / lineHeight);
        
        // Only show scrollbar if more than 4 lines
        textareaRef.current.style.overflowY = numberOfLines > 4 ? "auto" : "hidden";
        
        if (scrollHeight <= parseInt(minHeight)) {
          textareaRef.current.style.height = minHeight;
        } else {
          textareaRef.current.style.height = `${Math.min(scrollHeight, parseInt(maxHeight))}px`;
        }
        
        // Check if text wraps to multiple lines
        setIsMultiLine(scrollHeight > lineHeight * 1.5);
      } else {
        // On desktop: auto-resize based on content, allow wrap
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.overflowX = "visible";
        textareaRef.current.style.whiteSpace = "normal";

        if (compact && !input.trim()) {
          // When compact and empty, keep it small but not too small
          textareaRef.current.style.height = "56px";
          textareaRef.current.style.overflowY = "hidden";
          setIsMultiLine(false);
        } else {
          // Otherwise, auto-resize based on content
          const scrollHeight = textareaRef.current.scrollHeight;
          const lineHeight = parseInt(getComputedStyle(textareaRef.current).lineHeight) || 24;
          const numberOfLines = Math.ceil(scrollHeight / lineHeight);
          
          // Only show scrollbar if more than 4 lines
          textareaRef.current.style.overflowY = numberOfLines > 4 ? "auto" : "hidden";
          textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
          
          // Check if text wraps to multiple lines
          setIsMultiLine(scrollHeight > lineHeight * 1.5);
        }
      }
    }
  }, [input, compact]);

  // Handle window resize to adjust mobile/desktop behavior
  useEffect(() => {
    const handleResize = () => {
      if (textareaRef.current) {
        const isMobile = window.innerWidth < 640;
        if (isMobile) {
          // On mobile: allow wrap and auto-resize with max height
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.overflowX = "visible";
          textareaRef.current.style.whiteSpace = "normal";
          
          const minHeight = compact ? "44px" : "52px";
          const maxHeight = "200px";
          const scrollHeight = textareaRef.current.scrollHeight;
          const lineHeight = parseInt(getComputedStyle(textareaRef.current).lineHeight) || 24;
          const numberOfLines = Math.ceil(scrollHeight / lineHeight);
          
          // Only show scrollbar if more than 4 lines
          textareaRef.current.style.overflowY = numberOfLines > 4 ? "auto" : "hidden";
          
          if (scrollHeight <= parseInt(minHeight)) {
            textareaRef.current.style.height = minHeight;
            setIsMultiLine(false);
          } else {
            textareaRef.current.style.height = `${Math.min(scrollHeight, parseInt(maxHeight))}px`;
            // Check if text wraps to multiple lines
            setIsMultiLine(scrollHeight > lineHeight * 1.5);
          }
        } else {
          // On desktop: auto-resize, allow wrap
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.overflowX = "visible";
          textareaRef.current.style.whiteSpace = "normal";
          if (textareaRef.current.value.trim()) {
            const scrollHeight = textareaRef.current.scrollHeight;
            const lineHeight = parseInt(getComputedStyle(textareaRef.current).lineHeight) || 24;
            const numberOfLines = Math.ceil(scrollHeight / lineHeight);
            
            // Only show scrollbar if more than 4 lines
            textareaRef.current.style.overflowY = numberOfLines > 4 ? "auto" : "hidden";
            textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
            // Check if text wraps to multiple lines
            setIsMultiLine(scrollHeight > lineHeight * 1.5);
          } else {
            textareaRef.current.style.overflowY = "hidden";
            setIsMultiLine(false);
          }
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [compact]);

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

  const handleSend = () => {
    const trimmedInput = input.trim();
    if (trimmedInput && !disabled) {
      onSend(trimmedInput);
      setInput("");
      if (textareaRef.current) {
        // Check if mobile to set appropriate height and style
        const isMobile = window.innerWidth < 640;
        if (isMobile) {
          // On mobile: reset to min height but allow wrap
          const minHeight = compact ? "44px" : "52px";
          textareaRef.current.style.height = minHeight;
          textareaRef.current.style.overflowY = "hidden";
          textareaRef.current.style.overflowX = "visible";
          textareaRef.current.style.whiteSpace = "normal";
        } else {
          // On desktop: reset height
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.overflowY = "hidden";
          textareaRef.current.style.overflowX = "visible";
          textareaRef.current.style.whiteSpace = "normal";
        }
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (enterToSend && e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    } else if (
      !enterToSend &&
      e.key === "Enter" &&
      e.shiftKey &&
      !isComposing
    ) {
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

  const hasAnyVisibleCharacter = input.replace(/\s/g, "").length > 0;

  // Dynamic placeholder based on role
  const roleBasedPlaceholder =
    role === "student"
      ? placeholder === "Message..."
        ? "Ask a question or request help..."
        : placeholder
      : placeholder === "Message..."
      ? "Create lesson plans, quizzes, or teaching materials..."
      : placeholder;

  return (
    <>
      <div className="bg-background/50 backdrop-blur-sm relative">
        {/* Context Chips */}
        {(tools?.web || tools?.code || tools?.vision || memoryEnabled) && (
          <div className="mx-auto max-w-[900px] px-3 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              {tools?.web && (
                <div className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                  Web
                </div>
              )}
              {tools?.code && (
                <div className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                  Code
                </div>
              )}
              {tools?.vision && (
                <div className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Vision
                </div>
              )}
              {memoryEnabled && (
                <div className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                    />
                  </svg>
                  Memory
                </div>
              )}
            </div>
          </div>
        )}

        <div
          className={`mx-auto max-w-[900px] px-3 ${
            compact ? "pt-0 pb-1" : "py-3"
          } relative`}
        >
          {/* Quick suggestions row - hidden when compact (empty state) */}
          {/* {!hasAnyVisibleCharacter && !isStreaming && !compact && (
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
        )} */}

          {/* Chat container - wraps text chat and controls */}
          <div className="flex items-center gap-2">
            {/* Chat box container - contains textarea and school + controls */}
            <div className="flex-1 relative bg-muted/50 border border-border rounded-2xl min-h-[52px] sm:min-h-[60px]">
              {/* Plus button - inside chat box, positioned dynamically */}
              {/* Show plus button when compact (no messages) - always show until school is selected in current session */}
              {onNewChat && compact && (
                <button
                  onClick={onNewChat}
                  className={`absolute z-30 pointer-events-auto focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg transition-all ${
                    isMultiLine
                      ? "bottom-2 left-2"
                      : input.length > 10
                      ? "left-3 top-1/2 -translate-y-1/2"
                      : "left-3 top-3"
                  }`}
                  aria-label="New chat"
                  style={{ zIndex: 30 }}
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-lg hover:bg-muted transition-colors bg-background/80 backdrop-blur-sm">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-foreground"
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
                  </div>
                </button>
              )}
              
              {/* Textarea - with padding left to avoid overlap with plus button when on left side */}
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
                className={`w-full ${
                  compact && !isMultiLine
                    ? "pl-10 sm:pl-12"
                    : compact && isMultiLine
                    ? "px-3"
                    : compact
                    ? "px-3"
                    : "px-4"
                } ${
                  compact
                    ? "pt-3 pb-12 sm:pb-12"
                    : "pt-5 pb-16 sm:pb-14"
                } bg-transparent resize-none focus:outline-none focus:ring-0 focus:border-border disabled:opacity-50 disabled:cursor-not-allowed transition-all max-h-[200px] sm:max-h-[320px] leading-[24px] sm:leading-normal`}
                style={{
                  minHeight: compact ? "44px" : "52px",
                }}
              />
              
              {/* School + Control div - inside box, at bottom */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1 sm:gap-2 pointer-events-none z-10">
                {/* School chip - left side */}
                <div className="flex items-center gap-1.5 pointer-events-auto flex-shrink-0">
                  {!compact && schoolName && (
                    <button
                      type="button"
                      onClick={onChangeSchool}
                      className="px-2 py-1 rounded-md bg-background border border-border text-[11px] leading-none text-muted-foreground max-w-[140px] sm:max-w-[180px] truncate hover:bg-muted transition-colors"
                      title="Change school"
                    >
                      {schoolName}
                    </button>
                  )}
                </div>

                {/* Controls - right side (role toggle + send button) */}
                <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto flex-shrink-0">
                  {/* Role toggle button with sliding background */}
                  <button
                    type="button"
                    onClick={() =>
                      handleRoleChange(
                        role === "student" ? "teacher" : "student"
                      )
                    }
                    className="relative px-0.5 sm:px-1 py-1 rounded-md bg-muted/50 border border-border hover:bg-muted transition-colors focus:outline-none focus:ring-0 text-[9px] sm:text-[10px] font-medium leading-tight overflow-hidden"
                    aria-label="Toggle role"
                  >
                    {/* Sliding background */}
                    <span
                      className={`absolute inset-y-1 rounded transition-all duration-300 ease-in-out bg-black ${
                        role === "student"
                          ? "left-1 right-1/2"
                          : "left-1/2 right-1"
                      }`}
                    />
                    <div className="relative flex items-center gap-0.5 sm:gap-1">
                      <span
                        className={`px-1.5 sm:px-2 py-0.5 rounded transition-colors duration-300 ${
                          role === "student"
                            ? "text-white font-semibold"
                            : "text-muted-foreground"
                        }`}
                      >
                        Student
                      </span>
                      <span
                        className={`px-1.5 sm:px-2 py-0.5 rounded transition-colors duration-300 ${
                          role === "teacher"
                            ? "text-white font-semibold"
                            : "text-muted-foreground"
                        }`}
                      >
                        Teacher
                      </span>
                    </div>
                  </button>

                  {/* Send/Stop button */}
                  {isStreaming && onStop ? (
                    <Button
                      onClick={onStop}
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg"
                      aria-label="Stop generating"
                    >
                      <svg
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4"
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
                      className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-black text-white hover:bg-black/90 disabled:opacity-50"
                      aria-label="Send message"
                    >
                      <svg
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19V5"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="m5 12 7-7 7 7"
                        />
                      </svg>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={modeDialogOpen} onOpenChange={setModeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {role === "teacher"
                ? "You’re now in Teacher mode."
                : "You’re now using the chatbot in Student mode."}
            </DialogTitle>
            <DialogDescription>
              {role === "teacher"
                ? "I’ll provide classroom resources, activity ideas, and teaching insights designed for educators."
                : "Responses will focus on learning support, explanations, and study guidance."}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Button className="w-full" onClick={() => setModeDialogOpen(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Composer;
