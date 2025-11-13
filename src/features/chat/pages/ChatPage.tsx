import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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
import { NewMessage, ConversationTools } from "../types";
import UpgradeModal from "../components/UpgradeModal";
import prompts from "../data/prompts.json";
import { chatService } from "../services/chatService";
import SchoolPickerModal from "../components/SchoolPickerModal";
import { sessionService } from "../services/sessionService";
import { useConversations } from "../hooks/useConversations";

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id?: string }>();
  const conversationIdFromUrl = params.id;
  const userName = useAppSelector((s) => s.auth?.user?.name ?? "Guest");
  const user = useAppSelector((s) => s.auth?.user);
  const userId = user?.email || user?.id || null;
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  // Use conversations hook for Redux state management
  const {
    conversations,
    selectedConversation,
    selectedConversationId,
    selectConversation,
    create: createConversation,
    update: updateConversation,
    remove: deleteConversation,
    addMessage: addMessageToConversation,
    updateLocal,
    refetch: refetchConversations,
  } = useConversations();

  const [enterToSend, setEnterToSend] = useState(true);
  const [currentMessages, setCurrentMessages] = useState<NewMessage[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  
  // Clear messages immediately when authentication state changes to false
  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentMessages([]);
      setIsStreaming(false);
    }
  }, [isAuthenticated]);
  const [model, setModel] = useState("Easy Government Schools");
  const [tools, setTools] = useState<ConversationTools>({
    web: false,
    code: false,
    vision: false,
  });
  const [memoryEnabled, setMemoryEnabled] = useState(false);

  // Get plan from user data in Redux store
  const getUserPlan = (): "Free" | "Go" => {
    if (user?.plan) {
      const planLower = user.plan.toLowerCase();
      if (planLower === "free") return "Free";
      if (planLower === "go") return "Go";
      // Fallback for other plan types
      const planMap: Record<string, "Free" | "Go"> = {
        starter: "Go",
        pro: "Go",
        enterprise: "Go",
      };
      return planMap[planLower] || "Free";
    }
    // Fallback to subscription planName if available
    if (user?.subscription?.planName) {
      const planName = user.subscription.planName.toLowerCase();
      if (planName.includes("free")) return "Free";
      if (planName.includes("go")) return "Go";
    }
    return "Free";
  };

  const plan = getUserPlan();
  const [quotaUsed, setQuotaUsed] = useState<number>(
    parseInt(localStorage.getItem("quota_used") || "0", 10)
  );
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [showNetworkError, setShowNetworkError] = useState(false);
  const [showRateLimit, setShowRateLimit] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [networkErrorMessage] = useState("");
  const [showSchoolPicker, setShowSchoolPicker] = useState(false);
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [pendingSchoolName, setPendingSchoolName] = useState<string | null>(
    null
  );
  // Guest conversation ID (for frontend state tracking, not persisted)
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);

  // Guest sessionId from response (stored in memory only, lost on refresh)
  // This is the sessionId returned from External API, used for subsequent chats in the same session
  const [guestSessionIdFromResponse, setGuestSessionIdFromResponse] = useState<
    string | null
  >(null);

  // Guest school name (stored in localStorage, linked to guestSessionId)
  const [guestSchoolName, setGuestSchoolName] = useState<string | null>(() => {
    // Load guest school name from localStorage on mount
    if (typeof window !== "undefined") {
      return localStorage.getItem("guest_school_name");
    }
    return null;
  });

  // Ensure guest session persists across refresh/navigation
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!guestSessionId) {
      const stored = localStorage.getItem("guest_session_id");
      if (stored) {
        setGuestSessionId(stored);
      }
    }
  }, [guestSessionId]);

  // Workflow state
  const [workflowStep, setWorkflowStep] = useState<1 | 2 | 3 | null>(null);

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

  // Track previous conversation ID to detect conversation switches
  const prevConversationIdRef = useRef<string | null>(null);
  // Track previous URL to prevent unnecessary navigation
  const prevUrlRef = useRef<string | null>(null);
  // Flag to prevent recursive updates
  const isSyncingRef = useRef(false);

  // Update messages when conversation ID changes (user switches conversations)
  // This prevents overwriting currentMessages when Redux state updates for the same conversation
  useEffect(() => {
    const currentConversationId = selectedConversation?.id || null;
    const conversationChanged =
      prevConversationIdRef.current !== currentConversationId;

    if (selectedConversation) {
      // Only update messages if conversation ID changed (user switched conversations)
      // This prevents overwriting currentMessages when Redux updates for the same conversation
      // When conversation first loads, prevConversationIdRef will be null/different, so it will update
      if (conversationChanged) {
        setCurrentMessages(selectedConversation.messages);
        prevConversationIdRef.current = currentConversationId;
      }

      // Update URL if conversation has messages and URL doesn't match
      // Only navigate if not currently syncing to prevent recursive loop
      const expectedUrl = `/app/${selectedConversation.id}`;
      if (
        selectedConversation.messages.length > 0 &&
        conversationIdFromUrl !== selectedConversation.id &&
        !isSyncingRef.current &&
        prevUrlRef.current !== expectedUrl
      ) {
        prevUrlRef.current = expectedUrl;
        navigate(expectedUrl, { replace: true });
      }
    } else if (isAuthenticated) {
      // Only clear messages for authenticated users
      // Guest messages are managed separately
      if (conversationChanged) {
        setCurrentMessages([]);
        prevConversationIdRef.current = null;
      }

      // Navigate to /app if no conversation selected and URL has ID
      // Only navigate if not currently syncing to prevent recursive loop
      if (
        conversationIdFromUrl &&
        !isSyncingRef.current &&
        prevUrlRef.current !== "/app"
      ) {
        prevUrlRef.current = "/app";
        navigate("/app", { replace: true });
      }
    }
  }, [
    selectedConversation?.id,
    isAuthenticated,
    conversationIdFromUrl,
    navigate,
    selectedConversation?.messages.length,
  ]);

  // Update tools and memory when conversation changes (separate from messages to avoid overwriting)
  useEffect(() => {
    if (selectedConversation) {
      setTools(selectedConversation.tools || {});
      setMemoryEnabled(selectedConversation.memory?.enabled || false);
    }
  }, [selectedConversation?.tools, selectedConversation?.memory]);

  // Track previous authentication state to detect logout
  const prevIsAuthenticatedRef = useRef(isAuthenticated);

  // Clear messages and navigate when user logs out
  useEffect(() => {
    // Only clear if user was authenticated before and now is not (logout happened)
    const wasAuthenticated = prevIsAuthenticatedRef.current;
    const isNowUnauthenticated = !isAuthenticated;

    if (wasAuthenticated && isNowUnauthenticated) {
      // User just logged out - clear everything
      console.log("[Logout] Clearing conversation data...");

      // Clear all messages
      setCurrentMessages([]);
      selectConversation(null);
      setIsStreaming(false);
      setWorkflowStep(null);

      // Clear guest session data from localStorage
      setGuestSessionId(null);
      setGuestSchoolName(null);
      localStorage.removeItem("guest_session_id");
      localStorage.removeItem("guest_school_name");

      // Navigate to /app if currently on /app/:id
      if (conversationIdFromUrl) {
        navigate("/app", { replace: true });
      }
    }

    // Update ref for next comparison
    prevIsAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated, conversationIdFromUrl, navigate, selectConversation]);

  // Load conversation from URL if ID is provided
  // This syncs URL -> Redux state (one direction only)
  useEffect(() => {
    // Skip if already syncing to prevent recursive updates
    if (isSyncingRef.current) {
      return;
    }

    if (
      conversationIdFromUrl &&
      isAuthenticated &&
      conversationIdFromUrl !== selectedConversationId
    ) {
      // Set syncing flag to prevent recursive navigation
      isSyncingRef.current = true;
      
      // Check if conversation exists in Redux store
      const conversationFromStore = conversations.find(
        (c) => c.id === conversationIdFromUrl
      );
      if (conversationFromStore) {
        selectConversation(conversationIdFromUrl);
      } else {
        // TODO: Fetch conversation from API if not in store
        // For now, just select it (will be loaded when conversations are fetched)
        selectConversation(conversationIdFromUrl);
      }
      
      // Clear syncing flag after navigation completes
      // Use requestAnimationFrame to ensure state updates are processed
      requestAnimationFrame(() => {
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 50);
      });
    } else if (!conversationIdFromUrl && selectedConversationId && isAuthenticated) {
      // If URL has no ID but we have a selected conversation, clear selection
      // This handles the case when user navigates to /app
      isSyncingRef.current = true;
      selectConversation(null);
      requestAnimationFrame(() => {
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 50);
      });
    }
  }, [
    conversationIdFromUrl,
    isAuthenticated,
    selectedConversationId,
    conversations,
    selectConversation,
  ]);

  // Redirect root path (/) to /app on initial load
  useEffect(() => {
    if (location.pathname === "/" && !conversationIdFromUrl) {
      navigate("/app", { replace: true });
    }
  }, [location.pathname, conversationIdFromUrl, navigate]);

  // Guest messages are only stored in state (not persisted)
  // When page reloads, messages will be lost (expected behavior for guest)

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

  const currentConversation = selectedConversation;

  const deriveConversationTitle = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return "Untitled";
    const singleLine = trimmed.split(/\n+/)[0];
    return singleLine.length > 60 ? `${singleLine.slice(0, 60)}…` : singleLine;
  };

  const handleNewChat = () => {
    // Just clear selection, don't create conversation yet
    // Conversation will be created when user sends first message
    selectConversation(null);
    setCurrentMessages([]);
    setIsStreaming(false);
    setWorkflowStep(null);
    setPendingSchoolName(null);
    // For guest users, keep guestSchoolName (don't clear it)
    // For authenticated users, schoolName is stored in conversation

    // Navigate to /app (no ID) when starting new chat
    navigate("/app", { replace: true });
  };

  const handleSchoolSelect = (
    school: { name: string },
    _remember: boolean // Keep for backward compatibility but not used (school is per conversation now)
  ) => {
    const schoolName = school.name;

    // If user changes school, start a new session/conversation
    if (!isAuthenticated) {
      const prev = guestSchoolName;
      if (prev && prev !== schoolName) {
        // reset guest session and clear messages
        setGuestSessionId(null);
        localStorage.removeItem("guest_session_id");
        setCurrentMessages([]);
        selectConversation(null);
        navigate("/app", { replace: true });
      }
    } else {
      const prev = selectedConversation?.schoolName || null;
      if (prev && prev !== schoolName) {
        // start a new conversation for a new school
        selectConversation(null);
        setCurrentMessages([]);
        navigate("/app", { replace: true });
      }
    }

    // Store school name for the conversation that will be created
    setPendingSchoolName(schoolName);

    // For guest users, also save to localStorage so it persists across requests
    if (!isAuthenticated) {
      setGuestSchoolName(schoolName);
      localStorage.setItem("guest_school_name", schoolName);
    }

    setShowSchoolPicker(false);

    // If there's a pending message, send it now with the school name
    if (pendingMessage) {
      const messageToSend = pendingMessage;
      setPendingMessage(null);
      // Small delay to ensure modal is closed
      setTimeout(() => {
        handleSendMessage(messageToSend, schoolName);
      }, 100);
    }
  };

  const handleSelectConversation = (id: string) => {
    selectConversation(id);
    setIsStreaming(false);
  };

  const handleSendMessage = async (content: string, schoolName?: string) => {
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

    // Store conversationId for chat API (will be set if we create a new conversation)
    let conversationIdForChat: string | undefined;
    let finalSchoolName: string | undefined;

    // For guest users: Backend handles guest ID via cookie now
    // But we still need conversationId for frontend state tracking
    if (!isAuthenticated) {
      // Generate conversationId for guest if not exists (for frontend state tracking)
      // This is different from backend cookie-based guest ID
      if (!guestSessionId) {
        const newSessionId = `guest_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        setGuestSessionId(newSessionId);
        localStorage.setItem("guest_session_id", newSessionId);
        conversationIdForChat = newSessionId;
      } else {
        conversationIdForChat = guestSessionId;
      }

      // Use pendingSchoolName, guestSchoolName (from localStorage), or passed schoolName
      finalSchoolName = pendingSchoolName || guestSchoolName || schoolName;

      // If no school name, show school picker and store pending message
      // DON'T add message to state yet - wait until school is selected
      if (!finalSchoolName) {
        setPendingMessage(content);
        setShowSchoolPicker(true);
        return; // Exit early, don't add message or send request
      }

      // Save schoolName to localStorage for future requests
      if (finalSchoolName && finalSchoolName !== guestSchoolName) {
        setGuestSchoolName(finalSchoolName);
        localStorage.setItem("guest_school_name", finalSchoolName);
      }

      // Only add message to state AFTER we have schoolName
      setCurrentMessages((prev) => [...prev, userMessage]);
      setPendingSchoolName(null); // Clear pending school name (but keep guestSchoolName)
    }
    // For authenticated users: create or use existing conversation
    else if (!selectedConversationId) {
      // Use pendingSchoolName if available, otherwise use passed schoolName
      finalSchoolName = pendingSchoolName || schoolName;

      // If no school name, show school picker and store pending message
      if (!finalSchoolName) {
        setPendingMessage(content);
        setShowSchoolPicker(true);
        return;
      }

      // Create new conversation with school name (sync with backend)
      try {
        const newConversation = await createConversation({
          title: deriveConversationTitle(content),
          pinned: false,
          messages: [userMessage],
          tools,
          memory: { enabled: memoryEnabled },
          schoolName: finalSchoolName,
        });
        conversationIdForChat = newConversation.id; // Store ID for chat API call
        selectConversation(newConversation.id);
        setCurrentMessages([userMessage]);
        setPendingSchoolName(null); // Clear pending school name

        // Navigate to /app/:id when conversation is created
        navigate(`/app/${newConversation.id}`, { replace: true });
      } catch (error) {
        console.error("Failed to create conversation:", error);
        toast.error("Failed to create conversation. Please try again.");
        return;
      }
    } else {
      // Add to existing conversation (optimistic local update only)
      // Backend will save messages when chat API is called
      setCurrentMessages((prev) => [...prev, userMessage]);
      addMessageToConversation(selectedConversationId, userMessage);

      // Update conversation title if needed (only title, not messages)
      const currentConv = conversations.find(
        (c) => c.id === selectedConversationId
      );
      if (
        currentConv &&
        (currentConv.messages.length === 0 ||
          !currentConv.title ||
          currentConv.title === "New chat")
      ) {
        updateLocal(selectedConversationId, {
          title: deriveConversationTitle(content),
        });
        // Sync only title with backend (messages will be saved by chat API)
        updateConversation(selectedConversationId, {
          title: deriveConversationTitle(content),
        }).catch((error) => {
          console.error("Failed to update conversation title:", error);
        });
      }
      // Note: We don't save user message to backend here
      // Backend will save both user and assistant messages when chat API is called
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
      const subjects = [
        "math",
        "science",
        "english",
        "physics",
        "chemistry",
        "biology",
        "history",
        "geography",
      ];
      const grades = [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "grade",
      ];

      let detectedSubject = "";
      let detectedGrade = "";

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
        // Save subject and grade to session (for workflow, not school)
        const currentSession = sessionService.getSession();
        const newSession = {
          ...currentSession,
          subject: detectedSubject || currentSession.subject,
          grade: detectedGrade || currentSession.grade,
        };
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
      const currentSession = sessionService.getSession();
      const newSession = {
        ...currentSession,
        topic: content,
      };
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
    const session = sessionService.getSession();
    // Use conversationIdForChat if we just created a new conversation, otherwise use selectedConversationId
    // For guest, use guestSessionId; for authenticated users, use conversationId
    const finalConversationId =
      conversationIdForChat ||
      (!isAuthenticated ? guestSessionId : selectedConversationId) ||
      undefined;

    // Get sessionId from current conversation (for authenticated users)
    // For guest users: Get sessionId from state (memory only, lost on refresh)
    // NOTE: Backend will use this sessionId for guest users, or create new one if not provided
    let sessionIdForRequest: string | undefined = undefined;
    if (isAuthenticated) {
      sessionIdForRequest = currentConversation?.sessionId || undefined;
    } else {
      // For guest users: Use sessionId from state (from previous response)
      // First chat: sessionId will be undefined, backend will create new one
      // Subsequent chats: sessionId will be from state (from previous response)
      // After refresh: sessionId will be undefined again (state is lost)
      sessionIdForRequest = guestSessionIdFromResponse || undefined;
    }

    const apiData = {
      userInput: content,
      conversationId: finalConversationId, // Send conversationId - backend will load session_id from database
      sessionId: sessionIdForRequest, // Optional: send if available, but backend will use conversation.session_id from DB
      role: role, // Send role to backend
      schoolName: currentConversation?.schoolName || finalSchoolName, // School name from conversation
      grade: session.grade,
      subject: session.subject,
      topic: session.topic,
      previousChat: currentMessages.map((m) => ({
        user: m.role === "user" ? m.content : "",
        gemini: m.role === "assistant" ? m.contentMd : "",
      })),
    };

    // Call backend API to get response
    setIsStreaming(true);

    try {
      const response = await chatService.createChat(apiData);

      const assistantMessage: NewMessage = {
        id: response.message.id || `msg_${Date.now() + 1}`,
        role: "assistant",
        contentMd: response.message.contentMd || response.message.content,
        timestamp: response.message.timestamp || Date.now(),
        streamed: true,
      };

      setCurrentMessages((prev) => [...prev, assistantMessage]);

      // For guest: Backend handles guest ID via cookie for rate limiting
      // But we still use conversationId (guestSessionId) for frontend state tracking
      if (!isAuthenticated) {
        // Guest messages are stored in local state only (no backend conversation)
        // conversationId is used for frontend state tracking
        // Backend cookie (ci) is used for rate limiting
        // Update conversationId from response if backend returned one
        if (
          response.chatHistoryId &&
          response.chatHistoryId !== guestSessionId
        ) {
          setGuestSessionId(response.chatHistoryId);
        }
        // Save sessionId from response to state (memory only, lost on refresh)
        // This allows us to send sessionId in subsequent chats for the same session
        if (response.sessionId) {
          setGuestSessionIdFromResponse(response.sessionId);
        }
      } else if (selectedConversationId) {
        // For authenticated users: update local state and sync with backend
        addMessageToConversation(selectedConversationId, assistantMessage);

        // Update sessionId in conversation if received from backend
        // Backend saves sessionId to conversation, so we update local state to match
        if (
          response.sessionId &&
          response.sessionId !== currentConversation?.sessionId
        ) {
          updateLocal(selectedConversationId, {
            sessionId: response.sessionId,
          });
        }

        // NOTE: We don't refetch conversations here to avoid overwriting currentMessages
        // Backend saves messages automatically, and we've already updated local state
        // Refetching would cause race conditions where backend might not have saved yet,
        // or the refetch would overwrite our optimistic updates with stale data
        // Conversations will be synced when user switches conversations or reloads page
      }
    } catch (error: any) {
      console.error("Failed to get chat response:", error);

      // Handle rate limit error specifically
      if (
        error?.response?.status === 429 ||
        error?.response?.data?.error === "RATE_LIMIT_EXCEEDED"
      ) {
        const rateLimitData = error?.response?.data;
        const errorMessage = rateLimitData?.message || "Rate limit exceeded";

        toast.error(errorMessage);
        setShowRateLimit(true);

        // Don't add error message to chat, just show toast
        return;
      }

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to get response from chat API. Please try again.";

      // Create error message as assistant message
      const errorMessageObj: NewMessage = {
        id: `error_${Date.now()}`,
        role: "assistant",
        content: errorMessage,
        contentMd: errorMessage,
        timestamp: Date.now(),
        isError: true,
      };

      setCurrentMessages((prev) => [...prev, errorMessageObj]);
      toast.error(errorMessage);
    } finally {
      setIsStreaming(false);
    }
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

  const handleRegenerate = async (messageId: string) => {
    const message = currentMessages.find((m) => m.id === messageId);
    if (!message || message.role !== "assistant") return;

    // Find the user message that came before this assistant message
    const messageIndex = currentMessages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) return;

    // Find the previous user message
    let userMessage: NewMessage | undefined;
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (currentMessages[i].role === "user") {
        userMessage = currentMessages[i];
        break;
      }
    }

    if (!userMessage) {
      toast.error("Cannot regenerate: No user message found");
      return;
    }

    // Get conversation context
    const session = sessionService.getSession();
    const finalConversationId =
      (!isAuthenticated ? guestSessionId : selectedConversationId) || undefined;
    const finalSchoolName =
      currentConversation?.schoolName || guestSchoolName || undefined;

    // Get sessionId from current conversation (for authenticated users)
    // For guest users: Get sessionId from state (memory only, lost on refresh)
    let sessionIdForRequest: string | undefined = undefined;
    if (isAuthenticated) {
      sessionIdForRequest = currentConversation?.sessionId || undefined;
    } else {
      // For guest users: Use sessionId from state (from previous response)
      sessionIdForRequest = guestSessionIdFromResponse || undefined;
    }

    // Prepare API call with the same user input
    const apiData = {
      userInput: userMessage.content || "",
      conversationId: finalConversationId,
      sessionId: sessionIdForRequest, // Backend will prioritize conversation.session_id over this
      role: role,
      schoolName: finalSchoolName,
      grade: session.grade,
      subject: session.subject,
      topic: session.topic,
      // Include messages up to (but not including) the message being regenerated
      previousChat: currentMessages.slice(0, messageIndex).map((m) => ({
        user: m.role === "user" ? m.content || "" : "",
        gemini: m.role === "assistant" ? m.contentMd || "" : "",
      })),
    };

    setIsStreaming(true);

    try {
      const response = await chatService.createChat(apiData);

      const regeneratedMessage: NewMessage = {
        id: response.message.id || `msg_${Date.now() + 1}`,
        role: "assistant",
        contentMd: response.message.contentMd || response.message.content,
        timestamp: response.message.timestamp || Date.now(),
        streamed: false,
      };

      // Replace the assistant message with the regenerated one
      setCurrentMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? regeneratedMessage : msg))
      );

      // For guest users: Save sessionId from response to state (memory only, lost on refresh)
      if (!isAuthenticated && response.sessionId) {
        setGuestSessionIdFromResponse(response.sessionId);
      }

      // Update conversation if authenticated
      if (selectedConversationId && currentConversation) {
        const updatedMessages = currentConversation.messages.map((msg) =>
          msg.id === messageId ? regeneratedMessage : msg
        );
        updateLocal(selectedConversationId, { messages: updatedMessages });
        addMessageToConversation(selectedConversationId, regeneratedMessage);

        // Update sessionId in conversation if received from backend
        if (
          response.sessionId &&
          response.sessionId !== currentConversation?.sessionId
        ) {
          updateLocal(selectedConversationId, {
            sessionId: response.sessionId,
          });
        }

        // NOTE: We don't refetch conversations here to avoid overwriting currentMessages
        // Backend saves messages automatically, and we've already updated local state
        // Refetching would cause race conditions and overwrite our optimistic updates
      }

      toast.success("Response regenerated");
    } catch (error: any) {
      console.error("Failed to regenerate response:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to regenerate response. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsStreaming(false);
    }
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

    if (selectedConversationId && currentConversation) {
      const updatedMessages = currentConversation.messages.map((msg) =>
        msg.id === messageId ? { ...msg, selectedVariantId: variantId } : msg
      );
      updateLocal(selectedConversationId, { messages: updatedMessages });
      updateConversation(selectedConversationId, {
        messages: updatedMessages,
      }).catch((error) => console.error("Failed to update variant:", error));
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
      prev.map((msg) => (msg.id === messageId ? { ...msg, feedback } : msg))
    );

    if (selectedConversationId && currentConversation) {
      const updatedMessages = currentConversation.messages.map((msg) =>
        msg.id === messageId ? { ...msg, feedback } : msg
      );
      updateLocal(selectedConversationId, { messages: updatedMessages });
      updateConversation(selectedConversationId, {
        messages: updatedMessages,
      }).catch((error) => console.error("Failed to update feedback:", error));
    }

    toast.success("Feedback submitted. Thank you!");
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await deleteConversation(id);
      if (selectedConversationId === id) {
        handleNewChat();
      }
      toast.success("Conversation deleted");
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      toast.error("Failed to delete conversation. Please try again.");
    }
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
                ? "w-[72px] -translate-x-full md:translate-x-0"
                : "w-[260px] translate-x-0"
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
              onRenameConversation={async (id: string, title: string) => {
                try {
                  // Optimistic update first
                  updateLocal(id, { title });

                  // Then sync with backend
                  await updateConversation(id, { title });

                  // Refetch to ensure we have the latest data
                  setTimeout(() => {
                    refetchConversations().catch((error) => {
                      console.error("Failed to refetch conversations:", error);
                    });
                  }, 300);

                  toast.success("Conversation renamed");
                } catch (error) {
                  console.error("Failed to rename conversation:", error);
                  toast.error("Failed to rename conversation");
                  // Revert optimistic update on error
                  refetchConversations();
                }
              }}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() =>
                setIsSidebarCollapsed(!isSidebarCollapsed)
              }
              userName={userName}
              plan={plan.toLowerCase() as "free" | "go"}
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
        <div
          className={`flex-1 flex flex-col overflow-hidden bg-background ${
            !isAuthenticated ? "px-4 md:px-6" : ""
          }`}
        >
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
            conversationId={
              selectedConversationId || conversationIdFromUrl || undefined
            }
            model={model}
            tools={tools}
            memoryEnabled={memoryEnabled}
            onModelChange={(nextModel) => {
              setModel(nextModel);
            }}
            onToggleTool={handleToggleTool}
            onToggleMemory={handleToggleMemory}
            onNewChat={handleNewChat}
            onExport={handleExport}
            onSettings={() => navigate("/settings")}
          />

          {/* Context selectors removed as requested */}

          {/* Chat Messages */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <ChatArea
              messages={currentMessages}
              conversationId={selectedConversationId || undefined}
              isStreaming={isStreaming}
              onCopy={handleCopy}
              onShare={handleShare}
              onRegenerate={handleRegenerate}
              onLike={handleLike}
              onContinue={handleContinue}
              onEdit={handleEdit}
              onSelectVariant={handleSelectVariant}
              onFeedback={handleFeedback}
              userName={userName}
              isAuthenticated={isAuthenticated}
            />
          </div>

          {/* Composer and bottom elements container */}
          <div
            className="flex-shrink-0 pb-1 sm:pb-2"
            // style={{
            //   paddingBottom: "max(5rem, env(safe-area-inset-bottom, 1.25rem))",
            // }}
          >
            {/* Composer */}
            <Composer
              onSend={handleSendMessage}
              onStop={handleStopStreaming}
              isStreaming={isStreaming}
              disabled={false}
              tools={tools}
              memoryEnabled={memoryEnabled}
              enterToSend={enterToSend}
              role={role}
              onRoleChange={(newRole) => {
                setRole(newRole);
                // Save role to session for workflow
                const currentSession = sessionService.getSession();
                const updatedSession = { ...currentSession, role: newRole };
                sessionService.saveSession(updatedSession);
              }}
              compact={isAuthenticated && currentMessages.length === 0}
              onNewChat={handleNewChat}
              schoolName={currentConversation?.schoolName}
              onChangeSchool={() => setShowSchoolPicker(true)}
            />

            {/* Suggestions UNDER the chat box when no messages */}
            {/* Footer notice */}
            <div className="mx-auto max-w-[900px] px-3 pt-1 pb-1">
              <p className="text-xs text-muted-foreground text-center leading-snug">
                <span className="block sm:inline">
                 easyschool.ai can make mistakes. Check important info.
                </span>{" "}
                <button
                  className="underline text-primary hover:text-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-0.5"
                  onClick={() => navigate("/cookies")}
                >
                  Cookie Preferences
                </button>
              </p>
            </div>
          </div>
          <UpgradeModal
            open={showUpgrade}
            onClose={() => setShowUpgrade(false)}
            onUpgrade={() => {
              // Navigate to upgrade page for real payment
              navigate("/upgrade");
              setShowUpgrade(false);
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
            onToggleTool={(tool: string) =>
              handleToggleTool(tool as keyof ConversationTools)
            }
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
