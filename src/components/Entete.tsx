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
      className="flex h-8 w-8 items-center justify-center rounded-none border-[3px] border-nuit-bord bg-[#f2a33c]"
      aria-hidden="true"
    >
      <span className="h-2.5 w-2.5 rounded-full border-2 border-nuit-bord" />
    </span>
  );
}

export default function Entete({ onProfil, onReglages, onAccueil }: Props) {
  return (
    <header className="flex items-center justify-between gap-3 border-b-[3px] border-nuit-bord pb-2">
      <button type="button" className="bouton-fantome gap-3 !border-transparent px-2" onClick={onAccueil} aria-label="Accueil Accent">
        <Logo />
        <span className="flex flex-col items-start leading-tight">
          <span className="text-lg font-bold uppercase tracking-[0.06em]">Accent</span>
          <span className="font-mono text-xs text-neutre">un son à la fois</span>
        </span>
      </button>
      <nav className="flex items-center gap-1" aria-label="Navigation secondaire">
        {onProfil && (
          <button type="button" className="bouton-fantome !border-transparent whitespace-nowrap px-2 text-sm uppercase tracking-[0.06em] underline decoration-[#f2a33c] decoration-[3px] underline-offset-4" onClick={onProfil}>
            Mes sons
          </button>
        )}
        {onReglages && (
          <button type="button" className="bouton-fantome !border-transparent whitespace-nowrap px-2 text-sm uppercase tracking-[0.06em]" onClick={onReglages} aria-label="Réglages">
            Réglages
          </button>
        )}
      </nav>
    </header>
  );
}
