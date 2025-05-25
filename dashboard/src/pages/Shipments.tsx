import { useEffect, useState } from "react";
import axios from "axios";
import { Input, Button } from "@nextui-org/react";
import { ClipboardList, Search, AlertCircle } from "lucide-react"; // Import AlertCircle for issue indicator

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- NEW: Define IssueReport interface ---
interface IssueReport {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  shipmentId?: number; // Optional, as some issues might not be tied to a shipment
  createdAt: string;
}

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
  // No 'problems' property needed here, we'll fetch them separately
  // --- NEW: Add a flag to indicate if issues exist for this shipment (for immediate overview) ---
  hasIssues?: boolean;
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

// --- UPDATED: Shipment Detail Modal Component ---
interface ShipmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: Shipment | null;
  issues: IssueReport[]; // Pass issues as a prop
  isLoading: boolean;
  error: string | null;
}

const ShipmentDetailModal = ({ isOpen, onClose, shipment, issues, isLoading, error }: ShipmentDetailModalProps) => {
  if (!isOpen) return null;

  return (
    // 1. MODAL BACKGROUND TINT
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1E1B33] text-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl font-bold"
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-3xl font-bold text-yellow-300 mb-6 border-b-2 border-indigo-700 pb-2">
          Zending Details #{shipment?.id}
        </h2>

        {isLoading && (
          <div className="text-center py-8 text-indigo-300">
            Laden van zendingdetails en problemen...
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-400">
            Fout: {error}
          </div>
        )}

        {!isLoading && !error && shipment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-indigo-300 text-sm">ID:</p>
                <p className="text-lg font-semibold">{shipment.id}</p>
              </div>
              <div>
                <p className="text-indigo-300 text-sm">Status:</p>
                <p className="text-lg font-semibold">{shipment.status}</p>
              </div>
              <div>
                <p className="text-indigo-300 text-sm">Bestemming:</p>
                <p className="text-lg font-semibold">{shipment.destination || '-'}</p>
              </div>
              {/* 3. SHOW 'Toegewezen aan' AND 'Gewicht' ONLY IN DETAIL VIEW */}
              <div>
                <p className="text-indigo-300 text-sm">Toegewezen Aan:</p>
                <p className="text-lg font-semibold">{shipment.assignedTo || '-'}</p>
              </div>
              <div>
                <p className="text-indigo-300 text-sm">Verwachte Levering:</p>
                <p className="text-lg font-semibold">{shipment.expectedDelivery || '-'}</p>
              </div>
              <div>
                <p className="text-indigo-300 text-sm">Gewicht:</p>
                <p className="text-lg font-semibold">{shipment.weight || '-'}</p>
              </div>
              <div>
                <p className="text-indigo-300 text-sm">Aangemaakt Op:</p>
                <p className="text-lg font-semibold">{new Date(shipment.createdAt).toLocaleString()}</p>
              </div>
              {shipment.lastUpdatedBy && (
                <div>
                  <p className="text-indigo-300 text-sm">Laatst Bijgewerkt Door:</p>
                  <p className="text-lg font-semibold">{shipment.lastUpdatedBy}</p>
                </div>
              )}
              {shipment.lastUpdatedAt && (
                <div>
                  <p className="text-indigo-300 text-sm">Laatst Bijgewerkt Op:</p>
                  <p className="text-lg font-semibold">{new Date(shipment.lastUpdatedAt).toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* --- UPDATED: Display Issues from IssueReportController --- */}
            {issues.length > 0 ? (
              <div className="mt-6 p-4 bg-red-900/40 border border-red-700 rounded-md">
                <h3 className="text-xl font-bold text-red-300 mb-3 flex items-center">
                  <span className="mr-2">🚨</span> Gerapporteerde Problemen:
                </h3>
                <ul className="list-disc list-inside space-y-2">
                  {issues.map((issue) => (
                    <li key={issue.id} className="text-red-200 text-sm">
                      <span className="font-semibold">{issue.title}</span>
                      {issue.description && (
                        <p className="text-xs text-red-100 italic ml-4 mt-1">
                          {issue.description}
                        </p>
                      )}
                      {issue.imageUrl && (
                        <p className="text-xs text-red-100 ml-4 mt-1">
                          <a href={issue.imageUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-red-50">
                            Bekijk afbeelding
                          </a>
                        </p>
                      )}
                      <p className="text-xs text-red-100 ml-4">
                        Gerapporteerd op: {new Date(issue.createdAt).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-6 p-4 bg-green-900/40 border border-green-700 rounded-md text-green-300">
                <p className="text-center font-semibold">Geen gerapporteerde problemen voor deze zending.</p>
              </div>
            )}
            {/* --- END UPDATED --- */}

            <div className="flex justify-end mt-6">
              <Button
                className="bg-indigo-700 text-white hover:bg-indigo-600 px-6 py-3 rounded-md transition-colors duration-200"
                onPress={onClose}
              >
                Sluiten
              </Button>
            </div>
          </div>
        )}
      </div>
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

  // State for the modal
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [shipmentIssues, setShipmentIssues] = useState<IssueReport[]>([]); // NEW: State for issues
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);


  useEffect(() => {
    // Fetch all shipments initially
    axios
      .get<Shipment[]>(`${API_BASE_URL}/api/Shipments`)
      .then(async (res) => {
        const fetchedShipments = res.data;
        // 2. CHECK FOR ISSUES AND UPDATE SHIPMENTS FOR OVERVIEW
        const shipmentsWithIssueStatus = await Promise.all(
          fetchedShipments.map(async (shipment) => {
            try {
              const issuesRes = await axios.get<IssueReport[]>(`${API_BASE_URL}/api/IssueReport/shipment/${shipment.id}`);
              return { ...shipment, hasIssues: issuesRes.data.length > 0 };
            } catch (err) {
              console.warn(`Could not fetch issues for shipment ${shipment.id}:`, err);
              return { ...shipment, hasIssues: false }; // Assume no issues if API call fails
            }
          })
        );
        setShipments(shipmentsWithIssueStatus);
        setFiltered(shipmentsWithIssueStatus);
      })
      .catch((err) => console.error("Failed to fetch shipments:", err));
  }, []); // Empty dependency array means this runs once on mount

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

  const inputWrapperBaseStyle =
    "bg-[#1E1B33] border border-[#3A365A] text-white rounded-md transition-colors duration-200";

  const handleRowClick = async (shipmentId: number) => {
    setIsLoadingDetails(true);
    setDetailError(null); // Clear previous errors
    setSelectedShipment(null); // Clear previous shipment details
    setShipmentIssues([]); // Clear previous issues

    try {
      // Fetch shipment details
      const shipmentResponse = await axios.get<Shipment>(`${API_BASE_URL}/api/Shipments/${shipmentId}`);
      setSelectedShipment(shipmentResponse.data);

      // Fetch related issues
      const issuesResponse = await axios.get<IssueReport[]>(`${API_BASE_URL}/api/IssueReport/shipment/${shipmentId}`);
      setShipmentIssues(issuesResponse.data);

      setIsModalOpen(true); // Open the modal once all data is fetched
    } catch (err) {
      console.error(`Failed to fetch details or issues for shipment ${shipmentId}:`, err);
      if (axios.isAxiosError(err) && err.response) {
        // More specific error for Axios HTTP errors
        setDetailError(`Fout bij het laden: ${err.response.status} - ${err.response.statusText}`);
      } else {
        setDetailError("Kon zendingdetails of problemen niet laden."); // Generic error
      }
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Helper function to get status color (unchanged)
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
      case "in transit":
        return "text-blue-400";
      case "delivered":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "failed":
        return "text-red-400";
      default:
        return "text-gray-400";
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
        {/* 2. ADJUSTED GRID COLUMNS FOR ISSUE INDICATOR */}
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
            Verwachte Levering
          </div>
          {/* OMITTED: Toegewezen Aan and Gewicht from overview */}
          <div className="text-left text-xs uppercase tracking-wider font-semibold text-indigo-300">
            Issues
          </div>
          <div className="text-left text-xs uppercase tracking-wider font-semibold text-indigo-300">
            Actie
          </div>
        </div>

        {/* Table Body with proper spacing */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center text-gray-400 py-8 bg-indigo-800/70 backdrop-blur-sm rounded-lg">
              Geen zendingen gevonden die voldoen aan uw criteria.
            </div>
          ) : (
            filtered.map((shipment) => (
              // 2. ADJUSTED GRID COLUMNS AND ADDED ISSUE INDICATOR
              <div
                key={shipment.id}
                onClick={() => handleRowClick(shipment.id)}
                className="grid grid-cols-6 gap-4 p-4 bg-indigo-800/70 backdrop-blur-sm rounded-lg shadow-md hover:bg-indigo-700/90 hover:shadow-xl hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-200 ease-in-out cursor-pointer"
              >
                <div className="text-sm text-gray-200 self-center">
                  {shipment.id}
                </div>{" "}
                <div className="text-sm self-center">
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColorClass(shipment.status)}`}
                  >
                    {shipment.status}
                  </span>
                </div>
                <div className="text-sm text-gray-300 self-center">
                  {shipment.destination || "-"}
                </div>{" "}
                <div className="text-sm text-gray-300 self-center">
                  {shipment.expectedDelivery || "-"}
                </div>{" "}
                {/* OMITTED: Toegewezen Aan and Gewicht from here */}
                <div className="text-sm self-center">
                  {shipment.hasIssues ? (
                    <span className="text-red-400 flex items-center">
                      <AlertCircle size={16} className="mr-1" /> Problemen
                    </span>
                  ) : (
                    <span className="text-gray-500">Geen</span>
                  )}
                </div>
                <div className="text-sm text-gray-300 self-center">
                    <Button
                        size="sm"
                        className="bg-indigo-600 text-white hover:bg-indigo-500 px-3 py-1 rounded-md"
                        onPress={() => handleRowClick(shipment.id)}
                    >
                        Bekijk
                    </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Shipment Detail Modal Integration */}
      <ShipmentDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        shipment={selectedShipment}
        issues={shipmentIssues} // Pass the fetched issues
        isLoading={isLoadingDetails}
        error={detailError}
      />
    </div>
  );
};

export default Shipments;