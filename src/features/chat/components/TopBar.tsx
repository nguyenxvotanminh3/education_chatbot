import { Conversation, ConversationTools } from "../types";
import { useMemo, useState } from "react";
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
import LoginPage from "../../auth/pages/LoginPage";
import SignupPage from "../../auth/pages/SignupPage";
import { cn } from "@/lib/utils";
import { toggleDarkMode } from "../../ui/store/uiSlice";
import { settingsService } from "../../auth/services/settingsService";

interface TopBarProps {
  currentConversation?: Conversation | null;
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
  model = "GPT-4",
  onModelChange,
  onSettings,
}: TopBarProps) => {
  const [shareOpen, setShareOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const isDark = useAppSelector((s) => s.ui.isDark);
  const user = useAppSelector((s) => s.auth.user);
  const userId = user?.email || user?.id || null;
  const dispatch = useAppDispatch();
  const shareUrl = useMemo(() => {
    return window.location.origin + "/share";
  }, []);

  const handleThemeToggle = () => {
    dispatch(toggleDarkMode());
    // Update settings to match the toggle
    const newIsDark = !isDark;
    // If user toggles, we assume they want to override system preference
    const newTheme = newIsDark ? 'dark' : 'light';
    settingsService.saveSettings({ theme: newTheme }, userId);
  };
  return (
    <div className="h-16 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left: Model dropdown */}
        {/* Left: Model Selector */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
            </svg>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-9 px-4 text-sm font-medium flex items-center gap-2 border-border/60 hover:bg-muted/70 transition-all duration-200"
              >
                <span className="text-foreground">{model}</span>
                <svg
                  className="w-4 h-4 text-muted-foreground"
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
              className="w-56 shadow-xl rounded-lg border border-border/50 p-1 bg-popover backdrop-blur-sm"
            >
              <DropdownMenuItem
                key="GPT-4o"
                onClick={() => onModelChange?.("GPT-4o")}
                className={cn(
                  "flex flex-col items-start py-2.5 px-3.5 cursor-pointer rounded-md transition-colors",
                  model === "GPT-4o"
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted/70"
                )}
              >
                <span className="font-medium">GPT-4o</span>
                <span className="text-xs text-muted-foreground">
                  Fast, multimodal, balanced accuracy
                </span>
              </DropdownMenuItem>

              <DropdownMenuItem
                key="GPT-4"
                onClick={() => onModelChange?.("GPT-4")}
                className={cn(
                  "flex flex-col items-start py-2.5 px-3.5 cursor-pointer rounded-md transition-colors",
                  model === "GPT-4"
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted/70"
                )}
              >
                <span className="font-medium">GPT-4</span>
                <span className="text-xs text-muted-foreground">
                  Advanced reasoning, slightly slower
                </span>
              </DropdownMenuItem>

              <DropdownMenuItem
                key="GPT-3.5"
                onClick={() => onModelChange?.("GPT-3.5")}
                className={cn(
                  "flex flex-col items-start py-2.5 px-3.5 cursor-pointer rounded-md transition-colors",
                  model === "GPT-3.5"
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted/70"
                )}
              >
                <span className="font-medium">GPT-3.5</span>
                <span className="text-xs text-muted-foreground">
                  Lightweight and cost-effective
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right: Share + Settings or Login/Signup */}
        <div className="flex items-center gap-4 shrink-0">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => setShareOpen(true)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
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
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
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
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
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
                onClick={() => setShowLogin(true)}
                className="h-9 px-4 inline-flex items-center rounded-md bg-white text-black text-sm hover:bg-gray-100 whitespace-nowrap border border-border"
              >
                Log in
              </button>
              <button
                onClick={() => setShowSignup(true)}
                className="h-9 px-4 inline-flex items-center rounded-md bg-black text-white text-sm hover:bg-gray-900 whitespace-nowrap border border-border"
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
      {!isAuthenticated && showLogin && (
        <LoginPage
          inline
          open={showLogin}
          onClose={() => setShowLogin(false)}
        />
      )}
      {!isAuthenticated && showSignup && (
        <SignupPage
          inline
          open={showSignup}
          onClose={() => setShowSignup(false)}
        />
      )}
    </div>
  );
};

export default TopBar;
