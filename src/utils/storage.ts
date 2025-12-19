import { Client, DemandeCredit } from '../types';

const CLIENTS_KEY = 'credit_risk_clients';
const DEMANDES_KEY = 'credit_risk_demandes';

// Clients de test initiaux
const initialClients: Client[] = [
  {
    id: '1',
    nom: 'Moumgo',
    prenom: 'Jean',
    revenu: 750000,
    charges: 250000,
    statut_professionnel: 'CDI',
    anciennete_emploi: 5,
    age: 35,
    date_creation: new Date('2024-01-15').toISOString(),
  },
  {
    id: '2',
    nom: 'Kenfack',
    prenom: 'Paul',
    revenu: 1000000,
    charges: 350000,
    statut_professionnel: 'CDI',
    anciennete_emploi: 8,
    age: 42,
    date_creation: new Date('2024-02-10').toISOString(),
  },
  {
    id: '3',
    nom: 'Beguom',
    prenom: 'Tony',
    revenu: 200000,
    charges: 120000,
    statut_professionnel: 'CDD',
    anciennete_emploi: 2,
    age: 28,
    date_creation: new Date('2024-03-05').toISOString(),
  },
  {
    id: '4',
    nom: 'Ngom',
    prenom: 'Victoire',
    revenu: 1200000,
    charges: 400000,
    statut_professionnel: 'Indépendant',
    anciennete_emploi: 10,
    age: 45,
    date_creation: new Date('2024-01-20').toISOString(),
  },
  {
    id: '5',
    nom: 'Maboue',
    prenom: 'Pauline',
    revenu: 500000,
    charges: 180000,
    statut_professionnel: 'Retraité',
    anciennete_emploi: 0,
    age: 68,
    date_creation: new Date('2024-02-28').toISOString(),
  },
];

// Initialiser les données si elles n'existent pas
function initializeStorage() {
  if (!localStorage.getItem(CLIENTS_KEY)) {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(initialClients));
  }
  if (!localStorage.getItem(DEMANDES_KEY)) {
    localStorage.setItem(DEMANDES_KEY, JSON.stringify([]));
  }
}

// Clients
export function getClients(): Client[] {
  initializeStorage();
  const data = localStorage.getItem(CLIENTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getClientById(id: string): Client | undefined {
  const clients = getClients();
  return clients.find(c => c.id === id);
}

export function saveClient(client: Client): void {
  const clients = getClients();
  const existingIndex = clients.findIndex(c => c.id === client.id);
  
  if (existingIndex >= 0) {
    clients[existingIndex] = client;
  } else {
    clients.push(client);
  }
  
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
}

export function deleteClient(id: string): void {
  const clients = getClients();
  const filtered = clients.filter(c => c.id !== id);
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(filtered));
}

// Demandes de crédit
export function getDemandes(): DemandeCredit[] {
  initializeStorage();
  const data = localStorage.getItem(DEMANDES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveDemande(demande: DemandeCredit): void {
  const demandes = getDemandes();
  demandes.push(demande);
  localStorage.setItem(DEMANDES_KEY, JSON.stringify(demandes));
}

export function getDemandesByClient(clientId: string): DemandeCredit[] {
  const demandes = getDemandes();
  return demandes.filter(d => d.id_client === clientId);
}

// Statistiques
export function getStatistiques() {
  const clients = getClients();
  const demandes = getDemandes();
  
  const acceptees = demandes.filter(d => d.decision === 'Accepté').length;
  const analyse = demandes.filter(d => d.decision === 'Analyse').length;
  const refusees = demandes.filter(d => d.decision === 'Refus').length;
  
  const montantTotal = demandes
    .filter(d => d.decision === 'Accepté')
    .reduce((sum, d) => sum + d.montant, 0);
  
  const pdMoyenne = demandes.length > 0
    ? demandes.reduce((sum, d) => sum + d.pd, 0) / demandes.length
    : 0;
  
  return {
    nombreClients: clients.length,
    nombreDemandes: demandes.length,
    acceptees,
    analyse,
    refusees,
    montantTotal,
    pdMoyenne,
  };
}