import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../core/store/hooks";
import LoginPage from "../../auth/pages/LoginPage";
import SignupPage from "../../auth/pages/SignupPage";

const HomePage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/app", { replace: true });
    }
  }, [navigate, isAuthenticated]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/50 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="font-semibold">
            EDU<span className="text-primary">+</span>
          </div>
          {!isAuthenticated && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLogin(true)}
                className="h-9 px-3 inline-flex items-center rounded-md border border-border text-sm hover:bg-muted"
              >
                Log in
              </button>
              <button
                onClick={() => setShowSignup(true)}
                className="h-9 px-3 inline-flex items-center rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90"
              >
                Sign up
              </button>
            </div>
          )}
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
