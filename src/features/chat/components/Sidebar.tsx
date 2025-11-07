import { useState } from "react";
import { Conversation } from "../types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../core/store/hooks";
import { logout } from "../../auth/store/authSlice";
import {
  User,
  Settings,
  CreditCard,
  LogOut,
  ChevronsUpDown,
} from "lucide-react";

interface SidebarProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation?: (id: string) => void;
  onPinConversation?: (id: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  userName?: string;
  plan?: "Free" | "Go";
}

const Sidebar = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onPinConversation,
  isCollapsed = false,
  onToggleCollapse,
  userName,
  plan,
}: SidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  if (isCollapsed && onToggleCollapse) {
    return (
      <div className="w-14 bg-sidebar flex flex-col h-full text-muted-foreground">
        <div className="flex flex-col items-center py-4">
          <Button
            onClick={onToggleCollapse}
            variant="ghost"
            size="icon"
            aria-label="Expand sidebar"
            className="mb-4 hover:bg-muted"
          >
            <svg
              className="w-5 h-5"
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
          <Button
            onClick={onNewChat}
            variant="ghost"
            size="icon"
            aria-label="New chat"
            className="hover:bg-muted"
          >
            <svg
              className="w-5 h-5"
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
        </div>

        {/* Compact vertical icon menu */}
        <nav className="flex-1 flex flex-col items-center gap-1 text-muted-foreground">
          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-muted" aria-label="Logo/Home">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l9-9 9 9M4 10v10a1 1 0 001 1h14a1 1 0 001-1V10" />
            </svg>
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-muted" aria-label="Stats">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3a1 1 0 012 0v18a1 1 0 11-2 0V3zm-6 8a1 1 0 012 0v10a1 1 0 11-2 0V11zm12 4a1 1 0 012 0v6a1 1 0 11-2 0v-6z" />
            </svg>
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-muted" aria-label="Magic">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 14M14 5l5 5M4 14l5 5" />
            </svg>
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-muted" aria-label="Attachments">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15a4 4 0 01-4 4H7a6 6 0 010-12h10a4 4 0 010 8H9a2 2 0 110-4h8" />
            </svg>
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-muted" aria-label="Chats">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-muted" aria-label="Notifications">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </Button>
          <div className="mt-auto mb-2" />
        </nav>

        {/* User avatar at bottom */}
        {userName && (
          <div className="mt-auto pb-4 flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted text-muted-foreground">
                  <div className="w-10 h-10 rounded-full bg-black dark:bg-gray-800 text-white flex items-center justify-center text-sm font-medium">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" className="w-[200px]">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/subscription")}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Subscription
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    dispatch(logout());
                    navigate("/login", { replace: true });
                  }}
                  className="text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-80 bg-sidebar flex flex-col h-full">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold tracking-[0.08em] text-sidebar-foreground">
            EDU<span className="text-black dark:text-white">+</span>
          </h2>
          {onToggleCollapse && (
            <Button
              onClick={onToggleCollapse}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Collapse sidebar"
            >
              <svg
              className="w-5 h-5"
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
          )}
        </div>

        {/* New Chat + Search */}
        <div className="flex items-center gap-3">
          <Button
            onClick={onNewChat}
            className="w-11 h-11 bg-black hover:bg-gray-900 text-white mb-3 rounded-full shadow-sm hover:shadow-md transition-shadow justify-center focus:outline-none focus:ring-0 focus-visible:ring-0"
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
          <div className="relative flex-1 mb-3">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="h-11 w-full rounded-full bg-muted/60 pl-9 pr-10 text-sm outline-none ring-1 ring-border focus:ring-border focus-visible:ring-border"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full text-muted-foreground hover:bg-muted"
                aria-label="Clear search"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-1 mb-1 px-0.5">
          <span className="text-sm text-muted-foreground">
            Your conversations
          </span>
          {onDeleteConversation && conversations.length > 0 && (
            <button
              className="text-xs text-foreground hover:underline"
              onClick={() =>
                conversations.forEach((c) => onDeleteConversation?.(c.id))
              }
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {sortedConversations.length === 0 ? (
          <div className="px-4 py-10 text-center text-muted-foreground">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div className="text-sm">
              {searchQuery
                ? "No conversations found"
                : "Create your first chat"}
            </div>
          </div>
        ) : (
          <div className="p-3">
            {sortedConversations.map((conv) => (
              <div
                key={conv.id}
                className={`group relative p-3.5 rounded-full mb-2 cursor-pointer transition-all ${
                  selectedConversationId === conv.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "hover:bg-sidebar-accent/60 hover:shadow-sm hover:translate-x-0.5"
                }`}
                onClick={() => onSelectConversation(conv.id)}
                onMouseEnter={() => setHoveredId(conv.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-black dark:bg-gray-800 text-white flex items-center justify-center shrink-0 text-sm font-medium shadow-sm">
                    💬
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-medium truncate">
                        {conv.title}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(conv.updatedAt)}
                    </p>
                  </div>

                  {/* Actions on hover */}
                  {hoveredId === conv.id && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onPinConversation && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPinConversation(conv.id);
                          }}
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          aria-label={conv.pinned ? "Unpin" : "Pin"}
                        >
                          <svg
                            className={`w-4 h-4 ${
                              conv.pinned
                                ? "text-black dark:text-white"
                                : "text-muted-foreground"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                          </svg>
                        </Button>
                      )}
                      {onDeleteConversation && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm("Delete this conversation?")) {
                              onDeleteConversation(conv.id);
                            }
                          }}
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          aria-label="Delete"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </Button>
                      )}
                    </div>
                  )}
                  <span className="ml-2 h-2.5 w-2.5 rounded-full bg-blue-500/80" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {userName && (
        <div className="p-5 space-y-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start py-6 rounded-2xl bg-muted/60 hover:bg-muted shadow-sm focus-visible:ring-0 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-black dark:bg-gray-800 text-white flex items-center justify-center text-sm font-medium mr-3 shadow-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium truncate">{userName}</div>
                  <div className="text-xs text-muted-foreground">{plan}</div>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/subscription")}>
                <CreditCard className="mr-2 h-4 w-4" />
                Subscription
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  dispatch(logout());
                  navigate("/login", { replace: true });
                }}
                className="text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
