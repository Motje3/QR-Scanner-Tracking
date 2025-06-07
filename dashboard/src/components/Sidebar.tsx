import React from "react";
import { Link } from "react-router-dom";
import {
  Home,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  User,
  PackagePlus,
} from "lucide-react";
import { tokens } from "../theme";

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  // Get the sidebar color from theme tokens
  const sidebarBgColor = tokens.custom.sidebar;

  return (
    <div
      className={`
        h-screen fixed left-0 top-0 text-white 
        flex flex-col z-20 
        transition-all duration-300 ease-in-out 
        ${isOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full pointer-events-none"}
      `}
      style={{ backgroundColor: sidebarBgColor }}
    >
      {/* Inner container for content that fades */}
      <div
        className={`
          flex flex-col h-full 
          transition-opacity duration-200 ease-in-out
          ${isOpen ? "opacity-100 delay-150" : "opacity-0"} 
        `}
      >
        <div className="p-6 border-b border-indigo-900">
          <h1 className="text-3xl font-bold text-yellow-200 ml-4">
            E. Lafeber
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="mt-4">
            <div className="px-6 py-3">
              <Link
                to="/dashboard"
                className="flex items-center py-2 px-4 rounded-md hover:bg-indigo-800"
              >
                <Home size={20} className="mr-3" />
                <span>Dashboard</span>
              </Link>
            </div>
            <div className="px-6 py-3">
              <p className="text-gray-400 text-sm uppercase font-semibold mb-2">
                Client Facing
              </p>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/shipments"
                    className="flex items-center py-2 px-4 rounded-md text-gray-300 hover:bg-indigo-800"
                  >
                    <ShoppingCart size={20} className="mr-3" />
                    <span>Zendingen</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/newshipment"
                    className="flex items-center py-2 px-4 rounded-md text-gray-300 hover:bg-indigo-800"
                  >
                    <PackagePlus size={20} className="mr-3" />
                    <span>Nieuwe zending</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/stats"
                    className="flex items-center py-2 px-4 rounded-md text-gray-300 hover:bg-indigo-800"
                  >
                    <Users size={20} className="mr-3" />
                    <span>Statistieken</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/issues"
                    className="flex items-center py-2 px-4 rounded-md text-gray-300 hover:bg-indigo-800"
                  >
                    <FileText size={20} className="mr-3" />
                    <span>Problemen</span>
                  </Link>
                </li>
              </ul>
            </div>
            <div className="px-6 py-3">
              <p className="text-gray-400 text-sm uppercase font-semibold mb-2">
                Management
              </p>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/accounts"
                    className="flex items-center py-2 px-4 rounded-md text-gray-300 hover:bg-indigo-800"
                  >
                    <Settings size={20} className="mr-3" />
                    <span>Accounts</span>
                  </Link>
                </li>
                {/* New Account Settings link */}
                <li>
                  <Link
                    to="/account-settings"
                    className="flex items-center py-2 px-4 rounded-md text-gray-300 hover:bg-indigo-800"
                  >
                    <User size={20} className="mr-3" />
                    <span>Account Settings</span>
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
        <div className="p-4 border-t border-indigo-900 flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-white mr-3">
            <span className="font-bold">T</span>
          </div>
          <div>
            <p className="font-medium">Team-5</p>
            <p className="text-xs text-gray-400">Legends</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
