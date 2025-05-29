import React from "react";
import { Search, Moon, Settings, Download, Menu, LogOut } from "lucide-react"; // Import LogOut icon
import { Link } from "react-router-dom";
import { tokens } from "../theme";
import Papa from "papaparse";
import axios from "axios";

interface TopbarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  onLogout: () => void; // Add the onLogout prop here
}

const Topbar: React.FC<TopbarProps> = ({ toggleSidebar, isSidebarOpen, onLogout }) => {
  const bgColor = tokens.custom.background; // Get the background color from theme tokens

  const handleDownloadReport = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.get(`${API_BASE_URL}/api/Shipments`);
      const shipments = response.data;

      const csv = Papa.unparse(
        shipments.map((s: any) => ({
          ID: s.id,
          Status: s.status,
          Bestemming: s.destination,
          Toegewezen: s.assignedTo,
          "Verwachte levering": s.expectedDelivery,
          Gewicht: s.weight,
          CreatedAt: s.createdAt,
        })),
        {
          quotes: false,
          delimiter: ",",
          header: true,
        }
      );

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "shipments-rapport.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Fout bij downloaden van rapport");
    }
  };

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
        <button
          className="bg-yellow-200 text-indigo-950 px-4 py-2 rounded flex items-center font-medium"
          onClick={handleDownloadReport}
        >
          <Download size={18} className="mr-2" />
          Rapport downloaden
        </button>
        {/* Logout Button */}
        <button
          onClick={onLogout} // Call the onLogout prop when clicked
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center font-medium transition-colors duration-200"
          aria-label="Uitloggen"
        >
          <LogOut size={18} className="mr-2" />
          Uitloggen
        </button>
      </div>
    </div>
  );
};

export default Topbar;