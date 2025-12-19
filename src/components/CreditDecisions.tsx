import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, XCircle, Filter, Download, Eye } from 'lucide-react';
import { DemandeCredit } from '../types';
import { getDemandes } from '../utils/storage';
import { formaterPD, getCouleurDecision } from '../utils/creditModel';

type FilterType = 'all' | 'Accepté' | 'Analyse' | 'Refus';

export default function CreditDecisions() {
  const [demandes, setDemandes] = useState<DemandeCredit[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedDemande, setSelectedDemande] = useState<DemandeCredit | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadDemandes();
  }, []);

  const loadDemandes = () => {
    const allDemandes = getDemandes();
    setDemandes(allDemandes.sort((a, b) => 
      new Date(b.date_demande).getTime() - new Date(a.date_demande).getTime()
    ));
  };

  // Rafraîchir toutes les 2 secondes
  useEffect(() => {
    const interval = setInterval(loadDemandes, 2000);
    return () => clearInterval(interval);
  }, []);

  const filteredDemandes = filter === 'all' 
    ? demandes 
    : demandes.filter(d => d.decision === filter);

  const handleViewDetails = (demande: DemandeCredit) => {
    setSelectedDemande(demande);
    setShowDetails(true);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Client', 'Montant', 'Durée', 'Objet', 'PD', 'Décision', 'Date'];
    const rows = filteredDemandes.map(d => [
      d.id,
      `${d.client_prenom} ${d.client_nom}`,
      d.montant,
      d.duree,
      d.objet,
      formaterPD(d.pd),
      d.decision,
      new Date(d.date_demande).toLocaleDateString('fr-FR'),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `decisions_credit_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const DecisionIcon = ({ decision }: { decision: DemandeCredit['decision'] }) => {
    if (decision === 'Accepté') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (decision === 'Analyse') return <AlertCircle className="w-5 h-5 text-orange-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Décisions de Crédit</h2>
          <p className="text-gray-600 mt-1">Consultez l'historique des demandes et décisions</p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={filteredDemandes.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          <span>Exporter CSV</span>
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Toutes ({demandes.length})
            </button>
            <button
              onClick={() => setFilter('Accepté')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'Accepté'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Acceptées ({demandes.filter(d => d.decision === 'Accepté').length})
            </button>
            <button
              onClick={() => setFilter('Analyse')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'Analyse'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              En analyse ({demandes.filter(d => d.decision === 'Analyse').length})
            </button>
            <button
              onClick={() => setFilter('Refus')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'Refus'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Refusées ({demandes.filter(d => d.decision === 'Refus').length})
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des demandes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Objet
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Durée
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  PD
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Décision
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDemandes.map((demande) => (
                <tr key={demande.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(demande.date_demande).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">
                        {demande.client_prenom} {demande.client_nom}
                      </div>
                      <div className="text-sm text-gray-500">ID: {demande.id_client}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {demande.objet}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {demande.montant.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {demande.duree} mois
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${
                        demande.pd < 0.35 ? 'text-green-600' :
                        demande.pd < 0.6 ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {formaterPD(demande.pd)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <DecisionIcon decision={demande.decision} />
                      <span className={`text-sm px-3 py-1 rounded-full ${getCouleurDecision(demande.decision)}`}>
                        {demande.decision}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewDetails(demande)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Détails</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDemandes.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucune demande trouvée</p>
          </div>
        )}
      </div>

      {/* Modal de détails */}
      {showDetails && selectedDemande && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* En-tête */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900">Détails de la demande #{selectedDemande.id}</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Informations générales */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-gray-900 mb-3">Informations client</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Nom</p>
                      <p className="text-gray-900">{selectedDemande.client_prenom} {selectedDemande.client_nom}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ID Client</p>
                      <p className="text-gray-900">{selectedDemande.id_client}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-gray-900 mb-3">Détails du crédit</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Montant</p>
                      <p className="text-gray-900">{selectedDemande.montant.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Durée</p>
                      <p className="text-gray-900">{selectedDemande.duree} mois</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Objet</p>
                      <p className="text-gray-900">{selectedDemande.objet}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Décision */}
              <div className={`rounded-lg p-6 mb-6 ${
                selectedDemande.decision === 'Accepté' ? 'bg-green-50 border-2 border-green-200' :
                selectedDemande.decision === 'Analyse' ? 'bg-orange-50 border-2 border-orange-200' :
                'bg-red-50 border-2 border-red-200'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <DecisionIcon decision={selectedDemande.decision} />
                  <h4 className="text-gray-900">Décision : {selectedDemande.decision}</h4>
                </div>
                <p className={`text-sm ${
                  selectedDemande.decision === 'Accepté' ? 'text-green-800' :
                  selectedDemande.decision === 'Analyse' ? 'text-orange-800' :
                  'text-red-800'
                }`}>
                  Probabilité de défaut calculée : {formaterPD(selectedDemande.pd)}
                </p>
              </div>

              {/* Analyse détaillée */}
              <div className="space-y-4 mb-6">
                <h4 className="text-gray-900">Analyse quantitative du risque</h4>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Ratio d'endettement (Poids: 30%)</span>
                      <span className="text-sm text-gray-900">
                        {(selectedDemande.score_details.ratio_endettement * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                        style={{ width: `${Math.min(selectedDemande.score_details.ratio_endettement * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Ratio crédit/revenu (Poids: 25%)</span>
                      <span className="text-sm text-gray-900">
                        {(selectedDemande.score_details.ratio_credit_revenu * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full"
                        style={{ width: `${Math.min(selectedDemande.score_details.ratio_credit_revenu * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Score statut professionnel (Poids: 20%)</span>
                      <span className="text-sm text-gray-900">
                        {(selectedDemande.score_details.score_statut * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full"
                        style={{ width: `${selectedDemande.score_details.score_statut * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Score ancienneté (Poids: 15%)</span>
                      <span className="text-sm text-gray-900">
                        {(selectedDemande.score_details.score_anciennete * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full"
                        style={{ width: `${selectedDemande.score_details.score_anciennete * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Score âge (Poids: 10%)</span>
                      <span className="text-sm text-gray-900">
                        {(selectedDemande.score_details.score_age * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full"
                        style={{ width: `${selectedDemande.score_details.score_age * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Métadonnées */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">ID Demande</p>
                    <p className="text-gray-900">{selectedDemande.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Date de soumission</p>
                    <p className="text-gray-900">
                      {new Date(selectedDemande.date_demande).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}