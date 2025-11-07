import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../core/store/hooks";
import { Switch } from "@/components/ui/switch";
import { toggleDarkMode } from "../../ui/store/uiSlice";
import LoginPage from "../../auth/pages/LoginPage";
import SignupPage from "../../auth/pages/SignupPage";

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const isDark = useAppSelector((s) => s.ui.isDark);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/app", { replace: true });
    }
  }, [navigate, isAuthenticated]);

  return (
    <div className={`min-h-screen bg-background ${!isAuthenticated ? "pb-24" : ""}`}>
      <header className="sticky top-0 z-10 bg-background/50 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="font-semibold">
            Space<span className="text-primary">+</span>
          </div>
          <div className="flex items-center gap-4">
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
            <div className="flex items-center gap-3">
              <button
                onClick={() => dispatch(toggleDarkMode())}
                className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-border text-sm hover:bg-muted"
                aria-label="Toggle dark mode"
                title="Toggle dark mode"
              >
                <span role="img" aria-hidden>🌓</span>
              </button>
              <button
                onClick={() => setShowLogin(true)}
                className="h-9 px-3 inline-flex items-center rounded-md bg-white text-black text-sm hover:bg-gray-100 whitespace-nowrap border border-border"
              >
                Log in
              </button>
              <button
                onClick={() => setShowSignup(true)}
                className="h-9 px-3 inline-flex items-center rounded-md bg-black text-white text-sm hover:bg-gray-900 whitespace-nowrap border border-border"
              >
                Sign up
              </button>
            </div>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-3">
          Welcome to Education Chatbot
        </h1>
        <p className="text-muted-foreground">Your AI learning assistant.</p>
      </main>
      {showLogin && (
        <LoginPage
          inline
          open={showLogin}
          onClose={() => setShowLogin(false)}
        />
      )}
      {showSignup && (
        <SignupPage
          inline
          open={showSignup}
          onClose={() => setShowSignup(false)}
        />
      )}
    </div>
  );
};

export default HomePage;
