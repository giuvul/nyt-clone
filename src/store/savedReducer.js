// Articoli salvati per leggerli dopo: l'elenco più recente è in cima.

export const MAX_SAVED = 100;

export function savedReducer(state, action) {
  switch (action.type) {
    case "toggle": {
      const exists = state.some((article) => article.id === action.article.id);
      if (exists) return state.filter((article) => article.id !== action.article.id);
      return [{ ...action.article, savedAt: action.at }, ...state].slice(0, MAX_SAVED);
    }
    case "remove":
      return state.filter((article) => article.id !== action.id);
    case "clear":
      return [];
    default:
      return state;
  }
}

// Legge l'elenco salvato; se i dati sono assenti o corrotti riparte vuoto.
export function parseSaved(json) {
  try {
    const list = JSON.parse(json);
    return Array.isArray(list) ? list.filter((item) => item?.id && item?.url && item?.title) : [];
  } catch {
    return [];
  }
}
