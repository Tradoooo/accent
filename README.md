# Accent 🎙️

> **Tu lis une phrase. Elle isole le son exact qui cloche — pas un score vague — et te le fait
> retravailler jusqu'à ce qu'il passe.**

Toutes les apps de langue te donnent **un score**. Un score ne te dit pas **quoi** corriger.
Accent refuse le score : elle travaille **un seul son à la fois**, jusqu'à ce qu'il passe.

- Le score global dit : « 78 % » → l'élève ferme l'app.
- Accent dit : *« ton /θ/ sort comme un /s/. Un seul mot à refaire. »* → l'élève réessaie.

Projet soumis à **IceHacks 2026** (CodeStarters, Devpost).

---

## Le pipeline en 5 étapes

| Étape | Entrée | Sortie | Où ça vit |
|---|---|---|---|
| 1. **Écoute** | micro (MediaRecorder) | PCM mono 16 kHz + contrôle qualité | `src/audio/` |
| 2. **Évalue** | audio + texte attendu | score 0-100 **par phonème** | `src/providers/` |
| 3. **Sélectionne** | liste de scores | **un** phonème cible (pondéré) | `src/engine/selectTarget.ts` |
| 4. **Explique** | phonème cible | paire minimale + signature d'erreur | `src/data/phonemes.ts` (donnée, **zéro appel modèle**) |
| 5. **Entraîne** | phonème cible | 3 phrases contenant ce son | `src/data/training.json` (cache commité, **hors ligne**) |

Budget : **moins de 10 s** de la fin de lecture au diagnostic (`BUDGET_PIPELINE_MS`,
`src/constants.ts`). Orchestration : `executerPipeline()` dans `src/engine/pipeline.ts`.

### Une session, écran par écran

```
Accueil ──▶ Enregistrement ──▶ Analyse ──▶ Diagnostic ──▶ Comparaison
(saisie ou   (3 lectures,       (5 étapes    (UN phonème,   (avant/après
 10 phrases   niveau + aperçu)   nommées)     paire min.)    sur le même son)
 prêtes)                                                        │
                                                                ▼
                                                          Entrainement
                                                          (3 phrases, cache)
```

Machine à états : `src/App.tsx` (8 vues, aucune route, aucun compte).

### Navigateur → proxy → API

```
[Navigateur]                             [Edge]                   [API tierce]
 MediaRecorder → PCM 16 kHz
 Webapp statique (Vite+React)
      │
      │  POST /api/analyse               Proxy (clé cachée,   ── clé ──▶  Azure Speech
      ├─ {texte, langueCible, audioBase64} ─ quota, cache)                 Pronunciation
      │  ← {scores[], provider, quota}                                    Assessment
      │
      ├─ BYOK : si le quota est épuisé, la clé personnelle de l'utilisateur
      │   parle directement au fournisseur (jamais à notre proxy).
      │
      └─ localStorage : profil de sons + sessions (jamais l'audio, RNF-P1)
```

- Contrat client du proxy : `src/providers/proxy.ts` (`POST /api/analyse`,
  `GET /api/phrases`). Le worker edge est commité (`worker/`) et se déploie sur
  Cloudflare Workers (`worker/README.md`).
- Choix du fournisseur et repli : `src/providers/index.ts`
  (`fournisseurSelonReglages` : BYOK Azure → proxy → démo locale ;
  `repliSurDemo` sur erreur proxy, branché dans `src/App.tsx`).
- URL du proxy par défaut : `VITE_PROXY_URL` injectée au build, sinon
  `https://accent-proxy.duello.workers.dev` (worker déployé, clé en secret
  serveur — voir `src/store/settings.ts`).

## Ce que le produit refuse de faire

1. **Jamais de score global.** Un son, à un instant donné. Garanti par un garde CI :
   `ci.yml` échoue si `scoreGlobal|globalScore|noteGlobale|overallScore` apparaît dans `src/`.
2. **Aucun classement, aucune comparaison entre utilisateurs.** La progression ne se mesure
   que contre soi (`src/screens/Profil.tsx`).
3. **L'objectif est d'être compréhensible, pas de paraître natif.**

Et techniquement : aucun compte, aucune base de données, aucun audio conservé (RNF-P1).
Le profil vit dans ton navigateur, exportable et supprimable en un clic
(`toutEffacer()` / `exporterMarkdown()`, `src/store/profile.ts`).

## Design (verrou V1, 2026-11-15)

Système visuel unique, posé en tokens CSS (`src/index.css`) et repris par Tailwind
(`tailwind.config.js`) :

| Règle | Valeur |
|---|---|
| Fond / carte / bord | `#0b0f14` · `#141b23` · `#22303c` |
| **Ambre** = son à travailler | `#f2a33c` (jamais de note globale) |
| **Vert** = acquis, action principale | `#4ec98a` |
| **Rouge** = erreurs système **uniquement** (micro bloqué, échec réseau) | `#e5484d` |
| Typo | sans = Inter/system-ui · mono = JetBrains Mono/ui-monospace (phonèmes, chiffres) |
| Un seul chiffre par écran | le score du son ciblé `/100` ; les autres nombres passent en mots ou en `aria-label` |
| Mouvement | underwriting du titre, phonème héros, count-up — tout coupé par `prefers-reduced-motion` |

