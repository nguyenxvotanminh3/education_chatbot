import { Conversation, ConversationTools } from "../types";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../../core/store/hooks";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AuthDialog from "../../auth/components/AuthDialog";
import { cn } from "@/lib/utils";
import { toggleDarkMode } from "../../ui/store/uiSlice";
import { settingsService } from "../../auth/services/settingsService";
import modelIconDark from "../../../public/model_icon_dark.png";
import modelIconLight from "../../../public/model_icon_light.png";

interface TopBarProps {
  currentConversation?: Conversation | null;
  conversationId?: string;
  model?: string;
  tools?: ConversationTools;
  memoryEnabled?: boolean;
  onModelChange?: (model: string) => void;
  onToggleTool?: (tool: keyof ConversationTools) => void;
  onToggleMemory?: () => void;
  onNewChat?: () => void;
  onExport?: () => void;
  onSettings?: () => void;
}

const TopBar = ({
  model = "Easy Government Schools",
  conversationId,
  onModelChange,
  onSettings,
}: TopBarProps) => {
  const navigate = useNavigate();
  const [shareOpen, setShareOpen] = useState(false);
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const isDark = useAppSelector((s) => s.ui.isDark);
  const user = useAppSelector((s) => s.auth.user);
  const userId = user?.email || user?.id || null;
  const dispatch = useAppDispatch();
  const shareUrl = useMemo(() => {
    // If conversation has ID and has messages, share the conversation URL
    if (conversationId) {
      return `${window.location.origin}/app/${conversationId}`;
    }
    // Otherwise, share the base app URL
    return `${window.location.origin}/app`;
  }, [conversationId]);

  const handleThemeToggle = () => {
    dispatch(toggleDarkMode());
    // Update settings to match the toggle
    const newIsDark = !isDark;
    // If user toggles, we assume they want to override system preference
    const newTheme = newIsDark ? "dark" : "light";
    settingsService.saveSettings({ theme: newTheme }, userId);
  };
  return (
    <div className="h-16 min-h-16 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="h-full px-2 sm:px-4 flex items-center justify-between gap-2 sm:gap-3 overflow-hidden">
        {/* Left: Model dropdown */}
        {/* Left: Model Selector */}
        <div className={`flex items-center gap-2 sm:gap-3 min-w-0 ${isAuthenticated ? 'pl-14 md:pl-0' : ''}`}>
          {/* Model icons - only show when not authenticated */}
          {!isAuthenticated && (
            <img
              src={isDark ? modelIconLight : modelIconDark}
              alt="Model icon"
              className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 object-contain"
            />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-9 px-2 sm:px-4 text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 border-0 hover:bg-muted/70 transition-all duration-200 whitespace-nowrap flex-shrink-0"
              >
                <span className="text-foreground truncate max-w-[100px] sm:max-w-none">{model}</span>
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              className="w-72 shadow-xl rounded-lg border border-border/50 p-1 bg-popover backdrop-blur-sm"
            >
              <DropdownMenuItem
                key="Easy Government Schools"
                onClick={() => onModelChange?.("Easy Government Schools")}
                className={cn(
                  "flex flex-col items-start py-2.5 px-3.5 cursor-pointer rounded-md transition-colors",
                  model === "Easy Government Schools"
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted/70"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">
                      Easy Government Schools (Public)
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Unlimited Free
                    </span>
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                key="Easy Private Schools"
                onSelect={(e) => {
                  e.preventDefault();
                }}
                className={cn(
                  "py-2.5 px-3.5 rounded-md transition-colors",
                  model === "Easy Private Schools"
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted/70"
                )}
                asChild
              >
                <div className="flex items-center justify-between gap-2 w-full cursor-default">
                  <div
                    className="flex flex-col items-start flex-1 cursor-pointer"
                    onClick={() => onModelChange?.("Easy Private Schools")}
                  >
                    <span className="font-medium">Easy Private Schools</span>
                    <span className="text-xs text-muted-foreground">
                      25 Free Chats
                    </span>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate("/upgrade");
                    }}
                    className="h-7 px-3 text-xs bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
                    size="sm"
                  >
                    Upgrade
                  </Button>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right: Share + Settings or Login/Signup */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => setShareOpen(true)}
                className="p-2 md:block hidden rounded-lg hover:bg-muted transition-colors flex-shrink-0"
                aria-label="Share"
              >
                <svg
                  className="w-5 h-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4m0 0L8 6m4-4v14"
                  />
                </svg>
              </button>
              {/* Theme Toggle */}
              <button
                onClick={handleThemeToggle}
                className="p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
                aria-label={
                  isDark ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {isDark ? (
                  <svg
                    className="w-5 h-5 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </button>
              {onSettings && (
                <button
                  onClick={onSettings}
                  className="p-2 md:block hidden rounded-lg hover:bg-muted transition-colors flex-shrink-0"
                  aria-label="Settings"
                >
                  <svg
                    className="w-5 h-5 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => setAuthModal("login")}
                className="h-9 px-2 sm:px-4 inline-flex items-center rounded-md bg-white text-black text-xs sm:text-sm hover:bg-gray-100 whitespace-nowrap border border-border flex-shrink-0"
              >
                Log in
              </button>
              <button
                onClick={() => setAuthModal("signup")}
                className="h-9 px-2 sm:px-4 inline-flex items-center rounded-md bg-black text-white text-xs sm:text-sm hover:bg-gray-900 whitespace-nowrap border border-border flex-shrink-0"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
      {/* Share popup */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share link</DialogTitle>
            <DialogDescription>
              Copy or open the link to share this chat.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 h-10 rounded-md bg-muted px-3 text-sm outline-none"
            />
            <Button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(shareUrl);
                } catch {}
              }}
              variant="secondary"
              className="h-10 px-3"
            >
              Copy
            </Button>
            <a
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              className="h-10 px-3 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90"
            >
              Open
            </a>
          </div>
        </DialogContent>
      </Dialog>
      {!isAuthenticated && (
        <AuthDialog
          inline
          open={authModal !== null}
          onClose={() => setAuthModal(null)}
          initialMode={authModal || "login"}
        />
      )}
    </div>
  );
};

export default TopBar;
