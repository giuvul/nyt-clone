import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import Footer from "./Footer.jsx";
import Header from "./Header.jsx";

// Struttura comune a tutte le pagine: intestazione, contenuto e piè di pagina.
export default function Layout() {
  const { pathname } = useLocation();

  // Cambiando pagina si riparte dall'alto.
  useEffect(() => {
    window.scrollTo?.(0, 0);
  }, [pathname]);

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Header />
      <main id="main" className="container" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
