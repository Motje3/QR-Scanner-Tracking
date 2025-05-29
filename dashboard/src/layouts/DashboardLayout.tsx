// src/layouts/DashboardLayout.tsx
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar"; // Ensure this import path is correct
import { tokens } from "../theme";
import { useAuth } from "../context/AuthContext"; // Import useAuth

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { logout } = useAuth(); // Get logout function from context

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const bgColor = tokens.custom.background; // Assuming tokens is correctly defined and imported

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
      <Sidebar isOpen={isSidebarOpen} />

      {/* Pass logout to Topbar */}
      <Topbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} onLogout={logout} />

      <main
        className={`p-6 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "md:ml-64" : "ml-0"
        } pt-20`}
      >
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;