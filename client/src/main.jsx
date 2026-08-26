import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import superjson from "superjson";
import App from "./App.jsx";
import { trpc } from "./lib/trpc";
import { COOKIE_NAME, UNAUTHED_ERR_MSG } from "@shared/const";
import { startLogin } from "./const";
import PrivacyConsentNotice from "./PrivacyConsentNotice.jsx";

const OfficialResourceHub = React.lazy(() => import("./OfficialResourceHub.jsx"));
const PersonalisedChecklistPrototype = React.lazy(() => import("./PersonalisedChecklistPrototype.jsx"));
const TaxYear2026Update = React.lazy(() => import("./TaxYear2026Update.jsx"));
const TaxpayerPreparationProfile = React.lazy(() => import("./TaxpayerPreparationProfile.jsx"));
const PublicPrivacyPolicy = React.lazy(() => import("./PublicPrivacyPolicy.jsx"));

document.title = "Tax Return Saathi | Pakistan FBR Tax Assistant";

const queryClient = new QueryClient();

function SupplementalMotionPreferences() {
  return <style>{`@media (prefers-reduced-motion: reduce) { .official-resource-hub *, .tax-year-update *, .filing-prototype *, .taxpayer-profile *, .official-resource-hub *::before, .tax-year-update *::before, .filing-prototype *::before, .taxpayer-profile *::before, .official-resource-hub *::after, .tax-year-update *::after, .filing-prototype *::after, .taxpayer-profile *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; } }`}</style>;
}

function SiteContent() {
  const [isPrivacyRoute, setIsPrivacyRoute] = React.useState(() => window.location.pathname === "/privacy");

  React.useEffect(() => {
    const updateRoute = () => setIsPrivacyRoute(window.location.pathname === "/privacy");
    window.addEventListener("popstate", updateRoute);
    return () => window.removeEventListener("popstate", updateRoute);
  }, []);

  React.useEffect(() => {
    document.title = isPrivacyRoute ? "Privacy Policy | Tax Return Saathi" : "Tax Return Saathi | Pakistan FBR Tax Assistant";
  }, [isPrivacyRoute]);

  if (isPrivacyRoute) {
    return <>
      <Suspense fallback={<span className="supplemental-panel-loading" role="status">Loading privacy policy…</span>}><PublicPrivacyPolicy /></Suspense>
      <PrivacyConsentNotice />
    </>;
  }

  return <>
    <App />
    <Suspense fallback={<span className="supplemental-panel-loading" role="status">Loading preparation tools…</span>}>
      <PersonalisedChecklistPrototype />
      <TaxYear2026Update />
      <OfficialResourceHub />
      <TaxpayerPreparationProfile />
    </Suspense>
    <PrivacyConsentNotice />
  </>;
}

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
        <SupplementalMotionPreferences />
        <SiteContent />
      </QueryClientProvider>
    </trpc.Provider>
  </React.StrictMode>
);
