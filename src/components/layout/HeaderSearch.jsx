import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { SearchIcon } from "../Icons.jsx";
import styles from "./HeaderSearch.module.css";

// Lente nella barra in alto: apre un campo di ricerca che porta a /search.
export default function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const input = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className="icon-button"
        aria-label={open ? "Close search" : "Search"}
        aria-expanded={open}
        aria-controls="header-search"
        onClick={() => setOpen((value) => !value)}
      >
        <SearchIcon />
      </button>
      {open && (
        <form id="header-search" role="search" className={styles.form} onSubmit={handleSubmit}>
          <input
            ref={input}
            type="search"
            className={styles.input}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.key === "Escape" && setOpen(false)}
            placeholder="SEARCH"
            aria-label="Search articles"
            maxLength={200}
          />
          <button type="submit" className="button">Go</button>
        </form>
      )}
    </div>
  );
}
