import { Client, ScoreDetails } from '../types';

/**
 * Modèle statistique de calcul de la Probabilité de Défaut (PD)
 * 
 * Le modèle prend en compte plusieurs facteurs pondérés :
 * - Ratio d'endettement (charges/revenu) : 30%
 * - Ratio crédit/revenu : 25%
 * - Statut professionnel : 20%
 * - Ancienneté d'emploi : 15%
 * - Âge du client : 10%
 * 
 * Chaque facteur est normalisé entre 0 et 1, où 1 représente le risque maximum
 */

export function calculerProbabiliteDefaut(
  client: Client,
  montantCredit: number,
  dureeCredit: number
): { pd: number; details: ScoreDetails } {
  
  // 1. Ratio d'endettement : charges/revenu
  const ratioEndettement = client.revenu > 0 ? client.charges / client.revenu : 1;
  const scoreEndettement = Math.min(ratioEndettement / 0.5, 1); // Normalisation : 50% = risque max
  
  // 2. Ratio crédit/revenu annuel
  const mensualiteEstimee = calculerMensualite(montantCredit, dureeCredit);
  const ratioCreditRevenu = client.revenu > 0 ? (mensualiteEstimee * 12) / (client.revenu * 12) : 1;
  const scoreCreditRevenu = Math.min(ratioCreditRevenu / 0.4, 1); // 40% du revenu annuel = risque max
  
  // 3. Score basé sur le statut professionnel
  const scoreStatutMap: Record<Client['statut_professionnel'], number> = {
    'CDI': 0.1,
    'Retraité': 0.2,
    'CDD': 0.5,
    'Indépendant': 0.6,
    'Étudiant': 0.8,
  };
  const scoreStatut = scoreStatutMap[client.statut_professionnel];
  
  // 4. Score basé sur l'ancienneté d'emploi
  const scoreAnciennete = Math.max(1 - (client.anciennete_emploi / 10), 0); // 10 ans = risque min
  
  // 5. Score basé sur l'âge
  let scoreAge: number;
  if (client.age < 25) {
    scoreAge = 0.7; // Jeune = plus risqué
  } else if (client.age >= 25 && client.age <= 55) {
    scoreAge = 0.2; // Âge optimal
  } else {
    scoreAge = 0.4; // Senior
  }
  
  // Calcul de la PD pondérée
  const pd = (
    scoreEndettement * 0.30 +
    scoreCreditRevenu * 0.25 +
    scoreStatut * 0.20 +
    scoreAnciennete * 0.15 +
    scoreAge * 0.10
  );
  
  const details: ScoreDetails = {
    ratio_endettement: ratioEndettement,
    ratio_credit_revenu: ratioCreditRevenu,
    score_statut: scoreStatut,
    score_anciennete: scoreAnciennete,
    score_age: scoreAge,
    pd_calculee: pd,
  };
  
  return { pd: Math.min(Math.max(pd, 0), 1), details };
}

/**
 * Calcule la mensualité d'un crédit (formule d'amortissement)
 */
function calculerMensualite(montant: number, dureeMois: number): number {
  const tauxMensuel = 0.04 / 12; // Taux annuel de 4% (exemple)
  if (tauxMensuel === 0) return montant / dureeMois;
  
  return montant * (tauxMensuel * Math.pow(1 + tauxMensuel, dureeMois)) / 
         (Math.pow(1 + tauxMensuel, dureeMois) - 1);
}

/**
 * Détermine la décision automatique basée sur la PD
 */
export function determinerDecision(pd: number): 'Accepté' | 'Analyse' | 'Refus' {
  if (pd < 0.35) return 'Accepté';
  if (pd >= 0.35 && pd < 0.6) return 'Analyse';
  return 'Refus';
}

/**
 * Formate la PD en pourcentage
 */
export function formaterPD(pd: number): string {
  return `${(pd * 100).toFixed(1)}%`;
}

/**
 * Retourne la couleur associée à une décision
 */
export function getCouleurDecision(decision: 'Accepté' | 'Analyse' | 'Refus'): string {
  switch (decision) {
    case 'Accepté': return 'text-green-600 bg-green-50';
    case 'Analyse': return 'text-orange-600 bg-orange-50';
    case 'Refus': return 'text-red-600 bg-red-50';
  }
}
