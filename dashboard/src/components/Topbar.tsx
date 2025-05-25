import React from "react";
import { Search, Moon, Settings, Download, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { tokens } from "../theme";

interface TopbarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Topbar: React.FC<TopbarProps> = ({ toggleSidebar, isSidebarOpen }) => {
  // Get the background color from theme tokens
  const bgColor = tokens.custom.background;

  return (
    <div
      className={`h-16 flex items-center justify-between px-6 fixed top-0 right-0 z-10 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? "left-64" : "left-0"
      }`}
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex items-center">
        {/* Hamburger menu button to toggle sidebar */}
        <button
          onClick={toggleSidebar}
          className="text-gray-300 hover:text-white mr-4"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>

        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="bg-indigo-900 text-white pl-10 pr-4 py-2 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-indigo-700"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="text-gray-300 hover:text-white">
          <Moon size={20} />
        </button>
        <Link to="/account-settings" className="text-gray-300 hover:text-white">
          <Settings size={20} />
        </Link>
        <button className="bg-yellow-200 text-indigo-950 px-4 py-2 rounded flex items-center font-medium">
          <Download size={18} className="mr-2" />
          Rapport downloaden
        </button>
        <div className="flex items-center ml-4">
          <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-white">
            <span className="font-bold">T</span>
          </div>
          <div className="ml-2">
            <p className="text-white text-sm">Team-5</p>
            <p className="text-gray-400 text-xs">Legends</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
