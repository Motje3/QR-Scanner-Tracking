import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
} from "@nextui-org/react";
import { ChevronRight } from 'lucide-react'; // For an optional clickable indicator

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

// CustomDropdown remains the same
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
        className="bg-[#1E1B33] text-white w-full px-4 py-2 rounded-md flex justify-between items-center shadow-sm hover:bg-[#2A2745] transition-colors duration-200" // Added shadow, hover, transition
      >
        {selected || placeholder}
        <span
          className="ml-2 transform transition-transform duration-200" // Added duration
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▼
        </span>
      </button>
      {open && (
        <ul className="absolute z-20 bg-[#1E1B33] w-full mt-1 rounded-md shadow-lg border border-[#3A365A] max-h-60 overflow-y-auto"> {/* Increased z-index, border color, max-height */}
          {options.map((option) => (
            <li
              key={option}
              onClick={() => {
                setSelected(option);
                setOpen(false);
              }}
              className="px-4 py-2 hover:bg-[#2A2745] cursor-pointer text-sm" // Added text-sm
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


const Shipments = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filtered, setFiltered] = useState<Shipment[]>([]);
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const uniqueStatuses = ["Alle Statussen", ...new Set(shipments.map((s) => s.status))]; // Added "Alle Statussen"

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5070";


  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/Shipments`) // Using API_BASE_URL
      .then((res) => {
        setShipments(res.data);
        setFiltered(res.data);
      })
      .catch((err) => console.error("Failed to fetch shipments:", err));
  }, [API_BASE_URL]);

  useEffect(() => {
    const lowerQuery = query.toLowerCase();
    const filteredList = shipments.filter(
      (s) =>
        (s.id.toString().includes(lowerQuery) || // Added search by ID
          s.destination?.toLowerCase().includes(lowerQuery) ||
          s.status?.toLowerCase().includes(lowerQuery) ||
          s.assignedTo?.toLowerCase().includes(lowerQuery)) &&
        (selectedStatus && selectedStatus !== "Alle Statussen" ? s.status === selectedStatus : true) // Handle "Alle Statussen"
    );
    setFiltered(filteredList);
  }, [query, shipments, selectedStatus]);

  const inputStyle = "bg-[#1E1B33] border border-[#3A365A] text-white rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"; // Enhanced input style

  const handleRowClick = (shipmentId: number) => {
    console.log(`Shipment row clicked: ${shipmentId}`);
    // Later: Navigate to shipment details page or open a modal
    alert(`Zending ID ${shipmentId} geklikt! Functionaliteit volgt nog.`);
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 min-h-[92vh]"> {/* Added gradient background and min-h-screen */}
      <h1 className="text-4xl font-bold text-white mb-8">Zendingen Overzicht</h1> {/* Increased size and margin */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 p-4 bg-indigo-900/60 backdrop-blur-sm rounded-xl shadow-lg"> {/* Styling for filter bar */}
        <Input
          isClearable // Added clearable button
          placeholder="Zoek op ID, status, bestemming..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md"
          classNames={{ // For NextUI specific input styling
            inputWrapper: `${inputStyle} group-data-[focus=true]:bg-[#2A2745]`,
            input: "text-sm",
            clearButton: "text-gray-400 hover:text-white",
          }}
          startContent={<span className="text-gray-400 text-sm mr-2">🔍</span>}
        />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <CustomDropdown
            options={uniqueStatuses}
            selected={selectedStatus}
            setSelected={setSelectedStatus}
            placeholder="Filter op status"
          />
          <Button
            className={`${inputStyle} text-sm px-4 py-2 hover:bg-[#2A2745]`} // Consistent styling
            variant="flat" // Using flat for better style consistency
            onClick={() => {
              setQuery("");
              setSelectedStatus(null); // This will default to "Alle Statussen" placeholder effectively
            }}
          >
            Reset Filters
          </Button>
        </div>
      </div>

      <Table 
        aria-label="Zendingen tabel" 
        removeWrapper 
        className="bg-transparent" // Make table background transparent to see page gradient
      >
        <TableHeader>
          {/* Styling the header columns for better separation */}
          <TableColumn className="text-left text-xs uppercase tracking-wider font-semibold text-indigo-300 bg-indigo-900/80 backdrop-blur-sm p-4 first:rounded-l-lg last:rounded-r-lg">ID</TableColumn>
          <TableColumn className="text-left text-xs uppercase tracking-wider font-semibold text-indigo-300 bg-indigo-900/80 backdrop-blur-sm p-4">Status</TableColumn>
          <TableColumn className="text-left text-xs uppercase tracking-wider font-semibold text-indigo-300 bg-indigo-900/80 backdrop-blur-sm p-4">Bestemming</TableColumn>
          <TableColumn className="text-left text-xs uppercase tracking-wider font-semibold text-indigo-300 bg-indigo-900/80 backdrop-blur-sm p-4">Toegewezen Aan</TableColumn>
          <TableColumn className="text-left text-xs uppercase tracking-wider font-semibold text-indigo-300 bg-indigo-900/80 backdrop-blur-sm p-4">Verwachte Levering</TableColumn>
          <TableColumn className="text-left text-xs uppercase tracking-wider font-semibold text-indigo-300 bg-indigo-900/80 backdrop-blur-sm p-4 last:rounded-r-lg">Gewicht</TableColumn>
        </TableHeader>
        <TableBody 
            items={filtered} 
            emptyContent={"Geen zendingen gevonden die voldoen aan uw criteria."}
            className="space-y-3" // Creates space between rows if we don't use border-separate
        >
          {(shipment) => (
            <TableRow 
              key={shipment.id} 
              onClick={() => handleRowClick(shipment.id)}
              className={`
                bg-indigo-800/70 backdrop-blur-sm 
                rounded-lg shadow-md 
                hover:bg-indigo-700/90 hover:shadow-xl hover:scale-[1.01] 
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50
                transition-all duration-200 ease-in-out 
                cursor-pointer
                my-2  // Add margin between rows
              `}
            >
              <TableCell className="p-4 text-sm text-gray-200 rounded-l-lg">{shipment.id}</TableCell>
              <TableCell className="p-4 text-sm">
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  shipment.status === 'In Transit' ? 'bg-blue-500 text-blue-100' :
                  shipment.status === 'Delivered' ? 'bg-green-500 text-green-100' :
                  shipment.status === 'Pending' ? 'bg-yellow-500 text-yellow-100' :
                  shipment.status === 'Failed' ? 'bg-red-500 text-red-100' :
                  'bg-gray-500 text-gray-100' // Default/other statuses
                }`}>
                  {shipment.status}
                </span>
              </TableCell>
              <TableCell className="p-4 text-sm text-gray-300">{shipment.destination || "-"}</TableCell>
              <TableCell className="p-4 text-sm text-gray-300">{shipment.assignedTo || "-"}</TableCell>
              <TableCell className="p-4 text-sm text-gray-300">{shipment.expectedDelivery || "-"}</TableCell>
              <TableCell className="p-4 text-sm text-gray-300 rounded-r-lg">{shipment.weight || "-"}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Shipments;