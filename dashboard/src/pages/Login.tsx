// src/pages/Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, User } from "lucide-react"; // Import icons

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    const { success, message } = await login(username, password);
    if (success) {
      navigate("/dashboard");
    } else {
      // Show the API’s actual error if we have one, otherwise fallback
      setError(message ?? "Ongeldige gebruikersnaam of wachtwoord.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 p-4">
      <div className="bg-indigo-900/80 backdrop-blur-sm p-8 rounded-lg shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Login</h1>
          <p className="text-gray-400">
            Welkom terug! Log in om verder te gaan.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-gray-300 text-sm font-semibold mb-2"
            >
              Gebruikersnaam
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={20}
              />
              <input
                type="text"
                id="username"
                className="w-full pl-10 pr-4 py-2 bg-indigo-800 border border-indigo-700 rounded-md text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                placeholder="Je gebruikersnaam"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-gray-300 text-sm font-semibold mb-2"
            >
              Wachtwoord
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={20}
              />
              <input
                type="password"
                id="password"
                className="w-full pl-10 pr-4 py-2 bg-indigo-800 border border-indigo-700 rounded-md text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                placeholder="Je wachtwoord"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            Inloggen
          </button>
        </form>
        <p className="text-center text-gray-500 text-sm mt-6">
          {/* Changed href="#" to onClick to navigate */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault(); // Prevent default link behavior
              navigate("/forgot-password"); // Navigate to the new forgot password route
            }}
            className="hover:text-purple-400"
          >
            Wachtwoord vergeten?
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
