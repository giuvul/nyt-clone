// Stato globale delle notizie: una voce per ogni richiesta, identificata da
// una chiave ("topstories/world", "mostpopular/1"...). Tenere le risposte qui
// evita di richiamare l'API quando si torna su una pagina già vista.

export const initialNewsState = {};

export const EMPTY_ENTRY = { status: "idle", data: null, error: null, updatedAt: 0 };

export function newsReducer(state, action) {
  const entry = state[action.key] ?? EMPTY_ENTRY;
  switch (action.type) {
    case "request":
      // I dati precedenti restano visibili mentre arrivano quelli nuovi.
      return { ...state, [action.key]: { ...entry, status: "loading", error: null } };
    case "success":
      return {
        ...state,
        [action.key]: { status: "success", data: action.data, error: null, updatedAt: action.at },
      };
    case "failure":
      return { ...state, [action.key]: { ...entry, status: "error", error: action.error } };
    default:
      return state;
  }
}
