import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AppLocaleProvider } from "./context/AppLocaleContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppLocaleProvider>
      <App />
    </AppLocaleProvider>
  </React.StrictMode>,
);
