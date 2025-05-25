import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom"; // Import useNavigate and useLocation
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input, // Assuming this is NextUI's Input component
  Button, // Assuming this is NextUI's Button component
} from "@nextui-org/react";
import { ClipboardList, Search } from "lucide-react";

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
        className="bg-[#1E1B33] text-white w-full px-4 py-2 rounded-md flex justify-between items-center shadow-sm hover:bg-[#2A2745] transition-colors duration-200"
      >
        {selected || placeholder}
        <span
          className="ml-2 transform transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▼
        </span>
      </button>
      {open && (
        <ul className="absolute z-50 bg-[#1E1B33] w-full mt-1 rounded-md shadow-lg border border-[#3A365A] max-h-60 overflow-y-auto">
          {" "}
          {/* z-50 from previous fix */}
          {options.map((option) => (
            <li
              key={option}
              onClick={() => {
                setSelected(option);
                setOpen(false);
              }}
              className="px-4 py-2 hover:bg-[#2A2745] cursor-pointer text-sm"
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

  const uniqueStatuses = [...new Set(shipments.map((s) => s.status))];
  const navigate = useNavigate(); // Initialize navigate hook
  const location = useLocation(); // Initialize useLocation hook

  // Handle initial filter from query parameter (e.g., coming from Issues dashboard)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shipmentIdFromUrl = params.get('id');
    if (shipmentIdFromUrl) {
      setQuery(shipmentIdFromUrl); // Set query to the ID to filter the list
      // You might also want to scroll to the item or highlight it if it's found
    }
  }, [location.search]); // Re-run if URL query changes

  useEffect(() => {
    axios
      .get("http://172.20.10.2:5070/api/Shipments") // Ensure this URL is correct
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
        (s.destination?.toLowerCase().includes(lowerQuery) ||
         s.status?.toLowerCase().includes(lowerQuery) ||
         s.assignedTo?.toLowerCase().includes(lowerQuery) ||
         s.id.toString().includes(lowerQuery) // Include ID in search
        ) &&
        (selectedStatus ? s.status === selectedStatus : true)
    );
    setFiltered(filteredList);
  }, [query, shipments, selectedStatus]);

  const inputWrapperBaseStyle = // Used by the Reset Filters button
    "bg-[#1E1B33] border border-[#3A365A] text-white rounded-md transition-colors duration-200";

  const handleRowClick = (shipmentId: number) => {
    console.log(`Shipment row clicked: ${shipmentId}`);
    alert(`Zending ID ${shipmentId} geklikt! Functionaliteit volgt nog.`);
  };

  // Helper function to get status color
  const getStatusColorClass = (status: string) => {
    switch (
      status?.toLowerCase() // Added optional chaining and toLowerCase for robustness
    ) {
      case "geleverd":
        return "text-green-400";
      case "onderweg":
        return "text-orange-400";
      case "in afwachting":
        return "text-yellow-400";
      // You can add more Dutch status cases here
      case "in transit": // Example if some data might still have English
        return "text-blue-400"; // Or map to a Dutch equivalent's color
      case "delivered":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "failed":
        return "text-red-400";
      default:
        return "text-gray-400"; // Default color for unknown or other statuses
    }
  };

  const handleRowClick = (shipmentId: number) => {
    navigate(`/shipments/${shipmentId}`); // Navigate to detailed view
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold text-white">Zendingen</h1>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <Input
          placeholder="Zoek op ID, status, bestemming of toegewezen persoon"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`max-w-md ${inputButtonStyle}`}
        />

        <div className="flex items-center gap-4">
          <CustomDropdown
            options={uniqueStatuses}
            selected={selectedStatus}
            setSelected={setSelectedStatus}
            placeholder="Filter op status"
          />
          <Button
            className={`${inputWrapperBaseStyle} text-sm h-12 px-4 hover:bg-[#2A2745] min-w-[150px]`}
            variant="flat"
            onPress={() => {
              setQuery("");
              setSelectedStatus(null);
            }}
          >
            Reset Filters
          </Button>
        </div>
      </div>

      <Table aria-label="Zendingen tabel" removeWrapper>
        <TableHeader>
          <TableColumn className="text-left">ID</TableColumn>
          <TableColumn className="text-left">Status</TableColumn>
          <TableColumn className="text-left">Bestemming</TableColumn>
          <TableColumn className="text-left">Toegewezen</TableColumn>
          <TableColumn className="text-left">Verwacht</TableColumn>
          <TableColumn className="text-left">Gewicht</TableColumn>
        </TableHeader>
        <TableBody emptyContent={"Geen zendingen gevonden."}>
          {filtered.map((shipment) => (
            <TableRow
              key={shipment.id}
              onClick={() => handleRowClick(shipment.id)} // Make row clickable
              className="cursor-pointer hover:bg-[#2A2745] transition-colors duration-200" // Add hover effect
            >
              <TableCell>{shipment.id}</TableCell>
              <TableCell>{shipment.status}</TableCell>
              <TableCell>{shipment.destination}</TableCell>
              <TableCell>{shipment.assignedTo}</TableCell>
              <TableCell>{shipment.expectedDelivery}</TableCell>
              <TableCell>{shipment.weight}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Shipments;