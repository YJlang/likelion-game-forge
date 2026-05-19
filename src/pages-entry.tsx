import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";

import "./styles.css";
import { getRouter } from "./router";

const useHashHistory = import.meta.env.VITE_ROUTER_HISTORY === "hash";
const basepath = useHashHistory
  ? undefined
  : import.meta.env.BASE_URL.replace(/\/$/, "") || undefined;
const router = getRouter({
  basepath,
  historyMode: useHashHistory ? "hash" : "browser",
});
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
