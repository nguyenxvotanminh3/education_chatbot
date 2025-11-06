import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../../core/store/hooks";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { settingsService, UserSettings } from "../services/settingsService";
import { setDarkMode } from "../../ui/store/uiSlice";

const SettingsPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const userId = user?.email || user?.id || null;

  // Load settings from sessionStorage on mount
  const [settings] = useState<UserSettings>(() =>
    settingsService.getSettings(userId)
  );

  // General settings
  const [language, setLanguage] = useState(settings.language);
  const [fontSize, setFontSize] = useState(settings.fontSize);
  const [theme, setTheme] = useState<"light" | "dark" | "system">(settings.theme);
  const [enterToSend, setEnterToSend] = useState(settings.enterToSend);

  // Privacy settings
  const [memoryEnabled, setMemoryEnabled] = useState(settings.memoryEnabled);
  const [dataCollection, setDataCollection] = useState(settings.dataCollection);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(settings.analyticsEnabled);

  // Apply fontSize to document root
  useEffect(() => {
    const root = document.documentElement;
    if (fontSize === "small") {
      root.style.fontSize = "14px";
    } else if (fontSize === "medium") {
      root.style.fontSize = "16px";
    } else if (fontSize === "large") {
      root.style.fontSize = "18px";
    }
  }, [fontSize]);

  // Apply theme when it changes
  useEffect(() => {
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      dispatch(setDarkMode(prefersDark));
    } else {
      dispatch(setDarkMode(theme === "dark"));
    }
    settingsService.saveSettings({ theme }, userId);
  }, [theme, dispatch, userId]);

  // Save settings whenever they change
  useEffect(() => {
    settingsService.saveSettings(
      {
        language,
        fontSize,
        theme,
        enterToSend,
        memoryEnabled,
        dataCollection,
        analyticsEnabled,
      },
      userId
    );
  }, [language, fontSize, theme, enterToSend, memoryEnabled, dataCollection, analyticsEnabled, userId]);

  // Handle language change
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    // Apply language immediately (you can add i18n here later)
    toast.success(`Language changed to ${value}`);
  };

  // Handle fontSize change
  const handleFontSizeChange = (value: string) => {
    setFontSize(value as "small" | "medium" | "large");
  };

  // Handle theme change
  const handleThemeChange = (value: string) => {
    setTheme(value as "light" | "dark" | "system");
  };

  // Handle enterToSend change
  const handleEnterToSendChange = (checked: boolean) => {
    setEnterToSend(checked);
    toast.success(checked ? "Enter to send enabled" : "Enter to send disabled");
  };

  // Handle memory enabled change
  const handleMemoryEnabledChange = (checked: boolean) => {
    setMemoryEnabled(checked);
    toast.success(checked ? "Conversation memory enabled" : "Conversation memory disabled");
  };

  // Handle data collection change
  const handleDataCollectionChange = (checked: boolean) => {
    setDataCollection(checked);
    toast.success(checked ? "Data collection enabled" : "Data collection disabled");
  };

  // Handle analytics change
  const handleAnalyticsChange = (checked: boolean) => {
    setAnalyticsEnabled(checked);
    toast.success(checked ? "Analytics enabled" : "Analytics disabled");
  };

  const handleExportAllData = () => {
    // Mock export all conversations
    const data = {
      conversations: JSON.parse(localStorage.getItem("conversations") || "[]"),
      settings: {
        language,
        fontSize,
        theme,
        enterToSend,
        memoryEnabled,
        dataCollection,
        analyticsEnabled,
      },
      exportDate: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `edu-chat-export-${Date.now()}.json`;
    link.click();
    toast.success("All data exported successfully");
  };

  const handleClearMemory = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all conversation memory? This cannot be undone."
      )
    ) {
      localStorage.removeItem("conversations");
      toast.success("Memory cleared successfully");
    }
  };

  const handleClearAllData = () => {
    if (
      window.confirm(
        "Are you sure you want to delete all your data? This includes all conversations, settings, and preferences. This cannot be undone."
      )
    ) {
      localStorage.clear();
      toast.success("All data cleared");
      navigate("/");
    }
  };

  const keyboardShortcuts = [
    { keys: ["Cmd/Ctrl", "K"], description: "Open command palette" },
    { keys: ["Enter"], description: "Send message" },
    { keys: ["Shift", "Enter"], description: "New line in message" },
    { keys: ["Cmd/Ctrl", "N"], description: "New chat" },
    { keys: ["Esc"], description: "Close modal/dialog" },
    { keys: ["/"], description: "Slash commands in composer" },
  ];

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center px-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mr-4"
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
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full mx-auto max-w-4xl p-6">
          <Tabs defaultValue="general" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="privacy">Privacy & Memory</TabsTrigger>
              <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="flex-1 overflow-y-auto space-y-6">
              <div className="space-y-6">
                {/* Language */}
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred language for the interface
                  </p>
                </div>

                {/* Font Size */}
                <div className="space-y-3">
                  <Label>Font Size</Label>
                  <RadioGroup value={fontSize} onValueChange={handleFontSizeChange}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="small" id="small" />
                      <Label htmlFor="small" className="font-normal">
                        Small
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium" className="font-normal">
                        Medium (recommended)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="large" id="large" />
                      <Label htmlFor="large" className="font-normal">
                        Large
                      </Label>
                    </div>
                  </RadioGroup>
                  <p className="text-sm text-muted-foreground">
                    Adjust the text size for better readability
                  </p>
                </div>

                {/* Theme */}
                <div className="space-y-3">
                  <Label>Theme</Label>
                  <RadioGroup
                    value={theme}
                    onValueChange={handleThemeChange}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="light" />
                      <Label htmlFor="light" className="font-normal">
                        Light
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="dark" />
                      <Label htmlFor="dark" className="font-normal">
                        Dark
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="system" id="system" />
                      <Label htmlFor="system" className="font-normal">
                        System (auto)
                      </Label>
                    </div>
                  </RadioGroup>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred color scheme
                  </p>
                </div>

                {/* Enter to Send */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Press Enter to send</Label>
                    <p className="text-sm text-muted-foreground">
                      Use Enter to send messages (Shift+Enter for new line)
                    </p>
                  </div>
                  <Switch
                    checked={enterToSend}
                    onCheckedChange={handleEnterToSendChange}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Privacy & Memory Tab */}
            <TabsContent value="privacy" className="flex-1 overflow-y-auto space-y-6">
              <div className="space-y-6">
                {/* Memory */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Conversation Memory</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow AI to remember your preferences and context across
                        conversations
                      </p>
                    </div>
                    <Switch
                      checked={memoryEnabled}
                      onCheckedChange={handleMemoryEnabledChange}
                    />
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleClearMemory}
                    className="w-full"
                  >
                    Clear All Conversation History
                  </Button>
                </div>

                {/* Data Collection */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Data Collection</Label>
                    <p className="text-sm text-muted-foreground">
                      Help improve the service by sharing usage data
                    </p>
                  </div>
                  <Switch
                    checked={dataCollection}
                    onCheckedChange={handleDataCollectionChange}
                  />
                </div>

                {/* Analytics */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow anonymous analytics to improve user experience
                    </p>
                  </div>
                  <Switch
                    checked={analyticsEnabled}
                    onCheckedChange={handleAnalyticsChange}
                  />
                </div>

                {/* Danger Zone */}
                <div className="pt-6 border-t border-border">
                  <h3 className="text-lg font-semibold text-destructive mb-4">
                    Danger Zone
                  </h3>
                  <div className="space-y-3">
                    <Button
                      variant="destructive"
                      onClick={handleClearAllData}
                      className="w-full"
                    >
                      Delete All Data Permanently
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      This will delete all your conversations, settings, and
                      preferences. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Shortcuts Tab */}
            <TabsContent value="shortcuts" className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Learn keyboard shortcuts to navigate faster
                </p>

                <div className="rounded-lg border border-border">
                  <div className="overflow-hidden">
                    {keyboardShortcuts.map((shortcut, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-4 ${
                          index !== keyboardShortcuts.length - 1
                            ? "border-b border-border"
                            : ""
                        }`}
                      >
                        <span className="text-sm">{shortcut.description}</span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, kidx) => (
                            <span key={kidx} className="flex items-center gap-1">
                              <kbd className="px-2 py-1 text-xs bg-muted rounded border border-border font-mono">
                                {key}
                              </kbd>
                              {kidx < shortcut.keys.length - 1 && (
                                <span className="text-muted-foreground">+</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Export Tab */}
            <TabsContent value="export" className="flex-1 overflow-y-auto space-y-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Export Your Data</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download all your conversations, settings, and preferences as a
                    JSON file
                  </p>
                  <Button onClick={handleExportAllData} className="w-full">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Export All Data (JSON)
                  </Button>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <h4 className="font-medium mb-2">What's included?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• All conversation history</li>
                    <li>• Your settings and preferences</li>
                    <li>• Metadata (creation dates, etc.)</li>
                    <li>• Your feedback and ratings</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex gap-3">
                    <svg
                      className="w-5 h-5 text-amber-500 shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <div className="text-sm">
                      <p className="font-medium text-amber-700 dark:text-amber-400">
                        Data Privacy Note
                      </p>
                      <p className="text-amber-600 dark:text-amber-300 mt-1">
                        Exported data is saved locally to your device. Keep it
                        secure as it contains all your conversation history.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

