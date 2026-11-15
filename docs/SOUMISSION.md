# Soumission Devpost — checklist et conformité

> Note interne de pilotage. État vérifié dans le dépôt le **2026-11-11**
> (branche `main`, commit `ecf0630` + dossier `docs/`). Ce qui dépend d'un humain
> (formulaire, vidéo uploadée, éligibilité) reste **en attente** — ne pas cocher avant.

## Heure limite exacte

| Repère | Heure |
|---|---|
| **Deadline officielle** | dimanche **15 nov 2026, 18h00 PT** |
| Équivalent heure de Paris | **lundi 16 nov 2026, 03h00** (CET, UTC+1) |
| **Cible avec 6 h de marge** | dimanche 15 nov, **12h00 PT = 21h00 Paris** |

⚠️ Les soumissions en retard ne sont pas acceptées. Ne pas viser la dernière heure.
Tout ce qui peut être fait avant le 15 nov (repo, docs, vidéo, brouillon du
formulaire) est fait avant.

## Checklist Devpost (§26) — case par case

### Éléments obligatoires

- [ ] **Vidéo démo** : lien public YouTube/Vimeo, ≤ 3 min, projet **en fonctionnement**.
      → *En attente (humain)*. Script : `docs/VIDEO-SCRIPT.md`. Tournage prévu J3.
      Après upload : **tester le lien en navigation privée** depuis un autre appareil.
      Sans lien fonctionnel = projet non jugé.
- [x] **Write-up** : ce que ça fait, comment c'est construit, difficultés,
      apprentissages, suite.
      → *Fait* : `docs/WRITE-UP.md` (anglais, à coller dans le formulaire) +
      `docs/WRITE-UP.fr.md`. Le plan suit la section 11 du cahier des charges ;
      inclut tableau concurrentiel et échecs/contournements.
- [x] **Code** : repo GitHub public.
      → *Fait* : `github.com/Tradoooo/accent` (public), README complet avec
      pipeline, schéma, état d'avancement honnête, liens `docs/`.
- [x] **Lien live** : URL de démo publique HTTPS.
      → *Fait* : **https://tradoooo.github.io/accent/** (GitHub Pages, branche
      `gh-pages`, HTTPS, accessible sans compte). Repo **et** live : les deux sont
      prêts, critère du track Deployed couvert. Sur Pages il n'y a pas de proxy :
      l'app bascule sur son moteur local, **signalé « simulation » à l'écran**, et
      le mode BYOK permet à un juge de brancher sa propre clé Azure. Republier :
      `bash tools/deploy/publish-pages.sh`.
