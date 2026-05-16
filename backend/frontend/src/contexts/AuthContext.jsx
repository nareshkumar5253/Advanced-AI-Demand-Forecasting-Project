import React from "react";
import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (payload) => {
    const fakeUser = {
      name: payload.email,
      email: payload.email
    };

    localStorage.setItem("token", "demo-token");
    localStorage.setItem("user", JSON.stringify(fakeUser));

    setUser(fakeUser);
  };

  const register = async (payload) => {
    const fakeUser = {
      name: payload.name || payload.email,
      email: payload.email
    };

    localStorage.setItem("token", "demo-token");
    localStorage.setItem("user", JSON.stringify(fakeUser));

    setUser(fakeUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    login,
    register,
    logout
  }), [user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}