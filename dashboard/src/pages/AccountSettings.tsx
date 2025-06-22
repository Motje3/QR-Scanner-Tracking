import React, { useState, useEffect } from "react";
import { Save, User, Lock, Bell, AlertCircle, CheckCircle } from "lucide-react";
import axios from "axios";

interface UserSettings {
  id?: number;
  profileId?: number;
  fullName: string;
  email: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  monthlyReport: boolean;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const AccountSettings = () => {
  const [settings, setSettings] = useState<UserSettings>({
    fullName: "",
    email: "",
    emailNotifications: true,
    pushNotifications: true,
    monthlyReport: true,
  });

  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchUserSettings();
    fetchUserProfile();
  }, []);

  const fetchUserSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/UserSettings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      setSettings(response.data);
    } catch (error) {
      console.error("Failed to fetch user settings:", error);
      showMessage("error", "Kon instellingen niet laden");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const userProfile = JSON.parse(
        localStorage.getItem("userProfile") || "{}"
      );
      setUserRole(userProfile.role || "User");
    } catch (error) {
      console.error("Kon profiel niet opzoeken:", error);
    }
  };

  const handleSettingsChange = (
    field: keyof UserSettings,
    value: string | boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange = (
    field: keyof ChangePasswordData,
    value: string
  ) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const validatePassword = (): boolean => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      return true; // Skip validation if fields are empty
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage("error", "Nieuwe wachtwoorden komen niet overeen");
      return false;
    }

    if (passwordData.newPassword.length < 6) {
      showMessage("error", "Nieuw wachtwoord moet minimaal 6 tekens bevatten");
      return false;
    }

    return true;
  };

  const handleSaveSettings = async () => {
    if (!validatePassword()) return;

    setSaving(true);
    try {
      // Save user settings
      await axios.put(`${API_BASE_URL}/api/UserSettings`, settings, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      // Change password if provided - FIX THIS PART
      if (passwordData.currentPassword && passwordData.newPassword) {
        const passwordDto = {
          oldPassword: passwordData.currentPassword, // Changed from currentPassword
          newPassword: passwordData.newPassword, // This stays the same
          // Remove confirmPassword - we validate it on frontend only
        };

        await axios.post(
          `${API_BASE_URL}/api/UserSettings/change-password`,
          passwordDto,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        // Clear password fields
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }

      showMessage("success", "Instellingen succesvol opgeslagen!");
    } catch (error: any) {
      console.error("Kon instellingen niet opslaan:", error);
      const errorMessage =
        error.response?.data?.message || "Kon instellingen niet opslaan";
      showMessage("error", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="relative">
          <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-8 h-8 border border-blue-400/50 rounded-full animate-pulse"></div>
        </div>
        <span className="ml-3 text-white">Instellingen laden...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-white">Account Instellingen</h1>
        <p className="text-gray-400">Beheer je account voorkeuren</p>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`flex items-center p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-800/60 border border-green-600 text-green-200"
              : "bg-red-800/60 border border-red-600 text-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle size={20} className="mr-2" />
          ) : (
            <AlertCircle size={20} className="mr-2" />
          )}
          {message.text}
        </div>
      )}

      {/* Personal Information */}
      <div className="bg-indigo-900 rounded-lg p-6">
        <div className="flex items-center mb-6">
          <User size={24} className="text-yellow-200 mr-3" />
          <h2 className="text-xl font-semibold text-white">
            Persoonlijke Informatie
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-300 mb-2">Volledige Naam</label>
            <input
              type="text"
              className="w-full bg-indigo-800 border border-indigo-700 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200"
              value={settings.fullName}
              onChange={(e) => handleSettingsChange("fullName", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">E-mail</label>
            <input
              type="email"
              className="w-full bg-indigo-800 border border-indigo-700 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200"
              value={settings.email}
              onChange={(e) => handleSettingsChange("email", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Rol</label>
            <input
              type="text"
              className="w-full bg-indigo-800 border border-indigo-700 rounded p-2 text-gray-400"
              value={userRole}
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-indigo-900 rounded-lg p-6">
        <div className="flex items-center mb-6">
          <Lock size={24} className="text-yellow-200 mr-3" />
          <h2 className="text-xl font-semibold text-white">Beveiliging</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2">
              Huidig Wachtwoord
            </label>
            <input
              type="password"
              className="w-full bg-indigo-800 border border-indigo-700 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200"
              placeholder="••••••••"
              value={passwordData.currentPassword}
              onChange={(e) =>
                handlePasswordChange("currentPassword", e.target.value)
              }
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 mb-2">
                Nieuw Wachtwoord
              </label>
              <input
                type="password"
                className="w-full bg-indigo-800 border border-indigo-700 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200"
                placeholder="••••••••"
                value={passwordData.newPassword}
                onChange={(e) =>
                  handlePasswordChange("newPassword", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">
                Bevestig Nieuw Wachtwoord
              </label>
              <input
                type="password"
                className="w-full bg-indigo-800 border border-indigo-700 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200"
                placeholder="••••••••"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  handlePasswordChange("confirmPassword", e.target.value)
                }
              />
            </div>
          </div>
          <p className="text-gray-400 text-sm">
            Laat wachtwoordvelden leeg als je je wachtwoord niet wilt wijzigen.
          </p>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-indigo-900 rounded-lg p-6">
        <div className="flex items-center mb-6">
          <Bell size={24} className="text-yellow-200 mr-3" />
          <h2 className="text-xl font-semibold text-white">Meldingen</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="email-notifications"
              className="mr-3 w-4 h-4 text-purple-500 bg-indigo-800 border-indigo-700 rounded focus:ring-purple-500/50"
              checked={settings.emailNotifications}
              onChange={(e) =>
                handleSettingsChange("emailNotifications", e.target.checked)
              }
            />
            <label
              htmlFor="email-notifications"
              className="text-gray-300 cursor-pointer"
            >
              E-mail Meldingen
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="push-notifications"
              className="mr-3 w-4 h-4 text-purple-500 bg-indigo-800 border-indigo-700 rounded focus:ring-purple-500/50"
              checked={settings.pushNotifications}
              onChange={(e) =>
                handleSettingsChange("pushNotifications", e.target.checked)
              }
            />
            <label
              htmlFor="push-notifications"
              className="text-gray-300 cursor-pointer"
            >
              Push Meldingen
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="monthly-report"
              className="mr-3 w-4 h-4 text-purple-500 bg-indigo-800 border-indigo-700 rounded focus:ring-purple-500/50"
              checked={settings.monthlyReport}
              onChange={(e) =>
                handleSettingsChange("monthlyReport", e.target.checked)
              }
            />
            <label
              htmlFor="monthly-report"
              className="text-gray-300 cursor-pointer"
            >
              Maandelijks Rapport
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="bg-yellow-200 text-indigo-950 px-6 py-3 rounded flex items-center font-medium hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-indigo-950 border-t-transparent rounded-full animate-spin mr-2"></div>
              Opslaan...
            </>
          ) : (
            <>
              <Save size={18} className="mr-2" />
              Wijzigingen Opslaan
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AccountSettings;
