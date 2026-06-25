const FALLBACK_MESSAGES = {
  no_api_key: "Mode démo sans IA — aucune clé Gemini configurée sur ce déploiement.",
  api_overloaded:
    "Gemini est très sollicité en ce moment. Voici un résultat de base généré par règles — réessaie dans une minute pour la version IA complète.",
  parse_error:
    "La réponse de l'IA n'a pas pu être interprétée cette fois. Voici un résultat de base en attendant — retente l'opération.",
};

export function fallbackMessageFor(reason) {
  return FALLBACK_MESSAGES[reason] || FALLBACK_MESSAGES.no_api_key;
}
