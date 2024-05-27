import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LoadingProvider } from "./components/feedbacks/context/loading-context";
import { NotificationsProvider } from "./components/feedbacks/context/notifications-context";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        <NotificationsProvider>
          <LoadingProvider>
            <App />
          </LoadingProvider>
        </NotificationsProvider>
      </HelmetProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
