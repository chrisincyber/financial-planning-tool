import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ClientProvider } from './context/ClientContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AcceptInvitation from './pages/auth/AcceptInvitation';

// App pages
import Dashboard from './pages/Dashboard';
import PersonalInfo from './pages/PersonalInfo';
import Goals from './pages/Goals';
import Housing from './pages/Housing';
import PropertyInsurance from './pages/PropertyInsurance';
import HealthInsurance from './pages/HealthInsurance';
import LegalSecurity from './pages/LegalSecurity';
import TaxOptimization from './pages/TaxOptimization';
import Investment from './pages/Investment';
import Pension from './pages/Pension';
import Budget from './pages/Budget';
import NewClient from './pages/NewClient';

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <ClientProvider>
          <Routes>
            {/* Public auth routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/accept-invitation" element={<AcceptInvitation />} />

            {/* Protected app routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* Advisor-only routes */}
              <Route
                path="clients/new"
                element={
                  <ProtectedRoute requireAdvisor>
                    <NewClient />
                  </ProtectedRoute>
                }
              />

              {/* Client data routes */}
              <Route path="personal" element={<PersonalInfo />} />
              <Route path="goals" element={<Goals />} />
              <Route path="housing" element={<Housing />} />
              <Route path="property-insurance" element={<PropertyInsurance />} />
              <Route path="health-insurance" element={<HealthInsurance />} />
              <Route path="legal" element={<LegalSecurity />} />
              <Route path="tax" element={<TaxOptimization />} />
              <Route path="investment" element={<Investment />} />
              <Route path="pension" element={<Pension />} />
              <Route path="budget" element={<Budget />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ClientProvider>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
