// src/pages/Issues.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, ExternalLink } from 'lucide-react'; // Added ExternalLink for URLs

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
        <AlertTriangle size={48} className="text-yellow-300" />
        <div>
          <h1 className="text-4xl font-bold">Gemelde Problemen</h1>
          <p className="text-indigo-300 text-sm">Overzicht van alle gerapporteerde problemen en issues.</p>
        </div>
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
          {/* Table Header - Adjusted to md:grid-cols-6 and added Image URL header */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-2 bg-indigo-900/80 backdrop-blur-sm rounded-lg p-4 text-left text-xs uppercase tracking-wider font-semibold text-indigo-300">
            <div>ID</div>
            <div className="md:col-span-1">Titel</div>
            <div className="md:col-span-1">Omschrijving</div> {/* Adjusted Omschrijving span if ImageUrl takes space */}
            <div>Afbeelding URL</div> {/* New Header */}
            <div>Zending ID</div>
            <div>Gemeld Op</div>
          </div>

          <div className="space-y-3">
            {issues.length === 0 ? (
              <div className="text-center text-gray-400 py-8 bg-indigo-800/70 backdrop-blur-sm rounded-lg">
                Geen problemen gevonden.
              </div>
            ) : (
              issues.map((issue) => (
                <div
                  key={issue.id}
                  // Adjusted to md:grid-cols-6 and added Image URL cell
                  className="grid grid-cols-1 md:grid-cols-6 gap-2 p-4 bg-indigo-800/70 backdrop-blur-sm rounded-lg shadow-md hover:bg-indigo-700/90 hover:shadow-xl transition-all duration-200 ease-in-out"
                >
                  <div className="text-sm text-gray-200 self-center break-words">{issue.id}</div>
                  <div className="text-sm text-gray-100 font-medium self-center break-words">{issue.title}</div>
                  <div className="text-sm text-gray-300 self-center break-words overflow-hidden max-h-20 md:col-span-1">{issue.description || "-"}</div> {/* Adjusted Omschrijving span */}
                  <div className="text-sm text-gray-300 self-center break-words overflow-hidden"> {/* New Cell for Image URL */}
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