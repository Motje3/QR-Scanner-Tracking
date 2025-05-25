// Accounts.tsx
import React, { useState, useEffect } from 'react'; // Added useEffect
import { Search, Edit, Trash, User, Plus } from 'lucide-react'; // Mail, Phone, Shield not directly used in table
import { Input } from "@nextui-org/react"; // Import Input from NextUI
import axios from 'axios'; // Import axios

// Interface for Profile data coming from backend (matches what GetAllProfilesAsync returns)
interface Profile {
  id: number;
  username: string; // Added username
  fullName: string;
  email: string;
  role: string;
  imageUrl: string;
  // Assuming these are not directly in the main table view from your sample, but good to have if API returns them
  // accentColor: string;
  // darkMode: boolean;
  // notificationsEnabled: boolean;
  createdAt: string; // For Last Login, we'll need to decide if this is the right field or if backend provides 'lastLogin'
  // The initialAccounts had 'active' and 'lastLogin'. The Profile model doesn't.
  // We'll use 'createdAt' for now as a placeholder for a date field.
  // You might need to adjust your backend Profile model and GetAllProfilesAsync if 'active' and 'lastLogin' are needed.
  active?: boolean; // Make these optional if not always present from backend
  lastLogin?: string;
}

// DTO for creating a user, matching your backend RegisterUserDto
interface RegisterUserDto {
  username: string;
  password?: string; // Password is required by DTO, but might be optional in some UI flows before final submit
  fullName: string;
  email?: string;
  role: string;
}


