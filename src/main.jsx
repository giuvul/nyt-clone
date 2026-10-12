import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "@fontsource-variable/libre-franklin";
import "@fontsource-variable/source-serif-4/opsz.css";
import "./styles/global.css";
import { createNytApi } from "./api/nytApi.js";
import App from "./App.jsx";

// Unico punto in cui si sceglie l'implementazione reale dell'api.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App api={createNytApi()} />
    </BrowserRouter>
  </StrictMode>,
);
