import { Link } from "react-router";
import { SECTIONS } from "../../config/sections.js";
import Masthead from "./Masthead.jsx";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <Masthead size="small" />
        <nav aria-label="Site index" className={styles.index}>
          <h2 className={styles.heading}>Sections</h2>
          <ul className={styles.list}>
            {SECTIONS.map((section) => (
              <li key={section.slug}>
                <Link to={`/section/${section.slug}`}>{section.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.bottom}>
          <a href="https://developer.nytimes.com" target="_blank" rel="noopener noreferrer">
            Data provided by The New York Times
          </a>
          <p>
            Unofficial clone built for a React course. Not affiliated with The New York Times.
            Headlines, summaries and photos belong to their owners and link to nytimes.com.
          </p>
          <p>
            Made by <a href="https://giuseppevulduraro.com/" target="_blank" rel="noopener noreferrer">Giuseppe Vulduraro</a>
            {" · "}
            <a href="https://github.com/giuvul/nyt-clone" target="_blank" rel="noopener noreferrer">Source code</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