const Accounts = () => {
  const [accounts, setAccounts] = useState<Profile[]>([]); // Use Profile interface, initially empty
  const [isLoading, setIsLoading] = useState(true); // For loading state
  const [error, setError] = useState<string | null>(null); // For error state

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<Profile | null>(null); // Store the whole account for edit
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // State for the Create New Account modal fields
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState(''); // Default to a common role or empty
  const [newPassword, setNewPassword] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5070"; // Ensure this is correct

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      // Assuming your token is stored in localStorage after login
      // const token = localStorage.getItem('authToken');
      const response = await axios.get<Profile[]>(`${API_BASE_URL}/api/Profile`, {
        // headers: {
        //   Authorization: `Bearer ${token}` // Add if endpoint is protected
        // }
      });
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
  }, [API_BASE_URL]); // API_BASE_URL might not change, but good to include dependencies

  const filteredAccounts = accounts.filter(account =>
    account.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.email?.toLowerCase().includes(searchTerm.toLowerCase()) || // Email can be optional
    account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (account: Profile) => { // Pass the whole account
    setSelectedAccount(account);
    // Populate edit form fields here if you have separate state for them
    setIsEditModalOpen(true);
  };

  const handleDelete = (account: Profile) => { // Pass the whole account
    setSelectedAccount(account);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedAccount) {
      // TODO: Implement API call to delete account
      console.log("Deleting account:", selectedAccount.id);
      // For now, filter locally. Replace with API call & re-fetch.
      setAccounts(accounts.filter(account => account.id !== selectedAccount.id));
      setIsDeleteModalOpen(false);
      setSelectedAccount(null);
    }
  };

  const formatDate = (dateString?: string) => { // Make dateString optional
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('nl-NL', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  const handleCreateAccount = async () => {
    if (!newUsername || !newFullName || !newRole || !newPassword) {
      alert("Vul alstublieft alle verplichte velden in: Gebruikersnaam, Volledige Naam, Rol, en Wachtwoord.");
      return;
    }
    setIsLoading(true); // You might want a specific loading state for the modal

    const newUserDto: RegisterUserDto = {
      username: newUsername,
      password: newPassword,
      fullName: newFullName,
      email: newEmail || undefined, // Send undefined if empty, as DTO email is nullable
      role: newRole,
    };

    try {
      // const token = localStorage.getItem('authToken');
      const response = await axios.post(`${API_BASE_URL}/api/Profile/create`, newUserDto, {
        // headers: {
        //   Authorization: `Bearer ${token}` // Add if endpoint is protected
        // }
      });
      // Add the new user to the state or re-fetch all accounts
      // setAccounts([...accounts, response.data]); // Simpler for now
      fetchAccounts(); // Re-fetch to get the latest list including the new user with DB ID
      setIsCreateModalOpen(false);
      // Clear form fields
      setNewUsername('');
      setNewFullName('');
      setNewEmail('');
      setNewRole('');
      setNewPassword('');
      alert("Account succesvol aangemaakt!"); // Or a more subtle notification
    } catch (err: any) {
      console.error("Failed to create account:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Aanmaken van account mislukt.";
      alert(`Fout: ${errorMessage}`);
    } finally {
      setIsLoading(false); // Reset general loading or modal-specific loading
    }
  };
  
  // Simplified Edit Modal Save Handler (placeholder)
  const handleSaveChanges = () => {
      // TODO: Implement API call to update account details
      console.log("Saving changes for account:", selectedAccount);
      setIsEditModalOpen(false);
      setSelectedAccount(null);
      // fetchAccounts(); // Re-fetch after edit
  };


  // JSX Structure
  return (
    <div className="space-y-6 p-4 md:p-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 min-h-screen text-white">
      <div className="mb-6 flex justify-between items-center"> {/* Increased mb */}
        <div>
          {/* Matched title style from other pages */}
          <div className="flex items-center space-x-3">
            <User size={40} className="text-yellow-300" /> {/* Icon for Accounts */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Accounts</h1>
              <p className="text-indigo-300 text-sm">Beheer gebruikersaccounts en permissies</p>
            </div>
          </div>
        </div>
        <button
          className="bg-yellow-300 text-indigo-950 px-4 py-2.5 rounded-lg flex items-center font-semibold hover:bg-yellow-400 transition-colors shadow-md" // Enhanced button style
          onClick={() => {
            // Reset create form fields when opening modal
            setNewUsername(''); setNewFullName(''); setNewEmail(''); setNewRole(''); setNewPassword('');
            setIsCreateModalOpen(true);
          }}
        >
          <Plus size={20} className="mr-2" />
          Nieuw Account
        </button>
      </div>

      {/* Search and filters bar */}
      <div className="bg-indigo-900/70 backdrop-blur-md rounded-xl shadow-lg p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-grow w-full md:w-auto">
           <Input // Using NextUI Input for search
            isClearable
            placeholder="Zoek op naam, email, rol..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            startContent={<Search className="text-gray-400 pointer-events-none" size={18} />}
            classNames={{
                inputWrapper: "bg-indigo-800/80 border-indigo-700/50 rounded-lg shadow-sm h-11 group-data-[focus=true]:border-purple-500 group-data-[focus=true]:ring-2 group-data-[focus=true]:ring-purple-500/50",
                input: "text-white placeholder:text-gray-500 text-sm",
                clearButton: "text-gray-400 hover:text-white text-xl",
            }}
          />
        </div>
        {/* Filters for Role and Status - these are not yet wired to filter state */}
        <select className="w-full md:w-auto bg-indigo-800/80 border border-indigo-700/50 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm h-11">
          <option value="all">Alle Rollen</option>
          {/* Populate roles dynamically if possible */}
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
        </select>
        <select className="w-full md:w-auto bg-indigo-800/80 border border-indigo-700/50 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm h-11">
          <option value="all">Alle Statussen</option>
          <option value="active">Actief</option>
          <option value="inactive">Inactief</option>
        </select>
      </div>

      {/* Accounts table container */}
      {isLoading && <div className="text-center py-4 text-gray-400">Accounts laden...</div>}
      {error && <div className="text-center py-4 text-red-400">{error}</div>}
      {!isLoading && !error && (
        <div className="bg-indigo-900/70 backdrop-blur-md shadow-2xl rounded-xl p-4 md:p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]"> {/* min-w for horizontal scroll on small screens */}
              <thead>
                <tr className="text-gray-400 border-b border-indigo-800/50 text-xs uppercase">
                  <th className="py-3 px-4">Naam</th>
                  <th className="py-3 px-4">Email</th>
                  {/* Phone was in initialAccounts but not Profile model. Remove or add to Profile. */}
                  {/* <th className="py-3 px-4">Telefoon</th> */}
                  <th className="py-3 px-4">Rol</th>
                  <th className="py-3 px-4">Status</th> {/* 'active' field was in initialAccounts */}
                  <th className="py-3 px-4">Laatst Gezien / Aangemaakt</th>
                  <th className="py-3 px-4 text-right">Acties</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 divide-y divide-indigo-800/50">
                {filteredAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-indigo-800/50 transition-colors">
                    <td className="py-3 px-4 flex items-center">
                      <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-white mr-3 shrink-0">
                        <User size={16} />
                      </div>
                      <div>
                        <div className="font-medium text-white">{account.fullName}</div>
                        <div className="text-xs text-gray-400">@{account.username}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{account.email || "-"}</td>
                    {/* <td className="py-3 px-4">{account.phone || "-"}</td> */}
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        account.role?.toLowerCase() === 'admin' ? 'bg-purple-600/70 text-purple-100' :
                        account.role?.toLowerCase() === 'manager' ? 'bg-blue-600/70 text-blue-100' :
                        'bg-indigo-600/70 text-indigo-100'
                      }`}>
                        {account.role}
                      </span>
                    </td>
                    <td className="py-3 px-4"> {/* Assuming 'active' status from dummy data, adjust if backend differs */}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        account.active ? 'bg-green-600/70 text-green-100' : 'bg-red-600/70 text-red-100'
                      }`}>
                        {account.active ? 'Actief' : 'Inactief'}
                      </span>
                    </td>
                    <td className="py-3 px-4">{formatDate(account.lastLogin || account.createdAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex space-x-2 justify-end">
                        <button className="p-1.5 text-blue-400 hover:text-blue-300 transition-colors" onClick={() => handleEdit(account)}><Edit size={18} /></button>
                        <button className="p-1.5 text-red-400 hover:text-red-300 transition-colors" onClick={() => handleDelete(account)}><Trash size={18} /></button>
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
          {/* Pagination (remains simplified) */}
          <div className="flex justify-between items-center mt-6 text-gray-400 text-sm">
            <div>{filteredAccounts.length} van {accounts.length} accounts</div>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-indigo-700 rounded hover:bg-indigo-800 transition-colors">Vorige</button>
              <button className="px-3 py-1 border border-indigo-700 rounded bg-indigo-800">1</button>
              <button className="px-3 py-1 border border-indigo-700 rounded hover:bg-indigo-800 transition-colors">Volgende</button>
            </div>
          </div>
        </div>
      )}


      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedAccount && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-indigo-900 rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Account Verwijderen</h3>
            <p className="text-gray-300 mb-6">
              Weet u zeker dat u het account voor <span className="font-medium text-white">{selectedAccount.fullName}</span> wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
            </p>
            <div className="flex justify-end space-x-3">
              <button className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors" onClick={() => setIsDeleteModalOpen(false)}>Annuleren</button>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white font-medium transition-colors" onClick={confirmDelete}>Verwijderen</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Account Modal (simplified) */}
      {isEditModalOpen && selectedAccount && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-indigo-900 rounded-xl shadow-2xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-semibold text-white mb-6">Bewerk Account: <span className="text-yellow-300">{selectedAccount.fullName}</span></h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Volledige Naam</label>
                <input type="text" className="w-full bg-indigo-800 border border-indigo-700 rounded-md p-2.5 text-white focus:ring-purple-500 focus:border-purple-500" defaultValue={selectedAccount.fullName} />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Email</label>
                <input type="email" className="w-full bg-indigo-800 border border-indigo-700 rounded-md p-2.5 text-white focus:ring-purple-500 focus:border-purple-500" defaultValue={selectedAccount.email} />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Rol</label>
                <select className="w-full bg-indigo-800 border border-indigo-700 rounded-md p-2.5 text-white focus:ring-purple-500 focus:border-purple-500" defaultValue={selectedAccount.role}>
                  <option value="Admin">Admin</option> <option value="Manager">Manager</option> <option value="User">User</option> {/* Add more roles */}
                </select>
              </div>
              {/* Add more fields as needed, e.g., active status, username if editable */}
            </div>
            <div className="flex justify-end space-x-3">
              <button className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors" onClick={() => setIsEditModalOpen(false)}>Annuleren</button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium transition-colors" onClick={handleSaveChanges}>Opslaan</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Account Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-indigo-900 rounded-xl shadow-2xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-semibold text-white mb-6">Nieuw Account Aanmaken</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateAccount(); }} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Gebruikersnaam <span className="text-red-400">*</span></label>
                <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="w-full bg-indigo-800 border border-indigo-700 rounded-md p-2.5 text-white focus:ring-purple-500 focus:border-purple-500" placeholder="Kies een gebruikersnaam" required />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Volledige Naam <span className="text-red-400">*</span></label>
                <input type="text" value={newFullName} onChange={(e) => setNewFullName(e.target.value)} className="w-full bg-indigo-800 border border-indigo-700 rounded-md p-2.5 text-white focus:ring-purple-500 focus:border-purple-500" placeholder="Volledige naam" required />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Email</label>
                <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full bg-indigo-800 border border-indigo-700 rounded-md p-2.5 text-white focus:ring-purple-500 focus:border-purple-500" placeholder="Emailadres (optioneel)" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Rol <span className="text-red-400">*</span></label>
                <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="w-full bg-indigo-800 border border-indigo-700 rounded-md p-2.5 text-white focus:ring-purple-500 focus:border-purple-500" required>
                  <option value="">Selecteer een rol</option>
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  {/* Add other roles from your system */}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Wachtwoord <span className="text-red-400">*</span></label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-indigo-800 border border-indigo-700 rounded-md p-2.5 text-white focus:ring-purple-500 focus:border-purple-500" placeholder="Kies een wachtwoord" required />
              </div>
              {/* Removed 'Active Account' checkbox as it's not in Profile model/DTO */}
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors" onClick={() => setIsCreateModalOpen(false)}>Annuleren</button>
                <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white font-medium transition-colors" disabled={isLoading}>
                  {isLoading ? 'Aanmaken...' : 'Account Aanmaken'}
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