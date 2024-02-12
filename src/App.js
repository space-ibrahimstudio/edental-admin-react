import React from "react";
import { Route, Routes } from "react-router-dom";
import { NotificationsProvider } from "./components/feedback/context/notifications-context";
import { LoadingProvider } from "./components/feedback/context/loading-context";
import { PrivateRoute } from "./components/routing/private-route";
import HomeReplace from "./pages/home-replace";
import Dashboard from "./pages/dashboard/dashboard";
import { LoadingScreen } from "./components/feedback/loading-screen";

function App() {
  return (
    <NotificationsProvider>
      <LoadingProvider>
        <Routes>
          <Route path="/" element={<HomeReplace />} />
          <Route
            path="/dashboard/"
            element={<PrivateRoute element={<Dashboard />} />}
          />
          <Route
            path="/dashboard/:tab"
            element={<PrivateRoute element={<Dashboard />} />}
          />
          <Route path="/loading" element={<LoadingScreen />} />
        </Routes>
      </LoadingProvider>
    </NotificationsProvider>
  );
}

export default App;
