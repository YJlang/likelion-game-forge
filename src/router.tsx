import { QueryClient } from "@tanstack/react-query";
import { createHashHistory, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

interface RouterOptions {
  basepath?: string;
  historyMode?: "browser" | "hash";
}

export const getRouter = ({ basepath, historyMode = "browser" }: RouterOptions = {}) => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    basepath,
    history: historyMode === "hash" ? createHashHistory() : undefined,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
