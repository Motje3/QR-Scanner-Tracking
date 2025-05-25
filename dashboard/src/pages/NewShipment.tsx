// src/pages/NewShipment.tsx
import React, { useState, useRef } from "react";
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
  Download,
} from "lucide-react"; // Added Download icon
import { QRCodeSVG } from "qrcode.react"; // Using the correct named import

interface CreatedShipment {
  id: number;
  status: string;
  destination?: string;
  assignedTo?: string;
  expectedDelivery?: string;
  weight?: string;
  createdAt: string;
}

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

  const qrCodeRef = useRef<HTMLDivElement>(null); // Ref for the div wrapping QRCodeSVG

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5070";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    // Keep createdShipment null until success, so previous QR doesn't flash

    if (!status) {
      setError("Status is een verplicht veld.");
      setIsLoading(false);
      return;
    }

    const shipmentDto: CreateShipmentDto = {
      status,
      destination: destination || undefined,
      assignedTo: assignedTo || undefined,
      expectedDelivery: expectedDelivery || undefined,
      weight: weight || undefined,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/Shipments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(shipmentDto),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Onbekende fout bij het aanmaken van de zending.",
        }));
        throw new Error(
          errorData.title ||
            errorData.detail ||
            errorData.message ||
            `Fout: ${response.status}`
        );
      }

      const newShipmentData: CreatedShipment = await response.json();
      setCreatedShipment(newShipmentData);
      setStatus("");
      setDestination("");
      setAssignedTo("");
      setExpectedDelivery("");
      setWeight("");
    } catch (err: any) {
      setError(err.message || "Aanmaken van zending mislukt.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full bg-indigo-800 border border-indigo-700 text-white pl-12 pr-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 placeholder-gray-500 transition-all duration-300 ease-in-out shadow-sm hover:border-indigo-600";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1 ml-1";

  const iconSize = 20; // Increased icon size

  const handleDownloadQR = () => {
    if (qrCodeRef.current && createdShipment) {
      const svgElement = qrCodeRef.current.querySelector("svg");
      if (svgElement) {
        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(svgElement);

        // Note: For direct data URL, this might not be strictly necessary but can be good for file opening in some editors.

        const dataUrl =
          "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);

        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `zending-qr-${createdShipment.id}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert("QR code SVG element niet gevonden.");
      }
    } else {
      alert("Geen zending gevonden om QR code voor te downloaden.");
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-8 min-h-[92vh] bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white">
      <div className="flex items-center space-x-4 mb-8">
        <PackagePlus size={48} className="text-yellow-300" />
        <div>
          <h1 className="text-4xl font-bold">Nieuwe Zending Aanmaken</h1>
          <p className="text-indigo-300 text-sm">
            Voer hieronder de gegevens in om een nieuwe zending te registreren.
          </p>
        </div>
      </div>

      {!createdShipment ? (
        <form
          onSubmit={handleSubmit}
          className="bg-indigo-900/70 backdrop-blur-md shadow-2xl rounded-xl p-6 md:p-10 space-y-7 max-w-2xl mx-auto"
        >
          {/* Status Input Group */}
          <div>
            <label htmlFor="status" className={labelClass}>
              Status <span className="text-red-400">*</span>
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CheckCircle size={iconSize} className="text-gray-400" />
              </div>
              <input
                id="status"
                type="text"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="Bijv., In Afwachting, Onderweg"
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Destination Input Group */}
          <div>
            <label htmlFor="destination" className={labelClass}>
              Bestemming
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin size={iconSize} className="text-gray-400" />
              </div>
              <input
                id="destination"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Voer bestemmingsadres of stad in"
                className={inputClass}
              />
            </div>
          </div>

          {/* Assigned To Input Group */}
          <div>
            <label htmlFor="assignedTo" className={labelClass}>
              Toegewezen Aan (Gebruiker/Chauffeur)
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={iconSize} className="text-gray-400" />
              </div>
              <input
                id="assignedTo"
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Gebruikersnaam of ID van de toegewezen persoon"
                className={inputClass}
              />
            </div>
          </div>

          {/* Expected Delivery Input Group */}
          <div>
            <label htmlFor="expectedDelivery" className={labelClass}>
              Verwachte Levering
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarDays size={iconSize} className="text-gray-400" />
              </div>
              <input
                id="expectedDelivery"
                type="text"
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
                placeholder="JJJJ-MM-DD of een omschrijving"
                className={inputClass}
              />
            </div>
          </div>

          {/* Weight Input Group */}
          <div>
            <label htmlFor="weight" className={labelClass}>
              Gewicht
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Weight size={iconSize} className="text-gray-400" />
              </div>
              <input
                id="weight"
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Bijv., 10kg, 25lbs"
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-500 text-indigo-950 font-semibold py-3 px-4 rounded-md transition-colors duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-50 text-lg !mt-8"
          >
            {isLoading ? (
              <Loader2 size={24} className="animate-spin mr-2" />
            ) : (
              <Send size={20} className="mr-2" />
            )}
            {isLoading ? "Zending Wordt Aangemaakt..." : "Zending Aanmaken"}
          </button>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md flex items-center">
              <XCircle size={20} className="mr-2" />
              <p>{error}</p>
            </div>
          )}
        </form>
      ) : (
        <div className="bg-indigo-900/70 backdrop-blur-md shadow-2xl rounded-xl p-6 md:p-10 mt-10 max-w-md mx-auto text-center space-y-4">
          <CheckCircle size={64} className="text-green-400 mx-auto mb-2" />
          <h2 className="text-2xl font-semibold text-green-400">
            Zending Succesvol Aangemaakt!
          </h2>

          <p className="text-indigo-300">
            Zending ID:{" "}
            <span className="font-bold text-yellow-300 text-lg">
              {createdShipment.id}
            </span>
          </p>

          {/* Added ref to this div */}
          <div
            ref={qrCodeRef}
            className="p-4 bg-white inline-block rounded-lg shadow-inner mt-2"
          >
            <QRCodeSVG
              value={String(createdShipment.id)}
              size={180}
              fgColor="#0D0C22"
              bgColor="#FFFFFF"
              level="H"
            />
          </div>

          <button
            onClick={handleDownloadQR}
            className="mt-6 w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-md transition-colors duration-300"
          >
            <Download size={20} className="mr-2" />
            Download zending QR om te printen
          </button>
          <button
            onClick={() => setCreatedShipment(null)}
            className="mt-3 w-full bg-transparent hover:bg-indigo-800 border border-indigo-700 text-indigo-300 font-medium py-2 px-6 rounded-md transition-colors duration-300"
          >
            Nog een Zending Aanmaken
          </button>
        </div>
      )}
    </div>
  );
};

export default NewShipment;
