// src/pages/ForgotPassword.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // For making API requests
import { Mail, Lock } from 'lucide-react'; // Import icons for input fields
import LoadingSpinner from '../components/LoadingSpinner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(() => {
    return localStorage.getItem('forgotPasswordLoaded') === 'true' ? false : true;
  }); // Loading state

  const [emailError, setEmailError] = useState('');
  const [newPassError, setNewPassError] = useState('');
  const [confirmPassError, setConfirmPassError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoading(false);
        localStorage.setItem('forgotPasswordLoaded', 'true');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const validateFields = () => {
    let isValid = true;
    setEmailError('');
    setNewPassError('');
    setConfirmPassError('');
    setGeneralError('');

    if (!email.trim()) {
      setEmailError('E-mailadres is vereist.');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Voer een geldig e-mailadres in.');
      isValid = false;
    }

    if (!newPass) {
      setNewPassError('Nieuw wachtwoord is vereist.');
      isValid = false;
    } else if (newPass.length < 6) { // Example: Minimum password length
      setNewPassError('Wachtwoord moet minimaal 6 tekens lang zijn.');
      isValid = false;
    }

    if (!confirmPass) {
      setConfirmPassError('Bevestig het nieuwe wachtwoord.');
      isValid = false;
    } else if (newPass && newPass !== confirmPass) {
      setConfirmPassError('Wachtwoorden komen niet overeen.');
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) {
      return;
    }
    setLoading(true); // Start loading

    try {
      // Assuming your backend endpoint is /api/PasswordReset
      const response = await axios.post(`${API_BASE_URL}/api/PasswordReset`, {
        email,
        newPassword: newPass,
      });

      if (response.status === 200) { // Or 204 No Content, depending on your backend
        setRequestSent(true);
      } else {
        setGeneralError(response.data.message || 'Er is iets misgegaan. Probeer het opnieuw.');
      }
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        setGeneralError(error.response.data.message || 'Kon verzoek niet versturen. Probeer het later opnieuw.');
      } else {
        setGeneralError('Netwerkfout of onbekende fout. Probeer het later opnieuw.');
      }
      console.error("Password reset error:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  if (loading) return <LoadingSpinner />;

  if (requestSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 p-4">
        <div className="bg-indigo-900/80 backdrop-blur-sm p-8 rounded-lg shadow-2xl w-full max-w-md text-center">
          <div className="text-green-500 mb-4">
            {/* Using Lucide-React checkmark icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle mx-auto">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Verzoek Verzonden!</h2>
          <p className="text-gray-300 mb-6">
            Je wachtwoordresetverzoek is naar de administrator gestuurd. Zij zullen het zo spoedig mogelijk verwerken.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 p-4">
      <div className="bg-indigo-900/80 backdrop-blur-sm p-8 rounded-lg shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Wachtwoord vergeten</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-gray-300 text-sm font-semibold mb-2">Huidig e-mailadres</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="email"
                id="email"
                className={`w-full pl-10 pr-4 py-2 bg-indigo-800 border rounded-md text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none ${emailError ? 'border-red-500' : 'border-indigo-700'}`}
                placeholder="Je e-mailadres"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                onBlur={() => {
                  if (email.trim() && !/\S+@\S+\.\S+/.test(email)) {
                    setEmailError('Voer een geldig e-mailadres in.');
                  } else if (email.trim()) {
                    setEmailError('');
                  }
                }}
                required
              />
              {emailError && <p className="text-red-400 text-sm mt-1">{emailError}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-gray-300 text-sm font-semibold mb-2">Nieuw wachtwoord</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="password"
                id="newPassword"
                className={`w-full pl-10 pr-4 py-2 bg-indigo-800 border rounded-md text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none ${newPassError ? 'border-red-500' : 'border-indigo-700'}`}
                placeholder="Nieuw wachtwoord"
                value={newPass}
                onChange={(e) => {
                  setNewPass(e.target.value);
                  if (newPassError) setNewPassError('');
                }}
                required
              />
              {newPassError && <p className="text-red-400 text-sm mt-1">{newPassError}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-gray-300 text-sm font-semibold mb-2">Bevestig wachtwoord</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="password"
                id="confirmPassword"
                className={`w-full pl-10 pr-4 py-2 bg-indigo-800 border rounded-md text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none ${confirmPassError ? 'border-red-500' : 'border-indigo-700'}`}
                placeholder="Bevestig nieuw wachtwoord"
                value={confirmPass}
                onChange={(e) => {
                  setConfirmPass(e.target.value);
                  if (confirmPassError) setConfirmPassError('');
                }}
                required
              />
              {confirmPassError && <p className="text-red-400 text-sm mt-1">{confirmPassError}</p>}
            </div>
          </div>
          {generalError && <p className="text-red-400 text-sm text-center">{generalError}</p>}
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            {loading ? <LoadingSpinner /> : 'Verstuur verzoek'}
          </button>
        </form>
        <p className="text-center text-gray-500 text-sm mt-6">
          <a href="#" onClick={() => navigate('/login')} className="hover:text-purple-400">Terug naar inloggen</a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;