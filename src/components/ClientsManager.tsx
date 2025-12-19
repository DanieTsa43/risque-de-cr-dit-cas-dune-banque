import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, User, Briefcase, Calendar, TrendingUp } from 'lucide-react';
import { Client } from '../types';
import { getClients, saveClient, deleteClient } from '../utils/storage';

export default function ClientsManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = () => {
    setClients(getClients());
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const client: Client = {
      id: editingClient?.id || Date.now().toString(),
      nom: formData.get('nom') as string,
      prenom: formData.get('prenom') as string,
      revenu: Number(formData.get('revenu')),
      charges: Number(formData.get('charges')),
      statut_professionnel: formData.get('statut_professionnel') as Client['statut_professionnel'],
      anciennete_emploi: Number(formData.get('anciennete_emploi')),
      age: Number(formData.get('age')),
      date_creation: editingClient?.date_creation || new Date().toISOString(),
    };

    saveClient(client);
    loadClients();
    setShowForm(false);
    setEditingClient(null);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      deleteClient(id);
      loadClients();
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingClient(null);
  };

  const filteredClients = clients.filter(client =>
    `${client.prenom} ${client.nom}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Gestion des Clients</h2>
          <p className="text-gray-600 mt-1">Créez et gérez les profils clients</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau Client</span>
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-900 mb-4">
            {editingClient ? 'Modifier le Client' : 'Nouveau Client'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  name="nom"
                  defaultValue={editingClient?.nom}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  name="prenom"
                  defaultValue={editingClient?.prenom}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Revenu mensuel (FCFA)</label>
                <input
                  type="number"
                  name="revenu"
                  defaultValue={editingClient?.revenu}
                  required
                  min="0"
                  step="10000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Charges mensuelles (FCFA)</label>
                <input
                  type="number"
                  name="charges"
                  defaultValue={editingClient?.charges}
                  required
                  min="0"
                  step="10000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Statut professionnel</label>
                <select
                  name="statut_professionnel"
                  defaultValue={editingClient?.statut_professionnel}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Indépendant">Indépendant</option>
                  <option value="Retraité">Retraité</option>
                  <option value="Étudiant">Étudiant</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Ancienneté emploi (années)</label>
                <input
                  type="number"
                  name="anciennete_emploi"
                  defaultValue={editingClient?.anciennete_emploi}
                  required
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Âge</label>
                <input
                  type="number"
                  name="age"
                  defaultValue={editingClient?.age}
                  required
                  min="18"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingClient ? 'Modifier' : 'Créer'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Barre de recherche */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Liste des clients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => {
          const ratioEndettement = (client.charges / client.revenu) * 100;
          const capaciteRestante = client.revenu - client.charges;

          return (
            <div
              key={client.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-gray-900">{client.prenom} {client.nom}</h4>
                    <p className="text-sm text-gray-500">ID: {client.id}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(client)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{client.statut_professionnel}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{client.anciennete_emploi} ans</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{client.age} ans</span>
                </div>

                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Revenu</span>
                    <span className="text-gray-900">{client.revenu.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Charges</span>
                    <span className="text-gray-900">{client.charges.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Capacité</span>
                    <span className="text-green-600">{capaciteRestante.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>

                <div className="pt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Taux d'endettement</span>
                    <span className={`text-sm ${ratioEndettement > 33 ? 'text-red-600' : 'text-green-600'}`}>
                      {ratioEndettement.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        ratioEndettement > 33 ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(ratioEndettement, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucun client trouvé</p>
        </div>
      )}
    </div>
  );
}