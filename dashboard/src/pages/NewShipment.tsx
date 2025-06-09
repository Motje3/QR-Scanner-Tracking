// src/pages/NewShipment.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  PackagePlus,
  MapPin,
  User,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  Download,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import axios from "axios";
import DatePicker from "../components/DatePicker";
import WeightInput from "../components/WeightInput";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- Interface for a registered user (for 'assignedTo' dropdown) ---
interface User {
  id: string;
  name: string;
}

interface Profile {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  imageUrl: string;
  createdAt: string;
  active?: boolean;
  lastLogin?: string;
}

interface CreatedShipment {
  id: number;
  destination?: string;
  assignedTo?: string;
  expectedDelivery?: string;
  weight?: string;
  createdAt: string;
}

interface CreateShipmentDto {
  destination?: string;
  assignedTo?: string;
  expectedDelivery?: string;
  weight?: string;
}

const NewShipment = () => {
  const [destination, setDestination] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [weight, setWeight] = useState(""); // Using your WeightInput component

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdShipment, setCreatedShipment] =
    useState<CreatedShipment | null>(null);

  const qrCodeRef = useRef<HTMLDivElement>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const response = await axios.get<Profile[]>(
          `${API_BASE_URL}/api/Profile`
        );
        const fetchedUsers: User[] = response.data.map((profile) => ({
          id: String(profile.id),
          name: profile.fullName,
        }));
        setUsers(fetchedUsers);
        setUsersError(null);
      } catch (err) {
        console.error("Failed to fetch users for dropdown:", err);
        setUsersError("Kon gebruikers niet ophalen.");
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, [API_BASE_URL]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const shipmentDto: CreateShipmentDto = {
      destination: destination || undefined,
      assignedTo: assignedTo || undefined,
      expectedDelivery: expectedDelivery || undefined,
      weight: weight || undefined, // WeightInput already formats this as "25 kg"
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
      
      // Reset form
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

  const iconSize = 20;

  const handleDownloadQR = () => {
    if (qrCodeRef.current && createdShipment) {
      const svgElement = qrCodeRef.current.querySelector("svg");
      if (svgElement) {
        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(svgElement);

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

  const dutchCities = [
    "Amsterdam",
    "Rotterdam",
    "Den Haag",
    "Utrecht",
    "Eindhoven",
    "Tilburg",
    "Groningen",
    "Almere",
    "Breda",
    "Nijmegen",
    "Enschede",
    "Apeldoorn",
    "Haarlem",
    "Arnhem",
    "Zaanstad",
    "Amersfoort",
    "Haarlemmermeer",
    "Zwolle",
    "Leiden",
    "Maastricht",
    "Dordrecht",
    "Ede",
    "Leeuwarden",
    "Emmen",
    "Westland",
    "Venlo",
    "Delft",
    "Deventer",
    "Sittard-Geleen",
    "Helmond",
    "Heerlen",
    "Hilversum",
    "Alphen aan den Rijn",
    "Amstelveen",
    "Roosendaal",
    "Purmerend",
    "Oss",
    "Schiedam",
    "Spijkenisse",
    "Vlaardingen",
    "Almelo",
    "Gouda",
    "Hoorn",
    "Zaandam",
    "Assen",
    "Bergen op Zoom",
    "Capelle aan den IJssel",
    "Veenendaal",
    "Katwijk",
    "Nieuwegein",
    "Zeist",
    "Den Helder",
    "Hardenberg",
    "Doetinchem",
    "Hoogeveen",
    "Kampen",
    "Weert",
    "Terneuzen",
    "Roermond",
    "Rijswijk",
    "Middelburg",
    "Tiel",
    "Woerden",
    "Heerhugowaard",
    "Lelystad",
    "Barendrecht",
    "IJmuiden",
    "Dronten",
    "Culemborg",
    "Veghel",
  ];
  
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestination(value);
    if (value.length >= 2) {
      const filtered = dutchCities.filter((city) =>
        city.toLowerCase().startsWith(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (city: string) => {
    setDestination(city);
    setSuggestions([]);
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
          {/* Destination Input Group with Autofill */}
          <div>
            <label htmlFor="destination" className={labelClass}>
              Bestemming <span className="text-red-400">*</span>
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin size={iconSize} className="text-gray-400" />
              </div>
              <input
                id="destination"
                type="text"
                value={destination}
                onChange={handleDestinationChange}
                placeholder="Voer bestemmingsadres of stad in"
                className={inputClass}
                autoComplete="off"
                required
              />
              {suggestions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-indigo-950 border border-indigo-600 rounded-md max-h-60 overflow-y-auto shadow-lg">
                  {suggestions.map((city, index) => (
                    <li
                      key={index}
                      onClick={() => selectSuggestion(city)}
                      className="px-4 py-2 hover:bg-indigo-800 cursor-pointer text-white"
                    >
                      {city}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Assigned To Dropdown */}
          <div>
            <label htmlFor="assignedTo" className={labelClass}>
              Toegewezen Aan (Gebruiker/Chauffeur) <span className="text-red-400">*</span>
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={iconSize} className="text-gray-400" />
              </div>
              <select
                id="assignedTo"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className={`${inputClass} appearance-none pr-10`}
                disabled={usersLoading}
                required
              >
                <option value="">
                  {usersLoading ? "Laden..." : "Selecteer een gebruiker"}
                </option>
                {users.map((user) => (
                  <option key={user.id} value={user.name}>
                    {user.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Expected Delivery Date Picker */}
          <div>
            <label htmlFor="expectedDelivery" className={labelClass}>
              Verwachte leverdatum <span className="text-red-400">*</span>
            </label>
            <div className="mt-1">
              <DatePicker
                value={expectedDelivery}
                onChange={setExpectedDelivery}
                placeholder="Selecteer verwachte leverdatum"
              />
            </div>
          </div>

          {/* Weight Input */}
          <div>
            <label htmlFor="weight" className={labelClass}>
              Gewicht <span className="text-red-400">*</span>
            </label>
            <div className="mt-1">
              <WeightInput
                value={weight}
                onChange={setWeight}
                placeholder="Voer gewicht in"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center bg-yellow-400 hover:bg-yellow-600 disabled:bg-gray-500 text-indigo-950 font-semibold py-3 px-4 rounded-md transition-colors duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-50 text-lg !mt-8"
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
            className="mt-3 w-full bg-indigo-700 hover:bg-indigo-600 text-white font-medium py-2 px-6 rounded-md transition-colors duration-300 shadow-md"
          >
            Nog een Zending Aanmaken
          </button>
        </div>
      )}
    </div>
  );
};

export default NewShipment;