import { useEffect, useState } from 'react';
import { Users, FileText, CheckCircle, AlertCircle, XCircle, TrendingUp, DollarSign } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getStatistiques, getDemandes } from '../utils/storage';

export default function Dashboard() {
  const [stats, setStats] = useState({
    nombreClients: 0,
    nombreDemandes: 0,
    acceptees: 0,
    analyse: 0,
    refusees: 0,
    montantTotal: 0,
    pdMoyenne: 0,
  });

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setStats(getStatistiques());
  }, [refreshKey]);

  // Rafraîchir toutes les 2 secondes pour détecter les changements
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const pieData = [
    { name: 'Accepté', value: stats.acceptees, color: '#10b981' },
    { name: 'Analyse', value: stats.analyse, color: '#f59e0b' },
    { name: 'Refus', value: stats.refusees, color: '#ef4444' },
  ];

  // Données pour le graphique d'évolution des demandes
  const demandes = getDemandes();
  const demandesParMois: Record<string, { acceptees: number; analyse: number; refusees: number }> = {};
  
  demandes.forEach(d => {
    const date = new Date(d.date_demande);
    const mois = `${date.getMonth() + 1}/${date.getFullYear()}`;
    
    if (!demandesParMois[mois]) {
      demandesParMois[mois] = { acceptees: 0, analyse: 0, refusees: 0 };
    }
    
    if (d.decision === 'Accepté') demandesParMois[mois].acceptees++;
    if (d.decision === 'Analyse') demandesParMois[mois].analyse++;
    if (d.decision === 'Refus') demandesParMois[mois].refusees++;
  });

  const lineData = Object.entries(demandesParMois).map(([mois, data]) => ({
    mois,
    ...data,
  }));

  // Répartition des PD
  const pdRanges = [
    { range: '0-20%', count: 0 },
    { range: '20-35%', count: 0 },
    { range: '35-50%', count: 0 },
    { range: '50-60%', count: 0 },
    { range: '60-100%', count: 0 },
  ];

  demandes.forEach(d => {
    const pd = d.pd * 100;
    if (pd < 20) pdRanges[0].count++;
    else if (pd < 35) pdRanges[1].count++;
    else if (pd < 50) pdRanges[2].count++;
    else if (pd < 60) pdRanges[3].count++;
    else pdRanges[4].count++;
  });

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-gray-900">Tableau de Bord</h2>
        <p className="text-gray-600 mt-1">Vue d'ensemble de l'activité et des indicateurs clés</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clients</p>
              <p className="text-gray-900 mt-1">{stats.nombreClients}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Demandes</p>
              <p className="text-gray-900 mt-1">{stats.nombreDemandes}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Montant Accepté</p>
              <p className="text-gray-900 mt-1">{stats.montantTotal.toLocaleString('fr-FR')} FCFA</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">PD Moyenne</p>
              <p className="text-gray-900 mt-1">{(stats.pdMoyenne * 100).toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Statut des décisions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-700">Acceptées</p>
              <p className="text-green-900">{stats.acceptees}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-orange-700">En Analyse</p>
              <p className="text-orange-900">{stats.analyse}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-red-700">Refusées</p>
              <p className="text-red-900">{stats.refusees}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des décisions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-900 mb-4">Répartition des Décisions</h3>
          {stats.nombreDemandes > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              Aucune donnée disponible
            </div>
          )}
        </div>

        {/* Répartition des PD */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-900 mb-4">Distribution des Probabilités de Défaut</h3>
          {stats.nombreDemandes > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pdRanges}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              Aucune donnée disponible
            </div>
          )}
        </div>
      </div>

      {/* Évolution des demandes */}
      {lineData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-900 mb-4">Évolution des Demandes par Mois</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="acceptees" stroke="#10b981" name="Acceptées" strokeWidth={2} />
              <Line type="monotone" dataKey="analyse" stroke="#f59e0b" name="Analyse" strokeWidth={2} />
              <Line type="monotone" dataKey="refusees" stroke="#ef4444" name="Refusées" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}