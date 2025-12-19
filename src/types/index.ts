export interface Client {
  id: string;
  nom: string;
  prenom: string;
  revenu: number;
  charges: number;
  statut_professionnel: 'CDI' | 'CDD' | 'Indépendant' | 'Retraité' | 'Étudiant';
  anciennete_emploi: number; // en années
  age: number;
  date_creation: string;
}

export interface DemandeCredit {
  id: string;
  id_client: string;
  client_nom: string;
  client_prenom: string;
  montant: number;
  duree: number; // en mois
  objet: string;
  pd: number; // Probabilité de défaut
  decision: 'Accepté' | 'Analyse' | 'Refus';
  date_demande: string;
  score_details: ScoreDetails;
}

export interface ScoreDetails {
  ratio_endettement: number;
  ratio_credit_revenu: number;
  score_statut: number;
  score_anciennete: number;
  score_age: number;
  pd_calculee: number;
}
