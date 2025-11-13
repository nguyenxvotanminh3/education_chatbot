import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../core/store/hooks";
import { Switch } from "@/components/ui/switch";
import { toggleDarkMode } from "../../ui/store/uiSlice";
import AuthDialog from "../../auth/components/AuthDialog";

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const isDark = useAppSelector((s) => s.ui.isDark);
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/app", { replace: true });
    }
  }, [navigate, isAuthenticated]);

  return (
    <div
      className={`min-h-screen bg-background ${
        !isAuthenticated ? "pb-24" : ""
      }`}
    >
      <header className="sticky top-0 z-10 bg-background/50 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-4 sm:py-0 sm:h-16 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-semibold text-lg">
            Space<span className="text-primary">+</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {isAuthenticated && (
              <div className="flex items-center gap-2">
                <Switch
                  checked={isDark}
                  onCheckedChange={() => {
                    dispatch(toggleDarkMode());
                  }}
                  aria-label="Toggle dark mode"
                />
                <span className="text-sm text-muted-foreground">Dark mode</span>
              </div>
            )}
            {!isAuthenticated && (
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end sm:justify-between">
                <button
                  onClick={() => dispatch(toggleDarkMode())}
                  className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-border text-sm hover:bg-muted"
                  aria-label="Toggle dark mode"
                  title="Toggle dark mode"
                >
                  <span role="img" aria-hidden>
                    🌓
                  </span>
                </button>
                <div className="flex items-center gap-2 flex-1 sm:flex-none">
                  <button
                    onClick={() => setAuthModal("login")}
                    className="h-9 px-3 inline-flex items-center justify-center rounded-md bg-white text-black text-sm hover:bg-gray-100 whitespace-nowrap border border-border flex-1 sm:flex-none"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => setAuthModal("signup")}
                    className="h-9 px-3 inline-flex items-center justify-center rounded-md bg-black text-white text-sm hover:bg-gray-900 whitespace-nowrap border border-border flex-1 sm:flex-none"
                  >
                    Sign up
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-14 sm:py-16 lg:py-24 flex flex-col gap-6">
        <div className="max-w-3xl mx-auto text-center sm:text-left sm:mx-0">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
            Welcome to Education Chatbot
          </h1>
          <p className="mt-4 text-lg sm:text-xl lg:text-2xl text-muted-foreground">
            Your AI learning assistant.
          </p>
        </div>
      </main>
      <AuthDialog
        inline
        open={authModal !== null}
        onClose={() => setAuthModal(null)}
        initialMode={authModal || "login"}
      />
    </div>
  );
};

export default HomePage;
