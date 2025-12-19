import { useState, useEffect } from 'react';
import { FileText, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';
import { Client, DemandeCredit } from '../types';
import { getClients, saveDemande } from '../utils/storage';
import { calculerProbabiliteDefaut, determinerDecision, formaterPD, getCouleurDecision } from '../utils/creditModel';

export default function CreditRequestForm() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [montant, setMontant] = useState('');
  const [duree, setDuree] = useState('');
  const [objet, setObjet] = useState('');
  const [result, setResult] = useState<DemandeCredit | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    setClients(getClients());
  }, []);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClient) return;

    const montantNum = Number(montant);
    const dureeNum = Number(duree);

    const { pd, details } = calculerProbabiliteDefaut(selectedClient, montantNum, dureeNum);
    const decision = determinerDecision(pd);

    const demande: DemandeCredit = {
      id: Date.now().toString(),
      id_client: selectedClient.id,
      client_nom: selectedClient.nom,
      client_prenom: selectedClient.prenom,
      montant: montantNum,
      duree: dureeNum,
      objet,
      pd,
      decision,
      date_demande: new Date().toISOString(),
      score_details: details,
    };

    saveDemande(demande);
    setResult(demande);
    setShowResult(true);

    // Réinitialiser le formulaire
    setSelectedClientId('');
    setMontant('');
    setDuree('');
    setObjet('');
  };

  const DecisionIcon = result?.decision === 'Accepté' ? CheckCircle : 
                       result?.decision === 'Analyse' ? AlertCircle : XCircle;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-gray-900">Demande de Crédit</h2>
        <p className="text-gray-600 mt-1">Soumettez une nouvelle demande de crédit et obtenez une décision automatique</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-900 mb-6">Informations de la demande</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sélection du client */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Client</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionnez un client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.prenom} {client.nom} - {client.statut_professionnel} - {client.revenu.toLocaleString('fr-FR')} FCFA/mois
                  </option>
                ))}
              </select>
            </div>

            {/* Montant */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Montant du crédit (FCFA)</label>
              <input
                type="number"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                required
                min="50000"
                max="1000000"
                step="10000"
                placeholder="Ex: 500000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Durée */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Durée (mois)</label>
              <select
                value={duree}
                onChange={(e) => setDuree(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionnez une durée</option>
                <option value="12">12 mois (1 an)</option>
                <option value="24">24 mois (2 ans)</option>
                <option value="36">36 mois (3 ans)</option>
                <option value="48">48 mois (4 ans)</option>
                <option value="60">60 mois (5 ans)</option>
                <option value="84">84 mois (7 ans)</option>
                <option value="120">120 mois (10 ans)</option>
                <option value="180">180 mois (15 ans)</option>
                <option value="240">240 mois (20 ans)</option>
              </select>
            </div>

            {/* Objet */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Objet du crédit</label>
              <select
                value={objet}
                onChange={(e) => setObjet(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionnez un objet</option>
                <option value="Immobilier">Immobilier</option>
                <option value="Automobile">Automobile</option>
                <option value="Travaux">Travaux</option>
                <option value="Consommation">Consommation</option>
                <option value="Professionnel">Professionnel</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              <span>Soumettre la demande</span>
            </button>
          </form>
        </div>

        {/* Informations du client sélectionné */}
        <div className="space-y-6">
          {selectedClient ? (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
              <h3 className="text-gray-900 mb-4">Profil du client</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nom complet</p>
                  <p className="text-gray-900">{selectedClient.prenom} {selectedClient.nom}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Statut professionnel</p>
                  <p className="text-gray-900">{selectedClient.statut_professionnel}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ancienneté</p>
                  <p className="text-gray-900">{selectedClient.anciennete_emploi} ans</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Âge</p>
                  <p className="text-gray-900">{selectedClient.age} ans</p>
                </div>
                <div className="pt-3 border-t border-blue-200">
                  <p className="text-sm text-gray-600">Revenu mensuel</p>
                  <p className="text-gray-900">{selectedClient.revenu.toLocaleString('fr-FR')} FCFA</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Charges mensuelles</p>
                  <p className="text-gray-900">{selectedClient.charges.toLocaleString('fr-FR')} FCFA</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Capacité de remboursement</p>
                  <p className="text-green-600">{(selectedClient.revenu - selectedClient.charges).toLocaleString('fr-FR')} FCFA</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
              <Info className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Sélectionnez un client pour voir son profil</p>
            </div>
          )}

          {/* Informations sur le modèle */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-gray-900 mb-3">Modèle d'évaluation</h3>
            <p className="text-sm text-gray-600 mb-3">
              Le calcul de la probabilité de défaut (PD) prend en compte :
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Ratio d'endettement (30%)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Ratio crédit/revenu (25%)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Statut professionnel (20%)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Ancienneté d'emploi (15%)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Âge du client (10%)</span>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
              <p className="text-gray-700">Seuils de décision :</p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">PD {'<'} 35% : Accepté</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600">35% ≤ PD {'<'} 60% : Analyse</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">PD ≥ 60% : Refus</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de résultat */}
      {showResult && result && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* En-tête du résultat */}
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  result.decision === 'Accepté' ? 'bg-green-100' :
                  result.decision === 'Analyse' ? 'bg-orange-100' : 'bg-red-100'
                }`}>
                  <DecisionIcon className={`w-8 h-8 ${
                    result.decision === 'Accepté' ? 'text-green-600' :
                    result.decision === 'Analyse' ? 'text-orange-600' : 'text-red-600'
                  }`} />
                </div>
                <h3 className="text-gray-900 mb-2">Décision : {result.decision}</h3>
                <p className="text-gray-600">Probabilité de défaut : {formaterPD(result.pd)}</p>
              </div>

              {/* Détails de la demande */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-gray-900 mb-3">Détails de la demande</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Client</p>
                    <p className="text-gray-900">{result.client_prenom} {result.client_nom}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Montant</p>
                    <p className="text-gray-900">{result.montant.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Durée</p>
                    <p className="text-gray-900">{result.duree} mois</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Objet</p>
                    <p className="text-gray-900">{result.objet}</p>
                  </div>
                </div>
              </div>

              {/* Détails du score */}
              <div className="space-y-3 mb-6">
                <h4 className="text-gray-900">Analyse quantitative du risque</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ratio d'endettement</span>
                    <span className="text-gray-900">{(result.score_details.ratio_endettement * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min(result.score_details.ratio_endettement * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ratio crédit/revenu</span>
                    <span className="text-gray-900">{(result.score_details.ratio_credit_revenu * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${Math.min(result.score_details.ratio_credit_revenu * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Score statut professionnel</span>
                    <span className="text-gray-900">{(result.score_details.score_statut * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${result.score_details.score_statut * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Score ancienneté</span>
                    <span className="text-gray-900">{(result.score_details.score_anciennete * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${result.score_details.score_anciennete * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Score âge</span>
                    <span className="text-gray-900">{(result.score_details.score_age * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${result.score_details.score_age * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Recommandation */}
              <div className={`rounded-lg p-4 mb-6 ${
                result.decision === 'Accepté' ? 'bg-green-50 border border-green-200' :
                result.decision === 'Analyse' ? 'bg-orange-50 border border-orange-200' :
                'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-sm ${
                  result.decision === 'Accepté' ? 'text-green-800' :
                  result.decision === 'Analyse' ? 'text-orange-800' :
                  'text-red-800'
                }`}>
                  {result.decision === 'Accepté' && 
                    'Le profil du client présente un risque faible. La demande peut être acceptée selon les conditions standard.'}
                  {result.decision === 'Analyse' && 
                    'Le profil du client présente un risque modéré. Une analyse complémentaire par un conseiller est recommandée.'}
                  {result.decision === 'Refus' && 
                    'Le profil du client présente un risque élevé. Il est recommandé de refuser la demande ou de proposer des conditions adaptées.'}
                </p>
              </div>

              {/* Bouton de fermeture */}
              <button
                onClick={() => setShowResult(false)}
                className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}