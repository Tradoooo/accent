/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Verrou design V7 « Riso » (Design/accent/HANDOFF.md [Claude] VERROU V7) :
        // papier + encre, deux encres produit. Les noms de tokens sont gardés
        // (nuit/carte/bord…) pour que tous les écrans basculent d'un coup ; leurs
        // valeurs sont maintenant claires. Contraste AA vérifié sur papier.
        nuit: {
          DEFAULT: '#f4efe4', // papier (fond)
          carte: '#fbf8f1', // papier clair (cadres, champs)
          bord: '#1d2a24', // encre (filets, contours)
          bord2: '#55615a', // encre 2
        },
        carte2: '#ebe4d4',
        // Son à travailler : ambre. DEFAULT = ambre « texte » (AA sur papier) ;
        // `vif` = l'encre ambre pour les aplats, trames et grands glyphes.
        // Jamais de rouge pour un son à travailler (ACCENT.md §21).
        aTravailler: {
          DEFAULT: '#8a5200',
          doux: '#fbe3bd',
          vif: '#f2a33c',
        },
        // Acquis : DEFAULT = vert « texte » (AA) ; `vif` = l'encre verte (aplat
        // du bouton d'action).
        acquis: {
          DEFAULT: '#1f7a4c',
          doux: '#d7efe0',
          vif: '#3fbf7f',
        },
        neutre: {
          DEFAULT: '#55615a',
          doux: '#ebe4d4',
        },
        // Rouge réservé aux erreurs système.
        erreur: {
          DEFAULT: '#b42318',
          doux: '#fde4e1',
        },
        texte: '#1d2a24',
      },
      fontSize: {
        // Texte courant ≥ 16 px (RNF-06).
        base: ['16px', '24px'],
        phoneme: ['clamp(48px, 14vw, 96px)', '1'],
        // Échelle du verrou design V1.
        phrase: ['19px', '28px'],
        chiffre: ['34px', '1'],
        ligne: ['15.5px', '22px'],
      },
      minHeight: {
        tactile: '48px',
      },
      minWidth: {
        tactile: '48px',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