L'écran est vérifié à 1440 px et 375 px (aucun défilement horizontal, cibles ≥ 48 px,
texte ≥ 16 px, contraste AA) ; les captures sont dans [`docs/captures/`](docs/captures/)
(Accueil et Diagnostic, 1440 px et 375 px), produites par `tools/capture-locale.mjs`.

## Lancer en local

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # vitest — 386 tests (moteur, pipeline, écrans, garde-fous)
npm run build      # tsc --noEmit + vite build
npm run size       # garde RNF-07 : bundle < 300 Ko gzip (actuellement ~83 Ko)
```

En dev (hors build de production), sans proxy configuré, l'app démarre sur le
**moteur de démonstration local** (`src/providers/demo.ts`) : elle est entièrement
cliquable, et chaque mesure simulée est signalée « simulation » à l'écran — jamais
de bluff. Le badge est visible sur **l'Accueil**
(« Simulation locale · pas de clé de mesure ») **et sur le Diagnostic**
(« Simulation — mode démonstration : mesure simulée, pas une évaluation réelle »).
Le build de production, lui, pointe par défaut sur le worker edge (voir
« Démo publique »).

## Démo publique

**https://tradoooo.github.io/accent/** — GitHub Pages, HTTPS, accessible à tous,
sans compte. Le micro y fonctionne (contexte sécurisé). La mesure publique passe
par le **proxy edge Cloudflare** : la clé Azure Speech reste dans le secret du
worker, **jamais dans le navigateur**, et le quota est borné par IP et par jour.
Si le quota est dépassé ou si le proxy est injoignable, l'app **replie sur son
moteur local de démonstration**, et l'écran affiche le badge « simulation » — le
chiffre affiché n'est alors pas une évaluation réelle. Le mode BYOK reste
disponible dans **Réglages** : la clé personnelle part alors directement chez
Microsoft, jamais chez notre proxy.

## Déployer

| Cible | Usage | Commande |
|---|---|---|
| **GitHub Pages** | URL publique stable, 0 $, aucun compte | `bash tools/deploy/publish-pages.sh` |
| **r630 + tunnel** | démo avec proxy `/api` (clé Azure côté serveur) | `bash tools/deploy/deploy-r630.sh` |
| **Cloudflare Pages + Worker** | production : edge, cache, quota | `worker/README.md` |

```bash
npm run build      # génère dist/ (base './' : racine de domaine ou sous-chemin)
```

Le build utilise `base: './'` : le même `dist/` se publie à la racine d'un domaine
ou sous un sous-chemin (`/accent/` sur Pages). Le micro exige **HTTPS** (ou localhost).

## État d'avancement (honnête)

**Fait et vérifié** (`npx tsc --noEmit` + `npx vitest run` : **386/386**, bundle 82,8 Ko gzip) :

- Pipeline 5 étapes (`src/engine/`) et **deux taxonomies fermées** dans
  `src/data/phonemes.ts` : 15 phonèmes FR→EN (P01..P15) et 9 ES→FR (E01..E09),
  chacune avec signature d'erreur, paires minimales, conseil, difficulté.
- **72 phrases d'entraînement en cache** (45 anglaises + 27 françaises), commitées :
  l'étape 5 ne dépend jamais du réseau (`src/data/training*.json`).
- Fiabilité de la mesure : 3 lectures → médiane, écart > 20 pts → refus
  d'afficher, audio < 1,5 s → « trop court », y compris sur le chemin
  « réessayer » (`src/engine/measure.ts`, `src/engine/selectTarget.ts`).
- **L'incertitude est affichée** : l'étendue observée (min-max des lectures) et un
  avertissement quand elle traverse un seuil de décision — le score est une
  estimation, on le dit (`src/components/FourchetteScore.tsx`).
- **Sons récurrents** (RF-22) : un phonème cible sur ≥ 3 phrases distinctes
  remonte en tête du profil (`sonsRecurrents`, `src/store/profile.ts`).
- **Audio modèle ralenti** (RF-23) : deux moteurs au choix — la voix du
  navigateur (`speechSynthesis`, 0 $, hors ligne, rien ne sort de la machine) ou
  **Eleven Labs** en BYOK (voix multilingue bien plus naturelle ; la voix
  **« Laure »** est sélectionnée automatiquement si elle existe dans le compte).
  Vitesses 0,5× / 0,75× / 1×, zéro fichier audio commité (`src/audio/tts.ts`).
  **Seul le texte part chez Eleven Labs ; l'audio de l'élève, jamais.**
- **Schémas articulatoires** des 24 phonèmes : une coupe sagittale dessinée à partir
  de six paramètres (lieu, langue, lèvres, voile, voisement, souffle) — un seul
  composant pour toute la taxonomie (`src/data/articulation.ts`).
- **Mode perception** : discrimination de paires minimales à l'oreille AVANT la
  production, déterministe et sans note (`src/engine/perception.ts`).
- **Mode oral long** (RF-21) : texte collé, découpé en phrases, guidage phrase par
  phrase, bilan sans aucune moyenne (`src/engine/segments.ts`).
- **Écran « Tes données »** : la confidentialité rendue visible et vérifiable,
  chaque affirmation renvoyant au fichier du dépôt qui la prouve
  (`src/store/privacy.ts`).
- **Chaque étape prouve qu'elle a fonctionné** : un journal de preuves local
  (`src/store/preuves.ts`) affiche, après chaque action, ce qui a été fait, les
  données qui le prouvent (durée, niveau, lectures, médiane, écart) et **où le
  vérifier dans le code**. Le journal est visible dans le profil et joint à
  l'export Markdown.
- **PWA installable et hors ligne** : manifeste à chemins relatifs, service worker
  écrit à la main (jamais d'audio en cache, jamais d'interception de `/api/`),
  icônes générées par `tools/gen-icon.py`.
- **12 écrans** (`src/screens/`) et un hub d'accueil : une phrase, un texte long
  (RF-21), le catalogue des sons, la discrimination auditive, le profil, l'écran
  « Tes données », les réglages BYOK. Aucune fonctionnalité n'est cachée au bout
  d'un parcours — c'est verrouillé par `tests/integration-app.test.tsx`.
- Trois fournisseurs : moteur local de démonstration (signalé « simulation »),
  proxy edge (clé cachée, quota, cache), BYOK Azure Speech (`src/providers/`).
- Proxy déployable : Worker Cloudflare (`worker/`) **et** serveur Node sans
  dépendance (`server/`), une seule logique partagée (`server/lib.mjs`).
- Deux hébergements publics vérifiés : GitHub Pages (URL stable) et le serveur
  r630 derrière un tunnel (`tools/deploy/`).
- CI sur runners GitHub hébergés (`ubuntu-latest`), budget ≤ 5 minutes par job,
  file de merge Mergify, agent Hermes de résolution de conflits sur InferHub,
  garde « aucun score global ».

**Prévu / non implémenté** :

- **Clé Azure du proxy** : le worker a besoin d'une clé Azure Speech (tier gratuit
  F0, 5 h audio/mois) posée comme secret (`wrangler secret put AZURE_SPEECH_KEY`).
  Sans clé, le proxy répond « sans clé » et l'app tourne sur le moteur local en
  le disant à l'écran.
- **Validation go/no-go** sur corpus audio réel (10 mots × 3 lectures, Annexe A) :
  à enregistrer par un francophone.
- **Vidéo ≤ 3 min** : script plan par plan dans `docs/VIDEO-SCRIPT.md`, tournage à faire.
- Troisième paire de langues (EN→ES) : déclarée `pret: false`, l'architecture est
  prête (il manque la table de données).
- Étalonnage des seuils 60/80 sur corpus annoté par des enseignants : les seuils
  actuels sont issus du cahier des charges, pas d'une mesure statistique.

## Documentation

| Fichier | Contenu |
|---|---|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Pipeline réel, seuils, modèle de données, fiabilité de la mesure |
| [`docs/WRITE-UP.md`](docs/WRITE-UP.md) | Write-up Devpost (anglais) — problème, thèse, décisions, échecs |
| [`docs/WRITE-UP.fr.md`](docs/WRITE-UP.fr.md) | Le même write-up en français |
| [`docs/AI-DISCLOSURE.md`](docs/AI-DISCLOSURE.md) | Déclaration obligatoire des outils IA |
| [`docs/VIDEO-SCRIPT.md`](docs/VIDEO-SCRIPT.md) | Script vidéo 3 min, seconde par seconde + plans + matériel |
| [`docs/JUDGES.md`](docs/JUDGES.md) | Critères du concours, profils de juges, stratégie de tracks |
| [`docs/SOUMISSION.md`](docs/SOUMISSION.md) | Checklist de soumission Devpost + conformité + heure limite |
| [`docs/CONFIDENTIALITE.md`](docs/CONFIDENTIALITE.md) | RNF-P1..P5 : les preuves dans le code |

## Développer

- CI : `ci.yml` sur runners GitHub hébergés (`ubuntu-latest`), **budget 5 minutes** par job.
- File de merge : Mergify (`.mergify.yml`), rebase, historique linéaire.
- Gate : `.github/workflows/hermes-lite.yml` (fraîcheur de branche exigée au merge) ;
  les vrais conflits partent à l'agent de résolution (label `hermes/conflit`).
- Une branche = une tâche = un PR ; le merge supprime la branche.
- **Parcours du site déployé** : `node tools/test-site.mjs` rejoue les 12 écrans
  dans un Chromium sur Xvfb (aucune fenêtre visible, aucun focus pris) — ~106
  vérifications, rapport et captures. Détail et pièges : [`tools/TEST-SITE.md`](tools/TEST-SITE.md).

## Licence

MIT — voir [LICENSE](LICENSE).
