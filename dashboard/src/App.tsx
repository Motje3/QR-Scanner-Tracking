// App.tsx or your main router file
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../src/layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import AccountSettings from './pages/AccountSettings';
import Shipments from './pages/Shipments';
import Stats from './pages/Stats';
import Issues from './pages/Issues';
import NewShipments from './pages/NewShipment';
import ShipmentDetail from './components/ShipmentDetail'; // Import the new component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Routes with DashboardLayout */}
        <Route path="/dashboard" element={
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        } />

        <Route path="/accounts" element={
          <DashboardLayout>
            <Accounts />
          </DashboardLayout>
        } />

        <Route path="/account-settings" element={
          <DashboardLayout>
            <AccountSettings />
          </DashboardLayout>
        } />

        <Route path="/shipments" element={
          <DashboardLayout>
            <Shipments />
          </DashboardLayout>
        } />

        <Route path="/shipments/:id" element={
          <DashboardLayout>
            <ShipmentDetail />
          </DashboardLayout>
        } />

        <Route path="/stats" element={
          <DashboardLayout>
            <Stats />
          </DashboardLayout>
        } />

        <Route path="/issues" element={
          <DashboardLayout>
            <Issues />
          </DashboardLayout>
        } />

        <Route path="/newshipment" element={
          <DashboardLayout>
            <NewShipments />
          </DashboardLayout>
        } />

        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;