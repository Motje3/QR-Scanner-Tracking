// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext'; // Import AuthProvider
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute

import DashboardLayout from '../src/layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import AccountSettings from './pages/AccountSettings';
import Shipments from './pages/Shipments';
import Stats from './pages/Stats';
import Issues from './pages/Issues';
import NewShipments from './pages/NewShipment';
import ShipmentDetail from './components/ShipmentDetail';
import Login from './pages/Login'; // Import the new Login page
import ForgotPassword from './pages/ForgotPassword';

function App() {
  return (
    <Router>
      <AuthProvider> {/* Wrap the entire application with AuthProvider */}
        <Routes>
          {/* Public Route: Login Page */}
          <Route path="/login" element={<Login />} />
          
          {/* New Public Route: Forgot Password Page */}
          <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Add this line */}

          {/* Redirect from root to dashboard (if authenticated, otherwise login) */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Protected Routes (all routes that require login) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/accounts"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Accounts />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/account-settings"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AccountSettings />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/shipments"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Shipments />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/shipments/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ShipmentDetail />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Stats />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/issues"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Issues />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/newshipment"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <NewShipments />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Add more protected routes as needed, following the same pattern */}
          {/* If a route does not require login, it should NOT be wrapped with ProtectedRoute */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;