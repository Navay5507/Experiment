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
          width: "56px", 
          height: "30px", 
          borderRadius: "99px", 
          background: "rgba(255, 255, 255, 0.03)", 
          border: "1px solid rgba(255, 255, 255, 0.08)",
          flexShrink: 0
        }} 
      />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      style={{
        width: "56px",
        height: "30px",
        borderRadius: "99px",
        background: theme === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.03)",
        border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
        padding: "2px",
        position: "relative",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        outline: "none",
        flexShrink: 0,
        boxShadow: theme === "dark" ? "none" : "inset 0 1px 3px rgba(0, 0, 0, 0.03)"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.04)";
        e.currentTarget.style.borderColor = theme === "dark" ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.borderColor = theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)";
      }}
    >
      {/* Background Icons (faint indicators) */}
      <div style={{ display: "flex", width: "100%", justifyContent: "space-between", padding: "0 6px", opacity: 0.3, pointerEvents: "none" }}>
        <Sun size={10} color={theme === "light" ? "var(--text-heading)" : "#888"} />
        <Moon size={10} color={theme === "dark" ? "var(--text-heading)" : "#888"} />
      </div>

      {/* Active Sliding Thumb */}
      <div
        style={{
          position: "absolute",
          top: "2px",
          left: "2px",
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          background: theme === "dark" ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(0, 0, 0, 0.06)",
          boxShadow: theme === "dark" ? "0 2px 4px rgba(0, 0, 0, 0.4)" : "0 2px 4px rgba(0, 0, 0, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateX(${theme === "dark" ? "28px" : "0px"})`,
          transition: "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s, border-color 0.3s"
        }}
      >
        {theme === "dark" ? (
          <Moon size={11} color="#38bdf8" fill="#38bdf8" style={{ transform: "rotate(-12deg)", transition: "transform 0.5s ease" }} />
        ) : (
          <Sun size={11} color="#f59e0b" fill="#f59e0b" style={{ transition: "transform 0.5s ease" }} />
        )}
      </div>
    </button>
  );
}