- [x] **Built with** : liste prête à coller dans le formulaire.
      → TypeScript, React 18, Vite 5, Tailwind CSS 3, Vitest 2, MediaRecorder + Web
      Audio API, Azure Speech Pronunciation Assessment (via proxy / BYOK), Cloudflare
      Pages + Worker (prévu), GitHub Actions (`ubuntu-latest`), Mergify. Outils IA :
      voir `docs/AI-DISCLOSURE.md` (section « Built with » du formulaire : y reporter
      les agents IA d'assistance au code).
- [ ] **Tracks** : Best AI Hack, Best Deployed / Shipped App, Best Design & UX, Overall.
      → *En attente (formulaire)*. Justification : `docs/JUDGES.md` §3. **Ne pas
      cocher Momen** (réservé aux projets construits sur Momen, no-code).
      Rappel : cocher large ne coûte rien ; un projet ne gagne qu'un track (le plus élevé).
- [ ] **Équipe** : 1 à 4 membres, tous inscrits à IceHacks, une seule équipe par personne.
      → *En attente (humain)* : projet solo (Baptiste Faisy) ; vérifier l'inscription
      IceHacks du compte Devpost.
- [x] **Déclaration IA** (exigence des règles, reprise par le formulaire).
      → *Fait* : `docs/AI-DISCLOSURE.md` — distingue API produit, LLM + cache des
      phrases d'entraînement, agents de codage, agent de conflits de merge.

### Critères d'acceptation internes (§25) — état réel

- [x] Build vert : `npx tsc --noEmit` OK, `npx vitest run` **386/386** (vérifié le 2026-11-15)
- [x] Bundle < 300 Ko gzip : **82,8 Ko** mesurés (`npm run size`)
- [x] CI verte sur `ubuntu-latest` (runners GitHub hébergés), budget ≤ 5 min par job
- [x] Pages à jour : build de `2670349`, aucun changement de `src/` depuis (vérifié le 2026-11-15)
- [x] Aucun score global dans l'UI ni les types (garde grep en CI, `ci.yml`)
- [x] Cas « rien à corriger » : état `rien_a_corriger` implémenté **et testé** (RNF-04)
- [x] Écart > 20 pts → « mesure instable », pas un chiffre : implémenté **et testé** (RNF-11)
- [x] 3 phrases d'entraînement même hors ligne : cache commité + repli local
      (⚠️ cache complet 3/15 codes — le repli couvre les 12 autres, phrases génériques)
- [x] Audio jamais conservé : vérifiable dans le code (`docs/CONFIDENTIALITE.md`)
- [x] Mode BYOK fonctionnel dans le code (`src/providers/azure.ts` + `Reglages.tsx`)
- [ ] Diagnostic < 10 s **avec mesure réelle** : à chronométrer une fois le proxy
      déployé (le pipeline est chronométré : `msTotal`, `pipeline.ts`)
- [ ] Corpus go/no-go : ≥ 8/10 mots avec le bon phonème identifié — **à enregistrer
      et tester** (Annexe A du cahier des charges)
- [x] URL publique HTTPS avec micro (desktop vérifié en navigateur) — reste le test **mobile réel** (téléphone, autorisation micro) : humain
- [ ] Vidéo ≤ 3 min en ligne — *en attente tournage/upload*

## Contraintes de conformité (§12) — non négociables

| Règle officielle | Conséquence pour nous | État |
|---|---|---|
| « Each participant may join only one team and contribute to **one competing submission** » | **Une seule soumission** : Accent. Pas de second projet (Raturé/Geste restent des plans de secours non soumis). | ✅ à garantir au dépôt du formulaire |
| « All work must be started during the hackathon » / « building upon pre-written application code is prohibited » | Code 100 % neuf à partir du 8 nov. Historique du dépôt : initialisé et commité le **2026-11-11**, dans la fenêtre du concours (`git log`). | ✅ vérifiable |
| « Previously developed projects may not be submitted » | Aucune base préexistante réutilisée. | ✅ |
| « AI tools are permitted… must disclose significant AI-generated contributions » | Déclaration complète : `docs/AI-DISCLOSURE.md`. | ✅ fait |
| Vidéo démo publique ≤ 3 min | Sans lien fonctionnel = non jugé. | ⏳ J3 |
| Repo GitHub public **ou** lien live | Faire **les deux** (critère du track Deployed). | repo ✅ / live ✅ (Pages) |
| Éligibilité 13+, lycéens/étudiants, pros exclus | **À vérifier avant d'investir** — en cas de doute, contacter le hackathon manager (page Devpost ou Discord IceHacks, §27). | ⏳ humain |

## Ordre d'exécution recommandé (J3 → J4)

1. **J3** : tournage vidéo (plans 7-8 d'abord) → déploiement front (Pages) → test
   mobile + desktop → upload vidéo en non répertorié → test navigation privée.
2. **J4 matin** : corpus go/no-go (si proxy opérationnel) → relecture write-up →
   pré-remplissage du formulaire (tracks, built with, liens).
3. **J4, avant 12h PT (21h Paris)** : soumettre. Puis revérifier que la vidéo se lance
   et que l'URL live répond, du 15 au 17 nov (RNF-08 : disponibilité 24h/24 pendant
   le jugement — le mode démo + BYOK couvrent une panne de quota).

---

# Brouillon du formulaire Devpost (à copier-coller)

> État : prêt à coller, **non soumis**. Les champs entre `[ ]` sont à compléter par
> Baptiste (vidéo, puis clic « Submit »). Aucune soumission automatique n'est faite
> par un agent.

## Nom du projet

```
Accent
```

## Tagline (une ligne)

```
It doesn't grade you. It names the sound that's off — one phoneme at a time.
```

## Description courte (accroche pour la carte projet)

```
Language apps give you a score. A score doesn't tell you what to fix. Accent listens
to one sentence, isolates the exact phoneme that fails, shows a minimal pair
(think → sink), and drills that single sound until it passes. No global score, no
leaderboard, no account, no audio stored.
```

## Description longue (write-up — coller `docs/WRITE-UP.md`, 14 Ko, anglais)

Sections : 1. The problem · 2. The thesis · 3. What we built · 4. Design decisions ·
5. Technical architecture · 6. What failed · 7. What we learned · 8. What's next ·
9. Honest limitations · 10. Try it yourself.

Le write-up couvre déjà les cinq critères de jugement (Technical Execution,
Creativity & Originality, Impact & Usefulness, Design & User Experience,
Presentation) et la conformité « AI contributions must be disclosed ».

## Built with

```
TypeScript, React 18, Vite 5, Tailwind CSS 3, Vitest 2, MediaRecorder + Web Audio API,
Azure Speech Pronunciation Assessment (via server-side proxy or BYOK), Cloudflare
Workers (proxy), GitHub Actions, Mergify
AI tools used: Claude (Opus — ideation, design direction, write-up review),
Claude (Fable — design boards / video script), opencode (implementation, tests,
CI, docs), GitHub Copilot (occasional snippets). Full disclosure:
https://github.com/Tradoooo/accent/blob/main/docs/AI-DISCLOSURE.md
```

## Tracks

À cocher : **Best AI Hack** · **Best Deployed / Shipped App** · **Best Design & UX** ·
**Overall Winner**.
À NE PAS cocher : *Momen* (réservé aux projets no-code Momen) · *Hardware* (aucune pièce
 physique). Justification : `docs/JUDGES.md` §3.

## Liens

| Champ | Valeur |
|---|---|
| Repository | https://github.com/Tradoooo/accent |
| Live demo (try it out) | https://tradoooo.github.io/accent/ |
| Video | `[LIEN YOUTUBE PUBLIC ≤ 3 min — à<uploader par Baptiste]` |
| Other | `docs/WRITE-UP.md`, `docs/AI-DISCLOSURE.md`, `docs/ARCHITECTURE.md` |

## À dire dans le champ libre / autres

```
Single-person team (Baptiste Faisy). 100% built during the hacking period (repo
initialised 11/11/2026 — see git log). No account, no database, no audio stored:
the app says so on screen and every claim points to the file in the repo that
proves it (docs/CONFIDENTIALITE.md). The public demo runs on a local, clearly
labelled "simulation" engine; bring your own Azure Speech key (Réglages → BYOK)
for a real measurement. Only the text of the model audio ever leaves the device
when using the ElevenLabs voice.
```

## Checklist finale avant de cliquer « Submit »

- [ ] Vidéo YouTube **publique**, ≤ 3 min, projet **en fonctionnement** (testée en navigation privée).
- [ ] « Join hackathon » fait pour le compte Devpost de Baptiste ; équipe de 1 (Baptiste seul).
- [ ] Éligibilité vérifiée (13+, étudiant, hors professionnel).
- [ ] Une seule soumission pour cette personne (Accent) ; Raturé/Errata n'est pas soumis.
- [ ] Repo public + lien live testés (le lien live doit charger la démo).
- [ ] Description, built with, tracks et liens collés ci-dessus.
- [ ] Soumission **avant le 15/11 18:00 PT = 16/11 03:00 Paris** (cible 21:00 Paris).
