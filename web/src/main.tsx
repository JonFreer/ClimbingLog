import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";
import { QueryClient } from "@tanstack/react-query";
import { queryConfig } from "./lib/react-query.ts";

import {
  persistQueryClient,
  PersistQueryClientProvider,
} from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { APP_VERSION } from "./constants/version.ts";

const REACT_QUERY_CACHE_KEY = "react-query-cache-version";

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

const storedVersion = localStorage.getItem(REACT_QUERY_CACHE_KEY);
if (storedVersion !== APP_VERSION) {
  queryClient.clear(); // Clear React Query cache
  localStorage.setItem(REACT_QUERY_CACHE_KEY, APP_VERSION); // Update stored version
}

// 2. the persister
const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
});

persistQueryClient({
  queryClient,
  persister: localStoragePersister,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: localStoragePersister }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PersistQueryClientProvider>
  </StrictMode>
);
