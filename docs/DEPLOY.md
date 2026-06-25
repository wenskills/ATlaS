# Deploiement (gratuit)

Je ne peux pas deployer a ta place (pas d'acces a tes comptes), mais voici la procedure exacte. Compte environ 15-20 minutes.

## 1. Pousser le code sur GitHub

```bash
cd atlas-v2
git init
git add .
git commit -m "ATlaS v2 : matching ATS + conseiller IA RAG"
git branch -M main
git remote add origin https://github.com/<ton-pseudo>/atlas-v2.git
git push -u origin main
```

## 2. Backend sur Render (gratuit)

1. Va sur [render.com](https://render.com) et connecte ton compte GitHub.
2. "New +" → "Web Service" → selectionne le repo `atlas-v2`.
3. Render detecte automatiquement `render.yaml`. Verifie :
   - **Root directory** : laisser vide (le `dockerContext` dans `render.yaml` gere le chemin).
   - **Plan** : Free.
4. Renseigne les variables d'environnement demandees (`sync: false` dans `render.yaml`) :
   - `GEMINI_API_KEY` : ta cle API Gemini (gratuite sur aistudio.google.com) (optionnelle — sans elle, le conseiller IA fonctionne en mode degrade).
   - `CORS_ORIGINS` : laisse vide pour l'instant, tu la completeras a l'etape 4 avec l'URL Vercel.
5. Deploy. Note l'URL generee (ex: `https://atlas-api.onrender.com`).

Le plan gratuit de Render met le service en veille apres inactivite : le premier appel apres une pause peut prendre ~30s (cold start), c'est normal et attendu pour un service gratuit.

## 3. Frontend sur Vercel (gratuit)

1. Va sur [vercel.com](https://vercel.com), connecte ton compte GitHub.
2. "Add New" → "Project" → selectionne le repo `atlas-v2`.
3. **Root directory** : `frontend`.
4. Framework preset : Vite (detecte automatiquement).
5. Variable d'environnement : `VITE_API_URL` = l'URL Render obtenue a l'etape 2 (ex: `https://atlas-api.onrender.com`).
6. Deploy. Note l'URL generee (ex: `https://atlas-v2.vercel.app`).

## 4. Boucler les CORS

Retourne sur Render → ton service → Environment → mets a jour `CORS_ORIGINS` avec l'URL Vercel exacte (ex: `https://atlas-v2.vercel.app`), sans slash final. Redeploie.

## 5. Verifier

Ouvre l'URL Vercel, lance une analyse avec une offre + un CV de test (pas un de tes vrais CV personnels si la demo est publique). Verifie `/health` sur l'URL Render pour confirmer que l'API repond.

## A mettre dans ton CV / LinkedIn

> ATlaS — moteur de matching CV/offre inspire des ATS RH (BM25, SBERT) avec conseiller IA base sur du RAG (Gemini API). Backend FastAPI, frontend React, deploiement Docker.
> Demo : <ton URL Vercel> — Code : <ton URL GitHub>
