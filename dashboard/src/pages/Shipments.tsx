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
// import { ChevronRight } from 'lucide-react'; // Not currently used, can be removed if not planned

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
          {/* z-50 should be sufficient */}
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

  const uniqueStatuses = [
    "Alle Statussen",
    ...new Set(shipments.map((s) => s.status)),
  ];

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5070";

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/Shipments`)
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
        (s.id.toString().includes(lowerQuery) ||
          s.destination?.toLowerCase().includes(lowerQuery) ||
          s.status?.toLowerCase().includes(lowerQuery) ||
          s.assignedTo?.toLowerCase().includes(lowerQuery)) &&
        (selectedStatus && selectedStatus !== "Alle Statussen"
          ? s.status === selectedStatus
          : true)
    );
    setFiltered(filteredList);
  }, [query, shipments, selectedStatus]);

  // This style is for the wrapper around the input, not the input element itself
  const inputWrapperBaseStyle =
    "bg-[#1E1B33] border border-[#3A365A] text-white rounded-md transition-colors duration-200";

  const handleRowClick = (shipmentId: number) => {
    console.log(`Shipment row clicked: ${shipmentId}`);
    alert(`Zending ID ${shipmentId} geklikt! Functionaliteit volgt nog.`);
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 min-h-[92vh]">
      {" "}
      {/* Adjusted min-height slightly from min-h-screen if navbar takes some space */}
      <h1 className="text-4xl font-bold text-white mb-8">
        Zendingen Overzicht
      </h1>
      {/* Filter bar: Added relative and z-index */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 p-4 bg-indigo-900/60 backdrop-blur-sm rounded-xl shadow-lg relative z-30">
        <Input
          isClearable
          placeholder="Zoek op ID, status, bestemming..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md" // Applies to the outermost NextUI Input wrapper
          classNames={{
            inputWrapper: [
              // Styles for the direct wrapper of the <input>
              inputWrapperBaseStyle,
              "group-data-[focus=true]:bg-[#2A2745]",
              "group-data-[focus=true]:ring-2",
              "group-data-[focus=true]:ring-purple-500",
              "group-data-[focus=true]:border-purple-500",
              "shadow-sm",
            ],
            input: [
              // Styles for the actual <input> element
              "text-sm",
              "placeholder-gray-500",
              "text-white",
              "bg-transparent", // Make inner input background transparent
              "border-0", // Remove inner input border
              "focus:ring-0", // Remove inner input focus ring (wrapper handles focus style)
              "outline-none", // Remove inner input outline
            ],
            clearButton: "text-gray-400 hover:text-white text-xl", // Made clear button a bit larger
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
            className={`${inputWrapperBaseStyle} text-sm px-4 py-2 hover:bg-[#2A2745]`} // Reused similar style for consistency
            variant="flat"
            onClick={() => {
              setQuery("");
              setSelectedStatus(null);
            }}
          >
            Reset Filters
          </Button>
        </div>
      </div>
      <Table
        aria-label="Zendingen tabel"
        removeWrapper
        className="bg-transparent border-separate" // Add border-separate
        style={{ borderSpacing: "0 0.75rem" }} // Example: 0 horizontal, 0.75rem (12px) vertical spacing. Use `theme('spacing.3')` if you have access to theme.
      >
        <TableHeader>
          <TableColumn className="text-left text-xs uppercase tracking-wider font-semibold text-indigo-300 bg-indigo-900/80 backdrop-blur-sm p-4 first:rounded-l-lg last:rounded-r-lg">
            ID
          </TableColumn>
          <TableColumn className="text-left text-xs uppercase tracking-wider font-semibold text-indigo-300 bg-indigo-900/80 backdrop-blur-sm p-4">
            Status
          </TableColumn>
          <TableColumn className="text-left text-xs uppercase tracking-wider font-semibold text-indigo-300 bg-indigo-900/80 backdrop-blur-sm p-4">
            Bestemming
          </TableColumn>
          <TableColumn className="text-left text-xs uppercase tracking-wider font-semibold text-indigo-300 bg-indigo-900/80 backdrop-blur-sm p-4">
            Toegewezen Aan
          </TableColumn>
          <TableColumn className="text-left text-xs uppercase tracking-wider font-semibold text-indigo-300 bg-indigo-900/80 backdrop-blur-sm p-4">
            Verwachte Levering
          </TableColumn>
          <TableColumn className="text-left text-xs uppercase tracking-wider font-semibold text-indigo-300 bg-indigo-900/80 backdrop-blur-sm p-4 last:rounded-r-lg">
            Gewicht
          </TableColumn>
        </TableHeader>
        <TableBody
          items={filtered}
          emptyContent={"Geen zendingen gevonden die voldoen aan uw criteria."}
          className="space-y-3" // This should create vertical space between rows if NextUI renders rows as block-like children
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
                /* my-2 was removed, relying on space-y-3 on TableBody */
              `}
            >
              <TableCell className="p-4 text-sm text-gray-200 rounded-l-lg">
                {shipment.id}
              </TableCell>
              <TableCell className="p-4 text-sm">
                <span
                  className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    shipment.status === "In Transit"
                      ? "bg-blue-500 text-blue-100"
                      : shipment.status === "Delivered"
                        ? "bg-green-500 text-green-100"
                        : shipment.status === "Pending"
                          ? "bg-yellow-500 text-yellow-100"
                          : shipment.status === "Failed"
                            ? "bg-red-500 text-red-100"
                            : "bg-gray-500 text-gray-100"
                  }`}
                >
                  {shipment.status}
                </span>
              </TableCell>
              <TableCell className="p-4 text-sm text-gray-300">
                {shipment.destination || "-"}
              </TableCell>
              <TableCell className="p-4 text-sm text-gray-300">
                {shipment.assignedTo || "-"}
              </TableCell>
              <TableCell className="p-4 text-sm text-gray-300">
                {shipment.expectedDelivery || "-"}
              </TableCell>
              <TableCell className="p-4 text-sm text-gray-300 rounded-r-lg">
                {shipment.weight || "-"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Shipments;
