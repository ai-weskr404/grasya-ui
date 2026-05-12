import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "./index.css";
import { BlueprintProvider } from "./components/blueprint/BlueprintProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BlueprintProvider>
      <App />
    </BlueprintProvider>
  </React.StrictMode>,
);
