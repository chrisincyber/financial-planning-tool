import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClientProvider } from './context/ClientContext';
import Layout from './components/Layout';
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
    <ClientProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clients/new" element={<NewClient />} />
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
        </Routes>
      </BrowserRouter>
    </ClientProvider>
  );
}

export default App;
