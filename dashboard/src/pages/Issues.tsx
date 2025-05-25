import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import {
  AlertTriangle,
  CheckCircle,
  Search,
  Star,
  Lightbulb,
} from "lucide-react"; // Icons for cards and buttons

// Define the IssueReport interface to match your C# model
interface IssueReport {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  shipmentId: number | null;
  shipment: Shipment | null; // Assuming you have a Shipment interface if needed
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

const Issues = () => {
  const [issueReports, setIssueReports] = useState<IssueReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showImportantFirst, setShowImportantFirst] = useState<boolean>(false);

  // --- API Call ---
  useEffect(() => {
    const fetchIssueReports = async () => {
      try {
        const response = await fetch(
          `http://192.168.1.198:5070/api/IssueReport`
        ); // Adjust URL if needed
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: IssueReport[] = await response.json();
        // Initialize isImportant and isFixed flags client-side
        const initializedData = data.map((issue) => ({
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
          issue.description.toLowerCase().includes(searchTerm.toLowerCase()))
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

  if (loading) {
    return <div className="p-6 text-white">Loading issue reports...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6 p-6">
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
              {/* Icon for unsolved */}
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
              {/* Icon for fixed today */}
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
              {/* Icon for total fixed */}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-start gap-4">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Zoek problemen (titel of beschrijving)"
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
                className="bg-[#1E1B33] rounded-lg p-4 flex flex-col justify-between shadow-lg"
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
                    <p className="text-gray-400 text-xs mb-2">
                      Zending ID:{" "}
                      <Link
                        to={`/shipments/${issue.shipmentId}`} // Navigate to shipments page with ID query param
                        className="text-blue-400 hover:underline cursor-pointer"
                      >
                        {issue.shipmentId}
                      </Link>
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-auto">
                    Aangemaakt op: {new Date(issue.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => handleToggleImportance(issue.id)}
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
                    onClick={() => handleToggleFixed(issue.id)}
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
