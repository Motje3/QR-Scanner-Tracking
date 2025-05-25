// src/pages/Issues.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, ExternalLink, Search } from 'lucide-react'; // Added Search icon
import { Input } from "@nextui-org/react"; // Import NextUI Input

interface IssueReport {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  shipmentId?: number;
  createdAt: string;
}

const Issues = () => {
  const [issues, setIssues] = useState<IssueReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(""); // State for search query

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5070";

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      try {
        const response = await axios.get<IssueReport[]>(`${API_BASE_URL}/api/IssueReport`);
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

  // Filtered issues based on search query
  const filteredIssues = issues.filter(issue => {
    const lowerQuery = searchQuery.toLowerCase();
    return (
      issue.id.toString().includes(lowerQuery) ||
      issue.title.toLowerCase().includes(lowerQuery) ||
      (issue.description && issue.description.toLowerCase().includes(lowerQuery)) ||
      (issue.shipmentId && issue.shipmentId.toString().includes(lowerQuery))
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 min-h-[92vh] text-white">
      <div className="flex items-center space-x-4 mb-8">
        <AlertTriangle size={52} className="text-yellow-300" />
        <div>
          <h1 className="text-4xl font-bold">Gemelde Problemen</h1>
          <p className="text-indigo-300 text-sm">Overzicht van alle gerapporteerde problemen en issues.</p>
        </div>
      </div>

      {/* Search Bar Section */}
      <div className="mb-6">
        <Input
          placeholder="Zoek op ID, titel, omschrijving, zending ID..."
          value={searchQuery}
          onValueChange={setSearchQuery} // NextUI's preferred way for controlled input
          // onChange={(e) => setSearchQuery(e.target.value)} // Alternative if onValueChange is not preferred
          className="max-w-full md:max-w-lg " // Centered with max width
          startContent={
            <Search size={18} className="text-gray-400 pointer-events-none" />
          }
          classNames={{
            base: "h-12",
            inputWrapper: [
              "bg-indigo-900/70", // Semi-transparent dark background
              "backdrop-blur-sm",
              "border",
              "border-indigo-700/50",
              "rounded-xl", // More rounded
              "shadow-lg", // Futuristic shadow
              "h-full",
              "group-data-[focus=true]:border-purple-500",
              "group-data-[focus=true]:ring-2",
              "group-data-[focus=true]:ring-purple-500/50",
              "hover:border-indigo-600",
              "transition-all",
              "duration-200",
              "flex",
              "items-center",
            ],
            input: [
              "text-sm",
              "text-white",
              "placeholder:text-gray-500", // Darker placeholder for better contrast
              "bg-transparent",
              "outline-none",
              "placeholder:text-base",
              "border-none",
              "flex-1",
              "h-full",
              "p-0",
              "pl-2"
            ],
          }}
        />
      </div>

      {loading && (
        <div className="text-center py-10">
          <p className="text-lg text-gray-400">Problemen worden geladen...</p>
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-10 bg-red-900/30 rounded-lg p-4">
          <p className="text-lg text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-2 bg-indigo-900/80 backdrop-blur-sm rounded-lg p-4 text-left text-xs uppercase tracking-wider font-semibold text-indigo-300">
            <div>ID</div>
            <div className="md:col-span-1">Titel</div>
            <div className="md:col-span-1">Omschrijving</div>
            <div>Afbeelding URL</div>
            <div>Zending ID</div>
            <div>Gemeld Op</div>
          </div>

          <div className="space-y-3">
            {filteredIssues.length === 0 ? ( // Use filteredIssues here
              <div className="text-center text-gray-400 py-8 bg-indigo-800/70 backdrop-blur-sm rounded-lg">
                {searchQuery ? "Geen problemen gevonden die overeenkomen met uw zoekopdracht." : "Geen problemen gemeld."}
              </div>
            ) : (
              filteredIssues.map((issue) => ( // Use filteredIssues here
                <div
                  key={issue.id}
                  className="grid grid-cols-1 md:grid-cols-6 gap-2 p-4 bg-indigo-800/70 backdrop-blur-sm rounded-lg shadow-md hover:bg-indigo-700/90 hover:shadow-xl transition-all duration-200 ease-in-out"
                >
                  <div className="text-sm text-gray-200 self-center break-words">{issue.id}</div>
                  <div className="text-sm text-gray-100 font-medium self-center break-words">{issue.title}</div>
                  <div className="text-sm text-gray-300 self-center break-words overflow-hidden max-h-20 md:col-span-1">{issue.description || "-"}</div>
                  <div className="text-sm text-gray-300 self-center break-words overflow-hidden">
                    {issue.imageUrl ? (
                      <a
                        href={issue.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-yellow-300 underline inline-flex items-center"
                      >
                        Bekijk afbeelding
                        <ExternalLink size={14} className="ml-1" />
                      </a>
                    ) : (
                      "-"
                    )}
                  </div>
                  <div className="text-sm text-gray-300 self-center break-words">{issue.shipmentId || "-"}</div>
                  <div className="text-sm text-gray-300 self-center break-words">{formatDate(issue.createdAt)}</div>
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