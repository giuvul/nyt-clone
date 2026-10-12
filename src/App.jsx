import { Route, Routes } from "react-router";
import Layout from "./components/layout/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import SavedPage from "./pages/SavedPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import SectionPage from "./pages/SectionPage.jsx";
import { NewsProvider } from "./store/NewsContext.jsx";
import { SavedProvider } from "./store/SavedContext.jsx";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="section/:slug" element={<SectionPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="saved" element={<SavedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

// Lo stato globale (Context API) avvolge tutte le pagine.
export default function App({ api, storage }) {
  return (
    <NewsProvider api={api}>
      <SavedProvider storage={storage}>
        <AppRoutes />
      </SavedProvider>
    </NewsProvider>
  );
}
