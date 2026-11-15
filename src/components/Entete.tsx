/**
 * Entête minimal : le produit n'affiche aucun score global, aucun streak,
 * aucune flamme (ACCENT.md §21). Deux accès seulement : profil et réglages.
 */

export interface Props {
  onProfil?: () => void;
  onReglages?: () => void;
  onAccueil?: () => void;
}

/** Logo carré : la pastille du son (ambre), une seule, jamais une note. */
function Logo() {
  return (
    <span
      className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-nuit-bord2 bg-nuit-carte"
      aria-hidden="true"
    >
      <span className="h-2.5 w-2.5 rounded-full border-2 border-aTravailler" />
    </span>
  );
}

export default function Entete({ onProfil, onReglages, onAccueil }: Props) {
  return (
    <header className="flex items-center justify-between gap-3">
      <button type="button" className="bouton-fantome gap-3 !border-transparent px-2" onClick={onAccueil} aria-label="Accueil Accent">
        <Logo />
        <span className="flex flex-col items-start leading-tight">
          <span className="text-lg font-bold tracking-tight">Accent</span>
          <span className="text-xs text-neutre">un son à la fois</span>
        </span>
      </button>
      <nav className="flex items-center gap-1" aria-label="Navigation secondaire">
        {onProfil && (
          <button type="button" className="bouton-fantome" onClick={onProfil}>
            Mes sons
          </button>
        )}
        {onReglages && (
          <button type="button" className="bouton-fantome" onClick={onReglages} aria-label="Réglages">
            Réglages
          </button>
        )}
      </nav>
    </header>
  );
}
