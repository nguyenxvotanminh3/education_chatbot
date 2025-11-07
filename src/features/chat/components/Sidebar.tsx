import { useState } from "react";
import { Conversation } from "../types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
  Home as HomeIcon,
  Clock,
  HelpCircle,
  MoreHorizontal,
  Share2,
  Pencil,
  FolderGit2,
  Archive,
  Trash2,
  Pin,
} from "lucide-react";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface SidebarProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation?: (id: string) => void;
  onPinConversation?: (id: string) => void;
  onRenameConversation?: (id: string, title: string) => void;
  onArchiveConversation?: (id: string) => void;
  onShareConversation?: (id: string) => void;
  onMoveConversation?: (id: string, project: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  userName?: string;
  plan?: "Free" | "Go";
}

const SidebarToggleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
  >
    <rect x="3.75" y="4" width="16.5" height="16" rx="3" />
    <line x1="10" y1="5.5" x2="10" y2="18.5" />
  </svg>
);

const NewChatIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M2.6687 11.333V8.66699C2.6687 7.74455 2.66841 7.01205 2.71655 6.42285C2.76533 5.82612 2.86699 5.31731 3.10425 4.85156L3.25854 4.57617C3.64272 3.94975 4.19392 3.43995 4.85229 3.10449L5.02905 3.02149C5.44666 2.84233 5.90133 2.75849 6.42358 2.71582C7.01272 2.66769 7.74445 2.66797 8.66675 2.66797H9.16675C9.53393 2.66797 9.83165 2.96586 9.83179 3.33301C9.83179 3.70028 9.53402 3.99805 9.16675 3.99805H8.66675C7.7226 3.99805 7.05438 3.99834 6.53198 4.04102C6.14611 4.07254 5.87277 4.12568 5.65601 4.20313L5.45581 4.28906C5.01645 4.51293 4.64872 4.85345 4.39233 5.27149L4.28979 5.45508C4.16388 5.7022 4.08381 6.01663 4.04175 6.53125C3.99906 7.05373 3.99878 7.7226 3.99878 8.66699V11.333C3.99878 12.2774 3.99906 12.9463 4.04175 13.4688C4.08381 13.9833 4.16389 14.2978 4.28979 14.5449L4.39233 14.7285C4.64871 15.1465 5.01648 15.4871 5.45581 15.7109L5.65601 15.7969C5.87276 15.8743 6.14614 15.9265 6.53198 15.958C7.05439 16.0007 7.72256 16.002 8.66675 16.002H11.3337C12.2779 16.002 12.9461 16.0007 13.4685 15.958C13.9829 15.916 14.2976 15.8367 14.5447 15.7109L14.7292 15.6074C15.147 15.3511 15.4879 14.9841 15.7117 14.5449L15.7976 14.3447C15.8751 14.128 15.9272 13.8546 15.9587 13.4688C16.0014 12.9463 16.0017 12.2774 16.0017 11.333V10.833C16.0018 10.466 16.2997 10.1681 16.6667 10.168C17.0339 10.168 17.3316 10.4659 17.3318 10.833V11.333C17.3318 12.2555 17.3331 12.9879 17.2849 13.5771C17.2422 14.0993 17.1584 14.5541 16.9792 14.9717L16.8962 15.1484C16.5609 15.8066 16.0507 16.3571 15.4246 16.7412L15.1492 16.8955C14.6833 17.1329 14.1739 17.2354 13.5769 17.2842C12.9878 17.3323 12.256 17.332 11.3337 17.332H8.66675C7.74446 17.332 7.01271 17.3323 6.42358 17.2842C5.90135 17.2415 5.44665 17.1577 5.02905 16.9785L4.85229 16.8955C4.19396 16.5601 3.64271 16.0502 3.25854 15.4238L3.10425 15.1484C2.86697 14.6827 2.76534 14.1739 2.71655 13.5771C2.66841 12.9879 2.6687 12.2555 2.6687 11.333ZM13.4646 3.11328C14.4201 2.334 15.8288 2.38969 16.7195 3.28027L16.8865 3.46485C17.6141 4.35685 17.6143 5.64423 16.8865 6.53613L16.7195 6.7207L11.6726 11.7686C11.1373 12.3039 10.4624 12.6746 9.72827 12.8408L9.41089 12.8994L7.59351 13.1582C7.38637 13.1877 7.17701 13.1187 7.02905 12.9707C6.88112 12.8227 6.81199 12.6134 6.84155 12.4063L7.10132 10.5898L7.15991 10.2715C7.3262 9.53749 7.69692 8.86241 8.23218 8.32715L13.2791 3.28027L13.4646 3.11328ZM15.7791 4.2207C15.3753 3.81702 14.7366 3.79124 14.3035 4.14453L14.2195 4.2207L9.17261 9.26856C8.81541 9.62578 8.56774 10.0756 8.45679 10.5654L8.41772 10.7773L8.28296 11.7158L9.22241 11.582L9.43433 11.543C9.92426 11.432 10.3749 11.1844 10.7322 10.8271L15.7791 5.78027L15.8552 5.69629C16.185 5.29194 16.1852 4.708 15.8552 4.30371L15.7791 4.2207Z" />
  </svg>
);

