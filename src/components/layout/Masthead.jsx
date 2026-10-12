import { Link } from "react-router";
import styles from "./Masthead.module.css";

// La testata in caratteri gotici (font Chomsky, licenza OFL).
export default function Masthead({ size = "large", as: Tag = "p" }) {
  return (
    <Tag className={`${styles.masthead} ${styles[size]}`}>
      <Link to="/" aria-label="The New York Times clone, home page">
        The New York Times
      </Link>
    </Tag>
  );
}
