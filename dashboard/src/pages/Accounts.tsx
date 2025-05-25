// Accounts.tsx
import React, { useState, useEffect } from "react";
import {
  Search,
  Edit,
  Trash,
  User,
  Plus,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { Input } from "@nextui-org/react";
import axios from "axios";

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

interface RegisterUserDto {
  username: string;
  password?: string;
  fullName: string;
  email?: string;
  role: string;
}

interface ValidationErrors {
  username?: string;
  password?: string;
  fullName?: string;
  email?: string;
  role?: string;
}

const Accounts = () => {
  const [accounts, setAccounts] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<Profile | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [selectedRole, setSelectedRole] = useState("");
  const [openRoleDropdown, setOpenRoleDropdown] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [openStatusDropdown, setOpenStatusDropdown] = useState(false);

  // State for the Create New Account modal fields
  const [newUsername, setNewUsername] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [editRole, setEditRole] = useState("");
  const [openEditRoleDropdown, setOpenEditRoleDropdown] = useState(false);

  // Validation states
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5070";

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<Profile[]>(
        `${API_BASE_URL}/api/Profile`,
        {}
      );
      setAccounts(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
      setError("Kon accounts niet ophalen.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [API_BASE_URL]);

  // Validation functions based on DTO requirements
  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case "username":
        if (!value.trim()) return "Gebruikersnaam is verplicht.";
        if (value.length < 3)
          return "Gebruikersnaam moet minimaal 3 karakters bevatten.";
        if (value.length > 50)
          return "Gebruikersnaam mag maximaal 50 karakters bevatten.";
        break;
      case "password":
        if (!value.trim()) return "Wachtwoord is verplicht.";
        if (value.length < 6)
          return "Wachtwoord moet minimaal 6 karakters bevatten.";
        if (value.length > 100)
          return "Wachtwoord mag maximaal 100 karakters bevatten.";
        break;
      case "fullName":
        if (!value.trim()) return "Volledige naam is verplicht.";
        if (value.length > 100)
          return "Volledige naam mag maximaal 100 karakters bevatten.";
        break;
      case "email":
        if (value.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) return "Ongeldig emailadres formaat.";
          if (value.length > 100)
            return "Email mag maximaal 100 karakters bevatten.";
        }
        break;
      case "role":
        if (!value.trim()) return "Rol is verplicht.";
        if (value.length > 50) return "Rol mag maximaal 50 karakters bevatten.";
        break;
      default:
        break;
    }
    return undefined;
  };

  const validateAllFields = (): ValidationErrors => {
    const errors: ValidationErrors = {};

    const usernameError = validateField("username", newUsername);
    if (usernameError) errors.username = usernameError;

    const passwordError = validateField("password", newPassword);
    if (passwordError) errors.password = passwordError;

    const fullNameError = validateField("fullName", newFullName);
    if (fullNameError) errors.fullName = fullNameError;

    const emailError = validateField("email", newEmail);
    if (emailError) errors.email = emailError;

    const roleError = validateField("role", newRole);
    if (roleError) errors.role = roleError;

    return errors;
  };

  const handleFieldChange = (field: string, value: string) => {
    // Update the field value
    switch (field) {
      case "username":
        setNewUsername(value);
        break;
      case "password":
        setNewPassword(value);
        break;
      case "fullName":
        setNewFullName(value);
        break;
      case "email":
        setNewEmail(value);
        break;
      case "role":
        setNewRole(value);
        break;
    }

    // Clear the specific error for this field and validate in real-time
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      const fieldError = validateField(field, value);

      if (fieldError) {
        newErrors[field as keyof ValidationErrors] = fieldError;
      } else {
        delete newErrors[field as keyof ValidationErrors];
      }

      return newErrors;
    });
  };

  const resetCreateForm = () => {
    setNewUsername("");
    setNewFullName("");
    setNewEmail("");
    setNewRole("");
    setNewPassword("");
    setValidationErrors({});
  };

  const filteredAccounts = accounts.filter(
    (account) =>
      account.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (account: Profile) => {
    setSelectedAccount(account);
    setEditRole(account.role);
    setIsEditModalOpen(true);
  };

  const handleDelete = (account: Profile) => {
    setSelectedAccount(account);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedAccount) {
      // TODO: Implement API call to delete account
      console.log("Deleting account:", selectedAccount.id);
      setAccounts(
        accounts.filter((account) => account.id !== selectedAccount.id)
      );
      setIsDeleteModalOpen(false);
      setSelectedAccount(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("nl-NL", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleCreateAccount = async () => {
    // Validate all fields
    const errors = validateAllFields();
    setValidationErrors(errors);

    // If there are validation errors, don't proceed
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    const newUserDto: RegisterUserDto = {
      username: newUsername,
      password: newPassword,
      fullName: newFullName,
      email: newEmail || undefined,
      role: newRole,
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/Profile/create`,
        newUserDto,
        {}
      );
      fetchAccounts();
      setIsCreateModalOpen(false);
      resetCreateForm();
      alert("Account succesvol aangemaakt!");
    } catch (err: any) {
      console.error("Failed to create account:", err);

      // Parse server validation errors if available
      if (err.response?.data?.errors) {
        const serverErrors: ValidationErrors = {};
        const errorData = err.response.data.errors;

        // Map server field names to our local field names
        Object.keys(errorData).forEach((key) => {
          const lowerKey = key.toLowerCase();
          if (lowerKey.includes("username"))
            serverErrors.username = errorData[key][0];
          if (lowerKey.includes("password"))
            serverErrors.password = errorData[key][0];
          if (lowerKey.includes("fullname"))
            serverErrors.fullName = errorData[key][0];
          if (lowerKey.includes("email"))
            serverErrors.email = errorData[key][0];
          if (lowerKey.includes("role")) serverErrors.role = errorData[key][0];
        });

        setValidationErrors(serverErrors);
      } else {
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Aanmaken van account mislukt.";
        alert(`Fout: ${errorMessage}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveChanges = () => {
    // TODO: Implement API call to update account details
    console.log("Saving changes for account:", selectedAccount);
    setIsEditModalOpen(false);
    setSelectedAccount(null);
    // fetchAccounts(); // Re-fetch after edit
  };

  // Error message component
  const ErrorMessage = ({ error }: { error?: string }) => {
    if (!error) return null;

    return (
      <div className="flex items-center mt-1 text-red-400 text-sm animate-pulse">
        <AlertCircle size={14} className="mr-1 flex-shrink-0" />
        <span>{error}</span>
      </div>
    );
  };

  // JSX Structure
  return (
    <div className="space-y-6 p-4 md:p-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 min-h-[92vh] text-white">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-3">
            <User size={40} className="text-yellow-300" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Accounts</h1>
              <p className="text-indigo-300 text-sm">
                Beheer gebruikersaccounts en permissies
              </p>
            </div>
          </div>
        </div>
        <button
          className="bg-yellow-300 text-indigo-950 px-4 py-2.5 rounded-lg flex items-center font-semibold hover:bg-yellow-400 transition-colors shadow-md"
          onClick={() => {
            resetCreateForm();
            setIsCreateModalOpen(true);
          }}
        >
          <Plus size={20} className="mr-2" />
          Nieuw Account
        </button>
      </div>

      {/* Search and filters bar */}
      <div className="bg-indigo-900/70 backdrop-blur-md rounded-xl shadow-lg p-4 flex flex-col md:flex-row items-center gap-4 relative z-20">
        {/* Search Input */}
        <div className="relative flex-grow w-full md:w-auto">
          <Input
            isClearable
            placeholder="Zoek op naam, email, rol..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            startContent={
              <Search className="text-gray-400 pointer-events-none" size={18} />
            }
            classNames={{
              inputWrapper:
                "bg-indigo-800/80 border-indigo-700/50 rounded-lg shadow-sm h-11 group-data-[focus=true]:border-purple-500 group-data-[focus=true]:ring-2 group-data-[focus=true]:ring-purple-500/20 transition-all duration-200 ease-in-out",
              input:
                "text-white placeholder:text-gray-500 text-sm focus:outline-none",
              clearButton: "text-gray-400 hover:text-white text-xl",
            }}
            style={
              {
                "--nextui-focus-outline": "none",
                "--nextui-outline-color": "transparent",
              } as React.CSSProperties
            }
          />
        </div>

        {/* Custom Dropdown for Roles */}
        <div className="relative w-full md:w-48 z-[999]">
          <button
            onClick={() => setOpenRoleDropdown((prev) => !prev)}
            className="flex items-center justify-between w-full bg-indigo-800/80 border border-indigo-700/50 text-white px-4 py-2.5 rounded-lg text-sm h-11 hover:bg-indigo-700/90 hover:border-indigo-600/60 transition-colors"
          >
            <span>{selectedRole || "Alle Rollen"}</span>
            <ChevronDown
              size={18}
              className={`ml-2 transition-transform duration-200 ${
                openRoleDropdown ? "rotate-180" : ""
              }`}
            />
          </button>
          {openRoleDropdown && (
            <ul className="absolute z-[999] mt-2 w-full bg-indigo-800/90 backdrop-blur-md rounded-lg shadow-md border border-indigo-700/50">
              {["Alle Rollen", "Admin", "Manager", "User"].map((role) => (
                <li
                  key={role}
                  className="px-4 py-2 text-sm text-white hover:bg-indigo-700/70 cursor-pointer"
                  onClick={() => {
                    setSelectedRole(role === "Alle Rollen" ? "" : role);
                    setOpenRoleDropdown(false);
                  }}
                >
                  {role}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Custom Dropdown for Status */}
        <div className="relative w-full md:w-48 z-[999]">
          <button
            onClick={() => setOpenStatusDropdown((prev) => !prev)}
            className="flex items-center justify-between w-full bg-indigo-800/80 border border-indigo-700/50 text-white px-4 py-2.5 rounded-lg text-sm h-11 hover:bg-indigo-700/90 hover:border-indigo-600/60 transition-colors"
          >
            <span>{selectedStatus || "Alle Statussen"}</span>
            <ChevronDown
              size={18}
              className={`ml-2 transition-transform duration-200 ${
                openStatusDropdown ? "rotate-180" : ""
              }`}
            />
          </button>
          {openStatusDropdown && (
            <ul className="absolute z-50 mt-2 w-full bg-indigo-800/90 backdrop-blur-md rounded-lg shadow-md border border-indigo-700/50">
              {["Alle Statussen", "Actief", "Inactief"].map((status) => (
                <li
                  key={status}
                  className="px-4 py-2 text-sm text-white hover:bg-indigo-700/70 cursor-pointer"
                  onClick={() => {
                    setSelectedStatus(
                      status === "Alle Statussen" ? "" : status
                    );
                    setOpenStatusDropdown(false);
                  }}
                >
                  {status}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Accounts table container */}
      {isLoading && (
        <div className="text-center py-4 text-gray-400">Accounts laden...</div>
      )}
      {error && <div className="text-center py-4 text-red-400">{error}</div>}
      {!isLoading && !error && (
        <div className="bg-indigo-900/70 backdrop-blur-md shadow-2xl rounded-xl p-4 md:p-6 relative">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="text-gray-400 border-b border-indigo-800/50 text-xs uppercase">
                  <th className="py-3 px-4">Naam</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Rol</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Laatst Gezien / Aangemaakt</th>
                  <th className="py-3 px-4 text-right">Acties</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 divide-y divide-indigo-800/50">
                {filteredAccounts.map((account) => (
                  <tr
                    key={account.id}
                    className="hover:bg-indigo-800/50 transition-colors"
                  >
                    <td className="py-3 px-4 flex items-center">
                      <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-white mr-3 shrink-0">
                        <User size={16} />
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {account.fullName}
                        </div>
                        <div className="text-xs text-gray-400">
                          @{account.username}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{account.email || "-"}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          account.role?.toLowerCase() === "admin"
                            ? "bg-purple-600/70 text-purple-100"
                            : account.role?.toLowerCase() === "manager"
                              ? "bg-blue-600/70 text-blue-100"
                              : "bg-indigo-600/70 text-indigo-100"
                        }`}
                      >
                        {account.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          account.active
                            ? "bg-green-600/70 text-green-100"
                            : "bg-red-600/70 text-red-100"
                        }`}
                      >
                        {account.active ? "Actief" : "Inactief"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {formatDate(account.lastLogin || account.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex space-x-2 justify-end">
                        <button
                          className="p-1.5 text-blue-400 hover:text-blue-300 transition-colors"
                          onClick={() => handleEdit(account)}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="p-1.5 text-red-400 hover:text-red-300 transition-colors"
                          onClick={() => handleDelete(account)}
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredAccounts.length === 0 && !isLoading && (
            <div className="text-center text-gray-400 py-6">
              Geen accounts gevonden die voldoen aan uw criteria.
            </div>
          )}
          <div className="flex justify-between items-center mt-6 text-gray-400 text-sm">
            <div>
              {filteredAccounts.length} van {accounts.length} accounts
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-indigo-700 rounded hover:bg-indigo-800 transition-colors">
                Vorige
              </button>
              <button className="px-3 py-1 border border-indigo-700 rounded bg-indigo-800">
                1
              </button>
              <button className="px-3 py-1 border border-indigo-700 rounded hover:bg-indigo-800 transition-colors">
                Volgende
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedAccount && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-indigo-900 rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">
              Account Verwijderen
            </h3>
            <p className="text-gray-300 mb-6">
              Weet u zeker dat u het account voor{" "}
              <span className="font-medium text-white">
                {selectedAccount.fullName}
              </span>{" "}
              wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Annuleren
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white font-medium transition-colors"
                onClick={confirmDelete}
              >
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {isEditModalOpen && selectedAccount && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-indigo-900 rounded-xl shadow-2xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-semibold text-white mb-6">
              Bewerk Account:{" "}
              <span className="text-yellow-300">
                {selectedAccount.fullName}
              </span>
            </h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Volledige Naam
                </label>
                <input
                  type="text"
                  className="w-full bg-indigo-800 border border-indigo-700 rounded-md p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200 ease-in-out"
                  defaultValue={selectedAccount.fullName}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full bg-indigo-800 border border-indigo-700 rounded-md p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200 ease-in-out"
                  defaultValue={selectedAccount.email}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Rol</label>
                <div className="relative">
                  <button
                    onClick={() => setOpenEditRoleDropdown((prev) => !prev)}
                    className="flex items-center justify-between w-full bg-indigo-800 border border-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm h-11 hover:bg-indigo-700/90 hover:border-indigo-600/60 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                  >
                    <span>{editRole}</span>
                    <ChevronDown
                      size={18}
                      className={`ml-2 transition-transform duration-200 ${
                        openEditRoleDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openEditRoleDropdown && (
                    <ul className="absolute z-[999] mt-2 w-full bg-indigo-800/90 backdrop-blur-md rounded-lg shadow-md border border-indigo-700/50">
                      {["Admin", "Manager", "User"].map((role) => (
                        <li
                          key={role}
                          className="px-4 py-2 text-sm text-white hover:bg-indigo-700/70 cursor-pointer"
                          onClick={() => {
                            setEditRole(role);
                            setOpenEditRoleDropdown(false);
                          }}
                        >
                          {role}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                onClick={() => setIsEditModalOpen(false)}
              >
                Annuleren
              </button>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium transition-colors"
                onClick={handleSaveChanges}
              >
                Opslaan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Account Modal with Enhanced Validation */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-indigo-900 rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-6">
              Nieuw Account Aanmaken
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateAccount();
              }}
              className="space-y-4 mb-6"
            >
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Gebruikersnaam <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) =>
                    handleFieldChange("username", e.target.value)
                  }
                  className={`w-full bg-indigo-800 border rounded-md p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200 ease-in-out ${
                    validationErrors.username
                      ? "border-red-500 focus:border-red-400 focus:ring-red-400/50"
                      : "border-indigo-700 focus:border-purple-500"
                  }`}
                  placeholder="3-50 karakters"
                />
                <ErrorMessage error={validationErrors.username} />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Volledige Naam <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) =>
                    handleFieldChange("fullName", e.target.value)
                  }
                  className={`w-full bg-indigo-800 border rounded-md p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200 ease-in-out ${
                    validationErrors.fullName
                      ? "border-red-500 focus:border-red-400 focus:ring-red-400/50"
                      : "border-indigo-700 focus:border-purple-500"
                  }`}
                  placeholder="Maximaal 100 karakters"
                />
                <ErrorMessage error={validationErrors.fullName} />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  className={`w-full bg-indigo-800 border rounded-md p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200 ease-in-out ${
                    validationErrors.email
                      ? "border-red-500 focus:border-red-400 focus:ring-red-400/50"
                      : "border-indigo-700 focus:border-purple-500"
                  }`}
                  placeholder="naam@example.com (optioneel)"
                />
                <ErrorMessage error={validationErrors.email} />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Rol <span className="text-red-400">*</span>
                </label>
                <select
                  value={newRole}
                  onChange={(e) => handleFieldChange("role", e.target.value)}
                  className={`w-full bg-indigo-800 border rounded-md p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200 ease-in-out cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==')] bg-no-repeat bg-right-3 bg-center pr-10 ${
                    validationErrors.role
                      ? "border-red-500 focus:border-red-400 focus:ring-red-400/50"
                      : "border-indigo-700 focus:border-purple-500"
                  }`}
                >
                  <option value="" className="bg-indigo-800 text-white">
                    Selecteer een rol
                  </option>
                  <option value="User" className="bg-indigo-800 text-white">
                    User
                  </option>
                  <option value="Admin" className="bg-indigo-800 text-white">
                    Admin
                  </option>
                  <option value="Manager" className="bg-indigo-800 text-white">
                    Manager
                  </option>
                </select>
                <ErrorMessage error={validationErrors.role} />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Wachtwoord <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) =>
                    handleFieldChange("password", e.target.value)
                  }
                  className={`w-full bg-indigo-800 border rounded-md p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200 ease-in-out ${
                    validationErrors.password
                      ? "border-red-500 focus:border-red-400 focus:ring-red-400/50"
                      : "border-indigo-700 focus:border-purple-500"
                  }`}
                  placeholder="Minimaal 6 karakters"
                />
                <ErrorMessage error={validationErrors.password} />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetCreateForm();
                  }}
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    isSubmitting || Object.keys(validationErrors).length > 0
                  }
                >
                  {isSubmitting ? "Aanmaken..." : "Account Aanmaken"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