const Sidebar = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onPinConversation,
  onRenameConversation,
  onArchiveConversation,
  onShareConversation,
  onMoveConversation,
  isCollapsed = false,
  onToggleCollapse,
  userName,
  plan,
}: SidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);
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

  const handleShare = (conversation: Conversation) => {
    onShareConversation?.(conversation.id);
    if (typeof navigator !== "undefined") {
      if (navigator.share) {
        navigator
          .share({
            title: conversation.title,
            text: conversation.title,
          })
          .catch(() => {
            /* no-op */
          });
      } else if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(conversation.title).catch(() => {
          /* no-op */
        });
      }
    }
  };

  const handleRename = (conversation: Conversation) => {
    if (!onRenameConversation || typeof window === "undefined") {
      return;
    }
    const nextTitle = window.prompt("Rename conversation", conversation.title);
    if (nextTitle && nextTitle.trim() && nextTitle.trim() !== conversation.title) {
      onRenameConversation(conversation.id, nextTitle.trim());
    }
  };

  const handleArchive = (conversation: Conversation) => {
    onArchiveConversation?.(conversation.id);
  };

  const projectOptions = ["General", "Research", "Product"];

  const handleMoveToProject = (conversation: Conversation, project: string) => {
    onMoveConversation?.(conversation.id, project);
  };

  if (isCollapsed && onToggleCollapse) {
    const collapsedNavItems = [
      {
        label: "Home",
        icon: HomeIcon,
        onClick: () => navigate("/app"),
      },
      {
        label: "Recent chats",
        icon: Clock,
        onClick: () => onToggleCollapse(),
      },
    ];

    const collapsedFooterItems = [
      {
        label: "FAQ",
        icon: HelpCircle,
        onClick: () => navigate("/faq"),
      },
      {
        label: "Settings",
        icon: Settings,
        onClick: () => navigate("/settings"),
      },
      {
        label: "Profile",
        icon: User,
        onClick: () => navigate("/profile"),
      },
    ];

    return (
      <TooltipProvider delayDuration={150} skipDelayDuration={0}>
        <div className="w-full bg-[#f8fafc] text-slate-600 dark:bg-[#111827] dark:text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-200/70 dark:border-white/10 transition-[width] duration-200">
          <div className="flex flex-col items-center py-4 gap-4">
          <Button
            onClick={onToggleCollapse}
            variant="ghost"
            size="icon"
            aria-label="Expand sidebar"
              className="h-10 w-10 rounded-lg border border-slate-200/70 bg-slate-900/5 text-slate-600 transition-colors hover:bg-slate-900/10 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200/80 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <SidebarToggleIcon className="w-7 h-7" />
          </Button>
          <Button
            onClick={onNewChat}
            variant="ghost"
            size="icon"
            aria-label="New chat"
              className="h-10 w-10 rounded-lg bg-slate-900/5 text-slate-700 transition-colors hover:bg-slate-900/10 hover:text-slate-900 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <NewChatIcon className="w-5 h-5" />
          </Button>
        </div>

          <nav className="flex-1 flex flex-col items-center gap-3 text-muted-foreground">
            {collapsedNavItems.map((item) => (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-lg text-slate-500 transition-all duration-150 hover:bg-slate-900/10 hover:text-slate-900 hover:-translate-y-0.5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                    aria-label={item.label}
                    onClick={item.onClick}
                  >
                    <item.icon className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            ))}
          </nav>

          <div className="flex flex-col items-center gap-3 pb-4">
            {collapsedFooterItems.map((item) => (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-lg text-slate-500 transition-all duration-150 hover:bg-slate-900/10 hover:text-slate-900 hover:-translate-y-0.5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                    aria-label={item.label}
                    onClick={item.onClick}
                  >
                    <item.icon className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <div className="w-full bg-[#f8fafc] text-slate-700 dark:bg-[#111827] dark:text-slate-200 flex flex-col h-screen sticky top-0 border-r border-slate-200/70 dark:border-white/10 transition-[width] duration-200">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold tracking-[0.08em] text-slate-900 dark:text-white">
            EDU<span className="text-slate-500 dark:text-white/70">+</span>
          </h2>
          {onToggleCollapse && (
            <Button
              onClick={onToggleCollapse}
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-lg border border-slate-200/70 bg-slate-900/5 text-slate-600 transition-colors hover:bg-slate-900/10 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Collapse sidebar"
            >
              <SidebarToggleIcon className="w-7 h-7" />
            </Button>
          )}
        </div>

        {/* New Chat + Search */}
        <div className="space-y-3">
          <Button
            onClick={onNewChat}
            className="w-full h-11 rounded-lg border border-slate-200/70 bg-slate-900/5 text-slate-800 shadow-sm transition-all duration-150 hover:bg-slate-900/10 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
          >
          <NewChatIcon className="w-4 h-4" />
            <span className="text-sm font-medium">New chat</span>
          </Button>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
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
              className="h-11 w-full rounded-lg border border-slate-200/70 bg-white pl-9 pr-10 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition-colors focus:border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:focus:border-white/20 dark:focus-visible:ring-slate-400/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full text-slate-400 transition-colors hover:bg-slate-900/10 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white"
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

        <div className="flex items-center justify-between mt-4 mb-2 px-0.5">
          <button
            type="button"
            onClick={() => setIsHistoryCollapsed((prev) => !prev)}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            aria-expanded={!isHistoryCollapsed}
          >
            <span>Chats</span>
            <svg
              className={`h-3 w-3 transition-transform ${
                isHistoryCollapsed ? "rotate-180" : "rotate-0"
              }`}
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.5 5.5L8 9L11.5 5.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {onDeleteConversation && conversations.length > 0 && (
            <button
              className="text-xs text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
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
      <div
        className={`flex-1 overflow-y-auto px-2 pb-4 chatgpt-scroll transition-all duration-200 ${
          isHistoryCollapsed ? "pointer-events-none select-none opacity-0 h-0" : "opacity-100"
        }`}
      >
        {sortedConversations.length === 0 ? (
          <div className="px-4 py-10 text-center text-slate-500 dark:text-slate-400">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-900/5 flex items-center justify-center dark:bg-white/5">
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
          <div className="space-y-1">
            {sortedConversations.map((conv) => (
              <div
                key={conv.id}
                className={`group relative mb-1 cursor-pointer rounded-lg border border-transparent px-4 py-2 text-sm transition-all duration-150 before:absolute before:left-2 before:top-1/2 before:h-5 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-slate-900/40 before:opacity-0 before:transition-opacity before:content-[''] dark:before:bg-white/50 ${
                  selectedConversationId === conv.id
                    ? "border-slate-300 bg-slate-100 before:opacity-100 dark:border-white/15 dark:bg-white/15"
                    : "hover:bg-slate-900/5 hover:before:opacity-60 hover:translate-x-[2px] dark:hover:bg-white/10"
                }`}
                onClick={() => onSelectConversation(conv.id)}
                onMouseEnter={() => setHoveredId(conv.id)}
                onMouseLeave={() => {
                  if (openMenuId !== conv.id) {
                    setHoveredId(null);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-medium text-slate-900 truncate dark:text-white">
                        {conv.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(conv.updatedAt)}
                    </p>
                  </div>
                  {/* Actions on hover */}
                  {(() => {
                    const isMenuOpen = openMenuId === conv.id;
                    const showActions = hoveredId === conv.id || isMenuOpen;
                    if (!showActions) {
                      return null;
                    }
                    return (
                      <div
                        className={`flex transition-opacity ${
                          isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        <DropdownMenu
                          open={isMenuOpen}
                          onOpenChange={(isOpen) => {
                            setOpenMenuId(
                              isOpen
                                ? conv.id
                                : openMenuId === conv.id
                                ? null
                                : openMenuId
                            );
                            if (!isOpen) {
                              setHoveredId(null);
                            }
                          }}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-md text-slate-500 transition-colors hover:bg-slate-900/10 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                              aria-label="Conversation actions"
                              onClick={(event) => event.stopPropagation()}
                              onPointerDown={(event) => event.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align={isMenuOpen ? "end" : "end"}
                            side="bottom"
                            sideOffset={8}
                            alignOffset={-8}
                            className="w-48 border border-slate-200 bg-white p-1 text-slate-700 shadow-lg dark:border-white/10 dark:bg-[#1f2937] dark:text-slate-200"
                          >
                          <DropdownMenuItem
                            onSelect={(event) => {
                              event.stopPropagation();
                              handleShare(conv);
                            }}
                            className="cursor-pointer"
                          >
                            <Share2 className="h-4 w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={!onRenameConversation}
                            onSelect={(event) => {
                              event.stopPropagation();
                              handleRename(conv);
                            }}
                            className="cursor-pointer"
                          >
                            <Pencil className="h-4 w-4" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger
                              className="cursor-pointer"
                              disabled={!onMoveConversation}
                            >
                              <FolderGit2 className="h-4 w-4" />
                              Move to project
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="border border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-[#1f2937] dark:text-slate-200">
                              {projectOptions.map((project) => (
                                <DropdownMenuItem
                                  key={project}
                                  disabled={!onMoveConversation}
                                  onSelect={(event) => {
                                    event.stopPropagation();
                                    handleMoveToProject(conv, project);
                                  }}
                                  className="cursor-pointer"
                                >
                                  {project}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          {onPinConversation && (
                            <DropdownMenuItem
                              onSelect={(event) => {
                                event.stopPropagation();
                                onPinConversation(conv.id);
                              }}
                              className="cursor-pointer"
                            >
                              <Pin className="h-4 w-4" />
                              {conv.pinned ? "Unpin" : "Pin"}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            disabled={!onArchiveConversation}
                            onSelect={(event) => {
                              event.stopPropagation();
                              handleArchive(conv);
                            }}
                            className="cursor-pointer"
                          >
                            <Archive className="h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                      {onDeleteConversation && (
                            <>
                              <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10" />
                              <DropdownMenuItem
                                className="cursor-pointer text-rose-500 focus:text-rose-400 dark:text-rose-400 dark:focus:text-rose-300"
                                onSelect={(event) => {
                                  event.stopPropagation();
                            if (window.confirm("Delete this conversation?")) {
                              onDeleteConversation(conv.id);
                            }
                          }}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {userName && (
        <div className="border-t border-slate-200/70 px-4 py-4 dark:border-white/10">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/10 text-slate-800 text-sm font-medium shadow-sm dark:bg-white/10 dark:text-white">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-medium text-slate-900 dark:text-white">{userName}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{plan}</div>
            </div>
            <div className="flex items-center gap-2">
              {plan === "Free" && (
                <button
                  type="button"
                  onClick={() => navigate("/upgrade")}
                  className="rounded-lg border border-slate-200/70 px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-900/10 hover:text-slate-900 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  Upgrade
                </button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-lg border border-slate-200/70 bg-slate-900/5 text-slate-600 transition-colors hover:bg-slate-900/10 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                    aria-label="Account menu"
                  >
                    <ChevronsUpDown className="h-4 w-4" />
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
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
