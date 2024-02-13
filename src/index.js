import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { LoadingProvider } from "./components/feedback/context/loading-context";
import { NotificationsProvider } from "./components/feedback/context/notifications-context";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <NotificationsProvider>
        <LoadingProvider>
          <App />
        </LoadingProvider>
      </NotificationsProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
