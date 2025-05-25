// DashboardLayout.tsx
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar'; // Corrected path assuming components folder is ../
import Topbar from '../components/Topbar';   // Corrected path
import { tokens } from '../theme';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const bgColor = tokens.custom.background;

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
      {/* Sidebar is fixed, it will overlay or be a column depending on its own styling */}
      <Sidebar isOpen={isSidebarOpen} />

      {/* Topbar is fixed and manages its own left position based on isSidebarOpen */}
      <Topbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      {/* Main content area needs padding-left to account for the sidebar's width,
          and padding-top to account for the Topbar's height. */}
      <main
        className={`p-6 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'md:ml-64' : 'ml-0' // Use md:ml-64 for larger screens, ml-0 for smaller or when closed
        } pt-20`} // pt-16 (for h-16 Topbar) + some extra like p-4's top = pt-20, or adjust as needed
      >
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;