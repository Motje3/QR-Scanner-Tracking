// src/components/ShipmentDetail.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react"; // For a back button icon

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
}

interface IssueReport {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  shipmentId: number | null;
  createdAt: string;
}

const ShipmentDetail = () => {
  const { id } = useParams<{ id: string }>(); // Get shipment ID from URL
  const navigate = useNavigate();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [issues, setIssues] = useState<IssueReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShipmentAndIssues = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch shipment details
        const shipmentResponse = await axios.get<Shipment>(
          `${API_BASE_URL}/api/Shipments/${id}`
        );
        setShipment(shipmentResponse.data);

        // Fetch issues for this shipment
        const issuesResponse = await axios.get<IssueReport[]>(
          `${API_BASE_URL}/api/IssueReport/shipment/${id}`
        );
        setIssues(issuesResponse.data);
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          setError(`Shipment with ID ${id} not found.`);
        } else {
          setError(`Failed to load data: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchShipmentAndIssues();
    }
  }, [id]); // Re-fetch if the ID in the URL changes

  if (loading) {
    return (
      <div className="p-6 text-white text-center">
        Loading shipment details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 text-center">
        <p>{error}</p>
        <button
          onClick={() => navigate("/shipments")}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-200 flex items-center justify-center mx-auto"
        >
          <ArrowLeft size={18} className="mr-2" /> Terug naar zendingen
        </button>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="p-6 text-gray-400 text-center">
        Geen zending gevonden.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-white">
          Zending Detail: {shipment.id}
        </h1>
        <button
          onClick={() => navigate("/shipments")}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-200 flex items-center"
        >
          <ArrowLeft size={18} className="mr-2" /> Terug naar zendingen
        </button>
      </div>

      {/* Shipment Details Card */}
      <div className="bg-indigo-900 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">
          Zending Informatie
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
          <div>
            <p>
              <strong>Status:</strong>{" "}
              <span className="text-yellow-200">{shipment.status}</span>
            </p>
            <p>
              <strong>Bestemming:</strong> {shipment.destination}
            </p>
            <p>
              <strong>Toegewezen aan:</strong> {shipment.assignedTo}
            </p>
          </div>
          <div>
            <p>
              <strong> Verwachte leverdatum:</strong> {shipment.expectedDelivery}
            </p>
            <p>
              <strong>Gewicht:</strong> {shipment.weight}
            </p>
            <p>
              <strong>Aangemaakt op:</strong>{" "}
              {new Date(shipment.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        {shipment.lastUpdatedBy && (
          <p className="text-gray-400 text-sm mt-4">
            Laatst bijgewerkt door: {shipment.lastUpdatedBy} op{" "}
            {new Date(shipment.lastUpdatedAt!).toLocaleString()}
          </p>
        )}
      </div>

      {/* Associated Issues Section */}
      <div className="bg-indigo-900 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">
          Gerelateerde Problemen ({issues.length})
        </h2>
        {issues.length === 0 ? (
          <p className="text-gray-400">
            Geen problemen gemeld voor deze zending.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="bg-[#1E1B33] rounded-lg p-4 flex flex-col shadow-md"
              >
                <h3 className="text-lg font-semibold text-white mb-2">
                  {issue.title}
                </h3>
                {issue.description && (
                  <p className="text-gray-300 text-sm mb-2">
                    {issue.description}
                  </p>
                )}
                {issue.imageUrl && (
                  <img
                    src={issue.imageUrl}
                    alt="Issue"
                    className="w-full h-24 object-cover rounded-md mb-2"
                  />
                )}
                <p className="text-gray-500 text-xs mt-auto">
                  Aangemaakt op: {new Date(issue.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipmentDetail;
