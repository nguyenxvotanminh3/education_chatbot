import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../core/store/hooks";
import Sidebar from "../features/chat/components/Sidebar";
import { Conversation } from "../features/chat/types";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const navigate = useNavigate();
  const userName = useAppSelector((s) => s.auth?.user?.name ?? "Guest");
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [plan] = useState<"free" | "go">(
    ((localStorage.getItem("plan") as any) || "free").toLowerCase() as
      | "free"
      | "go"
  );

  // Load conversations only if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const stored = localStorage.getItem("conversations");
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Conversation[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setConversations(parsed);
          }
        } catch (error) {
          console.error("Error parsing conversations:", error);
          localStorage.removeItem("conversations");
        }
      }
    } else {
      setConversations([]);
      setSelectedConversationId(null);
    }
  }, [isAuthenticated]);

  const handleNewChat = () => {
    navigate("/app");
  };

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    navigate("/app");
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== id));
    if (selectedConversationId === id) {
      setSelectedConversationId(null);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
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

        {/* Mobile menu button */}
        {isAuthenticated && isSidebarCollapsed && (
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

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
