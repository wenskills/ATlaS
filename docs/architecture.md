# Architecture

## Pipeline d'analyse (`POST /api/match`)

1. `pdf_extractor.py` extrait le texte du PDF et detecte les sections standards (regex sur les titres de section).
2. `lexical_matching.py` calcule un score TF-IDF (cosine similarity) et un score BM25 (Okapi BM25, normalise par saturation logistique).
3. `semantic_matching.py` calcule un score SBERT global, et une decomposition phrase par phrase de l'offre face au CV (pour identifier precisement quelles exigences de l'offre ne trouvent pas d'echo dans le CV).
4. `skills_extractor.py` fait correspondre le texte de l'offre et du CV contre une taxonomie de competences (`data/skills_taxonomy.json`), produisant les listes "matched / missing / extra".
5. `scoring.py` agrege ces signaux en un score composite pondere, et calcule un score de parseabilite a partir des sections detectees + presence d'email/telephone.

## Pipeline RAG (`POST /api/advisor`)

1. Le pipeline d'analyse ci-dessus est relance pour obtenir les ecarts reels (competences manquantes, scores).
2. `knowledge_base.py` encode une requete construite a partir de ces ecarts, et recupere (cosine similarity sur embeddings SBERT) les notices les plus pertinentes dans `data/recruiter_knowledge_base.json` — c'est l'etape de **retrieval**.
3. `rag_advisor.py` construit un prompt combinant : extrait de l'offre, extrait du CV, scores calcules, et notices recuperees, puis appelle l'API Gemini pour generer un plan d'amelioration structure en JSON — c'est l'etape de **generation**.
4. Si `GEMINI_API_KEY` n'est pas configuree, un plan de repli base sur des regles deterministes est genere a la place (memes donnees d'entree, logique simplifiee), pour que la demo reste utilisable sans cout d'API.

## Pourquoi BM25 en plus du TF-IDF

Le TF-IDF + cosine similarity de la v1 du POC est simple mais peu representatif des moteurs de recherche/ATS reels. BM25 (variante Okapi) est l'algorithme de scoring de pertinence utilise par Elasticsearch/Lucene, qui sous-tend une partie des moteurs de recherche de CV du marche. Le score final retient le maximum des deux pour ne pas penaliser un CV bien classe par l'un des deux algorithmes.

## Pourquoi une taxonomie plutot qu'un NER

Un modele de reconnaissance d'entites nommees (NER) entraine pour extraire des competences serait plus flexible, mais demanderait un jeu de donnees annote et une infrastructure d'entrainement hors de portee d'un POC. Le matching par taxonomie reproduit fidelement le comportement des moteurs de mots-cles utilises par la majorite des ATS du marche, qui fonctionnent eux-memes sur des referentiels de competences predefinis plutot que sur du NLP complexe.
