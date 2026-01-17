import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useClients } from '../context/ClientContext';

export default function Layout() {
  const { currentClient } = useClients();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64">
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              {currentClient ? (
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {currentClient.firstName} {currentClient.lastName}
                    {currentClient.partnerFirstName && (
                      <span className="text-gray-500">
                        {' '}& {currentClient.partnerFirstName} {currentClient.partnerLastName}
                      </span>
                    )}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {currentClient.city && `${currentClient.postalCode} ${currentClient.city}`}
                  </p>
                </div>
              ) : (
                <h1 className="text-xl font-semibold text-gray-900">Finanzplanung</h1>
              )}
            </div>
          </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
