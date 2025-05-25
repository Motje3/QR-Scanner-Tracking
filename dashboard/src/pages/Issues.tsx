// src/pages/Issues.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FileWarning } from "lucide-react"; // Icon for issues/problems

interface IssueReport {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  shipmentId?: number;
  createdAt: string; // Assuming string from backend, will format later
}

const Issues = () => {
  const [issues, setIssues] = useState<IssueReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5070"; // Adjust if different

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      try {
        const response = await axios.get<IssueReport[]>(
          `${API_BASE_URL}/api/IssueReport`
        );
        setIssues(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch issue reports:", err);
        setError("Kon problemen niet ophalen. Probeer het later opnieuw.");
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [API_BASE_URL]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 min-h-[92vh] text-white">
      {/* Header Section - Similar to NewShipment page */}
      <div className="flex items-center space-x-4 mb-8">
        <FileWarning size={48} className="text-yellow-300" />
        <div>
          <h1 className="text-4xl font-bold">Gemelde Problemen</h1>
          <p className="text-indigo-300 text-sm">
            Overzicht van alle gerapporteerde problemen en issues.
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-10">
          <p className="text-lg text-gray-400">Problemen worden geladen...</p>
          {/* You can add a spinner icon here if you like */}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-10 bg-red-900/30 rounded-lg p-4">
          <p className="text-lg text-red-400">{error}</p>
        </div>
      )}

      {/* Issues List / Table */}
      {!loading && !error && (
        <div className="space-y-4">
          {/* Table Header */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 bg-indigo-900/80 backdrop-blur-sm rounded-lg p-4 text-left text-xs uppercase tracking-wider font-semibold text-indigo-300">
            <div>ID</div>
            <div className="md:col-span-1">Titel</div>
            <div className="md:col-span-2">Omschrijving</div>
            <div>Zending ID</div>
            <div>Gemeld Op</div>
          </div>

          {/* Table Body */}
          <div className="space-y-3">
            {issues.length === 0 ? (
              <div className="text-center text-gray-400 py-8 bg-indigo-800/70 backdrop-blur-sm rounded-lg">
                Geen problemen gevonden.
              </div>
            ) : (
              issues.map((issue) => (
                <div
                  key={issue.id}
                  className="grid grid-cols-1 md:grid-cols-6 p-4 gap-4 bg-indigo-800/70 backdrop-blur-sm rounded-lg shadow-md hover:bg-indigo-700/90 hover:shadow-xl transition-all duration-200 ease-in-out"
                  // onClick={() => console.log("Issue clicked:", issue.id)} // Placeholder for click action
                  // className="... cursor-pointer" // If you want to make rows clickable
                >
                  <div className="text-sm text-gray-200 self-center break-words">
                    {issue.id}
                  </div>
                  <div className="text-sm text-gray-100 font-medium self-center break-words">
                    {issue.title}
                  </div>
                  <div className="text-sm text-gray-300 self-center break-words overflow-hidden max-h-20">
                    {" "}
                    {/* Limit description height */}
                    {issue.description || "-"}
                  </div>
                  <div className="text-sm text-gray-300 self-center break-words">
                    {issue.shipmentId || "-"}
                  </div>
                  <div className="text-sm text-gray-300 self-center break-words">
                    {formatDate(issue.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Issues;
