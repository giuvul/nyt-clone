import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { parseSaved, savedReducer } from "./savedReducer.js";

const STORAGE_KEY = "nyt-clone:saved";

const SavedContext = createContext(null);

// localStorage può mancare o essere bloccato (navigazione privata): in quel
// caso i salvataggi restano validi per la sessione corrente.
function readStorage(storage) {
  try {
    return parseSaved(storage?.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function defaultStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function SavedProvider({ children, storage = defaultStorage() }) {
  const [saved, dispatch] = useReducer(savedReducer, storage, readStorage);

  useEffect(() => {
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      // spazio esaurito o storage bloccato: niente da fare
    }
  }, [saved, storage]);

  const isSaved = useCallback((id) => saved.some((article) => article.id === id), [saved]);
  const toggle = useCallback((article) => dispatch({ type: "toggle", article, at: Date.now() }), []);
  const remove = useCallback((id) => dispatch({ type: "remove", id }), []);
  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  const value = useMemo(
    () => ({ saved, isSaved, toggle, remove, clear }),
    [saved, isSaved, toggle, remove, clear],
  );
  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved() {
  const context = useContext(SavedContext);
  if (!context) throw new Error("useSaved must be used inside <SavedProvider>");
  return context;
}
