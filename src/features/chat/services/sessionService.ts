// Service to manage user session data (school, class, subject)
export interface UserSession {
  schoolId?: string;
  schoolName?: string;
  grade?: string;
  subject?: string;
  topic?: string;
  role?: 'student' | 'teacher';
  rememberSchool?: boolean;
}

const SESSION_KEY = 'edu_chat_session';
const REMEMBER_SCHOOL_KEY = 'edu_chat_remember_school';

export const sessionService = {
  /**
   * Get user session from localStorage
   */
  getSession(): UserSession {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
    return {};
  },

  /**
   * Save user session to localStorage
   */
  saveSession(session: Partial<UserSession>): void {
    try {
      const current = this.getSession();
      const updated = { ...current, ...session };
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  },

  /**
   * Clear session
   */
  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
  },

  /**
   * Check if user wants to remember school
   */
  shouldRememberSchool(): boolean {
    return localStorage.getItem(REMEMBER_SCHOOL_KEY) === 'true';
  },

  /**
   * Set remember school preference
   */
  setRememberSchool(remember: boolean): void {
    if (remember) {
      localStorage.setItem(REMEMBER_SCHOOL_KEY, 'true');
    } else {
      localStorage.removeItem(REMEMBER_SCHOOL_KEY);
    }
  },

  /**
   * Get remembered school
   */
  getRememberedSchool(): { id: string; name: string } | null {
    const session = this.getSession();
    if (session.schoolId && session.schoolName && this.shouldRememberSchool()) {
      return {
        id: session.schoolId,
        name: session.schoolName,
      };
    }
    return null;
  },
};

