# Mergify sur Tradoooo/accent — réglé et prouvé (2026-11-12)

- Le transfert du dépôt vers l'org **Tradoooo** (2026-11-12) avait **retiré l'app Mergify** :
  l'app était installée sur BaptisteFaisy, l'API rendait 403 sur Tradoooo.
- **Réinstallation à 21 h 09** (installation id 181369355, app_id 10562, cible org Tradoooo,
  non suspendue). D'où une fenêtre où les PR n'étaient plus mergées seules (#47 mergée à la main).
- **Preuve en conditions réelles** : PR #48 (correction doc) → checks « Mergify Merge Queue » et
  « Mergify Merge Protections » publiés, ci + ci-budget verts, **merge par `app/mergify`** à 22 h 24.
- La **merge queue native GitHub n'est pas activée** (`mergeQueue` = null sur Tradoooo/accent) et ce n'est
  pas bloquant : `.mergify.yml` a `merge_protections_settings.auto_merge_conditions: true`, Mergify
  embarque et merge seul. Optionnel : activer la queue native (Settings → General → Merge queue) si on
  veut le batching GitHub en plus.
- `.mergify.yml` survit au transfert ; ruleset `main` (id 27053362) intact : PR obligatoire +
  checks requis `ci` et `ci-budget`.
- Attention : `hermes-lite/verdict` **n'est pas** une condition d'embarquement (gate en dry-run →
  verrouillage mutuel avec la file). Corrigé dans `docs/ARCHITECTURE.md` (PR #48).
