import { articulationPour } from '../data/articulation';
import type { CodePhoneme } from '../types';

/**
 * Les six paramètres articulatoires du son cible, lus dans `src/data/articulation.ts`
 * (verrou V1, couche Miroir). Aucun libellé inventé : les valeurs sont celles des
 * types du modèle (lieu, forme des lèvres) ou oui/non pour les booléens.
 */

const LIEUX: Record<string, string> = {
  levres: 'lèvres',
  dents: 'dents',
  alveoles: 'alvéoles',
  palais: 'palais',
  voile: 'voile',
  glotte: 'gorge',
};

const LEVRES: Record<string, string> = {
  ouvertes: 'ouvertes',
  arrondies: 'arrondies',
  etirees: 'étirées',
  serrees: 'serrées',
  'dents-levre': 'dents-lèvre',
  projetees: 'projetées',
};

const OUI = 'oui';
const NON = 'non';

function accentuer(v: string | undefined, brut: string): string {
  return v ?? brut;
}

export default function ParametresArticulatoires({ code }: { code: CodePhoneme }) {
  const a = articulationPour(code);
  if (!a) return null;

  const lignes: Array<{ label: string; valeur: string }> = [
    { label: 'lieu', valeur: accentuer(LIEUX[a.lieu], a.lieu) },
    { label: 'langue', valeur: `pointe ${a.pointeLangue.toFixed(1)}/1 · dos ${a.dosLangue.toFixed(1)}/1` },
    { label: 'lèvres', valeur: accentuer(LEVRES[a.levres], a.levres) },
    { label: 'voile', valeur: a.nasal ? 'ouvert (air par le nez)' : 'fermé' },
    { label: 'voix', valeur: a.voise ? 'gorge en vibration' : 'gorge muette' },
    { label: 'souffle', valeur: a.souffle ? OUI : NON },
  ];

  return (
    <ul
      className="grid w-full grid-cols-2 gap-x-6 gap-y-1 text-left"
      aria-label={`Paramètres articulatoires du son /${code}/`}
    >
      {lignes.map((l) => (
        <li
          key={l.label}
          className="flex items-baseline justify-between gap-2 border-b border-white/5 py-1"
        >
          <span className="text-[12.5px] text-neutre">{l.label}</span>
          <span className="text-[12.5px] text-texte">{l.valeur}</span>
        </li>
      ))}
    </ul>
  );
}
