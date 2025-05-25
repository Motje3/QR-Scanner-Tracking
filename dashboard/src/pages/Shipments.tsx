import { useEffect, useState } from "react";
import axios from "axios";
import { Input, Button } from "@nextui-org/react";
import { ClipboardList, Search } from "lucide-react";

interface Shipment {
  id: number;
  status: string;
  destination: string;
  assignedTo: string;
  expectedDelivery: string;
  weight: string;
  createdAt: string;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}

const CustomDropdown = ({
  options,
  selected,
  setSelected,
  placeholder = "Kies een status",
}: {
  options: string[];
  selected: string | null;
  setSelected: (val: string) => void;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block min-w-[200px]">
      <button
        onClick={() => setOpen(!open)}
        className="bg-[#1E1B33] text-white w-full px-4 py-2 rounded-md flex justify-between items-center shadow-sm hover:bg-[#2A2745] transition-colors duration-200"
      >
        {selected || placeholder}
        <span
          className="ml-2 transform transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▼
        </span>
      </button>
      {open && (
        <ul className="absolute z-50 bg-[#1E1B33] w-full mt-1 rounded-md shadow-lg border border-[#3A365A] max-h-60 overflow-y-auto">
          {" "}
          {/* z-50 from previous fix */}
          {options.map((option) => (
            <li
              key={option}
              onClick={() => {
                setSelected(option);
                setOpen(false);
              }}
              className="px-4 py-2 hover:bg-[#2A2745] cursor-pointer text-sm"
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Shipments = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filtered, setFiltered] = useState<Shipment[]>([]);
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const uniqueStatuses = [
    "Alle Statussen",
    ...new Set(shipments.map((s) => s.status).filter(Boolean)),
  ];

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5070";

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/Shipments`)
      .then((res) => {
        setShipments(res.data);
        setFiltered(res.data);
      })
      .catch((err) => console.error("Failed to fetch shipments:", err));
  }, [API_BASE_URL]);

  useEffect(() => {
    const lowerQuery = query.toLowerCase();
    const filteredList = shipments.filter(
      (s) =>
        (s.id.toString().includes(lowerQuery) || // Make sure to search ID as string
          s.destination?.toLowerCase().includes(lowerQuery) ||
          s.status?.toLowerCase().includes(lowerQuery) ||
          s.assignedTo?.toLowerCase().includes(lowerQuery)) &&
        (selectedStatus && selectedStatus !== "Alle Statussen"
          ? s.status === selectedStatus
          : true)
    );
    setFiltered(filteredList);
  }, [query, shipments, selectedStatus]);

  const inputWrapperBaseStyle = // Used by the Reset Filters button
    "bg-[#1E1B33] border border-[#3A365A] text-white rounded-md transition-colors duration-200";

  const handleRowClick = (shipmentId: number) => {
    console.log(`Shipment row clicked: ${shipmentId}`);
    alert(`Zending ID ${shipmentId} geklikt! Functionaliteit volgt nog.`);
  };

  // Helper function to get status color
  const getStatusColorClass = (status: string) => {
    switch (
      status?.toLowerCase() // Added optional chaining and toLowerCase for robustness
    ) {
      case "geleverd":
        return "text-green-400";
      case "onderweg":
        return "text-orange-400";
      case "in afwachting":
        return "text-yellow-400";
      // You can add more Dutch status cases here
      case "in transit": // Example if some data might still have English
        return "text-blue-400"; // Or map to a Dutch equivalent's color
      case "delivered":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "failed":
        return "text-red-400";
      default:
        return "text-gray-400"; // Default color for unknown or other statuses
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 min-h-[92vh]">
      <div className="flex items-center space-x-4 mb-8">
        <ClipboardList size={48} className="text-yellow-300" /> {/* Icon */}
        <div>
          <h1 className="text-4xl font-bold text-white">Zendingen Overzicht</h1>{" "}
          {/* Big title */}
          <p className="text-indigo-300 text-sm">
            Bekijk en beheer alle geregistreerde zendingen.
          </p>{" "}
          {/* Small descriptive text */}
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 p-4 bg-indigo-900/60 backdrop-blur-sm rounded-xl shadow-lg relative z-30">
        {/* Custom Search Input with Clear Button */}
        <div className="relative max-w-md w-full">
          <div className="flex items-center h-12 bg-indigo-900/70 border border-indigo-700/50 rounded-xl shadow-lg px-3 pr-10 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/50 transition-all duration-200">
            <Search size={18} className="text-gray-400 mr-2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Zoek op ID, status, bestemming..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 placeholder:text-base outline-none"
            />
          </div>
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white text-2xl font-bold"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Status Filter and Reset Button (unchanged) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <CustomDropdown
            options={uniqueStatuses}
            selected={selectedStatus}
            setSelected={setSelectedStatus}
            placeholder="Filter op status"
          />
          <Button
            className={`${inputWrapperBaseStyle} text-sm h-12 px-4 hover:bg-[#2A2745] min-w-[150px]`}
            variant="flat"
            onPress={() => {
              setQuery("");
              setSelectedStatus(null);
            }}
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Custom table with proper spacing */}
      <div className="space-y-4">
        {/* Table Header */}
        <div className="grid grid-cols-6 gap-4 bg-indigo-900/80 backdrop-blur-sm rounded-lg p-4">
          <div className="text-left text-xs uppercase tracking-wider font-semibold text-indigo-300">
            ID
          </div>
          <div className="text-left text-xs uppercase tracking-wider font-semibold text-indigo-300">
            Status
          </div>
          <div className="text-left text-xs uppercase tracking-wider font-semibold text-indigo-300">
            Bestemming
          </div>
          <div className="text-left text-xs uppercase tracking-wider font-semibold text-indigo-300">
            Toegewezen Aan
          </div>
          <div className="text-left text-xs uppercase tracking-wider font-semibold text-indigo-300">
            Verwachte Levering
          </div>
          <div className="text-left text-xs uppercase tracking-wider font-semibold text-indigo-300">
            Gewicht
          </div>
        </div>

        {/* Table Body with proper spacing */}
        <div className="space-y-3">
          {" "}
          {/* This controls the space between shipment rows */}
          {filtered.length === 0 ? (
            <div className="text-center text-gray-400 py-8 bg-indigo-800/70 backdrop-blur-sm rounded-lg">
              Geen zendingen gevonden die voldoen aan uw criteria.
            </div>
          ) : (
            filtered.map((shipment) => (
              <div
                key={shipment.id}
                onClick={() => handleRowClick(shipment.id)}
                className="grid grid-cols-6 gap-4 p-4 bg-indigo-800/70 backdrop-blur-sm rounded-lg shadow-md hover:bg-indigo-700/90 hover:shadow-xl hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-200 ease-in-out cursor-pointer"
              >
                <div className="text-sm text-gray-200 self-center">
                  {shipment.id}
                </div>{" "}
                {/* Added self-center for vertical alignment */}
                <div className="text-sm self-center">
                  {" "}
                  {/* Added self-center */}
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColorClass(shipment.status)}`}
                  >
                    {shipment.status}
                  </span>
                </div>
                <div className="text-sm text-gray-300 self-center">
                  {shipment.destination || "-"}
                </div>{" "}
                {/* Added self-center */}
                <div className="text-sm text-gray-300 self-center">
                  {shipment.assignedTo || "-"}
                </div>{" "}
                {/* Added self-center */}
                <div className="text-sm text-gray-300 self-center">
                  {shipment.expectedDelivery || "-"}
                </div>{" "}
                {/* Added self-center */}
                <div className="text-sm text-gray-300 self-center">
                  {shipment.weight || "-"}
                </div>{" "}
                {/* Added self-center */}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Shipments;
