import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import superjson from "superjson";
import App from "./App.jsx";
import { trpc } from "./lib/trpc";
import { COOKIE_NAME, UNAUTHED_ERR_MSG } from "@shared/const";
import { startLogin } from "./const";
import OfficialResourceHub from "./OfficialResourceHub.jsx";
import PersonalisedChecklistPrototype from "./PersonalisedChecklistPrototype.jsx";
import TaxYear2026Update from "./TaxYear2026Update.jsx";

document.title = "Tax Return Saathi | Pakistan FBR Tax Assistant";

const queryClient = new QueryClient();

function redirectToLoginIfUnauthorized(error) {
  if (!(error instanceof TRPCClientError) || error.message !== UNAUTHED_ERR_MSG) return;
  startLogin();
}

queryClient.getQueryCache().subscribe((event) => {
  if (event.type === "updated" && event.action.type === "error") redirectToLoginIfUnauthorized(event.query.state.error);
});

queryClient.getMutationCache().subscribe((event) => {
  if (event.type === "updated" && event.action.type === "error") redirectToLoginIfUnauthorized(event.mutation.state.error);
});

const trpcClient = trpc.createClient({
  links: [httpBatchLink({
    url: "/api/trpc",
    transformer: superjson,
    headers() {
      try {
        const raw = sessionStorage.getItem("manus-cookie");
        const prefix = `${COOKIE_NAME}=`;
        const token = raw?.split(";").find((entry) => entry.trim().startsWith(prefix))?.trim().slice(prefix.length);
        return token ? { Authorization: `Bearer ${token}` } : {};
      } catch {
        return {};
      }
    },
    fetch(input, init) {
      return globalThis.fetch(input, { ...(init || {}), credentials: "include" });
    },
  })],
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
        <PersonalisedChecklistPrototype />
        <TaxYear2026Update />
        <OfficialResourceHub />
      </QueryClientProvider>
    </trpc.Provider>
  </React.StrictMode>
);
