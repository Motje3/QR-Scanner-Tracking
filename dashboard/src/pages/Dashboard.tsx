import React, { useState, useEffect } from 'react';
import { Mail, Phone, Users, DollarSign, AlertTriangle, Star, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';

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
}

const Dashboard = () => {
  const [loading, setLoading] = useState(() => {
    return localStorage.getItem('dashboardLoaded') === 'true' ? false : true;
  });
  
  const [recentIssues, setRecentIssues] = useState<IssueReport[]>([]);
  const [issuesLoading, setIssuesLoading] = useState(true);
  const [issuesError, setIssuesError] = useState<string | null>(null);

  const [recentShipments, setRecentShipments] = useState<Shipment[]>([]);
  const [allShipments, setAllShipments] = useState<Shipment[]>([]);
  const [shipmentsLoading, setShipmentsLoading] = useState(true);
  const [shipmentsError, setShipmentsError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoading(false);
        localStorage.setItem('dashboardLoaded', 'true');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    const fetchRecentIssues = async () => {
      setIssuesLoading(true);
      try {
        const response = await axios.get<IssueReport[]>(
          `${API_BASE_URL}/api/IssueReport`
        );
        // Sort by creation date (newest first) and take first 10
        const sortedIssues = response.data
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10);
        setRecentIssues(sortedIssues);
      } catch (err: any) {
        setIssuesError(err.message || "Failed to fetch recent issues");
      } finally {
        setIssuesLoading(false);
      }
    };

    const fetchRecentShipments = async () => {
      setShipmentsLoading(true);
      try {
        const response = await axios.get<Shipment[]>(
          `${API_BASE_URL}/api/Shipments`
        );
        // Store all shipments for calculations
        setAllShipments(response.data);
        // Sort by creation date (newest first) and take first 10 for display
        const sortedShipments = response.data
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10);
        setRecentShipments(sortedShipments);
      } catch (err: any) {
        setShipmentsError(err.message || "Failed to fetch recent shipments");
      } finally {
        setShipmentsLoading(false);
      }
    };

    if (!loading) {
      fetchRecentIssues();
      fetchRecentShipments();
    }
  }, [loading, API_BASE_URL]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Vandaag';
    } else if (diffDays === 2) {
      return 'Gisteren';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} dagen geleden`;
    } else {
      return date.toLocaleDateString('nl-NL', { 
        day: 'numeric', 
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const formatShipmentDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getShipmentsToday = () => {
    if (!allShipments.length) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return allShipments.filter(shipment => {
      const shipmentDate = new Date(shipment.createdAt);
      return shipmentDate >= today && shipmentDate < tomorrow;
    }).length;
  };

  const getShipmentsThisMonth = () => {
    if (!allShipments.length) return 0;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return allShipments.filter(shipment => {
      const shipmentDate = new Date(shipment.createdAt);
      return shipmentDate >= startOfMonth && shipmentDate <= endOfMonth;
    }).length;
  };

  const getUnresolvedIssues = () => {
    if (!recentIssues.length) return 0;
    return recentIssues.filter(issue => !issue.isFixed).length;
  };

  const getShipmentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "geleverd":
      case "delivered":
        return "bg-green-600/20 text-green-300 border border-green-500/30";
      case "onderweg":
      case "in transit":
        return "bg-orange-600/20 text-orange-300 border border-orange-500/30";
      case "in afwachting":
      case "pending":
        return "bg-yellow-600/20 text-yellow-300 border border-yellow-500/30";
      case "failed":
        return "bg-red-600/20 text-red-300 border border-red-500/30";
      default:
        return "bg-gray-600/20 text-gray-300 border border-gray-500/30";
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">Welkom bij je dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Zendingen Vandaag Kaart */}
        <div className="bg-indigo-900 rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-300 mb-2">Zendingen vandaag</p>
              <h2 className="text-3xl font-bold text-white">
                {shipmentsLoading ? "..." : getShipmentsToday()}
              </h2>
              <p className="text-green-400 mt-2">Nieuw vandaag</p>
            </div>
            <div className="p-2 bg-indigo-800 rounded-md">
              <Phone className="text-yellow-200" size={24} />
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-4">Aangemaakt vandaag</p>
        </div>

        {/* Maandelijkse Zendingen Kaart */}
        <div className="bg-indigo-900 rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-300 mb-2">Maandelijkse zendingen</p>
              <h2 className="text-3xl font-bold text-white">
                {shipmentsLoading ? "..." : getShipmentsThisMonth()}
              </h2>
              <p className="text-blue-400 mt-2">Deze maand</p>
            </div>
            <div className="p-2 bg-indigo-800 rounded-md">
              <Users className="text-yellow-200" size={24} />
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-4">Aangemaakt deze maand</p>
        </div>

        {/* Totaal Onopgeloste Problemen Kaart */}
        <div className="bg-indigo-900 rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-300 mb-2">Onopgeloste problemen</p>
              <h2 className="text-3xl font-bold text-white">
                {issuesLoading ? "..." : getUnresolvedIssues()}
              </h2>
              <p className="text-red-400 mt-2">Vereist actie</p>
            </div>
            <div className="p-2 bg-indigo-800 rounded-md">
              <AlertTriangle className="text-yellow-200" size={24} />
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-4">Nog op te lossen</p>
        </div>

        {/* Jaarlijkse Verkoop Kaart */}
        <div className="bg-indigo-900 rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-300 mb-2">Jaarlijkse verkoop</p>
              <h2 className="text-3xl font-bold text-white">65152</h2>
              <p className="text-green-400 mt-2">+43%</p>
            </div>
            <div className="p-2 bg-indigo-800 rounded-md">
              <DollarSign className="text-yellow-200" size={24} />
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-4">Sinds vorige maand</p>
        </div>
      </div>

      {/* Recent Issues Widget */}
      <div className="bg-indigo-900 rounded-lg p-6 h-80 relative">
        <div className="flex items-center mb-4">
          <AlertTriangle className="text-red-400 mr-2" size={24} />
          <h3 className="text-white font-semibold text-xl">Recente problemen</h3>
        </div>
        
        {issuesLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-400">Laden van problemen...</div>
          </div>
        ) : issuesError ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-red-400">Fout bij laden: {issuesError}</p>
          </div>
        ) : recentIssues.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <CheckCircle className="text-green-400 mx-auto mb-2" size={32} />
              <p className="text-gray-400">Geen recente problemen!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto h-60">
            {recentIssues.map((issue) => (
              <div
                key={issue.id}
                className={`flex items-start justify-between p-3 rounded-lg transition-colors hover:bg-indigo-800/50 ${
                  issue.isFixed ? 'bg-indigo-800/30 opacity-70' : 'bg-indigo-800/50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {issue.isImportant && !issue.isFixed && (
                      <Star className="text-yellow-400 flex-shrink-0" size={14} fill="currentColor" />
                    )}
                    {issue.isFixed && (
                      <CheckCircle className="text-green-400 flex-shrink-0" size={14} />
                    )}
                    <h4 className="text-white text-sm font-medium truncate" title={issue.title}>
                      {issue.title}
                    </h4>
                  </div>
                  
                  {issue.description && (
                    <p className="text-gray-300 text-xs mb-1 line-clamp-1" title={issue.description}>
                      {issue.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{formatDate(issue.createdAt)}</span>
                    {issue.shipmentId && (
                      <span className="text-indigo-300">
                        Zending #{issue.shipmentId}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0 ml-3">
                  {!issue.isFixed ? (
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  ) : (
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Shipments Table */}
      <div className="bg-indigo-900 rounded-lg p-6">
        <h3 className="text-white font-semibold mb-4">Recente zendingen</h3>
        
        {shipmentsLoading ? (
          <div className="text-center py-8 text-gray-400">Laden van zendingen...</div>
        ) : shipmentsError ? (
          <div className="text-center py-8 text-red-400">Fout bij laden: {shipmentsError}</div>
        ) : recentShipments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">Geen zendingen gevonden</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 border-b border-indigo-800">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Bestemming</th>
                    <th className="py-3 px-4">Toegewezen aan</th>
                    <th className="py-3 px-4">Aangemaakt op</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {recentShipments.map((shipment) => (
                    <tr key={shipment.id} className="border-b border-indigo-800 hover:bg-indigo-800/30 transition-colors">
                      <td className="py-3 px-4 font-medium">#{shipment.id}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getShipmentStatusColor(shipment.status)}`}>
                          {shipment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">{shipment.destination || "-"}</td>
                      <td className="py-3 px-4">{shipment.assignedTo || "-"}</td>
                      <td className="py-3 px-4">{formatShipmentDate(shipment.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-4 text-gray-400 text-sm">
              <div>Toont {recentShipments.length} van de meest recente zendingen</div>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-indigo-800 rounded hover:bg-indigo-800 transition-colors">
                  Alle zendingen
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;