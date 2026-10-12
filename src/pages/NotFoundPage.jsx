import { Link } from "react-router";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import styles from "./SimplePage.module.css";

export default function NotFoundPage() {
  useDocumentTitle("Page not found");
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.lead}>We can’t find the page you’re looking for.</p>
      <Link to="/" className="button">Go to the home page</Link>
    </div>
  );
}
