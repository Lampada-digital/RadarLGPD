import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./styles/branding.css";
import App from "./App.tsx";
import { BrandingProvider } from "./lib/branding";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrandingProvider>
    <App />
  </BrandingProvider>
);
