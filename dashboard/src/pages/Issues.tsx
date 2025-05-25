import React, { useEffect, useState, useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Search,
  Star,
  Lightbulb,
} from "lucide-react"; // Icons for cards and buttons
import axios from "axios"; // Import axios for consistent API calls

// Assuming these interfaces are consistent with your Shipments.tsx
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Define the IssueReport interface to match your C# model
interface IssueReport {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  shipmentId: number | null;
  // shipment: Shipment | null; // This will be fetched on demand now
  createdAt: string; // DateTime will be a string in JS
  isImportant: boolean; // We'll add this client-side for now
  isFixed: boolean; // We'll add this client-side for now
}

// Re-defining Shipment interface based on your Shipments.tsx
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

// --- Re-using the ShipmentDetailModal from Shipments.tsx ---
// You should ideally put this in a shared components folder (e.g., components/ShipmentDetailModal.tsx)
// and import it into both Shipments.tsx and Issues.tsx.
// For now, I'll include it here for completeness, but keep that in mind for better project structure.

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

            <div className="flex justify-end mt-6">
              <button
                className="bg-indigo-700 text-white hover:bg-indigo-600 px-6 py-3 rounded-md transition-colors duration-200"
                onClick={onClose} // Use onClick instead of onPress for standard button
              >
                Sluiten
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
// --- End ShipmentDetailModal ---


