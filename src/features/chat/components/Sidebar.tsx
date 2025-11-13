import { useState } from "react";
import { createPortal } from "react-dom";
import { Conversation } from "../types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../core/store/hooks";
import { logout, clearAuth } from "../../auth/store/authSlice";
import { clearConversations } from "../store/conversationSlice";
import { useConversations } from "../hooks/useConversations";
import {
  User,
  Settings,
  Home as HomeIcon,
  Clock,
  HelpCircle,
  MoreHorizontal,
  Share2,
  Pencil,
  Trash2,
  Sparkles,
  ChevronRight,
  DoorOpen,
} from "lucide-react";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import modelIconLightMode from "../../../public/model_icon_light.png";
import modelIconDarkMode from "../../../public/model_icon_dark.png";

interface SidebarProps {
  conversations?: Conversation[]; // Optional - will use from Redux if not provided
  selectedConversationId?: string | null; // Optional - will use from Redux if not provided
  onSelectConversation?: (id: string) => void; // Optional - will use from Redux if not provided
  onNewChat: () => void;
  onDeleteConversation?: (id: string) => void;
  onRenameConversation?: (id: string, title: string) => void;
  onShareConversation?: (id: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  userName?: string;
  plan?: "free" | "go"; // Keep for backward compatibility, but will use from store
}

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
  conversations: propConversations,
  selectedConversationId: propSelectedConversationId,
  onSelectConversation: propOnSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onShareConversation,
  isCollapsed = false,
  onToggleCollapse,
  userName: propUserName,
  plan: propPlan,
}: SidebarProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renameConversation, setRenameConversation] =
    useState<Conversation | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConversation, setDeleteConversation] =
    useState<Conversation | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isDark = useAppSelector((s) => s.ui.isDark);

  // Get conversations from Redux hook (or use props if provided)
  const {
    conversations: reduxConversations,
    selectedConversationId: reduxSelectedConversationId,
    selectConversation: reduxSelectConversation,
  } = useConversations();

  // Use props if provided, otherwise use Redux
  const conversations = propConversations ?? reduxConversations;
  const selectedConversationId =
    propSelectedConversationId ?? reduxSelectedConversationId;
  const onSelectConversation =
    propOnSelectConversation ?? reduxSelectConversation;

  // Get user data from store
  const user = useAppSelector((state) => state.auth?.user);
  const userName = propUserName || user?.name || "Guest";

  // Get plan from user data, fallback to prop or "Free"
  const getUserPlan = (): "Free" | "Go" => {
    if (user?.plan) {
      // Map backend plan values to frontend display values
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
    // Fallback to prop if provided, otherwise default to "Free"
    if (propPlan) {
      return propPlan === "go" ? "Go" : "Free";
    }
    return "Free";
  };

  const plan = getUserPlan();

  const filteredConversations = conversations;

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  const handleShare = async (conversation: Conversation) => {
    // Create share URL similar to TopBar
    const shareUrl = `${window.location.origin}/app/${conversation.id}`;

    onShareConversation?.(conversation.id);

    if (typeof navigator !== "undefined") {
      if (navigator.share) {
        try {
          await navigator.share({
            title: conversation.title,
            text: conversation.title,
            url: shareUrl,
          });
        } catch (error) {
          // User cancelled or error occurred, fallback to copy
          try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success("Link copied to clipboard");
          } catch (err) {
            toast.error("Failed to copy link");
          }
        }
      } else if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(shareUrl);
          toast.success("Link copied to clipboard");
        } catch (err) {
          toast.error("Failed to copy link");
        }
      }
    }
  };

  const handleRename = (conversation: Conversation) => {
    if (!onRenameConversation) {
      return;
    }
    setRenameConversation(conversation);
    setRenameValue(conversation.title);
    setShowRenameDialog(true);
  };

  const handleRenameSubmit = () => {
    if (!renameConversation || !onRenameConversation) return;

    const trimmedValue = renameValue.trim();
    if (!trimmedValue) {
      toast.error("Conversation title cannot be empty");
      return;
    }

    if (trimmedValue !== renameConversation.title) {
      onRenameConversation(renameConversation.id, trimmedValue);
    }

    setShowRenameDialog(false);
    setRenameConversation(null);
    setRenameValue("");
  };

  const handleRenameCancel = () => {
    setShowRenameDialog(false);
    setRenameConversation(null);
    setRenameValue("");
  };

  const handleDelete = (conversation: Conversation) => {
    if (!onDeleteConversation) {
      return;
    }
    setDeleteConversation(conversation);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (!deleteConversation || !onDeleteConversation) return;
    onDeleteConversation(deleteConversation.id);
    setShowDeleteDialog(false);
    setDeleteConversation(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setDeleteConversation(null);
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
            <img
              onClick={onToggleCollapse}
              src={!isDark ? modelIconDarkMode : modelIconLightMode}
              alt="Model Icon"
              className="w-7 h-7 cursor-pointer"
            />
            {/* <svg
              onClick={onToggleCollapse}
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              data-rtl-flip=""
              className="icon"
            >
              <path d="M6.83496 3.99992C6.38353 4.00411 6.01421 4.0122 5.69824 4.03801C5.31232 4.06954 5.03904 4.12266 4.82227 4.20012L4.62207 4.28606C4.18264 4.50996 3.81498 4.85035 3.55859 5.26848L3.45605 5.45207C3.33013 5.69922 3.25006 6.01354 3.20801 6.52824C3.16533 7.05065 3.16504 7.71885 3.16504 8.66301V11.3271C3.16504 12.2712 3.16533 12.9394 3.20801 13.4618C3.25006 13.9766 3.33013 14.2909 3.45605 14.538L3.55859 14.7216C3.81498 15.1397 4.18266 15.4801 4.62207 15.704L4.82227 15.79C5.03904 15.8674 5.31234 15.9205 5.69824 15.9521C6.01398 15.9779 6.383 15.986 6.83398 15.9902L6.83496 3.99992ZM18.165 11.3271C18.165 12.2493 18.1653 12.9811 18.1172 13.5702C18.0745 14.0924 17.9916 14.5472 17.8125 14.9648L17.7295 15.1415C17.394 15.8 16.8834 16.3511 16.2568 16.7353L15.9814 16.8896C15.5157 17.1268 15.0069 17.2285 14.4102 17.2773C13.821 17.3254 13.0893 17.3251 12.167 17.3251H7.83301C6.91071 17.3251 6.17898 17.3254 5.58984 17.2773C5.06757 17.2346 4.61294 17.1508 4.19531 16.9716L4.01855 16.8896C3.36014 16.5541 2.80898 16.0434 2.4248 15.4169L2.27051 15.1415C2.03328 14.6758 1.93158 14.167 1.88281 13.5702C1.83468 12.9811 1.83496 12.2493 1.83496 11.3271V8.66301C1.83496 7.74072 1.83468 7.00898 1.88281 6.41985C1.93157 5.82309 2.03329 5.31432 2.27051 4.84856L2.4248 4.57317C2.80898 3.94666 3.36012 3.436 4.01855 3.10051L4.19531 3.0175C4.61285 2.83843 5.06771 2.75548 5.58984 2.71281C6.17898 2.66468 6.91071 2.66496 7.83301 2.66496H12.167C13.0893 2.66496 13.821 2.66468 14.4102 2.71281C15.0069 2.76157 15.5157 2.86329 15.9814 3.10051L16.2568 3.25481C16.8833 3.63898 17.394 4.19012 17.7295 4.84856L17.8125 5.02531C17.9916 5.44285 18.0745 5.89771 18.1172 6.41985C18.1653 7.00898 18.165 7.74072 18.165 8.66301V11.3271ZM8.16406 15.995H12.167C13.1112 15.995 13.7794 15.9947 14.3018 15.9521C14.8164 15.91 15.1308 15.8299 15.3779 15.704L15.5615 15.6015C15.9797 15.3451 16.32 14.9774 16.5439 14.538L16.6299 14.3378C16.7074 14.121 16.7605 13.8478 16.792 13.4618C16.8347 12.9394 16.835 12.2712 16.835 11.3271V8.66301C16.835 7.71885 16.8347 7.05065 16.792 6.52824C16.7605 6.14232 16.7073 5.86904 16.6299 5.65227L16.5439 5.45207C16.32 5.01264 15.9796 4.64498 15.5615 4.3886L15.3779 4.28606C15.1308 4.16013 14.8165 4.08006 14.3018 4.03801C13.7794 3.99533 13.1112 3.99504 12.167 3.99504H8.16406C8.16407 3.99667 8.16504 3.99829 8.16504 3.99992L8.16406 15.995Z"></path>
            </svg> */}
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
      <div className="pt-2 pb-2">
        <div className="flex items-center justify-between mb-2 px-3 ">
          {!isCollapsed ? (
            <img
              src={isDark ? modelIconLightMode : modelIconDarkMode}
              alt="Easy School.ai Logo"
              className="h-7 sm:h-8 w-7 sm:w-8 object-contain"
            />
          ) : (
            <img
              src={!isDark ? modelIconDarkMode : modelIconLightMode}
              alt="Model Icon"
            className="w-7 h-7"
            />
          )}

          {onToggleCollapse && (
            <svg
              onClick={onToggleCollapse}
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              data-rtl-flip=""
              className="icon"
            >
              <path d="M6.83496 3.99992C6.38353 4.00411 6.01421 4.0122 5.69824 4.03801C5.31232 4.06954 5.03904 4.12266 4.82227 4.20012L4.62207 4.28606C4.18264 4.50996 3.81498 4.85035 3.55859 5.26848L3.45605 5.45207C3.33013 5.69922 3.25006 6.01354 3.20801 6.52824C3.16533 7.05065 3.16504 7.71885 3.16504 8.66301V11.3271C3.16504 12.2712 3.16533 12.9394 3.20801 13.4618C3.25006 13.9766 3.33013 14.2909 3.45605 14.538L3.55859 14.7216C3.81498 15.1397 4.18266 15.4801 4.62207 15.704L4.82227 15.79C5.03904 15.8674 5.31234 15.9205 5.69824 15.9521C6.01398 15.9779 6.383 15.986 6.83398 15.9902L6.83496 3.99992ZM18.165 11.3271C18.165 12.2493 18.1653 12.9811 18.1172 13.5702C18.0745 14.0924 17.9916 14.5472 17.8125 14.9648L17.7295 15.1415C17.394 15.8 16.8834 16.3511 16.2568 16.7353L15.9814 16.8896C15.5157 17.1268 15.0069 17.2285 14.4102 17.2773C13.821 17.3254 13.0893 17.3251 12.167 17.3251H7.83301C6.91071 17.3251 6.17898 17.3254 5.58984 17.2773C5.06757 17.2346 4.61294 17.1508 4.19531 16.9716L4.01855 16.8896C3.36014 16.5541 2.80898 16.0434 2.4248 15.4169L2.27051 15.1415C2.03328 14.6758 1.93158 14.167 1.88281 13.5702C1.83468 12.9811 1.83496 12.2493 1.83496 11.3271V8.66301C1.83496 7.74072 1.83468 7.00898 1.88281 6.41985C1.93157 5.82309 2.03329 5.31432 2.27051 4.84856L2.4248 4.57317C2.80898 3.94666 3.36012 3.436 4.01855 3.10051L4.19531 3.0175C4.61285 2.83843 5.06771 2.75548 5.58984 2.71281C6.17898 2.66468 6.91071 2.66496 7.83301 2.66496H12.167C13.0893 2.66496 13.821 2.66468 14.4102 2.71281C15.0069 2.76157 15.5157 2.86329 15.9814 3.10051L16.2568 3.25481C16.8833 3.63898 17.394 4.19012 17.7295 4.84856L17.8125 5.02531C17.9916 5.44285 18.0745 5.89771 18.1172 6.41985C18.1653 7.00898 18.165 7.74072 18.165 8.66301V11.3271ZM8.16406 15.995H12.167C13.1112 15.995 13.7794 15.9947 14.3018 15.9521C14.8164 15.91 15.1308 15.8299 15.3779 15.704L15.5615 15.6015C15.9797 15.3451 16.32 14.9774 16.5439 14.538L16.6299 14.3378C16.7074 14.121 16.7605 13.8478 16.792 13.4618C16.8347 12.9394 16.835 12.2712 16.835 11.3271V8.66301C16.835 7.71885 16.8347 7.05065 16.792 6.52824C16.7605 6.14232 16.7073 5.86904 16.6299 5.65227L16.5439 5.45207C16.32 5.01264 15.9796 4.64498 15.5615 4.3886L15.3779 4.28606C15.1308 4.16013 14.8165 4.08006 14.3018 4.03801C13.7794 3.99533 13.1112 3.99504 12.167 3.99504H8.16406C8.16407 3.99667 8.16504 3.99829 8.16504 3.99992L8.16406 15.995Z"></path>
            </svg>
          )}
        </div>

        {/* Menu Items */}
        <div className="space-y-1">
          <button
            onClick={onNewChat}
            className="w-full h-9 rounded-lg flex items-center gap-3 px-3 text-sm font-normal text-slate-700 transition-colors hover:bg-slate-900/5 dark:text-slate-200 dark:hover:bg-white/5"
          >
            <NewChatIcon className="w-5 h-5" />
            <span>New chat</span>
          </button>
          <button
            onClick={() => setShowSearchModal(true)}
            className="w-full h-9 rounded-lg flex items-center gap-3 px-3 text-sm font-normal text-slate-700 transition-colors hover:bg-slate-900/5 dark:text-slate-200 dark:hover:bg-white/5"
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span>Search chats</span>
          </button>
          <button
            onClick={() => navigate("/library")}
            className="w-full h-9 rounded-lg flex items-center gap-3 px-3 text-sm font-normal text-slate-700 transition-colors hover:bg-slate-900/5 dark:text-slate-200 dark:hover:bg-white/5"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              className="icon"
              aria-hidden="true"
            >
              <path d="M9.38759 8.53403C10.0712 8.43795 10.7036 8.91485 10.7997 9.59849C10.8956 10.2819 10.4195 10.9133 9.73622 11.0096C9.05259 11.1057 8.4202 10.6298 8.32411 9.94614C8.22804 9.26258 8.70407 8.63022 9.38759 8.53403Z"></path>
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.3886 5.58677C10.8476 5.5681 11.2608 5.5975 11.6581 5.74204L11.8895 5.83677C12.4185 6.07813 12.8721 6.46152 13.1991 6.94614L13.2831 7.07993C13.4673 7.39617 13.5758 7.74677 13.6571 8.14048C13.7484 8.58274 13.8154 9.13563 13.8993 9.81919L14.245 12.6317L14.3554 13.5624C14.3852 13.8423 14.4067 14.0936 14.4159 14.3192C14.4322 14.7209 14.4118 15.0879 14.3095 15.4393L14.2606 15.5887C14.0606 16.138 13.7126 16.6202 13.2577 16.9823L13.0565 17.1297C12.7061 17.366 12.312 17.4948 11.8622 17.5877C11.6411 17.6334 11.3919 17.673 11.1132 17.7118L10.1835 17.8299L7.37098 18.1756C6.68748 18.2596 6.13466 18.3282 5.68348 18.3465C5.28176 18.3628 4.9148 18.3424 4.56337 18.2401L4.41395 18.1913C3.86454 17.9912 3.38258 17.6432 3.0204 17.1883L2.87294 16.9872C2.63655 16.6367 2.50788 16.2427 2.41493 15.7928C2.36926 15.5717 2.32964 15.3226 2.29091 15.0438L2.17274 14.1141L1.82704 11.3016C1.74311 10.6181 1.67455 10.0653 1.65614 9.61411C1.63747 9.15518 1.66697 8.74175 1.81141 8.34458L1.90614 8.11313C2.14741 7.58441 2.53115 7.13051 3.01552 6.80356L3.1493 6.71958C3.46543 6.53545 3.8163 6.42688 4.20985 6.34556C4.65206 6.25423 5.20506 6.18729 5.88856 6.10337L8.70106 5.75767L9.63173 5.64731C9.91161 5.61744 10.163 5.59597 10.3886 5.58677ZM6.75673 13.0594C6.39143 12.978 6.00943 13.0106 5.66298 13.1522C5.5038 13.2173 5.32863 13.3345 5.06923 13.5829C4.80403 13.8368 4.49151 14.1871 4.04091 14.6932L3.64833 15.1327C3.67072 15.2763 3.69325 15.4061 3.71766 15.5243C3.79389 15.893 3.87637 16.0961 3.97548 16.243L4.06141 16.3602C4.27134 16.6237 4.5507 16.8253 4.86903 16.9413L5.00477 16.9813C5.1536 17.0148 5.34659 17.0289 5.6288 17.0174C6.01317 17.0018 6.50346 16.9419 7.20888 16.8553L10.0214 16.5106L10.9306 16.3944C11.0173 16.3824 11.0997 16.3693 11.1776 16.3573L8.61513 14.3065C8.08582 13.8831 7.71807 13.5905 7.41395 13.3846C7.19112 13.2338 7.02727 13.1469 6.88856 13.0975L6.75673 13.0594ZM10.4432 6.91587C10.2511 6.9237 10.0319 6.94288 9.77333 6.97056L8.86317 7.07798L6.05067 7.42271C5.34527 7.50932 4.85514 7.57047 4.47841 7.64829C4.20174 7.70549 4.01803 7.76626 3.88173 7.83481L3.75966 7.9061C3.47871 8.09575 3.25597 8.35913 3.1161 8.66587L3.06141 8.79966C3.00092 8.96619 2.96997 9.18338 2.98524 9.55942C3.00091 9.94382 3.06074 10.4341 3.14735 11.1395L3.42274 13.3895L3.64442 13.1434C3.82631 12.9454 3.99306 12.7715 4.1493 12.6219C4.46768 12.3171 4.78299 12.0748 5.16005 11.9208L5.38661 11.8377C5.92148 11.6655 6.49448 11.6387 7.04579 11.7616L7.19325 11.7987C7.53151 11.897 7.8399 12.067 8.15907 12.2831C8.51737 12.5256 8.9325 12.8582 9.4452 13.2684L12.5966 15.7889C12.7786 15.6032 12.9206 15.3806 13.0106 15.1336L13.0507 14.9979C13.0842 14.8491 13.0982 14.6561 13.0868 14.3739C13.079 14.1817 13.0598 13.9625 13.0321 13.704L12.9247 12.7938L12.58 9.9813C12.4933 9.27584 12.4322 8.78581 12.3544 8.40903C12.2972 8.13219 12.2364 7.94873 12.1679 7.81235L12.0966 7.69028C11.9069 7.40908 11.6437 7.18669 11.3368 7.04673L11.203 6.99204C11.0364 6.93147 10.8195 6.90059 10.4432 6.91587Z"
              ></path>
              <path d="M9.72841 1.5897C10.1797 1.60809 10.7322 1.67665 11.4159 1.7606L14.2284 2.1063L15.1581 2.22446C15.4371 2.26322 15.6859 2.3028 15.9071 2.34849C16.3571 2.44144 16.7509 2.57006 17.1015 2.80649L17.3026 2.95396C17.7576 3.31618 18.1055 3.79802 18.3056 4.34751L18.3544 4.49692C18.4567 4.84845 18.4772 5.21519 18.4608 5.61704C18.4516 5.84273 18.4292 6.09381 18.3993 6.37388L18.2899 7.30454L17.9442 10.117C17.8603 10.8007 17.7934 11.3535 17.702 11.7958C17.6207 12.1895 17.5122 12.5401 17.328 12.8563L17.244 12.9901C17.0958 13.2098 16.921 13.4086 16.7255 13.5829L16.6171 13.662C16.3496 13.8174 16.0009 13.769 15.787 13.5292C15.5427 13.255 15.5666 12.834 15.8407 12.5897L16.0018 12.4276C16.0519 12.3703 16.0986 12.3095 16.1415 12.2459L16.2128 12.1239C16.2813 11.9875 16.3421 11.8041 16.3993 11.5272C16.4771 11.1504 16.5383 10.6605 16.6249 9.95493L16.9696 7.14243L17.077 6.23228C17.1047 5.97357 17.1239 5.7546 17.1317 5.56235C17.1432 5.27997 17.1291 5.08722 17.0956 4.93833L17.0556 4.80259C16.9396 4.4842 16.7381 4.20493 16.4745 3.99497L16.3573 3.90903C16.2103 3.80991 16.0075 3.72745 15.6386 3.65122C15.4502 3.61231 15.2331 3.57756 14.9755 3.54185L14.0663 3.42563L11.2538 3.08091C10.5481 2.99426 10.0582 2.93444 9.67372 2.9188C9.39129 2.90732 9.19861 2.92142 9.0497 2.95493L8.91395 2.99497C8.59536 3.11093 8.31538 3.31224 8.10536 3.57603L8.0204 3.69321C7.95293 3.79324 7.89287 3.91951 7.83778 4.10532L7.787 4.23032C7.64153 4.50308 7.31955 4.64552 7.01161 4.55454C6.65948 4.45019 6.45804 4.07952 6.56239 3.72739L6.63075 3.52036C6.70469 3.31761 6.79738 3.12769 6.91786 2.94907L7.06532 2.7479C7.42756 2.29294 7.90937 1.94497 8.45888 1.74497L8.60829 1.69614C8.95981 1.59385 9.32655 1.57335 9.72841 1.5897Z"></path>
            </svg>
            <span>Library</span>
          </button>
        </div>

        <div className="flex items-center justify-between px-3 mt-6 mb-2">
          <button
            type="button"
            onClick={() => setIsHistoryCollapsed((prev) => !prev)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
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
          isHistoryCollapsed
            ? "pointer-events-none select-none opacity-0 h-0"
            : "opacity-100"
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
            <div className="text-sm">Create your first chat</div>
          </div>
        ) : (
          <div className="space-y-1">
            {sortedConversations.map((conv) => (
              <div
                key={conv.id}
                className={`group relative mb-1 cursor-pointer rounded-lg border border-transparent px-4 py-2 text-sm transition-all duration-150 ${
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
                <div className="flex items-center gap-3 h-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-medium text-slate-900 truncate dark:text-white">
                        {conv.title}
                      </h3>
                    </div>
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
                          isMenuOpen
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
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
                              onSelect={(event) => {
                                event.stopPropagation();
                                handleRename(conv);
                              }}
                              className="cursor-pointer"
                            >
                              <Pencil className="h-4 w-4" />
                              Rename
                            </DropdownMenuItem>
                            {onDeleteConversation && (
                              <>
                                <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10" />
                                <DropdownMenuItem
                                  className="cursor-pointer text-rose-500 focus:text-rose-400 dark:text-rose-400 dark:focus:text-rose-300"
                                  onSelect={(event) => {
                                    event.stopPropagation();
                                    handleDelete(conv);
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
        <div className="border-t border-slate-200/70 dark:border-white/10 px-3 py-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full rounded-xl bg-gray-50 dark:bg-gray-800/50 px-4 py-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={(user as any)?.avatar_url || ""}
                    alt={userName}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      img.src = "";
                    }}
                  />
                  <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {userName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {plan}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="top"
              className="w-[260px] p-0 rounded-xl bg-white dark:bg-gray-800 border border-slate-200/70 dark:border-white/10 shadow-lg"
            >
              {/* User Account Section */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200/70 dark:border-white/10">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={(user as any)?.avatar_url || ""}
                    alt={userName}
                  />
                  <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
                    {user?.email || "user@example.com"}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <DropdownMenuItem
                  onClick={() => navigate("/upgrade")}
                  className="flex items-center gap-3 px-4 py-2.5 cursor-pointer focus:bg-gray-50 dark:focus:bg-gray-700/50"
                >
                  <div className="flex h-5 w-5 items-center justify-center">
                    <Sparkles className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-200">
                    Upgrade plan
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/settings")}
                  className="flex items-center gap-3 px-4 py-2.5 cursor-pointer focus:bg-gray-50 dark:focus:bg-gray-700/50"
                >
                  <div className="flex h-5 w-5 items-center justify-center">
                    <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-200">
                    Settings
                  </span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-slate-200/70 dark:bg-white/10 my-1" />

                <DropdownMenuItem
                  onClick={() => {
                    // Clear all state immediately (optimistic update)
                    dispatch(clearAuth());
                    dispatch(clearConversations());
                    // Navigate immediately
                    navigate("/login", { replace: true });
                    // Call logout API in background (fire and forget)
                    dispatch(logout()).catch(() => {
                      // Ignore errors - auth state already cleared
                    });
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 cursor-pointer focus:bg-gray-50 dark:focus:bg-gray-700/50 text-gray-700 dark:text-gray-200"
                >
                  <div className="flex h-5 w-5 items-center justify-center">
                    <DoorOpen className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="flex-1 text-sm">Log out</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Search Modal - Rendered at root via Portal */}
      {showSearchModal &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            onClick={() => setShowSearchModal(false)}
          >
            <div
              className="bg-white dark:bg-[#1f2937] rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input */}
              <div className="p-4 border-b border-slate-200/70 dark:border-white/10">
                <div className="relative">
                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search chats..."
                    autoFocus
                    className="w-full h-12 pl-12 pr-12 rounded-lg border border-slate-200/70 bg-white text-slate-700 placeholder:text-slate-400 outline-none focus:border-slate-300 dark:border-white/10 dark:bg-[#111827] dark:text-slate-200 dark:focus:border-white/20"
                  />
                  <button
                    onClick={() => setShowSearchModal(false)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full text-slate-400 transition-colors hover:bg-slate-900/10 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white"
                    aria-label="Close"
                  >
                    <svg
                      className="w-5 h-5 mx-auto"
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
                </div>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto p-3">
                {/* New Chat Button */}
                <button
                  onClick={() => {
                    onNewChat();
                    setShowSearchModal(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 transition-colors mb-4"
                >
                  <NewChatIcon className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    New chat
                  </span>
                </button>

                {/* Group by date */}
                {(() => {
                  const now = new Date().getTime();
                  const oneDayAgo = now - 24 * 60 * 60 * 1000;
                  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

                  const searchFiltered = conversations.filter((conv) =>
                    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
                  );

                  const yesterday = searchFiltered.filter(
                    (c) => c.updatedAt > oneDayAgo
                  );
                  const previousWeek = searchFiltered.filter(
                    (c) =>
                      c.updatedAt <= oneDayAgo && c.updatedAt > sevenDaysAgo
                  );
                  const older = searchFiltered.filter(
                    (c) => c.updatedAt <= sevenDaysAgo
                  );

                  return (
                    <>
                      {yesterday.length > 0 && (
                        <div className="mb-4">
                          <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 px-3 mb-2">
                            Yesterday
                          </h3>
                          {yesterday.map((conv) => (
                            <button
                              key={conv.id}
                              onClick={() => {
                                onSelectConversation(conv.id);
                                setShowSearchModal(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-left"
                            >
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                                data-rtl-flip=""
                                className="icon"
                              >
                                <path d="M16.835 9.99968C16.8348 6.49038 13.8111 3.58171 10 3.58171C6.18893 3.58171 3.16523 6.49038 3.16504 9.99968C3.16504 11.4535 3.67943 12.7965 4.55273 13.8766C4.67524 14.0281 4.72534 14.2262 4.68945 14.4176C4.59391 14.9254 4.45927 15.4197 4.30469 15.904C4.93198 15.8203 5.5368 15.6959 6.12793 15.528L6.25391 15.5055C6.38088 15.4949 6.5091 15.5208 6.62305 15.5817C7.61731 16.1135 8.76917 16.4186 10 16.4186C13.8112 16.4186 16.835 13.5091 16.835 9.99968ZM18.165 9.99968C18.165 14.3143 14.4731 17.7487 10 17.7487C8.64395 17.7487 7.36288 17.4332 6.23438 16.8757C5.31485 17.118 4.36919 17.2694 3.37402 17.3307C3.14827 17.3446 2.93067 17.2426 2.79688 17.0602C2.66303 16.8778 2.63177 16.6396 2.71289 16.4284L2.91992 15.863C3.08238 15.3953 3.21908 14.9297 3.32227 14.4606C2.38719 13.2019 1.83496 11.6626 1.83496 9.99968C1.83515 5.68525 5.52703 2.25163 10 2.25163C14.473 2.25163 18.1649 5.68525 18.165 9.99968Z"></path>
                              </svg>
                              <span className="text-sm text-slate-700 dark:text-slate-200 truncate">
                                {conv.title}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {previousWeek.length > 0 && (
                        <div className="mb-4">
                          <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 px-3 mb-2">
                            Previous 7 Days
                          </h3>
                          {previousWeek.map((conv) => (
                            <button
                              key={conv.id}
                              onClick={() => {
                                onSelectConversation(conv.id);
                                setShowSearchModal(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-left"
                            >
                              <svg
                                className="w-5 h-5 text-slate-500 dark:text-slate-400 flex-shrink-0"
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
                              <span className="text-sm text-slate-700 dark:text-slate-200 truncate">
                                {conv.title}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {older.length > 0 && (
                        <div className="mb-4">
                          <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 px-3 mb-2">
                            Older
                          </h3>
                          {older.map((conv) => (
                            <button
                              key={conv.id}
                              onClick={() => {
                                onSelectConversation(conv.id);
                                setShowSearchModal(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-left"
                            >
                              <svg
                                className="w-5 h-5 text-slate-500 dark:text-slate-400 flex-shrink-0"
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
                              <span className="text-sm text-slate-700 dark:text-slate-200 truncate">
                                {conv.title}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {searchFiltered.length === 0 && (
                        <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                          <svg
                            className="w-12 h-12 mx-auto mb-3 opacity-50"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          <p className="text-sm">No chats found</p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Rename Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Conversation</DialogTitle>
            <DialogDescription>
              Enter a new name for this conversation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRenameSubmit();
                } else if (e.key === "Escape") {
                  handleRenameCancel();
                }
              }}
              placeholder="Conversation name"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleRenameCancel}>
              Cancel
            </Button>
            <Button onClick={handleRenameSubmit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConversation?.title}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-rose-500 hover:bg-rose-600 focus:ring-rose-500"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Sidebar;
