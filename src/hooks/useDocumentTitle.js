import { useEffect } from "react";

const SITE_NAME = "The New York Times Clone";

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
  }, [title]);
}
