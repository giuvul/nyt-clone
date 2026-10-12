import { useCallback, useState } from "react";
import { Link, useLocation } from "react-router";
import { useSaved } from "../../store/SavedContext.jsx";
import { formatMastheadDate } from "../../utils/format.js";
import { BookmarkIcon, MenuIcon } from "../Icons.jsx";
import HeaderSearch from "./HeaderSearch.jsx";
import Masthead from "./Masthead.jsx";
import SectionNav from "./SectionNav.jsx";
import SideMenu from "./SideMenu.jsx";
import styles from "./Header.module.css";

// Intestazione: in home testata grande con la data, nelle altre pagine
// una barra compatta con la testata piccola, come sul sito originale.
export default function Header() {
  const { pathname } = useLocation();
  const { saved } = useSaved();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const isHome = pathname === "/";

  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <div className={styles.left}>
          <button
            type="button"
            className="icon-button"
            aria-label="Open sections menu"
            aria-expanded={menuOpen}
            aria-controls="side-menu"
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon />
          </button>
          <HeaderSearch />
        </div>

        {!isHome && <Masthead size="small" />}

        <div className={styles.right}>
          <Link to="/saved" className={styles.saved}>
            <BookmarkIcon size={16} filled={saved.length > 0} />
            <span className={styles.savedLabel}>Saved</span>
            <span className={styles.count} aria-label={`${saved.length} saved articles`}>
              {saved.length}
            </span>
          </Link>
        </div>
      </div>

      {isHome && (
        <div className={`container ${styles.mastheadRow}`}>
          <p className={styles.date}>
            <time dateTime={new Date().toISOString().slice(0, 10)}>{formatMastheadDate(new Date())}</time>
          </p>
          <Masthead size="large" />
          <p className={styles.note}>Unofficial clone · Educational project</p>
        </div>
      )}

      <div className="container">
        <SectionNav />
      </div>

      <SideMenu open={menuOpen} onClose={closeMenu} />
    </header>
  );
}
