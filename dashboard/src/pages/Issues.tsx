import React, { useEffect, useState, useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle, // Ensure CheckCircle is imported and available
  Search,
  Star,
  Lightbulb,
} from "lucide-react";
import axios from "axios";
import LoadingSpinner from '../components/LoadingSpinner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface IssueReport {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  shipmentId: number | null;
  createdAt: string;
  isImportant: boolean;
  isFixed: boolean;
  resolvedAt: string | null;
}

interface Shipment {
  id: number;
  status: string;
  destination: string;
  assignedTo: string;
  expectedDelivery: string;
  weight: string;
  createdAt: string;
  lastUpdatedBy: string | null; // Corrected based on ShipmentDetail.tsx
  lastUpdatedAt: string | null; // Corrected based on ShipmentDetail.tsx
}

interface ShipmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: Shipment | null;
  issues: IssueReport[];
  isLoading: boolean;
  error: string | null;
}

const ShipmentDetailModal = ({
  isOpen,
  onClose,
  shipment,
  issues,
  isLoading,
  error,
}: ShipmentDetailModalProps) => {
  if (!isOpen) return null;

  // --- NEW: Determine if all problems are resolved ---
  const allProblemsResolved = useMemo(() => {
    // Ensure issues is not null and has items before checking 'every'
    if (!issues || issues.length === 0) {
      return false; // No issues to be resolved, or issues not loaded
    }
    return issues.every((issue) => issue.isFixed);
  }, [issues]);
  // --- END NEW ---

  return (
    <div
      className={`
        fixed inset-0 bg-black flex items-center justify-center z-50 p-4
        transition-all duration-300 ease-in-out
        ${isOpen ? "bg-opacity-70 backdrop-blur-sm" : "bg-opacity-0 backdrop-blur-none"}
      `}
      // This div handles the background blur and opacity
      onClick={onClose} // Close when clicking outside the modal content
    >
      <div
        className={`
          bg-[#1E1B33] text-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative
          transform transition-all duration-300 ease-in-out
          ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}
        `}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl font-bold"
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
          <div className="text-center py-8 text-red-400">Fout: {error}</div>
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
                <p className="text-lg font-semibold">
                  {shipment.destination || "-"}
                </p>
              </div>
              <div>
                <p className="text-indigo-300 text-sm">Toegewezen Aan:</p>
                <p className="text-lg font-semibold">
                  {shipment.assignedTo || "-"}
                </p>
              </div>
              <div>
                <p className="text-indigo-300 text-sm">Verwachte leverdatum:</p>
                <p className="text-lg font-semibold">
                  {shipment.expectedDelivery || "-"}
                </p>
              </div>
              <div>
                <p className="text-indigo-300 text-sm">Gewicht:</p>
                <p className="text-lg font-semibold">
                  {shipment.weight || "-"}
                </p>
              </div>
              <div>
                <p className="text-indigo-300 text-sm">Aangemaakt Op:</p>
                <p className="text-lg font-semibold">
                  {new Date(shipment.createdAt).toLocaleString()}
                </p>
              </div>
              {shipment.lastUpdatedBy && (
                <div>
                  <p className="text-indigo-300 text-sm">
                    Laatst Bijgewerkt Door:
                  </p>
                  <p className="text-lg font-semibold">
                    {shipment.lastUpdatedBy}
                  </p>
                </div>
              )}
              {shipment.lastUpdatedAt && (
                <div>
                  <p className="text-indigo-300 text-sm">
                    Laatst Bijgewerkt Op:
                  </p>
                  <p className="text-lg font-semibold">
                    {new Date(shipment.lastUpdatedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {allProblemsResolved && issues.length > 0 ? (
              <div className="mt-6 p-4 bg-green-800/60 border border-green-600 rounded-md text-green-200">
                <div className="flex items-center justify-center space-x-3">
                  <CheckCircle className="text-green-400" size={28} />
                  <p className="text-lg font-semibold text-center">
                    Alle problemen voor deze zending zijn opgelost!
                  </p>
                </div>
              </div>
            ) : issues.length > 0 ? (
              <div className="mt-6 p-4 bg-red-900/40 border border-red-700 rounded-md">
                <h3 className="text-xl font-bold text-red-300 mb-3 flex items-center">
                  <AlertTriangle className="mr-2 text-red-400" size={24} />{" "}
                  Gerapporteerde Problemen:
                </h3>
                <ul className="list-disc list-inside space-y-2">
                  {issues.map((issue) => (
                    <li
                      key={issue.id}
                      className={`text-sm ${
                        issue.isFixed ? "text-green-300" : "text-red-200"
                      }`}
                    >
                      <span className="font-semibold">{issue.title}</span>
                      {issue.isFixed && (
                        <span className="ml-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                          Opgelost
                        </span>
                      )}
                      {issue.description && (
                        <p
                          className={`text-xs italic ml-4 mt-1 ${
                            issue.isFixed
                              ? "text-green-200/80"
                              : "text-red-100"
                          }`}
                        >
                          {issue.description}
                        </p>
                      )}
                      {issue.imageUrl && (
                        <p className="text-xs text-gray-400 ml-4 mt-1">
                          <a
                            href={issue.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-indigo-300"
                          >
                            Bekijk afbeelding
                          </a>
                        </p>
                      )}
                      <p
                        className={`text-xs ml-4 ${
                          issue.isFixed ? "text-gray-500" : "text-red-100/70"
                        }`}
                      >
                        Gerapporteerd op:{" "}
                        {new Date(issue.createdAt).toLocaleString()}
                      </p>
                      {issue.resolvedAt && issue.isFixed && (
                        <p className="text-xs text-green-300/90 ml-4">
                          Opgelost op:{" "}
                          {new Date(issue.resolvedAt).toLocaleString()}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700 rounded-md text-slate-300">
                <div className="flex items-center justify-center space-x-3">
                  <CheckCircle className="text-slate-400" size={24} />
                  <p className="text-center font-semibold">
                    Geen gerapporteerde problemen voor deze zending.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                className="bg-indigo-600 text-white hover:bg-indigo-500 px-3 py-1 rounded-md"
                onClick={onClose}
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

type FilterType = "all" | "unsolved" | "fixedToday" | "fixedTotal";

const Issues = () => {
  const [issueReports, setIssueReports] = useState<IssueReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showImportantFirst, setShowImportantFirst] =
    useState<boolean>(false);
  const [currentFilter, setCurrentFilter] = useState<FilterType>("all");

  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null
  );
  const [shipmentIssues, setShipmentIssues] = useState<IssueReport[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [firstLoad, setFirstLoad] = useState(() => {
    return localStorage.getItem('issuesLoaded') === 'true' ? false : true;
  });

  useEffect(() => {
    if (firstLoad) {
      const timer = setTimeout(() => {
        setFirstLoad(false);
        localStorage.setItem('issuesLoaded', 'true');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [firstLoad]);

  useEffect(() => {
    const fetchIssueReports = async () => {
      setLoading(true);
      try {
        const response = await axios.get<IssueReport[]>(
          `${API_BASE_URL}/api/IssueReport`
        );
        setIssueReports(response.data);
      } catch (e: any) {
        setError(e.message || "Failed to fetch issue reports");
      } finally {
        setLoading(false);
      }
    };
    fetchIssueReports();
  }, []);

  const totalUnsolvedIssues = useMemo(() => {
    return issueReports.filter((issue) => !issue.isFixed).length;
  }, [issueReports]);

  const fixedIssuesToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return issueReports.filter((issue) => {
      if (!issue.isFixed || !issue.resolvedAt) return false;
      const issueResolvedAt = new Date(issue.resolvedAt);
      return issueResolvedAt >= today;
    }).length;
  }, [issueReports]);

  const fixedIssuesTotal = useMemo(() => {
    return issueReports.filter((issue) => issue.isFixed).length;
  }, [issueReports]);

  const filteredAndSortedIssues = useMemo(() => {
    let filtered = issueReports.filter(
      (issue) =>
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (issue.description &&
          issue.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (issue.shipmentId && issue.shipmentId.toString().includes(searchTerm))
    );

    if (currentFilter === "unsolved") {
      filtered = filtered.filter((issue) => !issue.isFixed);
    } else if (currentFilter === "fixedToday") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter((issue) => {
        if (!issue.isFixed || !issue.resolvedAt) return false;
        const issueResolvedAt = new Date(issue.resolvedAt);
        return issueResolvedAt >= today;
      });
    } else if (currentFilter === "fixedTotal") {
      filtered = filtered.filter((issue) => issue.isFixed);
    }

    if (showImportantFirst) {
      filtered.sort((a, b) => {
        if (a.isImportant && !b.isImportant) return -1;
        if (!a.isImportant && b.isImportant) return 1;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    } else {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return filtered;
  }, [issueReports, searchTerm, showImportantFirst, currentFilter]);

  const handleToggleImportance = async (id: number) => {
    const issueIndex = issueReports.findIndex((issue) => issue.id === id);
    if (issueIndex === -1) return;

    const issueToUpdate = issueReports[issueIndex];
    const newIsImportant = !issueToUpdate.isImportant;

    const updatedIssue = { ...issueToUpdate, isImportant: newIsImportant };
    const updatedReports = [...issueReports];
    updatedReports[issueIndex] = updatedIssue;
    setIssueReports(updatedReports); // Optimistic update

    try {
      await axios.put(`${API_BASE_URL}/api/IssueReport/${id}`, {
        // Send only the fields that are being updated
        title: issueToUpdate.title,
        description: issueToUpdate.description,
        isImportant: newIsImportant,
        isFixed: issueToUpdate.isFixed,
        // shipmentId is not typically changed here
      });
    } catch (err) {
      console.error(`Failed to update importance for issue ${id}:`, err);
      // Revert UI update if API call fails
      const revertedReports = [...issueReports];
      revertedReports[issueIndex] = issueToUpdate; // Revert to original issue
      setIssueReports(revertedReports);
      // Optionally, show an error message to the user
    }
  };

  const handleToggleFixed = async (id: number) => {
    const issueIndex = issueReports.findIndex((issue) => issue.id === id);
    if (issueIndex === -1) return;
    
    const issueToUpdate = issueReports[issueIndex];
    const newIsFixed = !issueToUpdate.isFixed;
    const newResolvedAt = newIsFixed ? new Date().toISOString() : null;

    const updatedIssue = { ...issueToUpdate, isFixed: newIsFixed, resolvedAt: newResolvedAt };
    const updatedReports = [...issueReports];
    updatedReports[issueIndex] = updatedIssue;
    setIssueReports(updatedReports); // Optimistic update

     // Update shipmentIssues in the modal if it's open and for the same shipment
    if (isModalOpen && selectedShipment && issueToUpdate.shipmentId === selectedShipment.id) {
      setShipmentIssues(prev => prev.map(si => si.id === id ? updatedIssue : si));
    }


    try {
      await axios.put(`${API_BASE_URL}/api/IssueReport/${id}`, {
        // Send only the fields that are being updated
        title: issueToUpdate.title,
        description: issueToUpdate.description,
        isImportant: issueToUpdate.isImportant,
        isFixed: newIsFixed,
        resolvedAt: newResolvedAt,
      });
    } catch (err) {
      console.error(`Failed to update fixed status for issue ${id}:`, err);
      // Revert UI update if API call fails
      const revertedReports = [...issueReports];
      revertedReports[issueIndex] = issueToUpdate; // Revert to original issue
      setIssueReports(revertedReports);
       // Revert shipmentIssues in the modal if it was updated
      if (isModalOpen && selectedShipment && issueToUpdate.shipmentId === selectedShipment.id) {
        setShipmentIssues(prev => prev.map(si => si.id === id ? issueToUpdate : si));
      }
      // Optionally, show an error message to the user
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterClick = (filterType: FilterType) => {
    setCurrentFilter(filterType);
  };

  const handleIssueCardClick = async (issue: IssueReport) => {
    setIsLoadingDetails(true);
    setDetailError(null);
    setSelectedShipment(null);
    setShipmentIssues([]); // Clear previous issues

    try {
      let shipment: Shipment | null = null;
      let issuesForShipment: IssueReport[] = [];

      if (issue.shipmentId) {
        const shipmentResponse = await axios.get<Shipment>(
          `${API_BASE_URL}/api/Shipments/${issue.shipmentId}`
        );
        shipment = shipmentResponse.data;

        // Fetch all issues for THIS specific shipment from the main issueReports state
        // This ensures consistency with the data already loaded and optimistically updated
        issuesForShipment = issueReports.filter(r => r.shipmentId === issue.shipmentId);

        // If for some reason issuesForShipment is empty (e.g. new issue not yet in main list from initial load)
        // or to ensure freshest data for modal, you might consider re-fetching.
        // For now, using the main state for consistency with optimistic updates.
        if (issuesForShipment.length === 0) {
            // Fallback or alternative: re-fetch specifically for the modal if needed
            console.warn(`No issues found in local state for shipment ${issue.shipmentId}, considering refetch for modal.`);
            const issuesResponse = await axios.get<IssueReport[]>(
              `${API_BASE_URL}/api/IssueReport/shipment/${issue.shipmentId}`
            );
            issuesForShipment = issuesResponse.data;
        }


      } else {
        // Issue not associated with a shipment
        issuesForShipment = [issue]; // Only show the clicked issue
      }

      setSelectedShipment(shipment);
      setShipmentIssues(issuesForShipment);
      setIsModalOpen(true);
    } catch (err: any) {
      console.error(`Failed to fetch details for issue ${issue.id}:`, err);
      if (axios.isAxiosError(err) && err.response) {
        setDetailError(
          `Fout bij het laden: ${err.response.status} - ${err.response.statusText}`
        );
      } else {
        setDetailError("Kon details niet laden.");
      }
    } finally {
      setIsLoadingDetails(false);
    }
  };

  if (firstLoad) return <LoadingSpinner />;

  if (loading && issueReports.length === 0) { // Show loading only on initial load
    return <LoadingSpinner />;
  }

  if (error && issueReports.length === 0) { // Show error only if no data could be loaded
    return <div className="p-6 text-red-500 text-center">Fout: {error}</div>;
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 min-h-[calc(100vh-themeHeaderHeight)]"> {/* Adjust min-h if you have a fixed header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-white">Problemen overzicht</h1>
        <p className="text-gray-400">Overzicht van alle gemelde problemen</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          className={`bg-indigo-900/80 backdrop-blur-sm rounded-lg p-6 cursor-pointer hover:bg-indigo-800/70 transition-all duration-200 ${
            currentFilter === "all" ? "ring-2 ring-blue-400 shadow-blue-500/30 shadow-lg" : "hover:shadow-md hover:shadow-indigo-500/20"
          }`}
          onClick={() => handleFilterClick("all")}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-300 mb-2">Alle problemen</p>
              <h2 className="text-3xl font-bold text-white">
                {issueReports.length}
              </h2>
            </div>
            <div className="p-3 bg-indigo-700/50 rounded-lg">
              <Search className="text-blue-300" size={24} />
            </div>
          </div>
        </div>

        <div
          className={`bg-indigo-900/80 backdrop-blur-sm rounded-lg p-6 cursor-pointer hover:bg-indigo-800/70 transition-all duration-200 ${
            currentFilter === "unsolved" ? "ring-2 ring-red-400 shadow-red-500/30 shadow-lg" : "hover:shadow-md hover:shadow-indigo-500/20"
          }`}
          onClick={() => handleFilterClick("unsolved")}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-300 mb-2">Totaal onopgelost</p>
              <h2 className="text-3xl font-bold text-white">
                {totalUnsolvedIssues}
              </h2>
            </div>
            <div className="p-3 bg-red-700/50 rounded-lg">
              <AlertTriangle className="text-red-300" size={24} />
            </div>
          </div>
        </div>

        <div
          className={`bg-indigo-900/80 backdrop-blur-sm rounded-lg p-6 cursor-pointer hover:bg-indigo-800/70 transition-all duration-200 ${
            currentFilter === "fixedToday" ? "ring-2 ring-green-400 shadow-green-500/30 shadow-lg" : "hover:shadow-md hover:shadow-indigo-500/20"
          }`}
          onClick={() => handleFilterClick("fixedToday")}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-300 mb-2">Vandaag opgelost</p>
              <h2 className="text-3xl font-bold text-white">
                {fixedIssuesToday}
              </h2>
            </div>
            <div className="p-3 bg-green-700/50 rounded-lg">
              <CheckCircle className="text-green-300" size={24} />
            </div>
          </div>
        </div>
        
        <div
          className={`bg-indigo-900/80 backdrop-blur-sm rounded-lg p-6 cursor-pointer hover:bg-indigo-800/70 transition-all duration-200 ${
            currentFilter === "fixedTotal" ? "ring-2 ring-yellow-300 shadow-yellow-400/30 shadow-lg" : "hover:shadow-md hover:shadow-indigo-500/20"
          }`}
          onClick={() => handleFilterClick("fixedTotal")}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-300 mb-2">Totaal opgelost</p>
              <h2 className="text-3xl font-bold text-white">
                {fixedIssuesTotal}
              </h2>
            </div>
            <div className="p-3 bg-yellow-600/50 rounded-lg">
              <Lightbulb className="text-yellow-200" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4">
        <div className="relative flex-grow max-w-md">
          <Input
            type="text"
            placeholder="Zoek problemen (titel, desc. of zending ID)"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full" // className passed to wrapper for Input
            startContent={ // This will be handled by the Input component's internal structure
              <Search
                className="text-gray-400" // Styling for icon if needed by Input
                size={20}
              />
            }
          />
        </div>
        <label className="flex items-center text-gray-300 cursor-pointer bg-[#1E1B33] p-2 rounded-md hover:bg-indigo-800/70 transition-colors">
          <input
            type="checkbox"
            checked={showImportantFirst}
            onChange={() => setShowImportantFirst(!showImportantFirst)}
            className="form-checkbox h-5 w-5 text-indigo-500 transition duration-150 ease-in-out bg-gray-700 border-gray-600 rounded focus:ring-indigo-400 mr-2"
          />
          Belangrijke problemen eerst
        </label>
      </div>

      <div className="bg-indigo-900/70 backdrop-blur-sm rounded-lg p-6 shadow-xl">
        <h3 className="text-white font-semibold mb-4 text-xl">
          {currentFilter === "all" && "Alle Gemelde Problemen"}
          {currentFilter === "unsolved" && "Nog Op Te Lossen Problemen"}
          {currentFilter === "fixedToday" && "Vandaag Opgeloste Problemen"}
          {currentFilter === "fixedTotal" && "Alle Opgeloste Problemen"}
          <span className="text-gray-400 text-sm ml-2">({filteredAndSortedIssues.length})</span>
        </h3>
        {filteredAndSortedIssues.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Geen problemen gevonden voor de huidige selectie.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => handleIssueCardClick(issue)}
                className={`bg-[#1E1B33] rounded-lg p-4 flex flex-col justify-between shadow-lg cursor-pointer hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-200 ease-in-out ${
                  issue.isFixed ? 'opacity-70 hover:opacity-100' : ''
                } ${issue.isImportant && !issue.isFixed ? 'border-l-4 border-yellow-500' : 'border-l-4 border-transparent'}`}
              >
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2 truncate" title={issue.title}>
                    {issue.isFixed && <CheckCircle size={16} className="inline mr-2 text-green-500" />}
                    {issue.title}
                  </h4>
                  {issue.description && (
                    <p className="text-gray-300 text-sm mb-2 line-clamp-2" title={issue.description}>
                      {issue.description}
                    </p>
                  )}
                  {issue.imageUrl && (
                    <img
                      src={issue.imageUrl}
                      alt="Issue context"
                      className="w-full h-32 object-cover rounded-md mb-2"
                      loading="lazy"
                    />
                  )}
                  {issue.shipmentId && (
                    <p className="text-gray-400 text-xs mb-2">
                      Zending ID:{" "}
                      <span className="font-bold text-indigo-300">{issue.shipmentId}</span>
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-auto">
                    Aangemaakt: {new Date(issue.createdAt).toLocaleDateString()}
                  </p>
                  {issue.resolvedAt && issue.isFixed && (
                    <p className="text-green-400/80 text-xs mt-1">
                      Opgelost: {new Date(issue.resolvedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex justify-end items-center gap-2 mt-4 pt-2 border-t border-gray-700/50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleImportance(issue.id);
                    }}
                    title={issue.isImportant ? "Verwijder belangrijk" : "Markeer als belangrijk"}
                    className={`p-2 rounded-full text-sm font-medium transition-colors duration-200 hover:bg-indigo-700/50 ${
                      issue.isImportant
                        ? "text-yellow-400"
                        : "text-gray-400 hover:text-yellow-400"
                    }`}
                  >
                    <Star size={18} fill={issue.isImportant ? "currentColor" : "none"} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFixed(issue.id);
                    }}
                    title={issue.isFixed ? "Markeer als onopgelost" : "Markeer als opgelost"}
                    className={`p-2 rounded-full text-sm font-medium transition-colors duration-200 hover:bg-indigo-700/50 ${
                      issue.isFixed
                        ? "text-green-500"
                        : "text-gray-400 hover:text-green-500"
                    }`}
                  >
                    <CheckCircle size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ShipmentDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        shipment={selectedShipment}
        issues={shipmentIssues}
        isLoading={isLoadingDetails}
        error={detailError}
      />
    </div>
  );
};

export default Issues;

// Dummy Input component (replace with actual NextUI Input or your UI library's Input)
const Input = ({
  type = "text",
  placeholder,
  value,
  onChange,
  className, // Wrapper div className
  startContent, // Icon or element to render at the start
}: {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  startContent?: React.ReactNode;
}) => {
  return (
    <div className={`relative ${className || ""}`}>
      {startContent && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {startContent}
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full bg-[#1E1B33] text-white rounded-md pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          startContent ? "pl-10" : "pl-4"
        }`}
      />
    </div>
  );
};