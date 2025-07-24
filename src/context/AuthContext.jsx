import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const FIVE_DAYS_MS = 1000 * 60 * 60 * 24 * 5;

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const isStaff = localStorage.getItem("isStaff") === "true";
    const lastActivity = localStorage.getItem("lastActivity");

    if (lastActivity && Date.now() - parseInt(lastActivity, 10) > FIVE_DAYS_MS) {
      localStorage.clear();
      return null;
    }

    return token && userId ? { token, userId, isStaff } : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("token", user.token);
      localStorage.setItem("userId", user.userId);
      localStorage.setItem("isStaff", user.isStaff);
      localStorage.setItem("sessionStarted", "true");
      localStorage.setItem("lastActivity", Date.now().toString());
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("isStaff");
      localStorage.removeItem("sessionStarted");
      localStorage.removeItem("lastActivity");
    }
  }, [user]);

  useEffect(() => {
    const updateLastActivity = () => {
      if (user) {
        localStorage.setItem("lastActivity", Date.now().toString());
      }
    };

    window.addEventListener("mousemove", updateLastActivity);
    window.addEventListener("keydown", updateLastActivity);
    window.addEventListener("click", updateLastActivity);

    return () => {
      window.removeEventListener("mousemove", updateLastActivity);
      window.removeEventListener("keydown", updateLastActivity);
      window.removeEventListener("click", updateLastActivity);
    };
  }, [user]);

  const login = (userData) => {
    const sessionStarted = localStorage.getItem("sessionStarted");
    if (sessionStarted) return;
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};