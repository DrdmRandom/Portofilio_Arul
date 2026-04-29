import React from "react";
import ReactDOM from "react-dom/client";
import { init } from "@plausible-analytics/tracker";
import App from "./App";
import "./styles.css";

init({
  domain: "fachrulyporto.cihuy-familly.my.id",
  endpoint: "https://analytics.cihuyproject.my.id/api/event",
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
