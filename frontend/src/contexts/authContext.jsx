import React, { createContext, useState, useEffect } from "react";

// 1. Create the actual context (the memory bank)
export const AuthContext = createContext();

// 2. Create the Provider (the wrapper that shares the memory)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 3. Check for existing logins when the app first loads
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      // If we find saved data, log the user in automatically
      setUser(JSON.parse(storedUser));
    }

    // Finish loading whether we found a user or not
    setLoading(false);
  }, []);

  // 4. The function to run when a user successfully logs in
  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // 5. The function to run when a user clicks logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
