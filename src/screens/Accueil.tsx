import type { LangueCible } from '../types';
import { PHRASE_MAX_CAR } from '../constants';
import Entete from '../components/Entete';
import { LANGUES } from '../providers';

/**
 * Écran 1 — Accueil : un champ « Quelle phrase veux-tu travailler ? » et les
 * 10 phrases prêtes. Rien d'autre : ton texte, pas notre programme (§4).
 *
 * Verrou design V1 (Design/accent/HANDOFF.md, couche socle « Veille ») :
 * titre avec souligné dessiné, carte de saisie, badge Simulation, grille 2×2
 * des modes, phrases prêtes en pastilles défilantes, halo + grille en fond.
 */

export interface Props {
  phrase: string;
  phrasesPretes: string[];
  langueCible: LangueCible;
  fournisseur: string;
  onPhrase: (p: string) => void;
  onLangue: (l: LangueCible) => void;
  onDemarrer: () => void;
  onProfil: () => void;
  onReglages: () => void;
  /** Optionnel : ouvre l'écran « Tes données » (RNF-P4/P5). */
  onDonnees?: () => void;
  /** Optionnel : ouvre le mode oral long (RF-21). */
  onOralLong?: () => void;
  /** Optionnel : ouvre le catalogue des sons (perception + entraînement). */
  onCatalogue?: () => void;
}

/** Le badge Simulation ne s'affiche que quand le moteur local tourne. */
function estSimulation(fournisseur: string): boolean {
  return /simul/i.test(fournisseur);
}

export default function Accueil(p: Props) {
  const reste = PHRASE_MAX_CAR - p.phrase.length;
  return (
    <div className="fond-halos mx-auto flex min-h-full w-full max-w-2xl flex-col gap-7 px-4 pb-8 pt-6">
      <Entete onProfil={p.onProfil} onReglages={p.onReglages} />

      <h1 className="text-center text-[31px] font-extrabold leading-tight tracking-tight sm:text-[34px]">
        Elle ne te note pas. Elle te montre{' '}
        <span className="relative inline-block whitespace-nowrap text-aTravailler">
          le son qui cloche
          <svg
            className="absolute -bottom-2 left-0 w-full"
            viewBox="0 0 300 12"
            aria-hidden="true"
            focusable="false"
            preserveAspectRatio="none"
          >
            <path
              className="souligne-trait"
              d="M 4 8 Q 150 2 296 7"
              fill="none"
              stroke="var(--amb)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
        .
      </h1>

      <section className="carte flex flex-col gap-4">
        <h2 className="text-2xl font-semibold leading-snug">Quelle phrase veux-tu travailler ?</h2>
        <p className="text-neutre">
          Celle de ton exposé, de ton entretien, de ton oral. On ne t’entraîne pas sur notre cours :
          on t’entraîne sur <strong className="text-texte">ton texte</strong>.
        </p>
        <label className="flex flex-col gap-2" htmlFor="phrase">
          <span className="etiquette">Ta phrase — 200 caractères max</span>
          <textarea
            id="phrase"
            className="min-h-24 w-full resize-y rounded-[14px] border border-nuit-bord bg-nuit p-4 text-lg
              focus:border-acquis focus:outline-none"
            value={p.phrase}
            maxLength={PHRASE_MAX_CAR}
            lang={p.langueCible}
            onChange={(e) => p.onPhrase(e.target.value)}
          />
          <span className="text-right text-sm text-neutre" aria-live="polite">
            {reste} caractères restants
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="bouton-primaire"
            disabled={p.phrase.trim().length < 3}
            onClick={p.onDemarrer}
          >
            Je la lis à voix haute
          </button>
          <select
            className="min-h-[48px] rounded-[14px] border border-nuit-bord bg-nuit px-3 text-base"
            value={p.langueCible}
            aria-label="Paire de langues"
            onChange={(e) => p.onLangue(e.target.value as LangueCible)}
          >
            {LANGUES.map((l) => (
              <option key={l.code} value={l.code} disabled={!l.pret}>
                {l.label}
                {l.pret ? '' : ' (bientôt)'}
              </option>
            ))}
          </select>
        </div>

        {estSimulation(p.fournisseur) && (
          <p className="badge-simulation self-start" role="status">
            Simulation locale · pas de clé de mesure
          </p>
        )}
        <p className="text-sm text-neutre">Moteur : {p.fournisseur}</p>
      </section>

      {(p.onOralLong || p.onCatalogue) && (
        <section className="flex flex-col gap-3" aria-label="Autres façons de travailler">
          <h2 className="etiquette">Tout ce que tu peux faire ici</h2>
          <ul className="grid grid-cols-2 gap-3">
            <li>
              <ModeCarte
                titre="Une phrase"
                texte="Tu lis, elle isole le son qui cloche."
                onClick={p.onDemarrer}
                ariaLabel="Travailler une phrase"
              />
            </li>
            {p.onOralLong && (
              <li>
                <ModeCarte
                  titre="Un texte long"
                  texte="Exposé, entretien, oral : guidé phrase par phrase."
                  onClick={p.onOralLong}
                  ariaLabel="Travailler un texte long phrase par phrase"
                />
              </li>
            )}
            {p.onCatalogue && (
              <li>
                <ModeCarte
                  titre="Entraîner mon oreille"
                  texte="Les 15 sons et leurs fautes typiques, à discriminer."
                  onClick={p.onCatalogue}
                  ariaLabel="Ouvrir le catalogue des sons"
                />
              </li>
            )}
            <li>
              <ModeCarte
                titre="Mes sons"
                texte="Ce que tu as travaillé, ce qu’il te reste."
                onClick={p.onProfil}
                ariaLabel="Voir mon profil de sons"
              />
            </li>
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-3" aria-label="Phrases prêtes">
        <h2 className="etiquette">Ou pars d’une de ces phrases</h2>
        <ul className="snap-x flex gap-2 overflow-x-auto pb-2">
          {p.phrasesPretes.map((texte) => (
            <li key={texte} className="snap-start shrink-0">
              <button
                type="button"
                onClick={() => p.onPhrase(texte)}
                className="h-full max-w-[320px] whitespace-normal rounded-[14px] border border-nuit-bord
                  bg-nuit-carte px-4 py-3 text-left text-base hover:border-neutre/50"
                lang="en"
              >
                {texte}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {p.onDonnees ? (
        <button type="button" className="bouton-fantome text-sm" onClick={p.onDonnees}>
          Ta voix n’est pas conservée. Elle ne sert qu’à te corriger. — Voir mes données
        </button>
      ) : (
        <p className="text-center text-sm text-neutre">
          Ta voix n’est pas conservée. Elle ne sert qu’à te corriger.
        </p>
      )}
    </div>
  );
}

/** Carte de mode : une entrée visible par fonctionnalité (aucune feature cachée). */
function ModeCarte({
  titre,
  texte,
  onClick,
  ariaLabel,
}: {
  titre: string;
  texte: string;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex min-h-[48px] w-full flex-col items-start gap-1 rounded-[14px] border border-nuit-bord
        bg-nuit-carte px-4 py-3 text-left hover:border-neutre/50"
    >
      <span className="text-base font-semibold">{titre}</span>
      <span className="text-sm text-neutre">{texte}</span>
    </button>
  );
}
