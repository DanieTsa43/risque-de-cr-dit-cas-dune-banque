import { useState } from 'react';
import Dashboard from './components/Dashboard';
import ClientsManager from './components/ClientsManager';
import CreditRequestForm from './components/CreditRequestForm';
import CreditDecisions from './components/CreditDecisions';

type TabType = 'dashboard' | 'clients' | 'requests' | 'decisions';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Tableau de Bord' },
    { id: 'clients' as TabType, label: 'Clients' },
    { id: 'requests' as TabType, label: 'Demandes de Crédit' },
    { id: 'decisions' as TabType, label: 'Décisions' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-8 py-4">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 border-b-2 transition-colors ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'clients' && <ClientsManager />}
        {activeTab === 'requests' && <CreditRequestForm />}
        {activeTab === 'decisions' && <CreditDecisions />}
      </main>
    </div>
  );
}