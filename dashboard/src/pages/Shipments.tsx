import { useEffect, useState, useMemo  } from "react";
import axios from "axios";
import { Input, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Spinner } from "@nextui-org/react";
import { ClipboardList, Search, AlertCircle, AlertTriangle, CheckCircle, Star, Lightbulb } from "lucide-react";

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
  lastUpdatedBy: string | null;
  lastUpdatedAt: string | null;
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

  const allProblemsResolved = useMemo(() => {
    if (!issues || issues.length === 0) {
      return false;
    }
    return issues.every((issue) => issue.isFixed);
  }, [issues]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      backdrop="blur"
      className="bg-[#1E1B33] text-white"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 border-b-2 border-indigo-700 pb-2">
              <h2 className="text-3xl font-bold text-yellow-300">
                Zending Details #{shipment?.id}
              </h2>
            </ModalHeader>
            <ModalBody>
              {isLoading && (
                <div className="text-center py-8 text-indigo-300 flex items-center justify-center">
                  <Spinner size="lg" color="current" />
                  <span className="ml-3">Laden van zendingdetails en problemen...</span>
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
                      <p className="text-indigo-300 text-sm">Verwachte Levering:</p>
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
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={onClose} className="bg-indigo-600 text-white hover:bg-indigo-500 px-3 py-1 rounded-md">
                Sluiten
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

const Shipments = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filtered, setFiltered] = useState<Shipment[]>([]);
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [currentShipmentFilter, setCurrentShipmentFilter] = useState<string>("all");
  const [sortAndSpecialFilterType, setSortAndSpecialFilterType] = useState<string>("Filteren");

  const sortOptions = [
  "Problemen",
  "Bestemming",
  "ID",
  ];

  const totalGeleverdShipments = useMemo(() => {
    return shipments.filter((shipment) => shipment.status?.toLowerCase() === "geleverd").length;
  }, [shipments]);

  const totalOnderwegShipments = useMemo(() => {
    return shipments.filter((shipment) => shipment.status?.toLowerCase() === "onderweg").length;
  }, [shipments]);

  const totalInAfwachtingShipments = useMemo(() => {
    return shipments.filter((shipment) => shipment.status?.toLowerCase() === "in afwachting").length;
  }, [shipments]);

  const uniqueStatuses = [
    "Alle Statussen",
    ...new Set(shipments.map((s) => s.status).filter(Boolean)),
  ];

  const handleShipmentFilterClick = (filterType: string, statusToSet: string | null) => {
  setCurrentShipmentFilter(filterType);
  setSelectedStatus(statusToSet); // This will trigger the table filter
  // Optionally, you might want to clear the text search query when a card is clicked
  // setQuery(""); 
  };

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

  // This useEffect should correctly react to selectedStatus changes
  useEffect(() => {
    let processedList = [...shipments]; // Start with a mutable copy of all shipments

    // 1. Apply top card filter (driven by `selectedStatus` from `handleShipmentFilterClick`)
    // `selectedStatus` is updated by the top filter cards.
    // `currentShipmentFilter` tracks which card is active.
    if (selectedStatus && selectedStatus !== "Alle Statussen") {
      processedList = processedList.filter(s => s.status === selectedStatus);
    }

    // 2. Apply text query filter
    const lowerQuery = query.toLowerCase();
    if (query) { // Only filter if query is not empty
      processedList = processedList.filter(
        s =>
          s.id.toString().includes(lowerQuery) ||
          (s.destination && s.destination.toLowerCase().includes(lowerQuery)) ||
          (s.status && s.status.toLowerCase().includes(lowerQuery)) || // Keep status searchable in text
          (s.assignedTo && s.assignedTo.toLowerCase().includes(lowerQuery))
      );
    }

    // 3. Apply sort/special filter from the modified dropdown
    // This switch will re-sort `processedList` or filter it further.
    // It operates on a mutable copy for sorting operations.
    let listToSortAndFilter = [...processedList];

    switch (sortAndSpecialFilterType) {
      case "Problemen":
        listToSortAndFilter = listToSortAndFilter.filter(s => s.hasIssues);
        // After filtering, you might want a consistent secondary sort, e.g., by newest
        listToSortAndFilter.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "Bestemming":
        listToSortAndFilter.sort((a, b) => {
          const destA = a.destination || ""; // Handle null or undefined destinations
          const destB = b.destination || "";
          return destA.localeCompare(destB); // Alphabetical sort
        });
        break;
      case "ID":
        listToSortAndFilter.sort((a, b) => a.id - b.id); // Ascending numerical sort
        break;
      case "Filteren":
      default: // Also handles null or undefined sortAndSpecialFilterType
        // Default sort: newest first by createdAt
        listToSortAndFilter.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    setFiltered(listToSortAndFilter);

  }, [query, shipments, selectedStatus, sortAndSpecialFilterType]);

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

      {/* Shipment Status Filter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div
          className={`bg-indigo-900/80 backdrop-blur-sm rounded-lg p-6 cursor-pointer hover:bg-indigo-800/70 transition-all duration-200 ${
            currentShipmentFilter === "all" ? "ring-2 ring-blue-400 shadow-blue-500/30 shadow-lg" : "hover:shadow-md hover:shadow-indigo-500/20"
          }`}
          onClick={() => handleShipmentFilterClick("all", "Alle Statussen")} // "Alle Statussen" will clear the specific status filter
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-300 mb-2">Alle Zendingen</p>
              <h2 className="text-3xl font-bold text-white">
                {shipments.length}
              </h2>
            </div>
            <div className="p-3 bg-indigo-700/50 rounded-lg">
              <ClipboardList className="text-blue-300" size={24} />
            </div>
          </div>
        </div>

        <div
          className={`bg-indigo-900/80 backdrop-blur-sm rounded-lg p-6 cursor-pointer hover:bg-indigo-800/70 transition-all duration-200 ${
            currentShipmentFilter === "geleverd" ? "ring-2 ring-green-400 shadow-green-500/30 shadow-lg" : "hover:shadow-md hover:shadow-indigo-500/20"
          }`}
          onClick={() => handleShipmentFilterClick("geleverd", "Geleverd")}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-300 mb-2">Geleverd</p>
              <h2 className="text-3xl font-bold text-white">
                {totalGeleverdShipments}
              </h2>
            </div>
            <div className="p-3 bg-green-700/50 rounded-lg">
              <CheckCircle className="text-green-300" size={24} />
            </div>
          </div>
        </div>

        <div
          className={`bg-indigo-900/80 backdrop-blur-sm rounded-lg p-6 cursor-pointer hover:bg-indigo-800/70 transition-all duration-200 ${
            currentShipmentFilter === "onderweg" ? "ring-2 ring-orange-400 shadow-orange-500/30 shadow-lg" : "hover:shadow-md hover:shadow-indigo-500/20"
          }`}
          onClick={() => handleShipmentFilterClick("onderweg", "Onderweg")}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-300 mb-2">Onderweg</p>
              <h2 className="text-3xl font-bold text-white">
                {totalOnderwegShipments}
              </h2>
            </div>
            <div className="p-3 bg-orange-700/50 rounded-lg">
              {/* Using AlertTriangle for Onderweg as an example, you might want a different icon like Truck if available */}
              <AlertTriangle className="text-orange-300" size={24} />
            </div>
          </div>
        </div>
        
        <div
          className={`bg-indigo-900/80 backdrop-blur-sm rounded-lg p-6 cursor-pointer hover:bg-indigo-800/70 transition-all duration-200 ${
            currentShipmentFilter === "inAfwachting" ? "ring-2 ring-yellow-300 shadow-yellow-400/30 shadow-lg" : "hover:shadow-md hover:shadow-indigo-500/20"
          }`}
          onClick={() => handleShipmentFilterClick("inAfwachting", "In afwachting")}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-300 mb-2">In Afwachting</p>
              <h2 className="text-3xl font-bold text-white">
                {totalInAfwachtingShipments}
              </h2>
            </div>
            <div className="p-3 bg-yellow-600/50 rounded-lg">
              <Lightbulb className="text-yellow-200" size={24} /> 
            </div>
          </div>
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
            options={sortOptions}
            selected={sortAndSpecialFilterType}
            setSelected={setSortAndSpecialFilterType}
            placeholder="Sorteer / Filter op..." // New placeholder
          />
          <Button
            className={`${inputWrapperBaseStyle} text-sm h-12 px-4 hover:bg-[#2A2745] min-w-[150px]`}
            variant="flat"
            onPress={() => {
              setQuery("");
              setSelectedStatus("Alle Statussen"); // For the top cards
              setCurrentShipmentFilter("all");   // Reset active card to "all"
              setSortAndSpecialFilterType("Filteren"); // Reset the new dropdown
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