import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { SECTIONS } from "../../config/sections.js";
import { CloseIcon } from "../Icons.jsx";
import styles from "./SideMenu.module.css";

// Menu laterale con tutte le sezioni. Si chiude con Esc, con il pulsante,
// cliccando fuori o scegliendo una voce.
export default function SideMenu({ open, onClose }) {
  const closeButton = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    closeButton.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        id="side-menu"
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="All sections"
        onClick={(event) => event.stopPropagation()}
      >
        <button ref={closeButton} type="button" className="icon-button" aria-label="Close menu" onClick={onClose}>
          <CloseIcon />
        </button>
        <nav aria-label="All sections">
          <ul className={styles.list}>
            <li><Link to="/" onClick={onClose}>Home Page</Link></li>
            {SECTIONS.map((section) => (
              <li key={section.slug}>
                <Link to={`/section/${section.slug}`} onClick={onClose}>{section.label}</Link>
              </li>
            ))}
            <li className={styles.separated}><Link to="/search" onClick={onClose}>Search</Link></li>
            <li><Link to="/saved" onClick={onClose}>Saved Articles</Link></li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
