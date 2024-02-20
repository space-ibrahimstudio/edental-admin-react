import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../tools/handler";
import { useNotifications } from "../feedback/context/notifications-context";
import { LoadingScreen } from "../feedback/loading-screen";

export const PrivateRoute = ({ element }) => {
  const [authenticated, setAuthenticated] = useState(null);
  const { showNotifications } = useNotifications();

  useEffect(() => {
    const checkAuthentication = async () => {
      const result = await isAuthenticated(showNotifications);
      setAuthenticated(result);
    };

    checkAuthentication();
  }, []);

  if (authenticated === null) {
    return <LoadingScreen />;
  }

  return authenticated ? element : <Navigate to="/" />;
};
