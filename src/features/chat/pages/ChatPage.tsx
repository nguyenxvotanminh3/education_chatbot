import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../core/store/hooks";
import { toast } from "react-toastify";
import { settingsService } from "../../auth/services/settingsService";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import ChatArea from "../components/ChatArea";
import Composer from "../components/Composer";
import CommandPalette from "../components/CommandPalette";
import OfflineBanner from "../components/OfflineBanner";
import NetworkErrorBanner from "../components/NetworkErrorBanner";
import RateLimitModal from "../components/RateLimitModal";
import ExportModal from "../components/ExportModal";
import { Conversation, NewMessage, ConversationTools } from "../types";
import UpgradeModal from "../components/UpgradeModal";
import prompts from "../data/prompts.json";
import { getRandomResponse } from "../data/mockResponses";
import SchoolPickerModal from "../components/SchoolPickerModal";
import { sessionService, UserSession } from "../services/sessionService";

const ChatPage = () => {
  const navigate = useNavigate();
  const userName = useAppSelector((s) => s.auth?.user?.name ?? "Guest");
  const user = useAppSelector((s) => s.auth?.user);
  const userId = user?.email || user?.id || null;
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [enterToSend, setEnterToSend] = useState(true);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [currentMessages, setCurrentMessages] = useState<NewMessage[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [model, setModel] = useState("GPT-4");
  const [tools, setTools] = useState<ConversationTools>({
    web: false,
    code: false,
    vision: false,
  });
  const [memoryEnabled, setMemoryEnabled] = useState(false);
  const [plan, setPlan] = useState<"Free" | "Go">(
    (localStorage.getItem("plan") as any) || "Free"
  );
  const [quotaUsed, setQuotaUsed] = useState<number>(
    parseInt(localStorage.getItem("quota_used") || "0", 10)
  );
  const quotaLimit = plan === "Free" ? 25 : null;
  const quotaRemaining =
    quotaLimit != null ? Math.max(quotaLimit - quotaUsed, 0) : null;
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [showNetworkError, setShowNetworkError] = useState(false);
  const [showRateLimit, setShowRateLimit] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [networkErrorMessage] = useState("");
  const [showSchoolPicker, setShowSchoolPicker] = useState(false);
  const [role, setRole] = useState<"student" | "teacher">("student");
  
  // Workflow state
  const [workflowStep, setWorkflowStep] = useState<1 | 2 | 3 | null>(null);
  const [session, setSession] = useState<UserSession>(() => sessionService.getSession());

  // Load settings on mount and when userId changes
  useEffect(() => {
    const settings = settingsService.getSettings(userId);
    setEnterToSend(settings.enterToSend);
  }, [userId]);

  // Listen for settings changes (poll every 2 seconds for simplicity)
  useEffect(() => {
    const interval = setInterval(() => {
      const settings = settingsService.getSettings(userId);
      setEnterToSend(settings.enterToSend);
    }, 2000);
    return () => clearInterval(interval);
  }, [userId]);

  // Load session on mount
  useEffect(() => {
    const savedSession = sessionService.getSession();
    setSession(savedSession);
    
    // Check if school should be remembered
    const rememberedSchool = sessionService.getRememberedSchool();
    if (rememberedSchool) {
      setSession({
        ...savedSession,
        schoolId: rememberedSchool.id,
        schoolName: rememberedSchool.name,
      });
    }
  }, []);

  // Load conversations only if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Only load conversations if user is logged in
      const stored = localStorage.getItem("conversations");
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Conversation[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setConversations(parsed);
            // Only auto-select first conversation if it has messages
            const firstConv = parsed[0];
            if (firstConv.messages && firstConv.messages.length > 0) {
              setSelectedConversationId(firstConv.id);
              setCurrentMessages(firstConv.messages);
              setTools(firstConv.tools || {});
              setMemoryEnabled(firstConv.memory?.enabled || false);
            } else {
              // First conversation has no messages, show starter prompts
              setSelectedConversationId(null);
              setCurrentMessages([]);
            }
          } else {
            // No conversations, show starter prompts
            setConversations([]);
            setSelectedConversationId(null);
            setCurrentMessages([]);
          }
        } catch (error) {
          console.error("Error parsing conversations:", error);
          // Clear corrupted data
          localStorage.removeItem("conversations");
          setConversations([]);
          setSelectedConversationId(null);
          setCurrentMessages([]);
        }
      } else {
        // No stored conversations, show starter prompts
        setConversations([]);
        setSelectedConversationId(null);
        setCurrentMessages([]);
      }
    } else {
      // User not authenticated - ALWAYS clear and show starter prompts
      setConversations([]);
      setSelectedConversationId(null);
      setCurrentMessages([]);
      setTools({ web: false, code: false, vision: false });
      setMemoryEnabled(false);
    }
  }, [isAuthenticated]);

  // Persist conversations (only if authenticated)
  useEffect(() => {
    if (isAuthenticated && conversations.length > 0) {
      localStorage.setItem("conversations", JSON.stringify(conversations));
    }
  }, [conversations, isAuthenticated]);

  // Update messages when conversation changes
  useEffect(() => {
    if (selectedConversationId) {
      const conv = conversations.find((c) => c.id === selectedConversationId);
      if (conv) {
        setCurrentMessages(conv.messages);
        setTools(conv.tools || {});
        setMemoryEnabled(conv.memory?.enabled || false);
      }
    } else {
      setCurrentMessages([]);
    }
  }, [selectedConversationId, conversations]);

  // Keyboard shortcut for command palette (Cmd/Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const currentConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  const handleNewChat = () => {
    setSelectedConversationId(null);
    setCurrentMessages([]);
    setIsStreaming(false);
    setWorkflowStep(null);
    
    // Check if we need to show school picker
    const rememberedSchool = sessionService.getRememberedSchool();
    if (!rememberedSchool && !session.schoolId) {
      setShowSchoolPicker(true);
    } else if (rememberedSchool) {
      // Use remembered school and start workflow
      setSession({
        ...session,
        schoolId: rememberedSchool.id,
        schoolName: rememberedSchool.name,
      });
      // Start workflow step 1
      setWorkflowStep(1);
      // Send initial workflow message
      setTimeout(() => {
        const initialMessage: NewMessage = {
          id: `msg_${Date.now()}`,
          role: "assistant",
          contentMd: prompts.workflow.step1,
          timestamp: Date.now(),
        };
        setCurrentMessages([initialMessage]);
      }, 100);
    } else {
      // Has school but start fresh workflow
      setWorkflowStep(1);
      setTimeout(() => {
        const initialMessage: NewMessage = {
          id: `msg_${Date.now()}`,
          role: "assistant",
          contentMd: prompts.workflow.step1,
          timestamp: Date.now(),
        };
        setCurrentMessages([initialMessage]);
      }, 100);
    }
  };

  const handleSchoolSelect = (school: { id: string; name: string }, remember: boolean) => {
    const newSession = {
      ...session,
      schoolId: school.id,
      schoolName: school.name,
    };
    setSession(newSession);
    sessionService.saveSession(newSession);
    sessionService.setRememberSchool(remember);
    setShowSchoolPicker(false);
    
    // Start workflow after school selection
    setWorkflowStep(1);
    setTimeout(() => {
      const initialMessage: NewMessage = {
        id: `msg_${Date.now()}`,
        role: "assistant",
        contentMd: prompts.workflow.step1,
        timestamp: Date.now(),
      };
      setCurrentMessages([initialMessage]);
    }, 100);
  };

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    setIsStreaming(false);
  };

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    if (plan === "Free" && quotaUsed >= 25) {
      setShowUpgrade(true);
      return;
    }

    // Create user message
    const userMessage: NewMessage = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: content,
      timestamp: Date.now(),
    };

    // If no conversation selected, create new one
    if (!selectedConversationId) {
      const newConversation: Conversation = {
        id: `conv_${Date.now()}`,
        title: content.slice(0, 50),
        pinned: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [userMessage],
        tools,
        memory: { enabled: memoryEnabled },
      };
      setConversations([newConversation, ...conversations]);
      setSelectedConversationId(newConversation.id);
      setCurrentMessages([userMessage]);
    } else {
      // Add to existing conversation
      setCurrentMessages((prev) => [...prev, userMessage]);
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversationId
            ? {
                ...conv,
                messages: [...conv.messages, userMessage],
                updatedAt: Date.now(),
              }
            : conv
        )
      );
    }

    // Quota accounting (user message deducts 1)
    if (plan === "Free") {
      const nextUsed = quotaUsed + 1;
      setQuotaUsed(nextUsed);
      localStorage.setItem("quota_used", String(nextUsed));
    }

    // Handle workflow steps
    if (workflowStep === 1) {
      // Step 1: User provides subject and grade
      // Parse user input to extract subject and grade
      const lowerContent = content.toLowerCase();
      const subjects = ['math', 'science', 'english', 'physics', 'chemistry', 'biology', 'history', 'geography'];
      const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'grade'];
      
      let detectedSubject = '';
      let detectedGrade = '';
      
      for (const subject of subjects) {
        if (lowerContent.includes(subject)) {
          detectedSubject = subject;
          break;
        }
      }
      
      for (const grade of grades) {
        if (lowerContent.includes(grade)) {
          const match = lowerContent.match(/(grade\s*)?(\d+)/i);
          if (match) {
            detectedGrade = match[2] || match[1];
          }
          break;
        }
      }
      
      if (detectedSubject || detectedGrade) {
        const newSession = {
          ...session,
          subject: detectedSubject || session.subject,
          grade: detectedGrade || session.grade,
        };
        setSession(newSession);
        sessionService.saveSession(newSession);
        setWorkflowStep(2);
        
        // Respond with step 2
        setIsStreaming(true);
        setTimeout(() => {
          const assistantMessage: NewMessage = {
            id: `msg_${Date.now() + 1}`,
            role: "assistant",
            contentMd: prompts.workflow.step2,
            timestamp: Date.now() + 1000,
            streamed: true,
          };
          setCurrentMessages((prev) => [...prev, assistantMessage]);
          setIsStreaming(false);
        }, 600);
        return;
      }
    } else if (workflowStep === 2) {
      // Step 2: User provides chapter/topic
      const newSession = {
        ...session,
        topic: content,
      };
      setSession(newSession);
      sessionService.saveSession(newSession);
      setWorkflowStep(3);
      
      // Respond with step 3
      setIsStreaming(true);
      setTimeout(() => {
        const assistantMessage: NewMessage = {
          id: `msg_${Date.now() + 1}`,
          role: "assistant",
          contentMd: prompts.workflow.step3,
          timestamp: Date.now() + 1000,
          streamed: true,
        };
        setCurrentMessages((prev) => [...prev, assistantMessage]);
        setIsStreaming(false);
      }, 600);
      return;
    } else if (workflowStep === 3) {
      // Step 3: User provides specific problem - now generate actual response
      setWorkflowStep(null); // Clear workflow, proceed with normal chat
    }

    // Prepare API call data with role and context
    // Note: In production, this would call the actual API
    // const apiData = {
    //   userInput: content,
    //   role: role, // Send role to backend
    //   schoolId: session.schoolId,
    //   schoolName: session.schoolName,
    //   grade: session.grade,
    //   subject: session.subject,
    //   previousChat: currentMessages.map((m) => ({
    //     user: m.role === 'user' ? m.content : '',
    //     gemini: m.role === 'assistant' ? m.contentMd : '',
    //   })),
    // };

    // TODO: Replace with actual API call when backend is ready
    // const response = await chatService.createChat(apiData);

    // Simulate streaming response
    setIsStreaming(true);
    
    // Generate random response with slight delay for realistic streaming
    const delay = 800 + Math.random() * 400; // 800-1200ms
    setTimeout(() => {
      // Get random response in English based on user input
      // Use role-aware prompt if needed
      const reply = getRandomResponse(content);

      const assistantMessage: NewMessage = {
        id: `msg_${Date.now() + 1}`,
        role: "assistant",
        contentMd: reply,
        timestamp: Date.now() + 1000,
        streamed: true,
      };

      setCurrentMessages((prev) => [...prev, assistantMessage]);
      if (selectedConversationId) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, assistantMessage],
                  updatedAt: Date.now(),
                }
              : conv
          )
        );
      }
      setIsStreaming(false);
    }, delay);
  };

  const handleStopStreaming = () => {
    setIsStreaming(false);
    toast.info("Stopped generating response");
  };

  const handleCopy = (_content: string) => {
    toast.success("Copied to clipboard");
  };

  const handleShare = (_messageId: string) => {
    // Share is handled in ShareModal component
  };

  const handleRegenerate = (messageId: string) => {
    const message = currentMessages.find((m) => m.id === messageId);
    if (!message || message.role !== "assistant") return;

    // Create a new variant
    const variantId = `var_${Date.now()}`;
    const newVariant = {
      id: variantId,
      contentMd: `Regenerated response for: "${message.contentMd?.slice(0, 50)}..."`,
      timestamp: Date.now(),
    };

    // Update message with new variant
    setCurrentMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              variants: [...(msg.variants || []), newVariant],
              selectedVariantId: variantId,
            }
          : msg
      )
    );

    // Update conversation
    if (selectedConversationId) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversationId
            ? {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.id === messageId
                    ? {
                        ...msg,
                        variants: [...(msg.variants || []), newVariant],
                        selectedVariantId: variantId,
                      }
                    : msg
                ),
                updatedAt: Date.now(),
              }
            : conv
        )
      );
    }

    toast.success("Response regenerated");
  };

  const handleLike = (messageId: string, like: boolean) => {
    setCurrentMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              feedback: { ...msg.feedback, like, dislike: !like },
            }
          : msg
      )
    );
  };

  const handlePin = (messageId: string) => {
    setCurrentMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, pinned: !msg.pinned } : msg
      )
    );

    if (selectedConversationId) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversationId
            ? {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.id === messageId ? { ...msg, pinned: !msg.pinned } : msg
                ),
              }
            : conv
        )
      );
    }

    toast.success("Message pinned");
  };

  const handleQuote = (_messageId: string, content: string) => {
    // This would insert quoted text into composer
    // For now, just show a toast
    toast.info(`Quoted: ${content.slice(0, 50)}...`);
  };

  const handleContinue = (messageId: string) => {
    const message = currentMessages.find((m) => m.id === messageId);
    if (!message) return;

    // Send a continue prompt
    handleSendMessage("Continue from where you left off");
    toast.info("Continuing response...");
  };

  const handleEdit = (messageId: string, newContent: string) => {
    // Update the message
    setCurrentMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              content: newContent,
              isEdited: true,
              originalContent: msg.originalContent || msg.content,
            }
          : msg
      )
    );

    // Resend with new content
    handleSendMessage(newContent);
    toast.success("Message edited and resent");
  };

  const handleSelectVariant = (messageId: string, variantId: string) => {
    setCurrentMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, selectedVariantId: variantId } : msg
      )
    );

    if (selectedConversationId) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversationId
            ? {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.id === messageId
                    ? { ...msg, selectedVariantId: variantId }
                    : msg
                ),
              }
            : conv
        )
      );
    }
  };

  const handleFeedback = (
    messageId: string,
    feedback: {
      like?: boolean;
      dislike?: boolean;
      note?: string;
      reason?: string;
    }
  ) => {
    setCurrentMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, feedback } : msg
      )
    );

    if (selectedConversationId) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversationId
            ? {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.id === messageId ? { ...msg, feedback } : msg
                ),
              }
            : conv
        )
      );
    }

    toast.success("Feedback submitted. Thank you!");
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== id));
    if (selectedConversationId === id) {
      handleNewChat();
    }
    toast.success("Conversation deleted");
  };

  const handlePinConversation = (id: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === id ? { ...conv, pinned: !conv.pinned } : conv
      )
    );
  };

  const handleExport = () => {
    if (currentConversation) {
      setShowExportModal(true);
    } else {
      toast.error("No conversation to export");
    }
  };

  const handleToggleTool = (tool: keyof ConversationTools) => {
    setTools((prev) => ({
      ...prev,
      [tool]: !prev[tool],
    }));
  };

  const handleToggleMemory = () => {
    setMemoryEnabled((prev) => !prev);
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Global Error States */}
      <OfflineBanner />
      <NetworkErrorBanner
        show={showNetworkError}
        message={networkErrorMessage}
        onRetry={() => {
          setShowNetworkError(false);
          // Retry last action
          toast.info("Retrying...");
        }}
        onDismiss={() => setShowNetworkError(false)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - hidden when not authenticated */}
        {isAuthenticated && (
          <div
            className={`fixed md:relative z-20 md:z-auto left-0 top-0 h-full transition-all duration-300 ease-out ${
              isSidebarCollapsed
                ? "w-14 md:w-16 -translate-x-full md:translate-x-0"
                : "w-80 translate-x-0"
            }`}
          >
            <Sidebar
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              onSelectConversation={(id) => {
                handleSelectConversation(id);
                if (window.innerWidth < 768) {
                  setIsSidebarCollapsed(true);
                }
              }}
              onNewChat={() => {
                handleNewChat();
                if (window.innerWidth < 768) {
                  setIsSidebarCollapsed(true);
                }
              }}
              onDeleteConversation={handleDeleteConversation}
              onPinConversation={handlePinConversation}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() =>
                setIsSidebarCollapsed(!isSidebarCollapsed)
              }
              userName={userName}
              plan={plan}
            />
          </div>
        )}

        {/* Overlay for mobile */}
        {isAuthenticated && !isSidebarCollapsed && (
          <div
            className="absolute inset-0 bg-black/50 z-10 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarCollapsed(true)}
          />
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          {/* Mobile menu button */}
          {isSidebarCollapsed && (
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="absolute top-4 left-4 z-30 md:hidden p-2 rounded-lg bg-background border border-border hover:bg-accent transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}

          {/* Top Bar */}
          <TopBar
            currentConversation={currentConversation || null}
            model={model}
            tools={tools}
            memoryEnabled={memoryEnabled}
            onModelChange={setModel}
            onToggleTool={handleToggleTool}
            onToggleMemory={handleToggleMemory}
            onNewChat={handleNewChat}
            onExport={handleExport}
            onSettings={() => navigate("/settings")}
          />

          {/* Context selectors removed as requested */}

          {/* Chat Messages */}
          <ChatArea
            messages={currentMessages}
            conversationId={selectedConversationId || undefined}
            isStreaming={isStreaming}
            onCopy={handleCopy}
            onShare={handleShare}
            onRegenerate={handleRegenerate}
            onLike={handleLike}
            onPin={handlePin}
            onQuote={handleQuote}
            onContinue={handleContinue}
            onEdit={handleEdit}
            onSelectVariant={handleSelectVariant}
            onFeedback={handleFeedback}
            onSuggestionClick={handleSendMessage}
            userName={userName}
          />

          {/* Composer */}
          <Composer
            onSend={handleSendMessage}
            onStop={handleStopStreaming}
            isStreaming={isStreaming}
            disabled={plan === "Free" && quotaUsed >= 25}
            tools={tools}
            memoryEnabled={memoryEnabled}
            enterToSend={enterToSend}
            role={role}
            onRoleChange={(newRole) => {
              setRole(newRole);
              const updatedSession = { ...session, role: newRole };
              setSession(updatedSession);
              sessionService.saveSession(updatedSession);
            }}
          />
          {/* Quota indicator */}
          <div className="px-6 py-2 text-xs text-muted-foreground text-center">
            {plan === "Free" ? (
              <span>
                {quotaRemaining} / 25 messages left.{" "}
                <button
                  className="underline text-primary hover:text-primary/80"
                  onClick={() => setShowUpgrade(true)}
                >
                  Upgrade
                </button>
              </span>
            ) : (
              <span>Plan Go: Unlimited messages</span>
            )}
          </div>
          <UpgradeModal
            open={showUpgrade}
            onClose={() => setShowUpgrade(false)}
            onUpgrade={() => {
              localStorage.setItem("plan", "Go");
              localStorage.removeItem("quota_used");
              setPlan("Go");
              setQuotaUsed(0);
              setShowUpgrade(false);
              toast.success("Upgraded to Go (mock)");
            }}
          />

          {/* Rate Limit Modal */}
          <RateLimitModal
            open={showRateLimit}
            onClose={() => setShowRateLimit(false)}
            onUpgrade={() => {
              setShowRateLimit(false);
              setShowUpgrade(true);
            }}
            plan={plan}
            remainingTime={3600}
          />

          {/* Export Modal */}
          <ExportModal
            open={showExportModal}
            onClose={() => setShowExportModal(false)}
            conversation={currentConversation || null}
          />

          {/* Command Palette */}
          <CommandPalette
            open={commandPaletteOpen}
            onClose={() => setCommandPaletteOpen(false)}
            onModelChange={setModel}
            onToggleTool={(tool: string) => handleToggleTool(tool as keyof ConversationTools)}
            onToggleMemory={handleToggleMemory}
            onNewChat={handleNewChat}
            onSettings={() => navigate("/settings")}
            onExport={handleExport}
            conversations={conversations}
            onSelectConversation={handleSelectConversation}
          />
          
          {/* School Picker Modal */}
          <SchoolPickerModal
            open={showSchoolPicker}
            onClose={() => setShowSchoolPicker(false)}
            onSelect={handleSchoolSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
