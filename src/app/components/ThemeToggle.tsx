"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read the saved theme from localStorage, default to dark
    const savedTheme = (localStorage.getItem("theme") as "light" | "dark") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
    setMounted(true);

    // Event listener for synchronized multi-toggle updates
    const handleThemeChange = (e: Event) => {
      const currentTheme = (localStorage.getItem("theme") as "light" | "dark") || "dark";
      setTheme(currentTheme);
    };

    window.addEventListener("theme-change", handleThemeChange);
    return () => window.removeEventListener("theme-change", handleThemeChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
    
    // Dispatch custom event to sync other toggle instances instantly
    window.dispatchEvent(new Event("theme-change"));
  };

  // Prevent server-side hydration mismatches by returning a placeholder of the same dimensions
  if (!mounted) {
    return (
      <div 
        style={{ 
          width: "40px", 
          height: "40px", 
          borderRadius: "50%", 
          background: "rgba(255, 255, 255, 0.05)", 
          border: "1px solid rgba(255, 255, 255, 0.08)" 
        }} 
      />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: theme === "dark" ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.04)",
        border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.08)",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: theme === "dark" ? "none" : "0 4px 12px rgba(0, 0, 0, 0.04)",
        outline: "none",
        flexShrink: 0
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.08)";
        e.currentTarget.style.background = theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.background = theme === "dark" ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.04)";
      }}
    >
      {theme === "dark" ? (
        <Sun size={18} color="#facc15" fill="#facc15" style={{ transition: "all 0.3s ease" }} />
      ) : (
        <Moon size={18} color="#4f46e5" fill="#4f46e5" style={{ transition: "all 0.3s ease" }} />
      )}
    </button>
  );
}
