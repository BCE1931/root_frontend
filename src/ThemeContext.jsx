import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export default function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("appTheme");
    if (!saved) return false;
    try {
      return JSON.parse(saved);
    } catch {
      localStorage.removeItem("appTheme");
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem("appTheme", JSON.stringify(isDark));
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
