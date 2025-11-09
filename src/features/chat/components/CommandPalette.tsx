import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  category: "model" | "tool" | "action" | "navigation";
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onModelChange?: (model: string) => void;
  onToggleTool?: (tool: string) => void;
  onToggleMemory?: () => void;
  onNewChat?: () => void;
  onSettings?: () => void;
  onExport?: () => void;
  conversations?: any[];
  onSelectConversation?: (id: string) => void;
}

const CommandPalette = ({
  open,
  onClose,
  onModelChange,
  onToggleTool,
  onToggleMemory,
  onNewChat,
  onSettings,
  onExport,
  conversations = [],
  onSelectConversation,
}: CommandPaletteProps) => {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: Command[] = [
    // Model commands
    {
      id: "model-gpt4o",
      label: "Switch to GPT-4o",
      description: "Fast, multimodal, balanced accuracy",
      category: "model",
      action: () => {
        onModelChange?.("GPT-4o");
        onClose();
      },
      keywords: ["model", "gpt4o", "switch"],
    },
    {
      id: "model-gpt4",
      label: "Switch to GPT-4",
      description: "Advanced reasoning",
      category: "model",
      action: () => {
        onModelChange?.("GPT-4");
        onClose();
      },
      keywords: ["model", "gpt4", "switch"],
    },
    {
      id: "model-gpt35",
      label: "Switch to GPT-3.5",
      description: "Lightweight and fast",
      category: "model",
      action: () => {
        onModelChange?.("GPT-3.5");
        onClose();
      },
      keywords: ["model", "gpt35", "switch"],
    },
    // Tool commands
    {
      id: "tool-web",
      label: "Toggle Web Search",
      description: "Enable/disable web browsing",
      category: "tool",
      action: () => {
        onToggleTool?.("web");
        onClose();
      },
      keywords: ["tool", "web", "browse", "search"],
    },
    {
      id: "tool-code",
      label: "Toggle Code Interpreter",
      description: "Enable/disable code execution",
      category: "tool",
      action: () => {
        onToggleTool?.("code");
        onClose();
      },
      keywords: ["tool", "code", "interpreter", "run"],
    },
    {
      id: "tool-vision",
      label: "Toggle Vision",
      description: "Enable/disable image analysis",
      category: "tool",
      action: () => {
        onToggleTool?.("vision");
        onClose();
      },
      keywords: ["tool", "vision", "image", "analyze"],
    },
    {
      id: "toggle-memory",
      label: "Toggle Memory",
      description: "Enable/disable conversation memory",
      category: "tool",
      action: () => {
        onToggleMemory?.();
        onClose();
      },
      keywords: ["memory", "remember", "context"],
    },
    // Action commands
    {
      id: "new-chat",
      label: "New Chat",
      description: "Start a new conversation",
      category: "action",
      action: () => {
        onNewChat?.();
        onClose();
      },
      keywords: ["new", "chat", "conversation", "start"],
    },
    {
      id: "export",
      label: "Export Conversation",
      description: "Download current conversation",
      category: "action",
      action: () => {
        onExport?.();
        onClose();
      },
      keywords: ["export", "download", "save"],
    },
    {
      id: "settings",
      label: "Open Settings",
      description: "Configure app settings",
      category: "navigation",
      action: () => {
        onSettings?.();
        onClose();
      },
      keywords: ["settings", "preferences", "config"],
    },
  ];

  // Add recent conversations to commands
  const conversationCommands: Command[] = conversations.slice(0, 5).map((conv) => ({
    id: `conv-${conv.id}`,
    label: conv.title,
    description: "Open conversation",
    category: "navigation" as const,
    action: () => {
      onSelectConversation?.(conv.id);
      onClose();
    },
    keywords: ["conversation", "open", conv.title.toLowerCase()],
  }));

  const allCommands = [...commands, ...conversationCommands];

  const filteredCommands = search
    ? allCommands.filter((cmd) => {
        const searchLower = search.toLowerCase();
        return (
          cmd.label.toLowerCase().includes(searchLower) ||
          cmd.description?.toLowerCase().includes(searchLower) ||
          cmd.keywords?.some((kw) => kw.toLowerCase().includes(searchLower))
        );
      })
    : allCommands;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      }
    },
    [open, filteredCommands, selectedIndex]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (open) {
      setSearch("");
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "model":
        return (
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
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        );
      case "tool":
        return (
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
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        );
      case "action":
        return (
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
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        );
      case "navigation":
        return (
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0" aria-describedby="command-palette-description">
        <DialogDescription id="command-palette-description" className="sr-only">
          Command palette for quick actions and navigation
        </DialogDescription>
        {/* Search Input */}
        <div className="p-4 border-b border-border">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or search..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
            autoFocus
          />
        </div>

        {/* Commands List */}
        <div className="max-h-[400px] overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No commands found
            </div>
          ) : (
            <div className="p-2">
              {filteredCommands.map((cmd, index) => (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                    index === selectedIndex
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  }`}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="text-muted-foreground">
                    {getCategoryIcon(cmd.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{cmd.label}</div>
                    {cmd.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {cmd.description}
                      </div>
                    )}
                  </div>
                  {index === selectedIndex && (
                    <kbd className="px-2 py-1 text-xs bg-muted rounded border border-border">
                      ↵
                    </kbd>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-border bg-muted/30 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-background rounded border border-border">↑</kbd>
            <kbd className="px-1.5 py-0.5 bg-background rounded border border-border">↓</kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-background rounded border border-border">↵</kbd>
            <span>Select</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-background rounded border border-border">Esc</kbd>
            <span>Close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;

