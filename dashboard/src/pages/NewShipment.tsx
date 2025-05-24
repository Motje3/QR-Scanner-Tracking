// src/pages/NewShipment.tsx
import React, { useState } from "react";
import {
  PackagePlus,
  MapPin,
  User,
  CalendarDays,
  Weight,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  QrCode,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface CreatedShipment {
  id: number; // Assuming the backend returns the ID
  status: string;
  destination?: string;
  assignedTo?: string;
  expectedDelivery?: string;
  weight?: string;
  createdAt: string; // Or Date
}

// Define the DTO for creating a shipment, matching your backend
interface CreateShipmentDto {
  status: string;
  destination?: string;
  assignedTo?: string;
  expectedDelivery?: string;
  weight?: string;
}

const NewShipment = () => {
  const [status, setStatus] = useState("");
  const [destination, setDestination] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [weight, setWeight] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdShipment, setCreatedShipment] =
    useState<CreatedShipment | null>(null);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5070"; // Example, adjust as needed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setCreatedShipment(null);

    if (!status) {
      setError("Status is a required field.");
      setIsLoading(false);
      return;
    }

    const shipmentDto: CreateShipmentDto = {
      status,
      destination: destination || undefined, // Send undefined if empty to match nullable strings
      assignedTo: assignedTo || undefined,
      expectedDelivery: expectedDelivery || undefined,
      weight: weight || undefined,
    };

    try {
      // const token = localStorage.getItem('authToken'); // Example: Get token if API is secured

      const response = await fetch(`${API_BASE_URL}/api/Shipments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(shipmentDto),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "An unknown error occurred during shipment creation.",
        }));
        throw new Error(
          errorData.title ||
            errorData.detail ||
            errorData.message ||
            `Error: ${response.status}`
        );
      }

      const newShipmentData: CreatedShipment = await response.json();
      setCreatedShipment(newShipmentData);
      // Clear form
      setStatus("");
      setDestination("");
      setAssignedTo("");
      setExpectedDelivery("");
      setWeight("");
    } catch (err: any) {
      setError(err.message || "Failed to create shipment.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full bg-indigo-800 border border-indigo-700 text-white pl-10 pr-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 placeholder-gray-500 transition-all duration-300 ease-in-out shadow-sm hover:border-indigo-600";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1 ml-1";
  const iconClass =
    "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400";

  return (
    <div className="space-y-8 p-4 md:p-8 min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white">
      <div className="flex items-center space-x-3 mb-8">
        <PackagePlus size={40} className="text-yellow-300" />
        <div>
          <h1 className="text-4xl font-bold">Create New Shipment</h1>
          <p className="text-indigo-300 text-sm">
            Enter the details below to register a new shipment.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <form
        onSubmit={handleSubmit}
        className="bg-indigo-900/70 backdrop-blur-md shadow-2xl rounded-xl p-6 md:p-10 space-y-6 max-w-2xl mx-auto"
      >
        {/* Status */}
        <div className="relative">
          <label htmlFor="status" className={labelClass}>
            Status <span className="text-red-400">*</span>
          </label>
          <CheckCircle size={18} className={iconClass} />
          <input
            id="status"
            type="text"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="e.g., Pending, In Transit"
            className={inputClass}
            required
          />
        </div>

        {/* Destination */}
        <div className="relative">
          <label htmlFor="destination" className={labelClass}>
            Destination
          </label>
          <MapPin size={18} className={iconClass} />
          <input
            id="destination"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Enter destination address or city"
            className={inputClass}
          />
        </div>

        {/* Assigned To */}
        <div className="relative">
          <label htmlFor="assignedTo" className={labelClass}>
            Assigned To (User/Driver)
          </label>
          <User size={18} className={iconClass} />
          <input
            id="assignedTo"
            type="text"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            placeholder="Username or ID of the assignee"
            className={inputClass}
          />
        </div>

        {/* Expected Delivery */}
        <div className="relative">
          <label htmlFor="expectedDelivery" className={labelClass}>
            Expected Delivery
          </label>
          <CalendarDays size={18} className={iconClass} />
          <input
            id="expectedDelivery"
            type="text" // Could be type="date" or use a date picker library
            value={expectedDelivery}
            onChange={(e) => setExpectedDelivery(e.target.value)}
            placeholder="YYYY-MM-DD or descriptive text"
            className={inputClass}
          />
        </div>

        {/* Weight */}
        <div className="relative">
          <label htmlFor="weight" className={labelClass}>
            Weight
          </label>
          <Weight size={18} className={iconClass} />
          <input
            id="weight"
            type="text"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g., 10kg, 25lbs"
            className={inputClass}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-500 text-indigo-950 font-semibold py-3 px-4 rounded-md transition-colors duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-50 text-lg"
        >
          {isLoading ? (
            <Loader2 size={24} className="animate-spin mr-2" />
          ) : (
            <Send size={20} className="mr-2" />
          )}
          {isLoading ? "Creating Shipment..." : "Create Shipment"}
        </button>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md flex items-center">
            <XCircle size={20} className="mr-2" />
            <p>{error}</p>
          </div>
        )}
      </form>

      {/* Created Shipment Info & QR Code */}
      {createdShipment && !error && (
        <div className="bg-indigo-900/70 backdrop-blur-md shadow-2xl rounded-xl p-6 md:p-10 mt-10 max-w-md mx-auto text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-green-400">
            <CheckCircle size={28} />
            <h2 className="text-2xl font-semibold">
              Shipment Created Successfully!
            </h2>
          </div>

          <p className="text-indigo-300">
            Shipment ID:{" "}
            <span className="font-bold text-yellow-300 text-lg">
              {createdShipment.id}
            </span>
          </p>

          <div className="p-4 bg-white inline-block rounded-lg shadow-inner mt-2">
            <QRCodeSVG
              value={String(createdShipment.id)} // QR Code content is the shipment ID
              size={180}
              fgColor="#0D0C22" // Dark indigo/black for QR code
              bgColor="#FFFFFF" // White background
              level="H" // Error correction level
              // imageSettings={{
              //   src: "/path/to/your/logo.png",
              //   height: 35,
              //   width: 35,
              //   excavate: true,
              // }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Scan this QR code with the mobile app.
          </p>
          <button
            onClick={() => {
              setCreatedShipment(null);
            }}
            className="mt-4 bg-indigo-700 hover:bg-indigo-600 text-white font-medium py-2 px-6 rounded-md transition-colors duration-300"
          >
            Create Another Shipment
          </button>
        </div>
      )}
    </div>
  );
};

export default NewShipment;