const Issues = () => {
  const [issueReports, setIssueReports] = useState<IssueReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showImportantFirst, setShowImportantFirst] = useState<boolean>(false);

  // --- State for the Detail Modal ---
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [shipmentIssues, setShipmentIssues] = useState<IssueReport[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // --- API Call ---
  useEffect(() => {
    const fetchIssueReports = async () => {
      try {
        const response = await axios.get<IssueReport[]>(
          `${API_BASE_URL}/api/IssueReport`
        );
        // Initialize isImportant and isFixed flags client-side
        const initializedData = response.data.map((issue) => ({
          ...issue,
          isImportant: false, // Default to not important
          isFixed: false, // Default to not fixed
        }));
        setIssueReports(initializedData);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchIssueReports();
  }, []);

  // --- Derived State (Memoized for performance) ---

  const totalUnsolvedIssues = useMemo(() => {
    return issueReports.filter((issue) => !issue.isFixed).length;
  }, [issueReports]);

  const fixedIssuesToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    return issueReports.filter((issue) => {
      if (!issue.isFixed) return false;
      // You'd need to store a 'resolvedAt' timestamp on the issue for this to be accurate.
      // For now, it will count issues marked as fixed today if their createdAt is today.
      // If you want accurate "fixed today" count, you need a 'resolvedAt' field in IssueReport model and database.
      const issueCreatedAt = new Date(issue.createdAt);
      return issueCreatedAt >= today;
    }).length;
  }, [issueReports]);

  const fixedIssuesTotal = useMemo(() => {
    return issueReports.filter((issue) => issue.isFixed).length;
  }, [issueReports]);

  // --- Filtering and Sorting ---
  const filteredAndSortedIssues = useMemo(() => {
    let filtered = issueReports.filter(
      (issue) =>
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (issue.description &&
          issue.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (issue.shipmentId && issue.shipmentId.toString().includes(searchTerm)) // Allow searching by shipmentId
    );

    if (showImportantFirst) {
      // Sort to show important issues first, then by creation date for consistency
      filtered.sort((a, b) => {
        if (a.isImportant && !b.isImportant) return -1;
        if (!a.isImportant && b.isImportant) return 1;
        // If importance is the same, sort by creation date (newest first)
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    } else {
      // If not showing important first, sort by creation date (newest first)
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return filtered;
  }, [issueReports, searchTerm, showImportantFirst]);

  // --- Handlers ---
  const handleToggleImportance = (id: number) => {
    setIssueReports((prevReports) =>
      prevReports.map((issue) =>
        issue.id === id ? { ...issue, isImportant: !issue.isImportant } : issue
      )
    );
  };

  const handleToggleFixed = (id: number) => {
    setIssueReports((prevReports) =>
      prevReports.map((issue) =>
        issue.id === id ? { ...issue, isFixed: !issue.isFixed } : issue
      )
    );
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // --- NEW: Handle Issue Card Click to Open Modal ---
  const handleIssueCardClick = async (issue: IssueReport) => {
    setIsLoadingDetails(true);
    setDetailError(null);
    setSelectedShipment(null);
    setShipmentIssues([]);

    try {
      let shipment: Shipment | null = null;
      let issuesForShipment: IssueReport[] = [];

      if (issue.shipmentId) {
        // Fetch shipment details if associated
        const shipmentResponse = await axios.get<Shipment>(
          `${API_BASE_URL}/api/Shipments/${issue.shipmentId}`
        );
        shipment = shipmentResponse.data;

        // Fetch all issues for THIS specific shipment
        const issuesResponse = await axios.get<IssueReport[]>(
          `${API_BASE_URL}/api/IssueReport/shipment/${issue.shipmentId}`
        );
        issuesForShipment = issuesResponse.data;
      } else {
        // If the issue is not associated with a shipment,
        // we can still display the modal but with only the current issue in the "problems" section
        // and no shipment details.
        issuesForShipment = [issue];
        // Optionally, you could set a dummy shipment object if the modal requires it,
        // or modify the modal to handle null shipment gracefully for non-shipment issues.
      }

      setSelectedShipment(shipment);
      setShipmentIssues(issuesForShipment);
      setIsModalOpen(true);
    } catch (err: any) {
      console.error(`Failed to fetch details for issue ${issue.id}:`, err);
      if (axios.isAxiosError(err) && err.response) {
        setDetailError(`Fout bij het laden: ${err.response.status} - ${err.response.statusText}`);
      } else {
        setDetailError("Kon details niet laden.");
      }
    } finally {
      setIsLoadingDetails(false);
    }
  };


  if (loading) {
    return <div className="p-6 text-white">Loading issue reports...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 min-h-[92vh]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-white">ISSUE DASHBOARD</h1>
        <p className="text-gray-400">Overzicht van alle gemelde problemen</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Unsolved Issues Card */}
        <div className="bg-indigo-900 rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-300 mb-2">Totaal onopgeloste problemen</p>
              <h2 className="text-3xl font-bold text-white">
                {totalUnsolvedIssues}
              </h2>
            </div>
            <div className="p-2 bg-indigo-800 rounded-md">
              <AlertTriangle className="text-red-400" size={24} />{" "}
            </div>
          </div>
        </div>

        {/* Fixed Issues Today Card */}
        <div className="bg-indigo-900 rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-300 mb-2">Vandaag opgeloste problemen</p>
              <h2 className="text-3xl font-bold text-white">
                {fixedIssuesToday}
              </h2>
            </div>
            <div className="p-2 bg-indigo-800 rounded-md">
              <CheckCircle className="text-green-400" size={24} />{" "}
            </div>
          </div>
        </div>

        {/* Fixed Issues Total Card */}
        <div className="bg-indigo-900 rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-300 mb-2">Totaal opgeloste problemen</p>
              <h2 className="text-3xl font-bold text-white">
                {fixedIssuesTotal}
              </h2>
            </div>
            <div className="p-2 bg-indigo-800 rounded-md">
              <Lightbulb className="text-yellow-200" size={24} />{" "}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-start gap-4">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Zoek problemen (titel, beschrijving of zending ID)"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-[#1E1B33] text-white rounded pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            startContent={
              <Search
                className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                size={20}
              />
            }
          />
        </div>
        <label className="flex items-center text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={showImportantFirst}
            onChange={() => setShowImportantFirst(!showImportantFirst)}
            className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out bg-[#1E1B33] border-gray-600 rounded mr-2"
          />
          Belangrijke problemen eerst
        </label>
      </div>

      {/* Issue List */}
      <div className="bg-indigo-900 rounded-lg p-6">
        <h3 className="text-white font-semibold mb-4">
          Problemen die nog moeten worden opgelost
        </h3>
        {filteredAndSortedIssues.length === 0 ? (
          <p className="text-gray-400">Geen problemen gevonden.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedIssues.map((issue) => (
              <div
                key={issue.id}
                // Make the whole card clickable
                onClick={() => handleIssueCardClick(issue)}
                className="bg-[#1E1B33] rounded-lg p-4 flex flex-col justify-between shadow-lg cursor-pointer hover:bg-indigo-800/70 hover:shadow-xl hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-200 ease-in-out"
              >
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    {issue.title}
                  </h4>
                  {issue.description && (
                    <p className="text-gray-300 text-sm mb-2">
                      {issue.description}
                    </p>
                  )}
                  {issue.imageUrl && (
                    <img
                      src={issue.imageUrl}
                      alt="Issue"
                      className="w-full h-32 object-cover rounded-md mb-2"
                    />
                  )}
                  {issue.shipmentId && (
                    // Remove Link, as the whole card is now clickable
                    <p className="text-gray-400 text-xs mb-2">
                      Zending ID: <span className="font-bold">{issue.shipmentId}</span>
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-auto">
                    Aangemaakt op: {new Date(issue.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    // Prevent propagation to parent div's onClick
                    onClick={(e) => { e.stopPropagation(); handleToggleImportance(issue.id); }}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                      issue.isImportant
                        ? "bg-yellow-500 text-black"
                        : "bg-indigo-800 text-gray-300 hover:bg-indigo-700"
                    }`}
                  >
                    {issue.isImportant ? (
                      <span className="flex items-center">
                        <Star className="mr-1" size={16} /> Belangrijk
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Star className="mr-1" size={16} /> Markeer als
                        belangrijk
                      </span>
                    )}
                  </button>
                  <button
                    // Prevent propagation to parent div's onClick
                    onClick={(e) => { e.stopPropagation(); handleToggleFixed(issue.id); }}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                      issue.isFixed
                        ? "bg-green-600 text-white"
                        : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                    }`}
                  >
                    {issue.isFixed ? (
                      <span className="flex items-center">
                        <CheckCircle className="mr-1" size={16} /> Opgelost
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <CheckCircle className="mr-1" size={16} /> Markeer als
                        opgelost
                      </span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Shipment Detail Modal Integration --- */}
      <ShipmentDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        shipment={selectedShipment}
        issues={shipmentIssues} // Pass the fetched issues
        isLoading={isLoadingDetails}
        error={detailError}
      />
      {/* --- END NEW --- */}
    </div>
  );
};

export default Issues;

// Dummy Input component to match NextUI Input styling (replace with actual NextUI Input if available in your project)
const Input = ({
  placeholder,
  value,
  onChange,
  className,
  startContent,
}: any) => {
  return (
    <div className={`relative ${className}`}>
      {startContent}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-[#1E1B33] text-white rounded pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};