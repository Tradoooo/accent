import type { LangueCible } from '../types';
import { LECTURES_REFERENCE } from '../constants';

/**
 * Réglages locaux (écran 8). Jamais de serveur : tout vit dans le navigateur.
 * La clé BYOK est stockée en localStorage et n'est envoyée qu'au fournisseur
 * choisi — jamais à notre proxy (ACCENT.md §18.3).
 */

/** Moteur de la voix modèle : le navigateur (0 $, hors ligne) ou Eleven Labs (BYOK). */
export type MoteurTts = 'navigateur' | 'eleven';

export interface Reglages {
  /** Base du proxy edge. Vide = même origine (`/api/analyse`). */
  urlProxy: string;
  jetonProxy?: string;
  /** Mode BYOK : clé Azure Speech de l'utilisateur. */
  cleAzure: string;
  regionAzure: string;
  langueCible: LangueCible;
  /** 3 lectures pour conclure, 1 en mode essai rapide (§18.4). */
  lectures: number;
  consentementAffiche: boolean;
  /** Moteur de la voix modèle (RF-23). */
  moteurTts: MoteurTts;
  /** Mode BYOK : clé Eleven Labs (jamais envoyée à notre proxy). */
  cleEleven: string;
  /** Identifiant de voix Eleven Labs (par défaut : Rachel, multilingue). */
  voixEleven: string;
}

const CLE = 'accent.reglages.v1';

/**
 * URL du proxy de mesure par défaut. Deux sources, dans l'ordre :
 *   1. `VITE_PROXY_URL`, injectée au build (CI Pages) ;
 *   2. le worker accent-proxy déployé (compte du porteur du projet).
 * En dev et en test, aucune URL par défaut : le moteur local sert de témoin.
 * La clé Azure reste côté serveur : le bundle ne contient qu'une URL publique.
 */
export const URL_PROXY_DEFAUT = 'https://accent-proxy.duello.workers.dev';

export function resoudreUrlProxy(valeurEnv: string | undefined, production: boolean): string {
  if (valeurEnv) return valeurEnv;
  return production ? URL_PROXY_DEFAUT : '';
}

export const REGLAGES_DEFAUT: Reglages = {
  urlProxy: resoudreUrlProxy(import.meta.env.VITE_PROXY_URL, import.meta.env.PROD),
  cleAzure: '',
  regionAzure: 'westeurope',
  langueCible: 'en',
  lectures: LECTURES_REFERENCE,
  consentementAffiche: false,
  moteurTts: 'navigateur',
  cleEleven: '',
  voixEleven: '21m00Tcm4TlvDq8ikWAM',
};

export function chargerReglages(): Reglages {
  try {
    const brut = localStorage.getItem(CLE);
    if (!brut) return { ...REGLAGES_DEFAUT };
    return { ...REGLAGES_DEFAUT, ...(JSON.parse(brut) as Partial<Reglages>) };
  } catch {
    return { ...REGLAGES_DEFAUT };
  }
}

export function enregistrerReglages(r: Reglages): void {
  localStorage.setItem(CLE, JSON.stringify(r));
}

/** Efface aussi la clé BYOK : suppression en un clic (RNF-P4). */
export function effacerReglages(): void {
  localStorage.removeItem(CLE);
}
