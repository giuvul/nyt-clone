import { NavLink } from "react-router";
import { findSectionBySlug, NAV_SLUGS } from "../../config/sections.js";
import styles from "./SectionNav.module.css";

const NAV_SECTIONS = NAV_SLUGS.map(findSectionBySlug);

// Barra delle sezioni sotto la testata, visibile da desktop.
export default function SectionNav() {
  return (
    <nav className={styles.nav} aria-label="Sections">
      <ul className={styles.list}>
        {NAV_SECTIONS.map((section) => (
          <li key={section.slug}>
            <NavLink
              to={`/section/${section.slug}`}
              className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
            >
              {section.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
