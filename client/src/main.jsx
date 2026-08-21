import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import TaxYear2026Update from "./TaxYear2026Update.jsx";

document.title = "Tax Return Saathi | Pakistan FBR Tax Assistant";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <TaxYear2026Update />
  </React.StrictMode>
);
